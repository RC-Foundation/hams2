import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: 'ar' | 'fa' | 'en';
  setLanguage: (lang: 'ar' | 'fa' | 'en') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ar: {
    title: 'همس - منصة الإبلاغ المجهول',
    subtitle: 'همس: صوتك الآمن. شارك معلوماتك بسرية تامة ودون الكشف عن هويتك.',
    torAccess: 'الوصول عبر Tor',
    shareInfo: 'مشاركة المعلومات',
    category: 'الفئة (اختياري):',
    report: 'التقرير:',
    uploadFiles: 'تحميل الملفات:',
    submitSecurely: 'إرسال المعلومات بسرية تامة',
    securityGuide: 'دليل الأمان',
    verification: 'التحقق',
    panicButton: 'إخراج سريع',
    categories: {
      missing_people: 'بلاغات عن مفقودين أو مختطفين',
      burial_sites: 'مواقع دفن غير معروفة',
      assets: 'أصول وممتلكات مرتبطة بالنظام السابق',
      corruption: 'فساد في مؤسسات عامة (سابق أو حالي)',
      econ_corruption: 'فساد في قطاع الأعمال والشركات الخاصة',
      intel: 'معلومات أمنية أو استخباراتية غير عاجلة'
    },
    tip: {
      title: 'مشاركة المعلومات عبر تطبيقات آمنة',
      subtitle: 'لديك خيار التواصل معنا بشكل أكثر أماناً عبر واتساب أو سيجنال',
      whatsappTitle: 'التواصل عبر واتساب',
      whatsappBody: 'استخدم واتساب لإرسال رسائل مشفرة إلينا. تأكد من تعطيل النسخ الاحتياطي السحابي.',
      signalTitle: 'التواصل عبر سيجنال',
      signalBody: 'سيجنال يخزن بيانات أقل عن مستخدميه ويوفر رسائل ذاتية الاختفاء.'
    }
  },
  fa: {
    title: 'زمزمه - پلتفرم گزارش ناشناس',
    subtitle: 'زمزمه: صدای امن شما. اطلاعات خود را با کامل محرمانگی و بدون افشای هویت به اشتراک بگذارید.',
    torAccess: 'دسترسی از طریق Tor',
    shareInfo: 'اشتراک‌گذاری اطلاعات',
    category: 'دسته‌بندی (اختیاری):',
    report: 'گزارش:',
    uploadFiles: 'بارگذاری فایل‌ها:',
    submitSecurely: 'ارسال امن اطلاعات',
    securityGuide: 'راهنمای امنیت',
    verification: 'تأیید',
    panicButton: 'خروج اضطراری',
    categories: {
      missing_people: 'گزارش افراد مفقود یا ربوده شده',
      burial_sites: 'مکان‌های دفن ناشناخته',
      assets: 'دارایی‌ها و اموال مرتبط با رژیم قبلی',
      corruption: 'فساد در نهادهای عمومی (قبلی یا فعلی)',
      econ_corruption: 'فساد در بخش تجاری و شرکت‌های خصوصی',
      intel: 'اطلاعات امنیتی یا اطلاعاتی غیر فوری'
    },
    tip: {
      title: 'اشتراک‌گذاری اطلاعات از طریق پیام‌رسان‌های امن',
      subtitle: 'می‌توانید از واتس‌اپ یا سیگنال برای برقراری ارتباط امن استفاده کنید.',
      whatsappTitle: 'تماس از طریق واتس‌اپ',
      whatsappBody: 'پیام‌های واتس‌اپ رمزگذاری شده‌اند. پشتیبان‌گیری ابری را غیرفعال کنید.',
      signalTitle: 'تماس از طریق سیگنال',
      signalBody: 'سیگنال اطلاعات کمتری ذخیره می‌کند و امکان حذف خودکار پیام‌ها را دارد.'
    }
  },
  en: {
    title: 'Whisper - Anonymous Reporting Platform',
    subtitle: 'Whisper: Your secure voice. Share information with complete confidentiality without revealing your identity.',
    torAccess: 'Access via Tor',
    shareInfo: 'Share Information',
    category: 'Category (Optional):',
    report: 'Report:',
    uploadFiles: 'Upload Files:',
    submitSecurely: 'Submit Information Securely',
    securityGuide: 'Security Guide',
    verification: 'Verification',
    panicButton: 'Quick Exit',
    categories: {
      missing_people: 'Reports about missing or kidnapped persons',
      burial_sites: 'Unknown burial sites',
      assets: 'Assets and properties linked to previous regime',
      corruption: 'Corruption in public institutions (past or current)',
      econ_corruption: 'Corruption in business sector and private companies',
      intel: 'Non-urgent security or intelligence information'
    },
    tip: {
      title: 'Submit a Tip Securely',
      subtitle: 'You can reach us through encrypted WhatsApp or Signal messages.',
      whatsappTitle: 'Contact via WhatsApp',
      whatsappBody: 'Use WhatsApp to send encrypted messages. Disable cloud backups.',
      signalTitle: 'Contact via Signal',
      signalBody: 'Signal stores minimal metadata and supports disappearing messages.'
    }
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'ar' | 'fa' | 'en'>('ar');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};