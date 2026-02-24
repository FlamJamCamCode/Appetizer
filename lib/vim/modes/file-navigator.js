/* ============================================
   VIM EXTENSION - FILE NAVIGATOR MODE
   Hierarchical lobby file navigation
   ============================================ */

(function() {
    'use strict';

    if (!window.VimModeManager) {
        console.error('FileNavigatorMode: VimModeManager not loaded');
        return;
    }

    // ============================================
    //  LOBBY MANIFEST
    // ============================================

    const defaultLobbies = [
        { file: 'index.html', title: '🏠 Context Lobbies Hub', category: 'Main', icon: '🏠', desc: 'Central hub' },
        { file: 'universal-lobby-experience.html', title: '🌌 Universal Lobby Experience', category: 'Meta', icon: '🌌', desc: 'Meta experience' },
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
        { file: 'great-steppe-games/rts-strategist-command-seeker.html', title: '🎮 RTS Strategist Command Seeker', category: 'Games', icon: '🎮', desc: 'Strategy game' },
        { file: 'vim-extension-demo.html', title: '⌨️ Vim Navigation Demo', category: 'Demo', icon: '⌨️', desc: 'Feature demo' }
    ];

    // ============================================
    //  MODE DEFINITION (Categories View)
    // ============================================

    const fileNavigatorMode = {
        keybindings: {},  // Set dynamically based on view mode

        allowTyping: false,

        onEnter: () => {
            initializeManifest();
            window.VimState.navigatorOpen = true;
            window.VimState.navigatorSelectedIndex = 0;
            window.VimState.navigatorSearchTerm = '';
            window.VimState.navigatorViewMode = 'categories';
            window.VimState.navigatorCurrentCategory = null;
            
            window.NavigatorUI.render();
            const panel = window.VimState.elements.fileNavigator.querySelector('.navigator-panel');
            if (panel && window.VimFocus) {
                window.VimFocus.pushScope(panel, {
                    id: 'navigator-modal',
                    type: 'modal',
                    label: 'Navigator'
                });
            }
            
            setTimeout(() => {
                window.VimState.elements.fileNavigator.classList.add('active');
            }, 10);
            
            // Set initial keybindings for categories view
            setKeybindingsForView('categories');
        },

        onExit: () => {
            window.VimState.navigatorOpen = false;
            window.VimState.elements.fileNavigator.classList.remove('active');
            if (window.VimFocus) {
                window.VimFocus.popScope(entry => entry && entry.id === 'navigator-modal');
                window.VimFocus.updateOverlay();
            }
            
            setTimeout(() => {
                const content = window.VimState.elements.fileNavigator.querySelector('.navigator-content');
                if (content) content.innerHTML = '';
            }, 300);
        },

        isInputFocused: () => false
    };

    // ============================================
    //  VIEW-SPECIFIC KEYBINDINGS
    // ============================================

    function setKeybindingsForView(viewMode) {
        const mode = window.VimModeManager.getModeRegistry()['file-navigator'];
        if (!mode) return;

        if (viewMode === 'categories') {
            mode.keybindings = getCategoriesKeybindings();
        } else if (viewMode === 'category-items') {
            mode.keybindings = getCategoryItemsKeybindings();
        } else if (viewMode === 'search-results') {
            mode.keybindings = getSearchResultsKeybindings();
        }
    }

    function getCategoriesKeybindings() {
        const categoryKeys = Object.keys(window.VimState.navigatorCategories).sort();
        const gridCols = 4;

        return {
            'Escape': () => window.VimModeManager.exitMode(),
            '/': () => switchToSearchView(),
            'f': () => enterModalLinkHints(),
            
            // 2D Grid navigation
            'h': () => moveInGrid(-1, 0, gridCols, categoryKeys.length),
            'l': () => moveInGrid(1, 0, gridCols, categoryKeys.length),
            'j': () => moveInGrid(0, 1, gridCols, categoryKeys.length),
            'k': () => moveInGrid(0, -1, gridCols, categoryKeys.length),
            
            'ArrowLeft': () => moveInGrid(-1, 0, gridCols, categoryKeys.length),
            'ArrowRight': () => moveInGrid(1, 0, gridCols, categoryKeys.length),
            'ArrowDown': () => moveInGrid(0, 1, gridCols, categoryKeys.length),
            'ArrowUp': () => moveInGrid(0, -1, gridCols, categoryKeys.length),
            
            'g': () => {
                if (window.VimState.lastKey === 'g') {
                    window.VimState.navigatorSelectedIndex = 0;
                    window.NavigatorUI.render();
                }
            },
            
            'G': () => {
                window.VimState.navigatorSelectedIndex = categoryKeys.length - 1;
                window.NavigatorUI.render();
            },
            
            'Enter': () => enterCategory(categoryKeys[window.VimState.navigatorSelectedIndex]),
            
            '1': () => quickJump(0, categoryKeys),
            '2': () => quickJump(1, categoryKeys),
            '3': () => quickJump(2, categoryKeys),
            '4': () => quickJump(3, categoryKeys),
            '5': () => quickJump(4, categoryKeys),
            '6': () => quickJump(5, categoryKeys),
            '7': () => quickJump(6, categoryKeys),
            '8': () => quickJump(7, categoryKeys),
            '9': () => quickJump(8, categoryKeys)
        };
    }

    function getCategoryItemsKeybindings() {
        const items = window.VimState.navigatorCategories[window.VimState.navigatorCurrentCategory] || [];

        return {
            'Escape': () => backToCategories(),
            'Backspace': () => backToCategories(),
            '/': () => switchToSearchView(),
            'f': () => enterModalLinkHints(),
            'h': () => backToCategories(),
            'l': () => openSelectedFile(),
            
            'j': () => moveSelection(1, items.length),
            'k': () => moveSelection(-1, items.length),
            'ArrowDown': () => moveSelection(1, items.length),
            'ArrowUp': () => moveSelection(-1, items.length),
            
            'g': () => {
                if (window.VimState.lastKey === 'g') {
                    window.VimState.navigatorSelectedIndex = 0;
                    window.NavigatorUI.render();
                }
            },
            
            'G': () => {
                window.VimState.navigatorSelectedIndex = items.length - 1;
                window.NavigatorUI.render();
            },
            
            'Enter': () => openSelectedFile(),
            
            '1': () => quickOpen(0, items),
            '2': () => quickOpen(1, items),
            '3': () => quickOpen(2, items),
            '4': () => quickOpen(3, items),
            '5': () => quickOpen(4, items),
            '6': () => quickOpen(5, items),
            '7': () => quickOpen(6, items),
            '8': () => quickOpen(7, items),
            '9': () => quickOpen(8, items)
        };
    }

    function getSearchResultsKeybindings() {
        return {
            'Escape': () => {
                window.VimState.navigatorSearchTerm = '';
                window.VimState.navigatorViewMode = 'categories';
                window.VimState.navigatorSelectedIndex = 0;
                setKeybindingsForView('categories');
                window.NavigatorUI.render();
            },
            
            'Backspace': () => {
                if (window.VimState.navigatorSearchTerm.length > 0) {
                    window.VimState.navigatorSearchTerm = window.VimState.navigatorSearchTerm.slice(0, -1);
                    if (window.VimState.navigatorSearchTerm.length === 0) {
                        window.VimState.navigatorViewMode = 'categories';
                        window.VimState.navigatorSelectedIndex = 0;
                        setKeybindingsForView('categories');
                    } else {
                        filterFiles();
                    }
                    window.NavigatorUI.render();
                }
            },
            
            'f': () => enterModalLinkHints(),
            'h': () => {
                window.VimState.navigatorSearchTerm = '';
                window.VimState.navigatorViewMode = 'categories';
                window.VimState.navigatorSelectedIndex = 0;
                setKeybindingsForView('categories');
                window.NavigatorUI.render();
            },
            
            'l': () => openSelectedFile(),
            'j': () => moveSelection(1, window.VimState.navigatorFilteredFiles.length),
            'k': () => moveSelection(-1, window.VimState.navigatorFilteredFiles.length),
            'ArrowDown': () => moveSelection(1, window.VimState.navigatorFilteredFiles.length),
            'ArrowUp': () => moveSelection(-1, window.VimState.navigatorFilteredFiles.length),
            
            'g': () => {
                if (window.VimState.lastKey === 'g') {
                    window.VimState.navigatorSelectedIndex = 0;
                    window.NavigatorUI.render();
                }
            },
            
            'G': () => {
                window.VimState.navigatorSelectedIndex = window.VimState.navigatorFilteredFiles.length - 1;
                window.NavigatorUI.render();
            },
            
            'Enter': () => openSelectedFile(),
            
            '1': () => quickOpen(0, window.VimState.navigatorFilteredFiles),
            '2': () => quickOpen(1, window.VimState.navigatorFilteredFiles),
            '3': () => quickOpen(2, window.VimState.navigatorFilteredFiles),
            '4': () => quickOpen(3, window.VimState.navigatorFilteredFiles),
            '5': () => quickOpen(4, window.VimState.navigatorFilteredFiles),
            '6': () => quickOpen(5, window.VimState.navigatorFilteredFiles),
            '7': () => quickOpen(6, window.VimState.navigatorFilteredFiles),
            '8': () => quickOpen(7, window.VimState.navigatorFilteredFiles),
            '9': () => quickOpen(8, window.VimState.navigatorFilteredFiles)
        };
    }

    // ============================================
    //  NAVIGATION HELPERS
    // ============================================

    function moveInGrid(deltaX, deltaY, cols, total) {
        const currentIndex = window.VimState.navigatorSelectedIndex;
        const currentRow = Math.floor(currentIndex / cols);
        const currentCol = currentIndex % cols;
        
        let newIndex = currentIndex;
        
        if (deltaX !== 0) {
            // Horizontal movement
            const newCol = currentCol + deltaX;
            if (newCol >= 0 && newCol < cols) {
                newIndex = currentRow * cols + newCol;
                if (newIndex < total) {
                    window.VimState.navigatorSelectedIndex = newIndex;
                }
            }
        } else if (deltaY !== 0) {
            // Vertical movement
            newIndex = currentIndex + (deltaY * cols);
            if (newIndex >= 0 && newIndex < total) {
                window.VimState.navigatorSelectedIndex = newIndex;
            } else if (deltaY > 0 && currentRow < Math.ceil(total / cols) - 1) {
                // Moving down but column doesn't exist - go to last item
                window.VimState.navigatorSelectedIndex = total - 1;
            }
        }
        
        window.NavigatorUI.render();
        scrollSelectedIntoView();
    }

    function moveSelection(delta, total) {
        const newIndex = window.VimState.navigatorSelectedIndex + delta;
        if (newIndex >= 0 && newIndex < total) {
            window.VimState.navigatorSelectedIndex = newIndex;
            window.NavigatorUI.render();
            scrollSelectedIntoView();
        }
    }

    function scrollSelectedIntoView() {
        setTimeout(() => {
            const selected = window.VimState.elements.fileNavigator.querySelector(
                '.navigator-item.selected, .category-card.selected'
            );
            if (selected) {
                selected.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 10);
    }

    function quickJump(index, collection) {
        if (index < collection.length) {
            if (Array.isArray(collection[0])) {
                // It's category keys
                enterCategory(collection[index]);
            } else {
                window.VimState.navigatorSelectedIndex = index;
                openSelectedFile();
            }
        }
    }

    function quickOpen(index, items) {
        if (index < items.length) {
            window.VimState.navigatorSelectedIndex = index;
            openSelectedFile();
        }
    }

    // ============================================
    //  VIEW SWITCHING
    // ============================================

    function enterCategory(category) {
        window.VimState.navigatorViewMode = 'category-items';
        window.VimState.navigatorCurrentCategory = category;
        window.VimState.navigatorSelectedIndex = 0;
        setKeybindingsForView('category-items');
        window.NavigatorUI.render();
    }

    function backToCategories() {
        window.VimState.navigatorViewMode = 'categories';
        window.VimState.navigatorCurrentCategory = null;
        window.VimState.navigatorSelectedIndex = 0;
        setKeybindingsForView('categories');
        window.NavigatorUI.render();
    }

    function switchToSearchView() {
        window.VimState.navigatorSearchTerm = '';
        window.VimState.navigatorViewMode = 'search-results';
        window.VimState.navigatorSelectedIndex = 0;
        setKeybindingsForView('search-results');
        
        // Allow typing in search mode
        const mode = window.VimModeManager.getModeRegistry()['file-navigator'];
        mode.allowTyping = true;
        mode.allowedKeys = ['Escape', 'Backspace', 'Enter', 'f', 'h', 'l', 'j', 'k', 
                            'ArrowDown', 'ArrowUp', 'g', 'G', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        
        window.NavigatorUI.render();
    }

    // ============================================
    //  FILE OPERATIONS
    // ============================================

    function openSelectedFile() {
        let selected;
        
        if (window.VimState.navigatorViewMode === 'category-items') {
            const items = window.VimState.navigatorCategories[window.VimState.navigatorCurrentCategory] || [];
            selected = items[window.VimState.navigatorSelectedIndex];
        } else {
            selected = window.VimState.navigatorFilteredFiles[window.VimState.navigatorSelectedIndex];
        }
        
        if (selected) {
            const currentPath = window.location.pathname;
            const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            window.location.href = currentDir + selected.file;
        }
    }

    function initializeManifest() {
        window.VimState.navigatorFiles = window.VimConfig.lobbyManifest.length > 0 
            ? window.VimConfig.lobbyManifest 
            : defaultLobbies;
        
        const currentFile = window.location.pathname.split('/').pop();
        window.VimState.navigatorFiles = window.VimState.navigatorFiles.filter(
            lobby => lobby.file !== currentFile
        );
        
        // Build categories
        window.VimState.navigatorCategories = {};
        window.VimState.navigatorFiles.forEach(lobby => {
            if (!window.VimState.navigatorCategories[lobby.category]) {
                window.VimState.navigatorCategories[lobby.category] = [];
            }
            window.VimState.navigatorCategories[lobby.category].push(lobby);
        });
        
        window.VimState.navigatorFilteredFiles = [...window.VimState.navigatorFiles];
    }

    function filterFiles() {
        const term = window.VimState.navigatorSearchTerm.toLowerCase();
        
        if (!term) {
            window.VimState.navigatorFilteredFiles = [...window.VimState.navigatorFiles];
            return;
        }

        window.VimState.navigatorFilteredFiles = window.VimState.navigatorFiles.filter(lobby => {
            const searchText = (lobby.title + ' ' + lobby.category + ' ' + lobby.file).toLowerCase();
            
            let searchIndex = 0;
            for (let char of term) {
                searchIndex = searchText.indexOf(char, searchIndex);
                if (searchIndex === -1) return false;
                searchIndex++;
            }
            return true;
        });

        if (window.VimState.navigatorSelectedIndex >= window.VimState.navigatorFilteredFiles.length) {
            window.VimState.navigatorSelectedIndex = Math.max(0, window.VimState.navigatorFilteredFiles.length - 1);
        }
    }

    function enterModalLinkHints() {
        // Delegate to link hint mode but scoped to modal
        window.ModalLinkHints.activate();
    }

    // ============================================
    //  HANDLE TYPING IN SEARCH MODE
    // ============================================

    function handleTyping(e) {
        if (window.VimState.navigatorViewMode === 'search-results' && 
            e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            window.VimState.navigatorSearchTerm += e.key.toLowerCase();
            filterFiles();
            window.NavigatorUI.render();
            return true;
        }
        
        // Switch to search if typing in categories or items view
        if ((window.VimState.navigatorViewMode === 'categories' || 
             window.VimState.navigatorViewMode === 'category-items') &&
            e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey &&
            !/[hjklgfGO\/]/.test(e.key)) {  // Exclude navigation keys
            e.preventDefault();
            window.VimState.navigatorSearchTerm += e.key.toLowerCase();
            switchToSearchView();
            filterFiles();
            window.NavigatorUI.render();
            return true;
        }
        
        return false;
    }

    // Override mode to handle typing
    fileNavigatorMode.handleTyping = handleTyping;

    // ============================================
    //  PUBLIC API
    // ============================================

    window.FileNavigatorMode = {
        setKeybindingsForView: setKeybindingsForView,
        enterCategory: enterCategory,
        backToCategories: backToCategories,
        filterFiles: filterFiles,
        openSelectedFile: openSelectedFile
    };

    // ============================================
    //  REGISTER MODE
    // ============================================

    window.VimModeManager.registerMode('file-navigator', fileNavigatorMode);

    if (window.VimConfig.debug) {
        console.log('FileNavigatorMode: Registered');
    }

})();

