import React from 'react';
import { useEnergy } from '../context/EnergyContext';
import { Sun, BatteryCharging, Zap, AlertTriangle, ShieldAlert, SlidersHorizontal, Lock, Unlock } from 'lucide-react';

export const Header = () => {
  const {
    powerSource,
    calendarDays,
    toggleHighGridPriceSimulation,
    togglePowerCutSimulation,
    isSupervisorUnlocked,
    lockSupervisor
  } = useEnergy();

  // Check if grid price is expensive right now or simulated
  const isHighGridPrice = powerSource.gridPriceStatus === 'expensive';

  // Check if power cut is coming in next 4 days
  const upcomingPowerCutDay = calendarDays.find(
    (day, index) => index < 4 && day.gridStatus === 'power_cut'
  );

  const getSourceBadge = () => {
    switch (powerSource.currentSource) {
      case 'Solar':
        return (
          <div className="flex items-center gap-2 bg-emerald-950/80 border-2 border-emerald-500 text-emerald-300 px-4 py-2 rounded-2xl glow-green animate-pulse">
            <Sun className="w-7 h-7 text-emerald-400" />
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 block">CURRENT POWER SOURCE</span>
              <span className="text-xl font-extrabold text-white">100% CLEAN SOLAR POWER</span>
            </div>
          </div>
        );
      case 'Battery & Grid':
        return (
          <div className="flex items-center gap-2 bg-amber-950/80 border-2 border-amber-500 text-amber-300 px-4 py-2 rounded-2xl glow-yellow">
            <BatteryCharging className="w-7 h-7 text-amber-400" />
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400 block">CURRENT POWER SOURCE</span>
              <span className="text-xl font-extrabold text-white">BATTERY + GRID HYBRID</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 bg-rose-950/80 border-2 border-rose-500 text-rose-300 px-4 py-2 rounded-2xl glow-red">
            <Zap className="w-7 h-7 text-rose-400" />
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-rose-400 block">CURRENT POWER SOURCE</span>
              <span className="text-xl font-extrabold text-white">GRID ELECTRICITY (BORROWING)</span>
            </div>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Banner Alert 1: Red Alert for Power Cut coming */}
      {upcomingPowerCutDay && (
        <div className="bg-rose-600 text-white px-4 py-3 border-b border-rose-700 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 animate-bounce shrink-0" />
            <div>
              <p className="font-extrabold text-lg leading-tight">
                ⚠️ POWER CUT EXPECTED ON {upcomingPowerCutDay.dayName.toUpperCase()}!
              </p>
              <p className="text-sm font-semibold opacity-90">
                Scheduled cut: {upcomingPowerCutDay.powerCutStart || '10:00 AM'} to {upcomingPowerCutDay.powerCutEnd || '04:00 PM'}. Battery auto-prep is active.
              </p>
            </div>
          </div>
          <span className="bg-white text-rose-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider hidden sm:inline-block">
            CRITICAL ALERT
          </span>
        </div>
      )}

      {/* Top Banner Alert 2: Yellow Alert for High Grid Prices */}
      {isHighGridPrice && !upcomingPowerCutDay && (
        <div className="bg-amber-500 text-slate-950 px-4 py-3 border-b border-amber-600 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 shrink-0 text-slate-950" />
            <div>
              <p className="font-extrabold text-lg leading-tight">
                ⚡ HIGH GRID ELECTRICITY RATES RIGHT NOW!
              </p>
              <p className="text-sm font-bold text-slate-900">
                Grid borrowing cost is elevated ($0.42/kWh). Please switch off heavy non-essential machines.
              </p>
            </div>
          </div>
          <span className="bg-slate-950 text-amber-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider hidden sm:inline-block">
            HIGH TARIFF
          </span>
        </div>
      )}

      {/* Main App Title & Power Source Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* App Title & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-300 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">PowerIQ</h1>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                FACTORY ENERGY SMART SYSTEM
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Built for Factory Floor Workers & Supervisors</p>
          </div>
        </div>

        {/* Current Power Source Badge */}
        <div className="flex items-center gap-3">
          {getSourceBadge()}

          {/* Supervisor Status Button */}
          {isSupervisorUnlocked ? (
            <button
              onClick={lockSupervisor}
              className="flex items-center gap-1.5 bg-purple-900/60 border border-purple-500 text-purple-200 px-3 py-2 rounded-xl text-xs font-bold hover:bg-purple-800 transition"
              title="Supervisor Unlocked. Click to logout."
            >
              <Unlock className="w-4 h-4 text-purple-400" />
              <span>SUPERVISOR ON</span>
            </button>
          ) : (
            <div className="hidden lg:flex items-center gap-1 text-xs text-slate-400 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>WORKER MODE</span>
            </div>
          )}
        </div>
      </div>

      {/* Simulation Controls Toolbar (for easy evaluators/worker testing) */}
      <div className="bg-slate-950/80 px-4 py-1.5 border-t border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Interactive Factory Simulator:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleHighGridPriceSimulation}
            className={`px-2.5 py-1 rounded-lg font-bold border transition ${
              isHighGridPrice
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isHighGridPrice ? '✓ High Price Active' : '⚡ Simulate High Grid Rate'}
          </button>

          <button
            onClick={togglePowerCutSimulation}
            className={`px-2.5 py-1 rounded-lg font-bold border transition ${
              upcomingPowerCutDay
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-800 text-rose-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {upcomingPowerCutDay ? '✓ Cut Alert Active' : '🚨 Simulate Power Cut Alert'}
          </button>
        </div>
      </div>
    </header>
  );
};
