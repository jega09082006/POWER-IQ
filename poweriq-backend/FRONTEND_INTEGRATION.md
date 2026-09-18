# Frontend Integration Guide

## 1. Update the frontend API base

In `EnergyContext` replace mock data imports with:

```js
const API_BASE = "http://localhost:8000/api"
```

## 2. Replace mock data fetches with axios requests

### Machines

```js
const res = await axios.get(`${API_BASE}/machines`)
setMachines(res.data)
```

### Power current

```js
const res = await axios.get(`${API_BASE}/power/current`)
setPowerSource(res.data)
```

### Power prediction

```js
const res = await axios.get(`${API_BASE}/power/prediction`)
setPrediction(res.data)
```

### Calendar

```js
const res = await axios.get(`${API_BASE}/calendar`)
setCalendar(res.data)
```

### Alerts

```js
const res = await axios.get(`${API_BASE}/alerts`)
setAlerts(res.data)
```

## 3. Add WebSocket connection

```js
const ws = new WebSocket("ws://localhost:8000/ws/power")
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  setPowerSource(data)
  setActiveMachines(data.active_machines)
}
```

## 4. Supervisor login

```js
const res = await axios.post(`${API_BASE}/supervisor/login`, { pin: enteredPin })
localStorage.setItem("supervisor_token", res.data.token)
```

## 5. Add Authorization header

```js
headers: { Authorization: `Bearer ${token}` }
```

## Notes

- Keep all API return shapes aligned with the frontend mock data already defined in `mockData.js`.
- The backend is designed to return the same JSON structure so no frontend UI changes should be required.
