/* ============================================
   VIM EXTENSION - FILTER MODE
   Real-time content filtering
   ============================================ */

(function() {
    'use strict';

    if (!window.VimModeManager) {
        console.error('FilterMode: VimModeManager not loaded');
        return;
    }

    // ============================================
    //  MODE DEFINITION
    // ============================================

    const filterMode = {
        keybindings: {
            'Enter': () => {
                // Keep filter active, just defocus
                document.activeElement.blur();
                window.VimModeManager.exitMode();
            },
            
            'Escape': () => {
                clearFilter();
                window.VimModeManager.exitMode();
            }
        },

        allowTyping: true,
        allowedKeys: ['Enter', 'Escape'],

        isInputFocused: (e) => {
            return e.target.classList.contains('vim-filter-input');
        },

        onEnter: () => {
            window.VimState.elements.filterBox.style.display = 'flex';
            window.VimState.elements.filterBox.querySelector('.vim-filter-input').value = '';
            window.VimState.elements.filterBox.querySelector('.vim-filter-input').focus();
            
            // Set up real-time filtering
            const input = window.VimState.elements.filterBox.querySelector('.vim-filter-input');
            input.addEventListener('input', performFilter);
        },

        onExit: () => {
            window.VimState.elements.filterBox.style.display = 'none';
            const input = window.VimState.elements.filterBox.querySelector('.vim-filter-input');
            input.removeEventListener('input', performFilter);
        }
    };

    // ============================================
    //  FILTER FUNCTIONS
    // ============================================

    function performFilter() {
        const filterTerm = window.VimState.elements.filterBox
            .querySelector('.vim-filter-input').value.trim().toLowerCase();
        const scopeRoot = window.VimUtils.getFocusRoot();

        if (!scopeRoot) return;

        const elements = scopeRoot.querySelectorAll('section, .section, article, p, li, h1, h2, h3, h4, .content-block, [data-filterable="true"]');
        let visibleCount = 0;

        // Reset markers
        elements.forEach(el => {
            delete el.dataset.vimFilterMatch;
            delete el.dataset.vimFilterDescendantMatch;
        });

        if (!filterTerm) {
            elements.forEach(el => {
                el.style.display = '';
                visibleCount++;
            });
            showFilterStatus('');
            return;
        }

        // Mark matches and their ancestors
        elements.forEach(el => {
            const text = el.textContent.toLowerCase();
            if (text.includes(filterTerm)) {
                el.dataset.vimFilterMatch = 'true';
                let parent = el.parentElement;
                while (parent && parent !== activePanel) {
                    parent.dataset.vimFilterDescendantMatch = 'true';
                    parent.style.display = ''; // Ensure ancestor is visible
                    parent = parent.parentElement;
                }
            }
        });

        // Apply visibility based on markers
        elements.forEach(el => {
            const shouldShow = el.dataset.vimFilterMatch === 'true' ||
                el.dataset.vimFilterDescendantMatch === 'true';

            if (shouldShow) {
                el.style.display = '';
                visibleCount++;
            } else {
                el.style.display = 'none';
            }

            delete el.dataset.vimFilterMatch;
            delete el.dataset.vimFilterDescendantMatch;
        });

        showFilterStatus(`Showing ${visibleCount} of ${elements.length} elements`);
    }

    function clearFilter() {
        const scopeRoot = window.VimUtils.getFocusRoot();
        if (!scopeRoot) return;

        const elements = scopeRoot.querySelectorAll('section, .section, article, p, li, h1, h2, h3, h4, .content-block, [data-filterable="true"]');
        elements.forEach(el => {
            el.style.display = '';
        });
        showFilterStatus('');
    }

    function showFilterStatus(message) {
        const status = window.VimState.elements.filterBox.querySelector('.vim-filter-status');
        if (status) {
            status.textContent = message;
        }
    }

    // ============================================
    //  REGISTER MODE
    // ============================================

    window.VimModeManager.registerMode('filter', filterMode);

    if (window.VimConfig.debug) {
        console.log('FilterMode: Registered');
    }

})();

