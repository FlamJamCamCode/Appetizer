/* ============================================================================
   ParenCore
   ---------------------------------------------------------------------------
   Minimal core responsible for:
     • parsing text nodes and wrapping delimiter pairs
     • providing collapse / expand / toggle helpers
     • applying a simple length-based collapse heuristic

   Interaction layers (mouse, vim, 3D, etc.) live in companion modules that
   call the exported API but keep behaviour separate from the DOM transforms.
   ========================================================================= */

(function () {
  'use strict';

  const OPENERS = new Map([
    ['(', ')'],
    ['[', ']'],
    ['{', '}'],
  ]);
  const CLOSERS = new Map([
    [')', '('],
    [']', '['],
    ['}', '{'],
  ]);

  const STATE_COLLAPSED = 'collapsed';
  const STATE_EXPANDED = 'expanded';

  const DEFAULT_OPTIONS = Object.freeze({
    collapseThreshold: 20,
    shortThreshold: 10,
    placeholder: '…',
  });

  function collapseParenthesis(span) {
    if (!span) return;
    span.dataset.state = STATE_COLLAPSED;
    span.dataset.expandDepth = '0';
    if (!span.dataset.persistentDepth) {
      span.dataset.persistentDepth = '0';
    }
    span.classList.add('paren-collapsed');
    span.classList.remove('paren-expanded');
    // Collapse all nested groups recursively - this ensures they don't show () () ()
    const nested = span.querySelectorAll('.paren-group');
    nested.forEach((n) => {
      n.dataset.state = STATE_COLLAPSED;
      n.dataset.expandDepth = '0';
      if (!n.dataset.persistentDepth) {
        n.dataset.persistentDepth = '0';
      }
      n.classList.add('paren-collapsed');
      n.classList.remove('paren-expanded');
      n.classList.remove('paren-hover');
    });
  }

  function expandParenthesis(span) {
    if (!span) return;
    span.dataset.state = STATE_EXPANDED;
    span.classList.add('paren-expanded');
    span.classList.remove('paren-collapsed');
  }

  function getDirectChildGroups(span) {
    if (!span) return [];
    const inner = span.querySelector(':scope > .paren-inner');
    if (!inner) return [];
    return Array.from(inner.querySelectorAll(':scope > .paren-group'));
  }

  function expandToDepth(span, targetDepth, respectPersistentDepth = false) {
    if (!span) return;
    
    // Always expand the clicked span itself
    expandParenthesis(span);
    span.dataset.expandDepth = String(targetDepth);
    
    // targetDepth = how many nested levels to expand
    // targetDepth = 0: only this span (collapsed)
    // targetDepth = 1: this span + direct children
    // targetDepth = 2: this span + direct children + grandchildren
    // etc.
    
    if (targetDepth > 0) {
      const children = getDirectChildGroups(span);
      children.forEach((child) => {
        // Calculate how deep to expand this child
        let childTargetDepth = targetDepth - 1;
        
        if (respectPersistentDepth) {
          // Respect the child's own persistent depth if it's been clicked
          const childPersistentDepth = parseInt(child.dataset.persistentDepth || '0', 10);
          if (childPersistentDepth > 0) {
            // Child has its own depth setting, use the minimum
            childTargetDepth = Math.min(targetDepth - 1, childPersistentDepth);
          }
        }
        
        if (childTargetDepth > 0) {
          // Expand child and recursively expand its children
          expandParenthesis(child);
          expandToDepth(child, childTargetDepth, respectPersistentDepth);
        } else {
          // This is beyond the target depth, collapse this child
          collapseParenthesis(child);
          child.dataset.expandDepth = '0';
        }
      });
    } else {
      // targetDepth = 0, collapse all children
      const children = getDirectChildGroups(span);
      children.forEach((child) => {
        if (respectPersistentDepth) {
          const childPersistentDepth = parseInt(child.dataset.persistentDepth || '0', 10);
          if (childPersistentDepth > 0) {
            // Child has been clicked, respect its persistent state
            expandToDepth(child, childPersistentDepth, respectPersistentDepth);
          } else {
            collapseParenthesis(child);
          }
        } else {
          collapseParenthesis(child);
        }
      });
    }
  }

  function collapseOneLevel(span) {
    if (!span) return;
    const currentDepth = parseInt(span.dataset.persistentDepth || span.dataset.expandDepth || '0', 10);
    
    if (currentDepth <= 0) {
      // Already at minimum, collapse this group entirely
      collapseParenthesis(span);
      span.dataset.persistentDepth = '0';
      return;
    }
    
    if (currentDepth === 1) {
      // Collapse all children but keep parent expanded
      span.dataset.expandDepth = '0';
      span.dataset.persistentDepth = '0';
      const children = getDirectChildGroups(span);
      children.forEach((child) => {
        collapseParenthesis(child);
        child.dataset.expandDepth = '0';
        if (!child.dataset.persistentDepth) {
          child.dataset.persistentDepth = '0';
        }
      });
    } else {
      // Collapse one level deeper
      const newDepth = currentDepth - 1;
      expandToDepth(span, newDepth);
      span.dataset.persistentDepth = String(newDepth);
    }
  }

  function expandOneLevel(span) {
    if (!span) return;
    const currentDepth = parseInt(span.dataset.persistentDepth || span.dataset.expandDepth || '0', 10);
    
    // If the group itself is collapsed, first expand it
    if (span.dataset.state === STATE_COLLAPSED || isCollapsed(span)) {
      expandParenthesis(span);
      span.dataset.expandDepth = '1';
      span.dataset.persistentDepth = '1';
      // Expand first level of children
      const children = getDirectChildGroups(span);
      children.forEach((child) => {
        expandParenthesis(child);
        child.dataset.expandDepth = '0';
        if (!child.dataset.persistentDepth) {
          child.dataset.persistentDepth = '0';
        }
        // Collapse deeper children
        const grandChildren = getDirectChildGroups(child);
        grandChildren.forEach((gc) => {
          collapseParenthesis(gc);
        });
      });
    } else {
      // Already expanded, expand one level deeper
      const newDepth = currentDepth + 1;
      expandToDepth(span, newDepth);
      span.dataset.persistentDepth = String(newDepth);
    }
  }

  function expandAllLevels(span) {
    if (!span) return;
    // Expand this and all nested groups
    expandParenthesis(span);
    const nested = span.querySelectorAll('.paren-group');
    nested.forEach((n) => {
      expandParenthesis(n);
      n.dataset.expandDepth = '999'; // Mark as fully expanded
      n.dataset.state = STATE_EXPANDED;
      n.classList.add('paren-expanded');
      n.classList.remove('paren-collapsed');
    });
    span.dataset.expandDepth = '999';
  }

  function toggleParenthesis(span) {
    if (!span) return;
    if (isCollapsed(span)) {
      expandParenthesis(span);
    } else {
      collapseParenthesis(span);
    }
  }

  function isCollapsed(span) {
    if (!span) return true;
    return span.dataset.state !== STATE_EXPANDED;
  }

  function normalizeText(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function measureContentLength(node) {
    if (!node) return 0;
    return normalizeText(node.textContent || '').length;
  }

  function isAtEndOfSentence(text, groupEndIndex) {
    if (groupEndIndex >= text.length) return true;
    const afterGroup = text.slice(groupEndIndex);
    // Check if immediately followed by sentence-ending punctuation (with optional whitespace)
    const trimmed = afterGroup.trim();
    if (!trimmed) return true;
    // Allow for optional whitespace between closing paren and punctuation
    const match = afterGroup.match(/^\s*([.!?;])/);
    return match !== null;
  }

  function shouldCollapseGroup(node, contentLength, options, originalText, groupEndIndex) {
    // Always collapse if content is long enough
    if (contentLength >= options.collapseThreshold) {
      return true;
    }
    // Don't collapse if it's very short (regardless of position)
    if (contentLength < (options.shortThreshold || 10)) {
      return false;
    }
    // Don't collapse if it's not very long AND at the end of a sentence
    if (contentLength < options.collapseThreshold && isAtEndOfSentence(originalText, groupEndIndex)) {
      return false;
    }
    // Default: collapse if above short threshold but below main threshold
    return true;
  }

  function createDomFromNode(node, depth, options, bucket, originalText) {
    if (node.type === 'text') {
      return document.createTextNode(node.value);
    }

    const span = document.createElement('span');
    span.className = 'paren-group';
    span.dataset.depth = String(depth);
    span.dataset.open = node.openChar;
    span.dataset.close = node.closeChar;

    const open = document.createElement('span');
    open.className = 'paren-open';
    open.textContent = node.openChar;
    span.appendChild(open);

    const placeholder = document.createElement('span');
    placeholder.className = 'paren-placeholder';
    placeholder.textContent = options.placeholder;
    span.appendChild(placeholder);

    const inner = document.createElement('span');
    inner.className = 'paren-inner';
    node.children.forEach((child) => {
      inner.appendChild(createDomFromNode(child, depth + 1, options, bucket, originalText));
    });
    span.appendChild(inner);

    const close = document.createElement('span');
    close.className = 'paren-close';
    close.textContent = node.closeChar;
    span.appendChild(close);

    const contentLength = Math.max(node.contentLength || 0, measureContentLength(inner));
    span.dataset.contentLength = String(contentLength);
    span.dataset.expandDepth = '0'; // Initialize expansion depth
    span.dataset.persistentDepth = '0'; // Initialize persistent depth (set by clicks)
    
    const groupEndIndex = node.endIndex != null ? node.endIndex : originalText.length;
    if (shouldCollapseGroup(node, contentLength, options, originalText, groupEndIndex)) {
      collapseParenthesis(span);
    } else {
      expandParenthesis(span);
      // If expanded by default, set depth to 0 (no nested expansion)
      span.dataset.expandDepth = '0';
      span.dataset.persistentDepth = '0';
    }

    bucket.push(span);
    return span;
  }

  function parseTextContent(text) {
    const root = { type: 'root', children: [] };
    let current = root;
    const stack = [];
    let buffer = '';

    const flush = () => {
      if (!buffer) return;
      current.children.push({ type: 'text', value: buffer, parent: current });
      buffer = '';
    };

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      if (OPENERS.has(char)) {
        flush();
        const group = {
          type: 'group',
          openChar: char,
          closeChar: OPENERS.get(char),
          children: [],
          parent: current,
          contentLength: 0,
          startIndex: i,
          endIndex: null,
        };
        current.children.push(group);
        stack.push({ node: current, index: i });
        current = group;
      } else if (CLOSERS.has(char)) {
        flush();
        if (current.type === 'group' && current.closeChar === char) {
          current.endIndex = i + 1;
          const popped = stack.pop();
          current = popped ? popped.node : root;
        } else {
          buffer += char;
        }
      } else {
        buffer += char;
      }
    }

    flush();
    return root;
  }

  function shouldSkipNode(node) {
    let parent = node.parentNode;
    while (parent) {
      const tag = parent.nodeName;
      if (tag === 'CODE' || tag === 'PRE' || tag === 'SCRIPT' || tag === 'STYLE') {
        return true;
      }
      if (tag === 'TEXTAREA' || tag === 'INPUT') {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  }

  function accumulateLengths(node) {
    if (!node) return 0;
    if (node.type === 'text') {
      const len = normalizeText(node.value).length;
      node.contentLength = len;
      return len;
    }
    let total = 0;
    node.children.forEach((child) => {
      total += accumulateLengths(child);
    });
    node.contentLength = total;
    return total;
  }

  function processTextNode(textNode, options, bucket) {
    if (!textNode || !textNode.nodeValue || !/[()[\]{}]/.test(textNode.nodeValue)) {
      return;
    }

    const originalText = textNode.nodeValue;
    const parsed = parseTextContent(originalText);
    const hasGroup = parsed.children.some((child) => child.type === 'group');
    if (!hasGroup) {
      return;
    }

    accumulateLengths(parsed);

    const fragment = document.createDocumentFragment();
    parsed.children.forEach((child) => {
      fragment.appendChild(createDomFromNode(child, 0, options, bucket, originalText));
    });

    textNode.replaceWith(fragment);
  }

  function process(root, userOptions = {}) {
    if (!root) return [];

    const options = Object.assign({}, DEFAULT_OPTIONS, userOptions);
    const spans = [];
    
    // Collect all text nodes first to avoid TreeWalker issues when replacing nodes
    const textNodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node = walker.nextNode();
    while (node) {
      if (!shouldSkipNode(node)) {
        textNodes.push(node);
      }
      node = walker.nextNode();
    }

    // Process all collected text nodes
    textNodes.forEach((textNode) => {
      processTextNode(textNode, options, spans);
    });

    return spans;
  }

  function collapseAll(root) {
    if (!root) return;
    root.querySelectorAll('.paren-group').forEach(collapseParenthesis);
  }

  function expandAll(root) {
    if (!root) return;
    root.querySelectorAll('.paren-group').forEach(expandParenthesis);
  }

  function disableCollapsing(root) {
    if (!root) return;
    // Expand all groups and mark them as non-collapsible
    root.querySelectorAll('.paren-group').forEach((span) => {
      expandParenthesis(span);
      expandAllLevels(span);
      span.dataset.collapsible = 'false';
      span.classList.add('paren-disabled');
    });
  }

  function enableCollapsing(root) {
    if (!root) return;
    // Remove disabled state and restore to persistent depths
    root.querySelectorAll('.paren-group').forEach((span) => {
      span.dataset.collapsible = 'true';
      span.classList.remove('paren-disabled');
      const persistentDepth = parseInt(span.dataset.persistentDepth || '0', 10);
      if (persistentDepth === 0) {
        // Fully collapse this group and all nested groups
        collapseParenthesis(span);
      } else {
        expandToDepth(span, persistentDepth, true);
      }
    });
  }

  function isCollapsingEnabled(root) {
    if (!root) return true;
    const firstGroup = root.querySelector('.paren-group');
    if (!firstGroup) return true;
    return firstGroup.dataset.collapsible !== 'false';
  }

  window.ParenCore = {
    process,
    collapse: collapseParenthesis,
    expand: expandParenthesis,
    toggle: toggleParenthesis,
    collapseAll,
    expandAll,
    isCollapsed,
    expandOneLevel,
    collapseOneLevel,
    expandAllLevels,
    expandToDepth,
    disableCollapsing,
    enableCollapsing,
    isCollapsingEnabled,
  };
})();
