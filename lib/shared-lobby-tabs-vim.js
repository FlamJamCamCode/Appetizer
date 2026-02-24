/* ============================================
   VIM EXTENSION - MODULE LOADER
   Professional modular vim navigation system
   
   This file loads the shared lobby base + all vim
   extension modules in the correct order. Include
   *only this file* to enable vim navigation – it
   will automatically load shared-lobby-tabs.js if
   it has not been loaded already.
   
   Architecture:
   - Core: Config, State, Mode Manager, Utils
   - Modes: Normal, Search, Filter, Link-Hint, File-Navigator
   - UI: Search Box, Filter Box, Navigator, Styles
   - Main: Initialization and public API
   ============================================ */

(function() {
    'use strict';

    if (window.LobbyTabsVim && window.VimModeManager && window.VimModeManager.handleKeyPress) {
        console.warn('VimExt: shared-lobby-tabs-vim.js already initialized');
        return;
    }

    const currentScript = document.currentScript || (function() {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();

    const BASE_SCRIPT = 'shared-lobby-tabs.js';
    const BASE_PATH = currentScript ? currentScript.src.replace(/[^/]+$/, '') : '';
    const STYLE_ENTRIES = [
        { href: 'shared-lobby-tabs.css', id: 'vim-style-shared-tabs' },
        { href: 'shared-lobby-content.css', id: 'vim-style-shared-content' }
    ];

    function toAbsolute(path) {
        if (/^(https?:)?\/\//i.test(path)) {
            return path;
        }
        return BASE_PATH + path;
    }

    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = toAbsolute(url);
            script.async = false;
            script.onload = () => resolve(url);
            script.onerror = () => reject(new Error(`VimExt: Failed loading ${url}`));
            (document.head || document.documentElement).appendChild(script);
        });
    }

    function ensureStyleLoaded(entry) {
        if (!entry || !entry.href) {
            return Promise.resolve();
        }

        const existing = document.querySelector(`link[data-vim-style="${entry.id}"]`) ||
            Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(link => {
                const href = link.getAttribute('href') || '';
                return href.endsWith(entry.href) || href === toAbsolute(entry.href);
            });

        if (existing) {
            if (!existing.getAttribute('data-vim-style')) {
                existing.setAttribute('data-vim-style', entry.id);
            }
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = toAbsolute(entry.href);
            link.setAttribute('data-vim-style', entry.id);
            link.onload = () => resolve(entry.href);
            link.onerror = () => reject(new Error(`VimExt: Failed loading stylesheet ${entry.href}`));
            (document.head || document.documentElement).appendChild(link);
        });
    }

    function ensureStylesLoaded() {
        return Promise.all(STYLE_ENTRIES.map(ensureStyleLoaded)).catch((err) => {
            console.warn('VimExt: One or more stylesheets failed to load', err);
        });
    }

    function ensureBaseLoaded() {
        if (typeof window !== 'undefined' && window.LobbyTabs) {
            return Promise.resolve();
        }
        return loadScript(BASE_SCRIPT).catch((err) => {
            console.error('VimExt: Unable to load shared-lobby-tabs.js', err);
            throw err;
        });
    }

    // Module load order (critical!)
    const modules = [
        // Core (must load first)
        { path: 'vim/core/config.js', check: () => window.VimConfig },
        { path: 'vim/core/state.js', check: () => window.VimState },
        { path: 'vim/core/focus-manager.js', check: () => window.VimFocus },
        { path: 'vim/core/utils.js', check: () => window.VimUtils },
        { path: 'vim/core/select-manager.js', check: () => window.VimSelectManager },
        { path: 'vim/core/text-input.js', check: () => window.VimTextInput },
        { path: 'vim/core/hint-engine.js', check: () => window.VimHintEngine },
        { path: 'vim/core/mode-manager.js', check: () => window.VimModeManager },
        
        // UI Components
        { path: 'vim/ui/styles.js', check: () => window.VimStyles },
        { path: 'vim/ui/search-ui.js', check: () => window.SearchUI },
        { path: 'vim/ui/filter-ui.js', check: () => window.FilterUI },
        { path: 'vim/ui/navigator-ui.js', check: () => window.NavigatorUI },
        { path: 'vim/ui/modal-link-hints.js', check: () => window.ModalLinkHints },
        
        // Modes (can load in any order after core)
        { path: 'vim/modes/mode-presets.js', check: () => window.VimModePresets },
        { path: 'vim/modes/normal.js', check: () => {
            if (!window.VimModeManager) return false;
            const registry = window.VimModeManager.getModeRegistry();
            return !!(registry && registry.normal);
        }},
        { path: 'vim/modes/search.js', check: () => window.SearchMode },
        { path: 'vim/modes/filter.js', check: () => window.FilterMode },
        { path: 'vim/modes/link-hint.js', check: () => {
            if (!window.VimModeManager) return false;
            const registry = window.VimModeManager.getModeRegistry();
            return !!(registry && registry['link-hint']);
        }},
        { path: 'vim/modes/input-focus.js', check: () => {
            if (!window.VimModeManager) return false;
            const registry = window.VimModeManager.getModeRegistry();
            return !!(registry && registry['input-focus']);
        }},
        { path: 'vim/modes/focus-select.js', check: () => {
            if (!window.VimModeManager) return false;
            const registry = window.VimModeManager.getModeRegistry();
            return !!(registry && registry['focus-select']);
        }},
        { path: 'vim/modes/text-input.js', check: () => {
            if (!window.VimModeManager) return false;
            const registry = window.VimModeManager.getModeRegistry();
            return !!(registry && registry['text-input']);
        }},
        { path: 'vim/modes/normal-game.js', check: () => {
            if (!window.VimModeManager) return false;
            const registry = window.VimModeManager.getModeRegistry();
            return !!(registry && registry['normal-game']);
        }},
        { path: 'vim/modes/file-navigator.js', check: () => {
            if (!window.VimModeManager) return false;
            const registry = window.VimModeManager.getModeRegistry();
            return !!(registry && registry['file-navigator']);
        }},
        
        // Main (must load last)
        { path: 'vim/main.js', check: () => window.LobbyTabsVim }
    ];

    // ============================================
    //  DYNAMIC MODULE LOADING
    // ============================================

    function loadModulesSequentially() {
        let chain = Promise.resolve();
        modules.forEach((module) => {
            chain = chain.then(() => {
                if (module.check && module.check()) {
                    return null;
                }
                return loadScript(module.path);
            });
        });

        return chain.then(() => {
            console.log('VimExt: All modules loaded successfully ✓');
        }).catch((err) => {
            console.error('VimExt: Module load failure', err);
            throw err;
        });
    }

    // ============================================
    //  INITIALIZE
    // ============================================

    Promise.all([
        ensureStylesLoaded(),
        ensureBaseLoaded()
    ]).then(loadModulesSequentially).catch((err) => {
        console.error('VimExt: Initialization failed', err);
    });

})();

