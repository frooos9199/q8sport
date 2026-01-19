import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';
import apiClient from '../../services/apiClient';

const EditProductScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const parseExistingImages = (images) => {
    try {
      if (!images) return [];
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed.map((uri, index) => ({ uri, id: index })) : [];
    } catch {
      return [];
    }
  };

  const [images, setImages] = useState(parseExistingImages(product.images)); // { uri, id, type?, name? }
  const [formData, setFormData] = useState({
    title: product.title || '',
    description: product.description || '',
    price: product.price?.toString() || '',
    type: product.productType?.toLowerCase() || 'parts',
    category: product.category || 'parts',
    brand: product.carBrand || '',
    model: product.carModel || '',
    year: product.carYear?.toString() || '',
    partCondition: product.condition?.toLowerCase() || 'used',
    phone: user?.phone || product.contactPhone || '',
  });

  const carTypes = [
    { label: '🚗 سيارة', value: 'car', icon: '🚗' },
    { label: '🔧 قطع غيار', value: 'parts', icon: '🔧' },
    { label: '✨ إكسسوارات', value: 'accessories', icon: '✨' },
  ];

  const conditions = [
    { label: 'جديد', value: 'new', color: '#10B981' },
    { label: 'مستعمل', value: 'used', color: '#F59E0B' },
    { label: 'مجدد', value: 'refurbished', color: '#3B82F6' },
  ];

  const popularBrands = [
    'تويوتا', 'نيسان', 'هوندا', 'شيفروليه', 'فورد', 
    'مرسيدس', 'بي ام دبليو', 'لكزس', 'كيا', 'هيونداي'
  ];

  const handleImagePick = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.85,
      selectionLimit: 5 - images.length,
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('خطأ', 'فشل اختيار الصورة');
        return;
      }
      if (response.assets) {
        const newImages = response.assets
          .filter((asset) => asset?.uri)
          .map((asset, index) => ({
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name:
              asset.fileName ||
              `product_${Date.now()}_${Math.random().toString(16).slice(2)}.jpg`,
            id: Date.now() + index,
          }));
        setImages((prev) => [...prev, ...newImages].slice(0, 5));
      }
    });
  };

  const removeImage = (id) => {
    setImages(images.filter(img => img.id !== id));
  };

  const setAsMainImage = (id) => {
    setImages((prev) => {
      const idx = prev.findIndex((x) => x.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      const [picked] = next.splice(idx, 1);
      next.unshift(picked);
      return next;
    });
  };

  const isLocalUri = (uri) => {
    if (!uri) return false;
    return uri.startsWith('file:') || uri.startsWith('content:');
  };

  const uploadImages = async (localImages) => {
    if (!localImages.length) return [];

    const fd = new FormData();
    for (const img of localImages) {
      fd.append('images', {
        uri: img.uri,
        type: img.type || 'image/jpeg',
        name: img.name || `product_${Date.now()}.jpg`,
      });
    }

    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD}`, {
      method: 'POST',
      body: fd,
    });

    const data = await res.json();
    if (!res.ok || !data?.success || !Array.isArray(data?.files)) {
      throw new Error(data?.error || 'فشل رفع الصور');
    }

    return data.files;
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال عنوان المنتج');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('تنبيه', 'يرجى إدخال سعر صحيح');
      return;
    }
    setLoading(true);

    try {
      const local = images.filter((img) => isLocalUri(img.uri));
      const remoteOrData = images
        .filter((img) => !isLocalUri(img.uri))
        .map((img) => img.uri);

      const uploaded = await uploadImages(local);
      const imageURIs = [...remoteOrData, ...uploaded];

      const typeMap = {
        'car': 'CAR',
        'parts': 'PART',
        'accessories': 'PART'
      };

      const conditionMap = {
        'new': 'NEW',
        'used': 'USED',
        'refurbished': 'REFURBISHED'
      };

      const productData = {
        title: formData.title,
        description: formData.description || '',
        price: parseFloat(formData.price),
        productType: typeMap[formData.type] || 'PART',
        category: formData.category,
        carBrand: formData.brand || null,
        carModel: formData.model || null,
        carYear: formData.year ? parseInt(formData.year) : null,
        condition: conditionMap[formData.partCondition] || 'USED',
        contactPhone: formData.phone || null,
        images: imageURIs,
      };

      await apiClient.patch(API_CONFIG.ENDPOINTS.PRODUCT_DETAILS(product.id), productData);

      Alert.alert('✅ نجح', 'تم تحديث المنتج بنجاح', [
        {
          text: 'موافق',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error updating product:', error);
      const message = error?.response?.data?.error || error?.response?.data?.message;
      Alert.alert('❌ خطأ', message || 'حدث خطأ أثناء تحديث المنتج');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✏️ تعديل المنتج</Text>
          <Text style={styles.headerSubtitle}>قم بتحديث معلومات منتجك</Text>
        </View>

        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📷 الصور</Text>
          <View style={styles.imagesGrid}>
            {images.map((image, index) => (
              <TouchableOpacity
                key={image.id}
                style={styles.imageWrapper}
                activeOpacity={0.85}
                onPress={() => setAsMainImage(image.id)}>
                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                {index === 0 && (
                  <View style={styles.mainImageBadge}>
                    <Text style={styles.mainImageBadgeText}>الرئيسية</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(image.id)}>
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            {images.length < 5 && (
              <TouchableOpacity 
                style={styles.addImageButton} 
                onPress={handleImagePick}>
                <Text style={styles.addImageIcon}>📸</Text>
                <Text style={styles.addImageText}>إضافة</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.helperText}>{images.length} / 5 صور</Text>
          {!!images.length && <Text style={styles.helperText}>اضغط على صورة لتكون الرئيسية</Text>}
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 المعلومات الأساسية</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>عنوان المنتج *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الوصف</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>السعر (د.ك) *</Text>
            <View style={styles.priceInputContainer}>
              <TextInput
                style={[styles.input, styles.priceInput]}
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="decimal-pad"
                placeholderTextColor="#666"
              />
              <Text style={styles.currencyLabel}>KWD</Text>
            </View>
          </View>
        </View>

        {/* Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏷️ نوع المنتج</Text>
          <View style={styles.typeGrid}>
            {carTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeCard,
                  formData.type === type.value && styles.typeCardActive,
                ]}
                onPress={() => setFormData({ ...formData, type: type.value })}>
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.typeLabel,
                  formData.type === type.value && styles.typeLabelActive,
                ]}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 التفاصيل</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الماركة</Text>
            <TextInput
              style={styles.input}
              value={formData.brand}
              onChangeText={(text) => setFormData({ ...formData, brand: text })}
              placeholder="مثال: تويوتا"
              placeholderTextColor="#666"
            />
            <View style={styles.brandsChips}>
              {popularBrands.slice(0, 6).map((brand) => (
                <TouchableOpacity
                  key={brand}
                  style={styles.brandChip}
                  onPress={() => setFormData({ ...formData, brand })}>
                  <Text style={styles.brandChipText}>{brand}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>الموديل</Text>
              <TextInput
                style={styles.input}
                value={formData.model}
                onChangeText={(text) => setFormData({ ...formData, model: text })}
                placeholder="كامري"
                placeholderTextColor="#666"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>السنة</Text>
              <TextInput
                style={styles.input}
                value={formData.year}
                onChangeText={(text) => setFormData({ ...formData, year: text })}
                placeholder="2020"
                keyboardType="number-pad"
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>حالة المنتج</Text>
            <View style={styles.conditionsGrid}>
              {conditions.map((condition) => (
                <TouchableOpacity
                  key={condition.value}
                  style={[
                    styles.conditionCard,
                    formData.partCondition === condition.value && {
                      ...styles.conditionCardActive,
                      borderColor: condition.color,
                      backgroundColor: condition.color + '15',
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, partCondition: condition.value })}>
                  <Text style={[
                    styles.conditionLabel,
                    formData.partCondition === condition.value && {
                      color: condition.color,
                      fontWeight: 'bold',
                    },
                  ]}>{condition.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 معلومات الاتصال</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>رقم الهاتف</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              editable={false}
              selectTextOnFocus={false}
              keyboardType="phone-pad"
              placeholder="+965 XXXX XXXX"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>إلغاء</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>✓ حفظ التعديلات</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
    width: 105,
    height: 105,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  mainImageBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: 'rgba(14, 165, 233, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  mainImageBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#DC2626',
    borderRadius: 15,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 105,
    height: 105,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0EA5E9',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  addImageIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  addImageText: {
    fontSize: 12,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priceInputContainer: {
    position: 'relative',
  },
  priceInput: {
    paddingRight: 60,
  },
  currencyLabel: {
    position: 'absolute',
    right: 14,
    top: 14,
    color: '#0EA5E9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  typeCardActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#0EA5E910',
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  typeLabel: {
    color: '#999',
    fontSize: 13,
    fontWeight: '600',
  },
  typeLabelActive: {
    color: '#0EA5E9',
  },
  brandsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  brandChip: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  brandChipText: {
    color: '#0EA5E9',
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  conditionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  conditionCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  conditionCardActive: {
    borderWidth: 2,
  },
  conditionLabel: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#0EA5E9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProductScreen;
