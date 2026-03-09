import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import './AlertPanel.css';

const AlertPanel = () => {
  const { data: alerts, loading, error, refetch } = useApi('/api/alerts');
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const handleDismiss = async (alertId) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setDismissedAlerts(new Set([...dismissedAlerts, alertId]));
      }
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  const visibleAlerts = (alerts?.alerts || []).filter(a => !dismissedAlerts.has(a.id));

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'alert-critical';
      case 'warning':
      case 'medium':
        return 'alert-warning';
      default:
        return 'alert-info';
    }
  };

  if (loading) return <div className="loading">Loading alerts...</div>;
  if (error) return <div className="error">Error loading alerts: {error}</div>;

  return (
    <div className="alert-panel">
      <h2>Active Water Consumption Alerts</h2>
      
      {visibleAlerts.length === 0 ? (
        <div className="no-alerts">
          <p>✔️ All systems normal. No alerts detected.</p>
        </div>
      ) : (
        <div className="alerts-list">
          {visibleAlerts.map((alert) => (
            <div key={alert.id} className={`alert-item ${getSeverityClass(alert.severity)}`}>
              <div className="alert-header">
                <span className="alert-flat-id">Flat {alert.flatId}</span>
                <span className="alert-severity">{alert.severity.toUpperCase()}</span>
              </div>
              <div className="alert-message">{alert.message}</div>
              <div className="alert-details">
                <div className="detail-item">
                  <span className="label">Current:</span>
                  <span className="value">{alert.consumption || 0}L</span>
                </div>
                <div className="detail-item">
                  <span className="label">Baseline:</span>
                  <span className="value">{alert.baseline || 0}L</span>
                </div>
                <div className="detail-item">
                  <span className="label">Ratio:</span>
                  <span className="value">{((alert.consumption / alert.baseline) * 100).toFixed(0)}%</span>
                </div>
                <div className="detail-item">
                  <span className="label">Time:</span>
                  <span className="value">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              <button 
                className="dismiss-btn" 
                onClick={() => handleDismiss(alert.id)}
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertPanel;
