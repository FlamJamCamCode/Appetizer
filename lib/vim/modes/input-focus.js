/* ============================================
   VIM EXTENSION - INPUT FOCUS MODE
   Scoped input selection with vim-style hints
   ============================================ */

(function() {
    'use strict';

    if (!window.VimModeManager || !window.VimHintEngine) {
        console.error('InputFocusMode: prerequisites not loaded');
        return;
    }

    const INPUT_SELECTOR = 'input:not([type="hidden"]):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled]), [contenteditable="true"], [role="textbox"], [data-vim-input]';

    const inputFocusMode = {
        allowTyping: true,
        allowedKeys: ['Escape', 'Enter'],
        keybindings: {},

        isInputFocused: (e) => e.target.matches('input, textarea, select, [contenteditable="true"], [role="textbox"]'),

        onEnter: () => {
            const scopeRoot = window.VimUtils.getFocusRoot();
            const inputs = collectInputs(scopeRoot);

            if (inputs.length === 0) {
                window.VimModeManager.exitMode();
                return;
            }

            if (inputs.length === 1) {
                focusInput(inputs[0]);
                window.VimModeManager.exitMode();
                return;
            }

            const started = window.VimHintEngine.start({
                mode: 'input',
                entries: inputs,
                hintClass: 'vim-link-hint vim-input-hint',
                containerClass: 'vim-link-hint-container',
                onCommit: (entry) => {
                    focusInput(entry.element);
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
        }
    };

    function configureKeybindings() {
        const registry = window.VimModeManager.getModeRegistry()['input-focus'];
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

    function collectInputs(scope) {
        if (!scope) return [];
        const candidates = Array.from(scope.querySelectorAll(INPUT_SELECTOR));
        return candidates.filter(isEligibleInput);
    }

    function isEligibleInput(element) {
        if (!element) return false;
        if (element.closest('.vim-link-hint-container')) return false;

        const style = window.getComputedStyle(element);
        if (style.visibility === 'hidden' || style.display === 'none' || parseFloat(style.opacity) === 0) {
            return false;
        }

        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            return false;
        }

        return true;
    }

    function focusInput(input) {
        if (!input) return;

        requestAnimationFrame(() => {
            if (!input) return;

            if (input.matches('[contenteditable="true"]')) {
                input.focus();
                placeCaretAtEnd(input);
                if (window.VimTextInput && window.VimTextInput.shouldActivate(input)) {
                    window.VimTextInput.activate(input);
                }
                return;
            }

            try {
                input.focus({ preventScroll: true });
            } catch (err) {
                input.focus();
            }

            if (input.value != null && typeof input.setSelectionRange === 'function') {
                const length = input.value.length;
                input.setSelectionRange(length, length);
            }

            if (input instanceof HTMLSelectElement) {
                if (window.VimSelectManager) {
                    window.VimSelectManager.activate(input);
                }
            } else if (window.VimTextInput && window.VimTextInput.shouldActivate(input)) {
                window.VimTextInput.activate(input);
            }
        });
    }

    function placeCaretAtEnd(el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    window.VimModeManager.registerMode('input-focus', inputFocusMode);

    if (window.VimConfig.debug) {
        console.log('InputFocusMode: Registered');
    }

})();

