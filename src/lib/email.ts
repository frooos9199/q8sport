import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendWelcomeEmail = async (email: string, name: string) => {
  if (!resend) {
    console.warn('Resend not configured, skipping email');
    return;
  }
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Q8Sport <noreply@q8sportcar.com>',
      to: email,
      subject: 'مرحباً بك في Q8Sport 🚗',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background: #000; color: #fff;">
          <h1 style="color: #DC2626;">مرحباً ${name}! 👋</h1>
          <p>شكراً لانضمامك إلى Q8Sport - منصة قطع غيار السيارات الأمريكية</p>
          <p>يمكنك الآن:</p>
          <ul>
            <li>تصفح آلاف قطع الغيار</li>
            <li>إضافة منتجاتك للبيع</li>
            <li>التواصل مع البائعين</li>
          </ul>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background: #DC2626; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">
            ابدأ الآن
          </a>
        </div>
      `
    });
  } catch (error) {
    console.error('Email error:', error);
  }
};

export const sendProductApprovedEmail = async (email: string, productTitle: string) => {
  if (!resend) {
    console.warn('Resend not configured, skipping email');
    return;
  }
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Q8Sport <noreply@q8sportcar.com>',
      to: email,
      subject: '✅ تمت الموافقة على منتجك',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background: #000; color: #fff;">
          <h1 style="color: #10B981;">تمت الموافقة! ✅</h1>
          <p>تم قبول منتجك: <strong>${productTitle}</strong></p>
          <p>منتجك الآن متاح للعرض على الموقع</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" style="background: #DC2626; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">
            عرض منتجاتي
          </a>
        </div>
      `
    });
  } catch (error) {
    console.error('Email error:', error);
  }
};

export const sendProductSoldEmail = async (email: string, productTitle: string, price: number) => {
  if (!resend) {
    console.warn('Resend not configured, skipping email');
    return;
  }
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Q8Sport <noreply@q8sportcar.com>',
      to: email,
      subject: '🎉 تم بيع منتجك!',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background: #000; color: #fff;">
          <h1 style="color: #10B981;">مبروك! 🎉</h1>
          <p>تم بيع منتجك: <strong>${productTitle}</strong></p>
          <p>السعر: <strong>${price} د.ك</strong></p>
          <p>سيتم التواصل معك قريباً</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email error:', error);
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  if (!resend) {
    console.warn('Resend not configured, skipping email');
    return;
  }
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Q8Sport <noreply@q8sportcar.com>',
      to: email,
      subject: 'إعادة تعيين كلمة المرور',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background: #000; color: #fff;">
          <h1 style="color: #DC2626;">إعادة تعيين كلمة المرور 🔒</h1>
          <p>تلقينا طلباً لإعادة تعيين كلمة المرور</p>
          <a href="${resetUrl}" style="background: #DC2626; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">
            إعادة تعيين كلمة المرور
          </a>
          <p style="color: #999; margin-top: 20px;">الرابط صالح لمدة ساعة واحدة</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email error:', error);
  }
};

export default resend;
