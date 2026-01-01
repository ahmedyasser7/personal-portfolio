document.addEventListener('DOMContentLoaded', () => {
    // Theme Management
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme') ||
        (prefersDarkScheme.matches ? 'dark' : 'light');

    // Set initial theme
    function setTheme(theme) {
        document.body.classList.toggle('dark-theme', theme === 'dark');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        localStorage.setItem('theme', theme);
    }

    setTheme(currentTheme);

    // Toggle theme on button click
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-theme');
            setTheme(isDark ? 'light' : 'dark');
        });
    }

    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Progress bars with Intersection Observer
    const progressBars = document.querySelectorAll('.progress-bar');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const percent = entry.target.getAttribute('data-percent');
                entry.target.style.setProperty('--progress', percent + '%');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px'
    });

    progressBars.forEach(bar => observer.observe(bar));

    // Form Validation and Handling
    const form = document.getElementById('contact-form');
    if (form) {
        const formInputs = form.querySelectorAll('input, textarea');

        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email.toLowerCase());
        }

        function showError(input, message) {
            const formGroup = input.closest('.input-group');
            if (!formGroup) return;
            const errorDiv = formGroup.querySelector('.error-message') ||
                document.createElement('div');
            
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            
            if (!formGroup.querySelector('.error-message')) {
                formGroup.appendChild(errorDiv);
            }
            
            input.classList.add('error');
        }

        function clearError(input) {
            const formGroup = input.closest('.input-group');
            if (!formGroup) return;
            const errorDiv = formGroup.querySelector('.error-message');
            
            if (errorDiv) {
                errorDiv.remove();
            }
            
            input.classList.remove('error');
        }

        function validateInput(input) {
            clearError(input);
            
            if (!input.value.trim()) {
                showError(input, 'This field is required');
                return false;
            }

            if (input.type === 'email' && !validateEmail(input.value)) {
                showError(input, 'Please enter a valid email address');
                return false;
            }

            if (input.id === 'message' && input.value.length < 10) {
                showError(input, 'Message must be at least 10 characters long');
                return false;
            }

            return true;
        }

        // Real-time validation
        formInputs.forEach(input => {
            input.addEventListener('blur', () => validateInput(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    validateInput(input);
                }
            });
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validate all inputs
            const isValid = Array.from(formInputs).every(validateInput);
            if (!isValid) return;

            // Add loading state
            const submitButton = form.querySelector('button[type="submit"]');
            if (!submitButton) return;
            const originalText = submitButton.textContent;
            submitButton.classList.add('loading');
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            try {
                // Simulate form submission (replace with actual API call)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Show success message inline
                form.reset();
                const successEl = document.getElementById('contact-success');
                if (successEl) {
                    successEl.hidden = false;
                    successEl.classList.add('in-view');
                    successEl.focus && successEl.focus();
                    // hide after 6s
                    setTimeout(() => { successEl.hidden = true; }, 6000);
                } else {
                    alert('Message sent successfully!');
                }
            } catch (error) {
                alert('Failed to send message. Please try again later.');
            } finally {
                // Remove loading state
                submitButton.classList.remove('loading');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }

    // Smooth scrolling with improved accessibility
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Update URL without page reload
                history.pushState(null, '', targetId);
                
                // Smooth scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update focus for accessibility
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus({ preventScroll: true });
            }
        });
    });

    // Back-to-top button with improved visibility and smooth animation
    const backToTopButton = document.getElementById('back-to-top');
    let isScrolling;

    if (backToTopButton) {
        function toggleBackToTop() {
            if (!backToTopButton) return;
            if (window.scrollY > 300) {
                backToTopButton.style.opacity = '1';
                backToTopButton.style.visibility = 'visible';
                backToTopButton.style.transform = 'translateY(0)';
            } else {
                backToTopButton.style.opacity = '0';
                backToTopButton.style.visibility = 'hidden';
                backToTopButton.style.transform = 'translateY(20px)';
            }
        }

        window.addEventListener('scroll', () => {
            // Clear our timeout throughout the scroll
            window.clearTimeout(isScrolling);

            // Set a timeout to run after scrolling ends
            isScrolling = setTimeout(toggleBackToTop, 100);
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Update focus for accessibility
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.focus({ preventScroll: true });
            }
        });
    }

    // Mobile menu handling
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navToggle.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
            }
        });
    }

    // Typewriter effect with improved performance
    const typewriterText = "Web Developer and Data Scientist";
    const typewriterElement = document.getElementById('typewriter');
    let typewriterIndex = 0;
    let typewriterTimeout;

    function typeWriter() {
        if (!typewriterElement) return;
        if (typewriterIndex < typewriterText.length) {
            typewriterElement.textContent += typewriterText.charAt(typewriterIndex);
            typewriterIndex++;
            typewriterTimeout = setTimeout(typeWriter, 100);
        }
    }

    if (typewriterElement) {
        // Start typewriter effect when element is visible
        const typewriterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeWriter();
                    typewriterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        typewriterObserver.observe(typewriterElement);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        clearTimeout(typewriterTimeout);
    });

    // Update copyright year
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Scroll reveal animations
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function setupScrollReveal() {
        const candidates = [
            ...document.querySelectorAll('section'),
            ...document.querySelectorAll('.project'),
            ...document.querySelectorAll('.highlight-item'),
            ...document.querySelectorAll('.education-item'),
            ...document.querySelectorAll('.experience-item'),
            ...document.querySelectorAll('.skills-container'),
            ...document.querySelectorAll('.certificates-grid'),
            ...document.querySelectorAll('.project-content'),
            ...document.querySelectorAll('.sessions-grid'),
            ...document.querySelectorAll('.session-card')
        ];

        const seen = new Set();
        const targets = candidates.filter(el => {
            if (seen.has(el)) return false;
            seen.add(el);
            return true;
        });

        targets.forEach((el, idx) => {
            el.classList.add('reveal');
            const delay = (idx % 6) * 80; // 0..400ms stagger
            el.style.setProperty('--reveal-delay', `${delay}ms`);
        });

        if (prefersReducedMotion.matches) {
            targets.forEach(el => el.classList.add('in-view'));
            return;
        }

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

        targets.forEach(el => revealObserver.observe(el));
    }

    setupScrollReveal();

    // Photos lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    function openLightbox(src, caption) {
        if (!lightbox || !lightboxImg || !lightboxCaption) return;
        lightboxImg.src = src;
        lightboxCaption.textContent = caption || '';
        lightbox.setAttribute('aria-hidden', 'false');
        if (lightboxClose) lightboxClose.focus();
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.setAttribute('aria-hidden', 'true');
        if (lightboxImg) lightboxImg.src = '';
        document.body.style.overflow = '';
        // reset current gallery index when closing
        try { currentGalleryIndex = -1; if (typeof updateNavState === 'function') updateNavState(); } catch (e) { /* ignore if not defined yet */ }
    }

    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    let currentGalleryIndex = -1;

    function showLightboxAt(index) {
        const item = galleryItems[index];
        if (!item) return;
        const href = item.getAttribute('href');
        const caption = item.getAttribute('data-caption') || item.querySelector('img')?.alt || '';
        openLightbox(href, caption);
        currentGalleryIndex = index;
        updateNavState();
    }

    galleryItems.forEach((item, idx) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            showLightboxAt(idx);
        });
    });

    const lbPrev = document.getElementById('lightbox-prev');
    const lbNext = document.getElementById('lightbox-next');

    function updateNavState() {
        if (!lightbox) return;
        if (lbPrev) lbPrev.disabled = currentGalleryIndex <= 0;
        if (lbNext) lbNext.disabled = currentGalleryIndex >= galleryItems.length - 1;
    }

    function showPrev() {
        if (currentGalleryIndex > 0) showLightboxAt(currentGalleryIndex - 1);
    }

    function showNext() {
        if (currentGalleryIndex < galleryItems.length - 1) showLightboxAt(currentGalleryIndex + 1);
    }

    if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
    if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

    lightbox?.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-close') || e.target === lightboxClose) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });

    // Animated counters for sessions
    const counters = document.querySelectorAll('.counter');
    if (counters.length) {
        const durationMs = 1200;
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target') || '0', 10);
                const start = performance.now();
                function tick(now) {
                    const t = Math.min(1, (now - start) / durationMs);
                    // easeOutCubic
                    const eased = 1 - Math.pow(1 - t, 3);
                    const value = Math.floor(eased * target);
                    el.textContent = String(value);
                    if (t < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
                counterObserver.unobserve(el);
            });
        }, { threshold: 0.4 });

        counters.forEach(c => counterObserver.observe(c));
    }

    // Certificate Carousel
    const certGrid = document.querySelector('.certificates-grid');
    const certPrevBtn = document.getElementById('cert-prev');
    const certNextBtn = document.getElementById('cert-next');
    const indicators = document.querySelectorAll('.carousel-indicators .indicator');
    
    if (certGrid && certPrevBtn && certNextBtn) {
        let currentIndex = 0;
        const totalCerts = document.querySelectorAll('.certificate-item').length;
        const itemsPerView = 3;
        const maxIndex = Math.max(0, totalCerts - itemsPerView);
        
        function updateCarousel() {
            // Calculate gap for proper spacing
            const gapSize = 2; // 2rem = approximately 32px
            const itemWidth = 100 / itemsPerView;
            const totalGaps = (itemsPerView - 1) * gapSize;
            const offset = currentIndex * (itemWidth + (totalGaps / itemsPerView));
            
            certGrid.style.transform = `translateX(-${currentIndex * (itemWidth + 1)}%)`;
            
            // Update indicators
            indicators.forEach((ind, idx) => {
                ind.classList.toggle('active', idx === currentIndex);
            });
            
            // Update button disabled states
            certPrevBtn.disabled = currentIndex === 0;
            certNextBtn.disabled = currentIndex === maxIndex;
        }
        
        certPrevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
        
        certNextBtn.addEventListener('click', () => {
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateCarousel();
            }
        });
        
        indicators.forEach((indicator) => {
            indicator.addEventListener('click', () => {
                currentIndex = Math.min(parseInt(indicator.getAttribute('data-index')), maxIndex);
                updateCarousel();
            });
        });
        
        // Initialize
        updateCarousel();
    }

    // Stars background animation
    const starsCanvas = document.getElementById('stars-canvas');
    if (starsCanvas) {
        const ctx = starsCanvas.getContext('2d');
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        let width = 0;
        let height = 0;
        let stars = [];
        const STAR_COUNT = 140; // reasonable default
        let rafId;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            starsCanvas.width = Math.floor(width * dpr);
            starsCanvas.height = Math.floor(height * dpr);
            starsCanvas.style.width = width + 'px';
            starsCanvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function getStarColor() {
            return document.body.classList.contains('dark-theme') ? 'rgba(255,255,255,0.9)' : 'rgba(106,13,173,0.8)';
        }

        function seedStars() {
            stars = Array.from({ length: STAR_COUNT }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 1.5 + 0.3,
                vy: Math.random() * 0.12 + 0.03, // slow drift
                tw: Math.random() * 0.5 + 0.5 // twinkle base
            }));
        }

        function drawFrame() {
            ctx.clearRect(0, 0, width, height);
            const color = getStarColor();
            for (const s of stars) {
                // twinkle
                const alpha = 0.6 + Math.sin((performance.now() * 0.002 + s.x + s.y)) * 0.4 * s.tw;
                ctx.fillStyle = color.replace(/\d?\.\d+\)$/,'') + (alpha.toFixed(2) + ')');
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();

                // drift downward
                s.y += s.vy;
                if (s.y > height + 2) {
                    s.y = -2;
                    s.x = Math.random() * width;
                }
            }
        }

        function tick() {
            drawFrame();
            rafId = requestAnimationFrame(tick);
        }

        // Init
        resizeCanvas();
        seedStars();

        const start = () => {
            if (!prefersReducedMotion.matches && !rafId) rafId = requestAnimationFrame(tick);
            if (prefersReducedMotion.matches) drawFrame(); // static on reduced motion
        };
        const stop = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = undefined;
        };

        // Start/Stop based on visibility and reduced motion
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stop(); else start();
        });
        prefersReducedMotion.addEventListener('change', () => {
            stop();
            start();
        });

        // React to theme changes by redrawing next frames (handled per frame color)

        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resizeCanvas();
                seedStars();
            }, 150);
        });

        // Cleanup
        window.addEventListener('beforeunload', stop);

        // Kickoff
        start();
    }

    // Auto-scroll gallery
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
        let scrollAmount = 0;
        const scrollSpeed = 10; // pixels per frame (smoother)
        let scrollDirection = 1; // 1 for right, -1 for left
        let isScrolling = true;
        let animationFrameId;
        let userInteracting = false;

        function autoScroll() {
            if (!isScrolling || !galleryGrid || userInteracting) {
                if (animationFrameId) {
                    animationFrameId = requestAnimationFrame(autoScroll);
                }
                return;
            }

            // Auto-scroll certificates
            const certificatesGrid = document.querySelector('.certificates-grid');
            if (certificatesGrid) {
                let certScroll = 0;
                const certSpeed = 0.5;
                let certDir = 1;
                let certAnimating = false;
                let certUserInteracting = false;
                let certRafId;

                function certTick() {
                    if (!certificatesGrid) return;
                    const max = certificatesGrid.scrollWidth - certificatesGrid.clientWidth;
                    if (certUserInteracting || max <= 0) {
                        certRafId = requestAnimationFrame(certTick);
                        return;
                    }
                    if (certScroll >= max) certDir = -1;
                    else if (certScroll <= 0) certDir = 1;
                    certScroll += certSpeed * certDir;
                    certificatesGrid.scrollLeft = certScroll;
                    certRafId = requestAnimationFrame(certTick);
                }

                // Sync internal scroll position with user actions
                let certScrollTimeout;
                certificatesGrid.addEventListener('scroll', () => {
                    certUserInteracting = true;
                    clearTimeout(certScrollTimeout);
                    certScroll = certificatesGrid.scrollLeft;
                    certScrollTimeout = setTimeout(() => { certUserInteracting = false; }, 1500);
                });

                certificatesGrid.addEventListener('mouseenter', () => { certUserInteracting = true; });
                certificatesGrid.addEventListener('mouseleave', () => { certUserInteracting = false; });

                if (!certAnimating) {
                    certAnimating = true;
                    setTimeout(() => { certTick(); }, 800);
                }

                window.addEventListener('beforeunload', () => {
                    if (certRafId) cancelAnimationFrame(certRafId);
                });
            }



            const maxScroll = galleryGrid.scrollWidth - galleryGrid.clientWidth;
            
            // Only auto-scroll if there's content to scroll
            if (maxScroll > 0) {
                // If we've scrolled to the end, reverse direction
                if (scrollAmount >= maxScroll) {
                    scrollDirection = -1;
                } else if (scrollAmount <= 0) {
                    scrollDirection = 1;
                }

                scrollAmount += scrollSpeed * scrollDirection;
                galleryGrid.scrollLeft = scrollAmount;
            }
            
            animationFrameId = requestAnimationFrame(autoScroll);
        }

        // Pause on hover and user interaction
        galleryGrid.addEventListener('mouseenter', () => {
            isScrolling = false;
        });

        galleryGrid.addEventListener('mouseleave', () => {
            isScrolling = true;
        });

        // Detect manual scrolling
        let scrollTimeout;
        galleryGrid.addEventListener('scroll', () => {
            userInteracting = true;
            clearTimeout(scrollTimeout);
            scrollAmount = galleryGrid.scrollLeft;
            
            // Resume auto-scroll after user stops interacting
            scrollTimeout = setTimeout(() => {
                userInteracting = false;
            }, 2000); // 2 seconds of inactivity
        });

        // Start auto-scrolling after a short delay
        setTimeout(() => {
            autoScroll();
        }, 1000);

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        });
    }
}
);
