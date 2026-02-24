/**
 * World Map Viewer Web Component
 * A Google Maps-inspired zoomable world map with tile system and spatial data
 */

class WorldMapViewer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Map state
        this.zoom = 1;
        this.center = { x: 0, y: 0 };
        this.viewport = { width: 0, height: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        
        // Tile system (inspired by Google Maps)
        this.tileSize = 256;
        this.minZoom = 0;
        this.maxZoom = 8;
        this.tiles = new Map();
        
        // Spatial data
        this.zones = new Map();
        this.quadTree = new QuadTree({ x: 0, y: 0, width: 2560, height: 1280 });
        
        // Configuration
        this.config = {
            tileSize: 256,
            minZoom: 0,
            maxZoom: 8,
            worldWidth: 2560,
            worldHeight: 1280,
            showGrid: true,
            showCoordinates: false
        };
        
        this.render();
        this.attachEventListeners();
        this.loadWorldMap();
    }
    
    static get observedAttributes() {
        return ['zones-data', 'config'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === 'zones-data') {
                this.loadZonesData(JSON.parse(newValue));
            } else if (name === 'config') {
                Object.assign(this.config, JSON.parse(newValue));
            }
        }
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
                    cursor: grab;
                }
                
                :host(.dragging) {
                    cursor: grabbing;
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
                    transition: transform 0.1s ease-out;
                }
                
                .tile-layer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                
                .zone {
                    position: absolute;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid;
                    border-radius: 8px;
                    padding: 8px;
                    font-size: 0.8em;
                    min-width: 80px;
                    max-width: 200px;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(5px);
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
                    color: #fff;
                }
                
                .controls {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
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
                    font-size: 0.9em;
                }
                
                .control-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .zoom-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                
                .zoom-btn {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2em;
                    font-weight: bold;
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
                
                .legend h3 {
                    margin: 0 0 10px 0;
                    color: #00ffff;
                    font-size: 1em;
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
                
                .grid {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    opacity: 0.3;
                }
                
                .grid-line {
                    position: absolute;
                    background: rgba(0, 255, 255, 0.2);
                }
                
                .grid-line.vertical {
                    width: 1px;
                    height: 100%;
                }
                
                .grid-line.horizontal {
                    height: 1px;
                    width: 100%;
                }
            </style>
            
            <div class="map-container">
                <div class="map-canvas" id="mapCanvas">
                    <div class="tile-layer" id="tileLayer"></div>
                    <div class="grid" id="grid"></div>
                    <svg id="zonesSvg" class="zones-svg"></svg>
                </div>
                
                <div class="controls">
                    <div class="zoom-controls">
                        <button class="control-btn zoom-btn" id="zoomIn">+</button>
                        <button class="control-btn zoom-btn" id="zoomOut">-</button>
                    </div>
                    <button class="control-btn" id="resetView">Reset</button>
                    <button class="control-btn" id="toggleMinimap">Minimap</button>
                    <button class="control-btn" id="toggleGrid">Grid</button>
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
        const resetView = this.shadowRoot.getElementById('resetView');
        const toggleMinimap = this.shadowRoot.getElementById('toggleMinimap');
        const toggleGrid = this.shadowRoot.getElementById('toggleGrid');
        
        // Pan and zoom
        mapCanvas.addEventListener('mousedown', (e) => this.startDrag(e));
        mapCanvas.addEventListener('mousemove', (e) => this.drag(e));
        mapCanvas.addEventListener('mouseup', () => this.endDrag());
        mapCanvas.addEventListener('wheel', (e) => this.handleZoom(e));
        
        // Controls
        zoomIn.addEventListener('click', () => this.zoomIn());
        zoomOut.addEventListener('click', () => this.zoomOut());
        resetView.addEventListener('click', () => this.resetView());
        toggleMinimap.addEventListener('click', () => this.toggleMinimap());
        toggleGrid.addEventListener('click', () => this.toggleGrid());
        
        // Resize observer
        const resizeObserver = new ResizeObserver(() => this.updateViewport());
        resizeObserver.observe(this);
        
        // Close detail panel
        document.addEventListener('click', (e) => {
            if (!e.target.closest('world-map-viewer')) {
                this.hideZoneDetail();
            }
        });
    }
    
    loadWorldMap() {
        this.loadMercatorWorldMap();
        this.updateViewport();
    }
    
    loadMercatorWorldMap() {
        const tileLayer = this.shadowRoot.getElementById('tileLayer');
        tileLayer.innerHTML = '';
        
        // Create a single background image covering the entire world map
        const worldMapContainer = document.createElement('div');
        worldMapContainer.style.position = 'absolute';
        worldMapContainer.style.top = '0';
        worldMapContainer.style.left = '0';
        worldMapContainer.style.width = this.config.worldWidth + 'px';
        worldMapContainer.style.height = this.config.worldHeight + 'px';
        worldMapContainer.style.backgroundImage = 'url(mercator-world-map.png)';
        worldMapContainer.style.backgroundSize = 'cover';
        worldMapContainer.style.backgroundPosition = 'center';
        worldMapContainer.style.backgroundRepeat = 'no-repeat';
        
        tileLayer.appendChild(worldMapContainer);
    }
    
    
    loadZonesData(data) {
        this.zones.clear();
        this.quadTree.clear();
        
        data.zones.forEach(zone => {
            this.zones.set(zone.id, zone);
            this.quadTree.insert(zone);
        });
        
        this.renderZones();
        this.updateLegend();
    }
    
    renderZones() {
        const svg = this.shadowRoot.getElementById('zonesSvg');
        svg.innerHTML = '';
        
        // Get visible zones based on current viewport
        const visibleZones = this.getVisibleZones();
        
        visibleZones.forEach(zone => {
            if (zone.shape && zone.shape.type === 'polygon') {
                this.renderPolygonZone(zone);
            } else {
                this.renderRectZone(zone);
            }
        });
    }
    
    getVisibleZones() {
        const viewport = this.getViewportBounds();
        return this.quadTree.query(viewport);
    }
    
    getViewportBounds() {
        const scale = this.zoom;
        const offsetX = this.center.x;
        const offsetY = this.center.y;
        
        return {
            x: -offsetX / scale,
            y: -offsetY / scale,
            width: this.viewport.width / scale,
            height: this.viewport.height / scale
        };
    }
    
    renderPolygonZone(zone) {
        const svg = this.shadowRoot.getElementById('zonesSvg');
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        
        const points = zone.shape.points.map(p => `${p.x},${p.y}`).join(' ');
        polygon.setAttribute('points', points);
        polygon.setAttribute('class', `zone-polygon ${zone.type || 'level1-zone'}`);
        polygon.setAttribute('data-zone-id', zone.id);
        
        polygon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectZone(zone);
        });
        
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
        
        rect.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectZone(zone);
        });
        
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', zone.position.x + zone.bounds.width / 2);
        label.setAttribute('y', zone.position.y + zone.bounds.height / 2);
        label.setAttribute('class', 'zone-label');
        label.textContent = zone.name;
        
        svg.appendChild(rect);
        svg.appendChild(label);
    }
    
    selectZone(zone) {
        this.shadowRoot.querySelectorAll('.zone-polygon.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        const zoneElement = this.shadowRoot.querySelector(`[data-zone-id="${zone.id}"]`);
        if (zoneElement) {
            zoneElement.classList.add('selected');
        }
        
        // Zoom to the selected zone
        this.zoomToZone(zone);
        
        this.showZoneDetail(zone);
        
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
            <p><strong>Population:</strong> ${zone.population || 'Unknown'}</p>
            <p><strong>Description:</strong> ${zone.description || 'No description available'}</p>
            ${zone.features ? `
                <p><strong>Features:</strong> ${zone.features.join(', ')}</p>
            ` : ''}
            ${zone.nestedZones ? `
                <div class="nested-zones">
                    <strong>Nested Zones:</strong>
                    ${zone.nestedZones.map(nested => `
                        <div class="nested-zone" data-nested-id="${nested.id}">
                            <strong>${nested.name}</strong> (Level ${nested.level})<br>
                            <small>${nested.description}</small>
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
        
        this.zones.forEach(zone => {
            zoneTypes.add(zone.type || 'level1-zone');
        });
        
        legendItems.innerHTML = Array.from(zoneTypes).map(type => `
            <div class="legend-item">
                <div class="legend-color ${type}"></div>
                <span>${type.replace('-zone', '').replace('level', 'Level ')}</span>
            </div>
        `).join('');
    }
    
    updateViewport() {
        const rect = this.getBoundingClientRect();
        this.viewport.width = rect.width;
        this.viewport.height = rect.height;
        this.updateTransform();
    }
    
    updateTransform() {
        const mapCanvas = this.shadowRoot.getElementById('mapCanvas');
        const scale = this.zoom;
        const translateX = this.center.x;
        const translateY = this.center.y;
        
        mapCanvas.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
        
        this.renderZones();
        this.updateMinimap();
    }
    
    // Zoom and pan methods
    zoomIn() {
        this.zoomTowardsCenter(1.2);
    }
    
    zoomOut() {
        this.zoomTowardsCenter(1 / 1.2);
    }
    
    zoomTowardsCenter(factor) {
        const centerX = this.viewport.width / 2;
        const centerY = this.viewport.height / 2;
        this.zoomTowardsPoint(centerX, centerY, factor);
    }
    
    zoomTowardsPoint(screenX, screenY, factor) {
        const newZoom = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, this.zoom * factor));
        
        // Calculate the point in world coordinates before zoom
        const worldX = (screenX - this.center.x) / this.zoom;
        const worldY = (screenY - this.center.y) / this.zoom;
        
        // Update zoom
        this.zoom = newZoom;
        
        // Adjust center to zoom towards the specified point
        this.center.x = screenX - worldX * this.zoom;
        this.center.y = screenY - worldY * this.zoom;
        
        this.updateTransform();
    }
    
    resetView() {
        this.zoom = 1;
        this.center = { x: 0, y: 0 };
        this.updateTransform();
    }
    
    zoomToZone(zone) {
        // Calculate zone center
        let zoneCenterX, zoneCenterY;
        
        if (zone.shape && zone.shape.type === 'polygon') {
            zoneCenterX = zone.shape.center.x;
            zoneCenterY = zone.shape.center.y;
        } else {
            zoneCenterX = zone.position.x + zone.bounds.width / 2;
            zoneCenterY = zone.position.y + zone.bounds.height / 2;
        }
        
        // Calculate the screen position for the zone center
        const screenX = zoneCenterX * this.zoom + this.center.x;
        const screenY = zoneCenterY * this.zoom + this.center.y;
        
        // Zoom towards the zone center
        this.zoomTowardsPoint(screenX, screenY, 2.0); // Zoom in by 2x
    }
    
    startDrag(e) {
        this.isDragging = true;
        this.dragStart = { x: e.clientX - this.center.x, y: e.clientY - this.center.y };
        this.classList.add('dragging');
    }
    
    drag(e) {
        if (!this.isDragging) return;
        this.center.x = e.clientX - this.dragStart.x;
        this.center.y = e.clientY - this.dragStart.y;
        this.updateTransform();
    }
    
    endDrag() {
        this.isDragging = false;
        this.classList.remove('dragging');
    }
    
    handleZoom(e) {
        e.preventDefault();
        
        // Get mouse position relative to the map container
        const rect = this.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate zoom delta
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, this.zoom * delta));
        
        // Calculate the zoom factor
        const zoomFactor = newZoom / this.zoom;
        
        // Calculate the point in world coordinates before zoom
        const worldX = (mouseX - this.center.x) / this.zoom;
        const worldY = (mouseY - this.center.y) / this.zoom;
        
        // Update zoom
        this.zoom = newZoom;
        
        // Adjust center to zoom towards mouse position
        this.center.x = mouseX - worldX * this.zoom;
        this.center.y = mouseY - worldY * this.zoom;
        
        this.updateTransform();
    }
    
    toggleMinimap() {
        const minimap = this.shadowRoot.getElementById('minimap');
        minimap.style.display = minimap.style.display === 'none' ? 'block' : 'none';
    }
    
    toggleGrid() {
        const grid = this.shadowRoot.getElementById('grid');
        grid.style.display = grid.style.display === 'none' ? 'block' : 'none';
    }
    
    updateMinimap() {
        const minimap = this.shadowRoot.getElementById('minimap');
        const viewport = this.shadowRoot.getElementById('minimapViewport');
        if (minimap.style.display === 'none') return;
        
        const scale = 200 / this.config.worldWidth;
        const viewportWidth = (this.config.worldWidth * scale) / this.zoom;
        const viewportHeight = (this.config.worldHeight * scale) / this.zoom;
        const viewportX = (-this.center.x * scale);
        const viewportY = (-this.center.y * scale);
        
        viewport.style.width = viewportWidth + 'px';
        viewport.style.height = viewportHeight + 'px';
        viewport.style.left = viewportX + 'px';
        viewport.style.top = viewportY + 'px';
    }
}

// QuadTree for spatial indexing
class QuadTree {
    constructor(bounds, maxObjects = 10, maxLevels = 5, level = 0) {
        this.bounds = bounds;
        this.maxObjects = maxObjects;
        this.maxLevels = maxLevels;
        this.level = level;
        this.objects = [];
        this.nodes = [];
    }
    
    clear() {
        this.objects = [];
        this.nodes = [];
    }
    
    insert(obj) {
        if (this.nodes.length > 0) {
            const index = this.getIndex(obj);
            if (index !== -1) {
                this.nodes[index].insert(obj);
                return;
            }
        }
        
        this.objects.push(obj);
        
        if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
            if (this.nodes.length === 0) {
                this.split();
            }
            
            let i = 0;
            while (i < this.objects.length) {
                const index = this.getIndex(this.objects[i]);
                if (index !== -1) {
                    this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                } else {
                    i++;
                }
            }
        }
    }
    
    query(rect) {
        const returnObjects = [];
        
        if (this.nodes.length > 0) {
            const index = this.getIndex(rect);
            if (index !== -1) {
                returnObjects.push(...this.nodes[index].query(rect));
            } else {
                for (let i = 0; i < this.nodes.length; i++) {
                    returnObjects.push(...this.nodes[i].query(rect));
                }
            }
        }
        
        returnObjects.push(...this.objects);
        return returnObjects;
    }
    
    split() {
        const subWidth = this.bounds.width / 2;
        const subHeight = this.bounds.height / 2;
        const x = this.bounds.x;
        const y = this.bounds.y;
        
        this.nodes[0] = new QuadTree({ x: x + subWidth, y: y, width: subWidth, height: subHeight }, this.maxObjects, this.maxLevels, this.level + 1);
        this.nodes[1] = new QuadTree({ x: x, y: y, width: subWidth, height: subHeight }, this.maxObjects, this.maxLevels, this.level + 1);
        this.nodes[2] = new QuadTree({ x: x, y: y + subHeight, width: subWidth, height: subHeight }, this.maxObjects, this.maxLevels, this.level + 1);
        this.nodes[3] = new QuadTree({ x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight }, this.maxObjects, this.maxLevels, this.level + 1);
    }
    
    getIndex(rect) {
        let index = -1;
        const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
        const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);
        
        const topQuadrant = (rect.y < horizontalMidpoint && rect.y + rect.height < horizontalMidpoint);
        const bottomQuadrant = (rect.y > horizontalMidpoint);
        
        if (rect.x < verticalMidpoint && rect.x + rect.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            } else if (bottomQuadrant) {
                index = 2;
            }
        } else if (rect.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 0;
            } else if (bottomQuadrant) {
                index = 3;
            }
        }
        
        return index;
    }
}

// Register the custom element
customElements.define('world-map-viewer', WorldMapViewer);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WorldMapViewer, QuadTree };
}
