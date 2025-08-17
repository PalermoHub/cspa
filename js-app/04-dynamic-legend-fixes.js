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
        
        // PATCH 1: getCategoricalCategory migliorata
        window.getCategoricalCategory_FIXED = function(feature, theme) {
            if (!feature || !feature.properties || !theme) {
                return 'N/D';
            }
            
            const rawValue = feature.properties[theme.property];
            const themeProperty = theme.property;
            
            // Logica basata sulla proprietà invece del tema corrente
            switch (themeProperty) {
                case 'Ri alluvione': // flood_risk
                    const floodVal = (rawValue || '').toString().toLowerCase();
                    return floodVal === 'alto' ? 'alto' : 'no';
                
                case 'rischio di frana': // landslide_risk  
                    return 'none';
                
                case 'rischio di erosione costiera': // coastal_erosion
                    return 'none';
                
                case 'rischio sismico': // seismic_risk
                    return 'low';
                
                case 'copertura del suolo': // land_cover
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
                            const fid = feature.properties.fid;
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

