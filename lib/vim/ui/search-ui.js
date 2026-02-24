/* ============================================
   VIM EXTENSION - SEARCH UI COMPONENT
   Search box and status indicator
   ============================================ */

(function() {
    'use strict';

    function createSearchUI() {
        // Create search box
        const searchBox = document.createElement('div');
        searchBox.className = 'vim-search-box';
        searchBox.innerHTML = `
            <span class="vim-search-prompt">/</span>
            <input type="text" class="vim-search-input" placeholder="Search..." />
            <span class="vim-search-hint">Enter to search, jj or Esc to cancel</span>
        `;
        document.body.appendChild(searchBox);
        window.VimState.elements.searchBox = searchBox;

        // Create search status indicator
        const searchStatus = document.createElement('div');
        searchStatus.className = 'vim-search-status';
        document.body.appendChild(searchStatus);
    }

    window.SearchUI = {
        create: createSearchUI
    };

    if (window.VimConfig.debug) {
        console.log('SearchUI: Component ready');
    }

})();

