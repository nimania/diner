export const sections=[
 {path:'dashboard',view:'overview',title:'نمای مجموعه'},
 {path:'ingredients',view:'ingredients',title:'مواد اولیه'},
 {path:'recipes',view:'recipes',title:'غذاها و هزینه'},
 {path:'inventory',view:'stock',title:'خرید و انبار'},
 {path:'blends',view:'blends',title:'ترکیب گوشت'},
 {path:'sales',view:'sales',title:'فروش و گزارش روز'},
 {path:'expenses',view:'expenses',title:'هزینه‌ها و گزارش دوره'},
 {path:'menu',view:'public_menu',title:'منوی آنلاین مشتری'},
 {path:'waste',view:'waste',title:'ضایعات قبلی'},
 {path:'roadmap',view:'next',title:'بخش‌های بعدی'}
] as const;
export function workspaceHref(view:string,demo:boolean){const section=sections.find(s=>s.view===view);if(!section)throw Error('Unknown workspace view');return `/app/${section.path}?mode=${demo?'demo':'real'}`;}
