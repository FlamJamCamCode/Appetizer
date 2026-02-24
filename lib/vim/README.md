
# ðŸ—ï¸ Vim Extension - Modular Architecture

## Professional, Extensible, Mode-Based System

This is a **production-grade modular JavaScript system** for vim-style keyboard navigation. Each mode is self-contained, easy to understand, and simple to extend.

---

## ðŸ“ File Structure

```
lib/vim/
â”œâ”€â”€ core/
â”‚   â”œâ”€â”€ config.js          - Global configuration
â”‚   â”œâ”€â”€ state.js           - Application state
â”‚   â”œâ”€â”€ mode-manager.js    - Mode registration & switching
â”‚   â”œâ”€â”€ focus-manager.js   - Focus scope stack & overlay
â”‚   â”œâ”€â”€ hint-engine.js     - Shared hint selection pipeline
â”‚   â””â”€â”€ utils.js           - Shared utilities
â”œâ”€â”€ modes/
â”‚   â”œâ”€â”€ normal.js          - Normal navigation mode
â”‚   â”œâ”€â”€ search.js          - Text search mode
â”‚   â”œâ”€â”€ filter.js          - Content filtering mode
â”‚   â”œâ”€â”€ link-hint.js       - Vimium-style link selection
â”‚   â”œâ”€â”€ input-focus.js     - Input focus & hint selection
â”‚   â”œâ”€â”€ focus-select.js    - Scope selector (gg)
â”‚   â””â”€â”€ file-navigator.js  - Lobby file navigation
â”œâ”€â”€ ui/
â”‚   â”œâ”€â”€ styles.js          - All CSS (injected dynamically)
â”‚   â”œâ”€â”€ search-ui.js       - Search box component
â”‚   â”œâ”€â”€ filter-ui.js       - Filter box component
â”‚   â”œâ”€â”€ navigator-ui.js    - File navigator component
â”‚   â””â”€â”€ modal-link-hints.js - Link hints for modal
â”œâ”€â”€ main.js                - Initialization orchestration
â””â”€â”€ README.md              - This file

../nav-vimlike.js - Single-file loader (include this in HTML)
```

---

## ðŸŽ¯ How It Works

### Mode System Architecture

Each mode is **completely self-contained** with:

```javascript
const myMode = {
    // Define ONLY keys this mode uses
    keybindings: {
        'h': () => doSomething(),
        'Escape': () => exitMode()
    },
    
    // Allow typing in input fields?
    allowTyping: false,
    
    // Which keys work even when typing?
    allowedKeys: ['Escape', 'Enter'],
    
    // What happens when entering this mode
    onEnter: () => {
        showUI();
    },
    
    // What happens when exiting
    onExit: () => {
        hideUI();
    },
    
    // Is user focused in an input field?
    isInputFocused: (e) => {
        return e.target.classList.contains('my-input');
    }
};

// Register it
window.VimModeManager.registerMode('my-mode', myMode);
```

### Shared Hint Engine

Selector-style modes (`link-hint`, `focus-select`, `input-focus`) delegate to `core/hint-engine.js` for all hint generation and matching logic.

The engine provides:
- Label generation and overlay container management
- Prefix matching with highlight updates
- Auto-commit timers and backspace handling
- Lifecycle hooks (`onCommit`, `onCancel`, `onUpdate`) for mode-specific behaviour

Modes only need to supply:
- A list of elements to target (or `{ element, meta }` objects)
- Custom styling classes for hints
- Commit/cancel callbacks (e.g. click element, replace focus scope)

### Focus-aware Normal Modes

The focus manager can auto-switch the "base" normal mode depending on the active scope:

- Add `data-vim-mode="normal-game"` (or any registered mode name) on a focus scope element to activate a specialized normal mode while that scope is on top of the stack.
- When the scope is popped (or `Esc` is pressed), the base mode reverts to the default `normal` behaviour automatically.
- `jj` escape can be disabled per mode by exporting `jjEscape: false` in the mode definition (e.g. minigames can reuse `jj` freely while keeping `Esc` as the universal exit).
- You can compose behaviour presets by listing components, e.g. `data-vim-mode="default tab segment"` picks the default navigation plus tab and segment helpers, while `data-vim-mode="default"` removes the tab/segment extras inside a nested scope.

### Mode Manager

The mode manager handles:
- âœ… Mode registration
- âœ… Mode switching (with onEnter/onExit callbacks)
- âœ… Key routing (only registered keys work)
- âœ… Input protection (typing vs navigation)
- âœ… jj escape (universal across modes)

---

## ðŸš€ Adding a New Mode

### Step 1: Create Mode File

Create `lib/vim/modes/my-new-mode.js`:

```javascript
(function() {
    'use strict';

    const myNewMode = {
        keybindings: {
            'x': () => console.log('X pressed!'),
            'Escape': () => window.VimModeManager.exitMode()
        },
        
        allowTyping: false,
        
        onEnter: () => {
            console.log('Entered my mode!');
        },
        
        onExit: () => {
            console.log('Exited my mode');
        },
        
        isInputFocused: () => false
    };

    window.VimModeManager.registerMode('my-new-mode', myNewMode);
})();
```

### Step 2: Add to Loader

Edit `lib/nav-vimlike.js`:

```javascript
const modules = [
    // ... existing modules ...
    'vim/modes/my-new-mode.js',  // Add your mode here
    'vim/main.js'
];
```

### Step 3: Trigger It

From another mode:

```javascript
'x': () => window.VimModeManager.enterMode('my-new-mode')
```

**That's it!** Your mode is fully integrated.

---

## ðŸ“š Mode Definitions

### 1. **Normal Mode** (`normal.js`)
**Default mode** - Page navigation

**Keys:**
- `hjkl` - Navigate tabs/sections
- `f` - Link hints
- `\\` - Filter mode (content removal)
- `/` - Search mode (highlight matches)
- `Shift+O` - File navigator
- `gi` - Input focus mode (focus first input field)
- `gg` - Focus selector (scope hints)
- `g0` - Reset focus to whole page
- `1-3` - Jump to tabs
- `n/N` - Search results navigation

**Properties:**
- `allowTyping`: false
- `isInputFocused`: always false

---

### 2. **Search Mode** (`search.js`)
**Text search** with highlighting

**Keys (in input):**
- `Enter` - Perform search
- `Escape` - Exit
- `jj` - Quick exit
- (All other keys type normally)

**Properties:**
- `allowTyping`: true
- `allowedKeys`: ['Enter', 'Escape']
- `isInputFocused`: checks for `.vim-search-input`

---

### 3. **Filter Mode** (`filter.js`)
**Content filtering**

**Keys (in input):**
- `Enter` - Apply filter
- `Escape` - Clear and exit
- `jj` - Quick exit
- (All other keys type normally)

**Properties:**
- `allowTyping`: true
- `allowedKeys`: ['Enter', 'Escape']
- `isInputFocused`: checks for `.vim-filter-input`

---

### 3b. **Input Focus Mode** (`input-focus.js`)
**Focus an input/textarea/select for typing**

**Keys:**
- `gi` - Enter input focus mode from normal
- `letters` - Choose a specific input via hint labels
- `Enter` - Submit input (remains focused)
- `Escape` - Exit and blur input
- `jj` - Quick exit (blur input)

**Properties:**
- `allowTyping`: true
- Automatically focuses the first input/textarea/select/contenteditable within the current scope
- Shows home-row hint overlays when multiple inputs exist
- Supports contenteditable regions, sliders, selects, etc.

---

### 4. **Focus Select Mode** (`focus-select.js`)
**Scope selection**

**Keys:**
- `gg` + letters - Choose scope via hints
- `Enter` - Activate first visible hint
- `Backspace` - Delete last hint character
- `Escape/jj` - Cancel and return to normal

**Properties:**
- `allowTyping`: false (keys captured via `handleTyping`)
- Prioritises large, interactive regions (sections/forms/dashboards)
- Highlights candidate scopes with subtle borders + labels
- Updates `VimFocus` scope for search, filter, link hints, input focus

---

### 5. **Link Hint Mode** (`link-hint.js`)
**Vimium-style link selection**

**Keys:**
- `asdfgkl` - Type hint letters
- `Escape` - Cancel
- `jj` - Quick cancel

**Properties:**
- `allowTyping`: false
- `keybindings`: Dynamically generated for hint chars

**Note:** Keybindings are created in `onEnter` based on available links

---

### 6. **File Navigator Mode** (`file-navigator.js`)
**Hierarchical lobby navigation**

**Has 3 sub-views:**
- **Categories** (4x4 grid)
- **Category Items** (list)
- **Search Results** (filtered list)

**Keys (categories):**
- `hjkl` - 2D grid navigation
- `Enter` - Drill into category
- `/` - Search
- `f` - Link hints
- `1-9` - Quick jump

**Keys (items):**
- `jk` - Navigate list
- `h` - Back to categories
- `l` - Open selected
- `Enter` - Open
- `/` - Search
- `f` - Link hints

**Keys (search):**
- `jk` - Navigate results
- `type` - Refine search
- `Backspace` - Edit
- `h` - Back to categories
- `Enter` - Open

**Properties:**
- `allowTyping`: false (except in search view)
- `keybindings`: Dynamic (changes per view)
- Has `handleTyping` callback for search

---

## ðŸ”§ Core Components

### Mode Manager (`mode-manager.js`)

**Responsibilities:**
- Register modes
- Switch modes (calls onEnter/onExit)
- Route keyboard events to active mode
- Handle input protection
- Manage jj escape

**API:**
```javascript
window.VimModeManager.registerMode(name, definition)
window.VimModeManager.enterMode(name, ...args)
window.VimModeManager.exitMode()
window.VimModeManager.handleKeyPress(event)
window.VimModeManager.getCurrentMode()
```

### State (`state.js`)

**Single source of truth:**
```javascript
window.VimState = {
    mode: 'normal',
    // ... all app state
    elements: {
        // ... cached DOM elements
    }
}
```

### Config (`config.js`)

**All configuration:**
```javascript
window.VimConfig = {
    linkHintChars: 'asdfgkl',
    jjEscapeDelay: 150,
    // ... all settings
}
```

### Utils (`utils.js`)

**Shared functions:**
```javascript
window.VimUtils.isTypingInInput(e)
window.VimUtils.escapeRegex(str)
window.VimUtils.highlightTextInElement(el, term, results)
window.VimUtils.generateHintLabels(count)
window.VimUtils.getActivePanel()
```

---

## ðŸŽ¨ UI Components

### Styles (`ui/styles.js`)

**Injects all CSS** - Search box, filter box, link hints, navigator, animations

### Search UI (`ui/search-ui.js`)

Creates search box DOM element

### Filter UI (`ui/filter-ui.js`)

Creates filter box DOM element

### Navigator UI (`ui/navigator-ui.js`)

Creates file navigator overlay and renders views

### Modal Link Hints (`ui/modal-link-hints.js`)

Link hints scoped to modal content

---

## ðŸ”„ Data Flow

```
User presses key
    â†“
main.js (keyboard listener)
    â†“
mode-manager.js (routes to active mode)
    â†“
Check: Is input focused?
    â”œâ”€ Yes â†’ Only allow escape/enter
    â””â”€ No â†’ Check keybindings
        â†“
        mode.keybindings[key]()
            â†“
            Execute action
            â†“
            Maybe switch modes
```

---

## ðŸ’¡ Key Benefits

### 1. **Separation of Concerns**
- Each mode = separate file
- Each UI component = separate file
- Core logic = separate files
- No entanglement!

### 2. **Easy to Understand**
- Want to know how search works? Read `search.js`
- Want to modify link hints? Edit `link-hint.js`
- Single responsibility per file

### 3. **Easy to Extend**
- New mode = new file + registration
- No touching existing code
- No breaking changes
- Add features without fear

### 4. **Easy to Debug**
- Mode name in console
- Clear state tracking
- Debug flag in config
- Isolated issues

### 5. **Easy to Maintain**
- Small files (< 200 lines each)
- Clear dependencies
- Documented APIs
- Professional structure

### 6. **Performance**
- Lazy loading (async scripts)
- No code duplication
- Efficient mode switching
- Clean memory management

---

## ðŸ“– Usage

### For End Users

**Single file include:**
```html
<script src="lib/shared-lobby-tabs.js"></script>
<script src="lib/nav-vimlike.js"></script>
```

**That's it!** The loader handles everything.

### For Developers

**Modify a mode:**
1. Open `lib/vim/modes/[mode-name].js`
2. Edit the keybindings object
3. Save
4. Reload page
5. Done!

**Add a mode:**
1. Create `lib/vim/modes/my-mode.js`
2. Define keybindings, onEnter, onExit
3. Register with `VimModeManager.registerMode()`
4. Add to loader in `nav-vimlike.js`
5. Done!

**Change behavior:**
1. Core logic â†’ `lib/vim/core/`
2. Mode logic â†’ `lib/vim/modes/`
3. UI rendering â†’ `lib/vim/ui/`
4. Styling â†’ `lib/vim/ui/styles.js`

---

## ðŸŽ“ Code Style

### Module Pattern (IIFE)

All files use **Immediately Invoked Function Expressions**:

```javascript
(function() {
    'use strict';
    
    // Module code here
    // Private variables/functions
    
    // Public API
    window.MyModule = {
        publicFunction: () => {}
    };
    
})();
```

**Benefits:**
- No global scope pollution
- Private encapsulation
- Clear public API
- Standard pattern

### Naming Conventions

- **Files:** `kebab-case.js`
- **Global Objects:** `PascalCase` (window.VimConfig)
- **Functions:** `camelCase`
- **Constants:** `SCREAMING_SNAKE_CASE` (if needed)
- **CSS Classes:** `kebab-case` with prefixes (`vim-search-box`)

### Comments

- Section headers with `/* ==== */`
- Function headers for complex logic
- Inline for tricky code
- JSDoc for public APIs (optional)

---

## ðŸ” Debugging

### Enable Debug Mode

```javascript
// In config.js or at runtime
window.VimConfig.debug = true;
```

**Console output:**
```
VimModeManager: Registering mode 'normal'
VimModeManager: normal â†’ search
VimExt: All modules loaded successfully âœ“
```

### Inspect State

```javascript
// In browser console
window.VimState            // See all state
window.VimState.mode       // Current mode
window.VimConfig           // All settings
window.VimModeManager.getModeRegistry()  // All registered modes
```

---

## ðŸ“Š Module Dependencies

```
Dependency Graph:

config.js (no deps)
    â†“
state.js (no deps)
    â†“
utils.js (needs: config, state)
    â†“
mode-manager.js (needs: config, state)
    â†“
â”œâ”€ styles.js (needs: config)
â”œâ”€ search-ui.js (needs: state)
â”œâ”€ filter-ui.js (needs: state)
â”œâ”€ navigator-ui.js (needs: state)
â””â”€ modal-link-hints.js (needs: state, config, utils)
    â†“
â”œâ”€ normal.js (needs: all core, LobbyTabs)
â”œâ”€ search.js (needs: all core, utils)
â”œâ”€ filter.js (needs: all core, utils)
â”œâ”€ link-hint.js (needs: all core, utils)
â””â”€ file-navigator.js (needs: all core, utils, UI)
    â†“
main.js (needs: everything)
```

**Load order matters!** The `nav-vimlike.js` loader handles this automatically.

---

## ðŸŽ¯ Design Principles

### 1. **Single Responsibility**
- One mode = one file
- One UI component = one file
- Each does ONE thing well

### 2. **Open/Closed Principle**
- Open for extension (add new modes)
- Closed for modification (don't touch existing)

### 3. **Dependency Injection**
- Modes don't create UI
- UI is injected/created separately
- Clean separation

### 4. **Data-Driven**
- Modes defined by data (keybindings object)
- Not by if/else chains
- Easy to serialize/debug

### 5. **Immutability Where Possible**
- State changes are explicit
- Mode transitions are controlled
- Predictable behavior

---

## ðŸ§ª Testing

### Test a Mode
```javascript
// In browser console
window.VimModeManager.enterMode('search');
// Try typing, pressing keys
// Check if only defined keys work

window.VimState.mode  // Should be 'search'
```

### Test Input Protection
```javascript
window.VimModeManager.enterMode('search');
// Focus the input
// Press 'h' - should type 'h', not navigate
// Press 'j' - should type 'j', not scroll
// Press 'jj' quickly - should exit
```

### Test Mode Switching
```javascript
window.VimModeManager.enterMode('normal');
window.VimModeManager.enterMode('link-hint');
window.VimModeManager.exitMode();  // Back to normal
```

---

## ðŸ“ Example: Creating a New "Command Mode"

Let's add a `:` command mode (like vim's ex mode):

```javascript
// lib/vim/modes/command.js
(function() {
    'use strict';

    const commandMode = {
        keybindings: {
            'Enter': (e) => {
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
            showCommandBox();
        },
        
        onExit: () => {
            hideCommandBox();
        }
    };

    function executeCommand(cmd) {
        // Parse and execute command
        console.log('Command:', cmd);
    }

    function showCommandBox() {
        // Create/show UI
    }

    function hideCommandBox() {
        // Hide UI
    }

    window.VimModeManager.registerMode('command', commandMode);
})();
```

Then add `:` trigger in normal mode:

```javascript
// In normal.js keybindings:
':': () => window.VimModeManager.enterMode('command')
```

**Done!** You have a new command mode.

---

## ðŸŽ“ Best Practices

### DO âœ…
- Keep modes under 200 lines
- Use descriptive function names
- Register modes on load
- Handle onEnter/onExit
- Test input protection
- Document your keybindings

### DON'T âŒ
- Create global variables (use window.MyModule)
- Modify other modes directly
- Skip onExit cleanup
- Forget to prevent default on handled keys
- Hardcode values (use config)
- Mix UI and logic in same file

---

## ðŸ”® Future Possibilities

With this architecture, you could easily add:

- **Visual Mode** - Select text with keyboard
- **Command Mode** - `:` ex commands
- **Mark Mode** - Set/jump to marks
- **Macro Mode** - Record/replay actions
- **Help Mode** - Interactive help
- **Settings Mode** - Configure on the fly

Each would be a simple new file + registration!

---

## ðŸ“ˆ Comparison

### Before (Monolithic)
```
shared-lobby-tabs-vimext.js (2400+ lines)
â”œâ”€ All modes in one file
â”œâ”€ Giant switch statements
â”œâ”€ Hard to find things
â”œâ”€ Scary to modify
â””â”€ Tight coupling
```

### After (Modular)
```
lib/vim/
â”œâ”€ 13 small files (~100-200 lines each)
â”œâ”€ Clear responsibilities
â”œâ”€ Easy to navigate
â”œâ”€ Safe to modify
â””â”€ Loose coupling
```

---

## ðŸŽ‰ Summary

This is a **professional, production-grade architecture** with:

1. âœ… **Clear separation** - One responsibility per file
2. âœ… **Easy extension** - Add modes without touching existing code
3. âœ… **Safe modification** - Change one mode without breaking others
4. âœ… **Self-documenting** - Code structure explains intent
5. âœ… **Maintainable** - Small files, clear APIs
6. âœ… **Testable** - Isolated modules
7. âœ… **Professional** - Industry-standard patterns

**To use:** Include `nav-vimlike.js` and you're done!

**To extend:** Create a new mode file and register it!

**To debug:** Enable `VimConfig.debug = true`!

---

**This is how professional JavaScript is structured.** ðŸ—ï¸âœ¨


