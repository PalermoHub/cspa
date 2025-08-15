// ===== INTEGRAZIONE ORDINAMENTO LEGENDA CON FILTRI ESISTENTI =====
/**
 * File di integrazione per garantire compatibilità totale
 * con unified-filters.js e dynamic-legend.js
 */

/**
 * Estende le funzioni esistenti per mantenere ordinamento
 */
function integrateSortingWithExistingFilters() {
    console.log('🔗 Integrazione sistema ordinamento con filtri esistenti...');
    
    // ===== INTEGRAZIONE CON UNIFIED-FILTERS.JS =====
    
    // Override applyUnifiedFiltersToMap per mantenere ordinamento
    if (window.applyUnifiedFiltersToMap) {
        const originalApplyFilters = window.applyUnifiedFiltersToMap;
        window.applyUnifiedFiltersToMap = function() {
            const prevSort = getCurrentSortType();
            originalApplyFilters.apply(this, arguments);
            
            // Riapplica ordinamento dopo applicazione filtri
            if (prevSort && prevSort !== 'original') {
                setTimeout(() => {
                    applySortingInternal(prevSort, false);
                }, 800);
            }
        };
    }
    
    // Override centerOnFilteredFeatures per mantenere ordinamento
    if (window.centerOnFilteredFeatures) {
        const originalCenterOn = window.centerOnFilteredFeatures;
        window.centerOnFilteredFeatures = function(filter) {
            const prevSort = getCurrentSortType();
            originalCenterOn.apply(this, arguments);
            
            if (prevSort && prevSort !== 'original') {
                setTimeout(() => {
                    applySortingInternal(prevSort, false);
                }, 600);
            }
        };
    }
    
    // ===== INTEGRAZIONE CON DYNAMIC-LEGEND.JS =====
    
    // Override updateDynamicLegend per mantenere ordinamento
    if (window.updateDynamicLegend) {
        const originalUpdateLegend = window.updateDynamicLegend;
        window.updateDynamicLegend = function() {
            const prevSort = getCurrentSortType();
            originalUpdateLegend.apply(this, arguments);
            
            // Salva nuovo ordine se necessario
            if (prevSort === 'original' || !prevSort) {
                saveOriginalOrder();
            }
            
            // Riapplica ordinamento se attivo
            if (prevSort && prevSort !== 'original') {
                setTimeout(() => {
                    applySortingInternal(prevSort, false);
                }, 300);
            }
        };
    }
    
    // Override updateBaseLegendWithCounts per mantenere ordinamento
    if (window.updateBaseLegendWithCounts) {
        const originalUpdateBase = window.updateBaseLegendWithCounts;
        window.updateBaseLegendWithCounts = function(stats) {
            const prevSort = getCurrentSortType();
            originalUpdateBase.apply(this, arguments);
            
            if (prevSort && prevSort !== 'original') {
                setTimeout(() => {
                    applySortingInternal(prevSort, false);
                }, 200);
            }
        };
    }
    
    // Override updateThematicLegendWithCounts
    if (window.updateThematicLegendWithCounts) {
        const originalUpdateThematic = window.updateThematicLegendWithCounts;
        window.updateThematicLegendWithCounts = function(stats) {
            const prevSort = getCurrentSortType();
            originalUpdateThematic.apply(this, arguments);
            
            if (prevSort && prevSort !== 'original') {
                setTimeout(() => {
                    applySortingInternal(prevSort, false);
                }, 200);
            }
        };
    }
    
    // Override forceLegendUpdate per mantenere ordinamento
    if (window.forceLegendUpdate) {
        const originalForceUpdate = window.forceLegendUpdate;
        window.forceLegendUpdate = function() {
            const prevSort = getCurrentSortType();
            originalForceUpdate.apply(this, arguments);
            
            if (prevSort && prevSort !== 'original') {
                setTimeout(() => {
                    applySortingInternal(prevSort, false);
                }, 400);
            }
        };
    }
    
    // ===== INTEGRAZIONE CON TEMI =====
    
    // Override applyTheme per gestire cambio tema con ordinamento
    if (window.applyTheme) {
        const originalApplyTheme = window.applyTheme;
        window.applyTheme = function(theme) {
            const prevSort = getCurrentSortType();
            originalApplyTheme.apply(this, arguments);
            
            // Salva nuovo ordine originale dopo cambio tema
            setTimeout(() => {
                if (prevSort === 'original') {
                    saveOriginalOrder();
                } else {
                    // Riapplica ordinamento per nuovo tema
                    setTimeout(() => {
                        applySortingInternal(prevSort, false);
                    }, 500);
                }
            }, 1000);
        };
    }
    
    // ===== INTEGRAZIONE CON FILTRI LEGENDA =====
    
// Override handleLegendItemClick per mantenere ordinamento
if (window.handleLegendItemClick) {
    const originalHandleClick = window.handleLegendItemClick;
    window.handleLegendItemClick = function(category, isCtrlPressed) {
        const prevSort = getCurrentSortType();
        originalHandleClick.apply(this, arguments);
        
        // MODIFICA: Riapplica ordinamento SOLO se non è un filtro colore
        if (prevSort && prevSort !== 'original' && !isColorFiltering()) {
            setTimeout(() => {
                applySortingInternal(prevSort, false);
            }, 500);
        }
    };
}

// Helper per verificare se è attivo un filtro colore
function isColorFiltering() {
    return document.querySelector('.legend-item-dynamic.filtered-by-color') !== null;
}
    
    // Override clearLegendFilters per mantenere ordinamento
    if (window.clearLegendFilters) {
        const originalClearFilters = window.clearLegendFilters;
        window.clearLegendFilters = function() {
            const prevSort = getCurrentSortType();
            originalClearFilters.apply(this, arguments);
            
            if (prevSort && prevSort !== 'original') {
                setTimeout(() => {
                    applySortingInternal(prevSort, false);
                }, 400);
            }
        };
    }
    
    // Override applyLegendFilters per mantenere ordinamento
    if (window.applyLegendFilters) {
        const originalApplyLegendFilters = window.applyLegendFilters;
        window.applyLegendFilters = function() {
            const prevSort = getCurrentSortType();
            originalApplyLegendFilters.apply(this, arguments);
            
            if (prevSort && prevSort !== 'original') {
                setTimeout(() => {
                    applySortingInternal(prevSort, false);
                }, 600);
            }
        };
    }
    
    console.log('✅ Integrazione sistema ordinamento completata');
}

/**
 * Gestisce eventi speciali per mantenere coerenza
 */
function setupAdvancedSortingEventHandlers() {
    // Evento per cambio mandamento/foglio
    document.addEventListener('change', function(e) {
        if (e.target.id === 'mandamento-filter' || e.target.id === 'foglio-filter') {
            const currentSort = getCurrentSortType();
            if (currentSort && currentSort !== 'original') {
                setTimeout(() => {
                    applySortingInternal(currentSort, false);
                }, 1000);
            }
        }
    });
    
    // Evento per cambio tema
    document.addEventListener('customSelectChanged', function(event) {
        const { selectId, value } = event.detail;
        if (['demographic-select', 'economic-select', 'territorial-select'].includes(selectId)) {
            const currentSort = getCurrentSortType();
            if (currentSort && currentSort !== 'original') {
                setTimeout(() => {
                    // Aggiorna ordine originale per nuovo tema
                    saveOriginalOrder();
                    setTimeout(() => {
                        applySortingInternal(currentSort, false);
                    }, 300);
                }, 1500);
            }
        }
    });
    
    // Evento per reset mappa
    document.addEventListener('mapReset', function() {
        // Reset anche ordinamento quando si resetta la mappa
        if (getCurrentSortType() !== 'original') {
            setTimeout(() => {
                resetLegendSorting();
            }, 500);
        }
    });
    
    // Evento per zoom/pan mappa
    if (window.map) {
        map.on('moveend', debouncePreserveSorting);
        map.on('zoomend', debouncePreserveSorting);
    }
}

/**
 * Debounce per preservare ordinamento durante movimenti mappa
 */
let preserveSortTimeout;
function debouncePreserveSorting() {
    clearTimeout(preserveSortTimeout);
    preserveSortTimeout = setTimeout(() => {
        const currentSort = getCurrentSortType();
        if (currentSort && currentSort !== 'original') {
            // Controlla se la legenda è ancora visibile e ha elementi
            const legendItems = document.querySelectorAll('#legend-items .legend-item-dynamic:not(.legend-total-item)');
            if (legendItems.length > 0) {
                applySortingInternal(currentSort, false);
            }
        }
    }, 800);
}

/**
 * Aggiunge controlli di stato per debug
 */
function addSortingDebugControls() {
    if (!window.location.hash.includes('debug')) return;
    
    const debugPanel = document.createElement('div');
    debugPanel.id = 'sorting-debug-panel';
    debugPanel.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 8px;
        font-size: 12px;
        z-index: 10000;
        min-width: 200px;
    `;
    
    debugPanel.innerHTML = `
        <h5>🔧 Sorting Debug</h5>
        <div id="debug-current-sort">Sort: ${getCurrentSortType()}</div>
        <div id="debug-legend-items">Items: 0</div>
        <div id="debug-integration-status">Integration: ❓</div>
        <button onclick="forceSortingUpdate()" style="margin-top:5px;width:100%;">Force Update</button>
    `;
    
    document.body.appendChild(debugPanel);
    
    // Aggiorna debug info ogni secondo
    setInterval(updateDebugInfo, 1000);
}

function updateDebugInfo() {
    const currentSort = document.getElementById('debug-current-sort');
    const legendItems = document.getElementById('debug-legend-items');
    const integrationStatus = document.getElementById('debug-integration-status');
    
    if (currentSort) currentSort.textContent = `Sort: ${getCurrentSortType()}`;
    
    const items = document.querySelectorAll('#legend-items .legend-item-dynamic:not(.legend-total-item)');
    if (legendItems) legendItems.textContent = `Items: ${items.length}`;
    
    if (integrationStatus) {
        const hasIntegration = window.applyUnifiedFiltersToMap && 
                              window.applyUnifiedFiltersToMap.toString().includes('prevSort');
        integrationStatus.innerHTML = hasIntegration ? 'Integration: ✅' : 'Integration: ❌';
    }
}

function forceSortingUpdate() {
    const currentSort = getCurrentSortType();
    saveOriginalOrder();
    applySortingInternal(currentSort, true);
    console.log('🔧 Forced sorting update:', currentSort);
}

/**
 * Migliora la resilienza del sistema
 */
function enhanceSortingResilience() {
    // Verifica periodica che l'ordinamento sia mantenuto
    setInterval(() => {
        const currentSort = getCurrentSortType();
        if (currentSort && currentSort !== 'original') {
            const items = document.querySelectorAll('#legend-items .legend-item-dynamic:not(.legend-total-item)');
            if (items.length > 0) {
                // Verifica se l'ordinamento è ancora applicato correttamente
                const sortData = Array.from(items).map(item => extractSortableData(item));
                const expectedOrder = sortData(sortData.slice(), currentSort);
                
                // Confronta ordine attuale con atteso
                let isCorrectOrder = true;
                for (let i = 0; i < Math.min(sortData.length, expectedOrder.length); i++) {
                    if (sortData[i].category !== expectedOrder[i].category) {
                        isCorrectOrder = false;
                        break;
                    }
                }
                
                // Se l'ordine non è corretto, riapplica silenziosamente
                if (!isCorrectOrder) {
                    console.log('🔄 Correzione automatica ordinamento rilevata');
                    applySortingInternal(currentSort, false);
                }
            }
        }
    }, 10000); // Verifica ogni 10 secondi
    
    // Gestisce errori di rendering
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('legend')) {
            console.log('🚨 Errore legenda rilevato, tentativo recupero ordinamento');
            setTimeout(() => {
                const currentSort = getCurrentSortType();
                if (currentSort !== 'original') {
                    applySortingInternal(currentSort, false);
                }
            }, 1000);
        }
    });
}

/**
 * Salva stato ordinamento in localStorage per persistenza
 */
function enableSortingPersistence() {
    // Carica stato salvato
    const savedSort = localStorage.getItem('cspa-legend-sort');
    if (savedSort && Object.values(LEGEND_SORT_CONFIG.types).includes(savedSort)) {
        setTimeout(() => {
            setSortType(savedSort);
        }, 2000);
    }
    
    // Salva stato quando cambia
    const originalSetSortType = window.setSortType;
    window.setSortType = function(sortType) {
        const result = originalSetSortType.apply(this, arguments);
        if (result) {
            localStorage.setItem('cspa-legend-sort', sortType);
        }
        return result;
    };
    
    // Override applySorting per salvare stato
    const originalApplySorting = window.applySorting;
    window.applySorting = function() {
        originalApplySorting.apply(this, arguments);
        localStorage.setItem('cspa-legend-sort', getCurrentSortType());
    };
}

/**
 * Aggiunge indicatori visivi per lo stato ordinamento
 */
function addSortingVisualIndicators() {
    // Stili per indicatori
    const indicatorStyles = document.createElement('style');
    indicatorStyles.textContent = `
        .legend-sort-indicator-active {
            position: relative;
        }
        
        .legend-sort-indicator-active::after {
            content: '⬇️';
            position: absolute;
            top: -5px;
            right: -5px;
            font-size: 12px;
            animation: sortBounce 2s infinite;
        }
        
        .legend-sort-indicator-active[data-sort="percentage_asc"]::after {
            content: '⬆️';
        }
        
        .legend-sort-indicator-active[data-sort="alphabetical_desc"]::after {
            content: '🔤';
        }
        
        .legend-sort-indicator-active[data-sort="alphabetical_asc"]::after {
            content: '🔤';
            transform: rotate(180deg);
        }
        
        .legend-sort-indicator-active[data-sort="count_desc"]::after {
            content: '🔢';
        }
        
        .legend-sort-indicator-active[data-sort="count_asc"]::after {
            content: '🔢';
            transform: rotate(180deg);
        }
        
        @keyframes sortBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
        }
    `;
    document.head.appendChild(indicatorStyles);
    
    // Funzione per aggiornare indicatori
    window.updateSortingIndicators = function() {
        const currentSort = getCurrentSortType();
        const legend = document.getElementById('legend');
        
        if (legend) {
            legend.classList.remove('legend-sort-indicator-active');
            legend.removeAttribute('data-sort');
            
            if (currentSort && currentSort !== 'original') {
                legend.classList.add('legend-sort-indicator-active');
                legend.setAttribute('data-sort', currentSort);
            }
        }
    };
    
    // Aggiorna indicatori quando cambia ordinamento
    const originalApplySorting = window.applySortingInternal;
    window.applySortingInternal = function() {
        originalApplySorting.apply(this, arguments);
        setTimeout(() => {
            updateSortingIndicators();
        }, 100);
    };
}

/**
 * Crea tooltip informativi per gli utenti
 */
function addSortingTooltips() {
    const tooltip = document.createElement('div');
    tooltip.id = 'sorting-tooltip';
    tooltip.style.cssText = `
        position: fixed;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        z-index: 10001;
        opacity: 0;
        transition: opacity 0.3s ease;
        max-width: 200px;
    `;
    document.body.appendChild(tooltip);
    
    // Aggiungi tooltip ai controlli
    document.addEventListener('mouseover', function(e) {
        if (e.target.closest('.sort-select')) {
            showTooltip(e.target, 'Seleziona il tipo di ordinamento per la legenda');
        } else if (e.target.closest('.sort-reset-btn')) {
            showTooltip(e.target, 'Ripristina l\'ordine originale della legenda');
        } else if (e.target.closest('.sort-apply-btn')) {
            showTooltip(e.target, 'Applica l\'ordinamento selezionato');
        }
    });
    
    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('.legend-sort-controls')) {
            hideTooltip();
        }
    });
    
    function showTooltip(element, text) {
        const tooltip = document.getElementById('sorting-tooltip');
        const rect = element.getBoundingClientRect();
        
        tooltip.textContent = text;
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
        tooltip.style.opacity = '1';
    }
    
    function hideTooltip() {
        const tooltip = document.getElementById('sorting-tooltip');
        tooltip.style.opacity = '0';
    }
}

// ===== INIZIALIZZAZIONE COMPLETA =====
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        integrateSortingWithExistingFilters();
        setupAdvancedSortingEventHandlers();
        enhanceSortingResilience();
        enableSortingPersistence();
        addSortingVisualIndicators();
        addSortingTooltips();
        
        // Debug panel se richiesto
        if (window.location.hash.includes('debug')) {
            addSortingDebugControls();
        }
        
        console.log('🎯 Sistema ordinamento completamente integrato e attivo');
        
    }, 4000);
});

// ===== FUNZIONI UTILITY ESPORTATE =====
window.integrateSortingWithExistingFilters = integrateSortingWithExistingFilters;
window.forceSortingUpdate = forceSortingUpdate;
window.updateSortingIndicators = updateSortingIndicators;

console.log('✅ Modulo integrazione ordinamento legenda caricato');