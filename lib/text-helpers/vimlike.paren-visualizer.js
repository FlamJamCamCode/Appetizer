/* ============================================================================
   VimlikeParenVisualizer (Scaffold)
   ---------------------------------------------------------------------------
   Future module for keyboard / vim-style navigation over ParenCore spans.
   Currently a stub that advertises the intended API surface.
   ========================================================================= */

(function () {
  'use strict';

  function init(options = {}) {
    console.info('VimlikeParenVisualizer: init stub invoked', options);
  }

  function focusNext() {
    console.info('VimlikeParenVisualizer: focusNext stub invoked');
  }

  function focusPrevious() {
    console.info('VimlikeParenVisualizer: focusPrevious stub invoked');
  }

  function toggleCurrent() {
    console.info('VimlikeParenVisualizer: toggleCurrent stub invoked');
  }

  function destroy() {
    console.info('VimlikeParenVisualizer: destroy stub invoked');
  }

  window.VimlikeParenVisualizer = {
    init,
    focusNext,
    focusPrevious,
    toggleCurrent,
    destroy,
  };
})();
