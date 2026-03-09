import React, { useState } from 'react';
import './LeakDetectionMap.css';

const LeakDetectionMap = ({ candidates = [] }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const getRiskColor = (risk) => {
    if (risk >= 300) return '#dc2626'; // red
    if (risk >= 200) return '#f97316'; // orange
    if (risk >= 100) return '#eab308'; // yellow
    return '#10b981'; // green
  };

  const getRiskLevel = (risk) => {
    if (risk >= 500) return 'CRITICAL';
    if (risk >= 300) return 'HIGH';
    if (risk >= 100) return 'MEDIUM';
    return 'LOW';
  };

  return (
    <div>
      <div className="leak-detection-map">
        {candidates && candidates.length > 0 ? (
          <div className="candidates-container">
            <div className="candidates-list">
              {candidates.map((candidate, idx) => (
                <div
                  key={idx}
                  className={`candidate-card ${selectedCandidate?.flatId === candidate.flatId ? 'selected' : ''}`}
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <div className="card-header">
                    <span className="flat-id">{candidate.flatId}</span>
                    <span
                      className="risk-badge"
                      style={{ backgroundColor: getRiskColor(candidate.risk) }}
                    >
                      {getRiskLevel(candidate.risk)}
                    </span>
                  </div>
                  <div className="card-risk">
                    Risk Score: {candidate.risk}%
                  </div>
                  <div className="card-details">
                    <div className="detail-row">
                      <span className="label">Night Flow:</span>
                      <span className="value">{candidate.nightFlow.toFixed(1)}L</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Baseline:</span>
                      <span className="value">{candidate.baseline.toFixed(1)}L</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Ratio:</span>
                      <span className="value">{(candidate.nightFlow / candidate.baseline).toFixed(2)}x</span>
                    </div>
                  </div>
                  <div className="reason-section">
                    <h4>Detection Reason</h4>
                    <p>{candidate.reason}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedCandidate && (
              <div className="candidate-detail">
                <h3>Detailed Analysis</h3>
                <h4>Flat: {selectedCandidate.flatId}</h4>
                <div className="detail-content">
                  <p>
                    <strong>Risk Level:</strong> {getRiskLevel(selectedCandidate.risk)}
                  </p>
                  <p>
                    <strong>Risk Score:</strong> {selectedCandidate.risk}%
                  </p>
                  <p>
                    <strong>Night Flow:</strong> {selectedCandidate.nightFlow.toFixed(2)}L
                  </p>
                  <p>
                    <strong>7-Day Average Baseline:</strong> {selectedCandidate.baseline.toFixed(2)}L
                  </p>
                  <p>
                    <strong>Flow Ratio:</strong> {(selectedCandidate.nightFlow / selectedCandidate.baseline).toFixed(2)}x normal
                  </p>
                </div>
                <h4>Detection Reason</h4>
                <p>{selectedCandidate.reason}</p>
                <div className="action-section">
                  <button className="action-btn inspect">Schedule Inspection</button>
                  <button className="action-btn contact">Contact Resident</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-candidates">
            <p>✔️ No potential leaks detected. Building water usage is normal.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeakDetectionMap;
