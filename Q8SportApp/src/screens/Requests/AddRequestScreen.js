import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API_CONFIG from '../../config/api';
import apiClient from '../../services/apiClient';
import { launchImageLibrary } from 'react-native-image-picker';

const AddRequestScreen = ({ navigation }) => {
  const { token, user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    carBrand: '',
    carModel: '',
    carYear: '',
    whatsapp: user?.whatsapp || user?.phone || '',
  });

  const normalizePhone = (phone) => {
    if (!phone) return '';
    return String(phone).replace(/[^0-9]/g, '');
  };

  const handlePickImages = () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 5,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.error) {
        Alert.alert('خطأ', 'فشل اختيار الصور');
        return;
      }
      if (response.assets) {
        setImages(response.assets.map(asset => asset.uri));
      }
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !token) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }

    if (!formData.title.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان الطلب');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال وصف الطلب');
      return;
    }

    const registeredWhatsapp = user?.whatsapp || user?.phone || '';
    const providedWhatsapp = formData.whatsapp || '';
    if (!registeredWhatsapp) {
      Alert.alert('خطأ', 'رقم الواتساب غير موجود في حسابك');
      return;
    }

    if (normalizePhone(registeredWhatsapp) !== normalizePhone(providedWhatsapp)) {
      Alert.alert('خطأ', 'رقم الواتساب يجب أن يطابق رقم الواتساب المسجل في الحساب');
      return;
    }

    setLoading(true);
    try {
      // Upload images first if any
      let uploadedImages = [];
      if (images.length > 0) {
        for (const imageUri of images) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'request-image.jpg',
          });

          const uploadResponse = await apiClient.post(API_CONFIG.ENDPOINTS.UPLOAD, uploadFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (uploadResponse.data.url) {
            uploadedImages.push(uploadResponse.data.url);
          }
        }
      }

      await apiClient.post(API_CONFIG.ENDPOINTS.REQUESTS, {
        title: formData.title,
        description: formData.description,
        carBrand: formData.carBrand,
        carModel: formData.carModel,
        carYear: formData.carYear,
        contactWhatsapp: formData.whatsapp,
        contactPhone: user?.phone || null,
        images: uploadedImages.length > 0 ? JSON.stringify(uploadedImages) : null,
      });

      Alert.alert('نجح', 'تم إضافة الطلب بنجاح', [
        {
          text: 'حسناً',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('❌ AddRequestScreen: Network/Parse error:', error);
      const message = error?.response?.data?.error || error?.response?.data?.message || error?.message;
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة الطلب: ' + (message || 'غير معروف'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {!isAuthenticated || !token ? (
        <View style={styles.notAuthContainer}>
          <Ionicons name="lock-closed-outline" size={80} color="#DC2626" />
          <Text style={styles.notAuthTitle}>يجب تسجيل الدخول</Text>
          <Text style={styles.notAuthText}>لإضافة طلب جديد</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات أساسية</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>عنوان الطلب *</Text>
              <TextInput
                style={styles.input}
                placeholder="مثال: مصد أمامي"
                placeholderTextColor="#666"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>وصف تفصيلي *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="اكتب وصفاً تفصيلياً للقطعة المطلوبة..."
                placeholderTextColor="#666"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>رقم الواتساب *</Text>
              <TextInput
                style={styles.input}
                placeholder="رقم الواتساب للتواصل"
                placeholderTextColor="#666"
                value={formData.whatsapp}
                editable={false}
                selectTextOnFocus={false}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الصور (اختياري)</Text>
              <TouchableOpacity style={styles.imagePickerButton} onPress={handlePickImages}>
                <Ionicons name="images-outline" size={24} color="#DC2626" />
                <Text style={styles.imagePickerText}>اختر الصور (حتى 5)</Text>
              </TouchableOpacity>
              
              {images.length > 0 && (
                <View style={styles.imagesPreview}>
                  {images.map((uri, index) => (
                    <View key={index} style={styles.imagePreviewContainer}>
                      <Image source={{ uri }} style={styles.imagePreview} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>معلومات السيارة (اختياري)</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ماركة السيارة</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: Toyota"
            placeholderTextColor="#666"
            value={formData.carBrand}
            onChangeText={(text) => setFormData({ ...formData, carBrand: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>موديل السيارة</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: Camry"
            placeholderTextColor="#666"
            value={formData.carModel}
            onChangeText={(text) => setFormData({ ...formData, carModel: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>سنة الصنع</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: 2015"
            placeholderTextColor="#666"
            value={formData.carYear}
            onChangeText={(text) => setFormData({ ...formData, carYear: text })}
            keyboardType="numeric"
          />
        </View>
      </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>إضافة الطلب</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  imagePickerButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#DC2626',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  imagePickerText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  imagesPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 10,
  },
  imagePreviewContainer: {
    width: 100,
    height: 100,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  notAuthTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  notAuthText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddRequestScreen;
