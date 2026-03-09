import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Mock data used when backend is unreachable
const MOCK_DATA = {
  '/api/dashboard': {
    totalConsumption: 12450,
    consumptionGrowth: 3.2,
    dailyAverage: 245,
    activeAlerts: 3,
    leakRisk: 18,
    conservationTarget: 15000,
    buildingLevel: { totalUsage: 12450, flatCount: 50 },
    consumptionTrend: Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      totalUsage: Math.floor(300 + Math.random() * 400),
      commonAreas: Math.floor(50 + Math.random() * 80),
      residentialAvg: Math.floor(200 + Math.random() * 300),
    })),
    leakCandidates: [
      { flatId: 'A-204', risk: 420, nightFlow: 45.2, baseline: 12.1, reason: 'Consistent night-time flow detected over 3 days exceeding baseline by 3.7x' },
      { flatId: 'B-101', risk: 280, nightFlow: 28.7, baseline: 10.5, reason: 'Night flow ratio above threshold; possible slow leak in bathroom' },
      { flatId: 'C-305', risk: 155, nightFlow: 18.3, baseline: 9.8, reason: 'Moderate night-time usage; monitoring recommended' },
    ],
  },
  '/api/alerts': {
    alerts: [
      { id: 1, flatId: 'A-204', severity: 'critical', message: 'Excessive water usage detected — 3.7x above baseline', consumption: 450, baseline: 120, timestamp: new Date().toISOString() },
      { id: 2, flatId: 'B-101', severity: 'high', message: 'Possible pipe leak — night flow 2.7x above normal', consumption: 287, baseline: 105, timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 3, flatId: 'C-305', severity: 'warning', message: 'Above-average consumption — monitoring in progress', consumption: 183, baseline: 98, timestamp: new Date(Date.now() - 7200000).toISOString() },
    ]
  },
};

// Main hook: useApi(endpoint) → { data, loading, error, refetch }
export function useApi(endpoint, interval = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apiToken') || 'demo'}`
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      // Fall back to mock data when backend is unreachable
      const mock = MOCK_DATA[endpoint];
      if (mock) {
        setData(mock);
        setError(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
    if (interval) {
      const timer = setInterval(fetchData, interval);
      return () => clearInterval(timer);
    }
  }, [fetchData, interval]);

  return { data, loading, error, refetch: fetchData };
}

// Helper for one-off POST/DELETE calls (not a hook)
export async function apiPost(endpoint, body) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('apiToken') || 'demo'}`
    },
    body: JSON.stringify(body)
  });
  return response.json();
}

export async function apiDelete(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('apiToken') || 'demo'}` }
  });
  return response.json();
}

