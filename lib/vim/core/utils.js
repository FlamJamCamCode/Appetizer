/* ============================================
   VIM EXTENSION - UTILITY FUNCTIONS
   Shared utilities used across modes
   ============================================ */

window.VimUtils = {
    
    // ============================================
    //  INPUT DETECTION
    // ============================================
    
    isTypingInInput(e) {
        if (!e || !e.target) return false;

        const target = e.target;
        const tag = target.tagName;
        const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
        const isContentEditable = target.isContentEditable;
        const isVimBox = target.classList && (target.classList.contains('vim-search-input') ||
            target.classList.contains('vim-filter-input') ||
            target.closest('.vim-link-hint-container'));

        if (isVimBox) return false;

        return isInput || isContentEditable;
    },

    getEscapeChordConfig() {
        const cfg = (window.VimConfig && window.VimConfig.escapeChord) || {};
        const comboRaw = typeof cfg.combo === 'string'
            ? cfg.combo.trim().toLowerCase()
            : (typeof cfg.keys === 'string' ? cfg.keys.trim().toLowerCase() : '');
        const combo = comboRaw && comboRaw.length > 0 ? comboRaw : 'ee';
        const normalized = combo.replace(/\s+/g, '');
        const firstKey = normalized.charAt(0) || 'e';
        const secondKey = normalized.length > 1 ? normalized.charAt(1) : firstKey;

        return {
            enabled: cfg.enabled !== false,
            combo: normalized || 'ee',
            delay: typeof cfg.delay === 'number' ? cfg.delay : 160,
            restoreInput: cfg.restoreInput !== false,
            firstKey,
            secondKey
        };
    },

    resetEscapeChordState() {
        if (!window.VimState || !window.VimState.escapeChord) {
            return;
        }

        window.VimState.escapeChord.firstKeyTime = 0;
        window.VimState.escapeChord.firstKeyValue = '';
        window.VimState.escapeChord.target = null;
        window.VimState.escapeChord.snapshot = null;
    },

    handleEscapeChord(options = {}) {
        const {
            event,
            eventTime = Date.now(),
            enabled = true,
            onEscape,
            captureTarget = null,
            requireTarget = null,
            restoreSnapshot = true
        } = options;

        if (!event || !enabled) {
            return false;
        }

        const cfg = window.VimUtils.getEscapeChordConfig();
        if (!cfg.enabled) {
            return false;
        }

        const keyRaw = event.key;
        const key = typeof keyRaw === 'string' && keyRaw.length === 1
            ? keyRaw.toLowerCase()
            : null;

        if (!key) {
            window.VimUtils.resetEscapeChordState();
            return false;
        }

        const state = window.VimState.escapeChord;
        const firstKey = cfg.firstKey;
        const secondKey = cfg.secondKey;
        const delay = cfg.delay;

        if (state.firstKeyTime && (eventTime - state.firstKeyTime > delay)) {
            window.VimUtils.resetEscapeChordState();
        }

        const hasPendingFirst = state.firstKeyTime > 0 && state.firstKeyValue === firstKey;

        if (hasPendingFirst && key === secondKey) {
            if (requireTarget && state.target && state.target !== requireTarget) {
                window.VimUtils.resetEscapeChordState();
                return false;
            }

            event.preventDefault();

            if (restoreSnapshot && cfg.restoreInput !== false && state.snapshot && state.target) {
                window.VimUtils.restoreInputSnapshot(state.target, state.snapshot);
            }

            window.VimUtils.resetEscapeChordState();

            if (typeof onEscape === 'function') {
                onEscape();
            }

            return true;
        }

        if (key === firstKey) {
            state.firstKeyTime = eventTime;
            state.firstKeyValue = firstKey;

            if (captureTarget) {
                state.target = captureTarget;
                if (cfg.restoreInput !== false) {
                    state.snapshot = window.VimUtils.captureInputSnapshot(captureTarget);
                } else {
                    state.snapshot = null;
                }
            } else {
                state.target = null;
                state.snapshot = null;
            }

            return false;
        }

        if (state.firstKeyTime) {
            window.VimUtils.resetEscapeChordState();
        }

        return false;
    },

    // ============================================
    //  TEXT UTILITIES
    // ============================================
    
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    highlightTextInElement(element, searchTerm, results) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    if (node.parentElement.tagName === 'SCRIPT' || 
                        node.parentElement.tagName === 'STYLE') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodesToProcess = [];
        let node;
        while (node = walker.nextNode()) {
            nodesToProcess.push(node);
        }

        nodesToProcess.forEach(textNode => {
            const text = textNode.textContent;
            const regex = new RegExp(window.VimUtils.escapeRegex(searchTerm), 'gi');
            let match;
            const matches = [];

            while (match = regex.exec(text)) {
                matches.push(match);
            }

            if (matches.length > 0) {
                const parent = textNode.parentElement;
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;

                matches.forEach(match => {
                    if (match.index > lastIndex) {
                        fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
                    }

                    const mark = document.createElement('mark');
                    mark.className = 'vim-search-highlight';
                    mark.textContent = match[0];
                    fragment.appendChild(mark);
                    results.push(mark);

                    lastIndex = match.index + match[0].length;
                });

                if (lastIndex < text.length) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
                }

                parent.replaceChild(fragment, textNode);
            }
        });
    },

    clearSearchHighlights() {
        document.querySelectorAll('.vim-search-highlight').forEach(mark => {
            const text = mark.textContent;
            mark.replaceWith(text);
        });
    },

    // ============================================
    //  LINK HINT GENERATION
    // ============================================
    
    generateHintLabels(count) {
        const chars = window.VimConfig.linkHintChars.split('');
        const labels = [];
        
        for (let i = 0; i < count; i++) {
            let label = '';
            let num = i;
            
            do {
                label = chars[num % chars.length] + label;
                num = Math.floor(num / chars.length) - 1;
            } while (num >= 0);
            
            labels.push(label);
        }
        
        return labels;
    },

    updateLinkHints(matchingHints, currentInput) {
        window.VimState.linkHints.forEach(hint => {
            if (matchingHints.includes(hint)) {
                hint.hintElement.style.display = 'block';
                
                const matched = currentInput;
                const remaining = hint.label.substring(matched.length);
                hint.hintElement.innerHTML = `<span class="vim-hint-matched">${matched}</span>${remaining}`;
            } else {
                hint.hintElement.style.display = 'none';
            }
        });
    },

    // ============================================
    //  DOM UTILITIES
    // ============================================
    
    scrollIntoView(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    },

    getFocusRoot() {
        if (window.VimFocus && typeof window.VimFocus.getScopeElement === 'function') {
            return window.VimFocus.getScopeElement();
        }
        return document.body;
    },

    isGlobalScope() {
        return !window.VimFocus || window.VimFocus.isGlobalScope();
    },

    getActivePanel() {
        if (window.LobbyTabs) {
            const panels = document.querySelectorAll('.content-panel');
            return panels[window.LobbyTabs.getCurrentTab()];
        }
        return null;
    },

    // ============================================
    //  INPUT SNAPSHOT HELPERS
    // ============================================

    captureInputSnapshot(element) {
        if (!element) return null;

        if ('value' in element) {
            return {
                type: 'value',
                value: element.value,
                selectionStart: element.selectionStart,
                selectionEnd: element.selectionEnd
            };
        }

        if (element.isContentEditable) {
            return {
                type: 'contentEditable',
                value: element.innerHTML
            };
        }

        return null;
    },

    restoreInputSnapshot(element, snapshot) {
        if (!element || !snapshot) return;

        if (snapshot.type === 'value' && 'value' in element) {
            element.value = snapshot.value;
            if (typeof snapshot.selectionStart === 'number' && typeof snapshot.selectionEnd === 'number') {
                try {
                    element.setSelectionRange(snapshot.selectionStart, snapshot.selectionEnd);
                } catch (err) {
                    // ignore selection errors on unsupported elements
                }
            }
        } else if (snapshot.type === 'contentEditable' && element.isContentEditable) {
            element.innerHTML = snapshot.value;
        }
    }
};

if (window.VimConfig.debug) {
    console.log('VimUtils: Utilities loaded');
}

