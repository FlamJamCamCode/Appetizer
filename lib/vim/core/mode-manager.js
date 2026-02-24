/* ============================================
   VIM EXTENSION - MODE MANAGER
   Centralized mode system with clean architecture
   ============================================ */

(function() {
    'use strict';

    // Mode registry
    const modeRegistry = {};
    
    // Current mode instance
    let currentModeHandler = null;

    // ============================================
    //  MODE REGISTRATION
    // ============================================

    function registerMode(name, modeDefinition) {
        if (window.VimConfig.debug) {
            console.log(`VimModeManager: Registering mode '${name}'`);
        }
        
        const escapeChordEnabled = modeDefinition.escapeChord !== false && modeDefinition.jjEscape !== false;

        modeRegistry[name] = {
            name: name,
            keybindings: modeDefinition.keybindings || {},
            allowTyping: modeDefinition.allowTyping || false,
            allowedKeys: normalizeAllowedKeys(modeDefinition.allowedKeys),
            onEnter: modeDefinition.onEnter || (() => {}),
            onExit: modeDefinition.onExit || (() => {}),
            isInputFocused: modeDefinition.isInputFocused || (() => false),
            escapeChord: escapeChordEnabled,
            handleEvent: typeof modeDefinition.handleEvent === 'function' ? modeDefinition.handleEvent : null,
            captureAllKeys: !!modeDefinition.captureAllKeys
        };
    }

    // ============================================
    //  MODE SWITCHING
    // ============================================

    function enterMode(modeName, ...args) {
        const mode = modeRegistry[modeName];
        
        if (!mode) {
            console.error(`VimModeManager: Mode '${modeName}' not registered`);
            return;
        }

        // Exit current mode
        if (currentModeHandler && window.VimState.mode !== modeName) {
            const oldMode = modeRegistry[window.VimState.mode];
            if (oldMode) {
                oldMode.onExit();
            }
        }

        // Update state
        const previousMode = window.VimState.mode;
        window.VimState.mode = modeName;
        currentModeHandler = mode;

        if (window.VimConfig.debug) {
            console.log(`VimModeManager: ${previousMode} → ${modeName}`);
        }

        // Enter new mode
        mode.onEnter(...args);
    }

    function exitMode() {
        if (currentModeHandler) {
            currentModeHandler.onExit();
        }
        enterMode(window.VimState.baseMode || 'normal');
    }

    function setBaseMode(modeName, options = {}) {
        if (!modeRegistry[modeName]) {
            console.warn(`VimModeManager: Base mode '${modeName}' is not registered`);
            return;
        }

        const previousBase = window.VimState.baseMode || 'normal';
        window.VimState.baseMode = modeName;

        const deferSwitch = options && options.deferSwitch;
        const currentMode = window.VimState.mode;

        if (modeRegistry[modeName]) {
            if (currentMode === modeName) {
                currentModeHandler = modeRegistry[modeName];
            }
        }

        if (deferSwitch) {
            return;
        }

        const shouldSwitch =
            currentMode === previousBase ||
            currentMode === 'normal' ||
            !modeRegistry[currentMode];

        if (shouldSwitch) {
            enterMode(modeName);
        }
    }

    function getBaseMode() {
        return window.VimState.baseMode || 'normal';
    }

    // ============================================
    //  KEY HANDLING
    // ============================================

    function handleKeyPress(e) {
        const mode = modeRegistry[window.VimState.mode];
        if (!mode) return;

        if (window.VimSelectManager && typeof window.VimSelectManager.handleKey === 'function') {
            const handledBySelect = window.VimSelectManager.handleKey(e);
            if (handledBySelect) {
                return;
            }
        }

        const eventTime = Date.now();
        const context = { eventTime };

        if (mode.handleEvent) {
            const handled = mode.handleEvent.call(mode, e, context);
            if (handled) {
                return;
            }
        }

        const typingInDomInput = window.VimUtils.isTypingInInput(e);

        // Check if we're in an input field for this mode
        const isInputFocused = mode.isInputFocused(e);

        if (!mode.captureAllKeys && mode.allowTyping && isInputFocused) {
            const activeElement = document.activeElement;
            const escaped = window.VimUtils.handleEscapeChord({
                event: e,
                eventTime,
                enabled: mode.escapeChord !== false,
                captureTarget: activeElement,
                requireTarget: activeElement,
                onEscape: () => exitMode()
            });

            if (escaped) {
                return;
            }

            // Check if this is an allowed key
            if (mode.allowedKeys && (mode.allowedKeys.has('ALL') || mode.allowedKeys.has(e.key))) {
                const handler = mode.keybindings[e.key];
                if (handler) {
                    handler(e);
                    return;
                }
            }
            
            // Let all other keys pass through for typing
            return;
        }

        if (!mode.captureAllKeys && !mode.allowTyping && typingInDomInput) {
            handleTypingInNativeInput(e, eventTime, {
                escapeEnabled: mode.escapeChord !== false
            });
            return;
        }

        if (!mode.captureAllKeys && mode.escapeChord !== false) {
            const escapeConfig = window.VimUtils.getEscapeChordConfig();
            const handledEscape = window.VimUtils.handleEscapeChord({
                event: e,
                eventTime,
                enabled: mode.escapeChord !== false,
                restoreSnapshot: false,
                onEscape: () => {
                    const combo = escapeConfig.combo;
                    if (mode.keybindings[combo]) {
                        mode.keybindings[combo](e);
                    } else {
                        exitMode();
                    }
                }
            });

            if (handledEscape) {
                return;
            }
        } else {
            window.VimUtils.resetEscapeChordState();
        }

        // Handle custom typing for modes like file-navigator
        if (mode.handleTyping && mode.handleTyping(e)) {
            return;
        }

        // Track key history for multi-key commands
        window.VimState.prevKey = window.VimState.lastKey;
        window.VimState.prevKeyTime = window.VimState.lastKeyTime;
        window.VimState.lastKey = e.key;
        window.VimState.lastKeyTime = eventTime;

        // Check for keybinding
        const handler = mode.keybindings[e.key];
        if (handler) {
            e.preventDefault();
            handler(e);
        }
    }

    function handleTypingInNativeInput(e, eventTime, options = {}) {
        const active = document.activeElement;

        if (e.key === 'Escape') {
            e.preventDefault();
            blurActiveInput();
            window.VimUtils.resetEscapeChordState();
            return;
        }

        const escapeEnabled = options.escapeEnabled !== false;
        const handledEscape = window.VimUtils.handleEscapeChord({
            event: e,
            eventTime,
            enabled: escapeEnabled,
            captureTarget: active,
            requireTarget: active,
            onEscape: () => {
                blurActiveInput();
            }
        });

        if (!handledEscape) {
            // If the key wasn't part of the chord, ensure state is reset.
            const cfg = window.VimUtils.getEscapeChordConfig();
            const keyRaw = e.key;
            const key = typeof keyRaw === 'string' && keyRaw.length === 1 ? keyRaw.toLowerCase() : null;
            if (!key || (key !== cfg.firstKey && key !== cfg.secondKey)) {
                window.VimUtils.resetEscapeChordState();
            }
        }
    }

    function blurActiveInput() {
        const active = document.activeElement;
        if (active && typeof active.blur === 'function') {
            active.blur();
        }
        if (window.VimState.mode !== 'normal') {
            enterMode('normal');
        }
        window.VimUtils.resetEscapeChordState();
    }

    function normalizeAllowedKeys(allowed) {
        if (!allowed) return null;
        if (allowed === 'ALL') {
            return new Set(['ALL']);
        }
        if (Array.isArray(allowed)) {
            return new Set(allowed);
        }
        if (allowed instanceof Set) {
            return allowed;
        }
        if (typeof allowed === 'string') {
            return new Set([allowed]);
        }
        return null;
    }

    // ============================================
    //  PUBLIC API
    // ============================================

    window.VimModeManager = {
        registerMode: registerMode,
        enterMode: enterMode,
        exitMode: exitMode,
        handleKeyPress: handleKeyPress,
        getCurrentMode: () => window.VimState.mode,
        getModeRegistry: () => ({ ...modeRegistry }),
        setBaseMode,
        getBaseMode
    };

    if (window.VimConfig.debug) {
        console.log('VimModeManager: Mode manager initialized');
    }

})();

