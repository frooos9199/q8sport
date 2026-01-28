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
import { Picker } from '@react-native-picker/picker';

const CAR_BRANDS = ['Ford', 'Chevrolet', 'Dodge', 'BMW', 'Mercedes', 'Porsche', 'Toyota', 'Nissan'];

const AddShowcaseScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [carBrand, setCarBrand] = useState('');
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

    // محاكاة الإرسال - سيتم استبداله بـ API call
    setTimeout(() => {
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
    }, 1500);
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
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={carBrand}
              onValueChange={setCarBrand}
              style={styles.picker}>
              <Picker.Item label="اختر الماركة" value="" />
              {CAR_BRANDS.map(brand => (
                <Picker.Item key={brand} label={brand} value={brand} />
              ))}
            </Picker>
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
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    height: 50,
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
