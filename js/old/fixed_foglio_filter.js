// Funzione per applicare il filtro foglio - VERSIONE CORRETTA
function applyFoglioFilter(foglio) {
    console.log('Applicando filtro foglio:', foglio);
    // Salva l'indicatore corrente
    const activeTheme = currentTheme;
    
    // Aggiorna il filtro corrente
    currentFoglioFilter = foglio || null;
    
    // AGGIUNTA: Mantieni la selezione visibile nel dropdown
    const foglioSelect = document.getElementById('foglio-filter');
    if (foglioSelect) {
        foglioSelect.value = foglio || '';
    }
    
    const filter = getCurrentFilter();
    console.log('Filtro combinato:', filter);
    
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

// Funzione per applicare il filtro mandamento - VERSIONE CORRETTA  
function applyMandamentoFilter(mandamento) {
    console.log('Applicando filtro mandamento:', mandamento);
    // Salva l'indicatore corrente
    const activeTheme = currentTheme;
    
    // Aggiorna il filtro corrente
    currentMandamentoFilter = mandamento || null;
    
    // AGGIUNTA: Mantieni la selezione visibile nel dropdown
    const mandamentoSelect = document.getElementById('mandamento-filter');
    if (mandamentoSelect) {
        mandamentoSelect.value = mandamento || '';
    }
    
    const filter = getCurrentFilter();
    console.log('Filtro combinato:', filter);
    
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

// AGGIUNTA: Funzione per ripristinare le selezioni dei filtri (utile dopo aggiornamenti)
function restoreFilterSelections() {
    // Ripristina selezione mandamento
    if (currentMandamentoFilter) {
        const mandamentoSelect = document.getElementById('mandamento-filter');
        if (mandamentoSelect) {
            mandamentoSelect.value = currentMandamentoFilter;
        }
    }
    
    // Ripristina selezione foglio
    if (currentFoglioFilter) {
        const foglioSelect = document.getElementById('foglio-filter');
        if (foglioSelect) {
            foglioSelect.value = currentFoglioFilter;
        }
    }
}

// Modifica la funzione populateFoglioFilter per preservare la selezione corrente
function populateFoglioFilter() {
    // Aspetta che la mappa sia completamente caricata
    if (map.isSourceLoaded('palermo_catastale')) {
        const features = map.querySourceFeatures('palermo_catastale', {
            sourceLayer: 'catastale'
        });
        
        console.log('Numero features trovate:', features.length);
        
        if (features.length > 0) {
            const foglioSet = new Set();
            features.forEach(feature => {
                const foglio = feature.properties.foglio;
                if (foglio && foglio !== null && foglio !== '') {
                    foglioSet.add(foglio);
                }
            });
            
            availableFogli = Array.from(foglioSet).sort((a, b) => {
                const numA = parseInt(a);
                const numB = parseInt(b);
                if (!isNaN(numA) && !isNaN(numB)) {
                    return numA - numB;
                }
                return a.localeCompare(b);
            });
            
            console.log('Fogli trovati:', availableFogli);
            updateFoglioDropdown();
            
            // AGGIUNTA: Ripristina la selezione corrente dopo aver aggiornato il dropdown
            restoreFilterSelections();
        }
    } else {
        // Riprova dopo un breve delay
        setTimeout(populateFoglioFilter, 1000);
    }
}

// Modifica la funzione updateFoglioDropdown per preservare la selezione
function updateFoglioDropdown() {
    const foglioSelect = document.getElementById('foglio-filter');
    const currentSelection = foglioSelect.value; // Salva la selezione corrente
    
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
    
    // Ripristina la selezione precedente se era valida
    if (currentSelection && availableFogli.includes(currentSelection)) {
        foglioSelect.value = currentSelection;
    } else if (currentFoglioFilter && availableFogli.includes(currentFoglioFilter)) {
        foglioSelect.value = currentFoglioFilter;
    }
    
    console.log('Dropdown aggiornato con', availableFogli.length, 'fogli');
}