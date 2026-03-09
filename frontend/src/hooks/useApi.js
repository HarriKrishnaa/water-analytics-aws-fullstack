import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function useApi() {
  const useFetch = (endpoint, interval = null) => {
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
        setError(err.message);
        console.error('API Error:', err);
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
  };

  const post = useCallback(async (endpoint, body) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('apiToken') || 'demo'}`
      },
      body: JSON.stringify(body)
    });
    return response.json();
  }, []);

  const delete_ = useCallback(async (endpoint) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('apiToken') || 'demo'}`
      }
    });
    return response.json();
  }, []);

  return { useFetch, post, delete: delete_ };
}
