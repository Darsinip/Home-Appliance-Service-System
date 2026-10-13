import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const homeRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = homeRef.current?.querySelectorAll('.fade-in') || [];
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const popularServices = [
    { icon: '❄️', name: 'AC Service & Repair', desc: 'Expert cooling solutions for all brands', price: 399 },
    { icon: '🫧', name: 'Washing Machine', desc: 'Front & top load repairs', price: 499 },
    { icon: '🧊', name: 'Refrigerator', desc: 'Fixing cooling issues instantly', price: 599 },
    { icon: '📡', name: 'Microwave', desc: 'Heating issues resolved fast', price: 299 },
    { icon: '📺', name: 'TV Repair', desc: 'LED/LCD screen and panel fixes', price: 499 },
    { icon: '⚡', name: 'Electrical Help', desc: 'Wiring, switches & installations', price: 199 }
  ];

  return (
    <div className="home-page" ref={homeRef}>
      {/* Hero Section */}
      <section className="hero-section text-center text-md-start">
        <div className="floating-icon" style={{ top: '20%', left: '10%' }}>❄️</div>
        <div className="floating-icon" style={{ top: '60%', right: '15%', animationDelay: '1s' }}>🧊</div>
        <div className="floating-icon" style={{ top: '30%', right: '25%', animationDelay: '2s' }}>📺</div>
        <div className="floating-icon" style={{ bottom: '15%', left: '20%', animationDelay: '0.5s' }}>⚡</div>
        
        <div className="container">
          <div className="row align-items-center min-vh-50 py-5">
            <div className="col-lg-7 fade-in">
              <h1 className="display-3 fw-bold mb-4">Expert Home Appliance Services at Your Doorstep</h1>
              <p className="lead mb-5 opacity-75" style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
                Book trusted technicians for AC, washing machine, refrigerator, and more. Professional service, guaranteed satisfaction.
              </p>
              <div className="d-flex gap-3 flex-wrap justify-content-center justify-content-md-start">
                <Link to="/services" className="btn bg-white text-primary rounded-pill px-4 py-3 fw-bold" style={{ fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'all 0.3s' }}>
                  Book a Service
                </Link>
                <Link to="/services" className="btn btn-outline-light rounded-pill px-4 py-3 fw-bold" style={{ fontSize: '1.1rem' }}>
                  Explore Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="container">
          <div className="row text-center gy-4 fade-in">
            <div className="col-6 col-md-3 stat-item">
              <h3>10,000+</h3>
              <p className="mb-0">Happy Customers</p>
            </div>
            <div className="col-6 col-md-3 stat-item">
              <h3>500+</h3>
              <p className="mb-0">Services Done</p>
            </div>
            <div className="col-6 col-md-3 stat-item">
              <h3>50+</h3>
              <p className="mb-0">Technicians</p>
            </div>
            <div className="col-6 col-md-3 stat-item">
              <h3>4.8★</h3>
              <p className="mb-0">Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-5" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container fade-in">
          <h2 className="text-center fw-bold mb-5">Our Popular Services</h2>
          <div className="row g-4">
            {popularServices.map((srv, idx) => (
              <div key={idx} className="col-lg-4 col-md-6">
                <div className="service-card text-center">
                  <div className="service-card-icon">{srv.icon}</div>
                  <h4 className="fw-bold">{srv.name}</h4>
                  <p className="text-secondary">{srv.desc}</p>
                  <p className="fw-bold text-primary mt-auto fs-5 mb-3">Starting from ₹{srv.price}</p>
                  <Link to="/services" className="btn btn-outline-primary rounded-pill w-100 fw-bold">Book Now &rarr;</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5 bg-white">
        <div className="container fade-in">
          <h2 className="text-center fw-bold mb-5">How It Works</h2>
          <div className="row text-center position-relative g-4">
            <div className="col-md-3 position-relative">
              <div className="fs-1 mb-3">🔍</div>
              <h5 className="fw-bold">1. Browse Services</h5>
              <p className="text-secondary">Find the appliance service you need</p>
            </div>
            <div className="col-md-3 position-relative">
              <div className="fs-1 mb-3">📅</div>
              <h5 className="fw-bold">2. Book Online</h5>
              <p className="text-secondary">Pick a date and time slot</p>
            </div>
            <div className="col-md-3 position-relative">
              <div className="fs-1 mb-3">👨‍🔧</div>
              <h5 className="fw-bold">3. Technician Visits</h5>
              <p className="text-secondary">Expert arrives at your doorstep</p>
            </div>
            <div className="col-md-3 position-relative">
              <div className="fs-1 mb-3">✅</div>
              <h5 className="fw-bold">4. Service Complete</h5>
              <p className="text-secondary">Pay securely and review</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-5" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container fade-in">
          <h2 className="text-center fw-bold mb-5">Why Choose Us</h2>
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="p-4 bg-white rounded-4 border text-center h-100 shadow-sm">
                <div className="fs-1 mb-3">✅</div>
                <h5 className="fw-bold">Verified Experts</h5>
                <p className="text-secondary mb-0">Background checked and trained professionals.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="p-4 bg-white rounded-4 border text-center h-100 shadow-sm">
                <div className="fs-1 mb-3">💰</div>
                <h5 className="fw-bold">Transparent Pricing</h5>
                <p className="text-secondary mb-0">No hidden costs. Pay after job is done.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="p-4 bg-white rounded-4 border text-center h-100 shadow-sm">
                <div className="fs-1 mb-3">🛡️</div>
                <h5 className="fw-bold">30-Day Warranty</h5>
                <p className="text-secondary mb-0">Free re-visit if problem persists.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="p-4 bg-white rounded-4 border text-center h-100 shadow-sm">
                <div className="fs-1 mb-3">⚡</div>
                <h5 className="fw-bold">Same-Day Service</h5>
                <p className="text-secondary mb-0">Quick response and immediate visits.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5 bg-white">
        <div className="container fade-in">
          <h2 className="text-center fw-bold mb-5">What Our Customers Say</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-4 rounded-4 shadow-sm border h-100" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-warning mb-2">⭐⭐⭐⭐⭐</div>
                <p className="fst-italic text-secondary">"Amazing service! The technician was very polite and fixed my AC in no time. Highly recommended."</p>
                <h6 className="fw-bold mb-0">Rahul Sharma</h6>
                <small className="text-muted">Mumbai</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 rounded-4 shadow-sm border h-100" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-warning mb-2">⭐⭐⭐⭐⭐</div>
                <p className="fst-italic text-secondary">"Very transparent pricing and professional behavior. My washing machine works like new."</p>
                <h6 className="fw-bold mb-0">Priya Patel</h6>
                <small className="text-muted">Delhi</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 rounded-4 shadow-sm border h-100" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-warning mb-2">⭐⭐⭐⭐⭐</div>
                <p className="fst-italic text-secondary">"Booked for TV repair. The guy arrived on time and explained everything properly. Great app!"</p>
                <h6 className="fw-bold mb-0">Amit Kumar</h6>
                <small className="text-muted">Bangalore</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-5" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container fade-in" style={{ maxWidth: '800px' }}>
          <h2 className="text-center fw-bold mb-5">Frequently Asked Questions</h2>
          <div className="accordion border-0 shadow-sm rounded-4 overflow-hidden" id="faqAccordion">
            <div className="accordion-item border-0 border-bottom">
              <h2 className="accordion-header">
                <button className="accordion-button fw-bold py-3" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                  What services do you offer?
                </button>
              </h2>
              <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                <div className="accordion-body text-secondary">
                  We offer repair and maintenance services for ACs, Washing Machines, Refrigerators, Microwaves, TVs, Geysers, Water Purifiers, and general electrical works.
                </div>
              </div>
            </div>
            <div className="accordion-item border-0 border-bottom">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed fw-bold py-3" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                  How do I book a service?
                </button>
              </h2>
              <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body text-secondary">
                  You can browse our services, select the one you need, pick a convenient date and time slot, and confirm your booking.
                </div>
              </div>
            </div>
            <div className="accordion-item border-0 border-bottom">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed fw-bold py-3" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                  What is the cancellation policy?
                </button>
              </h2>
              <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body text-secondary">
                  You can cancel your booking for free up to 2 hours before the scheduled time slot.
                </div>
              </div>
            </div>
            <div className="accordion-item border-0 border-bottom">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed fw-bold py-3" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                  Do you provide warranty?
                </button>
              </h2>
              <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body text-secondary">
                  Yes, we provide a 30-day warranty on all our repair services and parts replaced.
                </div>
              </div>
            </div>
            <div className="accordion-item border-0">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed fw-bold py-3" type="button" data-bs-toggle="collapse" data-bs-target="#faq5">
                  How is pricing calculated?
                </button>
              </h2>
              <div id="faq5" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body text-secondary">
                  Our prices include a base visit/inspection charge. Final pricing depends on the spare parts used and the complexity of the repair.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container fade-in">
          <div className="home-contact-card row g-4 align-items-center">
            <div className="col-lg-7">
              <span className="text-uppercase fw-bold small text-primary">Need help?</span>
              <h2 className="fw-bold mt-2">Talk to our service team</h2>
              <p className="text-secondary mb-0">Get help with a booking, pricing, or appliance issue. We are available Monday to Saturday, 9 AM to 6 PM.</p>
            </div>
            <div className="col-lg-5 d-flex flex-column flex-sm-row gap-2 justify-content-lg-end">
              <a className="btn btn-outline-primary rounded-pill px-4" href="tel:+919876543210">Call support</a>
              <a className="btn btn-gradient rounded-pill px-4" href="mailto:support@homeservice.com">Email us</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 text-center text-white" style={{ background: 'var(--primary-gradient)' }}>
        <div className="container py-4 fade-in">
          <h2 className="fw-bold mb-3">Ready to get your appliances fixed?</h2>
          <p className="lead mb-4 opacity-75">Join thousands of satisfied customers today.</p>
          <Link to="/services" className="btn bg-white text-primary rounded-pill px-5 py-3 fw-bold shadow-lg">Book Now</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
