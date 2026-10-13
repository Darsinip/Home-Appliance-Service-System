import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="text-white pt-5 pb-3" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6">
            <h4 className="fw-bold mb-3"><span className="me-2">🔧</span>HomeServ</h4>
            <p className="text-light opacity-75">Expert home appliance services at your doorstep. Professional, reliable, and guaranteed satisfaction.</p>
          </div>
          <div className="col-lg-2 col-md-6">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-light text-decoration-none opacity-75 custom-hover">Home</Link></li>
              <li className="mb-2"><Link to="/services" className="text-light text-decoration-none opacity-75 custom-hover">Services</Link></li>
              <li className="mb-2"><Link to="/mybookings" className="text-light text-decoration-none opacity-75 custom-hover">My Bookings</Link></li>
              <li className="mb-2"><a href="#" className="text-light text-decoration-none opacity-75 custom-hover">Contact</a></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h5 className="mb-3">Our Services</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/services" className="text-light text-decoration-none opacity-75 custom-hover">AC Repair & Service</Link></li>
              <li className="mb-2"><Link to="/services" className="text-light text-decoration-none opacity-75 custom-hover">Washing Machine Repair</Link></li>
              <li className="mb-2"><Link to="/services" className="text-light text-decoration-none opacity-75 custom-hover">Refrigerator Repair</Link></li>
              <li className="mb-2"><Link to="/services" className="text-light text-decoration-none opacity-75 custom-hover">Electrical Services</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h5 className="mb-3">Contact Us</h5>
            <ul className="list-unstyled text-light opacity-75">
              <li className="mb-2">📞 +91-9876543210</li>
              <li className="mb-2">✉️ support@homeserv.com</li>
              <li className="mb-2">📍 Mumbai, India</li>
            </ul>
          </div>
        </div>
        <hr className="my-4 border-light opacity-25" />
        <div className="text-center text-light opacity-50">
          <p className="mb-0">&copy; {new Date().getFullYear()} HomeServ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
