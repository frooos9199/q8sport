import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';

const EditStoreScreen = ({ navigation }) => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState(null); // { uri, type, name }

  const currentShopImage = user?.shopImage || null;

  const canSave = useMemo(() => {
    return !!isAuthenticated && (!!picked || currentShopImage !== (user?.shopImage || null));
  }, [isAuthenticated, picked, currentShopImage, user?.shopImage]);

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.85,
        maxWidth: 1600,
        maxHeight: 1600,
        selectionLimit: 1,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('خطأ', 'فشل اختيار الصورة');
          return;
        }
        const asset = response.assets?.[0];
        if (!asset?.uri) return;
        setPicked({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name:
            asset.fileName || `shop_${Date.now()}_${Math.random().toString(16).slice(2)}.jpg`,
        });
      }
    );
  };

  const uploadImage = async () => {
    if (!picked) return null;

    const fd = new FormData();
    fd.append('images', {
      uri: picked.uri,
      type: picked.type,
      name: picked.name,
    });

    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD}`, {
      method: 'POST',
      body: fd,
    });

    const data = await res.json();
    if (!res.ok || !data?.success || !Array.isArray(data?.files)) {
      throw new Error(data?.error || 'فشل رفع الصورة');
    }

    return data.files[0] || null;
  };

  const save = async () => {
    if (!user) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول');
      return;
    }

    setLoading(true);
    try {
      const uploadedUrl = await uploadImage();

      const payload = {
        // update-profile endpoint currently requires name + email
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        whatsapp: user.whatsapp || null,
        shopImage: uploadedUrl || user.shopImage || null,
      };

      const res = await updateProfile(payload);
      if (!res?.success) {
        throw new Error(res?.error || 'فشل حفظ صورة المحل');
      }

      Alert.alert('تم', 'تم تحديث صورة المحل', [
        { text: 'موافق', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'حدث خطأ أثناء الحفظ';
      Alert.alert('خطأ', msg);
    } finally {
      setLoading(false);
    }
  };

  const previewUri = picked?.uri || currentShopImage;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>صورة المحل</Text>
        <Text style={styles.subtitle}>ستظهر على كرت المحل في قائمة المحلات</Text>
      </View>

      <View style={styles.previewWrap}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewPlaceholderText}>🏪</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.pickBtn} onPress={pickImage} disabled={loading}>
        <Text style={styles.pickBtnText}>اختيار صورة</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveBtn, (!canSave || loading) && styles.saveBtnDisabled]}
        onPress={save}
        disabled={!canSave || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>حفظ</Text>}
      </TouchableOpacity>

      <Text style={styles.hint}>
        ملاحظة: لو الصورة ما ظهرت مباشرة، اسحب للتحديث في صفحة المحلات.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 16 },
  header: { marginBottom: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#999', fontSize: 13 },

  previewWrap: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#111',
    marginBottom: 14,
  },
  previewImage: { width: '100%', height: 180, backgroundColor: '#111' },
  previewPlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  previewPlaceholderText: { fontSize: 64 },

  pickBtn: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  pickBtnText: { color: '#DC2626', fontWeight: '700', fontSize: 15 },

  saveBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.55 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  hint: { color: '#777', fontSize: 12, marginTop: 12, textAlign: 'center' },
});

export default EditStoreScreen;
