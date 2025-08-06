// ===== FILE: event-handlers.js =====
/**
 * Gestori eventi principali dell'applicazione
 */

function setupEventHandlers() {
    // Event listeners per dropdown
    document.getElementById('basemap-select').addEventListener('change', (e) => {
        switchBasemap(e.target.value);
    });

    // Event listeners per temi demografici, economici e territoriali
    document.getElementById('demographic-select').addEventListener('change', (e) => {
        if (e.target.value) {
            resetAllSelects('demographic-select');
            activateTheme(e.target.value);
        } else {
            activateTheme('landuse');
        }
    });

    document.getElementById('economic-select').addEventListener('change', (e) => {
        if (e.target.value) {
            resetAllSelects('economic-select');
            activateTheme(e.target.value);
        } else {
            activateTheme('landuse');
        }
    });

    document.getElementById('territorial-select').addEventListener('change', (e) => {
        if (e.target.value) {
            resetAllSelects('territorial-select');
            activateTheme(e.target.value);
        } else {
            activateTheme('landuse');
        }
    });

    // Event listeners per perimetri
    document.getElementById('palermo-perimeter').addEventListener('change', (e) => {
        togglePerimeter('palermo-perimeter', e.target.checked);
    });

    document.getElementById('centro-storico-perimeter').addEventListener('change', (e) => {
        togglePerimeter('centro-storico-perimeter', e.target.checked);
    });

    document.getElementById('upl-cs-perimeter').addEventListener('change', (e) => {
        togglePerimeter('upl-cs-perimeter', e.target.checked);
    });

    // Gestione hover e click sulla mappa
    setupMapInteractions();

    // Gestione responsive e tastiera
    setupResponsiveHandlers();
}

function setupMapInteractions() {
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
}

function setupResponsiveHandlers() {
    // Gestione responsive
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            const panel = document.getElementById('info-panel');
            if (panel.classList.contains('visible')) {
                panel.style.width = `${window.innerWidth - 20}px`;
            }
        }
    });

    // Gestione tastiera
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeInfoPanel();
        }
    });
}