import React from 'react';
import { Wifi, WifiOff, MapPin, Sparkles } from 'lucide-react';
import { useNetInfo, NetInfo } from '../../services/network/netinfo';
import { ENV_CONFIG } from '../../config/env';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLocationPill?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = ENV_CONFIG.APP_NAME,
  subtitle = 'Kandivali–Charkop Pilot',
  showLocationPill = true,
}) => {
  const netInfo = useNetInfo();

  const handleToggleOffline = () => {
    NetInfo.toggleSimulatedOffline();
  };

  return (
    <header className="sticky top-0 z-30 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-950/40 text-amber-50 font-bold text-sm">
            ॐ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-semibold tracking-tight text-white flex items-center gap-1">
                {title}
              </h1>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                PILOT
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-none mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showLocationPill && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-neutral-300 bg-neutral-800/80 px-2 py-1 rounded-full border border-neutral-700/60">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>R/South</span>
            </div>
          )}

          {/* Network status indicator with manual offline testing toggle */}
          <button
            type="button"
            onClick={handleToggleOffline}
            title="Click to toggle offline mode (Field Testing)"
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs transition-all active:scale-95 ${
              netInfo.isConnected
                ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300 animate-pulse hover:bg-rose-900/50'
            }`}
          >
            {netInfo.isConnected ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px] font-medium hidden xs:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-400" />
                <span className="text-[11px] font-medium font-mono">Offline</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
