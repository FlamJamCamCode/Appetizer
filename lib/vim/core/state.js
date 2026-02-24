/* ============================================
   VIM EXTENSION - GLOBAL STATE
   Single source of truth for application state
   ============================================ */

window.VimState = {
    // Current mode
    mode: 'normal',
    baseMode: 'normal',
    activeLayout: 'default',
    
    // Multi-key command tracking
    lastKey: '',
    lastKeyTime: 0,
    prevKey: '',
    prevKeyTime: 0,

    escapeChord: {
        firstKeyTime: 0,
        firstKeyValue: '',
        target: null,
        snapshot: null
    },
    
    // Search state
    searchTerm: '',
    searchResults: [],
    currentSearchIndex: 0,
    
    // Filter state
    filterActive: false,
    
    // Focus stack
    focusStack: [],
    hintSelector: {
        active: false,
        mode: null,
        prefix: '',
        entries: [],
        container: null,
        timer: null,
        options: null
    },

    textInput: {
        active: false,
        target: null,
        subMode: 'normal',
        anchor: null,
        register: '',
        virtualColumn: null,
        layout: 'default',
        pendingCommand: null,
        pendingTimestamp: 0,
        commandCount: 0,
        pendingOperator: null
    },

    selectNavigation: {
        active: false,
        target: null,
        lastInteraction: 0
    },

    gridNavigation: {
        active: false,
        cells: [],
        columns: 0,
        rows: 0,
        index: -1
    },
    
    // File navigator state
    navigatorOpen: false,
    navigatorFiles: [],
    navigatorFilteredFiles: [],
    navigatorSelectedIndex: 0,
    navigatorSearchTerm: '',
    navigatorViewMode: 'categories',  // 'categories', 'category-items', 'search-results'
    navigatorCurrentCategory: null,
    navigatorCategories: {},
    
    // DOM element cache
    elements: {
        searchBox: null,
        filterBox: null,
        linkHintContainer: null,
        fileNavigator: null,
        navigatorButton: null,
        focusOutline: null,
        inputHintContainer: null,
        focusHintContainer: null
    }
};

