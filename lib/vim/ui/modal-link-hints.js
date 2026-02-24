/* ============================================
   VIM EXTENSION - MODAL LINK HINTS
   Link hints scoped to modal content
   ============================================ */

(function() {
    'use strict';

    function activate() {
        window.VimState.linkHintInput = '';
        window.VimState.linkHints = [];

        const modalPanel = window.VimState.elements.fileNavigator.querySelector('.navigator-panel');
        if (!modalPanel) return;

        const clickableElements = modalPanel.querySelectorAll('.category-card, .navigator-item');

        if (clickableElements.length === 0) return;

        // Create hints
        const hintContainer = document.createElement('div');
        hintContainer.className = 'vim-link-hint-container';
        document.body.appendChild(hintContainer);
        window.VimState.elements.linkHintContainer = hintContainer;

        const hints = window.VimUtils.generateHintLabels(clickableElements.length);
        
        clickableElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const hint = document.createElement('div');
            hint.className = 'vim-link-hint';
            hint.textContent = hints[index];
            hint.style.left = rect.left + window.scrollX + 'px';
            hint.style.top = rect.top + window.scrollY + 'px';
            
            hintContainer.appendChild(hint);
            
            window.VimState.linkHints.push({
                label: hints[index],
                element: element,
                hintElement: hint
            });
        });

        // Set up temporary handler
        setupModalHintHandler();
    }

    function setupModalHintHandler() {
        const previousMode = window.VimState.mode;
        window.VimState.mode = 'modal-link-hint';

        const handler = (e) => {
            const now = Date.now();
            const escaped = window.VimUtils.handleEscapeChord({
                event: e,
                eventTime: now,
                onEscape: () => cleanup(handler, previousMode),
                restoreSnapshot: false
            });

            if (escaped) {
                return;
            }

            // Escape
            if (e.key === 'Escape') {
                e.preventDefault();
                cleanup(handler, previousMode);
                return;
            }

            // Hint character
            if (window.VimConfig.linkHintChars.includes(e.key.toLowerCase())) {
                e.preventDefault();
                window.VimState.linkHintInput += e.key.toLowerCase();

                const matchingHints = window.VimState.linkHints.filter(hint => 
                    hint.label.startsWith(window.VimState.linkHintInput)
                );

                if (matchingHints.length === 0) {
                    cleanup(handler, previousMode);
                } else if (matchingHints.length === 1 && matchingHints[0].label === window.VimState.linkHintInput) {
                    const hint = matchingHints[0];
                    cleanup(handler, previousMode);
                    hint.element.click();
                } else {
                    window.VimUtils.updateLinkHints(matchingHints, window.VimState.linkHintInput);
                }
            }
        };

        document.addEventListener('keydown', handler, true);
    }

    function cleanup(handler, previousMode) {
        window.VimState.mode = previousMode;
        window.VimState.linkHintInput = '';
        
        if (window.VimState.elements.linkHintContainer) {
            window.VimState.elements.linkHintContainer.remove();
            window.VimState.elements.linkHintContainer = null;
        }
        
        window.VimState.linkHints = [];
        document.removeEventListener('keydown', handler, true);
        window.VimUtils.resetEscapeChordState();
    }

    // ============================================
    //  PUBLIC API
    // ============================================

    window.ModalLinkHints = {
        activate: activate
    };

    if (window.VimConfig.debug) {
        console.log('ModalLinkHints: Component ready');
    }

})();

