import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnergy } from '../context/EnergyContext';
import { LargeToggle } from '../components/LargeToggle';
import { Sun, Battery, Fuel, Zap, Cpu, Clock, ShieldAlert, ArrowUpRight } from 'lucide-react';

export const Dashboard = () => {
  const { powerSource, machines, generator, toggleMachine } = useEnergy();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all' | 'running' | 'scheduled' | 'off'

  // Calculate live machine counts
  const runningCount = machines.filter((m) => m.status === 'running').length;
  const scheduledCount = machines.filter((m) => m.status === 'scheduled').length;
  const offCount = machines.filter((m) => m.status === 'off').length;

  const totalCurrentKW = machines
    .filter((m) => m.status === 'running')
    .reduce((sum, m) => sum + (m.currentKW || 0), 0)
    .toFixed(1);

  const filteredMachines = machines.filter((m) => {
    if (filter === 'running') return m.status === 'running';
    if (filter === 'scheduled') return m.status === 'scheduled';
    if (filter === 'off') return m.status === 'off';
    return true;
  });

  return (
    <div className="space-y-6 pb-6">
      {/* LIVE ENERGY STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat 1: Solar Now (GREEN) */}
        <div className="factory-card p-5 border-l-8 border-l-emerald-500 glow-green flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Sun className="w-5 h-5 animate-spin-slow" />
              <span>SOLAR POWER NOW</span>
            </div>

            <div className="text-4xl font-black text-white tracking-tight">
              {powerSource.solarKW} <span className="text-xl font-bold text-emerald-400">kW</span>
            </div>
            <p className="text-xs text-slate-300 font-semibold mt-1">☀️ Generating at 92% capacity</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-black text-2xl">
            ⚡
          </div>
        </div>

        {/* Stat 2: Battery (BLUE) */}
        <div className="factory-card p-5 border-l-8 border-l-blue-500 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Battery className="w-5 h-5 text-blue-400" />
              <span>BATTERY STORAGE</span>
            </div>
            <div className="text-4xl font-black text-white tracking-tight">
              {powerSource.batteryPercent}<span className="text-xl font-bold text-blue-400">%</span>
            </div>
            <div className="w-36 h-2 bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                style={{ width: `${powerSource.batteryPercent}%` }}
              />
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-950/80 border border-blue-500/50 flex items-center justify-center text-blue-400 font-black text-xl">
            🔋
          </div>
        </div>

        {/* Stat 3: Grid Borrowing (RED if high, GREEN if zero) */}
        <div
          className={`factory-card p-5 border-l-8 flex items-center justify-between ${
            powerSource.gridKW > 0
              ? 'border-l-rose-500 glow-red'
              : 'border-l-emerald-500'
          }`}
        >
          <div>
            <div
              className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1 ${
                powerSource.gridKW > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              <Zap className="w-5 h-5" />
              <span>GRID BORROWING</span>
            </div>
            <div className="text-4xl font-black text-white tracking-tight">
              {powerSource.gridKW} <span className="text-xl font-bold">kW</span>
            </div>
            <p className="text-xs font-semibold mt-1">
              {powerSource.gridKW > 0 ? (
                <span className="text-rose-400 font-extrabold flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 inline" /> Borrowing paid power from grid
                </span>
              ) : (
                <span className="text-emerald-400 font-extrabold">✓ Zero borrowing — 100% Free Solar</span>
              )}
            </p>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border ${
              powerSource.gridKW > 0
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-400'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
            }`}
          >
            🔌
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="factory-card p-5 border-l-8 border-l-blue-500 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Battery className="w-5 h-5" />
              <span>BATTERY LEVEL</span>
            </div>
            <div className="text-4xl font-black text-white tracking-tight">
              {powerSource.batteryPercent ?? 0}<span className="text-xl font-bold text-blue-400">%</span>
            </div>
            <p className="text-xs text-slate-300 font-semibold mt-1">
              {powerSource.batteryCharging ? 'Charging from grid/solar' : 'Stored energy available'}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-950/80 border border-blue-500/50 flex items-center justify-center text-blue-400 text-2xl">
            🔋
          </div>
        </div>

        <div className="factory-card p-5 border-l-8 border-l-amber-500 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Fuel className="w-5 h-5" />
              <span>GENERATOR FUEL LEVEL</span>
            </div>
            <div className="text-4xl font-black text-white tracking-tight">
              {generator.fuelLevelLitres ?? 0}<span className="text-xl font-bold text-amber-400"> L</span>
            </div>
            <p className="text-xs text-slate-300 font-semibold mt-1">
              of {generator.fuelCapacityLitres ?? 0} L capacity · {generator.status || 'standby'}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 text-2xl">
            ⛽
          </div>
        </div>
      </div>

      {/* QUICK FACTORY OVERVIEW BANNER */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white leading-tight">Factory Floor Machines</h3>
            <p className="text-xs text-slate-300 font-medium">
              Total active power load: <span className="text-emerald-400 font-extrabold">{totalCurrentKW} kW</span> across {runningCount} active machines
            </p>
          </div>
        </div>

        {/* Filter Pills for Floor Workers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition ${
              filter === 'all'
                ? 'bg-slate-700 text-white border-slate-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            All ({machines.length})
          </button>
          <button
            onClick={() => setFilter('running')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition ${
              filter === 'running'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-900 text-emerald-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Running ({runningCount})
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition ${
              filter === 'scheduled'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Scheduled ({scheduledCount})
          </button>
          <button
            onClick={() => setFilter('off')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition ${
              filter === 'off'
                ? 'bg-slate-600 text-white border-slate-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Off ({offCount})
          </button>
        </div>
      </div>

      {/* MACHINE LIST (CARDS WITH BIG ON/OFF TOGGLES & STATUS BADGES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMachines.map((machine) => {
          const isRunning = machine.status === 'running';
          const isScheduled = machine.status === 'scheduled';

          return (
            <div
              key={machine.id}
              className={`factory-card p-5 flex flex-col justify-between space-y-4 border-2 transition-all duration-200 ${
                isRunning
                  ? 'border-emerald-500/40 bg-slate-900/90'
                  : isScheduled
                  ? 'border-amber-500/30 bg-slate-900/70'
                  : 'border-slate-800/80 opacity-90'
              }`}
            >
              {/* Machine Header & Big Status Badge */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-white leading-snug">{machine.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                      RATING: {machine.kWRating} kW
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Priority: <span className="uppercase text-white font-bold">{machine.priority}</span>
                    </span>
                  </div>
                </div>

                {/* Status Badge: Green = Running, Yellow = Scheduled, Grey = Off */}
                <div>
                  {isRunning && (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-600/30 border border-emerald-500 text-emerald-300 px-3 py-1.5 rounded-full font-black text-xs uppercase tracking-wider animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      RUNNING NOW
                    </span>
                  )}
                  {isScheduled && (
                    <span className="inline-flex items-center gap-1.5 bg-amber-600/30 border border-amber-500 text-amber-300 px-3 py-1.5 rounded-full font-black text-xs uppercase tracking-wider">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      SCHEDULED ({machine.scheduledOn})
                    </span>
                  )}
                  {machine.status === 'off' && (
                    <span className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-400 px-3 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                      POWER OFF
                    </span>
                  )}
                </div>
              </div>

              {/* KW Usage & Schedule Quick Summary */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">CURRENT LOAD</span>
                  <span
                    className={`text-2xl font-black ${
                      isRunning ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {machine.currentKW || 0} <span className="text-sm font-bold text-slate-400">kW</span>
                  </span>
                </div>

                <button
                  onClick={() => navigate('/machines')}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:bg-emerald-900/60 transition"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Edit Schedule</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Big ON/OFF Toggle Bar for Floor Workers */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                    MANUAL OVERRIDE SWITCH
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Tap to instantly turn ON/OFF</span>
                </div>

                <div className="flex items-center gap-3">
                  <LargeToggle
                    isOn={isRunning}
                    onToggle={() => toggleMachine(machine.id)}
                    labelOn="ON"
                    labelOff="OFF"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
