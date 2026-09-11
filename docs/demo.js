const $=s=>document.querySelector(s), fa=n=>new Intl.NumberFormat("fa-IR",{maximumFractionDigits:1}).format(n), money=n=>fa(n)+" تومان";
const restaurants=[
{name:"داینر ساحل",city:"نوشهر",plan:"حرفه‌ای",status:"فعال",users:3,complete:78},
{name:"کافه باران",city:"چالوس",plan:"آزمایشی",status:"فعال",users:2,complete:45},
{name:"برگر ایستگاه",city:"رشت",plan:"پایه",status:"نیازمند پیگیری",users:2,complete:62},
{name:"کافه آبان",city:"ساری",plan:"حرفه‌ای",status:"فعال",users:4,complete:91}];
const menu=[{name:"چیزهات‌داگ",sale:180000,food:68000,pack:9000,count:24},{name:"هات‌داگ کلاسیک",sale:150000,food:53000,pack:8000,count:32},{name:"سیب‌زمینی ویژه",sale:120000,food:39000,pack:7000,count:18},{name:"لیموناد",sale:80000,food:22000,pack:6000,count:26}];
let waste=[{name:"نان برگر",quantity:"۶ عدد",cost:48000,reason:"خشک‌شدن"},{name:"شیر",quantity:"۱ لیتر",cost:65000,reason:"پایان مهلت مصرف"}];
let role=location.hash.startsWith("#admin")?"admin":"restaurant",view="overview";
const views={restaurant:[["overview","نمای امروز"],["menu","منو و هزینه"],["stock","ماندگاری و ضایعات"],["roadmap","سایر بخش‌ها"]],admin:[["overview","نمای کل سیستم"],["tenants","رستوران‌ها"],["sources","منابع و کیفیت داده"],["access","نقش‌ها و دسترسی‌ها"]]};
function e(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
function append(parent,...children){children.forEach(c=>parent.append(c));return parent}
function panel(title){const p=e("section",undefined,"panel");p.append(e("h2",title));return p}
function note(text){return e("div",text,"note")}
function badge(text,type=""){return e("span",text,"badge "+type)}
function button(text,fn,soft=false){const b=e("button",text,"action"+(soft?" soft":""));b.type="button";b.onclick=fn;return b}
function stat(title,value,foot,accent=false){const p=e("article",undefined,"stat"+(accent?" accent":""));return append(p,e("small",title),e("strong",value),e("div",foot,"foot"))}
function stats(items){const wrap=e("section",undefined,"stats");items.forEach(a=>wrap.append(stat(...a)));return wrap}
function table(headers,rows){const w=e("div",undefined,"table-wrap"),t=e("table"),head=e("thead"),tr=e("tr");headers.forEach(h=>tr.append(e("th",h)));head.append(tr);const body=e("tbody");rows.forEach(row=>{const r=e("tr");row.forEach(v=>{const c=e("td");typeof v==="string"?c.textContent=v:c.append(v);r.append(c)});body.append(r)});append(t,head,body);w.append(t);return w}
function go(next){view=next;render()}
function notify(text){$("#status").className="status";$("#status").textContent=text}
function bars(entries){const wrap=e("div",undefined,"bars");entries.forEach(([name,value,max])=>{const row=e("div"),label=e("div",undefined,"bar-label"),track=e("div",undefined,"track"),fill=e("div",undefined,"fill");append(label,e("span",name),e("strong",money(value)));fill.style.width=Math.max(0,Math.min(100,value/max*100))+"%";track.append(fill);append(row,label,track);wrap.append(row)});return wrap}
function restaurantOverview(root){
 root.append(stats([["فروش خالص نمونه",money(13360000),"۱۰۰ قلم فروخته‌شده"],["مواد و بسته‌بندی",money(5356000),"بر اساس رسپی‌های فرضی"],["باقی‌مانده فروش",money(8004000),"پیش از ارسال و هزینه‌های ثابت",true],["ضایعات ثبت‌شده",money(waste.reduce((s,w)=>s+w.cost,0)),"جدا از برآورد رسپی؛ سود خالص نیست"]]));
 const grid=e("div",undefined,"grid"),sales=panel("فروش به تفکیک محصول"),attention=panel("امروز به این‌ها سر بزن");
 sales.append(bars(menu.map(m=>[m.name,m.sale*m.count,5000000])),e("p","این اعداد نمونه‌اند و گزارش فروش واقعی نیستند.","muted"));
 const a=e("div",undefined,"alert-row");append(a,badge("ماندگاری","warn"),e("h3","۲ بسته شیر؛ یک روز تا تاریخ درج‌شده"),e("p","پیش از مصرف، شرایط نگهداری و وضعیت بسته بررسی شود."),button("دیدن موجودی",()=>go("stock"),true));
 const b=e("div",undefined,"alert-row");append(b,badge("بررسی قیمت"),e("h3","اگر پنیر گران‌تر شود، چقدر می‌ماند؟"),e("p","اثر تغییر هزینه را روی یک محصول امتحان کن."),button("آزمایش منو",()=>go("menu"),true));append(attention,a,b);append(grid,sales,attention);root.append(grid);
 root.append(note("این مدیر فقط اطلاعات مجموعه خودش را خواهد دید: منو، فروش، هزینه، کارکنان و گزارش‌ها. دسترسی به رستوران‌های دیگر ندارد."));
}
function menuView(root){
 root.append(note("سناریوی آزمایشی: تغییر عددها هیچ رسپی یا قیمت فعالی را عوض نمی‌کند. همه مبلغ‌ها تومان‌اند."));
 const p=panel("منوی داینر ساحل");p.append(table(["محصول","فروش هر پرس","مواد + بسته‌بندی","باقی‌مانده","حاشیه"],menu.map(m=>[m.name,money(m.sale),money(m.food+m.pack),money(m.sale-m.food-m.pack),fa((m.sale-m.food-m.pack)/m.sale*100)+"٪"])));root.append(p);
 const grid=e("div",undefined,"grid");grid.style.marginTop="22px";const formPanel=panel("آزمایش تغییر قیمت و هزینه"),f=e("form"),choice=e("select");
 menu.forEach((m,i)=>{const o=e("option",m.name);o.value=i;choice.append(o)});
 const cl=e("label","محصول");cl.append(choice);f.append(cl);
 const inputs={};[["sale","قیمت فروش هر پرس"],["food","مواد هر پرس"],["pack","بسته‌بندی هر پرس"]].forEach(([key,label])=>{const l=e("label",label),input=e("input");input.type="number";input.min=0;input.step=1;input.required=true;inputs[key]=input;l.append(input);f.append(l)});
 const result=e("div",undefined,"result");
 function calc(){const a=Object.values(inputs).map(i=>Number(i.value));if(Object.values(inputs).some(i=>!i.value||!i.checkValidity())||a.some(n=>!Number.isSafeInteger(n))){result.replaceChildren(e("p","عدد صحیح و غیرمنفی وارد کن."));return}
 const remaining=a[0]-a[1]-a[2];result.replaceChildren(e("span","باقی‌مانده هر پرس"),e("strong",money(remaining),remaining<0?"loss":""),e("div","حاشیه: "+(a[0]?fa(remaining/a[0]*100)+"٪":"تعریف‌نشده")),e("small","قبل از کمیسیون، ارسال، اجاره و حقوق"))}
 function select(){const m=menu[Number(choice.value)];Object.keys(inputs).forEach(k=>inputs[k].value=m[k]);calc()}
 Object.values(inputs).forEach(i=>i.oninput=calc);choice.onchange=select;f.onsubmit=ev=>ev.preventDefault();append(formPanel,f,result);select();
 const sources=panel("منبع هر عدد مشخص است");sources.append(table(["ماده","منبع نمونه","وضعیت"],[["پنیر پیتزا","فاکتور فرضی شماره ۱۲۳",badge("نمونه")],["نان هات‌داگ","قیمت دستی فرضی",badge("نمونه")],["جعبه","لیست فرضی تأمین‌کننده",badge("نمونه")]]),e("p","هیچ قیمتی از دیجی‌کالا دریافت نشده است. در نسخه عملیاتی، تاریخ و سند هر قیمت هم قابل مشاهده خواهد بود.","muted"));append(grid,formPanel,sources);root.append(grid);
}
function stockView(root){
 const lots=panel("اولویت مصرف موجودی");lots.append(table(["ماده / نوبت خرید","مقدار نمونه","ماندگاری نمونه","اقدام"],[["شیر • نوبت ۰۱","۲ لیتر","۱ روز تا تاریخ درج‌شده",badge("بررسی زودتر","warn")],["سس آماده • نوبت ۰۲","۷۰۰ گرم","مهلت معتبر ثبت نشده",badge("نیازمند اطلاعات","warn")],["نان • نوبت ۰۳","۱۸ عدد","تاریخ تأمین‌کننده ثبت نشده",badge("نیازمند اطلاعات")]]));root.append(lots);
 const grid=e("div",undefined,"grid");grid.style.marginTop="22px";const p=panel("ثبت آزمایشی دورریز"),form=e("form");
 const fields={};[["name","نام ماده"],["quantity","مقدار، همراه واحد"],["cost","ارزش مواد دورریخته‌شده (تومان)"],["reason","علت"]].forEach(([key,title])=>{const l=e("label",title),input=e("input");input.required=true;input.maxLength=100;if(key==="cost"){input.type="number";input.min=0;input.step=1}fields[key]=input;l.append(input);form.append(l)});
 const submit=e("button","ثبت در همین پیش‌نمایش","primary");submit.type="submit";form.append(submit);
 form.onsubmit=event=>{event.preventDefault();const value=Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,v.value.trim()]));if(Object.values(value).some(v=>!v)||!Number.isSafeInteger(Number(value.cost)))return;value.cost=Number(value.cost);waste.push(value);render();notify("دورریز به داده‌های همین پیش‌نمایش اضافه شد؛ با بارگذاری مجدد پاک می‌شود.")};p.append(form);
 const ledger=panel("دفتر دورریز نمونه");ledger.append(table(["ماده","مقدار","ارزش مواد","علت"],waste.map(w=>[w.name,w.quantity,money(w.cost),w.reason])));append(grid,p,ledger);root.append(grid,note("تاریخ انقضا به‌تنهایی تضمین سلامت نیست. برای مواد آماده‌شده یا بازشده، مهلت معتبر و شرایط نگهداری لازم است؛ سیستم تاریخ ایمن حدس نمی‌زند."));
}
function roadmap(root){root.append(note("این بخش‌ها در دامنه داینر هستند، اما هنوز عملیاتی نشده‌اند."));const grid=e("div",undefined,"roadmap");[["دستیار داینر","پرسش از داده‌ها و ثبت اطلاعات از طریق گفتگو."],["فروش و ارسال","تفکیک حضوری، پلتفرم، هزینه پیک و تسویه."],["هزینه و تعهدات","اجاره، قبوض، حقوق و تقویم پرداخت‌ها."],["تبلیغات","کمپین‌ها، فروش منتسب و اثر افزایشی تخمینی."],["دارایی و جابه‌جایی","استهلاک، سرمایه قابل‌بازیافت و هزینه انتقال."],["ورود اسناد","Excel، CSV و فاکتور با بررسی و تأیید."]].forEach(([t,d])=>{const a=e("article");append(a,badge("در برنامه ساخت"),e("h3",t),e("p",d));grid.append(a)});root.append(grid)}
function adminOverview(root){
 root.append(stats([["مجموعه‌های نمونه","۴","اطلاعات کاملاً فرضی"],["کاربران نمونه","۱۱","در چهار مجموعه"],["میانگین تکمیل اطلاعات","۶۹٪","نشانگر نمایشی",true],["اتصال قیمت زنده","۰","دیجی‌کالا هنوز متصل نیست"]]));
 const grid=e("div",undefined,"grid"),p=panel("وضعیت مجموعه‌ها"),q=panel("کارهای مدیر کل");
 p.append(table(["مجموعه","شهر","وضعیت"],restaurants.map(r=>[r.name,r.city,badge(r.status,r.status==="فعال"?"good":"warn")])),button("بررسی رستوران‌ها",()=>go("tenants"),true));
 [["کیفیت و تازگی منابع","اتصال‌ها، خطاها و منبع قیمت‌های مرجع را بررسی می‌کنی.","sources"],["نقش‌ها و مجوزها","دسترسی کاربران، پشتیبانی و ردپای عملیات را مدیریت می‌کنی.","access"]].forEach(([t,d,v])=>{const a=e("div",undefined,"alert-row");append(a,e("h3",t),e("p",d),button("مشاهده",()=>go(v),true));q.append(a)});append(grid,p,q);root.append(grid,note("پنل مدیر کل روی سلامت سرویس، مجموعه‌ها، اشتراک و پشتیبانی تمرکز دارد. اسناد مالی خصوصی در نمای عمومی مدیریت نمایش داده نمی‌شوند."));
}
function tenants(root){
 root.append(note("فهرست نمایشی مدیریت سرویس؛ دکمه‌ها تغییری در حساب واقعی ایجاد نمی‌کنند."));
 const p=panel("رستوران‌ها و کافه‌ها"),toolbar=e("div",undefined,"toolbar"),search=e("input"),filter=e("select");search.placeholder="جست‌وجوی نام یا شهر";search.setAttribute("aria-label","جست‌وجوی رستوران");
 ["همه وضعیت‌ها","فعال","نیازمند پیگیری"].forEach(t=>filter.append(e("option",t)));filter.setAttribute("aria-label","فیلتر وضعیت");append(toolbar,search,filter);const output=e("div");append(p,toolbar,output);
 function draw(){const rows=restaurants.filter(r=>(r.name+" "+r.city).includes(search.value.trim())&&(filter.value==="همه وضعیت‌ها"||r.status===filter.value));output.replaceChildren(rows.length?table(["مجموعه","شهر","طرح نمونه","کاربران","تکمیل داده","وضعیت"],rows.map(r=>[r.name,r.city,r.plan,fa(r.users),fa(r.complete)+"٪",badge(r.status,r.status==="فعال"?"good":"warn")])):e("p","مجموعه‌ای پیدا نشد.","empty"))}search.oninput=draw;filter.onchange=draw;draw();root.append(p)
}
function sources(root){const p=panel("منابع و اتصال‌ها");p.append(table(["منبع","کاربرد","وضعیت واقعی این پیش‌نمایش"],[["دیجی‌کالا","قیمت پیش‌فرض مرجع",badge("متصل نیست","warn")],["اسناد تأمین‌کننده","قیمت اختصاصی مجموعه",badge("واردکردن فایل پیاده نشده")],["ثبت دستی","اصلاح قیمت مجموعه",badge("در برنامه محلی موجود")],["رسپی مرجع","شروع سریع",badge("در برنامه ساخت")]]));root.append(p);
 const q=panel("قواعد کنترل کیفیت");q.style.marginTop="22px";const ul=e("ul",undefined,"access-list");["منبع و زمان هر قیمت باید مشخص باشد.","قیمت قدیمی با عنوان قیمت امروز نمایش داده نشود.","قیمت تأییدشده مجموعه با مرجع آنلاین خودکار جایگزین نشود.","فاکتور خصوصی رستوران وارد مرجع عمومی قیمت نشود."].forEach(t=>ul.append(e("li",t)));q.append(ul);root.append(q)}
function access(root){const p=panel("مرز دسترسی نقش‌ها");p.append(table(["قابلیت","مدیر رستوران","مدیر کل"],[["منو، هزینه و فروش مجموعه","فقط مجموعه خودش","پیش‌فرض: بدون جزئیات خصوصی"],["کارکنان","کارکنان مجموعه خودش","مدیریت حساب‌ها و نقش‌های سامانه"],["قیمت مرجع عمومی","مشاهده و انتخاب","مدیریت منابع و کیفیت"],["فاکتور خصوصی","طبق مجوز مجموعه","فقط دسترسی پشتیبانی مجاز و ثبت‌شده"],["اشتراک و وضعیت سرویس","اشتراک خودش","مدیریت مجموعه‌ها و سرویس"]]));root.append(p,note("انتخاب نقش بالای صفحه فقط برای نمایش است. نسخه عملیاتی به ورود کاربر، کنترل مجوز در سرور، جداسازی داده هر رستوران و ثبت عملیات حساس نیاز دارد."))}
function render(){ $("#role").value=role;$("#identity").textContent=role==="admin"?"نیما • مدیر کل":"داینر ساحل";$("#identity-sub").textContent=role==="admin"?"مدیریت سرویس داینر":"نوشهر • مجموعه نمونه";$("#breadcrumb").textContent=role==="admin"?"داینر / مدیریت کل":"داینر ساحل / پنل رستوران";$("#title").textContent=views[role].find(v=>v[0]===view)[1];const nav=$("#nav");nav.replaceChildren();views[role].forEach(([key,title],i)=>{const b=button("",()=>go(key));b.className=key===view?"active":"";b.setAttribute("aria-current",key===view?"page":"false");append(b,e("span","۰"+(i+1),"nav-no"),e("span",title));nav.append(b)});$("#status").textContent="";$("#status").className="";const root=$("#content");root.replaceChildren();const routes={restaurant:{overview:restaurantOverview,menu:menuView,stock:stockView,roadmap},admin:{overview:adminOverview,tenants,sources,access}};routes[role][view](root)}
$("#role").onchange=event=>{role=event.target.value;view="overview";location.hash=role;render()};
window.addEventListener("hashchange",()=>{role=location.hash.startsWith("#admin")?"admin":"restaurant";view="overview";render()});
render();
if(document.modelContext?.registerTool){const life=new AbortController();try{Promise.resolve(document.modelContext.registerTool({name:"read_diner_demo_view",description:"Read the selected demo role and section; all data is fictitious.",inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(input){if(!input||typeof input!=="object"||Object.keys(input).length)throw Error("No arguments expected");return {role,view,demo:true,persistent:false}}},{signal:life.signal})).catch(()=>{});}catch(e){}window.addEventListener("pagehide",()=>life.abort(),{once:true})}
