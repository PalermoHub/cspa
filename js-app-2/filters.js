// ===== FILE: filters.js =====
/**
 * Sistema filtri base - VERSIONE MIGLIORATA con mandamenti nel dropdown fogli
 */

// Aggiungiamo una variabile per mappare foglio → mandamento
let foglioToMandamentoMap = new Map();

function populateFoglioFilter() {
    if (map.isSourceLoaded('palermo_catastale')) {
        const features = map.querySourceFeatures('palermo_catastale', {
            sourceLayer: CONFIG.pmtiles.sourceLayer
        });
        
        console.log('Numero features trovate:', features.length);
        
        if (features.length > 0) {
            const foglioSet = new Set();
            foglioToMandamentoMap.clear(); // Reset della mappa
            
            features.forEach(feature => {
                const foglio = feature.properties.foglio;
                let mandamento = feature.properties.Mandamento;
                
                // Normalizza il nome del mandamento (corregge Castellamare → Castellammare)
                if (mandamento === 'Castellamare') {
                    mandamento = 'Castellammare';
                }
                
                if (foglio && foglio !== null && foglio !== '' && mandamento) {
                    foglioSet.add(foglio);
                    // Mappa foglio al suo mandamento
                    foglioToMandamentoMap.set(foglio, mandamento);
                }
            });
            
            // Converti Set in Array e crea oggetti con foglio e mandamento per ordinamento
            const foglioMandamentoArray = Array.from(foglioSet).map(foglio => ({
                foglio: foglio,
                mandamento: foglioToMandamentoMap.get(foglio),
                numericFoglio: parseInt(foglio) || 999999 // Per ordinamento numerico
            }));
            
            // Ordina prima per mandamento, poi per numero foglio
            foglioMandamentoArray.sort((a, b) => {
                // Prima ordina per mandamento
                const mandamentoCompare = a.mandamento.localeCompare(b.mandamento);
                if (mandamentoCompare !== 0) {
                    return mandamentoCompare;
                }
                
                // Se stesso mandamento, ordina per numero foglio
                return a.numericFoglio - b.numericFoglio;
            });
            
            // Estrai solo i fogli ordinati
            availableFogli = foglioMandamentoArray.map(item => item.foglio);
            
            console.log('Fogli trovati e ordinati per mandamento:', availableFogli.length);
            console.log('Mappa foglio → mandamento:', Object.fromEntries(foglioToMandamentoMap));
            
            updateFoglioDropdown();
            restoreFilterSelections();
        }
    } else {
        setTimeout(populateFoglioFilter, 1000);
    }
}

function updateFoglioDropdown() {
    const foglioSelect = document.getElementById('foglio-filter');
    const currentSelection = foglioSelect.value;
    
    // Rimuovi tutte le opzioni tranne la prima ("Tutti i Fogli")
    while (foglioSelect.children.length > 1) {
        foglioSelect.removeChild(foglioSelect.lastChild);
    }
    
    // Aggiungi le opzioni con formato "Foglio X - Mandamento"
    availableFogli.forEach(foglio => {
        const mandamento = foglioToMandamentoMap.get(foglio);
        const option = document.createElement('option');
        option.value = foglio;
        
        // Formato migliorato: "Foglio 123 - Tribunali"
        option.textContent = `Foglio ${foglio} - ${mandamento || 'N/D'}`;
        
        // Aggiungi attributo data per facilitare eventuali filtraggi futuri
        option.setAttribute('data-mandamento', mandamento || '');
        
        foglioSelect.appendChild(option);
    });
    
    // Ripristina selezione precedente se valida
    if (currentSelection && availableFogli.includes(currentSelection)) {
        foglioSelect.value = currentSelection;
    } else if (currentFoglioFilter && availableFogli.includes(currentFoglioFilter)) {
        foglioSelect.value = currentFoglioFilter;
    }
    
    console.log('Dropdown fogli aggiornato con', availableFogli.length, 'fogli organizzati per mandamento');
}

function getCurrentFilter() {
    const filters = [];
    
    if (currentMandamentoFilter && currentMandamentoFilter !== '') {
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

function applyFoglioFilter(foglio) {
    console.log('Applicando filtro foglio:', foglio);
    const activeTheme = currentTheme;
    
    currentFoglioFilter = foglio || null;
    
    const foglioSelect = document.getElementById('foglio-filter');
    if (foglioSelect) {
        foglioSelect.value = foglio || '';
    }
    
    const filter = getCurrentFilter();
    console.log('Filtro combinato:', filter);
    
    map.setFilter('catastale-base', filter);
    map.setFilter('catastale-hover', ['==', ['get', 'fid'], '']);
    map.setFilter('catastale-outline', filter);
    
    if (activeTheme && activeTheme !== 'landuse') {
        applyTheme(activeTheme);
    } else {
        if (map.getLayer('catastale-thematic')) {
            map.removeLayer('catastale-thematic');
        }
        map.setPaintProperty('catastale-base', 'fill-opacity', 0.75);
        showBaseLegenda();
    }
}

function applyMandamentoFilter(mandamento) {
    console.log('Applicando filtro mandamento:', mandamento);
    const activeTheme = currentTheme;
    
    currentMandamentoFilter = mandamento || null;
    
    const mandamentoSelect = document.getElementById('mandamento-filter');
    if (mandamentoSelect) {
        mandamentoSelect.value = mandamento || '';
    }
    
    const filter = getCurrentFilter();
    console.log('Filtro combinato:', filter);
    
    map.setFilter('catastale-base', filter);
    map.setFilter('catastale-hover', ['==', ['get', 'fid'], '']);
    map.setFilter('catastale-outline', filter);
    
    if (activeTheme && activeTheme !== 'landuse') {
        applyTheme(activeTheme);
    } else {
        if (map.getLayer('catastale-thematic')) {
            map.removeLayer('catastale-thematic');
        }
        map.setPaintProperty('catastale-base', 'fill-opacity', 0.75);
        showBaseLegenda();
    }
}

function restoreFilterSelections() {
    if (currentMandamentoFilter) {
        const mandamentoSelect = document.getElementById('mandamento-filter');
        if (mandamentoSelect) {
            mandamentoSelect.value = currentMandamentoFilter;
        }
    }
    
    if (currentFoglioFilter) {
        const foglioSelect = document.getElementById('foglio-filter');
        if (foglioSelect) {
            foglioSelect.value = currentFoglioFilter;
        }
    }
}

// ===== FUNZIONI UTILITY AGGIUNTIVE =====

/**
 * Ottieni il mandamento di un foglio specifico
 */
function getMandamentoForFoglio(foglio) {
    return foglioToMandamentoMap.get(foglio) || null;
}

/**
 * Ottieni tutti i fogli di un mandamento specifico
 */
function getFogliForMandamento(mandamento) {
    const fogli = [];
    foglioToMandamentoMap.forEach((mappedMandamento, foglio) => {
        if (mappedMandamento === mandamento) {
            fogli.push(foglio);
        }
    });
    
    // Ordina numericamente
    return fogli.sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return a.localeCompare(b);
    });
}

/**
 * Ottieni statistiche sui mandamenti e fogli
 */
function getFilterStats() {
    const stats = {
        totalFogli: availableFogli.length,
        mandamenti: {}
    };
    
    // Conta fogli per mandamento
    foglioToMandamentoMap.forEach((mandamento, foglio) => {
        if (!stats.mandamenti[mandamento]) {
            stats.mandamenti[mandamento] = {
                count: 0,
                fogli: []
            };
        }
        stats.mandamenti[mandamento].count++;
        stats.mandamenti[mandamento].fogli.push(foglio);
    });
    
    // Ordina fogli in ogni mandamento
    Object.keys(stats.mandamenti).forEach(mandamento => {
        stats.mandamenti[mandamento].fogli.sort((a, b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return a.localeCompare(b);
        });
    });
    
    console.log('📊 Statistiche filtri:', stats);
    return stats;
}

// Esporta funzioni utility per uso esterno
window.getMandamentoForFoglio = getMandamentoForFoglio;
window.getFogliForMandamento = getFogliForMandamento;
window.getFilterStats = getFilterStats;