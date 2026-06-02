import type { Metadata } from 'next';
import Link from 'next/link';

import { absoluteUrl, siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
  description:
    'سياسة الخصوصية الخاصة بمنصة Q8 Sport Market وتوضح كيفية جمع المعلومات واستخدامها وحمايتها داخل الموقع والتطبيق.',
  alternates: {
    canonical: absoluteUrl('/privacy-policy'),
  },
  openGraph: {
    title: `سياسة الخصوصية | ${siteConfig.name}`,
    description:
      'تعرف على طريقة جمع واستخدام وحماية البيانات داخل Q8 Sport Market على الويب والتطبيق.',
    url: absoluteUrl('/privacy-policy'),
  },
};

const sections = [
  {
    title: '1. المعلومات التي نجمعها',
    body: [
      'قد نجمع المعلومات التي تدخلها بنفسك عند التسجيل أو عند نشر إعلان، مثل الاسم ورقم الهاتف والبريد الإلكتروني والصور ووصف السيارة أو القطعة أو المطلوب.',
      'قد نجمع أيضًا معلومات تشغيلية وتقنية لازمة لتقديم الخدمة، مثل معرّفات الحساب، وقت النشر، وحالة الاستخدام العامة داخل الموقع أو التطبيق.',
    ],
  },
  {
    title: '2. كيف نستخدم المعلومات',
    body: [
      'نستخدم المعلومات لعرض الإعلانات، تمكين التواصل بين المستخدمين، إدارة الحسابات، تحسين الأداء، وتقديم الدعم الفني عند الحاجة.',
      'كما نستخدم البيانات لمنع إساءة الاستخدام، حماية المنصة، والتحقق من سلامة المحتوى والعمليات المرتبطة بالنشر ورفع الصور.',
    ],
  },
  {
    title: '3. مشاركة المعلومات',
    body: [
      'لا نبيع بياناتك الشخصية للغير. قد تظهر بعض المعلومات التي تختار نشرها داخل الإعلان بشكل علني للمستخدمين الآخرين، مثل بيانات التواصل أو تفاصيل المعروض.',
      'قد تتم مشاركة البيانات مع مزودي خدمات تقنيين ضروريين لتشغيل المنصة مثل خدمات الاستضافة، قواعد البيانات، وتخزين الملفات، وذلك فقط بالقدر اللازم لتقديم الخدمة.',
    ],
  },
  {
    title: '4. تخزين البيانات وحمايتها',
    body: [
      'نطبّق إجراءات تقنية وإدارية مناسبة لحماية البيانات من الوصول غير المصرح به أو الاستخدام غير المشروع أو الفقدان غير المقصود.',
      'مع ذلك، لا توجد وسيلة نقل أو تخزين إلكتروني مضمونة بنسبة 100%، لذلك نبذل جهدًا معقولًا لحماية المعلومات دون تقديم ضمان مطلق.',
    ],
  },
  {
    title: '5. المحتوى الذي ينشره المستخدم',
    body: [
      'أي معلومات أو صور أو أرقام تضعها داخل الإعلان قد تصبح متاحة للزوار أو المستخدمين الآخرين بحسب طبيعة الصفحة أو الإعلان المنشور.',
      'تقع على المستخدم مسؤولية التأكد من أن المحتوى المنشور لا يتضمن بيانات لا يرغب في إتاحتها بشكل علني.',
    ],
  },
  {
    title: '6. حقوقك وتحديث بياناتك',
    body: [
      'يمكنك طلب تعديل أو حذف بياناتك أو محتواك المنشور وفق الإمكانات المتاحة داخل التطبيق أو عبر التواصل من خلال القنوات الرسمية المعروضة في المنصة.',
      'قد نحتفظ ببعض البيانات عند الحاجة النظامية أو الأمنية أو لتسوية النزاعات ومنع الاحتيال وإثبات العمليات السابقة.',
    ],
  },
  {
    title: '7. الأطفال',
    body: [
      'الخدمة غير موجهة للأطفال، ولا نستهدف جمع بيانات شخصية من القُصّر بشكل متعمد. إذا تبيّن لنا وجود بيانات تم جمعها بشكل غير مناسب فسيتم التعامل معها وفق ما يلزم.',
    ],
  },
  {
    title: '8. تحديثات سياسة الخصوصية',
    body: [
      'قد نقوم بتحديث هذه السياسة من وقت لآخر عند تطوير الخدمة أو تعديل آليات التشغيل أو المتطلبات النظامية. يصبح التحديث نافذًا عند نشر النسخة الجديدة على هذه الصفحة.',
    ],
  },
  {
    title: '9. التواصل معنا',
    body: [
      'لأي استفسار يتعلق بالخصوصية أو البيانات، يمكنك التواصل عبر القنوات الرسمية المعروضة داخل التطبيق أو الموقع الإلكتروني.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  const updatedAt = '24 مايو 2026';

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-5 pb-20 pt-6 sm:px-8 lg:px-10">
      <div className="rounded-[2rem] border border-line bg-panel px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sand">Privacy Policy</p>
            <h1 className="mt-3 text-3xl font-black text-foreground sm:text-5xl">سياسة الخصوصية</h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-zinc-300 sm:text-base">
              توضح هذه الصفحة كيفية تعامل {siteConfig.name} مع البيانات والمعلومات التي يتم جمعها أو مشاركتها عند استخدام الموقع أو التطبيق.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
            آخر تحديث: <span className="font-black text-foreground">{updatedAt}</span>
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-brand/20 bg-brand/10 p-5 text-sm leading-8 text-zinc-100">
          باستخدامك للموقع أو التطبيق، فأنت تقر بأنك اطلعت على هذه السياسة وفهمت طريقة استخدام البيانات بالقدر اللازم لتشغيل الخدمة وإدارة الإعلانات والمحتوى.
        </div>
      </div>

      <div className="mt-8 grid gap-5">
        {sections.map((section) => (
          <section key={section.title} className="rounded-[2rem] border border-line bg-panel px-6 py-7 sm:px-8">
            <h2 className="text-xl font-black text-foreground sm:text-2xl">{section.title}</h2>
            <div className="mt-4 space-y-4 text-sm leading-8 text-zinc-300 sm:text-base">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-[2rem] border border-line bg-[linear-gradient(135deg,rgba(239,59,45,0.14),rgba(16,16,16,0.95))] px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="text-lg font-black text-foreground">رابط الصفحة الجاهز للاستخدام</p>
          <p className="mt-2 text-sm leading-7 text-zinc-200">استخدم هذا الرابط في Google Play أو أي نموذج يتطلب رابط سياسة الخصوصية.</p>
        </div>
        <Link
          href="/privacy-policy"
          className="max-w-full break-all whitespace-normal rounded-full border border-white/12 bg-white/8 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-white/12"
        >
          {absoluteUrl('/privacy-policy')}
        </Link>
      </div>
    </main>
  );
}