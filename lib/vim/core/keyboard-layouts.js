(function() {
    'use strict';

    if (!window.VimState) {
        console.error('VimKeyboard: VimState not initialized');
        return;
    }

    const layouts = new Map();
    const aliases = new Map();
    const layoutStack = [];

    let activeLayout = 'default';

    function normalizeName(name) {
        if (!name) return null;
        return name.toString().trim().toLowerCase();
    }

    function registerLayout(name, mapping) {
        const normalized = normalizeName(name);
        if (!normalized) {
            console.warn('VimKeyboard: Cannot register layout with empty name');
            return;
        }

        layouts.set(normalized, sanitizeMapping(mapping));
    }

    function aliasLayout(alias, target) {
        const normalizedAlias = normalizeName(alias);
        const normalizedTarget = normalizeName(target);
        if (!normalizedAlias || !normalizedTarget) return;
        aliases.set(normalizedAlias, normalizedTarget);
    }

    function sanitizeMapping(mapping) {
        const sanitized = {};
        if (!mapping) return sanitized;

        Object.keys(mapping).forEach(code => {
            const entry = mapping[code];
            if (!entry) return;
            if (typeof entry === 'string') {
                sanitized[code] = { normal: entry };
                return;
            }
            sanitized[code] = {
                normal: entry.normal !== undefined ? entry.normal : '',
                shift: entry.shift !== undefined ? entry.shift : entry.normal,
                altGr: entry.altGr !== undefined ? entry.altGr : null
            };
        });

        return sanitized;
    }

    function resolveLayoutName(name) {
        const normalized = normalizeName(name) || activeLayout;
        if (layouts.has(normalized)) {
            return normalized;
        }
        if (aliases.has(normalized)) {
            const target = aliases.get(normalized);
            if (layouts.has(target)) {
                return target;
            }
        }
        return 'default';
    }

    function setActiveLayout(name) {
        const resolved = resolveLayoutName(name);
        activeLayout = resolved;
        window.VimState.activeLayout = resolved;
        return activeLayout;
    }

    function pushLayout(name) {
        layoutStack.push(activeLayout);
        return setActiveLayout(name);
    }

    function popLayout() {
        if (layoutStack.length === 0) return activeLayout;
        const previous = layoutStack.pop();
        return setActiveLayout(previous);
    }

    function getActiveLayout() {
        return activeLayout;
    }

    function getLayout(name) {
        const resolved = resolveLayoutName(name);
        return layouts.get(resolved) || layouts.get('default');
    }

    function translateKey(event, options = {}) {
        if (!event) return '';

        if (event.ctrlKey || event.metaKey) {
            return '';
        }

        const layoutName = options.layout ? resolveLayoutName(options.layout) : activeLayout;
        const layout = layouts.get(layoutName) || layouts.get('default');
        const code = event.code;
        const entry = layout[code];

        if (entry) {
            if (event.getModifierState && event.getModifierState('AltGraph') && entry.altGr) {
                return entry.altGr;
            }
            if (event.shiftKey && entry.shift !== undefined) {
                return entry.shift !== null ? entry.shift : entry.normal;
            }
            return entry.normal !== undefined ? entry.normal : '';
        }

        if (code === 'Space') return ' ';
        if (code === 'Enter') return '\n';
        if (code === 'Tab') return '\t';

        if (event.key && event.key.length === 1) {
            return event.key;
        }

        return '';
    }

    function determineLayoutForElement(element) {
        let node = element;
        while (node) {
            if (node.dataset && node.dataset.vimLayout) {
                return resolveLayoutName(node.dataset.vimLayout);
            }
            node = node.parentElement;
        }
        return activeLayout;
    }

    function listLayouts() {
        return Array.from(layouts.keys());
    }

    function withLayout(name, fn) {
        pushLayout(name);
        try {
            return fn();
        } finally {
            popLayout();
        }
    }

    function initializeDefaults() {
        registerLayout('default', createDefaultLayout());
        registerLayout('greek', createGreekLayout());
        registerLayout('danish', createDanishLayout());

        aliasLayout('us', 'default');
        aliasLayout('en', 'default');

        setActiveLayout('default');
    }

    function createDefaultLayout() {
        const map = {};

        function set(code, normal, shift, altGr) {
            map[code] = { normal, shift, altGr: altGr || null };
        }

        const letters = [
            ['KeyA', 'a', 'A'], ['KeyB', 'b', 'B'], ['KeyC', 'c', 'C'], ['KeyD', 'd', 'D'],
            ['KeyE', 'e', 'E'], ['KeyF', 'f', 'F'], ['KeyG', 'g', 'G'], ['KeyH', 'h', 'H'],
            ['KeyI', 'i', 'I'], ['KeyJ', 'j', 'J'], ['KeyK', 'k', 'K'], ['KeyL', 'l', 'L'],
            ['KeyM', 'm', 'M'], ['KeyN', 'n', 'N'], ['KeyO', 'o', 'O'], ['KeyP', 'p', 'P'],
            ['KeyQ', 'q', 'Q'], ['KeyR', 'r', 'R'], ['KeyS', 's', 'S'], ['KeyT', 't', 'T'],
            ['KeyU', 'u', 'U'], ['KeyV', 'v', 'V'], ['KeyW', 'w', 'W'], ['KeyX', 'x', 'X'],
            ['KeyY', 'y', 'Y'], ['KeyZ', 'z', 'Z']
        ];

        letters.forEach(([code, normal, shift]) => set(code, normal, shift));

        const digits = [
            ['Digit1', '1', '!'], ['Digit2', '2', '@'], ['Digit3', '3', '#'], ['Digit4', '4', '$'],
            ['Digit5', '5', '%'], ['Digit6', '6', '^'], ['Digit7', '7', '&'], ['Digit8', '8', '*'],
            ['Digit9', '9', '('], ['Digit0', '0', ')']
        ];
        digits.forEach(([code, normal, shift]) => set(code, normal, shift));

        set('Minus', '-', '_');
        set('Equal', '=', '+');
        set('BracketLeft', '[', '{');
        set('BracketRight', ']', '}');
        set('Backslash', '\\', '|');
        set('Semicolon', ';', ':');
        set('Quote', "'", '"');
        set('Comma', ',', '<');
        set('Period', '.', '>');
        set('Slash', '/', '?');
        set('Backquote', '`', '~');
        set('Space', ' ');
        set('Enter', '\n');
        set('Tab', '\t');

        return map;
    }

    function createGreekLayout() {
        const base = createDefaultLayout();
        const replacements = {
            KeyA: { normal: 'α', shift: 'Α' },
            KeyB: { normal: 'β', shift: 'Β' },
            KeyG: { normal: 'γ', shift: 'Γ' },
            KeyD: { normal: 'δ', shift: 'Δ' },
            KeyE: { normal: 'ε', shift: 'Ε' },
            KeyZ: { normal: 'ζ', shift: 'Ζ' },
            KeyH: { normal: 'η', shift: 'Η' },
            KeyU: { normal: 'θ', shift: 'Θ' },
            KeyI: { normal: 'ι', shift: 'Ι' },
            KeyK: { normal: 'κ', shift: 'Κ' },
            KeyL: { normal: 'λ', shift: 'Λ' },
            KeyM: { normal: 'μ', shift: 'Μ' },
            KeyN: { normal: 'ν', shift: 'Ν' },
            KeyJ: { normal: 'ξ', shift: 'Ξ' },
            KeyO: { normal: 'ο', shift: 'Ο' },
            KeyP: { normal: 'π', shift: 'Π' },
            KeyR: { normal: 'ρ', shift: 'Ρ' },
            KeyS: { normal: 'σ', shift: 'Σ', altGr: 'ς' },
            KeyT: { normal: 'τ', shift: 'Τ' },
            KeyF: { normal: 'φ', shift: 'Φ' },
            KeyX: { normal: 'χ', shift: 'Χ' },
            KeyC: { normal: 'ψ', shift: 'Ψ' },
            KeyV: { normal: 'ω', shift: 'Ω' },
            KeyY: { normal: 'υ', shift: 'Υ' }
        };

        return Object.assign(base, replacements);
    }

    function createDanishLayout() {
        const base = createDefaultLayout();
        const replacements = {
            Semicolon: { normal: 'ø', shift: 'Ø' },
            Quote: { normal: 'æ', shift: 'Æ' },
            BracketLeft: { normal: 'å', shift: 'Å' },
            BracketRight: { normal: '¨', shift: '^' },
            Backslash: { normal: "'", shift: '*' },
            Minus: { normal: '+', shift: '?' },
            Equal: { normal: '´', shift: '`' }
        };

        return Object.assign(base, replacements);
    }

    initializeDefaults();

    window.VimKeyboard = {
        registerLayout,
        aliasLayout,
        setActiveLayout,
        getActiveLayout,
        pushLayout,
        popLayout,
        translateKey,
        determineLayoutForElement,
        listLayouts,
        withLayout,
        getLayout
    };

})();


