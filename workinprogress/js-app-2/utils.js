// ===== FILE: utils.js =====
/**
 * Funzioni di utilità generali
 */

function resetAllSelects(exceptId) {
    const selects = ['demographic-select', 'economic-select', 'territorial-select'];
    selects.forEach(selectId => {
        if (selectId !== exceptId) {
            document.getElementById(selectId).value = '';
        }
    });
}

function activateTheme(themeKey) {
    if (themeKey === 'landuse' || themeKey === '' || !themeKey) {
        removeTheme();
    } else {
        applyTheme(themeKey);
    }
}

function switchBasemap(value) {
    const layers = [
        'carto-light-layer', 
        'satellite-layer',
        'osm-layer',
        'google-maps-layer'
    ];
    
    const targetLayer = value === 'carto-light' ? 'carto-light-layer' :
                        value === 'satellite' ? 'satellite-layer' :
                        value === 'osm' ? 'osm-layer' :
                        'google-maps-layer';
    
    layers.forEach(layerId => {
        const visibility = (layerId === targetLayer) ? 'visible' : 'none';
        map.setLayoutProperty(layerId, 'visibility', visibility);
    });
}

function togglePerimeter(layerId, show) {
    const visibility = show ? 'visible' : 'none';
    map.setLayoutProperty(layerId, 'visibility', visibility);
}

function toggleBorders(show) {
    const visibility = show ? 'visible' : 'none';
    map.setLayoutProperty('catastale-outline', 'visibility', visibility);
    
    if (typeof syncBordersControls === 'function') {
        syncBordersControls(show);
    }
}

// ===== INTEGRAZIONE CON RESET.JS =====
/**
 * Estende reset.js per includere i filtri dinamici
 */

// Override della funzione resetMap esistente per includere filtri dinamici
function extendedResetMap() {
    console.log('🔄 Eseguendo reset completo esteso...');
    
    // Reset filtri dinamici prima del reset standard
    if (typeof resetAllDynamicFilters === 'function') {
        resetAllDynamicFilters();
    }
    
    // Esegue il reset standard esistente
    if (typeof safeResetMap === 'function') {
        safeResetMap();
    } else if (typeof resetMap === 'function') {
        resetMap();
    }
    
    console.log('✅ Reset completo esteso completato');
}

// Aggiunge integrazione al sistema reset esistente
document.addEventListener('DOMContentLoaded', function() {
    // Se esiste il pulsante reset tradizionale, lo estende
    const resetButton = document.getElementById('reset-map');
    if (resetButton) {
        resetButton.removeEventListener('click', resetMap);
        resetButton.addEventListener('click', extendedResetMap);
    }
    
    // Estende anche i controlli MapLibre se presenti
    setTimeout(() => {
        const mapLibreResetButton = document.querySelector('.maplibre-reset-control');
        if (mapLibreResetButton) {
            mapLibreResetButton.removeEventListener('click', safeResetMap);
            mapLibreResetButton.addEventListener('click', extendedResetMap);
        }
    }, 1500);
});

// ===== INIZIALIZZAZIONE PRINCIPALE =====
/**
 * Inizializzazione coordinata di tutti i moduli
 */

// Inizializzazione principale quando il DOM è pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inizializzazione applicazione modulare...');
    
    // Inizializza la mappa
    initializeMap();
    
    // Gli altri moduli si inizializzeranno automaticamente tramite eventi
    console.log('✅ Inizializzazione completata');
});

console.log('📦 Moduli caricati: config, map-init, dynamic-filters, event-handlers, filters, utils');

// ===== NUOVE FUNZIONI UTILITY =====

function getCurrentViewportFeatures() {
    if (!map) return [];
    
    // Ottieni solo le feature visibili nella viewport corrente
    return map.queryRenderedFeatures({
        layers: ['catastale-base', 'catastale-thematic', 'catastale-hover'],
        filter: getCurrentFilter()
    });
}

function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    }
}

function getCurrentFilter() {
    const filters = [];
    
    if (currentMandamentoFilter && currentMandamentoFilter !== '') {
        let dbValue = currentMandamentoFilter;
        if (dbValue === 'Castellammare') dbValue = 'Castellamare';
        filters.push(['==', ['get', 'Mandamento'], dbValue]);
    }
    
    if (currentFoglioFilter && currentFoglioFilter !== '') {
        filters.push(['==', ['get', 'foglio'], currentFoglioFilter]);
    }
    
    return filters.length > 0 ? ['all', ...filters] : null;
}