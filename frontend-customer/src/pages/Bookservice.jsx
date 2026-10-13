import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const Bookservice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    address: '',
    notes: ''
  });

  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const res = await api.get(`/services/${id}`);
      setService(res.data?.data);
    } catch (err) {
      showToast('Failed to load service details', 'error');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.address) {
      showToast('Please fill all required fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/bookings', {
        serviceId: id,
        date: formData.date,
        time: formData.time,
        address: formData.address,
        notes: formData.notes
      });
      showToast('Booking confirmed successfully!', 'success');
      navigate('/mybookings');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to book service', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container py-5 fade-in visible">
      <div className="row g-4">
        {/* Service Details Card */}
        <div className="col-lg-5">
          <div className="glass-card p-4 h-100 position-relative overflow-hidden">
            <div className="position-absolute top-0 end-0 p-3 opacity-10 fs-1">🔧</div>
            <span className="badge-status bg-primary text-white mb-3">{service?.category}</span>
            <h2 className="fw-bold mb-3">{service?.serviceName}</h2>
            <p className="text-secondary mb-4">{service?.description}</p>
            
            <hr className="my-4" />
            
            <div className="d-flex justify-content-between mb-3">
              <span className="text-secondary">Price</span>
              <span className="fw-bold fs-5 text-primary">₹{service?.price}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-secondary">Duration</span>
              <span className="fw-medium">⏱️ {service?.duration || 1} hrs</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-secondary">Rating</span>
              <span className="fw-medium text-warning">⭐ {service?.rating || 4.5}</span>
            </div>
          </div>
        </div>

        {/* Booking Form Card */}
        <div className="col-lg-7">
          <div className="glass-card p-4">
            <h4 className="fw-bold mb-4">Book Appointment</h4>
            <form onSubmit={handleSubmit}>
              
              <div className="mb-4">
                <label className="form-label fw-medium text-secondary">Select Date *</label>
                <input 
                  type="date" 
                  className="form-control p-3 rounded" 
                  min={today}
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium text-secondary">Select Time Slot *</label>
                <div className="d-flex flex-wrap gap-2">
                  {timeSlots.map((time, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className={`btn ${formData.time === time ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-4 py-2`}
                      onClick={() => setFormData({...formData, time})}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium text-secondary">Service Address *</label>
                <textarea 
                  className="form-control p-3 rounded" 
                  rows="3" 
                  required
                  placeholder="Enter complete address..."
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium text-secondary">Special Instructions (Optional)</label>
                <textarea 
                  className="form-control p-3 rounded" 
                  rows="2" 
                  placeholder="Any special instructions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

              {/* Summary Card */}
              {formData.date && formData.time && (
                <div className="p-3 bg-light rounded border mb-4">
                  <h6 className="fw-bold mb-2">Booking Summary</h6>
                  <p className="mb-1 text-secondary small">Service: <span className="text-dark fw-medium">{service?.serviceName}</span></p>
                  <p className="mb-1 text-secondary small">Schedule: <span className="text-dark fw-medium">{formData.date} at {formData.time}</span></p>
                  <p className="mb-0 text-secondary small">Total Amount: <span className="text-primary fw-bold">₹{service?.price}</span></p>
                </div>
              )}

              <button type="submit" className="btn btn-gradient w-100 py-3 rounded-pill fw-bold" disabled={submitting}>
                {submitting ? <div className="spinner spinner-sm"></div> : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookservice;
