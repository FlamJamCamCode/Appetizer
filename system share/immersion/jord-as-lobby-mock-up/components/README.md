# Map Viewer Web Component

A reusable web component for displaying spatial tree data with polygon zones and nested hierarchies. Perfect for creating interactive maps with zoomable, pannable interfaces and complex zone relationships.

## Features

- **Zoomable and Pannable**: Mouse wheel zoom, drag to pan, zoom controls
- **Spatial Data Store**: Efficient QuadTree-like structure for zone management
- **Polygon Support**: Both rectangular and custom polygon-shaped zones
- **Nested Hierarchies**: Support for parent-child zone relationships
- **Interactive Details**: Click zones to see detailed information
- **Minimap**: Optional minimap showing current viewport
- **Legend**: Automatic legend generation based on zone types
- **Customizable**: Configurable zoom levels, controls, and styling

## Usage

### Basic HTML

```html
<!DOCTYPE html>
<html>
<head>
    <script src="components/map-viewer.js"></script>
</head>
<body>
    <map-viewer 
        map-data='{"type": "image", "url": "map.png"}'
        zones-data='{"zones": [...]}'>
    </map-viewer>
</body>
</html>
```

### JavaScript API

```javascript
const mapViewer = document.querySelector('map-viewer');

// Load map data
mapViewer.setAttribute('map-data', JSON.stringify({
    type: 'image',
    url: 'path/to/map.png'
}));

// Load zones data
mapViewer.setAttribute('zones-data', JSON.stringify({
    zones: [
        {
            id: 'zone-1',
            name: 'My Zone',
            position: { x: 100, y: 100 },
            bounds: { width: 200, height: 150 },
            type: 'level1-zone',
            level: 1,
            description: 'A sample zone',
            population: '1M',
            features: ['Feature 1', 'Feature 2'],
            nestedZones: [
                { id: 'sub-1', name: 'Sub Zone', level: 2, description: 'A nested zone' }
            ]
        }
    ]
}));

// Listen for zone selection
mapViewer.addEventListener('zone-selected', (e) => {
    console.log('Selected zone:', e.detail.zone);
});
```

## Data Structure

### Map Data

```javascript
{
    type: 'image' | 'svg',
    url: 'path/to/image.png',  // For image type
    content: '<svg>...</svg>'  // For svg type
}
```

### Zones Data

```javascript
{
    zones: [
        {
            id: 'unique-zone-id',
            name: 'Zone Display Name',
            position: { x: 100, y: 100 },        // Top-left corner
            bounds: { width: 200, height: 150 }, // For rectangular zones
            shape: {                             // For polygon zones
                type: 'polygon',
                points: [
                    { x: 100, y: 100 },
                    { x: 300, y: 100 },
                    { x: 300, y: 250 },
                    { x: 100, y: 250 }
                ],
                center: { x: 200, y: 175 }
            },
            type: 'level1-zone',                 // CSS class for styling
            level: 1,                            // Governance level
            description: 'Zone description',
            population: '1M',
            features: ['Feature 1', 'Feature 2'],
            aesthetics: 'Visual style description',
            nestedZones: [                       // Child zones
                {
                    id: 'nested-zone-id',
                    name: 'Nested Zone',
                    level: 2,
                    description: 'Nested zone description'
                }
            ]
        }
    ]
}
```

## Zone Types

The component supports different zone types that can be styled with CSS:

- `level1-zone`: Pure MWR (Might With Right) governance
- `level2-zone`: Sovereignty with some authority structures
- `level3-zone`: Hierarchical governance
- `level4-zone`: Strict rule and dominance
- `old-world`: Legacy systems
- `transition-zone`: Areas in transition

## Events

### zone-selected

Fired when a zone is clicked:

```javascript
mapViewer.addEventListener('zone-selected', (e) => {
    const zone = e.detail.zone;
    console.log('Selected zone:', zone.name);
});
```

## Configuration

The component can be configured by setting attributes:

```html
<map-viewer 
    map-data='...'
    zones-data='...'
    config='{"minZoom": 0.1, "maxZoom": 5, "showMinimap": true}'>
</map-viewer>
```

### Configuration Options

- `minZoom`: Minimum zoom level (default: 0.1)
- `maxZoom`: Maximum zoom level (default: 5)
- `zoomStep`: Zoom increment (default: 0.2)
- `panSensitivity`: Pan sensitivity (default: 1)
- `showMinimap`: Show minimap (default: true)
- `showLegend`: Show legend (default: true)
- `showZoomControls`: Show zoom controls (default: true)

## Styling

The component uses CSS custom properties and can be styled:

```css
map-viewer {
    --zone-level1-color: #00ff00;
    --zone-level2-color: #ffff00;
    --zone-level3-color: #ffa500;
    --zone-level4-color: #ff0000;
    --old-world-color: #666666;
}
```

## Examples

### Test Application

See `test-app.html` for a simple test application that demonstrates:
- Loading different map types
- Loading different zone configurations
- Toggling minimap and legend
- Displaying zone information

### Triadization Application

See `triadization-app.html` for a complete application showing:
- The Triadization world map
- Complex nested zone hierarchies
- Statistics panel
- Detailed zone information

## Browser Support

- Modern browsers with ES6 support
- Web Components v1
- SVG support
- CSS Grid and Flexbox

## Dependencies

None! The component is self-contained and only requires the browser's built-in APIs.

## License

MIT License - feel free to use in your projects.
