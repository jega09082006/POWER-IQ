import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEnergy } from '../context/EnergyContext';
import { Home, Cpu, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { alerts, isSupervisorUnlocked } = useEnergy();

  const unresolvedAlertCount = alerts.filter((a) => !a.resolved).length;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/machines', label: 'Machines', icon: Cpu },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle, badge: unresolvedAlertCount },
    { path: '/supervisor', label: 'Supervisor', icon: ShieldCheck, isSupervisor: true }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg shadow-2xl px-2 py-2">
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110 text-emerald-400' : 'text-slate-400'}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
                {item.isSupervisor && isSupervisorUnlocked && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900" />
                )}
              </div>
              <span className={`text-xs font-bold mt-1 ${isActive ? 'text-emerald-300 font-black' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
