import React, { useState } from 'react';
import { useEnergy } from '../context/EnergyContext';
import { SimpleBarChart } from '../components/SimpleBarChart';
import { PREDICTION_BLOCKS } from '../data/mockData';
import {
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Fuel,
  Battery,
  Power,
  DollarSign,
  Zap,
  Sun,
  AlertTriangle,
  History,
  TrendingUp
} from 'lucide-react';

export const SupervisorPage = () => {
  const {
    isSupervisorUnlocked,
    unlockSupervisor,
    lockSupervisor,
    machines,
    forceMachineState,
    addMachine,
    deleteMachine,
    approveSchedule,
    rejectSchedule,
    generator,
    refillGeneratorFuel,
    setGeneratorFuelManual,
    forceGridBatteryCharge,
    stopForceGridBatteryCharge,
    powerSource,
    alerts
  } = useEnergy();

  // PIN login state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Manual fuel input state
  const [fuelManualInput, setFuelManualInput] = useState(generator.fuelLevelLitres);
  const [refillAmount, setRefillAmount] = useState(120);
  const [fuelSavedMsg, setFuelSavedMsg] = useState(false);
  const [newMachine, setNewMachine] = useState({
    name: '',
    kWRating: '',
    priority: 'flexible'
  });

  const handlePinSubmit = (e) => {
    e.preventDefault();
    const success = unlockSupervisor(pinInput);
    if (!success) {
      setPinError(true);
      setPinInput('');
    } else {
      setPinError(false);
    }
  };

  const handleManualFuelSave = (e) => {
    e.preventDefault();
    setGeneratorFuelManual(parseFloat(fuelManualInput));
    setFuelSavedMsg(true);
    setTimeout(() => setFuelSavedMsg(false), 3000);
  };

  const handleRefillAdd = () => {
    refillGeneratorFuel(parseFloat(refillAmount));
    setFuelManualInput((prev) => Math.min(generator.fuelCapacityLitres, prev + parseFloat(refillAmount)));
    setFuelSavedMsg(true);
    setTimeout(() => setFuelSavedMsg(false), 3000);
  };

  const handleForceGridCharge = async () => {
    const result = await forceGridBatteryCharge();
    if (result) {
      setFuelSavedMsg(true);
      setTimeout(() => setFuelSavedMsg(false), 3000);
    }
  };

  const handleAddMachine = async (e) => {
    e.preventDefault();
    const machine = await addMachine({
      ...newMachine,
      kWRating: Number(newMachine.kWRating)
    });
    if (machine) {
      setNewMachine({ name: '', kWRating: '', priority: 'flexible' });
    }
  };

  const handleDeleteMachine = async (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      await deleteMachine(id);
    }
  };

  // KPI Calculations
  const totalPowerConsumedKW = machines
    .filter((m) => m.status === 'running')
    .reduce((sum, m) => sum + (m.currentKW || 0), 0)
    .toFixed(1);

  const totalSolarGeneratedKWh = 420;
  const totalGridBorrowedKWh = 12;
  const costSavedDollars = Math.round(totalSolarGeneratedKWh * 0.38);

  const unapprovedSchedules = machines.filter((m) => !m.isApproved);

  // If locked, render PIN pad prompt
  if (!isSupervisorUnlocked) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <div className="factory-card p-8 border-2 border-purple-500/50 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-purple-950/80 border-2 border-purple-500 mx-auto flex items-center justify-center text-purple-400">
            <Lock className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Supervisor Portal Access</h2>
            <p className="text-xs text-slate-300 font-semibold mt-1">
              Protected area for factory managers. Please enter supervisor PIN.
            </p>
            <p className="text-xs text-emerald-400 font-bold mt-1">Default Demo PIN: 1234</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter 4-digit PIN"
              className="w-full text-center tracking-[1em] text-3xl font-black bg-slate-950 border-2 border-purple-500/50 py-3 rounded-2xl text-white focus:outline-none focus:border-purple-400"
              autoFocus
            />

            {pinError && (
              <p className="text-xs font-black text-rose-400 animate-bounce">
                ❌ Invalid PIN! Try entering 1234.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-lg py-3 rounded-2xl uppercase tracking-wider transition cursor-pointer shadow-lg"
            >
              Unlock Supervisor Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Supervisor Header */}
      <div className="bg-purple-950/80 border-2 border-purple-500 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-black uppercase text-purple-300 tracking-wider">
              SUPERVISOR CONTROL CENTER
            </span>
            <h2 className="text-2xl font-black text-white">Factory Operations & Approvals</h2>
          </div>
        </div>

        <button
          onClick={lockSupervisor}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/40 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
        >
          <Lock className="w-4 h-4" />
          <span>Lock Panel</span>
        </button>
      </div>

      {/* 4 OVERVIEW KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="factory-card p-5 border-l-8 border-l-emerald-500">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">POWER LOAD TODAY</span>
          <span className="text-3xl font-black text-white">{totalPowerConsumedKW} <span className="text-sm font-bold text-emerald-400">kW</span></span>
          <p className="text-xs text-slate-300 font-semibold mt-1">Across all running machinery</p>
        </div>

        <div className="factory-card p-5 border-l-8 border-l-emerald-400">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">SOLAR GENERATED TODAY</span>
          <span className="text-3xl font-black text-emerald-400">{totalSolarGeneratedKWh} <span className="text-sm font-bold text-white">kWh</span></span>
          <p className="text-xs text-slate-300 font-semibold mt-1">Free clean energy generated</p>
        </div>

        <div className="factory-card p-5 border-l-8 border-l-blue-500">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">GRID BORROWED TODAY</span>
          <span className="text-3xl font-black text-blue-400">{totalGridBorrowedKWh} <span className="text-sm font-bold text-white">kWh</span></span>
          <p className="text-xs text-slate-300 font-semibold mt-1">Minimal grid fallback used</p>
        </div>

        <div className="factory-card p-5 border-l-8 border-l-purple-500 glow-purple">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">COST SAVINGS TODAY</span>
          <span className="text-3xl font-black text-purple-300">${costSavedDollars}</span>
          <p className="text-xs text-emerald-400 font-bold mt-1">Saved vs 100% full grid day</p>
        </div>

        <div className="factory-card p-5 border-l-8 border-l-blue-500">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">BATTERY LEVEL</span>
          <span className="text-3xl font-black text-blue-400">
            {powerSource.batteryPercent ?? 0}<span className="text-sm font-bold text-white">%</span>
          </span>
          <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${Math.min(100, Math.max(0, powerSource.batteryPercent ?? 0))}%` }}
            />
          </div>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            {powerSource.batteryCharging ? 'Charging now' : 'Available stored energy'}
          </p>
        </div>

        <div className="factory-card p-5 border-l-8 border-l-amber-500">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">GENERATOR FUEL LEVEL</span>
          <span className="text-3xl font-black text-amber-400">
            {generator.fuelLevelLitres ?? 0}<span className="text-sm font-bold text-white"> L</span>
          </span>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            of {generator.fuelCapacityLitres ?? 0} L capacity
          </p>
          <p className="text-xs text-amber-300 font-bold mt-1 uppercase">{generator.status || 'standby'}</p>
        </div>
      </div>

      {/* MACHINE OVERRIDE CONTROLS */}
      <div className="factory-card p-6 space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Power className="w-6 h-6 text-purple-400" />
          Supervisor Machine Override Controls
        </h3>
        <p className="text-xs text-slate-300 font-semibold">
          Force any machine ON or OFF immediately. Overrides worker timers and standard automated schedule.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {machines.map((m) => (
            <div
              key={m.id}
              className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-3"
            >
              <div>
                <h4 className="font-extrabold text-white text-base leading-tight">{m.name}</h4>
                <span className="text-xs text-slate-400 font-bold">Rating: {m.kWRating} kW • Status: <strong className="uppercase text-emerald-400">{m.status}</strong></span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => forceMachineState(m.id, 'running')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition cursor-pointer border ${
                    m.status === 'running'
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-emerald-600 hover:text-white'
                  }`}
                >
                  Force ON
                </button>
                <button
                  onClick={() => forceMachineState(m.id, 'off')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition cursor-pointer border ${
                    m.status === 'off'
                      ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-rose-600 hover:text-white'
                  }`}
                >
                  Force OFF
                </button>
                <button
                  onClick={() => handleDeleteMachine(m.id, m.name)}
                  className="px-3 py-1.5 rounded-lg text-xs font-black uppercase transition cursor-pointer border bg-slate-800 text-rose-300 border-rose-500/50 hover:bg-rose-600 hover:text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddMachine} className="bg-slate-900/90 border border-purple-500/40 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <label className="text-xs font-bold text-slate-300">
            Machine name
            <input required value={newMachine.name} onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })} className="mt-1 w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl" />
          </label>
          <label className="text-xs font-bold text-slate-300">
            Power rating (kW)
            <input required min="0.1" step="0.1" type="number" value={newMachine.kWRating} onChange={(e) => setNewMachine({ ...newMachine, kWRating: e.target.value })} className="mt-1 w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl" />
          </label>
          <label className="text-xs font-bold text-slate-300">
            Priority
            <select value={newMachine.priority} onChange={(e) => setNewMachine({ ...newMachine, priority: e.target.value })} className="mt-1 w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl">
              <option value="essential">Essential</option>
              <option value="flexible">Flexible</option>
              <option value="nonessential">Nonessential</option>
            </select>
          </label>
          <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-black px-4 py-2 rounded-xl">
            Add Machine
          </button>
        </form>
      </div>

      {/* SCHEDULE APPROVAL WORKFLOW */}
      <div className="factory-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Worker Schedule Entry Approvals
          </h3>
          <span className="bg-purple-900 text-purple-200 border border-purple-500 font-black text-xs px-3 py-1 rounded-full">
            {unapprovedSchedules.length} Pending Approvals
          </span>
        </div>

        {unapprovedSchedules.length === 0 ? (
          <div className="bg-slate-900 p-4 rounded-xl text-xs text-emerald-400 font-bold border border-slate-800 text-center">
            ✓ All worker schedule entries are approved!
          </div>
        ) : (
          <div className="space-y-3">
            {unapprovedSchedules.map((m) => (
              <div
                key={m.id}
                className="bg-slate-900 p-4 rounded-2xl border-2 border-amber-500/60 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-extrabold text-white text-base">{m.name}</h4>
                  <p className="text-xs text-slate-300 font-semibold mt-0.5">
                    Proposed Schedule: <span className="text-amber-400 font-bold">{m.scheduledOn} to {m.scheduledOff}</span> (Modified by: {m.lastModifiedBy})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => approveSchedule(m.id)}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => rejectSchedule(m.id)}
                    className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-4 py-2 rounded-xl cursor-pointer shadow-md"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GENERATOR MANAGEMENT */}
      <div className="factory-card p-6 space-y-4 border-2 border-blue-500/50">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-400" />
          Emergency Battery Grid Recharge
        </h3>
        <p className="text-xs text-slate-300 font-semibold">
          Supervisor-only override. This forces grid power into the battery and keeps charging enabled until stopped.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleForceGridCharge}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-4 py-2 rounded-xl cursor-pointer shadow-md"
          >
            Force Recharge from Grid
          </button>
          <button
            type="button"
            onClick={stopForceGridBatteryCharge}
            className="bg-slate-700 hover:bg-slate-600 text-white font-black text-xs px-4 py-2 rounded-xl cursor-pointer shadow-md"
          >
            Stop Forced Recharge
          </button>
          <span className="text-xs font-bold text-slate-300">
            {powerSource.forceGridCharging ? 'Grid charging forced' : 'Automatic charging mode'}
          </span>
        </div>
      </div>

      <div className="factory-card p-6 space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Fuel className="w-6 h-6 text-amber-400" />
          Generator Fuel Log & Manual Override
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Quick Refill Log */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-extrabold text-slate-200">Log Diesel Refill Delivery</h4>
            <div className="flex gap-2">
              <input
                type="number"
                value={refillAmount}
                onChange={(e) => setRefillAmount(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white text-sm font-extrabold px-3 py-2 rounded-xl w-32 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleRefillAdd}
                className="bg-amber-600 hover:bg-amber-500 text-white font-black text-xs px-4 py-2 rounded-xl cursor-pointer shadow-md"
              >
                + Log Delivery (Litres)
              </button>
            </div>
          </div>

          {/* Manual Set Level */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-extrabold text-slate-200">Set Exact Tank Level Manually</h4>
            <form onSubmit={handleManualFuelSave} className="flex gap-2">
              <input
                type="number"
                value={fuelManualInput}
                onChange={(e) => setFuelManualInput(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white text-sm font-extrabold px-3 py-2 rounded-xl w-32 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-4 py-2 rounded-xl cursor-pointer shadow-md"
              >
                Save Level
              </button>
            </form>
          </div>
        </div>

        {fuelSavedMsg && (
          <p className="text-xs font-bold text-emerald-400 animate-bounce">✓ Generator fuel level updated successfully!</p>
        )}
      </div>

      {/* 2-DAY 3-HOUR PREDICTION BAR CHART */}
      <div className="factory-card p-6 space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          2-Day 3-Hour Energy Load & Power Cut Prediction Chart
        </h3>
        <p className="text-xs text-slate-300 font-semibold">
          Green bars = Solar covers full load. Red bars = Grid needed with kW shortfall. Cut blocks highlighted.
        </p>

        <SimpleBarChart
          data={PREDICTION_BLOCKS}
          dataKey="load"
          nameKey="time"
          colorScheme="solar"
          title="Predictive 3-Hour Energy Demand Profile"
        />
      </div>

      {/* ALERT HISTORY LOG */}
      <div className="factory-card p-6 space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <History className="w-6 h-6 text-slate-400" />
          Factory System Alert History Log
        </h3>

        <div className="space-y-2">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs"
            >
              <div>
                <span className="font-extrabold text-white text-sm block">{alt.title}</span>
                <p className="text-slate-300 font-medium">{alt.message}</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded shrink-0">
                {alt.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
