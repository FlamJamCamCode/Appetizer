/* ============================================
   VIM EXTENSION - SELECT (DROPDOWN) MANAGER
   Scope-aware navigation and activation for <select>
   ============================================ */

(function() {
    'use strict';

    if (!window.VimState) {
        console.error('SelectManager: VimState missing');
        return;
    }

    const state = window.VimState.selectNavigation;
    const STEP_SMALL = 1;
    const STEP_LARGE = 5;

    function activate(select) {
        if (!select || select.disabled || select.readOnly) {
            return;
        }

        state.active = true;
        state.target = select;
        state.lastInteraction = Date.now();

        tryFocus(select);
        openDropdown(select);

        select.addEventListener('blur', handleBlur, { once: true });
    }

    function deactivate() {
        state.active = false;
        state.target = null;
    }

    function handleBlur() {
        deactivate();
    }

    function handleKey(event) {
        if (!state.active || !state.target) {
            return false;
        }

        const select = state.target;
        if (event.target !== select) {
            return false;
        }

        const key = event.key;

        switch (key) {
            case 'j':
                event.preventDefault();
                moveSelection(select, STEP_SMALL);
                return true;
            case 'k':
                event.preventDefault();
                moveSelection(select, -STEP_SMALL);
                return true;
            case 'd':
                event.preventDefault();
                moveSelection(select, STEP_LARGE);
                return true;
            case 'u':
                event.preventDefault();
                moveSelection(select, -STEP_LARGE);
                return true;
            case 'J':
                event.preventDefault();
                moveToEdge(select, 'end');
                return true;
            case 'K':
                event.preventDefault();
                moveToEdge(select, 'start');
                return true;
            case 'h':
            case 'ArrowLeft':
                if (select.multiple) {
                    return false;
                }
                event.preventDefault();
                moveSelection(select, -STEP_SMALL);
                return true;
            case 'l':
            case 'ArrowRight':
                if (select.multiple) {
                    return false;
                }
                event.preventDefault();
                moveSelection(select, STEP_SMALL);
                return true;
            case 'Enter':
            case ' ': // Space
                event.preventDefault();
                commitSelection(select);
                deactivate();
                return true;
            case 'Escape':
                event.preventDefault();
                closeDropdown(select);
                deactivate();
                return true;
            default:
                return false;
        }
    }

    function moveSelection(select, step) {
        const options = getEnabledOptions(select);
        if (options.length === 0) {
            return;
        }

        const currentIndex = options.findIndex(option => option.index === select.selectedIndex);
        const normalizedIndex = currentIndex === -1 ? 0 : currentIndex;
        let targetIndex = normalizedIndex + step;

        if (targetIndex < 0) {
            targetIndex = 0;
        } else if (targetIndex >= options.length) {
            targetIndex = options.length - 1;
        }

        const targetOption = options[targetIndex];
        if (targetOption) {
            select.selectedIndex = targetOption.index;
            dispatchChange(select);
            ensureVisible(select, targetOption.element);
        }
    }

    function moveToEdge(select, edge) {
        const options = getEnabledOptions(select);
        if (options.length === 0) {
            return;
        }

        const targetOption = edge === 'start' ? options[0] : options[options.length - 1];
        select.selectedIndex = targetOption.index;
        dispatchChange(select);
        ensureVisible(select, targetOption.element);
    }

    function getEnabledOptions(select) {
        return Array.from(select.options)
            .filter(option => !option.disabled)
            .map((option, index) => ({ element: option, index }));
    }

    function dispatchChange(select) {
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);
        state.lastInteraction = Date.now();
    }

    function ensureVisible(select, option) {
        if (!option) return;
        if (typeof option.scrollIntoView === 'function') {
            option.scrollIntoView({ block: 'nearest' });
        }
    }

    function tryFocus(select) {
        if (document.activeElement === select) {
            return;
        }

        try {
            select.focus({ preventScroll: true });
        } catch (err) {
            select.focus();
        }
    }

    function openDropdown(select) {
        if (!select) return;

        if (typeof select.showPicker === 'function') {
            select.showPicker();
            return;
        }

        const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
        const up = new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window });
        const click = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });

        select.dispatchEvent(down);
        select.dispatchEvent(up);
        select.dispatchEvent(click);
    }

    function closeDropdown(select) {
        if (!select) return;

        if (typeof select.blur === 'function') {
            select.blur();
        }
    }

    function commitSelection(select) {
        if (!select) return;

        closeDropdown(select);
    }

    window.VimSelectManager = {
        activate,
        deactivate,
        handleKey
    };

    document.addEventListener('focusin', (event) => {
        const target = event.target;
        if (target instanceof HTMLSelectElement) {
            activate(target);
        }
    });
})();


