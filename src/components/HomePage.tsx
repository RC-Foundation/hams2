import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Eye, AlertTriangle, Globe, TestTube } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSecurity } from '../contexts/SecurityContext';
import { motion } from 'framer-motion';

export const HomePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { securityScore, isSecureConnection } = useSecurity();

  const getSecurityColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Security Status Bar */}
      <div className={`w-full py-2 px-4 ${isSecureConnection ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border-b`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${isSecureConnection ? 'text-green-600' : 'text-red-600'}`} />
            <span className={isSecureConnection ? 'text-green-800' : 'text-red-800'}>
              {isSecureConnection ? 'اتصال آمن' : 'اتصال غير آمن'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">نقاط الأمان:</span>
            <span className={`font-bold ${getSecurityColor(securityScore)}`}>
              {securityScore}/100
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
          
          {/* Tor Access Link */}
          <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-800">{t('torAccess')}</span>
            </div>
            <code className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded">
              whisper7x3k2m9n4p.onion
            </code>
          </div>
        </motion.div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/report"
              className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mr-4">
                  {t('shareInfo')}
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                شارك المعلومات الحساسة بأمان تام مع ضمان عدم الكشف عن هويتك
              </p>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/verify"
              className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 group"
            >
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Eye className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mr-4">
                  {t('verification')}
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                تحقق من حالة التقارير المرسلة باستخدام الرقم المرجعي الآمن
              </p>
            </Link>
          </motion.div>
        </div>

        {/* Security Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-12"
        >
          <div className="flex items-center mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-600 ml-3" />
            <h2 className="text-2xl font-bold text-gray-900">إرشادات الأمان المهمة</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">قبل الإرسال</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-3 flex-shrink-0"></span>
                  استخدم متصفح Tor للحصول على أقصى حماية
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-3 flex-shrink-0"></span>
                  تأكد من استخدام شبكة Wi-Fi عامة أو VPN
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-3 flex-shrink-0"></span>
                  لا تستخدم أجهزة العمل أو الشخصية المعروفة
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">حماية البيانات</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 ml-3 flex-shrink-0"></span>
                  جميع البيانات مشفرة بتقنية PGP
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 ml-3 flex-shrink-0"></span>
                  إزالة تلقائية لبيانات EXIF من الصور
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 ml-3 flex-shrink-0"></span>
                  لا يتم حفظ عناوين IP أو بيانات التتبع
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-amber-800 text-sm">
              <strong>تذكر:</strong> نحن نعمل بجد لحماية هويتك، لكن أمانك الشخصي يبدأ من احتياطاتك الخاصة. 
              لا تشارك معلومات قد تكشف هويتك في النص.
            </p>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link
            to="/security"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            {t('securityGuide')}
          </Link>
          <Link
            to="/test"
            className="px-6 py-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            Test Suite
          </Link>
          <a
            href="https://www.torproject.org/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors font-medium"
          >
            تحميل متصفح Tor
          </a>
        </motion.div>
      </div>
    </div>
  );
};