export type PublishType = 'car' | 'part' | 'request';

export type PublishPayload = {
  type: PublishType;
  sellerName: string;
  sellerWhatsapp: string;
  website?: string;
  title: string;
  description: string;
  imageUrls?: string[];
  brand?: string;
  model?: string;
  year?: string;
  price?: string;
  mileage?: string;
  color?: string;
  transmission?: 'automatic' | 'manual';
  fuelType?: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  category?: string;
  condition?: 'new' | 'used';
  compatibleBrands?: string[];
  budget?: string;
  requestCategory?: 'car' | 'part' | 'other';
};

export function digits(value: string) {
  return value.replace(/[^0-9]/g, '');
}

export function normalizeImages(imageUrls?: string[]) {
  return (imageUrls || []).map((url) => url.trim()).filter(Boolean).slice(0, 6);
}

export function validateCommon(payload: PublishPayload) {
  if ((payload.website || '').trim().length > 0) {
    return 'تعذر إرسال النموذج';
  }
  if (payload.sellerName.trim().length < 2) {
    return 'اسم المعلن قصير جدًا';
  }
  if (digits(payload.sellerWhatsapp).length < 8) {
    return 'رقم الواتساب غير صالح';
  }
  if (payload.title.trim().length < 3) {
    return 'عنوان الإعلان قصير جدًا';
  }
  if (payload.description.trim().length < 10) {
    return 'الوصف يحتاج تفاصيل أكثر';
  }
  if (payload.title.trim().length > 120) {
    return 'عنوان الإعلان أطول من اللازم';
  }
  if (payload.description.trim().length > 3000) {
    return 'الوصف أطول من اللازم';
  }
  return null;
}