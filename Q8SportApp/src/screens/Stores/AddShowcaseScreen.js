import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';

const CAR_BRANDS = ['Ford', 'Chevrolet', 'Dodge', 'BMW', 'Mercedes', 'Porsche', 'Toyota', 'Nissan'];

const AddShowcaseScreen = ({ navigation, route }) => {
  const { token } = useAuth();
  const editMode = route?.params?.editMode || false;
  const showcaseData = route?.params?.showcaseData || null;
  const imagesString = route?.params?.imagesString || null;
  
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [carBrand, setCarBrand] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [horsepower, setHorsepower] = useState('');
  const [description, setDescription] = useState('');

  // Load existing data in edit mode
  useEffect(() => {
    if (editMode && showcaseData) {
      console.log('📝 Edit mode: Loading showcase data', showcaseData.id);
      
      // Parse images from imagesString
      let parsedImages = [];
      if (imagesString) {
        try {
          const imageUrls = typeof imagesString === 'string' 
            ? JSON.parse(imagesString) 
            : imagesString;
          
          // Filter HTTP URLs only (skip base64)
          const validUrls = Array.isArray(imageUrls) 
            ? imageUrls.filter(url => typeof url === 'string' && url.startsWith('http'))
            : [];
          
          parsedImages = validUrls.map(url => ({
            uri: url,
            base64: url,
            isExisting: true
          }));
          
          console.log('✅ Loaded images:', parsedImages.length);
        } catch (e) {
          console.error('Error parsing images:', e);
        }
      }
      
      setImages(parsedImages);
      setCarBrand(showcaseData.carBrand || '');
      setCarModel(showcaseData.carModel || '');
      setCarYear(showcaseData.carYear?.toString() || '');
      setHorsepower(showcaseData.horsepower?.toString() || '');
      setDescription(showcaseData.description || '');
    }
  }, [editMode, showcaseData, imagesString]);

  const pickImages = async () => {
    launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 10,
      quality: 0.7, // ✅ تقليل الجودة لتصغير الحجم
      maxWidth: 1200,
      maxHeight: 1200,
      includeBase64: true, // ✅ طلب base64 مباشرة
    }, async (response) => {
      if (response.assets && response.assets.length > 0) {
        try {
          const processedImages = [];
          
          for (const asset of response.assets) {
            // ✅ استخدام base64 من الـ asset مباشرة
            const base64 = asset.base64 
              ? `data:${asset.type};base64,${asset.base64}`
              : null;
            
            if (base64) {
              processedImages.push({
                uri: asset.uri, // للعرض المحلي
                base64, // للرفع
              });
              console.log(`✅ Processed image ${processedImages.length}/${response.assets.length}`);
            } else {
              console.warn('⚠️ Image without base64, skipping');
            }
          }
          
          const totalImages = [...images, ...processedImages].slice(0, 10);
          setImages(totalImages);
          console.log(`📸 Total images: ${totalImages.length}`);
        } catch (error) {
          console.error('❌ Error in pickImages:', error);
          Alert.alert('خطأ', 'فشل معالجة الصور');
        }
      }
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (images.length < 3) {
      Alert.alert('تنبيه', 'يجب إضافة 3 صور على الأقل');
      return;
    }

    if (!carBrand || !carModel || !carYear || !description) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);

    try {
      console.log(editMode ? '📝 Updating showcase data...' : '📤 Sending showcase data...');
      console.log(`📸 Total images to upload: ${images.length}`);
      
      // Extract base64/URLs from images
      const processedImages = images.map(img => {
        if (img.isExisting) {
          // Keep existing image URL as-is
          return img.base64;
        } else {
          // Use base64 for new images
          return img.base64;
        }
      });
      
      const showcaseDataToSend = {
        carBrand: carBrand || customBrand,
        carModel,
        carYear: parseInt(carYear),
        horsepower: horsepower ? parseInt(horsepower) : null,
        description,
        images: JSON.stringify(processedImages),
      };

      console.log('Showcase data prepared (images count):', processedImages.length);

      let response;
      if (editMode && showcaseData?.id) {
        // Update existing showcase
        response = await apiClient.put(
          `${API_CONFIG.ENDPOINTS.SHOWCASES}/${showcaseData.id}`,
          showcaseDataToSend
        );
      } else {
        // Create new showcase
        response = await apiClient.post(API_CONFIG.ENDPOINTS.SHOWCASES, showcaseDataToSend);
      }
      
      console.log('✅ Response:', response.data);

      setLoading(false);
      Alert.alert(
        editMode ? 'تم التحديث بنجاح! ✅' : 'تم الإرسال بنجاح! ✅',
        editMode 
          ? 'تم تحديث الكار شو بنجاح'
          : 'سيتم مراجعة عرضك من قبل الإدارة وسيظهر في التطبيق بعد الموافقة',
        [
          {
            text: 'حسناً',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      setLoading(false);
      console.error('❌ Error:', error);
      console.error('Error response:', error?.response?.data);
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'حدث خطأ أثناء الإرسال');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* تعليمات */}
        {!editMode && (
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              سيتم مراجعة عرضك من قبل الإدارة قبل نشره في التطبيق
            </Text>
          </View>
        )}

        {/* الصور */}
        <View style={styles.section}>
          <Text style={styles.label}>📸 صور السيارة *</Text>
          <Text style={styles.hint}>الحد الأدنى: 3 صور | الحد الأقصى: 10 صور</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
            {images.map((img, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}>
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            {images.length < 10 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                <Text style={styles.addImageIcon}>+</Text>
                <Text style={styles.addImageText}>إضافة صور</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* ماركة السيارة */}
        <View style={styles.section}>
          <Text style={styles.label}>🚗 ماركة السيارة *</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: Ford"
            placeholderTextColor="#666"
            value={carBrand === 'أخرى' ? customBrand : carBrand}
            onChangeText={(text) => {
              setCarBrand(text);
              setCustomBrand(text);
            }}
            editable={true}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <Text style={styles.hint}>أو اختر من القائمة:</Text>
          <View style={styles.brandsRow}>
            {CAR_BRANDS.filter(b => b !== 'أخرى').map(brand => (
              <TouchableOpacity
                key={brand}
                style={[
                  styles.brandChip,
                  carBrand === brand && styles.brandChipActive
                ]}
                onPress={() => {
                  setCarBrand(brand);
                  setCustomBrand('');
                }}>
                <Text style={[
                  styles.brandChipText,
                  carBrand === brand && styles.brandChipTextActive
                ]}>{brand}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* موديل السيارة */}
        <View style={styles.section}>
          <Text style={styles.label}>🏎️ موديل السيارة *</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: Mustang GT"
            placeholderTextColor="#666"
            value={carModel}
            onChangeText={setCarModel}
          />
        </View>

        {/* سنة الصنع */}
        <View style={styles.section}>
          <Text style={styles.label}>📅 سنة الصنع *</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: 2024"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={carYear}
            onChangeText={setCarYear}
            maxLength={4}
          />
        </View>

        {/* قوة المحرك */}
        <View style={styles.section}>
          <Text style={styles.label}>⚡ قوة المحرك (HP)</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: 500"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={horsepower}
            onChangeText={setHorsepower}
          />
        </View>

        {/* الوصف */}
        <View style={styles.section}>
          <Text style={styles.label}>📝 الوصف والتعديلات *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="اكتب وصف السيارة والتعديلات التي تم إجراؤها..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* زر الإرسال */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {editMode ? '✅ حفظ التعديلات' : '📤 إرسال للمراجعة'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          * الحقول المطلوبة
        </Text>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1a3a5c',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hint: {
    color: '#999',
    fontSize: 12,
    marginBottom: 12,
    marginTop: 8,
  },
  brandsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  brandChip: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  brandChipActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  brandChipText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  brandChipTextActive: {
    color: '#fff',
  },
  imagesScroll: {
    marginTop: 8,
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#DC2626',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DC2626',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageIcon: {
    fontSize: 32,
    color: '#DC2626',
    marginBottom: 4,
  },
  addImageText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pickerContainer: {
    display: 'none',
  },
  picker: {
    display: 'none',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
});

export default AddShowcaseScreen;
