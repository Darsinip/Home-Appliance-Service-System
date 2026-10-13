import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      showToast('Login successful!', 'success');
      navigate('/services');
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 fade-in visible d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card p-5 w-100" style={{ maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">Welcome Back</h2>
          <p className="text-secondary">Login to your account</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3 position-relative">
            <label className="form-label fw-medium text-secondary"><span className="me-2">📧</span>Email Address</label>
            <input 
              type="email" 
              className="form-control form-control-lg rounded-pill px-4" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3 position-relative">
            <label className="form-label fw-medium text-secondary"><span className="me-2">🔒</span>Password</label>
            <div className="input-group">
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-control form-control-lg rounded-start-pill px-4" 
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
              <button 
                type="button" 
                className="btn btn-outline-secondary rounded-end-pill px-3"
                onClick={() => setShowPassword(!showPassword)}
                style={{ borderColor: 'var(--border)' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="rememberMe" />
              <label className="form-check-label text-secondary small" htmlFor="rememberMe">
                Remember Me
              </label>
            </div>
            <a href="#" className="text-primary text-decoration-none small fw-medium">Forgot Password?</a>
          </div>
          
          <button type="submit" className="btn btn-gradient w-100 rounded-pill py-3 fw-bold" disabled={loading}>
            {loading ? <div className="spinner spinner-sm"></div> : 'Login'}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-secondary mb-0">
            Don't have an account? <Link to="/register" className="text-primary text-decoration-none fw-bold">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
