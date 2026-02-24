/* ============================================
   VIM EXTENSION - NORMAL GAME MODE
   Specialized navigation for minigame scopes
   ============================================ */

(function() {
    'use strict';

    if (!window.VimModeManager) {
        console.error('NormalGameMode: VimModeManager not loaded');
        return;
    }

    function withinCommandDelay(expectedPrevKey) {
        if (window.VimState.prevKey !== expectedPrevKey) return false;
        const elapsed = window.VimState.lastKeyTime - window.VimState.prevKeyTime;
        return elapsed >= 0 && elapsed <= window.VimConfig.commandDelay;
    }

    function ensureGameHelper() {
        if (!window.VimMiniGame || typeof window.VimMiniGame.ensureSelection !== 'function') {
            return false;
        }
        window.VimMiniGame.ensureSelection();
        return true;
    }

    function popFocusOrClear() {
        if (window.VimFocus && !window.VimFocus.isGlobalScope()) {
            window.VimFocus.popScope();
            window.VimFocus.updateOverlay();
            return true;
        }
        window.VimUtils.clearSearchHighlights();
        window.VimState.searchResults = [];
        return false;
    }

    const gameMode = {
        keybindings: {
            'h': () => {
                if (ensureGameHelper()) {
                    window.VimMiniGame.moveHorizontal(-1);
                }
            },
            'l': () => {
                if (ensureGameHelper()) {
                    window.VimMiniGame.moveHorizontal(1);
                }
            },
            'k': () => {
                if (ensureGameHelper()) {
                    window.VimMiniGame.moveVertical(-1);
                }
            },
            'j': () => {
                if (ensureGameHelper()) {
                    window.VimMiniGame.moveVertical(1);
                }
            },
            'Enter': () => {
                if (ensureGameHelper()) {
                    window.VimMiniGame.activateSelection();
                }
            },
            ' ': () => {
                if (ensureGameHelper()) {
                    window.VimMiniGame.activateSelection();
                }
            },
            'r': () => {
                if (ensureGameHelper()) {
                    window.VimMiniGame.resetGame();
                }
            },
            'f': () => window.VimModeManager.enterMode('link-hint'),
            '/': () => window.VimModeManager.enterMode('search'),
            '\\': () => window.VimModeManager.enterMode('filter'),
            'i': () => {
                if (withinCommandDelay('g')) {
                    window.VimModeManager.enterMode('input-focus');
                }
            },
            'g': () => {
                if (withinCommandDelay('g')) {
                    window.VimModeManager.enterMode('focus-select');
                }
            },
            'n': () => {
                if (window.VimState.searchResults.length > 0) {
                    window.SearchMode.jumpToNext();
                }
            },
            'N': () => {
                if (window.VimState.searchResults.length > 0) {
                    window.SearchMode.jumpToPrevious();
                }
            },
            'Escape': () => {
                popFocusOrClear();
            }
        },
        allowTyping: false,
        onEnter: () => {
            if (window.VimMiniGame && typeof window.VimMiniGame.onEnter === 'function') {
                window.VimMiniGame.onEnter();
            }
        },
        onExit: () => {
            if (window.VimMiniGame && typeof window.VimMiniGame.onExit === 'function') {
                window.VimMiniGame.onExit();
            }
        },
        isInputFocused: () => false,
        escapeChord: false
    };

    window.VimModeManager.registerMode('normal-game', gameMode);

    if (window.VimConfig.debug) {
        console.log('NormalGameMode: Registered');
    }
})();


