"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, type User as FBUser } from "firebase/auth";
import { getDatabase, ref, onValue, remove, update } from "firebase/database";
import { getFirebasePublicConfig } from "@/lib/runtime-config";

const firebaseConfig = getFirebasePublicConfig();
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const ADMIN_EMAILS = ["admin@q8sportcar.com", "summit_kw@hotmail.com"];

type AppUser = { uid: string; name?: string; email?: string; phone?: string; whatsapp?: string; isAdmin?: boolean; isSuperAdmin?: boolean; disabled?: boolean; deletedAt?: any; createdAt?: any };
type Listing = { id: string; type: "car" | "part" | "request"; title: string; status: string; userName?: string; userId?: string; price?: number; createdAt?: number };

export default function AdminPage() {
  const [fbUser, setFbUser] = useState<FBUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"listings" | "users">("listings");
  const [listingFilter, setListingFilter] = useState<"all" | "car" | "part" | "request">("all");
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => onAuthStateChanged(auth, (u) => { setFbUser(u); setLoading(false); }), []);

  const isAdmin = fbUser && ADMIN_EMAILS.includes(fbUser.email || "");

  useEffect(() => {
    if (!isAdmin) return;

    const parseListing = (snap: any, type: "car" | "part" | "request"): Listing[] => {
      if (!snap.val()) return [];
      return Object.entries(snap.val()).map(([id, data]: any) => ({
        id, type,
        title: typeof data.title === "string" ? data.title : data.title?.ar || "بدون عنوان",
        status: data.status || (type === "request" ? "open" : "active"),
        userName: data.userName,
        userId: data.userId,
        price: data.price,
        createdAt: data.createdAt,
      }));
    };

    const unsubs: (() => void)[] = [];
    let allCars: Listing[] = [], allParts: Listing[] = [], allRequests: Listing[] = [];

    unsubs.push(onValue(ref(db, "cars"), (snap) => { allCars = parseListing(snap, "car"); setListings([...allCars, ...allParts, ...allRequests].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))); }));
    unsubs.push(onValue(ref(db, "parts"), (snap) => { allParts = parseListing(snap, "part"); setListings([...allCars, ...allParts, ...allRequests].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))); }));
    unsubs.push(onValue(ref(db, "requests"), (snap) => { allRequests = parseListing(snap, "request"); setListings([...allCars, ...allParts, ...allRequests].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))); }));
    unsubs.push(onValue(ref(db, "users"), (snap) => {
      if (!snap.val()) return;
      setUsers(Object.entries(snap.val()).map(([uid, data]: any) => ({ uid, ...data })));
    }));

    return () => unsubs.forEach((u) => u());
  }, [isAdmin]);

  const filteredListings = useMemo(() => {
    let list = listingFilter === "all" ? listings : listings.filter((l) => l.type === listingFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((l) => l.title.toLowerCase().includes(q) || l.userName?.toLowerCase().includes(q));
    }
    return list;
  }, [listings, listingFilter, search]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    return users.filter((u) => [u.name, u.email, u.phone, u.whatsapp].some((v) => v?.toLowerCase().includes(q)));
  }, [users, search]);

  if (loading) return <Center>جاري التحميل...</Center>;
  if (!fbUser) return <Center><Link href="/login" className="rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-bold text-white">سجّل دخولك أولاً</Link></Center>;
  if (!isAdmin) return <Center>ما عندك صلاحية إدارة</Center>;

  const handleDeleteListing = async (item: Listing) => {
    if (!confirm(`حذف: ${item.title}؟`)) return;
    const path = item.type === "car" ? "cars" : item.type === "part" ? "parts" : "requests";
    await remove(ref(db, `${path}/${item.id}`));
  };

  const handleToggleStatus = async (item: Listing) => {
    const path = item.type === "car" ? "cars" : item.type === "part" ? "parts" : "requests";
    const nextStatus = item.type === "request"
      ? (item.status === "open" ? "closed" : "open")
      : (item.status === "sold" ? "active" : "sold");
    await update(ref(db, `${path}/${item.id}`), { status: nextStatus, updatedAt: Date.now() });
  };

  const handleToggleAdmin = async (u: AppUser) => {
    if (u.isSuperAdmin) return;
    await update(ref(db, `users/${u.uid}`), { isAdmin: !u.isAdmin, updatedAt: Date.now() });
  };

  const handleToggleDisabled = async (u: AppUser) => {
    if (u.isSuperAdmin) return;
    await update(ref(db, `users/${u.uid}`), { disabled: !u.disabled, updatedAt: Date.now() });
  };

  const handleDeleteUser = async (u: AppUser) => {
    if (u.isSuperAdmin) return;
    if (!confirm(`حذف حساب ${u.name || u.email}؟ سيتم حذف كل إعلاناته.`)) return;
    // Mark as deleted
    await update(ref(db, `users/${u.uid}`), { deletedAt: Date.now(), disabled: true });
    // Delete their listings
    listings.filter((l) => l.userId === u.uid).forEach((l) => {
      const path = l.type === "car" ? "cars" : l.type === "part" ? "parts" : "requests";
      remove(ref(db, `${path}/${l.id}`));
    });
  };

  const carsCount = listings.filter((l) => l.type === "car").length;
  const partsCount = listings.filter((l) => l.type === "part").length;
  const requestsCount = listings.filter((l) => l.type === "request").length;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-6 sm:px-8">
      {/* Header */}
      <div className="mb-6 rounded-2xl border border-[var(--brand)]/20 bg-gradient-to-br from-[var(--brand-glow)] to-[var(--panel)] p-6">
        <p className="text-xs font-bold text-[var(--brand)]">ADMIN PANEL</p>
        <h1 className="mt-2 text-2xl font-black text-[var(--foreground)]">لوحة الإدارة</h1>
        <p className="mt-1 text-sm text-[var(--sand)]">{fbUser.email}</p>
        <div className="mt-4 flex gap-3">
          <StatBox value={carsCount} label="سيارات" />
          <StatBox value={partsCount} label="قطع" />
          <StatBox value={requestsCount} label="طلبات" />
          <StatBox value={users.length} label="مستخدمين" />
        </div>
      </div>

      {/* Main Tabs */}
      <div className="mb-4 flex gap-2">
        <TabBtn active={tab === "listings"} onClick={() => setTab("listings")}>📋 الإعلانات</TabBtn>
        <TabBtn active={tab === "users"} onClick={() => setTab("users")}>👥 المستخدمين</TabBtn>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-[var(--metal-border)] bg-[var(--metal)] px-4">
        <span>🔍</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..." className="w-full bg-transparent py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--sand)]/50 outline-none" />
      </div>

      {/* Listings Tab */}
      {tab === "listings" && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {(["all", "car", "part", "request"] as const).map((f) => (
              <button key={f} onClick={() => setListingFilter(f)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${listingFilter === f ? "bg-[var(--brand)] text-white" : "bg-[var(--metal)] border border-[var(--metal-border)] text-[var(--sand)]"}`}>
                {f === "all" ? `الكل (${listings.length})` : f === "car" ? `سيارات (${carsCount})` : f === "part" ? `قطع (${partsCount})` : `طلبات (${requestsCount})`}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredListings.map((item) => (
              <div key={`${item.type}-${item.id}`} className="rounded-xl border border-[var(--metal-border)] bg-[var(--panel)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="rounded bg-[var(--brand-glow)] border border-[var(--brand)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--brand)]">
                        {item.type === "car" ? "سيارة" : item.type === "part" ? "قطعة" : "مطلوب"}
                      </span>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${item.status === "active" || item.status === "open" ? "bg-[var(--mint)]/10 text-[var(--mint)]" : item.status === "sold" ? "bg-[var(--brand)]/10 text-[var(--brand)]" : "bg-[var(--sand)]/10 text-[var(--sand)]"}`}>
                        {item.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-[var(--foreground)] truncate">{item.title}</h3>
                    {item.userName && <p className="text-xs text-[var(--sand)] mt-1">{item.userName}</p>}
                    {item.price && <p className="text-sm font-bold text-[var(--brand)] mt-1">{Number(item.price).toLocaleString()} د.ك</p>}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => handleToggleStatus(item)} className="rounded-lg border border-[var(--metal-border)] bg-[var(--metal)] px-3 py-2 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--panel-soft)]">
                    {item.type === "request" ? (item.status === "open" ? "إغلاق" : "إعادة فتح") : (item.status === "sold" ? "تنشيط" : "تعليم كمباع")}
                  </button>
                  <button onClick={() => handleDeleteListing(item)} className="rounded-lg border border-[var(--brand)]/20 bg-[var(--brand)]/10 px-3 py-2 text-xs font-bold text-[var(--brand)] hover:bg-[var(--brand)]/20">
                    حذف
                  </button>
                </div>
              </div>
            ))}
            {filteredListings.length === 0 && <p className="py-10 text-center text-[var(--sand)]">لا توجد نتائج</p>}
          </div>
        </>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <div className="space-y-3">
          {filteredUsers.map((u) => (
            <div key={u.uid} className="rounded-xl border border-[var(--metal-border)] bg-[var(--panel)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-glow)] text-sm font-black text-[var(--brand)]">
                  {u.name?.[0] || u.email?.[0] || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[var(--foreground)]">{u.name || "بدون اسم"}</span>
                    {u.isSuperAdmin && <Badge color="brand">سوبر أدمن</Badge>}
                    {u.isAdmin && !u.isSuperAdmin && <Badge color="brand">أدمن</Badge>}
                    {u.disabled && <Badge color="yellow">معطل</Badge>}
                    {u.deletedAt && <Badge color="red">محذوف</Badge>}
                  </div>
                  <p className="text-xs text-[var(--sand)] truncate">{u.email}</p>
                  <p className="text-xs text-[var(--sand)]">{u.whatsapp || u.phone || ""}</p>
                </div>
              </div>
              {!u.isSuperAdmin && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => handleToggleAdmin(u)} className="rounded-lg border border-[var(--metal-border)] bg-[var(--metal)] px-3 py-2 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--panel-soft)]">
                    {u.isAdmin ? "سحب الإدارة" : "منح الإدارة"}
                  </button>
                  <button onClick={() => handleToggleDisabled(u)} className="rounded-lg border border-[var(--metal-border)] bg-[var(--metal)] px-3 py-2 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--panel-soft)]">
                    {u.disabled ? "تفعيل الحساب" : "تعطيل الحساب"}
                  </button>
                  <button onClick={() => handleDeleteUser(u)} className="rounded-lg border border-[var(--brand)]/20 bg-[var(--brand)]/10 px-3 py-2 text-xs font-bold text-[var(--brand)] hover:bg-[var(--brand)]/20">
                    حذف الحساب
                  </button>
                </div>
              )}
            </div>
          ))}
          {filteredUsers.length === 0 && <p className="py-10 text-center text-[var(--sand)]">لا توجد نتائج</p>}
        </div>
      )}
    </main>
  );
}

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-[var(--metal-border)] bg-[var(--metal)] px-4 py-3 text-center">
      <div className="text-lg font-black text-[var(--foreground)]">{value}</div>
      <div className="text-[10px] text-[var(--sand)]">{label}</div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-xl px-5 py-3 text-sm font-bold transition ${active ? "bg-[var(--brand)] text-white" : "bg-[var(--metal)] border border-[var(--metal-border)] text-[var(--sand)] hover:text-[var(--foreground)]"}`}>
      {children}
    </button>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: "brand" | "yellow" | "red" }) {
  const styles = {
    brand: "bg-[var(--brand)]/10 border-[var(--brand)]/20 text-[var(--brand)]",
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
    red: "bg-red-500/10 border-red-500/20 text-red-500",
  };
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${styles[color]}`}>{children}</span>;
}

function Center({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-[var(--foreground)]">{children}</main>;
}
