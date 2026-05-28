"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { getFirebasePublicConfig } from "@/lib/runtime-config";

const firebaseConfig = getFirebasePublicConfig();
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const ADMIN_EMAILS = ["admin@q8sportcar.com", "summit_kw@hotmail.com"];

type Listing = { id: string; title: string; status?: string; userName?: string; createdAt?: number };

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<Listing[]>([]);
  const [parts, setParts] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<Listing[]>([]);
  const [tab, setTab] = useState<"cars" | "parts" | "requests">("cars");

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) return;

    const parse = (snap: any): Listing[] => {
      if (!snap.val()) return [];
      return Object.entries(snap.val()).map(([id, data]: any) => ({
        id,
        title: typeof data.title === "string" ? data.title : data.title?.ar || "بدون عنوان",
        status: data.status,
        userName: data.userName,
        createdAt: data.createdAt,
      })).reverse();
    };

    const unsub1 = onValue(ref(db, "cars"), (snap) => setCars(parse(snap)));
    const unsub2 = onValue(ref(db, "parts"), (snap) => setParts(parse(snap)));
    const unsub3 = onValue(ref(db, "requests"), (snap) => setRequests(parse(snap)));

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [user]);

  if (loading) return <Loading />;
  if (!user) return <NotAuthed message="سجّل دخولك أولاً" />;
  if (!ADMIN_EMAILS.includes(user.email || "")) return <NotAuthed message="ما عندك صلاحية إدارة" />;

  const handleDelete = async (collection: string, id: string) => {
    if (!confirm("متأكد تبي تحذف؟")) return;
    await remove(ref(db, `${collection}/${id}`));
  };

  const currentList = tab === "cars" ? cars : tab === "parts" ? parts : requests;
  const collectionName = tab;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-6 sm:px-8">
      {/* Header */}
      <div className="mb-8 rounded-2xl border border-[var(--metal-border)] bg-[var(--panel)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[var(--brand)]">ADMIN PANEL</p>
            <h1 className="mt-2 text-2xl font-black text-[var(--foreground)]">لوحة الإدارة</h1>
            <p className="mt-1 text-sm text-[var(--sand)]">{user.email}</p>
          </div>
          <div className="flex gap-3 text-center">
            <StatBox value={cars.length} label="سيارات" />
            <StatBox value={parts.length} label="قطع" />
            <StatBox value={requests.length} label="طلبات" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <TabBtn active={tab === "cars"} onClick={() => setTab("cars")}>🏎️ السيارات ({cars.length})</TabBtn>
        <TabBtn active={tab === "parts"} onClick={() => setTab("parts")}>⚙️ القطع ({parts.length})</TabBtn>
        <TabBtn active={tab === "requests"} onClick={() => setTab("requests")}>📋 الطلبات ({requests.length})</TabBtn>
      </div>

      {/* List */}
      {currentList.length === 0 ? (
        <div className="py-16 text-center text-[var(--sand)]">لا توجد عناصر</div>
      ) : (
        <div className="space-y-3">
          {currentList.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-[var(--metal-border)] bg-[var(--panel)] p-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[var(--foreground)] truncate">{item.title}</h3>
                <div className="mt-1 flex gap-3 text-xs text-[var(--sand)]">
                  {item.userName && <span>{item.userName}</span>}
                  {item.status && (
                    <span className={`rounded px-2 py-0.5 font-bold ${item.status === "active" || item.status === "open" ? "bg-[var(--mint)]/10 text-[var(--mint)]" : "bg-[var(--brand)]/10 text-[var(--brand)]"}`}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(collectionName, item.id)}
                className="mr-4 rounded-lg bg-[var(--brand)]/10 border border-[var(--brand)]/20 px-4 py-2 text-xs font-bold text-[var(--brand)] transition hover:bg-[var(--brand)]/20"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-[var(--metal-border)] bg-[var(--metal)] px-4 py-3">
      <div className="text-xl font-black text-[var(--foreground)]">{value}</div>
      <div className="text-xs text-[var(--sand)]">{label}</div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${active ? "bg-[var(--brand)] text-white" : "bg-[var(--metal)] border border-[var(--metal-border)] text-[var(--sand)] hover:text-[var(--foreground)]"}`}
    >
      {children}
    </button>
  );
}

function Loading() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <p className="text-[var(--sand)]">جاري التحميل...</p>
    </main>
  );
}

function NotAuthed({ message }: { message: string }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-lg font-bold text-[var(--foreground)]">{message}</p>
      <Link href="/login" className="rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-bold text-white">تسجيل الدخول</Link>
    </main>
  );
}
