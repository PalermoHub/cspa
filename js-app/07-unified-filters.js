// ===== FILE: unified-filters.js =====
/**
 * SISTEMA FILTRI UNIFICATO 
 */

// ===== STRUTTURE DATI UNIFICATE =====
let mandamentoFoglioMap = new Map();           // mandamento -> array di fogli
let foglioMandamentoMap = new Map();           // foglio -> mandamento
let availableFogli = [];                       // array di tutti i fogli ordinati
let completeSystemReady = false;

// ===== FUNZIONI CORE UNIFICATE =====

/**
 * Inizializzazione completa del sistema filtri
 */
function initializeUnifiedFilters() {
    console.log('🎨 Inizializzazione sistema filtri unificato...');
    
    if (!map || !map.isSourceLoaded('palermo_catastale')) {
        setTimeout(initializeUnifiedFilters, 1000);
        return;
    }
    
    buildUnifiedRelations();
    setupUnifiedEventListeners();
    addFilterIndicators();
    
    completeSystemReady = true;
    
    // Ripristina filtri se presenti
    restoreFilterSelections();
    
    console.log('✅ Sistema filtri unificato pronto');
}

/**
 * Costruisce le relazioni tra mandamenti e fogli (UNIFICATA)
 */
function buildUnifiedRelations() {
    try {
        const features = map.querySourceFeatures('palermo_catastale', {
            sourceLayer: CONFIG.pmtiles.sourceLayer
        });
        
        // Reset strutture dati
        mandamentoFoglioMap.clear();
        foglioMandamentoMap.clear();
        availableFogli = [];
        
        const foglioSet = new Set();
        const foglioMandamentoArray = [];
        
        features.forEach(feature => {
            const props = feature.properties;
            let mandamento = props.Mandamento;
            const foglio = props.foglio;
            
            // Normalizza il nome del mandamento
            if (mandamento === 'Castellamare') mandamento = 'Castellammare';
            
            if (mandamento && foglio && foglio !== null && foglio !== '') {
                // Aggiungi al set per evitare duplicati
                foglioSet.add(foglio);
                
                // Costruisci mappa foglio -> mandamento
                foglioMandamentoMap.set(foglio, mandamento);
                
                // Costruisci mappa mandamento -> fogli
                if (!mandamentoFoglioMap.has(mandamento)) {
                    mandamentoFoglioMap.set(mandamento, new Set());
                }
                mandamentoFoglioMap.get(mandamento).add(foglio);
            }
        });
        
        // Prepara array per ordinamento
        foglioSet.forEach(foglio => {
            foglioMandamentoArray.push({
                foglio: foglio,
                mandamento: foglioMandamentoMap.get(foglio),
                numericFoglio: parseInt(foglio) || 999999
            });
        });
        
        // Ordina prima per mandamento, poi per numero foglio
        foglioMandamentoArray.sort((a, b) => {
            const mandamentoCompare = a.mandamento.localeCompare(b.mandamento);
            if (mandamentoCompare !== 0) {
                return mandamentoCompare;
            }
            return a.numericFoglio - b.numericFoglio;
        });
        
        // Estrai fogli ordinati
        availableFogli = foglioMandamentoArray.map(item => item.foglio);
        
        // Converti Set in Array ordinati per mandamentoFoglioMap
        mandamentoFoglioMap.forEach((foglioSet, mandamento) => {
            const sortedFogli = Array.from(foglioSet).sort((a, b) => {
                return parseInt(a) - parseInt(b);
            });
            mandamentoFoglioMap.set(mandamento, sortedFogli);
        });
        
        console.log('🗺️ Relazioni unificate costruite:');
        console.log('- Fogli totali:', availableFogli.length);
        console.log('- Mandamenti:', mandamentoFoglioMap.size);
        
        updateUnifiedFoglioDropdown();
        
    } catch (error) {
        console.error('❌ Errore costruzione relazioni unificate:', error);
    }
}

/**
 * Setup event listeners unificati
 */
function setupUnifiedEventListeners() {
    const mandamentoSelect = document.getElementById('mandamento-filter');
    const foglioSelect = document.getElementById('foglio-filter');
    
    if (mandamentoSelect) {
        mandamentoSelect.addEventListener('change', function(e) {
            if (!completeSystemReady) return;
            
            const selectedMandamento = e.target.value;
            console.log('🏛️ Mandamento selezionato:', selectedMandamento || 'TUTTI');
            
            // Evidenzia fogli correlati
            highlightFogliForMandamento(selectedMandamento);
            
            // Applica filtro
            applyUnifiedMandamentoFilter(selectedMandamento);
        });
    }
    
    if (foglioSelect) {
        foglioSelect.addEventListener('change', function(e) {
            if (!completeSystemReady) return;
            
            const selectedFoglio = e.target.value;
            console.log('📄 Foglio selezionato:', selectedFoglio || 'TUTTI');
            
            // Auto-seleziona mandamento correlato se necessario
            if (selectedFoglio) {
                const mandamentoForFoglio = foglioMandamentoMap.get(selectedFoglio);
                if (mandamentoForFoglio && mandamentoSelect && mandamentoSelect.value !== mandamentoForFoglio) {
                    mandamentoSelect.value = mandamentoForFoglio;
                    highlightFogliForMandamento(mandamentoForFoglio);
                }
            }
            
            // Applica filtro
            applyUnifiedFoglioFilter(selectedFoglio);
        });
    }
}

/**
 * Aggiorna dropdown fogli con formato migliorato
 */
function updateUnifiedFoglioDropdown() {
    const foglioSelect = document.getElementById('foglio-filter');
    if (!foglioSelect) return;
    
    const currentSelection = foglioSelect.value;
    
    // Rimuovi tutte le opzioni tranne la prima ("Tutti i Fogli")
    while (foglioSelect.children.length > 1) {
        foglioSelect.removeChild(foglioSelect.lastChild);
    }
    
    // Aggiungi opzioni con formato "Foglio X - Mandamento"
    availableFogli.forEach(foglio => {
        const mandamento = foglioMandamentoMap.get(foglio);
        const option = document.createElement('option');
        option.value = foglio;
        option.textContent = `Foglio ${foglio} - ${mandamento || 'N/D'}`;
        option.setAttribute('data-mandamento', mandamento || '');
        
        foglioSelect.appendChild(option);
    });
    
    // Ripristina selezione precedente
    if (currentSelection && availableFogli.includes(currentSelection)) {
        foglioSelect.value = currentSelection;
    } else if (currentFoglioFilter && availableFogli.includes(currentFoglioFilter)) {
        foglioSelect.value = currentFoglioFilter;
    }
    
    console.log('📋 Dropdown fogli aggiornato:', availableFogli.length, 'fogli');
}

/**
 * Evidenzia fogli correlati al mandamento selezionato
 */
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

/**
 * Aggiorna il titolo del selettore fogli
 */
function updateFoglioSelectTitle(selectedMandamento, count = 0) {
    const title = document.querySelector('#foglio-filter')?.closest('.control-section')?.querySelector('h3');
    if (!title) return;
    
    const img = title.querySelector('img')?.outerHTML || '';
    title.innerHTML = `${img} Filtra per Foglio`;
    
    if (selectedMandamento) {
        title.innerHTML += ` <small>(${count} fogli)</small>`;
    }
}

/**
 * Applica filtro mandamento (UNIFICATA)
 */
function applyUnifiedMandamentoFilter(selectedMandamento) {
    console.log('🔍 Applicando filtro mandamento unificato:', selectedMandamento);
    
    currentMandamentoFilter = selectedMandamento || null;
    
    // Aggiorna UI
    const mandamentoSelect = document.getElementById('mandamento-filter');
    if (mandamentoSelect) {
        mandamentoSelect.value = selectedMandamento || '';
    }
    
    applyUnifiedFiltersToMap();
}

/**
 * Applica filtro foglio (UNIFICATA)
 */
function applyUnifiedFoglioFilter(selectedFoglio) {
    console.log('🔍 Applicando filtro foglio unificato:', selectedFoglio);
    
    currentFoglioFilter = selectedFoglio || null;
    
    // Auto-seleziona mandamento correlato se necessario
    if (selectedFoglio) {
        const mandamentoForFoglio = foglioMandamentoMap.get(selectedFoglio);
        if (mandamentoForFoglio) {
            currentMandamentoFilter = mandamentoForFoglio;
            const mandamentoSelect = document.getElementById('mandamento-filter');
            if (mandamentoSelect) {
                mandamentoSelect.value = mandamentoForFoglio;
            }
        }
    }
    
    // Aggiorna UI
    const foglioSelect = document.getElementById('foglio-filter');
    if (foglioSelect) {
        foglioSelect.value = selectedFoglio || '';
    }
    
    applyUnifiedFiltersToMap();
}

/**
 * Costruisce il filtro per la mappa (UNIFICATA)
 */
function buildUnifiedMapFilter() {
    const filters = [];
    
    if (currentMandamentoFilter) {
        let dbValue = currentMandamentoFilter;
        // Normalizza per il database
        if (dbValue === 'Castellammare') dbValue = 'Castellamare';
        filters.push(['==', ['get', 'Mandamento'], dbValue]);
    }
    
    if (currentFoglioFilter) {
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

/**
 * Applica i filtri correnti alla mappa (UNIFICATA)
 */
function applyUnifiedFiltersToMap() {
    const filter = buildUnifiedMapFilter();
    
    console.log('🗺️ Applicando filtro unificato alla mappa:', filter);
    
    // Applica filtri ai layer
    map.setFilter('catastale-base', filter);
    map.setFilter('catastale-outline', filter);
    map.setFilter('catastale-hover', ['==', ['get', 'fid'], '']);
    
    // Centra la vista sugli oggetti filtrati
    if (filter) {
        centerOnFilteredFeatures(filter);
    } else {
        // Se non ci sono filtri, torna alla vista iniziale
        map.flyTo({
            center: CONFIG.map.center,
            zoom: CONFIG.map.zoom,
            duration: 1500
        });
    }
    
    // Riapplica il tema corrente se presente
    if (currentTheme && currentTheme !== 'landuse') {
        applyTheme(currentTheme);
    } else {
        // Rimuovi layer tematici e mostra base
        if (map.getLayer('catastale-thematic')) {
            map.removeLayer('catastale-thematic');
        }
        map.setPaintProperty('catastale-base', 'fill-opacity', 0.75);
        
        if (typeof showBaseLegenda === 'function') {
            showBaseLegenda();
        }
    }
    
    // Forza aggiornamento legenda dopo un ritardo
    setTimeout(() => {
        if (typeof forceLegendUpdate === 'function') {
            forceLegendUpdate();
        }
    }, 800);
}

/**
 * Centra la mappa sugli oggetti filtrati
 */
function centerOnFilteredFeatures(filter) {
    try {
        // Ottieni tutte le features che corrispondono al filtro
        const features = map.querySourceFeatures('palermo_catastale', {
            sourceLayer: CONFIG.pmtiles.sourceLayer,
            filter: filter
        });
        
        if (features.length === 0) {
            console.log('⚠️ Nessuna feature trovata per il filtro');
            return;
        }
        
        // Calcola il bounding box delle features filtrate
        let minLng = Infinity;
        let maxLng = -Infinity;
        let minLat = Infinity;
        let maxLat = -Infinity;
        
        features.forEach(feature => {
            if (feature.geometry && feature.geometry.coordinates) {
                const coords = feature.geometry.coordinates[0]; // Assumendo poligoni
                
                coords.forEach(coord => {
                    // Gestisci array annidati per poligoni complessi
                    if (Array.isArray(coord[0])) {
                        coord.forEach(innerCoord => {
                            minLng = Math.min(minLng, innerCoord[0]);
                            maxLng = Math.max(maxLng, innerCoord[0]);
                            minLat = Math.min(minLat, innerCoord[1]);
                            maxLat = Math.max(maxLat, innerCoord[1]);
                        });
                    } else {
                        minLng = Math.min(minLng, coord[0]);
                        maxLng = Math.max(maxLng, coord[0]);
                        minLat = Math.min(minLat, coord[1]);
                        maxLat = Math.max(maxLat, coord[1]);
                    }
                });
            }
        });
        
        // Verifica che i bounds siano validi
        if (minLng === Infinity || maxLng === -Infinity || 
            minLat === Infinity || maxLat === -Infinity) {
            console.log('⚠️ Bounds non validi');
            return;
        }
        
        // Calcola il centro e applica padding
        const bounds = [[minLng, minLat], [maxLng, maxLat]];
        
        // Adatta la vista con padding per dispositivi mobili e desktop
        const isMobile = window.innerWidth <= 768;
        const padding = isMobile ? 
            { top: 100, bottom: 100, left: 50, right: 50 } :
            { top: 100, bottom: 100, left: 320, right: 420 }; // Considera pannelli laterali
        
        // Anima la transizione verso i nuovi bounds
        map.fitBounds(bounds, {
            padding: padding,
            duration: 1500,
            maxZoom: 16 // Non zoomare troppo
        });
        
        console.log('🎯 Vista centrata su', features.length, 'features');
        
        // Mostra notifica temporanea (opzionale)
        showFilterNotification(features.length);
        
    } catch (error) {
        console.error('❌ Errore nel centrare le features:', error);
    }
}

/**
 * Mostra notifica temporanea del numero di particelle filtrate
 */
function showFilterNotification(count) {
    // Rimuovi notifiche esistenti
    const existingNotification = document.querySelector('.filter-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crea nuova notifica
    const notification = document.createElement('div');
    notification.className = 'filter-notification';
    notification.innerHTML = `
        <i class="fas fa-filter"></i>
        <span>${count} particelle selezionate</span>
    `;
    
    // Aggiungi stili inline temporanei
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #ff9900 0%, #ff5100 100%);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 600;
        animation: slideDown 0.5s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Rimuovi dopo 3 secondi con fade out
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

/**
 * Ripristina selezioni filtri salvate
 */
function restoreFilterSelections() {
    if (currentMandamentoFilter) {
        const mandamentoSelect = document.getElementById('mandamento-filter');
        if (mandamentoSelect) {
            mandamentoSelect.value = currentMandamentoFilter;
            highlightFogliForMandamento(currentMandamentoFilter);
        }
    }
    
    if (currentFoglioFilter) {
        const foglioSelect = document.getElementById('foglio-filter');
        if (foglioSelect) {
            foglioSelect.value = currentFoglioFilter;
        }
    }
}

/**
 * Aggiunge indicatori di filtro attivo
 */
function addFilterIndicators() {
    // Indicatore per mandamento
    const mandamentoSection = document.querySelector('#mandamento-filter')?.closest('.control-section');
    const mandamentoTitle = mandamentoSection?.querySelector('h3');
    if (mandamentoTitle && !mandamentoTitle.querySelector('.filter-indicator')) {
        mandamentoTitle.style.position = 'relative';
        
        const indicator = document.createElement('span');
        indicator.className = 'filter-indicator';
        indicator.innerHTML = ' <i class="fas fa-filter"></i>';
        indicator.style.display = 'none';
        
        mandamentoTitle.appendChild(indicator);
    }
    
    // Indicatore per foglio
    const foglioSection = document.querySelector('#foglio-filter')?.closest('.control-section');
    const foglioTitle = foglioSection?.querySelector('h3');
    if (foglioTitle && !foglioTitle.querySelector('.filter-indicator')) {
        foglioTitle.style.position = 'relative';
        
        const indicator = document.createElement('span');
        indicator.className = 'filter-indicator';
        indicator.innerHTML = ' <i class="fas fa-filter"></i>';
        indicator.style.display = 'none';
        
        foglioTitle.appendChild(indicator);
    }
}

/**
 * Reset completo filtri (UNIFICATA)
 */
function resetUnifiedFilters() {
    console.log('🔄 Reset filtri unificato');
    
    currentMandamentoFilter = null;
    currentFoglioFilter = null;
    
    // NUOVO: Reset filtri legenda
    if (window.clearLegendFilters) {
        window.clearLegendFilters();
    }
    
    currentMandamentoFilter = null;
    currentFoglioFilter = null;
    
    // Reset UI
    const mandamentoSelect = document.getElementById('mandamento-filter');
    const foglioSelect = document.getElementById('foglio-filter');
    
    if (mandamentoSelect) mandamentoSelect.value = '';
    if (foglioSelect) foglioSelect.value = '';
    
    // Reset evidenziazioni
    highlightFogliForMandamento('');
    
    // Applica filtri (che saranno nulli) - questo ricentrerà anche la mappa
    applyUnifiedFiltersToMap();
    
    // Nascondi indicatori
    document.querySelectorAll('.filter-indicator').forEach(indicator => {
        indicator.style.display = 'none';
    });
    
    // Rimuovi eventuali notifiche
    const notification = document.querySelector('.filter-notification');
    if (notification) {
        notification.remove();
    }
}

// ===== FUNZIONI CRITICHE PER THEMES.JS =====

/**
 * Ottiene il filtro corrente per i layer tematici
 * QUESTA È LA FUNZIONE MANCANTE CHE CAUSA IL PROBLEMA!
 */
function getCurrentFilter() {
    return buildUnifiedMapFilter();
}

// Aggiungi dopo la funzione getCurrentFilter()
window.getCombinedFilter = function() {
    const territorialFilter = getCurrentFilter();
    const legendFilter = window.legendFilterState && window.legendFilterState.isFiltering ? 
        window.getCurrentLegendFilter() : null;
    
    if (territorialFilter && legendFilter) {
        return ['all', territorialFilter, legendFilter];
    }
    return territorialFilter || legendFilter || null;
};

// Funzione helper per ottenere il filtro corrente della legenda
window.getCurrentLegendFilter = function() {
    if (!window.legendFilterState || window.legendFilterState.activeCategories.size === 0) {
        return null;
    }
    
    // Costruisci filtro basato sulle categorie selezionate
    // (Logica già implementata in applyLegendFilters di dynamic-legend.js)
    return null; // Placeholder - usa la logica da dynamic-legend.js
};


// ===== FUNZIONI UTILITY ESPORTATE =====

/**
 * Ottieni il mandamento di un foglio specifico
 */
function getMandamentoForFoglio(foglio) {
    return foglioMandamentoMap.get(foglio) || null;
}

/**
 * Ottieni tutti i fogli di un mandamento specifico
 */
function getFogliForMandamento(mandamento) {
    return mandamentoFoglioMap.get(mandamento) || [];
}

/**
 * Ottieni statistiche sui mandamenti e fogli
 */
function getUnifiedFilterStats() {
    const stats = {
        totalFogli: availableFogli.length,
        totalMandamenti: mandamentoFoglioMap.size,
        mandamenti: {}
    };
    
    mandamentoFoglioMap.forEach((fogli, mandamento) => {
        stats.mandamenti[mandamento] = {
            count: fogli.length,
            fogli: [...fogli] // copia array
        };
    });
    
    console.log('📊 Statistiche filtri unificate:', stats);
    return stats;
}

/**
 * Verifica se i filtri sono attivi
 */
function hasActiveFilters() {
    return currentMandamentoFilter !== null || currentFoglioFilter !== null;
}

// ===== COMPATIBILITÀ CON CODICE ESISTENTE =====

// Funzioni compatibili con filters.js
function applyFoglioFilter(foglio) {
    return applyUnifiedFoglioFilter(foglio);
}

function applyMandamentoFilter(mandamento) {
    return applyUnifiedMandamentoFilter(mandamento);
}

function populateFoglioFilter() {
    return buildUnifiedRelations();
}

// Funzioni compatibili con dynamic-filters.js
function applyFoglioFilterToMap(foglio) {
    return applyUnifiedFoglioFilter(foglio);
}

function applyMandamentoFilterToMap(mandamento) {
    return applyUnifiedMandamentoFilter(mandamento);
}

function resetDynamicFilters() {
    return resetUnifiedFilters();
}

function applyCurrentFiltersToMap() {
    return applyUnifiedFiltersToMap();
}

// Funzione per forzare l'aggiornamento completo
function resetAllDynamicFilters() {
    return resetUnifiedFilters();
}

// ===== ESPORTAZIONE FUNZIONI GLOBALI =====
window.getCurrentFilter = getCurrentFilter;  // CRITICO!
window.getMandamentoForFoglio = getMandamentoForFoglio;
window.getFogliForMandamento = getFogliForMandamento;
window.getUnifiedFilterStats = getUnifiedFilterStats;
window.getFilterStats = getUnifiedFilterStats; // Alias per compatibilità
window.hasActiveFilters = hasActiveFilters;
window.resetUnifiedFilters = resetUnifiedFilters;
window.applyUnifiedFoglioFilter = applyUnifiedFoglioFilter;
window.applyUnifiedMandamentoFilter = applyUnifiedMandamentoFilter;

// Compatibilità con nomi precedenti
window.applyFoglioFilter = applyFoglioFilter;
window.applyMandamentoFilter = applyMandamentoFilter;
window.resetDynamicFilters = resetDynamicFilters;
window.resetAllDynamicFilters = resetAllDynamicFilters;

// ===== INIZIALIZZAZIONE =====
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeUnifiedFilters, 2000);
    
    // Integra con reset globale se esiste
    if (window.safeResetMap) {
        const originalReset = window.safeResetMap;
        window.safeResetMap = function() {
            resetUnifiedFilters();
            originalReset();
        }
    }
});

console.log('✅ unified-filters.js caricato - Sistema filtri unificato pronto');