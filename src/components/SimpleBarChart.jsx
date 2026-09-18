import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const SimpleBarChart = ({ data, dataKey = 'value', nameKey = 'name', colorScheme = 'solar', title = '' }) => {
  // Determine color per bar if not explicitly passed
  const getBarColor = (entry) => {
    if (entry.color) return entry.color;
    if (entry.isCut) return '#ef4444'; // Red for power cut
    if (entry.gridNeeded > 0) return '#f59e0b'; // Yellow/Amber for grid borrowing
    if (colorScheme === 'solar') return '#22c55e'; // Green for solar
    if (colorScheme === 'wind') return '#3b82f6'; // Blue for wind
    return '#10b981';
  };

  return (
    <div className="w-full bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
      {title && <h4 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">{title}</h4>}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey={nameKey} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#fff',
                fontWeight: 'bold'
              }}
            />
            <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
