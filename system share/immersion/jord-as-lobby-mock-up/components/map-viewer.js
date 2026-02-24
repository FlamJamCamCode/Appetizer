/**
 * Map Viewer Web Component
 * A reusable component for displaying spatial tree data with polygon zones and nested hierarchies
 */

class MapViewer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Component state
        this.currentZoom = 1;
        this.currentPan = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.spatialStore = new SpatialDataStore();
        this.selectedZone = null;
        
        // Configuration
        this.config = {
            minZoom: 0.1,
            maxZoom: 5,
            zoomStep: 0.2,
            panSensitivity: 1,
            showMinimap: true,
            showLegend: true,
            showZoomControls: true
        };
        
        this.render();
        this.attachEventListeners();
    }
    
    static get observedAttributes() {
        return ['map-data', 'zones-data', 'config'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.loadData();
        }
    }
    
    connectedCallback() {
        this.loadData();
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: #001122;
                    overflow: hidden;
                }
                
                .map-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                
                .map-canvas {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transform-origin: 0 0;
                    transition: transform 0.3s ease;
                }
                
                .base-map {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }
                
                .zone {
                    position: absolute;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid;
                    border-radius: 8px;
                    padding: 8px;
                    font-size: 0.8em;
                    min-width: 100px;
                    max-width: 200px;
                }
                
                .zone:hover {
                    transform: scale(1.05);
                    z-index: 100;
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.8);
                }
                
                .zone.selected {
                    transform: scale(1.1);
                    z-index: 200;
                    box-shadow: 0 10px 30px rgba(0, 255, 255, 0.5);
                }
                
                .zone-polygon {
                    position: absolute;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    stroke-width: 2;
                    fill-opacity: 0.2;
                    stroke-opacity: 0.8;
                }
                
                .zone-polygon:hover {
                    fill-opacity: 0.3;
                    stroke-opacity: 1;
                    stroke-width: 3;
                }
                
                .zone-polygon.selected {
                    fill-opacity: 0.4;
                    stroke-opacity: 1;
                    stroke-width: 4;
                }
                
                .zone-label {
                    position: absolute;
                    pointer-events: none;
                    font-size: 0.7em;
                    font-weight: bold;
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
                }
                
                .controls {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 1000;
                    display: flex;
                    gap: 5px;
                }
                
                .control-btn {
                    background: rgba(0, 0, 0, 0.8);
                    border: 1px solid #333;
                    color: #fff;
                    padding: 8px 12px;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .control-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .minimap {
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    width: 200px;
                    height: 100px;
                    background: rgba(0, 0, 0, 0.8);
                    border: 1px solid #333;
                    border-radius: 5px;
                    z-index: 1000;
                }
                
                .minimap-viewport {
                    position: absolute;
                    border: 2px solid #00ffff;
                    background: rgba(0, 255, 255, 0.1);
                    pointer-events: none;
                }
                
                .legend {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    background: rgba(0, 0, 0, 0.8);
                    padding: 15px;
                    border-radius: 10px;
                    border: 1px solid #333;
                    z-index: 1000;
                }
                
                .legend-item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 5px;
                }
                
                .legend-color {
                    width: 15px;
                    height: 12px;
                    border-radius: 3px;
                    margin-right: 8px;
                    border: 1px solid;
                }
                
                .zone-detail {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    width: 300px;
                    max-height: calc(100% - 20px);
                    background: rgba(0, 0, 0, 0.95);
                    border: 1px solid #333;
                    border-radius: 10px;
                    padding: 15px;
                    overflow-y: auto;
                    z-index: 1001;
                    display: none;
                }
                
                .zone-detail h3 {
                    color: #00ffff;
                    margin-bottom: 10px;
                }
                
                .zone-detail h4 {
                    color: #ff00ff;
                    margin: 10px 0 5px 0;
                }
                
                .nested-zones {
                    margin-top: 10px;
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 5px;
                }
                
                .nested-zone {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 5px;
                    margin: 3px 0;
                    border-radius: 3px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .nested-zone:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            </style>
            
            <div class="map-container">
                <div class="map-canvas" id="mapCanvas">
                    <div class="base-map" id="baseMap"></div>
                    <svg id="zonesSvg" class="zones-svg"></svg>
                </div>
                
                <div class="controls" id="controls">
                    <button class="control-btn" id="zoomIn">+</button>
                    <button class="control-btn" id="zoomOut">-</button>
                    <button class="control-btn" id="resetZoom">Reset</button>
                    <button class="control-btn" id="toggleMinimap">Minimap</button>
                </div>
                
                <div class="minimap" id="minimap">
                    <div class="minimap-viewport" id="minimapViewport"></div>
                </div>
                
                <div class="legend" id="legend">
                    <h3>Zones</h3>
                    <div id="legendItems"></div>
                </div>
                
                <div class="zone-detail" id="zoneDetail">
                    <h3 id="zoneTitle">Select a Zone</h3>
                    <p id="zoneDescription">Click on any zone to see details.</p>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const mapCanvas = this.shadowRoot.getElementById('mapCanvas');
        const zoomIn = this.shadowRoot.getElementById('zoomIn');
        const zoomOut = this.shadowRoot.getElementById('zoomOut');
        const resetZoom = this.shadowRoot.getElementById('resetZoom');
        const toggleMinimap = this.shadowRoot.getElementById('toggleMinimap');
        
        // Pan and zoom
        mapCanvas.addEventListener('mousedown', (e) => this.startDrag(e));
        mapCanvas.addEventListener('mousemove', (e) => this.drag(e));
        mapCanvas.addEventListener('mouseup', () => this.endDrag());
        mapCanvas.addEventListener('wheel', (e) => this.handleZoom(e));
        
        // Controls
        zoomIn.addEventListener('click', () => this.zoomIn());
        zoomOut.addEventListener('click', () => this.zoomOut());
        resetZoom.addEventListener('click', () => this.resetZoom());
        toggleMinimap.addEventListener('click', () => this.toggleMinimap());
        
        // Close detail panel
        document.addEventListener('click', (e) => {
            if (!e.target.closest('map-viewer')) {
                this.hideZoneDetail();
            }
        });
    }
    
    loadData() {
        const mapData = this.getAttribute('map-data');
        const zonesData = this.getAttribute('zones-data');
        
        if (mapData) {
            try {
                const data = JSON.parse(mapData);
                this.loadMapData(data);
            } catch (e) {
                console.error('Invalid map data:', e);
            }
        }
        
        if (zonesData) {
            try {
                const data = JSON.parse(zonesData);
                this.loadZonesData(data);
            } catch (e) {
                console.error('Invalid zones data:', e);
            }
        }
    }
    
    loadMapData(data) {
        const baseMap = this.shadowRoot.getElementById('baseMap');
        if (data.type === 'image') {
            baseMap.style.backgroundImage = `url(${data.url})`;
            baseMap.style.backgroundSize = 'cover';
            baseMap.style.backgroundPosition = 'center';
        } else if (data.type === 'svg') {
            baseMap.innerHTML = data.content;
        }
    }
    
    loadZonesData(data) {
        this.spatialStore.clear();
        
        // Load zones into spatial store
        data.zones.forEach(zone => {
            this.spatialStore.addZone(zone.id, zone, zone.parentId);
        });
        
        // Render zones
        this.renderZones();
        this.updateLegend();
    }
    
    renderZones() {
        const svg = this.shadowRoot.getElementById('zonesSvg');
        svg.innerHTML = '';
        
        // Get all zones from spatial store
        const zones = this.spatialStore.getAllZones();
        
        zones.forEach(zone => {
            if (zone.shape && zone.shape.type === 'polygon') {
                this.renderPolygonZone(zone);
            } else {
                this.renderRectZone(zone);
            }
        });
    }
    
    renderPolygonZone(zone) {
        const svg = this.shadowRoot.getElementById('zonesSvg');
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        
        // Convert polygon points to SVG format
        const points = zone.shape.points.map(p => `${p.x},${p.y}`).join(' ');
        polygon.setAttribute('points', points);
        polygon.setAttribute('class', `zone-polygon ${zone.type || 'level1-zone'}`);
        polygon.setAttribute('data-zone-id', zone.id);
        
        // Add click handler
        polygon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectZone(zone);
        });
        
        // Add label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', zone.shape.center.x);
        label.setAttribute('y', zone.shape.center.y);
        label.setAttribute('class', 'zone-label');
        label.textContent = zone.name;
        
        svg.appendChild(polygon);
        svg.appendChild(label);
    }
    
    renderRectZone(zone) {
        const svg = this.shadowRoot.getElementById('zonesSvg');
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        
        rect.setAttribute('x', zone.position.x);
        rect.setAttribute('y', zone.position.y);
        rect.setAttribute('width', zone.bounds.width);
        rect.setAttribute('height', zone.bounds.height);
        rect.setAttribute('class', `zone-polygon ${zone.type || 'level1-zone'}`);
        rect.setAttribute('data-zone-id', zone.id);
        
        // Add click handler
        rect.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectZone(zone);
        });
        
        // Add label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', zone.position.x + zone.bounds.width / 2);
        label.setAttribute('y', zone.position.y + zone.bounds.height / 2);
        label.setAttribute('class', 'zone-label');
        label.textContent = zone.name;
        
        svg.appendChild(rect);
        svg.appendChild(label);
    }
    
    selectZone(zone) {
        // Clear previous selection
        this.shadowRoot.querySelectorAll('.zone-polygon.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Select new zone
        const zoneElement = this.shadowRoot.querySelector(`[data-zone-id="${zone.id}"]`);
        if (zoneElement) {
            zoneElement.classList.add('selected');
        }
        
        this.selectedZone = zone;
        this.showZoneDetail(zone);
        
        // Dispatch custom event
        this.dispatchEvent(new CustomEvent('zone-selected', {
            detail: { zone },
            bubbles: true
        }));
    }
    
    showZoneDetail(zone) {
        const detail = this.shadowRoot.getElementById('zoneDetail');
        const title = this.shadowRoot.getElementById('zoneTitle');
        const description = this.shadowRoot.getElementById('zoneDescription');
        
        title.textContent = zone.name;
        description.innerHTML = `
            <p><strong>ID:</strong> ${zone.id}</p>
            <p><strong>Type:</strong> ${zone.type || 'Unknown'}</p>
            <p><strong>Level:</strong> ${zone.level || 1}</p>
            ${zone.description ? `<p><strong>Description:</strong> ${zone.description}</p>` : ''}
            ${zone.population ? `<p><strong>Population:</strong> ${zone.population}</p>` : ''}
            ${zone.features ? `
                <h4>Features:</h4>
                <ul>
                    ${zone.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            ` : ''}
            ${zone.nestedZones ? `
                <h4>Nested Zones:</h4>
                <div class="nested-zones">
                    ${zone.nestedZones.map(nested => `
                        <div class="nested-zone" data-nested-id="${nested.id}">
                            <strong>${nested.name}</strong>
                            <p>Level ${nested.level} - ${nested.description || ''}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
        
        detail.style.display = 'block';
    }
    
    hideZoneDetail() {
        this.shadowRoot.getElementById('zoneDetail').style.display = 'none';
    }
    
    updateLegend() {
        const legendItems = this.shadowRoot.getElementById('legendItems');
        const zoneTypes = new Set();
        
        this.spatialStore.getAllZones().forEach(zone => {
            zoneTypes.add(zone.type || 'level1-zone');
        });
        
        legendItems.innerHTML = Array.from(zoneTypes).map(type => `
            <div class="legend-item">
                <div class="legend-color ${type}"></div>
                <span>${type.replace('-zone', '').replace('level', 'Level ')}</span>
            </div>
        `).join('');
    }
    
    // Zoom and pan methods
    zoomIn() {
        this.currentZoom = Math.min(this.currentZoom * (1 + this.config.zoomStep), this.config.maxZoom);
        this.updateTransform();
    }
    
    zoomOut() {
        this.currentZoom = Math.max(this.currentZoom / (1 + this.config.zoomStep), this.config.minZoom);
        this.updateTransform();
    }
    
    resetZoom() {
        this.currentZoom = 1;
        this.currentPan = { x: 0, y: 0 };
        this.updateTransform();
    }
    
    updateTransform() {
        const mapCanvas = this.shadowRoot.getElementById('mapCanvas');
        mapCanvas.style.transform = `scale(${this.currentZoom}) translate(${this.currentPan.x}px, ${this.currentPan.y}px)`;
        this.updateMinimap();
    }
    
    startDrag(e) {
        this.isDragging = true;
        this.dragStart = { x: e.clientX - this.currentPan.x, y: e.clientY - this.currentPan.y };
    }
    
    drag(e) {
        if (!this.isDragging) return;
        this.currentPan.x = e.clientX - this.dragStart.x;
        this.currentPan.y = e.clientY - this.dragStart.y;
        this.updateTransform();
    }
    
    endDrag() {
        this.isDragging = false;
    }
    
    handleZoom(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.currentZoom = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, this.currentZoom * delta));
        this.updateTransform();
    }
    
    toggleMinimap() {
        const minimap = this.shadowRoot.getElementById('minimap');
        minimap.style.display = minimap.style.display === 'none' ? 'block' : 'none';
    }
    
    updateMinimap() {
        const minimap = this.shadowRoot.getElementById('minimap');
        const viewport = this.shadowRoot.getElementById('minimapViewport');
        if (minimap.style.display === 'none') return;
        
        // Calculate viewport position and size
        const scale = 200 / 2000; // minimap width / world width
        const viewportWidth = (2000 * scale) / this.currentZoom;
        const viewportHeight = (1000 * scale) / this.currentZoom;
        const viewportX = (-this.currentPan.x * scale);
        const viewportY = (-this.currentPan.y * scale);
        
        viewport.style.width = viewportWidth + 'px';
        viewport.style.height = viewportHeight + 'px';
        viewport.style.left = viewportX + 'px';
        viewport.style.top = viewportY + 'px';
    }
}

// Spatial Data Store
class SpatialDataStore {
    constructor() {
        this.zones = new Map();
        this.nestedStructures = new Map();
    }
    
    addZone(zoneId, zone, parentId = null) {
        this.zones.set(zoneId, { ...zone, id: zoneId });
        if (parentId) {
            if (!this.nestedStructures.has(parentId)) {
                this.nestedStructures.set(parentId, []);
            }
            this.nestedStructures.get(parentId).push(zoneId);
        }
    }
    
    getZone(zoneId) {
        return this.zones.get(zoneId);
    }
    
    getAllZones() {
        return Array.from(this.zones.values());
    }
    
    getNestedZones(parentId) {
        return this.nestedStructures.get(parentId) || [];
    }
    
    clear() {
        this.zones.clear();
        this.nestedStructures.clear();
    }
}

// Register the custom element
customElements.define('map-viewer', MapViewer);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MapViewer, SpatialDataStore };
}
