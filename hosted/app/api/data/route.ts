import {env} from "cloudflare:workers";
import {getChatGPTUser} from "@/app/chatgpt-auth";
import {quantityUnits,expiryDate} from "@/lib/stock";
import {materials} from "@/lib/library";
import {label,money,numeric,recipeCost} from "@/lib/cost";
export const dynamic="force-dynamic";
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
async function context(){
 const user=await getChatGPTUser();if(!user)return null;
 const db=env.DB;if(!db)throw Error("storage");
 const restaurant=await db.prepare("SELECT * FROM restaurants WHERE owner=?").bind(user.userId).first<{id:string;name:string;city:string}>();
 return {user,db,restaurant};
}
export async function GET(){
 try{const c=await context();if(!c)return json({error:"ابتدا وارد حساب شوید."},401);
 if(!c.restaurant)return json({restaurant:null,records:[]});
 const rows=await c.db.prepare("SELECT id,kind,data,created FROM records WHERE restaurant_id=? ORDER BY created DESC LIMIT 1000").bind(c.restaurant.id).all<{id:string;kind:string;data:string;created:string}>();
 const lots=await c.db.prepare("SELECT * FROM stock_lots WHERE restaurant_id=? ORDER BY expires IS NULL,expires,created DESC").bind(c.restaurant.id).all();
 const moves=await c.db.prepare("SELECT m.*,l.name,l.unit FROM stock_moves m JOIN stock_lots l ON m.lot_id=l.id WHERE m.restaurant_id=? ORDER BY m.created DESC LIMIT 1000").bind(c.restaurant.id).all();
 return json({lots:lots.results,moves:moves.results,restaurant:c.restaurant,records:rows.results.map(r=>({...r,data:JSON.parse(r.data)}))});
 }catch{return json({error:"دریافت اطلاعات ممکن نشد؛ دوباره تلاش کنید."},503);}
}
export async function POST(req:Request){
 const origin=req.headers.get("origin");if(!origin||origin!==new URL(req.url).origin)return json({error:"درخواست نامعتبر"},403);
 try{
 const c=await context();if(!c)return json({error:"ابتدا وارد حساب شوید."},401);
 const raw=await req.text();if(raw.length>50000)return json({error:"حجم درخواست زیاد است"},413);
 let p:any;try{p=JSON.parse(raw)}catch{return json({error:"داده معتبر نیست"},400)}
 const id=label(p.id);if(!/^[a-f0-9-]{36}$/.test(id))throw Error("id");
 const date=new Date().toISOString();
 if(p.kind==="restaurant"){
  if(c.restaurant)return json({ok:true});
  await c.db.prepare("INSERT INTO restaurants(id,owner,name,city,created) VALUES(?,?,?,?,?) ON CONFLICT(owner) DO NOTHING").bind(id,c.user.userId,label(p.name),label(p.city),date).run();
  return json({ok:true},201);
 }
 if(!c.restaurant)return json({error:"ابتدا مجموعه را ثبت کنید."},400);

 if(p.kind==="purchase"){
  const old=await c.db.prepare("SELECT id FROM stock_lots WHERE id=? AND restaurant_id=?").bind(id,c.restaurant.id).first();if(old)return json({ok:true});
  const material=await c.db.prepare("SELECT data FROM records WHERE id=? AND restaurant_id=? AND kind='ingredient'").bind(label(p.ingredientId),c.restaurant.id).first<{data:string}>();
  if(!material)return json({error:"ماده را از فهرست مجموعه خودت انتخاب کن."},400);
  const item=JSON.parse(material.data),pack=numeric(p.packQuantity,0.001,1e7),count=numeric(p.count,1,100000);if(!Number.isInteger(count))throw Error('count');
  const amount=quantityUnits(pack*count),total=money(p.total),expires=expiryDate(p.expires),supplier=label(p.supplier),place=label(p.location);
  const snapshot={...item,packQuantity:pack*count,purchasePackQuantity:pack,price:total,source:'خرید: '+supplier,date};
  await c.db.batch([
   c.db.prepare("INSERT INTO stock_lots(id,restaurant_id,ingredient_id,name,unit,initial,remaining,total_cost,supplier,expires,location,created) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING").bind(id,c.restaurant.id,p.ingredientId,item.name,item.unit,amount,amount,total,supplier,expires,place,date),
   c.db.prepare("INSERT INTO records(id,restaurant_id,kind,data,created) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING").bind(id,c.restaurant.id,'ingredient',JSON.stringify(snapshot),date)
  ]);return json({ok:true},201);
 }
 if(p.kind==="stock_waste"){
  const old=await c.db.prepare("SELECT id FROM stock_moves WHERE id=? AND restaurant_id=?").bind(id,c.restaurant.id).first();if(old)return json({ok:true});
  const lot=await c.db.prepare("SELECT * FROM stock_lots WHERE id=? AND restaurant_id=?").bind(label(p.lotId),c.restaurant.id).first<any>();if(!lot)return json({error:"این نوبت خرید پیدا نشد."},400);
  const amount=quantityUnits(p.quantity);if(amount>lot.remaining)return json({error:"مقدار دورریز از موجودی این خرید بیشتر است."},400);
  const cost=Math.round(lot.total_cost*amount/lot.initial);
  await c.db.batch([
   c.db.prepare("INSERT INTO stock_moves(id,restaurant_id,lot_id,quantity,cost,reason,created) SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM stock_lots WHERE id=? AND restaurant_id=? AND remaining>=?) ON CONFLICT(id) DO NOTHING").bind(id,c.restaurant.id,lot.id,amount,cost,label(p.reason),date,lot.id,c.restaurant.id,amount),
   c.db.prepare("UPDATE stock_lots SET remaining=remaining-(SELECT quantity FROM stock_moves WHERE id=?) WHERE id=? AND restaurant_id=? AND EXISTS(SELECT 1 FROM stock_moves WHERE id=? AND restaurant_id=? AND lot_id=stock_lots.id AND applied=0)").bind(id,lot.id,c.restaurant.id,id,c.restaurant.id),
   c.db.prepare("UPDATE stock_moves SET applied=1 WHERE id=? AND restaurant_id=? AND applied=0").bind(id,c.restaurant.id)
  ]);
  const saved=await c.db.prepare("SELECT id FROM stock_moves WHERE id=? AND restaurant_id=?").bind(id,c.restaurant.id).first();
  return saved?json({ok:true},201):json({error:"موجودی تغییر کرده؛ مقدار را دوباره بررسی کن."},400);
 }
 let data:any;
 if(p.kind==="ingredient"){
  if(!["g","ml","piece"].includes(p.unit))throw Error("unit");
  const catalogId=materials.some(m=>m.id===p.catalogId)?p.catalogId:null;
  data={catalogId,name:label(p.name),unit:p.unit,price:money(p.price),packQuantity:numeric(p.packQuantity,0.001,1e7),source:label(p.source),date};
 }else if(p.kind==="recipe"){
  if(!Array.isArray(p.lines)||!p.lines.length||p.lines.length>60)throw Error("lines");
  const lines=[];
  for(const l of p.lines){
   const row=await c.db.prepare("SELECT data FROM records WHERE id=? AND restaurant_id=? AND kind='ingredient'").bind(label(l.id),c.restaurant.id).first<{data:string}>();
   if(!row)return json({error:"ماده اولیه در مجموعه شما پیدا نشد."},400);
   const item=JSON.parse(row.data);
   lines.push({...item,id:l.id,quantity:numeric(l.quantity,0.001,1e6),yield:numeric(l.yield,0.01,100)});
  }
  const servings=numeric(p.servings,0.001,10000);
  data={name:label(p.name),servings,lines,...recipeCost(lines,servings,money(p.sale),money(p.pack)),date};
 }else if(p.kind==="waste"){
  data={name:label(p.name),quantity:label(p.quantity),cost:money(p.cost),reason:label(p.reason),date};
 }else return json({error:"عملیات پشتیبانی نمی‌شود"},400);
 await c.db.prepare("INSERT INTO records(id,restaurant_id,kind,data,created) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING").bind(id,c.restaurant.id,p.kind,JSON.stringify(data),date).run();
 return json({ok:true},201);
 }catch(error){console.error("Diner mutation failed",error instanceof Error?error.name:"error");return json({error:"ذخیره انجام نشد؛ ورودی‌ها را بررسی کنید یا دوباره تلاش کنید."},400);}
}
