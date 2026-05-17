"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { inventory } from './lib/data';

import TestDriveModal from './components/TestDriveModal';
import Testimonials from './components/Testimonials';
import Chatbot from './components/Chatbot';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState('All');
  const observerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    observerRef.current = observer;

    const carCards = document.querySelectorAll('.car-card');
    carCards.forEach((card, index) => {
      card.style.transitionDelay = `${index * 0.1}s`;
      observer.observe(card);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [activeBrand]); // Re-run observer when filtered items change

  const filteredInventory = activeBrand === 'All' 
    ? inventory 
    : inventory.filter(car => car.brand === activeBrand);

  const brands = ['All', 'Mercedes-Benz', 'Audi', 'BMW', 'Porsche', 'McLaren'];

  return (
    <>
      <TestDriveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Chatbot />

      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo">Auto<span>Nest</span></div>
        <ul className="nav-links">
          <li><Link href="#home">Home</Link></li>
          <li><Link href="#inventory">Inventory</Link></li>
          <li><Link href="#about">Reviews</Link></li>
          <li><Link href="#contact">Contact</Link></li>
        </ul>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Book a Test Drive</button>
      </nav>

      {/* Hero Section */}
      <header id="home" className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Elevate Your Journey</h1>
          <p>Discover our meticulously curated collection of high-end pre-owned vehicles. Experience luxury without compromise.</p>
          <Link href="#inventory" className="btn-primary large">Explore Collection</Link>
        </div>
      </header>

      {/* About AutoNest Section */}
      <section id="about-platform" className="about-platform-section">
        <div className="about-grid">
          <div className="about-text">
            <h2>The AutoNest Standard</h2>
            <p className="lead">More than a dealership. We are curators of automotive excellence.</p>
            <p>At AutoNest, we believe that purchasing a luxury vehicle should be as refined as the cars we sell. Our platform bridges the gap between discerning buyers and the world's most sought-after pre-owned luxury and performance vehicles.</p>
            <ul className="about-features">
              <li>
                <span className="icon">🛡️</span>
                <div>
                  <strong>Rigorous 200-Point Inspection</strong>
                  <p>Every vehicle undergoes a microscopic technical and cosmetic review.</p>
                </div>
              </li>
              <li>
                <span className="icon">💎</span>
                <div>
                  <strong>Provenance Guaranteed</strong>
                  <p>We source only impeccable vehicles with flawless ownership histories.</p>
                </div>
              </li>
              <li>
                <span className="icon">🌐</span>
                <div>
                  <strong>White-Glove Nationwide Delivery</strong>
                  <p>Your vehicle is delivered to your driveway in a fully enclosed transporter.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="about-image-container">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/about.jpg" 
              alt="AutoNest Luxury Experience" 
              className="about-side-img" 
              loading="lazy" 
            />
            <div className="experience-badge">
              <span className="number">10+</span>
              <span className="text">Years of<br/>Excellence</span>
            </div>
          </div>
        </div>
      </section>

      {/* Inventory Section */}
      <section id="inventory" className="inventory-section">
        <div className="section-header">
          <h2>Premium Selection</h2>
          <p>Our exclusive hand-picked luxury cars</p>
        </div>

        <div className="filters-bar">
          {brands.map(brand => (
            <button 
              key={brand}
              className={`filter-btn ${activeBrand === brand ? 'active' : ''}`}
              onClick={() => setActiveBrand(brand)}
            >
              {brand}
            </button>
          ))}
        </div>

        <div className="inventory-grid">
          {filteredInventory.map((car) => (
            <div key={car.id} className="car-card">
              <div className="car-image-wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={car.image} alt={car.model} className="car-img" loading="lazy" />
                <div className="car-badge">{car.brand}</div>
              </div>
              <div className="car-info">
                <h3>{car.model}</h3>
                <div className="car-specs">
                  <span><i className="icon">📅</i> {car.year}</span>
                  <span><i className="icon">🛣️</i> {car.mileage}</span>
                  <span><i className="icon">⛽</i> {car.engine}</span>
                </div>
                <div className="car-footer">
                  <div className="price">{car.price}</div>
                  <Link href={`/inventory/${car.id}`} className="btn-outline">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">Auto<span>Nest</span></div>
            <p>The premier destination for luxury pre-owned vehicles. Quality, performance, and prestige combined.</p>
          </div>
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link href="#home">Home</Link></li>
              <li><Link href="#inventory">Inventory</Link></li>
              <li><span style={{cursor:'pointer'}} onClick={() => setIsModalOpen(true)}>Book Test Drive</span></li>
              <li><Link href="#contact">Contact Us</Link></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h3 id="contact">Contact</h3>
            <p>📍 100 Prestige Blvd, Auto City, CA</p>
            <p>📞 +1 (800) 555-NEST</p>
            <p>✉️ luxury@autonest.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 AutoNest. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
