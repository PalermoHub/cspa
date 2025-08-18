// ===== FILE: map-init.js - CORRETTO =====
/**
 * Inizializzazione mappa e layer base
 * RISOLTO: Aggiunto controllo esistenza CONFIG e gestione errori
 */

// Inizializza mappa
function initializeMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: createMapStyle(),
        center: CONFIG.map.center,
        zoom: CONFIG.map.zoom,
        maxBounds: CONFIG.map.maxBounds,
        maxZoom: CONFIG.map.maxZoom,
        minZoom: CONFIG.map.minZoom,
        hash: true,
        pitch: 0,
        dragRotate: false
    });

    // Event handlers per caricamento
    map.on('load', onMapLoad);
    map.on('sourcedata', onSourceData);
    
    return map;
}

function createMapStyle() {
    return {
        version: 8,
        sources: {
            'carto-light': {
                type: 'raster',
                tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors, © CartoDB - Rielaborazione dataset di <a href="https://www.linkedin.com/in/gbvitrano/" title="@gbvitrano" target="_blank">@gbvitrano </a> - 2025 - by <a href="https://x.com/opendatasicilia" title="@opendatasicilia" target="_blank">@opendatasicilia</a>'
            },
            'satellite': {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
                tileSize: 256,
                attribution: '© Google - Rielaborazione dataset di <a href="https://www.linkedin.com/in/gbvitrano/" title="@gbvitrano" target="_blank">@gbvitrano </a> - 2025 - by <a href="https://x.com/opendatasicilia" title="@opendatasicilia" target="_blank">@opendatasicilia</a>'
            },
            'osm': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors - Rielaborazione dataset di <a href="https://www.linkedin.com/in/gbvitrano/" title="@gbvitrano" target="_blank">@gbvitrano </a> - 2025 - by <a href="https://x.com/opendatasicilia" title="@opendatasicilia" target="_blank">@opendatasicilia</a>'
            },
            'google-maps': {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'],
                tileSize: 256,
                attribution: '© Google Maps - Rielaborazione dataset di <a href="https://www.linkedin.com/in/gbvitrano/" title="@gbvitrano" target="_blank">@gbvitrano </a> - 2025 - by <a href="https://x.com/opendatasicilia" title="@opendatasicilia" target="_blank">@opendatasicilia</a>'
            }
        },
        layers: [
            {
                id: 'carto-light-layer',
                type: 'raster',
                source: 'carto-light',
                minzoom: 0,
                maxzoom: 18
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
    };
}

function onMapLoad() {
    console.log('🗺️ Mappa caricata');
    
    // CONTROLLO SICUREZZA: Verifica che CONFIG sia disponibile
    if (typeof CONFIG === 'undefined' || !CONFIG.fields) {
        console.error('❌ CONFIG non disponibile! Riprovo tra 500ms...');
        setTimeout(onMapLoad, 500);
        return;
    }
    
    try {
        addDataLayers();
        addMapControls();
        setupEventHandlers();
        
        // Imposta il valore di default per uso del suolo
        const territorialSelect = document.getElementById('territorial-select');
        if (territorialSelect) {
            territorialSelect.value = 'landuse';
        }
        
        // SICUREZZA: Mostra legenda di base con controllo
        setTimeout(() => {
            if (typeof showBaseLegenda === 'function') {
                showBaseLegenda();
                console.log('✅ Legenda di base mostrata');
            } else {
                console.warn('⚠️ showBaseLegenda non disponibile');
            }
        }, 300);
        
        console.log('✅ Tutti i layer aggiunti');
        
    } catch (error) {
        console.error('❌ Errore in onMapLoad:', error);
        // Retry dopo un breve ritardo
        setTimeout(() => {
            console.log('🔄 Retry inizializzazione mappa...');
            onMapLoad();
        }, 1000);
    }
    
    // Aggiungi questo nella funzione onMapLoad
    map.on('idle', () => {
        if (typeof updateDynamicLegend === 'function') {
            setTimeout(updateDynamicLegend, 1000);
        }
    });
    
    // NUOVO: Inizializza sistema grafici quando la mappa è pronta
    setTimeout(() => {
        if (typeof initializeChartsSystem === 'function') {
            initializeChartsSystem();
        }
    }, 1000);
}

function addDataLayers() {
    // CONTROLLO SICUREZZA: Verifica CONFIG.fields
    if (!CONFIG || !CONFIG.fields || !CONFIG.fields.geography) {
        throw new Error('CONFIG.fields.geography non disponibile');
    }
    
    console.log('📦 Aggiungendo data layers...');
    
    // Aggiungi sorgente PMTiles
    map.addSource('palermo_catastale', {
        type: 'vector',
        url: CONFIG.pmtiles.source
    });
    
    // Layer base - uso del suolo
    map.addLayer({
        id: 'catastale-base',
        type: 'fill',
        source: 'palermo_catastale',
        'source-layer': CONFIG.pmtiles.sourceLayer,
        paint: {
            'fill-color': [
                'match',
                ['get', CONFIG.fields.geography.landUseClass],
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
        'source-layer': CONFIG.pmtiles.sourceLayer,
        paint: {
            'fill-color': '#ff9900',
            'fill-opacity': 0.8
        },
        filter: ['==', ['get', CONFIG.fields.identifiers.fid], '']
    });

    // Layer contorni - inizialmente nascosti
    map.addLayer({
        id: 'catastale-outline',
        type: 'line',
        source: 'palermo_catastale',
        'source-layer': CONFIG.pmtiles.sourceLayer,
        paint: {
            'line-color': '#333333',
            'line-width': 0.5,
            'line-opacity': 0.6
        },
        layout: {
            'visibility': 'none'
        }
    });

    addPerimeterLayers();
    console.log('✅ Data layers aggiunti');
}

function addPerimeterLayers() {
    // Perimetro Palermo
    map.addLayer({
        id: 'palermo-perimeter',
        type: 'line',
        source: 'palermo_catastale',
        'source-layer': 'Palermo', // Fallback fisso per compatibilità
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

    // Centro Storico
    map.addLayer({
        id: 'centro-storico-perimeter',
        type: 'line',
        source: 'palermo_catastale',
        'source-layer': 'centro_storico', // Fallback fisso per compatibilità
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

    // UPL Centro Storico
    map.addLayer({
        id: 'upl-cs-perimeter',
        type: 'line',
        source: 'palermo_catastale',
        'source-layer': 'upl_cs', // Fallback fisso per compatibilità
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
}

function addMapControls() {
    console.log('🎮 Aggiungendo controlli mappa...');
    
    try {
        // Aggiungi controlli standard con posizionamento corretto
        map.addControl(new SearchControl(), 'top-right');
        
        // CORREZIONE: NavigationControl per zoom +/-
        const navigationControl = new maplibregl.NavigationControl({
            showCompass: false,
            showZoom: true,
            visualizePitch: false
        });
        map.addControl(navigationControl, 'top-right');
        
        console.log('✅ Controlli mappa aggiunti');
        
    } catch (error) {
        console.error('❌ Errore aggiunta controlli:', error);
    }
}

function onSourceData(e) {
    if (e.sourceId === 'palermo_catastale' && e.isSourceLoaded) {
        console.log('📊 Source data caricato');
        
        // Non è più necessario popolare i filtri qui
        // La gestione è ora completamente in unified-filters.js
        setTimeout(() => {
            if (typeof initializeDynamicFilters === 'function') {
                // Non chiamare qui, verrà chiamato da DOMContentLoaded
            }
        }, 500);
    }
}