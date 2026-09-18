import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:8000/api');
const BROWSER_ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';
const IS_SAME_ORIGIN_API =
  API_BASE.startsWith('/') || Boolean(BROWSER_ORIGIN && API_BASE.startsWith(BROWSER_ORIGIN));
const POWER_SOCKET_URL = IS_SAME_ORIGIN_API
  ? null
  : API_BASE.replace(/^http/, 'ws').replace(/\/api\/?$/, '/ws/power');

const EMPTY_POWER_SOURCE = {
  solarKW: 0,
  windKW: 0,
  batteryPercent: 0,
  gridKW: 0,
  currentSource: 'Solar',
  gridPriceStatus: 'normal',
  lastUpdated: '--:--'
};

const EMPTY_GENERATOR = {
  fuelLevelLitres: 0,
  fuelCapacityLitres: 0,
  fuelNeededForCut: 0,
  status: 'standby',
  lastRefillDate: null
};

const EnergyContext = createContext();

const getErrorMessage = (requestError, fallback) =>
  requestError?.response?.data?.detail?.message ||
  requestError?.response?.data?.detail ||
  requestError?.message ||
  fallback;

export const EnergyProvider = ({ children }) => {
  const [powerSource, setPowerSource] = useState(EMPTY_POWER_SOURCE);
  const [machines, setMachines] = useState([]);
  const [generator, setGenerator] = useState(EMPTY_GENERATOR);
  const [alerts, setAlerts] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  const [prediction, setPrediction] = useState([]);
  const [activeMachines, setActiveMachines] = useState([]);
  const [isSupervisorUnlocked, setIsSupervisorUnlocked] = useState(
    () => Boolean(localStorage.getItem('supervisor_token'))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supervisorToken = () => localStorage.getItem('supervisor_token');
  const authConfig = () => {
    const token = supervisorToken();
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [machinesResponse, powerResponse, generatorResponse, alertsResponse, calendarResponse, predictionResponse] =
        await Promise.all([
          axios.get(`${API_BASE}/machines`),
          axios.get(`${API_BASE}/power/current`),
          axios.get(`${API_BASE}/generator`),
          axios.get(`${API_BASE}/alerts`),
          axios.get(`${API_BASE}/calendar`),
          axios.get(`${API_BASE}/power/prediction`)
        ]);

      setMachines(machinesResponse.data);
      setPowerSource((previous) => ({ ...previous, ...powerResponse.data }));
      setGenerator(generatorResponse.data);
      setAlerts(alertsResponse.data);
      setCalendarDays(calendarResponse.data);
      setPrediction(predictionResponse.data);
      setActiveMachines(
        machinesResponse.data
          .filter((machine) => machine.status === 'running')
          .map((machine) => machine.id)
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load energy data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let socket;
    let isMounted = true;

    loadData();

    try {
      if (!POWER_SOCKET_URL) {
        return () => {
          isMounted = false;
        };
      }
      socket = new WebSocket(POWER_SOCKET_URL);
      socket.onmessage = (event) => {
        if (!isMounted) return;
        const data = JSON.parse(event.data);
        setPowerSource((previous) => ({
          ...previous,
          ...data,
          solarKW: data.solarKW ?? data.solar_kw ?? previous.solarKW,
          windKW: data.windKW ?? data.wind_kw ?? previous.windKW,
          batteryPercent: data.batteryPercent ?? data.battery_percent ?? previous.batteryPercent,
          gridKW: data.gridKW ?? data.grid_kw ?? previous.gridKW,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        if (Array.isArray(data.active_machines)) {
          setActiveMachines(data.active_machines);
        }
      };
      socket.onerror = () => {
        if (isMounted) setError('Live power updates are unavailable.');
      };
    } catch (socketError) {
      if (isMounted) setError(getErrorMessage(socketError, 'Unable to connect to live power updates.'));
    }

    return () => {
      isMounted = false;
      socket?.close();
    };
  }, []);

  useEffect(() => {
    if (POWER_SOCKET_URL) return undefined;
    const refreshTimer = window.setInterval(loadData, 5000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  const reportActionError = (requestError, fallback) => {
    setError(getErrorMessage(requestError, fallback));
  };

  const toggleMachine = (id) => {
    const machine = machines.find((item) => item.id === id);
    if (!machine) return;

    const action = machine.status === 'running' ? 'off' : 'on';
    axios
      .post(`${API_BASE}/machines/${id}/toggle`, { action })
      .then((response) => setMachines((previous) => previous.map((item) => item.id === id ? response.data : item)))
      .catch((requestError) => reportActionError(requestError, 'Unable to toggle machine.'));
  };

  const updateMachineSchedule = (id, scheduledOn, scheduledOff, scheduledDate) => {
    const now = new Date();
    const targetDate = new Date(`${scheduledDate || now.toISOString().split('T')[0]}T${scheduledOn}:00`);
    const isLessThan12Hours =
      Number.isNaN(targetDate.getTime()) ||
      targetDate <= now ||
      (targetDate - now) / (1000 * 60 * 60) < 12;

    if (!isLessThan12Hours) {
      axios
        .post(`${API_BASE}/machines/${id}/schedule`, {
          scheduled_on: scheduledOn,
          scheduled_off: scheduledOff,
          scheduled_date: scheduledDate
        })
        .then((response) => setMachines((previous) => previous.map((item) => item.id === id ? response.data : item)))
        .catch((requestError) => reportActionError(requestError, 'Unable to save machine schedule.'));
    }

    return {
      success: !isLessThan12Hours,
      isLessThan12Hours,
      message: isLessThan12Hours
        ? 'Please set at least 12 hours before start time'
        : 'Schedule saved successfully!'
    };
  };

  const approveSchedule = (id) => {
    setMachines((previous) => previous.map((machine) =>
      machine.id === id ? { ...machine, isApproved: true } : machine
    ));
  };

  const rejectSchedule = (id) => {
    setMachines((previous) => previous.map((machine) =>
      machine.id === id ? { ...machine, status: 'off', isApproved: false } : machine
    ));
  };

  const forceMachineState = (id, targetStatus) => {
    axios
      .post(`${API_BASE}/supervisor/machines/${id}/override`, {
        action: targetStatus === 'running' ? 'on' : 'off',
        reason: 'Supervisor override'
      }, authConfig())
      .then((response) => setMachines((previous) => previous.map((item) => item.id === id ? response.data : item)))
      .catch((requestError) => reportActionError(requestError, 'Unable to override machine state.'));
  };

  const addMachine = async (machine) => {
    try {
      const response = await axios.post(`${API_BASE}/machines`, machine, authConfig());
      setMachines((previous) => [...previous, response.data]);
      return response.data;
    } catch (requestError) {
      reportActionError(requestError, 'Unable to add machine.');
      return null;
    }
  };

  const deleteMachine = async (id) => {
    try {
      await axios.delete(`${API_BASE}/machines/${id}`, authConfig());
      setMachines((previous) => previous.filter((machine) => machine.id !== id));
      return true;
    } catch (requestError) {
      reportActionError(requestError, 'Unable to delete machine.');
      return false;
    }
  };

  const refillGeneratorFuel = (litres) => {
    axios
      .post(`${API_BASE}/generator/fuel`, { litres_added: litres }, authConfig())
      .then((response) => setGenerator(response.data))
      .catch((requestError) => reportActionError(requestError, 'Unable to refill generator fuel.'));
  };

  const setGeneratorFuelManual = (litres) => {
    setGenerator((previous) => ({
      ...previous,
      fuelLevelLitres: Math.min(previous.fuelCapacityLitres, Math.max(0, litres))
    }));
  };

  const forceGridBatteryCharge = async () => {
    try {
      const response = await axios.post(`${API_BASE}/supervisor/battery/force-charge`, {}, authConfig());
      setPowerSource((previous) => ({ ...previous, ...response.data }));
      return response.data;
    } catch (requestError) {
      reportActionError(requestError, 'Unable to force grid battery charging.');
      return null;
    }
  };

  const stopForceGridBatteryCharge = async () => {
    try {
      const response = await axios.post(`${API_BASE}/supervisor/battery/stop-force-charge`, {}, authConfig());
      setPowerSource((previous) => ({ ...previous, ...response.data }));
      return response.data;
    } catch (requestError) {
      reportActionError(requestError, 'Unable to stop forced grid charging.');
      return null;
    }
  };

  const addCalendarEvent = (dateStr, eventText) => {
    axios
      .post(`${API_BASE}/calendar/${dateStr}/event`, { event: eventText }, authConfig())
      .then((response) => setCalendarDays((previous) => previous.map((day) => day.date === dateStr ? response.data : day)))
      .catch((requestError) => reportActionError(requestError, 'Unable to add calendar event.'));
  };

  const deleteCalendarEvent = (dateStr, eventIndex) => {
    axios
      .delete(`${API_BASE}/calendar/${dateStr}/event/${eventIndex}`, authConfig())
      .then((response) => setCalendarDays((previous) => previous.map((day) => day.date === dateStr ? response.data : day)))
      .catch((requestError) => reportActionError(requestError, 'Unable to delete calendar event.'));
  };

  const setCalendarEvent = (dateStr, eventText) => {
    axios
      .put(`${API_BASE}/calendar/${dateStr}/event`, { event: eventText }, authConfig())
      .then((response) => setCalendarDays((previous) => previous.map((day) => day.date === dateStr ? response.data : day)))
      .catch((requestError) => reportActionError(requestError, 'Unable to update calendar event.'));
  };

  const updateCalendarDecision = (dateStr, decision) => {
    axios
      .put(`${API_BASE}/calendar/${dateStr}/decision`, decision, authConfig())
      .then((response) => setCalendarDays((previous) => previous.map((day) => day.date === dateStr ? response.data : day)))
      .catch((requestError) => reportActionError(requestError, 'Unable to update calendar decision.'));
  };

  const toggleHighGridPriceSimulation = () => {
    setPowerSource((previous) => ({
      ...previous,
      gridPriceStatus: previous.gridPriceStatus === 'normal' ? 'expensive' : 'normal'
    }));
  };

  const togglePowerCutSimulation = () => {
    setCalendarDays((previous) => previous.map((day, index) => index === 0 ? {
      ...day,
      gridStatus: day.gridStatus === 'power_cut' ? 'good' : 'power_cut',
      powerCutStart: '02:00 PM',
      powerCutEnd: '06:00 PM'
    } : day));
  };

  const unlockSupervisor = (pin) => {
    axios
      .post(`${API_BASE}/supervisor/login`, { pin })
      .then((response) => {
        localStorage.setItem('supervisor_token', response.data.token);
        setIsSupervisorUnlocked(true);
        setError(null);
      })
      .catch((requestError) => reportActionError(requestError, 'Invalid PIN'));

    return pin === '1234';
  };

  const lockSupervisor = () => {
    localStorage.removeItem('supervisor_token');
    setIsSupervisorUnlocked(false);
  };

  return (
    <EnergyContext.Provider
      value={{
        powerSource,
        machines,
        generator,
        alerts,
        calendarDays,
        prediction,
        activeMachines,
        isSupervisorUnlocked,
        loading,
        error,
        reloadData: loadData,
        toggleMachine,
        updateMachineSchedule,
        approveSchedule,
        rejectSchedule,
        forceMachineState,
        addMachine,
        deleteMachine,
        refillGeneratorFuel,
        setGeneratorFuelManual,
        forceGridBatteryCharge,
        stopForceGridBatteryCharge,
        addCalendarEvent,
        deleteCalendarEvent,
        setCalendarEvent,
        updateCalendarDecision,
        toggleHighGridPriceSimulation,
        togglePowerCutSimulation,
        unlockSupervisor,
        lockSupervisor
      }}
    >
      {children}
    </EnergyContext.Provider>
  );
};

export const useEnergy = () => {
  const context = useContext(EnergyContext);
  if (!context) throw new Error('useEnergy must be used within EnergyProvider');
  return context;
};
