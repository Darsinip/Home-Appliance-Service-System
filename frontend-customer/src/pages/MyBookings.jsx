import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const { showToast } = useToast();

  const tabs = ['All', 'Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data?.data || []);
    } catch (err) {
      showToast('Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/bookings/cancel/${id}`);
      showToast('Booking cancelled successfully', 'success');
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    }
  };

  const filteredBookings = filter === 'All' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const getStatusClass = (status) => {
    const map = {
      'Pending': 'badge-pending',
      'Assigned': 'badge-assigned',
      'In Progress': 'badge-inprogress',
      'Completed': 'badge-completed',
      'Cancelled': 'badge-cancelled'
    };
    return map[status] || 'badge-pending';
  };

  return (
    <div className="container py-5 fade-in visible">
      <h2 className="fw-bold mb-4 text-primary">My Bookings</h2>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 overflow-auto pb-3 mb-4 border-bottom">
        {tabs.map((tab, idx) => (
          <button 
            key={idx}
            className={`btn rounded-pill px-4 py-2 ${filter === tab ? 'btn-primary shadow-sm' : 'btn-outline-secondary border-0'}`}
            onClick={() => setFilter(tab)}
            style={{ whiteSpace: 'nowrap' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="row g-4">
          {[1,2].map(i => (
            <div key={i} className="col-lg-6">
              <div className="skeleton rounded-4" style={{ height: '250px' }}></div>
            </div>
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="row g-4">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="col-lg-6">
              <div className="glass-card p-4 h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span className="badge-status bg-light text-secondary border mb-2 d-inline-block">
                      {booking.serviceId?.category || 'Service'}
                    </span>
                    <h5 className="fw-bold mb-0">{booking.serviceId?.serviceName || 'Unknown Service'}</h5>
                  </div>
                  <span className={`badge-status ${getStatusClass(booking.status)} px-3 py-2`}>
                    {booking.status}
                  </span>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <p className="mb-0 text-secondary small">Date & Time</p>
                    <p className="mb-0 fw-medium">📅 {booking.date ? new Date(booking.date).toLocaleDateString() : ''} <br/> ⏰ {booking.time}</p>
                  </div>
                  <div className="col-6">
                    <p className="mb-0 text-secondary small">Technician</p>
                    <p className="mb-0 fw-medium">👨‍🔧 {booking.technicianId?.name || 'Awaiting assignment'}</p>
                  </div>
                  <div className="col-12">
                    <p className="mb-0 text-secondary small">Address</p>
                    <p className="mb-0 fw-medium">📍 {booking.address}</p>
                  </div>
                </div>

                {/* Timeline */}
                {booking.statusHistory && booking.statusHistory.length > 0 && (
                  <div className="bg-light p-3 rounded mb-4">
                    <p className="fw-bold small mb-3">Status Timeline</p>
                    <div className="timeline">
                      {booking.statusHistory.map((history, idx) => {
                        const isLast = idx === booking.statusHistory.length - 1;
                        return (
                          <div key={idx} className="timeline-item">
                            <div className={`timeline-dot ${isLast && booking.status !== 'Completed' && booking.status !== 'Cancelled' ? 'current' : (booking.status === 'Cancelled' && isLast ? 'future' : 'completed')}`}></div>
                            <div className="timeline-line"></div>
                            <div>
                              <p className="mb-0 fw-medium small">{history.status}</p>
                              <small className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(history.changedAt).toLocaleString()}</small>
                              {history.note && <p className="mb-0 small text-secondary fst-italic mt-1">{history.note}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Billing */}
                {booking.billing && booking.billing.total > 0 && (
                  <div className="accordion mb-4" id={`billing-${booking._id}`}>
                    <div className="accordion-item border rounded overflow-hidden">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed bg-light py-2 px-3 fw-bold text-dark" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${booking._id}`}>
                          Billing Details (Total: ₹{booking.billing.total})
                        </button>
                      </h2>
                      <div id={`collapse-${booking._id}`} className="accordion-collapse collapse" data-bs-parent={`#billing-${booking._id}`}>
                        <div className="accordion-body px-3 py-2 small">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Service Charge</span>
                            <span>₹{booking.billing.serviceCharge || 0}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span>Spare Parts</span>
                            <span>₹{booking.billing.spareParts || 0}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span>Additional Charges</span>
                            <span>₹{booking.billing.additionalCharges || 0}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-1 border-top pt-1 text-secondary">
                            <span>Tax (18%)</span>
                            <span>₹{booking.billing.tax || 0}</span>
                          </div>
                          <div className="d-flex justify-content-between mt-2 pt-2 border-top fw-bold fs-6 text-primary">
                            <span>Total</span>
                            <span>₹{booking.billing.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-3 border-top d-flex justify-content-end gap-2">
                  {(booking.status === 'Pending' || booking.status === 'Assigned') && (
                    <button className="btn btn-outline-danger rounded-pill px-4" onClick={() => handleCancel(booking._id)}>
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 glass-card">
          <div className="fs-1 mb-3">📅</div>
          <h4 className="fw-bold mb-3">No bookings yet</h4>
          <p className="text-secondary mb-4">Browse our services to get started!</p>
          <Link to="/services" className="btn btn-gradient rounded-pill px-4">Browse Services</Link>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
