import { useState, useEffect } from 'react';
import { platformSettingsService } from '../services/platformSettings';
import type {
  PanicButtonSettings,
  PerformanceSettings,
  EncryptionSettings,
  IdleTimeoutSettings,
  DraftSettings
} from '../services/platformSettings';

export const usePlatformSettings = () => {
  const [panicSettings, setPanicSettings] = useState<PanicButtonSettings | null>(null);
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings | null>(null);
  const [encryptionSettings, setEncryptionSettings] = useState<EncryptionSettings | null>(null);
  const [idleTimeoutSettings, setIdleTimeoutSettings] = useState<IdleTimeoutSettings | null>(null);
  const [draftSettings, setDraftSettings] = useState<DraftSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [panic, performance, encryption, idleTimeout, draft] = await Promise.all([
          platformSettingsService.getPanicButtonSettings(),
          platformSettingsService.getPerformanceSettings(),
          platformSettingsService.getEncryptionSettings(),
          platformSettingsService.getIdleTimeoutSettings(),
          platformSettingsService.getDraftSettings()
        ]);

        setPanicSettings(panic);
        setPerformanceSettings(performance);
        setEncryptionSettings(encryption);
        setIdleTimeoutSettings(idleTimeout);
        setDraftSettings(draft);
      } catch (error) {
        console.error('Error loading platform settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return {
    panicSettings,
    performanceSettings,
    encryptionSettings,
    idleTimeoutSettings,
    draftSettings,
    loading
  };
};