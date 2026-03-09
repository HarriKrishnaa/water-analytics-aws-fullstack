import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApi } from '../hooks/useApi';
import AlertPanel from './AlertPanel';
import LeakDetectionMap from './LeakDetectionMap';
import ConsumptionChart from './ConsumptionChart';
import './Dashboard.css';

const Dashboard = () => {
  const { data: dashboardData, loading, error } = useApi('/api/dashboard');
  const [selectedFlat, setSelectedFlat] = useState(null);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>💧 Water Consumption & Leakage Analytics</h1>
        <p>Real-time monitoring for apartment buildings</p>
      </header>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Consumption (Today)</h3>
          <div className="metric-value">{dashboardData?.totalConsumption || 0}L</div>
          <div className="metric-change positive">↑ {dashboardData?.consumptionGrowth || 0}%</div>
        </div>
        <div className="metric-card">
          <h3>Daily Average per Flat</h3>
          <div className="metric-value">{dashboardData?.dailyAverage || 0}L</div>
          <div className="metric-unit">per flat</div>
        </div>
        <div className="metric-card">
          <h3>Active Alerts</h3>
          <div className="metric-value critical">{dashboardData?.activeAlerts || 0}</div>
          <div className="metric-unit">issues detected</div>
        </div>
        <div className="metric-card">
          <h3>Leak Risk Score</h3>
          <div className="metric-value warning">{dashboardData?.leakRisk || 0}%</div>
          <div className="metric-unit">building-wide</div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h2>24-Hour Consumption Trend</h2>
          <ConsumptionChart data={dashboardData?.consumptionTrend || []} />
        </div>
        
        <div className="chart-container">
          <h2>Building Level Statistics</h2>
          <div className="building-stats">
            <div className="stat-item">
              <span>Total Building Usage:</span>
              <strong>{dashboardData?.buildingLevel?.totalUsage || 0}L</strong>
            </div>
            <div className="stat-item">
              <span>Number of Flats:</span>
              <strong>{dashboardData?.buildingLevel?.flatCount || 0}</strong>
            </div>
            <div className="stat-item">
              <span>Conservation Target:</span>
              <strong>{dashboardData?.conservationTarget || 0}L</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="alerts-section">
        <AlertPanel />
      </div>

      <div className="leak-detection-section">
        <h2>Leak Detection & Risk Assessment</h2>
        <LeakDetectionMap candidates={dashboardData?.leakCandidates || []} />
      </div>
    </div>
  );
};

export default Dashboard;
