import Link from 'next/link';
export default function NotFound(){return <main className="login"><h1>این صفحه پیدا نشد</h1><p>ممکن است آدرس ناقص یا اشتباه باشد.</p><Link className="login-button" href="/app/dashboard?mode=demo">رفتن به داینر</Link></main>}
