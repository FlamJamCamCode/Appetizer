/* ============================================
   VIM EXTENSION - NORMAL MODE PRESET REGISTRATION
   ============================================ */

(function() {
    'use strict';

    if (!window.VimModePresets) {
        console.error('NormalMode: VimModePresets not loaded');
        return;
    }

    window.VimModePresets.ensurePreset(['default', 'tab', 'segment'], {
        modeName: 'normal',
        setAsDefault: true
    });
})();

