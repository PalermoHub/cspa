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
                cursor: pointer; font-size: 10px;
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

console.log('🔧 Fix semplice categorici caricato - Nessuna dipendenza');