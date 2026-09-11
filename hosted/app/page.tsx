import {getChatGPTUser,chatGPTSignInPath} from "./chatgpt-auth";
import Workspace from "./workspace";
export const dynamic="force-dynamic";
export default async function Page(){
 const user=await getChatGPTUser();
 if(!user)return <main className="login"><div className="brand">داینر <small>DINER</small></div><h1>دفتر رستوران تو</h1><p>برای ثبت مجموعه و دسترسی به اطلاعات اختصاصی، وارد حساب شو.</p><a className="login-button" href={chatGPTSignInPath("/")} target="_top">ورود با ChatGPT</a><p className="hint">این نسخه فعلاً برای استفاده خصوصی صاحب پروژه منتشر می‌شود.</p></main>;
 return <Workspace displayName={user.displayName}/>;
}
