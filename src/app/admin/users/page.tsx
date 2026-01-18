'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthWrapper from '@/components/AuthWrapper';
import Link from 'next/link';
import { formatDateShort, formatDateLong } from '@/utils/dateUtils';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  role: 'USER' | 'SELLER' | 'SHOP_OWNER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  createdAt: string;
  lastLoginAt?: string;
  productCount: number;
  requestsCount: number;
  shopName?: string;
  shopAddress?: string;
  businessType?: string;
}

interface UserForm {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  password: string;
  role: 'USER' | 'SELLER' | 'SHOP_OWNER' | 'ADMIN';
  shopName?: string;
  shopAddress?: string;
  businessType?: string;
}

interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  role: User['role'];
  status: User['status'];
  createdAt: string;
  lastLoginAt?: string | null;
  shopName?: string | null;
  shopAddress?: string | null;
  businessType?: string | null;
  _count?: {
    products?: number;
    requests?: number;
  };
}

export default function UserManagement() {
  const { user: currentUser, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'password' | 'delete'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<UserForm>({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    password: '',
    role: 'USER'
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filterRole, filterStatus, debouncedSearchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      if (!token) {
        setUsers([]);
        setTotalUsers(0);
        return;
      }

      const params = new URLSearchParams();
      params.set('limit', '200');
      if (filterRole) params.set('role', filterRole);
      if (filterStatus) params.set('status', filterStatus);
      if (debouncedSearchTerm.trim()) params.set('search', debouncedSearchTerm.trim());

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Load users error:', data);
        throw new Error(data?.error || 'فشل تحميل المستخدمين');
      }

      const mapped: User[] = ((data.users || []) as ApiUser[]).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || undefined,
        whatsapp: u.whatsapp || undefined,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt || undefined,
        productCount: u._count?.products || 0,
        requestsCount: u._count?.requests || 0,
        shopName: u.shopName || undefined,
        shopAddress: u.shopAddress || undefined,
        businessType: u.businessType || undefined
      }));

      setUsers(mapped);
      setTotalUsers(data?.pagination?.total || mapped.length);
    } catch (error) {
      console.error('خطأ في تحميل المستخدمين:', error);
      alert('حدث خطأ في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === '' || user.role === filterRole;
    const matchesStatus = filterStatus === '' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Open Modal
  const openModal = (type: typeof modalType, user?: User) => {
    setModalType(type);
    setSelectedUser(user || null);
    
    if (type === 'edit' && user) {
      setUserForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
        password: '',
        role: user.role,
        shopName: user.shopName || '',
        shopAddress: user.shopAddress || '',
        businessType: user.businessType || ''
      });
    } else if (type === 'add') {
      setUserForm({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        password: '',
        role: 'USER'
      });
    }
    
    setNewPassword('');
    setConfirmPassword('');
    setShowModal(true);
  };

  // Close Modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setUserForm({
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      password: '',
      role: 'USER'
    });
    setNewPassword('');
    setConfirmPassword('');
  };

  // Add User
  const handleAddUser = async () => {
    try {
      if (!userForm.name || !userForm.email || !userForm.password) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      if (!token) {
        alert('يجب تسجيل الدخول أولاً');
        return;
      }

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: userForm.name,
          email: userForm.email,
          password: userForm.password,
          phone: userForm.phone || null,
          whatsapp: userForm.whatsapp || null,
          role: userForm.role,
          shopName: userForm.shopName || null,
          shopAddress: userForm.shopAddress || null,
          businessType: userForm.businessType || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || 'حدث خطأ في إضافة المستخدم');
        return;
      }

      closeModal();
      await loadUsers();
      alert('تم إضافة المستخدم بنجاح');
    } catch (error) {
      console.error('خطأ في إضافة المستخدم:', error);
      alert('حدث خطأ في إضافة المستخدم');
    }
  };

  // Edit User
  const handleEditUser = async () => {
    try {
      if (!selectedUser || !userForm.name || !userForm.email) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      if (!token) {
        alert('يجب تسجيل الدخول أولاً');
        return;
      }

      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          name: userForm.name,
          email: userForm.email,
          phone: userForm.phone || null,
          whatsapp: userForm.whatsapp || null,
          role: userForm.role,
          shopName: userForm.shopName || null,
          shopAddress: userForm.shopAddress || null,
          businessType: userForm.businessType || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || 'حدث خطأ في تحديث المستخدم');
        return;
      }

      closeModal();
      await loadUsers();
      alert('تم تحديث بيانات المستخدم بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث المستخدم:', error);
      alert('حدث خطأ في تحديث المستخدم');
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    try {
      if (!newPassword || !confirmPassword) {
        alert('يرجى إدخال كلمة المرور الجديدة وتأكيدها');
        return;
      }

      if (newPassword !== confirmPassword) {
        alert('كلمة المرور وتأكيدها غير متطابقين');
        return;
      }

      if (newPassword.length < 6) {
        alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
      }

      if (!selectedUser) {
        alert('لم يتم تحديد مستخدم');
        return;
      }

      if (!token) {
        alert('يجب تسجيل الدخول أولاً');
        return;
      }

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          password: newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || 'حدث خطأ في تغيير كلمة المرور');
        return;
      }

      closeModal();
      await loadUsers();
      alert('تم تغيير كلمة المرور بنجاح');
    } catch (error) {
      console.error('خطأ في تغيير كلمة المرور:', error);
      alert('حدث خطأ في تغيير كلمة المرور');
    }
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('لا يمكنك حذف حسابك الشخصي');
      return;
    }
    openModal('delete', user);
  };

  const confirmDeleteUser = async () => {
    try {
      if (!selectedUser) return;

      if (!token) {
        alert('يجب تسجيل الدخول أولاً');
        return;
      }

      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser.id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || 'حدث خطأ في حذف المستخدم');
        return;
      }

      closeModal();
      await loadUsers();
      alert(data?.message || 'تم حذف المستخدم بنجاح');
    } catch (error) {
      console.error('خطأ في حذف المستخدم:', error);
      alert('حدث خطأ في حذف المستخدم');
    }
  };

  const handleChangeStatus = (user: User, newStatus: User['status']) => {
    if (user.id === currentUser?.id) {
      alert('لا يمكنك تغيير حالة حسابك الشخصي');
      return;
    }
    const confirmed = confirm(`هل أنت متأكد من تغيير حالة المستخدم "${user.name}"؟`);
    if (!confirmed) return;

    (async () => {
      try {
        if (!token) {
          alert('يجب تسجيل الدخول أولاً');
          return;
        }

        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: user.id,
            status: newStatus
          })
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data?.error || 'فشل تغيير حالة المستخدم');
          return;
        }

        await loadUsers();
        alert('تم تغيير حالة المستخدم بنجاح');
      } catch (e) {
        console.error('Change status error:', e);
        alert('حدث خطأ في تغيير حالة المستخدم');
      }
    })();
  };

  const getRoleText = (role: User['role']) => {
    switch (role) {
      case 'ADMIN': return 'أدمن';
      case 'SHOP_OWNER': return 'صاحب محل';
      case 'SELLER': return 'بائع';
      case 'USER': return 'مستخدم';
      default: return 'غير معروف';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      case 'BANNED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: User['status']) => {
    switch (status) {
      case 'ACTIVE': return 'نشط';
      case 'SUSPENDED': return 'معلق';
      case 'BANNED': return 'محظور';
      default: return 'غير معروف';
    }
  };

  if (loading) {
    return (
      <AuthWrapper requireAuth={true} requireAdmin={true}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800">جاري تحميل المستخدمين...</p>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-black">
        <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/admin" className="flex items-center text-gray-400 hover:text-white ml-4 transition-colors">
                  ← العودة للوحة الإدارة
                </Link>
                <h1 className="text-2xl font-bold text-white mr-4">إدارة المستخدمين</h1>
              </div>
              <button
                onClick={() => openModal('add')}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                👤 إضافة مستخدم جديد
              </button>
            </div>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* البحث والفلاتر */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* البحث */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="البحث بالاسم أو البريد الإلكتروني..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-3 py-2 bg-black text-white border border-gray-700 rounded-lg focus:ring-red-600 focus:border-red-600"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>

              {/* فلتر الدور */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg focus:ring-red-600 focus:border-red-600"
                title="فلترة حسب الدور"
              >
                <option value="">جميع الأدوار</option>
                <option value="ADMIN">أدمن</option>
                <option value="SHOP_OWNER">صاحب محل</option>
                <option value="SELLER">بائع</option>
                <option value="USER">مستخدم</option>
              </select>

              {/* فلتر الحالة */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-lg focus:ring-red-600 focus:border-red-600"
                title="فلترة حسب الحالة"
              >
                <option value="">جميع الحالات</option>
                <option value="ACTIVE">نشط</option>
                <option value="SUSPENDED">معلق</option>
                <option value="BANNED">محظور</option>
              </select>

              {/* عدد النتائج */}
              <div className="flex items-center justify-center bg-gray-800 rounded-lg px-3 py-2">
                <span className="text-white font-medium">
                  {filteredUsers.length} من {totalUsers} مستخدم
                </span>
              </div>
            </div>
          </div>

          {/* جدول المستخدمين */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">المستخدم</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الدور</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">تاريخ الانضمام</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">آخر دخول</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">المنتجات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الطلبات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-red-900 rounded-full flex items-center justify-center ml-3">
                            <span className="text-red-400 font-semibold">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                            {user.phone && (
                              <p className="text-xs text-gray-500">{user.phone}</p>
                            )}
                            {user.whatsapp && user.whatsapp !== user.phone && (
                              <p className="text-xs text-gray-500">واتساب: {user.whatsapp}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-300">
                          {getRoleText(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {getStatusText(user.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {formatDateShort(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {user.lastLoginAt ? formatDateShort(user.lastLoginAt) : 'لم يسجل دخول'}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {user.productCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {user.requestsCount}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-red-400 hover:text-red-300 text-lg cursor-pointer"
                            title="عرض التفاصيل الكاملة"
                          >
                            👁️
                          </Link>
                          <Link
                            href={`/admin/users/${user.id}/products`}
                            className="text-blue-400 hover:text-blue-300 text-lg cursor-pointer"
                            title="عرض منتجات المستخدم"
                          >
                            📦
                          </Link>
                          <button
                            onClick={() => openModal('edit', user)}
                            className="text-green-400 hover:text-green-300 text-lg cursor-pointer"
                            title="تعديل"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => openModal('password', user)}
                            className="text-purple-400 hover:text-purple-300 text-lg"
                            title="تغيير كلمة المرور"
                          >
                            🔒
                          </button>
                          {user.status === 'ACTIVE' ? (
                            <>
                              <button
                                onClick={() => handleChangeStatus(user, 'SUSPENDED')}
                                className="text-yellow-400 hover:text-yellow-300 text-lg"
                                title="إيقاف مؤقت"
                              >
                                ⏸️
                              </button>
                              <button
                                onClick={() => handleChangeStatus(user, 'BANNED')}
                                className="text-red-400 hover:text-red-300 text-lg"
                                title="حظر"
                              >
                                ⚠️
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleChangeStatus(user, 'ACTIVE')}
                              className="text-green-600 hover:text-green-900 text-lg"
                              title="تفعيل"
                            >
                              ✅
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-900 text-lg"
                            title="حذف"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-600">لم يتم العثور على مستخدمين يطابقون معايير البحث</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">
                  {modalType === 'add' && 'إضافة مستخدم جديد'}
                  {modalType === 'edit' && 'تعديل المستخدم'}
                  {modalType === 'view' && 'تفاصيل المستخدم'}
                  {modalType === 'password' && 'تغيير كلمة المرور'}
                  {modalType === 'delete' && 'حذف المستخدم'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Add/Edit User Form */}
              {(modalType === 'add' || modalType === 'edit') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">الاسم *</label>
                      <input
                        type="text"
                        value={userForm.name}
                        onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 bg-black text-white border border-gray-700 rounded-lg focus:ring-red-600 focus:border-red-600"
                        placeholder="اسم المستخدم"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">البريد الإلكتروني *</label>
                      <input
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full p-2 bg-black text-white border border-gray-700 rounded-lg focus:ring-red-600 focus:border-red-600"
                        placeholder="example@domain.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">رقم الهاتف</label>
                      <input
                        type="tel"
                        value={userForm.phone}
                        onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full p-2 bg-black text-white border border-gray-700 rounded-lg focus:ring-red-600 focus:border-red-600"
                        placeholder="96565000000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">واتساب</label>
                      <input
                        type="tel"
                        value={userForm.whatsapp}
                        onChange={(e) => setUserForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                        className="w-full p-2 bg-black text-white border border-gray-700 rounded-lg focus:ring-red-600 focus:border-red-600"
                        placeholder="96565000000"
                      />
                    </div>
                    {modalType === 'add' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور *</label>
                        <input
                          type="password"
                          value={userForm.password}
                          onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="كلمة المرور"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        title="اختر دور المستخدم"
                      >
                        <option value="USER">مستخدم</option>
                        <option value="SELLER">بائع</option>
                        <option value="SHOP_OWNER">صاحب محل</option>
                        <option value="ADMIN">أدمن</option>
                      </select>
                    </div>
                  </div>

                  {/* Shop Owner Fields */}
                  {userForm.role === 'SHOP_OWNER' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">معلومات المحل</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">اسم المحل</label>
                          <input
                            type="text"
                            value={userForm.shopName}
                            onChange={(e) => setUserForm(prev => ({ ...prev, shopName: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="اسم المحل"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">نوع النشاط</label>
                          <input
                            type="text"
                            value={userForm.businessType}
                            onChange={(e) => setUserForm(prev => ({ ...prev, businessType: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="قطع غيار السيارات"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المحل</label>
                          <textarea
                            value={userForm.shopAddress}
                            onChange={(e) => setUserForm(prev => ({ ...prev, shopAddress: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                            placeholder="العنوان الكامل للمحل"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={modalType === 'add' ? handleAddUser : handleEditUser}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      💾 {modalType === 'add' ? 'إضافة' : 'تحديث'}
                    </button>
                  </div>
                </div>
              )}

              {/* View User Details */}
              {modalType === 'view' && selectedUser && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">الاسم</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.phone || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">واتساب</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.whatsapp || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">الدور</label>
                      <p className="mt-1 text-sm text-gray-900">{getRoleText(selectedUser.role)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">الحالة</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                        {getStatusText(selectedUser.status)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">تاريخ الانضمام</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDateLong(selectedUser.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">آخر دخول</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedUser.lastLoginAt ? formatDateLong(selectedUser.lastLoginAt) : 'لم يسجل دخول'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">عدد المنتجات</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.productCount}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">عدد المطلوبات</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.requestsCount}</p>
                    </div>
                  </div>

                  {/* Shop Information */}
                  {selectedUser.role === 'SHOP_OWNER' && (selectedUser.shopName || selectedUser.shopAddress) && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">معلومات المحل</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedUser.shopName && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">اسم المحل</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedUser.shopName}</p>
                          </div>
                        )}
                        {selectedUser.businessType && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">نوع النشاط</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedUser.businessType}</p>
                          </div>
                        )}
                        {selectedUser.shopAddress && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">عنوان المحل</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedUser.shopAddress}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Change Password */}
              {modalType === 'password' && selectedUser && (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      🔒 تغيير كلمة المرور للمستخدم: <strong>{selectedUser.name}</strong>
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="كلمة المرور الجديدة"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="تأكيد كلمة المرور"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleChangePassword}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      🔒 تغيير كلمة المرور
                    </button>
                  </div>
                </div>
              )}

              {/* Delete Confirmation */}
              {modalType === 'delete' && selectedUser && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="text-red-600 text-2xl ml-3">⚠️</div>
                      <div>
                        <h4 className="text-red-800 font-medium">تحذير: حذف المستخدم</h4>
                        <p className="text-red-700 text-sm mt-1">
                          هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بيانات المستخدم نهائياً.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-900">هل أنت متأكد من حذف المستخدم التالي؟</p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{selectedUser.name}</p>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                      <p className="text-sm text-gray-600">الدور: {getRoleText(selectedUser.role)}</p>
                      <p className="text-sm text-gray-600">المنتجات: {selectedUser.productCount} | المطلوبات: {selectedUser.requestsCount}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={confirmDeleteUser}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      🗑️ حذف نهائياً
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthWrapper>
  );
}
