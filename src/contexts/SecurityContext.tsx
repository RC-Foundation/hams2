import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as openpgp from 'openpgp';
import CryptoJS from 'crypto-js';
import { usePlatformSettings } from '../hooks/usePlatformSettings';
import { useIdleTimeout } from '../hooks/useIdleTimeout';

interface SecurityContextType {
  isSecureConnection: boolean;
  encryptData: (data: string) => Promise<string>;
  generateSecureId: () => string;
  clearSensitiveData: () => void;
  securityScore: number;
  stripMetadata: (file: File) => Promise<File>;
  publicKey: string | null;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSecureConnection, setIsSecureConnection] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const AES_FALLBACK_KEY = import.meta.env.VITE_AES_FALLBACK_KEY || 'secure-fallback-key';
  
  const { encryptionSettings, idleTimeoutSettings } = usePlatformSettings();
  
  // Initialize idle timeout
  useIdleTimeout(idleTimeoutSettings);

  useEffect(() => {
    if (encryptionSettings?.public_key_armored) {
      setPublicKey(encryptionSettings.public_key_armored);
    }
  }, [encryptionSettings]);

  useEffect(() => {
    // Check security conditions
    const checkSecurity = () => {
      let score = 0;
      
      // Check HTTPS
      if (window.location.protocol === 'https:') {
        score += 25;
        setIsSecureConnection(true);
      }
      
      // Check for Tor browser (simplified detection)
      if (navigator.userAgent.includes('Tor') || window.location.hostname.endsWith('.onion')) {
        score += 25;
      }
      
      // Check for private browsing (simplified)
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        score += 25;
      } catch {
        score += 50; // Likely private browsing
      }
      
      // Check for WebRTC blocking
      if (!window.RTCPeerConnection && !window.webkitRTCPeerConnection && !window.mozRTCPeerConnection) {
        score += 25;
      }
      
      setSecurityScore(score);
    };

    checkSecurity();
  }, []);

  const encryptWithAes = (text: string): string => {
    return CryptoJS.AES.encrypt(text, AES_FALLBACK_KEY).toString();
  };

  const encryptData = async (data: string): Promise<string> => {
    try {
      if (!publicKey || publicKey.trim() === '') {
        console.warn('No PGP public key available, using AES fallback');
        return encryptWithAes(data);
      }

      const cleanKey = publicKey.trim();

      if (!cleanKey.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----') ||
          !cleanKey.includes('-----END PGP PUBLIC KEY BLOCK-----')) {
        console.warn('Invalid PGP public key format, using AES fallback');
        return encryptWithAes(data);
      }

      try {
        const key = await openpgp.readKey({ armoredKey: cleanKey });
        const message = await openpgp.createMessage({ text: data });
        return await openpgp.encrypt({
          message,
          encryptionKeys: key,
        });
      } catch (pgpError) {
        console.warn('PGP encryption failed, using AES fallback:', pgpError);
        return encryptWithAes(data);
      }
    } catch (error) {
      console.error('Encryption failed completely:', error);
      return encryptWithAes(data);
    }
  };

  const generateSecureId = (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const stripMetadata = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        // Resize if too large
        const maxDim = 1024;
        let { width, height } = img;

        if (width > height && width > maxDim) {
          height = (height * maxDim) / width;
          width = maxDim;
        } else if (height > maxDim) {
          width = (width * maxDim) / height;
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) {
            const cleanFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(cleanFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  };

  const clearSensitiveData = () => {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
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
  };

  return (
    <SecurityContext.Provider value={{
      isSecureConnection,
      encryptData,
      generateSecureId,
      clearSensitiveData,
      securityScore,
      stripMetadata,
      publicKey,
    }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};