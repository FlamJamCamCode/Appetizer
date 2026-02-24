/* ============================================
   VIM EXTENSION - MODE PRESETS
   Composable behaviours for scope-aware normal modes
   ============================================ */

(function() {
    'use strict';

    if (!window.VimModeManager) {
        console.error('VimModePresets: VimModeManager not loaded');
        return;
    }

    const behaviours = {
        default: createDefaultNavigationBehaviour,
        tab: createTabNavigationBehaviour,
        segment: createSegmentScrollBehaviour,
        grid: createGridNavigationBehaviour
    };

    const DEFAULT_SCROLL = {
        tapDistance: 24,
        chunkDistance: 80,
        holdDelay: 160,
        velocity: 600,
        chunkVelocity: 900,
        horizontalVelocity: 500
    };

    const scrollState = {
        activeKeyCode: null,
        activeKeyValue: null,
        direction: 0,
        target: null,
        rafId: null,
        delayId: null,
        lastTimestamp: 0,
        listenersAttached: false,
        axis: 'vertical',
        velocity: DEFAULT_SCROLL.velocity,
        holdDelay: DEFAULT_SCROLL.holdDelay
    };

    const presetCache = new Map();
    let defaultPresetName = 'normal';

    function normalizeComponent(name) {
        if (!name) return null;
        const normalized = name.toString().toLowerCase().trim();
        if (!normalized) return null;

        switch (normalized) {
            case 'default':
            case 'defaultnavigation':
            case 'navigation':
                return 'default';
            case 'tab':
            case 'tabs':
            case 'tabnavigation':
                return 'tab';
            case 'segment':
            case 'segments':
            case 'segmentscroll':
            case 'scrollsegments':
                return 'segment';
            case 'grid':
            case 'table':
            case 'matrix':
            case '2d':
            case 'two-d':
            case 'two-dimensional':
                return 'grid';
            default:
                return behaviours[normalized] ? normalized : null;
        }
    }

    function composeBehaviour(parts) {
        const combined = {
            keybindings: {},
            allowTyping: false,
            allowedKeys: new Set(),
            onEnter: null,
            onExit: null,
            isInputFocused: null,
            escapeChord: true
        };

        parts.forEach(part => {
            const factory = behaviours[part];
            if (!factory) return;
            const behaviour = factory();
            if (!behaviour) return;

            if (behaviour.keybindings) {
                Object.assign(combined.keybindings, behaviour.keybindings);
            }

            if (behaviour.allowTyping) {
                combined.allowTyping = true;
            }

            if (behaviour.allowedKeys && behaviour.allowedKeys.length) {
                behaviour.allowedKeys.forEach(key => combined.allowedKeys.add(key));
            }

            if (typeof behaviour.onEnter === 'function') {
                combined.onEnter = chainHandlers(combined.onEnter, behaviour.onEnter);
            }

            if (typeof behaviour.onExit === 'function') {
                combined.onExit = chainHandlers(combined.onExit, behaviour.onExit);
            }

            if (typeof behaviour.isInputFocused === 'function') {
                combined.isInputFocused = mergePredicates(combined.isInputFocused, behaviour.isInputFocused);
            }

            if (behaviour.escapeChord === false || behaviour.jjEscape === false) {
                combined.escapeChord = false;
            }
        });

        return {
            keybindings: combined.keybindings,
            allowTyping: combined.allowTyping,
            allowedKeys: Array.from(combined.allowedKeys),
            onEnter: combined.onEnter || (() => {}),
            onExit: combined.onExit || (() => {}),
            isInputFocused: combined.isInputFocused || (() => false),
            escapeChord: combined.escapeChord
        };
    }

    function chainHandlers(original, next) {
        if (!original) return next;
        return function chainedHandler(...args) {
            original.apply(this, args);
            next.apply(this, args);
        };
    }

    function mergePredicates(original, next) {
        if (!original) return next;
        return function mergedPredicate(...args) {
            return original.apply(this, args) || next.apply(this, args);
        };
    }

    function buildPresetName(parts, explicitName) {
        if (explicitName) return explicitName;
        return `normal:${parts.join('>')}`;
    }

    function normalizeParts(rawParts) {
        const parts = [];
        if (!rawParts) return parts;

        const list = Array.isArray(rawParts) ? rawParts : [rawParts];
        list.forEach(component => {
            const normalized = normalizeComponent(component);
            if (!normalized) return;
            addPart(parts, normalized);
        });

        return parts;
    }

    function addPart(parts, part) {
        const index = parts.indexOf(part);
        if (index !== -1) {
            parts.splice(index, 1);
        }
        parts.push(part);
    }

    function removePart(parts, part) {
        const index = parts.indexOf(part);
        if (index !== -1) {
            parts.splice(index, 1);
        }
    }

    function parseDescriptor(descriptor) {
        if (!descriptor) return [];
        const tokens = descriptor.match(/[+-]?[a-zA-Z0-9:-]+/g) || [];
        const parts = [];

        tokens.forEach(token => {
            if (!token) return;
            let operation = null;
            let name = token;

            if (token[0] === '+' || token[0] === '-') {
                operation = token[0];
                name = token.slice(1);
            }

            const normalized = normalizeComponent(name);
            if (!normalized) return;

            if (operation === '-') {
                removePart(parts, normalized);
            } else {
                addPart(parts, normalized);
            }
        });

        return parts;
    }

    function ensurePreset(rawParts, options = {}) {
        const parts = normalizeParts(rawParts);

        if (parts.length === 0) {
            return defaultPresetName;
        }

        const key = buildPresetName(parts, options.modeName);

        if (!presetCache.has(key)) {
            const behaviour = composeBehaviour(parts);
            window.VimModeManager.registerMode(key, behaviour);
            presetCache.set(key, behaviour);
        }

        if (options.setAsDefault) {
            defaultPresetName = key;
        }

        return key;
    }

    function resolveMode(descriptor) {
        const raw = (descriptor || '').trim();
        if (!raw) {
            return defaultPresetName;
        }

        const registry = window.VimModeManager.getModeRegistry();

        if (registry[raw]) {
            return raw;
        }

        const parts = parseDescriptor(raw);
        if (parts.length === 0) {
            if (registry[raw]) {
                return raw;
            }
            return defaultPresetName;
        }

        return ensurePreset(parts);
    }

    function getDefaultPresetName() {
        return defaultPresetName;
    }

    /* ---------------------------------------------
       Behaviour factories
       --------------------------------------------- */

    function getScrollConfig() {
        const cfg = (window.VimConfig && window.VimConfig.scroll) || {};
        return {
            tapDistance: typeof cfg.tapDistance === 'number' ? cfg.tapDistance : DEFAULT_SCROLL.tapDistance,
            chunkDistance: typeof cfg.chunkDistance === 'number' ? cfg.chunkDistance : DEFAULT_SCROLL.chunkDistance,
            holdDelay: typeof cfg.holdDelay === 'number' ? cfg.holdDelay : DEFAULT_SCROLL.holdDelay,
            velocity: typeof cfg.velocity === 'number' ? cfg.velocity : DEFAULT_SCROLL.velocity,
            chunkVelocity: typeof cfg.chunkVelocity === 'number' ? cfg.chunkVelocity : DEFAULT_SCROLL.chunkVelocity,
            horizontalVelocity: typeof cfg.horizontalVelocity === 'number' ? cfg.horizontalVelocity : DEFAULT_SCROLL.horizontalVelocity
        };
    }

    function ensureScrollListeners() {
        if (scrollState.listenersAttached) return;
        document.addEventListener('keyup', handleScrollKeyUp, true);
        window.addEventListener('blur', cancelContinuousScroll, true);
        document.addEventListener('visibilitychange', handleVisibilityChange, true);
        scrollState.listenersAttached = true;
    }

    function handleVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            cancelContinuousScroll();
        }
    }

    function handleScrollKeyUp(event) {
        if (!scrollState.activeKeyCode && !scrollState.activeKeyValue) {
            return;
        }

        if (event.code === scrollState.activeKeyCode || event.key === scrollState.activeKeyValue) {
            cancelContinuousScroll();
        }
    }

    function cancelContinuousScroll() {
        if (scrollState.delayId) {
            clearTimeout(scrollState.delayId);
            scrollState.delayId = null;
        }
        if (scrollState.rafId) {
            cancelAnimationFrame(scrollState.rafId);
            scrollState.rafId = null;
        }
        scrollState.activeKeyCode = null;
        scrollState.activeKeyValue = null;
        scrollState.direction = 0;
        scrollState.target = null;
        scrollState.lastTimestamp = 0;
        const cfg = getScrollConfig();
        scrollState.axis = 'vertical';
        scrollState.velocity = cfg.velocity;
        scrollState.holdDelay = cfg.holdDelay;
    }

    function startContinuousScroll(event, direction, target, options = {}) {
        cancelContinuousScroll();

        scrollState.activeKeyCode = event.code || null;
        scrollState.activeKeyValue = event.key || null;
        scrollState.direction = direction;
        scrollState.target = target;
        scrollState.lastTimestamp = 0;
        scrollState.axis = options.axis || 'vertical';
        scrollState.velocity = options.velocity || getScrollConfig().velocity;
        scrollState.holdDelay = typeof options.holdDelay === 'number'
            ? options.holdDelay
            : getScrollConfig().holdDelay;

        scrollState.delayId = window.setTimeout(() => {
            if (!scrollState.target) {
                return;
            }
            scrollState.lastTimestamp = performance.now();
            scrollState.rafId = requestAnimationFrame(stepContinuousScroll);
        }, scrollState.holdDelay);
    }

    function stepContinuousScroll(timestamp) {
        if (!scrollState.target || scrollState.direction === 0) {
            cancelContinuousScroll();
            return;
        }

        const docEl = document.scrollingElement || document.documentElement || document.body;
        const isDocumentTarget = scrollState.target === docEl ||
            scrollState.target === document.documentElement ||
            scrollState.target === document.body;

        if (!isDocumentTarget && !document.body.contains(scrollState.target)) {
            cancelContinuousScroll();
            return;
        }

        if (!scrollState.lastTimestamp) {
            scrollState.lastTimestamp = timestamp;
        }

        const deltaMs = timestamp - scrollState.lastTimestamp;
        scrollState.lastTimestamp = timestamp;
        const velocity = scrollState.velocity || getScrollConfig().velocity;
        const distance = (velocity * (deltaMs / 1000)) * scrollState.direction;
        applyScrollDelta(scrollState.target, distance, scrollState.axis);

        scrollState.rafId = requestAnimationFrame(stepContinuousScroll);
    }

    function applyScrollDelta(target, delta, axis = 'vertical') {
        if (!target) return;
        const docEl = document.scrollingElement || document.documentElement || document.body;

        const applyTo = (axis === 'horizontal') ? 'scrollLeft' : 'scrollTop';
        const value = docEl[applyTo] || 0;

        if (target === document.body || target === document.documentElement || target === document.scrollingElement) {
            docEl[applyTo] = value + delta;
            return;
        }

        target[applyTo] += delta;
    }

    function handleVelocityScroll(event, direction, options = {}) {
        if (!event) return;
        event.preventDefault();

        const scope = window.VimFocus ? window.VimFocus.getScopeElement() : document.body;
        const target = getScrollableTarget(scope);

        if (!target) {
            return;
        }

        ensureScrollListeners();
        const cfg = getScrollConfig();

        const step = typeof options.step === 'number'
            ? options.step
            : cfg.tapDistance;
        const axis = options.axis || 'vertical';
        const velocity = typeof options.velocity === 'number'
            ? options.velocity
            : cfg.velocity;
        const holdDelay = typeof options.holdDelay === 'number' ? options.holdDelay : cfg.holdDelay;

        if (!event.repeat) {
            applyScrollDelta(target, step * direction, axis);
            startContinuousScroll(event, direction, target, {
                axis,
                velocity,
                holdDelay
            });
        }
    }

    function createDefaultNavigationBehaviour() {
        return {
            keybindings: {
                'j': (event) => handleVelocityScroll(event, 1),
                'k': (event) => handleVelocityScroll(event, -1),
                'd': (event) => {
                    const cfg = getScrollConfig();
                    handleVelocityScroll(event, 1, { step: cfg.chunkDistance, velocity: cfg.chunkVelocity });
                },
                'u': (event) => {
                    const cfg = getScrollConfig();
                    handleVelocityScroll(event, -1, { step: cfg.chunkDistance, velocity: cfg.chunkVelocity });
                },
                'f': () => window.VimModeManager.enterMode('link-hint'),
                '/': () => window.VimModeManager.enterMode('search'),
                '\\': () => window.VimModeManager.enterMode('filter'),
                'O': () => window.VimModeManager.enterMode('file-navigator'),
                'g': () => {
                    if (withinCommandDelay('g')) {
                        window.VimModeManager.enterMode('focus-select');
                    }
                },
                '0': () => {
                    if (withinCommandDelay('g')) {
                        window.VimFocus.resetToGlobal();
                        window.VimFocus.updateOverlay();
                        window.VimModeManager.enterMode(window.VimModeManager.getBaseMode());
                    }
                },
                'i': () => {
                    if (withinCommandDelay('g')) {
                        window.VimModeManager.enterMode('input-focus');
                    }
                },
                'n': () => {
                    if (window.VimState.searchResults.length > 0 && window.SearchMode) {
                        window.SearchMode.jumpToNext();
                    }
                },
                'N': () => {
                    if (window.VimState.searchResults.length > 0 && window.SearchMode) {
                        window.SearchMode.jumpToPrevious();
                    }
                },
                'Escape': () => {
                    if (window.VimFocus && !window.VimFocus.isGlobalScope()) {
                        window.VimFocus.popScope();
                        window.VimFocus.updateOverlay();
                    } else {
                        window.VimUtils.clearSearchHighlights();
                        window.VimState.searchResults = [];
                    }
                }
            }
            ,
            onExit: () => cancelContinuousScroll()
        };
    }

    function createTabNavigationBehaviour() {
        return {
            keybindings: {
                'h': () => {
                    if (window.VimUtils.isGlobalScope() && window.LobbyTabs && window.LobbyTabs.getCurrentTab() > 0) {
                        window.LobbyTabs.switchToTab(window.LobbyTabs.getCurrentTab() - 1);
                    } else {
                        scrollHorizontally(-0.4);
                    }
                },
                'l': () => {
                    if (window.VimUtils.isGlobalScope() && window.LobbyTabs && window.LobbyTabs.getCurrentTab() < window.LobbyTabs.getTotalTabs() - 1) {
                        window.LobbyTabs.switchToTab(window.LobbyTabs.getCurrentTab() + 1);
                    } else {
                        scrollHorizontally(0.4);
                    }
                },
                '1': () => jumpToTab(0),
                '2': () => jumpToTab(1),
                '3': () => jumpToTab(2),
                '4': () => jumpToTab(3),
                '5': () => jumpToTab(4),
                '6': () => jumpToTab(5),
                '7': () => jumpToTab(6),
                '8': () => jumpToTab(7),
                '9': () => jumpToTab(8)
            }
        };
    }

    function createSegmentScrollBehaviour() {
        return {
            keybindings: {
                'J': () => jumpSegments(1),
                'K': () => jumpSegments(-1),
                'D': () => jumpSegments(3),
                'U': () => jumpSegments(-3)
            }
        };
    }

    function createGridNavigationBehaviour() {
        return {
            keybindings: {
                'h': () => moveGridCursor(-1, 0),
                'l': () => moveGridCursor(1, 0),
                'k': () => moveGridCursor(0, -1),
                'j': () => moveGridCursor(0, 1),
                'H': () => moveGridToEdge('left'),
                'L': () => moveGridToEdge('right'),
                'K': () => moveGridToEdge('up'),
                'J': () => moveGridToEdge('down'),
                'Enter': () => activateGridCell(),
                'Space': () => activateGridCell()
            },
            onEnter: () => prepareGridState(),
            onExit: () => resetGridState()
        };
    }

    /* ---------------------------------------------
       Helper utilities for behaviours
       --------------------------------------------- */

    function withinCommandDelay(expectedPrevKey) {
        if (expectedPrevKey && window.VimState.prevKey !== expectedPrevKey) {
            return false;
        }
        const elapsed = window.VimState.lastKeyTime - window.VimState.prevKeyTime;
        return elapsed >= 0 && elapsed <= window.VimConfig.commandDelay;
    }

    function getScrollableTarget(scope) {
        const docEl = document.scrollingElement || document.documentElement || document.body;
        let node = scope || document.body;

        while (node && node !== document.body) {
            const canScrollVert = node.scrollHeight - node.clientHeight > 4;
            const canScrollHorz = node.scrollWidth - node.clientWidth > 4;
            if (canScrollVert || canScrollHorz) {
                return node;
            }
            node = node.parentElement;
        }

        return docEl;
    }

    function scrollByPixels(deltaY, deltaX = 0) {
        const scope = window.VimFocus ? window.VimFocus.getScopeElement() : document.body;
        const target = getScrollableTarget(scope);
        target.scrollBy({
            top: deltaY,
            left: deltaX,
            behavior: 'smooth'
        });
    }

    function scrollHorizontally(ratio) {
        const scope = window.VimFocus ? window.VimFocus.getScopeElement() : document.body;
        const target = getScrollableTarget(scope);
        const distance = target.clientWidth * ratio;
        target.scrollBy({
            left: distance,
            behavior: 'smooth'
        });
    }

    function jumpSegments(step) {
        const count = Math.max(1, Math.abs(step));
        const direction = Math.sign(step) || 1;

        if (window.VimUtils.isGlobalScope() && window.LobbyTabs) {
            for (let i = 0; i < count; i++) {
                if (direction > 0) {
                    window.LobbyTabs.scrollToNextSection();
                } else {
                    window.LobbyTabs.scrollToPreviousSection();
                }
            }
            return;
        }

        const scope = window.VimFocus ? window.VimFocus.getScopeElement() : document.body;
        const target = getScrollableTarget(scope);
        const distance = target.clientHeight * direction * count;
        target.scrollBy({
            top: distance,
            behavior: 'smooth'
        });
    }

    function jumpToTab(index) {
        if (!window.VimUtils.isGlobalScope() || !window.LobbyTabs) return;
        if (index >= 0 && index < window.LobbyTabs.getTotalTabs()) {
            window.LobbyTabs.switchToTab(index);
        }
    }

    function prepareGridState() {
        buildGridState(window.VimFocus ? window.VimFocus.getScopeElement() : document.body);
    }

    function resetGridState() {
        const state = window.VimState.gridNavigation;
        if (!state) return;
        state.active = false;
        state.cells = [];
        state.columns = 0;
        state.rows = 0;
        state.index = -1;
    }

    function getGridState(rebuildIfNeeded = true) {
        const state = window.VimState.gridNavigation;
        if (!state) return null;

        if ((!state.active || state.cells.length === 0) && rebuildIfNeeded) {
            buildGridState(window.VimFocus ? window.VimFocus.getScopeElement() : document.body);
        }

        if (!state.active || state.cells.length === 0) {
            return null;
        }

        return state;
    }

    function buildGridState(scope) {
        const state = window.VimState.gridNavigation;
        if (!state) return;

        const cells = collectGridCells(scope);
        state.cells = cells;
        state.rows = cells.reduce((max, cell) => Math.max(max, cell.row + 1), 0);
        state.columns = cells.reduce((max, cell) => Math.max(max, cell.col + 1), 0);
        state.active = cells.length > 0;

        if (!state.active) {
            state.index = -1;
            return;
        }

        const activeElement = document.activeElement;
        const currentIndex = cells.findIndex(cell => cell.element === activeElement);
        state.index = currentIndex >= 0 ? currentIndex : 0;

        if (state.index >= 0 && state.index < cells.length) {
            focusGridCell(state.index, { scroll: false });
        }
    }

    function collectGridCells(scope) {
        const root = resolveGridRoot(scope);
        if (!root) return [];

        if (root.tagName === 'TABLE') {
            return collectTableCells(root);
        }

        return collectGenericGridCells(root);
    }

    function resolveGridRoot(scope) {
        if (!scope) scope = document.body;
        if (scope.matches && scope.matches('[data-vim-grid], table, [role="grid"]')) {
            return scope;
        }
        return scope.querySelector('[data-vim-grid], table, [role="grid"]');
    }

    function collectTableCells(table) {
        const cells = [];
        const rows = Array.from(table.querySelectorAll('tr'));
        rows.forEach((rowElement, rowIndex) => {
            if (!isVisible(rowElement)) return;
            const columns = Array.from(rowElement.querySelectorAll('th, td'));
            columns.forEach((cellElement, colIndex) => {
                if (!isVisible(cellElement)) return;
                const target = resolveFocusable(cellElement);
                if (!target) return;
                cells.push({ element: target, row: rowIndex, col: colIndex });
            });
        });
        return cells;
    }

    function collectGenericGridCells(root) {
        const selectors = root.dataset && root.dataset.vimGridSelector
            ? root.dataset.vimGridSelector
            : '[data-vim-grid-cell], [role="gridcell"], button, a, [tabindex]:not([tabindex="-1"])';

        const candidates = Array.from(root.querySelectorAll(selectors)).filter(isVisible);
        const grouped = groupCellsByRow(candidates);

        const cells = [];
        grouped.forEach((row, rowIndex) => {
            row.forEach((element, colIndex) => {
                const target = resolveFocusable(element);
                if (!target) return;
                cells.push({ element: target, row: rowIndex, col: colIndex });
            });
        });

        return cells;
    }

    function groupCellsByRow(elements) {
        const sorted = elements.slice().sort((a, b) => {
            const rectA = a.getBoundingClientRect();
            const rectB = b.getBoundingClientRect();
            if (Math.abs(rectA.top - rectB.top) > 6) {
                return rectA.top - rectB.top;
            }
            return rectA.left - rectB.left;
        });

        const rows = [];
        let currentRow = [];
        let currentTop = null;

        sorted.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (currentRow.length === 0) {
                currentRow.push(element);
                currentTop = rect.top;
                return;
            }

            if (Math.abs(rect.top - currentTop) <= 10) {
                currentRow.push(element);
            } else {
                rows.push(currentRow.slice().sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left));
                currentRow = [element];
                currentTop = rect.top;
            }
        });

        if (currentRow.length > 0) {
            rows.push(currentRow.slice().sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left));
        }

        return rows;
    }

    function isVisible(element) {
        if (!element) return false;
        if (element.closest && element.closest('.vim-link-hint-container')) return false;
        const style = window.getComputedStyle(element);
        if (style.visibility === 'hidden' || style.display === 'none' || parseFloat(style.opacity) === 0) {
            return false;
        }
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    function resolveFocusable(element) {
        if (!element) return null;
        if (isFocusable(element)) return element;
        const focusable = element.querySelector('[tabindex]:not([tabindex="-1"]), button, a, input, select, textarea, [role="button"], [role="menuitem"], [role="gridcell"]');
        return focusable || element;
    }

    function isFocusable(element) {
        if (!element) return false;
        if (element.tabIndex >= 0) return true;
        const tag = element.tagName;
        return tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
    }

    function moveGridCursor(deltaCol, deltaRow) {
        const state = getGridState();
        if (!state) return;

        const current = state.cells[state.index];
        if (!current) return;

        const targetRow = current.row + deltaRow;
        const targetCol = current.col + deltaCol;
        focusNearestCell(state, targetRow, targetCol);
    }

    function moveGridToEdge(direction) {
        const state = getGridState();
        if (!state) return;

        const current = state.cells[state.index];
        if (!current) return;

        let targetRow = current.row;
        let targetCol = current.col;

        switch (direction) {
            case 'left':
                targetCol = 0;
                break;
            case 'right':
                targetCol = state.columns > 0 ? state.columns - 1 : current.col;
                break;
            case 'up':
                targetRow = 0;
                break;
            case 'down':
                targetRow = state.rows > 0 ? state.rows - 1 : current.row;
                break;
        }

        focusNearestCell(state, targetRow, targetCol);
    }

    function focusNearestCell(state, row, col) {
        if (!state || state.cells.length === 0) return;

        const clampedRow = clamp(row, 0, Math.max(0, state.rows - 1));

        const rowCells = state.cells.filter(cell => cell.row === clampedRow);
        if (rowCells.length === 0) return;

        let candidate = rowCells.find(cell => cell.col === col);
        if (!candidate) {
            candidate = rowCells.reduce((closest, cell) => {
                if (!closest) return cell;
                const dist = Math.abs(cell.col - col);
                const bestDist = Math.abs(closest.col - col);
                return dist < bestDist ? cell : closest;
            }, null);
        }

        if (!candidate) return;

        const targetIndex = state.cells.findIndex(cell => cell.element === candidate.element);
        if (targetIndex >= 0) {
            focusGridCell(targetIndex);
        }
    }

    function focusGridCell(index, options = {}) {
        const state = getGridState(false);
        if (!state) return;
        if (index < 0 || index >= state.cells.length) return;

        state.index = index;
        const target = state.cells[index].element;

        if (typeof target.focus === 'function') {
            try {
                target.focus({ preventScroll: true });
            } catch (err) {
                target.focus();
            }
        }

        if (options.scroll !== false) {
            ensureElementVisible(target);
        }
    }

    function ensureElementVisible(element) {
        if (!element || typeof element.scrollIntoView !== 'function') return;
        element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    function activateGridCell() {
        const state = getGridState(false);
        if (!state) return;
        const cell = state.cells[state.index];
        if (!cell) return;
        const target = cell.element;

        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            target.focus();
            return;
        }

        if (typeof target.click === 'function') {
            target.click();
        } else {
            const event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
            target.dispatchEvent(event);
        }
    }

    function clamp(value, min, max) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    /* ---------------------------------------------
       Public API
       --------------------------------------------- */

    const VimModePresets = {
        ensurePreset,
        resolveMode,
        getDefaultPresetName
    };

    window.VimModePresets = VimModePresets;

    // Register the default preset (equivalent to old normal mode)
    ensurePreset(['default', 'tab', 'segment'], {
        modeName: 'normal',
        setAsDefault: true
    });

    // Ensure we start in the default preset
    window.VimModeManager.setBaseMode(getDefaultPresetName());
})();


