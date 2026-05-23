import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
      <div className="w-full rounded-[2rem] border border-line bg-panel px-6 py-10 sm:px-10 sm:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">404</p>
        <h1 className="mt-4 text-4xl font-black text-foreground sm:text-5xl">الصفحة غير موجودة</h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-zinc-300 sm:text-base">
          الرابط الذي فتحته غير متاح الآن. ارجع إلى السوق أو الصفحة الرئيسية وتابع التصفح أو أنشئ إعلانك مباشرة.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/market" className="rounded-full bg-brand px-6 py-4 text-sm font-black text-white transition hover:bg-[#ff5b4e]">
            افتح السوق
          </Link>
          <Link href="/sell" className="rounded-full border border-white/12 bg-white/5 px-6 py-4 text-sm font-black text-white transition hover:bg-white/10">
            انشر إعلانك
          </Link>
        </div>
      </div>
    </main>
  );
}