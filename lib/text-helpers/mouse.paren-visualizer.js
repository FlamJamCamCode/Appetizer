/* ============================================================================
   MouseParenVisualizer
   ---------------------------------------------------------------------------
   Lightweight hover + click behaviour for ParenCore.
   Hover temporarily expands a group while remembering its previous state.
   Clicking toggles the group permanently. Other interaction models (vim,
   keyboard, gamepad, etc.) should live in separate modules.
   ========================================================================= */

(function () {
  'use strict';

  if (!window.ParenCore) {
    console.warn('MouseParenVisualizer: ParenCore not found. Include paren-core.js first.');
    return;
  }

  const attached = new WeakSet();
  const hoverStates = new WeakMap();
  const hoverTimeouts = new WeakMap();
  const HOVER_DELAY = 1500; // 1.5 second delay before collapsing on hover leave

  function handleEnter(event) {
    const span = event.currentTarget;
    if (!span) return;
    
    // Skip if collapsing is disabled
    if (span.dataset.collapsible === 'false') {
      return;
    }
    
    // Clear any pending collapse timeout
    const timeout = hoverTimeouts.get(span);
    if (timeout) {
      clearTimeout(timeout);
      hoverTimeouts.delete(span);
    }
    
    // Save current persistent state (set by clicks, not hover)
    const persistentDepth = parseInt(span.dataset.persistentDepth || span.dataset.expandDepth || '0', 10);
    const wasCollapsed = span.dataset.state === 'collapsed' || window.ParenCore.isCollapsed(span);
    hoverStates.set(span, { depth: persistentDepth, wasCollapsed });
    
    span.classList.add('paren-hover');
    
    // On hover: temporarily expand just this specific parenthesis (not all nested ones)
    // This gives a preview of what's inside
    window.ParenCore.expand(span);
    // Expand its direct children to show what's inside
    const children = span.querySelectorAll(':scope > .paren-inner > .paren-group');
    children.forEach((child) => {
      window.ParenCore.expand(child);
      // But collapse grandchildren to keep it simple
      const grandChildren = child.querySelectorAll(':scope > .paren-inner > .paren-group');
      grandChildren.forEach((gc) => {
        window.ParenCore.collapse(gc);
      });
    });
  }

  function handleLeave(event) {
    const span = event.currentTarget;
    if (!span) return;
    
    // Clear any existing timeout
    const existingTimeout = hoverTimeouts.get(span);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set a delayed collapse
    const timeout = setTimeout(() => {
      // Check if still hovering (might have been clicked)
      if (!span.classList.contains('paren-hover')) {
        hoverTimeouts.delete(span);
        return;
      }
      
      span.classList.remove('paren-hover');
      
      // Restore to persistent state (set by clicks)
      const savedState = hoverStates.get(span);
      if (savedState !== undefined) {
        // Get the actual persistent depth (may have been updated by clicks during hover)
        const currentPersistentDepth = parseInt(span.dataset.persistentDepth || span.dataset.expandDepth || '0', 10);
        const isCurrentlyCollapsed = span.dataset.state === 'collapsed' || window.ParenCore.isCollapsed(span);
        
        if (currentPersistentDepth === 0) {
          // Fully collapsed, restore to collapsed (ensure all nested are collapsed too)
          window.ParenCore.collapse(span);
        } else {
          // Restore to current persistent depth (may have changed via clicks)
          // Pass true to respect persistent depth of children
          window.ParenCore.expandToDepth(span, currentPersistentDepth, true);
        }
        hoverStates.delete(span);
      }
      hoverTimeouts.delete(span);
    }, HOVER_DELAY);
    
    hoverTimeouts.set(span, timeout);
  }

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    const span = event.currentTarget;
    if (!span) return;
    
    // Skip if collapsing is disabled
    if (span.dataset.collapsible === 'false') {
      return;
    }
    
    // Cancel any pending hover collapse
    const timeout = hoverTimeouts.get(span);
    if (timeout) {
      clearTimeout(timeout);
      hoverTimeouts.delete(span);
    }
    
    // Remove hover class immediately
    span.classList.remove('paren-hover');
    
    // Left click: increment depth counter (expand one more nested level)
    if (event.button === 0 || !event.button) {
      // Get current persistent depth (the depth counter)
      let currentDepth = parseInt(span.dataset.persistentDepth || '0', 10);
      
      // If the parenthesis is currently collapsed, it's at depth 0
      // First click should expand it to depth 1
      if (span.dataset.state === 'collapsed' || window.ParenCore.isCollapsed(span)) {
        currentDepth = 0;
      }
      
      // Increment depth counter
      const newDepth = currentDepth + 1;
      
      // Immediately apply the new depth
      window.ParenCore.expandToDepth(span, newDepth, true);
      span.dataset.persistentDepth = String(newDepth);
      span.dataset.expandDepth = String(newDepth);
      
      // Update hover state if present
      const hoverState = hoverStates.get(span);
      if (hoverState) {
        hoverState.depth = newDepth;
      }
    }
  }

  function handleContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    const span = event.currentTarget;
    if (!span) return;
    
    // Skip if collapsing is disabled
    if (span.dataset.collapsible === 'false') {
      return;
    }
    
    // Cancel any pending hover collapse
    const timeout = hoverTimeouts.get(span);
    if (timeout) {
      clearTimeout(timeout);
      hoverTimeouts.delete(span);
    }
    
    // Remove hover class immediately
    span.classList.remove('paren-hover');
    
    // Right click: decrement depth counter (collapse one nested level)
    const currentDepth = parseInt(span.dataset.persistentDepth || span.dataset.expandDepth || '0', 10);
    
    if (currentDepth <= 0) {
      // Already at minimum, fully collapse
      window.ParenCore.collapse(span);
      span.dataset.persistentDepth = '0';
      span.dataset.expandDepth = '0';
    } else {
      // Decrement depth counter
      const newDepth = currentDepth - 1;
      window.ParenCore.expandToDepth(span, newDepth, true);
      span.dataset.persistentDepth = String(newDepth);
      span.dataset.expandDepth = String(newDepth);
    }
    
    // Update hover state if present
    const hoverState = hoverStates.get(span);
    if (hoverState) {
      hoverState.depth = parseInt(span.dataset.persistentDepth || '0', 10);
    }
  }

  function attachSpan(span) {
    if (!span || attached.has(span)) {
      return;
    }
    span.addEventListener('pointerenter', handleEnter);
    span.addEventListener('pointerleave', handleLeave);
    span.addEventListener('click', handleClick);
    span.addEventListener('contextmenu', handleContextMenu);
    attached.add(span);
  }

  function detachSpan(span) {
    if (!span || !attached.has(span)) {
      return;
    }
    span.removeEventListener('pointerenter', handleEnter);
    span.removeEventListener('pointerleave', handleLeave);
    span.removeEventListener('click', handleClick);
    span.removeEventListener('contextmenu', handleContextMenu);
    attached.delete(span);
  }

  function collect(root) {
    if (!root) return [];
    if (root.classList && root.classList.contains('paren-group')) {
      return [root, ...root.querySelectorAll('.paren-group')];
    }
    return Array.from(root.querySelectorAll('.paren-group'));
  }

  function attach(root) {
    collect(root).forEach(attachSpan);
  }

  function detach(root) {
    collect(root).forEach(detachSpan);
  }

  function refresh(root) {
    attach(root);
  }

  window.MouseParenVisualizer = {
    attach,
    refresh,
    detach,
  };
})();
