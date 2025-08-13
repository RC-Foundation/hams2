import React from 'react';
import { MessageCircle, Phone, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('tip.title')}</h1>
          <p className="text-xl text-gray-600">{t('tip.subtitle')}</p>
        </motion.div>
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('tip.whatsappTitle')}</h2>
            <p className="text-gray-700 mb-4">{t('tip.whatsappBody')}</p>
            <div className="flex items-center text-blue-700 font-semibold">
              <MessageCircle className="w-5 h-5 ml-2" />
              <span>+1 587 457 4532</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('tip.signalTitle')}</h2>
            <p className="text-gray-700 mb-4">{t('tip.signalBody')}</p>
            <div className="flex items-center text-blue-700 font-semibold">
              <Phone className="w-5 h-5 ml-2" />
              <span>+1 587 457 4532</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
