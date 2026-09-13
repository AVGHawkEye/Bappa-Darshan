import React, { useEffect, useState } from 'react';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';
import {
  UserRepository,
  databaseAdapter,
  VisitsRepository,
  PhotosRepository,
  SyncQueueRepository,
} from '../services/storage/sqliteWatermelonAdapter';
import { User } from '../types';
import { ENV_CONFIG } from '../config/env';
import { NetInfo, useNetInfo } from '../services/network/netinfo';
import {
  UserCircle2,
  Database,
  Wifi,
  WifiOff,
  ShieldCheck,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Sparkles,
  Info,
  MapPin,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    pandalsCount: 0,
    visitsCount: 0,
    photosCount: 0,
    syncJobsCount: 0,
  });
  const netInfo = useNetInfo();
  const [clearing, setClearing] = useState(false);

  const refreshStats = async () => {
    const u = await UserRepository.getCurrentUser();
    setUser(u);
    const pCount = await databaseAdapter.count('pandals');
    const vCount = await databaseAdapter.count('visits');
    const phCount = await databaseAdapter.count('photos');
    const sCount = await databaseAdapter.count('sync_jobs');

    setStats({
      pandalsCount: pCount,
      visitsCount: vCount,
      photosCount: phCount,
      syncJobsCount: sCount,
    });
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const handleToggleOffline = () => {
    NetInfo.toggleSimulatedOffline();
  };

  const handleClearData = async () => {
    if (confirm('Reset local SQLite database to initial mock state?')) {
      setClearing(true);
      window.localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-hidden">
      <Header subtitle="Settings & Persistence Status" />
      <OfflineBanner />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* User Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-orange-950/40">
            ॐ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{user?.name || 'Bappa Devotee'}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold uppercase">
                {user?.role || 'Devotee'}
              </span>
            </div>
            <p className="text-neutral-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>Pilot User • Kandivali–Charkop, R/South</span>
            </p>
          </div>
        </div>

        {/* Local Persistence & SQLite Stats */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Local Persistence (SQLite Adapter)</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
              ACTIVE
            </span>
          </div>

          <p className="text-neutral-400 leading-relaxed">
            Clean architecture persistence interface layer adhering to SQLite / WatermelonDB repository specification with zero external cloud dependencies.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-850">
              <span className="text-[10px] text-neutral-500 uppercase font-mono block">
                Verified Pandals
              </span>
              <span className="text-lg font-bold text-white mt-0.5 block font-mono">
                {stats.pandalsCount}
              </span>
            </div>

            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-850">
              <span className="text-[10px] text-neutral-500 uppercase font-mono block">
                Logged Visits
              </span>
              <span className="text-lg font-bold text-amber-400 mt-0.5 block font-mono">
                {stats.visitsCount}
              </span>
            </div>

            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-850">
              <span className="text-[10px] text-neutral-500 uppercase font-mono block">
                Attached Media
              </span>
              <span className="text-lg font-bold text-orange-400 mt-0.5 block font-mono">
                {stats.photosCount}
              </span>
            </div>

            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-850">
              <span className="text-[10px] text-neutral-500 uppercase font-mono block">
                Queued Sync Jobs
              </span>
              <span className="text-lg font-bold text-blue-400 mt-0.5 block font-mono">
                {stats.syncJobsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Network & Simulation Control (NetInfo) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-amber-400" />
              <span>NetInfo Network Abstraction</span>
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                netInfo.isConnected
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-950 text-rose-300 border-rose-500/40'
              }`}
            >
              {netInfo.isConnected ? 'ONLINE' : 'OFFLINE SIMULATED'}
            </span>
          </div>

          <p className="text-neutral-400 leading-relaxed">
            Test field conditions during pandal visits with unstable cellular connectivity.
          </p>

          <button
            type="button"
            onClick={handleToggleOffline}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all border flex items-center justify-center gap-2 ${
              netInfo.isConnected
                ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-200 border-rose-600/40'
                : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 border-emerald-600/40'
            }`}
          >
            {netInfo.isConnected ? (
              <>
                <WifiOff className="w-4 h-4 text-rose-400" />
                <span>Simulate Offline Field Mode</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Restore Online Connectivity</span>
              </>
            )}
          </button>
        </div>

        {/* Pilot Manifesto Rules Reference */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-2.5">
          <span className="font-bold text-sm text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Architecture & Manifesto Rules</span>
          </span>

          <div className="space-y-1.5 text-neutral-300">
            <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-850">
              <strong className="text-amber-400 block font-mono">00_CORE_MANIFESTO</strong>
              <span className="text-[11px] text-neutral-400">
                Kandivali–Charkop Pilot (30–100 pandals). Golden Rule: Mark location now, upload photo later.
              </span>
            </div>

            <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-850">
              <strong className="text-emerald-400 block font-mono">01_DOMAIN_RULES (Rules 1-3)</strong>
              <span className="text-[11px] text-neutral-400">
                0-15m auto accept, 15-50m confirmation, 50-100m manual select, &gt;100m warning. Original coordinates never overwritten.
              </span>
            </div>

            <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-850">
              <strong className="text-blue-400 block font-mono">02_DATA_SCHEMA</strong>
              <span className="text-[11px] text-neutral-400">
                Object storage separation for media; local SQLite relational persistence for visits and sync queue.
              </span>
            </div>
          </div>
        </div>

        {/* Reset / Clear local database */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleClearData}
            disabled={clearing}
            className="w-full py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Local Database to Factory Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};
