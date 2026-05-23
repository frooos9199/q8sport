import Link from "next/link";

export default function Home() {
  const featuredCars = [
    { name: "Porsche 911 Turbo S", price: "41,500 د.ك", meta: "2022 • 18 ألف كم" },
    { name: "BMW M4 Competition", price: "27,900 د.ك", meta: "2023 • وارد الخليج" },
    { name: "Ford Mustang GT 5.0", price: "16,800 د.ك", meta: "2021 • تعديل خفيف" },
  ];

  const featuredParts = [
    "مكينة موستنغ 5.0",
    "رنجات AMG أصلية",
    "عادم بورش سبورت",
    "قير GT-R نظيف",
  ];

  const wantedNow = [
    "مطلوب مكينة فورد 5.0 كاملة مع ملحقاتها",
    "مطلوب رنجات بورش RS مقاس 21",
    "مطلوب كورفيت Z06 وكالة أو نظيف جدًا",
  ];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-5 pb-20 pt-5 sm:px-8 lg:px-10">
      <header className="sticky top-0 z-20 mb-6 rounded-full border border-line bg-black/40 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sand">Kuwait Sport Market</p>
            <h1 className="text-lg font-black text-foreground">Q8 Sport Market</h1>
          </div>
          <nav className="hidden gap-6 text-sm text-zinc-300 md:flex">
            <a href="#market">المعروض</a>
            <a href="#wanted">المطلوب الآن</a>
            <a href="#why">ليش هذا السوق</a>
          </nav>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-panel px-6 py-8 sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,59,45,0.24),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent_50%)]" />
          <div className="relative">
            <div className="mb-8 flex flex-wrap items-center gap-3 text-xs font-bold text-sand">
              <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-2">سيارات سبورت</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">قطع غيار نادرة</span>
              <span className="rounded-full border border-mint/30 bg-mint/10 px-3 py-2 text-mint">مطلوبات مباشرة</span>
            </div>

            <h2 className="max-w-3xl text-4xl font-black leading-[1.05] text-foreground sm:text-6xl">
              السوق الكويتي اللي يجمع
              <span className="block text-brand">السيارات السبورت والقطع والمطلوب الحقيقي</span>
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
              موقع مصمم عشان المعروض يوصل بسرعة، والمطلوب ينتشر بين الشباب أسرع. إذا أحد يبي مكينة فورد، أو رنجات AMG، أو سيارة كاملة نظيفة، كل شيء ينشاف في مكان واحد.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="rounded-full bg-brand px-6 py-4 text-center text-sm font-black text-white transition hover:bg-[#ff5b4e]" href="/market">
                شوف المطلوب الآن
              </Link>
              <Link className="rounded-full border border-mint/30 bg-mint/10 px-6 py-4 text-center text-sm font-black text-mint transition hover:bg-mint/15" href="/sell">
                انشر إعلانك الآن
              </Link>
              <Link className="rounded-full border border-white/12 bg-white/5 px-6 py-4 text-center text-sm font-bold text-zinc-100 transition hover:bg-white/10" href="/market">
                استكشف السوق
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <Stat value="+2,300" label="زيارة مستهدفة" />
              <Stat value="+480" label="مطلوب شهري" />
              <Stat value="24/7" label="تفاعل مباشر" />
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[2rem] border border-line bg-[linear-gradient(180deg,#1d1d1d_0%,#111_100%)] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">Hot Feed</p>
            <div className="mt-5 space-y-4">
              {wantedNow.map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="mb-2 text-xs font-bold text-mint">مطلوب الآن</p>
                  <p className="text-sm leading-7 text-zinc-100">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-brand/20 bg-brand/10 p-6">
            <p className="text-sm font-black text-white">الموقع يخدم التطبيقين</p>
            <p className="mt-3 text-sm leading-7 text-zinc-200">
              نفس الهوية، نفس السوق، ونفس منطق “المعروض + المطلوب” عشان الويب يصير بوابة الانتشار الرئيسية.
            </p>
          </div>
        </div>
      </section>

      <section id="market" className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-line bg-panel p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">Featured Cars</p>
              <h3 className="mt-2 text-2xl font-black text-foreground">سيارات الناس تتكلم عنها</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-300">محدث يوميًا</span>
          </div>

          <div className="space-y-4">
            {featuredCars.map((car) => (
              <Link key={car.name} href="/market" className="rounded-[1.5rem] border border-white/8 bg-panel-soft p-5 transition hover:-translate-y-0.5 hover:border-brand/30">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-black text-foreground">{car.name}</h4>
                    <p className="mt-2 text-sm text-zinc-400">{car.meta}</p>
                  </div>
                  <p className="text-sm font-black text-brand">{car.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-line bg-[linear-gradient(180deg,#131313_0%,#0b0b0b_100%)] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">Rare Parts</p>
          <h3 className="mt-2 max-w-xl text-2xl font-black text-foreground">قطع نازلة للسوق وتخلق حركة بسرعة</h3>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {featuredParts.map((part, index) => (
              <Link key={part} href="/market" className="group relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/20 blur-2xl transition group-hover:bg-brand/30" />
                <p className="relative text-xs font-bold text-sand">0{index + 1}</p>
                <h4 className="relative mt-3 text-lg font-black text-zinc-100">{part}</h4>
                <p className="relative mt-3 text-sm leading-7 text-zinc-400">قطع تناسب السوق المحلي، وقابلة للربط لاحقًا مع التصنيفات والموديلات والتنبيهات.</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="wanted" className="mt-8 rounded-[2rem] border border-line bg-panel px-6 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">Wanted Engine</p>
            <h3 className="mt-3 text-3xl font-black text-foreground">المطلوب هو محرك الانتشار</h3>
            <p className="mt-5 text-sm leading-8 text-zinc-300 sm:text-base">
              أقوى نقطة في السوق ليست فقط المعروض. القوة الحقيقية أن الشخص يكتب المطلوب، والباقي يشوفه ويتفاعل معه مباشرة. هذا الجزء هو اللي يخلي الناس ترجع يوميًا للموقع.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FeatureCard title="نشر سريع" text="المستخدم ينزل المطلوب خلال ثواني بدل ما يدوّر في كل مكان." />
            <FeatureCard title="تفاعل واضح" text="الطلبات تعطي السوق شعور حي وتخلق حركة مستمرة بين المعروض والمحتاج." />
            <FeatureCard title="محتوى ينتشر" text="كل مطلوب حقيقي يصير مادة كلام ومشاركة بين الشباب والمهتمين." />
          </div>
        </div>
      </section>

      <section id="why" className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border border-line bg-panel p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">Why It Works</p>
          <ul className="mt-6 space-y-5 text-sm leading-8 text-zinc-300">
            <li>هوية محلية مباشرة بدل شكل عالمي بارد لا يشبه السوق الكويتي.</li>
            <li>تركيز على السيارات السبورت والقطع الثقيلة بدل سوق عام مشتت.</li>
            <li>دمج واضح بين المعروض والمطلوب عشان الحركة ما توقف.</li>
            <li>تمهيد طبيعي لصفحات المعلنين، الثقة، والتنبيهات لاحقًا.</li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-brand/20 bg-[linear-gradient(135deg,rgba(239,59,45,0.14),rgba(16,16,16,0.95))] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-sand">Launch Direction</p>
          <h3 className="mt-3 text-3xl font-black text-foreground">الموقع هذا هو واجهة الكلام عن المنتج</h3>
          <p className="mt-5 text-sm leading-8 text-zinc-200 sm:text-base">
            التطبيقين ممتازين للتفاعل اليومي، لكن الموقع هو واجهة الانتشار العامة: صفحة هبوط، صفحات معروضات، صفحات معلنين، وروابط تشارك بسهولة في الواتساب والسوشال.
          </p>
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <p className="text-sm font-black text-white">المرحلة التالية على الويب</p>
            <p className="mt-3 text-sm leading-7 text-zinc-300">بدأت الآن صفحات الـ Listing وملف المعلن، والخطوة التالية ربطها مباشرة ببيانات السوق الحقيقية.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] px-4 py-5">
      <div className="text-2xl font-black text-foreground">{value}</div>
      <div className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">{label}</div>
    </div>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
      <h4 className="text-lg font-black text-foreground">{title}</h4>
      <p className="mt-3 text-sm leading-7 text-zinc-400">{text}</p>
    </div>
  );
}
