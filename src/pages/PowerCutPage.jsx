import React from 'react';
import { useEnergy } from '../context/EnergyContext';
import {
  ShieldAlert,
  Clock,
  Fuel,
  Battery,
  Lock,
  PauseCircle,
  Power,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Gauge
} from 'lucide-react';

export const PowerCutPage = () => {
  const { calendarDays, generator, powerSource, machines, refillGeneratorFuel, isSupervisorUnlocked } = useEnergy();

  // Find power cut day
  const powerCutDay = calendarDays.find((d) => d.gridStatus === 'power_cut') || {
    date: '2026-09-20',
    dayName: 'Sun, Sept 20',
    powerCutStart: '10:00 AM',
    powerCutEnd: '04:00 PM'
  };

  // Generator fuel calculations
  const currentFuel = generator.fuelLevelLitres;
  const capacityFuel = generator.fuelCapacityLitres;
  const neededFuel = generator.fuelNeededForCut; // 390 L
  const shortfall = neededFuel > currentFuel ? neededFuel - currentFuel : 0;
  const fuelPercent = Math.round((currentFuel / capacityFuel) * 100);

  // Battery calculations
  const currentBattery = powerSource.batteryPercent;
  const timeToFullHrs = Math.max(0, Math.round(((100 - currentBattery) / 15) * 10) / 10);

  // Machine priority breakdown
  const essentialMachines = machines.filter((m) => m.priority === 'essential');
  const flexibleMachines = machines.filter((m) => m.priority === 'flexible');
  const nonEssentialMachines = machines.filter((m) => m.priority === 'nonessential');

  return (
    <div className="space-y-6 pb-6">
      {/* CLEAR RED ALERT BANNER */}
      <div className="bg-rose-950 border-4 border-rose-500 rounded-3xl p-6 glow-red text-white space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-600 rounded-2xl animate-bounce">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest bg-rose-900 text-rose-200 px-3 py-1 rounded-full border border-rose-700">
              UTILITY GRID POWER CUT DETECTED
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mt-1">
              Power cut on {powerCutDay.dayName} from {powerCutDay.powerCutStart || '10:00 AM'} to {powerCutDay.powerCutEnd || '04:00 PM'}
            </h2>
          </div>
        </div>
        <p className="text-sm font-bold text-rose-100 bg-rose-900/60 p-3 rounded-xl border border-rose-800">
          ⚠️ Grid power will be completely off for 6 hours. PowerIQ AI automated preparation is currently active.
        </p>
        <div className="bg-emerald-950/80 border-2 border-emerald-500/70 p-4 rounded-2xl">
          <h3 className="text-lg font-black text-emerald-200">Continuity scenario: the factory stays online</h3>
          <p className="text-sm text-emerald-100 font-semibold mt-1">
            The government has declared this grid power cut, but production continues: solar supplies the daytime load first, the battery smooths the changeover, and the diesel generator backs up the remaining essential machines.
          </p>
          <p className="text-xs text-emerald-300 font-bold mt-2">
            Solar available now: {powerSource.solarKW} kW • Generator mode: {generator.status} • Essential machines protected: {essentialMachines.length}
          </p>
        </div>
      </div>

      {/* TIMELINE SHOWING PREPARATION STEPS (4 DAYS BEFORE -> CUT DAY) */}
      <div className="factory-card p-6 space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-emerald-400" />
          4-Day Power Cut Preparation Timeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {/* Step 1: 4 Days Before */}
          <div className="bg-slate-900/90 border-2 border-emerald-500/80 p-4 rounded-2xl relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">STEP 1 • 4 DAYS BEFORE</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-extrabold text-white text-base">Alert Created & AI Planning</h4>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Grid cut alert created from utility API. AI starts load balancing schedule.
            </p>
          </div>

          {/* Step 2: 3 Days Before */}
          <div className="bg-slate-900/90 border-2 border-emerald-500/80 p-4 rounded-2xl relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">STEP 2 • 3 DAYS BEFORE</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-extrabold text-white text-base">Fuel & Battery Calculated</h4>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Calculated 390L fuel requirement & 100% battery charge target for 6 hr cut.
            </p>
          </div>

          {/* Step 3: Day Before */}
          <div className="bg-slate-900/90 border-2 border-amber-500 p-4 rounded-2xl relative glow-yellow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">STEP 3 • DAY BEFORE</span>
              <span className="w-3 h-3 bg-amber-400 rounded-full animate-ping"></span>
            </div>
            <h4 className="font-extrabold text-white text-base">Force Charge & Fuel Check</h4>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Battery charging forced to 100%. Generator fuel check triggered.
            </p>
          </div>

          {/* Step 4: Cut Day */}
          <div className="bg-slate-900/90 border-2 border-rose-500 p-4 rounded-2xl relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider">STEP 4 • CUT DAY</span>
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <h4 className="font-extrabold text-white text-base">Auto Power Switchover</h4>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Battery first, generator backup engaged, non-essential machines auto-paused.
            </p>
          </div>
        </div>
      </div>

      {/* GENERATOR & BATTERY PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GENERATOR PANEL */}
        <div className="factory-card p-6 space-y-4 border-2 border-slate-700">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold">
              <Fuel className="w-6 h-6" />
              <h3 className="text-xl font-black text-white">Diesel Backup Generator</h3>
            </div>
            <span
              className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                generator.status === 'standby'
                  ? 'bg-amber-950 text-amber-300 border-amber-500'
                  : generator.status === 'running'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              STATUS: {generator.status}
            </span>
          </div>

          {/* Fuel Level & Gauge Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CURRENT DIESEL FUEL</span>
              <span className="text-2xl font-black text-white">
                {currentFuel} <span className="text-sm text-slate-400">/ {capacityFuel} Litres ({fuelPercent}%)</span>
              </span>
            </div>
            <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  shortfall > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${fuelPercent}%` }}
              />
            </div>
          </div>

          {/* Required Fuel vs Shortfall Alert */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between font-bold">
              <span className="text-slate-400">Required for 6-hr cut:</span>
              <span className="text-white font-black">{neededFuel} Litres</span>
            </div>

            {/* SHORTFALL ALERT IN RED IF FUEL IS NOT ENOUGH */}
            {shortfall > 0 ? (
              <div className="bg-rose-950/90 border-2 border-rose-500 text-rose-200 p-3 rounded-xl text-xs font-black flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>🚨 Need {shortfall} more litres — refuel before {powerCutDay.dayName}</span>
                </div>
                <button
                  onClick={() => refillGeneratorFuel(shortfall)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-black text-[11px] shrink-0 cursor-pointer shadow-md"
                >
                  + Refill {shortfall}L
                </button>
              </div>
            ) : (
              <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>✓ Fuel level is sufficient for the full duration of the power cut.</span>
              </div>
            )}
          </div>
        </div>

        {/* BATTERY PANEL */}
        <div className="factory-card p-6 space-y-4 border-2 border-slate-700">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-blue-400 font-extrabold">
              <Battery className="w-6 h-6" />
              <h3 className="text-xl font-black text-white">Factory Battery Bank</h3>
            </div>
            <span className="text-xs font-black uppercase bg-blue-950 text-blue-300 border border-blue-500 px-3 py-1 rounded-full">
              TARGET: 100%
            </span>
          </div>

          {/* Current Charge % & Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CURRENT CHARGE LEVEL</span>
              <span className="text-2xl font-black text-white">
                {currentBattery}% <span className="text-sm text-blue-400 font-bold">/ 100% Target</span>
              </span>
            </div>
            <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                style={{ width: `${currentBattery}%` }}
              />
            </div>
          </div>

          {/* Time to Full Charge Estimate */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between font-bold">
              <span className="text-slate-400">Charging Rate:</span>
              <span className="text-emerald-400 font-bold">+15% per hour (Solar Fast-Charge)</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-slate-400">Est. Time to Full Charge:</span>
              <span className="text-blue-300 font-black">{timeToFullHrs} Hours</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium italic pt-1">
              Battery will automatically act as primary power source when grid cuts at {powerCutDay.powerCutStart || '10:00 AM'}.
            </p>
          </div>
        </div>
      </div>

      {/* MACHINE PRIORITY LIST DURING POWER CUT */}
      <div className="factory-card p-6 space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Gauge className="w-6 h-6 text-emerald-400" />
          Machine Priority Rules During Power Cut
        </h3>
        <p className="text-xs text-slate-300 font-semibold">
          PowerIQ automatically categorizes machinery to preserve battery & generator fuel life during outages.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Category 1: Essential (GREEN LOCK ICON) */}
          <div className="bg-emerald-950/70 border-2 border-emerald-500 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm uppercase">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>ESSENTIAL — ALWAYS ON</span>
              </div>
              <span className="bg-emerald-600 text-white font-black text-xs px-2 py-0.5 rounded">
                {essentialMachines.length} Machines
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200 font-bold">
              {essentialMachines.map((m) => (
                <li key={m.id} className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex justify-between">
                  <span>🟢 {m.name}</span>
                  <span className="text-emerald-400">{m.kWRating} kW</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Category 2: Flexible (YELLOW PAUSE ICON) */}
          <div className="bg-amber-950/70 border-2 border-amber-500 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase">
                <PauseCircle className="w-5 h-5 text-amber-400" />
                <span>FLEXIBLE — PAUSED IN CUT</span>
              </div>
              <span className="bg-amber-600 text-white font-black text-xs px-2 py-0.5 rounded">
                {flexibleMachines.length} Machines
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200 font-bold">
              {flexibleMachines.map((m) => (
                <li key={m.id} className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex justify-between">
                  <span>🟡 {m.name}</span>
                  <span className="text-amber-400">{m.kWRating} kW</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Category 3: Non-essential (GREY OFF ICON) */}
          <div className="bg-slate-900/90 border-2 border-slate-700 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 font-extrabold text-sm uppercase">
                <Power className="w-5 h-5 text-slate-400" />
                <span>NON-ESSENTIAL — AUTO OFF</span>
              </div>
              <span className="bg-slate-700 text-slate-200 font-black text-xs px-2 py-0.5 rounded">
                {nonEssentialMachines.length} Machines
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 font-bold">
              {nonEssentialMachines.map((m) => (
                <li key={m.id} className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between">
                  <span>⚪ {m.name}</span>
                  <span className="text-slate-400">{m.kWRating} kW</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
