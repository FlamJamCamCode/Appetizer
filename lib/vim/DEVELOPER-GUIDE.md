
# ðŸ‘¨â€ðŸ’» Vim Extension - Developer Guide

## Professional JavaScript Development with Modular Modes

This guide shows you how to work with the modular vim extension system.

---

## ðŸ“ Project Structure

```
lib/vim/
â”œâ”€â”€ core/                   â†’ Core system (don't touch unless needed)
â”‚   â”œâ”€â”€ config.js          â†’ Global settings
â”‚   â”œâ”€â”€ state.js           â†’ Application state
â”‚   â”œâ”€â”€ mode-manager.js    â†’ Mode orchestration
â”‚   â””â”€â”€ utils.js           â†’ Shared utilities
â”œâ”€â”€ modes/                  â†’ Add your modes here!
â”‚   â”œâ”€â”€ normal.js          â†’ Default navigation
â”‚   â”œâ”€â”€ search.js          â†’ Text search
â”‚   â”œâ”€â”€ filter.js          â†’ Content filtering
â”‚   â”œâ”€â”€ link-hint.js       â†’ Link selection
â”‚   â””â”€â”€ file-navigator.js  â†’ File navigation
â”œâ”€â”€ ui/                     â†’ UI components
â”‚   â”œâ”€â”€ styles.js          â†’ All CSS
â”‚   â”œâ”€â”€ search-ui.js       â†’ Search box
â”‚   â”œâ”€â”€ filter-ui.js       â†’ Filter box
â”‚   â”œâ”€â”€ navigator-ui.js    â†’ File navigator
â”‚   â””â”€â”€ modal-link-hints.js â†’ Modal link hints
â”œâ”€â”€ main.js                 â†’ Initialization
â””â”€â”€ README.md               â†’ Architecture docs
```

---

## ðŸŽ¯ Common Tasks

### 1. Change a Keyboard Shortcut

**Example: Change 'f' to 'F' for link hints**

```javascript
// File: lib/vim/modes/normal.js
// Line: ~25

keybindings: {
    // Before
    'f': () => window.VimModeManager.enterMode('link-hint'),
    
    // After
    'F': () => window.VimModeManager.enterMode('link-hint'),
}
```

Save. Reload page. Done!

### 2. Add a New Keyboard Shortcut

**Example: Add 'x' to close search results in normal mode**

```javascript
// File: lib/vim/modes/normal.js

keybindings: {
    // ... existing keys ...
    
    // Add this:
    'x': () => {
        window.VimUtils.clearSearchHighlights();
        window.VimState.searchResults = [];
    }
}
```

### 3. Modify a Mode's Behavior

**Example: Make search case-sensitive**

```javascript
// File: lib/vim/modes/search.js
// Function: performSearch()

// Before
const regex = new RegExp(window.VimUtils.escapeRegex(searchTerm), 'gi');

// After (remove 'i' flag)
const regex = new RegExp(window.VimUtils.escapeRegex(searchTerm), 'g');
```

### 4. Change Visual Styling

**Example: Change file navigator color from purple to blue**

```javascript
// File: lib/vim/ui/styles.js
// Search for: rgba(138, 43, 226

// Replace all instances with blue:
rgba(59, 130, 246  // Tailwind blue-500
```

### 5. Add Configuration Option

**Example: Make jj timing configurable**

```javascript
// File: lib/vim/core/config.js

window.VimConfig = {
    // ... existing config ...
    
    jjEscapeDelay: 150,  // Already there! Just change the value
};
```

---

## ðŸ†• Creating a New Mode

### Example: Command Mode (`:` like vim)

**Step 1: Create the mode file**

```javascript
// File: lib/vim/modes/command.js

(function() {
    'use strict';

    const commandMode = {
        keybindings: {
            'Enter': () => {
                const cmd = window.VimState.elements.commandBox
                    .querySelector('.vim-command-input').value;
                executeCommand(cmd);
                window.VimModeManager.exitMode();
            },
            
            'Escape': () => window.VimModeManager.exitMode()
        },
        
        allowTyping: true,
        allowedKeys: ['Enter', 'Escape'],
        
        isInputFocused: (e) => {
            return e.target.classList.contains('vim-command-input');
        },
        
        onEnter: () => {
            createCommandBox();
            window.VimState.elements.commandBox.style.display = 'flex';
            window.VimState.elements.commandBox.querySelector('.vim-command-input').focus();
        },
        
        onExit: () => {
            window.VimState.elements.commandBox.style.display = 'none';
        }
    };

    function createCommandBox() {
        if (window.VimState.elements.commandBox) return;
        
        const box = document.createElement('div');
        box.className = 'vim-command-box';
        box.innerHTML = `
            <span class="vim-command-prompt">:</span>
            <input type="text" class="vim-command-input" placeholder="command" />
        `;
        document.body.appendChild(box);
        window.VimState.elements.commandBox = box;
    }

    function executeCommand(cmd) {
        // Parse and execute
        console.log('Command:', cmd);
    }

    window.VimModeManager.registerMode('command', commandMode);
})();
```

**Step 2: Add trigger in normal mode**

```javascript
// File: lib/vim/modes/normal.js

keybindings: {
    // ... existing ...
    
    ':': () => window.VimModeManager.enterMode('command')
}
```

**Step 3: Add to loader**

```javascript
// File: lib/nav-vimlike.js

const modules = [
    // ... existing modules ...
    'vim/modes/command.js',  // Add here
    'vim/main.js'
];
```

**Step 4: Add styles (optional)**

```javascript
// File: lib/vim/ui/styles.js

// Add CSS for command box
.vim-command-box {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    /* ... styles ... */
}
```

**Done!** Press `:` to open command mode!

---

## ðŸ” Debugging Guide

### Enable Debug Mode

```javascript
// In browser console
window.VimConfig.debug = true;

// Or permanently in config.js:
debug: true
```

### Common Issues

**Problem:** Keys not working

**Solution:**
1. Check mode is registered (console shows "Registered")
2. Check keybinding is defined in mode
3. Check no typos in key name
4. Check event.preventDefault() is called

**Problem:** Typing triggers navigation

**Solution:**
1. Check mode has `allowTyping: true`
2. Check `isInputFocused()` returns true
3. Check navigation keys NOT in `allowedKeys`

**Problem:** Mode won't exit

**Solution:**
1. Check `onExit()` is defined
2. Check Escape is in keybindings
3. Check jj escape timing (150ms is tight!)

### Inspect Current State

```javascript
// Browser console
window.VimState.mode              // Current mode
window.VimState                   // All state
window.VimConfig                  // All config
window.VimModeManager.getModeRegistry()  // All modes
```

---

## ðŸ“ Code Style Guide

### File Structure
```javascript
/* ============================================
   HEADER COMMENT
   What this file does
   ============================================ */

(function() {
    'use strict';

    // ============================================
    //  SECTION HEADING
    // ============================================

    function myFunction() {
        // Code here
    }

    // ============================================
    //  PUBLIC API
    // ============================================

    window.MyModule = {
        publicFunction: myFunction
    };

})();
```

### Naming
- **Files:** `kebab-case.js`
- **Functions:** `camelCase()`
- **Global APIs:** `PascalCase` (window.VimConfig)
- **CSS Classes:** `kebab-case` with namespace (`.vim-search-box`)

### Comments
- Section headers: `/* ==== SECTION ==== */`
- Subsections: `// ---- Subsection ----`
- Complex logic: Inline comments
- Public APIs: Doc comments (optional)

---

## ðŸŽ¯ Best Practices

### DO âœ…

1. **Keep modes focused**
   - One responsibility per mode
   - < 200 lines per file

2. **Use the mode manager**
   ```javascript
   // Good
   window.VimModeManager.enterMode('search');
   
   // Bad
   window.VimState.mode = 'search';  // Skips onEnter/onExit!
   ```

3. **Clean up in onExit**
   ```javascript
   onExit: () => {
       removeEventListeners();
       clearDOM();
       resetState();
   }
   ```

4. **Use config for values**
   ```javascript
   // Good
   if (now - last < window.VimConfig.jjEscapeDelay)
   
   // Bad
   if (now - last < 150)  // Magic number!
   ```

5. **Prevent default on handled keys**
   ```javascript
   keybindings: {
       'h': (e) => {
           // e.preventDefault() called automatically by mode manager!
           navigate();
       }
   }
   ```

### DON'T âŒ

1. **Don't pollute global scope**
   ```javascript
   // Bad
   var myVariable = 123;
   
   // Good
   (function() {
       const myVariable = 123;  // Scoped
   })();
   ```

2. **Don't skip mode manager**
   ```javascript
   // Bad
   window.VimState.mode = 'search';
   
   // Good
   window.VimModeManager.enterMode('search');
   ```

3. **Don't hardcode**
   ```javascript
   // Bad
   if (delay < 150)
   
   // Good
   if (delay < window.VimConfig.jjEscapeDelay)
   ```

4. **Don't modify state from multiple places**
   ```javascript
   // Bad (in random file)
   window.VimState.searchResults = [];
   
   // Good (in mode file or public API)
   window.SearchMode.clear();
   ```

---

## ðŸ”§ Advanced Customization

### Custom Mode with Sub-Modes

```javascript
const myMode = {
    keybindings: {},  // Set dynamically
    
    onEnter: () => {
        window.VimState.mySubMode = 'view1';
        setKeybindingsForSubMode('view1');
    },
    
    // Custom handler
    handleTyping: (e) => {
        if (e.key === 'x') {
            window.VimState.mySubMode = 'view2';
            setKeybindingsForSubMode('view2');
            return true;  // Handled
        }
        return false;  // Not handled
    }
};

function setKeybindingsForSubMode(subMode) {
    const mode = window.VimModeManager.getModeRegistry()['my-mode'];
    mode.keybindings = getKeybindingsFor(subMode);
}
```

See `file-navigator.js` for real example!

---

## ðŸ“Š Performance Tips

### Efficient Mode Switching
```javascript
// Good - Direct switch
window.VimModeManager.enterMode('search');

// Avoid - Multiple switches
window.VimModeManager.exitMode();
window.VimModeManager.enterMode('search');
```

### Cache DOM Elements
```javascript
// Good - Cache in state.elements
window.VimState.elements.searchBox = document.querySelector(...)

// Bad - Query every time
document.querySelector('.vim-search-box')
```

### Lazy Rendering
```javascript
onEnter: () => {
    // Create UI only when mode is entered
    createUI();
},

onExit: () => {
    // Clean up
    removeUI();
}
```

---

## ðŸ§ª Testing Your Changes

### Manual Testing
```
1. Make changes
2. Reload page
3. Open browser console (F12)
4. Check for errors
5. Test the mode
6. Verify onEnter/onExit work
7. Test input protection (if applicable)
8. Test jj escape
```

### Console Testing
```javascript
// Enter your mode
window.VimModeManager.enterMode('my-mode');

// Check state
window.VimState.mode  // Should be 'my-mode'

// Trigger keybinding manually
const mode = window.VimModeManager.getModeRegistry()['my-mode'];
mode.keybindings['x']();  // Test 'x' key handler

// Exit
window.VimModeManager.exitMode();
```

---

## ðŸ“– Further Reading

- `lib/vim/README.md` - Architecture overview
- `MODULAR-REFACTOR.md` - Migration guide
- `VIM-EXTENSION-README.md` - User documentation
- Source code - It's clean and commented!

---

## ðŸŽ“ Learning Path

### Beginner
1. Read `lib/vim/README.md`
2. Look at `normal.js` (simplest mode)
3. Try changing a keybinding
4. Reload and test

### Intermediate
1. Read `mode-manager.js`
2. Understand mode registration
3. Create a simple custom mode
4. Add it to the system

### Advanced
1. Read `file-navigator.js` (complex mode with sub-views)
2. Understand dynamic keybindings
3. Create complex mode with sub-modes
4. Contribute back!

---

## ðŸ’¡ Tips & Tricks

### Quick Edit Workflow
```bash
# Edit a mode
vim lib/vim/modes/normal.js

# Reload browser
# Test immediately
```

### Debug a Specific Mode
```javascript
// Add at top of mode file
console.log('MyMode: Loading...');

// In keybinding handlers
'h': () => {
    console.log('H key pressed in MyMode');
    doThing();
}
```

### Override Default Behavior
```javascript
// In your HTML, before loading vim extension
window.VimConfig.jjEscapeDelay = 200;  // Custom timing
window.VimConfig.gridColumns = 5;      // 5x5 grid
```

---

## ðŸš€ Quick Reference

### Mode Definition Template
```javascript
const myMode = {
    keybindings: {
        'key': () => action()
    },
    allowTyping: false,
    allowedKeys: [],
    onEnter: () => {},
    onExit: () => {},
    isInputFocused: (e) => false
};

window.VimModeManager.registerMode('my-mode', myMode);
```

### Switch Modes
```javascript
window.VimModeManager.enterMode('mode-name');
window.VimModeManager.exitMode();  // Back to normal
```

### Access State
```javascript
window.VimState.mode           // Current mode
window.VimState.elements       // DOM cache
window.VimConfig.debug         // Debug flag
```

---

**Happy coding! Build amazing vim modes!** ðŸŽ¯âœ¨


