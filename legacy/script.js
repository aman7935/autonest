// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for scroll animations (Car Cards)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Apply staggered transition delay to car cards and observe them
    const carCards = document.querySelectorAll('.car-card');
    carCards.forEach((card, index) => {
        // Add a slight delay based on the index for a cascading effect
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // Button interactions
    const buttons = document.querySelectorAll('.btn-outline, .btn-primary');
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // If it's a detail button, just log or show an alert for the demo
            if(this.classList.contains('btn-outline')) {
                const carName = this.closest('.car-info').querySelector('h3').textContent;
                alert(`Viewing details for ${carName}. This feature is coming soon!`);
            }
        });
    });
});
