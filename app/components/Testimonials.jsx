export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Arthur Pendelton",
      role: "CEO, TechNova",
      text: "The experience at AutoNest was nothing short of spectacular. They found the exact spec AMG GT I was looking for. White-glove service from start to finish.",
      rating: 5
    },
    {
      id: 2,
      name: "Elena Rostova",
      role: "Architect",
      text: "I appreciated the transparency and the lack of pressure. Purchasing my Audi RS7 was smooth, and their financing team was incredibly helpful.",
      rating: 5
    },
    {
      id: 3,
      name: "Marcus Chen",
      role: "Entrepreneur",
      text: "True professionals. The car was delivered in pristine condition. AutoNest sets a new standard for luxury automotive retail.",
      rating: 5
    }
  ];

  return (
    <section className="testimonials-section" id="about">
      <div className="section-header">
        <h2>Client Experiences</h2>
        <p>Don't just take our word for it</p>
      </div>
      <div className="testimonials-grid">
        {testimonials.map(t => (
          <div key={t.id} className="testimonial-card">
            <div className="stars">
              {Array(t.rating).fill('★').join('')}
            </div>
            <p className="testimonial-text">"{t.text}"</p>
            <div className="testimonial-author">
              <div className="avatar">{t.name.charAt(0)}</div>
              <div>
                <h4>{t.name}</h4>
                <span>{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
