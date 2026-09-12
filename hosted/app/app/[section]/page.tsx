import {notFound} from 'next/navigation';
import {getChatGPTUser,chatGPTSignInPath} from '@/app/chatgpt-auth';
import Workspace from '@/app/workspace';
import {sections,workspaceHref} from '@/lib/routes';
export const dynamic='force-dynamic';
type Props={params:Promise<{section:string}>;searchParams:Promise<{mode?:string}>};
export async function generateMetadata({params}:Props){const {section}=await params;const match=sections.find(s=>s.path===section);return {title:match?`${match.title} | داینر`:'صفحه پیدا نشد | داینر'};}
export default async function Page({params,searchParams}:Props){
 const {section}=await params,query=await searchParams,match=sections.find(s=>s.path===section);if(!match)notFound();
 const demo=query.mode!=='real',user=await getChatGPTUser(),returnTo=workspaceHref(match.view,demo);
 if(!user)return <main className="login"><div className="brand">داینر</div><h1>{match.title}</h1><p>برای دیدن اطلاعات مجموعه وارد حساب شو؛ پس از ورود به همین بخش برمی‌گردی.</p><a className="login-button" href={chatGPTSignInPath(returnTo)} target="_top">ورود با ChatGPT</a></main>;
 return <Workspace key={returnTo} displayName={user.displayName} demo={demo} view={match.view}/>;
}
