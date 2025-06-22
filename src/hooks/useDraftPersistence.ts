import { useEffect } from 'react';
import type { DraftSettings } from '../services/platformSettings';

export const useDraftPersistence = (
  settings: DraftSettings | null,
  textareaId: string,
  value: string,
  onChange: (value: string) => void
) => {
  useEffect(() => {
    if (!settings?.enabled) return;

    const draftKey = `draft_${textareaId}`;
    const timestampKey = `draft_${textareaId}_timestamp`;

    // Load existing draft
    const loadDraft = () => {
      const draft = localStorage.getItem(draftKey);
      const timestamp = localStorage.getItem(timestampKey);
      
      if (draft && timestamp) {
        const draftAge = Date.now() - parseInt(timestamp);
        const maxAge = settings.ttl_hours * 60 * 60 * 1000;
        
        if (draftAge < maxAge) {
          onChange(draft);
        } else {
          // Draft expired, remove it
          localStorage.removeItem(draftKey);
          localStorage.removeItem(timestampKey);
        }
      }
    };

    // Save draft on value change
    const saveDraft = () => {
      if (value.trim()) {
        localStorage.setItem(draftKey, value);
        localStorage.setItem(timestampKey, Date.now().toString());
      }
    };

    // Clear draft
    const clearDraft = () => {
      localStorage.removeItem(draftKey);
      localStorage.removeItem(timestampKey);
    };

    // Load draft on mount
    loadDraft();

    // Save draft on beforeunload
    const handleBeforeUnload = () => {
      saveDraft();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Auto-save every 30 seconds
    const autoSaveInterval = setInterval(saveDraft, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(autoSaveInterval);
    };
  }, [settings, textareaId, value, onChange]);

  // Return function to clear draft manually
  return {
    clearDraft: () => {
      const draftKey = `draft_${textareaId}`;
      const timestampKey = `draft_${textareaId}_timestamp`;
      localStorage.removeItem(draftKey);
      localStorage.removeItem(timestampKey);
    }
  };
};