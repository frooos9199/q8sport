import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../contexts/AuthContext';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    whatsapp: user?.whatsapp || user?.phone || '',
    bio: user?.bio || '',
  });

  const handleImagePick = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.7,
        includeBase64: true,
      },
      (response) => {
        if (response.didCancel) {
          console.log('📷 User cancelled image picker');
          return;
        }
        
        if (response.errorCode) {
          console.error('📷 ImagePicker Error:', response.errorMessage);
          Alert.alert('خطأ', 'فشل اختيار الصورة');
          return;
        }
        
        if (response.assets && response.assets[0]) {
          const imageData = response.assets[0];
          const base64Data = `data:image/jpeg;base64,${imageData.base64}`;
          
          // Check size (max 5MB for base64)
          if (base64Data.length > 5 * 1024 * 1024) {
            Alert.alert('خطأ', 'الصورة كبيرة جداً. يرجى اختيار صورة أصغر.');
            return;
          }
          
          console.log('✅ Image selected, size:', Math.round(base64Data.length / 1024), 'KB');
          
          setAvatar({
            uri: imageData.uri,
            base64: base64Data,
          });
        }
      }
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('خطأ', 'الاسم مطلوب');
      return;
    }

    setLoading(true);
    try {
      if (!updateProfile) {
        Alert.alert('خطأ', 'ميزة تحديث الملف الشخصي غير متوفرة');
        setLoading(false);
        return;
      }

      // تحضير البيانات للإرسال - السيرفر يحتاج email حتى لو ما تغير
      const updateData = {
        name: formData.name.trim(),
        email: user?.email, // إرسال email الحالي (مطلوب من السيرفر)
        phone: formData.phone?.trim() || null,
        whatsapp: formData.whatsapp?.trim() || null,
      };

      // إضافة الصورة إذا تم اختيارها
      if (avatar?.base64) {
        updateData.avatar = avatar.base64;
        console.log('📸 Sending avatar, size:', avatar.base64.length);
      }

      console.log('📤 Sending update data:', { ...updateData, avatar: updateData.avatar ? '[BASE64_DATA]' : undefined });

      const result = await updateProfile(updateData);

      if (!result?.success) {
        console.error('❌ Update failed:', result?.error);
        Alert.alert('خطأ', result?.error || 'حدث خطأ أثناء التحديث');
        return;
      }

      console.log('✅ Profile updated successfully');
      console.log('📸 New avatar:', result?.user?.avatar || 'No avatar returned');

      // Keep any local-only fields in sync (e.g., bio)
      if (updateUser) {
        await updateUser({
          bio: formData.bio,
        });
      }

      // Clear selected avatar since it's been uploaded
      setAvatar(null);

      Alert.alert('تم ✅', 'تم تحديث الملف الشخصي بنجاح', [
        { text: 'حسناً', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('خطأ', error?.message || 'حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handleImagePick} activeOpacity={0.7}>
          {avatar?.uri ? (
            <Image source={{ uri: avatar.uri }} style={styles.avatar} />
          ) : user?.avatar && typeof user.avatar === 'string' && user.avatar.trim() && (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? (
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || '👤'}
              </Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>✏️</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.changePhotoText}>
          {avatar ? '✅ صورة جديدة محددة' : 'اضغط لتغيير الصورة'}
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>الاسم *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="أدخل اسمك"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>البريد الإلكتروني</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.email}
            editable={false}
            placeholderTextColor="#666"
          />
          <Text style={styles.hint}>لا يمكن تغيير البريد الإلكتروني</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>رقم الهاتف</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="+965 XXXX XXXX"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>رقم الواتساب</Text>
          <TextInput
            style={styles.input}
            value={formData.whatsapp}
            onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
            placeholder="+965 XXXX XXXX"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>نبذة عنك</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            placeholder="اكتب نبذة مختصرة عنك..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>💾 حفظ التغييرات</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 50,
    color: '#fff',
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  editBadgeText: {
    fontSize: 18,
  },
  changePhotoText: {
    marginTop: 10,
    color: '#DC2626',
    fontSize: 14,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
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
  disabledInput: {
    backgroundColor: '#0a0a0a',
    color: '#666',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
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

export default EditProfileScreen;
