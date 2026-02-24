/* ============================================
   VIM EXTENSION - FOCUS SELECTOR MODE
   Choose DOM scope for navigation focus
   ============================================ */

(function() {
    'use strict';

    if (!window.VimModeManager || !window.VimHintEngine || !window.VimFocus) {
        console.error('FocusSelectMode: prerequisites not loaded');
        return;
    }

    const INTERACTIVE_SELECTOR = 'a, button, summary, details, input:not([type="hidden"]), textarea, select, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [data-action], [data-focus-target]';
    const HEADER_SELECTOR = 'h1, h2, h3, h4, h5, h6, strong';
    const CANDIDATE_SELECTOR = [
        '[data-focus-scope]',
        '[data-vim-scope]',
        '[data-focus-region] > *',
        'main',
        'section',
        'article',
        'aside',
        'nav',
        'form',
        '.content-panel',
        '.content-section',
        '.content-block',
        '.navigator-panel',
        '.navigator-grid',
        '.navigator-list',
        '.navigator-categories',
        '.navigator-items',
        '.card-grid',
        '.grid',
        '.tab-content',
        '.lobby-section',
        '.guide-section',
        '.focus-demo-card',
        '.vim-focusable'
    ].join(', ');

    const MAX_HINTS = 12;
    const activeTargets = new Set();

    function enterBaseMode() {
        if (!window.VimModeManager) return;
        const base = typeof window.VimModeManager.getBaseMode === 'function'
            ? window.VimModeManager.getBaseMode()
            : (window.VimState.baseMode || 'normal');
        window.VimModeManager.enterMode(base);
    }

    const focusSelectMode = {
        allowTyping: false,
        keybindings: {},

        onEnter: () => {
            const scopeRoot = window.VimUtils.getFocusRoot();
            if (!scopeRoot) {
                enterBaseMode();
                return;
            }

            const candidates = collectCandidates(scopeRoot);
            if (candidates.length === 0) {
                enterBaseMode();
                return;
            }

            const started = window.VimHintEngine.start({
                mode: 'focus',
                entries: candidates,
                hintClass: 'vim-link-hint vim-focus-hint',
                containerClass: 'vim-link-hint-container',
                onCommit: (entry) => commitFocus(entry.element),
                onCancel: () => {
                    clearTargets();
                    enterBaseMode();
                },
                onUpdate: (entries) => markTargets(entries)
            });

            if (!started) {
                enterBaseMode();
                return;
            }

            configureKeybindings();
            markTargets(window.VimState.hintSelector.entries);
        },

        onExit: () => {
            clearTargets();
            window.VimHintEngine.stop({ silent: true, reason: 'mode-exit' });
        },

        isInputFocused: () => false
    };

    function configureKeybindings() {
        const registry = window.VimModeManager.getModeRegistry()['focus-select'];
        if (!registry) return;

        const bindings = {};
        bindings['Escape'] = () => window.VimHintEngine.cancel('escape');
        bindings['Backspace'] = (e) => {
            if (e) e.preventDefault();
            window.VimHintEngine.handleBackspace();
        };
        bindings['Enter'] = (e) => {
            if (e) e.preventDefault();
            window.VimHintEngine.handleEnter({ clear: !!(e && e.shiftKey) });
        };

        window.VimConfig.linkHintChars.split('').forEach(char => {
            bindings[char] = () => window.VimHintEngine.handleChar(char);
            bindings[char.toUpperCase()] = () => window.VimHintEngine.handleChar(char);
        });

        registry.keybindings = bindings;
    }

    function collectCandidates(scope) {
        const scopeRect = scope.getBoundingClientRect();
        const scopeArea = Math.max(scopeRect.width * scopeRect.height, 1);
        const entries = new Map();

        function consider(element, boost = 0) {
            if (!isEligibleCandidate(element, scope, scopeRect)) return;
            const score = scoreCandidate(element, scopeRect, scopeArea) + boost;
            if (score <= 0) return;
            const existing = entries.get(element);
            if (!existing || score > existing.score) {
                entries.set(element, { element, score });
            }
        }

        Array.from(scope.children || []).forEach(child => consider(child, 2));
        Array.from(scope.querySelectorAll(CANDIDATE_SELECTOR)).forEach(el => consider(el, 0));

        const entriesArray = Array.from(entries.values()).filter(entry => entry.element !== scope);

        const unique = entriesArray.filter(entry => {
            if (hasScopeFlag(entry.element)) {
                return true;
            }

            return !entriesArray.some(other => {
                if (other === entry) return false;
                if (hasScopeFlag(other.element)) return false;
                return other.element.contains(entry.element) && other.score >= entry.score;
            });
        });

        unique.sort((a, b) => b.score - a.score);

        return unique.slice(0, MAX_HINTS).map(item => ({ element: item.element, meta: { score: item.score } }));
    }

    function isEligibleCandidate(element, scope, scopeRect) {
        if (!element) return false;
        if (!scope.contains(element)) return false;
        if (element === scope) return false;

        if (element.closest('.vim-link-hint-container')) return false;
        if (window.VimState.elements.focusOutline && element === window.VimState.elements.focusOutline) return false;
        if (element.dataset && element.dataset.focusIgnore === 'true') return false;

        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
            return false;
        }

        const rect = element.getBoundingClientRect();
        const area = rect.width * rect.height;
        const scopeArea = Math.max(scopeRect.width * scopeRect.height, 1);
        const areaRatio = area / scopeArea;
        const hasDataFlag = hasScopeFlag(element);
        const interactiveCount = element.querySelectorAll(INTERACTIVE_SELECTOR).length;
        const headingCount = element.querySelectorAll(HEADER_SELECTOR).length;
        const isStructural = element.matches('header, nav, main, aside, footer, section, article, form, [role="navigation"], [role="toolbar"], [role="complementary"], .panel, .pane, .sidebar, .editor, .workspace');
        const hasLabel = !!element.getAttribute('aria-label') || !!element.getAttribute('data-title') || !!element.querySelector(HEADER_SELECTOR);

        if (hasDataFlag) return true;
        if (areaRatio >= 0.05 && (interactiveCount + headingCount) >= 1) return true;
        if (area >= 16000 && (interactiveCount >= 2 || headingCount >= 1 || hasLabel)) return true;
        if (isStructural && (interactiveCount >= 1 || headingCount >= 1)) return true;
        if ((interactiveCount + headingCount) >= 4) return true;

        return false;
    }

    function scoreCandidate(element, scopeRect, scopeArea) {
        const rect = element.getBoundingClientRect();
        const area = rect.width * rect.height;
        const areaRatio = Math.min(area / scopeArea, 1);
        const interactiveCount = element.querySelectorAll(INTERACTIVE_SELECTOR).length;
        const headingCount = element.querySelectorAll(HEADER_SELECTOR).length;
        const depth = getDepthWithinScope(element);

        let score = 0;
        score += areaRatio * 10;
        score += Math.min(interactiveCount, 8) * 1.5;
        score += Math.min(headingCount, 4);
        score -= depth * 0.75;

        if (hasScopeFlag(element)) {
            score += 8;
        }

        const tag = element.tagName.toLowerCase();
        if (tag === 'section' || tag === 'article' || tag === 'main' || tag === 'form' || tag === 'nav' || tag === 'aside') {
            score += 2;
        }

        if (element.matches('.panel, .pane, .sidebar, .editor, .workspace, [role="navigation"], [role="toolbar"], [role="complementary"]')) {
            score += 2;
        }

        return score;
    }

    function getDepthWithinScope(element) {
        let depth = 0;
        let node = element;
        while (node && node !== document.body && depth < 20) {
            depth++;
            node = node.parentElement;
        }
        return depth;
    }

    function commitFocus(element) {
        if (!element) {
            window.VimHintEngine.cancel('no-element');
            enterBaseMode();
            return;
        }

        clearTargets();
        window.VimHintEngine.stop({ silent: true, reason: 'commit' });

        window.VimFocus.replaceScope(element, {
            type: 'user',
            label: deriveLabel(element)
        });

        try {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (err) {
            // ignore
        }

        window.VimFocus.updateOverlay();
        enterBaseMode();
    }

    function deriveLabel(element) {
        if (!element) return 'Focused scope';
        if (element.dataset && element.dataset.vimLabel) return element.dataset.vimLabel;
        if (element.getAttribute) {
            const aria = element.getAttribute('aria-label') || element.getAttribute('title');
            if (aria) return aria;
        }

        if (element.id) return `#${element.id}`;
        if (element.classList && element.classList.length) {
            return `${element.tagName.toLowerCase()}.${Array.from(element.classList).slice(0, 2).join('.')}`;
        }

        const text = element.textContent ? element.textContent.trim() : '';
        if (text) {
            return text.split(/\s+/).slice(0, 4).join(' ');
        }

        return element.tagName ? element.tagName.toLowerCase() : 'Focused scope';
    }

    function markTargets(entries) {
        clearTargets();
        (entries || []).forEach(entry => {
            if (!entry || !entry.element) return;
            entry.element.classList.add('vim-focus-candidate');
            entry.element.setAttribute('data-focus-label', deriveLabel(entry.element));
            activeTargets.add(entry.element);
        });
    }

    function clearTargets() {
        activeTargets.forEach(element => {
            element.classList.remove('vim-focus-candidate');
            element.removeAttribute('data-focus-label');
        });
        activeTargets.clear();
    }

    function hasScopeFlag(element) {
        return !!(element && element.dataset && (element.dataset.focusScope !== undefined || element.dataset.vimScope !== undefined || element.dataset.focusRegion !== undefined));
    }

    window.VimModeManager.registerMode('focus-select', focusSelectMode);

    if (window.VimConfig.debug) {
        console.log('FocusSelectMode: Registered');
    }

})();

