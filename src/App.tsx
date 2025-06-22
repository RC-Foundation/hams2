import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { ReportForm } from './components/ReportForm';
import { SecurityGuide } from './components/SecurityGuide';
import { VerificationPage } from './components/VerificationPage';
import { TestSuite } from './components/TestSuite';
import { PanicButton } from './components/PanicButton';
import { PerformanceOptimizer } from './components/PerformanceOptimizer';
import { LoadingOptimizer } from './components/LoadingOptimizer';
import { LanguageProvider } from './contexts/LanguageContext';
import { SecurityProvider } from './contexts/SecurityContext';

function App() {
  return (
    <LanguageProvider>
      <SecurityProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
            <LoadingOptimizer />
            <PanicButton />
            <PerformanceOptimizer />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/report" element={<ReportForm />} />
              <Route path="/security" element={<SecurityGuide />} />
              <Route path="/verify" element={<VerificationPage />} />
              <Route path="/test" element={<TestSuite />} />
            </Routes>
          </div>
        </Router>
      </SecurityProvider>
    </LanguageProvider>
  );
}

export default App;