import React, { useState } from 'react';
import { useEnergy } from '../context/EnergyContext';
import { SimpleBarChart } from '../components/SimpleBarChart';
import { Calendar as CalendarIcon, Sun, Wind, ShieldAlert, Plus, X, Check, BatteryCharging, Wrench, Briefcase } from 'lucide-react';

export const CalendarPage = () => {
  const {
    calendarDays,
    isSupervisorUnlocked,
    addCalendarEvent,
    deleteCalendarEvent,
    setCalendarEvent,
    updateCalendarDecision,
    generator
  } = useEnergy();
  const [selectedDay, setSelectedDay] = useState(calendarDays[0]);
  const [newEventText, setNewEventText] = useState('');
  const [presetEvent, setPresetEvent] = useState('Maintenance Day');
  const [dayEvent, setDayEvent] = useState('Normal Working Day');
  const [decision, setDecision] = useState('good');
  const [cutStart, setCutStart] = useState('10:00 AM');
  const [cutEnd, setCutEnd] = useState('04:00 PM');

  const getDayCardStyle = (day) => {
    if (day.gridStatus === 'power_cut') {
      return 'bg-rose-950/80 border-2 border-rose-500 glow-red text-white';
    }
    if (day.isBatteryChargeDay) {
      return 'bg-slate-900 border-4 border-rose-700 text-white shadow-xl';
    }
    if (day.gridStatus === 'expensive') {
      return 'bg-amber-950/80 border-2 border-amber-500 glow-yellow text-white';
    }
    if (day.gridStatus === 'cloudy') {
      return 'bg-yellow-950/60 border-2 border-yellow-600/70 text-white';
    }
    return 'bg-emerald-950/60 border-2 border-emerald-500/70 text-white';
  };

  const handleDayEventChange = (e) => {
    e.preventDefault();
    if (!selectedDay) return;
    setCalendarEvent(selectedDay.date, dayEvent);
    setSelectedDay((previous) => ({
      ...previous,
      customEvents: [
        dayEvent,
        ...(previous.customEvents || []).filter((event) => ![
          'Normal Working Day',
          'Factory Holiday',
          'Government Shutdown',
          'Maintenance Day'
        ].includes(event))
      ]
    }));
  };

  const getStatusBadge = (day) => {
    if (day.gridStatus === 'power_cut') {
      return <span className="text-[11px] font-black uppercase tracking-wider bg-rose-600 px-2 py-0.5 rounded text-white">Power Cut</span>;
    }
    if (day.isBatteryChargeDay) {
      return <span className="text-[11px] font-black uppercase tracking-wider bg-rose-900 text-rose-200 border border-rose-600 px-2 py-0.5 rounded">Charge Day</span>;
    }
    if (day.gridStatus === 'expensive') {
      return <span className="text-[11px] font-black uppercase tracking-wider bg-amber-600 px-2 py-0.5 rounded text-white">High Grid Cost</span>;
    }
    if (day.gridStatus === 'cloudy') {
      return <span className="text-[11px] font-black uppercase tracking-wider bg-yellow-600 px-2 py-0.5 rounded text-white">Cloudy Day</span>;
    }
    return <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-600 px-2 py-0.5 rounded text-white">Good Solar</span>;
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    const textToAdd = newEventText.trim() || presetEvent;
    if (selectedDay && textToAdd) {
      addCalendarEvent(selectedDay.date, textToAdd);
      // Refresh local selected day object
      setSelectedDay((prev) => ({
        ...prev,
        customEvents: [...prev.customEvents, textToAdd]
      }));
      setNewEventText('');
    }
  };

  const handleDecisionChange = (e) => {
    e.preventDefault();
    if (!selectedDay) return;
    updateCalendarDecision(selectedDay.date, {
      grid_status: decision,
      power_cut_start: decision === 'power_cut' ? cutStart : null,
      power_cut_end: decision === 'power_cut' ? cutEnd : null
    });
    setSelectedDay((previous) => ({
      ...previous,
      gridStatus: decision,
      powerCutStart: decision === 'power_cut' ? cutStart : null,
      powerCutEnd: decision === 'power_cut' ? cutEnd : null
    }));
  };

  const handleDeleteEvent = (eventIndex) => {
    if (!selectedDay) return;
    deleteCalendarEvent(selectedDay.date, eventIndex);
    setSelectedDay((previous) => ({
      ...previous,
      customEvents: previous.customEvents.filter((_, index) => index !== eventIndex)
    }));
  };

  // Convert hourly array to chart format
  const solarChartData = (selectedDay?.hourlySolar || [10, 20, 40, 60, 80, 95, 80, 50, 30, 10]).map(
    (val, idx) => ({
      hour: `${idx + 7}:00`,
      solar: val
    })
  );

  const windChartData = (selectedDay?.hourlyWind || [12, 14, 16, 18, 20, 18, 15, 12, 10, 8]).map(
    (val, idx) => ({
      hour: `${idx + 7}:00`,
      wind: val
    })
  );

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <CalendarIcon className="w-5 h-5" />
            <span>14-DAY FORECAST & EVENTS</span>
          </div>
          <h2 className="text-2xl font-black text-white">Factory Energy Calendar</h2>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Pulls solar & wind weather forecasts with power cut windows. Click any day to see detailed charts!
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700 text-xs font-bold">
          <span className="flex items-center gap-1 text-emerald-400"><span className="w-3 h-3 bg-emerald-600 rounded"></span> Good Solar</span>
          <span className="flex items-center gap-1 text-yellow-400"><span className="w-3 h-3 bg-yellow-600 rounded"></span> Cloudy</span>
          <span className="flex items-center gap-1 text-amber-400"><span className="w-3 h-3 bg-amber-600 rounded"></span> High Grid Cost</span>
          <span className="flex items-center gap-1 text-rose-400"><span className="w-3 h-3 bg-rose-600 rounded"></span> Power Cut</span>
          <span className="flex items-center gap-1 text-rose-300"><span className="w-3 h-3 border-2 border-rose-600 rounded"></span> Charge Day</span>
        </div>
      </div>

      {/* 14-DAY CALENDAR GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {calendarDays.map((day) => {
          const isSelected = selectedDay?.date === day.date;
          return (
            <button
              key={day.date}
              onClick={() => setSelectedDay(day)}
              className={`p-3 rounded-2xl flex flex-col justify-between text-left transition-all duration-200 cursor-pointer min-h-[110px] ${getDayCardStyle(
                day
              )} ${isSelected ? 'ring-4 ring-white scale-105 z-10' : 'opacity-90 hover:opacity-100'}`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-extrabold text-sm">{day.dayName}</span>
                  {day.isBatteryChargeDay && <BatteryCharging className="w-4 h-4 text-rose-400 animate-pulse" />}
                </div>
                {getStatusBadge(day)}
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                  <span>☀️ Solar:</span>
                  <span className="text-emerald-300">{day.solarForecastPercent}%</span>
                </div>
                {day.powerCutStart && (
                  <div className="text-[10px] font-black text-rose-200 bg-rose-900/90 px-1.5 py-0.5 rounded">
                    CUT: {day.powerCutStart}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* EXPANDED DAY DETAIL PANEL */}
      {selectedDay && (
        <div className="factory-card p-6 space-y-6 border-2 border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-white">{selectedDay.dayName} Energy Breakdown</h3>
                {getStatusBadge(selectedDay)}
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Data combined from Weather API, Wind Speed API, and Utility Grid Schedule
              </p>
            </div>

            {/* Quick KPI pills */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">SOLAR FORECAST</span>
                <span className="text-xl font-black text-emerald-400">{selectedDay.solarForecastPercent}%</span>
              </div>
              <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">WIND SPEED</span>
                <span className="text-xl font-black text-blue-400">{selectedDay.windForecastSpeed} km/h</span>
              </div>
            </div>
          </div>

          {/* POWER CUT / CHARGE DAY NOTIFICATION BOX IF APPLICABLE */}
          {selectedDay.gridStatus === 'power_cut' && (
            <div className="bg-rose-950/90 border-2 border-rose-500 p-4 rounded-2xl text-white flex items-start gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0 animate-bounce" />
              <div>
                <h4 className="text-lg font-black text-rose-200">
                  ⚠️ Power Cut Scheduled: {selectedDay.powerCutStart} to {selectedDay.powerCutEnd}
                </h4>
                <p className="text-sm text-slate-200 font-semibold mt-0.5">
                  Backup Generator status: <strong className="uppercase text-amber-300">{generator.status}</strong>. Battery will power essential machines.
                </p>
              </div>
            </div>
          )}

          {selectedDay.isBatteryChargeDay && (
            <div className="bg-rose-900/60 border-2 border-rose-600 p-4 rounded-2xl text-white flex items-start gap-3">
              <BatteryCharging className="w-8 h-8 text-rose-300 shrink-0 animate-pulse" />
              <div>
                <h4 className="text-lg font-black text-rose-100">
                  🔋 Mandatory Battery Charge Day (100% Target)
                </h4>
                <p className="text-sm text-slate-200 font-semibold mt-0.5">
                  Tomorrow has a scheduled power cut. Battery charging will be forced to 100% capacity today.
                </p>
              </div>
            </div>
          )}

          {/* TWO FORECAST BAR CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SimpleBarChart
              data={solarChartData}
              dataKey="solar"
              nameKey="hour"
              colorScheme="solar"
              title="☀️ Hourly Solar Output Forecast (kW)"
            />
            <SimpleBarChart
              data={windChartData}
              dataKey="wind"
              nameKey="hour"
              colorScheme="wind"
              title="💨 Hourly Wind Generation Forecast (kW)"
            />
          </div>

          {/* CUSTOM EVENTS & SCHEDULED MACHINES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Custom Events List */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                Scheduled Factory Events
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedDay.customEvents.map((ev, idx) => (
                  <span key={idx} className="bg-slate-800 text-emerald-300 border border-slate-700 px-3 py-1.5 rounded-xl font-extrabold text-xs inline-flex items-center gap-2">
                    📌 {ev}
                    {isSupervisorUnlocked && (
                      <button type="button" onClick={() => handleDeleteEvent(idx)} className="text-rose-300 hover:text-rose-100" title="Delete event">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* SUPERVISOR ADD EVENT FORM */}
              {isSupervisorUnlocked ? (
                <form onSubmit={handleAddEvent} className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-purple-300 block">Supervisor: Add Custom Calendar Event</span>
                  <div className="flex gap-2">
                    <select
                      value={presetEvent}
                      onChange={(e) => setPresetEvent(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-white text-xs font-bold px-2 py-2 rounded-xl"
                    >
                      <option value="Factory Holiday">🎉 Factory Holiday</option>
                      <option value="Double Shift">⚡ Double Shift</option>
                      <option value="Maintenance Day">🔧 Maintenance Day</option>
                      <option value="Manual Power Cut">🚨 Manual Power Cut</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Or custom title..."
                      value={newEventText}
                      onChange={(e) => setNewEventText(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-purple-500 focus:outline-none"
                    />

                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-[11px] text-slate-400 font-medium italic pt-2">
                  Workers can view calendar decisions and events. Unlock Supervisor mode to change this day&apos;s event.
                </p>
              )}

              {isSupervisorUnlocked && (
                <form onSubmit={handleDayEventChange} className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-purple-300 block">Supervisor: Set this day&apos;s official event</span>
                  <div className="flex gap-2">
                    <select value={dayEvent} onChange={(e) => setDayEvent(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 text-white text-xs font-bold px-2 py-2 rounded-xl">
                      <option value="Normal Working Day">Normal Working Day</option>
                      <option value="Factory Holiday">Factory Holiday</option>
                      <option value="Government Shutdown">Government Shutdown</option>
                      <option value="Maintenance Day">Maintenance Day</option>
                    </select>
                    <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl">
                      Set Event
                    </button>
                  </div>
                </form>
              )}

              {isSupervisorUnlocked && (
                <form onSubmit={handleDecisionChange} className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-purple-300 block">Supervisor: Change Government/Factory Decision</span>
                  <div className="flex flex-wrap gap-2">
                    <select value={decision} onChange={(e) => setDecision(e.target.value)} className="bg-slate-950 border border-slate-700 text-white text-xs font-bold px-2 py-2 rounded-xl">
                      <option value="good">Normal / Good Solar</option>
                      <option value="cloudy">Cloudy</option>
                      <option value="expensive">High Grid Cost</option>
                      <option value="power_cut">Government Power Cut</option>
                    </select>
                    {decision === 'power_cut' && (
                      <>
                        <input value={cutStart} onChange={(e) => setCutStart(e.target.value)} placeholder="Start, e.g. 10:00 AM" className="bg-slate-950 border border-slate-700 text-white text-xs px-2 py-2 rounded-xl" />
                        <input value={cutEnd} onChange={(e) => setCutEnd(e.target.value)} placeholder="End, e.g. 04:00 PM" className="bg-slate-950 border border-slate-700 text-white text-xs px-2 py-2 rounded-xl" />
                      </>
                    )}
                    <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl">
                      Apply Decision
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Scheduled Machines Summary */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                Factory Operational Load
              </h4>
              <p className="text-xs text-slate-300 font-medium">
                {selectedDay.scheduledMachinesCount} factory machines scheduled for production on {selectedDay.dayName}.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">Essential Machines:</span>
                  <span className="text-emerald-400">4 Active</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">Flexible Machines:</span>
                  <span className="text-amber-400">2 Active</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">Est. Solar Coverage:</span>
                  <span className="text-emerald-300">{selectedDay.solarForecastPercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
