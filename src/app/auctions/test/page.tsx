import Link from 'next/link';

export default function TestAuctionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">✅ صفحة المزادات تعمل!</h1>
        <p className="text-xl text-gray-700 mb-6">هذه رسالة اختبار للتأكد من عمل الصفحة</p>
        
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">مزادات Q8 Sport Car</h2>
          <p className="text-gray-600 mb-4">صفحة المزادات الآن نشطة وتعمل بشكل صحيح</p>
          
          <div className="grid grid-cols-1 gap-4">
            <Link
              href="/auctions/1"
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              مزاد رقم 1
            </Link>
            <Link
              href="/auctions/2"
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
            >
              مزاد رقم 2  
            </Link>
            <Link
              href="/auctions/3"
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
            >
              مزاد رقم 3
            </Link>
          </div>
        </div>
        
        <div className="mt-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}