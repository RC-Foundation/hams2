import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Send, AlertCircle, CheckCircle, FileText, Image } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSecurity } from '../contexts/SecurityContext';
import { usePlatformSettings } from '../hooks/usePlatformSettings';
import { useDraftPersistence } from '../hooks/useDraftPersistence';
import { reportService } from '../services/reportService';
import { motion } from 'framer-motion';

export const ReportForm: React.FC = () => {
  const { t } = useLanguage();
  const { encryptData, generateSecureId, stripMetadata } = useSecurity();
  const { draftSettings } = usePlatformSettings();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    category: '',
    report: '',
    files: [] as File[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [referenceId, setReferenceId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Draft persistence for report text
  const { clearDraft } = useDraftPersistence(
    draftSettings,
    'report',
    formData.report,
    (value) => setFormData(prev => ({ ...prev, report: value }))
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const processedFiles: File[] = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت.');
        continue;
      }

      const cleanFile = await stripMetadata(file);
      processedFiles.push(cleanFile);
    }

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...processedFiles]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate reference ID
      const refId = generateSecureId();
      setReferenceId(refId);

      // Prepare report data
      const reportData = {
        id: refId,
        category: formData.category,
        report: formData.report,
        timestamp: new Date().toISOString(),
        fileCount: formData.files.length,
      };

      // Encrypt the report data
      const encryptedData = await encryptData(JSON.stringify(reportData));

      // Submit to backend
      const success = await reportService.submitReport({
        referenceId: refId,
        category: formData.category,
        encryptedReportData: encryptedData,
        files: formData.files
      });

      if (success) {
        // Clear form data and draft
        setFormData({ category: '', report: '', files: [] });
        clearDraft();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">تم الإرسال بنجاح</h2>
          <p className="text-gray-600 mb-6">
            تم تشفير تقريرك وإرساله بأمان إلى قاعدة البيانات. احتفظ بالرقم المرجعي التالي لمتابعة حالة التقرير:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <code className="text-lg font-mono text-blue-600">{referenceId}</code>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/verify')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              التحقق من الحالة
            </button>
            <button
              onClick={() => {
                setSubmitStatus('idle');
                setReferenceId('');
              }}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              إرسال تقرير جديد
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">مشاركة المعلومات</h1>
            <p className="text-gray-600">
              شارك معلوماتك بسرية تامة. جميع البيانات مشفرة ومحمية ومحفوظة بأمان.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                {t('category')}
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">اختر الفئة...</option>
                <option value="missing_people">{t('categories.missing_people')}</option>
                <option value="burial_sites">{t('categories.burial_sites')}</option>
                <option value="assets">{t('categories.assets')}</option>
                <option value="corruption">{t('categories.corruption')}</option>
                <option value="econ_corruption">{t('categories.econ_corruption')}</option>
                <option value="intel">{t('categories.intel')}</option>
              </select>
            </div>

            {/* Report Text */}
            <div>
              <label htmlFor="report" className="block text-sm font-medium text-gray-700 mb-2">
                {t('report')} *
              </label>
              <textarea
                id="report"
                required
                value={formData.report}
                onChange={(e) => setFormData(prev => ({ ...prev, report: e.target.value }))}
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="اكتب تفاصيل المعلومات التي تريد مشاركتها هنا... تجنب ذكر أسماء أو معلومات قد تكشف هويتك."
              />
              {draftSettings?.enabled && (
                <p className="text-xs text-gray-500 mt-1">
                  يتم حفظ المسودة تلقائياً لمدة {draftSettings.ttl_hours} ساعة
                </p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('uploadFiles')}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">اسحب الملفات هنا أو</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  اختر الملفات
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  الحد الأقصى: 10 ميجابايت لكل ملف. الأنواع المدعومة: صور، PDF، مستندات
                </p>
              </div>

              {/* File List */}
              {formData.files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        {file.type.startsWith('image/') ? (
                          <Image className="w-5 h-5 text-blue-600 ml-2" />
                        ) : (
                          <FileText className="w-5 h-5 text-gray-600 ml-2" />
                        )}
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500 mr-2">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        إزالة
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 ml-2 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">ملاحظة أمنية مهمة:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• سيتم تشفير جميع البيانات قبل الإرسال</li>
                    <li>• سيتم إزالة بيانات EXIF من الصور تلقائياً</li>
                    <li>• سيتم حفظ البيانات في قاعدة بيانات آمنة</li>
                    <li>• لا تذكر أسماء أو معلومات قد تكشف هويتك</li>
                    <li>• تأكد من استخدام اتصال آمن (Tor مفضل)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.report.trim()}
              className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                  جاري التشفير والإرسال...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 ml-2" />
                  {t('submitSecurely')}
                </>
              )}
            </button>
          </form>

          {submitStatus === 'error' && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 ml-2" />
                <p className="text-red-800">
                  حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};