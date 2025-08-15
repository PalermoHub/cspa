// ===== SISTEMA DI ORDINAMENTO LEGENDA =====
// Aggiungere questo codice al file dynamic-legend.js o creare un nuovo file

/**
 * Sistema di ordinamento per la legenda dinamica
 * Ordina gli elementi dalla percentuale/valore più alto al più basso
 */

// Configurazione ordinamento
const SORT_CONFIG = {
    enabled: true,
    sortBy: 'percentage', // 'percentage', 'count', 'alphabetical'
    order: 'desc', // 'desc' (alta->bassa), 'asc' (bassa->alta)
    autoSort: true // Ordinamento automatico quando la legenda si aggiorna
};

/**
 * Estrae il valore numerico da una stringa di statistiche
 * @param {string} statsText - Testo delle statistiche (es. "25 (15.5%)")
 * @returns {object} Oggetto con count e percentage
 */
function extractStatsValue(statsText) {
    if (!statsText) return { count: 0, percentage: 0 };
    
    // Regex per estrarre numeri e percentuali
    const countMatch = statsText.match(/^(\d+)/);
    const percentageMatch = statsText.match(/\(([0-9.]+)%\)/);
    
    const count = countMatch ? parseInt(countMatch[1]) : 0;
    const percentage = percentageMatch ? parseFloat(percentageMatch[1]) : 0;
    
    return { count, percentage };
}

/**
 * Ordina gli elementi della legenda
 * @param {Array} items - Array di elementi DOM della legenda
 * @param {string} sortBy - Criterio di ordinamento ('percentage', 'count', 'alphabetical')
 * @param {string} order - Ordine ('desc', 'asc')
 * @returns {Array} Array ordinato di elementi
 */
function sortLegendItems(items, sortBy = SORT_CONFIG.sortBy, order = SORT_CONFIG.order) {
    if (!items || items.length === 0) return items;
    
    // Converte NodeList in Array se necessario
    const itemsArray = Array.from(items);
    
    return itemsArray.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortBy) {
            case 'percentage':
                const statsA = a.querySelector('.category-stats')?.textContent || '';
                const statsB = b.querySelector('.category-stats')?.textContent || '';
                valueA = extractStatsValue(statsA).percentage;
                valueB = extractStatsValue(statsB).percentage;
                break;
                
            case 'count':
                const countStatsA = a.querySelector('.category-stats')?.textContent || '';
                const countStatsB = b.querySelector('.category-stats')?.textContent || '';
                valueA = extractStatsValue(countStatsA).count;
                valueB = extractStatsValue(countStatsB).count;
                break;
                
            case 'alphabetical':
                const nameA = a.querySelector('.category-name')?.textContent || '';
                const nameB = b.querySelector('.category-name')?.textContent || '';
                valueA = nameA.toLowerCase();
                valueB = nameB.toLowerCase();
                break;
                
            default:
                return 0;
        }
        
        // Ordinamento
        if (sortBy === 'alphabetical') {
            return order === 'desc' ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB);
        } else {
            return order === 'desc' ? valueB - valueA : valueA - valueB;
        }
    });
}

/**
 * Applica l'ordinamento alla legenda
 * @param {string} sortBy - Criterio di ordinamento
 * @param {string} order - Ordine di ordinamento
 */
function applySortToLegend(sortBy = SORT_CONFIG.sortBy, order = SORT_CONFIG.order) {
    const legendContainer = document.getElementById('legend-items');
    if (!legendContainer) return;
    
    // Trova tutti gli elementi della legenda (escludendo totale e separatori)
    const legendItems = legendContainer.querySelectorAll('.legend-item-dynamic:not(.legend-total-item)');
    
    if (legendItems.length === 0) return;
    
    // Salva l'elemento totale e i separatori se esistono
    const totalItem = legendContainer.querySelector('.legend-total-item');
    const separators = legendContainer.querySelectorAll('.legend-separator');
    
    // Ordina gli elementi
    const sortedItems = sortLegendItems(legendItems, sortBy, order);
    
    // Ricostruisce la legenda
    // Prima svuota il container mantenendo solo l'elemento totale
    legendContainer.innerHTML = '';
    
    // Reinserisce l'elemento totale se esiste
    if (totalItem) {
        legendContainer.appendChild(totalItem);
        
        // Aggiunge un separatore dopo il totale
        const separator = document.createElement('div');
        separator.className = 'legend-separator';
        legendContainer.appendChild(separator);
    }
    
    // Aggiunge gli elementi ordinati
    sortedItems.forEach(item => {
        legendContainer.appendChild(item);
    });
    
    // Aggiunge indicatore di ordinamento
    addSortIndicator(sortBy, order);
}

/**
 * Aggiunge un indicatore visivo del tipo di ordinamento attivo
 * @param {string} sortBy - Criterio di ordinamento attivo
 * @param {string} order - Ordine di ordinamento attivo
 */
function addSortIndicator(sortBy, order) {
    const legendTitle = document.getElementById('legend-title');
    if (!legendTitle) return;
    
    // Rimuove indicatori precedenti
    const existingIndicator = legendTitle.querySelector('.sort-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Crea nuovo indicatore
    const indicator = document.createElement('span');
    indicator.className = 'sort-indicator';
    
    const sortLabels = {
        'percentage': '%',
        'count': '#',
        'alphabetical': 'ABC'
    };
    
    const orderIcon = order === 'desc' ? '↓' : '↑';
    indicator.innerHTML = ` <small style="color: #ff9900; font-weight: normal;">[${sortLabels[sortBy] || '?'}${orderIcon}]</small>`;
    
    legendTitle.appendChild(indicator);
}

/**
 * Crea controlli di ordinamento per la legenda
 */
function createSortControls() {
    const legendSection = document.querySelector('.legend-section h2');
    if (!legendSection || legendSection.querySelector('.sort-controls')) return;
    
    // Container per i controlli
    const sortControls = document.createElement('div');
    sortControls.className = 'sort-controls';
    sortControls.style.cssText = `
        display: flex;
        gap: 4px;
        margin-left: auto;
        align-items: center;
    `;
    
    // Dropdown per il criterio di ordinamento
    const sortSelect = document.createElement('select');
    sortSelect.className = 'sort-select';
    sortSelect.style.cssText = `
        font-size: 10px;
        padding: 2px 4px;
        border: 1px solid #ddd;
        border-radius: 3px;
        background: white;
        min-width: 60px;
    `;
    
    sortSelect.innerHTML = `
        <option value="percentage">% ↓</option>
        <option value="count"># ↓</option>
        <option value="alphabetical">ABC ↓</option>
    `;
    
    // Pulsante per cambiare l'ordine
    const orderButton = document.createElement('button');
    orderButton.className = 'sort-order-btn';
    orderButton.innerHTML = '↕';
    orderButton.title = 'Cambia ordine';
    orderButton.style.cssText = `
        font-size: 12px;
        padding: 2px 6px;
        border: 1px solid #ddd;
        border-radius: 3px;
        background: white;
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Event listeners
    sortSelect.addEventListener('change', function() {
        SORT_CONFIG.sortBy = this.value;
        applySortToLegend(SORT_CONFIG.sortBy, SORT_CONFIG.order);
    });
    
    orderButton.addEventListener('click', function() {
        SORT_CONFIG.order = SORT_CONFIG.order === 'desc' ? 'asc' : 'desc';
        this.innerHTML = SORT_CONFIG.order === 'desc' ? '↓' : '↑';
        this.title = SORT_CONFIG.order === 'desc' ? 'Dal più alto al più basso' : 'Dal più basso al più alto';
        applySortToLegend(SORT_CONFIG.sortBy, SORT_CONFIG.order);
    });
    
    // Aggiunge i controlli all'header
    sortControls.appendChild(sortSelect);
    sortControls.appendChild(orderButton);
    legendSection.appendChild(sortControls);
}

/**
 * Intercepta l'aggiornamento della legenda per applicare l'ordinamento automatico
 */
function interceptLegendUpdate() {
    // Osserva i cambiamenti nel container della legenda
    const legendContainer = document.getElementById('legend-items');
    if (!legendContainer) return;
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && SORT_CONFIG.autoSort && SORT_CONFIG.enabled) {
                // Debounce per evitare troppe chiamate
                clearTimeout(window.sortTimeout);
                window.sortTimeout = setTimeout(() => {
                    applySortToLegend();
                }, 100);
            }
        });
    });
    
    observer.observe(legendContainer, {
        childList: true,
        subtree: true
    });
}

/**
 * Inizializza il sistema di ordinamento
 */
function initializeLegendSorting() {
    if (!SORT_CONFIG.enabled) return;
    
    // Crea i controlli di ordinamento
    createSortControls();
    
    // Intercepta gli aggiornamenti della legenda
    interceptLegendUpdate();
    
    // Applica l'ordinamento iniziale se ci sono già elementi
    setTimeout(() => {
        if (document.querySelectorAll('.legend-item-dynamic').length > 0) {
            applySortToLegend();
        }
    }, 500);
    
    console.log('Sistema di ordinamento legenda inizializzato');
}

/**
 * API pubblica per controllare l'ordinamento
 */
window.LegendSorting = {
    // Applica ordinamento manuale
    sort: applySortToLegend,
    
    // Configura l'ordinamento
    configure: function(config) {
        Object.assign(SORT_CONFIG, config);
        if (SORT_CONFIG.enabled) {
            applySortToLegend();
        }
    },
    
    // Abilita/disabilita ordinamento automatico
    setAutoSort: function(enabled) {
        SORT_CONFIG.autoSort = enabled;
    },
    
    // Ottieni configurazione attuale
    getConfig: function() {
        return { ...SORT_CONFIG };
    }
};

// CSS per i controlli di ordinamento
const sortStyles = `
<style>
.sort-controls select:hover,
.sort-controls button:hover {
    border-color: #ff9900;
    background: #fff8f0;
}

.sort-controls select:focus,
.sort-controls button:focus {
    outline: none;
    border-color: #ff9900;
    box-shadow: 0 0 0 2px rgba(255, 153, 0, 0.2);
}

.sort-indicator {
    font-size: 12px;
    opacity: 0.8;
}

/* Animazione per gli elementi riordinati */
.legend-item-dynamic {
    transition: all 0.3s ease;
}

.legend-item-dynamic.sorting {
    transform: translateX(3px);
    background-color: rgba(255, 153, 0, 0.1);
}
</style>
`;

// Aggiunge gli stili alla pagina
if (!document.querySelector('#legend-sort-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'legend-sort-styles';
    styleElement.innerHTML = sortStyles;
    document.head.appendChild(styleElement);
}

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLegendSorting);
} else {
    initializeLegendSorting();
}