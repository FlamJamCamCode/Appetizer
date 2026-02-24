/* ============================================
   VIM EXTENSION - SEARCH MODE
   Text search with highlighting
   ============================================ */

(function() {
    'use strict';

    if (!window.VimModeManager) {
        console.error('SearchMode: VimModeManager not loaded');
        return;
    }

    // ============================================
    //  MODE DEFINITION
    // ============================================

    const searchMode = {
        keybindings: {
            'Enter': () => {
                performSearch();
                window.VimModeManager.exitMode();
            },
            
            'Escape': () => {
                window.VimModeManager.exitMode();
            }
        },

        allowTyping: true,  // Allow typing in search box
        allowedKeys: ['Enter', 'Escape'],  // Only these keys have handlers

        isInputFocused: (e) => {
            return e.target.classList.contains('vim-search-input');
        },

        onEnter: () => {
            window.VimState.searchTerm = '';
            window.VimState.elements.searchBox.style.display = 'flex';
            window.VimState.elements.searchBox.querySelector('.vim-search-input').value = '';
            window.VimState.elements.searchBox.querySelector('.vim-search-input').focus();
        },

        onExit: () => {
            window.VimState.elements.searchBox.style.display = 'none';
        }
    };

    // ============================================
    //  SEARCH FUNCTIONS
    // ============================================

    function performSearch() {
        const searchTerm = window.VimState.elements.searchBox.querySelector('.vim-search-input').value.trim();
        if (!searchTerm) return;

        window.VimState.searchTerm = searchTerm;
        window.VimState.searchResults = [];
        window.VimState.currentSearchIndex = 0;

        window.VimUtils.clearSearchHighlights();

        const scopeRoot = window.VimUtils.getFocusRoot();
        if (!scopeRoot) return;

        window.VimUtils.highlightTextInElement(scopeRoot, searchTerm, window.VimState.searchResults);

        if (window.VimState.searchResults.length > 0) {
            showSearchStatus(`Found ${window.VimState.searchResults.length} matches`);
            jumpToSearchResult(0);
        } else {
            showSearchStatus('No matches found');
        }
    }

    function jumpToSearchResult(index) {
        window.VimState.searchResults.forEach(mark => {
            mark.classList.remove('vim-search-active');
        });

        const currentResult = window.VimState.searchResults[index];
        currentResult.classList.add('vim-search-active');

        currentResult.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        showSearchStatus(`Match ${index + 1} of ${window.VimState.searchResults.length}`);
    }

    function jumpToNext() {
        if (window.VimState.searchResults.length === 0) return;
        window.VimState.currentSearchIndex = (window.VimState.currentSearchIndex + 1) % window.VimState.searchResults.length;
        jumpToSearchResult(window.VimState.currentSearchIndex);
    }

    function jumpToPrevious() {
        if (window.VimState.searchResults.length === 0) return;
        window.VimState.currentSearchIndex = (window.VimState.currentSearchIndex - 1 + window.VimState.searchResults.length) % window.VimState.searchResults.length;
        jumpToSearchResult(window.VimState.currentSearchIndex);
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
    //  PUBLIC API
    // ============================================

    window.SearchMode = {
        jumpToNext: jumpToNext,
        jumpToPrevious: jumpToPrevious
    };

    // ============================================
    //  REGISTER MODE
    // ============================================

    window.VimModeManager.registerMode('search', searchMode);

    if (window.VimConfig.debug) {
        console.log('SearchMode: Registered');
    }

})();

