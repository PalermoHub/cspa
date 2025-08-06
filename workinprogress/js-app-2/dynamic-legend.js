// ===== FILE: dynamic-legend.js =====
function getCurrentViewportFeatures() {
    if (!map) return [];
    
    // Ottieni SOLO le feature visibili nella viewport corrente
    // e che corrispondono ai filtri applicati
    return map.queryRenderedFeatures({
        layers: ['catastale-base', 'catastale-thematic', 'catastale-hover'],
        filter: getCurrentFilter()
    });
}

function calculateViewportStats(features) {
    const stats = {
        total: features.length,
        categories: {},
        theme: currentTheme,
        themeType: themes[currentTheme]?.type || 'landuse'
    };

    // Contatore per verificare la coerenza
    let totalCounted = 0;

    // Per temi categorici (uso del suolo, copertura, rischi)
    if (stats.theme === 'landuse' || stats.themeType === 'categorical') {
        const property = stats.theme === 'landuse' ? 'class' : themes[stats.theme]?.property;
        const colorMap = stats.theme === 'landuse' ? landUseColors : getCategoricalColorMap(stats.theme);
        const labelMap = stats.theme === 'landuse' ? landUseLabels : getCategoricalLabelMap(stats.theme);
        
        features.forEach(feature => {
            const value = feature.properties[property] || '';
            const category = labelMap[value] || value || 'N/D';
            
            if (!stats.categories[category]) {
                stats.categories[category] = {
                    count: 0,
                    color: colorMap[value] || '#CCCCCC'
                };
            }
            stats.categories[category].count++;
            totalCounted++;
        });
    }
    // Per temi numerici (Jenks)
    else if (stats.themeType === 'jenks') {
        const themeConfig = themes[stats.theme];
        const jenksBreaks = themeConfig.jenksBreaks;
        const colors = themeConfig.colors;
        const labels = getJenksLabels(stats.theme);
        
        // Inizializza le categorie
        for (let i = 0; i < colors.length; i++) {
            const label = labels[i] || `Classe ${i+1}`;
            stats.categories[label] = {
                count: 0,
                color: colors[i]
            };
        }
        
        // Conta le feature per classe
        features.forEach(feature => {
            const value = parseFloat(feature.properties[themeConfig.property]) || 0;
            
            // Trova la classe corretta
            let classIndex = 0;
            for (let i = 1; i < jenksBreaks.length; i++) {
                if (value <= jenksBreaks[i]) {
                    classIndex = i - 1;
                    break;
                }
            }
            
            const label = labels[classIndex] || `Classe ${classIndex+1}`;
            if (stats.categories[label]) {
                stats.categories[label].count++;
                totalCounted++;
            }
        });
    }
    // Per nessun tema attivo (dovrebbe essere landuse)
    else {
        features.forEach(feature => {
            const value = feature.properties['class'] || '';
            const category = landUseLabels[value] || value || 'N/D';
            
            if (!stats.categories[category]) {
                stats.categories[category] = {
                    count: 0,
                    color: landUseColors[value] || '#CCCCCC'
                };
            }
            stats.categories[category].count++;
            totalCounted++;
        });
    }
    
    // Verifica coerenza (debug)
    if (totalCounted !== stats.total) {
        console.warn(`Conteggio incoerente! Totale: ${stats.total}, Contati: ${totalCounted}`);
    }
    
    return stats;
}

function updateDynamicLegend() {
    if (!map || !map.loaded()) {
        setTimeout(updateDynamicLegend, 500);
        return;
    }
    
    const features = getCurrentViewportFeatures();
    console.log(`Feature visibili: ${features.length}`);
    
    if (features.length === 0) {
        document.getElementById('dynamic-legend').classList.remove('visible');
        return;
    }
    
    const stats = calculateViewportStats(features);
    renderDynamicLegend(stats);
}

function renderDynamicLegend(stats) {
    const titleEl = document.getElementById('dynamic-legend-title');
    const statsEl = document.getElementById('dynamic-legend-stats');
    const itemsEl = document.getElementById('dynamic-legend-items');
    
    // Titolo basato sul tema corrente
    let titleText = 'Distribuzione vista corrente';
    if (stats.theme && themes[stats.theme]) {
        titleText = themes[stats.theme].name;
    }
    titleEl.textContent = titleText;
    
    // Statistiche generali
    statsEl.innerHTML = `Particelle visibili: <b>${stats.total}</b>`;
    
    // Elementi legenda
    let itemsHTML = '';
    const categories = Object.keys(stats.categories).sort();
    
    categories.forEach(category => {
        const item = stats.categories[category];
        const percentage = stats.total > 0 ? ((item.count / stats.total) * 100).toFixed(1) : '0.0';
        
        itemsHTML += `
            <div class="dynamic-legend-item">
                <div class="dynamic-legend-color" style="background-color:${item.color}"></div>
                <span class="dynamic-legend-label">${category}</span>
                <span class="dynamic-legend-count">${item.count}</span>
                <span class="dynamic-legend-percentage">${percentage}%</span>
            </div>
        `;
    });
    
    itemsEl.innerHTML = itemsHTML;
    document.getElementById('dynamic-legend').classList.add('visible');
}

function getCategoricalColorMap(themeKey) {
    switch(themeKey) {
        case 'land_cover': return landCoverColors;
        case 'flood_risk': return floodRiskColors;
        case 'landslide_risk': return landslideRiskColors;
        case 'coastal_erosion': return coastalErosionColors;
        case 'seismic_risk': return seismicRiskColors;
        default: return {};
    }
}

function getCategoricalLabelMap(themeKey) {
    switch(themeKey) {
        case 'land_cover': return landCoverLabels;
        case 'flood_risk': return floodRiskLabels;
        case 'landslide_risk': return landslideRiskLabels;
        case 'coastal_erosion': return coastalErosionLabels;
        case 'seismic_risk': return seismicRiskLabels;
        default: return {};
    }
}

// Throttle function (copiata da utils.js per sicurezza)
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    }
}

// Funzione per ottenere le feature visibili
function getCurrentViewportFeatures() {
    if (!map) return [];
    
    // Ottieni solo le feature visibili nella viewport corrente
    return map.queryRenderedFeatures({
        layers: ['catastale-base', 'catastale-thematic', 'catastale-hover'],
        filter: getCurrentFilter()
    });
}

// Funzione per ottenere il filtro corrente
function getCurrentFilter() {
    const filters = [];
    
    if (currentMandamentoFilter && currentMandamentoFilter !== '') {
        let dbMandamento = currentMandamentoFilter;
        if (currentMandamentoFilter === 'Castellammare') {
            dbMandamento = 'Castellamare';
        }
        filters.push(['==', ['get', 'Mandamento'], dbMandamento]);
    }
    
    if (currentFoglioFilter && currentFoglioFilter !== '') {
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

// Esponi funzioni globalmente per debug
window.initDynamicLegend = initDynamicLegend;
window.updateDynamicLegend = updateDynamicLegend;