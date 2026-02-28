import React, { useMemo, useState } from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { AuctionsService } from '../../services/api/auctions';
import API_CONFIG from '../../config/api';

const AddAuctionScreen = ({ navigation }) => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // { uri, type, name }

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'قطع غيار',
    carModel: '',
    carYear: '',
    condition: 'مستعملة',
    startingPrice: '',
    reservePrice: '',
    buyNowPrice: '',
    duration: '24', // hours
  });

  const canSubmit = useMemo(() => {
    return (
      isAuthenticated &&
      form.title.trim().length > 0 &&
      form.description.trim().length > 0 &&
      form.category.trim().length > 0 &&
      form.carModel.trim().length > 0 &&
      String(form.startingPrice).trim().length > 0 &&
      String(form.duration).trim().length > 0
    );
  }, [isAuthenticated, form]);

  const pickImages = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 1600,
        maxHeight: 1600,
        selectionLimit: Math.max(0, 5 - images.length),
        // لا حاجة لـ includeBase64 لأننا سنحول من URI لاحقاً
      },
      (response) => {
        if (response.didCancel) {
          console.log('📷 المستخدم ألغى اختيار الصور');
          return;
        }
        if (response.errorCode) {
          console.error('❌ خطأ في اختيار الصور:', response.errorMessage);
          Alert.alert('خطأ', 'فشل اختيار الصور');
          return;
        }
        if (response.assets && response.assets.length > 0) {
          console.log('📸 تم اختيار', response.assets.length, 'صورة');
          
          const picked = response.assets
            .filter((a) => a?.uri)
            .map((a) => {
              console.log('✅ صورة صالحة:', { hasUri: !!a.uri, type: a.type });
              return {
                uri: a.uri,
                type: a.type || 'image/jpeg',
                name: a.fileName || `auction_${Date.now()}_${Math.random().toString(16).slice(2)}.jpg`,
              };
            });
          
          console.log('📊 عدد الصور الصالحة:', picked.length);
          
          if (response.assets.length > 0 && picked.length === 0) {
            console.error('❌ جميع الصور لا تحتوي على URI!');
            Alert.alert(
              '⚠️ مشكلة في الصور',
              'لم نتمكن من تحميل الصور. جرب صور أخرى أو أكمل بدون صور.'
            );
            return;
          }
          
          setImages((prev) => [...prev, ...picked].slice(0, 5));
        }
      }
    );
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ تحويل URI إلى Base64 باستخدام XMLHttpRequest
  const convertUriToBase64 = async (uri, mimeType = 'image/jpeg') => {
    try {
      console.log('🔄 تحويل URI إلى Base64:', uri.substring(0, 50) + '...');
      
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
          const reader = new FileReader();
          reader.onloadend = function() {
            const base64String = reader.result;
            console.log('✅ تم التحويل بنجاح، الطول:', base64String ? base64String.length : 0);
            resolve(base64String);
          };
          reader.onerror = () => {
            console.error('❌ FileReader error');
            reject(new Error('FileReader failed'));
          };
          reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = () => {
          console.error('❌ XMLHttpRequest error');
          reject(new Error('XMLHttpRequest failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });
    } catch (error) {
      console.error('❌ فشل تحويل URI إلى Base64:', error);
      return null;
    }
  };

  // ✅ تحضير base64 images بدلاً من رفعها بـ FormData
  const prepareImages = async () => {
    console.log('🎨 تحضير الصور، العدد:', images.length);
    
    if (!images.length) {
      console.log('⚠️ لا توجد صور للتحضير');
      return [];
    }

    // 🔍 فحص كل صورة بالتفصيل
    images.forEach((img, idx) => {
      console.log(`🔍 صورة ${idx}:`, {
        hasUri: !!img.uri,
        hasBase64: !!img.base64,
        hasType: !!img.type,
        base64Preview: img.base64 ? img.base64.substring(0, 50) + '...' : 'MISSING'
      });
    });

    const base64ImagesPromises = images.map(async (img) => {
      // إذا كان base64 موجود مسبقاً، استخدمه
      if (img.base64) {
        console.log('✅ صورة لديها base64 جاهز');
        return img.base64;
      }
      
      // إذا لم يكن موجود، حوّل من URI
      console.log('🔄 صورة بدون base64، سيتم التحويل من URI...');
      const base64 = await convertUriToBase64(img.uri, img.type);
      return base64;
    });

    const base64Images = await Promise.all(base64ImagesPromises);
    
    // فلترة الصور الفاشلة (null)
    const validImages = base64Images.filter(img => img !== null);
    
    console.log('📤 عدد الصور المعدة للإرسال:', validImages.length, 'من أصل', images.length);
    return validImages;
  };

  const submit = async () => {
    if (!isAuthenticated) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }

    if (!canSubmit) {
      Alert.alert('تنبيه', 'يرجى تعبئة الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 بدء إرسال المزاد...');
      
      // ✅ تحضير الصور بدلاً من رفعها (الآن async)
      const base64Images = await prepareImages();
      
      // تحذير إذا اختار المستخدم صور لكنها فارغة
      if (images.length > 0 && base64Images.length === 0) {
        Alert.alert(
          '⚠️ مشكلة في الصور',
          'الصور التي اخترتها لا يمكن رفعها. جرّب اختيار صور مرة أخرى أو أكمل بدون صور.',
          [
            { text: 'حاول مرة أخرى', style: 'cancel', onPress: () => setLoading(false) },
            { text: 'أكمل بدون صور', onPress: () => submitWithImages([]) },
          ]
        );
        return;
      }
      
      await submitWithImages(base64Images);
    } catch (err) {
      console.error('❌ خطأ في إنشاء المزاد:', err);
      Alert.alert('خطأ', err?.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const submitWithImages = async (base64Images) => {
    console.log('📦 إنشاء payload مع', base64Images.length, 'صورة');
    
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      carModel: form.carModel,
      carYear: form.carYear ? parseInt(form.carYear) : null,
      condition: form.condition,
      startingPrice: form.startingPrice,
      reservePrice: form.reservePrice,
      buyNowPrice: form.buyNowPrice,
      duration: Number(form.duration),
      images: JSON.stringify(base64Images), // ✅ إرسال base64 كـ JSON string
    };
    
    console.log('🚀 إرسال المزاد للـ API...');

    const data = await AuctionsService.createAuction(payload);
    
    console.log('✅ تم إنشاء المزاد بنجاح!');
    Alert.alert('✅ نجح', 'تم إنشاء المزاد بنجاح', [
      {
        text: 'عرض مزاداتي',
        onPress: () => navigation.navigate('MyAuctions'),
      },
    ]);

    return data;
  };

  return (
    <KeyboardAvoidingScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>إضافة مزاد</Text>
        <Text style={styles.subTitle}>سيظهر في قسم المزادات وفي ملفك الشخصي</Text>
        {!!user?.name && <Text style={styles.userHint}>الناشر: {user.name}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>صور (اختياري)</Text>

        <View style={styles.imagesRow}>
          {images.map((img, idx) => (
            <View key={`${img.uri}-${idx}`} style={styles.imageWrap}>
              <Image source={{ uri: img.uri }} style={styles.image} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(idx)}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}

          {images.length < 5 && (
            <TouchableOpacity style={styles.addImageCard} onPress={pickImages}>
              <Ionicons name="camera-outline" size={28} color="#DC2626" />
              <Text style={styles.addImageText}>إضافة صور</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>معلومات المزاد</Text>

        <Text style={styles.label}>العنوان *</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: دفرنس"
          placeholderTextColor="#666"
          value={form.title}
          onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
        />

        <Text style={styles.label}>الوصف *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="اكتب وصفاً واضحاً للقطعة..."
          placeholderTextColor="#666"
          value={form.description}
          onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <Text style={styles.label}>التصنيف *</Text>
        <TextInput
          style={styles.input}
          placeholder="قطع غيار"
          placeholderTextColor="#666"
          value={form.category}
          onChangeText={(v) => setForm((p) => ({ ...p, category: v }))}
        />

        <Text style={styles.label}>موديل السيارة *</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: Camry"
          placeholderTextColor="#666"
          value={form.carModel}
          onChangeText={(v) => setForm((p) => ({ ...p, carModel: v }))}
        />

        <Text style={styles.label}>سنة الصنع (اختياري)</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: 2015"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={String(form.carYear || '')}
          onChangeText={(v) => setForm((p) => ({ ...p, carYear: v }))}
        />

        <Text style={styles.label}>الحالة (اختياري)</Text>
        <TextInput
          style={styles.input}
          placeholder="مستعملة"
          placeholderTextColor="#666"
          value={form.condition}
          onChangeText={(v) => setForm((p) => ({ ...p, condition: v }))}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>سعر البداية * (د.ك)</Text>
            <TextInput
              style={styles.input}
              placeholder="10"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={String(form.startingPrice)}
              onChangeText={(v) => setForm((p) => ({ ...p, startingPrice: v }))}
            />
          </View>
          <View style={styles.gap} />
          <View style={styles.col}>
            <Text style={styles.label}>مدة المزاد * (ساعات)</Text>
            <TextInput
              style={styles.input}
              placeholder="24"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={String(form.duration)}
              onChangeText={(v) => setForm((p) => ({ ...p, duration: v }))}
            />
          </View>
        </View>

        <Text style={styles.label}>سعر اشتر الآن (اختياري)</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: 50"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={String(form.buyNowPrice)}
          onChangeText={(v) => setForm((p) => ({ ...p, buyNowPrice: v }))}
        />

        <Text style={styles.label}>سعر الحد الأدنى (اختياري)</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: 20"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={String(form.reservePrice)}
          onChangeText={(v) => setForm((p) => ({ ...p, reservePrice: v }))}
        />

        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={submit}
          disabled={!canSubmit || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>إنشاء المزاد</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 16, paddingBottom: 100 },
  header: { marginBottom: 14 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  subTitle: { color: '#aaa', marginTop: 6 },
  userHint: { color: '#999', marginTop: 6 },
  section: { backgroundColor: '#111', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#222' },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  label: { color: '#ddd', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: '#000', borderWidth: 1, borderColor: '#333', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#fff' },
  textArea: { minHeight: 120 },
  imagesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  addImageCard: { width: 110, height: 110, borderRadius: 12, borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  addImageText: { color: '#aaa', marginTop: 6, fontSize: 12 },
  imageWrap: { width: 110, height: 110, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
  image: { width: '100%', height: '100%' },
  removeImageBtn: { position: 'absolute', top: 6, right: 6, backgroundColor: '#000000aa', borderRadius: 999, padding: 4 },
  row: { flexDirection: 'row', marginTop: 10 },
  col: { flex: 1 },
  gap: { width: 10 },
  submitBtn: { marginTop: 16, backgroundColor: '#DC2626', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default AddAuctionScreen;
