import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('polaris_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired/invalid
      localStorage.removeItem('polaris_token');
      localStorage.removeItem('polaris_user');
    }
    return Promise.reject(error);
  }
);

export default api;

// API Helper Services
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
};

export const stationService = {
  getStations: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/stations', { params });
    return response.data;
  },
  getStation: async (id) => {
    const response = await api.get(`/stations/${id}`);
    return response.data;
  },
  getStationSummary: async (id) => {
    const response = await api.get(`/stations/${id}/summary`);
    return response.data;
  },
  updateStation: async (id, data) => {
    const response = await api.put(`/stations/${id}`, data);
    return response.data;
  },
};

export const telemetryService = {
  getSnapshot: async () => {
    const response = await api.get('/telemetry/snapshot');
    return response.data;
  },
  getHistory: async (stationId, points = 20) => {
    const response = await api.get(`/telemetry/history/${stationId}?points=${points}`);
    return response.data;
  },
};

export const equipmentService = {
  getEquipment: async (stationId = null, subsystem = null) => {
    const params = {};
    if (stationId) params.station_id = stationId;
    if (subsystem) params.subsystem = subsystem;
    const response = await api.get('/equipment', { params });
    return response.data;
  },
  getEquipmentDetail: async (id) => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },
  getMaintenanceHistory: async (id) => {
    const response = await api.get(`/equipment/${id}/maintenance`);
    return response.data;
  },
  addMaintenanceRecord: async (id, data) => {
    const response = await api.post(`/equipment/${id}/maintenance`, data);
    return response.data;
  },
};

export const inventoryService = {
  getInventory: async (stationId = null, category = null) => {
    const params = {};
    if (stationId) params.station_id = stationId;
    if (category) params.category = category;
    const response = await api.get('/inventory', { params });
    return response.data;
  },
  getForecast: async (stationId = null) => {
    const params = stationId ? { station_id: stationId } : {};
    const response = await api.get('/inventory/forecast', { params });
    return response.data;
  },
  updateItem: async (id, data) => {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  },
};

export const energyService = {
  getMetrics: async (stationId = 'bharati') => {
    const response = await api.get(`/energy/metrics?station_id=${stationId}`);
    return response.data;
  },
};

export const personnelService = {
  getPersonnel: async (stationId = null, department = null) => {
    const params = {};
    if (stationId) params.station_id = stationId;
    if (department) params.department = department;
    const response = await api.get('/personnel', { params });
    return response.data;
  },
  getRosterSummary: async () => {
    const response = await api.get('/personnel/roster-summary');
    return response.data;
  },
};

export const alertService = {
  getAlerts: async (stationId = null, severity = null, status = null) => {
    const params = {};
    if (stationId) params.station_id = stationId;
    if (severity) params.severity = severity;
    if (status) params.status = status;
    const response = await api.get('/alerts', { params });
    return response.data;
  },
  getAlertSummary: async () => {
    const response = await api.get('/alerts/summary');
    return response.data;
  },
  acknowledgeAlert: async (id, acknowledgedBy) => {
    const response = await api.post(`/alerts/${id}/acknowledge`, { acknowledged_by: acknowledgedBy });
    return response.data;
  },
  resolveAlert: async (id, resolvedBy, notes) => {
    const response = await api.post(`/alerts/${id}/resolve`, {
      resolved_by: resolvedBy,
      resolution_notes: notes,
    });
    return response.data;
  },
};

export const incidentService = {
  getIncidents: async (stationId = null) => {
    const params = stationId ? { station_id: stationId } : {};
    const response = await api.get('/incidents', { params });
    return response.data;
  },
  getIncident: async (id) => {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  },
  getIncidentActions: async (id) => {
    const response = await api.get(`/incidents/${id}/actions`);
    return response.data;
  },
  recordAction: async (id, data) => {
    const response = await api.post(`/incidents/${id}/actions`, data);
    return response.data;
  },
};

export const messageService = {
  getMessages: async (stationId = null) => {
    const params = stationId ? { station_id: stationId } : {};
    const response = await api.get('/messages', { params });
    return response.data;
  },
  sendMessage: async (data) => {
    const response = await api.post('/messages', data);
    return response.data;
  },
  acknowledgeMessage: async (id, acknowledgedBy) => {
    const response = await api.post(`/messages/${id}/acknowledge`, { acknowledged_by: acknowledgedBy });
    return response.data;
  },
};

export const weatherService = {
  getCurrent: async (stationId = 'bharati') => {
    const response = await api.get(`/weather/current/${stationId}`);
    return response.data;
  },
  getHistory: async (stationId = 'bharati') => {
    const response = await api.get(`/weather/history/${stationId}`);
    return response.data;
  },
};

export const analyticsService = {
  getSummary: async () => {
    const response = await api.get('/analytics/summary');
    return response.data;
  },
};

export const aiInsightService = {
  getInsights: async (stationId = null) => {
    const params = stationId ? { station_id: stationId } : {};
    const response = await api.get('/ai-insights', { params });
    return response.data;
  },
  getDiagnosticMatrix: async () => {
    const response = await api.get('/ai-insights/diagnostic-matrix');
    return response.data;
  },
};

export const digitalTwinService = {
  getModel: async (stationId = 'bharati') => {
    const response = await api.get(`/digital-twin/${stationId}`);
    return response.data;
  },
};

export const simulatorService = {
  getStatus: async () => {
    const response = await api.get('/simulator/status');
    return response.data;
  },
  setScenario: async (scenario, stationId = 'bharati') => {
    const response = await api.post('/simulator/set-scenario', {
      scenario,
      station_id: stationId,
    });
    return response.data;
  },
};

export const remoteActionService = {
  execute: async (stationId, targetEquipmentId, actionType, notes = '') => {
    const response = await api.post('/remote-actions/execute', {
      station_id: stationId,
      target_equipment_id: targetEquipmentId,
      action_type: actionType,
      notes,
    });
    return response.data;
  },
};

export const settingsService = {
  getThresholds: async () => {
    const response = await api.get('/settings/thresholds');
    return response.data;
  },
  updateThresholds: async (data) => {
    const response = await api.post('/settings/thresholds', data);
    return response.data;
  },
  getAuditLogs: async (limit = 100) => {
    const response = await api.get(`/settings/audit-logs?limit=${limit}`);
    return response.data;
  },
};
