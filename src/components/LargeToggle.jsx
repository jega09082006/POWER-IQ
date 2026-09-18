import React from 'react';

export const LargeToggle = ({ isOn, onToggle, labelOn = 'ON', labelOff = 'OFF', disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex items-center h-10 rounded-full w-20 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/40 cursor-pointer ${
        isOn ? 'bg-emerald-600 border-2 border-emerald-400' : 'bg-slate-700 border-2 border-slate-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-pressed={isOn}
    >
      <span className="sr-only">Toggle Machine</span>
      <span
        className={`inline-block w-8 h-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 flex items-center justify-center font-bold text-xs ${
          isOn ? 'translate-x-11 text-emerald-800' : 'translate-x-1 text-slate-800'
        }`}
      >
        {isOn ? 'I' : 'O'}
      </span>
      <span
        className={`absolute font-extrabold text-sm uppercase tracking-wider ${
          isOn ? 'left-3 text-white' : 'right-3 text-slate-300'
        }`}
      >
        {isOn ? labelOn : labelOff}
      </span>
    </button>
  );
};
