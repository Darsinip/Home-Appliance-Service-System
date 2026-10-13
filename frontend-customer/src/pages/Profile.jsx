import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', profileData);
      updateUser({ ...user, ...res.data.data });
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setPwdLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword
      });
      showToast('Password changed successfully', 'success');
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="container py-5 fade-in visible">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          
          {/* Profile Header */}
          <div className="text-center mb-5">
            <div className="rounded-circle d-flex align-items-center justify-content-center text-white mx-auto mb-3 shadow-lg" 
                 style={{ width: '100px', height: '100px', background: 'var(--primary-gradient)', fontSize: '2.5rem', fontWeight: 'bold' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 className="fw-bold">{user?.name}</h2>
            <p className="text-secondary">{user?.email}</p>
            <span className="badge bg-light text-secondary border">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>

          {/* Profile Details Card */}
          <div className="glass-card p-4 mb-5 position-relative">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">Personal Information</h4>
              <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-medium">Full Name</label>
                    <input type="text" className="form-control p-2 rounded" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-medium">Email (Read-only)</label>
                    <input type="email" className="form-control p-2 rounded" value={user?.email || ''} readOnly disabled />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-medium">Phone Number</label>
                    <input type="text" className="form-control p-2 rounded" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-secondary small fw-medium">Address</label>
                    <textarea className="form-control p-2 rounded" rows="3" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})}></textarea>
                  </div>
                  <div className="col-12 mt-4 text-end">
                    <button type="submit" className="btn btn-gradient rounded-pill px-5" disabled={loading}>
                      {loading ? <div className="spinner spinner-sm"></div> : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="row g-4">
                <div className="col-md-6">
                  <p className="text-secondary small fw-medium mb-1">Full Name</p>
                  <p className="fw-medium text-dark">{user?.name}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-secondary small fw-medium mb-1">Email</p>
                  <p className="fw-medium text-dark">{user?.email}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-secondary small fw-medium mb-1">Phone Number</p>
                  <p className="fw-medium text-dark">{user?.phone || 'Not provided'}</p>
                </div>
                <div className="col-12">
                  <p className="text-secondary small fw-medium mb-1">Address</p>
                  <p className="fw-medium text-dark">{user?.address || 'Not provided'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Card */}
          <div className="glass-card p-4">
            <h4 className="fw-bold mb-4">Security</h4>
            <form onSubmit={handlePwdSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label text-secondary small fw-medium">Current Password</label>
                  <input type="password" className="form-control p-2 rounded" value={pwdData.currentPassword} onChange={(e) => setPwdData({...pwdData, currentPassword: e.target.value})} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-medium">New Password</label>
                  <input type="password" className="form-control p-2 rounded" minLength="6" value={pwdData.newPassword} onChange={(e) => setPwdData({...pwdData, newPassword: e.target.value})} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-medium">Confirm New Password</label>
                  <input type="password" className="form-control p-2 rounded" minLength="6" value={pwdData.confirmPassword} onChange={(e) => setPwdData({...pwdData, confirmPassword: e.target.value})} required />
                </div>
                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-outline-primary rounded-pill px-4" disabled={pwdLoading}>
                    {pwdLoading ? <div className="spinner spinner-sm"></div> : 'Update Password'}
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
