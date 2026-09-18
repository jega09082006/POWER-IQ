import React from 'react';
import { useEnergy } from '../context/EnergyContext';
import { PowerCutPage } from './PowerCutPage';
import { ShieldAlert, AlertTriangle, Bell, CheckCircle2 } from 'lucide-react';

export const AlertsPage = () => {
  const { alerts } = useEnergy();

  return (
    <div className="space-y-6">
      {/* System Active Alerts Header */}
      <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Bell className="w-5 h-5 animate-bounce" />
            <span>CRITICAL FACTORY ALERTS</span>
          </div>
          <h2 className="text-2xl font-black text-white">Active System Notifications</h2>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Automated alerts for power cuts, fuel requirements, and tariff rate increases.
          </p>
        </div>
      </div>

      {/* Embedded Power Cut Response Page */}
      <PowerCutPage />
    </div>
  );
};
