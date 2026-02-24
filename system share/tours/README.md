# Tours - Universal Reader

## Local CORS-Free Setup

All tours have been converted from `.json` to `.js` format to avoid CORS errors when running locally without a server.

### File Structure

- `manifest.js` - Contains `window.TOUR_MANIFEST` array listing all available tours
- `tour-reader.html` - Universal tour reader that works with all `.js` tours
- Individual tour `.js` files - Each assigns to `window.TOUR_DATA`

### Converting New Tours

If you add new tour `.json` files, convert them to `.js` format:

```bash
python convert-tours-to-js.py
```

This script:
1. Finds all `.json` files (excluding `manifest.json`)
2. Converts them to `.js` format with `const TOUR_DATA = {...};`
3. Saves alongside the original `.json` files

### How It Works

The tour reader uses `<script>` tags instead of `fetch()`:
- `manifest.js` is loaded in the HTML head
- Individual tour `.js` files are loaded dynamically when selected
- No fetch/CORS issues when running as local `file://` protocol

### Usage

Simply open `tour-reader.html` in a browser. Select a tour from the dropdown to view it.

