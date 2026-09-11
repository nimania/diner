export function numeric(value:unknown, min=0,max=1e9):number{
 const raw=String(value).replace(/[۰-۹]/g,c=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(c))).replace(/[٠-٩]/g,c=>String("٠١٢٣٤٥٦٧٨٩".indexOf(c))).replace(/٬/g,"").replace(/٫/g,".");
 if(!raw.trim())throw Error("عدد لازم است");
 const n=Number(raw);if(!Number.isFinite(n)||n<min||n>max)throw Error("عدد خارج از محدوده");return n;
}
export function money(v:unknown){const n=numeric(v);const rial=n*10;if(Math.abs(rial-Math.round(rial))>1e-6)throw Error("دقت مبلغ بیش از یک ریال است");return Math.round(rial);}
export function label(v:unknown){if(typeof v!=="string"||!v.trim()||v.length>200)throw Error("متن معتبر لازم است");return v.trim();}
export function recipeCost(lines:{price:number;quantity:number;yield:number;packQuantity:number}[], servings:number,sale:number,pack:number){
 const sum=lines.reduce((s,l)=>s+l.price/l.packQuantity*l.quantity*100/l.yield,0);
 const food=Math.round(sum/servings);if(!Number.isSafeInteger(food)||food>1e13)throw Error("هزینه خارج از محدوده");
 return {food,sale,pack,remaining:sale-food-pack,margin:sale?((sale-food-pack)/sale):null};
}
