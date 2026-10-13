import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, ToastContainer } from './components/Toast';
import AdminNavbar from './components/AdminNavbar';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLogin from './Pages/AdminLogin';
import Dashboard from './Pages/Dashboard';
import ManageServices from './Pages/ManageServices';
import ManageTechnicians from './Pages/ManageTechnicians';
import ManageBookings from './Pages/ManageBookings';
import './App.css';

const AdminLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <div className="w-100 h-100">{children}</div>;
  }

  return (
    <div className="admin-layout">
      <AdminNavbar />
      <div className="admin-content fade-in">
        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ToastContainer />
          <AdminLayout>
            <Routes>
              <Route path="/" element={<AdminLogin />} />
              <Route 
                path="/dashboard" 
                element={
                  <AdminProtectedRoute>
                    <Dashboard />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/services" 
                element={
                  <AdminProtectedRoute>
                    <ManageServices />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/technicians" 
                element={
                  <AdminProtectedRoute>
                    <ManageTechnicians />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/bookings" 
                element={
                  <AdminProtectedRoute>
                    <ManageBookings />
                  </AdminProtectedRoute>
                } 
              />
            </Routes>
          </AdminLayout>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
