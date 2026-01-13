// دالة مساعدة لتنسيق التواريخ بالتقويم الميلادي
export const formatDateGregorian = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(dateString);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  };
  
  // استخدام التقويم الميلادي مع اللغة العربية
  return date.toLocaleDateString('ar-EG', { 
    calendar: 'gregory',
    ...defaultOptions
  });
};

// دالة لتنسيق التاريخ والوقت معاً
export const formatDateTimeGregorian = (dateString: string): string => {
  const date = new Date(dateString);
  
  return date.toLocaleDateString('ar-EG', { 
    calendar: 'gregory',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// دالة لتنسيق التاريخ المختصر (مثل: 28/09/2025)
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); // dd/mm/yyyy
};

// دالة لتنسيق التاريخ الطويل (مثل: 28 سبتمبر 2025)
export const formatDateLong = (dateString: string): string => {
  const date = new Date(dateString);
  
  return date.toLocaleDateString('ar-EG', { 
    calendar: 'gregory',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// دالة لتنسيق التاريخ بشكل نسبي (منذ يومين، منذ أسبوع، etc.)
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'اليوم';
  } else if (diffInDays === 1) {
    return 'أمس';
  } else if (diffInDays < 7) {
    return `منذ ${diffInDays} أيام`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? 'منذ أسبوع' : `منذ ${weeks} أسابيع`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? 'منذ شهر' : `منذ ${months} أشهر`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return years === 1 ? 'منذ سنة' : `منذ ${years} سنوات`;
  }
};

// دالة للحصول على الوقت المتبقي
export const getTimeRemaining = (endDate: string): string => {
  const now = new Date().getTime();
  const end = new Date(endDate).getTime();
  const distance = end - now;
  
  if (distance < 0) {
    return 'انتهى المزاد';
  }
  
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} يوم و ${hours} ساعة`;
  } else if (hours > 0) {
    return `${hours} ساعة و ${minutes} دقيقة`;
  } else {
    return `${minutes} دقيقة`;
  }
};

// دالة للحصول على التاريخ الحالي بالتقويم الميلادي
export const getCurrentDateGregorian = (): string => {
  return formatDateShort(new Date().toISOString());
};

// دالة لتحويل التاريخ إلى نص يمكن قراءته
export const formatDateReadable = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  // إذا كان التاريخ اليوم أو أمس، استخدم التاريخ النسبي
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays <= 1) {
    return formatRelativeDate(dateString);
  }
  
  // وإلا استخدم التاريخ الطويل
  return formatDateLong(dateString);
};