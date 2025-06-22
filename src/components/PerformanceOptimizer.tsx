import React, { useEffect } from 'react';
import { usePlatformSettings } from '../hooks/usePlatformSettings';

export const PerformanceOptimizer: React.FC = () => {
  const { performanceSettings } = usePlatformSettings();

  useEffect(() => {
    if (!performanceSettings) return;

    // Apply performance optimizations
    const applyOptimizations = () => {
      // Defer non-critical JavaScript
      if (performanceSettings.defer_js) {
        const scripts = document.querySelectorAll('script[data-defer="true"]');
        scripts.forEach(script => {
          script.setAttribute('defer', 'true');
        });
      }

      // Enable compression hints
      if (performanceSettings.gzip_enabled) {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Encoding';
        meta.content = 'gzip';
        document.head.appendChild(meta);
      }

      // Inline critical CSS if under threshold
      const criticalCSS = document.querySelector('style[data-critical="true"]');
      if (criticalCSS) {
        const cssSize = criticalCSS.textContent?.length || 0;
        const thresholdBytes = performanceSettings.inline_css_threshold * 1024;
        
        if (cssSize > thresholdBytes) {
          // Move to external stylesheet
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = '/critical.css';
          document.head.appendChild(link);
          criticalCSS.remove();
        }
      }
    };

    applyOptimizations();
  }, [performanceSettings]);

  return null; // This component doesn't render anything
};