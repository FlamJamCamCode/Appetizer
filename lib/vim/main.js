/* ============================================
   VIM EXTENSION - MAIN ENTRY POINT
   Orchestrates initialization of all modules
   ============================================ */

(function() {
    'use strict';

    // ============================================
    //  DEPENDENCY CHECK
    // ============================================

    function checkDependencies() {
        if (typeof window.LobbyTabs === 'undefined') {
            console.error('VimExt: Base LobbyTabs system not loaded. Please include shared-lobby-tabs.js first.');
            return false;
        }

        const required = [
            'VimConfig',
            'VimState', 
            'VimModeManager',
            'VimUtils',
            'VimStyles',
            'SearchUI',
            'FilterUI',
            'NavigatorUI',
            'ModalLinkHints'
        ];

        for (let dep of required) {
            if (typeof window[dep] === 'undefined') {
                console.error(`VimExt: Required module '${dep}' not loaded`);
                return false;
            }
        }

        return true;
    }

    // ============================================
    //  INITIALIZATION
    // ============================================

    function initialize() {
        if (!checkDependencies()) {
            console.error('VimExt: Failed to initialize - missing dependencies');
            return;
        }

        // Inject styles
        window.VimStyles.inject();

        // Create UI components
        window.SearchUI.create();
        window.FilterUI.create();
        window.NavigatorUI.create();

        // Set up keyboard event handlers
        document.addEventListener('keydown', window.VimModeManager.handleKeyPress, true);
        
        // Set up '/' key handler (keypress for proper detection)
        document.addEventListener('keypress', (e) => {
            if (e.key === '/' && window.VimState.mode === 'normal' && !window.VimUtils.isTypingInInput(e)) {
                e.preventDefault();
                window.VimModeManager.enterMode('search');
            }
        }, true);

        // Start in normal mode
        window.VimModeManager.enterMode('normal');

        // Show help hint
        createHelpHint();

        console.log('VimExt: ✨ Vim navigation enabled');
        console.log('VimExt: 🗂️ File navigator ready - Press Shift+O');
        console.log('VimExt: ⌨️ All modes loaded and active');
    }

    // ============================================
    //  HELP HINT
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

        setTimeout(() => {
            helpHint.style.transition = 'opacity 1s';
            helpHint.style.opacity = '0';
            setTimeout(() => helpHint.remove(), 1000);
        }, 10000);
    }

    // ============================================
    //  PUBLIC API
    // ============================================

    window.LobbyTabsVim = {
        // Mode control
        enterMode: (mode, ...args) => window.VimModeManager.enterMode(mode, ...args),
        exitMode: () => window.VimModeManager.exitMode(),
        getCurrentMode: () => window.VimState.mode,
        
        // Specific mode shortcuts
        enterSearchMode: () => window.VimModeManager.enterMode('search'),
        enterFilterMode: () => window.VimModeManager.enterMode('filter'),
        enterLinkHintMode: () => window.VimModeManager.enterMode('link-hint'),
        openFileNavigator: () => window.VimModeManager.enterMode('file-navigator'),
        closeFileNavigator: () => window.VimModeManager.exitMode(),
        toggleFileNavigator: () => {
            if (window.VimState.navigatorOpen) {
                window.VimModeManager.exitMode();
            } else {
                window.VimModeManager.enterMode('file-navigator');
            }
        },
        
        // Search utilities
        clearSearch: () => {
            window.VimUtils.clearSearchHighlights();
            window.VimState.searchResults = [];
        },
        
        // Configuration
        setLobbyManifest: (manifest) => {
            window.VimConfig.lobbyManifest = manifest;
        },
        
        // State access
        getState: () => window.VimState,
        getConfig: () => window.VimConfig
    };

    // ============================================
    //  AUTO-INITIALIZE
    // ============================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();

