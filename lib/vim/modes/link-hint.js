/* ============================================
   VIM EXTENSION - LINK HINT MODE
   Vimium-style link selection
   ============================================ */

/* ============================================
   VIM EXTENSION - LINK HINT MODE
   Vimium-style link selection
   ============================================ */

(function() {
    'use strict';

    if (!window.VimModeManager || !window.VimHintEngine) {
        console.error('LinkHintMode: prerequisites not loaded');
        return;
    }

    const HINT_CLASS = 'vim-link-hint';
    const CONTAINER_CLASS = 'vim-link-hint-container';

    const linkHintMode = {
        allowTyping: false,
        keybindings: {},

        onEnter: () => {
            const scope = resolveHintContainer();
            if (!scope) {
                window.VimModeManager.exitMode();
                return;
            }

            const elements = collectClickableElements(scope);
            if (elements.length === 0) {
                window.VimModeManager.exitMode();
                return;
            }

            const started = window.VimHintEngine.start({
                mode: 'link',
                entries: elements,
                hintClass: HINT_CLASS,
                containerClass: CONTAINER_CLASS,
                onCommit: (entry) => {
                    activateElement(entry.element);
                    window.VimModeManager.exitMode();
                },
                onCancel: () => window.VimModeManager.exitMode()
            });

            if (!started) {
                window.VimModeManager.exitMode();
                return;
            }

            configureKeybindings();
        },

        onExit: () => {
            window.VimHintEngine.stop({ silent: true, reason: 'mode-exit' });
        },

        isInputFocused: () => false
    };

    function configureKeybindings() {
        const registry = window.VimModeManager.getModeRegistry()['link-hint'];
        if (!registry) return;

        const bindings = {};
        bindings['Escape'] = () => window.VimHintEngine.cancel('escape');
        bindings['Backspace'] = (e) => {
            if (e) e.preventDefault();
            window.VimHintEngine.handleBackspace();
        };
        bindings['Enter'] = (e) => {
            if (e) e.preventDefault();
            window.VimHintEngine.handleEnter({ clear: !!(e && e.shiftKey) });
        };

        window.VimConfig.linkHintChars.split('').forEach(char => {
            bindings[char] = () => window.VimHintEngine.handleChar(char);
            bindings[char.toUpperCase()] = () => window.VimHintEngine.handleChar(char);
        });

        registry.keybindings = bindings;
    }

    function activateElement(element) {
        if (!element) return;

        if (typeof element.focus === 'function') {
            try {
                element.focus({ preventScroll: true });
            } catch (err) {
                element.focus();
            }
        }

        if (element instanceof HTMLSelectElement) {
            const event = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            element.dispatchEvent(event);
            if (window.VimSelectManager) {
                window.VimSelectManager.activate(element);
            }
            return;
        }

        if (typeof element.click === 'function') {
            element.click();
            if (window.VimTextInput && window.VimTextInput.shouldActivate(element)) {
                window.VimTextInput.activate(element);
            }
            return;
        }

        element.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));

        if (window.VimTextInput && window.VimTextInput.shouldActivate(element)) {
            window.VimTextInput.activate(element);
        }
    }

    function resolveHintContainer() {
        if (window.VimFocus && typeof window.VimFocus.getScopeElement === 'function') {
            const scope = window.VimFocus.getScopeElement();
            if (scope) {
                return scope;
            }
        }

        return document.body;
    }

    function collectClickableElements(container) {
        const CLICKABLE_SELECTOR = [
            'a',
            'button',
            'summary',
            'details',
            'label[for]',
            'input:not([type="hidden"])',
            'textarea',
            'select',
            '[role="button"]',
            '[role="link"]',
            '[role="tab"]',
            '[role="menuitem"]',
            '[role="option"]',
            '[role="checkbox"]',
            '[role="switch"]',
            '[role="treeitem"]',
            '[role="gridcell"]',
            '[onclick]',
            '[data-action]',
            '[data-clickable]',
            '[tabindex]:not([tabindex="-1"])',
            '.tab-button',
            '.scroll-dot',
            '.nav-arrow',
            '.category-card',
            '.navigator-item',
            '.navigator-list [data-index]',
            '.vim-clickable',
            '[class*="button"]',
            '[class*="btn"]',
            '[class*="link"]',
            '[class*="click"]'
        ].join(', ');

        const candidates = Array.from(container.querySelectorAll(CLICKABLE_SELECTOR));

        return candidates.filter(el => isClickableElement(el, container));
    }

    function isClickableElement(element, container) {
        if (!element) return false;
        if (container && !container.contains(element)) return false;
        if (element.closest('.vim-link-hint-container')) return false;
        if (window.VimState.elements.focusOutline && element === window.VimState.elements.focusOutline) return false;
        if (window.VimState.elements.inputHintContainer && window.VimState.elements.inputHintContainer.contains(element)) return false;
        if (window.VimState.elements.focusHintContainer && window.VimState.elements.focusHintContainer.contains(element)) return false;

        const disabled = element.matches('[disabled], [aria-disabled="true"]');
        if (disabled) return false;

        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;

        const style = window.getComputedStyle(element);
        if (style.visibility === 'hidden' || style.display === 'none' || parseFloat(style.opacity) === 0) {
            return false;
        }

        if (element.hasAttribute('aria-hidden') && element.getAttribute('aria-hidden') === 'true') {
            return false;
        }

        if (element.offsetParent === null && element !== document.body) {
            return false;
        }

        return true;
    }

    // ============================================
    //  REGISTER MODE
    // ============================================

    window.VimModeManager.registerMode('link-hint', linkHintMode);

    if (window.VimConfig.debug) {
        console.log('LinkHintMode: Registered');
    }

})();

