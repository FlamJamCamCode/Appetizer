/* ============================================
   SHARED LOBBY FLUID TABS SYSTEM
   Common JavaScript for all Rally Lobby interfaces
   ============================================ */

(function() {
    'use strict';

    // Configuration
    const config = {
        tabs: ['before', 'lobby', 'fulfillment'],
        currentTab: 0,
        hintFadeDelay: 5000,
        hintFadeDuration: 1000,
        
        // Scroll system configuration - SINGLE SOURCE OF TRUTH
        scrollOffset: 20,           // Pixels from top where sections align
        scrollAnimationDuration: 600, // Must match CSS smooth scroll
        scrollDetectionTolerance: 5,  // Pixels tolerance for detection
        minSectionHeight: 50          // Minimum height to create dot
    };

    // DOM Elements (cached)
    let elements = {};
    
    // Scroll state
    let scrollState = {
        currentSections: [],
        activeSectionIndex: 0,
        isScrolling: false,
        isProgrammaticScroll: false,
        scrollTimeout: null // Track timeout to prevent multiple timers
    };

    // Initialize the lobby tabs system
    function init() {
        // Cache DOM elements
        elements = {
            tabButtons: document.querySelectorAll('.tab-button'),
            contentPanels: document.querySelectorAll('.content-panel'),
            prevArrow: document.getElementById('prevArrow'),
            nextArrow: document.getElementById('nextArrow'),
            shortcutsHint: document.querySelector('.shortcuts-hint')
        };

        // Set up event listeners
        setupTabButtons();
        setupArrowNavigation();
        setupKeyboardShortcuts();
        setupHintFade();
        setupSmoothScrolling();
        setupScrollIndicators();

        // Initialize UI state
        updateArrows();
        updateScrollSections();
    }

    // Tab switching logic
    function switchToTab(index) {
        if (index < 0 || index >= config.tabs.length) return;

        const oldTab = config.currentTab;
        config.currentTab = index;

        // Update tab buttons
        elements.tabButtons.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });

        // Update content panels with direction-aware animation
        elements.contentPanels.forEach((panel, i) => {
            panel.classList.remove('active', 'previous');
            
            if (i === index) {
                panel.classList.add('active');
            } else if (i === oldTab && i < index) {
                panel.classList.add('previous');
            }
        });

        // Update navigation arrows
        updateArrows();

        // Scroll to top of new panel
        elements.contentPanels[index].scrollTop = 0;

        // Trigger animation restart for fade-in effects
        triggerAnimationRestart(elements.contentPanels[index]);

        // Update scroll sections for new panel
        setTimeout(() => {
            updateScrollSections();
        }, 100);
    }

    // Update arrow button states
    function updateArrows() {
        if (elements.prevArrow && elements.nextArrow) {
            elements.prevArrow.classList.toggle('disabled', config.currentTab === 0);
            elements.nextArrow.classList.toggle('disabled', config.currentTab === config.tabs.length - 1);
        }
    }

    // Trigger CSS animation restart
    function triggerAnimationRestart(element) {
        element.style.animation = 'none';
        requestAnimationFrame(() => {
            element.style.animation = '';
        });
    }

    // Set up tab button click handlers
    function setupTabButtons() {
        elements.tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => switchToTab(index));
        });
    }

    // Set up arrow navigation
    function setupArrowNavigation() {
        if (elements.prevArrow) {
            elements.prevArrow.addEventListener('click', () => {
                if (config.currentTab > 0) {
                    switchToTab(config.currentTab - 1);
                }
            });
        }

        if (elements.nextArrow) {
            elements.nextArrow.addEventListener('click', () => {
                if (config.currentTab < config.tabs.length - 1) {
                    switchToTab(config.currentTab + 1);
                }
            });
        }
    }

    // Set up keyboard shortcuts
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Don't interfere with Page Up/Down - let them work natively
            if (e.key === 'PageUp' || e.key === 'PageDown') {
                return; // Native browser behavior
            }

            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    if (config.currentTab > 0) {
                        switchToTab(config.currentTab - 1);
                    }
                    break;
                
                case 'ArrowRight':
                    e.preventDefault();
                    if (config.currentTab < config.tabs.length - 1) {
                        switchToTab(config.currentTab + 1);
                    }
                    break;
                
                case 'ArrowDown':
                    // Navigate to next section if sections exist
                    if (scrollState.currentSections.length > 1) {
                        e.preventDefault();
                        scrollToNextSection();
                    }
                    break;
                
                case 'ArrowUp':
                    // Navigate to previous section if sections exist
                    if (scrollState.currentSections.length > 1) {
                        e.preventDefault();
                        scrollToPreviousSection();
                    }
                    break;
                
                case '1':
                    switchToTab(0);
                    break;
                
                case '2':
                    switchToTab(1);
                    break;
                
                case '3':
                    switchToTab(2);
                    break;
            }
        });
    }

    // Set up keyboard shortcuts hint fade behavior
    function setupHintFade() {
        if (!elements.shortcutsHint) return;

        // Fade out after delay
        setTimeout(() => {
            elements.shortcutsHint.style.transition = `opacity ${config.hintFadeDuration}ms ease`;
            elements.shortcutsHint.style.opacity = '0';
            
            setTimeout(() => {
                elements.shortcutsHint.style.display = 'none';
            }, config.hintFadeDuration);
        }, config.hintFadeDelay);

        // Show hint again on arrow hover
        if (elements.prevArrow && elements.nextArrow) {
            [elements.prevArrow, elements.nextArrow].forEach(arrow => {
                arrow.addEventListener('mouseenter', () => {
                    elements.shortcutsHint.style.display = 'block';
                    elements.shortcutsHint.style.opacity = '1';
                });
            });
        }
    }

    // ============================================
    //  SMOOTH VERTICAL SCROLLING SYSTEM
    // ============================================

    // Set up smooth scrolling behavior
    function setupSmoothScrolling() {
        elements.contentPanels.forEach(panel => {
            // Track scroll position for indicators
            panel.addEventListener('scroll', () => {
                if (!panel.classList.contains('active')) return;
                
                // Update immediately - isProgrammaticScroll flag handles blocking
                updateScrollIndicatorPosition(panel);
            });

            // Track manual scrolling - mark as user-initiated to re-enable detection
            panel.addEventListener('wheel', (e) => {
                scrollState.isProgrammaticScroll = false;
                scrollState.isScrolling = true;
            }, { passive: true });

            // Track scrollbar dragging - also user-initiated
            panel.addEventListener('mousedown', (e) => {
                scrollState.isProgrammaticScroll = false;
            });

            // Track touch scrolling on mobile
            panel.addEventListener('touchstart', (e) => {
                scrollState.isProgrammaticScroll = false;
            }, { passive: true });
        });
    }

    // Update which sections exist in current panel
    function updateScrollSections() {
        const activePanel = elements.contentPanels[config.currentTab];
        if (!activePanel) return;

        // Find all direct children of the active panel
        // This automatically includes ANY content block regardless of class name
        // (divs, h1s, sections, tables, images, whatever you add)
        scrollState.currentSections = Array.from(activePanel.children).filter(el => {
            // Only include elements with significant height
            return el.offsetHeight > config.minSectionHeight;
        });

        // Reset to first section
        scrollState.activeSectionIndex = 0;
        scrollState.isProgrammaticScroll = false;

        // Create or update scroll indicators
        createScrollIndicators();
    }

    // Create scroll indicator dots
    function createScrollIndicators() {
        // Remove existing indicator
        const existingIndicator = document.querySelector('.scroll-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Only show if there are multiple sections
        if (scrollState.currentSections.length <= 1) return;

        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';

        scrollState.currentSections.forEach((section, index) => {
            const dot = document.createElement('div');
            dot.className = 'scroll-dot';
            if (index === 0) dot.classList.add('active');
            
            dot.addEventListener('click', () => {
                scrollToSection(index);
            });
            
            indicator.appendChild(dot);
        });

        document.body.appendChild(indicator);

        // Show indicator after a brief delay
        setTimeout(() => {
            indicator.classList.add('visible');
        }, 300);
    }

    // Scroll to specific section smoothly
    function scrollToSection(index) {
        const activePanel = elements.contentPanels[config.currentTab];
        const section = scrollState.currentSections[index];
        
        if (!activePanel || !section) return;

        // Update active section index FIRST
        scrollState.activeSectionIndex = index;

        // Mark as programmatic scroll
        scrollState.isProgrammaticScroll = true;

        const panelRect = activePanel.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        
        const scrollTop = activePanel.scrollTop;
        const targetScroll = scrollTop + sectionRect.top - panelRect.top - config.scrollOffset;

        // Update active dot immediately
        const dots = document.querySelectorAll('.scroll-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        // Smooth scroll
        activePanel.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });

        // Clear any existing timeout before setting new one
        if (scrollState.scrollTimeout) {
            clearTimeout(scrollState.scrollTimeout);
        }

        // Reset programmatic scroll flag as safety fallback
        // Primary reset happens via manual scroll events (wheel, touch, mousedown)
        scrollState.scrollTimeout = setTimeout(() => {
            scrollState.isProgrammaticScroll = false;
            scrollState.scrollTimeout = null;
        }, config.scrollAnimationDuration + 100); // Extra buffer to ensure animation completes
    }

    // Navigate to next section
    function scrollToNextSection() {
        if (scrollState.currentSections.length === 0) return;
        
        const nextIndex = Math.min(
            scrollState.activeSectionIndex + 1,
            scrollState.currentSections.length - 1
        );
        
        if (nextIndex !== scrollState.activeSectionIndex) {
            scrollToSection(nextIndex);
        }
    }

    // Navigate to previous section
    function scrollToPreviousSection() {
        if (scrollState.currentSections.length === 0) return;
        
        const prevIndex = Math.max(
            scrollState.activeSectionIndex - 1,
            0
        );
        
        if (prevIndex !== scrollState.activeSectionIndex) {
            scrollToSection(prevIndex);
        }
    }

    // Update active scroll indicator based on scroll position
    function updateScrollIndicatorPosition(panel) {
        // Don't update during programmatic scrolling (arrow key navigation)
        if (scrollState.isProgrammaticScroll) return;
        if (scrollState.currentSections.length === 0) return;

        const panelRect = panel.getBoundingClientRect();
        // Use SAME offset as scrollToSection - SINGLE SOURCE OF TRUTH
        const triggerPoint = panelRect.top - config.scrollOffset;

        // Find which section has crossed the trigger point
        let activeIndex = 0;

        for (let i = scrollState.currentSections.length - 1; i >= 0; i--) {
            const section = scrollState.currentSections[i];
            const rect = section.getBoundingClientRect();
            
            // If section's top is at or above trigger point (with tolerance for sub-pixel rendering)
            if (rect.top <= triggerPoint + config.scrollDetectionTolerance) {
                activeIndex = i;
                break;
            }
        }

        // Update active dot only if changed
        if (activeIndex !== scrollState.activeSectionIndex) {
            scrollState.activeSectionIndex = activeIndex;
            
            const dots = document.querySelectorAll('.scroll-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeIndex);
            });
        }
    }

    // Set up scroll indicators system
    function setupScrollIndicators() {
        // Indicators are created/updated in updateScrollSections()
        // Called automatically when tabs switch
    }

    // Public API (if needed for custom extensions)
    window.LobbyTabs = {
        switchToTab: switchToTab,
        getCurrentTab: () => config.currentTab,
        getTotalTabs: () => config.tabs.length,
        scrollToSection: scrollToSection,
        scrollToNextSection: scrollToNextSection,
        scrollToPreviousSection: scrollToPreviousSection,
        getCurrentSections: () => scrollState.currentSections,
        updateSections: updateScrollSections
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

