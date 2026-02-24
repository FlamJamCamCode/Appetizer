/* ============================================
   VIM EXTENSION - TEXT INPUT MANAGER
   Provides Vim-style editing for native text inputs
   ============================================ */

(function() {
    'use strict';

    if (!window.VimState || !window.VimUtils || !window.VimConfig) {
        console.error('TextInput: prerequisites missing');
        return;
    }

    const state = window.VimState.textInput;
    const TEXT_INPUT_TYPES = new Set([
        'text', 'search', 'email', 'url', 'tel', 'password',
        'number', 'date', 'time', 'datetime-local', 'month', 'week'
    ]);

    const BRACKET_PAIRS = {
        '(': ')',
        '[': ']',
        '{': '}',
        '<': '>'
    };
    const CLOSING_BRACKETS = Object.fromEntries(Object.entries(BRACKET_PAIRS).map(([open, close]) => [close, open]));

    function shouldActivate(element) {
        if (!element || element.disabled || element.readOnly) {
            return false;
        }

        if (element.dataset && element.dataset.vimTextinput === 'false') {
            return false;
        }

        if (element.matches && element.matches('[data-vim-textinput="false"]')) {
            return false;
        }

        if (element instanceof HTMLTextAreaElement) {
            return true;
        }

        if (element instanceof HTMLInputElement) {
            const type = element.type ? element.type.toLowerCase() : 'text';
            return TEXT_INPUT_TYPES.has(type) || element.hasAttribute('data-vim-input');
        }

        if (element.hasAttribute && element.hasAttribute('data-vim-input')) {
            return true;
        }

        return false;
    }

    function activate(element) {
        if (!shouldActivate(element)) {
            return false;
        }

        if (window.VimModeManager && window.VimModeManager.getCurrentMode && window.VimModeManager.getCurrentMode() === 'text-input') {
            bindTarget(element);
        } else if (window.VimModeManager) {
            window.VimModeManager.enterMode('text-input', element);
        } else {
            bindTarget(element);
        }

        return true;
    }

    function bindTarget(element) {
        if (!element) return;

        state.active = true;
        state.target = element;
        state.subMode = 'normal';
        state.anchor = null;
        state.virtualColumn = null;
        state.pendingCommand = null;
        state.pendingTimestamp = 0;
        state.commandCount = 0;
        state.pendingOperator = null;
        state.layout = resolveLayout(element);
        window.VimState.activeLayout = state.layout;

        ensureFocus(element);
        window.VimUtils.resetEscapeChordState();
    }

    function resolveLayout(element) {
        if (!element || !element.dataset) {
            return window.VimConfig.defaultLayout || 'default';
        }

        if (element.dataset.vimLayout) {
            return element.dataset.vimLayout;
        }

        const scoped = element.closest('[data-vim-layout]');
        if (scoped && scoped.dataset.vimLayout) {
            return scoped.dataset.vimLayout;
        }

        return window.VimConfig.defaultLayout || 'default';
    }

    function deactivate() {
        state.active = false;
        state.target = null;
        state.anchor = null;
        state.virtualColumn = null;
        state.pendingCommand = null;
        state.pendingTimestamp = 0;
        state.commandCount = 0;
        state.pendingOperator = null;
        window.VimUtils.resetEscapeChordState();
    }

    function handleKey(event) {
        if (!state.active) {
            return false;
        }

        const target = ensureTarget();
        if (!target) {
            return false;
        }

        if (document.activeElement !== target) {
            ensureFocus(target);
        }

        if (state.subMode === 'insert') {
            return handleInsertKey(event, target);
        }

        if (state.subMode === 'visual') {
            return handleVisualKey(event, target);
        }

        return handleNormalKey(event, target);
    }

    function handleInsertKey(event, target) {
        const key = event.key;
        const now = Date.now();

        if (key === 'Escape') {
            event.preventDefault();
            enterNormalMode(target);
            return true;
        }

        const handled = window.VimUtils.handleEscapeChord({
            event,
            eventTime: now,
            captureTarget: target,
            requireTarget: target,
            onEscape: () => enterNormalMode(target)
        });

        if (handled) {
            return true;
        }

        return true;
    }

    function handleVisualKey(event, target) {
        const key = event.key;

        switch (key) {
            case 'Escape':
                event.preventDefault();
                enterNormalMode(target);
                return true;
            case 'h':
                event.preventDefault();
                moveHorizontal(target, -1, { extend: true });
                return true;
            case 'l':
                event.preventDefault();
                moveHorizontal(target, 1, { extend: true });
                return true;
            case 'k':
                event.preventDefault();
                moveVertical(target, -1, { extend: true });
                return true;
            case 'j':
                event.preventDefault();
                moveVertical(target, 1, { extend: true });
                return true;
            case 'w':
                event.preventDefault();
                moveWordForward(target, { extend: true });
                return true;
            case 'b':
                event.preventDefault();
                moveWordBackward(target, { extend: true });
                return true;
            case '0':
                event.preventDefault();
                moveToLineStart(target, { extend: true });
                return true;
            case '$':
                event.preventDefault();
                moveToLineEnd(target, { extend: true });
                return true;
            case 'y':
                event.preventDefault();
                yankSelection(target);
                enterNormalMode(target);
                return true;
            case 'd':
                event.preventDefault();
                deleteSelection(target);
                enterNormalMode(target);
                return true;
            default:
                event.preventDefault();
                return true;
        }
    }

    function handleNormalKey(event, target) {
        const key = event.key;

        switch (key) {
            case 'Escape':
                event.preventDefault();
                if (state.pendingCommand) {
                    resetPending();
                    return true;
                }
                exitToBase();
                return true;
            case 'i':
                event.preventDefault();
                enterInsertMode(target);
                return true;
            case 'a':
                event.preventDefault();
                moveHorizontal(target, 1, { allowEdge: true });
                enterInsertMode(target);
                return true;
            case 'I':
                event.preventDefault();
                moveToLineStart(target);
                enterInsertMode(target);
                return true;
            case 'A':
                event.preventDefault();
                moveToLineEnd(target);
                enterInsertMode(target);
                return true;
            case 'o':
                event.preventDefault();
                insertNewLineBelow(target);
                enterInsertMode(target);
                return true;
            case 'O':
                event.preventDefault();
                insertNewLineAbove(target);
                enterInsertMode(target);
                return true;
            case 'v':
                event.preventDefault();
                enterVisualMode(target);
                return true;
            case 'h':
                event.preventDefault();
                moveHorizontal(target, -1);
                resetPending();
                return true;
            case 'l':
                event.preventDefault();
                moveHorizontal(target, 1);
                resetPending();
                return true;
            case 'k':
                event.preventDefault();
                moveVertical(target, -1);
                resetPending();
                return true;
            case 'j':
                event.preventDefault();
                moveVertical(target, 1);
                resetPending();
                return true;
            case 'd':
                event.preventDefault();
                moveVertical(target, CHUNK_LINES);
                resetPending();
                return true;
            case 'u':
                event.preventDefault();
                moveVertical(target, -CHUNK_LINES);
                resetPending();
                return true;
            case 'D':
                event.preventDefault();
                moveByViewport(target, 1);
                resetPending();
                return true;
            case 'U':
                event.preventDefault();
                moveByViewport(target, -1);
                resetPending();
                return true;
            case 'w':
                event.preventDefault();
                moveWordForward(target);
                resetPending();
                return true;
            case 'b':
                event.preventDefault();
                moveWordBackward(target);
                resetPending();
                return true;
            case '0':
                event.preventDefault();
                moveToLineStart(target);
                resetPending();
                return true;
            case '$':
                event.preventDefault();
                moveToLineEnd(target);
                resetPending();
                return true;
            case 'x':
                event.preventDefault();
                deleteChars(target, 1);
                resetPending();
                return true;
            case 'X':
                event.preventDefault();
                deleteChars(target, -1);
                resetPending();
                return true;
            case 'p':
                event.preventDefault();
                pasteRegister(target);
                resetPending();
                return true;
            case 'g':
                event.preventDefault();
                if (isPending('g')) {
                    moveToDocumentStart(target);
                    resetPending();
                } else {
                    setPending('g');
                }
                return true;
            case 'G':
                event.preventDefault();
                moveToDocumentEnd(target);
                resetPending();
                return true;
            case 'z':
                event.preventDefault();
                if (isPending('z')) {
                    scrollCursor(target, 'center');
                    resetPending();
                } else {
                    setPending('z');
                }
                return true;
            case 't':
            case 'b':
                if (isPending('z')) {
                    event.preventDefault();
                    scrollCursor(target, key === 't' ? 'top' : 'bottom');
                    resetPending();
                    return true;
                }
                event.preventDefault();
                resetPending();
                return true;
            case 'y':
                event.preventDefault();
                if (isPending('y')) {
                    yankLine(target);
                    resetPending();
                } else {
                    setPending('y');
                }
                return true;
            case 'Enter':
                event.preventDefault();
                resetPending();
                return true;
            default:
                if (state.pendingCommand) {
                    event.preventDefault();
                    resetPending();
                    return true;
                }

                // Swallow other keys in normal mode
                if (key.length === 1 || key === 'Backspace' || key === 'Delete' || key === 'Tab') {
                    event.preventDefault();
                    return true;
                }
                break;
        }

        return false;
    }

    function enterNormalMode(target) {
        state.subMode = 'normal';
        state.anchor = null;
        collapseSelection(target);
        resetPending();
        window.VimUtils.resetEscapeChordState();
    }

    function enterInsertMode(target) {
        state.subMode = 'insert';
        resetPending();
        window.VimUtils.resetEscapeChordState();
    }

    function enterVisualMode(target) {
        state.subMode = 'visual';
        state.anchor = target.selectionStart;
        resetPending();
        window.VimUtils.resetEscapeChordState();
    }

    function moveHorizontal(target, delta, options = {}) {
        const value = getValue(target);
        if (value == null) return;

        const length = value.length;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const caret = state.subMode === 'visual' && options.extend ? end : start;

        let position = caret + delta;

        if (!options.allowEdge) {
            if (delta > 0) {
                position = Math.min(length, position);
            } else {
                position = Math.max(0, position);
            }
        } else {
            position = clamp(position, 0, length);
        }

        applyPosition(target, position, options.extend);
        updateVirtualColumn(target);
    }

    function moveVertical(target, delta, options = {}) {
        const value = getValue(target);
        if (value == null) return;

        const current = state.subMode === 'visual' && options.extend ? target.selectionEnd : target.selectionStart;
        const currentLine = getLineRange(value, current);
        const desiredColumn = state.virtualColumn != null ? state.virtualColumn : current - currentLine.start;

        let lineIndex = currentLine.index + delta;
        if (lineIndex < 0) {
            lineIndex = 0;
        }

        const lines = value.split('\n');
        if (lineIndex >= lines.length) {
            lineIndex = lines.length - 1;
        }

        let position = 0;
        for (let i = 0; i < lineIndex; i++) {
            position += lines[i].length + 1;
        }

        const lineLength = lines[lineIndex] ? lines[lineIndex].length : 0;
        position += Math.min(desiredColumn, lineLength);

        applyPosition(target, position, options.extend);
        state.virtualColumn = desiredColumn;
    }

    function moveByViewport(target, direction) {
        const lineHeight = getLineHeight(target);
        const linesPerViewport = Math.max(1, Math.floor(target.clientHeight / lineHeight) - 1);
        moveVertical(target, linesPerViewport * direction);
    }

    function moveWordForward(target, options = {}) {
        const value = getValue(target);
        if (value == null) return;

        let position = state.subMode === 'visual' && options.extend ? target.selectionEnd : target.selectionStart;
        const length = value.length;

        if (position < length) {
            // Skip current non-whitespace characters
            while (position < length && !isWhitespace(value[position])) {
                position++;
            }
            // Skip whitespace to next word
            while (position < length && isWhitespace(value[position])) {
                position++;
            }
        }

        applyPosition(target, position, options.extend);
        updateVirtualColumn(target);
    }

    function moveWordBackward(target, options = {}) {
        const value = getValue(target);
        if (value == null) return;

        let position = state.subMode === 'visual' && options.extend ? target.selectionEnd : target.selectionStart;

        if (position > 0) {
            position--;
            while (position > 0 && isWhitespace(value[position])) {
                position--;
            }
            while (position > 0 && !isWhitespace(value[position - 1])) {
                position--;
            }
        }

        applyPosition(target, position, options.extend);
        updateVirtualColumn(target);
    }

    function moveToLineStart(target, options = {}) {
        const value = getValue(target);
        if (value == null) return;

        const ref = state.subMode === 'visual' && options.extend ? target.selectionEnd : target.selectionStart;
        const line = getLineRange(value, ref);
        applyPosition(target, line.start, options.extend);
        state.virtualColumn = 0;
    }

    function moveToLineEnd(target, options = {}) {
        const value = getValue(target);
        if (value == null) return;

        const ref = state.subMode === 'visual' && options.extend ? target.selectionEnd : target.selectionStart;
        const line = getLineRange(value, ref);
        applyPosition(target, line.end, options.extend);
        state.virtualColumn = line.end - line.start;
    }

    function moveToDocumentStart(target) {
        applyPosition(target, 0, false);
        updateVirtualColumn(target);
    }

    function moveToDocumentEnd(target) {
        const value = getValue(target);
        if (value == null) return;
        applyPosition(target, value.length, false);
        updateVirtualColumn(target);
    }

    function deleteChars(target, count) {
        const value = getValue(target);
        if (value == null) return;

        let start = target.selectionStart;
        let end = target.selectionEnd;

        if (end > start) {
            const removed = value.slice(start, end);
            state.register = removed;
            updateValue(target, value.slice(0, start) + value.slice(end), start);
            return;
        }

        if (count > 0) {
            end = Math.min(value.length, start + count);
        } else {
            start = Math.max(0, start + count);
        }

        if (end === start) {
            return;
        }

        const removed = value.slice(start, end);
        state.register = removed;
        updateValue(target, value.slice(0, start) + value.slice(end), start);
    }

    function deleteSelection(target) {
        const value = getValue(target);
        if (value == null) return;

        const start = target.selectionStart;
        const end = target.selectionEnd;
        if (end <= start) return;

        const removed = value.slice(start, end);
        state.register = removed;
        updateValue(target, value.slice(0, start) + value.slice(end), start);
    }

    function deleteLine(target) {
        const value = getValue(target);
        if (value == null || value.length === 0) {
            return;
        }

        const caret = target.selectionStart;
        const line = getLineRange(value, caret);
        let deleteStart = line.start;
        let deleteEnd = line.end;

        if (deleteEnd < value.length) {
            deleteEnd += 1; // remove trailing newline
        } else if (deleteStart > 0) {
            deleteStart -= 1; // remove preceding newline for last line
        }

        const removed = value.slice(deleteStart, deleteEnd);
        state.register = removed;

        const newValue = value.slice(0, deleteStart) + value.slice(deleteEnd);
        updateValue(target, newValue, deleteStart);
    }

    function yankLine(target) {
        const value = getValue(target);
        if (value == null) return;

        const caret = target.selectionStart;
        const line = getLineRange(value, caret);
        const lineText = value.slice(line.start, line.end);
        state.register = lineText + '\n';
    }

    function yankSelection(target) {
        const value = getValue(target);
        if (value == null) return;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        if (end <= start) return;
        state.register = value.slice(start, end);
    }

    function pasteRegister(target) {
        if (!state.register) return;
        const value = getValue(target);
        if (value == null) return;

        const start = target.selectionStart;
        const end = target.selectionEnd;

        let insertAt = end > start ? start : start + 1;
        insertAt = clamp(insertAt, 0, value.length);
        const newValue = value.slice(0, insertAt) + state.register + value.slice(insertAt);
        updateValue(target, newValue, insertAt + state.register.length);
    }

    function insertNewLineBelow(target) {
        const value = getValue(target);
        if (value == null) return;

        const line = getLineRange(value, target.selectionStart);
        const insertPos = line.end;
        const insertValue = value.slice(0, insertPos) + '\n' + value.slice(insertPos);
        updateValue(target, insertValue, insertPos + 1);
    }

    function insertNewLineAbove(target) {
        const value = getValue(target);
        if (value == null) return;

        const line = getLineRange(value, target.selectionStart);
        const insertPos = line.start;
        const insertValue = value.slice(0, insertPos) + '\n' + value.slice(insertPos);
        updateValue(target, insertValue, insertPos);
    }

    function scrollCursor(target, alignment) {
        if (!target) return;

        const value = getValue(target);
        if (value == null) return;

        const caret = target.selectionStart;
        const lines = value.slice(0, caret).split('\n');
        const lineIndex = lines.length - 1;
        const lineHeight = getLineHeight(target);
        const top = lineIndex * lineHeight;

        switch (alignment) {
            case 'top':
                target.scrollTop = top;
                break;
            case 'bottom':
                target.scrollTop = Math.max(0, top - target.clientHeight + lineHeight);
                break;
            default:
                target.scrollTop = Math.max(0, top - Math.floor(target.clientHeight / 2));
        }
    }

    function updateValue(target, newValue, newCaret) {
        const oldValue = target.value;
        target.value = newValue;

        if (typeof target.setSelectionRange === 'function') {
            target.setSelectionRange(newCaret, newCaret);
        }

        dispatchInput(target, newValue, oldValue);
        updateVirtualColumn(target);
    }

    function dispatchInput(target, newValue, oldValue) {
        try {
            const event = new InputEvent('input', {
                bubbles: true,
                data: '',
                inputType: newValue.length >= oldValue.length ? 'insertText' : 'deleteContentBackward'
            });
            target.dispatchEvent(event);
        } catch (err) {
            const fallback = new Event('input', { bubbles: true });
            target.dispatchEvent(fallback);
        }
    }

    function applyPosition(target, position, extend) {
        const value = getValue(target);
        if (value == null) return;

        const clamped = clamp(position, 0, value.length);

        if (state.subMode === 'visual' && state.anchor != null) {
            const start = Math.min(state.anchor, clamped);
            const end = Math.max(state.anchor, clamped);
            setSelection(target, start, end);
        } else if (extend) {
            const anchor = state.anchor != null ? state.anchor : target.selectionStart;
            const start = Math.min(anchor, clamped);
            const end = Math.max(anchor, clamped);
            setSelection(target, start, end);
        } else {
            setSelection(target, clamped, clamped);
        }
    }

    function collapseSelection(target) {
        if (!target) return;
        const end = target.selectionEnd;
        setSelection(target, end, end);
    }

    function setSelection(target, start, end) {
        if (typeof target.setSelectionRange === 'function') {
            target.setSelectionRange(start, end);
        }
    }

    function getValue(target) {
        if (!target) return null;
        if (typeof target.value === 'string') {
            return target.value;
        }
        return null;
    }

    function ensureTarget() {
        const target = state.target;
        if (!target || !document.contains(target)) {
            deactivate();
            return null;
        }
        return target;
    }

    function ensureFocus(element) {
        if (!element) return;
        if (document.activeElement === element) return;
        try {
            element.focus({ preventScroll: true });
        } catch (err) {
            element.focus();
        }
    }

    function resetPending() {
        state.pendingCommand = null;
        state.pendingTimestamp = 0;
    }

    function setPending(command) {
        state.pendingCommand = command;
        state.pendingTimestamp = Date.now();
    }

    function isPending(command) {
        if (state.pendingCommand !== command) {
            return false;
        }
        return (Date.now() - state.pendingTimestamp) <= window.VimConfig.commandDelay;
    }

    function exitToBase() {
        const target = state.target;
        deactivate();
        if (target && typeof target.blur === 'function') {
            target.blur();
        }
        if (window.VimModeManager) {
            window.VimModeManager.exitMode();
        }
    }

    function updateVirtualColumn(target) {
        const value = getValue(target);
        if (value == null) return;
        const caret = target.selectionStart;
        const line = getLineRange(value, caret);
        state.virtualColumn = caret - line.start;
    }

    function getLineRange(value, position) {
        const length = value.length;
        const clamped = clamp(position, 0, length);
        let start = value.lastIndexOf('\n', clamped - 1);
        start = start === -1 ? 0 : start + 1;
        let end = value.indexOf('\n', clamped);
        end = end === -1 ? length : end;
        const index = value.slice(0, start).split('\n').length - 1;
        return { start, end, index };
    }

    function getLineHeight(target) {
        const computed = window.getComputedStyle(target);
        const lineHeight = parseFloat(computed.lineHeight);
        if (!isNaN(lineHeight)) {
            return lineHeight;
        }
        const fontSize = parseFloat(computed.fontSize);
        if (!isNaN(fontSize)) {
            return fontSize * 1.4;
        }
        return 18;
    }

    function isWhitespace(char) {
        return /\s/.test(char || '');
    }

    function clamp(value, min, max) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    window.VimTextInput = {
        shouldActivate,
        activate,
        bindTarget,
        deactivate,
        handleKey
    };

    document.addEventListener('focusin', (event) => {
        const target = event.target;
        if (shouldActivate(target)) {
            activate(target);
        }
    });
})();


