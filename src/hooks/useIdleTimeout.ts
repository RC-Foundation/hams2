import { useEffect, useRef } from 'react';
import type { IdleTimeoutSettings } from '../services/platformSettings';

export const useIdleTimeout = (settings: IdleTimeoutSettings | null) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  useEffect(() => {
    if (!settings) return;

    const timeoutMs = settings.duration_minutes * 60 * 1000;

    const killSession = () => {
      if (settings.warning_enabled && !warningShownRef.current) {
        warningShownRef.current = true;
        alert(settings.warning_message);
      }
      
      // Clear sensitive data
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear DOM if needed
      document.body.innerHTML = '';
      
      // Redirect with fallback and URL validation
      const redirectUrl = settings.redirect_url || 'https://www.wikipedia.org';
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

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      warningShownRef.current = false;
      timerRef.current = setTimeout(killSession, timeoutMs);
    };

    // Start the timer
    resetTimer();

    // Add event listeners for user activity
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [settings]);
};