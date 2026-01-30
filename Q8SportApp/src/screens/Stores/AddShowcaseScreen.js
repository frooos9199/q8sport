import React, { useState } from 'react';
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
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import API_CONFIG from '../../config/api';

const CAR_BRANDS = ['Ford', 'Chevrolet', 'Dodge', 'BMW', 'Mercedes', 'Porsche', 'Toyota', 'Nissan'];

const AddShowcaseScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [carBrand, setCarBrand] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [horsepower, setHorsepower] = useState('');
  const [description, setDescription] = useState('');

  const pickImages = () => {
    launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 10,
      quality: 0.8,
    }, (response) => {
      if (response.assets) {
        const newImages = response.assets.map(asset => asset.uri);
        setImages([...images, ...newImages].slice(0, 10));
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
      console.log('📤 Uploading images first...');
      
      // رفع الصور أولاً
      const uploadedImageUrls = [];
      for (let i = 0; i < images.length; i++) {
        const imageUri = images[i];
        console.log(`📤 Uploading image ${i + 1}/${images.length}...`);
        console.log('Image URI:', imageUri);
        
        const formData = new FormData();
        
        // React Native FormData format
        const imageData = {
          uri: imageUri,
          type: 'image/jpeg',
          name: `showcase_${Date.now()}_${i}.jpg`,
        };
        
        console.log('Image data to upload:', imageData);
        formData.append('file', imageData);

        try {
          console.log('Sending request to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD}`);
          
          const uploadResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD}`, {
            method: 'POST',
            body: formData,
            // لا تضع Content-Type header - سيتم تعيينه تلقائياً
          });

          console.log('Upload response status:', uploadResponse.status);
          const responseText = await uploadResponse.text();
          console.log('Upload response text:', responseText);
          
          let uploadResult;
          try {
            uploadResult = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            throw new Error('استجابة غير صحيحة من السيرفر');
          }
          
          console.log('Upload result:', uploadResult);
          
          if (uploadResult.success && uploadResult.files && uploadResult.files.length > 0) {
            uploadedImageUrls.push(uploadResult.files[0]);
            console.log(`✅ Image ${i + 1} uploaded:`, uploadResult.files[0]);
          } else {
            console.error('Upload failed:', uploadResult);
            throw new Error(uploadResult.error || 'فشل رفع الصورة');
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`فشل رفع الصورة ${i + 1}: ${uploadError.message}`);
        }
      }

      console.log('📤 Sending showcase data with uploaded images...');
      
      const showcaseData = {
        carBrand: carBrand || customBrand,
        carModel,
        carYear: parseInt(carYear),
        horsepower: horsepower ? parseInt(horsepower) : null,
        description,
        images: JSON.stringify(uploadedImageUrls),
      };

      console.log('Showcase data:', showcaseData);

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.SHOWCASES, showcaseData);
      
      console.log('✅ Response:', response.data);

      setLoading(false);
      Alert.alert(
        'تم الإرسال بنجاح! ✅',
        'سيتم مراجعة عرضك من قبل الإدارة وسيظهر في التطبيق بعد الموافقة',
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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* تعليمات */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            سيتم مراجعة عرضك من قبل الإدارة قبل نشره في التطبيق
          </Text>
        </View>

        {/* الصور */}
        <View style={styles.section}>
          <Text style={styles.label}>📸 صور السيارة *</Text>
          <Text style={styles.hint}>الحد الأدنى: 3 صور | الحد الأقصى: 10 صور</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.imagePreview} />
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
            <Text style={styles.submitButtonText}>📤 إرسال للمراجعة</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          * الحقول المطلوبة
        </Text>
      </View>
    </ScrollView>
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
