/* ============================================
   VIM EXTENSION - FOCUS MANAGER
   Manages scoped navigation contexts
   ============================================ */

(function() {
    'use strict';

    if (!window.VimState) {
        console.error('VimFocus: VimState not initialized');
        return;
    }

    const stack = window.VimState.focusStack;
    let lastHighlighted = null;

    function init() {
        ensureBaseScope();
        ensureOverlay();
        updateOverlay();

        if (!window._vimFocusListenersAttached) {
            window.addEventListener('resize', updateOverlay, { passive: true });
            window.addEventListener('scroll', handleScroll, true);
            window._vimFocusListenersAttached = true;
        }
    }

    function ensureBaseScope() {
        const body = document.body;
        if (!body) return;

        if (stack.length === 0) {
            stack.push(createEntry(body, {
                id: 'global',
                type: 'global',
                label: 'Whole Page',
                persistent: true
            }));
        } else {
            // Always keep base reference in sync with body
            stack[0].element = body;
        }
    }

    function createEntry(element, options = {}) {
        if (!element) {
            element = document.body;
        }

        return {
            element,
            id: options.id || null,
            type: options.type || 'custom',
            label: options.label || deriveLabel(element),
            persistent: !!options.persistent,
            metadata: options.metadata || {}
        };
    }

    function deriveLabel(element) {
        if (!element || element === document.body) {
            return 'Whole Page';
        }

        const datasetLabel = element.dataset && (element.dataset.vimLabel || element.dataset.label);
        if (datasetLabel) return datasetLabel;

        if (element.getAttribute) {
            const aria = element.getAttribute('aria-label') || element.getAttribute('title');
            if (aria) return aria;
        }

        if (element.id) return `#${element.id}`;
        if (element.classList && element.classList.length) {
            return `${element.tagName.toLowerCase()}.${Array.from(element.classList).slice(0, 2).join('.')}`;
        }

        return element.tagName ? element.tagName.toLowerCase() : 'scope';
    }

    function ensureOverlay() {
        if (!window.VimState.elements.focusOutline) {
            const outline = document.createElement('div');
            outline.className = 'vim-focus-outline';
            document.body.appendChild(outline);
            window.VimState.elements.focusOutline = outline;
        }
    }

    function getCurrentEntry() {
        ensureBaseScope();
        return stack[stack.length - 1];
    }

    function getScopeElement() {
        const entry = getCurrentEntry();
        return entry ? entry.element || document.body : document.body;
    }

    function isGlobalScope() {
        return getScopeElement() === document.body;
    }

    function updateOverlay() {
        ensureBaseScope();
        ensureOverlay();

        const outline = window.VimState.elements.focusOutline;
        const entry = getCurrentEntry();
        const scope = entry.element;

        if (scope && scope !== document.body && !document.body.contains(scope)) {
            if (stack.length > 1) {
                stack.pop();
                updateOverlay();
                return;
            }
        }

        if (!scope || scope === document.body) {
            outline.style.display = 'none';
            outline.removeAttribute('data-focus-label');
            if (lastHighlighted) {
                lastHighlighted.classList.remove('vim-focus-active-scope');
                lastHighlighted = null;
            }
            applyScopeMode(null);
            return;
        }

        const rect = scope.getBoundingClientRect();
        outline.style.display = 'block';
        outline.style.left = `${rect.left + window.scrollX}px`;
        outline.style.top = `${rect.top + window.scrollY}px`;
        outline.style.width = `${rect.width}px`;
        outline.style.height = `${rect.height}px`;
        outline.setAttribute('data-focus-label', entry && entry.label ? entry.label : 'Focused scope');

        if (lastHighlighted && lastHighlighted !== scope) {
            lastHighlighted.classList.remove('vim-focus-active-scope');
        }

        scope.classList.add('vim-focus-active-scope');
        lastHighlighted = scope;

        applyScopeMode(scope);
        return;
    }

    function applyScopeMode(scope) {
        if (!window.VimModeManager || typeof window.VimModeManager.setBaseMode !== 'function') {
            return;
        }

        let descriptor = null;
        if (scope && scope.dataset && scope.dataset.vimMode) {
            descriptor = scope.dataset.vimMode;
        }

        let desiredMode = 'normal';
        if (window.VimModePresets && typeof window.VimModePresets.resolveMode === 'function') {
            desiredMode = window.VimModePresets.resolveMode(descriptor);
        } else if (descriptor) {
            desiredMode = descriptor;
        }

        if (!desiredMode) {
            desiredMode = 'normal';
        }

        const currentBase = window.VimModeManager.getBaseMode ? window.VimModeManager.getBaseMode() : window.VimState.baseMode;
        if (currentBase !== desiredMode) {
            window.VimModeManager.setBaseMode(desiredMode);
        }
    }

    function handleScroll() {
        if (!isGlobalScope()) {
            updateOverlay();
        }
    }

    function pushScope(element, options = {}) {
        ensureBaseScope();
        const safeElement = element || document.body;

        // Avoid duplicates by removing existing entry for same element
        const existingIndex = stack.findIndex(entry => entry.element === safeElement);
        if (existingIndex !== -1) {
            stack.splice(existingIndex, 1);
        }

        const entry = createEntry(safeElement, options);
        stack.push(entry);
        updateOverlay();
        return entry.element;
    }

    function replaceScope(element, options = {}) {
        ensureBaseScope();
        const base = stack[0];
        stack.length = 1;
        if (element && element !== document.body) {
            stack.push(createEntry(element, options));
        }
        updateOverlay();
        return getScopeElement();
    }

    function popScope(predicate) {
        ensureBaseScope();
        if (stack.length <= 1) {
            return document.body;
        }

        if (!predicate) {
            stack.pop();
        } else {
            const index = typeof predicate === 'function'
                ? stack.findIndex(predicate)
                : stack.findIndex(entry => entry.id === predicate);

            if (index > 0) {
                stack.splice(index, stack.length - index);
            }
        }

        updateOverlay();
        return getScopeElement();
    }

    function resetToGlobal() {
        replaceScope(document.body, { type: 'global', label: 'Whole Page' });
    }

    function getStack() {
        return stack.slice();
    }

    function getScopeLabel() {
        const entry = getCurrentEntry();
        return entry ? entry.label : 'Whole Page';
    }

    window.VimFocus = {
        init,
        getScopeElement,
        getCurrentEntry,
        isGlobalScope,
        pushScope,
        replaceScope,
        popScope,
        resetToGlobal,
        updateOverlay,
        getStack,
        getScopeLabel
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

})();


