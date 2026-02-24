/**
 * Branching Navigation Plugin
 * 
 * Git-branch-style navigation: main branch (chapters) with sub-branches that appear
 * in a side column when active, then merge back when completed.
 * 
 * Structure:
 * - Main branch: horizontal navigation bar with chapters
 * - Sub-branches: appear in side column when chapter is active
 * - Sub-branches merge back (disappear) when completed
 * 
 * Usage:
 *   1. Include this script
 *   2. Use <branching-nav-viewport /> and structure with data-branch attributes
 *   3. Or auto-detect chapters and sub-branches
 * 
 * @version 1.0.0
 */

(function(global) {
    'use strict';

    /**
     * Branching Navigator
     */
    class BranchingNav {
        constructor(options = {}) {
            this.options = {
                // Selectors
                viewportSelector: options.viewportSelector || 'branching-nav-viewport',
                chapterSelector: options.chapterSelector || '[data-chapter]',
                subBranchSelector: options.subBranchSelector || '[data-sub-branch]',
                
                // Styling
                navBarClass: options.navBarClass || 'branching-nav-bar',
                chapterButtonClass: options.chapterButtonClass || 'branching-chapter-button',
                subBranchColumnClass: options.subBranchColumnClass || 'branching-sub-column',
                subBranchButtonClass: options.subBranchButtonClass || 'branching-sub-button',
                
                sticky: options.sticky !== false,
                zIndex: options.zIndex || 100,
                
                // Behavior
                marginBottom: options.marginBottom || 50,
                updateThrottle: options.updateThrottle || 10,
                
                // Callbacks
                onChapterClick: options.onChapterClick || null,
                onSubBranchClick: options.onSubBranchClick || null,
                getChapterLabel: options.getChapterLabel || null,
                getSubBranchLabel: options.getSubBranchLabel || null,
                
                ...options
            };
            
            this.navBar = null;
            this.subBranchColumn = null;
            this.chapters = [];
            this.chapterButtons = [];
            this.activeChapter = null;
            this.activeSubBranches = [];
            this.chapterToButtonMap = new Map();
            this.subBranchToButtonMap = new Map();
            this.isUserScrollingNav = false;
            this.navBarHeight = 0;
            
            this.init();
        }
        
        /**
         * Initialize the plugin
         */
        init() {
            const viewport = document.querySelector(this.options.viewportSelector);
            if (!viewport) {
                console.warn('BranchingNav: No viewport found with selector:', this.options.viewportSelector);
                return;
            }
            
            // Find all chapters
            this.chapters = Array.from(viewport.querySelectorAll(this.options.chapterSelector));
            
            if (this.chapters.length === 0) {
                console.warn('BranchingNav: No chapters found with selector:', this.options.chapterSelector);
                return;
            }
            
            // Ensure chapters have IDs
            this.chapters.forEach((chapter, index) => {
                if (!chapter.id) {
                    chapter.id = `chapter-${index}`;
                }
            });
            
            // Create navigation structure
            this.createNavStructure(viewport);
            this.setupChapters();
            this.setupScrollListener();
        }
        
        /**
         * Create navigation structure (main nav bar + sub-branch column)
         */
        createNavStructure(viewport) {
            // Create main navigation bar
            this.navBar = document.createElement('div');
            this.navBar.className = this.options.navBarClass;
            
            // Create sub-branch column (initially hidden)
            this.subBranchColumn = document.createElement('div');
            this.subBranchColumn.className = this.options.subBranchColumnClass;
            this.subBranchColumn.style.display = 'none';
            
            // Inject styles
            this.injectStyles();
            
            // Insert nav bar BEFORE viewport, so it sits at the start of what the viewport contains
            viewport.parentNode.insertBefore(this.navBar, viewport);
            // Insert sub-branch column after viewport (fixed-position visual, DOM position less important)
            viewport.parentNode.insertBefore(this.subBranchColumn, viewport.nextSibling);
            
            // Initial nav bar height; real value can change with responsive layout,
            // so we recompute it on the fly where needed.
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
         * Setup chapter buttons
         */
        setupChapters() {
            this.chapters.forEach((chapter, index) => {
                const button = this.createChapterButton(chapter, index);
                this.navBar.appendChild(button);
                this.chapterButtons.push(button);
                this.chapterToButtonMap.set(chapter, button);
            });
            
            // Initialize button CSS variables
            this.chapterButtons.forEach(button => {
                button.style.setProperty('--fill-width', '0%');
                button.style.setProperty('--viewport-left', '0%');
                button.style.setProperty('--viewport-width', '0%');
            });
        }
        
        /**
         * Create a chapter button
         */
        createChapterButton(chapter, index) {
            const button = document.createElement('a');
            button.className = this.options.chapterButtonClass;
            button.href = '#' + chapter.id;
            
            const label = this.getChapterLabel(chapter, index);
            const span = document.createElement('span');
            span.textContent = label;
            button.appendChild(span);
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToChapter(chapter);
                // Smooth scroll emits scroll events; updateNav() stays wired to scroll.
            });
            
            return button;
        }
        
        /**
         * Get chapter label
         */
        getChapterLabel(chapter, index) {
            if (this.options.getChapterLabel) {
                return this.options.getChapterLabel(chapter, index);
            }
            
            const title = chapter.querySelector('h1, h2, .title, [data-title]');
            if (title) {
                return title.textContent.trim();
            }
            
            if (chapter.dataset.title) {
                return chapter.dataset.title;
            }
            
            return chapter.id || `Chapter ${index + 1}`;
        }
        
        /**
         * Get sub-branches for a chapter
         */
        getSubBranches(chapter) {
            // Find sub-branches within this chapter
            return Array.from(chapter.querySelectorAll(this.options.subBranchSelector));
        }
        
        /**
         * Create sub-branch buttons
         */
        createSubBranchButtons(subBranches) {
            // Clear existing
            this.subBranchColumn.innerHTML = '';
            this.subBranchToButtonMap.clear();
            
            if (subBranches.length === 0) {
                this.subBranchColumn.style.display = 'none';
                return;
            }
            
            this.subBranchColumn.style.display = 'block';
            
            subBranches.forEach((subBranch, index) => {
                if (!subBranch.id) {
                    subBranch.id = `sub-branch-${index}`;
                }
                
                const button = document.createElement('a');
                button.className = this.options.subBranchButtonClass;
                button.href = '#' + subBranch.id;
                
                const label = this.getSubBranchLabel(subBranch, index);
                const span = document.createElement('span');
                span.textContent = label;
                button.appendChild(span);
                
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.scrollToSubBranch(subBranch);
                });
                
                this.subBranchColumn.appendChild(button);
                this.subBranchToButtonMap.set(subBranch, button);
            });
        }
        
        /**
         * Get sub-branch label
         */
        getSubBranchLabel(subBranch, index) {
            if (this.options.getSubBranchLabel) {
                return this.options.getSubBranchLabel(subBranch, index);
            }
            
            const title = subBranch.querySelector('h3, h4, .subtitle, [data-title]');
            if (title) {
                return title.textContent.trim();
            }
            
            if (subBranch.dataset.title) {
                return subBranch.dataset.title;
            }
            
            return subBranch.id || `Sub ${index + 1}`;
        }
        
        /**
         * Scroll to a chapter
         */
        scrollToChapter(chapter) {
            const rect = chapter.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const navBarHeight = this.getNavBarHeight();
            const targetTop = rect.top + scrollTop - navBarHeight;
            
            window.scrollTo({
                top: targetTop,
                behavior: 'smooth'
            });
            
            if (this.options.onChapterClick) {
                this.options.onChapterClick(chapter);
            }
        }
        
        /**
         * Scroll to a sub-branch
         */
        scrollToSubBranch(subBranch) {
            const rect = subBranch.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const navBarHeight = this.getNavBarHeight();
            const targetTop = rect.top + scrollTop - navBarHeight;
            
            window.scrollTo({
                top: targetTop,
                behavior: 'smooth'
            });
            
            if (this.options.onSubBranchClick) {
                this.options.onSubBranchClick(subBranch);
            }
        }
        
        /**
         * Calculate progress through a chapter (0 to 1)
         */
        getChapterProgress(chapter) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const navBarHeight = this.getNavBarHeight();
            const viewportHeight = Math.max(0, window.innerHeight - navBarHeight);
            const rect = chapter.getBoundingClientRect();
            const chapterTop = rect.top + scrollTop;
            const chapterHeight = chapter.offsetHeight;
            const chapterBottom = chapterTop + chapterHeight;
            
            const viewportTop = scrollTop + navBarHeight;
            const viewportBottom = viewportTop + viewportHeight;
            
            if (chapterBottom <= viewportTop) return 1;
            if (chapterTop >= viewportBottom) return 0;
            
            const scrolledIntoChapter = viewportTop - chapterTop;
            const progress = Math.max(0, Math.min(1, scrolledIntoChapter / chapterHeight));
            
            return progress;
        }

        /**
         * Calculate viewport indicator position and width for a chapter
         * Returns { left: %, width: % } or null if viewport not in chapter
         */
        getChapterViewportIndicator(chapter) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const navBarHeight = this.getNavBarHeight();
            const viewportHeight = Math.max(0, window.innerHeight - navBarHeight);
            const rect = chapter.getBoundingClientRect();
            const chapterTop = rect.top + scrollTop;
            const chapterHeight = chapter.offsetHeight;
            const chapterBottom = chapterTop + chapterHeight;
            
            const viewportTop = scrollTop + navBarHeight;
            const viewportBottom = viewportTop + viewportHeight;
            
            const viewportOverlapTop = Math.max(viewportTop, chapterTop);
            const viewportOverlapBottom = Math.min(viewportBottom, chapterBottom);
            
            if (viewportOverlapTop >= viewportOverlapBottom) return null;
            
            const viewportStartInChapter = viewportOverlapTop - chapterTop;
            const viewportSizeInChapter = viewportOverlapBottom - viewportOverlapTop;
            
            return {
                left: (viewportStartInChapter / chapterHeight) * 100,
                width: (viewportSizeInChapter / chapterHeight) * 100
            };
        }
        
        /**
         * Check if a sub-branch is completed (scrolled past)
         */
        isSubBranchCompleted(subBranch) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const rect = subBranch.getBoundingClientRect();
            const subBranchTop = rect.top + scrollTop;
            const subBranchBottom = subBranchTop + subBranch.offsetHeight;
            
            const navBarHeight = this.getNavBarHeight();
            const viewportTop = scrollTop + navBarHeight;
            
            // Sub-branch is completed if it's completely above viewport
            return subBranchBottom <= viewportTop;
        }

        /**
         * Check if a sub-branch is currently in viewport (overlapping)
         */
        isSubBranchInViewport(subBranch) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const navBarHeight = this.getNavBarHeight();
            const viewportHeight = Math.max(0, window.innerHeight - navBarHeight);
            const rect = subBranch.getBoundingClientRect();
            const subBranchTop = rect.top + scrollTop;
            const subBranchBottom = subBranchTop + subBranch.offsetHeight;

            const viewportTop = scrollTop + navBarHeight;
            const viewportBottom = viewportTop + viewportHeight;

            const overlapTop = Math.max(viewportTop, subBranchTop);
            const overlapBottom = Math.min(viewportBottom, subBranchBottom);

            return overlapBottom > overlapTop;
        }
        
        /**
         * Find active chapter
         */
        getActiveChapter() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const navBarHeight = this.getNavBarHeight();
            const viewportHeight = Math.max(0, window.innerHeight - navBarHeight);
            const viewportCenter = scrollTop + navBarHeight + (viewportHeight / 2);
            
            let activeChapter = null;
            let closestDistance = Infinity;
            
            this.chapters.forEach((chapter) => {
                const rect = chapter.getBoundingClientRect();
                const chapterTop = rect.top + scrollTop;
                const chapterBottom = chapterTop + chapter.offsetHeight;
                
                // Check if viewport center is within chapter
                if (viewportCenter >= chapterTop && viewportCenter <= chapterBottom) {
                    const distance = Math.abs(viewportCenter - (chapterTop + chapterBottom) / 2);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        activeChapter = chapter;
                    }
                }
            });
            
            // Fallback: find closest chapter
            if (!activeChapter) {
                this.chapters.forEach((chapter) => {
                    const rect = chapter.getBoundingClientRect();
                    const chapterTop = rect.top + scrollTop;
                    const chapterCenter = chapterTop + (chapter.offsetHeight / 2);
                    const distance = Math.abs(viewportCenter - chapterCenter);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        activeChapter = chapter;
                    }
                });
            }
            
            return activeChapter;
        }
        
        /**
         * Update navigation based on scroll position
         */
        updateNav() {
            if (this.isUserScrollingNav) return;
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const navBarHeight = this.getNavBarHeight();
            const compactThreshold = navBarHeight * 2;
            if (scrollTop > compactThreshold) {
                this.navBar.classList.add('compact');
            } else {
                this.navBar.classList.remove('compact');
            }
            
            // Find active chapter
            const activeChapter = this.getActiveChapter();
            
            // Update chapter button fills and viewport indicators
            this.chapters.forEach((chapter) => {
                const button = this.chapterToButtonMap.get(chapter);
                if (!button) return;
                
                const progress = this.getChapterProgress(chapter);
                button.style.setProperty('--fill-width', (progress * 100) + '%');

                const viewportIndicator = this.getChapterViewportIndicator(chapter);
                if (viewportIndicator) {
                    button.style.setProperty('--viewport-left', viewportIndicator.left + '%');
                    button.style.setProperty('--viewport-width', viewportIndicator.width + '%');
                    button.classList.add('in-viewport');
                } else {
                    button.style.setProperty('--viewport-left', '0%');
                    button.style.setProperty('--viewport-width', '0%');
                    button.classList.remove('in-viewport');
                }
                
                // Highlight active chapter
                if (chapter === activeChapter) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
            
            // Handle sub-branches: show for active chapter, hide when switching chapters
            if (activeChapter !== this.activeChapter) {
                // Chapter changed - update sub-branches
                this.activeChapter = activeChapter;
                
                if (activeChapter) {
                    const subBranches = this.getSubBranches(activeChapter);
                    this.createSubBranchButtons(subBranches);
                    this.activeSubBranches = subBranches;
                } else {
                    // No active chapter - hide sub-branches
                    this.subBranchColumn.style.display = 'none';
                    this.activeSubBranches = [];
                }
            }
            
            // Update sub-branch buttons: mark completed ones
            if (this.activeChapter) {
                this.activeSubBranches.forEach((subBranch) => {
                    const button = this.subBranchToButtonMap.get(subBranch);
                    if (!button) return;
                    
                    const completed = this.isSubBranchCompleted(subBranch);
                    const inViewport = this.isSubBranchInViewport(subBranch);

                    if (completed) {
                        button.classList.add('completed');
                    } else {
                        button.classList.remove('completed');
                    }

                    if (inViewport) {
                        button.classList.add('in-viewport');
                    } else {
                        button.classList.remove('in-viewport');
                    }
                });
                
                // Check if all sub-branches are completed - "merge" them back (hide column)
                const allCompleted = this.activeSubBranches.every(sb => this.isSubBranchCompleted(sb));
                if (allCompleted && this.activeSubBranches.length > 0) {
                    // All sub-branches merged - hide column when moving to next chapter
                    const chapterProgress = this.getChapterProgress(this.activeChapter);
                    if (chapterProgress >= 0.95) {
                        // Almost done with chapter - prepare to hide sub-branches
                        // (They'll disappear when we move to next chapter)
                    }
                }
            }
            
            // Scroll horizontal nav bar to keep active chapter visible
            if (activeChapter) {
                const activeButton = this.chapterToButtonMap.get(activeChapter);
                if (activeButton) {
                    const buttonLeft = activeButton.offsetLeft;
                    const buttonWidth = activeButton.offsetWidth;
                    const navWidth = this.navBar.clientWidth;
                    const navScrollWidth = this.navBar.scrollWidth - this.navBar.clientWidth;
                    
                    const targetScroll = buttonLeft + (buttonWidth / 2) - (navWidth / 2);
                    
                    this.navBar.scrollTo({
                        left: Math.max(0, Math.min(navScrollWidth, targetScroll)),
                        behavior: 'auto'
                    });
                }
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
                    this.updateNav();
                }, this.options.updateThrottle);
            }, { passive: true });
            
            // Initial update
            this.updateNav();
        }
        
        /**
         * Inject CSS styles
         */
        injectStyles() {
            const styleId = 'branching-nav-styles';
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

                .${this.options.navBarClass}.compact {
                    padding-top: 4px;
                    padding-bottom: 4px;
                    border-width: 2px;
                }

                .${this.options.navBarClass}.compact .${this.options.chapterButtonClass} {
                    padding-top: 4px;
                    padding-bottom: 4px;
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
                
                .${this.options.chapterButtonClass} {
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
                
                .${this.options.chapterButtonClass}::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: var(--fill-width, 0%);
                    height: 100%;
                    background: linear-gradient(135deg, rgba(255, 68, 68, 0.6), rgba(255, 215, 0, 0.5));
                    z-index: 0;
                }

                .${this.options.chapterButtonClass}::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: var(--viewport-left, 0%);
                    width: var(--viewport-width, 0%);
                    height: 100%;
                    background: linear-gradient(135deg, rgba(79, 195, 247, 0.6), rgba(147, 112, 219, 0.5));
                    /* No transition: keep viewport indicator perfectly in sync with scroll */
                    z-index: 1;
                    pointer-events: none;
                }
                
                .${this.options.chapterButtonClass} span {
                    position: relative;
                    z-index: 2;
                }
                
                .${this.options.chapterButtonClass}:hover {
                    border-color: #ffd700;
                    color: #ffd700;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
                }
                
                .${this.options.chapterButtonClass}.active {
                    border-color: #ffd700;
                    color: #ffd700;
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                }

                .${this.options.chapterButtonClass}.in-viewport {
                    border-color: #ffd700;
                    color: #ffd700;
                    box-shadow: 0 0 16px rgba(255, 215, 0, 0.45);
                }
                
                .${this.options.subBranchColumnClass} {
                    position: fixed;
                    right: 20px;
                    top: ${this.options.sticky ? '120px' : '20px'};
                    width: 260px;
                    max-height: calc(100vh - ${this.options.sticky ? '140px' : '40px'});
                    overflow-y: auto;
                    background: linear-gradient(135deg, rgba(72, 61, 139, 0.4), rgba(139, 0, 0, 0.3));
                    border: 2px solid rgba(212, 175, 55, 0.6);
                    border-radius: 12px;
                    padding: 15px;
                    z-index: ${this.options.zIndex - 1};
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }
                
                .${this.options.subBranchButtonClass} {
                    display: block;
                    padding: 10px 15px;
                    margin: 5px 0;
                    background: linear-gradient(135deg, rgba(72, 61, 139, 0.3), rgba(139, 0, 0, 0.2));
                    border: 2px solid rgba(212, 175, 55, 0.4);
                    border-radius: 6px;
                    color: #d4c5a9;
                    text-decoration: none;
                    font-size: 0.9em;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                
                .${this.options.subBranchButtonClass}:hover {
                    border-color: #4fc3f7;
                    color: #4fc3f7;
                    transform: translateX(-5px);
                }
                
                .${this.options.subBranchButtonClass}.completed {
                    opacity: 0.5;
                    border-color: rgba(212, 175, 55, 0.2);
                }

                .${this.options.subBranchButtonClass}.in-viewport {
                    border-color: #4fc3f7;
                    color: #4fc3f7;
                    box-shadow: 0 0 12px rgba(79, 195, 247, 0.5);
                }

                /* Responsive behavior */
                @media (max-width: 900px) {
                    .${this.options.navBarClass} {
                        padding: 10px;
                        margin: 20px 0;
                    }

                    .${this.options.chapterButtonClass} {
                        padding: 10px 16px;
                        font-size: 0.9em;
                        margin: 0 4px;
                    }

                    .${this.options.subBranchColumnClass} {
                        right: 10px;
                        width: 220px;
                    }
                }

                @media (max-width: 700px) {
                    .${this.options.subBranchColumnClass} {
                        position: fixed;
                        right: 0;
                        left: 0;
                        width: auto;
                        top: auto;
                        bottom: 0;
                        max-height: 40vh;
                        border-radius: 12px 12px 0 0;
                        border-width: 2px 0 0 0;
                    }

                    .${this.options.subBranchButtonClass} {
                        font-size: 0.85em;
                    }
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
            
            if (this.subBranchColumn && this.subBranchColumn.parentNode) {
                this.subBranchColumn.parentNode.removeChild(this.subBranchColumn);
            }
            
            const style = document.getElementById('branching-nav-styles');
            if (style) {
                style.parentNode.removeChild(style);
            }
        }
    }
    
    // Export for use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BranchingNav;
    } else {
        global.BranchingNav = BranchingNav;
        
        // Auto-initialize if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    if (document.querySelector('branching-nav-viewport')) {
                        new BranchingNav();
                    }
                }, 200);
            });
        } else {
            if (document.querySelector('branching-nav-viewport')) {
                new BranchingNav();
            }
        }
    }
    
})(typeof window !== 'undefined' ? window : this);

