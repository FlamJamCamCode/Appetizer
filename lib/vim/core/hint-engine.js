/* ============================================
   VIM EXTENSION - HINT ENGINE
   Shared logic for all hint selector modes
   ============================================ */

(function() {
    'use strict';

    if (!window.VimState || !window.VimUtils) {
        console.error('HintEngine: prerequisites not loaded');
        return;
    }

    const DEFAULT_CONTAINER_CLASS = 'vim-link-hint-container';
    const DEFAULT_HINT_CLASS = 'vim-link-hint';
    const DEFAULT_MATCHED_CLASS = 'vim-hint-matched';

    const state = window.VimState.hintSelector;

    function ensureState() {
        if (!state) {
            throw new Error('HintEngine: VimState.hintSelector missing');
        }
    }

    function start(options) {
        ensureState();
        stop({ silent: true });

        const rawEntries = (options && options.entries) ? options.entries : [];
        const normalized = [];

        rawEntries.forEach((item) => {
            if (!item) return;
            if (item.element) {
                normalized.push({ element: item.element, meta: item.meta || {}, source: item });
            } else {
                normalized.push({ element: item, meta: {}, source: item });
            }
        });

        const candidates = normalized.map((entry) => {
            const el = entry.element;
            if (!el || typeof el.getBoundingClientRect !== 'function') return null;
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return null;
            return {
                element: el,
                rect,
                meta: entry.meta,
                source: entry.source
            };
        }).filter(Boolean);

        if (candidates.length === 0) {
            if (options && typeof options.onCancel === 'function') {
                options.onCancel('empty');
            }
            return false;
        }

        const labels = window.VimUtils.generateHintLabels(candidates.length);

        const container = document.createElement('div');
        container.className = options.containerClass || DEFAULT_CONTAINER_CLASS;
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);

        const hintClass = (options.hintClass || DEFAULT_HINT_CLASS).trim();
        const matchedClass = (options.matchedClass || DEFAULT_MATCHED_CLASS).trim();

        const entries = candidates.map((candidate, index) => {
            const hintElement = document.createElement('div');
            if (hintClass.length > 0) {
                hintClass.split(/\s+/).forEach(cls => hintElement.classList.add(cls));
            }
            const label = labels[index];
            hintElement.textContent = label;
            hintElement.style.left = `${candidate.rect.left + window.scrollX}px`;
            hintElement.style.top = `${candidate.rect.top + window.scrollY}px`;
            container.appendChild(hintElement);
            return {
                label,
                element: candidate.element,
                hintElement,
                meta: candidate.meta || {},
                source: candidate.source
            };
        });

        state.active = true;
        state.mode = options.mode || 'generic';
        state.prefix = '';
        state.entries = entries;
        state.container = container;
        state.timer = null;
        state.options = {
            matchedClass,
            onCommit: typeof options.onCommit === 'function' ? options.onCommit : null,
            onCancel: typeof options.onCancel === 'function' ? options.onCancel : null,
            onStop: typeof options.onStop === 'function' ? options.onStop : null,
            selectEntry: typeof options.selectEntry === 'function' ? options.selectEntry : defaultSelectEntry,
            commitDelay: resolveCommitDelay(options),
            autoHover: !!options.autoHover,
            onUpdate: typeof options.onUpdate === 'function' ? options.onUpdate : null
        };

        updateDisplay('');

        if (state.options.autoHover) {
            tryFocusFirstEntry();
        }

        return true;
    }

    function resolveCommitDelay(options) {
        if (!options) return window.VimConfig.hintCommitDelay;
        if (typeof options.commitDelay === 'number') return options.commitDelay;
        return window.VimConfig.hintCommitDelay;
    }

    function stop(opts) {
        ensureState();
        if (!state.active) return;

        clearTimer();

        if (state.container && state.container.parentNode) {
            state.container.parentNode.removeChild(state.container);
        }

        const onStop = state.options && state.options.onStop;
        const reason = opts && opts.reason ? opts.reason : 'stop';
        const silent = opts && opts.silent;

        state.active = false;
        state.mode = null;
        state.prefix = '';
        state.entries = [];
        state.container = null;
        state.timer = null;
        state.options = null;

        if (!silent && typeof onStop === 'function') {
            try {
                onStop(reason);
            } catch (err) {
                console.error('HintEngine: onStop handler failed', err);
            }
        }
    }

    function cancel(reason) {
        ensureState();
        if (!state.active) return;

        const onCancel = state.options && state.options.onCancel;
        stop({ silent: true, reason: reason || 'cancel' });

        if (typeof onCancel === 'function') {
            try {
                onCancel(reason || 'cancel');
            } catch (err) {
                console.error('HintEngine: onCancel handler failed', err);
            }
        }
    }

    function handleChar(char) {
        ensureState();
        if (!state.active) return;
        if (!char) return;
        const lowered = ('' + char).toLowerCase();
        if (!lowered) return;
        processPrefix(state.prefix + lowered);
    }

    function handleBackspace() {
        ensureState();
        if (!state.active) return;
        if (!state.prefix) {
            updateDisplay('');
            return;
        }
        processPrefix(state.prefix.slice(0, -1));
    }

    function handleEnter(options) {
        ensureState();
        if (!state.active) return;
        const clear = options && options.clear;
        if (clear) {
            handleBackspace();
            return;
        }

        const prefix = state.prefix || '';
        const matches = filterMatches(prefix);
        if (matches.length === 0) {
            cancel('no-match');
            return;
        }

        const exactMatches = filterExactMatches(matches, prefix);
        const entry = resolveEntry(prefix, matches, exactMatches);
        if (entry) {
            commit(entry);
        } else {
            handleBackspace();
        }
    }

    function processPrefix(prefix) {
        ensureState();
        if (!state.active) return;

        const normalized = prefix || '';
        state.prefix = normalized;
        clearTimer();

        if (!normalized) {
            updateDisplay('');
            return;
        }

        const matches = filterMatches(normalized);
        if (matches.length === 0) {
            cancel('no-match');
            return;
        }

        updateDisplay(normalized, matches);

        const exactMatches = filterExactMatches(matches, normalized);
        if (exactMatches.length === 1 && matches.length === 1) {
            commit(exactMatches[0]);
            return;
        }

        scheduleAutoCommit(normalized, matches, exactMatches);
    }

    function filterMatches(prefix) {
        if (!prefix) return state.entries.slice();
        return state.entries.filter(entry => entry.label.startsWith(prefix));
    }

    function filterExactMatches(matches, prefix) {
        if (!prefix) return [];
        return matches.filter(entry => entry.label === prefix);
    }

    function updateDisplay(prefix, matches) {
        const visibleEntries = matches || state.entries;
        const matchedSet = new Set(visibleEntries);
        const highlightClass = state.options ? state.options.matchedClass : DEFAULT_MATCHED_CLASS;

        state.entries.forEach(entry => {
            if (!prefix) {
                entry.hintElement.textContent = entry.label;
                entry.hintElement.style.display = 'block';
                return;
            }

            if (matchedSet.has(entry)) {
                const remainder = entry.label.substring(prefix.length);
                entry.hintElement.innerHTML = `<span class="${highlightClass}">${prefix}</span>${remainder}`;
                entry.hintElement.style.display = 'block';
            } else {
                entry.hintElement.style.display = 'none';
            }
        });

        if (state.options && typeof state.options.onUpdate === 'function') {
            try {
                state.options.onUpdate(visibleEntries, prefix);
            } catch (err) {
                console.error('HintEngine: onUpdate handler failed', err);
            }
        }
    }

    function scheduleAutoCommit(prefix, matches, exactMatches) {
        const delay = state.options ? state.options.commitDelay : window.VimConfig.hintCommitDelay;
        if (!delay || !exactMatches || exactMatches.length === 0) return;

        state.timer = setTimeout(() => {
            state.timer = null;
            if (!state.active) return;
            if (state.prefix !== prefix) return;
            const currentMatches = filterMatches(prefix);
            const currentExact = filterExactMatches(currentMatches, prefix);
            if (currentExact.length > 0) {
                const entry = resolveEntry(prefix, currentMatches, currentExact);
                if (entry) commit(entry);
            }
        }, delay);
    }

    function resolveEntry(prefix, matches, exactMatches) {
        if (!matches || matches.length === 0) return null;
        const selector = state.options ? state.options.selectEntry : defaultSelectEntry;
        try {
            return selector({ prefix, matches, exactMatches });
        } catch (err) {
            console.error('HintEngine: selectEntry failed', err);
            return exactMatches && exactMatches.length ? exactMatches[0] : matches[0];
        }
    }

    function defaultSelectEntry(context) {
        if (context.exactMatches && context.exactMatches.length > 0) {
            return context.exactMatches[0];
        }
        return context.matches[0];
    }

    function commit(entry) {
        const handler = state.options && state.options.onCommit;
        const payload = entry;
        stop({ silent: true, reason: 'commit' });
        if (typeof handler === 'function') {
            try {
                handler(payload);
            } catch (err) {
                console.error('HintEngine: onCommit handler failed', err);
            }
        }
    }

    function tryFocusFirstEntry() {
        if (!state.entries || state.entries.length === 0) return;
        const entry = state.entries[0];
        if (!entry || !entry.element) return;
        try {
            entry.element.scrollIntoView({ block: 'nearest' });
        } catch (err) {
            // ignore
        }
    }

    function clearTimer() {
        if (state.timer) {
            clearTimeout(state.timer);
            state.timer = null;
        }
    }

    window.VimHintEngine = {
        start,
        stop,
        cancel,
        handleChar,
        handleBackspace,
        handleEnter,
        processPrefix,
        isActive: () => !!(state && state.active)
    };
})();


