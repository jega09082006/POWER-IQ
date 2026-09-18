import React from 'react';
import { Clock } from 'lucide-react';

export const TimeClockPicker = ({ label, value, onChange }) => {
  // Generate 24 hourly time slots (e.g. 06:00, 07:00, ..., 23:00)
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min of ['00', '30']) {
      const hStr = hour.toString().padStart(2, '0');
      const valStr = `${hStr}:${min}`;
      
      // Formatting for easy display (12-hr with AM/PM)
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const displayStr = `${displayHour}:${min} ${ampm}`;

      timeOptions.push({ value: valStr, display: displayStr });
    }
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-emerald-400" />
        {label}
      </label>
      <select
        value={value || '08:00'}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border-2 border-slate-700 text-white font-extrabold text-lg px-3 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none cursor-pointer"
      >
        {timeOptions.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-white py-1">
            ⏰ {opt.display} ({opt.value})
          </option>
        ))}
      </select>
    </div>
  );
};
