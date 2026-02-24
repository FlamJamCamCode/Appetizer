/**
 * Simple World Map Viewer - Basic, Working Implementation
 * No fancy features, just zoom and pan that actually work
 */

class SimpleWorldMap extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Simple state
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
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
                }
                
                .map-content {
                    position: absolute;
                    top: 0;
                    left: 0;
                    transform-origin: 0 0;
                    transition: transform 0.1s ease-out;
                }
                
                .world-map {
                    width: 2560px;
                    height: 1280px;
                    background-image: url('mercator-world-map.png');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                }
                
                .zone {
                    position: absolute;
                    background: rgba(0, 255, 255, 0.3);
                    border: 2px solid #00ffff;
                    border-radius: 5px;
                    padding: 5px;
                    font-size: 12px;
                    color: white;
                    cursor: pointer;
                    min-width: 100px;
                    min-height: 50px;
                }
                
                .zone:hover {
                    background: rgba(0, 255, 255, 0.5);
                }
                
                .controls {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 1000;
                }
                
                .control-btn {
                    background: rgba(0, 0, 0, 0.8);
                    border: 1px solid #333;
                    color: white;
                    padding: 10px;
                    margin: 2px;
                    cursor: pointer;
                    border-radius: 5px;
                }
                
                .control-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            </style>
            
            <div class="map-container">
                <div class="map-content" id="mapContent">
                    <div class="world-map" id="worldMap"></div>
                    <div id="zonesContainer"></div>
                </div>
                
                <div class="controls">
                    <button class="control-btn" id="zoomIn">+</button>
                    <button class="control-btn" id="zoomOut">-</button>
                    <button class="control-btn" id="reset">Reset</button>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const mapContent = this.shadowRoot.getElementById('mapContent');
        const zoomIn = this.shadowRoot.getElementById('zoomIn');
        const zoomOut = this.shadowRoot.getElementById('zoomOut');
        const reset = this.shadowRoot.getElementById('reset');
        
        // Mouse events
        mapContent.addEventListener('mousedown', (e) => this.startDrag(e));
        mapContent.addEventListener('mousemove', (e) => this.drag(e));
        mapContent.addEventListener('mouseup', () => this.endDrag());
        mapContent.addEventListener('wheel', (e) => this.zoom(e));
        
        // Button events
        zoomIn.addEventListener('click', () => this.zoomIn());
        zoomOut.addEventListener('click', () => this.zoomOut());
        reset.addEventListener('click', () => this.reset());
    }
    
    startDrag(e) {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.classList.add('dragging');
    }
    
    drag(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        
        this.translateX += deltaX;
        this.translateY += deltaY;
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        this.updateTransform();
    }
    
    endDrag() {
        this.isDragging = false;
        this.classList.remove('dragging');
    }
    
    zoom(e) {
        e.preventDefault();
        
        const rect = this.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(5, this.scale * delta));
        
        // Calculate zoom towards mouse position
        const scaleFactor = newScale / this.scale;
        
        // Get the point in world coordinates before zoom
        const worldX = (mouseX - this.translateX) / this.scale;
        const worldY = (mouseY - this.translateY) / this.scale;
        
        // Update scale
        this.scale = newScale;
        
        // Adjust translation to zoom towards mouse
        this.translateX = mouseX - worldX * this.scale;
        this.translateY = mouseY - worldY * this.scale;
        
        this.updateTransform();
    }
    
    zoomIn() {
        this.scale = Math.min(5, this.scale * 1.2);
        this.updateTransform();
    }
    
    zoomOut() {
        this.scale = Math.max(0.1, this.scale / 1.2);
        this.updateTransform();
    }
    
    reset() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
    }
    
    updateTransform() {
        const mapContent = this.shadowRoot.getElementById('mapContent');
        mapContent.style.transform = `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
    }
    
    addZone(zone) {
        const zonesContainer = this.shadowRoot.getElementById('zonesContainer');
        const zoneElement = document.createElement('div');
        zoneElement.className = 'zone';
        zoneElement.style.left = zone.x + 'px';
        zoneElement.style.top = zone.y + 'px';
        zoneElement.style.width = zone.width + 'px';
        zoneElement.style.height = zone.height + 'px';
        zoneElement.textContent = zone.name;
        
        zoneElement.addEventListener('click', () => {
            console.log('Clicked zone:', zone.name);
            // Simple zoom to zone
            this.zoomToZone(zone);
        });
        
        zonesContainer.appendChild(zoneElement);
    }
    
    zoomToZone(zone) {
        const rect = this.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate zone center
        const zoneCenterX = zone.x + zone.width / 2;
        const zoneCenterY = zone.y + zone.height / 2;
        
        // Set zoom level
        this.scale = 2;
        
        // Center the zone
        this.translateX = centerX - zoneCenterX * this.scale;
        this.translateY = centerY - zoneCenterY * this.scale;
        
        this.updateTransform();
    }
}

// Register the component
customElements.define('simple-world-map', SimpleWorldMap);
