// Presentation Controller
class DSAPresentationController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 18;
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentSlideElement = document.getElementById('currentSlide');
        this.totalSlidesElement = document.getElementById('totalSlides');
        this.progressBar = document.getElementById('progressBar');
        
        this.init();
    }
    
    init() {
        // Set initial state
        this.updateDisplay();
        this.updateNavButtons();
        this.updateProgressBar();
        
        // Add event listeners
        this.addEventListeners();
        
        // Show first slide
        this.showSlide(1);
    }
    
    addEventListeners() {
        // Navigation button listeners
        this.prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.previousSlide();
        });
        
        this.nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.nextSlide();
        });
        
        // Handle external links explicitly BEFORE other click handlers
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="http"]');
            if (link) {
                e.stopPropagation();
                e.preventDefault();
                
                // Track the link click
                this.trackLinkClick(link);
                
                // Open in new tab
                window.open(link.href, '_blank', 'noopener,noreferrer');
                return false;
            }
        }, true); // Use capture phase to handle this first
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Don't interfere with typing in form fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ': // Spacebar
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
            }
        });
        
        // Click to advance (only in safe areas)
        document.addEventListener('click', (e) => {
            // Only advance if clicking directly on slide content area
            // Exclude clicks on any interactive elements
            if (e.target.closest('.navigation-controls') || 
                e.target.closest('a') || 
                e.target.closest('button') ||
                e.target.closest('.resource-link') ||
                e.target.closest('.links-container') ||
                e.target.closest('.resource-section')) {
                return;
            }
            
            // Only advance if clicking on the main slide background
            if (e.target.classList.contains('slide-content') || 
                e.target.classList.contains('slide') ||
                e.target.closest('.slide-content')) {
                
                // Don't advance on last slide
                if (this.currentSlide < this.totalSlides) {
                    this.nextSlide();
                }
            }
        });
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    trackLinkClick(link) {
        const url = link.href;
        const title = link.textContent.trim();
        
        // Visual feedback
        link.classList.add('visited-link');
        
        // Console tracking
        console.log(`🔗 External link opened: "${title}" -> ${url}`);
        
        // Store in sessionStorage (avoiding localStorage per requirements)
        try {
            const visited = JSON.parse(sessionStorage.getItem('visitedLinks') || '[]');
            const linkData = { url, title, timestamp: Date.now() };
            
            if (!visited.find(item => item.url === url)) {
                visited.push(linkData);
                sessionStorage.setItem('visitedLinks', JSON.stringify(visited));
            }
        } catch (e) {
            // Fail silently if sessionStorage is not available
        }
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }
    
    goToSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides || slideNumber === this.currentSlide) {
            return;
        }
        
        const oldSlide = this.currentSlide;
        this.currentSlide = slideNumber;
        
        this.showSlide(slideNumber, oldSlide);
        this.updateDisplay();
        this.updateNavButtons();
        this.updateProgressBar();
        
        // Announce slide change for screen readers
        this.announceSlideChange();
    }
    
    showSlide(slideNumber, oldSlideNumber = null) {
        // Hide all slides
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'slide-enter', 'slide-exit');
            
            if (index + 1 === slideNumber) {
                slide.classList.add('active');
                // Add entrance animation
                setTimeout(() => {
                    slide.classList.add('slide-enter');
                }, 10);
            } else if (oldSlideNumber && index + 1 === oldSlideNumber) {
                // Add exit animation to previous slide
                slide.classList.add('slide-exit');
            }
        });
        
        // Remove animation classes after animation completes
        setTimeout(() => {
            this.slides.forEach(slide => {
                slide.classList.remove('slide-enter', 'slide-exit');
            });
        }, 300);
        
        // Scroll to top of slide content
        window.scrollTo(0, 0);
    }
    
    updateDisplay() {
        this.currentSlideElement.textContent = this.currentSlide;
        this.totalSlidesElement.textContent = this.totalSlides;
    }
    
    updateNavButtons() {
        this.prevBtn.disabled = this.currentSlide === 1;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides;
        
        // Update button text for context
        if (this.currentSlide === 1) {
            this.nextBtn.textContent = 'Start →';
        } else if (this.currentSlide === this.totalSlides) {
            this.prevBtn.textContent = '← Back';
            this.nextBtn.textContent = 'Complete!';
        } else {
            this.prevBtn.textContent = '← Previous';
            this.nextBtn.textContent = 'Next →';
        }
    }
    
    updateProgressBar() {
        const progress = (this.currentSlide / this.totalSlides) * 100;
        this.progressBar.style.width = `${progress}%`;
    }
    
    announceSlideChange() {
        // Create announcement for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        
        const slideTitle = this.slides[this.currentSlide - 1].querySelector('h1, h2');
        const title = slideTitle ? slideTitle.textContent : `Slide ${this.currentSlide}`;
        announcement.textContent = `${title}, slide ${this.currentSlide} of ${this.totalSlides}`;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }
    
    handleResize() {
        // Ensure current slide is visible after resize
        setTimeout(() => {
            this.showSlide(this.currentSlide);
        }, 100);
    }
    
    // Public API for external control
    getProgress() {
        return {
            current: this.currentSlide,
            total: this.totalSlides,
            percentage: (this.currentSlide / this.totalSlides) * 100
        };
    }
    
    jumpToTopic(topicName) {
        // Map topic names to slide numbers
        const topicMap = {
            'arrays': 3,
            'strings': 4,
            'linked lists': 5,
            'stacks & queues': 6,
            'hash maps / sets': 7,
            'sorting & binary search': 8,
            'heaps / priority queues': 9,
            'trees': 10,
            'binary search trees': 11,
            'tries': 12,
            'graphs': 13,
            'dynamic programming': 14,
            'greedy algorithms & bit manipulation': 15,
            'advanced data structures': 16
        };
        
        const slideNumber = topicMap[topicName.toLowerCase()];
        if (slideNumber) {
            this.goToSlide(slideNumber);
        }
    }
}

// Enhanced link functionality
class LinkEnhancer {
    constructor() {
        this.clickedLinks = new Set();
        this.init();
    }
    
    init() {
        this.enhanceExternalLinks();
        this.restoreVisitedState();
    }
    
    enhanceExternalLinks() {
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            // Ensure target="_blank" is set
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            
            // Add external link indicator if not present
            if (!link.querySelector('.external-indicator')) {
                const indicator = document.createElement('span');
                indicator.className = 'external-indicator';
                indicator.innerHTML = ' ↗';
                indicator.style.fontSize = '0.8em';
                indicator.style.opacity = '0.7';
                indicator.style.marginLeft = '4px';
                link.appendChild(indicator);
            }
            
            // Add enhanced hover effects
            link.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                link.style.transform = 'translateY(-2px)';
                link.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            });
            
            link.addEventListener('mouseleave', (e) => {
                e.stopPropagation();
                link.style.transform = 'translateY(0)';
                link.style.boxShadow = '';
            });
            
            // Prevent click from bubbling to slide advance
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                // The actual opening is handled by the presentation controller
            });
        });
    }
    
    restoreVisitedState() {
        try {
            const visited = JSON.parse(sessionStorage.getItem('visitedLinks') || '[]');
            visited.forEach(linkData => {
                const link = document.querySelector(`a[href="${linkData.url}"]`);
                if (link) {
                    link.classList.add('visited-link');
                    this.clickedLinks.add(linkData.url);
                }
            });
        } catch (e) {
            // Fail silently
        }
    }
    
    getVisitedLinks() {
        try {
            return JSON.parse(sessionStorage.getItem('visitedLinks') || '[]');
        } catch (e) {
            return [];
        }
    }
}

// Accessibility enhancements
class AccessibilityEnhancer {
    constructor() {
        this.init();
    }
    
    init() {
        this.addSkipLinks();
        this.enhanceKeyboardNavigation();
        this.addAriaLabels();
        this.handleFocusManagement();
    }
    
    addSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--color-primary);
            color: var(--color-btn-primary-text);
            padding: 8px;
            text-decoration: none;
            z-index: 10000;
            border-radius: 4px;
            font-weight: 500;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content landmark
        const firstSlide = document.querySelector('.slide');
        if (firstSlide && !document.getElementById('main-content')) {
            firstSlide.id = 'main-content';
        }
    }
    
    enhanceKeyboardNavigation() {
        // Ensure all interactive elements are focusable
        document.querySelectorAll('.resource-link, .nav-btn').forEach(element => {
            if (!element.getAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        });
        
        // Add focus indicators
        const style = document.createElement('style');
        style.textContent = `
            .resource-link:focus,
            .nav-btn:focus {
                outline: var(--focus-outline);
                outline-offset: 2px;
                box-shadow: var(--focus-ring);
            }
            
            .visited-link {
                opacity: 0.8;
                background: var(--color-secondary) !important;
            }
            
            .visited-link::after {
                content: " ✓";
                color: var(--color-success);
                font-weight: bold;
                margin-left: 4px;
            }
        `;
        document.head.appendChild(style);
    }
    
    addAriaLabels() {
        // Add ARIA labels to navigation
        const navControls = document.querySelector('.navigation-controls');
        if (navControls) {
            navControls.setAttribute('role', 'navigation');
            navControls.setAttribute('aria-label', 'Slide navigation');
        }
        
        // Add ARIA labels to slides
        document.querySelectorAll('.slide').forEach((slide, index) => {
            slide.setAttribute('role', 'tabpanel');
            slide.setAttribute('aria-label', `Slide ${index + 1} of 18`);
        });
        
        // Add ARIA label to progress bar
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.setAttribute('role', 'progressbar');
            progressBar.setAttribute('aria-label', 'Presentation progress');
        }
    }
    
    handleFocusManagement() {
        // Focus management for slide changes
        document.addEventListener('slideChange', (e) => {
            const activeSlide = document.querySelector('.slide.active');
            const firstFocusable = activeSlide.querySelector('h1, h2, a, button, [tabindex="0"]');
            
            if (firstFocusable) {
                setTimeout(() => {
                    firstFocusable.focus();
                }, 100);
            }
        });
    }
}

// Touch and gesture support
class TouchGestureHandler {
    constructor(presentation) {
        this.presentation = presentation;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50;
        
        this.init();
    }
    
    init() {
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
    }
    
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
        
        this.handleGesture();
    }
    
    handleGesture() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        
        // Check if it's a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe right - previous slide
                this.presentation.previousSlide();
            } else {
                // Swipe left - next slide
                this.presentation.nextSlide();
            }
        }
    }
}

// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main presentation controller
    const presentation = new DSAPresentationController();
    
    // Initialize additional features
    const linkEnhancer = new LinkEnhancer();
    const accessibility = new AccessibilityEnhancer();
    const touchHandler = new TouchGestureHandler(presentation);
    
    // Add custom event for slide changes
    const originalGoToSlide = presentation.goToSlide.bind(presentation);
    presentation.goToSlide = function(slideNumber) {
        const result = originalGoToSlide(slideNumber);
        
        // Dispatch custom event
        const event = new CustomEvent('slideChange', {
            detail: {
                slideNumber: slideNumber,
                progress: this.getProgress()
            }
        });
        document.dispatchEvent(event);
        
        return result;
    };
    
    // Expose presentation to global scope for external control
    window.dsaPresentation = presentation;
    
    // Add console help message
    console.log(`
🎯 DSA Presentation Loaded Successfully!

Available commands:
- dsaPresentation.goToSlide(n) - Jump to slide n
- dsaPresentation.jumpToTopic('topic name') - Jump to specific topic
- dsaPresentation.getProgress() - Get current progress

Keyboard shortcuts:
- Arrow keys: Navigate slides
- Space: Next slide
- Home: First slide
- End: Last slide
- Escape: Return to first slide

Touch gestures:
- Swipe left: Next slide
- Swipe right: Previous slide

🔗 External links will open in new tabs when clicked!
    `);
});

// Error handling and fallbacks
window.addEventListener('error', (e) => {
    console.error('Presentation error:', e.error);
    
    // Fallback: ensure at least basic navigation works
    if (!window.dsaPresentation) {
        console.log('Initializing fallback presentation controller...');
        setTimeout(() => {
            try {
                window.dsaPresentation = new DSAPresentationController();
            } catch (fallbackError) {
                console.error('Fallback initialization failed:', fallbackError);
            }
        }, 100);
    }
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loadTime = performance.now();
            console.log(`📊 Presentation loaded in ${loadTime.toFixed(2)}ms`);
        }, 0);
    });
}