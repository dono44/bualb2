import React from 'react';
import { Bluetooth, Speaker, RefreshCw, HelpCircle, ShieldCheck, Cpu, Smartphone } from 'lucide-react';
import { AudioEngineCapabilities } from '../types';

interface HeaderProps {
  capabilities: AudioEngineCapabilities;
  onScanDevices: () => void;
  onOpenGuide: () => void;
  isScanning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  capabilities,
  onScanDevices,
  onOpenGuide,
  isScanning,
}) => {
  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Speaker className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-slate-950 ring-2 ring-slate-900">
              2x
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                DualAudio <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">Bluetooth Studio</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                <Smartphone className="w-3 h-3 text-emerald-400" /> Mode Android
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Diffusion audio simultanée sur 2 périphériques Bluetooth indépendants (Android & Samsung)
            </p>
          </div>
        </div>

        {/* Action Controls & Capabilities Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Moteur Multi-Sortie:</span>
            <span className={`font-semibold ${capabilities.setSinkIdSupported ? 'text-emerald-400' : 'text-amber-400'}`}>
              {capabilities.setSinkIdSupported ? 'Support Natif setSinkId' : 'Routage Audio Dédié'}
            </span>
          </div>

          {/* Device Scan Button */}
          <button
            onClick={onScanDevices}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 hover:border-slate-600 transition-all active:scale-95 disabled:opacity-50"
            title="Scanner et détecter les casques/enceintes Bluetooth connectés"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Recherche...' : 'Scanner Périphériques'}</span>
          </button>

          {/* Bluetooth Pairing Guide Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-xs font-medium text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 transition-all active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Guide Android / Samsung</span>
          </button>
        </div>
      </div>
    </header>
  );
};
