import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { usePlatformSettings } from '../hooks/usePlatformSettings';

export const PanicButton: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { panicSettings } = usePlatformSettings();

  const handlePanicExit = () => {
    // Clear all sensitive data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear form data
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
    
    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }

    // Clear DOM if enabled
    if (panicSettings?.clear_dom) {
      document.body.innerHTML = '';
    }
    
    // Redirect to safe site with fallback and URL validation
    const redirectUrl = panicSettings?.redirect_url || 'https://www.wikipedia.org';
    try {
      // Validate URL format
      const url = new URL(redirectUrl);
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        window.location.href = redirectUrl;
      } else {
        throw new Error('Invalid protocol');
      }
    } catch {
      // Fallback to safe default
      window.location.href = 'https://www.wikipedia.org';
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="fixed top-4 left-4 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2 text-sm font-medium"
        aria-label="خروج سريع"
      >
        <X className="w-4 h-4" />
        خروج سريع
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 ml-2" />
              <h3 className="text-lg font-bold text-gray-900">تأكيد الخروج السريع</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              سيتم مسح جميع البيانات والانتقال إلى موقع آمن. هل أنت متأكد؟
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handlePanicExit}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                نعم، اخرج الآن
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};