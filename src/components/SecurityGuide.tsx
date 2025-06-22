import React from 'react';
import { Shield, Eye, Globe, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const SecurityGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">دليل الأمان الشامل</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            تعلم كيفية حماية هويتك وضمان أمانك عند مشاركة المعلومات الحساسة
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Tor Browser Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 p-3 rounded-lg ml-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">استخدام متصفح Tor</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">لماذا Tor؟</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 ml-2 flex-shrink-0" />
                    <span className="text-gray-700">يخفي عنوان IP الحقيقي</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 ml-2 flex-shrink-0" />
                    <span className="text-gray-700">يشفر حركة المرور عبر طبقات متعددة</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 ml-2 flex-shrink-0" />
                    <span className="text-gray-700">يمنع تتبع الموقع الجغرافي</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 ml-2 flex-shrink-0" />
                    <span className="text-gray-700">يحجب JavaScript والإضافات الخطيرة</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">خطوات التثبيت</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded ml-2 mt-0.5">1</span>
                    <span>قم بتحميل Tor من الموقع الرسمي torproject.org</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded ml-2 mt-0.5">2</span>
                    <span>تحقق من صحة التوقيع الرقمي للملف</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded ml-2 mt-0.5">3</span>
                    <span>قم بتثبيت المتصفح واتبع إعدادات الأمان</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded ml-2 mt-0.5">4</span>
                    <span>اختبر الاتصال على check.torproject.org</span>
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-purple-800 text-sm">
                <strong>رابط Onion الخاص بالمنصة:</strong> 
                <code className="bg-purple-100 px-2 py-1 rounded mr-2">whisper7x3k2m9n4p.onion</code>
              </p>
            </div>
          </motion.div>

          {/* VPN and Network Security */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-lg ml-4">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">أمان الشبكة</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-3">شبكات Wi-Fi العامة</h3>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>• استخدم مقاهي أو مكتبات عامة</li>
                  <li>• تجنب الشبكات التي تتطلب تسجيل</li>
                  <li>• لا تستخدم شبكة منزلك أو عملك</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3">خدمات VPN</h3>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• اختر خدمة لا تحتفظ بالسجلات</li>
                  <li>• ادفع بعملة مشفرة إن أمكن</li>
                  <li>• استخدم خوادم في دول مختلفة</li>
                </ul>
              </div>

              <div className="bg-amber-50 p-6 rounded-lg">
                <h3 className="font-semibold text-amber-800 mb-3">احتياطات إضافية</h3>
                <ul className="text-sm text-amber-700 space-y-2">
                  <li>• أطفئ Bluetooth و GPS</li>
                  <li>• استخدم وضع الطيران ثم Wi-Fi</li>
                  <li>• تجنب استخدام الهاتف الشخصي</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Device Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-3 rounded-lg ml-4">
                <Eye className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">أمان الجهاز</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">الأجهزة المناسبة</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 ml-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">جهاز كمبيوتر عام</p>
                      <p className="text-sm text-gray-600">مقهى إنترنت أو مكتبة عامة</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 ml-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">جهاز مؤقت</p>
                      <p className="text-sm text-gray-600">جهاز مستعمل يمكن التخلص منه</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 ml-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">نظام تشغيل محمول</p>
                      <p className="text-sm text-gray-600">Tails أو Linux من USB</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">ما يجب تجنبه</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-1 ml-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">الأجهزة الشخصية</p>
                      <p className="text-sm text-gray-600">هاتفك أو كمبيوترك الشخصي</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-1 ml-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">أجهزة العمل</p>
                      <p className="text-sm text-gray-600">أي جهاز مرتبط بهويتك المهنية</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-1 ml-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">الأجهزة المراقبة</p>
                      <p className="text-sm text-gray-600">أجهزة الشركة أو المؤسسة</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Information Security */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="flex items-center mb-6">
              <div className="bg-indigo-100 p-3 rounded-lg ml-4">
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">حماية المعلومات</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4">معلومات يجب تجنب ذكرها</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-red-700">
                    <li>• الأسماء الحقيقية (أشخاص أو أماكن)</li>
                    <li>• التواريخ المحددة</li>
                    <li>• أرقام الهواتف أو العناوين</li>
                    <li>• أسماء الشركات أو المؤسسات</li>
                  </ul>
                  <ul className="space-y-2 text-red-700">
                    <li>• التفاصيل الشخصية المميزة</li>
                    <li>• المناصب أو الوظائف المحددة</li>
                    <li>• أرقام الوثائق أو الهويات</li>
                    <li>• المعلومات المالية الشخصية</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">كيفية كتابة التقرير بأمان</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">استخدم أوصافاً عامة</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• "مسؤول كبير" بدلاً من الاسم</li>
                      <li>• "في أوائل 2023" بدلاً من التاريخ المحدد</li>
                      <li>• "منطقة شمال المدينة" بدلاً من الحي</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">ركز على الوقائع</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• اذكر ما حدث وليس من فعله</li>
                      <li>• صف الأحداث بتسلسل منطقي</li>
                      <li>• تجنب الآراء الشخصية</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Emergency Procedures */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-3 rounded-lg ml-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">إجراءات الطوارئ</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-4">إذا شعرت بالخطر</h3>
                <ol className="space-y-3 text-red-700">
                  <li className="flex items-start">
                    <span className="bg-red-200 text-red-800 text-sm font-medium px-2 py-1 rounded ml-2 mt-0.5">1</span>
                    <span>اضغط على زر "الخروج السريع" فوراً</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-red-200 text-red-800 text-sm font-medium px-2 py-1 rounded ml-2 mt-0.5">2</span>
                    <span>أغلق المتصفح وامسح التاريخ</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-red-200 text-red-800 text-sm font-medium px-2 py-1 rounded ml-2 mt-0.5">3</span>
                    <span>اترك المكان إذا كنت في مكان عام</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-red-200 text-red-800 text-sm font-medium px-2 py-1 rounded ml-2 mt-0.5">4</span>
                    <span>لا تعد لنفس المكان لفترة</span>
                  </li>
                </ol>
              </div>

              <div className="bg-amber-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-amber-800 mb-4">بعد الإرسال</h3>
                <ul className="space-y-3 text-amber-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5 ml-2 flex-shrink-0" />
                    <span>احتفظ بالرقم المرجعي في مكان آمن</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5 ml-2 flex-shrink-0" />
                    <span>لا تتحدث عن التقرير مع أحد</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5 ml-2 flex-shrink-0" />
                    <span>راقب أي تغيير في سلوك الآخرين</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5 ml-2 flex-shrink-0" />
                    <span>تحقق من حالة التقرير بحذر</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};