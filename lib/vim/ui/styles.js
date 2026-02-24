/* ============================================
   VIM EXTENSION - STYLES
   All CSS for vim extension components
   ============================================ */

(function() {
    'use strict';

    function injectStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* ============================================
               SEARCH BOX
               ============================================ */
            .vim-search-box {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                display: none;
                align-items: center;
                gap: 10px;
                z-index: 2147483500;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                font-family: monospace;
            }

            .vim-search-prompt {
                font-size: 18px;
                font-weight: bold;
                color: #4CAF50;
            }

            .vim-search-input {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 16px;
                outline: none;
                min-width: 300px;
            }

            .vim-search-input:focus {
                border-color: #4CAF50;
                background: rgba(255, 255, 255, 0.15);
            }

            .vim-search-hint {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
            }

            .vim-search-status {
                position: fixed;
                bottom: 70px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(76, 175, 80, 0.9);
                color: white;
                padding: 5px 15px;
                border-radius: 4px;
                display: none;
                z-index: 2147483500;
                font-family: monospace;
                font-size: 14px;
            }

            /* ============================================
               SEARCH HIGHLIGHTS
               ============================================ */
            .vim-search-highlight {
                background-color: ${window.VimConfig.searchHighlightColor};
                color: black;
                padding: 2px 0;
                border-radius: 2px;
            }

            .vim-search-highlight.vim-search-active {
                background-color: ${window.VimConfig.searchActiveColor};
                color: white;
                font-weight: bold;
            }

            /* ============================================
               FILTER BOX
               ============================================ */
            .vim-filter-box {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(33, 150, 243, 0.95);
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                display: none;
                align-items: center;
                gap: 10px;
                z-index: 2147483500;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                font-family: monospace;
            }

            .vim-filter-prompt {
                font-size: 16px;
                font-weight: bold;
            }

            .vim-filter-input {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.4);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 16px;
                outline: none;
                min-width: 300px;
            }

            .vim-filter-input:focus {
                border-color: white;
                background: rgba(255, 255, 255, 0.3);
            }

            .vim-filter-input::placeholder {
                color: rgba(255, 255, 255, 0.6);
            }

            .vim-filter-status {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.9);
                min-width: 100px;
            }

            .vim-filter-hint {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
            }

            /* ============================================
               LINK HINTS
               ============================================ */
            .vim-link-hint-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 2147483600;
            }

            .vim-link-hint {
                position: absolute;
                background: rgba(255, 255, 0, 0.92);
                color: black;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
                font-size: 12px;
                font-weight: bold;
                border: 1px solid rgba(0, 0, 0, 0.5);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                pointer-events: none;
                z-index: 2147483601;
                text-transform: lowercase;
            }

            .vim-hint-matched {
                color: red;
            }

            .vim-focus-hint {
                background: rgba(255, 152, 0, 0.95);
                border-color: rgba(204, 122, 0, 0.9);
                color: #1f1400;
                box-shadow: 0 4px 12px rgba(255, 152, 0, 0.35);
            }

            .vim-input-hint {
                background: rgba(59, 130, 246, 0.95);
                border-color: rgba(37, 99, 235, 0.9);
                color: #0b1220;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
            }

            /* ============================================
               FOCUS SCOPE OUTLINE
               ============================================ */
            .vim-focus-outline {
                position: absolute;
                border: 2px solid rgba(255, 152, 0, 0.8);
                box-shadow: 0 0 30px rgba(255, 152, 0, 0.35);
                border-radius: 14px;
                pointer-events: none;
                z-index: 2147483490;
                transition: all 0.12s ease;
                overflow: visible;
            }

            .vim-focus-active-scope {
                position: relative;
            }

            .vim-focus-outline::after {
                content: attr(data-focus-label);
                position: absolute;
                top: -34px;
                left: 0;
                background: rgba(255, 152, 0, 0.95);
                color: #1a1300;
                font-family: monospace;
                font-size: 12px;
                font-weight: bold;
                letter-spacing: 0.05em;
                padding: 4px 10px;
                border-radius: 999px;
                box-shadow: 0 10px 25px rgba(255, 152, 0, 0.35);
                pointer-events: none;
                text-transform: uppercase;
                white-space: nowrap;
                max-width: 340px;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .vim-focus-candidate {
                position: relative;
                outline: 3px solid rgba(255, 152, 0, 0.35);
                box-shadow: 0 0 30px rgba(255, 152, 0, 0.25);
                transition: outline-color 0.2s ease, box-shadow 0.2s ease;
            }

            .vim-focus-candidate::after {
                content: attr(data-focus-label);
                position: absolute;
                top: 6px;
                right: 10px;
                background: rgba(255, 152, 0, 0.85);
                color: #1a1300;
                font-family: monospace;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 999px;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                pointer-events: none;
            }

            /* ============================================
               HELP HINT
               ============================================ */
            .vim-help-hint {
                position: fixed;
                bottom: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 12px 15px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                z-index: 9999;
                max-width: 280px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .vim-help-hint kbd {
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
                font-size: 11px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            /* ============================================
               FILE NAVIGATOR - DIAGONAL BUTTON
               ============================================ */
            .vim-navigator-button {
                position: fixed;
                top: 0;
                left: 0;
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, rgba(138, 43, 226, 0.95), rgba(75, 0, 130, 0.95));
                clip-path: polygon(0 0, 100% 0, 0 100%);
                cursor: pointer;
                z-index: 9998;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 2px 2px 10px rgba(138, 43, 226, 0.3);
            }

            .vim-navigator-button:hover {
                background: linear-gradient(135deg, rgba(147, 51, 234, 1), rgba(88, 28, 135, 1));
                box-shadow: 3px 3px 15px rgba(138, 43, 226, 0.5);
                width: 85px;
                height: 85px;
            }

            .vim-navigator-button svg {
                position: absolute;
                top: 12px;
                left: 12px;
                color: white;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
            }

            .vim-navigator-button .button-hint {
                position: absolute;
                top: 80px;
                left: 0;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 6px 12px;
                border-radius: 0 4px 4px 0;
                font-size: 11px;
                font-family: monospace;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s;
                white-space: nowrap;
                z-index: 10000;
            }

            .vim-navigator-button:hover .button-hint {
                opacity: 1;
            }

            .vim-navigator-button .button-hint kbd {
                background: rgba(138, 43, 226, 0.5);
                padding: 2px 4px;
                border-radius: 2px;
                font-size: 10px;
            }

            /* ============================================
               FILE NAVIGATOR - OVERLAY
               ============================================ */
            .vim-file-navigator {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 10001;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .vim-file-navigator.active {
                opacity: 1;
                pointer-events: all;
            }

            .navigator-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
            }

            .navigator-panel {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                width: 90vw;
                height: 90vh;
                background: linear-gradient(135deg, 
                    rgba(20, 20, 40, 0.98) 0%,
                    rgba(30, 10, 50, 0.98) 100%);
                border-radius: 20px;
                border: 2px solid rgba(138, 43, 226, 0.4);
                box-shadow: 
                    0 20px 60px rgba(0, 0, 0, 0.6),
                    0 0 100px rgba(138, 43, 226, 0.3),
                    inset 0 1px 1px rgba(255, 255, 255, 0.1);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
            }

            .vim-file-navigator.active .navigator-panel {
                transform: translate(-50%, -50%) scale(1);
            }

            .navigator-content {
                display: flex;
                flex-direction: column;
                height: 100%;
                color: #f0f0f0;
            }

            /* ============================================
               NAVIGATOR - HEADER
               ============================================ */
            .navigator-header {
                padding: 25px 30px 20px;
                background: linear-gradient(180deg, 
                    rgba(138, 43, 226, 0.2) 0%,
                    transparent 100%);
                border-bottom: 1px solid rgba(138, 43, 226, 0.3);
                flex-shrink: 0;
            }

            .navigator-header h2 {
                margin: 0 0 12px 0;
                font-size: 26px;
                font-weight: 700;
                background: linear-gradient(135deg, #fff, #c084fc);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 0 0 30px rgba(138, 43, 226, 0.5);
            }

            .navigator-search {
                margin: 15px 0;
                padding: 12px 16px;
                background: rgba(0, 0, 0, 0.4);
                border: 2px solid rgba(138, 43, 226, 0.4);
                border-radius: 10px;
                font-family: monospace;
                font-size: 16px;
                min-height: 44px;
                display: flex;
                align-items: center;
            }

            .navigator-search .search-prompt {
                color: rgba(255, 255, 255, 0.9);
                flex: 1;
            }

            .navigator-search .search-cursor {
                color: #a78bfa;
                font-weight: bold;
                margin-left: 2px;
            }

            .navigator-search .search-cursor.blink {
                animation: cursor-blink 1s infinite;
            }

            @keyframes cursor-blink {
                0%, 49% { opacity: 1; }
                50%, 100% { opacity: 0; }
            }

            .navigator-hint {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
                margin-top: 8px;
                font-family: monospace;
            }

            .navigator-hint kbd {
                background: rgba(138, 43, 226, 0.3);
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 11px;
                border: 1px solid rgba(138, 43, 226, 0.4);
                color: #c084fc;
            }

            /* ============================================
               NAVIGATOR - GRID (Categories)
               ============================================ */
            .navigator-grid {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 25px 30px;
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                grid-template-rows: repeat(4, minmax(140px, 1fr));
                gap: 20px;
                align-content: start;
                scrollbar-width: thin;
                scrollbar-color: rgba(138, 43, 226, 0.5) transparent;
            }

            .navigator-grid::-webkit-scrollbar {
                width: 8px;
            }

            .navigator-grid::-webkit-scrollbar-track {
                background: transparent;
            }

            .navigator-grid::-webkit-scrollbar-thumb {
                background: rgba(138, 43, 226, 0.5);
                border-radius: 4px;
            }

            /* Category Cards */
            .category-card {
                position: relative;
                background: rgba(138, 43, 226, 0.15);
                border: 2px solid rgba(138, 43, 226, 0.3);
                border-radius: 15px;
                padding: 20px 15px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }

            .category-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, 
                    transparent,
                    rgba(138, 43, 226, 0.2),
                    transparent);
                transition: left 0.5s;
            }

            .category-card:hover::before {
                left: 100%;
            }

            .category-card:hover {
                background: rgba(138, 43, 226, 0.25);
                border-color: rgba(138, 43, 226, 0.5);
                transform: translateY(-5px) scale(1.02);
                box-shadow: 0 10px 30px rgba(138, 43, 226, 0.3);
            }

            .category-card.selected {
                background: linear-gradient(135deg, 
                    rgba(138, 43, 226, 0.5),
                    rgba(168, 85, 247, 0.5));
                border-color: rgba(138, 43, 226, 0.9);
                box-shadow: 
                    0 0 30px rgba(138, 43, 226, 0.5),
                    inset 0 1px 1px rgba(255, 255, 255, 0.2);
                transform: translateY(-8px) scale(1.05);
            }

            .category-number {
                position: absolute;
                top: 10px;
                right: 10px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 24px;
                height: 24px;
                background: rgba(138, 43, 226, 0.6);
                border-radius: 50%;
                font-size: 12px;
                font-weight: bold;
                color: white;
            }

            .category-card.selected .category-number {
                background: rgba(255, 255, 255, 0.9);
                color: #6b21a8;
            }

            .category-icon {
                font-size: 42px;
                margin-bottom: 12px;
                filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
            }

            .category-name {
                font-size: 16px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.95);
                margin-bottom: 6px;
            }

            .category-card.selected .category-name {
                color: white;
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            }

            .category-count {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.6);
                font-family: monospace;
            }

            .category-indicator {
                position: absolute;
                bottom: 10px;
                right: 10px;
                font-size: 20px;
                color: white;
                animation: indicator-pulse 1.5s ease-in-out infinite;
            }

            @keyframes indicator-pulse {
                0%, 100% { transform: translateX(0); opacity: 1; }
                50% { transform: translateX(5px); opacity: 0.7; }
            }

            /* ============================================
               NAVIGATOR - LIST (Items/Search)
               ============================================ */
            .navigator-list {
                flex: 1;
                overflow-y: auto;
                padding: 20px 30px;
                scrollbar-width: thin;
                scrollbar-color: rgba(138, 43, 226, 0.5) transparent;
            }

            .navigator-list::-webkit-scrollbar {
                width: 8px;
            }

            .navigator-list::-webkit-scrollbar-track {
                background: transparent;
            }

            .navigator-list::-webkit-scrollbar-thumb {
                background: rgba(138, 43, 226, 0.5);
                border-radius: 4px;
            }

            .navigator-list::-webkit-scrollbar-thumb:hover {
                background: rgba(138, 43, 226, 0.7);
            }

            /* Navigator Items */
            .navigator-item {
                display: flex;
                align-items: center;
                padding: 14px 18px;
                margin: 4px 0;
                background: rgba(138, 43, 226, 0.1);
                border: 2px solid transparent;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }

            .navigator-item::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, 
                    transparent,
                    rgba(138, 43, 226, 0.2),
                    transparent);
                transition: left 0.5s;
            }

            .navigator-item:hover::before {
                left: 100%;
            }

            .navigator-item:hover {
                background: rgba(138, 43, 226, 0.2);
                border-color: rgba(138, 43, 226, 0.4);
                transform: translateX(5px);
            }

            .navigator-item.selected {
                background: linear-gradient(90deg, 
                    rgba(138, 43, 226, 0.4),
                    rgba(168, 85, 247, 0.4));
                border-color: rgba(138, 43, 226, 0.8);
                box-shadow: 
                    0 0 20px rgba(138, 43, 226, 0.4),
                    inset 0 1px 1px rgba(255, 255, 255, 0.2);
                transform: translateX(8px) scale(1.02);
            }

            .item-number {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 24px;
                height: 24px;
                background: rgba(138, 43, 226, 0.6);
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
                margin-right: 12px;
                color: white;
            }

            .navigator-item.selected .item-number {
                background: rgba(255, 255, 255, 0.9);
                color: #6b21a8;
            }

            .item-icon {
                font-size: 24px;
                margin-right: 12px;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            }

            .item-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .item-title {
                font-size: 16px;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.95);
            }

            .navigator-item.selected .item-title {
                color: white;
                font-weight: 600;
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            }

            .item-desc, .item-category {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
                font-style: italic;
            }

            .navigator-item.selected .item-desc,
            .navigator-item.selected .item-category {
                color: rgba(255, 255, 255, 0.7);
            }

            .item-indicator {
                font-size: 20px;
                color: white;
                margin-left: 10px;
                animation: indicator-pulse 1.5s ease-in-out infinite;
            }

            /* ============================================
               NAVIGATOR - FOOTER
               ============================================ */
            .navigator-empty {
                padding: 60px 20px;
                text-align: center;
                color: rgba(255, 255, 255, 0.5);
                font-size: 18px;
            }

            .navigator-footer {
                padding: 12px 30px;
                background: rgba(0, 0, 0, 0.3);
                border-top: 1px solid rgba(138, 43, 226, 0.3);
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
                text-align: center;
                font-family: monospace;
                flex-shrink: 0;
            }

            /* ============================================
               RESPONSIVE
               ============================================ */
            @media (max-width: 1200px) {
                .navigator-panel {
                    width: 90vw;
                    height: 90vh;
                }
                
                .navigator-grid {
                    grid-template-columns: repeat(3, 1fr);
                    grid-template-rows: repeat(5, minmax(130px, 1fr));
                    gap: 18px;
                    padding: 20px 25px;
                }
                
                .category-icon {
                    font-size: 38px;
                }
                
                .category-name {
                    font-size: 15px;
                }
            }

            @media (max-width: 768px) {
                .navigator-panel {
                    width: 95vw;
                    height: 92vh;
                }
                
                .navigator-header {
                    padding: 18px 20px 12px;
                }
                
                .navigator-header h2 {
                    font-size: 20px;
                    margin-bottom: 8px;
                }
                
                .navigator-grid {
                    grid-template-columns: repeat(2, 1fr);
                    grid-template-rows: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 15px;
                    padding: 20px;
                }
                
                .category-card {
                    padding: 15px 10px;
                }
                
                .category-icon {
                    font-size: 32px;
                    margin-bottom: 8px;
                }
                
                .category-name {
                    font-size: 13px;
                }
                
                .category-count {
                    font-size: 11px;
                }
                
                .navigator-list {
                    padding: 15px 20px;
                }
                
                .navigator-footer {
                    padding: 10px 20px;
                    font-size: 11px;
                }
                
                .item-number, .category-number {
                    display: none;
                }
                
                .item-desc {
                    display: none;
                }
            }
        `;
        document.head.appendChild(styleElement);
    }

    // ============================================
    //  PUBLIC API
    // ============================================

    window.VimStyles = {
        inject: injectStyles
    };

    if (window.VimConfig.debug) {
        console.log('VimStyles: Styles ready');
    }

})();

