import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import '../App.css'; // For login specific layout styles

const AdminLogin = () => {
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
      showToast('Please enter both email and password', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      showToast('Login successful!', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast(error.response?.data?.message || 'Invalid credentials. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-bg fade-in">
      <div className="login-card glass-card p-5">
        <div className="text-center mb-4">
          <h1 className="text-white mb-2 fw-bold" style={{ fontSize: '2.5rem' }}>⚙️ HomeServ</h1>
          <p className="text-light opacity-75">Admin Control Panel</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input 
              type="email" 
              className="form-control bg-light border-0" 
              id="emailInput" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="emailInput">Email address</label>
          </div>
          
          <div className="form-floating mb-4 position-relative">
            <input 
              type={showPassword ? "text" : "password"} 
              className="form-control bg-light border-0" 
              id="passwordInput" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="passwordInput">Password</label>
            <button 
              type="button"
              className="btn btn-link text-decoration-none position-absolute end-0 top-50 translate-middle-y me-2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>

          <button 
            type="submit" 
            className="btn btn-gradient w-100 py-3 d-flex justify-content-center align-items-center gap-2 fs-5"
            disabled={loading}
          >
            {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : null}
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
