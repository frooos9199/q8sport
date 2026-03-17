const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, doc, setDoc, Timestamp } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCmtlQSl1_5nKz7BHUD0ntOLEC9_4zcHxo",
  authDomain: "q8sportcar.firebaseapp.com",
  projectId: "q8sportcar",
  storageBucket: "q8sportcar.firebasestorage.app",
  messagingSenderId: "510621587144",
  appId: "1:510621587144:web:8d63dc54627c8704ab37fd",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
  const email = "admin@q8sportcar.com";
  const password = "Q8Sport@2026!";

  try {
    console.log("🔐 جاري إنشاء حساب الأدمن...\n");
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      name: "Q8 Sport Car Admin",
      email: email,
      phone: "+96500000000",
      whatsapp: "+96500000000",
      createdAt: Timestamp.now(),
    });

    console.log("✅ تم إنشاء حساب الأدمن بنجاح!");
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Password: ${password}`);
    process.exit(0);
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      console.log("⚠️ الحساب موجود مسبقاً!");
      console.log(`   📧 Email: ${email}`);
      console.log(`   🔑 Password: ${password}`);
    } else {
      console.error("❌ خطأ:", e.message);
    }
    process.exit(0);
  }
}

createAdmin();
