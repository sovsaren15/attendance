import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, historyData] = await Promise.all([
        dashboardAPI.getTopPerformers(),
        dashboardAPI.getAllAttendanceHistory()
      ]);
      setStats(statsData);
      setHistory(historyData.data || []);
    } catch (err) {
      setError('Failed to load dashboard data. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="dashboard-container" style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <StatCard title="Top Attendance" data={stats.topAttendance} valueKey="attendanceCount" label="days" />
          <StatCard title="Most Late" data={stats.topLate} valueKey="lateCount" label="times" />
          <StatCard title="Most Early" data={stats.topEarly} valueKey="earlyCount" label="times" />
          <StatCard title="Top Overtime" data={stats.topOvertime} valueKey="overtimeHours" label="hours" />
        </div>
      )}

      <h3>Recent Activity</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Employee</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Date</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Check In</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Check Out</th>
            </tr>
          </thead>
          <tbody>
            {history.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '12px' }}>
                  {log.employees ? `${log.employees.first_name} ${log.employees.last_name}` : 'Unknown'}
                  <br />
                  <small style={{ color: '#6c757d' }}>{log.employees?.employee_id}</small>
                </td>
                <td style={{ padding: '12px' }}>
                  {new Date(log.check_in_time).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px' }}>
                  {new Date(log.check_in_time).toLocaleTimeString()}
                </td>
                <td style={{ padding: '12px' }}>
                  {log.check_out_time ? new Date(log.check_out_time).toLocaleTimeString() : '-'}
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No attendance records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard = ({ title, data, valueKey, label }) => (
  <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>{title}</h4>
    {data && data.length > 0 ? (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {data.map((item) => (
          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
            <span>{item.name}</span>
            <strong>{typeof item[valueKey] === 'number' ? item[valueKey].toFixed(1).replace(/\.0$/, '') : item[valueKey]} {label}</strong>
          </li>
        ))}
      </ul>
    ) : (
      <p style={{ color: '#999', fontStyle: 'italic' }}>No data available</p>
    )}
  </div>
);

export default Dashboard;