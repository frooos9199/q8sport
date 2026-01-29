import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';
import BurnoutLoader from '../../components/BurnoutLoader';

const ManageProductsScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    try {
      const params = {
        limit: 200,
        ...(filter !== 'ALL' ? { status: filter } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      };

      const res = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS, { params });
      const fetchedProducts = res.data.products || [];
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleApprove = async (productId) => {
    try {
      await apiClient.patch(API_CONFIG.ENDPOINTS.ADMIN_PRODUCT_APPROVE(productId));
      Alert.alert('تم', 'تم الموافقة على المنتج');
      fetchProducts();
    } catch (error) {
      Alert.alert('خطأ', 'فشل الموافقة على المنتج');
    }
  };

  const openEdit = (product) => {
    setEditing(product);
    setEditTitle(product?.title || '');
    setEditDescription(product?.description || '');
    setEditPrice(product?.price === null || product?.price === undefined ? '' : String(product.price));
  };

  const closeEdit = () => {
    setEditing(null);
    setEditTitle('');
    setEditDescription('');
    setEditPrice('');
  };

  const saveEdit = async () => {
    if (!editing) return;

    if (!editTitle.trim() || !editDescription.trim()) {
      Alert.alert('تنبيه', 'العنوان والوصف مطلوبان');
      return;
    }

    try {
      await apiClient.patch(API_CONFIG.ENDPOINTS.PRODUCT_DETAILS(editing.id), {
        title: editTitle.trim(),
        description: editDescription.trim(),
        price: editPrice.trim() ? Number(editPrice.trim()) : undefined,
      });
      Alert.alert('تم', 'تم تحديث المنتج');
      closeEdit();
      fetchProducts();
    } catch (error) {
      const msg = error?.response?.data?.error || 'فشل تحديث المنتج';
      Alert.alert('خطأ', msg);
    }
  };

  const deleteProductForever = (productId) => {
    Alert.alert('حذف المنتج', 'هل تريد حذف هذا المنتج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(API_CONFIG.ENDPOINTS.ADMIN_PRODUCT_DELETE(productId));
            setProducts(prev => prev.filter(p => p.id !== productId));
            Alert.alert('تم', 'تم حذف المنتج');
          } catch (error) {
            Alert.alert('خطأ', 'فشل حذف المنتج');
          }
        },
      },
    ]);
  };

  const filteredLocal = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return (products || []).filter((p) => {
      const haystack = [p.title, p.description, p.category, p.seller?.name || ''].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [products, search]);

  const parseImages = (images) => {
    try {
      if (!images) return null;
      if (typeof images === 'string' && images.startsWith('http')) return images;
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed[0] : null;
    } catch {
      return null;
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      {item.images ? (
        <Image source={{ uri: parseImages(item.images) }} style={styles.productImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>📦</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>{item.price} د.ك</Text>
        <Text style={styles.productSeller}>البائع: {item.seller?.name || '—'}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editButton} onPress={() => openEdit(item)}>
            <Text style={styles.buttonText}>✏️ تعديل</Text>
          </TouchableOpacity>

          {item.status === 'PENDING' ? (
            <>
              <TouchableOpacity style={styles.approveButton} onPress={() => handleApprove(item.id)}>
                <Text style={styles.buttonText}>✅ موافقة</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteProductForever(item.id)}>
                <Text style={styles.buttonText}>🗑 حذف</Text>
              </TouchableOpacity>
            </>
          ) : item.status === 'ACTIVE' ? (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteProductForever(item.id)}>
              <Text style={styles.buttonText}>🗑 حذف</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <BurnoutLoader text="جاري تحميل المنتجات..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="بحث في المنتجات..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => {
            setLoading(true);
            fetchProducts();
          }}
        />
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => {
            setLoading(true);
            fetchProducts();
          }}>
          <Text style={styles.searchBtnText}>بحث</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {['ALL', 'PENDING', 'ACTIVE'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'ALL' ? 'الكل' : f === 'PENDING' ? 'معلق' : 'نشط'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredLocal}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={closeEdit}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>تعديل المنتج</Text>

              <Text style={styles.label}>العنوان</Text>
              <TextInput
                style={styles.input}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="عنوان المنتج"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>الوصف</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="وصف المنتج"
                placeholderTextColor="#666"
                multiline
              />

              <Text style={styles.label}>السعر (د.ك)</Text>
              <TextInput
                style={styles.input}
                value={editPrice}
                onChangeText={setEditPrice}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={closeEdit}>
                  <Text style={styles.buttonText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveEdit}>
                  <Text style={styles.buttonText}>حفظ</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
    padding: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  filterButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  filterText: {
    color: '#999',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: 15,
  },
  productCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#2a2a2a',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 60,
  },
  productInfo: {
    padding: 15,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    color: '#DC2626',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productSeller: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    maxHeight: '85%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    color: '#999',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#374151',
  },
  saveBtn: {
    backgroundColor: '#10B981',
  },
});

export default ManageProductsScreen;
