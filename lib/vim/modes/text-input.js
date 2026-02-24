/* ============================================
   VIM EXTENSION - TEXT INPUT MODE
   Wraps VimTextInput manager into a registered mode
   ============================================ */

(function() {
    'use strict';

    if (!window.VimModeManager || !window.VimTextInput) {
        console.error('TextInputMode: prerequisites missing');
        return;
    }

    const textInputMode = {
        allowTyping: true,
        captureAllKeys: false,
        keybindings: {},

        onEnter: (element) => {
            if (element) {
                window.VimTextInput.bindTarget(element);
            } else {
                const target = document.activeElement;
                if (window.VimTextInput.shouldActivate(target)) {
                    window.VimTextInput.bindTarget(target);
                }
            }
        },

        onExit: () => {
            window.VimTextInput.deactivate();
        },

        isInputFocused: () => {
            const state = window.VimState && window.VimState.textInput;
            if (!state || !state.active) return false;
            return state.subMode === 'insert' && document.activeElement === state.target;
        },

        handleEvent: (event) => {
            return window.VimTextInput.handleKey(event);
        }
    };

    window.VimModeManager.registerMode('text-input', textInputMode);

    if (window.VimConfig.debug) {
        console.log('TextInputMode: Registered');
    }
})();


