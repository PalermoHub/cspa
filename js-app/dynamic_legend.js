// ===== FILE: dynamic-legend.js =====
/**
 * Sistema Legenda Dinamica con Conteggio Particelle e Filtri Interattivi
 * Versione 2.1 - Con FIX per conteggio corretto classe "nessun dato" Jenks
 */

// Costanti per il sistema legenda dinamica
const TOTAL_PARTICELLE = 6249;
let legendUpdateTimer = null;
let currentViewportStats = {};
let isUpdatingLegend = false;
let lastUpdateHash = '';
let lastViewportState = { zoom: -1, center: [0, 0] };
let isFilterApplied = false;

// NUOVO: Stato per filtri legenda
window.legendFilterState = {
    activeCategories: new Set(),
    mode: 'all', // 'all' = mostra tutte, 'filter' = mostra solo selezionate
    isFiltering: false
};

/**
 * Inizializza il sistema di legenda dinamica
 */
function initializeDynamicLegend() {
    console.log('🎯 Inizializzazione sistema legenda dinamica interattiva...');
    
    if (!map || !map.isSourceLoaded('palermo_catastale')) {
        setTimeout(initializeDynamicLegend, 1000);
        return;
    }
    
    validateTotalParticles();
    setupViewportListeners();
    
    setTimeout(() => {
        updateDynamicLegend();
    }, 500);
    
    console.log('✅ Sistema legenda dinamica interattiva pronto');
}

/**
 * NUOVO: Gestisce click su elemento legenda
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
 * NUOVO: Applica filtri basati su selezione legenda
 */
function applyLegendFilters() {
    let filter = null;
    
    if (window.legendFilterState.activeCategories.size > 0) {
        window.legendFilterState.isFiltering = true;
        
        // Costruisci filtro basato sul tipo di tema corrente
        if (currentTheme === 'landuse' || !currentTheme) {
            // Filtro per uso del suolo
            const conditions = Array.from(window.legendFilterState.activeCategories).map(cat => 
                ['==', ['get', 'class'], cat]
            );
            filter = conditions.length === 1 ? conditions[0] : ['any', ...conditions];
        } else {
            const theme = themes[currentTheme];
            if (theme) {
                if (theme.type === 'categorical') {
                    // Filtro per temi categorici
                    const conditions = Array.from(window.legendFilterState.activeCategories).map(cat => {
                        // Gestione speciale per valori che potrebbero essere in formati diversi
                        if (currentTheme === 'flood_risk') {
                            return ['==', ['downcase', ['coalesce', ['get', theme.property], '']], cat.toLowerCase()];
                        }
                        return ['==', ['get', theme.property], cat];
                    });
                    filter = conditions.length === 1 ? conditions[0] : ['any', ...conditions];
                } else if (theme.type === 'jenks') {
                    // Filtro per classi Jenks
                    const conditions = Array.from(window.legendFilterState.activeCategories).map(cat => {
                        const classIndex = parseInt(cat);
                        if (isNaN(classIndex)) return null;
                        
                        // Gestione speciale per classe 0 (nessun dato)
                        if (classIndex === 0) {
                            return ['any',
                                ['==', ['get', theme.property], null],
                                ['==', ['get', theme.property], 0],
                                ['==', ['get', theme.property], ''],
                                ['!', ['has', theme.property]]
                            ];
                        }
                        
                        const minVal = theme.jenksBreaks[classIndex];
                        const maxVal = theme.jenksBreaks[classIndex + 1] || Infinity;
                        
                        return ['all',
                            ['>=', ['get', theme.property], minVal],
                            ['<', ['get', theme.property], maxVal],
                            ['!=', ['get', theme.property], 0] // Escludi zero dalle classi > 0
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
    
    // NUOVO: Auto-zoom sulle particelle filtrate
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
 * NUOVO: Zoom automatico sulle particelle filtrate
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
            const fid = feature.properties.fid;
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
 * NUOVO: Aggiorna UI degli elementi legenda
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
 * NUOVO: Mostra notifica filtri legenda
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
 * NUOVO: Pulisci tutti i filtri legenda
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
 * NUOVO: Crea controlli toggle per la legenda
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
 * NUOVO: Toggle tutti gli elementi
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
 * Calcola statistiche delle particelle nel viewport corrente
 */
function calculateViewportStatistics() {
    if (!map || !map.getLayer('catastale-base')) {
        return { total: 0, byCategory: {}, byTheme: {}, uniqueParticles: new Set() };
    }
    
    const currentZoom = map.getZoom();
    const currentCenter = map.getCenter();
    if (currentZoom === lastViewportState.zoom && 
        currentCenter.lng === lastViewportState.center[0] && 
        currentCenter.lat === lastViewportState.center[1] &&
        Object.keys(currentViewportStats).length > 0 &&
        !window.legendFilterState.isFiltering) {
        return currentViewportStats;
    }
    
    const features = map.queryRenderedFeatures(undefined, {
        layers: ['catastale-base', 'catastale-thematic'].filter(l => {
            try {
                return map.getLayer(l) !== undefined;
            } catch {
                return false;
            }
        })
    });
    
    const stats = {
        total: 0,
        byCategory: {},
        byTheme: {},
        uniqueParticles: new Set()
    };
    
    features.forEach(feature => {
        const fid = feature.properties.fid;
        
        if (fid && !stats.uniqueParticles.has(fid)) {
            stats.uniqueParticles.add(fid);
            stats.total++;
            
            // Statistiche per categoria uso del suolo
            const landUse = feature.properties.class || '';
            if (!stats.byCategory[landUse]) {
                stats.byCategory[landUse] = 0;
            }
            stats.byCategory[landUse]++;
            
            // Statistiche per temi categorici
            if (currentTheme && currentTheme !== 'landuse') {
                const theme = themes[currentTheme];
                if (theme && theme.type === 'categorical') {
                    const value = feature.properties[theme.property];
                    if (value !== null && value !== undefined) {
                        if (!stats.byTheme[value]) {
                            stats.byTheme[value] = 0;
                        }
                        stats.byTheme[value]++;
                    }
                }
            }
        }
    });
    
    return stats;
}

/**
 * Aggiorna legenda tematica con conteggi
 * VERSIONE CORRETTA - Fix per conteggio classe "nessun dato" Jenks
 */
function updateThematicLegendWithCounts(stats) {
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
            // LOGICA CORRETTA per Jenks - Fix principale
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
                const value = f.properties[theme.property];
                const fid = f.properties.fid;
                
                if (fid && !uniqueInClass.has(fid)) {
                    // Usa la funzione CORRETTA per verificare l'appartenenza alla classe
                    if (isInJenksClass(value, index, theme.jenksBreaks)) {
                        uniqueInClass.add(fid);
                        count++;
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
 * VERSIONE CORRETTA - Fix per conteggio classe "nessun dato"
 * Verifica se un valore è nella classe Jenks specificata
 */
function isInJenksClass(value, classIndex, breaks) {
    // FIX PRINCIPALE: Gestione speciale per la classe 0 (nessun dato)
    if (classIndex === 0) {
        // La classe 0 dovrebbe contenere solo valori nulli, undefined, 0, o esplicitamente "nessun dato"
        return value === null || 
               value === undefined || 
               value === 0 || 
               value === '' ||
               (typeof value === 'string' && value.toLowerCase().includes('nessun'));
    }
    
    // Per le altre classi, usa la logica normale
    const numValue = parseFloat(value);
    
    // Se il valore non è un numero valido, non appartiene a nessuna classe > 0
    if (isNaN(numValue) || numValue === null || numValue === undefined) {
        return false;
    }
    
    const minVal = breaks[classIndex] || 0;
    const maxVal = breaks[classIndex + 1] || Infinity;
    
    // Per le classi > 0, escludiamo esplicitamente lo zero
    if (classIndex > 0 && numValue === 0) {
        return false;
    }
    
    return numValue >= minVal && numValue < maxVal;
}

/**
 * Valida che il numero totale di particelle sia corretto
 */
function validateTotalParticles() {
    try {
        const allFeatures = map.querySourceFeatures('palermo_catastale', {
            sourceLayer: CONFIG.pmtiles.sourceLayer
        });
        
        const uniqueParticles = new Set();
        allFeatures.forEach(f => {
            if (f.properties.fid) {
                uniqueParticles.add(f.properties.fid);
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
        updateDynamicLegend();
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
    } catch (error) {
        console.error('❌ Errore aggiornamento legenda:', error);
    } finally {
        setTimeout(() => {
            isUpdatingLegend = false;
        }, 100);
    }
}

/**
 * Aggiorna legenda base con conteggi
 */
function updateBaseLegendWithCounts(stats) {
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
        
        return;
    }
    
    items.innerHTML = '';
    
    const totalItem = createTotalItem(stats.total);
    items.appendChild(totalItem);
    
    items.appendChild(createSeparator());
    
    for (const [className, color] of Object.entries(landUseColors)) {
        const label = landUseLabels[className];
        const count = stats.byCategory[className] || 0;
        const percentage = ((count / TOTAL_PARTICELLE) * 100).toFixed(1);
        
        const item = document.createElement('div');
        item.className = 'legend-item-dynamic interactive';
        item.setAttribute('data-category', className);
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
                <span class="category-stats">${formatNumber(count)} (${percentage}%)</span>
            </span>
        `;
        
        if (count > 0) {
            item.classList.add('has-particles');
        }
        
        items.appendChild(item);
    }
    
    updateLegendUI();
}

/**
 * Ottiene la categoria per un valore tematico
 */
function getThemeCategory(value, theme) {
    if (theme.type === 'categorical') {
        return value || 'N/D';
    } else if (theme.type === 'jenks' && theme.jenksBreaks) {
        const numValue = parseFloat(value) || 0;
        for (let i = theme.jenksBreaks.length - 1; i >= 0; i--) {
            if (numValue >= theme.jenksBreaks[i]) {
                return `Classe ${i + 1}`;
            }
        }
    }
    return 'N/D';
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
 * Forza aggiornamento legenda (utile dopo filtri)
 */
function forceLegendUpdate() {
    lastUpdateHash = '';
    updateDynamicLegend();
}

/**
 * FUNZIONE DEBUG: Analizza distribuzione valori Jenks
 * Utile per diagnosticare problemi di classificazione
 */
function debugJenksValues(theme) {
    if (!theme || theme.type !== 'jenks') {
        console.log('❌ Tema non Jenks o non trovato');
        return;
    }
    
    console.log('🔍 Debug valori Jenks per tema:', currentTheme);
    
    const features = map.queryRenderedFeatures(undefined, {
        layers: ['catastale-thematic'].filter(l => {
            try {
                return map.getLayer(l) !== undefined;
            } catch {
                return false;
            }
        })
    });
    
    const valueDistribution = {};
    const classeDistribution = {};
    const classe0Values = [];
    
    features.forEach(f => {
        const value = f.properties[theme.property];
        const fid = f.properties.fid;
        
        if (fid) {
            // Conta distribuzione valori raw
            const valueKey = value === null ? 'null' : 
                           value === undefined ? 'undefined' :
                           value === 0 ? 'zero' :
                           value === '' ? 'empty' : value.toString();
            
            if (!valueDistribution[valueKey]) {
                valueDistribution[valueKey] = 0;
            }
            valueDistribution[valueKey]++;
            
            // Conta distribuzione per classi
            for (let i = 0; i < theme.jenksBreaks.length; i++) {
                if (isInJenksClass(value, i, theme.jenksBreaks)) {
                    if (!classeDistribution[i]) {
                        classeDistribution[i] = 0;
                    }
                    classeDistribution[i]++;
                    
                    // Raccogli esempi per classe 0
                    if (i === 0 && classe0Values.length < 10) {
                        classe0Values.push(value);
                    }
                    break;
                }
            }
        }
    });
    
    console.log('📊 Distribuzione valori (prime 20):', 
        Object.entries(valueDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
    );
    
    console.log('📈 Distribuzione classi Jenks:', classeDistribution);
    console.log('🔍 Esempi valori classe 0:', [...new Set(classe0Values)]);
    console.log('📐 Breaks Jenks:', theme.jenksBreaks);
    
    // Verifica coerenza
    const totalFeatures = features.length;
    const totalClassified = Object.values(classeDistribution).reduce((a, b) => a + b, 0);
    
    if (totalFeatures !== totalClassified) {
        console.warn(`⚠️ ATTENZIONE: Features totali (${totalFeatures}) != Classificate (${totalClassified})`);
    } else {
        console.log('✅ Classificazione coerente');
    }
}

// Funzione di utilità globale per debug da console
window.debugJenks = function() {
    const theme = themes[currentTheme];
    debugJenksValues(theme);
};

// Funzione di utilità per forzare aggiornamento
window.forceLegendUpdate = forceLegendUpdate;

// Inizializzazione automatica quando il DOM è pronto
if (typeof map !== 'undefined') {
    initializeDynamicLegend();
} else {
    // Aspetta che la mappa sia inizializzata
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeDynamicLegend, 2000);
    });
}

console.log('🎯 Sistema Legenda Dinamica v2.1 caricato - Con FIX per classe "nessun dato" Jenks');