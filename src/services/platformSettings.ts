import { supabase } from '../lib/supabase';

export interface PanicButtonSettings {
  redirect_url: string;
  clear_dom: boolean;
}

export interface PerformanceSettings {
  inline_css_threshold: number;
  defer_js: boolean;
  gzip_enabled: boolean;
}

export interface EncryptionSettings {
  public_key_armored: string;
}

export interface IdleTimeoutSettings {
  duration_minutes: number;
  warning_enabled: boolean;
  warning_message: string;
  redirect_url: string;
}

export interface DraftSettings {
  enabled: boolean;
  ttl_hours: number;
}

class PlatformSettingsService {
  private async getSetting<T>(key: string): Promise<T | null> {
    try {
      // Schema is already set to 'api' in supabase client, so just use table name
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', key)
        .single();

      if (error) {
        console.error(`Error fetching setting ${key}:`, error);
        return null;
      }

      return data?.setting_value as T;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }
  }

  async getPanicButtonSettings(): Promise<PanicButtonSettings> {
    const settings = await this.getSetting<PanicButtonSettings>('panic_button');
    return settings || {
      redirect_url: 'https://www.wikipedia.org',
      clear_dom: true
    };
  }

  async getPerformanceSettings(): Promise<PerformanceSettings> {
    const settings = await this.getSetting<PerformanceSettings>('performance');
    return settings || {
      inline_css_threshold: 8,
      defer_js: true,
      gzip_enabled: true
    };
  }

  async getEncryptionSettings(): Promise<EncryptionSettings> {
    const settings = await this.getSetting<EncryptionSettings>('encryption');
    return settings || {
      public_key_armored: ''
    };
  }

  async getIdleTimeoutSettings(): Promise<IdleTimeoutSettings> {
    const settings = await this.getSetting<IdleTimeoutSettings>('idle_timeout');
    return settings || {
      duration_minutes: 120,
      warning_enabled: false,
      warning_message: 'ستنتهي الجلسة خلال خمس دقائق من الخمول.',
      redirect_url: 'https://www.wikipedia.org'
    };
  }

  async getDraftSettings(): Promise<DraftSettings> {
    const settings = await this.getSetting<DraftSettings>('draft_settings');
    return settings || {
      enabled: true,
      ttl_hours: 2
    };
  }
}

export const platformSettingsService = new PlatformSettingsService();