// ===== FILE: dynamic-legend.js =====
/**
 * Sistema Legenda Dinamica con Conteggio Particelle in Tempo Reale
 * Versione stabile con dimensioni fisse
 */

// Costanti per il sistema legenda dinamica
const TOTAL_PARTICELLE = 6249;
let legendUpdateTimer = null;
let currentViewportStats = {};
let isUpdatingLegend = false;
let lastUpdateHash = '';
let lastViewportState = { zoom: -1, center: [0, 0] };
let isFilterApplied = false; // Nuova variabile per tracciare lo stato dei filtri

/**
 * Inizializza il sistema di legenda dinamica
 */
function initializeDynamicLegend() {
    console.log('🎯 Inizializzazione sistema legenda dinamica...');
    
    if (!map || !map.isSourceLoaded('palermo_catastale')) {
        setTimeout(initializeDynamicLegend, 1000);
        return;
    }
    
    // Verifica il numero totale di particelle
    validateTotalParticles();
    
    // Aggiungi listener per aggiornamenti viewport
    setupViewportListeners();
    
    // Aggiorna legenda iniziale
    setTimeout(() => {
        updateDynamicLegend();
    }, 500);
    
    console.log('✅ Sistema legenda dinamica pronto');
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
            if (f.properties.fid) { // Usiamo fid per l'unicità
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
    // Aggiorna SOLO su eventi significativi
    map.on('moveend', () => {
        debounceUpdateLegend();
    });
    
    map.on('zoomend', () => {
        debounceUpdateLegend();
    });
    
    // Listener speciale per filtri applicati
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
    // Non aggiornare se è in corso un filtro
    if (isFilterApplied) return;
    
    clearTimeout(legendUpdateTimer);
    legendUpdateTimer = setTimeout(() => {
        updateDynamicLegend();
    }, 700); // Aumentato a 700ms per maggiore stabilità
}

/**
 * Crea hash per verificare se ci sono cambiamenti reali
 */
function createUpdateHash(stats) {
    return `${stats.total}-${Object.keys(stats.byCategory).length}-${currentTheme}-${currentMandamentoFilter}-${currentFoglioFilter}`;
}

/**
 * Aggiorna la legenda con conteggi dinamici
 */
function updateDynamicLegend() {
    // Previeni aggiornamenti multipli
    if (isUpdatingLegend) return;
    
    // Non aggiornare se la legenda non è visibile
    const legend = document.getElementById('legend');
    if (!legend || !legend.classList.contains('visible')) return;
    
    isUpdatingLegend = true;
    
    try {
        const stats = calculateViewportStatistics();
        
        // Aggiorna lastViewportState con lo stato attuale
        const currentCenter = map.getCenter();
        lastViewportState = {
            zoom: map.getZoom(),
            center: [currentCenter.lng, currentCenter.lat]
        };
        
        // Verifica se ci sono cambiamenti reali
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
        // Delay per evitare aggiornamenti troppo frequenti
        setTimeout(() => {
            isUpdatingLegend = false;
        }, 100);
    }
}

/**
 * Calcola statistiche delle particelle nel viewport corrente
 */
function calculateViewportStatistics() {
    // Verifica che la mappa sia pronta
    if (!map || !map.getLayer('catastale-base')) {
        return { total: 0, byCategory: {}, byTheme: {}, uniqueParticles: new Set() };
    }
    
    // Controlla se la vista è cambiata rispetto a lastViewportState
    const currentZoom = map.getZoom();
    const currentCenter = map.getCenter();
    if (currentZoom === lastViewportState.zoom && 
        currentCenter.lng === lastViewportState.center[0] && 
        currentCenter.lat === lastViewportState.center[1] &&
        Object.keys(currentViewportStats).length > 0) {
        return currentViewportStats; // Ritorna i dati precedenti se la vista non è cambiata
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
        // Usa fid come identificatore univoco
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
            
            // Statistiche per tema corrente se applicabile
            if (currentTheme && currentTheme !== 'landuse') {
                const theme = themes[currentTheme];
                if (theme && theme.property) {
                    const value = feature.properties[theme.property];
                    const category = getThemeCategory(value, theme);
                    if (!stats.byTheme[category]) {
                        stats.byTheme[category] = 0;
                    }
                    stats.byTheme[category]++;
                }
            }
        }
    });
    
    return stats;
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
 * Aggiorna legenda base con conteggi - VERSIONE STABILE
 */
function updateBaseLegendWithCounts(stats) {
    const legend = document.getElementById('legend');
    if (!legend || !legend.classList.contains('visible')) return;
    
    const items = document.getElementById('legend-items');
    if (!items) return;
    
    // Salva il contenuto esistente se non ci sono stats
    const existingTotal = items.querySelector('.legend-total-item');
    
    // Se esiste già il totale, aggiornalo senza ricreare tutto
    if (existingTotal) {
        updateTotalItem(existingTotal, stats.total);
        
        // Aggiorna solo i conteggi delle categorie esistenti
        const categoryItems = items.querySelectorAll('.legend-item-dynamic:not(.legend-total-item)');
        categoryItems.forEach(item => {
            const categoryName = item.querySelector('.category-name');
            if (categoryName) {
                const originalText = categoryName.textContent;
                // Trova la chiave corrispondente in landUseLabels
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
                
                // Aggiorna classe has-particles
                if (count > 0) {
                    item.classList.add('has-particles');
                } else {
                    item.classList.remove('has-particles');
                }
            }
        });
        
        return; // Esci senza ricreare tutto
    }
    
    // Prima volta: crea la struttura completa
    items.innerHTML = '';
    
    // Aggiungi totale in alto
    const totalItem = createTotalItem(stats.total);
    items.appendChild(totalItem);
    
    // Aggiungi separator
    items.appendChild(createSeparator());
    
    // Aggiungi categorie con conteggi
    for (const [className, color] of Object.entries(landUseColors)) {
        const label = landUseLabels[className];
        const count = stats.byCategory[className] || 0;
        const percentage = ((count / TOTAL_PARTICELLE) * 100).toFixed(1);
        
        const item = document.createElement('div');
        item.className = 'legend-item-dynamic';
        
        item.innerHTML = `
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
}

/**
 * Aggiorna legenda tematica con conteggi - VERSIONE STABILE
 */
function updateThematicLegendWithCounts(stats) {
    const legend = document.getElementById('legend');
    if (!legend || !legend.classList.contains('visible')) return;
    
    const items = document.getElementById('legend-items');
    if (!items) return;
    
    const theme = themes[currentTheme];
    if (!theme) return;
    
    // Verifica se esiste già il totale
    let totalItem = items.querySelector('.legend-total-item');
    
    if (!totalItem) {
        // Crea e inserisci il totale solo se non esiste
        totalItem = createTotalItem(stats.total);
        items.insertBefore(totalItem, items.firstChild);
        
        const separator = createSeparator();
        items.insertBefore(separator, totalItem.nextSibling);
    } else {
        // Aggiorna solo il totale esistente
        updateTotalItem(totalItem, stats.total);
    }
    
    // Aggiorna solo i conteggi negli items esistenti
    const legendItems = items.querySelectorAll('.legend-item:not(.legend-total-item)');
    
    legendItems.forEach((item, index) => {
        // Verifica se l'item ha già la struttura dinamica
        if (!item.querySelector('.legend-label-dynamic')) {
            // Converti l'item esistente in formato dinamico
            const labelElement = item.querySelector('.legend-label');
            if (labelElement) {
                const originalText = labelElement.textContent;
                const colorElement = item.querySelector('.legend-color');
                const colorStyle = colorElement ? colorElement.style.backgroundColor : '';
                
                item.className = 'legend-item-dynamic';
                item.innerHTML = `
                    <div class="legend-color" style="background-color: ${colorStyle}"></div>
                    <span class="legend-label-dynamic">
                        <span class="category-name">${originalText}</span>
                        <span class="category-stats">0 (0.0%)</span>
                    </span>
                `;
            }
        }
        
        // Aggiorna i conteggi
        updateThematicItemCount(item, index, theme, stats);
    });
}

/**
 * Aggiorna conteggio per item tematico
 */
function updateThematicItemCount(item, index, theme, stats) {
    let count = 0;
    
    // Calcola conteggio basato sul tipo di tema
    if (theme.type === 'jenks') {
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
            
            if (fid && !uniqueInClass.has(fid) && 
                isInJenksClass(value, index, theme.jenksBreaks)) {
                uniqueInClass.add(fid);
                count++;
            }
        });
    }
    
    // Aggiorna solo il conteggio
    const percentage = ((count / TOTAL_PARTICELLE) * 100).toFixed(1);
    const statsElement = item.querySelector('.category-stats');
    if (statsElement) {
        statsElement.textContent = `${formatNumber(count)} (${percentage}%)`;
    }
    
    // Aggiorna classe has-particles
    if (count > 0) {
        item.classList.add('has-particles');
    } else {
        item.classList.remove('has-particles');
    }
}

/**
 * Verifica se un valore è nella classe Jenks specificata
 */
function isInJenksClass(value, classIndex, breaks) {
    const numValue = parseFloat(value) || 0;
    const minVal = breaks[classIndex] || 0;
    const maxVal = breaks[classIndex + 1] || Infinity;
    
    return numValue >= minVal && numValue < maxVal;
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
 * Override SICURO delle funzioni legenda esistenti
 */
function safeOverrideLegendFunctions() {
    // Override showBaseLegenda
    const originalShowBaseLegenda = window.showBaseLegenda;
    if (originalShowBaseLegenda && !originalShowBaseLegenda._overridden) {
        window.showBaseLegenda = function() {
            originalShowBaseLegenda.apply(this, arguments);
            // Reset hash per forzare aggiornamento
            lastUpdateHash = '';
            setTimeout(() => {
                if (!isUpdatingLegend) {
                    updateDynamicLegend();
                }
            }, 200);
        };
        window.showBaseLegenda._overridden = true;
    }
    
    // Override showLegend
    const originalShowLegend = window.showLegend;
    if (originalShowLegend && !originalShowLegend._overridden) {
        window.showLegend = function(theme, range) {
            originalShowLegend.apply(this, arguments);
            lastUpdateHash = '';
            setTimeout(() => {
                if (!isUpdatingLegend) {
                    updateDynamicLegend();
                }
            }, 200);
        };
        window.showLegend._overridden = true;
    }
    
    // Override showJenksLegend
    const originalShowJenksLegend = window.showJenksLegend;
    if (originalShowJenksLegend && !originalShowJenksLegend._overridden) {
        window.showJenksLegend = function(theme) {
            originalShowJenksLegend.apply(this, arguments);
            lastUpdateHash = '';
            setTimeout(() => {
                if (!isUpdatingLegend) {
                    updateDynamicLegend();
                }
            }, 200);
        };
        window.showJenksLegend._overridden = true;
    }
}

/**
 * Funzione per forzare l'aggiornamento della legenda
 */
function forceLegendUpdate() {
    // Resetta lo stato della vista per forzare un nuovo calcolo
    lastViewportState = { zoom: -1, center: [0,0] };
    lastUpdateHash = ''; // Invalida l'hash
    updateDynamicLegend();
}

// Inizializzazione con timing controllato
document.addEventListener('DOMContentLoaded', () => {
    // Attendi che tutti i moduli siano caricati
    setTimeout(() => {
        initializeDynamicLegend();
        safeOverrideLegendFunctions();
    }, 3000);
});

// Esporta funzioni per debug
window.updateDynamicLegend = updateDynamicLegend;
window.getCurrentViewportStats = () => currentViewportStats;
window.validateTotalParticles = validateTotalParticles;
window.forceLegendUpdate = forceLegendUpdate;

console.log('✅ dynamic-legend.js caricato - Versione Stabile');