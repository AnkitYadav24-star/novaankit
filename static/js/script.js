document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Dynamic Year in Footer
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Sticky Navbar
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            // Toggle icon between menu and x
            const icon = menuToggle.querySelector('i');
            if (icon) {
                const isOpening = navMenu.classList.contains('open');
                icon.setAttribute('data-lucide', isOpening ? 'x' : 'menu');
                lucide.createIcons();
            }
        });

        // Close mobile menu when a link is clicked
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            });
        });
    }

    // Scroll Active Link Highlighting
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link:not(.nav-cta)');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Scroll Entry Animations (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-in');

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    fadeElements.forEach(el => {
        appearOnScroll.observe(el);
    });

    // Contact Form AJAX Handling
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Reset feedback
            formFeedback.classList.add('hidden');
            formFeedback.classList.remove('success', 'error');
            formFeedback.textContent = '';

            // Get form values
            const client_name = document.getElementById('client_name').value.trim();
            const client_mail = document.getElementById('client_mail').value.trim();
            const service_interested = document.getElementById('service_interested').value;
            const budget_range = document.getElementById('budget_range').value;
            const requirement_details = document.getElementById('requirement_details').value.trim();

            if (!client_name || !client_mail || !service_interested || !requirement_details) {
                showFeedback('Please fill out all required fields.', 'error');
                return;
            }

            // Set loading state
            setLoading(true);

            try {
                const response = await fetch('/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        client_name, 
                        client_mail, 
                        service_interested, 
                        budget_range, 
                        requirement_details 
                    })
                });

                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    showFeedback(result.message || 'Request submitted successfully!', 'success');
                    contactForm.reset();
                } else {
                    showFeedback(result.message || 'Failed to submit request. Please try again.', 'error');
                }
            } catch (err) {
                console.error('Submission error:', err);
                showFeedback('An error occurred. Please check your connection and try again.', 'error');
            } finally {
                setLoading(false);
            }
        });
    }

    function showFeedback(text, type) {
        formFeedback.textContent = text;
        formFeedback.classList.remove('hidden');
        formFeedback.classList.add(type);
    }

    function setLoading(isLoading) {
        if (!submitBtn) return;
        const btnText = submitBtn.querySelector('span');
        const btnIcon = submitBtn.querySelector('i');

        if (isLoading) {
            submitBtn.disabled = true;
            if (btnText) btnText.textContent = 'Sending...';
            if (btnIcon) {
                btnIcon.setAttribute('data-lucide', 'loader-2');
                btnIcon.classList.add('animate-spin');
                lucide.createIcons();
            }
        } else {
            submitBtn.disabled = false;
            if (btnText) btnText.textContent = 'Submit Request';
            if (btnIcon) {
                btnIcon.setAttribute('data-lucide', 'send');
                btnIcon.classList.remove('animate-spin');
                lucide.createIcons();
            }
        }
    }
});

// CSS spin animation injector for loading icon
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .animate-spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);
