import React from 'react';
import { WifiOff, Database, CheckCircle2 } from 'lucide-react';
import { useNetInfo } from '../../services/network/netinfo';

export const OfflineBanner: React.FC = () => {
  const netInfo = useNetInfo();

  if (netInfo.isConnected) {
    return null;
  }

  return (
    <div className="bg-amber-950/90 border-b border-amber-600/40 px-3 py-1.5 flex items-center justify-between text-xs text-amber-200">
      <div className="flex items-center gap-2">
        <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          <strong className="font-semibold text-amber-100">Offline Mode Active.</strong> Visits saved locally to SQLite.
        </span>
      </div>
      <div className="flex items-center gap-1 text-[11px] text-amber-300/80 bg-amber-900/50 px-1.5 py-0.5 rounded border border-amber-700/50">
        <Database className="w-2.5 h-2.5" />
        <span>Sync Queued</span>
      </div>
    </div>
  );
};
