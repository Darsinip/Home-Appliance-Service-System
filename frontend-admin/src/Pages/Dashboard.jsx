import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data.data);
    } catch (error) {
      showToast('Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fade-in">
        <h2 className="mb-4">Dashboard Overview</h2>
        <div className="row g-4 mb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="col-md-3">
              <div className="skeleton" style={{ height: '120px' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">Dashboard Overview</h2>
        <button className="btn btn-light shadow-sm" onClick={fetchDashboardData}>
          🔄 Refresh
        </button>
      </div>

      {/* Top Row: Large Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="stat-card blue h-100">
            <h5 className="opacity-75 mb-1">👥 Total Customers</h5>
            <h2 className="display-5 fw-bold mb-0">{data.customers || 0}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card purple h-100">
            <h5 className="opacity-75 mb-1">📋 Total Bookings</h5>
            <h2 className="display-5 fw-bold mb-0">{data.bookings || 0}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card green h-100">
            <h5 className="opacity-75 mb-1">🔧 Active Services</h5>
            <h2 className="display-5 fw-bold mb-0">{data.services || 0}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card orange h-100">
            <h5 className="opacity-75 mb-1">💰 Total Revenue</h5>
            <h2 className="display-5 fw-bold mb-0">₹{data.revenue?.toLocaleString() || 0}</h2>
          </div>
        </div>
      </div>

      {/* Second Row: Booking Status */}
      <div className="row g-3 mb-4">
        <div className="col-md">
          <div className="stat-card yellow p-3 text-center">
            <h6 className="opacity-75 mb-1">⏳ Pending</h6>
            <h3 className="mb-0 fw-bold">{data.pendingBookings || 0}</h3>
          </div>
        </div>
        <div className="col-md">
          <div className="stat-card blue p-3 text-center">
            <h6 className="opacity-75 mb-1">📌 Assigned</h6>
            <h3 className="mb-0 fw-bold">{data.assignedBookings || 0}</h3>
          </div>
        </div>
        <div className="col-md">
          <div className="stat-card orange p-3 text-center">
            <h6 className="opacity-75 mb-1">🔄 In Progress</h6>
            <h3 className="mb-0 fw-bold">{data.inProgressBookings || 0}</h3>
          </div>
        </div>
        <div className="col-md">
          <div className="stat-card green p-3 text-center">
            <h6 className="opacity-75 mb-1">✅ Completed</h6>
            <h3 className="mb-0 fw-bold">{data.completedBookings || 0}</h3>
          </div>
        </div>
        <div className="col-md">
          <div className="stat-card red p-3 text-center">
            <h6 className="opacity-75 mb-1">❌ Cancelled</h6>
            <h3 className="mb-0 fw-bold">{data.cancelledBookings || 0}</h3>
          </div>
        </div>
      </div>

      {/* Third Row: Analytics */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="glass-card h-100">
            <h5 className="mb-4 fw-bold">Revenue Insights</h5>
            <div className="d-flex flex-column gap-3">
              <div className="p-3 bg-light rounded d-flex justify-content-between align-items-center border">
                <span className="fw-medium text-secondary">Weekly Revenue</span>
                <span className="fs-4 fw-bold text-success">₹{(data.weeklyRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-light rounded d-flex justify-content-between align-items-center border">
                <span className="fw-medium text-secondary">Monthly Revenue</span>
                <span className="fs-4 fw-bold text-primary">₹{(data.monthlyRevenue || 0).toLocaleString()}</span>
              </div>
            </div>
            
            <h5 className="mb-3 mt-4 fw-bold">Monthly Trend</h5>
            <div className="d-flex align-items-end gap-2" style={{ height: '150px' }}>
              {(data.monthlyTrend || []).map((trend, i) => {
                const maxCount = Math.max(...(data.monthlyTrend || []).map(t => t.count), 1);
                const height = `${(trend.count / maxCount) * 100}%`;
                return (
                  <div key={i} className="flex-grow-1 d-flex flex-column align-items-center gap-2">
                    <div className="w-100 bg-primary rounded-top" style={{ height, minHeight: '2px', opacity: 0.8, transition: 'height 1s ease' }} title={`${trend.count} bookings`}></div>
                    <small className="text-muted" style={{ fontSize: '10px' }}>{trend.month}</small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="glass-card h-100">
            <h5 className="mb-4 fw-bold">Category Distribution</h5>
            <div className="d-flex flex-column gap-2">
              {(data.categoryDistribution || []).map((cat, i) => {
                const maxCount = Math.max(...(data.categoryDistribution || []).map(c => c.count), 1);
                const width = `${(cat.count / maxCount) * 100}%`;
                return (
                  <div key={i} className="chart-bar-container">
                    <div className="chart-bar-label text-truncate" title={cat._id}>{cat._id || 'Unknown'}</div>
                    <div className="chart-bar-wrap mx-2">
                      <div className="chart-bar-fill" style={{ width }}></div>
                    </div>
                    <div className="chart-bar-value">{cat.count}</div>
                  </div>
                );
              })}
              {(!data.categoryDistribution || data.categoryDistribution.length === 0) && (
                <p className="text-muted text-center py-4">No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fourth Row: Recent Bookings */}
      <div className="glass-card mb-4">
        <h5 className="mb-4 fw-bold">Recent Bookings</h5>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(data.recentBookings || []).map((booking, i) => (
                <tr key={i}>
                  <td className="fw-medium">{booking.customerId?.name || 'N/A'}</td>
                  <td>{booking.serviceId?.serviceName || 'N/A'}</td>
                  <td className="fw-bold">₹{booking.amount || booking.billing?.total || 0}</td>
                  <td>{booking.date}</td>
                  <td>
                    <span className={`badge-status badge-${booking.status.toLowerCase().replace(' ', '')}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!data.recentBookings || data.recentBookings.length === 0) && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">No recent bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
