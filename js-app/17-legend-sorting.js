// ===== SISTEMA ORDINAMENTO LEGENDA DINAMICA =====
/**
 * Sistema di ordinamento avanzato per la legenda dinamica
 * Compatibile con filtri interconnessi e tutti i temi
 * Versione 1.2 - Fix corretto per filtri colore senza blocchi
 */

// Configurazione ordinamento
const LEGEND_SORT_CONFIG = {
    types: {
        PERCENTAGE_DESC: 'percentage_desc',
        PERCENTAGE_ASC: 'percentage_asc', 
        ALPHABETICAL_DESC: 'alphabetical_desc',
        ALPHABETICAL_ASC: 'alphabetical_asc',
        COUNT_DESC: 'count_desc',
        COUNT_ASC: 'count_asc',
        ORIGINAL: 'original'
    },
    defaultSort: 'percentage_asc',
    animations: {
        duration: 300,
        easing: 'ease-in-out'
    }
};

// Stato globale ordinamento
let currentSortType = LEGEND_SORT_CONFIG.defaultSort;
let originalLegendOrder = new Map(); // Salva ordine originale per ripristino
let legendSortHistory = []; // Storia ordinamenti per undo

/**
 * Inizializza il sistema di ordinamento legenda
 * Da chiamare dopo l'inizializzazione della legenda dinamica
 */
function initializeLegendSorting() {
    console.log('🔄 Inizializzazione sistema ordinamento legenda...');
    
    // Aspetta che la legenda sia pronta
    if (!document.getElementById('legend-items')) {
        setTimeout(initializeLegendSorting, 1000);
        return;
    }
    
    addSortingControls();
    saveOriginalOrder();
    setupSortingEventListeners();
    
    console.log('✅ Sistema ordinamento legenda inizializzato');
}

/**
 * Aggiunge i controlli di ordinamento alla legenda
 */
function addSortingControls() {
    const legend = document.getElementById('legend');
    if (!legend) return;
    
    // Verifica se i controlli esistono già 
    if (legend.querySelector('.legend-sort-controls')) return;
    
    const sortControls = document.createElement('div');
    sortControls.className = 'legend-sort-controls';
    sortControls.innerHTML = `
        <div class="sort-header">
            <h4><i class="fas fa-sort"></i> Ordinamento</h4>
            <button class="sort-reset-btn" onclick="resetLegendSorting()" title="Ripristina ordine originale">
                <i class="fas fa-undo"></i>
            </button>
        </div>
        <div class="sort-options">
            <select id="legend-sort-select" class="sort-select">
                <option value="percentage_asc">% Maggiore → Minore</option>
                <option value="percentage_desc">% Minore → Maggiore</option>
                <option value="count_desc">Numero Maggiore → Minore</option>
                <option value="count_asc">Numero Minore → Maggiore</option>
                <option value="alphabetical_asc">A → Z</option>
                <option value="alphabetical_desc">Z → A</option>
                <option value="original">Ordine Originale</option>
            </select>
            <button class="sort-apply-btn" onclick="applySorting()" title="Applica ordinamento">
                <i class="fas fa-check"></i>
            </button>
        </div>
    `;
    
    // Inserisci i controlli prima del contenuto della legenda
    const legendContent = legend.querySelector('#legend-items');
    if (legendContent) {
        legend.insertBefore(sortControls, legendContent);
    } else {
        legend.appendChild(sortControls);
    }
    
    // Applica stili CSS
    addSortingStyles();
}

/**
 * Salva l'ordine originale degli elementi legenda
 */
function saveOriginalOrder() {
    const items = document.querySelectorAll('#legend-items .legend-item-dynamic:not(.legend-total-item)');
    originalLegendOrder.clear();
    
    items.forEach((item, index) => {
        const category = item.getAttribute('data-category') || item.querySelector('.category-name')?.textContent || '';
        if (category) {
            originalLegendOrder.set(category, {
                element: item.cloneNode(true),
                originalIndex: index,
                category: category
            });
        }
    });
    
    console.log('💾 Ordine originale salvato:', originalLegendOrder.size, 'elementi');
}

/**
 * Configura event listeners per l'ordinamento
 */
function setupSortingEventListeners() {
    const sortSelect = document.getElementById('legend-sort-select');
    if (sortSelect) {
        sortSelect.value = currentSortType;
        
        // Auto-apply al cambio selezione
        sortSelect.addEventListener('change', function(e) {
            currentSortType = e.target.value;
            applySorting();
        });
    }
    
    // Listener per aggiornamenti legenda (per mantenere ordinamento)
    const originalUpdateFunction = window.updateDynamicLegend;
    if (originalUpdateFunction) {
        window.updateDynamicLegend = function() {
            const previousSort = currentSortType;
            originalUpdateFunction.apply(this, arguments);
            
            // Riapplica ordinamento dopo l'update se non è quello originale
            if (previousSort !== 'original') {
                setTimeout(() => {
                    currentSortType = previousSort;
                    applySortingInternal(currentSortType, false);
                }, 100);
            }
        };
    }
}

/**
 * Applica l'ordinamento selezionato
 */
function applySorting() {
    const sortSelect = document.getElementById('legend-sort-select');
    if (sortSelect) {
        currentSortType = sortSelect.value;
    }
    
    applySortingInternal(currentSortType, true);
}

/**
 * Funzione interna per applicare ordinamento
 */
function applySortingInternal(sortType, animate = true) {
    const legendItems = document.getElementById('legend-items');
    if (!legendItems) return;
    
    // Salva stato corrente per history
    legendSortHistory.push({
        type: currentSortType,
        timestamp: Date.now()
    });
    
    // Mantieni massimo 10 elementi nella history
    if (legendSortHistory.length > 10) {
        legendSortHistory.shift();
    }
    
    const items = Array.from(legendItems.querySelectorAll('.legend-item-dynamic:not(.legend-total-item)'));
    if (items.length === 0) return;
    
    // Estrai dati per ordinamento
    const sortableData = items.map(item => extractSortableData(item));
    
    // Applica ordinamento
    const sortedData = sortData(sortableData, sortType);
    
    // Riorganizza DOM
    reorderLegendItems(legendItems, sortedData, animate);
    
    // Aggiorna UI controlli
    updateSortControlsUI(sortType);
    
    console.log(`🔄 Legenda ordinata per: ${sortType}`, sortedData.length, 'elementi');
}

/**
 * Estrae dati ordinabili da un elemento legenda
 */
function extractSortableData(item) {
    const categoryElement = item.querySelector('.category-name');
    const statsElement = item.querySelector('.category-stats');
    
    const category = categoryElement ? categoryElement.textContent.trim() : '';
    const statsText = statsElement ? statsElement.textContent.trim() : '0 (0.0%)';
    
    // Parsing statistiche: "1,234 (45.6%)"
    const countMatch = statsText.match(/^([\d,]+)/);
    const percentageMatch = statsText.match(/\((\d+\.?\d*)%\)/);
    
    const count = countMatch ? parseInt(countMatch[1].replace(/,/g, '')) : 0;
    const percentage = percentageMatch ? parseFloat(percentageMatch[1]) : 0;
    
    return {
        element: item,
        category: category,
        count: count,
        percentage: percentage,
        originalIndex: Array.from(item.parentNode.children).indexOf(item)
    };
}

/**
 * Ordina array di dati secondo il tipo specificato
 */
function sortData(data, sortType) {
    const sortedData = [...data];
    
    switch (sortType) {
        case LEGEND_SORT_CONFIG.types.PERCENTAGE_DESC:
            sortedData.sort((a, b) => {
                if (b.percentage !== a.percentage) {
                    return b.percentage - a.percentage;
                }
                return a.category.localeCompare(b.category); // Secondario: alfabetico
            });
            break;
            
        case LEGEND_SORT_CONFIG.types.PERCENTAGE_ASC:
            sortedData.sort((a, b) => {
                if (a.percentage !== b.percentage) {
                    return a.percentage - b.percentage;
                }
                return a.category.localeCompare(b.category);
            });
            break;
            
        case LEGEND_SORT_CONFIG.types.COUNT_DESC:
            sortedData.sort((a, b) => {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                return a.category.localeCompare(b.category);
            });
            break;
            
        case LEGEND_SORT_CONFIG.types.COUNT_ASC:
            sortedData.sort((a, b) => {
                if (a.count !== b.count) {
                    return a.count - b.count;
                }
                return a.category.localeCompare(b.category);
            });
            break;
            
        case LEGEND_SORT_CONFIG.types.ALPHABETICAL_DESC:
            sortedData.sort((a, b) => a.category.localeCompare(b.category));
            break;
            
        case LEGEND_SORT_CONFIG.types.ALPHABETICAL_ASC:
            sortedData.sort((a, b) => b.category.localeCompare(a.category));
            break;
            
        case LEGEND_SORT_CONFIG.types.ORIGINAL:
            sortedData.sort((a, b) => a.originalIndex - b.originalIndex);
            break;
    }
    
    return sortedData;
}

/**
 * Riorganizza gli elementi nel DOM - VERSIONE SEMPLIFICATA
 */
function reorderLegendItems(container, sortedData, animate) {
    const totalItem = container.querySelector('.legend-total-item');
    const separator = container.querySelector('.legend-separator');
    
    // Rimuovi tutti gli elementi dinamici SENZA clonare
    const dynamicItems = container.querySelectorAll('.legend-item-dynamic:not(.legend-total-item)');
    const elementsToReinsert = [];
    
    // Salva gli elementi originali per reinserirli
    dynamicItems.forEach(item => {
        elementsToReinsert.push(item);
        item.remove();
    });
    
    // Punto di inserimento (dopo separatore se esiste)
    const insertPoint = separator || totalItem;
    
    // Reinserisci in ordine usando gli elementi originali
    sortedData.forEach((data, index) => {
        const originalElement = data.element; // Usa l'elemento originale dal DOM
        
        if (animate) {
            // Animazione slide-in
            originalElement.style.opacity = '0';
            originalElement.style.transform = 'translateX(-10px)';
            originalElement.style.transition = `all ${LEGEND_SORT_CONFIG.animations.duration}ms ${LEGEND_SORT_CONFIG.animations.easing}`;
        }
        
        if (insertPoint && insertPoint.nextSibling) {
            container.insertBefore(originalElement, insertPoint.nextSibling);
        } else {
            container.appendChild(originalElement);
        }
        
        if (animate) {
            // Trigger animazione
            setTimeout(() => {
                originalElement.style.opacity = '1';
                originalElement.style.transform = 'translateX(0)';
            }, index * 50); // Stagger effect
            
            // Cleanup dopo animazione
            setTimeout(() => {
                originalElement.style.transition = '';
            }, LEGEND_SORT_CONFIG.animations.duration + (index * 50) + 100);
        }
    });
}

/**
 * Aggiorna UI controlli ordinamento
 */
function updateSortControlsUI(sortType) {
    const sortSelect = document.getElementById('legend-sort-select');
    const resetBtn = document.querySelector('.sort-reset-btn');
    
    if (sortSelect) {
        sortSelect.value = sortType;
    }
    
    if (resetBtn) {
        if (sortType === 'original') {
            resetBtn.style.opacity = '0.5';
            resetBtn.disabled = true;
        } else {
            resetBtn.style.opacity = '1';
            resetBtn.disabled = false;
        }
    }
    
    // Evidenzia controllo se ordinamento non è originale
    const sortControls = document.querySelector('.legend-sort-controls');
    if (sortControls) {
        if (sortType !== 'original') {
            sortControls.classList.add('active-sort');
        } else {
            sortControls.classList.remove('active-sort');
        }
    }
}

/**
 * Reset ordinamento a stato originale
 */
function resetLegendSorting() {
    currentSortType = 'original';
    applySortingInternal('original', true);
    
    const sortSelect = document.getElementById('legend-sort-select');
    if (sortSelect) {
        sortSelect.value = 'original';
    }
    
    console.log('🔄 Ordinamento legenda resettato');
}

/**
 * Applica ordinamento predefinito (percentuale decrescente)
 */
function applyDefaultSorting() {
    currentSortType = LEGEND_SORT_CONFIG.defaultSort;
    applySortingInternal(LEGEND_SORT_CONFIG.defaultSort, false);
}

/**
 * Aggiunge stili CSS per i controlli ordinamento
 */
function addSortingStyles() {
    if (document.getElementById('legend-sorting-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'legend-sorting-styles';
    styles.textContent = `
        .legend-sort-controls {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 15px;
            transition: all 0.3s ease;
        }
        
        .legend-sort-controls.active-sort {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border-color: #ff9900;
            box-shadow: 0 2px 8px rgba(255, 153, 0, 0.2);
        }
        
        .sort-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .sort-header h4 {
            margin: 0;
            font-size: 14px;
            color: #495057;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .sort-header h4 i {
            color: #ff9900;
        }
        
        .sort-reset-btn {
            background: none;
            border: none;
            color: #6c757d;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.2s ease;
            font-size: 12px;
        }
        
        .sort-reset-btn:hover:not(:disabled) {
            background: rgba(255, 153, 0, 0.1);
            color: #ff9900;
        }
        
        .sort-reset-btn:disabled {
            cursor: not-allowed;
        }
        
        .sort-options {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        
        .sort-select {
            flex: 1;
            padding: 6px 10px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            background: white;
            font-size: 12px;
            color: #495057;
            transition: border-color 0.2s ease;
        }
        
        .sort-select:focus {
            outline: none;
            border-color: #ff9900;
            box-shadow: 0 0 0 2px rgba(255, 153, 0, 0.1);
        }
        
        .sort-apply-btn {
            background: linear-gradient(135deg, #ff9900 0%, #ff5100 100%);
            border: none;
            color: white;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 12px;
        }
        
        .sort-apply-btn:hover {
            background: linear-gradient(135deg, #e8890a 0%, #e6460a 100%);
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .sort-apply-btn:active {
            transform: translateY(0);
        }
        
        /* Animazioni per elementi legenda */
        .legend-item-dynamic {
            transition: all 0.3s ease;
        }
        
        .legend-item-dynamic.sorting {
            opacity: 0.7;
            transform: scale(0.98);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .sort-options {
                flex-direction: column;
                gap: 6px;
            }
            
            .sort-select {
                width: 100%;
            }
            
            .sort-apply-btn {
                width: 100%;
                padding: 8px;
            }
        }
        
        /* Indicatori stato ordinamento */
        .legend-sort-indicator {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ff9900;
            color: white;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    
    document.head.appendChild(styles);
}

/**
 * Ottiene il tipo di ordinamento corrente
 */
function getCurrentSortType() {
    return currentSortType;
}

/**
 * Imposta ordinamento programmaticamente
 */
function setSortType(sortType) {
    if (Object.values(LEGEND_SORT_CONFIG.types).includes(sortType)) {
        currentSortType = sortType;
        applySortingInternal(sortType, true);
        return true;
    }
    return false;
}

/**
 * Ottiene statistiche ordinamento
 */
function getSortingStats() {
    const items = document.querySelectorAll('#legend-items .legend-item-dynamic:not(.legend-total-item)');
    return {
        totalItems: items.length,
        currentSort: currentSortType,
        historyLength: legendSortHistory.length,
        hasOriginalOrder: originalLegendOrder.size > 0
    };
}

// ===== INTEGRAZIONE CON SISTEMA ESISTENTE =====

/**
 * Hook per integrazione con aggiornamenti legenda
 */
function hookLegendUpdates() {
    // Monitora cambiamenti DOM per mantenere ordinamento
    const observer = new MutationObserver((mutations) => {
        let shouldReapplySort = false;
        
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.target.id === 'legend-items') {
                const addedNodes = Array.from(mutation.addedNodes);
                const removedNodes = Array.from(mutation.removedNodes);
                
                // Se sono stati aggiunti nuovi elementi legenda
                if (addedNodes.some(node => node.classList && node.classList.contains('legend-item-dynamic'))) {
                    shouldReapplySort = true;
                }
            }
        });
        
        if (shouldReapplySort && currentSortType !== 'original') {
            setTimeout(() => {
                applySortingInternal(currentSortType, false);
            }, 200);
        }
    });
    
    const legendItems = document.getElementById('legend-items');
    if (legendItems) {
        observer.observe(legendItems, {
            childList: true,
            subtree: true
        });
    }
}

// ===== FUNZIONI ESPORTATE GLOBALMENTE =====
window.initializeLegendSorting = initializeLegendSorting;
window.applySorting = applySorting;
window.resetLegendSorting = resetLegendSorting;
window.applyDefaultSorting = applyDefaultSorting;
window.getCurrentSortType = getCurrentSortType;
window.setSortType = setSortType;
window.getSortingStats = getSortingStats;

// ===== INIZIALIZZAZIONE AUTOMATICA =====
document.addEventListener('DOMContentLoaded', () => {
    // Aspetta che la legenda dinamica sia inizializzata
    setTimeout(() => {
        initializeLegendSorting();
        hookLegendUpdates();
        
        // Applica ordinamento di default dopo un breve ritardo
        setTimeout(() => {
            applyDefaultSorting();
        }, 1500);
        
    }, 3000);
});

console.log('✅ Sistema ordinamento legenda caricato e pronto');