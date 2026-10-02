import React, { useEffect, useState } from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600 text-white px-4 py-2.5 text-xs font-medium shadow-2xl animate-bounce border border-amber-400">
      <WifiOff className="w-4 h-4 shrink-0" />
      <div>
        <p className="font-bold">Modo Offline Activo</p>
        <p className="text-[10px] text-amber-100 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Datos seguros y auditados en almacenamiento local.
        </p>
      </div>
    </div>
  );
};
