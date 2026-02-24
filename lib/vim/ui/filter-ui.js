/* ============================================
   VIM EXTENSION - FILTER UI COMPONENT
   Filter box for content filtering
   ============================================ */

(function() {
    'use strict';

    function createFilterUI() {
        const filterBox = document.createElement('div');
        filterBox.className = 'vim-filter-box';
        filterBox.innerHTML = `
            <span class="vim-filter-prompt">Filter:</span>
            <input type="text" class="vim-filter-input" placeholder="Type to filter content..." />
            <span class="vim-filter-status"></span>
            <span class="vim-filter-hint">Enter to apply, jj or Esc to clear</span>
        `;
        document.body.appendChild(filterBox);
        window.VimState.elements.filterBox = filterBox;
    }

    window.FilterUI = {
        create: createFilterUI
    };

    if (window.VimConfig.debug) {
        console.log('FilterUI: Component ready');
    }

})();

