"use client";
import { useState } from 'react';

export default function TestDriveModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', date: '' });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        {submitted ? (
          <div className="success-message">
            <h2>Request Received!</h2>
            <p>Our concierge team will contact you shortly to confirm your appointment.</p>
          </div>
        ) : (
          <>
            <h2>Book a VIP Test Drive</h2>
            <p>Experience the thrill firsthand. Schedule your appointment below.</p>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Full Name</label>
                <input required type="text" placeholder="John Doe" onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input required type="email" placeholder="john@example.com" onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input required type="tel" placeholder="(555) 123-4567" onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Preferred Date</label>
                <input required type="date" onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '1rem'}}>Confirm Request</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
