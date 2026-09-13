import {label,money} from './cost';
import {expiryDate} from './stock';
export const expenseCategories=[{id:'rent',name:'اجاره',icon:'🏠'},{id:'salary',name:'حقوق و دستمزد',icon:'👥'},{id:'electricity',name:'برق',icon:'💡'},{id:'gas',name:'گاز',icon:'🔥'},{id:'water',name:'آب',icon:'💧'},{id:'phone',name:'تلفن و اینترنت',icon:'☎️'},{id:'advertising',name:'تبلیغات',icon:'📣'},{id:'courier',name:'پیک ماهانه',icon:'🛵'},{id:'repair',name:'تعمیر و نگهداری',icon:'🔧'},{id:'other',name:'سایر هزینه‌های جاری',icon:'🧾'}];
export function requiredDate(value:unknown){const d=expiryDate(value);if(!d||d<'2023-01-01'||d>'2100-12-31')throw Error('تاریخ معتبر بین سال ۲۰۲۳ و ۲۱۰۰ انتخاب کن.');return d;}
export const dayNumber=(d:string)=>Math.floor(Date.parse(d+'T00:00:00Z')/86400000);
export function period(from:unknown,to:unknown){const start=requiredDate(from),end=requiredDate(to),days=dayNumber(end)-dayNumber(start)+1;if(days<1||days>366)throw Error('دوره باید از ۱ تا ۳۶۶ روز و پایان پس از شروع باشد.');return {from:start,to:end,days};}
export function expenseData(p:any){const dates=period(p.from,p.to);if(!expenseCategories.some(c=>c.id===p.category))throw Error('دسته هزینه را انتخاب کن.');const total=money(p.total);if(!total)throw Error('مبلغ باید بیشتر از صفر باشد.');const paidOn=p.paidOn?requiredDate(p.paidOn):null;return {title:label(p.title),category:p.category,total,...dates,paidOn,source:label(p.source),date:new Date().toISOString(),voided:false};}
/** Cumulative integer allocation ensures adjacent reports add back to the original rial total. */
export function allocateExpense(expense:any,from:string,to:string){if(expense.voided)return 0;const n=dayNumber(expense.to)-dayNumber(expense.from)+1,start=Math.max(0,dayNumber(from)-dayNumber(expense.from)),end=Math.min(n,dayNumber(to)-dayNumber(expense.from)+1);if(end<=start)return 0;const total=BigInt(expense.total);return Number(total*BigInt(end)/BigInt(n)-total*BigInt(start)/BigInt(n));}
export async function reportPeriod(db:D1Database,restaurantId:string,from:unknown,to:unknown){
 const dates=period(from,to);
 const sales=await db.prepare("SELECT data FROM records WHERE restaurant_id=? AND kind='sale' AND json_extract(data,'$.day')>=? AND json_extract(data,'$.day')<=?").bind(restaurantId,dates.from,dates.to).all<{data:string}>();
 const expenses=await db.prepare("SELECT id,data,created FROM records WHERE restaurant_id=? AND kind='expense' AND ((json_extract(data,'$.from')<=? AND json_extract(data,'$.to')>=?) OR (json_extract(data,'$.paidOn')>=? AND json_extract(data,'$.paidOn')<=?)) ORDER BY created DESC").bind(restaurantId,dates.to,dates.from,dates.from,dates.to).all<{id:string;data:string;created:string}>();
 const start=dates.from+'T00:00:00+03:30',end=dates.to+'T23:59:59.999+03:30';const lower=new Date(start).toISOString(),upper=new Date(end).toISOString();
 const waste=await db.prepare("SELECT COALESCE(SUM(cost),0) AS total FROM stock_moves WHERE restaurant_id=? AND created>=? AND created<=?").bind(restaurantId,lower,upper).first<{total:number}>();
 const manualWaste=await db.prepare("SELECT COALESCE(SUM(json_extract(data,'$.cost')),0) AS total FROM records WHERE restaurant_id=? AND kind='waste' AND created>=? AND created<=?").bind(restaurantId,lower,upper).first<{total:number}>();
 const totals={gross:0,discount:0,food:0,pack:0,commission:0,delivery:0,deliveryReceived:0,contribution:0,count:0};let saleEntries=0;
 for(const row of sales.results){const s=JSON.parse(row.data);if(s.voided)continue;saleEntries++;for(const k of Object.keys(totals) as (keyof typeof totals)[])totals[k]+=s[k]||0;}
 const items=expenses.results.map(r=>{const data=JSON.parse(r.data);return {id:r.id,data,created:r.created,allocated:allocateExpense(data,dates.from,dates.to)}});
 const overhead=items.reduce((s,e)=>s+e.allocated,0),wasteCost=(waste?.total||0)+(manualWaste?.total||0),paidExpenses=items.reduce((s,e)=>s+(!e.data.voided&&e.data.paidOn>=dates.from&&e.data.paidOn<=dates.to?e.data.total:0),0);
 return {...dates,totals,saleEntries,waste:wasteCost,overhead,operatingBalance:totals.contribution-wasteCost-overhead,paidExpenses,items,categories:expenseCategories.map(c=>({...c,total:items.filter(e=>e.data.category===c.id).reduce((s,e)=>s+e.allocated,0)}))};
}
export async function changeExpense(db:D1Database,restaurantId:string,id:string,p:any){
 const expenseId=label(p.expenseId),row=await db.prepare("SELECT data FROM records WHERE id=? AND restaurant_id=? AND kind='expense'").bind(expenseId,restaurantId).first<{data:string}>();if(!row)throw Error('هزینه پیدا نشد.');
 const data=JSON.parse(row.data),date=new Date().toISOString();
 if(p.kind==='pay_expense'){
  if(data.voided)throw Error('هزینه باطل‌شده قابل پرداخت نیست.');if(data.paidOn)return;
  const paidOn=requiredDate(p.paidOn),audit={expenseId,paidOn,total:data.total,date};
  await db.batch([db.prepare("INSERT INTO records(id,restaurant_id,kind,data,created) SELECT ?,?,'expense_payment',?,? WHERE EXISTS(SELECT 1 FROM records WHERE id=? AND restaurant_id=? AND kind='expense' AND COALESCE(json_extract(data,'$.voided'),0)=0 AND json_extract(data,'$.paidOn') IS NULL) ON CONFLICT(id) DO NOTHING").bind(id,restaurantId,JSON.stringify(audit),date,expenseId,restaurantId),db.prepare("UPDATE records SET data=json_set(data,'$.paidOn',?) WHERE id=? AND restaurant_id=? AND kind='expense' AND EXISTS(SELECT 1 FROM records WHERE id=? AND restaurant_id=? AND kind='expense_payment' AND json_extract(data,'$.expenseId')=?)").bind(paidOn,expenseId,restaurantId,id,restaurantId,expenseId)]);
 }else{
  if(data.voided)return;const reason=label(p.reason),audit={expenseId,reason,date};
  await db.batch([db.prepare("INSERT INTO records(id,restaurant_id,kind,data,created) SELECT ?,?,'expense_void',?,? WHERE EXISTS(SELECT 1 FROM records WHERE id=? AND restaurant_id=? AND kind='expense' AND COALESCE(json_extract(data,'$.voided'),0)=0) ON CONFLICT(id) DO NOTHING").bind(id,restaurantId,JSON.stringify(audit),date,expenseId,restaurantId),db.prepare("UPDATE records SET data=json_set(data,'$.voided',json('true'),'$.voidReason',?,'$.voidedAt',?) WHERE id=? AND restaurant_id=? AND kind='expense' AND EXISTS(SELECT 1 FROM records WHERE id=? AND restaurant_id=? AND kind='expense_void' AND json_extract(data,'$.expenseId')=?)").bind(reason,date,expenseId,restaurantId,id,restaurantId,expenseId)]);
 }
 const result=await db.prepare("SELECT data FROM records WHERE id=? AND restaurant_id=? AND kind='expense'").bind(expenseId,restaurantId).first<{data:string}>();const saved=result&&JSON.parse(result.data);if(!saved||(p.kind==='pay_expense'?!saved.paidOn:!saved.voided))throw Error('تغییر ثبت نشد؛ دوباره تلاش کن.');
}
