// Define custom oblique Mercator projection
proj4.defs('custom:omerc', '+proj=omerc +lat_0=-57.08 +lon_0=-72.63 +alpha=72.24 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs');
ol.proj.proj4.register(proj4);

const customProj = new ol.proj.Projection({
    code: 'custom:omerc',
    extent: [-20000000, -20000000, 20000000, 20000000],
    units: 'm'
});

// Initialize map
const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        new ol.layer.Graticule({
            strokeStyle: new ol.style.Stroke({ color: 'green', lineDash: [4], width: 2 })
        })
    ],
    view: new ol.View({
        projection: customProj,
        center: [0, 0],
        zoom: 2
    })
});

// Triads vector layer
const triadSource = new ol.source.Vector();
const triadLayer = new ol.layer.Vector({ source: triadSource });
map.addLayer(triadLayer);

// Define stripe pattern (SVG for stride coloring)
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
pattern.setAttribute('id', 'stripe-pattern');
pattern.setAttribute('width', '10');
pattern.setAttribute('height', '10');
pattern.setAttribute('patternTransform', 'rotate(45)');
pattern.innerHTML = '<rect width="5" height="10" fill="red"/><rect x="5" width="5" height="10" fill="blue"/>';
defs.appendChild(pattern);
svg.appendChild(defs);
document.body.appendChild(svg);  // Add to DOM for reference

const stripeStyle = new ol.style.Style({
    fill: new ol.style.Fill({ color: 'url(#stripe-pattern)' }),
    stroke: new ol.style.Stroke({ color: 'black', width: 1 })
});

// Apply style to triads
function getTriadStyle(feature) {
    return stripeStyle;
}
triadLayer.setStyle(getTriadStyle);

// Search function (Google-like)
function searchLocation(query) {
    if (!query) return;
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`)
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                const lonLat = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
                const projected = ol.proj.fromLonLat(lonLat, customProj);
                map.getView().animate({ center: projected, zoom: 10 });
            } else {
                alert('Location not found');
            }
        })
        .catch(err => console.error(err));
}

// Data structure for triads (hierarchical JSON)
let triads = {
    triads: []
};

// Function to add a new triad (example: draws a simple polygon near center)
function addNewTriad() {
    const id = `triad_${Date.now()}`;
    const parentId = prompt('Enter parent triad ID (or leave blank for root):');
    const dataLink = prompt('Enter data link (e.g., https://example.com):') || '';
    
    // Example geometry: Small polygon near current center (in lon/lat)
    const centerLonLat = ol.proj.toLonLat(map.getView().getCenter(), customProj);
    const geometry = {
        type: 'Polygon',
        coordinates: [[
            [centerLonLat[0] - 1, centerLonLat[1] - 1],
            [centerLonLat[0] + 1, centerLonLat[1] - 1],
            [centerLonLat[0] + 1, centerLonLat[1] + 1],
            [centerLonLat[0] - 1, centerLonLat[1] + 1],
            [centerLonLat[0] - 1, centerLonLat[1] - 1]
        ]]
    };

    const newTriad = {
        id,
        name: `Triad ${id}`,
        geometry,
        style: { fill: 'stripe', colors: ['red', 'blue'], strideWidth: 10, angle: 45 },
        dataLinks: [dataLink],
        children: []
    };

    if (parentId) {
        // Find parent and add as child
        const addToChildren = (nodes) => {
            for (let node of nodes) {
                if (node.id === parentId) {
                    node.children.push(newTriad);
                    return true;
                }
                if (addToChildren(node.children)) return true;
            }
            return false;
        };
        addToChildren(triads.triads);
    } else {
        triads.triads.push(newTriad);
    }

    renderTriads();
    alert(`Added triad ${id}`);
}

// Recursive render function for nested triads
function renderTriads(nodes = triads.triads) {
    triadSource.clear();
    const renderNode = (node) => {
        const feature = new ol.Feature({
            geometry: new ol.geom.Polygon(node.geometry.coordinates).transform('EPSG:4326', customProj)
        });
        feature.setProperties({ id: node.id, dataLink: node.dataLinks[0] || '' });
        triadSource.addFeature(feature);

        node.children.forEach(renderNode);
    };
    nodes.forEach(renderNode);
}

// Interaction: Click on triad for info
map.on('click', (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
    if (feature) {
        const props = feature.getProperties();
        alert(`Triad ID: ${props.id}, Link: ${props.dataLink}`);
    }
});

// Save to LocalStorage
function saveTriads() {
    localStorage.setItem('triads', JSON.stringify(triads));
    alert('Triads saved');
}

// Load from LocalStorage
function loadTriads() {
    const saved = localStorage.getItem('triads');
    if (saved) {
        triads = JSON.parse(saved);
        renderTriads();
        alert('Triads loaded');
    } else {
        alert('No saved triads');
    }
}

// Initial load
loadTriads();