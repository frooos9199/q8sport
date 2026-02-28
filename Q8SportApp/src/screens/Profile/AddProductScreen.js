import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import KeyboardAvoidingScrollView from '../../components/KeyboardAvoidingScrollView';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';
import apiClient from '../../services/apiClient';
import Logger from '../../utils/logger';

const AddProductScreen = ({ navigation }) => {
  const { token, user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // { uri, type, name }
  const [currentStep, setCurrentStep] = useState(1);

  // تتبع حالة المصادقة
  useEffect(() => {
    console.log('📱 AddProductScreen mounted - Auth status:', {
      authLoading,
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!user,
      userName: user?.name,
    });
  }, [authLoading, isAuthenticated, token, user]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'parts',
    category: 'parts',
    brand: '',
    model: '',
    year: '',
    partCondition: 'used',
    phone: user?.phone || '', // Keep the phone in state but make it non-editable
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
      quality: 0.7,
      selectionLimit: 5 - images.length,
      includeBase64: true, // ✅ نحتاج base64 للرفع
    };

    launchImageLibrary(options, (response) => {
      console.log('📷 Image picker response:', {
        didCancel: response.didCancel,
        hasError: !!response.errorCode,
        errorCode: response.errorCode,
        assetsCount: response.assets?.length || 0
      });
      
      if (response.didCancel) {
        console.log('⚠️ User cancelled image picker');
        return;
      }
      
      if (response.errorCode) {
        console.error('❌ Image picker error:', response.errorCode, response.errorMessage);
        Alert.alert('خطأ', 'فشل اختيار الصورة');
        return;
      }
      
      if (response.assets) {
        console.log('📸 Processing', response.assets.length, 'assets...');
        
        response.assets.forEach((asset, i) => {
          console.log(`Asset ${i}:`, {
            hasUri: !!asset.uri,
            hasBase64: !!asset.base64,
            type: asset.type,
            fileName: asset.fileName,
            base64Length: asset.base64?.length || 0
          });
        });
        
        const newImages = response.assets
          .filter((asset) => {
            const valid = asset?.uri && asset?.base64;
            if (!valid) {
              console.warn('⚠️ Invalid asset, missing uri or base64');
            }
            return valid;
          })
          .map((asset) => ({
            uri: asset.uri, // للعرض في الشاشة
            base64: `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`, // للرفع
            type: asset.type || 'image/jpeg',
            name:
              asset.fileName ||
              `product_${Date.now()}_${Math.random().toString(16).slice(2)}.jpg`,
          }));
          
        console.log('✅ Selected', newImages.length, 'valid images');
        setImages((prev) => {
          const updated = [...prev, ...newImages].slice(0, 5);
          console.log('📦 Total images after update:', updated.length);
          return updated;
        });
      }
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const setAsMainImage = (index) => {
    setImages((prev) => {
      if (index <= 0 || index >= prev.length) return prev;
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      next.unshift(picked);
      return next;
    });
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        // الصور اختيارية للمنتجات (مثل المزادات)
        return true;
      case 2:
        if (!formData.title.trim()) {
          Alert.alert('تنبيه', 'يرجى إدخال عنوان المنتج');
          return false;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
          Alert.alert('تنبيه', 'يرجى إدخال سعر صحيح');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && images.length === 0) {
      Alert.alert('بدون صور؟', 'يمكنك الإكمال بدون صور، لكن يُفضّل إضافة صور لزيادة فرص البيع.', [
        { text: 'رجوع', style: 'cancel' },
        { text: 'إكمال', onPress: () => setCurrentStep(2) },
      ]);
      return;
    }

    if (validateStep(currentStep)) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const prepareImages = () => {
    console.log('🔍 prepareImages called, images count:', images.length);
    
    if (!images.length) {
      console.log('⚠️ No images to prepare');
      return [];
    }
    
    // طباعة معلومات كل صورة
    images.forEach((img, i) => {
      console.log(`Image ${i}:`, {
        hasUri: !!img.uri,
        hasBase64: !!img.base64,
        base64Preview: img.base64 ? img.base64.substring(0, 50) + '...' : 'MISSING'
      });
    });
    
    // استخراج base64 من الصور
    const base64Images = images
      .filter(img => {
        if (!img.base64) {
          console.warn('⚠️ Image missing base64, skipping');
          return false;
        }
        return true;
      })
      .map(img => img.base64);
    
    console.log('✅ Prepared', base64Images.length, 'base64 images out of', images.length);
    
    if (base64Images.length === 0 && images.length > 0) {
      console.error('❌ All images are missing base64 data!');
    }
    
    return base64Images;
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    // تحقق من وجود token قبل الإرسال
    if (!token || !user) {
      Logger.error('Auth failed - Missing credentials');
      Alert.alert(
        '⚠️ خطأ في المصادقة',
        'يبدو أن جلستك انتهت. يرجى تسجيل الدخول مرة أخرى',
        [
          {
            text: 'موافق',
            onPress: () => navigation.navigate('Profile'),
          },
        ]
      );
      return;
    }

    const submitProduct = async (forceEmptyImages = false) => {
      setLoading(true);

      try {
        console.log('📤 Starting product creation...');
        const base64Images = forceEmptyImages ? [] : prepareImages();
        console.log('✅ Images prepared, count:', base64Images.length);
        
        // تحذير إذا كان المستخدم أضاف صور ولكنها فارغة
        if (!forceEmptyImages && images.length > 0 && base64Images.length === 0) {
          setLoading(false);
          Alert.alert(
            '⚠️ مشكلة في الصور',
            'الصور التي اخترتها لا يمكن رفعها. حاول اختيار الصور مرة أخرى أو أكمل بدون صور.',
            [
              { text: 'حاول مرة أخرى', style: 'cancel' },
              { text: 'أكمل بدون صور', onPress: () => submitProduct(true) },
            ]
          );
          return;
        }

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
        images: JSON.stringify(base64Images), // ✅ إرسال base64 كـ JSON
      };

      console.log('📤 Sending product data to API...');
      await apiClient.post(API_CONFIG.ENDPOINTS.PRODUCTS, productData);
      console.log('✅ AddProductScreen: Product created successfully!');
      Alert.alert('✅ نجح', 'تم إضافة المنتج بنجاح', [
        {
          text: 'عرض منتجاتي',
          onPress: () => navigation.navigate('MyProducts'),
        },
      ]);
    } catch (error) {
      console.error('❌ AddProductScreen: Error occurred:', error);
      
      let errorMessage = 'حدث خطأ غير متوقع';
      
      // حاول الحصول على رسالة الخطأ من مصادر مختلفة
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('❌ خطأ', errorMessage, [
        { text: 'حاول مرة أخرى', style: 'default' },
      ]);
    } finally {
      setLoading(false);
    }
    };

    // استدعاء الدالة لإرسال المنتج
    await submitProduct();
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            currentStep >= step && styles.stepCircleActive
          ]}>
            <Text style={[
              styles.stepNumber,
              currentStep >= step && styles.stepNumberActive
            ]}>{step}</Text>
          </View>
          {step < 3 && (
            <View style={[
              styles.stepLine,
              currentStep > step && styles.stepLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>📷 أضف صور المنتج (اختياري)</Text>
      <Text style={styles.stepDescription}>
        أضف حتى 5 صور واضحة للمنتج من زوايا مختلفة
      </Text>

      <View style={styles.imagesGrid}>
        {images.map((image, index) => (
          <TouchableOpacity
            key={index}
            style={styles.imageWrapper}
            activeOpacity={0.85}
            onPress={() => setAsMainImage(index)}>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            {index === 0 && (
              <View style={styles.mainImageBadge}>
                <Text style={styles.mainImageBadgeText}>الرئيسية</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeImage(index)}>
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        {images.length < 5 && (
          <TouchableOpacity
            style={styles.addImageButton}
            onPress={handleImagePick}>
            <Text style={styles.addImageIcon}>📸</Text>
            <Text style={styles.addImageText}>إضافة صورة</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.imageCounter}>
        <Text style={styles.imageCounterText}>
          {images.length} / 5 صور
        </Text>
        {!!images.length && (
          <Text style={[styles.imageCounterText, { opacity: 0.8, marginTop: 4 }]}>اضغط على صورة لتكون الرئيسية</Text>
        )}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>📝 معلومات المنتج</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>عنوان المنتج *</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: قير موستنق 2015"
          placeholderTextColor="#666"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>الوصف</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="اكتب وصف تفصيلي للمنتج..."
          placeholderTextColor="#666"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>السعر (د.ك) *</Text>
        <View style={styles.priceInputContainer}>
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="0.000"
            placeholderTextColor="#666"
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text })}
            keyboardType="decimal-pad"
          />
          <Text style={styles.currencyLabel}>KWD</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>نوع المنتج</Text>
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
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>🔧 التفاصيل والحالة</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>الماركة</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: تويوتا"
          placeholderTextColor="#666"
          value={formData.brand}
          onChangeText={(text) => setFormData({ ...formData, brand: text })}
          editable={true}
          autoCapitalize="words"
          returnKeyType="next"
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
            placeholder="كامري"
            placeholderTextColor="#666"
            value={formData.model}
            onChangeText={(text) => setFormData({ ...formData, model: text })}
          />
        </View>

        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>السنة</Text>
          <TextInput
            style={styles.input}
            placeholder="2020"
            placeholderTextColor="#666"
            value={formData.year}
            onChangeText={(text) => setFormData({ ...formData, year: text })}
            keyboardType="number-pad"
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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>رقم الهاتف</Text>
        <TextInput
          style={styles.input}
          placeholder="+965 XXXX XXXX"
          placeholderTextColor="#666"
          value={formData.phone}
            editable={false}
            selectTextOnFocus={false}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  // عرض شاشة تحميل أثناء فحص المصادقة
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingScrollView
      style={styles.container}
      contentContainerStyle={styles.content}>
        
        {renderStepIndicator()}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.backButton]}
              onPress={prevStep}>
              <Text style={styles.backButtonText}>← السابق</Text>
            </TouchableOpacity>
          )}

          {currentStep < 3 ? (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={nextStep}>
              <Text style={styles.nextButtonText}>التالي →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>✓ نشر المنتج</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
    </KeyboardAvoidingScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  content: {
    padding: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  stepNumber: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#333',
    marginHorizontal: 5,
  },
  stepLineActive: {
    backgroundColor: '#DC2626',
  },
  stepContent: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
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
    backgroundColor: 'rgba(220, 38, 38, 0.92)',
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
    borderColor: '#DC2626',
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
    color: '#DC2626',
    fontWeight: '600',
  },
  imageCounter: {
    marginTop: 12,
    alignItems: 'center',
  },
  imageCounterText: {
    color: '#999',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
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
    color: '#DC2626',
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
    borderColor: '#DC2626',
    backgroundColor: '#DC262610',
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
    color: '#DC2626',
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
    borderColor: '#DC2626',
  },
  brandChipText: {
    color: '#DC2626',
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
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#DC2626',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#10B981',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddProductScreen;
