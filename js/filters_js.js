// Funzione per popolare il filtro dei fogli
function populateFoglioFilter() {
    map.on('data', function(e) {
        if (e.sourceId === 'palermo_catastale' && e.isSourceLoaded) {
            const features = map.querySourceFeatures('palermo_catastale', {
                sourceLayer: 'catastale'
            });
            
            if (features.length > 0) {
                const foglioSet = new Set();
                features.forEach(feature => {
                    const foglio = feature.properties.foglio;
                    if (foglio && foglio !== null && foglio !== '') {
                        foglioSet.add(foglio);
                    }
                });
                
                availableFogli = Array.from(foglioSet).sort((a, b) => {
                    // Ordina numericamente se possibile, altrimenti alfabeticamente
                    const numA = parseInt(a);
                    const numB = parseInt(b);
                    if (!isNaN(numA) && !isNaN(numB)) {
                        return numA - numB;
                    }
                    return a.localeCompare(b);
                });
                
                updateFoglioDropdown();
            }
        }
    });
}

// Funzione per aggiornare il dropdown dei fogli
function updateFoglioDropdown() {
    const foglioSelect = document.getElementById('foglio-filter');
    
    // Rimuovi tutte le opzioni tranne la prima (Tutti i Fogli)
    while (foglioSelect.children.length > 1) {
        foglioSelect.removeChild(foglioSelect.lastChild);
    }
    
    // Aggiungi le opzioni per ogni foglio
    availableFogli.forEach(foglio => {
        const option = document.createElement('option');
        option.value = foglio;
        option.textContent = `Foglio ${foglio}`;
        foglioSelect.appendChild(option);
    });
}

// Funzione per creare il filtro combinato (mandamento + foglio)
function getCurrentFilter() {
    const filters = [];
    
    if (currentMandamentoFilter && currentMandamentoFilter !== '') {
        // Mappa il nome dell'interfaccia al nome del database
        let dbMandamento = currentMandamentoFilter;
        if (currentMandamentoFilter === 'Castellammare') {
            dbMandamento = 'Castellamare';
        }
        filters.push(['==', ['get', 'Mandamento'], dbMandamento]);
    }
    
    if (currentFoglioFilter && currentFoglioFilter !== '') {
        filters.push(['==', ['get', 'foglio'], currentFoglioFilter]);
    }
    
    if (filters.length === 0) {
        return null;
    } else if (filters.length === 1) {
        return filters[0];
    } else {
        return ['all', ...filters];
    }
}

// Funzione per applicare il filtro foglio
function applyFoglioFilter(foglio) {
    // Salva l'indicatore corrente
    const activeTheme = currentTheme;
    
    // Aggiorna il filtro corrente
    currentFoglioFilter = foglio || null;
    
    const filter = getCurrentFilter();
    
    // Applica filtro ai layer base
    map.setFilter('catastale-base', filter);
    map.setFilter('catastale-hover', ['==', ['get', 'fid'], '']); // Reset hover
    map.setFilter('catastale-outline', filter);
    
    // Se c'è un indicatore attivo (non uso del suolo), riapplicalo
    if (activeTheme && activeTheme !== 'landuse') {
        applyTheme(activeTheme);
    } else {
        // Altrimenti assicurati che il layer base sia visibile
        if (map.getLayer('catastale-thematic')) {
            map.removeLayer('catastale-thematic');
        }
        map.setPaintProperty('catastale-base', 'fill-opacity', 0.75);
        showBaseLegenda();
    }
}

// Funzione modificata per applicare il filtro mandamento
function applyMandamentoFilter(mandamento) {
    // Salva l'indicatore corrente
    const activeTheme = currentTheme;
    
    // Aggiorna il filtro corrente
    currentMandamentoFilter = mandamento || null;
    
    const filter = getCurrentFilter();
    
    // Applica filtro ai layer base
    map.setFilter('catastale-base', filter);
    map.setFilter('catastale-hover', ['==', ['get', 'fid'], '']); // Reset hover
    map.setFilter('catastale-outline', filter);
    
    // Se c'è un indicatore attivo (non uso del suolo), riapplicalo
    if (activeTheme && activeTheme !== 'landuse') {
        applyTheme(activeTheme);
    } else {
        // Altrimenti assicurati che il layer base sia visibile
        if (map.getLayer('catastale-thematic')) {
            map.removeLayer('catastale-thematic');
        }
        map.setPaintProperty('catastale-base', 'fill-opacity', 0.75);
        showBaseLegenda();
    }
}

// Funzioni controllo perimetri
function togglePerimeter(layerId, show) {
    const visibility = show ? 'visible' : 'none';
    map.setLayoutProperty(layerId, 'visibility', visibility);
}

function toggleBorders(show) {
    const visibility = show ? 'visible' : 'none';
    map.setLayoutProperty('catastale-outline', 'visibility', visibility);
}

// Event listeners per i controlli
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