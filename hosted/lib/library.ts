export const materials = [
{id:'milk',name:'شیر',icon:'🥛',unit:'ml',pack:'1000',group:'لبنیات',aliases:'شیر گاو'},
{id:'cheese',name:'پنیر پیتزا',icon:'🧀',unit:'g',pack:'1000',group:'لبنیات',aliases:'موزارلا'},
{id:'butter',name:'کره',icon:'🧈',unit:'g',pack:'100',group:'لبنیات',aliases:''},
{id:'cream',name:'خامه',icon:'🥛',unit:'g',pack:'200',group:'لبنیات',aliases:''},
{id:'beef',name:'گوشت چرخ‌کرده',icon:'🥩',unit:'g',pack:'1000',group:'پروتئین',aliases:'گوشت برگر'},
{id:'chicken',name:'سینه مرغ',icon:'🍗',unit:'g',pack:'1000',group:'پروتئین',aliases:'فیله مرغ'},
{id:'sausage',name:'سوسیس هات‌داگ',icon:'🌭',unit:'g',pack:'1000',group:'پروتئین',aliases:'سوسیس'},
{id:'egg',name:'تخم‌مرغ',icon:'🥚',unit:'piece',pack:'1',group:'پروتئین',aliases:''},
{id:'bun',name:'نان برگر',icon:'🍞',unit:'piece',pack:'1',group:'نان و خشکبار',aliases:'نان همبرگر'},
{id:'hotbun',name:'نان هات‌داگ',icon:'🥖',unit:'piece',pack:'1',group:'نان و خشکبار',aliases:'نان ساندویچ'},
{id:'flour',name:'آرد سفید',icon:'🌾',unit:'g',pack:'1000',group:'نان و خشکبار',aliases:''},
{id:'rice',name:'برنج',icon:'🍚',unit:'g',pack:'1000',group:'نان و خشکبار',aliases:''},
{id:'potato',name:'سیب‌زمینی',icon:'🥔',unit:'g',pack:'1000',group:'سبزی و میوه',aliases:'سیب زمینی'},
{id:'tomato',name:'گوجه‌فرنگی',icon:'🍅',unit:'g',pack:'1000',group:'سبزی و میوه',aliases:'گوجه'},
{id:'lettuce',name:'کاهو',icon:'🥬',unit:'g',pack:'1000',group:'سبزی و میوه',aliases:''},
{id:'onion',name:'پیاز',icon:'🧅',unit:'g',pack:'1000',group:'سبزی و میوه',aliases:''},
{id:'mushroom',name:'قارچ',icon:'🍄',unit:'g',pack:'1000',group:'سبزی و میوه',aliases:''},
{id:'lemon',name:'آب‌لیمو',icon:'🍋',unit:'ml',pack:'1000',group:'سبزی و میوه',aliases:'آب لیمو'},
{id:'coffee',name:'دانه قهوه',icon:'☕',unit:'g',pack:'1000',group:'نوشیدنی',aliases:'قهوه اسپرسو'},
{id:'tea',name:'چای خشک',icon:'🫖',unit:'g',pack:'500',group:'نوشیدنی',aliases:'چای'},
{id:'sugar',name:'شکر',icon:'🍬',unit:'g',pack:'1000',group:'سس و چاشنی',aliases:''},
{id:'oil',name:'روغن',icon:'🫗',unit:'ml',pack:'1000',group:'سس و چاشنی',aliases:'روغن سرخ کردنی'},
{id:'salt',name:'نمک',icon:'🧂',unit:'g',pack:'500',group:'سس و چاشنی',aliases:''},
{id:'ketchup',name:'سس کچاپ',icon:'🥫',unit:'g',pack:'1000',group:'سس و چاشنی',aliases:'سس گوجه'},
{id:'mayo',name:'سس مایونز',icon:'🥣',unit:'g',pack:'1000',group:'سس و چاشنی',aliases:''},
{id:'box',name:'جعبه غذا',icon:'📦',unit:'piece',pack:'1',group:'بسته‌بندی',aliases:'بسته بندی جعبه'},
{id:'cup',name:'لیوان بیرون‌بر',icon:'🥤',unit:'piece',pack:'1',group:'بسته‌بندی',aliases:'لیوان کاغذی'},
{id:'bag',name:'پاکت حمل',icon:'🛍️',unit:'piece',pack:'1',group:'بسته‌بندی',aliases:'کیسه پاکت'}
];
export type Material=typeof materials[number];
export const recipes=[
{id:'latte',name:'لاته',icon:'☕',lines:[['coffee',18],['milk',220]]},
{id:'espresso',name:'اسپرسو',icon:'☕',lines:[['coffee',18]]},
{id:'hotdog',name:'هات‌داگ کلاسیک',icon:'🌭',lines:[['hotbun',1],['sausage',100],['ketchup',20]]},
{id:'cheeseburger',name:'چیزبرگر',icon:'🍔',lines:[['bun',1],['beef',150],['cheese',25],['lettuce',15],['tomato',25],['mayo',20],['salt',1]]},
{id:'omelette',name:'املت گوجه',icon:'🍳',lines:[['egg',2],['tomato',150],['oil',10],['salt',1]]}
];
export type Template=typeof recipes[number];
export const normalize=(s:string)=>s.replace(/[‌\s-]/g,'').replace(/ي/g,'ی').replace(/ك/g,'ک');
export function matchingIngredient(item:Material,rows:any[]){return rows.find(r=>r.data.unit===item.unit&&(r.data.catalogId===item.id||normalize(r.data.name)===normalize(item.name)));}
