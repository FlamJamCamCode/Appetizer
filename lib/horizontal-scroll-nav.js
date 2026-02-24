/**
 * Horizontal Scroll Navigation Plugin
 * 
 * Creates a sticky horizontal navigation bar that syncs with vertical page scroll.
 * Each button represents a section and fills with gradient based on scroll progress.
 * 
 * Usage:
 *   1. Include this script
 *   2. Default mode: Auto-detects sections or uses getSegments.js
 *   3. Web component mode: Use <horscroller-viewport /> and .horscroller-section
 * 
 * @version 1.0.0
 */

(function(global) {
    'use strict';

    /**
     * Horizontal Scroll Navigator
     */
    class HorizontalScrollNav {
        constructor(options = {}) {
            this.options = {
                // Selectors
                sectionSelector: options.sectionSelector || '.horscroller-section',
                viewportSelector: options.viewportSelector || 'horscroller-viewport',
                navBarClass: options.navBarClass || 'horscroller-nav-bar',
                buttonClass: options.buttonClass || 'horscroller-nav-button',
                
                // Styling
                sticky: options.sticky !== false,
                zIndex: options.zIndex || 100,
                
                // Behavior
                marginBottom: options.marginBottom || 50,
                updateThrottle: options.updateThrottle || 10,
                
                // Callbacks
                onSectionClick: options.onSectionClick || null,
                getSectionLabel: options.getSectionLabel || null,
                getSectionId: options.getSectionId || null,
                
                // Auto-detect mode
                autoDetect: options.autoDetect !== false,
                useGetSegments: options.useGetSegments !== false,
                
                ...options
            };
            
            this.navBar = null;
            this.sections = [];
            this.buttons = [];
            this.sectionToButtonMap = new Map();
            this.isUserScrollingNav = false;
            this.navBarHeight = 0;
            
            this.init();
        }
        
        /**
         * Initialize the plugin
         */
        init() {
            // Check for web component mode
            const viewport = document.querySelector(this.options.viewportSelector);
            if (viewport) {
                this.initWebComponentMode(viewport);
                return;
            }
            
            // Default mode: auto-detect or use getSegments
            if (this.options.autoDetect) {
                this.initDefaultMode();
            }
        }
        
        /**
         * Initialize web component mode
         */
        initWebComponentMode(viewport) {
            // Get sections from viewport
            this.sections = Array.from(viewport.querySelectorAll(this.options.sectionSelector));
            
            if (this.sections.length === 0) {
                console.warn('HorizontalScrollNav: No sections found with selector:', this.options.sectionSelector);
                return;
            }
            
            // Ensure all sections have IDs
            this.sections.forEach((section, index) => {
                if (!section.id) {
                    section.id = `horscroller-section-${index}`;
                }
            });
            
            // Create nav bar after viewport
            this.createNavBar(viewport);
            this.setupButtons();
            this.setupScrollListener();
        }
        
        /**
         * Initialize default mode (auto-detect)
         */
        initDefaultMode() {
            // Try to use getSegments if available
            if (this.options.useGetSegments && typeof window.getSegments === 'function') {
                const segments = window.getSegments();
                if (segments && segments.length > 0) {
                    this.sections = segments;
                    this.createNavBar();
                    this.setupButtons();
                    this.setupScrollListener();
                    return;
                }
            }
            
            // Auto-detect: look for common section patterns
            // Try: section[id], .section[id], [data-section], etc.
            const selectors = [
                'section[id]',
                '.section[id]',
                '[data-section][id]',
                'div[id].horscroller-section',
                '.horscroller-section[id]'
            ];
            
            for (const selector of selectors) {
                this.sections = Array.from(document.querySelectorAll(selector));
                if (this.sections.length > 0) {
                    break;
                }
            }
            
            if (this.sections.length === 0) {
                console.warn('HorizontalScrollNav: No sections found. Please provide sections or use getSegments.js');
                return;
            }
            
            this.createNavBar();
            this.setupButtons();
            this.setupScrollListener();
        }
        
        /**
         * Create the navigation bar DOM structure
         */
        createNavBar(insertAnchor = null) {
            // Create nav bar container
            this.navBar = document.createElement('div');
            this.navBar.className = this.options.navBarClass;
            
            // Inject styles
            this.injectStyles();
            
            // Insert into DOM
            if (insertAnchor) {
                // If the anchor is the viewport webcomponent, place the bar
                // directly BEFORE it so it's at the top of what it contains.
                if (insertAnchor.matches && insertAnchor.matches(this.options.viewportSelector)) {
                    insertAnchor.parentNode.insertBefore(this.navBar, insertAnchor);
                } else {
                    insertAnchor.parentNode.insertBefore(this.navBar, insertAnchor.nextSibling);
                }
            } else {
                // Try to insert after header, or at top of body
                const header = document.querySelector('header');
                if (header) {
                    header.parentNode.insertBefore(this.navBar, header.nextSibling);
                } else {
                    document.body.insertBefore(this.navBar, document.body.firstChild);
                }
            }
            
            // Initial nav bar height; actual value may change with responsive layout,
            // so we also recalculate it on the fly where needed.
            this.navBarHeight = this.navBar.offsetHeight;
        }

        /**
         * Compute current nav bar height (responsive-aware)
         */
        getNavBarHeight() {
            if (!this.navBar) return 0;
            const rect = this.navBar.getBoundingClientRect();
            return rect.height || this.navBar.offsetHeight || 0;
        }
        
        /**
         * Setup navigation buttons
         */
        setupButtons() {
            this.sections.forEach((section, index) => {
                const button = this.createButton(section, index);
                this.navBar.appendChild(button);
                this.buttons.push(button);
                this.sectionToButtonMap.set(section, button);
            });
            
            // Initialize button CSS variables
            this.buttons.forEach(button => {
                button.style.setProperty('--fill-width', '0%');
                button.style.setProperty('--viewport-left', '0%');
                button.style.setProperty('--viewport-width', '0%');
            });
        }
        
        /**
         * Create a button for a section
         */
        createButton(section, index) {
            const button = document.createElement('a');
            button.className = this.options.buttonClass;
            button.href = '#' + this.getSectionId(section, index);
            
            // Get button label
            const label = this.getSectionLabel(section, index);
            const span = document.createElement('span');
            span.textContent = label;
            button.appendChild(span);
            
            // Add click handler: we own scrolling so we can account for sticky nav.
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToSection(section);
                // Smooth scroll will emit real scroll events; progress/viewport
                // logic stays in the normal scroll pathway.
            });
            
            return button;
        }
        
        /**
         * Get section ID
         */
        getSectionId(section, index) {
            if (this.options.getSectionId) {
                return this.options.getSectionId(section, index);
            }
            // Try to get ID from section
            if (section.id) {
                return section.id;
            }
            // Generate ID if none exists
            const generatedId = `horscroller-section-${index}`;
            section.id = generatedId;
            return generatedId;
        }
        
        /**
         * Get section label for button
         */
        getSectionLabel(section, index) {
            if (this.options.getSectionLabel) {
                return this.options.getSectionLabel(section, index);
            }
            
            // Try to find a title element
            const title = section.querySelector('h1, h2, h3, .title, [data-title]');
            if (title) {
                return title.textContent.trim();
            }
            
            // Try data attribute
            if (section.dataset.title) {
                return section.dataset.title;
            }
            
            // Fallback
            return section.id || `Section ${index + 1}`;
        }
        
        /**
         * Scroll to a section
         */
        scrollToSection(section) {
            const rect = section.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const navBarHeight = this.getNavBarHeight();
            const targetTop = rect.top + scrollTop - navBarHeight;
            
            window.scrollTo({
                top: targetTop,
                behavior: 'smooth'
            });
            
            if (this.options.onSectionClick) {
                this.options.onSectionClick(section);
            }
        }
        
        /**
         * Calculate progress through a section (0 to 1)
         */
        getSectionProgress(section) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const navBarHeight = this.getNavBarHeight();
            const viewportHeight = Math.max(0, window.innerHeight - navBarHeight);
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollTop;
            const sectionHeight = section.offsetHeight;
            const sectionBottom = sectionTop + sectionHeight;
            
            const viewportTop = scrollTop + navBarHeight;
            const viewportBottom = viewportTop + viewportHeight;
            
            // If section is completely above viewport (scrolled past), progress is 1
            if (sectionBottom <= viewportTop) return 1;
            
            // If section is completely below viewport (not reached), progress is 0
            if (sectionTop >= viewportBottom) return 0;
            
            // Calculate progress: how much of the section has been scrolled through
            const scrolledIntoSection = viewportTop - sectionTop;
            const progress = Math.max(0, Math.min(1, scrolledIntoSection / sectionHeight));
            
            return progress;
        }
        
        /**
         * Calculate viewport indicator position and width for a section
         */
        getViewportIndicator(section) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const navBarHeight = this.getNavBarHeight();
            const viewportHeight = Math.max(0, window.innerHeight - navBarHeight);
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollTop;
            const sectionHeight = section.offsetHeight;
            const sectionBottom = sectionTop + sectionHeight;
            
            const viewportTop = scrollTop + navBarHeight;
            const viewportBottom = viewportTop + viewportHeight;
            
            // Check if viewport overlaps with section
            const viewportOverlapTop = Math.max(viewportTop, sectionTop);
            const viewportOverlapBottom = Math.min(viewportBottom, sectionBottom);
            
            // If no overlap, return null
            if (viewportOverlapTop >= viewportOverlapBottom) return null;
            
            // Calculate viewport position and size as percentage of section
            const viewportStartInSection = viewportOverlapTop - sectionTop;
            const viewportSizeInSection = viewportOverlapBottom - viewportOverlapTop;
            
            return {
                left: (viewportStartInSection / sectionHeight) * 100,
                width: (viewportSizeInSection / sectionHeight) * 100
            };
        }
        
        /**
         * Find active section considering margins
         */
        getActiveSectionWithMargin() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const navBarHeight = this.getNavBarHeight();
            const viewportHeight = Math.max(0, window.innerHeight - navBarHeight);
            const viewportCenter = scrollTop + navBarHeight + (viewportHeight / 2);
            
            let closestSection = null;
            let closestDistance = Infinity;
            let bestProgress = -1;
            
            this.sections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top + scrollTop;
                const sectionHeight = section.offsetHeight;
                const sectionBottom = sectionTop + sectionHeight;
                const style = window.getComputedStyle(section);
                const marginBottom = parseFloat(style.marginBottom) || this.options.marginBottom;
                const effectiveMargin = marginBottom * 0.5; // treat half the gap as belonging to this section
                const sectionWithMarginBottom = sectionBottom + effectiveMargin;
                
                // Check if viewport center is within section or its margin
                const isInSection = viewportCenter >= sectionTop && viewportCenter <= sectionWithMarginBottom;
                
                if (isInSection) {
                    const extendedHeight = sectionHeight + marginBottom;
                    const scrolledIntoExtended = Math.max(0, viewportCenter - sectionTop);
                    const progress = Math.min(1, scrolledIntoExtended / extendedHeight);
                    
                    if (progress > bestProgress) {
                        bestProgress = progress;
                        closestSection = section;
                    }
                } else {
                    const distanceToTop = Math.abs(viewportCenter - sectionTop);
                    const distanceToBottom = Math.abs(viewportCenter - sectionWithMarginBottom);
                    const minDistance = Math.min(distanceToTop, distanceToBottom);
                    
                    if (minDistance < closestDistance) {
                        closestDistance = minDistance;
                        if (!closestSection || bestProgress < 0) {
                            closestSection = section;
                        }
                    }
                }
            });
            
            return closestSection;
        }
        
        /**
         * Update navigation bar based on scroll position
         */
        updateNavBar() {
            if (this.isUserScrollingNav) return;
            
            const navBarHeight = this.getNavBarHeight();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Compact mode: shrink bar into a thinner progress line when scrolling down
            const compactThreshold = navBarHeight * 2;
            if (scrollTop > compactThreshold) {
                this.navBar.classList.add('compact');
            } else {
                this.navBar.classList.remove('compact');
            }
            let activeSection = null;
            let maxProgress = -1;
            
            // Update all button fills and find the most active section
            this.sections.forEach((section) => {
                const button = this.sectionToButtonMap.get(section);
                if (!button) return;
                
                const progress = this.getSectionProgress(section);
                const viewportIndicator = this.getViewportIndicator(section);
                
                // Update gradient fill width (0% to 100%)
                button.style.setProperty('--fill-width', (progress * 100) + '%');
                
                // Update viewport indicator and in-viewport highlighting
                if (viewportIndicator) {
                    button.style.setProperty('--viewport-left', viewportIndicator.left + '%');
                    button.style.setProperty('--viewport-width', viewportIndicator.width + '%');
                    button.classList.add('in-viewport');
                } else {
                    button.style.setProperty('--viewport-left', '0%');
                    button.style.setProperty('--viewport-width', '0%');
                    button.classList.remove('in-viewport');
                }
                
                // Track the most active section
                if (progress > maxProgress) {
                    maxProgress = progress;
                    activeSection = section;
                }
            });
            
            // Use section with margin consideration for smooth transitions
            const activeSectionWithMargin = this.getActiveSectionWithMargin();
            activeSection = activeSectionWithMargin || activeSection;
            
            // Scroll horizontal nav bar proportionally to body scroll within active section
            if (activeSection) {
                const activeButton = this.sectionToButtonMap.get(activeSection);
                if (!activeButton) return;
                
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const viewportHeight = Math.max(0, window.innerHeight - navBarHeight);
                const viewportCenter = scrollTop + navBarHeight + (viewportHeight / 2);
                const rect = activeSection.getBoundingClientRect();
                const sectionTop = rect.top + scrollTop;
                const sectionHeight = activeSection.offsetHeight;
                const style = window.getComputedStyle(activeSection);
                const marginBottom = parseFloat(style.marginBottom) || this.options.marginBottom;
                const effectiveMargin = marginBottom * 0.5;
                const extendedHeight = sectionHeight + effectiveMargin;
                
                // Calculate progress including margin
                const scrolledIntoExtended = Math.max(0, viewportCenter - sectionTop);
                const extendedProgress = Math.min(1, scrolledIntoExtended / extendedHeight);
                
                // Normalized scroll: extended section height maps to button width
                const buttonWidth = activeButton.offsetWidth;
                const buttonLeft = activeButton.offsetLeft;
                const navWidth = this.navBar.clientWidth;
                const navScrollWidth = this.navBar.scrollWidth - this.navBar.clientWidth;
                
                // Calculate target scroll
                const targetScroll = buttonLeft + (extendedProgress * buttonWidth) - (navWidth / 2) + (buttonWidth / 2);
                
                // Scroll the nav bar
                this.navBar.scrollTo({
                    left: Math.max(0, Math.min(navScrollWidth, targetScroll)),
                    behavior: 'auto'
                });
            }
        }
        
        /**
         * Setup scroll listener
         */
        setupScrollListener() {
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    this.updateNavBar();
                }, this.options.updateThrottle);
            }, { passive: true });
            
            // Initial update
            this.updateNavBar();
        }
        
        /**
         * Inject CSS styles
         */
        injectStyles() {
            const styleId = 'horscroller-nav-styles';
            if (document.getElementById(styleId)) return;
            
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .${this.options.navBarClass} {
                    background: linear-gradient(135deg, rgba(139, 0, 0, 0.4), rgba(72, 61, 139, 0.3));
                    border: 3px solid rgba(212, 175, 55, 0.6);
                    border-radius: 12px;
                    padding: 15px;
                    margin: 40px 0;
                    overflow-x: auto;
                    overflow-y: hidden;
                    white-space: nowrap;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(212, 175, 55, 0.5) rgba(0, 0, 0, 0.3);
                    ${this.options.sticky ? `position: sticky; top: 0; z-index: ${this.options.zIndex}; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);` : ''}
                }

                /* Responsive tweaks */
                @media (max-width: 900px) {
                    .${this.options.navBarClass} {
                        padding: 10px;
                        margin: 20px 0;
                    }

                    .${this.options.buttonClass} {
                        padding: 10px 16px;
                        font-size: 0.9em;
                        margin: 0 4px;
                    }
                }

                @media (max-width: 600px) {
                    .${this.options.navBarClass} {
                        border-width: 2px;
                    }

                    .${this.options.buttonClass} {
                        padding: 8px 12px;
                        font-size: 0.85em;
                    }
                }
                
                .${this.options.navBarClass}::-webkit-scrollbar {
                    height: 8px;
                }
                
                .${this.options.navBarClass}::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 4px;
                }
                
                .${this.options.navBarClass}::-webkit-scrollbar-thumb {
                    background: rgba(212, 175, 55, 0.5);
                    border-radius: 4px;
                    transition: background 0.2s ease;
                }
                
                .${this.options.navBarClass}::-webkit-scrollbar-thumb:hover {
                    background: rgba(212, 175, 55, 0.8);
                }
                
                .${this.options.buttonClass} {
                    display: inline-block;
                    padding: 12px 24px;
                    margin: 0 8px;
                    background: linear-gradient(135deg, rgba(139, 0, 0, 0.3), rgba(212, 175, 55, 0.2));
                    border: 2px solid rgba(212, 175, 55, 0.4);
                    border-radius: 8px;
                    color: #d4c5a9;
                    text-decoration: none;
                    font-size: 1em;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    white-space: nowrap;
                    position: relative;
                    overflow: hidden;
                }

                .${this.options.buttonClass}.in-viewport {
                    border-color: #ffd700;
                    color: #ffd700;
                    box-shadow: 0 0 16px rgba(255, 215, 0, 0.45);
                }
                
                .${this.options.buttonClass}::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: var(--fill-width, 0%);
                    height: 100%;
                    background: linear-gradient(135deg, rgba(255, 68, 68, 0.6), rgba(255, 215, 0, 0.5));
                    z-index: 0;
                }
                
                .${this.options.buttonClass}::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: var(--viewport-left, 0%);
                    width: var(--viewport-width, 0%);
                    height: 100%;
                    background: linear-gradient(135deg, rgba(79, 195, 247, 0.6), rgba(147, 112, 219, 0.5));
                    /* No transition here on purpose: we want the viewport indicator
                       to jump exactly with scroll, not glide across the button. */
                    z-index: 1;
                    pointer-events: none;
                }
                
                .${this.options.buttonClass} span {
                    position: relative;
                    z-index: 2;
                }
                
                .${this.options.buttonClass}:hover {
                    border-color: #ffd700;
                    color: #ffd700;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
                }
                
                .${this.options.buttonClass}:active {
                    transform: translateY(0);
                }

                .${this.options.navBarClass}.compact {
                    padding-top: 4px;
                    padding-bottom: 4px;
                    border-width: 2px;
                }

                .${this.options.navBarClass}.compact .${this.options.buttonClass} {
                    padding-top: 4px;
                    padding-bottom: 4px;
                    font-size: 0;
                }

                .${this.options.navBarClass}.compact .${this.options.buttonClass} span {
                    display: none;
                }
            `;
            document.head.appendChild(style);
        }
        
        /**
         * Destroy the plugin instance
         */
        destroy() {
            if (this.navBar && this.navBar.parentNode) {
                this.navBar.parentNode.removeChild(this.navBar);
            }
            
            // Remove styles
            const style = document.getElementById('horscroller-nav-styles');
            if (style) {
                style.parentNode.removeChild(style);
            }
        }
    }
    
    // Export for use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = HorizontalScrollNav;
    } else {
        global.HorizontalScrollNav = HorizontalScrollNav;
        
        // Auto-initialize if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                // Auto-initialize if horscroller-viewport exists
                if (document.querySelector('horscroller-viewport')) {
                    new HorizontalScrollNav();
                }
            });
        } else {
            // DOM already loaded
            if (document.querySelector('horscroller-viewport')) {
                new HorizontalScrollNav();
            }
        }
    }
    
})(typeof window !== 'undefined' ? window : this);

