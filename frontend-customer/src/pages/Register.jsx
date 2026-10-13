import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, text: 'None', color: 'transparent', width: '0%' };
    
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, text: 'Weak', color: 'var(--danger)', width: '33%' };
    if (score <= 4) return { score, text: 'Medium', color: 'var(--warning)', width: '66%' };
    return { score, text: 'Strong', color: 'var(--success)', width: '100%' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      showToast('Registration successful! Please login.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 fade-in visible d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card p-5 w-100" style={{ maxWidth: '500px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">Create Account</h2>
          <p className="text-secondary">Join HomeServ today</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-medium text-secondary">Full Name</label>
            <input type="text" name="name" className="form-control rounded-pill px-4" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-medium text-secondary">Email Address</label>
            <input type="email" name="email" className="form-control rounded-pill px-4" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-medium text-secondary">Phone Number</label>
            <input type="tel" name="phone" pattern="[0-9]{10}" title="10 digit phone number" className="form-control rounded-pill px-4" value={formData.phone} onChange={handleChange} required />
          </div>
          
          <div className="mb-3">
            <label className="form-label fw-medium text-secondary">Password</label>
            <input type="password" name="password" className="form-control rounded-pill px-4" value={formData.password} onChange={handleChange} required minLength="6" />
            <div className="progress mt-2" style={{ height: '5px', borderRadius: '5px' }}>
              <div className="progress-bar transition-all" role="progressbar" style={{ width: strength.width, backgroundColor: strength.color }}></div>
            </div>
            {formData.password && <small className="text-muted d-block mt-1">Strength: <span style={{ color: strength.color }}>{strength.text}</span></small>}
          </div>
          
          <div className="mb-4">
            <label className="form-label fw-medium text-secondary">Confirm Password</label>
            <input type="password" name="confirmPassword" className="form-control rounded-pill px-4" value={formData.confirmPassword} onChange={handleChange} required minLength="6" />
          </div>
          
          <button type="submit" className="btn btn-gradient w-100 rounded-pill py-3 fw-bold" disabled={loading}>
            {loading ? <div className="spinner spinner-sm"></div> : 'Register'}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-secondary mb-0">
            Already have an account? <Link to="/login" className="text-primary text-decoration-none fw-bold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
