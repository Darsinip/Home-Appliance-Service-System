import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    category: 'AC',
    price: '',
    duration: '1-2 hours'
  });

  const categories = ['AC', 'Washing Machine', 'Refrigerator', 'Microwave', 'TV', 'Water Purifier', 'Geyser', 'Chimney', 'Electrical', 'Plumbing', 'Other'];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      // Changed to common path since there might not be a specific admin route if standard is used.
      const res = await api.get('/services/admin/all').catch(() => api.get('/services'));
      setServices(res.data.data || []);
    } catch (error) {
      showToast('Failed to fetch services', 'error');
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
        await api.put(`/services/${editingId}`, formData);
        showToast('Service updated successfully', 'success');
      } else {
        await api.post('/services', formData);
        showToast('Service added successfully', 'success');
      }
      fetchServices();
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleEdit = (service) => {
    setFormData({
      serviceName: service.serviceName,
      description: service.description,
      category: service.category,
      price: service.price,
      duration: service.duration || '1-2 hours'
    });
    setEditingId(service._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.delete(`/services/${id}`);
        showToast('Service deleted successfully', 'success');
        fetchServices();
      } catch (error) {
        showToast('Failed to delete service', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({ serviceName: '', description: '', category: 'AC', price: '', duration: '1-2 hours' });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = s.serviceName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? s.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="fw-bold m-0">Manage Services</h2>
        <button 
          className="btn btn-gradient" 
          onClick={() => { resetForm(); setShowForm(!showForm); }}
        >
          {showForm ? 'Cancel' : '+ Add Service'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card mb-4 slide-in-right">
          <h4 className="mb-4">{editingId ? 'Edit Service' : 'Add New Service'}</h4>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-medium">Service Name</label>
              <input type="text" className="form-control" name="serviceName" value={formData.serviceName} onChange={handleInputChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Category</label>
              <select className="form-select" name="category" value={formData.category} onChange={handleInputChange} required>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Price (₹)</label>
              <input type="number" className="form-control" name="price" value={formData.price} onChange={handleInputChange} required min="0" />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Estimated Duration</label>
              <input type="text" className="form-control" name="duration" value={formData.duration} onChange={handleInputChange} placeholder="e.g. 1-2 hours" required />
            </div>
            <div className="col-12">
              <label className="form-label fw-medium">Description</label>
              <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange} rows="3" required></textarea>
            </div>
            <div className="col-12 d-flex gap-2">
              <button type="submit" className="btn btn-primary">{editingId ? 'Update Service' : 'Save Service'}</button>
              <button type="button" className="btn btn-light" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card">
        <div className="d-flex gap-3 mb-4 flex-wrap">
          <div className="flex-grow-1" style={{ minWidth: '200px' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="🔍 Search by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ minWidth: '200px' }}>
            <select 
              className="form-select" 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner d-inline-block"></div></div>
        ) : (
          <div className="table-responsive admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price (₹)</th>
                  <th>Duration</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service, index) => (
                  <tr key={service._id}>
                    <td>{index + 1}</td>
                    <td className="fw-medium">{service.serviceName}</td>
                    <td><span className="badge bg-secondary">{service.category}</span></td>
                    <td className="fw-bold text-success">₹{service.price}</td>
                    <td>{service.duration || 'N/A'}</td>
                    <td>{service.rating ? `⭐ ${service.rating.toFixed(1)}` : 'N/A'}</td>
                    <td>
                      <span className={`badge-status ${service.isActive !== false ? 'badge-active' : 'badge-inactive'}`}>
                        {service.isActive !== false ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(service)} title="Edit">✏️</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(service._id)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredServices.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">No services found matching your criteria.</td>
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

export default ManageServices;
