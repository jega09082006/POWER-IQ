// Initial mock data for PowerIQ Factory Energy Management System

export const INITIAL_POWER_SOURCE = {
  solarKW: 52.4,
  windKW: 14.2,
  batteryPercent: 84,
  gridKW: 0,
  currentSource: 'Solar', // 'Solar' | 'Battery' | 'Grid'
  gridPriceStatus: 'normal', // 'normal' | 'expensive'
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export const INITIAL_MACHINES = [
  {
    id: 'm1',
    name: 'Assembly Line A Conveyor',
    kWRating: 18,
    currentKW: 17.5,
    status: 'running', // 'running' | 'scheduled' | 'off'
    scheduledOn: '07:00',
    scheduledOff: '19:00',
    priority: 'essential', // 'essential' | 'flexible' | 'nonessential'
    isApproved: true,
    lastModifiedBy: 'Operator Dave',
  },
  {
    id: 'm2',
    name: 'Hydraulic Stamping Press #3',
    kWRating: 35,
    currentKW: 33.2,
    status: 'running',
    scheduledOn: '08:00',
    scheduledOff: '17:30',
    priority: 'essential',
    isApproved: true,
    lastModifiedBy: 'Operator Dave',
  },
  {
    id: 'm3',
    name: 'Plastic Injection Molding Machine',
    kWRating: 25,
    currentKW: 0,
    status: 'scheduled',
    scheduledOn: '11:00',
    scheduledOff: '16:00',
    priority: 'flexible',
    isApproved: true,
    lastModifiedBy: 'Worker Sam',
  },
  {
    id: 'm4',
    name: 'Industrial Air Compressor #1',
    kWRating: 12,
    currentKW: 11.8,
    status: 'running',
    scheduledOn: '06:00',
    scheduledOff: '22:00',
    priority: 'essential',
    isApproved: true,
    lastModifiedBy: 'Tech Supervisor',
  },
  {
    id: 'm5',
    name: 'CNC Milling Unit 4',
    kWRating: 22,
    currentKW: 0,
    status: 'off',
    scheduledOn: '14:00',
    scheduledOff: '20:00',
    priority: 'flexible',
    isApproved: false,
    lastModifiedBy: 'Worker Sam',
  },
  {
    id: 'm6',
    name: 'Main Packaging Line Robot',
    kWRating: 15,
    currentKW: 14.2,
    status: 'running',
    scheduledOn: '08:00',
    scheduledOff: '18:00',
    priority: 'essential',
    isApproved: true,
    lastModifiedBy: 'Operator Dave',
  },
  {
    id: 'm7',
    name: 'Factory Floor Ventilation Fan Array',
    kWRating: 8,
    currentKW: 7.8,
    status: 'running',
    scheduledOn: '06:00',
    scheduledOff: '22:00',
    priority: 'flexible',
    isApproved: true,
    lastModifiedBy: 'Cleaner Lead',
  },
  {
    id: 'm8',
    name: 'Heat Treatment Oven #2',
    kWRating: 40,
    currentKW: 0,
    status: 'off',
    scheduledOn: '22:00',
    scheduledOff: '05:00',
    priority: 'nonessential',
    isApproved: true,
    lastModifiedBy: 'Night Supervisor',
  }
];

export const INITIAL_GENERATOR = {
  fuelLevelLitres: 270,
  fuelCapacityLitres: 500,
  fuelNeededForCut: 390,
  status: 'standby', // 'standby' | 'running' | 'off'
  lastRefillDate: '2026-09-10'
};

export const INITIAL_ALERTS = [
  {
    id: 'alt-1',
    type: 'powercut',
    title: 'Upcoming Power Cut Detected',
    message: 'Utility provider scheduled grid cut on Sunday, Sept 20 from 10:00 AM to 04:00 PM (6 hours).',
    date: '2026-09-20',
    resolved: false,
    severity: 'danger'
  },
  {
    id: 'alt-2',
    type: 'fuellow',
    title: 'Diesel Fuel Shortfall Alert',
    message: 'Generator fuel is at 270L (54%). You need 120 more litres of diesel before Sept 20 cut.',
    date: '2026-09-18',
    resolved: false,
    severity: 'danger'
  },
  {
    id: 'alt-3',
    type: 'highcost',
    title: 'High Grid Electricity Rates',
    message: 'Grid price rate is elevated right now. Avoid turning on non-essential heavy machines.',
    date: '2026-09-18',
    resolved: false,
    severity: 'warning'
  }
];

// 14-day energy calendar mock data
export const generateInitialCalendarDays = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    let gridStatus = 'good'; // 'good' | 'cloudy' | 'expensive' | 'power_cut'
    let isBatteryChargeDay = false;
    let powerCutStart = null;
    let powerCutEnd = null;
    let customEvents = [];
    let solarForecastPercent = Math.floor(70 + Math.random() * 25);
    let windForecastSpeed = Math.floor(12 + Math.random() * 15);

    if (i === 0) {
      gridStatus = 'good';
      customEvents.push('Normal Full Shift');
    } else if (i === 2) { // 2 days from now: Sunday Power Cut
      gridStatus = 'power_cut';
      powerCutStart = '10:00 AM';
      powerCutEnd = '04:00 PM';
      customEvents.push('Utility Grid Cut (6 Hrs)');
    } else if (i === 1) { // Day before power cut: Forced Battery Charge Day!
      gridStatus = 'cloudy';
      isBatteryChargeDay = true;
      customEvents.push('Mandatory Battery Charge Day');
    } else if (i === 4) {
      gridStatus = 'expensive';
      customEvents.push('Peak Tariff Day ($0.42/kWh)');
    } else if (i === 6) {
      gridStatus = 'good';
      customEvents.push('Weekly Maintenance Window');
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
      customEvents.push('Weekend Reduced Shift');
    } else {
      customEvents.push('Normal Shift');
    }

    if (gridStatus === 'cloudy') solarForecastPercent = 42;
    if (gridStatus === 'power_cut') solarForecastPercent = 88;

    // Generate hourly solar profile (6 AM to 6 PM)
    const hourlySolar = [0, 5, 20, 45, 75, 92, 98, 85, 60, 35, 10, 0];
    const hourlyWind = [14, 15, 18, 20, 22, 19, 17, 16, 15, 14, 12, 11];

    days.push({
      date: dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      solarForecastPercent,
      windForecastSpeed,
      gridStatus,
      isBatteryChargeDay,
      powerCutStart,
      powerCutEnd,
      customEvents,
      hourlySolar,
      hourlyWind,
      scheduledMachinesCount: 5 + Math.floor(Math.random() * 3)
    });
  }
  return days;
};

// 2-Day (16 x 3-hour blocks) Prediction Data for Supervisor Panel
export const PREDICTION_BLOCKS = [
  { time: '00:00 - 03:00', solar: 0, load: 20, gridNeeded: 20, isCut: false },
  { time: '03:00 - 06:00', solar: 0, load: 18, gridNeeded: 18, isCut: false },
  { time: '06:00 - 09:00', solar: 25, load: 45, gridNeeded: 20, isCut: false },
  { time: '09:00 - 12:00', solar: 65, load: 50, gridNeeded: 0, isCut: false },
  { time: '12:00 - 15:00', solar: 80, load: 55, gridNeeded: 0, isCut: false },
  { time: '15:00 - 18:00', solar: 55, load: 48, gridNeeded: 0, isCut: false },
  { time: '18:00 - 21:00', solar: 10, load: 40, gridNeeded: 30, isCut: false },
  { time: '21:00 - 00:00', solar: 0, load: 25, gridNeeded: 25, isCut: false },
  
  // Day 2 (Sunday Power Cut between 10am and 4pm)
  { time: 'Day2 00:00', solar: 0, load: 15, gridNeeded: 15, isCut: false },
  { time: 'Day2 03:00', solar: 0, load: 15, gridNeeded: 15, isCut: false },
  { time: 'Day2 06:00', solar: 20, load: 35, gridNeeded: 15, isCut: false },
  { time: 'Day2 09:00', solar: 60, load: 50, gridNeeded: 0, isCut: true }, // Power cut block
  { time: 'Day2 12:00', solar: 75, load: 40, gridNeeded: 0, isCut: true }, // Power cut block
  { time: 'Day2 15:00', solar: 60, load: 42, gridNeeded: 0, isCut: true }, // Power cut block
  { time: 'Day2 18:00', solar: 15, load: 35, gridNeeded: 20, isCut: false },
  { time: 'Day2 21:00', solar: 0, load: 20, gridNeeded: 20, isCut: false },
];
