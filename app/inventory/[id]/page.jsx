import { inventory } from '../../lib/data';
import Link from 'next/link';
import FinancingCalculator from '../../components/FinancingCalculator';

export async function generateStaticParams() {
  return inventory.map((car) => ({
    id: car.id.toString(),
  }));
}

export default async function VehicleDetailPage({ params }) {
  const { id } = await params;
  const car = inventory.find(c => c.id.toString() === id);

  if (!car) {
    return (
      <div className="container" style={{paddingTop: '120px', textAlign: 'center'}}>
        <h1>Vehicle Not Found</h1>
        <Link href="/" className="btn-primary">Return Home</Link>
      </div>
    );
  }

  return (
    <>
      <nav className="navbar scrolled">
        <div className="logo"><Link href="/">Auto<span>Nest</span></Link></div>
        <Link href="/" className="btn-outline">Back to Inventory</Link>
      </nav>

      <div className="vdp-container" style={{paddingTop: '100px'}}>
        <div className="vdp-header">
          <div className="vdp-title">
            <h1>{car.brand} {car.model}</h1>
            <p className="vdp-subtitle">{car.year} • {car.mileage}</p>
          </div>
          <div className="vdp-price">{car.price}</div>
        </div>

        <div className="vdp-gallery">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={car.image} alt={car.model} className="vdp-main-image" />
        </div>

        <div className="vdp-content">
          <div className="vdp-details">
            <h2>Overview</h2>
            <p className="vdp-description">{car.description}</p>
            
            <h3>Specifications</h3>
            <ul className="vdp-specs-list">
              <li><strong>Engine:</strong> {car.engine}</li>
              <li><strong>Horsepower:</strong> {car.horsepower}</li>
              <li><strong>Transmission:</strong> {car.transmission}</li>
              <li><strong>Mileage:</strong> {car.mileage}</li>
            </ul>

            <h3>Premium Features</h3>
            <ul className="vdp-features-list">
              {car.features.map((feature, idx) => (
                <li key={idx}>✓ {feature}</li>
              ))}
            </ul>
          </div>
          
          <div className="vdp-sidebar">
            <div className="vdp-action-card">
              <h3>Interested in this {car.brand}?</h3>
              <button className="btn-primary" style={{width: '100%', marginBottom: '1rem'}}>Schedule Test Drive</button>
              <button className="btn-outline" style={{width: '100%'}}>Contact Sales</button>
            </div>
            
            <FinancingCalculator />
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-bottom">
          <p>&copy; 2024 AutoNest. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
