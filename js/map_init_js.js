// Inizializza mappa
map = new maplibregl.Map({
    container: 'map',
    style: {
        version: 8,
        sources: {
            'carto-light': {
                type: 'raster',
                tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors, © CartoDB - Rielaborazione dataset di <a href="https://www.linkedin.com/in/gbvitrano/" title="@gbvitrano" target="_blank">@gbvitrano </a> - 2025'
            },
            'satellite': {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
                tileSize: 256,
                attribution: '© Google - Rielaborazione dataset di <a href="https://www.linkedin.com/in/gbvitrano/" title="@gbvitrano" target="_blank">@gbvitrano </a> - 2025'
            },
            'osm': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors - Rielaborazione dataset di <a href="https://www.linkedin.com/in/gbvitrano/" title="@gbvitrano" target="_blank">@gbvitrano </a> - 2025'
            },
            'google-maps': {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'],
                tileSize: 256,
                attribution: '© Google Maps - Rielaborazione dataset di <a href="https://www.linkedin.com/in/gbvitrano/" title="@gbvitrano" target="_blank">@gbvitrano </a> - 2025'
            }
        },
        layers: [
            {
                id: 'carto-light-layer',
                type: 'raster',
                source: 'carto-light',
                minzoom: 0,
                maxzoom: 17
            },
            {
                id: 'satellite-layer',
                type: 'raster',
                source: 'satellite',
                minzoom: 0,
                maxZoom: 17,
                layout: { visibility: 'none' }
            },
            {
                id: 'osm-layer',
                type: 'raster',
                source: 'osm',
                minzoom: 0,
                maxZoom: 19,
                layout: { visibility: 'none' }
            },
            {
                id: 'google-maps-layer',
                type: 'raster',
                source: 'google-maps',
                minzoom: 0,
                maxZoom: 19,
                layout: { visibility: 'none' }
            }
        ]
    },
    center: center,
    zoom: zoom,
    maxBounds: maxBounds,
    maxZoom: 17,
    minZoom: 12,
    hash: true,
    pitch: 0,
    dragRotate: false
});

// Caricamento mappa
map.on('load', function() {
    // Aggiungi sorgente PMTiles
    map.addSource('palermo_catastale', {
        type: 'vector',
        url: 'pmtiles://https://palermohub.github.io/cspa/dati/pacs.pmtiles'
    });
    
    // Layer base - uso del suolo
    map.addLayer({
        id: 'catastale-base',
        type: 'fill',
        source: 'palermo_catastale',
        'source-layer': 'catastale',
        paint: {
            'fill-color': [
                'match',
                ['get', 'class'],
                'servizi', landUseColors.servizi,
                'military', landUseColors.military,
                'park', landUseColors.park,
                'pedestrian', landUseColors.pedestrian,
                'protected', landUseColors.protected,
                'recreation', landUseColors.recreation,
                'religious', landUseColors.religious,
                'residential', landUseColors.residential,
                'education', landUseColors.education,
                'medical', landUseColors.medical,
                'transportation', landUseColors.transportation,
                landUseColors['']
            ],
            'fill-opacity': 0.75,
            'fill-antialias': true
        }
    });

    // Layer hover
    map.addLayer({
        id: 'catastale-hover',
        type: 'fill',
        source: 'palermo_catastale',
        'source-layer': 'catastale',
        paint: {
            'fill-color': '#ff9900',
            'fill-opacity': 0.8
        },
        filter: ['==', ['get', 'fid'], '']
    });

    // Layer contorni - inizialmente nascosti
    map.addLayer({
        id: 'catastale-outline',
        type: 'line',
        source: 'palermo_catastale',
        'source-layer': 'catastale',
        paint: {
            'line-color': '#333333',
            'line-width': 0.5,
            'line-opacity': 0.6
        },
        layout: {
            'visibility': 'none'
        }
    });

    // LAYER PERIMETRI AGGIUNTIVI
    
    // Perimetro Palermo - tratteggio lungo (12px line, 8px gap)
    map.addLayer({
        id: 'palermo-perimeter',
        type: 'line',
        source: 'palermo_catastale',
        'source-layer': 'Palermo',
        paint: {
            'line-color': '#ff0000',
            'line-width': 2,
            'line-opacity': 0.8,
            'line-dasharray': [12, 8]
        },
        layout: {
            'visibility': 'none'
        }
    }, 'catastale-hover');

    // Centro Storico - tratteggio medio (8px line, 6px gap)
    map.addLayer({
        id: 'centro-storico-perimeter',
        type: 'line',
        source: 'palermo_catastale',
        'source-layer': 'centro_storico',
        paint: {
            'line-color': '#4a4a4a',
            'line-width': 1.5,
            'line-opacity': 0.8,
            'line-dasharray': [8, 6]
        },
        layout: {
            'visibility': 'none'
        }
    }, 'catastale-hover');

    // UPL Centro Storico - tratteggio corto (4px line, 4px gap)
    map.addLayer({
        id: 'upl-cs-perimeter',
        type: 'line',
        source: 'palermo_catastale',
        'source-layer': 'upl_cs',
        paint: {
            'line-color': '#4a4a4a',
            'line-width': 1,
            'line-opacity': 0.8,
            'line-dasharray': [4, 4]
        },
        layout: {
            'visibility': 'visible'
        }
    }, 'catastale-hover');
    
    // Controlli navigazione
    map.addControl(new maplibregl.NavigationControl());
    
    // Imposta il valore di default per uso del suolo
    document.getElementById('territorial-select').value = 'landuse';
    
    // Popola il dropdown dei fogli
    populateFoglioFilter();
    
    // Event listener per caricamento dati (per calcoli dinamici)
    map.querySourceFeatures('palermo_catastale', {
        sourceLayer: 'catastale'
    });
    
    // Mostra legenda di base
    showBaseLegenda();
});

// Gestione hover
map.on('mouseenter', 'catastale-base', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    
    if (e.features.length > 0) {
        const feature = e.features[0];
        const featureId = feature.properties.fid || feature.properties.particella || feature.id;
        
        if (hoveredPolygon !== null) {
            map.setFilter('catastale-hover', ['==', ['get', 'fid'], '']);
        }
        
        hoveredPolygon = featureId;
        map.setFilter('catastale-hover', [
            'any',
            ['==', ['get', 'fid'], featureId],
            ['==', ['get', 'particella'], featureId]
        ]);
    }
});

map.on('mouseleave', 'catastale-base', () => {
    map.getCanvas().style.cursor = '';
    
    if (hoveredPolygon !== null) {
        map.setFilter('catastale-hover', ['==', ['get', 'fid'], '']);
    }
    hoveredPolygon = null;
});

// Gestione click
map.on('click', 'catastale-base', (e) => {
    if (e.features.length > 0) {
        const feature = e.features[0];
        showFeatureInfo(feature);
    }
});