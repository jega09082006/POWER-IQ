import React, { useEffect, useMemo, useState } from 'react';
import { useEnergy } from '../context/EnergyContext';
import { LargeToggle } from '../components/LargeToggle';
import { TimeClockPicker } from '../components/TimeClockPicker';
import { Calendar, CheckCircle2, AlertTriangle, Sun, Zap, ShieldAlert, Save } from 'lucide-react';

export const SchedulePage = () => {
  const { machines, toggleMachine, updateMachineSchedule, calendarDays } = useEnergy();
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);
    return date.toISOString().split('T')[0];
  }), []);
  const [selectedDate, setSelectedDate] = useState(weekDates[0]);

  // Local draft state is keyed by machine and calendar date.
  const [drafts, setDrafts] = useState({});

  useEffect(() => {
    setDrafts((previous) => {
      const next = { ...previous };
      machines.forEach((machine) => {
        weekDates.forEach((date) => {
          const saved = machine.weeklySchedule?.[date];
          const key = `${machine.id}-${date}`;
          if (!next[key]) {
            next[key] = {
              onTime: saved?.scheduledOn || machine.scheduledOn || '08:00',
              offTime: saved?.scheduledOff || machine.scheduledOff || '17:00',
              savedSuccess: false,
              warningMsg: null
            };
          }
        });
      });
      return next;
    });
  }, [machines, weekDates]);

  const handleDraftChange = (id, field, value) => {
    const key = `${id}-${selectedDate}`;
    setDrafts((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
        savedSuccess: false,
        warningMsg: null
      }
    }));
  };

  const handleSaveSchedule = (id) => {
    const key = `${id}-${selectedDate}`;
    const draft = drafts[key];
    if (!draft) return;

    const result = updateMachineSchedule(id, draft.onTime, draft.offTime, selectedDate);

    setDrafts((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        savedSuccess: true,
        warningMsg: result.isLessThan12Hours ? result.message : null
      }
    }));

    // Auto-reset green checkmark after 4 seconds
    setTimeout(() => {
      setDrafts((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          savedSuccess: false
        }
      }));
    }, 4000);
  };

  // Helper to calculate solar & grid advice based on selected start time
  const getScheduleAdvice = (onTime) => {
    if (!onTime) return null;
    const hour = parseInt(onTime.split(':')[0], 10);

    // Check if power cut is active in calendar today/tomorrow
    const hasPowerCutToday = calendarDays.some(
      (d, idx) => idx === 0 && d.gridStatus === 'power_cut'
    );

    if (hasPowerCutToday && hour >= 10 && hour <= 16) {
      return {
        type: 'danger',
        text: '🚨 Power cut expected at this time — machine will pause automatically'
      };
    }

    // Solar peak window: 09:00 AM to 03:00 PM (09:00 - 15:00)
    if (hour >= 9 && hour <= 15) {
      return {
        type: 'good',
        text: '☀️ Solar is strong at this time — good choice for zero energy cost!'
      };
    }

    // Evening peak grid hours: 05:00 PM to 09:00 PM (17:00 - 21:00)
    if (hour >= 17 && hour <= 21) {
      return {
        type: 'warning',
        text: '⚡ Grid will be expensive at this time — consider shifting to daytime solar hours'
      };
    }

    return {
      type: 'good',
      text: '✓ Standard operational window selected'
    };
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Calendar className="w-5 h-5" />
            <span>MACHINE SCHEDULE MANAGER</span>
          </div>
          <h2 className="text-2xl font-black text-white">Shift & Timer Schedules</h2>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Set machine start and stop times using easy clock pickers. System automatically calculates solar savings!
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            <span>Running Now</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <span className="w-3 h-3 rounded-full bg-slate-500 inline-block"></span>
            <span>Off</span>
          </div>
        </div>
      </div>

      {/* ONE CARD PER MACHINE */}
      <div className="factory-card p-4 space-y-3">
        <div>
          <h3 className="text-lg font-black text-white">7-Day Machine Schedule Calendar</h3>
          <p className="text-xs text-slate-300 font-semibold">
            Select a day, then set a separate start and stop time for every machine.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {weekDates.map((date) => {
            const day = new Date(`${date}T00:00:00`);
            const isSelected = date === selectedDate;
            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-500'
                }`}
              >
                <span className="block text-xs font-black uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="block text-lg font-black">{day.getDate()}</span>
                <span className="block text-[10px] font-bold">{day.toLocaleDateString('en-US', { month: 'short' })}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {machines.map((machine) => {
          const isRunning = machine.status === 'running';
          const isScheduled = machine.status === 'scheduled';

          const draft = drafts[`${machine.id}-${selectedDate}`] || {
            onTime: machine.weeklySchedule?.[selectedDate]?.scheduledOn || machine.scheduledOn || '08:00',
            offTime: machine.weeklySchedule?.[selectedDate]?.scheduledOff || machine.scheduledOff || '17:00',
            savedSuccess: false,
            warningMsg: null
          };

          const advice = getScheduleAdvice(draft.onTime);

          return (
            <div
              key={machine.id}
              className={`factory-card p-6 flex flex-col justify-between space-y-5 border-2 transition-all ${
                isRunning
                  ? 'border-emerald-500/50 bg-slate-900/90'
                  : isScheduled
                  ? 'border-amber-500/40 bg-slate-900/80'
                  : 'border-slate-800'
              }`}
            >
              {/* Top Row: Machine Name, kW rating, and Status Dot */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Status Dot */}
                  {isRunning && (
                    <span
                      className="w-4 h-4 rounded-full bg-emerald-500 glow-green shrink-0 animate-pulse"
                      title="Running now"
                    ></span>
                  )}
                  {isScheduled && (
                    <span className="w-4 h-4 rounded-full bg-amber-400 shrink-0" title="Scheduled"></span>
                  )}
                  {machine.status === 'off' && (
                    <span className="w-4 h-4 rounded-full bg-slate-600 shrink-0" title="Off"></span>
                  )}

                  <div>
                    <h3 className="text-xl font-black text-white">{machine.name}</h3>
                    <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded border border-slate-700">
                      RATING: {machine.kWRating} kW
                    </span>
                  </div>
                </div>

                {/* Big Toggle for manual ON/OFF */}
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    MANUAL POWER
                  </span>
                  <LargeToggle
                    isOn={isRunning}
                    onToggle={() => toggleMachine(machine.id)}
                    labelOn="ON"
                    labelOff="OFF"
                  />
                </div>
              </div>

              {/* TIME PICKERS FOR ON & OFF TIME */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <TimeClockPicker
                    label="START TIME (ON)"
                    value={draft.onTime}
                    onChange={(val) => handleDraftChange(machine.id, 'onTime', val)}
                  />
                  <TimeClockPicker
                    label="STOP TIME (OFF)"
                    value={draft.offTime}
                    onChange={(val) => handleDraftChange(machine.id, 'offTime', val)}
                  />
                </div>

                {/* SMART ADVICE MESSAGE BELOW TIME PICKERS */}
                {advice && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-bold flex items-start gap-2 ${
                      advice.type === 'good'
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                        : advice.type === 'warning'
                        ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                        : 'bg-rose-950/70 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {advice.type === 'good' && <Sun className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />}
                    {advice.type === 'warning' && <Zap className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />}
                    {advice.type === 'danger' && <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />}
                    <span>{advice.text}</span>
                  </div>
                )}
              </div>

              {/* WARNING IF SCHEDULED <12 HOURS AHEAD */}
              {draft.warningMsg && (
                <div className="bg-amber-950/90 border-2 border-amber-500 text-amber-200 p-3 rounded-xl text-xs font-extrabold flex items-center gap-2 animate-bounce">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>⚠️ {draft.warningMsg}</span>
                </div>
              )}

              {/* SAVE BUTTON WITH GREEN TICK CONFIRMATION */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  {machine.isApproved ? (
                    <span className="text-emerald-400 font-bold">✓ Approved by Supervisor</span>
                  ) : (
                    <span className="text-amber-400 font-bold">⏳ Pending Supervisor Approval</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveSchedule(machine.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider border transition cursor-pointer shadow-lg ${
                    draft.savedSuccess
                      ? 'bg-emerald-600 text-white border-emerald-400 glow-green'
                      : 'bg-slate-800 hover:bg-emerald-600 text-white border-slate-700 hover:border-emerald-500'
                  }`}
                >
                  {draft.savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      <span>✓ Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Schedule</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
