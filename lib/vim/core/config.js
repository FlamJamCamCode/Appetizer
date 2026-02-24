/* ============================================
   VIM EXTENSION - CONFIGURATION
   Centralized configuration for all modes
   ============================================ */

window.VimConfig = {
    // Link hints
    linkHintChars: 'asdfgkl',  // Customisable via config

    // Keyboard layouts
    defaultLayout: 'default',
    
    // Search
    searchHighlightColor: '#ffeb3b',
    searchActiveColor: '#ff9800',
    
    // Timing
    commandDelay: 500,      // Multi-key commands like 'gi'
    hintCommitDelay: 1200,  // ms before auto-committing exact hint matches
    
    // Escape chord (double-key exit)
    escapeChord: {
        enabled: true,
        combo: 'ee',        // Press twice quickly to escape
        delay: 160,         // ms between presses
        restoreInput: true  // Restore text input snapshot when triggered
    },
    jjEscapeDelay: 160,      // Legacy compatibility (mirrors escapeChord.delay)

    // File Navigator
    lobbyManifest: [],      // Custom lobby list (empty = use defaults)
    autoDetectLobbies: true,
    navigatorAnimation: 'slide',
    
    // Visual
    modalSize: {
        width: '90vw',
        height: '90vh'
    },
    gridColumns: 4,         // 4x4 grid for categories

    // Scrolling behaviour
    scroll: {
        tapDistance: 24,     // pixels per tap for j/k
        chunkDistance: 80,   // pixels per tap for d/u
        holdDelay: 160,      // ms before continuous scroll kicks in
        velocity: 600,       // pixels per second for j/k hold
        chunkVelocity: 900,  // pixels per second for d/u hold
        horizontalVelocity: 500 // optional horizontal scroll velocity
    },
    
    // Debug
    debug: false
};

