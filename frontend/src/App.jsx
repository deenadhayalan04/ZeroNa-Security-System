import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Replace with your Render URL if you deploy to the cloud
const API_BASE = "http://127.0.0.1:5000/api"; 

function App() {
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState("SECURE");

  // 1. Fetch data from Python every 2 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE}/alerts`);
        setAlerts(response.data);
        
        // If any alert is 'Danger' or 'Critical', change status to BREACH
        const hasThreat = response.data.some(a => a.status === "Danger" || a.status === "Critical");
        setStatus(hasThreat ? "BREACH DETECTED" : "SECURE");
      } catch (err) {
        console.error("Connection to ZeroNa Backend failed.");
      }
    };

    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // 2. Kill Switch Function
  const handleKill = async () => {
    if (window.confirm("Are you sure you want to terminate suspicious processes?")) {
      await axios.post(`${API_BASE}/kill`);
      alert("ZeroNa Countermeasures Activated.");
    }
  };

  // 3. Clear Logs Function
  const handleClear = async () => {
    await axios.post(`${API_BASE}/clear`);
    setAlerts([]);
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">ZERONA <span>PRO</span></div>
        <div className={`status-indicator ${status === "SECURE" ? "safe" : "alert"}`}>
          SYSTEM: {status}
        </div>
      </nav>

      <div className="dashboard-grid">
        {/* Sidebar Actions */}
        <aside className="controls">
          <button className="btn-kill" onClick={handleKill}>TERMINATE THREAT</button>
          <button className="btn-clear" onClick={handleClear}>Clear Logs</button>
          <div className="info-card">
            <h4>AI ENGINE</h4>
            <p>Shannon Entropy: Active</p>
            <p>Vulnerability: Low</p>
          </div>
        </aside>

        {/* Main Log Table */}
        <main className="log-viewer">
          <h3>Real-Time Security Events</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Event Description</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0 ? (
                  <tr><td colSpan="3" className="no-data">No threats detected. System monitoring...</td></tr>
                ) : (
                  alerts.slice().reverse().map((item, index) => (
                    <tr key={index} className={`row-${item.status.toLowerCase()}`}>
                      <td>{item.time}</td>
                      <td>{item.msg}</td>
                      <td className="badge">{item.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;