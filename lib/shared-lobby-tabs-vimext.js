/* ============================================
   SHARED LOBBY FLUID TABS SYSTEM - VIM EXTENSION
   Vim-like keyboard navigation for Rally Lobby interfaces
   Based on Vimium-style interaction patterns
   ============================================ */

(function() {
    'use strict';

    // Wait for base system to load
    if (typeof window.LobbyTabs === 'undefined') {
        console.error('VimExt: Base LobbyTabs system not loaded. Please include shared-lobby-tabs.js first.');
        return;
    }

    // Configuration
    const config = {
        linkHintChars: 'asdfgkl',  // Home row keys (j removed for jj escape)
        searchHighlightColor: '#ffeb3b',
        searchActiveColor: '#ff9800',
        commandDelay: 500,  // Delay for multi-key commands like 'gi'
        jjEscapeDelay: 150,  // Max time between two 'j' presses for escape (very tight - must be intentional)
        
        // File Navigator Configuration
        lobbyManifest: [
            // Auto-populated from directory or manually configured
            // Format: { file: 'filename.html', title: 'Display Title', category: 'Category' }
        ],
        autoDetectLobbies: true,  // Try to auto-detect lobby files
        navigatorAnimation: 'slide'  // 'slide', 'fade', or 'zoom'
    };

    // State management
    let vimState = {
        mode: 'normal',  // 'normal', 'link-hint', 'search', 'filter', 'file-navigator'
        searchTerm: '',
        searchResults: [],
        currentSearchIndex: 0,
        linkHints: [],
        linkHintInput: '',
        lastKeyTime: 0,
        lastKey: '',
        pendingCommand: '',
        jjEscapeFirstJ: 0,  // Timestamp of first 'j' press for jj escape
        
        // File Navigator State
        navigatorOpen: false,
        navigatorFiles: [],
        navigatorFilteredFiles: [],
        navigatorSelectedIndex: 0,
        navigatorSearchTerm: '',
        navigatorViewMode: 'categories',  // 'categories', 'category-items', 'search-results'
        navigatorCurrentCategory: null,
        navigatorCategories: {}
    };

    // DOM Elements for vim features
    let vimElements = {
        searchBox: null,
        filterBox: null,
        linkHintContainer: null,
        fileNavigator: null,
        navigatorButton: null
    };

    // ============================================
    //  INITIALIZATION
    // ============================================

    function init() {
        setupVimKeyboardShortcuts();
        createSearchUI();
        createFilterUI();
        createFileNavigator();
        initializeLobbyManifest();
        console.log('VimExt: Vim-style navigation enabled');
        console.log('VimExt: File navigator ready - Press Shift+O to open');
    }

    // ============================================
    //  VIM KEYBOARD SHORTCUTS
    // ============================================

    function setupVimKeyboardShortcuts() {
        document.addEventListener('keydown', handleVimKeydown, true);
        document.addEventListener('keypress', handleVimKeypress, true);
    }

    function handleVimKeydown(e) {
        // Check if we're in an input mode where we're actively typing
        const isInInputMode = (vimState.mode === 'search' || vimState.mode === 'filter') && 
                              (e.target.classList.contains('vim-search-input') || 
                               e.target.classList.contains('vim-filter-input'));

        // In input modes, only allow escape keys (Esc, jj)
        if (isInInputMode) {
            // Check for jj escape
            if (e.key === 'j') {
                const now = Date.now();
                if (vimState.jjEscapeFirstJ && now - vimState.jjEscapeFirstJ < config.jjEscapeDelay) {
                    e.preventDefault();
                    handleJJEscape();
                    vimState.jjEscapeFirstJ = 0;
                    return;
                } else {
                    vimState.jjEscapeFirstJ = now;
                }
            } else {
                vimState.jjEscapeFirstJ = 0;
            }

            // Only handle Escape and Enter in input modes
            if (e.key === 'Escape') {
                if (vimState.mode === 'search') {
                    handleSearchMode(e);
                } else if (vimState.mode === 'filter') {
                    handleFilterMode(e);
                }
                return;
            } else if (e.key === 'Enter') {
                if (vimState.mode === 'search') {
                    handleSearchMode(e);
                } else if (vimState.mode === 'filter') {
                    handleFilterMode(e);
                }
                return;
            }
            
            // Let all other keys pass through for typing
            return;
        }

        // Don't intercept if user is typing in a regular input field
        if (isTypingInInput(e) && vimState.mode === 'normal') {
            return;
        }

        // Check for 'jj' escape in all modes (except when typing in non-vim inputs)
        if (e.key === 'j' && !isTypingInInput(e)) {
            const now = Date.now();
            if (vimState.jjEscapeFirstJ && now - vimState.jjEscapeFirstJ < config.jjEscapeDelay) {
                // Second 'j' pressed quickly - trigger escape!
                e.preventDefault();
                handleJJEscape();
                vimState.jjEscapeFirstJ = 0;
                return;
            } else {
                // First 'j' press - record timestamp
                vimState.jjEscapeFirstJ = now;
                // Fall through to normal handling
            }
        } else {
            // Any other key resets jj tracking
            vimState.jjEscapeFirstJ = 0;
        }

        // Handle different modes
        switch(vimState.mode) {
            case 'normal':
                handleNormalMode(e);
                break;
            case 'link-hint':
                handleLinkHintMode(e);
                break;
            case 'search':
                handleSearchMode(e);
                break;
            case 'filter':
                handleFilterMode(e);
                break;
            case 'file-navigator':
                handleFileNavigatorMode(e);
                break;
        }
    }

    function handleVimKeypress(e) {
        // Check for '/' key to enter search mode
        if (e.key === '/' && vimState.mode === 'normal' && !isTypingInInput(e)) {
            e.preventDefault();
            enterSearchMode();
        }
    }

    function isTypingInInput(e) {
        const tag = e.target.tagName;
        const isInput = tag === 'INPUT' || tag === 'TEXTAREA';
        const isSearchBox = e.target.classList.contains('vim-search-input') || 
                           e.target.classList.contains('vim-filter-input');
        
        // Allow typing in our search/filter boxes
        if (isSearchBox) return false;
        
        return isInput;
    }

    function handleJJEscape() {
        // Universal escape handler for 'jj' sequence
        switch(vimState.mode) {
            case 'search':
                exitSearchMode();
                break;
            case 'filter':
                exitFilterMode();
                break;
            case 'link-hint':
                exitLinkHintMode();
                break;
            case 'file-navigator':
                closeFileNavigator();
                break;
            case 'normal':
                // In normal mode, clear any search highlights
                clearSearchHighlights();
                break;
        }
    }

    // ============================================
    //  NORMAL MODE NAVIGATION
    // ============================================

    function handleNormalMode(e) {
        const now = Date.now();
        
        // Check for multi-key commands
        if (vimState.lastKey === 'g' && e.key === 'i' && now - vimState.lastKeyTime < config.commandDelay) {
            e.preventDefault();
            enterFilterMode();
            vimState.lastKey = '';
            return;
        }

        // Track 'g' key for multi-key commands
        if (e.key === 'g') {
            vimState.lastKey = 'g';
            vimState.lastKeyTime = now;
            return;
        }

        // Reset multi-key tracking
        vimState.lastKey = e.key;
        vimState.lastKeyTime = now;

        // Single key commands
        switch(e.key) {
            case 'h':  // Left
                e.preventDefault();
                if (window.LobbyTabs.getCurrentTab() > 0) {
                    window.LobbyTabs.switchToTab(window.LobbyTabs.getCurrentTab() - 1);
                }
                break;
            
            case 'l':  // Right
                e.preventDefault();
                if (window.LobbyTabs.getCurrentTab() < window.LobbyTabs.getTotalTabs() - 1) {
                    window.LobbyTabs.switchToTab(window.LobbyTabs.getCurrentTab() + 1);
                }
                break;
            
            case 'j':  // Down
                e.preventDefault();
                window.LobbyTabs.scrollToNextSection();
                break;
            
            case 'k':  // Up
                e.preventDefault();
                window.LobbyTabs.scrollToPreviousSection();
                break;
            
            case 'f':  // Link hint mode
                e.preventDefault();
                enterLinkHintMode();
                break;
            
            case 'O':  // File navigator (Shift+O)
                e.preventDefault();
                toggleFileNavigator();
                break;
            
            case 'n':  // Next search result
                if (vimState.searchResults.length > 0) {
                    e.preventDefault();
                    jumpToNextSearchResult();
                }
                break;
            
            case 'N':  // Previous search result (Shift+n)
                if (vimState.searchResults.length > 0) {
                    e.preventDefault();
                    jumpToPreviousSearchResult();
                }
                break;
            
            case 'Escape':
                clearSearchHighlights();
                break;
        }
    }

    // ============================================
    //  SEARCH MODE (/)
    // ============================================

    function enterSearchMode() {
        vimState.mode = 'search';
        vimState.searchTerm = '';
        
        vimElements.searchBox.style.display = 'flex';
        vimElements.searchBox.querySelector('.vim-search-input').value = '';
        vimElements.searchBox.querySelector('.vim-search-input').focus();
    }

    function handleSearchMode(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            exitSearchMode();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
            exitSearchMode();
        }
    }

    function performSearch() {
        const searchTerm = vimElements.searchBox.querySelector('.vim-search-input').value.trim();
        if (!searchTerm) return;

        vimState.searchTerm = searchTerm;
        vimState.searchResults = [];
        vimState.currentSearchIndex = 0;

        // Clear previous highlights
        clearSearchHighlights();

        // Get active content panel
        const activePanel = document.querySelectorAll('.content-panel')[window.LobbyTabs.getCurrentTab()];
        if (!activePanel) return;

        // Search through all text nodes
        highlightTextInElement(activePanel, searchTerm);

        // Show result count
        if (vimState.searchResults.length > 0) {
            showSearchStatus(`Found ${vimState.searchResults.length} matches`);
            jumpToSearchResult(0);
        } else {
            showSearchStatus('No matches found');
        }
    }

    function highlightTextInElement(element, searchTerm) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script and style elements
                    if (node.parentElement.tagName === 'SCRIPT' || 
                        node.parentElement.tagName === 'STYLE') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodesToProcess = [];
        let node;
        while (node = walker.nextNode()) {
            nodesToProcess.push(node);
        }

        nodesToProcess.forEach(textNode => {
            const text = textNode.textContent;
            const regex = new RegExp(escapeRegex(searchTerm), 'gi');
            let match;
            const matches = [];

            while (match = regex.exec(text)) {
                matches.push(match);
            }

            if (matches.length > 0) {
                const parent = textNode.parentElement;
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;

                matches.forEach(match => {
                    // Add text before match
                    if (match.index > lastIndex) {
                        fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
                    }

                    // Add highlighted match
                    const mark = document.createElement('mark');
                    mark.className = 'vim-search-highlight';
                    mark.textContent = match[0];
                    fragment.appendChild(mark);
                    vimState.searchResults.push(mark);

                    lastIndex = match.index + match[0].length;
                });

                // Add remaining text
                if (lastIndex < text.length) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
                }

                parent.replaceChild(fragment, textNode);
            }
        });
    }

    function clearSearchHighlights() {
        document.querySelectorAll('.vim-search-highlight').forEach(mark => {
            const text = mark.textContent;
            mark.replaceWith(text);
        });
        vimState.searchResults = [];
        vimState.currentSearchIndex = 0;
        hideSearchStatus();
    }

    function jumpToNextSearchResult() {
        if (vimState.searchResults.length === 0) return;
        vimState.currentSearchIndex = (vimState.currentSearchIndex + 1) % vimState.searchResults.length;
        jumpToSearchResult(vimState.currentSearchIndex);
    }

    function jumpToPreviousSearchResult() {
        if (vimState.searchResults.length === 0) return;
        vimState.currentSearchIndex = (vimState.currentSearchIndex - 1 + vimState.searchResults.length) % vimState.searchResults.length;
        jumpToSearchResult(vimState.currentSearchIndex);
    }

    function jumpToSearchResult(index) {
        // Remove active class from all results
        vimState.searchResults.forEach(mark => {
            mark.classList.remove('vim-search-active');
        });

        // Add active class to current result
        const currentResult = vimState.searchResults[index];
        currentResult.classList.add('vim-search-active');

        // Scroll to result
        currentResult.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        showSearchStatus(`Match ${index + 1} of ${vimState.searchResults.length}`);
    }

    function exitSearchMode() {
        vimState.mode = 'normal';
        vimElements.searchBox.style.display = 'none';
    }

    function showSearchStatus(message) {
        const status = document.querySelector('.vim-search-status');
        if (status) {
            status.textContent = message;
            status.style.display = 'block';
        }
    }

    function hideSearchStatus() {
        const status = document.querySelector('.vim-search-status');
        if (status) {
            status.style.display = 'none';
        }
    }

    // ============================================
    //  FILTER MODE (gi)
    // ============================================

    function enterFilterMode() {
        vimState.mode = 'filter';
        
        vimElements.filterBox.style.display = 'flex';
        vimElements.filterBox.querySelector('.vim-filter-input').value = '';
        vimElements.filterBox.querySelector('.vim-filter-input').focus();
    }

    function handleFilterMode(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            exitFilterMode();
        } else if (e.key === 'Enter') {
            // Keep filter active, just defocus
            e.preventDefault();
            document.activeElement.blur();
            vimState.mode = 'normal';
        }

        // Real-time filtering on input
        if (!['Escape', 'Enter'].includes(e.key)) {
            setTimeout(() => performFilter(), 10);
        }
    }

    function performFilter() {
        const filterTerm = vimElements.filterBox.querySelector('.vim-filter-input').value.trim().toLowerCase();
        const activePanel = document.querySelectorAll('.content-panel')[window.LobbyTabs.getCurrentTab()];
        
        if (!activePanel) return;

        // Get all filterable elements (sections, paragraphs, list items, etc.)
        const elements = activePanel.querySelectorAll('section, .section, p, li, h1, h2, h3, h4, .content-block');
        
        let visibleCount = 0;
        
        elements.forEach(el => {
            if (!filterTerm) {
                el.style.display = '';
                visibleCount++;
            } else {
                const text = el.textContent.toLowerCase();
                if (text.includes(filterTerm)) {
                    el.style.display = '';
                    visibleCount++;
                } else {
                    el.style.display = 'none';
                }
            }
        });

        showFilterStatus(filterTerm ? `Showing ${visibleCount} of ${elements.length} elements` : '');
    }

    function exitFilterMode() {
        vimState.mode = 'normal';
        vimElements.filterBox.style.display = 'none';
        
        // Clear filter
        const activePanel = document.querySelectorAll('.content-panel')[window.LobbyTabs.getCurrentTab()];
        if (activePanel) {
            activePanel.querySelectorAll('[style*="display: none"]').forEach(el => {
                el.style.display = '';
            });
        }
        
        hideFilterStatus();
    }

    function showFilterStatus(message) {
        const status = document.querySelector('.vim-filter-status');
        if (status) {
            status.textContent = message;
        }
    }

    function hideFilterStatus() {
        showFilterStatus('');
    }

    // ============================================
    //  FILE NAVIGATOR MODE (Shift+O)
    // ============================================

    function initializeLobbyManifest() {
        // Try to auto-detect lobby files from known patterns
        const knownLobbies = [
            { file: 'index.html', title: '🏠 Context Lobbies Hub', category: 'Main', icon: '🏠', desc: 'Central hub' },
            { file: 'universal-lobby-experience.html', title: '🌌 Universal Lobby Experience', category: 'Meta', icon: '🌌', desc: 'Meta experience' },
            
            // Individual Context Lobbies
            { file: 'european-collapse-escape-lobby.html', title: '🏛️ European Collapse Escape', category: 'Escape', icon: '🏛️', desc: 'European collapse' },
            { file: 'failing-state-tower-rally-lobby.html', title: '🏗️ Failing State Tower Rally', category: 'Rally', icon: '🏗️', desc: 'State failure rally' },
            { file: 'fragmentation-survivor-escape-lobby.html', title: '💔 Fragmentation Survivor Escape', category: 'Escape', icon: '💔', desc: 'Fragmentation survival' },
            { file: 'genocide-escape-rally-lobby.html', title: '⚔️ Genocide Escape Rally', category: 'Escape', icon: '⚔️', desc: 'Genocide escape' },
            { file: 'parent-child-spring-explorer-lobby.html', title: '🌸 Parent-Child Spring Explorer', category: 'Explorer', icon: '🌸', desc: 'Parent-child bonding' },
            { file: 'hypergamous-luxury-lobby.html', title: '💎 Hypergamous Luxury', category: 'Luxury', icon: '💎', desc: 'Luxury experience' },
            { file: 'warrior-valhalla-lobby.html', title: '⚔️ Warrior Valhalla', category: 'Warrior', icon: '⚔️', desc: 'Warrior spirit' },
            { file: 'intellectual-woman-meaning-lobby.html', title: '📚 Intellectual Woman Meaning', category: 'Meaning', icon: '📚', desc: 'Intellectual pursuit' },
            { file: 'trauma-survivor-healing-lobby.html', title: '🌿 Trauma Survivor Healing', category: 'Healing', icon: '🌿', desc: 'Healing journey' },
            { file: 'bullied-teen-fluid-tabs-lobby.html', title: '🎭 Bullied Teen Fluid Tabs', category: 'Youth', icon: '🎭', desc: 'Teen resilience' },
            { file: 'somali-girl-escape-lobby.html', title: '🌍 Somali Girl Escape', category: 'Escape', icon: '🌍', desc: 'Somali escape' },
            { file: 'artist-soul-beauty-lobby.html', title: '🎨 Artist Soul Beauty', category: 'Beauty', icon: '🎨', desc: 'Artistic beauty' },
            { file: 'corporate-soul-death-lobby.html', title: '💼 Corporate Soul Death', category: 'Awareness', icon: '💼', desc: 'Corporate awareness' },
            { file: 'young-mother-safety-lobby.html', title: '👶 Young Mother Safety', category: 'Safety', icon: '👶', desc: 'Mother safety' },
            
            // Subdirectories
            { file: 'great-steppe-games/rts-strategist-command-seeker.html', title: '🎮 RTS Strategist Command Seeker', category: 'Games', icon: '🎮', desc: 'Strategy game' },
            
            // Demo
            { file: 'vim-extension-demo.html', title: '⌨️ Vim Navigation Demo', category: 'Demo', icon: '⌨️', desc: 'Feature demo' }
        ];

        // Merge with user configuration if provided
        vimState.navigatorFiles = config.lobbyManifest.length > 0 ? config.lobbyManifest : knownLobbies;
        
        // Filter out current file
        const currentFile = window.location.pathname.split('/').pop();
        vimState.navigatorFiles = vimState.navigatorFiles.filter(lobby => lobby.file !== currentFile);
        
        // Build categories structure
        vimState.navigatorCategories = {};
        vimState.navigatorFiles.forEach(lobby => {
            if (!vimState.navigatorCategories[lobby.category]) {
                vimState.navigatorCategories[lobby.category] = [];
            }
            vimState.navigatorCategories[lobby.category].push(lobby);
        });
        
        vimState.navigatorFilteredFiles = [...vimState.navigatorFiles];
    }

    function toggleFileNavigator() {
        if (vimState.navigatorOpen) {
            closeFileNavigator();
        } else {
            openFileNavigator();
        }
    }

    function openFileNavigator() {
        vimState.mode = 'file-navigator';
        vimState.navigatorOpen = true;
        vimState.navigatorSelectedIndex = 0;
        vimState.navigatorSearchTerm = '';
        vimState.navigatorViewMode = 'categories';
        vimState.navigatorCurrentCategory = null;
        vimState.navigatorFilteredFiles = [...vimState.navigatorFiles];
        
        renderFileNavigator();
        
        // Add animation class
        setTimeout(() => {
            vimElements.fileNavigator.classList.add('active');
        }, 10);
    }

    function closeFileNavigator() {
        vimState.mode = 'normal';
        vimState.navigatorOpen = false;
        
        vimElements.fileNavigator.classList.remove('active');
        
        setTimeout(() => {
            vimElements.fileNavigator.querySelector('.navigator-content').innerHTML = '';
        }, 300);
    }

    function handleFileNavigatorMode(e) {
        // Handle based on current view mode
        if (vimState.navigatorViewMode === 'search-results') {
            handleSearchResultsMode(e);
        } else if (vimState.navigatorViewMode === 'category-items') {
            handleCategoryItemsMode(e);
        } else {
            // categories view
            handleCategoriesMode(e);
        }
    }

    function handleCategoriesMode(e) {
        const categoryKeys = Object.keys(vimState.navigatorCategories).sort();
        const gridColumns = 4;  // 4x4 grid
        const currentIndex = vimState.navigatorSelectedIndex;
        const currentRow = Math.floor(currentIndex / gridColumns);
        const currentCol = currentIndex % gridColumns;
        const totalRows = Math.ceil(categoryKeys.length / gridColumns);
        
        switch(e.key) {
            case 'Escape':
                e.preventDefault();
                closeFileNavigator();
                break;
            
            case '/':  // Explicit search trigger
                e.preventDefault();
                vimState.navigatorSearchTerm = '';
                vimState.navigatorViewMode = 'search-results';
                renderFileNavigator();
                break;
            
            case 'f':  // Link hints for modal items
                e.preventDefault();
                enterModalLinkHintMode();
                break;
            
            case 'h':  // Left - move left in grid
            case 'ArrowLeft':
                e.preventDefault();
                if (currentCol > 0) {
                    vimState.navigatorSelectedIndex = currentIndex - 1;
                    renderFileNavigator();
                    scrollSelectedIntoView();
                }
                break;
            
            case 'l':  // Right - move right in grid
            case 'ArrowRight':
                e.preventDefault();
                if (currentCol < gridColumns - 1 && currentIndex < categoryKeys.length - 1) {
                    vimState.navigatorSelectedIndex = currentIndex + 1;
                    renderFileNavigator();
                    scrollSelectedIntoView();
                }
                break;
            
            case 'j':  // Down - move down in grid
            case 'ArrowDown':
                e.preventDefault();
                const nextRowIndex = currentIndex + gridColumns;
                if (nextRowIndex < categoryKeys.length) {
                    vimState.navigatorSelectedIndex = nextRowIndex;
                } else if (currentRow < totalRows - 1) {
                    // Move to last item if next row exists but this column doesn't have an item
                    vimState.navigatorSelectedIndex = categoryKeys.length - 1;
                }
                renderFileNavigator();
                scrollSelectedIntoView();
                break;
            
            case 'k':  // Up - move up in grid
            case 'ArrowUp':
                e.preventDefault();
                const prevRowIndex = currentIndex - gridColumns;
                if (prevRowIndex >= 0) {
                    vimState.navigatorSelectedIndex = prevRowIndex;
                    renderFileNavigator();
                    scrollSelectedIntoView();
                }
                break;
            
            case 'g':  // Go to top (gg)
                if (vimState.lastKey === 'g') {
                    e.preventDefault();
                    vimState.navigatorSelectedIndex = 0;
                    renderFileNavigator();
                }
                break;
            
            case 'G':  // Go to bottom
                e.preventDefault();
                vimState.navigatorSelectedIndex = categoryKeys.length - 1;
                renderFileNavigator();
                break;
            
            case 'Enter':
                e.preventDefault();
                enterCategory(categoryKeys[vimState.navigatorSelectedIndex]);
                break;
            
            case '1': case '2': case '3': case '4': case '5':
            case '6': case '7': case '8': case '9':
                e.preventDefault();
                const index = parseInt(e.key) - 1;
                if (index < categoryKeys.length) {
                    enterCategory(categoryKeys[index]);
                }
                break;
            
            default:
                // Text input for searching
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    vimState.navigatorSearchTerm += e.key.toLowerCase();
                    vimState.navigatorViewMode = 'search-results';
                    filterNavigatorFiles();
                    renderFileNavigator();
                }
                break;
        }
    }

    function handleCategoryItemsMode(e) {
        const items = vimState.navigatorCategories[vimState.navigatorCurrentCategory] || [];
        
        switch(e.key) {
            case 'Escape':
            case 'Backspace':
                e.preventDefault();
                // Go back to categories
                vimState.navigatorViewMode = 'categories';
                vimState.navigatorCurrentCategory = null;
                vimState.navigatorSelectedIndex = 0;
                renderFileNavigator();
                break;
            
            case '/':  // Explicit search trigger
                e.preventDefault();
                vimState.navigatorSearchTerm = '';
                vimState.navigatorViewMode = 'search-results';
                renderFileNavigator();
                break;
            
            case 'f':  // Link hints for modal items
                e.preventDefault();
                enterModalLinkHintMode();
                break;
            
            case 'h':  // Left - go back to categories
                e.preventDefault();
                vimState.navigatorViewMode = 'categories';
                vimState.navigatorCurrentCategory = null;
                vimState.navigatorSelectedIndex = 0;
                renderFileNavigator();
                break;
            
            case 'l':  // Right - open selected (same as Enter)
                e.preventDefault();
                navigateToSelectedFile();
                break;
            
            case 'j':  // Down
            case 'ArrowDown':
                e.preventDefault();
                vimState.navigatorSelectedIndex = Math.min(
                    vimState.navigatorSelectedIndex + 1,
                    items.length - 1
                );
                renderFileNavigator();
                scrollSelectedIntoView();
                break;
            
            case 'k':  // Up
            case 'ArrowUp':
                e.preventDefault();
                vimState.navigatorSelectedIndex = Math.max(
                    vimState.navigatorSelectedIndex - 1,
                    0
                );
                renderFileNavigator();
                scrollSelectedIntoView();
                break;
            
            case 'g':  // Go to top (gg)
                if (vimState.lastKey === 'g') {
                    e.preventDefault();
                    vimState.navigatorSelectedIndex = 0;
                    renderFileNavigator();
                }
                break;
            
            case 'G':  // Go to bottom
                e.preventDefault();
                vimState.navigatorSelectedIndex = items.length - 1;
                renderFileNavigator();
                break;
            
            case 'Enter':
                e.preventDefault();
                navigateToSelectedFile();
                break;
            
            case '1': case '2': case '3': case '4': case '5':
            case '6': case '7': case '8': case '9':
                e.preventDefault();
                const index = parseInt(e.key) - 1;
                if (index < items.length) {
                    vimState.navigatorSelectedIndex = index;
                    navigateToSelectedFile();
                }
                break;
            
            default:
                // Text input for searching
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    vimState.navigatorSearchTerm += e.key.toLowerCase();
                    vimState.navigatorViewMode = 'search-results';
                    filterNavigatorFiles();
                    renderFileNavigator();
                }
                break;
        }
    }

    function handleSearchResultsMode(e) {
        switch(e.key) {
            case 'Escape':
                e.preventDefault();
                // Clear search and go back to categories
                vimState.navigatorSearchTerm = '';
                vimState.navigatorViewMode = 'categories';
                vimState.navigatorSelectedIndex = 0;
                renderFileNavigator();
                break;
            
            case 'Backspace':
                e.preventDefault();
                if (vimState.navigatorSearchTerm.length > 0) {
                    vimState.navigatorSearchTerm = vimState.navigatorSearchTerm.slice(0, -1);
                    if (vimState.navigatorSearchTerm.length === 0) {
                        // Back to categories
                        vimState.navigatorViewMode = 'categories';
                        vimState.navigatorSelectedIndex = 0;
                    } else {
                        filterNavigatorFiles();
                    }
                    renderFileNavigator();
                }
                break;
            
            case 'f':  // Link hints for modal items
                e.preventDefault();
                enterModalLinkHintMode();
                break;
            
            case 'h':  // Left - back to categories
                e.preventDefault();
                vimState.navigatorSearchTerm = '';
                vimState.navigatorViewMode = 'categories';
                vimState.navigatorSelectedIndex = 0;
                renderFileNavigator();
                break;
            
            case 'l':  // Right - open selected
                e.preventDefault();
                navigateToSelectedFile();
                break;
            
            case 'j':  // Down
            case 'ArrowDown':
                e.preventDefault();
                navigatorMoveSelection(1);
                break;
            
            case 'k':  // Up
            case 'ArrowUp':
                e.preventDefault();
                navigatorMoveSelection(-1);
                break;
            
            case 'g':  // Go to top (gg)
                if (vimState.lastKey === 'g') {
                    e.preventDefault();
                    vimState.navigatorSelectedIndex = 0;
                    renderFileNavigator();
                }
                break;
            
            case 'G':  // Go to bottom
                e.preventDefault();
                vimState.navigatorSelectedIndex = vimState.navigatorFilteredFiles.length - 1;
                renderFileNavigator();
                break;
            
            case 'Enter':
                e.preventDefault();
                navigateToSelectedFile();
                break;
            
            case '1': case '2': case '3': case '4': case '5':
            case '6': case '7': case '8': case '9':
                e.preventDefault();
                const index = parseInt(e.key) - 1;
                if (index < vimState.navigatorFilteredFiles.length) {
                    vimState.navigatorSelectedIndex = index;
                    navigateToSelectedFile();
                }
                break;
            
            default:
                // Continue typing to refine search
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    vimState.navigatorSearchTerm += e.key.toLowerCase();
                    filterNavigatorFiles();
                    renderFileNavigator();
                }
                break;
        }
    }

    function enterCategory(category) {
        vimState.navigatorViewMode = 'category-items';
        vimState.navigatorCurrentCategory = category;
        vimState.navigatorSelectedIndex = 0;
        renderFileNavigator();
    }

    function scrollSelectedIntoView() {
        setTimeout(() => {
            const selected = vimElements.fileNavigator.querySelector('.navigator-item.selected, .category-card.selected');
            if (selected) {
                selected.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 10);
    }

    function enterModalLinkHintMode() {
        // Reuse existing link hint system but scope to modal
        vimState.linkHintInput = '';
        vimState.linkHints = [];

        // Get modal panel (instead of active content panel)
        const modalPanel = vimElements.fileNavigator.querySelector('.navigator-panel');
        if (!modalPanel) return;

        // Find all clickable elements in the modal
        const clickableElements = modalPanel.querySelectorAll(
            '.category-card, .navigator-item'
        );

        if (clickableElements.length === 0) return;

        // Create hint container
        const hintContainer = document.createElement('div');
        hintContainer.className = 'vim-link-hint-container';
        document.body.appendChild(hintContainer);
        vimElements.linkHintContainer = hintContainer;

        // Generate hints for each clickable element
        const hints = generateHintLabels(clickableElements.length);
        
        clickableElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            
            // Skip elements not visible
            if (rect.width === 0 || rect.height === 0) return;

            const hint = document.createElement('div');
            hint.className = 'vim-link-hint';
            hint.textContent = hints[index];
            hint.style.left = rect.left + window.scrollX + 'px';
            hint.style.top = rect.top + window.scrollY + 'px';
            
            hintContainer.appendChild(hint);
            
            vimState.linkHints.push({
                label: hints[index],
                element: element,
                hintElement: hint
            });
        });

        // Temporarily switch to link-hint mode for the modal
        const previousMode = vimState.mode;
        vimState.mode = 'link-hint';

        // Set up one-time key handler for link hints in modal
        const modalLinkHintHandler = (e) => {
            if (e.key === 'Escape' || e.key === 'j' && vimState.jjEscapeFirstJ && Date.now() - vimState.jjEscapeFirstJ < config.jjEscapeDelay) {
                e.preventDefault();
                exitModalLinkHintMode(previousMode);
                document.removeEventListener('keydown', modalLinkHintHandler, true);
                return;
            }

            // Check if key is a valid hint character
            if (config.linkHintChars.includes(e.key.toLowerCase())) {
                e.preventDefault();
                vimState.linkHintInput += e.key.toLowerCase();

                // Filter hints
                const matchingHints = vimState.linkHints.filter(hint => 
                    hint.label.startsWith(vimState.linkHintInput)
                );

                if (matchingHints.length === 0) {
                    // No matches, exit
                    exitModalLinkHintMode(previousMode);
                    document.removeEventListener('keydown', modalLinkHintHandler, true);
                } else if (matchingHints.length === 1 && matchingHints[0].label === vimState.linkHintInput) {
                    // Exact match, activate element
                    const hint = matchingHints[0];
                    exitModalLinkHintMode(previousMode);
                    document.removeEventListener('keydown', modalLinkHintHandler, true);
                    
                    // Click the element
                    hint.element.click();
                } else {
                    // Multiple matches, update hints
                    updateLinkHints(matchingHints);
                }
            }
        };

        document.addEventListener('keydown', modalLinkHintHandler, true);
    }

    function exitModalLinkHintMode(previousMode) {
        vimState.mode = previousMode;
        vimState.linkHintInput = '';
        
        if (vimElements.linkHintContainer) {
            vimElements.linkHintContainer.remove();
            vimElements.linkHintContainer = null;
        }
        
        vimState.linkHints = [];
    }

    function filterNavigatorFiles() {
        const term = vimState.navigatorSearchTerm.toLowerCase();
        
        if (!term) {
            vimState.navigatorFilteredFiles = [...vimState.navigatorFiles];
            return;
        }

        // Fuzzy search - matches letters in order
        vimState.navigatorFilteredFiles = vimState.navigatorFiles.filter(lobby => {
            const searchText = (lobby.title + ' ' + lobby.category + ' ' + lobby.file).toLowerCase();
            
            // Simple fuzzy match
            let searchIndex = 0;
            for (let char of term) {
                searchIndex = searchText.indexOf(char, searchIndex);
                if (searchIndex === -1) return false;
                searchIndex++;
            }
            return true;
        });

        // Reset selection if out of bounds
        if (vimState.navigatorSelectedIndex >= vimState.navigatorFilteredFiles.length) {
            vimState.navigatorSelectedIndex = Math.max(0, vimState.navigatorFilteredFiles.length - 1);
        }
    }

    function navigatorMoveSelection(delta) {
        const newIndex = vimState.navigatorSelectedIndex + delta;
        
        if (newIndex >= 0 && newIndex < vimState.navigatorFilteredFiles.length) {
            vimState.navigatorSelectedIndex = newIndex;
            renderFileNavigator();
            
            // Scroll selected item into view
            const selectedItem = vimElements.fileNavigator.querySelector('.navigator-item.selected');
            if (selectedItem) {
                selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }

    function navigateToSelectedFile() {
        let selected;
        
        if (vimState.navigatorViewMode === 'category-items') {
            const items = vimState.navigatorCategories[vimState.navigatorCurrentCategory] || [];
            selected = items[vimState.navigatorSelectedIndex];
        } else {
            // search-results mode
            selected = vimState.navigatorFilteredFiles[vimState.navigatorSelectedIndex];
        }
        
        if (selected) {
            // Determine the correct path based on current location
            const currentPath = window.location.pathname;
            const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            
            // Navigate to the file
            window.location.href = currentDir + selected.file;
        }
    }

    function renderFileNavigator() {
        const content = vimElements.fileNavigator.querySelector('.navigator-content');
        
        if (vimState.navigatorViewMode === 'categories') {
            renderCategoriesView(content);
        } else if (vimState.navigatorViewMode === 'category-items') {
            renderCategoryItemsView(content);
        } else {
            renderSearchResultsView(content);
        }
    }

    function renderCategoriesView(content) {
        const categoryKeys = Object.keys(vimState.navigatorCategories).sort();
        
        let html = `
            <div class="navigator-header">
                <h2>🗂️ Select Category</h2>
                <div class="navigator-hint">
                    <kbd>hjkl</kbd> navigate • 
                    <kbd>Enter</kbd> drill in • 
                    <kbd>/</kbd> search • 
                    <kbd>f</kbd> link hints • 
                    <kbd>1-9</kbd> jump • 
                    <kbd>jj</kbd>/<kbd>Esc</kbd> close
                </div>
            </div>
            <div class="navigator-grid">
        `;

        if (categoryKeys.length === 0) {
            html += '<div class="navigator-empty">No categories available.</div>';
        } else {
            categoryKeys.forEach((category, index) => {
                const items = vimState.navigatorCategories[category];
                const isSelected = index === vimState.navigatorSelectedIndex;
                const icon = items[0]?.icon || '📁';
                const number = index < 9 ? `<span class="category-number">${index + 1}</span>` : '';
                
                html += `
                    <div class="category-card ${isSelected ? 'selected' : ''}" data-index="${index}">
                        ${number}
                        <div class="category-icon">${icon}</div>
                        <div class="category-name">${category}</div>
                        <div class="category-count">${items.length} ${items.length === 1 ? 'lobby' : 'lobbies'}</div>
                        ${isSelected ? '<div class="category-indicator">→</div>' : ''}
                    </div>
                `;
            });
        }

        html += '</div>';
        
        html += `
            <div class="navigator-footer">
                ${categoryKeys.length} categories • ${vimState.navigatorFiles.length} total lobbies
            </div>
        `;

        content.innerHTML = html;

        // Add click handlers
        content.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.index);
                const category = categoryKeys[index];
                enterCategory(category);
            });
        });
    }

    function renderCategoryItemsView(content) {
        const items = vimState.navigatorCategories[vimState.navigatorCurrentCategory] || [];
        const categoryIcon = items[0]?.icon || '📁';
        
        let html = `
            <div class="navigator-header">
                <h2>${categoryIcon} ${vimState.navigatorCurrentCategory}</h2>
                <div class="navigator-hint">
                    <kbd>h</kbd> back • 
                    <kbd>jkl</kbd> navigate • 
                    <kbd>Enter</kbd> open • 
                    <kbd>/</kbd> search • 
                    <kbd>f</kbd> hints • 
                    <kbd>1-9</kbd> jump • 
                    <kbd>jj</kbd>/<kbd>Esc</kbd> exit
                </div>
            </div>
            <div class="navigator-list">
        `;

        if (items.length === 0) {
            html += '<div class="navigator-empty">No lobbies in this category.</div>';
        } else {
            items.forEach((lobby, index) => {
                const isSelected = index === vimState.navigatorSelectedIndex;
                const number = index < 9 ? `<span class="item-number">${index + 1}</span>` : '';
                
                html += `
                    <div class="navigator-item ${isSelected ? 'selected' : ''}" data-index="${index}">
                        ${number}
                        <span class="item-icon">${lobby.icon}</span>
                        <div class="item-content">
                            <span class="item-title">${lobby.title.substring(lobby.title.indexOf(' ') + 1)}</span>
                            <span class="item-desc">${lobby.desc || ''}</span>
                        </div>
                        ${isSelected ? '<span class="item-indicator">→</span>' : ''}
                    </div>
                `;
            });
        }

        html += '</div>';
        
        html += `
            <div class="navigator-footer">
                ${items.length} ${items.length === 1 ? 'lobby' : 'lobbies'} in ${vimState.navigatorCurrentCategory}
            </div>
        `;

        content.innerHTML = html;

        // Add click handlers
        content.querySelectorAll('.navigator-item').forEach(item => {
            item.addEventListener('click', () => {
                vimState.navigatorSelectedIndex = parseInt(item.dataset.index);
                navigateToSelectedFile();
            });
        });
    }

    function renderSearchResultsView(content) {
        let html = `
            <div class="navigator-header">
                <h2>🔍 Search Results</h2>
                <div class="navigator-search">
                    <span class="search-prompt">${vimState.navigatorSearchTerm}</span>
                    <span class="search-cursor blink">|</span>
                </div>
                <div class="navigator-hint">
                    <kbd>h</kbd> back • 
                    <kbd>jkl</kbd> navigate • 
                    <kbd>Enter</kbd> open • 
                    <kbd>f</kbd> hints • 
                    <kbd>Backspace</kbd> edit • 
                    <kbd>1-9</kbd> jump • 
                    <kbd>jj</kbd>/<kbd>Esc</kbd> clear
                </div>
            </div>
            <div class="navigator-list">
        `;

        if (vimState.navigatorFilteredFiles.length === 0) {
            html += '<div class="navigator-empty">No lobbies found matching your search.</div>';
        } else {
            vimState.navigatorFilteredFiles.forEach((lobby, index) => {
                const isSelected = index === vimState.navigatorSelectedIndex;
                const number = index < 9 ? `<span class="item-number">${index + 1}</span>` : '';
                
                html += `
                    <div class="navigator-item ${isSelected ? 'selected' : ''}" data-index="${index}">
                        ${number}
                        <span class="item-icon">${lobby.icon}</span>
                        <div class="item-content">
                            <span class="item-title">${lobby.title.substring(lobby.title.indexOf(' ') + 1)}</span>
                            <span class="item-category">${lobby.category}</span>
                        </div>
                        ${isSelected ? '<span class="item-indicator">→</span>' : ''}
                    </div>
                `;
            });
        }

        html += '</div>';
        
        html += `
            <div class="navigator-footer">
                ${vimState.navigatorFilteredFiles.length} ${vimState.navigatorFilteredFiles.length === 1 ? 'match' : 'matches'} for "${vimState.navigatorSearchTerm}"
            </div>
        `;

        content.innerHTML = html;

        // Add click handlers
        content.querySelectorAll('.navigator-item').forEach(item => {
            item.addEventListener('click', () => {
                vimState.navigatorSelectedIndex = parseInt(item.dataset.index);
                navigateToSelectedFile();
            });
        });
    }

    function createFileNavigator() {
        // Create the navigator overlay
        const navigator = document.createElement('div');
        navigator.className = 'vim-file-navigator';
        navigator.innerHTML = `
            <div class="navigator-backdrop"></div>
            <div class="navigator-panel">
                <div class="navigator-content"></div>
            </div>
        `;
        document.body.appendChild(navigator);
        vimElements.fileNavigator = navigator;

        // Create the diagonal button
        const button = document.createElement('div');
        button.className = 'vim-navigator-button';
        button.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span class="button-hint">Press <kbd>Shift+O</kbd></span>
        `;
        document.body.appendChild(button);
        vimElements.navigatorButton = button;

        // Button click handler
        button.addEventListener('click', () => {
            toggleFileNavigator();
        });

        // Backdrop click to close
        navigator.querySelector('.navigator-backdrop').addEventListener('click', () => {
            if (vimState.navigatorOpen) {
                closeFileNavigator();
            }
        });
    }

    // ============================================
    //  LINK HINT MODE (f)
    // ============================================

    function enterLinkHintMode() {
        vimState.mode = 'link-hint';
        vimState.linkHintInput = '';
        vimState.linkHints = [];

        // Get active content panel
        const activePanel = document.querySelectorAll('.content-panel')[window.LobbyTabs.getCurrentTab()];
        if (!activePanel) return;

        // Find all clickable elements - comprehensive selector
        const clickableElements = activePanel.querySelectorAll(
            'a, button, ' +
            'input[type="button"], input[type="submit"], input[type="reset"], ' +
            'select, ' +
            '[onclick], [role="button"], [role="link"], [role="tab"], ' +
            '[tabindex]:not([tabindex="-1"]), ' +
            '.tab-button, .scroll-dot, .nav-arrow, ' +
            'summary, details, ' +
            '[class*="button"], [class*="btn"], [class*="link"], [class*="click"]'
        );

        if (clickableElements.length === 0) {
            vimState.mode = 'normal';
            return;
        }

        // Create hint container
        const hintContainer = document.createElement('div');
        hintContainer.className = 'vim-link-hint-container';
        document.body.appendChild(hintContainer);
        vimElements.linkHintContainer = hintContainer;

        // Generate hints for each clickable element
        const hints = generateHintLabels(clickableElements.length);
        
        clickableElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            
            // Skip elements not visible
            if (rect.width === 0 || rect.height === 0) return;

            const hint = document.createElement('div');
            hint.className = 'vim-link-hint';
            hint.textContent = hints[index];
            hint.style.left = rect.left + window.scrollX + 'px';
            hint.style.top = rect.top + window.scrollY + 'px';
            
            hintContainer.appendChild(hint);
            
            vimState.linkHints.push({
                label: hints[index],
                element: element,
                hintElement: hint
            });
        });
    }

    function handleLinkHintMode(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            exitLinkHintMode();
            return;
        }

        // Check if key is a valid hint character
        if (config.linkHintChars.includes(e.key.toLowerCase())) {
            e.preventDefault();
            vimState.linkHintInput += e.key.toLowerCase();

            // Filter hints
            const matchingHints = vimState.linkHints.filter(hint => 
                hint.label.startsWith(vimState.linkHintInput)
            );

            if (matchingHints.length === 0) {
                // No matches, reset
                exitLinkHintMode();
            } else if (matchingHints.length === 1 && matchingHints[0].label === vimState.linkHintInput) {
                // Exact match, activate link
                const hint = matchingHints[0];
                exitLinkHintMode();
                activateElement(hint.element);
            } else {
                // Multiple matches, update hints
                updateLinkHints(matchingHints);
            }
        }
    }

    function updateLinkHints(matchingHints) {
        vimState.linkHints.forEach(hint => {
            if (matchingHints.includes(hint)) {
                hint.hintElement.style.display = 'block';
                
                // Highlight matched portion
                const matched = vimState.linkHintInput;
                const remaining = hint.label.substring(matched.length);
                hint.hintElement.innerHTML = `<span class="vim-hint-matched">${matched}</span>${remaining}`;
            } else {
                hint.hintElement.style.display = 'none';
            }
        });
    }

    function exitLinkHintMode() {
        vimState.mode = 'normal';
        vimState.linkHintInput = '';
        
        if (vimElements.linkHintContainer) {
            vimElements.linkHintContainer.remove();
            vimElements.linkHintContainer = null;
        }
        
        vimState.linkHints = [];
    }

    function activateElement(element) {
        // Simulate click
        if (element.tagName === 'A') {
            element.click();
        } else if (element.tagName === 'BUTTON' || element.tagName === 'INPUT') {
            element.click();
        } else {
            // For other elements, dispatch click event
            element.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            }));
        }
    }

    function generateHintLabels(count) {
        const chars = config.linkHintChars.split('');
        const labels = [];
        
        // Generate labels using base-N system (where N = chars.length)
        for (let i = 0; i < count; i++) {
            let label = '';
            let num = i;
            
            do {
                label = chars[num % chars.length] + label;
                num = Math.floor(num / chars.length) - 1;
            } while (num >= 0);
            
            labels.push(label);
        }
        
        return labels;
    }

    // ============================================
    //  UI CREATION
    // ============================================

    function createSearchUI() {
        // Create search box
        const searchBox = document.createElement('div');
        searchBox.className = 'vim-search-box';
        searchBox.innerHTML = `
            <span class="vim-search-prompt">/</span>
            <input type="text" class="vim-search-input" placeholder="Search..." />
            <span class="vim-search-hint">Enter to search, jj or Esc to cancel</span>
        `;
        document.body.appendChild(searchBox);
        vimElements.searchBox = searchBox;

        // Create search status indicator
        const searchStatus = document.createElement('div');
        searchStatus.className = 'vim-search-status';
        document.body.appendChild(searchStatus);
    }

    function createFilterUI() {
        // Create filter box
        const filterBox = document.createElement('div');
        filterBox.className = 'vim-filter-box';
        filterBox.innerHTML = `
            <span class="vim-filter-prompt">Filter:</span>
            <input type="text" class="vim-filter-input" placeholder="Type to filter content..." />
            <span class="vim-filter-status"></span>
            <span class="vim-filter-hint">Enter to apply, jj or Esc to clear</span>
        `;
        document.body.appendChild(filterBox);
        vimElements.filterBox = filterBox;
    }

    // ============================================
    //  UTILITY FUNCTIONS
    // ============================================

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ============================================
    //  PUBLIC API
    // ============================================

    window.LobbyTabsVim = {
        enterSearchMode: enterSearchMode,
        enterFilterMode: enterFilterMode,
        enterLinkHintMode: enterLinkHintMode,
        toggleFileNavigator: toggleFileNavigator,
        openFileNavigator: openFileNavigator,
        closeFileNavigator: closeFileNavigator,
        getMode: () => vimState.mode,
        clearSearch: clearSearchHighlights,
        setLobbyManifest: (manifest) => {
            config.lobbyManifest = manifest;
            initializeLobbyManifest();
        }
    };

    // ============================================
    //  STYLES INJECTION
    // ============================================

    function injectStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* Search Box */
            .vim-search-box {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                display: none;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                font-family: monospace;
            }

            .vim-search-prompt {
                font-size: 18px;
                font-weight: bold;
                color: #4CAF50;
            }

            .vim-search-input {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 16px;
                outline: none;
                min-width: 300px;
            }

            .vim-search-input:focus {
                border-color: #4CAF50;
                background: rgba(255, 255, 255, 0.15);
            }

            .vim-search-hint {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
            }

            .vim-search-status {
                position: fixed;
                bottom: 70px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(76, 175, 80, 0.9);
                color: white;
                padding: 5px 15px;
                border-radius: 4px;
                display: none;
                z-index: 10000;
                font-family: monospace;
                font-size: 14px;
            }

            /* Search Highlights */
            .vim-search-highlight {
                background-color: ${config.searchHighlightColor};
                color: black;
                padding: 2px 0;
                border-radius: 2px;
            }

            .vim-search-highlight.vim-search-active {
                background-color: ${config.searchActiveColor};
                color: white;
                font-weight: bold;
            }

            /* Filter Box */
            .vim-filter-box {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(33, 150, 243, 0.95);
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                display: none;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                font-family: monospace;
            }

            .vim-filter-prompt {
                font-size: 16px;
                font-weight: bold;
            }

            .vim-filter-input {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.4);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 16px;
                outline: none;
                min-width: 300px;
            }

            .vim-filter-input:focus {
                border-color: white;
                background: rgba(255, 255, 255, 0.3);
            }

            .vim-filter-input::placeholder {
                color: rgba(255, 255, 255, 0.6);
            }

            .vim-filter-status {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.9);
                min-width: 100px;
            }

            .vim-filter-hint {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
            }

            /* Link Hints */
            .vim-link-hint-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
            }

            .vim-link-hint {
                position: absolute;
                background: rgba(255, 255, 0, 0.9);
                color: black;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
                font-size: 12px;
                font-weight: bold;
                border: 1px solid rgba(0, 0, 0, 0.5);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                pointer-events: none;
                z-index: 10000;
                text-transform: lowercase;
            }

            .vim-hint-matched {
                color: red;
            }

            /* Help overlay hint */
            .vim-help-hint {
                position: fixed;
                bottom: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 12px 15px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                z-index: 9999;
                max-width: 280px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .vim-help-hint kbd {
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
                font-size: 11px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            /* ============================================
               FILE NAVIGATOR - THE FUCKING AWESOME PART
               ============================================ */

            /* Diagonal Corner Button */
            .vim-navigator-button {
                position: fixed;
                top: 0;
                left: 0;
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, rgba(138, 43, 226, 0.95), rgba(75, 0, 130, 0.95));
                clip-path: polygon(0 0, 100% 0, 0 100%);
                cursor: pointer;
                z-index: 9998;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 2px 2px 10px rgba(138, 43, 226, 0.3);
            }

            .vim-navigator-button:hover {
                background: linear-gradient(135deg, rgba(147, 51, 234, 1), rgba(88, 28, 135, 1));
                box-shadow: 3px 3px 15px rgba(138, 43, 226, 0.5);
                width: 85px;
                height: 85px;
            }

            .vim-navigator-button svg {
                position: absolute;
                top: 12px;
                left: 12px;
                color: white;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
            }

            .vim-navigator-button .button-hint {
                position: absolute;
                top: 80px;
                left: 0;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 6px 12px;
                border-radius: 0 4px 4px 0;
                font-size: 11px;
                font-family: monospace;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s;
                white-space: nowrap;
                z-index: 10000;
            }

            .vim-navigator-button:hover .button-hint {
                opacity: 1;
            }

            .vim-navigator-button .button-hint kbd {
                background: rgba(138, 43, 226, 0.5);
                padding: 2px 4px;
                border-radius: 2px;
                font-size: 10px;
            }

            /* Navigator Overlay */
            .vim-file-navigator {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 10001;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .vim-file-navigator.active {
                opacity: 1;
                pointer-events: all;
            }

            /* Backdrop */
            .navigator-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
            }

            /* Navigator Panel */
            .navigator-panel {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                width: 90vw;
                height: 90vh;
                background: linear-gradient(135deg, 
                    rgba(20, 20, 40, 0.98) 0%,
                    rgba(30, 10, 50, 0.98) 100%);
                border-radius: 20px;
                border: 2px solid rgba(138, 43, 226, 0.4);
                box-shadow: 
                    0 20px 60px rgba(0, 0, 0, 0.6),
                    0 0 100px rgba(138, 43, 226, 0.3),
                    inset 0 1px 1px rgba(255, 255, 255, 0.1);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
            }

            .vim-file-navigator.active .navigator-panel {
                transform: translate(-50%, -50%) scale(1);
            }

            .navigator-content {
                display: flex;
                flex-direction: column;
                height: 100%;
                color: #f0f0f0;
            }

            /* Header */
            .navigator-header {
                padding: 25px 30px 20px;
                background: linear-gradient(180deg, 
                    rgba(138, 43, 226, 0.2) 0%,
                    transparent 100%);
                border-bottom: 1px solid rgba(138, 43, 226, 0.3);
                flex-shrink: 0;
            }

            .navigator-header h2 {
                margin: 0 0 12px 0;
                font-size: 26px;
                font-weight: 700;
                background: linear-gradient(135deg, #fff, #c084fc);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 0 0 30px rgba(138, 43, 226, 0.5);
            }

            .navigator-search {
                margin: 15px 0;
                padding: 12px 16px;
                background: rgba(0, 0, 0, 0.4);
                border: 2px solid rgba(138, 43, 226, 0.4);
                border-radius: 10px;
                font-family: monospace;
                font-size: 16px;
                min-height: 44px;
                display: flex;
                align-items: center;
            }

            .navigator-search .search-prompt {
                color: rgba(255, 255, 255, 0.9);
                flex: 1;
            }

            .navigator-search .search-cursor {
                color: #a78bfa;
                font-weight: bold;
                margin-left: 2px;
            }

            .navigator-search .search-cursor.blink {
                animation: cursor-blink 1s infinite;
            }

            @keyframes cursor-blink {
                0%, 49% { opacity: 1; }
                50%, 100% { opacity: 0; }
            }

            .navigator-hint {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
                margin-top: 8px;
                font-family: monospace;
            }

            .navigator-hint kbd {
                background: rgba(138, 43, 226, 0.3);
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 11px;
                border: 1px solid rgba(138, 43, 226, 0.4);
                color: #c084fc;
            }

            /* Grid for categories - 4x4 fixed layout */
            .navigator-grid {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 25px 30px;
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                grid-template-rows: repeat(4, minmax(140px, 1fr));
                gap: 20px;
                align-content: start;
                scrollbar-width: thin;
                scrollbar-color: rgba(138, 43, 226, 0.5) transparent;
            }

            .navigator-grid::-webkit-scrollbar {
                width: 8px;
            }

            .navigator-grid::-webkit-scrollbar-track {
                background: transparent;
            }

            .navigator-grid::-webkit-scrollbar-thumb {
                background: rgba(138, 43, 226, 0.5);
                border-radius: 4px;
            }

            /* Category Cards - sized for 4x4 grid */
            .category-card {
                position: relative;
                background: rgba(138, 43, 226, 0.15);
                border: 2px solid rgba(138, 43, 226, 0.3);
                border-radius: 15px;
                padding: 20px 15px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }

            .category-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, 
                    transparent,
                    rgba(138, 43, 226, 0.2),
                    transparent);
                transition: left 0.5s;
            }

            .category-card:hover::before {
                left: 100%;
            }

            .category-card:hover {
                background: rgba(138, 43, 226, 0.25);
                border-color: rgba(138, 43, 226, 0.5);
                transform: translateY(-5px) scale(1.02);
                box-shadow: 0 10px 30px rgba(138, 43, 226, 0.3);
            }

            .category-card.selected {
                background: linear-gradient(135deg, 
                    rgba(138, 43, 226, 0.5),
                    rgba(168, 85, 247, 0.5));
                border-color: rgba(138, 43, 226, 0.9);
                box-shadow: 
                    0 0 30px rgba(138, 43, 226, 0.5),
                    inset 0 1px 1px rgba(255, 255, 255, 0.2);
                transform: translateY(-8px) scale(1.05);
            }

            .category-number {
                position: absolute;
                top: 10px;
                right: 10px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 24px;
                height: 24px;
                background: rgba(138, 43, 226, 0.6);
                border-radius: 50%;
                font-size: 12px;
                font-weight: bold;
                color: white;
            }

            .category-card.selected .category-number {
                background: rgba(255, 255, 255, 0.9);
                color: #6b21a8;
            }

            .category-icon {
                font-size: 42px;
                margin-bottom: 12px;
                filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
            }

            .category-name {
                font-size: 16px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.95);
                margin-bottom: 6px;
            }

            .category-card.selected .category-name {
                color: white;
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            }

            .category-count {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.6);
                font-family: monospace;
            }

            .category-indicator {
                position: absolute;
                bottom: 10px;
                right: 10px;
                font-size: 20px;
                color: white;
                animation: indicator-pulse 1.5s ease-in-out infinite;
            }

            /* List for items/search */
            .navigator-list {
                flex: 1;
                overflow-y: auto;
                padding: 20px 30px;
                scrollbar-width: thin;
                scrollbar-color: rgba(138, 43, 226, 0.5) transparent;
            }

            .navigator-list::-webkit-scrollbar {
                width: 8px;
            }

            .navigator-list::-webkit-scrollbar-track {
                background: transparent;
            }

            .navigator-list::-webkit-scrollbar-thumb {
                background: rgba(138, 43, 226, 0.5);
                border-radius: 4px;
            }

            .navigator-list::-webkit-scrollbar-thumb:hover {
                background: rgba(138, 43, 226, 0.7);
            }

            /* Category Headers */
            .navigator-category {
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: #a78bfa;
                margin: 20px 0 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid rgba(138, 43, 226, 0.3);
            }

            .navigator-category:first-child {
                margin-top: 0;
            }

            /* Navigator Items */
            .navigator-item {
                display: flex;
                align-items: center;
                padding: 14px 18px;
                margin: 4px 0;
                background: rgba(138, 43, 226, 0.1);
                border: 2px solid transparent;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }

            .navigator-item::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, 
                    transparent,
                    rgba(138, 43, 226, 0.2),
                    transparent);
                transition: left 0.5s;
            }

            .navigator-item:hover::before {
                left: 100%;
            }

            .navigator-item:hover {
                background: rgba(138, 43, 226, 0.2);
                border-color: rgba(138, 43, 226, 0.4);
                transform: translateX(5px);
            }

            .navigator-item.selected {
                background: linear-gradient(90deg, 
                    rgba(138, 43, 226, 0.4),
                    rgba(168, 85, 247, 0.4));
                border-color: rgba(138, 43, 226, 0.8);
                box-shadow: 
                    0 0 20px rgba(138, 43, 226, 0.4),
                    inset 0 1px 1px rgba(255, 255, 255, 0.2);
                transform: translateX(8px) scale(1.02);
            }

            .item-number {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 24px;
                height: 24px;
                background: rgba(138, 43, 226, 0.6);
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
                margin-right: 12px;
                color: white;
            }

            .navigator-item.selected .item-number {
                background: rgba(255, 255, 255, 0.9);
                color: #6b21a8;
            }

            .item-icon {
                font-size: 24px;
                margin-right: 12px;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            }

            .item-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .item-title {
                font-size: 16px;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.95);
            }

            .navigator-item.selected .item-title {
                color: white;
                font-weight: 600;
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            }

            .item-desc, .item-category {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
                font-style: italic;
            }

            .navigator-item.selected .item-desc,
            .navigator-item.selected .item-category {
                color: rgba(255, 255, 255, 0.7);
            }

            .item-indicator {
                font-size: 20px;
                color: white;
                margin-left: 10px;
                animation: indicator-pulse 1.5s ease-in-out infinite;
            }

            @keyframes indicator-pulse {
                0%, 100% { transform: translateX(0); opacity: 1; }
                50% { transform: translateX(5px); opacity: 0.7; }
            }

            /* Empty State */
            .navigator-empty {
                padding: 60px 20px;
                text-align: center;
                color: rgba(255, 255, 255, 0.5);
                font-size: 18px;
            }

            /* Footer */
            .navigator-footer {
                padding: 12px 30px;
                background: rgba(0, 0, 0, 0.3);
                border-top: 1px solid rgba(138, 43, 226, 0.3);
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
                text-align: center;
                font-family: monospace;
                flex-shrink: 0;
            }

            /* Responsive */
            @media (max-width: 1200px) {
                .navigator-panel {
                    width: 90vw;
                    height: 90vh;
                }
                
                .navigator-grid {
                    grid-template-columns: repeat(3, 1fr);  /* 3x3 on medium screens */
                    grid-template-rows: repeat(5, minmax(130px, 1fr));
                    gap: 18px;
                    padding: 20px 25px;
                }
                
                .category-icon {
                    font-size: 38px;
                }
                
                .category-name {
                    font-size: 15px;
                }
            }

            @media (max-width: 768px) {
                .navigator-panel {
                    width: 95vw;
                    height: 92vh;
                }
                
                .navigator-header {
                    padding: 18px 20px 12px;
                }
                
                .navigator-header h2 {
                    font-size: 20px;
                    margin-bottom: 8px;
                }
                
                .navigator-grid {
                    grid-template-columns: repeat(2, 1fr);  /* 2xN on mobile */
                    grid-template-rows: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 15px;
                    padding: 20px;
                }
                
                .category-card {
                    padding: 15px 10px;
                }
                
                .category-icon {
                    font-size: 32px;
                    margin-bottom: 8px;
                }
                
                .category-name {
                    font-size: 13px;
                }
                
                .category-count {
                    font-size: 11px;
                }
                
                .navigator-list {
                    padding: 15px 20px;
                }
                
                .navigator-footer {
                    padding: 10px 20px;
                    font-size: 11px;
                }
                
                .item-number, .category-number {
                    display: none;
                }
                
                .item-desc {
                    display: none;
                }
            }
        `;
        document.head.appendChild(styleElement);
    }

    // ============================================
    //  HELP SYSTEM
    // ============================================

    function createHelpHint() {
        const helpHint = document.createElement('div');
        helpHint.className = 'vim-help-hint';
        helpHint.innerHTML = `
            <strong>✨ Vim Navigation Active</strong><br>
            <kbd>Shift+O</kbd> lobby navigator 🗂️<br>
            <kbd>h</kbd>/<kbd>l</kbd> tabs
            <kbd>j</kbd>/<kbd>k</kbd> sections<br>
            <kbd>/</kbd> search
            <kbd>n</kbd>/<kbd>N</kbd> next/prev<br>
            <kbd>gi</kbd> filter
            <kbd>f</kbd> link hints<br>
            <kbd>jj</kbd> or <kbd>Esc</kbd> exit mode
        `;
        document.body.appendChild(helpHint);

        // Fade out after 10 seconds (longer to show new feature)
        setTimeout(() => {
            helpHint.style.transition = 'opacity 1s';
            helpHint.style.opacity = '0';
            setTimeout(() => helpHint.remove(), 1000);
        }, 10000);
    }

    // ============================================
    //  INITIALIZATION
    // ============================================

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectStyles();
            init();
            createHelpHint();
        });
    } else {
        injectStyles();
        init();
        createHelpHint();
    }

})();

