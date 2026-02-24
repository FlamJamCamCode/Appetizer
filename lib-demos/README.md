# Horizontal Scroll Navigation Plugin - Demos

This directory contains demos for the `horizontal-scroll-nav.js` plugin.

## Files

- `horizontal-scroll-nav-demo-default.html` - Default mode demo (auto-detects sections)
- `horizontal-scroll-nav-demo-webcomponent.html` - Web component mode demo (uses `<horscroller-viewport />`)

## Usage

### Default Mode

Simply include the script and it will auto-detect sections with IDs:

```html
<script src="../lib/horizontal-scroll-nav.js"></script>
<script>
    new HorizontalScrollNav();
</script>
```

The plugin will:
- Auto-detect sections with IDs
- Create a horizontal navigation bar
- Generate buttons for each section
- Sync with scroll position

### Web Component Mode

Use the `<horscroller-viewport />` element and `.horscroller-section` classes:

```html
<horscroller-viewport>
    <section class="horscroller-section" id="section1">
        <h2>Section 1</h2>
        <!-- content -->
    </section>
    <section class="horscroller-section" id="section2">
        <h2>Section 2</h2>
        <!-- content -->
    </section>
</horscroller-viewport>

<script src="../lib/horizontal-scroll-nav.js"></script>
```

The plugin will auto-initialize when it finds `horscroller-viewport`.

## Features

- **Progress Fill**: Buttons fill with gradient based on scroll progress
- **Viewport Indicator**: Shows current viewport position within section
- **Normalized Scrolling**: Maps section height to button width proportionally
- **Margin Handling**: Smooth transitions through margins between sections
- **Click Navigation**: Click buttons to scroll to sections
- **Sticky Navigation**: Nav bar stays at top while scrolling

## Customization

See the plugin file for all available options.

