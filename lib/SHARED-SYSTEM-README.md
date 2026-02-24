# Rally Lobby Shared System Documentation

## Overview

The fluid tabs system provides a consistent navigation experience across all Rally Lobby interfaces with horizontal tab navigation and vertical scrolling content.

---

## Shared Files

### 1. **shared-lobby-tabs.css**
Core tab navigation system styling:
- Fluid tab button transitions
- Content panel animations (slide left/right)
- Navigation arrow buttons
- Keyboard shortcuts hint
- Custom scrollbar styling
- Responsive breakpoints

### 2. **shared-lobby-content.css**
Common content block styling:
- Section titles
- Pain blocks, lobby features, fulfillment moments
- World cards with hover effects
- Special text styling (neologisms, sacred-emphasis, private-language)
- Quote boxes
- Lists with custom bullets
- Staggered animation delays

### 3. **shared-lobby-tabs.js**
Tab navigation functionality:
- Tab switching logic
- Arrow navigation
- Keyboard shortcuts (← → arrow keys, 1/2/3 number keys)
- Animation restart triggers
- Hint fade behavior
- Public API for extensions

---

## How to Create a New Lobby

### Step 1: HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Lobby Title</title>
    
    <!-- Include shared styles -->
    <link rel="stylesheet" href="shared-lobby-tabs.css">
    <link rel="stylesheet" href="shared-lobby-content.css">
    
    <!-- Add lobby-specific styles -->
    <style>
        body {
            font-family: 'Georgia', serif;
            background: /* your gradient */;
            color: #f5f5f5;
        }
        
        /* Custom background for content panels */
        .content-panel {
            background-image: /* your radial gradients */;
        }
        
        /* Any other lobby-specific styles */
    </style>
</head>
<body>
    <div class="lobby-container">
        <!-- Tab Navigation -->
        <nav class="tabs-nav">
            <button class="tab-button active" data-tab="before">
                BEFORE: [Your Title]
                <span class="tab-indicator">Description</span>
            </button>
            <button class="tab-button" data-tab="lobby">
                THE LOBBY
                <span class="tab-indicator">The threshold space</span>
            </button>
            <button class="tab-button" data-tab="fulfillment">
                FULFILLMENT
                <span class="tab-indicator">Your new world</span>
            </button>
        </nav>

        <!-- Content Container -->
        <div class="content-container">
            <!-- BEFORE Panel -->
            <div class="content-panel active" id="before">
                <!-- Your content here -->
            </div>

            <!-- LOBBY Panel -->
            <div class="content-panel" id="lobby">
                <!-- Your content here -->
            </div>

            <!-- FULFILLMENT Panel -->
            <div class="content-panel" id="fulfillment">
                <!-- Your content here -->
            </div>
        </div>

        <!-- Navigation Arrows -->
        <div class="nav-arrow left" id="prevArrow" title="Previous (← Arrow Key)">‹</div>
        <div class="nav-arrow right" id="nextArrow" title="Next (→ Arrow Key)">›</div>

        <!-- Keyboard Shortcuts Hint -->
        <div class="shortcuts-hint">
            <strong style="color: #ffd700;">Navigation:</strong> 
            <span class="shortcut-key">←</span> Previous 
            <span class="shortcut-key">→</span> Next
            <span class="shortcut-key">1</span><span class="shortcut-key">2</span><span class="shortcut-key">3</span> Jump to section
        </div>
    </div>

    <!-- Include shared JavaScript -->
    <script src="shared-lobby-tabs.js"></script>
</body>
</html>
```

---

## Step 2: Use Standard Content Classes

### Section Titles
```html
<h1 class="section-title">🎯 Your Section Title</h1>
```

### Pain Blocks (BEFORE section)
```html
<div class="pain-block">
    Your content about pain/suffering/current state
</div>
```

### Lobby Features (LOBBY section)
```html
<div class="lobby-feature">
    <div class="feature-title">Feature Name</div>
    <p>Feature description...</p>
</div>
```

### World Cards (LOBBY section)
```html
<div class="world-card">
    <div class="world-name">🏛️ World Name</div>
    <p>World description with <span class="neologism">will-topological-encoding</span></p>
</div>
```

### Fulfillment Moments (FULFILLMENT section)
```html
<div class="fulfillment-moment">
    <div class="moment-title">🌅 Moment Title</div>
    <p>Description of fulfillment experience...</p>
</div>
```

### Quote Boxes
```html
<div class="quote-box">
    "Quote text here..."
    <br><br>
    <span style="color: #81c784;">— Name, Age, Location</span>
</div>
```

---

## Step 3: Special Text Styling

### Neologisms (will-topological encoding)
```html
<span class="neologism">same-essence-population-density</span>
```

### Sacred Emphasis
```html
<span class="sacred-emphasis">important text</span>
```

### Private Language
```html
<span class="private-language">wound-resonance-language</span>
```

---

## Navigation Features

### Horizontal (Tab) Navigation
- **← / →** Left/Right arrow keys - Previous/Next tab
- **1 / 2 / 3** Number keys - Jump to specific tab (BEFORE/LOBBY/FULFILLMENT)
- Click arrow buttons on left/right of screen
- Click tab buttons at top

### Vertical (Section) Navigation
- **↑ / ↓** Up/Down arrow keys - Navigate between sections (dots)
- **Page Up / Page Down** - Native browser scrolling (works normally)
- **Mouse wheel** - Natural smooth scrolling
- **Click dots** - Jump directly to any major content block (on right side)
- **Auto-tracking** - Active dot updates as you scroll

---

## Animation System

### Content Fade-In
Content blocks automatically animate in with staggered delays:

```html
<!-- First block: 0.2s delay -->
<div class="pain-block">...</div>

<!-- Second block: 0.3s delay -->
<div class="pain-block">...</div>

<!-- Third block: 0.4s delay -->
<div class="pain-block">...</div>
```

Delays are handled automatically by CSS nth-child selectors.

### Scroll Indicators
Vertical scroll indicators automatically:
- Detect **all direct children** of content panels (any class, any element type)
- Filter by height (only elements > 50px get dots)
- Create clickable dots on the right side
- Update active state as user scrolls
- Works with any content: divs, sections, tables, images, custom classes
- Hide on mobile (< 480px width)

---

## Responsive Behavior

The system automatically adapts to:
- **Desktop**: Full navigation, all features visible
- **Tablet** (≤768px): Smaller arrows, adjusted padding
- **Mobile** (≤480px): Minimal UI, tab indicators hidden

---

## Customization

### Custom Tab Names
Edit the `data-tab` attributes and corresponding panel IDs:

```html
<button class="tab-button active" data-tab="myCustomTab">
    MY CUSTOM TAB
</button>
...
<div class="content-panel active" id="myCustomTab">
```

### Custom Colors/Themes
Override CSS variables in your lobby-specific styles:

```css
.content-panel {
    background-image: 
        radial-gradient(circle at 30% 40%, rgba(YOUR, COLORS, HERE) 0%, transparent 50%);
}
```

### Extend JavaScript
Access the public API:

```javascript
// Tab navigation
const currentTab = window.LobbyTabs.getCurrentTab();
window.LobbyTabs.switchToTab(1);
const totalTabs = window.LobbyTabs.getTotalTabs();

// Vertical scroll navigation
window.LobbyTabs.scrollToSection(2); // Jump to 3rd section
const sections = window.LobbyTabs.getCurrentSections(); // Get all sections
window.LobbyTabs.updateSections(); // Refresh section detection
```

---

## File Structure

```
the-lobbies/
├── shared-lobby-tabs.css       # Core navigation system
├── shared-lobby-content.css    # Content block styling
├── shared-lobby-tabs.js        # Navigation functionality
├── SHARED-SYSTEM-README.md     # This file
└── [lobby-name].html           # Individual lobby files
```

---

## Best Practices

1. **Keep lobby HTML minimal** - Let shared styles do the heavy lifting
2. **Use semantic class names** - `.pain-block`, `.lobby-feature`, `.fulfillment-moment`
3. **Maintain consistent structure** - BEFORE → LOBBY → FULFILLMENT flow
4. **Test keyboard navigation** - Ensure arrow keys work smoothly
5. **Consider mobile experience** - Content should be readable at all screen sizes

---

## Example Lobbies Using This System

- `bullied-teen-fluid-tabs-lobby.html` - Demonstration of full system

---

## Troubleshooting

### Tabs not switching?
- Ensure `data-tab` attributes match panel IDs
- Check that `shared-lobby-tabs.js` is loading

### Content not animating?
- Verify content blocks use correct classes (`.pain-block`, etc.)
- Check browser console for CSS loading errors

### Keyboard shortcuts not working?
- Ensure JavaScript file loads after HTML elements
- Check for JavaScript errors in console

---

## Smooth Scrolling Technical Details

### CSS Features
- `scroll-behavior: smooth` - Native smooth scrolling
- `scroll-snap-type: y proximity` - Gentle section snapping
- `scroll-snap-align: start` - Sections align to top when snapping
- Custom scrollbar with transitions

### JavaScript Features
- Real-time scroll position tracking
- **Automatic section detection** - All direct children of content panel (no hardcoded classes!)
- Height-based filtering (> 50px elements get dots)
- Intersection-based active indicator updates
- Smooth scroll API for programmatic scrolling
- Automatic indicator creation/destruction
- Keyboard navigation (Arrow keys)
- Event preventDefault to avoid conflicts

### Performance
- Event listeners use passive mode where applicable
- Debounced scroll tracking (150ms)
- Efficient DOM queries (cached elements)
- RequestAnimationFrame for smooth animations

### Keyboard Behavior
- **Arrow Left/Right** - Prevented from default, controls horizontal tab switching
- **Arrow Up/Down** - Prevented from default when sections exist, controls vertical section navigation
- **Page Down/Up** - Native browser scrolling (not intercepted)
- **Number keys 1/2/3** - Direct tab jumping
- **Smooth animations** - All programmatic scrolling uses `behavior: 'smooth'`

---

## Future Enhancements

Consider adding:
- Swipe gestures for mobile tab switching
- Tab history (back button support)
- Saved position restoration
- Accessibility improvements (ARIA labels, focus management)
- Keyboard shortcuts for vertical scroll (PageUp/PageDown)
- Touchpad gesture support

---

*Last Updated: 2025*

