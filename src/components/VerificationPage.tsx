import React, { useState } from 'react';
import { Search, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { reportService } from '../services/reportService';
import { motion } from 'framer-motion';

export const VerificationPage: React.FC = () => {
  const [referenceId, setReferenceId] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceId.trim()) return;

    setIsSearching(true);
    setNotFound(false);
    
    try {
      const result = await reportService.verifyReport(referenceId.trim());
      
      if (result) {
        setVerificationResult({
          id: result.report.reference_id,
          status: result.report.status,
          timestamp: result.report.created_at,
          category: result.report.category,
          updates: result.updates.map(update => ({
            date: new Date(update.created_at).toLocaleDateString('ar-SA'),
            status: update.status,
            message: update.message
          }))
        });
      } else {
        setNotFound(true);
        setVerificationResult(null);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setNotFound(true);
      setVerificationResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'under_review':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'investigating':
        return <Eye className="w-5 h-5 text-orange-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received':
        return 'تم الاستلام';
      case 'under_review':
        return 'قيد المراجعة';
      case 'investigating':
        return 'قيد التحقيق';
      case 'completed':
        return 'مكتمل';
      default:
        return 'غير معروف';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigating':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Search className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">التحقق من حالة التقرير</h1>
          <p className="text-gray-600">
            أدخل الرقم المرجعي للتقرير للاطلاع على حالته وآخر التحديثات من قاعدة البيانات
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <form onSubmit={handleVerification} className="space-y-6">
            <div>
              <label htmlFor="referenceId" className="block text-sm font-medium text-gray-700 mb-2">
                الرقم المرجعي
              </label>
              <input
                type="text"
                id="referenceId"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-center"
                placeholder="أدخل الرقم المرجعي هنا..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSearching || !referenceId.trim()}
              className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                  جاري البحث في قاعدة البيانات...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 ml-2" />
                  البحث عن التقرير
                </>
              )}
            </button>
          </form>
        </motion.div>

        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">تفاصيل التقرير</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verificationResult.status)}`}>
                  {getStatusText(verificationResult.status)}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">الرقم المرجعي:</span>
                  <code className="mr-2 bg-gray-100 px-2 py-1 rounded">{verificationResult.id}</code>
                </div>
                <div>
                  <span className="font-medium">تاريخ الإرسال:</span>
                  <span className="mr-2">{new Date(verificationResult.timestamp).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">تاريخ التحديثات</h3>
              <div className="space-y-4">
                {verificationResult.updates.map((update: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4 space-x-reverse">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(update.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium px-2 py-1 rounded ${getStatusColor(update.status)}`}>
                          {getStatusText(update.status)}
                        </span>
                        <span className="text-sm text-gray-500">{update.date}</span>
                      </div>
                      <p className="text-gray-700">{update.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 ml-2 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">ملاحظات مهمة:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• يتم تحديث حالة التقارير بانتظام في قاعدة البيانات</li>
                    <li>• قد تستغرق المراجعة عدة أيام حسب تعقيد الحالة</li>
                    <li>• احتفظ بالرقم المرجعي للمتابعة المستقبلية</li>
                    <li>• لا تشارك الرقم المرجعي مع أي شخص آخر</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {notFound && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لم يتم العثور على التقرير</h3>
            <p className="text-gray-600">
              تأكد من صحة الرقم المرجعي أو حاول مرة أخرى لاحقاً. قد يستغرق ظهور التقرير في النظام بضع دقائق.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};