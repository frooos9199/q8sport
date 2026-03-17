const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, Timestamp } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCmtlQSl1_5nKz7BHUD0ntOLEC9_4zcHxo",
  authDomain: "q8sportcar.firebaseapp.com",
  projectId: "q8sportcar",
  storageBucket: "q8sportcar.firebasestorage.app",
  messagingSenderId: "510621587144",
  appId: "1:510621587144:web:8d63dc54627c8704ab37fd",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const cars = [
  {
    title: { ar: "بورشه 911 GT3 RS", en: "Porsche 911 GT3 RS" },
    description: { ar: "بورشه 911 GT3 RS موديل 2024 فل كامل، حالة ممتازة، سيرفس وكالة، لون أخضر بايثون", en: "Porsche 911 GT3 RS 2024 full option, excellent condition, dealer service, Python Green" },
    brand: "Porsche", model: "911 GT3 RS", year: 2024, price: 85000, mileage: 3200,
    color: "أخضر", transmission: "automatic", fuelType: "petrol",
    images: ["https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800"],
    userWhatsapp: "+96500000001", userName: "Q8 Sport Car", userId: "admin", status: "active",
  },
  {
    title: { ar: "فيراري F8 تريبوتو", en: "Ferrari F8 Tributo" },
    description: { ar: "فيراري F8 تريبوتو 2023، محرك V8 توين تيربو 720 حصان، لون أحمر كورسا الأصلي", en: "Ferrari F8 Tributo 2023, V8 Twin Turbo 720HP, Rosso Corsa" },
    brand: "Ferrari", model: "F8 Tributo", year: 2023, price: 120000, mileage: 5400,
    color: "أحمر", transmission: "automatic", fuelType: "petrol",
    images: ["https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800"],
    userWhatsapp: "+96500000002", userName: "Q8 Sport Car", userId: "admin", status: "active",
  },
  {
    title: { ar: "لامبورغيني هوراكان STO", en: "Lamborghini Huracan STO" },
    description: { ar: "لامبورغيني هوراكان STO 2023، محرك V10 طبيعي 640 حصان، لون أزرق مات", en: "Lamborghini Huracan STO 2023, V10 NA 640HP, Matte Blue" },
    brand: "Lamborghini", model: "Huracan STO", year: 2023, price: 135000, mileage: 4100,
    color: "أزرق", transmission: "automatic", fuelType: "petrol",
    images: ["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800"],
    userWhatsapp: "+96500000003", userName: "Q8 Sport Car", userId: "admin", status: "active",
  },
  {
    title: { ar: "مكلارين 720S", en: "McLaren 720S" },
    description: { ar: "مكلارين 720S موديل 2022، محرك V8 توين تيربو 710 حصان، لون برتقالي", en: "McLaren 720S 2022, V8 Twin Turbo 710HP, Papaya Spark Orange" },
    brand: "McLaren", model: "720S", year: 2022, price: 95000, mileage: 8700,
    color: "برتقالي", transmission: "automatic", fuelType: "petrol",
    images: ["https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800"],
    userWhatsapp: "+96500000004", userName: "Q8 Sport Car", userId: "admin", status: "active",
  },
  {
    title: { ar: "نيسان GT-R نيسمو", en: "Nissan GT-R Nismo" },
    description: { ar: "نيسان GT-R نيسمو 2021، محرك V6 توين تيربو 600 حصان، وحش ياباني أصلي", en: "Nissan GT-R Nismo 2021, V6 Twin Turbo 600HP, Japanese beast" },
    brand: "Nissan", model: "GT-R Nismo", year: 2021, price: 55000, mileage: 15000,
    color: "أبيض", transmission: "automatic", fuelType: "petrol",
    images: ["https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800"],
    userWhatsapp: "+96500000005", userName: "أبو فهد", userId: "admin", status: "active",
  },
  {
    title: { ar: "بي ام دبليو M4 كومبتيشن", en: "BMW M4 Competition" },
    description: { ar: "بي ام دبليو M4 كومبتيشن 2024، محرك 6 سلندر توين تيربو 510 حصان، لون أخضر آيل أوف مان", en: "BMW M4 Competition 2024, Inline-6 Twin Turbo 510HP, Isle of Man Green" },
    brand: "BMW", model: "M4 Competition", year: 2024, price: 38000, mileage: 2100,
    color: "أخضر", transmission: "automatic", fuelType: "petrol",
    images: ["https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800"],
    userWhatsapp: "+96500000006", userName: "أبو عبدالله", userId: "admin", status: "active",
  },
  {
    title: { ar: "مرسيدس AMG GT بلاك سيريز", en: "Mercedes AMG GT Black Series" },
    description: { ar: "مرسيدس AMG GT بلاك سيريز 2022، محرك V8 730 حصان، نسخة محدودة نادرة", en: "Mercedes AMG GT Black Series 2022, V8 730HP, Rare limited edition" },
    brand: "Mercedes-Benz", model: "AMG GT Black Series", year: 2022, price: 150000, mileage: 1800,
    color: "أسود", transmission: "automatic", fuelType: "petrol",
    images: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800"],
    userWhatsapp: "+96500000007", userName: "Q8 Sport Car", userId: "admin", status: "active",
  },
  {
    title: { ar: "دودج تشالنجر هيلكات", en: "Dodge Challenger Hellcat" },
    description: { ar: "دودج تشالنجر هيلكات 2023، محرك V8 سوبرتشارجد 717 حصان، صوت وحشي", en: "Dodge Challenger Hellcat 2023, V8 Supercharged 717HP, Beast sound" },
    brand: "Dodge", model: "Challenger Hellcat", year: 2023, price: 32000, mileage: 12000,
    color: "أحمر", transmission: "automatic", fuelType: "petrol",
    images: ["https://images.unsplash.com/photo-1594950195922-0e923aed02c5?w=800"],
    userWhatsapp: "+96500000008", userName: "أبو محمد", userId: "admin", status: "active",
  },
  {
    title: { ar: "شيفروليه كورفيت C8 Z06", en: "Chevrolet Corvette C8 Z06" },
    description: { ar: "شيفروليه كورفيت C8 Z06 2024، محرك V8 طبيعي 670 حصان، أقوى كورفيت في التاريخ", en: "Chevrolet Corvette C8 Z06 2024, V8 NA 670HP, Most powerful Corvette ever" },
    brand: "Chevrolet", model: "Corvette C8 Z06", year: 2024, price: 58000, mileage: 900,
    color: "أصفر", transmission: "automatic", fuelType: "petrol",
    images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"],
    userWhatsapp: "+96500000009", userName: "Q8 Sport Car", userId: "admin", status: "active",
  },
];

const parts = [
  {
    title: { ar: "اكزوست أكرابوفيتش بورشه 911", en: "Akrapovic Exhaust Porsche 911" },
    description: { ar: "اكزوست أكرابوفيتش تيتانيوم كامل لبورشه 911 GT3، صوت خرافي وأداء عالي", en: "Full titanium Akrapovic exhaust for Porsche 911 GT3, amazing sound and performance" },
    category: "exhaust", condition: "new", price: 4500, compatibleBrands: ["Porsche"],
    images: ["https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800"],
    userWhatsapp: "+96500000010", userName: "قطع سبورت الكويت", userId: "admin", status: "active",
  },
  {
    title: { ar: "جنوط BBS فورجد 20 إنش", en: "BBS Forged Wheels 20 inch" },
    description: { ar: "جنوط BBS فورجد خفيفة الوزن 20 إنش، تناسب أغلب السيارات الرياضية", en: "BBS Forged lightweight wheels 20 inch, fits most sport cars" },
    category: "wheels", condition: "new", price: 3200, compatibleBrands: ["BMW", "Mercedes-Benz", "Porsche"],
    images: ["https://images.unsplash.com/photo-1611821064430-0d40291d0f0b?w=800"],
    userWhatsapp: "+96500000011", userName: "جنوط الكويت", userId: "admin", status: "active",
  },
  {
    title: { ar: "كت بودي وايد بودي لامبورغيني", en: "Lamborghini Wide Body Kit" },
    description: { ar: "كت بودي وايد بودي كاربون فايبر للامبورغيني هوراكان، تصميم عدواني", en: "Carbon fiber wide body kit for Lamborghini Huracan, aggressive design" },
    category: "body", condition: "new", price: 8500, compatibleBrands: ["Lamborghini"],
    images: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800"],
    userWhatsapp: "+96500000012", userName: "بودي كت الكويت", userId: "admin", status: "active",
  },
  {
    title: { ar: "فرامل بريمبو GT سيراميك", en: "Brembo GT Ceramic Brakes" },
    description: { ar: "فرامل بريمبو GT سيراميك كاربون، أداء فرملة خرافي للسيارات الرياضية", en: "Brembo GT Carbon Ceramic brakes, insane braking performance for sport cars" },
    category: "brakes", condition: "new", price: 6000, compatibleBrands: ["Ferrari", "Porsche", "Lamborghini"],
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800"],
    userWhatsapp: "+96500000013", userName: "قطع سبورت الكويت", userId: "admin", status: "active",
  },
  {
    title: { ar: "تيربو كت HKS لنيسان GT-R", en: "HKS Turbo Kit for Nissan GT-R" },
    description: { ar: "تيربو كت HKS كامل لنيسان GT-R R35، يوصل القوة لـ 900+ حصان", en: "Full HKS turbo kit for Nissan GT-R R35, pushes power to 900+ HP" },
    category: "engine", condition: "new", price: 12000, compatibleBrands: ["Nissan"],
    images: ["https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800"],
    userWhatsapp: "+96500000014", userName: "تيربو الكويت", userId: "admin", status: "active",
  },
  {
    title: { ar: "مقاعد ريكارو سبورت", en: "Recaro Sport Seats" },
    description: { ar: "مقاعد ريكارو سبورت كاربون شل، خفيفة الوزن ومريحة للسباقات", en: "Recaro Sport carbon shell seats, lightweight and comfortable for racing" },
    category: "interior", condition: "new", price: 2800, compatibleBrands: ["BMW", "Porsche", "Nissan"],
    images: ["https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800"],
    userWhatsapp: "+96500000015", userName: "داخلية سبورت", userId: "admin", status: "active",
  },
  {
    title: { ar: "نظام تعليق KW V3 كويلوفر", en: "KW V3 Coilover Suspension" },
    description: { ar: "نظام تعليق KW V3 قابل للتعديل، مناسب لبي ام دبليو M3/M4", en: "KW V3 adjustable coilover suspension, fits BMW M3/M4" },
    category: "suspension", condition: "new", price: 3500, compatibleBrands: ["BMW"],
    images: ["https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800"],
    userWhatsapp: "+96500000016", userName: "قطع سبورت الكويت", userId: "admin", status: "active",
  },
  {
    title: { ar: "اكزوست بورلا كورفيت C8", en: "Borla Exhaust Corvette C8" },
    description: { ar: "اكزوست بورلا S-Type كامل لكورفيت C8، ستانلس ستيل، صوت أمريكي أصلي", en: "Borla S-Type full exhaust for Corvette C8, stainless steel, authentic American sound" },
    category: "exhaust", condition: "used", price: 1800, compatibleBrands: ["Chevrolet"],
    images: ["https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800"],
    userWhatsapp: "+96500000017", userName: "أبو فهد", userId: "admin", status: "active",
  },
];

const requests = [
  {
    title: { ar: "مطلوب بورشه 911 GT3 موديل 2020+", en: "Wanted: Porsche 911 GT3 2020+" },
    description: { ar: "أدور بورشه 911 GT3 موديل 2020 أو أحدث، أي لون، المهم حالة نظيفة وسيرفس وكالة", en: "Looking for Porsche 911 GT3 2020 or newer, any color, must be clean with dealer service" },
    category: "car", budget: 75000, status: "open",
    userWhatsapp: "+96500000018", userName: "أبو خالد", userId: "admin",
  },
  {
    title: { ar: "مطلوب اكزوست لفيراري 488", en: "Wanted: Exhaust for Ferrari 488" },
    description: { ar: "أبي اكزوست رياضي لفيراري 488، يفضل كابريستو أو أكرابوفيتش", en: "Looking for sport exhaust for Ferrari 488, prefer Capristo or Akrapovic" },
    category: "part", budget: 5000, status: "open",
    userWhatsapp: "+96500000019", userName: "أبو سعود", userId: "admin",
  },
  {
    title: { ar: "مطلوب نيسان سكايلاين R34 GT-R", en: "Wanted: Nissan Skyline R34 GT-R" },
    description: { ar: "أدور نيسان سكايلاين R34 GT-R، موديل 1999-2002، أي لون، الميزانية مفتوحة للحالة الممتازة", en: "Looking for Nissan Skyline R34 GT-R, 1999-2002, any color, open budget for excellent condition" },
    category: "car", budget: 100000, status: "open",
    userWhatsapp: "+96500000020", userName: "أبو عمر", userId: "admin",
  },
  {
    title: { ar: "مطلوب جنوط أصلية مكلارين 720S", en: "Wanted: OEM McLaren 720S Wheels" },
    description: { ar: "أبي جنوط أصلية مكلارين 720S، جديدة أو مستعملة بحالة ممتازة", en: "Looking for OEM McLaren 720S wheels, new or used in excellent condition" },
    category: "part", budget: 4000, status: "open",
    userWhatsapp: "+96500000021", userName: "أبو ناصر", userId: "admin",
  },
];

async function seed() {
  console.log("🏎️ بدأنا نضيف البيانات...\n");

  console.log("🚗 إضافة السيارات...");
  for (const car of cars) {
    await addDoc(collection(db, "cars"), { ...car, createdAt: Timestamp.now() });
    console.log(`  ✅ ${car.title.ar}`);
  }

  console.log("\n⚙️ إضافة قطع الغيار...");
  for (const part of parts) {
    await addDoc(collection(db, "parts"), { ...part, createdAt: Timestamp.now() });
    console.log(`  ✅ ${part.title.ar}`);
  }

  console.log("\n📋 إضافة الطلبات...");
  for (const req of requests) {
    await addDoc(collection(db, "requests"), { ...req, createdAt: Timestamp.now() });
    console.log(`  ✅ ${req.title.ar}`);
  }

  console.log("\n🎉 تم! البيانات اتضافت بنجاح!");
  console.log(`   🚗 ${cars.length} سيارة`);
  console.log(`   ⚙️ ${parts.length} قطعة غيار`);
  console.log(`   📋 ${requests.length} طلب`);
  process.exit(0);
}

seed().catch(console.error);
