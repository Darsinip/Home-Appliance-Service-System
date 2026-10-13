import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [assigningBookingId, setAssigningBookingId] = useState(null);
  
  // Modals state
  const [billingModal, setBillingModal] = useState({ show: false, bookingId: null, serviceCharge: 0, spareParts: 0, additionalCharges: 0, serviceName: '' });
  const [expandedRow, setExpandedRow] = useState(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, techRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/technicians')
      ]);
      setBookings(bookingsRes.data.data || []);
      setTechnicians(techRes.data.data || []);
    } catch (error) {
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTechnician = async (bookingId, technicianId) => {
    if (!bookingId || !technicianId) {
      showToast('Please select a technician before assigning', 'warning');
      return;
    }
    setAssigningBookingId(bookingId);
    try {
      const response = await api.put(`/bookings/assign/${bookingId}`, { technicianId });
      showToast(response.data?.message || 'Technician assigned successfully', 'success');
      await fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Assignment failed', 'error');
    } finally {
      setAssigningBookingId(null);
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      await api.put(`/bookings/status/${bookingId}`, { status });
      showToast('Status updated successfully', 'success');
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Status update failed', 'error');
    }
  };

  const openBillingModal = (booking) => {
    const servicePrice = booking.serviceId?.price || 0;
    setBillingModal({
      show: true,
      bookingId: booking._id,
      serviceName: booking.serviceId?.serviceName || 'Service',
      serviceCharge: servicePrice,
      spareParts: 0,
      additionalCharges: 0
    });
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/bookings/billing/${billingModal.bookingId}`, {
        serviceCharge: Number(billingModal.serviceCharge),
        spareParts: Number(billingModal.spareParts),
        additionalCharges: Number(billingModal.additionalCharges)
      });
      showToast('Bill generated successfully', 'success');
      setBillingModal({ ...billingModal, show: false });
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Billing failed', 'error');
    }
  };

  const toggleRow = (id) => {
    if (expandedRow === id) setExpandedRow(null);
    else setExpandedRow(id);
  };

  const filteredBookings = statusFilter === 'All' 
    ? bookings 
    : bookings.filter(b => b.status === statusFilter);

  const statuses = ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];

  const calculateTotal = () => {
    const subtotal = Number(billingModal.serviceCharge) + Number(billingModal.spareParts) + Number(billingModal.additionalCharges);
    const tax = subtotal * 0.18;
    return subtotal + tax;
  };

  return (
    <div className="fade-in position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="fw-bold m-0">Manage Bookings</h2>
        <button className="btn btn-light shadow-sm" onClick={fetchData}>🔄 Refresh Data</button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 gap-2 bg-white p-2 rounded shadow-sm">
        {['All', ...statuses].map(status => (
          <li className="nav-item" key={status}>
            <button 
              className={`nav-link fw-medium ${statusFilter === status ? 'active bg-primary' : 'text-secondary'}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          </li>
        ))}
      </ul>

      <div className="glass-card">
        {loading ? (
          <div className="text-center py-5"><div className="spinner d-inline-block"></div></div>
        ) : (
          <div className="table-responsive admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Details</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <React.Fragment key={booking._id}>
                    <tr>
                      <td>
                        <button className="btn btn-sm btn-light" onClick={() => toggleRow(booking._id)}>
                          {expandedRow === booking._id ? '🔽' : '▶️'}
                        </button>
                      </td>
                      <td className="fw-medium">{booking.customerId?.name || 'N/A'}</td>
                      <td>{booking.serviceId?.serviceName || 'N/A'}</td>
                      <td>
                        <div className="small fw-medium">{new Date(booking.date).toLocaleDateString()}</div>
                        <div className="small text-muted">{booking.time}</div>
                      </td>
                      <td>
                        <select 
                          className="form-select form-select-sm" 
                          value={booking.technicianId?._id || ''}
                          onChange={(e) => handleAssignTechnician(booking._id, e.target.value)}
                          disabled={assigningBookingId === booking._id || ['Completed', 'Cancelled'].includes(booking.status)}
                        >
                          <option value="">-- Unassigned --</option>
                          {technicians.filter(t => t.status === 'active').map(t => (
                            <option key={t._id} value={t._id}>{t.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select 
                          className={`form-select form-select-sm border-0 fw-bold badge-${booking.status.toLowerCase().replace(' ', '')}`}
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                        >
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="fw-bold">₹{booking.amount || booking.billing?.total || 0}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-success"
                          onClick={() => openBillingModal(booking)}
                          disabled={!['Assigned', 'In Progress', 'Completed'].includes(booking.status)}
                        >
                          🧾 Bill
                        </button>
                      </td>
                    </tr>
                    {/* Expanded Details Row */}
                    {expandedRow === booking._id && (
                      <tr className="bg-light">
                        <td colSpan="8" className="p-4 border-bottom">
                          <div className="row g-4 slide-in-right">
                            <div className="col-md-4">
                              <h6 className="fw-bold text-primary">Customer Information</h6>
                              <p className="mb-1"><strong>Address:</strong> {booking.address || 'Not provided'}</p>
                              <p className="mb-0"><strong>Contact:</strong> {booking.customerId?.email} | {booking.customerId?.phone || 'Not provided'}</p>
                            </div>
                            <div className="col-md-4">
                              <h6 className="fw-bold text-primary">Notes</h6>
                              <p className="mb-0 fst-italic text-secondary">{booking.notes || 'No additional notes provided.'}</p>
                            </div>
                            <div className="col-md-4">
                              <h6 className="fw-bold text-primary">Billing Details</h6>
                              {booking.billing?.total ? (
                                <ul className="list-unstyled mb-0 small">
                                  <li className="d-flex justify-content-between"><span>Service Charge:</span> <span>₹{booking.billing.serviceCharge}</span></li>
                                  <li className="d-flex justify-content-between"><span>Spare Parts:</span> <span>₹{booking.billing.spareParts}</span></li>
                                  <li className="d-flex justify-content-between"><span>Additional:</span> <span>₹{booking.billing.additionalCharges}</span></li>
                                  <li className="d-flex justify-content-between border-top mt-1 pt-1"><span>Tax (18%):</span> <span>₹{booking.billing.tax}</span></li>
                                  <li className="d-flex justify-content-between fw-bold text-success border-top mt-1 pt-1"><span className="fs-6">Total:</span> <span className="fs-6">₹{booking.billing.total}</span></li>
                                </ul>
                              ) : (
                                <p className="mb-0 text-warning">Bill not generated yet.</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">No bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Billing Modal */}
      {billingModal.show && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom-0 bg-primary text-white" style={{ borderRadius: '16px 16px 0 0' }}>
                <h5 className="modal-title fw-bold">Generate Bill</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setBillingModal({...billingModal, show: false})}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleGenerateBill}>
                  <div className="mb-3">
                    <label className="form-label fw-medium text-secondary">Service ({billingModal.serviceName})</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">₹</span>
                      <input type="number" className="form-control border-light" value={billingModal.serviceCharge} onChange={(e) => setBillingModal({...billingModal, serviceCharge: e.target.value})} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium text-secondary">Spare Parts Cost</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">₹</span>
                      <input type="number" className="form-control border-light" value={billingModal.spareParts} onChange={(e) => setBillingModal({...billingModal, spareParts: e.target.value})} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium text-secondary">Additional Charges</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">₹</span>
                      <input type="number" className="form-control border-light" value={billingModal.additionalCharges} onChange={(e) => setBillingModal({...billingModal, additionalCharges: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="bg-light p-3 rounded mb-4">
                    <div className="d-flex justify-content-between mb-2 text-secondary">
                      <span>Subtotal:</span>
                      <span>₹{(Number(billingModal.serviceCharge) + Number(billingModal.spareParts) + Number(billingModal.additionalCharges)).toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2 text-secondary">
                      <span>Tax (18%):</span>
                      <span>₹{((Number(billingModal.serviceCharge) + Number(billingModal.spareParts) + Number(billingModal.additionalCharges)) * 0.18).toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between fw-bold fs-5 text-primary border-top pt-2">
                      <span>Total:</span>
                      <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-light" onClick={() => setBillingModal({...billingModal, show: false})}>Cancel</button>
                    <button type="submit" className="btn btn-primary px-4">Generate Bill</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
