'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthWrapper from '@/components/AuthWrapper';
import { formatDateShort } from '@/utils/dateUtils';
import { 
  Car, 
  ArrowLeft, 
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  MessageCircle,
  Eye
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinDate: string;
  status: 'active' | 'suspended' | 'pending';
  totalBids: number;
  totalSpent: number;
  isAdmin: boolean;
}

export default function UsersManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading users data
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          name: 'أحمد محمد',
          email: 'ahmed@example.com',
          phone: '+965 99887766',
          joinDate: '2025-01-15',
          status: 'active',
          totalBids: 25,
          totalSpent: 3500,
          isAdmin: false
        },
        {
          id: '2',
          name: 'فاطمة علي',
          email: 'fatima@example.com',
          phone: '+965 55443322',
          joinDate: '2025-02-10',
          status: 'active',
          totalBids: 18,
          totalSpent: 2200,
          isAdmin: false
        },
        {
          id: '3',
          name: 'محمد السالم',
          email: 'mohammed@example.com',
          joinDate: '2025-03-05',
          status: 'suspended',
          totalBids: 5,
          totalSpent: 800,
          isAdmin: false
        },
        {
          id: '4',
          name: 'الأدمن الرئيسي',
          email: 'summit_kw@hotmail.com',
          joinDate: '2024-12-01',
          status: 'active',
          totalBids: 0,
          totalSpent: 0,
          isAdmin: true
        },
        {
          id: '5',
          name: 'سارة أحمد',
          email: 'sara@example.com',
          phone: '+965 66554433',
          joinDate: '2025-03-20',
          status: 'pending',
          totalBids: 0,
          totalSpent: 0,
          isAdmin: false
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'suspended': return 'محظور';
      case 'pending': return 'في الانتظار';
      default: return 'غير معروف';
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} د.ك`;
  };

  const handleUserAction = (userId: string, action: string) => {
    console.log(`Action ${action} on user ${userId}`);
    // Implement user actions here
    setShowDropdown(null);
  };

  if (loading) {
    return (
      <AuthWrapper requireAuth={true} requireAdmin={true}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800 font-medium">جاري تحميل بيانات المستخدمين...</p>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/admin" className="flex items-center text-gray-800 hover:text-blue-600 ml-4">
                  <ArrowLeft className="h-5 w-5 ml-1" />
                  العودة
                </Link>
                <Car className="h-8 w-8 text-blue-600 ml-3" />
                <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 h-5 w-5" />
                <input
                  type="text"
                  placeholder="البحث عن مستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600 font-medium"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 h-5 w-5" />
                  <select
                    title="فلترة حسب الحالة"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="appearance-none pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  >
                    <option value="all">جميع المستخدمين</option>
                    <option value="active">النشطون</option>
                    <option value="suspended">المحظورون</option>
                    <option value="pending">في الانتظار</option>
                  </select>
                </div>
                
                <div className="text-sm text-gray-800 font-medium">
                  إجمالي: {filteredUsers.length} مستخدم
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                      المستخدم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                      تاريخ الانضمام
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                      النشاط
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {user.name}
                              {user.isAdmin && (
                                <span className="mr-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                  أدمن
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-800 font-medium">{user.email}</div>
                            {user.phone && (
                              <div className="text-sm text-gray-700 flex items-center">
                                <MessageCircle className="h-3 w-3 ml-1" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateShort(user.joinDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {getStatusText(user.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>المزايدات: {user.totalBids}</div>
                          <div className="text-green-600 font-medium">
                            الإنفاق: {formatCurrency(user.totalSpent)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="relative">
                          <button
                            title="إعدادات المستخدم"
                            onClick={() => setShowDropdown(showDropdown === user.id ? null : user.id)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          
                          {showDropdown === user.id && (
                            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
                              <div className="py-1">
                                <button
                                  onClick={() => handleUserAction(user.id, 'view')}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-right"
                                >
                                  <Eye className="h-4 w-4 ml-2" />
                                  عرض التفاصيل
                                </button>
                                <button
                                  onClick={() => handleUserAction(user.id, 'edit')}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-right"
                                >
                                  <Edit className="h-4 w-4 ml-2" />
                                  تحرير
                                </button>
                                {user.status === 'active' && !user.isAdmin && (
                                  <button
                                    onClick={() => handleUserAction(user.id, 'suspend')}
                                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-right"
                                  >
                                    <Ban className="h-4 w-4 ml-2" />
                                    حظر المستخدم
                                  </button>
                                )}
                                {user.status === 'suspended' && (
                                  <button
                                    onClick={() => handleUserAction(user.id, 'activate')}
                                    className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-right"
                                  >
                                    <CheckCircle className="h-4 w-4 ml-2" />
                                    إلغاء الحظر
                                  </button>
                                )}
                                {!user.isAdmin && (
                                  <button
                                    onClick={() => handleUserAction(user.id, 'delete')}
                                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-right"
                                  >
                                    <Trash2 className="h-4 w-4 ml-2" />
                                    حذف المستخدم
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-800 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مستخدمين</h3>
              <p className="text-gray-800">لم يتم العثور على مستخدمين مطابقين لمعايير البحث.</p>
            </div>
          )}
        </div>
      </div>
    </AuthWrapper>
  );
}