"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthWrapper from "@/components/AuthWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, MessageCircle, Search } from "lucide-react";

interface MessageUser {
  id: string;
  name: string;
  avatar: string | null;
}

interface MessageAuction {
  id: string;
  title: string;
  status: string;
}

interface MessageItem {
  id: string;
  content: string;
  type: string;
  read: boolean;
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender: MessageUser;
  receiver: MessageUser;
  auction: MessageAuction | null;
}

interface MessagesApiResponse {
  messages: MessageItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function Messages() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false);
        setMessages([]);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/messages?limit=50", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = (await res.json()) as Partial<MessagesApiResponse> & { error?: string };

        if (!res.ok) {
          throw new Error(data.error || "فشل جلب الرسائل");
        }

        setMessages(Array.isArray(data.messages) ? data.messages : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "فشل جلب الرسائل");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return messages;

    return messages.filter((m) => {
      const other = m.senderId === user?.id ? m.receiver : m.sender;
      return (
        m.content.includes(q) ||
        other?.name?.includes(q) ||
        (m.auction?.title?.includes(q) ?? false)
      );
    });
  }, [messages, search, user?.id]);

  return (
    <AuthWrapper requireAuth>
      <div className="min-h-screen bg-black">
        <header className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/profile" className="flex items-center text-gray-400 hover:text-white ml-4">
                  <ArrowLeft className="h-5 w-5 ml-1" />
                  العودة
                </Link>
                <MessageCircle className="h-8 w-8 text-red-600 ml-3" />
                <h1 className="text-2xl font-bold text-white">الرسائل</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث في الرسائل..."
                  className="w-full pr-10 pl-4 py-2 border border-gray-700 bg-black rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white placeholder-gray-400 font-medium"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-gray-300">جاري تحميل الرسائل...</div>
            ) : error ? (
              <div className="p-6 text-red-400">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-gray-300">لا توجد رسائل بعد.</div>
            ) : (
              <div className="divide-y divide-gray-800">
                {filtered.map((m) => {
                  const isMeSender = m.senderId === user?.id;
                  const other = isMeSender ? m.receiver : m.sender;
                  const createdAt = new Date(m.createdAt);

                  return (
                    <div key={m.id} className="p-4 hover:bg-gray-800/50 transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold truncate">{other?.name || "مستخدم"}</span>
                            <span className="text-xs text-gray-400">
                              {isMeSender ? "أرسلت" : "استلمت"}
                              {!m.read && !isMeSender ? " • غير مقروءة" : ""}
                            </span>
                          </div>
                          <p className="text-gray-300 mt-1">{m.content}</p>
                          {m.auction ? (
                            <div className="mt-2">
                              <Link
                                href={`/auctions/${m.auction.id}`}
                                className="text-sm text-red-400 hover:text-red-300"
                              >
                                مزاد: {m.auction.title}
                              </Link>
                            </div>
                          ) : null}
                        </div>

                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {Number.isNaN(createdAt.getTime()) ? "" : createdAt.toLocaleString("ar-KW")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthWrapper>
  );
}
