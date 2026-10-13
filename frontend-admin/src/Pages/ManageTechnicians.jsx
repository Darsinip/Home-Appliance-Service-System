import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';

const ManageTechnicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'AC'
  });

  const specializations = ['AC', 'Washing Machine', 'Refrigerator', 'Microwave', 'TV', 'Water Purifier', 'Geyser', 'Chimney', 'Electrical', 'Plumbing', 'Multiple'];

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const res = await api.get('/technicians');
      setTechnicians(res.data.data || []);
    } catch (error) {
      showToast('Failed to fetch technicians', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/technicians/${editingId}`, formData);
        showToast('Technician updated successfully', 'success');
      } else {
        await api.post('/technicians', formData);
        showToast('Technician added successfully', 'success');
      }
      fetchTechnicians();
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleEdit = (tech) => {
    setFormData({
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      specialization: tech.specialization
    });
    setEditingId(tech._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this technician?')) {
      try {
        await api.delete(`/technicians/${id}`);
        showToast('Technician deleted successfully', 'success');
        fetchTechnicians();
      } catch (error) {
        showToast('Failed to delete technician', 'error');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.put(`/technicians/${id}/toggle-status`);
      showToast('Status updated successfully', 'success');
      fetchTechnicians();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', specialization: 'AC' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="fw-bold m-0">Manage Technicians</h2>
        <button 
          className="btn btn-gradient" 
          onClick={() => { resetForm(); setShowForm(!showForm); }}
        >
          {showForm ? 'Cancel' : '+ Add Technician'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card mb-4 slide-in-right">
          <h4 className="mb-4">{editingId ? 'Edit Technician' : 'Add New Technician'}</h4>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-medium">Full Name</label>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Email Address</label>
              <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Phone Number</label>
              <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleInputChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Specialization</label>
              <select className="form-select" name="specialization" value={formData.specialization} onChange={handleInputChange} required>
                {specializations.map(spec => <option key={spec} value={spec}>{spec}</option>)}
              </select>
            </div>
            <div className="col-12 d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary">{editingId ? 'Update Technician' : 'Save Technician'}</button>
              <button type="button" className="btn btn-light" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card">
        {loading ? (
          <div className="text-center py-5"><div className="spinner d-inline-block"></div></div>
        ) : (
          <div className="table-responsive admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Specialization</th>
                  <th>Active Jobs</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {technicians.map((tech) => (
                  <tr key={tech._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                          {tech.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="fw-medium">{tech.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="small">{tech.email}</div>
                      <div className="small text-muted">{tech.phone}</div>
                    </td>
                    <td><span className="badge bg-secondary">{tech.specialization}</span></td>
                    <td><span className="badge bg-info">{tech.activeJobs || 0}</span></td>
                    <td>{tech.rating ? `⭐ ${tech.rating.toFixed(1)}` : 'N/A'}</td>
                    <td>
                      <button 
                        className={`btn btn-sm w-100 ${tech.status === 'active' ? 'btn-success' : 'btn-danger'}`}
                        onClick={() => handleToggleStatus(tech._id)}
                        title="Click to toggle status"
                      >
                        {tech.status === 'active' ? '✅ Active' : '❌ Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(tech)} title="Edit">✏️</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(tech._id)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {technicians.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">No technicians found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTechnicians;
