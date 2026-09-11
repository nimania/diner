let state={ingredients:[],recipes:[],token:""};
const $=s=>document.querySelector(s), fmt=n=>new Intl.NumberFormat("fa-IR",{maximumFractionDigits:1}).format(n);
const units={g:"گرم",ml:"میلی‌لیتر",piece:"عدد"};
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
function notice(message,error=false){$("#notice").textContent=message;$("#notice").className="notice"+(error?" error":"")}
async function load(){const response=await fetch("/api/state");if(!response.ok)throw Error("دریافت اطلاعات ناموفق بود");state=await response.json();render()}
function render(){
 $("#ingredient-count").textContent=fmt(state.ingredients.length);$("#recipe-count").textContent=fmt(state.recipes.length);
 const list=$("#ingredients");list.replaceChildren();
 if(!state.ingredients.length)list.append(el("p","اولین ماده اولیه را ثبت کن؛ سپس رسپی بساز.","empty"));
 state.ingredients.forEach(i=>{const row=el("div",undefined,"ingredient");row.append(el("strong",i.name),el("div",fmt(i.price/10)+" تومان / "+units[i.unit],"meta"),el("div","منبع: "+i.source+" • "+new Date(i.recorded_at).toLocaleDateString("fa-IR"),"meta"));list.append(row)});
 document.querySelectorAll(".ingredient-select").forEach(select=>{const value=select.value;select.replaceChildren();state.ingredients.forEach(i=>{const option=el("option",i.name+" · "+units[i.unit]);option.value=i.id;select.append(option)});if([...select.options].some(o=>o.value===value))select.value=value});
 $("#save-recipe").disabled=!state.ingredients.length;$("#add-line").disabled=!state.ingredients.length;
 const recipes=$("#recipes");recipes.replaceChildren();
 if(!state.recipes.length)recipes.append(el("p","هنوز رسپی ذخیره نشده است. با یک محصول پرفروش شروع کن.","empty"));
 state.recipes.forEach(r=>{const s=r.snapshot, card=el("article",undefined,"recipe-card");card.append(el("h2",r.name),el("div","ثبت: "+new Date(r.created_at).toLocaleString("fa-IR")+" • "+fmt(s.servings)+" پرس خروجی","meta"));
 const metrics=el("div",undefined,"metrics");
 [["مواد / پرس",fmt(s.food_rial/10)+" تومان"],["بسته‌بندی / پرس",fmt(s.packaging_rial/10)+" تومان"],["باقی‌مانده / پرس",fmt(s.remaining_rial/10)+" تومان"],["حاشیه پس از مواد و بسته‌بندی",s.margin===null?"تعریف‌نشده":fmt(s.margin*100)+"٪"]].forEach(([label,value])=>{const cell=el("div");cell.append(el("small",label),el("b",value,s.remaining_rial<0?"negative":""));metrics.append(cell)});card.append(metrics);
 const details=el("details");details.append(el("summary","مواد و منابع این نسخه"));
 s.lines.forEach(l=>details.append(el("p",l.name+" — "+fmt(l.quantity)+" "+units[l.unit]+"، بازده "+fmt(l.yield_percent)+"٪ — منبع: "+l.source,"meta")));card.append(details);recipes.append(card)})
}
function addLine(){const line=el("div",undefined,"line");const top=el("div",undefined,"line-top"),label=el("label","ماده اولیه"),select=el("select");select.className="ingredient-select";select.required=true;label.append(select);
 const remove=el("button","حذف","remove");remove.type="button";remove.onclick=()=>line.remove();top.append(label,remove);line.append(top);
 const pair=el("div",undefined,"pair");[["quantity","مقدار قابل‌مصرف در کل دستور",""],["yield","بازده آماده‌سازی (%)","100"]].forEach(([cls,title,value])=>{const l=el("label",title),input=el("input");input.className=cls;input.required=true;input.inputMode="decimal";input.value=value;l.append(input);pair.append(l)});line.append(pair);$("#lines").append(line);render()}
async function save(path,data,form){const button=form.querySelector('button:not([type="button"])');if(button)button.disabled=true;try{const response=await fetch(path,{method:"POST",headers:{"Content-Type":"application/json","X-Diner-Token":state.token},body:JSON.stringify(data)});const result=await response.json();if(!response.ok)throw Error(result.error||"ذخیره انجام نشد");await load();notice("ثبت شد. اطلاعات روی همین رایانه ذخیره شده است.");return true}catch(error){notice(error.message,true);return false}finally{if(button)button.disabled=false}}
$("#ingredient-form").onsubmit=async e=>{e.preventDefault();if(await save("/api/ingredients",Object.fromEntries(new FormData(e.target)),e.target))e.target.reset()};
$("#recipe-form").onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));data.lines=[...document.querySelectorAll(".line")].map(l=>({ingredient_id:l.querySelector("select").value,quantity:l.querySelector(".quantity").value,yield_percent:l.querySelector(".yield").value}));if(await save("/api/recipes",data,e.target))$("#recipes").scrollIntoView({behavior:"smooth"})};
$("#add-line").onclick=addLine;
load().then(addLine).catch(e=>notice(e.message,true));

if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 try{Promise.resolve(document.modelContext.registerTool({
 name:"read_diner_catalog",title:"مشاهده مواد و رسپی‌ها",
 description:"Read the current local ingredient catalog and saved recipe snapshots. Does not modify records.",
 inputSchema:{type:"object",properties:{},additionalProperties:false},
 annotations:{readOnlyHint:true,untrustedContentHint:true},
 async execute(input){if(!input||typeof input!=="object"||Object.keys(input).length)throw Error("No arguments expected");await load();return {ingredients:state.ingredients,recipes:state.recipes}}
 },{signal:lifecycle.signal})).catch(()=>{});
 }catch(e){}
 window.addEventListener("pagehide",()=>lifecycle.abort(),{once:true});
}
