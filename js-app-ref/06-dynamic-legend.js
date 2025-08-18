// ===== FILE: dynamic-legend.js =====
/**
 * Sistema Legenda Dinamica con Conteggio Particelle e Filtri Interattivi
 * Versione 2.1 - Con supporto per filtri via legenda e fix per valori null/zero in Jenks
 * + FORCE RENDER per inizializzazione corretta
 * REFACTORED: Usa CONFIG.fields per centralizzazione campi catastali
 */

// Costanti per il sistema legenda dinamica
const TOTAL_PARTICELLE = 6249;
let legendUpdateTimer = null;
let currentViewportStats = {};
let isUpdatingLegend = false;
let lastUpdateHash = '';
let lastViewportState = { zoom: -1, center: [0, 0] };
let isFilterApplied = false;

// NUOVO: Variabili per force render e gestione sistema
let forceRenderTimer = null;
let legendSystemInitialized = false;
let originalLegendOrder = [];
let legendCache = new Map();
let systemStats = {
    initAttempts: 0,
    forceRenderAttempts: 0,
    sourceDataChecks: 0,
    successfulCounts: 0
};

// Stato per filtri legenda
window.legendFilterState = {
    activeCategories: new Set(),
    mode: 'all',
    isFiltering: false
};

/**
 * Inizializza il sistema di legenda dinamica
 * COMPLETAMENTE RIVISTO con popolazione e force render
 */
function initializeDynamicLegend() {
    systemStats.initAttempts++;
    console.log('🎯 Inizializzazione sistema legenda dinamica - Tentativo', systemStats.initAttempts);
    
    if (!map || !map.isSourceLoaded('palermo_catastale')) {
        setTimeout(initializeDynamicLegend, 1000);
        return;
    }
    
    try {
        // PASSO 1: Setup container e popolazione immediata
        setupLegendContainer();
        populateLegendOnLoad();
        
        // PASSO 2: Setup listeners
        setupViewportListeners();
        validateTotalParticles();
        
        // PASSO 3: Force render per inizializzazione
        setTimeout(() => {
            startAggressiveInitialization();
        }, 500);
        
        console.log('✅ Sistema legenda dinamica interattiva pronto');
        
    } catch (error) {
        console.error('❌ Errore inizializzazione:', error);
        setTimeout(initializeDynamicLegend, 2000);
    }
}

/**
 * NUOVO: Setup container legenda
 */
function setupLegendContainer() {
    const legendItems = document.getElementById('legend-items');
    if (!legendItems) return;
    
    // Pulisci e prepara container
    legendItems.innerHTML = '';
    
    // NUOVO: Header con statistiche
    const headerInfo = document.createElement('div');
    headerInfo.className = 'legend-system-header';
    headerInfo.innerHTML = `
        <div class="legend-stats">
            <div class="stats-main">
                <span class="visible-count">0</span> / <span class="total-count">${TOTAL_PARTICELLE.toLocaleString()}</span> particelle
            </div>
            <div class="stats-secondary">
                <span class="filter-status">Nessun filtro attivo</span>
                <span class="zoom-level">Zoom: ${map ? map.getZoom().toFixed(1) : '0'}</span>
            </div>
        </div>
    `;
    legendItems.appendChild(headerInfo);
    
    // Container per elementi sortabili
    const sortableContainer = document.createElement('div');
    sortableContainer.id = 'legend-sortable-items';
    sortableContainer.className = 'legend-sortable-container';
    legendItems.appendChild(sortableContainer);
}

/**
 * NUOVO: Popola legenda al caricamento
 */
function populateLegendOnLoad() {
    console.log('📊 Popolamento legenda...');
    
    const currentTheme = getCurrentTheme();
    console.log('Tema corrente:', currentTheme);
    
    if (currentTheme === 'landuse' || !currentTheme) {
        populateLanduseCategories();
    } else {
        populateThematicCategories(currentTheme);
    }
    
    console.log('✅ Popolamento completato');
}

/**
 * NUOVO: Popola categorie uso del suolo
 */
function populateLanduseCategories() {
    const container = document.getElementById('legend-sortable-items');
    if (!container) return;
    
    container.innerHTML = '';
    originalLegendOrder = [];
    
    for (const classKey in landUseLabels) {
        if (landUseLabels.hasOwnProperty(classKey)) {
            const label = landUseLabels[classKey];
            const legendItem = createLegendItem({
                category: classKey,
                label: label,
                color: landUseColors[classKey] || 'rgba(200,200,200,0.7)',
                count: 0,
                percentage: 0
            });
            
            container.appendChild(legendItem);
            originalLegendOrder.push(classKey);
        }
    }
}

/**
 * NUOVO: Popola categorie tematiche
 */
function populateThematicCategories(themeKey) {
    const container = document.getElementById('legend-sortable-items');
    if (!container) return;
    
    container.innerHTML = '';
    originalLegendOrder = [];
    
    const theme = themes[themeKey];
    if (!theme) return;
    
    if (theme.type === 'jenks') {
        populateJenksCategories(themeKey, theme);
    } else if (theme.type === 'categorical') {
        populateCategoricalCategories(themeKey, theme);
    } else {
        populateNumericCategories(themeKey, theme);
    }
}

/**
 * NUOVO: Popola categorie Jenks
 */
function populateJenksCategories(themeKey, theme) {
    const container = document.getElementById('legend-sortable-items');
    const labels = getJenksLabels(themeKey);
    const numClasses = themeKey === 'population' ? 7 : 8;
    
    for (let i = 0; i < numClasses; i++) {
        const legendItem = createLegendItem({
            category: i.toString(),
            label: labels[i] || (`Classe ${i + 1}`),
            color: theme.colors[i] || '#cccccc',
            count: 0,
            percentage: 0,
            isJenks: true,
            jenksIndex: i
        });
        
        container.appendChild(legendItem);
        originalLegendOrder.push(i.toString());
    }
}

/**
 * NUOVO: Popola categorie categoriche
 */
function populateCategoricalCategories(themeKey, theme) {
    const container = document.getElementById('legend-sortable-items');
    
    let colorMap = {};
    let labelMap = {};
    
    switch (themeKey) {
        case 'land_cover':
            colorMap = landCoverColors;
            labelMap = landCoverLabels;
            break;
        case 'flood_risk':
            colorMap = floodRiskColors;
            labelMap = floodRiskLabels;
            break;
        case 'landslide_risk':
            colorMap = landslideRiskColors;
            labelMap = landslideRiskLabels;
            break;
        case 'coastal_erosion':
            colorMap = coastalErosionColors;
            labelMap = coastalErosionLabels;
            break;
        case 'seismic_risk':
            colorMap = seismicRiskColors;
            labelMap = seismicRiskLabels;
            break;
    }
    
    for (const code in colorMap) {
        if (colorMap.hasOwnProperty(code)) {
            const color = colorMap[code];
            const label = labelMap[code] || code;
            
            const legendItem = createLegendItem({
                category: code,
                label: label,
                color: color,
                count: 0,
                percentage: 0
            });
            
            container.appendChild(legendItem);
            originalLegendOrder.push(code);
        }
    }
}

/**
 * NUOVO: Popola categorie numeriche
 */
function populateNumericCategories(themeKey, theme) {
    const container = document.getElementById('legend-sortable-items');
    const range = calculateDynamicRange(themeKey) || getStaticRange(themeKey) || { min: 0, max: 100 };
    const step = (range.max - range.min) / (theme.colors.length - 1);
    
    for (let i = 0; i < theme.colors.length; i++) {
        const color = theme.colors[i];
        const minVal = Math.round(range.min + (step * i));
        const maxVal = i === theme.colors.length - 1 ? 
            range.max : 
            Math.round(range.min + (step * (i + 1)));
        
        const label = `${minVal} - ${maxVal} ${theme.unit || ''}`;
        const category = `range-${i}`;
        
        const legendItem = createLegendItem({
            category: category,
            label: label,
            color: color,
            count: 0,
            percentage: 0,
            isNumeric: true,
            minVal: minVal,
            maxVal: maxVal
        });
        
        container.appendChild(legendItem);
        originalLegendOrder.push(category);
    }
}

/**
 * NUOVO: Crea elemento legenda
 */
function createLegendItem(options) {
    const { category, label, color, count = 0, percentage = 0 } = options;
    
    const item = document.createElement('div');
    item.className = 'legend-item legend-item-dynamic interactive';
    item.setAttribute('data-category', category);
    item.setAttribute('data-count', count);
    item.setAttribute('data-percentage', percentage.toFixed(1));
    
    if (options.isJenks) {
        item.setAttribute('data-jenks-index', options.jenksIndex);
    }
    if (options.isNumeric) {
        item.setAttribute('data-min-val', options.minVal);
        item.setAttribute('data-max-val', options.maxVal);
    }
    
    item.innerHTML = `
        <span class="legend-checkbox">
            <i class="checkbox-icon fas fa-check"></i>
        </span>
        <div class="legend-color" style="background-color: ${color}"></div>
        <div class="legend-label-container">
            <span class="legend-label">${label}</span>
            <div class="legend-stats">
                <span class="count-display">${count.toLocaleString()}</span>
                <span class="percentage-display">(${percentage.toFixed(1)}%)</span>
            </div>
        </div>
    `;
    
    // Setup handler per filtri
    item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleLegendItemClick(category, e.ctrlKey || e.metaKey);
    });
    
    item.title = 'Click per filtro singolo, Ctrl+Click per selezione multipla';
    
    return item;
}

/**
 * NUOVO: Ottieni tema corrente
 */
function getCurrentTheme() {
    return window.currentTheme || 'landuse';
}

/**
 * NUOVO: Inizializzazione aggressiva con force render
 */
function startAggressiveInitialization() {
    console.log('🎯 Avvio inizializzazione aggressiva con force render...');
    
    // Strategia 1: Forza render della mappa
    forceMapRenderAndCount();
    
    // Strategia 2: Aspetta source data event  
    setupSourceDataListener();
    
    // Strategia 3: Fallback con timer per aggiornamento iniziale
    setTimeout(() => {
        if (!legendSystemInitialized || Object.keys(currentViewportStats).length === 0) {
            console.log('⚠️ Fallback: forzo aggiornamento legenda dopo timeout');
            attemptForceCount('fallback');
        }
    }, 3000);
}

/**
 * NUOVO: Forza render della mappa per attivare features
 */
function forceMapRenderAndCount() {
    systemStats.forceRenderAttempts++;
    console.log('🔄 Forzo render mappa - Tentativo', systemStats.forceRenderAttempts);
    
    if (!map || !map.triggerRepaint) {
        console.log('⚠️ map.triggerRepaint non disponibile');
        return;
    }
    
    setTimeout(() => {
        try {
            // Forza repaint della mappa
            map.triggerRepaint();
            console.log('✅ triggerRepaint() eseguito');
            
            // Piccolo movimento per attivare rendering
            const currentCenter = map.getCenter();
            const currentZoom = map.getZoom();
            
            // Micro-pan e zoom back per attivare il rendering
            map.easeTo({
                center: [currentCenter.lng + 0.0001, currentCenter.lat + 0.0001],
                zoom: currentZoom,
                duration: 100
            });
            
            setTimeout(() => {
                map.easeTo({
                    center: currentCenter,
                    zoom: currentZoom,
                    duration: 100
                });
                
                // Tenta conteggio dopo movimento
                setTimeout(() => {
                    attemptForceCount('post-render');
                }, 1000);
                
            }, 200);
            
        } catch (error) {
            console.log('❌ Errore force render:', error);
        }
    }, 500);
}

/**
 * NUOVO: Setup listener per source data
 */
function setupSourceDataListener() {
    if (!map) return;
    
    const sourceDataHandler = (e) => {
        systemStats.sourceDataChecks++;
        
        if (e.sourceId === 'palermo_catastale' && e.isSourceLoaded && !legendSystemInitialized) {
            console.log('📡 Source data loaded - tentativo conteggio');
            
            setTimeout(() => {
                attemptForceCount('source-data');
            }, 500);
        }
    };
    
    map.on('sourcedata', sourceDataHandler);
    
    // Rimuovi listener dopo 15 secondi
    setTimeout(() => {
        map.off('sourcedata', sourceDataHandler);
    }, 15000);
}

/**
 * NUOVO: Tenta conteggio forzato con multiple strategie
 */
function attemptForceCount(strategy) {
    console.log('🎯 Tentativo conteggio forzato via:', strategy);
    
    let success = false;
    
    try {
        const countsData = calculateViewportCounts();
        
        if (countsData.totalVisible > 0) {
            console.log('✅ Trovate', countsData.totalVisible, 'particelle');
            
            updateLegendUIWithCounts(countsData);
            updateHeaderStats(countsData.totalVisible);
            
            systemStats.successfulCounts++;
            success = true;
            legendSystemInitialized = true;
            
            console.log('🎉 Successo conteggio via', strategy, '- Particelle:', countsData.totalVisible);
        }
    } catch (error) {
        console.log('⚠️ Errore durante conteggio:', error.message);
    }
    
    if (!success) {
        console.log('❌ Tentativo fallito:', strategy);
        
        // Retry con strategia diversa
        if (strategy !== 'source-fallback') {
            setTimeout(() => {
                attemptForceCount('source-fallback');
            }, 1000);
        }
    }
}

/**
 * NUOVO: Calcola conteggi viewport (REFACTORED: usa CONFIG.fields)
 */
function calculateViewportCounts() {
    const features = map.queryRenderedFeatures(undefined, {
        layers: getActiveMapLayers()
    });
    
    const counts = {};
    const uniqueParticles = new Set();
    let totalVisible = 0;
    
    features.forEach((feature) => {
        // REFACTORED: usa CONFIG.fields.identifiers.fid invece di 'fid'
        const fid = feature.properties[CONFIG.fields.identifiers.fid];
        
        if (fid && !uniqueParticles.has(fid)) {
            uniqueParticles.add(fid);
            totalVisible++;
            
            const category = determineFeatureCategory(feature);
            if (category !== null) {
                counts[category] = (counts[category] || 0) + 1;
            }
        }
    });
    
    return {
        counts: counts,
        totalVisible: totalVisible,
        viewportBounds: map.getBounds(),
        zoom: map.getZoom()
    };
}

/**
 * NUOVO: Determina categoria feature (REFACTORED: usa CONFIG.fields)
 */
function determineFeatureCategory(feature) {
    const currentTheme = getCurrentTheme();
    
    if (currentTheme === 'landuse' || !currentTheme) {
        // REFACTORED: usa CONFIG.fields.geography.landUseClass invece di 'class'
        return feature.properties[CONFIG.fields.geography.landUseClass] || '';
    }
    
    const theme = themes[currentTheme];
    if (!theme) return null;
    
    if (theme.type === 'jenks') {
        return getJenksCategory(feature, theme);
    } else if (theme.type === 'categorical') {
        return getCategoricalCategory_FIXED(feature, theme);
    } else {
        return getNumericCategory(feature, theme);
    }
}

/**
 * NUOVO: Helper per categoria Jenks (REFACTORED: usa mapping centralizzato quando possibile)
 */
function getJenksCategory(feature, theme) {
    // REFACTORED: usa THEME_FIELD_MAPPING quando disponibile
    const fieldName = THEME_FIELD_MAPPING[getCurrentTheme()] || theme.property;
    const value = feature.properties[fieldName];
    
    if (value === null || value === undefined || value === '') {
        return '0';
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0';
    
    for (let i = theme.jenksBreaks.length - 1; i >= 0; i--) {
        if (numValue >= theme.jenksBreaks[i]) {
            return i.toString();
        }
    }
    
    return '0';
}

/**
 * NUOVO: Helper per categoria categorica (REFACTORED: usa mapping centralizzato quando possibile)
 */
function getCategoricalCategory_FIXED(feature, theme) {
    // REFACTORED: usa THEME_FIELD_MAPPING quando disponibile
    const fieldName = THEME_FIELD_MAPPING[getCurrentTheme()] || theme.property;
    return feature.properties[fieldName] || 'N/D';
}

/**
 * NUOVO: Helper per categoria numerica (REFACTORED: usa mapping centralizzato quando possibile)
 */
function getNumericCategory(feature, theme) {
    // REFACTORED: usa THEME_FIELD_MAPPING quando disponibile
    const fieldName = THEME_FIELD_MAPPING[getCurrentTheme()] || theme.property;
    const value = feature.properties[fieldName];
    
    if (value === null || value === undefined || value === '') {
        return 'range-0';
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'range-0';
    
    const currentTheme = getCurrentTheme();
    const range = calculateDynamicRange(currentTheme) || getStaticRange(currentTheme) || { min: 0, max: 100 };
    const step = (range.max - range.min) / 5;
    
    for (let i = 4; i >= 0; i--) {
        const minVal = range.min + (step * i);
        const maxVal = i === 4 ? range.max : range.min + (step * (i + 1));
        
        if (numValue >= minVal && numValue <= maxVal) {
            return `range-${i}`;
        }
    }
    
    return 'range-0';
}

/**
 * NUOVO: Ottieni layer attivi
 */
function getActiveMapLayers() {
    const layers = ['catastale-base'];
    
    if (map.getLayer('catastale-thematic')) {
        layers.push('catastale-thematic');
    }
    
    return layers;
}

/**
 * NUOVO: Aggiorna UI legenda con conteggi
 */
function updateLegendUIWithCounts(countsData) {
    const counts = countsData.counts;
    const totalVisible = countsData.totalVisible;
    
    const legendItems = document.querySelectorAll('#legend-sortable-items .legend-item-dynamic');
    
    legendItems.forEach((item) => {
        const category = item.getAttribute('data-category');
        const count = counts[category] || 0;
        const percentage = totalVisible > 0 ? (count / totalVisible) * 100 : 0;
        
        item.setAttribute('data-count', count);
        item.setAttribute('data-percentage', percentage.toFixed(1));
        
        const countDisplay = item.querySelector('.count-display');
        const percentageDisplay = item.querySelector('.percentage-display');
        
        if (countDisplay) {
            countDisplay.textContent = count.toLocaleString();
        }
        
        if (percentageDisplay) {
            percentageDisplay.textContent = `(${percentage.toFixed(1)}%)`;
        }
        
        if (count > 0) {
            item.classList.add('has-particles');
            item.style.opacity = '1';
        } else {
            item.classList.remove('has-particles');
            item.style.opacity = '0.5';
        }
    });
    
    // NUOVO: Ordinamento automatico per legenda base (landuse)
    const currentTheme = getCurrentTheme();
    if (currentTheme === 'landuse' || !currentTheme) {
        sortLegendByCountDescending();
    }
    
    // Salva stats correnti
    currentViewportStats = {
        total: totalVisible,
        byCategory: counts,
        byTheme: counts,
        uniqueParticles: new Set()
    };
}

/**
 * NUOVO: Aggiorna header stats
 */
function updateHeaderStats(totalVisible) {
    const visibleCountEl = document.querySelector('.legend-stats .visible-count');
    if (visibleCountEl) {
        visibleCountEl.textContent = totalVisible.toLocaleString();
    }
    
    const zoomEl = document.querySelector('.zoom-level');
    if (zoomEl && map) {
        zoomEl.textContent = `Zoom: ${map.getZoom().toFixed(1)}`;
    }
}

/**
 * NUOVO: Ordina legenda per conteggio decrescente (dal più alto al più basso)
 */
function sortLegendByCountDescending() {
    const container = document.getElementById('legend-sortable-items');
    if (!container) return;
    
    const items = Array.from(container.querySelectorAll('.legend-item-dynamic'));
    if (items.length === 0) return;
    
    console.log('🔄 Ordinamento legenda per conteggio decrescente...');
    
    // Ordina gli elementi per conteggio decrescente
    items.sort((a, b) => {
        const countA = parseInt(a.getAttribute('data-count')) || 0;
        const countB = parseInt(b.getAttribute('data-count')) || 0;
        
        // Prima per conteggio decrescente
        if (countB !== countA) {
            return countB - countA;
        }
        
        // Se il conteggio è uguale, ordina alfabeticamente
        const labelA = a.querySelector('.legend-label').textContent;
        const labelB = b.querySelector('.legend-label').textContent;
        return labelA.localeCompare(labelB);
    });
    
    // Riappendi gli elementi nell'ordine corretto con animazione
    items.forEach((item, index) => {
        // Aggiungi una piccola animazione per rendere visibile il riordinamento
        item.style.transition = 'opacity 0.3s ease';
        item.style.opacity = '0.7';
        
        setTimeout(() => {
            container.appendChild(item);
            item.style.opacity = '';
            item.style.transition = '';
        }, index * 20); // Stagger l'animazione
    });
    
    console.log('✅ Ordinamento completato -', items.length, 'elementi riordinati');
}

/**
 * Gestisce click su elemento legenda
 */
window.handleLegendItemClick = function(category, isCtrlPressed) {
    console.log('🖱️ Click su legenda:', category, 'Ctrl:', isCtrlPressed);
    
    if (isCtrlPressed) {
        // Ctrl+Click: aggiungi/rimuovi dalla selezione multipla
        if (window.legendFilterState.activeCategories.has(category)) {
            window.legendFilterState.activeCategories.delete(category);
        } else {
            window.legendFilterState.activeCategories.add(category);
        }
    } else {
        // Click singolo: toggle o selezione esclusiva
        if (window.legendFilterState.activeCategories.size === 1 && 
            window.legendFilterState.activeCategories.has(category)) {
            // Se è l'unico selezionato, deseleziona (mostra tutto)
            window.legendFilterState.activeCategories.clear();
        } else {
            // Seleziona solo questo
            window.legendFilterState.activeCategories.clear();
            window.legendFilterState.activeCategories.add(category);
        }
    }
    
    // Applica filtri
    applyLegendFilters();
    
    // Aggiorna UI legenda
    updateLegendUI();
    
    // Mostra notifica
    showLegendFilterNotification();
};

/**
 * Applica filtri basati su selezione legenda (REFACTORED: usa CONFIG.fields)
 */
function applyLegendFilters() {
    let filter = null;
    
    if (window.legendFilterState.activeCategories.size > 0) {
        window.legendFilterState.isFiltering = true;
        
        // Costruisci filtro basato sul tipo di tema corrente
        if (currentTheme === 'landuse' || !currentTheme) {
            // REFACTORED: usa CONFIG.fields.geography.landUseClass invece di 'class'
            const conditions = Array.from(window.legendFilterState.activeCategories).map(cat => 
                ['==', ['get', CONFIG.fields.geography.landUseClass], cat]
            );
            filter = conditions.length === 1 ? conditions[0] : ['any', ...conditions];
        } else {
            const theme = themes[currentTheme];
            if (theme) {
                if (theme.type === 'categorical') {
                    // REFACTORED: usa THEME_FIELD_MAPPING quando disponibile
                    const fieldName = THEME_FIELD_MAPPING[currentTheme] || theme.property;
                    const conditions = Array.from(window.legendFilterState.activeCategories).map(cat => {
                        // Gestione speciale per valori che potrebbero essere in formati diversi
                        if (currentTheme === 'flood_risk') {
                            return ['==', ['downcase', ['coalesce', ['get', fieldName], '']], cat.toLowerCase()];
                        }
                        return ['==', ['get', fieldName], cat];
                    });
                    filter = conditions.length === 1 ? conditions[0] : ['any', ...conditions];
                } else if (theme.type === 'jenks') {
                    // REFACTORED: usa THEME_FIELD_MAPPING quando disponibile
                    const fieldName = THEME_FIELD_MAPPING[currentTheme] || theme.property;
                    const conditions = Array.from(window.legendFilterState.activeCategories).map(cat => {
                        const classIndex = parseInt(cat);
                        if (isNaN(classIndex)) return null;
                        
                        const minVal = theme.jenksBreaks[classIndex];
                        const maxVal = theme.jenksBreaks[classIndex + 1] || Infinity;
                        
                        return ['all',
                            ['>=', ['get', fieldName], minVal],
                            ['<', ['get', fieldName], maxVal]
                        ];
                    }).filter(c => c !== null);
                    
                    filter = conditions.length === 1 ? conditions[0] : ['any', ...conditions];
                }
            }
        }
    } else {
        window.legendFilterState.isFiltering = false;
    }
    
    // Combina con filtri territoriali esistenti (mandamento/foglio)
    const territorialFilter = getCurrentFilter ? getCurrentFilter() : null;
    
    if (territorialFilter && filter) {
        filter = ['all', territorialFilter, filter];
    } else if (territorialFilter && !filter) {
        filter = territorialFilter;
    }
    
    // Applica filtro al layer appropriato
    if (map.getLayer('catastale-thematic')) {
        map.setFilter('catastale-thematic', filter);
    } else {
        map.setFilter('catastale-base', filter);
    }
    map.setFilter('catastale-outline', filter);
    
    // Auto-zoom sulle particelle filtrate
    if (window.legendFilterState.activeCategories.size > 0) {
        zoomToFilteredFeatures(filter);
    }
    
    // Forza aggiornamento conteggi
    setTimeout(() => {
        lastUpdateHash = '';
        updateDynamicLegend();
    }, 300);
}

/**
 * Zoom automatico sulle particelle filtrate (REFACTORED: usa CONFIG.fields)
 */
function zoomToFilteredFeatures(filter) {
    if (!filter) return;
    
    try {
        const layer = map.getLayer('catastale-thematic') ? 'catastale-thematic' : 'catastale-base';
        
        // Query features con il filtro applicato
        const features = map.querySourceFeatures('palermo_catastale', {
            sourceLayer: CONFIG.pmtiles.sourceLayer,
            filter: filter
        });
        
        if (features.length === 0) {
            console.log('⚠️ Nessuna feature trovata per lo zoom');
            return;
        }
        
        // Calcola bounding box
        let bounds = null;
        const uniqueFeatures = new Map();
        
        features.forEach(feature => {
            // REFACTORED: usa CONFIG.fields.identifiers.fid invece di 'fid'
            const fid = feature.properties[CONFIG.fields.identifiers.fid];
            if (fid && !uniqueFeatures.has(fid)) {
                uniqueFeatures.set(fid, feature);
                
                if (feature.geometry && feature.geometry.coordinates) {
                    const coords = feature.geometry.coordinates[0];
                    
                    coords.forEach(coord => {
                        if (Array.isArray(coord[0])) {
                            coord.forEach(innerCoord => {
                                if (!bounds) {
                                    bounds = [[innerCoord[0], innerCoord[1]], [innerCoord[0], innerCoord[1]]];
                                } else {
                                    bounds[0][0] = Math.min(bounds[0][0], innerCoord[0]);
                                    bounds[0][1] = Math.min(bounds[0][1], innerCoord[1]);
                                    bounds[1][0] = Math.max(bounds[1][0], innerCoord[0]);
                                    bounds[1][1] = Math.max(bounds[1][1], innerCoord[1]);
                                }
                            });
                        } else {
                            if (!bounds) {
                                bounds = [[coord[0], coord[1]], [coord[0], coord[1]]];
                            } else {
                                bounds[0][0] = Math.min(bounds[0][0], coord[0]);
                                bounds[0][1] = Math.min(bounds[0][1], coord[1]);
                                bounds[1][0] = Math.max(bounds[1][0], coord[0]);
                                bounds[1][1] = Math.max(bounds[1][1], coord[1]);
                            }
                        }
                    });
                }
            }
        });
        
        if (bounds) {
            const isMobile = window.innerWidth <= 768;
            const padding = isMobile ? 
                { top: 100, bottom: 100, left: 50, right: 50 } :
                { top: 100, bottom: 100, left: 380, right: 480 };
            
            map.fitBounds(bounds, {
                padding: padding,
                duration: 1500,
                maxZoom: 16
            });
            
            console.log('🎯 Zoom su', uniqueFeatures.size, 'particelle filtrate');
        }
    } catch (error) {
        console.error('❌ Errore zoom automatico:', error);
    }
}

/**
 * Aggiorna UI degli elementi legenda
 */
window.updateLegendUI = function() {
    const items = document.querySelectorAll('.legend-item-dynamic');
    
    items.forEach(item => {
        const category = item.getAttribute('data-category');
        const checkbox = item.querySelector('.legend-checkbox');
        
        if (window.legendFilterState.activeCategories.has(category)) {
            item.classList.add('selected');
            if (checkbox) checkbox.classList.add('checked');
        } else {
            item.classList.remove('selected');
            if (checkbox) checkbox.classList.remove('checked');
        }
    });
};

/**
 * Mostra notifica filtri legenda
 */
function showLegendFilterNotification() {
    const count = window.legendFilterState.activeCategories.size;
    
    const existingNotification = document.querySelector('.legend-filter-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    if (count === 0) return;
    
    const notification = document.createElement('div');
    notification.className = 'legend-filter-notification';
    notification.innerHTML = `
        <i class="fas fa-filter"></i>
        <span>${count} ${count === 1 ? 'categoria' : 'categorie'} filtrate</span>
        <button onclick="window.clearLegendFilters()" class="clear-filters-btn">
            <i class="fas fa-times"></i> Rimuovi filtri
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #ff9900 0%, #ff5100 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 2000;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 600;
        animation: slideUp 0.5s ease;
    `;
    
    document.body.appendChild(notification);
}

/**
 * Pulisci tutti i filtri legenda
 */
window.clearLegendFilters = function() {
    window.legendFilterState.activeCategories.clear();
    window.legendFilterState.isFiltering = false;
    
    applyLegendFilters();
    updateLegendUI();
    
    const notification = document.querySelector('.legend-filter-notification');
    if (notification) {
        notification.remove();
    }
};

/**
 * Crea controlli toggle per la legenda
 */
window.createToggleControls = function() {
    const controls = document.createElement('div');
    controls.className = 'legend-toggle-controls';
    controls.innerHTML = `
        <button class="toggle-all-btn" onclick="window.toggleAllLegendItems()">
            <i class="fas fa-check-square"></i> Seleziona tutto
        </button>
        <button class="clear-all-btn" onclick="window.clearLegendFilters()">
            <i class="fas fa-square"></i> Deseleziona tutto
        </button>
    `;
    
    controls.style.cssText = `
        display: flex;
        gap: 8px;
        margin-bottom: 10px;
        padding: 8px;
        background: rgba(0,0,0,0.05);
        border-radius: 8px;
    `;
    
    return controls;
};

/**
 * Toggle tutti gli elementi
 */
window.toggleAllLegendItems = function() {
    const items = document.querySelectorAll('.legend-item-dynamic');
    
    if (window.legendFilterState.activeCategories.size === items.length) {
        // Se tutti sono selezionati, deseleziona tutto
        window.clearLegendFilters();
    } else {
        // Altrimenti seleziona tutto
        window.legendFilterState.activeCategories.clear();
        items.forEach(item => {
            const category = item.getAttribute('data-category');
            if (category) {
                window.legendFilterState.activeCategories.add(category);
            }
        });
        
        applyLegendFilters();
        updateLegendUI();
        showLegendFilterNotification();
    }
};

/**
 * Calcola statistiche delle particelle nel viewport corrente (REFACTORED: usa CONFIG.fields)
 * AGGIORNATO per compatibilità 
 */
function calculateViewportStatistics() {
    if (!map || !map.getLayer('catastale-base')) {
        return { total: 0, byCategory: {}, byTheme: {}, uniqueParticles: new Set() };
    }
    
    // Se il sistema è già inizializzato e abbiamo stats valide, usale
    if (legendSystemInitialized && currentViewportStats.total > 0) {
        const currentZoom = map.getZoom();
        const currentCenter = map.getCenter();
        
        if (currentZoom === lastViewportState.zoom && 
            currentCenter.lng === lastViewportState.center[0] && 
            currentCenter.lat === lastViewportState.center[1] &&
            !window.legendFilterState.isFiltering) {
            return currentViewportStats;
        }
    }
    
    // Calcola nuove statistiche
    const countsData = calculateViewportCounts();
    
    return {
        total: countsData.totalVisible,
        byCategory: countsData.counts,
        byTheme: countsData.counts,
        uniqueParticles: new Set()
    };
}

/**
 * Aggiorna legenda tematica con conteggi (REFACTORED: usa CONFIG.fields)
 * SEMPLIFICATO per compatibilità 
 */
function updateThematicLegendWithCounts(stats) {
    // Usa la nuova funzione se disponibile
    if (legendSystemInitialized) {
        updateLegendUIWithCounts({
            counts: stats.byTheme,
            totalVisible: stats.total
        });
        updateHeaderStats(stats.total);
        return;
    }
    
    // Fallback al sistema originale
    const legend = document.getElementById('legend');
    if (!legend || !legend.classList.contains('visible')) return;
    
    const items = document.getElementById('legend-items');
    if (!items) return;
    
    const theme = themes[currentTheme];
    if (!theme) return;
    
    let totalItem = items.querySelector('.legend-total-item');
    
    if (!totalItem) {
        totalItem = createTotalItem(stats.total);
        items.insertBefore(totalItem, items.firstChild);
        
        const separator = createSeparator();
        items.insertBefore(separator, totalItem.nextSibling);
    } else {
        updateTotalItem(totalItem, stats.total);
    }
    
    const legendItems = items.querySelectorAll('.legend-item:not(.legend-total-item), .legend-item-dynamic:not(.legend-total-item)');
    
    legendItems.forEach((item, index) => {
        // Assicurati che l'item abbia la struttura corretta
        if (!item.querySelector('.legend-label-dynamic')) {
            const labelElement = item.querySelector('.legend-label');
            if (labelElement) {
                const originalText = labelElement.textContent;
                const colorElement = item.querySelector('.legend-color');
                const colorStyle = colorElement ? colorElement.style.backgroundColor : '';
                
                item.className = 'legend-item-dynamic interactive';
                item.innerHTML = `
                    <span class="legend-checkbox"></span>
                    <div class="legend-color" style="background-color: ${colorStyle}"></div>
                    <span class="legend-label-dynamic">
                        <span class="category-name">${originalText}</span>
                        <span class="category-stats">0 (0.0%)</span>
                    </span>
                `;
            }
        }
        
        let count = 0;
        
        if (theme.type === 'categorical') {
            // Per temi categorici, usa il data-category dell'elemento
            const category = item.getAttribute('data-category');
            if (category && stats.byTheme[category]) {
                count = stats.byTheme[category];
            }
        } else if (theme.type === 'jenks') {
            // Gestione migliorata per classi Jenks con valori null/zero (REFACTORED: usa CONFIG.fields)
            const features = map.queryRenderedFeatures(undefined, {
                layers: ['catastale-thematic'].filter(l => {
                    try {
                        return map.getLayer(l) !== undefined;
                    } catch {
                        return false;
                    }
                })
            });
            
            const uniqueInClass = new Set();
            features.forEach(f => {
                // REFACTORED: usa THEME_FIELD_MAPPING quando possibile
                const fieldName = THEME_FIELD_MAPPING[currentTheme] || theme.property;
                const value = f.properties[fieldName];
                // REFACTORED: usa CONFIG.fields.identifiers.fid invece di 'fid'
                const fid = f.properties[CONFIG.fields.identifiers.fid];
                
                // Solo conta se il FID è unico
                if (fid && !uniqueInClass.has(fid)) {
                    // Verifica speciale per l'elemento "Nessun dato" o "0"
                    const labelElement = item.querySelector('.category-name');
                    const isNoDataItem = labelElement && 
                        (labelElement.textContent.includes('Nessun dato') || 
                         labelElement.textContent.includes('0') ||
                         labelElement.textContent.includes('N/D'));
                    
                    if (isNoDataItem) {
                        // Per l'elemento "Nessun dato", conta solo valori null/undefined/0
                        if (value === null || value === undefined || value === '' || 
                            value === 0 || value === '0') {
                            uniqueInClass.add(fid);
                            count++;
                        }
                    } else {
                        // Per le classi normali, usa la funzione isInJenksClass corretta
                        if (isInJenksClass(value, index, theme.jenksBreaks)) {
                            uniqueInClass.add(fid);
                            count++;
                        }
                    }
                }
            });
        }
        
        const percentage = ((count / TOTAL_PARTICELLE) * 100).toFixed(1);
        const statsElement = item.querySelector('.category-stats');
        if (statsElement) {
            statsElement.textContent = `${formatNumber(count)} (${percentage}%)`;
        }
        
        if (count > 0) {
            item.classList.add('has-particles');
        } else {
            item.classList.remove('has-particles');
        }
    });
}

/**
 * Ottiene la categoria per un valore tematico (REFACTORED: usa THEME_FIELD_MAPPING)
 * Con gestione corretta dei valori null/undefined
 */
function getThemeCategory(value, theme) {
    if (theme.type === 'categorical') {
        return value || 'N/D';
    } else if (theme.type === 'jenks' && theme.jenksBreaks) {
        // Non convertire null/undefined in 0
        if (value === null || value === undefined || value === '') {
            return 'N/D';
        }
        
        const numValue = parseFloat(value);
        
        // Se il parsing fallisce, ritorna N/D
        if (isNaN(numValue)) {
            return 'N/D';
        }
        
        // Trova la classe appropriata per il valore
        for (let i = theme.jenksBreaks.length - 1; i >= 0; i--) {
            if (numValue >= theme.jenksBreaks[i]) {
                return `Classe ${i + 1}`;
            }
        }
        
        return 'N/D';
    }
    return 'N/D';
}

/**
 * Verifica se un valore è nella classe Jenks specificata
 * Con gestione corretta di null/undefined/zero
 */
function isInJenksClass(value, classIndex, breaks) {
    // Se il valore è null, undefined o stringa vuota, non appartiene a nessuna classe
    if (value === null || value === undefined || value === '') {
        return false;
    }
    
    const numValue = parseFloat(value);
    
    // Se il parsing fallisce o il valore è NaN, non appartiene a nessuna classe
    if (isNaN(numValue)) {
        return false;
    }
    
    // Per valori zero, verifica se zero è effettivamente nel range della classe
    const minVal = breaks[classIndex] || 0;
    const maxVal = breaks[classIndex + 1];
    
    // Se non c'è un max value (ultima classe), usa Infinity
    if (maxVal === undefined) {
        return numValue >= minVal;
    }
    
    return numValue >= minVal && numValue < maxVal;
}

/**
 * Valida che il numero totale di particelle sia corretto (REFACTORED: usa CONFIG.fields)
 */
function validateTotalParticles() {
    try {
        const allFeatures = map.querySourceFeatures('palermo_catastale', {
            sourceLayer: CONFIG.pmtiles.sourceLayer
        });
        
        const uniqueParticles = new Set();
        allFeatures.forEach(f => {
            // REFACTORED: usa CONFIG.fields.identifiers.fid invece di 'fid'
            const fid = f.properties[CONFIG.fields.identifiers.fid];
            if (fid) {
                uniqueParticles.add(fid);
            }
        });
        
        const actualTotal = uniqueParticles.size;
        
        if (actualTotal !== TOTAL_PARTICELLE && actualTotal > 0) {
            console.warn(`⚠️ ATTENZIONE: Numero particelle rilevato (${actualTotal}) diverso dal riferimento (${TOTAL_PARTICELLE})`);
        } else {
            console.log(`✅ Validazione particelle OK: ${actualTotal} particelle totali`);
        }
    } catch (error) {
        console.error('❌ Errore validazione particelle:', error);
    }
}

/**
 * Configura listener per aggiornamenti viewport
 * AGGIORNATO con force render iniziale
 */
function setupViewportListeners() {
    map.on('moveend', () => {
        debounceUpdateLegend();
    });
    
    map.on('zoomend', () => {
        debounceUpdateLegend();
    });
    
    map.on('sourcedata', (e) => {
        if (e.sourceId === 'palermo_catastale' && e.isSourceLoaded) {
            isFilterApplied = true;
            setTimeout(() => {
                forceLegendUpdate();
                isFilterApplied = false;
            }, 1000);
        }
    });
}

/**
 * Debounce per ottimizzare performance
 */
function debounceUpdateLegend() {
    if (isFilterApplied) return;
    
    clearTimeout(legendUpdateTimer);
    legendUpdateTimer = setTimeout(() => {
        if (legendSystemInitialized) {
            const countsData = calculateViewportCounts();
            updateLegendUIWithCounts(countsData);
            updateHeaderStats(countsData.totalVisible);
            
            // NUOVO: Assicura ordinamento anche negli aggiornamenti automatici
            const currentTheme = getCurrentTheme();
            if (currentTheme === 'landuse' || !currentTheme) {
                setTimeout(() => {
                    sortLegendByCountDescending();
                }, 100);
            }
        } else {
            updateDynamicLegend();
        }
    }, 700);
}

/**
 * Crea hash per verificare se ci sono cambiamenti reali
 */
function createUpdateHash(stats) {
    const filterHash = Array.from(window.legendFilterState.activeCategories).join(',');
    return `${stats.total}-${Object.keys(stats.byCategory).length}-${currentTheme}-${currentMandamentoFilter}-${currentFoglioFilter}-${filterHash}`;
}

/**
 * Aggiorna la legenda con conteggi dinamici
 * MODIFICATO per integrazione con nuovo sistema
 */
function updateDynamicLegend() {
    if (isUpdatingLegend) return;
    
    const legend = document.getElementById('legend');
    if (!legend || !legend.classList.contains('visible')) return;
    
    isUpdatingLegend = true;
    
    try {
        const stats = calculateViewportStatistics();
        
        const currentCenter = map.getCenter();
        lastViewportState = {
            zoom: map.getZoom(),
            center: [currentCenter.lng, currentCenter.lat]
        };
        
        const currentHash = createUpdateHash(stats);
        if (currentHash === lastUpdateHash) {
            isUpdatingLegend = false;
            return;
        }
        lastUpdateHash = currentHash;
        
        if (currentTheme === 'landuse' || !currentTheme) {
            updateBaseLegendWithCounts(stats);
        } else if (themes[currentTheme]) {
            updateThematicLegendWithCounts(stats);
        }
        
        currentViewportStats = stats;
        
        // Log per debug inizializzazione
        if (systemStats.successfulCounts === 1) {
            console.log('🎉 Prima popolazione legenda completata:', stats.total, 'particelle visibili');
        }
        
    } catch (error) {
        console.error('❌ Errore aggiornamento legenda:', error);
    } finally {
        setTimeout(() => {
            isUpdatingLegend = false;
        }, 100);
    }
}

/**
 * Aggiorna legenda base con conteggi (REFACTORED: usa CONFIG.fields)
 * AGGIORNATO per nuovo sistema + ordinamento automatico
 */
function updateBaseLegendWithCounts(stats) {
    // Se il nuovo sistema è attivo, usa quello
    if (legendSystemInitialized) {
        updateLegendUIWithCounts({
            counts: stats.byCategory,
            totalVisible: stats.total
        });
        updateHeaderStats(stats.total);
        return;
    }
    
    // Fallback al sistema originale CON ordinamento
    const legend = document.getElementById('legend');
    if (!legend || !legend.classList.contains('visible')) return;
    
    const items = document.getElementById('legend-items');
    if (!items) return;
    
    const existingTotal = items.querySelector('.legend-total-item');
    
    if (existingTotal) {
        updateTotalItem(existingTotal, stats.total);
        
        const categoryItems = items.querySelectorAll('.legend-item-dynamic:not(.legend-total-item)');
        categoryItems.forEach(item => {
            const categoryName = item.querySelector('.category-name');
            if (categoryName) {
                const originalText = categoryName.textContent;
                let classKey = '';
                for (const [key, label] of Object.entries(landUseLabels)) {
                    if (label === originalText) {
                        classKey = key;
                        break;
                    }
                }
                
                const count = stats.byCategory[classKey] || 0;
                const percentage = ((count / TOTAL_PARTICELLE) * 100).toFixed(1);
                
                // Aggiorna attributi per ordinamento
                item.setAttribute('data-count', count);
                item.setAttribute('data-percentage', percentage);
                
                const statsElement = item.querySelector('.category-stats');
                if (statsElement) {
                    statsElement.textContent = `${formatNumber(count)} (${percentage}%)`;
                }
                
                if (count > 0) {
                    item.classList.add('has-particles');
                } else {
                    item.classList.remove('has-particles');
                }
            }
        });
        
        // NUOVO: Applica ordinamento anche nel fallback
        sortLegendByCountDescending();
        return;
    }
    
    items.innerHTML = '';
    
    const totalItem = createTotalItem(stats.total);
    items.appendChild(totalItem);
    
    items.appendChild(createSeparator());
    
    // Crea array per ordinamento
    const categoriesArray = [];
    for (const [className, color] of Object.entries(landUseColors)) {
        const label = landUseLabels[className];
        const count = stats.byCategory[className] || 0;
        const percentage = ((count / TOTAL_PARTICELLE) * 100).toFixed(1);
        
        categoriesArray.push({
            className,
            label,
            color,
            count,
            percentage: parseFloat(percentage)
        });
    }
    
    // NUOVO: Ordina per conteggio decrescente prima di creare gli elementi
    categoriesArray.sort((a, b) => {
        if (b.count !== a.count) {
            return b.count - a.count; // Conteggio decrescente
        }
        return a.label.localeCompare(b.label); // Alfabetico se conteggio uguale
    });
    
    // Crea elementi nell'ordine ordinato
    categoriesArray.forEach(({className, label, color, count, percentage}) => {
        const item = document.createElement('div');
        item.className = 'legend-item-dynamic interactive';
        item.setAttribute('data-category', className);
        item.setAttribute('data-count', count);
        item.setAttribute('data-percentage', percentage.toFixed(1));
        item.setAttribute('data-tooltip', 'Clicca per filtrare');
        
        item.addEventListener('click', (e) => {
            e.preventDefault();
            handleLegendItemClick(className, e.ctrlKey || e.metaKey);
        });
        
        item.innerHTML = `
            <span class="legend-checkbox"></span>
            <div class="legend-color" style="background-color: ${color}"></div>
            <span class="legend-label-dynamic">
                <span class="category-name">${label}</span>
                <span class="category-stats">${formatNumber(count)} (${percentage.toFixed(1)}%)</span>
            </span>
        `;
        
        if (count > 0) {
            item.classList.add('has-particles');
        }
        
        items.appendChild(item);
    });
    
    updateLegendUI();
}

/**
 * Crea elemento totale
 */
function createTotalItem(count) {
    const item = document.createElement('div');
    item.className = 'legend-total-item';
    
    const percentage = ((count / TOTAL_PARTICELLE) * 100).toFixed(1);
    
    item.innerHTML = `
        <div class="total-label">
            <strong>Particelle Visibili:</strong>
            <span class="total-stats">${formatNumber(count)} / ${formatNumber(TOTAL_PARTICELLE)} (${percentage}%)</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
    `;
    
    return item;
}

/**
 * Aggiorna elemento totale esistente
 */
function updateTotalItem(item, count) {
    const percentage = ((count / TOTAL_PARTICELLE) * 100).toFixed(1);
    
    const statsElement = item.querySelector('.total-stats');
    if (statsElement) {
        statsElement.textContent = `${formatNumber(count)} / ${formatNumber(TOTAL_PARTICELLE)} (${percentage}%)`;
    }
    
    const progressFill = item.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
}

/**
 * Crea separatore
 */
function createSeparator() {
    const separator = document.createElement('div');
    separator.className = 'legend-separator';
    return separator;
}

/**
 * Formatta numero con separatore migliaia
 */
function formatNumber(num) {
    return num.toLocaleString('it-IT');
}

/**
 * Forza aggiornamento legenda
 */
function forceLegendUpdate() {
    lastUpdateHash = '';
    if (legendSystemInitialized) {
        const countsData = calculateViewportCounts();
        updateLegendUIWithCounts(countsData);
        updateHeaderStats(countsData.totalVisible);
        
        // NUOVO: Applica ordinamento anche nel force update
        const currentTheme = getCurrentTheme();
        if (currentTheme === 'landuse' || !currentTheme) {
            setTimeout(() => {
                sortLegendByCountDescending();
            }, 100);
        }
    } else {
        updateDynamicLegend();
    }
}

// NUOVO: Aggiungi CSS per il nuovo sistema
function addLegendSystemStyles() {
    if (document.getElementById('legend-system-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'legend-system-styles';
    styles.textContent = `
        .legend-system-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .legend-stats {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .stats-main {
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: 600;
            color: #495057;
            font-size: 14px;
        }
        .stats-secondary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            opacity: 0.8;
        }
        .visible-count {
            color: #ff9900;
            font-size: 16px;
            font-weight: 700;
        }
        .filter-status {
            color: #6c757d;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
        }
        .filter-status.active {
            background: rgba(255, 153, 0, 0.2);
            color: #ff9900;
            font-weight: 600;
        }
        .legend-label-container {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-width: 0;
        }
        .legend-label {
            font-size: 12px;
            font-weight: 500;
            color: #495057;
            flex: 1;
            margin-right: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .legend-stats {
            display: flex;
            gap: 4px;
            font-size: 10px;
            color: #6c757d;
            flex-shrink: 0;
        }
        .count-display {
            font-weight: 600;
            color: #ff9900;
            font-family: monospace;
        }
        .percentage-display {
            opacity: 0.8;
            font-style: italic;
        }
        .legend-checkbox {
            width: 14px;
            height: 14px;
            border: 2px solid #ced4da;
            border-radius: 3px;
            margin-right: 8px;
            position: relative;
            transition: all 0.2s ease;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .legend-checkbox.checked {
            background: #ff9900;
            border-color: #ff9900;
        }
        .checkbox-icon {
            font-size: 8px;
            color: white;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        .legend-checkbox.checked .checkbox-icon {
            opacity: 1;
        }
        .legend-item-dynamic.selected {
            background: #fff3cd;
            border-color: #ff9900;
            box-shadow: 0 2px 8px rgba(255, 153, 0, 0.2);
        }
        .legend-item-dynamic.has-particles {
            opacity: 1;
        }
        .legend-item-dynamic:not(.has-particles) {
            opacity: 0.5;
            background: #f8f9fa;
        }
    `;
    
    document.head.appendChild(styles);
}

// Inizializza CSS al caricamento
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addLegendSystemStyles);
} else {
    addLegendSystemStyles();
}

// ===== FILE: 04-dynamic-legend-simple-fix.js =====
/**
 * FIX SEMPLICE: Patch diretto senza dipendenze
 * Risolve conteggio categorici con approccio minimale
 */

(function() {
    'use strict';
    
    console.log('🔧 Fix semplice per categorici...');
    
    /**
     * Patch principale - sostituisce la logica problematica
     */
    function applySimplePatch() {
        
        // PATCH 1: getCategoricalCategory migliorata (REFACTORED: usa THEME_FIELD_MAPPING)
        window.getCategoricalCategory_FIXED = function(feature, theme) {
            if (!feature || !feature.properties || !theme) {
                return 'N/D';
            }
            
            // REFACTORED: usa THEME_FIELD_MAPPING quando disponibile
            const fieldName = THEME_FIELD_MAPPING[getCurrentTheme()] || theme.property;
            const rawValue = feature.properties[fieldName];
            
            // Logica basata sulla proprietà invece del tema corrente
            switch (fieldName) {
                case CONFIG.fields.risks.flood: // 'Ri alluvione' - flood_risk
                    const floodVal = (rawValue || '').toString().toLowerCase();
                    return floodVal === 'alto' ? 'alto' : 'no';
                
                case CONFIG.fields.risks.landslide: // 'rischio di frana' - landslide_risk  
                    return 'none';
                
                case CONFIG.fields.risks.coastalErosion: // 'rischio di erosione costiera' - coastal_erosion
                    return 'none';
                
                case CONFIG.fields.risks.seismic: // 'rischio sismico' - seismic_risk
                    return 'low';
                
                case CONFIG.fields.geography.landCover: // 'copertura del suolo' - land_cover
                    return rawValue ? rawValue.toString() : 'N/D';
                
                default:
                    return rawValue || 'N/D';
            }
        };
        
        // PATCH 2: Intercetta calculateViewportCounts
        let originalCalculateViewportCounts = window.calculateViewportCounts;
        
        window.calculateViewportCounts = function() {
            // Se la funzione originale non esiste, crea una versione base
            if (!originalCalculateViewportCounts) {
                return { counts: {}, totalVisible: 0 };
            }
            
            // Chiama la funzione originale
            let result = originalCalculateViewportCounts();
            
            // Se abbiamo un tema categorico attivo, ricalcola i conteggi con la logica corretta
            const currentTheme = window.currentTheme;
            
            if (currentTheme && window.themes && window.themes[currentTheme] && 
                window.themes[currentTheme].type === 'categorical') {
                
                console.log('🔄 Ricalcolo conteggi per tema categorico:', currentTheme);
                
                try {
                    // Ottieni features dal viewport
                    if (window.map && window.map.queryRenderedFeatures) {
                        const features = window.map.queryRenderedFeatures(undefined, {
                            layers: ['catastale-base', 'catastale-thematic'].filter(l => {
                                try {
                                    return window.map.getLayer(l) !== undefined;
                                } catch {
                                    return false;
                                }
                            })
                        });
                        
                        const fixedCounts = {};
                        const uniqueParticles = new Set();
                        let total = 0;
                        
                        features.forEach(feature => {
                            // REFACTORED: usa CONFIG.fields.identifiers.fid invece di 'fid'
                            const fid = feature.properties[CONFIG.fields.identifiers.fid];
                            if (fid && !uniqueParticles.has(fid)) {
                                uniqueParticles.add(fid);
                                total++;
                                
                                // Usa la logica corretta per determinare la categoria
                                const category = window.getCategoricalCategory_FIXED(feature, window.themes[currentTheme]);
                                
                                if (!fixedCounts[category]) {
                                    fixedCounts[category] = 0;
                                }
                                fixedCounts[category]++;
                            }
                        });
                        
                        console.log('✅ Conteggi corretti:', fixedCounts);
                        
                        result = {
                            counts: fixedCounts,
                            totalVisible: total,
                            viewportBounds: result.viewportBounds,
                            zoom: result.zoom
                        };
                    }
                } catch (error) {
                    console.warn('⚠️ Errore ricalcolo conteggi:', error);
                }
            }
            
            return result;
        };
        
        console.log('✅ Patch conteggi categorici applicato');
    }
    
    /**
     * Aggiunge controllo ordinamento minimo
     */
    function addSimpleSort() {
        setTimeout(() => {
            const legend = document.getElementById('legend-title');
            if (!legend || legend.querySelector('.simple-sort')) return;
            
            const sortBtn = document.createElement('button');
            sortBtn.className = 'simple-sort';
            sortBtn.innerHTML = '🔄';
            sortBtn.title = 'Riordina per conteggio';
            sortBtn.style.cssText = `
                background: #ff9900; border: none; border-radius: 3px;
                color: white; padding: 2px 5px; margin-left: 8px; 
                cursor: pointer; font-size: 10px; display:none;
            `;
            
            sortBtn.addEventListener('click', function() {
                // Trova container items
                const containers = [
                    'legend-sortable-items',
                    'legend-items'
                ].map(id => document.getElementById(id)).filter(el => el);
                
                const container = containers.find(c => c.children.length > 0);
                if (!container) return;
                
                // Trova elementi legenda
                const items = Array.from(container.children).filter(child => 
                    child.classList.contains('legend-item-dynamic') || 
                    child.classList.contains('legend-item')
                );
                
                // Ordina per conteggio
                items.sort((a, b) => {
                    const getCount = (el) => {
                        const dataCount = el.getAttribute('data-count');
                        if (dataCount) return parseInt(dataCount) || 0;
                        
                        const statsText = el.querySelector('.category-stats, .legend-stats')?.textContent || '0';
                        const match = statsText.match(/(\d+)/);
                        return match ? parseInt(match[1]) : 0;
                    };
                    
                    return getCount(b) - getCount(a); // Decrescente
                });
                
                // Riapplica
                items.forEach(item => container.appendChild(item));
                
                // Feedback visivo
                sortBtn.innerHTML = '✓';
                setTimeout(() => {
                    sortBtn.innerHTML = '🔄';
                }, 1000);
                
                console.log('📊 Legenda riordinata per conteggio');
            });
            
            legend.appendChild(sortBtn);
            
            // Ordina automaticamente dopo 2 secondi
            setTimeout(() => {
                sortBtn.click();
            }, 2000);
            
        }, 1500);
    }
    
    /**
     * Forza aggiornamento con tutti i metodi disponibili
     */
    function forceUpdate() {
        setTimeout(() => {
            console.log('🔄 Forcing legend update...');
            
            // Prova tutte le funzioni di aggiornamento disponibili
            const updateFuncs = [
                'updateDynamicLegend',
                'forceLegendUpdate',
                'updateLegendUIWithCounts',
                'updateBaseLegendWithCounts'
            ];
            
            updateFuncs.forEach(funcName => {
                if (typeof window[funcName] === 'function') {
                    setTimeout(() => {
                        try {
                            window[funcName]();
                        } catch (e) {
                            // Ignora errori silenziosamente
                        }
                    }, 100);
                }
            });
        }, 1000);
    }
    
    /**
     * Inizializzazione immediata
     */
    function initialize() {
        console.log('🚀 Inizializzazione immediata...');
        
        // Applica patch principale
        applySimplePatch();
        
        // Aggiungi ordinamento
        addSimpleSort();
        
        // Forza aggiornamento
        forceUpdate();
        
        console.log('✅ Fix semplice applicato');
    }
    
    // Esegui immediatamente e con retry
    initialize();
    
    // Retry dopo DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    }
    
    // Retry aggiuntivi
    setTimeout(initialize, 1000);
    setTimeout(initialize, 3000);
    
})();

// ===== AGGIUNTA: Sistema di Ordinamento Legenda Bidirezionale =====
let currentSortState = {
    type: 'count',
    direction: 'desc' // 'asc' o 'desc'
};

/**
 * Aggiunge controlli di ordinamento alla legenda
 */
function addLegendSortingControls() {
    const legendItems = document.getElementById('legend-items');
    if (!legendItems || legendItems.querySelector('.legend-sorting-controls')) return;
    
    // Crea container controlli ordinamento
    const sortingControls = document.createElement('div');
    sortingControls.className = 'legend-sorting-controls';
    sortingControls.innerHTML = `
	        <div class="sort-info"><small>Ordine -  </small>
            <small id="sort-status">%: Alto → Basso</small>
        </div>
        <div class="sorting-buttons">
            <button class="sort-btn active" data-sort="count" title="Ordina per % (clicca per invertire)">
                <i class="fas fa-sort-amount-down"></i>
                <span class="sort-direction">↓</span>
            </button>
            <button class="sort-btn" data-sort="alphabetical" title="Ordina alfabeticamente (clicca per invertire)">
                <i class="fas fa-sort-alpha-down"></i>
                <span class="sort-direction">↓</span>
            </button>
        </div>

    `;
    
    // Inserisci dopo l'header della legenda
    const legendTitle = document.getElementById('legend-title');
    if (legendTitle && legendTitle.parentNode) {
        legendTitle.parentNode.insertBefore(sortingControls, legendTitle.nextSibling);
    } else {
        legendItems.insertBefore(sortingControls, legendItems.firstChild);
    }
    
    // Aggiungi event listeners
    const sortButtons = sortingControls.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const sortType = this.getAttribute('data-sort');
            
            // Se è lo stesso tipo, inverte la direzione
            if (currentSortState.type === sortType) {
                currentSortState.direction = currentSortState.direction === 'desc' ? 'asc' : 'desc';
            } else {
                // Nuovo tipo, imposta direzione di default
                currentSortState.type = sortType;
                currentSortState.direction = sortType === 'count' ? 'desc' : 'asc';
            }
            
            // Aggiorna stato attivo
            sortButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Aggiorna icone e testo
            updateSortButtonsDisplay();
            
            // Esegui ordinamento
            sortLegendItems(currentSortState.type, currentSortState.direction);
        });
    });
}

/**
 * Aggiorna la visualizzazione dei pulsanti di ordinamento
 */
function updateSortButtonsDisplay() {
    const countBtn = document.querySelector('.sort-btn[data-sort="count"]');
    const alphaBtn = document.querySelector('.sort-btn[data-sort="alphabetical"]');
    const statusElement = document.getElementById('sort-status');
    
    if (!countBtn || !alphaBtn || !statusElement) return;
    
    // Aggiorna icone e direzioni
    if (currentSortState.type === 'count') {
        const isDesc = currentSortState.direction === 'desc';
        countBtn.querySelector('i').className = `fas fa-sort-amount-${isDesc ? 'down' : 'up'}`;
        countBtn.querySelector('.sort-direction').textContent = isDesc ? '↓' : '↑';
        statusElement.textContent = `%: ${isDesc ? 'Alto → Basso' : 'Basso → Alto'}`;
        
        // Reset alfabetico
        alphaBtn.querySelector('i').className = 'fas fa-sort-alpha-down';
        alphaBtn.querySelector('.sort-direction').textContent = '↓';
    } else {
        const isDesc = currentSortState.direction === 'desc';
        alphaBtn.querySelector('i').className = `fas fa-sort-alpha-${isDesc ? 'down' : 'up'}`;
        alphaBtn.querySelector('.sort-direction').textContent = isDesc ? '↓' : '↑';
        statusElement.textContent = `Alfabetico: ${isDesc ? 'Z → A' : 'A → Z'}`;
        
        // Reset numerico
        countBtn.querySelector('i').className = 'fas fa-sort-amount-down';
        countBtn.querySelector('.sort-direction').textContent = '↓';
    }
}

/**
 * Ordina gli elementi della legenda
 */
function sortLegendItems(sortType = 'count', direction = 'desc') {
    const containers = [
        document.getElementById('legend-sortable-items'),
        document.getElementById('legend-items')
    ];
    
    const container = containers.find(c => c && c.children.length > 0);
    if (!container) return;
    
    // Trova tutti gli elementi legenda (esclude controlli e header)
    const items = Array.from(container.children).filter(child => 
        child.classList.contains('legend-item-dynamic') || 
        child.classList.contains('legend-item')
    ).filter(item => 
        !item.classList.contains('legend-total-item') &&
        !item.classList.contains('legend-separator') &&
        !item.classList.contains('legend-sorting-controls')
    );
    
    if (items.length === 0) return;
    
    console.log(`🔤 Ordinamento legenda: ${sortType} ${direction} (${items.length} elementi)`);
    
    // Applica ordinamento
    let sortedItems;
    if (sortType === 'alphabetical') {
        sortedItems = sortItemsAlphabetically(items, direction);
    } else {
        sortedItems = sortItemsByCount(items, direction);
    }
    
    // Riapplica elementi nell'ordine corretto con animazione
    sortedItems.forEach((item, index) => {
        item.style.transition = 'opacity 0.2s ease';
        item.style.opacity = '0.7';
        
        setTimeout(() => {
            container.appendChild(item);
            item.style.opacity = '';
            item.style.transition = '';
        }, index * 30); // Animazione staggered
    });
    
    console.log(`✅ Ordinamento ${sortType} ${direction} completato`);
}

/**
 * Ordina elementi alfabeticamente
 */
function sortItemsAlphabetically(items, direction = 'asc') {
    return items.sort((a, b) => {
        const textA = getLegendItemText(a).toLowerCase();
        const textB = getLegendItemText(b).toLowerCase();
        
        const comparison = textA.localeCompare(textB, 'it-IT');
        return direction === 'asc' ? comparison : -comparison;
    });
}

/**
 * Ordina elementi per conteggio
 */
function sortItemsByCount(items, direction = 'desc') {
    return items.sort((a, b) => {
        const countA = getLegendItemCount(a);
        const countB = getLegendItemCount(b);
        
        // Ordinamento per conteggio
        if (countB !== countA) {
            const comparison = countB - countA; // desc di default
            return direction === 'desc' ? comparison : -comparison;
        }
        
        // Se uguale, ordina alfabeticamente (sempre ascendente per parità)
        const textA = getLegendItemText(a).toLowerCase();
        const textB = getLegendItemText(b).toLowerCase();
        return textA.localeCompare(textB, 'it-IT');
    });
}

/**
 * Estrae il testo dall'elemento legenda
 */
function getLegendItemText(item) {
    // Prova diverse strutture possibili
    const selectors = [
        '.category-name',
        '.legend-label',
        '.legend-label-dynamic .category-name',
        '.legend-label-container .legend-label'
    ];
    
    for (const selector of selectors) {
        const element = item.querySelector(selector);
        if (element) {
            return element.textContent.trim();
        }
    }
    
    // Fallback: usa tutto il testo dell'item
    return item.textContent.replace(/\d+\s*\([^)]+\)/, '').trim();
}

/**
 * Estrae il conteggio dall'elemento legenda
 */
function getLegendItemCount(item) {
    // 1. Prova data-count attribute
    const dataCount = item.getAttribute('data-count');
    if (dataCount) {
        return parseInt(dataCount) || 0;
    }
    
    // 2. Prova .count-display
    const countDisplay = item.querySelector('.count-display');
    if (countDisplay) {
        return parseInt(countDisplay.textContent.replace(/[^\d]/g, '')) || 0;
    }
    
    // 3. Prova .category-stats
    const categoryStats = item.querySelector('.category-stats');
    if (categoryStats) {
        const match = categoryStats.textContent.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }
    
    // 4. Cerca pattern numerico nel testo
    const textContent = item.textContent;
    const match = textContent.match(/(\d+)\s*\(/);
    return match ? parseInt(match[1]) : 0;
}

/**
 * Aggiorna il sistema di ordinamento esistente per evitare conflitti
 */
function updateExistingSortSystem() {
    // Modifica sortLegendByCountDescending esistente per non entrare in conflitto
    const originalSort = window.sortLegendByCountDescending;
    
    if (originalSort && !originalSort._enhanced) {
        window.sortLegendByCountDescending = function() {
            // Verifica se l'utente ha scelto ordinamento manuale diverso
            if (currentSortState.type === 'alphabetical') {
                console.log('🔤 Ordinamento alfabetico attivo - skip auto-sort');
                return;
            }
            
            if (currentSortState.type === 'count' && currentSortState.direction === 'asc') {
                console.log('🔢 Ordinamento numerico ascendente attivo - skip auto-sort');
                return;
            }
            
            // Altrimenti esegui ordinamento normale e aggiorna stato
            originalSort.apply(this, arguments);
            
            // Sincronizza stato
            currentSortState.type = 'count';
            currentSortState.direction = 'desc';
            
            // Aggiorna UI
            const sortButtons = document.querySelectorAll('.legend-sorting-controls .sort-btn');
            sortButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector('.sort-btn[data-sort="count"]')?.classList.add('active');
            updateSortButtonsDisplay();
        };
        
        window.sortLegendByCountDescending._enhanced = true;
    }
}

/**
 * Inizializza sistema di ordinamento
 */
function initializeLegendSorting() {
    // Aggiungi controlli se non esistono già 
    if (!document.querySelector('.legend-sorting-controls')) {
        addLegendSortingControls();
    }
    
    // Aggiorna sistema esistente
    updateExistingSortSystem();
    
    // Imposta stato iniziale
    updateSortButtonsDisplay();
    
    console.log('🔤 Sistema ordinamento legenda bidirezionale inizializzato');
}

// ===== CSS STYLES =====
function addLegendSortingStyles() {
    if (document.getElementById('legend-sorting-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'legend-sorting-styles';
    styles.textContent = `
        .legend-sorting-controls {
            background: #fff;
          /*  border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 8px;
            margin: 8px 0;*/
        }
        
        .sorting-buttons {
            display: flex;
            gap: 4px;
            justify-content: center;
            margin-bottom: 10px;
        }
        
        .sort-btn {
            background: #fff;
            border: 1px solid #ced4da;
            border-radius: 4px;
            padding: 6px 10px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 12px;
            color: #6c757d;
            display: flex;
            align-items: center;
            gap: 4px;
            position: relative;
        }
        
        .sort-btn:hover {
            background: #e9ecef;
            border-color: #adb5bd;
            color: #495057;
            transform: translateY(-1px);
        }
        
        .sort-btn.active {
            background: #ff9900;
            border-color: #ff9900;
            color: white;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(255, 153, 0, 0.3);
        }
        
        .sort-btn i {
            font-size: 11px;
        }
        
        .sort-direction {
            font-size: 10px;
            font-weight: bold;
            opacity: 0.8;
        }
        
        .sort-btn.active .sort-direction {
            opacity: 1;
        }
        
        .sort-info {
            text-align: center;
            margin-top: -15px;
        }
        
        .sort-info small {
            color: #6c757d;
            font-size: 10px;
            font-style: italic;
        }
        
        .sort-btn.active + .sort-btn.active .sort-info small,
        .sort-btn.active .sort-info small {
            color: #495057;
            font-weight: 500;
        }
        
        /* Animazione per cambio direzione */
        .sort-btn {
            transition: all 0.3s ease;
        }
        
        .sort-direction {
            transition: transform 0.2s ease;
        }
        
        .sort-btn:active .sort-direction {
            transform: scale(1.2);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .legend-sorting-controls {
                padding: 6px;
                margin: 6px 0;
            }
            
            .sort-btn {
                padding: 5px 8px;
                font-size: 11px;
                gap: 3px;
            }
            
            .sort-direction {
                font-size: 9px;
            }
            
            .sort-info small {
                font-size: 9px;
            }
        }
        
        /* Tema scuro compatibile */
        @media (prefers-color-scheme: dark) {
            .legend-sorting-controls {
                background: #fff;
               /* border-color: #4a5568;*/
            }
            
            .sort-btn {
                background: #4a5568;
                border-color: #718096;
                color: #e2e8f0;
            }
            
            .sort-btn:hover {
                background: #718096;
                border-color: #a0aec0;
            }
            
            .sort-info small {
                color: #a0aec0;
            }
        }
    `;
    
    document.head.appendChild(styles);
}

// ===== INTEGRAZIONE AUTOMATICA =====

// Inizializza quando la legenda è pronta
function autoInitializeSorting() {
    // Aggiungi styles
    addLegendSortingStyles();
    
    // Controlla se la legenda esiste
    const checkLegend = () => {
        const legend = document.getElementById('legend');
        if (legend && legend.classList.contains('visible')) {
            initializeLegendSorting();
            return true;
        }
        return false;
    };
    
    // Prova immediatamente
    if (!checkLegend()) {
        // Osserva quando la legenda diventa visibile
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' &&
                    mutation.target.classList.contains('visible')) {
                    if (checkLegend()) {
                        observer.disconnect();
                    }
                }
            });
        });
        
        const legend = document.getElementById('legend');
        if (legend) {
            observer.observe(legend, { attributes: true });
        }
        
        // Timeout di sicurezza
        setTimeout(() => {
            observer.disconnect();
            if (!document.querySelector('.legend-sorting-controls')) {
                initializeLegendSorting();
            }
        }, 5000);
    }
}

// Auto-inizializzazione
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitializeSorting);
} else {
    setTimeout(autoInitializeSorting, 1000);
}

// Esporta funzioni globali
window.sortLegendItems = sortLegendItems;
window.initializeLegendSorting = initializeLegendSorting;
window.updateSortButtonsDisplay = updateSortButtonsDisplay;

console.log('🔤 Sistema ordinamento legenda BIDIREZIONALE caricato');

console.log('🔧 Fix semplice categorici caricato - Nessuna dipendenza');