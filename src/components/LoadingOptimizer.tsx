import React, { useEffect, useState } from 'react';

export const LoadingOptimizer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Optimize loading for slow connections
    const optimizeForSlowConnections = () => {
      // Check connection speed
      const nav = navigator as Navigator & {
        connection?: { effectiveType?: string };
        mozConnection?: { effectiveType?: string };
        webkitConnection?: { effectiveType?: string };
      };
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
      
      if (connection) {
        const slowConnection = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
        
        if (slowConnection) {
          // Disable animations for slow connections
          document.documentElement.style.setProperty('--animation-duration', '0s');
          
          // Reduce image quality
          const images = document.querySelectorAll('img');
          images.forEach(img => {
            if (img.src.includes('pexels.com')) {
              img.src = img.src.replace(/w=\d+/, 'w=400');
            }
          });
        }
      }

      setIsLoading(false);
    };

    // Delay optimization to not block initial render
    setTimeout(optimizeForSlowConnections, 100);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return null;
};