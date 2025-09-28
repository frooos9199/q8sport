'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthWrapper from '@/components/AuthWrapper';
import { formatDateShort, formatDateLong } from '@/utils/dateUtils';
import { 
  User, Car, Package, TrendingUp, Eye, Heart, Clock, 
  DollarSign, Plus, Edit, Trash2, Image as ImageIcon,
  Settings, MessageCircle, Award, Calendar, MapPin,
  Star, ShoppingBag, Gavel, Upload, X, Save
} from 'lucide-react';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  avatar?: string;
  rating: number;
  totalRatings: number;
  verified: boolean;
  stats: {
    totalSales: number;
    totalPurchases: number;
    activeBids: number;
    watchlist: number;
    completedAuctions: number;
    totalEarnings: number;
  };
}

interface UserItem {
  id: number;
  title: string;
  titleArabic: string;
  price: number;
  buyNowPrice?: number; // سعر الشراء المباشر مثل eBay
  type: 'auction' | 'buy-now' | 'both'; // نوع البيع
  condition: string;
  category: string;
  carBrand: string;
  carModel: string;
  carYear: string;
  images: string[];
  description: string;
  status: 'active' | 'sold' | 'ended' | 'draft';
  views: number;
  watchers: number;
  bidsCount?: number;
  timeLeft?: string;
  endTime?: string;
  createdAt: string;
  featured: boolean;
}

interface UserBid {
  id: number;
  auctionId: number;
  auctionTitle: string;
  bidAmount: number;
  maxBid: number;
  status: 'winning' | 'outbid' | 'won' | 'lost';
  timeLeft?: string;
  placedAt: string;
}

const sampleUser: UserProfile = {
  id: 1,
  name: 'أحمد محمد الخليفي',
  email: 'ahmed@example.com',
  phone: '+965 9999 9999',
  location: 'الكويت، حولي',
  joinDate: '2023-01-15',
  rating: 4.8,
  totalRatings: 156,
  verified: true,
  stats: {
    totalSales: 23,
    totalPurchases: 15,
    activeBids: 5,
    watchlist: 12,
    completedAuctions: 38,
    totalEarnings: 15750
  }
};

const sampleItems: UserItem[] = [
  {
    id: 1,
    title: 'V8 5.0L Coyote Engine - Ford Mustang GT',
    titleArabic: 'محرك V8 5.0 لتر - فورد موستنق GT',
    price: 2500,
    buyNowPrice: 3200,
    type: 'both',
    condition: 'مستعمل - ممتاز',
    category: 'المحرك',
    carBrand: 'Ford',
    carModel: 'Mustang',
    carYear: '2018',
    images: ['/engine1.jpg', '/engine2.jpg', '/engine3.jpg'],
    description: 'محرك أصلي بحالة ممتازة، مسافة 45,000 كم فقط',
    status: 'active',
    views: 247,
    watchers: 18,
    bidsCount: 12,
    timeLeft: '2d 5h',
    endTime: '2024-12-30T15:30:00',
    createdAt: '2024-12-25T10:00:00',
    featured: true
  },
  {
    id: 2,
    title: 'Brembo Brake Kit - Corvette Z06',
    titleArabic: 'طقم فرامل Brembo - كورفيت Z06',
    price: 0,
    buyNowPrice: 850,
    type: 'buy-now',
    condition: 'جديد',
    category: 'الفرامل',
    carBrand: 'Chevrolet',
    carModel: 'Corvette',
    carYear: '2020',
    images: ['/brakes1.jpg', '/brakes2.jpg'],
    description: 'طقم فرامل جديد أصلي من Brembo',
    status: 'active',
    views: 189,
    watchers: 25,
    createdAt: '2024-12-20T14:00:00',
    featured: false
  },
  {
    id: 3,
    title: 'Racing Exhaust System - Camaro SS',
    titleArabic: 'نظام عادم رياضي - كامارو SS',
    price: 450,
    type: 'auction',
    condition: 'مستعمل - جيد',
    category: 'العادم',
    carBrand: 'Chevrolet',
    carModel: 'Camaro',
    carYear: '2019',
    images: ['/exhaust1.jpg'],
    description: 'نظام عادم رياضي مستعمل بحالة جيدة',
    status: 'sold',
    views: 145,
    watchers: 8,
    bidsCount: 7,
    createdAt: '2024-12-18T09:00:00',
    featured: false
  }
];

const sampleBids: UserBid[] = [
  {
    id: 1,
    auctionId: 101,
    auctionTitle: 'طقم تيربو - موستنق 2020',
    bidAmount: 1200,
    maxBid: 1500,
    status: 'winning',
    timeLeft: '1d 8h',
    placedAt: '2024-12-28T10:30:00'
  },
  {
    id: 2,
    auctionId: 102,
    auctionTitle: 'علبة تروس أوتوماتيك - F-150',
    bidAmount: 800,
    maxBid: 950,
    status: 'outbid',
    timeLeft: '3h 20m',
    placedAt: '2024-12-28T14:15:00'
  },
  {
    id: 3,
    auctionId: 103,
    auctionTitle: 'مقاعد جلد - كورفيت C8',
    bidAmount: 2200,
    maxBid: 2200,
    status: 'won',
    placedAt: '2024-12-25T16:45:00'
  }
];

export default function UserProfilePage() {
  const [user, setUser] = useState<UserProfile>(sampleUser);
  const [userItems, setUserItems] = useState<UserItem[]>(sampleItems);
  const [userBids, setUserBids] = useState<UserBid[]>(sampleBids);
  const [activeTab, setActiveTab] = useState('items');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<UserItem | null>(null);

  const [newItem, setNewItem] = useState<Partial<UserItem>>({
    type: 'auction',
    condition: 'مستعمل',
    carBrand: 'Ford',
    images: []
  });

  const handleAddItem = () => {
    if (!newItem.titleArabic || !newItem.price || !newItem.description) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const item: UserItem = {
      id: Date.now(),
      title: newItem.titleArabic || '',
      titleArabic: newItem.titleArabic || '',
      price: newItem.price || 0,
      buyNowPrice: newItem.buyNowPrice,
      type: newItem.type as 'auction' | 'buy-now' | 'both',
      condition: newItem.condition || 'مستعمل',
      category: newItem.category || 'المحرك',
      carBrand: newItem.carBrand || 'Ford',
      carModel: newItem.carModel || 'Mustang',
      carYear: newItem.carYear || '2020',
      images: newItem.images || [],
      description: newItem.description || '',
      status: 'active',
      views: 0,
      watchers: 0,
      createdAt: new Date().toISOString(),
      featured: false
    };

    setUserItems([...userItems, item]);
    setShowAddModal(false);
    setNewItem({
      type: 'auction',
      condition: 'مستعمل',
      carBrand: 'Ford',
      images: []
    });
    alert('تم إضافة المنتج بنجاح!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'winning':
        return 'bg-green-100 text-green-800';
      case 'outbid':
        return 'bg-red-100 text-red-800';
      case 'won':
        return 'bg-blue-100 text-blue-800';
      case 'lost':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderUserStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <ShoppingBag className="h-6 w-6 text-blue-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900">{user.stats.totalSales}</p>
        <p className="text-sm text-gray-800 font-medium">مبيعات مكتملة</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <Gavel className="h-6 w-6 text-green-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900">{user.stats.totalPurchases}</p>
        <p className="text-sm text-gray-800 font-medium">مشتريات</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900">{user.stats.activeBids}</p>
        <p className="text-sm text-gray-800 font-medium">مزايدات نشطة</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900">{user.stats.watchlist}</p>
        <p className="text-sm text-gray-800 font-medium">قائمة المراقبة</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <Award className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
        <p className="text-lg font-bold text-gray-900">{user.rating}</p>
        <p className="text-sm text-gray-800 font-medium">التقييم</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
        <p className="text-lg font-bold text-gray-900">{user.stats.totalEarnings}</p>
        <p className="text-sm text-gray-800 font-medium">د.ك</p>
      </div>
    </div>
  );

  const renderUserItems = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">منتجاتي ({userItems.length})</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 ml-2" />
          إضافة منتج جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Image */}
            <div className="h-48 bg-gray-200 relative">
              {item.featured && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  مميز
                </div>
              )}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(item.status)}`}>
                  {item.status === 'active' ? 'نشط' : 
                   item.status === 'sold' ? 'مباع' :
                   item.status === 'ended' ? 'منتهي' : 'مسودة'}
                </span>
              </div>
              <div className="h-full flex items-center justify-center">
                <Car className="h-16 w-16 text-gray-400" />
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">
                {item.titleArabic}
              </h4>
              
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <span>{item.carBrand} {item.carModel}</span>
                <span className="mx-2">•</span>
                <span>{item.carYear}</span>
              </div>

              {/* Pricing */}
              <div className="mb-3">
                {item.type === 'auction' && (
                  <div>
                    <p className="text-sm text-gray-600">السعر الحالي</p>
                    <p className="text-xl font-bold text-green-600">{item.price} د.ك</p>
                    {item.timeLeft && (
                      <p className="text-sm text-red-600">ينتهي خلال {item.timeLeft}</p>
                    )}
                  </div>
                )}
                
                {item.type === 'buy-now' && (
                  <div>
                    <p className="text-sm text-gray-600">اشتري الآن</p>
                    <p className="text-xl font-bold text-blue-600">{item.buyNowPrice} د.ك</p>
                  </div>
                )}
                
                {item.type === 'both' && (
                  <div>
                    <p className="text-sm text-gray-600">مزايدة: {item.price} د.ك</p>
                    <p className="text-lg font-bold text-blue-600">
                      اشتري الآن: {item.buyNowPrice} د.ك
                    </p>
                    {item.timeLeft && (
                      <p className="text-sm text-red-600">ينتهي خلال {item.timeLeft}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span className="flex items-center">
                  <Eye className="h-4 w-4 ml-1" />
                  {item.views}
                </span>
                <span className="flex items-center">
                  <Heart className="h-4 w-4 ml-1" />
                  {item.watchers}
                </span>
                {item.bidsCount && (
                  <span className="flex items-center">
                    <Gavel className="h-4 w-4 ml-1" />
                    {item.bidsCount}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingItem(item)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  تعديل
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUserBids = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900">مزايداتي ({userBids.length})</h3>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase">المزاد</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase">مزايدتي</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase">الحد الأقصى</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase">الوقت المتبقي</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase">تاريخ المزايدة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {userBids.map((bid) => (
              <tr key={bid.id}>
                <td className="px-6 py-4">
                  <Link href={`/auctions/${bid.auctionId}`} className="text-blue-600 hover:text-blue-900">
                    {bid.auctionTitle}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">{bid.bidAmount} د.ك</td>
                <td className="px-6 py-4 text-sm text-gray-900">{bid.maxBid} د.ك</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getBidStatusColor(bid.status)}`}>
                    {bid.status === 'winning' ? 'فائز حالياً' :
                     bid.status === 'outbid' ? 'تم التفوق عليك' :
                     bid.status === 'won' ? 'فائز' : 'خاسر'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {bid.timeLeft || 'انتهى'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDateShort(bid.placedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAddItemModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">إضافة منتج جديد</h3>
            <button onClick={() => setShowAddModal(false)}>
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المنتج *</label>
                <input
                  type="text"
                  value={newItem.titleArabic || ''}
                  onChange={(e) => setNewItem({...newItem, titleArabic: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: محرك V8 فورد موستنق"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع البيع *</label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({...newItem, type: e.target.value as 'auction' | 'buy-now' | 'both'})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="auction">مزاد فقط</option>
                  <option value="buy-now">اشتري الآن فقط</option>
                  <option value="both">مزاد + اشتري الآن</option>
                </select>
              </div>

              {(newItem.type === 'auction' || newItem.type === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newItem.type === 'both' ? 'سعر بداية المزاد' : 'سعر البداية'} *
                  </label>
                  <input
                    type="number"
                    value={newItem.price || ''}
                    onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="1"
                  />
                </div>
              )}

              {(newItem.type === 'buy-now' || newItem.type === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر اشتري الآن *</label>
                  <input
                    type="number"
                    value={newItem.buyNowPrice || ''}
                    onChange={(e) => setNewItem({...newItem, buyNowPrice: parseFloat(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="1"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                <select
                  value={newItem.condition}
                  onChange={(e) => setNewItem({...newItem, condition: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="جديد">جديد</option>
                  <option value="جيد جداً">جيد جداً</option>
                  <option value="مستعمل">مستعمل</option>
                  <option value="يحتاج إصلاح">يحتاج إصلاح</option>
                </select>
              </div>
            </div>

            {/* Car Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ماركة السيارة</label>
                <select
                  value={newItem.carBrand}
                  onChange={(e) => setNewItem({...newItem, carBrand: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ford">Ford</option>
                  <option value="Chevrolet">Chevrolet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">موديل السيارة</label>
                <select
                  value={newItem.carModel}
                  onChange={(e) => setNewItem({...newItem, carModel: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Mustang">Mustang</option>
                  <option value="F-150">F-150</option>
                  <option value="Corvette">Corvette</option>
                  <option value="Camaro">Camaro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">سنة الصنع</label>
                <input
                  type="number"
                  value={newItem.carYear || ''}
                  onChange={(e) => setNewItem({...newItem, carYear: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="2020"
                  min="1950"
                  max="2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">فئة القطعة</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="المحرك">المحرك</option>
                  <option value="الفرامل">الفرامل</option>
                  <option value="التعليق">التعليق</option>
                  <option value="العادم">العادم</option>
                  <option value="الكهربائيات">الكهربائيات</option>
                  <option value="الداخلية">الداخلية</option>
                  <option value="الخارجية">الخارجية</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف التفصيلي *</label>
            <textarea
              value={newItem.description || ''}
              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="اكتب وصفاً مفصلاً للمنتج..."
            />
          </div>

          {/* Images Upload */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">صور المنتج</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">اضغط لرفع الصور أو اسحبها هنا</p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF حتى 10MB</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              onClick={handleAddItem}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              إضافة المنتج
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/" className="flex items-center ml-6 text-blue-600 hover:text-blue-700">
                  <Car className="h-8 w-8" />
                  <span className="mr-2 text-xl font-bold">مزادات قطع الغيار</span>
                </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/messages" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200" title="الرسائل">
                <MessageCircle className="h-5 w-5 text-gray-600" />
              </Link>
              <Link href="/settings" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200" title="الإعدادات">
                <Settings className="h-5 w-5 text-gray-600" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                {user.verified && (
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                    <Award className="h-4 w-4 ml-1" />
                    موثق
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4 text-gray-600 mb-3">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 ml-1" />
                  <span>{user.rating} ({user.totalRatings} تقييم)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 ml-1" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 ml-1" />
                  <span>عضو منذ {formatDateLong(user.joinDate)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  راسلني
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  متابعة
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {renderUserStats()}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('items')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'items'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                منتجاتي ({userItems.length})
              </button>
              <button
                onClick={() => setActiveTab('bids')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'bids'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                مزايداتي ({userBids.length})
              </button>
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'watchlist'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                قائمة المراقبة ({user.stats.watchlist})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'items' && renderUserItems()}
            {activeTab === 'bids' && renderUserBids()}
            {activeTab === 'watchlist' && (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">قائمة المراقبة فارغة</h3>
                <p className="text-gray-600">ابدأ بإضافة منتجات لمراقبتها</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {renderAddItemModal()}
    </div>
    </AuthWrapper>
  );
}