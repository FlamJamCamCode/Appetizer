/* ============================================
   VIM EXTENSION - NAVIGATOR UI COMPONENT
   File navigator rendering and UI
   ============================================ */

(function() {
    'use strict';

    // ============================================
    //  CREATE NAVIGATOR
    // ============================================

    function createNavigator() {
        // Create overlay
        const navigator = document.createElement('div');
        navigator.className = 'vim-file-navigator';
        navigator.innerHTML = `
            <div class="navigator-backdrop"></div>
            <div class="navigator-panel">
                <div class="navigator-content"></div>
            </div>
        `;
        document.body.appendChild(navigator);
        window.VimState.elements.fileNavigator = navigator;

        // Create diagonal button
        const button = document.createElement('div');
        button.className = 'vim-navigator-button';
        button.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span class="button-hint">Press <kbd>Shift+O</kbd></span>
        `;
        document.body.appendChild(button);
        window.VimState.elements.navigatorButton = button;

        // Event listeners
        button.addEventListener('click', () => {
            window.VimModeManager.enterMode('file-navigator');
        });

        navigator.querySelector('.navigator-backdrop').addEventListener('click', () => {
            if (window.VimState.navigatorOpen) {
                window.VimModeManager.exitMode();
            }
        });
    }

    // ============================================
    //  RENDER SYSTEM
    // ============================================

    function render() {
        const content = window.VimState.elements.fileNavigator.querySelector('.navigator-content');
        
        if (window.VimState.navigatorViewMode === 'categories') {
            renderCategories(content);
        } else if (window.VimState.navigatorViewMode === 'category-items') {
            renderCategoryItems(content);
        } else {
            renderSearchResults(content);
        }
    }

    function renderCategories(content) {
        const categoryKeys = Object.keys(window.VimState.navigatorCategories).sort();
        
        let html = `
            <div class="navigator-header">
                <h2>🗂️ Select Category</h2>
                <div class="navigator-hint">
                    <kbd>hjkl</kbd> 2D navigate • 
                    <kbd>Enter</kbd> drill in • 
                    <kbd>/</kbd> search • 
                    <kbd>f</kbd> hints • 
                    <kbd>1-9</kbd> jump • 
                    <kbd>jj</kbd>/<kbd>Esc</kbd> close
                </div>
            </div>
            <div class="navigator-grid">
        `;

        if (categoryKeys.length === 0) {
            html += '<div class="navigator-empty">No categories available.</div>';
        } else {
            categoryKeys.forEach((category, index) => {
                const items = window.VimState.navigatorCategories[category];
                const isSelected = index === window.VimState.navigatorSelectedIndex;
                const icon = items[0]?.icon || '📁';
                const number = index < 9 ? `<span class="category-number">${index + 1}</span>` : '';
                
                html += `
                    <div class="category-card ${isSelected ? 'selected' : ''}" data-index="${index}">
                        ${number}
                        <div class="category-icon">${icon}</div>
                        <div class="category-name">${category}</div>
                        <div class="category-count">${items.length} ${items.length === 1 ? 'lobby' : 'lobbies'}</div>
                        ${isSelected ? '<div class="category-indicator">→</div>' : ''}
                    </div>
                `;
            });
        }

        html += '</div>';
        html += `
            <div class="navigator-footer">
                ${categoryKeys.length} categories • ${window.VimState.navigatorFiles.length} total lobbies
            </div>
        `;

        content.innerHTML = html;

        // Click handlers
        content.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = categoryKeys[parseInt(card.dataset.index)];
                window.FileNavigatorMode.enterCategory(category);
            });
        });
    }

    function renderCategoryItems(content) {
        const items = window.VimState.navigatorCategories[window.VimState.navigatorCurrentCategory] || [];
        const categoryIcon = items[0]?.icon || '📁';
        
        let html = `
            <div class="navigator-header">
                <h2>${categoryIcon} ${window.VimState.navigatorCurrentCategory}</h2>
                <div class="navigator-hint">
                    <kbd>h</kbd> back • 
                    <kbd>jkl</kbd> navigate • 
                    <kbd>Enter</kbd> open • 
                    <kbd>/</kbd> search • 
                    <kbd>f</kbd> hints • 
                    <kbd>1-9</kbd> jump
                </div>
            </div>
            <div class="navigator-list">
        `;

        items.forEach((lobby, index) => {
            const isSelected = index === window.VimState.navigatorSelectedIndex;
            const number = index < 9 ? `<span class="item-number">${index + 1}</span>` : '';
            
            html += `
                <div class="navigator-item ${isSelected ? 'selected' : ''}" data-index="${index}">
                    ${number}
                    <span class="item-icon">${lobby.icon}</span>
                    <div class="item-content">
                        <span class="item-title">${lobby.title.substring(lobby.title.indexOf(' ') + 1)}</span>
                        <span class="item-desc">${lobby.desc || ''}</span>
                    </div>
                    ${isSelected ? '<span class="item-indicator">→</span>' : ''}
                </div>
            `;
        });

        html += '</div>';
        html += `
            <div class="navigator-footer">
                ${items.length} ${items.length === 1 ? 'lobby' : 'lobbies'} in ${window.VimState.navigatorCurrentCategory}
            </div>
        `;

        content.innerHTML = html;

        content.querySelectorAll('.navigator-item').forEach(item => {
            item.addEventListener('click', () => {
                window.VimState.navigatorSelectedIndex = parseInt(item.dataset.index);
                window.FileNavigatorMode.openSelectedFile();
            });
        });
    }

    function renderSearchResults(content) {
        let html = `
            <div class="navigator-header">
                <h2>🔍 Search Results</h2>
                <div class="navigator-search">
                    <span class="search-prompt">${window.VimState.navigatorSearchTerm}</span>
                    <span class="search-cursor blink">|</span>
                </div>
                <div class="navigator-hint">
                    <kbd>h</kbd> back • 
                    <kbd>jkl</kbd> navigate • 
                    <kbd>Enter</kbd> open • 
                    <kbd>f</kbd> hints • 
                    <kbd>Backspace</kbd> edit • 
                    <kbd>1-9</kbd> jump
                </div>
            </div>
            <div class="navigator-list">
        `;

        if (window.VimState.navigatorFilteredFiles.length === 0) {
            html += '<div class="navigator-empty">No lobbies found matching your search.</div>';
        } else {
            window.VimState.navigatorFilteredFiles.forEach((lobby, index) => {
                const isSelected = index === window.VimState.navigatorSelectedIndex;
                const number = index < 9 ? `<span class="item-number">${index + 1}</span>` : '';
                
                html += `
                    <div class="navigator-item ${isSelected ? 'selected' : ''}" data-index="${index}">
                        ${number}
                        <span class="item-icon">${lobby.icon}</span>
                        <div class="item-content">
                            <span class="item-title">${lobby.title.substring(lobby.title.indexOf(' ') + 1)}</span>
                            <span class="item-category">${lobby.category}</span>
                        </div>
                        ${isSelected ? '<span class="item-indicator">→</span>' : ''}
                    </div>
                `;
            });
        }

        html += '</div>';
        html += `
            <div class="navigator-footer">
                ${window.VimState.navigatorFilteredFiles.length} ${window.VimState.navigatorFilteredFiles.length === 1 ? 'match' : 'matches'} for "${window.VimState.navigatorSearchTerm}"
            </div>
        `;

        content.innerHTML = html;

        content.querySelectorAll('.navigator-item').forEach(item => {
            item.addEventListener('click', () => {
                window.VimState.navigatorSelectedIndex = parseInt(item.dataset.index);
                window.FileNavigatorMode.openSelectedFile();
            });
        });
    }

    // ============================================
    //  CREATE NAVIGATOR
    // ============================================

    function createNavigator() {
        // Create overlay
        const navigator = document.createElement('div');
        navigator.className = 'vim-file-navigator';
        navigator.innerHTML = `
            <div class="navigator-backdrop"></div>
            <div class="navigator-panel">
                <div class="navigator-content"></div>
            </div>
        `;
        document.body.appendChild(navigator);
        window.VimState.elements.fileNavigator = navigator;

        // Create diagonal button
        const button = document.createElement('div');
        button.className = 'vim-navigator-button';
        button.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span class="button-hint">Press <kbd>Shift+O</kbd></span>
        `;
        document.body.appendChild(button);
        window.VimState.elements.navigatorButton = button;

        // Event listeners
        button.addEventListener('click', () => {
            window.VimModeManager.enterMode('file-navigator');
        });

        navigator.querySelector('.navigator-backdrop').addEventListener('click', () => {
            if (window.VimState.navigatorOpen) {
                window.VimModeManager.exitMode();
            }
        });
    }

    // ============================================
    //  PUBLIC API
    // ============================================

    window.NavigatorUI = {
        create: createNavigator,
        render: render
    };

    if (window.VimConfig.debug) {
        console.log('NavigatorUI: Component ready');
    }

})();

