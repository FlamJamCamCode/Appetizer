// The Crucible - Main Script
// Handles interactive features for the landing page

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        setupCardAnimations();
        setupKeyboardNavigation();
        checkLinkAvailability();
        setupAnalytics();
    }

    // Animate cards on scroll
    function setupCardAnimations() {
        const cards = document.querySelectorAll('.nav-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 50);
                }
            });
        }, {
            threshold: 0.1
        });

        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s ease-out';
            observer.observe(card);
        });
    }

    // Keyboard navigation for accessibility
    function setupKeyboardNavigation() {
        const cards = document.querySelectorAll('.nav-card');
        
        cards.forEach((card, index) => {
            card.addEventListener('keydown', (e) => {
                // Arrow key navigation
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const nextCard = cards[index + 1];
                    if (nextCard) nextCard.focus();
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prevCard = cards[index - 1];
                    if (prevCard) prevCard.focus();
                }
            });
        });
    }

    // Check if links are valid (basic client-side check)
    function checkLinkAvailability() {
        const cards = document.querySelectorAll('.nav-card');
        
        cards.forEach(card => {
            const href = card.getAttribute('href');
            
            // Skip external links
            if (href.startsWith('http')) return;
            
            // Add a small indicator for broken links (optional)
            // This is just client-side - GitHub Pages will handle 404s
            card.addEventListener('click', (e) => {
                // Let the browser handle navigation
                // We could add loading states here if needed
            });
        });
    }

    // Simple analytics (page views only, no tracking)
    function setupAnalytics() {
        const cards = document.querySelectorAll('.nav-card');
        
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                const section = card.querySelector('h3').textContent;
                console.log(`Navigation: ${section}`);
                
                // Store in localStorage for basic usage stats (local only)
                const visits = JSON.parse(localStorage.getItem('crucible_visits') || '{}');
                visits[section] = (visits[section] || 0) + 1;
                localStorage.setItem('crucible_visits', JSON.stringify(visits));
            });
        });
    }

    // Add search functionality (future enhancement)
    function setupSearch() {
        // Placeholder for future search feature
        // Could implement client-side search across all documents
    }

    // Expose utilities for other scripts
    window.CrucibleNav = {
        getVisitStats: function() {
            return JSON.parse(localStorage.getItem('crucible_visits') || '{}');
        },
        clearStats: function() {
            localStorage.removeItem('crucible_visits');
        }
    };

})();

