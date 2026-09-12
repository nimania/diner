import {label,money,numeric} from './cost';
import {normalize} from './library';
export const day=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export const identity=(x:any)=>`${x.catalogId||normalize(x.name)}:${x.unit}`;
export function makeBlend(name:string,parts:any[],catalogId:string){
 if(parts.length<2||parts.length>8)throw Error('حداقل دو و حداکثر هشت جزء انتخاب کن.');
 if(new Set(parts.map(p=>identity(p))).size!==parts.length)throw Error('هر نوع گوشت فقط یک بار انتخاب شود.');
 const components=parts.map(p=>{if(p.unit!=='g'||p.components)throw Error('اجزای مخلوط باید مواد ساده با واحد گرم باشند.');return {...p,percent:numeric(p.percent,0.01,100)}});
 if(Math.abs(components.reduce((s,p)=>s+p.percent,0)-100)>0.00001)throw Error('جمع درصدها باید دقیقاً ۱۰۰ باشد.');
 return {name:label(name),unit:'g',catalogId,packQuantity:1000,price:Math.round(components.reduce((s,p)=>s+p.price/p.packQuantity*p.percent*10,0)),source:'محاسبه از قیمت اجزای مخلوط',components,date:new Date().toISOString()};
}
export function planConsumption(recipe:any,count:number,lots:any[]){
 const needs=new Map<string,any>();
 for(const line of recipe.lines){const qty=line.quantity*100/line.yield/recipe.servings*count;for(const part of line.components||[{...line,percent:100}]){const key=identity(part);const n=needs.get(key)||{...part,quantity:0};n.quantity+=qty*part.percent/100;needs.set(key,n)}}
 const allocations:any[]=[];const missing:string[]=[];
 for(const [key,n] of needs){let remaining=Math.ceil(n.quantity*1000-1e-7);for(const lot of lots.filter(l=>identity(l.material)===key&&l.remaining>0&&(!l.expires||l.expires>=day()))){const q=Math.min(remaining,lot.remaining);if(q){allocations.push({lotId:lot.id,name:lot.name,unit:lot.unit,quantity:q,cost:Math.round(lot.total_cost*q/lot.initial),unknownExpiry:!lot.expires});remaining-=q}if(!remaining)break}if(remaining)missing.push(n.name+' ('+(remaining/1000)+' '+n.unit+')')}
 if(missing.length)throw Error('کسری موجودی قابل تخصیص: '+missing.join('، '));
 if(allocations.length>25)throw Error('تعداد نوبت‌های خرید زیاد است؛ فروش را در چند ثبت کوچک‌تر وارد کن.');
 return allocations;
}
export async function saveSale(db:D1Database,restaurantId:string,id:string,p:any){
 if(await db.prepare("SELECT id FROM records WHERE id=? AND restaurant_id=? AND kind='sale'").bind(id,restaurantId).first())return;
 const rec=await db.prepare("SELECT data FROM records WHERE id=? AND restaurant_id=? AND kind='recipe'").bind(label(p.recipeId),restaurantId).first<{data:string}>();if(!rec)throw Error('غذا پیدا نشد.');
 const recipe=JSON.parse(rec.data),count=numeric(p.count,1,10000);if(!Number.isInteger(count))throw Error('تعداد باید صحیح باشد.');
 const channel=label(p.channel);if(!['حضوری','بیرون‌بر','اسنپ'].includes(channel))throw Error('کانال فروش نامعتبر است.');
 const lots=(await db.prepare("SELECT l.*,r.data FROM stock_lots l JOIN records r ON r.id=l.ingredient_id AND r.restaurant_id=l.restaurant_id WHERE l.restaurant_id=? ORDER BY l.expires IS NULL,l.expires,l.created,l.id").bind(restaurantId).all<any>()).results.map(l=>({...l,material:JSON.parse(l.data)}));
 recipe.lines=recipe.lines.map((l:any,i:number)=>({...l,quantity:p["usage"+i]===undefined?l.quantity:numeric(p["usage"+i],0.001,1e6)}));
 const allocations=planConsumption(recipe,count,lots);
 const gross=money(p.unitPrice)*count,discount=money(p.discount),commission=money(p.commission),delivery=money(p.delivery),deliveryReceived=money(p.deliveryReceived),pack=money(p.pack);
 if(discount>gross)throw Error('تخفیف از فروش بیشتر است.');
 const food=allocations.reduce((s,a)=>s+a.cost,0),date=new Date().toISOString();
 const data={name:recipe.name,recipeId:p.recipeId,count,channel,gross,discount,commission,delivery,deliveryReceived,pack,food,contribution:gross-discount+deliveryReceived-food-pack-commission-delivery,allocations,recipeSnapshot:recipe,applied:false,date,day:day()};
 const checks=allocations.map(()=>"EXISTS(SELECT 1 FROM stock_lots WHERE id=? AND restaurant_id=? AND remaining>=?)").join(' AND ')||'1';
 const bindings=allocations.flatMap(a=>[a.lotId,restaurantId,a.quantity]);
 const statements=[db.prepare(`INSERT INTO records(id,restaurant_id,kind,data,created) SELECT ?,?,'sale',?,? WHERE ${checks} ON CONFLICT(id) DO NOTHING`).bind(id,restaurantId,JSON.stringify(data),date,...bindings)];
 for(const a of allocations)statements.push(db.prepare("UPDATE stock_lots SET remaining=remaining-? WHERE id=? AND restaurant_id=? AND EXISTS(SELECT 1 FROM records WHERE id=? AND restaurant_id=? AND kind='sale' AND json_extract(data,'$.applied')=0)").bind(a.quantity,a.lotId,restaurantId,id,restaurantId));
 statements.push(db.prepare("UPDATE records SET data=json_set(data,'$.applied',json('true')) WHERE id=? AND restaurant_id=? AND kind='sale'").bind(id,restaurantId));
 await db.batch(statements);
 if(!await db.prepare("SELECT id FROM records WHERE id=? AND restaurant_id=? AND kind='sale'").bind(id,restaurantId).first())throw Error('موجودی هم‌زمان تغییر کرد؛ دوباره تلاش کن.');
}

/** Reverse an erroneous entry only; this is not a physical food return or payment refund. */
export async function voidSale(db:D1Database,restaurantId:string,id:string,p:any){
 const saleId=label(p.saleId),reason=label(p.reason);
 if(p.notPrepared!=='yes')throw Error('تأیید کن غذا تولید نشده و این فقط اصلاح ثبت اشتباه است.');
 const record=await db.prepare("SELECT data FROM records WHERE id=? AND restaurant_id=? AND kind='sale'").bind(saleId,restaurantId).first<{data:string}>();
 if(!record)throw Error('فروش پیدا نشد.');
 const sale=JSON.parse(record.data);if(sale.voided)return;
 if(!sale.applied||!Array.isArray(sale.allocations)||sale.allocations.length>25)throw Error('این فروش برای ابطال خودکار قابل بررسی نیست.');
 const date=new Date().toISOString(),audit={saleId,reason,date,day:day(),applied:false};
 const checks=sale.allocations.map(()=>"EXISTS(SELECT 1 FROM stock_lots WHERE id=? AND restaurant_id=?)").join(' AND ')||'1';
 const statements=[db.prepare(`INSERT INTO records(id,restaurant_id,kind,data,created) SELECT ?,?,'sale_void',?,? WHERE EXISTS(SELECT 1 FROM records WHERE id=? AND restaurant_id=? AND kind='sale' AND json_extract(data,'$.applied')=1 AND COALESCE(json_extract(data,'$.voided'),0)=0) AND ${checks} ON CONFLICT(id) DO NOTHING`).bind(id,restaurantId,JSON.stringify(audit),date,saleId,restaurantId,...sale.allocations.flatMap((a:any)=>[a.lotId,restaurantId]))];
 const gate="EXISTS(SELECT 1 FROM records WHERE id=? AND restaurant_id=? AND kind='sale_void' AND json_extract(data,'$.saleId')=? AND json_extract(data,'$.applied')=0)";
 for(const a of sale.allocations){if(!Number.isSafeInteger(a.quantity)||a.quantity<=0)throw Error('مقدار تخصیص نامعتبر است.');statements.push(db.prepare(`UPDATE stock_lots SET remaining=remaining+? WHERE id=? AND restaurant_id=? AND ${gate}`).bind(a.quantity,a.lotId,restaurantId,id,restaurantId,saleId))}
 statements.push(db.prepare(`UPDATE records SET data=json_set(data,'$.voided',json('true'),'$.voidReason',?,'$.voidedAt',?,'$.voidEventId',?) WHERE id=? AND restaurant_id=? AND kind='sale' AND ${gate}`).bind(reason,date,id,saleId,restaurantId,id,restaurantId,saleId));
 statements.push(db.prepare("UPDATE records SET data=json_set(data,'$.applied',json('true')) WHERE id=? AND restaurant_id=? AND kind='sale_void' AND json_extract(data,'$.saleId')=?").bind(id,restaurantId,saleId));
 await db.batch(statements);
 const saved=await db.prepare("SELECT data FROM records WHERE id=? AND restaurant_id=? AND kind='sale'").bind(saleId,restaurantId).first<{data:string}>();
 if(!saved||!JSON.parse(saved.data).voided)throw Error('ابطال انجام نشد؛ دوباره بررسی کن.');
}
