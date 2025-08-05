// ===== FILE: dynamic-filters.js =====
/* SISTEMA FILTRI DINAMICI INTEGRATO */
let mandamentoFoglioMap = new Map();
let foglioMandamentoMap = new Map();
let completeSystemReady = false;

function initializeDynamicFilters() {
    console.log('🎨 Inizializzazione sistema filtri dinamici...');
    
    if (!map || !map.isSourceLoaded('palermo_catastale')) {
        setTimeout(initializeDynamicFilters, 1000);
        return;
    }
    
    buildFoglioMandamentoRelations();
    setupFilterEventListeners();
    addHighlightIndicator();
    
    completeSystemReady = true;
    
    // Ripristina filtri se presenti
    if (currentFoglioFilter) {
        applyFoglioFilterToMap(currentFoglioFilter);
    } else if (currentMandamentoFilter) {
        applyMandamentoFilterToMap(currentMandamentoFilter);
    }
    
    console.log('✅ Sistema filtri dinamici pronto');
}

function buildFoglioMandamentoRelations() {
    try {
        const features = map.querySourceFeatures('palermo_catastale', {
            sourceLayer: CONFIG.pmtiles.sourceLayer
        });
        
        mandamentoFoglioMap.clear();
        foglioMandamentoMap.clear();
        
        features.forEach(feature => {
            const props = feature.properties;
            let mandamento = props.Mandamento;
            const foglio = props.foglio;
            
            // Normalizza il nome del mandamento
            if (mandamento === 'Castellamare') mandamento = 'Castellammare';
            
            if (mandamento && foglio) {
                if (!mandamentoFoglioMap.has(mandamento)) {
                    mandamentoFoglioMap.set(mandamento, new Set());
                }
                mandamentoFoglioMap.get(mandamento).add(foglio);
                foglioMandamentoMap.set(foglio, mandamento);
            }
        });
        
        // Ordina fogli numericamente
        mandamentoFoglioMap.forEach((foglioSet, mandamento) => {
            const sortedFogli = Array.from(foglioSet).sort((a, b) => {
                return parseInt(a) - parseInt(b);
            });
            mandamentoFoglioMap.set(mandamento, sortedFogli);
        });
        
        console.log('🗺️ Relazioni costruite:', mandamentoFoglioMap);
    } catch (error) {
        console.error('❌ Errore costruzione relazioni:', error);
    }
}

function setupFilterEventListeners() {
    const mandamentoSelect = document.getElementById('mandamento-filter');
    const foglioSelect = document.getElementById('foglio-filter');
    
    mandamentoSelect.addEventListener('change', function(e) {
        if (!completeSystemReady) return;
        
        const selectedMandamento = e.target.value;
        console.log('🏛️ Mandamento selezionato:', selectedMandamento || 'TUTTI');
        
        highlightFogliForMandamento(selectedMandamento);
        applyMandamentoFilterToMap(selectedMandamento);
    });
    
    foglioSelect.addEventListener('change', function(e) {
        if (!completeSystemReady) return;
        
        const selectedFoglio = e.target.value;
        console.log('📄 Foglio selezionato:', selectedFoglio || 'TUTTI');
        
        if (selectedFoglio) {
            const mandamentoForFoglio = foglioMandamentoMap.get(selectedFoglio);
            if (mandamentoForFoglio && mandamentoSelect.value !== mandamentoForFoglio) {
                mandamentoSelect.value = mandamentoForFoglio;
                highlightFogliForMandamento(mandamentoForFoglio);
            }
        }
        
        applyFoglioFilterToMap(selectedFoglio);
    });
}

function highlightFogliForMandamento(selectedMandamento) {
    const foglioSelect = document.getElementById('foglio-filter');
    if (!foglioSelect) return;
    
    // Reset stili
    Array.from(foglioSelect.options).forEach(option => {
        option.classList.remove('highlighted-option', 'dimmed-option');
        option.style.backgroundColor = '';
        option.style.color = '';
    });
    
    if (!selectedMandamento) {
        updateFoglioSelectTitle('');
        return;
    }
    
    const fogliDelMandamento = mandamentoFoglioMap.get(selectedMandamento) || [];
    
    Array.from(foglioSelect.options).forEach(option => {
        if (!option.value) return; // Salta opzione "Tutti"
        
        if (fogliDelMandamento.includes(option.value)) {
            option.classList.add('highlighted-option');
        } else {
            option.classList.add('dimmed-option');
        }
    });
    
    updateFoglioSelectTitle(selectedMandamento, fogliDelMandamento.length);
}

function updateFoglioSelectTitle(selectedMandamento, count = 0) {
    const title = document.querySelector('#foglio-filter').closest('.control-section')?.querySelector('h3');
    if (!title) return;
    
    const img = title.querySelector('img')?.outerHTML || '';
    title.innerHTML = `${img} Filtra per Foglio`;
    
    if (selectedMandamento) {
        title.innerHTML += ` <small>(${count} fogli)</small>`;
    }
}

function applyMandamentoFilterToMap(selectedMandamento) {
    currentMandamentoFilter = selectedMandamento || null;
    applyCurrentFiltersToMap();
}

function applyFoglioFilterToMap(selectedFoglio) {
    currentFoglioFilter = selectedFoglio || null;
    
    // Auto-seleziona mandamento correlato
    if (selectedFoglio) {
        const mandamentoForFoglio = foglioMandamentoMap.get(selectedFoglio);
        if (mandamentoForFoglio) {
            currentMandamentoFilter = mandamentoForFoglio;
            document.getElementById('mandamento-filter').value = mandamentoForFoglio;
        }
    }
    
    applyCurrentFiltersToMap();
}

function applyCurrentFiltersToMap() {
    const filter = buildMapFilter();
    
    map.setFilter('catastale-base', filter);
    map.setFilter('catastale-outline', filter);
    
    // Riapplica il tema corrente
    if (currentTheme && currentTheme !== 'landuse') {
        applyTheme(currentTheme);
    } else {
        showBaseLegenda();
    }
}

function buildMapFilter() {
    const filters = [];
    
    if (currentMandamentoFilter) {
        let dbValue = currentMandamentoFilter;
        if (dbValue === 'Castellammare') dbValue = 'Castellamare';
        filters.push(['==', ['get', 'Mandamento'], dbValue]);
    }
    
    if (currentFoglioFilter) {
        filters.push(['==', ['get', 'foglio'], currentFoglioFilter]);
    }
    
    return filters.length > 0 ? (filters.length === 1 ? filters[0] : ['all', ...filters]) : null;
}

function addHighlightIndicator() {
    const section = document.querySelector('#mandamento-filter').closest('.control-section');
    const title = section?.querySelector('h3');
    if (!title || title.querySelector('.filter-indicator')) return;
    
    title.style.position = 'relative';
    
    const indicator = document.createElement('span');
    indicator.className = 'filter-indicator';
    indicator.innerHTML = ' <i class="fas fa-filter"></i>';
    indicator.style.display = 'none';
    
    title.appendChild(indicator);
}

function resetDynamicFilters() {
    console.log('🔄 Reset filtri dinamici');
    
    currentMandamentoFilter = null;
    currentFoglioFilter = null;
    
    document.getElementById('mandamento-filter').value = '';
    document.getElementById('foglio-filter').value = '';
    
    highlightFogliForMandamento('');
    applyCurrentFiltersToMap();
}

// Integrazione con sistema esistente
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeDynamicFilters, 2000);
    
    // Integra con reset globale
    if (window.safeResetMap) {
        const originalReset = window.safeResetMap;
        window.safeResetMap = function() {
            resetDynamicFilters();
            originalReset();
        }
    }
});

console.log('✅ dynamic-filters.js caricato');