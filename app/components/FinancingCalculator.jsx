"use client";
import { useState } from 'react';

export default function FinancingCalculator() {
  const [price, setPrice] = useState(100000);
  const [downPayment, setDownPayment] = useState(20000);
  const [term, setTerm] = useState(60);
  const [rate, setRate] = useState(5.0);

  const calculatePayment = () => {
    const principal = price - downPayment;
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) return principal / term;
    const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
    return payment.toFixed(2);
  };

  return (
    <div className="financing-calculator">
      <h3>Estimate Your Payment</h3>
      <div className="calc-grid">
        <div className="input-group">
          <label>Vehicle Price ($)</label>
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label>Down Payment ($)</label>
          <input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label>Loan Term (Months)</label>
          <select value={term} onChange={(e) => setTerm(Number(e.target.value))}>
            <option value={36}>36 Months</option>
            <option value={48}>48 Months</option>
            <option value={60}>60 Months</option>
            <option value={72}>72 Months</option>
          </select>
        </div>
        <div className="input-group">
          <label>Interest Rate (%)</label>
          <input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </div>
      </div>
      <div className="calc-result">
        <h4>Estimated Monthly Payment</h4>
        <div className="payment-amount">${calculatePayment()}<span>/mo</span></div>
        <p className="disclaimer">*Taxes and fees not included. Subject to credit approval.</p>
      </div>
    </div>
  );
}
