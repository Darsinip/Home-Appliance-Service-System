import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';

const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || 'All';
  const [sortOrder, setSortOrder] = useState('Default');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [svcRes, catRes] = await Promise.all([
        api.get('/services'),
        api.get('/services/categories')
      ]);
      setServices(svcRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    } catch (err) {
      showToast('Failed to load services', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services
    .filter(s => categoryQuery === 'All' || s.category === categoryQuery)
    .filter(s => s.serviceName.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'Price: Low to High') return a.price - b.price;
      if (sortOrder === 'Price: High to Low') return b.price - a.price;
      if (sortOrder === 'Rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const getCategoryBadgeClass = (cat) => {
    const map = {
      'AC': 'cat-ac',
      'Washing Machine': 'cat-washing-machine',
      'Refrigerator': 'cat-refrigerator',
      'Microwave': 'cat-microwave',
      'TV': 'cat-tv',
      'Electrical': 'cat-electrical'
    };
    return map[cat] || 'cat-other';
  };

  return (
    <div className="container py-5 fade-in visible">
      <div className="text-center mb-5">
        <h1 className="fw-bold text-primary">Our Services</h1>
        <p className="text-secondary lead">Find and book the best appliance services</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-5">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <input 
              type="text" 
              className="form-control rounded-pill px-4 py-2" 
              placeholder="Search services..." 
              value={searchQuery}
              onChange={(e) => setSearchParams({ search: e.target.value, category: categoryQuery })}
            />
          </div>
          <div className="col-md-5">
            <div className="d-flex gap-2 overflow-auto pb-2" style={{ whiteSpace: 'nowrap' }}>
              <button 
                className={`btn rounded-pill px-4 ${categoryQuery === 'All' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSearchParams({ search: searchQuery, category: 'All' })}
              >
                All
              </button>
              {categories.map((cat, idx) => (
                <button 
                  key={idx}
                  className={`btn rounded-pill px-4 ${categoryQuery === cat._id ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSearchParams({ search: searchQuery, category: cat._id })}
                >
                  {cat._id} ({cat.count})
                </button>
              ))}
            </div>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select rounded-pill px-4 py-2"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option>Default</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="row g-4">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="col-lg-4 col-md-6">
              <div className="service-card skeleton" style={{ height: '300px' }}></div>
            </div>
          ))
        ) : filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div key={service._id} className="col-lg-4 col-md-6">
              <div className="service-card text-center h-100 d-flex flex-column">
                <div className="mb-3">
                  <span className={`badge-status ${getCategoryBadgeClass(service.category)}`}>
                    {service.category}
                  </span>
                </div>
                <h5 className="fw-bold mb-3">{service.serviceName}</h5>
                <p className="text-secondary small mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {service.description}
                </p>
                <div className="mt-auto">
                  <div className="d-flex justify-content-between align-items-center mb-3 px-3">
                    <span className="fw-bold text-primary fs-5">₹{service.price}</span>
                    <span className="text-warning fw-bold">⭐ {service.rating || '4.5'} <small className="text-muted">({service.reviews || 0})</small></span>
                  </div>
                  <div className="text-secondary small mb-3">⏱️ {service.duration || 1} hours</div>
                  <Link to={`/book/${service._id}`} className="btn btn-gradient w-100 rounded-pill">Book Now</Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <h4 className="text-secondary">No services found</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
