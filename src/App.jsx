import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EnergyProvider } from './context/EnergyContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { SchedulePage } from './pages/SchedulePage';
import { CalendarPage } from './pages/CalendarPage';
import { AlertsPage } from './pages/AlertsPage';
import { SupervisorPage } from './pages/SupervisorPage';

export function App() {
  return (
    <EnergyProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
          <Header />
          <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/machines" element={<SchedulePage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/supervisor" element={<SupervisorPage />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </BrowserRouter>
    </EnergyProvider>
  );
}

export default App;
