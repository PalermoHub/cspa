// ===== FILE: 15-charts.js =====
/**
 * Sistema Grafici Dinamici a Pile - Tempo Reale
 * Versione 2.2 - Grafici interattivi con filtri cliccabili + allineamento assi X/Y
 */

// Variabili globali per il sistema grafici
let chartsWindow = null;
let chartsEnabled = false;
let chartInstances = {};
let chartsUpdateTimer = null;
let lastChartsUpdateHash = '';
let chartsData = {};
let isChartsUpdating = false;

// NUOVO: Variabile per il filtro categoria attivo
let activeChartFilter = null;

// NUOVO: Mapping delle icone per i temi (corrispondenti al menu di selezione)
const themeIcons = {
    'superficie': 'fas fa-expand-arrows-alt',
    'piano': 'fas fa-layer-group', 
    'vani': 'fas fa-door-open',
    'rendita': 'fas fa-coins',
    'consistenza': 'fas fa-ruler-combined',
    'zona_censuaria': 'fas fa-map-marked-alt',
    'categoria': 'fas fa-tags',
    'classe': 'fas fa-star',
    'landuse': 'fas fa-map',
    // Aggiungi tutte le altre icone dal tuo menu di selezione
    'default': 'fas fa-chart-bar'
};

/**
 * Classe per il controllo attivazione grafici
 */
class ChartsControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        
        const button = document.createElement('button');
        button.className = 'maplibre-custom-control maplibre-charts-control';
        button.type = 'button';
        button.innerHTML = '<i class="fas fa-chart-bar"></i>';
        button.title = 'Attiva/Disattiva Grafici Dinamici';
        button.addEventListener('click', () => {
            toggleChartsSystem();
        });
        
        this._container.appendChild(button);
        return this._container;
    }
    
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

/**
 * NUOVO: Funzione per estrarre automaticamente le icone dal menu di selezione
 */
function extractThemeIconsFromSelect() {
    const territorialSelect = document.getElementById('territorial-select');
    if (!territorialSelect) return;
    
    const options = territorialSelect.querySelectorAll('option');
    options.forEach(option => {
        const value = option.value;
        const iconMatch = option.innerHTML.match(/<i class="([^"]+)"/);
        
        if (iconMatch && value && value !== 'landuse') {
            themeIcons[value] = iconMatch[1];
            console.log(`🎨 Icona mappata: ${value} -> ${iconMatch[1]}`);
        }
    });
}

/**
 * Inizializza il sistema grafici
 */
function initializeChartsSystem() {
    console.log('📊 Inizializzazione sistema grafici dinamici...');
    
    // NUOVO: Estrai icone dal menu di selezione
    setTimeout(() => {
        extractThemeIconsFromSelect();
    }, 1000);
    
    // Crea la finestra grafici (inizialmente nascosta)
    createChartsWindow();
    
    // Setup event listeners per aggiornamenti automatici
    setupChartsEventListeners();
    
    console.log('✅ Sistema grafici dinamici pronto');
}

/**
 * Crea la finestra flottante per i grafici
 */
function createChartsWindow() {
    // Rimuovi finestra esistente se presente
    const existingWindow = document.getElementById('charts-window');
    if (existingWindow) {
        existingWindow.remove();
    }
    
    chartsWindow = document.createElement('div');
    chartsWindow.id = 'charts-window';
    chartsWindow.className = 'charts-window';
    chartsWindow.innerHTML = `
        <div class="charts-header">
            <div class="charts-title">
                <i class="fas fa-chart-bar"></i>
                <span>Grafici Dinamici</span>
                <div class="charts-status">
                    <span class="status-indicator"></span>
                    <span class="status-text">Tempo Reale</span>
                </div>
            </div>
            <div class="charts-controls">
                <button class="charts-minimize" onclick="minimizeChartsWindow()" title="Minimizza">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="charts-close" onclick="toggleChartsSystem()" title="Chiudi">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        
        <div class="charts-content">
            <!-- NUOVO: Indicatore filtro attivo -->
            <div class="active-filter-indicator" id="active-filter-indicator" style="display: none;">
                <div class="filter-info">
                    <i class="fas fa-filter"></i>
                    <span>Filtro attivo: <strong id="active-filter-text"></strong></span>
                    <button class="clear-filter-btn" onclick="clearChartFilter()" title="Rimuovi filtro">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="charts-grid">
                <!-- Grafico Uso del Suolo - CLICCABILE -->
                <div class="chart-container">
                    <div class="chart-header">
                        <h4><i class="fas fa-map"></i> Uso del Suolo</h4>
                        <div class="chart-stats">
                            <span class="total-particles">0</span> particelle
                            <small class="chart-help">Clicca per filtrare</small>
                        </div>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="landuse-chart"></canvas>
                    </div>
                </div>
                
                <!-- Grafico Tema Corrente con ICONA -->
                <div class="chart-container" id="theme-chart-container">
                    <div class="chart-header">
                        <h4>
                            <i id="theme-chart-icon" class="fas fa-analytics"></i> 
                            <span id="theme-chart-title">Indicatore Tematico</span>
                        </h4>
                        <div class="chart-stats">
                            <span class="theme-total-particles">0</span> particelle
                        </div>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="theme-chart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Informazioni aggiuntive -->
            <div class="charts-info">
                <div class="info-item">
                    <span class="info-label">Area Visualizzata:</span>
                    <span class="info-value" id="viewport-area">Calcolando...</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Zoom Corrente:</span>
                    <span class="info-value" id="current-zoom">14</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Filtri Attivi:</span>
                    <span class="info-value" id="active-filters">Nessuno</span>
                </div>
            </div>
        </div>
        
        <!-- Resize handle -->
        <div class="charts-resize-handle"></div>
    `;
    
    document.body.appendChild(chartsWindow);
    
    // Inizializza ridimensionamento
    initializeChartsResize();
    
    // Rendi la finestra trascinabile
    makeChartsDraggable();
}

/**
 * Toggle del sistema grafici
 */
function toggleChartsSystem() {
    chartsEnabled = !chartsEnabled;
    
    const button = document.querySelector('.maplibre-charts-control');
    const window = document.getElementById('charts-window');
    
    if (chartsEnabled) {
        // Attiva grafici
        button.classList.add('active');
        window.classList.add('visible');
        
        // Inizializza grafici
        initializeCharts();
        
        // Prima visualizzazione
        setTimeout(() => {
            updateChartsData();
        }, 500);
        
        console.log('📊 Grafici attivati');
    } else {
        // Disattiva grafici
        button.classList.remove('active');
        window.classList.remove('visible');
        
        // Rimuovi eventuali filtri
        clearChartFilter();
        
        // Distruggi istanze grafici per liberare memoria
        destroyCharts();
        
        console.log('📊 Grafici disattivati');
    }
}

/**
 * NUOVO: Gestisce il click su una categoria del grafico uso del suolo
 */
function handleLanduseChartClick(chart, elements) {
    if (elements.length === 0) return;
    
    const elementIndex = elements[0].index;
    const clickedLabel = chart.data.labels[elementIndex];
    
    // Trova la chiave originale della categoria
    let clickedCategory = null;
    for (const [key, label] of Object.entries(landUseLabels)) {
        if (label === clickedLabel) {
            clickedCategory = key;
            break;
        }
    }
    
    if (!clickedCategory) {
        // Se non trova la chiave, usa il label direttamente
        clickedCategory = clickedLabel;
    }
    
    // Se la stessa categoria è già attiva, rimuovi il filtro
    if (activeChartFilter === clickedCategory) {
        clearChartFilter();
        return;
    }
    
    // Applica nuovo filtro
    applyChartFilter(clickedCategory, clickedLabel);
}

/**
 * NUOVO: Applica filtro categoria alla mappa
 */
function applyChartFilter(category, displayLabel) {
    activeChartFilter = category;
    
    // Aggiorna il layer della mappa per mostrare solo la categoria selezionata
    if (map && map.getLayer('catastale-base')) {
        map.setPaintProperty('catastale-base', 'fill-opacity', [
            'case',
            ['==', ['get', 'class'], category],
            0.75,  // Opacità normale per categoria selezionata
            0.15   // Opacità ridotta per altre categorie
        ]);
        
        // Aggiorna anche il colore per evidenziare la selezione
        const categoryColor = landUseColors[category] || 'rgba(200,200,200,0.7)';
        map.setPaintProperty('catastale-base', 'fill-color', [
            'case',
            ['==', ['get', 'class'], category],
            categoryColor,
            'rgba(200,200,200,0.3)'  // Grigio chiaro per categorie non selezionate
        ]);
    }
    
    // Mostra indicatore filtro attivo
    showActiveFilterIndicator(displayLabel);
    
    // Aggiorna grafici
    setTimeout(() => {
        updateChartsData();
    }, 100);
    
    console.log('📊 Filtro categoria applicato:', displayLabel);
}

/**
 * NUOVO: Rimuove filtro categoria attivo
 */
function clearChartFilter() {
    if (!activeChartFilter) return;
    
    activeChartFilter = null;
    
    // Ripristina visualizzazione normale della mappa
    if (map && map.getLayer('catastale-base')) {
        // Ripristina paint expression originale
        map.setPaintProperty('catastale-base', 'fill-color', [
            'match',
            ['get', 'class'],
            'servizi', landUseColors.servizi,
            'military', landUseColors.military,
            'park', landUseColors.park,
            'pedestrian', landUseColors.pedestrian,
            'protected', landUseColors.protected,
            'recreation', landUseColors.recreation,
            'religious', landUseColors.religious,
            'residential', landUseColors.residential,
            'education', landUseColors.education,
            'medical', landUseColors.medical,
            'transportation', landUseColors.transportation,
            landUseColors['']
        ]);
        
        map.setPaintProperty('catastale-base', 'fill-opacity', 0.75);
    }
    
    // Nascondi indicatore filtro
    hideActiveFilterIndicator();
    
    // Aggiorna grafici
    setTimeout(() => {
        updateChartsData();
    }, 100);
    
    console.log('📊 Filtro categoria rimosso');
}

/**
 * NUOVO: Mostra indicatore filtro attivo
 */
function showActiveFilterIndicator(filterText) {
    const indicator = document.getElementById('active-filter-indicator');
    const text = document.getElementById('active-filter-text');
    
    if (indicator && text) {
        text.textContent = filterText;
        indicator.style.display = 'block';
    }
}

/**
 * NUOVO: Nascondi indicatore filtro attivo
 */
function hideActiveFilterIndicator() {
    const indicator = document.getElementById('active-filter-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

/**
 * Inizializza le istanze dei grafici - CON CLICK HANDLER E ASSI ALLINEATI
 */
function initializeCharts() {
    // Distruggi grafici esistenti
    destroyCharts();
    
    // Configurazione base comune per entrambi i grafici
    const baseConfig = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        animation: {
            duration: 300
        }
    };
    
    // Inizializza grafico uso del suolo con click handler
    const landuseCtx = document.getElementById('landuse-chart');
    if (landuseCtx) {
        chartInstances.landuse = new Chart(landuseCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Particelle',
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1
                }]
            },
            options: {
                ...baseConfig,
                onClick: (event, elements) => {
                    handleLanduseChartClick(chartInstances.landuse, elements);
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        ticks: {
                            precision: 0,
                            maxTicksLimit: 6
                        },
                        grid: {
                            drawBorder: true,
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    ...baseConfig.plugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${value} (${percentage}%) - Clicca per filtrare`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Inizializza grafico tema corrente (con stesse configurazioni di base)
    const themeCtx = document.getElementById('theme-chart');
    if (themeCtx) {
        chartInstances.theme = new Chart(themeCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Particelle',
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1
                }]
            },
            options: {
                ...baseConfig,
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        ticks: {
                            precision: 0,
                            maxTicksLimit: 6
                        },
                        grid: {
                            drawBorder: true,
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    ...baseConfig.plugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y || 0;
                                return `Particelle: ${value}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    console.log('📊 Istanze grafici create (con interattività e allineamento)');
}

/**
 * Distrugge le istanze dei grafici
 */
function destroyCharts() {
    Object.values(chartInstances).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    chartInstances = {};
}

/**
 * Setup event listeners per aggiornamenti automatici
 */
function setupChartsEventListeners() {
    if (!map) return;
    
    // Aggiorna grafici quando la mappa si muove
    map.on('moveend', () => {
        if (chartsEnabled) {
            debounceChartsUpdate();
        }
    });
    
    map.on('zoomend', () => {
        if (chartsEnabled) {
            debounceChartsUpdate();
            updateZoomInfo();
        }
    });
    
    // Aggiorna quando cambiano i filtri
    map.on('sourcedata', (e) => {
        if (e.sourceId === 'palermo_catastale' && e.isSourceLoaded && chartsEnabled) {
            debounceChartsUpdate();
        }
    });
}

/**
 * Debounce per ottimizzare performance
 */
function debounceChartsUpdate() {
    clearTimeout(chartsUpdateTimer);
    chartsUpdateTimer = setTimeout(() => {
        updateChartsData();
    }, 800);
}

/**
 * MODIFICATA: Calcola dati per i grafici dalle particelle visibili (con filtro)
 */
function calculateChartsData() {
    if (!map || !map.getLayer('catastale-base')) {
        return { landuse: {}, theme: {}, total: 0 };
    }
    
    // Ottieni features renderizzate nel viewport
    const features = map.queryRenderedFeatures(undefined, {
        layers: ['catastale-base', 'catastale-thematic'].filter(l => {
            try {
                return map.getLayer(l) !== undefined;
            } catch {
                return false;
            }
        })
    });
    
    const data = {
        landuse: {},
        theme: {},
        total: 0,
        uniqueParticles: new Set()
    };
    
    features.forEach(feature => {
        const fid = feature.properties.fid;
        
        if (fid && !data.uniqueParticles.has(fid)) {
            data.uniqueParticles.add(fid);
            
            // NUOVO: Se c'è un filtro attivo, considera solo le particelle filtrate per il secondo grafico
            const landUse = feature.properties.class || 'N/D';
            const isFiltered = activeChartFilter && landUse !== activeChartFilter;
            
            // Per il primo grafico (uso del suolo), conta sempre tutto
            if (!data.landuse[landUse]) {
                data.landuse[landUse] = 0;
            }
            data.landuse[landUse]++;
            data.total++;
            
            // Per il secondo grafico, considera solo se non c'è filtro o se passa il filtro
            if (!isFiltered) {
                if (currentTheme && currentTheme !== 'landuse') {
                    const theme = themes[currentTheme];
                    if (theme) {
                        const value = feature.properties[theme.property];
                        let category;
                        
                        if (theme.type === 'categorical') {
                            category = value || 'N/D';
                        } else if (theme.type === 'jenks') {
                            category = getJenksClassForValue(value, theme);
                        } else {
                            category = getRangeClassForValue(value, theme);
                        }
                        
                        if (!data.theme[category]) {
                            data.theme[category] = 0;
                        }
                        data.theme[category]++;
                    }
                }
            }
        }
    });
    
    return data;
}

/**
 * Ottiene la classe Jenks per un valore
 */
function getJenksClassForValue(value, theme) {
    if (value === null || value === undefined || value === '') {
        return 'Nessun dato';
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        return 'Nessun dato';
    }
    
    if (!theme.jenksBreaks) return 'N/D';
    
    for (let i = theme.jenksBreaks.length - 1; i >= 0; i--) {
        if (numValue >= theme.jenksBreaks[i]) {
            const labels = getJenksLabels(currentTheme);
            return labels[i] || `Classe ${i + 1}`;
        }
    }
    
    return 'Nessun dato';
}

/**
 * Ottiene la classe range per un valore
 */
function getRangeClassForValue(value, theme) {
    if (value === null || value === undefined || value === '') {
        return 'Nessun dato';
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        return 'Nessun dato';
    }
    
    // Usa range standard o calcolato
    const range = calculateDynamicRange(currentTheme) || getStaticRange(currentTheme) || { min: 0, max: 100 };
    const step = (range.max - range.min) / 5; // 5 classi
    
    for (let i = 4; i >= 0; i--) {
        const minVal = range.min + (step * i);
        const maxVal = i === 4 ? range.max : range.min + (step * (i + 1));
        
        if (numValue >= minVal && numValue <= maxVal) {
            return `${Math.round(minVal)}-${Math.round(maxVal)} ${theme.unit || ''}`;
        }
    }
    
    return 'Fuori range';
}

/**
 * MIGLIORATA: Sincronizza le scale X e Y dei grafici per allineamento completo
 */
function synchronizeChartScales() {
    const landuseChart = chartInstances.landuse;
    const themeChart = chartInstances.theme;
    
    if (!landuseChart || !themeChart) return;
    
    // 1. ALLINEAMENTO ASSE Y (esistente migliorato)
    const landuseMax = Math.max(...(landuseChart.data.datasets[0].data || [0]));
    const themeMax = Math.max(...(themeChart.data.datasets[0].data || [0]));
    const globalMax = Math.max(landuseMax, themeMax);
    
    // Aggiungi padding proporzionale
    const maxWithPadding = Math.ceil(globalMax * 1.1) || 10; // Minimo 10
    
    // 2. NUOVO: ALLINEAMENTO ASSE X
    const landuseLabelsCount = landuseChart.data.labels.length;
    const themeLabelsCount = themeChart.data.labels.length;
    const maxLabelsCount = Math.max(landuseLabelsCount, themeLabelsCount);
    
    // Calcola lunghezza massima etichette
    const getAllLabels = [...landuseChart.data.labels, ...themeChart.data.labels];
    const maxLabelLength = getAllLabels.length > 0 ? 
        Math.max(...getAllLabels.map(label => String(label).length)) : 0;
    
    // Determina configurazione ottimale per assi X
    let optimalRotation = 0;
    let fontSize = 10;
    let maxTicksLimit = undefined;
    
    if (maxLabelsCount > 10 || maxLabelLength > 15) {
        optimalRotation = 45;
        fontSize = 9;
        maxTicksLimit = 10;
    } else if (maxLabelsCount > 6 || maxLabelLength > 10) {
        optimalRotation = 30;
        fontSize = 9;
        maxTicksLimit = 8;
    } else if (maxLabelsCount > 4 || maxLabelLength > 6) {
        optimalRotation = 15;
        fontSize = 10;
    }
    
    // Configurazione unificata per entrambi gli assi X
    const xAxisConfig = {
        ticks: {
            maxRotation: optimalRotation,
            minRotation: optimalRotation,
            font: {
                size: fontSize
            },
            ...(maxTicksLimit && { maxTicksLimit })
        },
        grid: {
            display: false
        }
    };
    
    // Configurazione unificata per entrambi gli assi Y
    const yAxisConfig = {
        beginAtZero: true,
        min: 0,
        max: maxWithPadding,
        ticks: {
            precision: 0,
            maxTicksLimit: 6,
            stepSize: Math.ceil(maxWithPadding / 6)
        },
        grid: {
            drawBorder: true,
            color: 'rgba(0,0,0,0.1)'
        }
    };
    
    // Applica configurazioni sincronizzate
    let needsUpdate = false;
    
    // Aggiorna asse Y landuse chart
    if (JSON.stringify(landuseChart.options.scales.y) !== JSON.stringify(yAxisConfig)) {
        landuseChart.options.scales.y = yAxisConfig;
        needsUpdate = true;
    }
    
    // Aggiorna asse X landuse chart
    if (JSON.stringify(landuseChart.options.scales.x) !== JSON.stringify(xAxisConfig)) {
        landuseChart.options.scales.x = xAxisConfig;
        needsUpdate = true;
    }
    
    // Aggiorna asse Y theme chart
    if (JSON.stringify(themeChart.options.scales.y) !== JSON.stringify(yAxisConfig)) {
        themeChart.options.scales.y = yAxisConfig;
        needsUpdate = true;
    }
    
    // Aggiorna asse X theme chart
    if (JSON.stringify(themeChart.options.scales.x) !== JSON.stringify(xAxisConfig)) {
        themeChart.options.scales.x = xAxisConfig;
        needsUpdate = true;
    }
    
    // Update charts se necessario
    if (needsUpdate) {
        landuseChart.update('none');
        themeChart.update('none');
        
        console.log(`📏 Assi sincronizzati: Y max=${maxWithPadding}, X rotation=${optimalRotation}°, fontSize=${fontSize}`);
    }
}

/**
 * PRINCIPALE: Aggiorna dati grafici con sincronizzazione assi
 */
function updateChartsData() {
    if (!chartsEnabled || isChartsUpdating) return;
    
    isChartsUpdating = true;
    
    try {
        // Calcola nuovi dati
        const newData = calculateChartsData();
        
        // Crea hash per verificare cambiamenti
        const newHash = JSON.stringify(newData);
        if (newHash === lastChartsUpdateHash) {
            isChartsUpdating = false;
            return;
        }
        lastChartsUpdateHash = newHash;
        
        chartsData = newData;
        
        // Aggiorna grafico uso del suolo
        updateLanduseChart();
        
        // Aggiorna grafico tema corrente
        updateThemeChart();
        
        // IMPORTANTE: Sincronizza gli assi dopo aver aggiornato i dati
        synchronizeChartScales();
        
        // Aggiorna informazioni
        updateChartsInfo();
        
        // Aggiorna status
        updateChartsStatus();
        
        console.log('📊 Grafici aggiornati (sincronizzati) -', newData.total, 'particelle');
        
    } catch (error) {
        console.error('⚠ Errore aggiornamento grafici:', error);
    } finally {
        isChartsUpdating = false;
    }
}

/**
 * MODIFICATA: Aggiorna grafico uso del suolo evidenziando filtro attivo
 */
function updateLanduseChart() {
    const chart = chartInstances.landuse;
    if (!chart || !chartsData.landuse) return;
    
    const labels = [];
    const data = [];
    const colors = [];
    
    // Ordina per valore decrescente per migliore visualizzazione
    const sortedEntries = Object.entries(chartsData.landuse)
        .sort(([,a], [,b]) => b - a);
    
    sortedEntries.forEach(([landUse, count]) => {
        const label = landUseLabels[landUse] || landUse;
        let color = landUseColors[landUse] || 'rgba(200,200,200,0.7)';
        
        // NUOVO: Evidenzia categoria filtrata
        if (activeChartFilter === landUse) {
            // Rendi più brillante la categoria selezionata
            color = color.replace('0.7)', '1)').replace('0.75)', '1)');
        } else if (activeChartFilter) {
            // Rendi più tenue le altre categorie
            color = color.replace('0.7)', '0.3)').replace('0.75)', '0.3)');
        }
        
        labels.push(label);
        data.push(count);
        colors.push(color);
    });
    
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = colors;
    chart.data.datasets[0].borderColor = colors.map(color => 
        color.replace('0.7)', '1)').replace('0.75)', '1)').replace('0.3)', '0.8)')
    );
    chart.update('none');
    
    // Aggiorna contatore
    const totalElement = document.querySelector('.total-particles');
    if (totalElement) {
        totalElement.textContent = chartsData.total;
    }
}

/**
 * CORRETTA: Aggiorna grafico tema corrente con icona e nome corretto
 */
function updateThemeChart() {
    const chart = chartInstances.theme;
    const container = document.getElementById('theme-chart-container');
    
    if (!chart) return;
    
    // Se non c'è tema o è landuse, nascondi
    if (!currentTheme || currentTheme === 'landuse') {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    
    // CORRETTO: Aggiorna titolo e icona dal tema
    const theme = themes[currentTheme];
    const titleElement = document.getElementById('theme-chart-title');
    const iconElement = document.getElementById('theme-chart-icon');
    
    if (titleElement && theme) {
        // Usa il nome dal tema (stesso del menu di selezione)
        titleElement.textContent = theme.name || currentTheme;
    }
    
    // CORRETTO: Aggiorna icona del tema
    if (iconElement) {
        // Cerca prima nel mapping delle icone, poi usa quella di default
        const themeIcon = themeIcons[currentTheme] || themeIcons['default'] || 'fas fa-chart-bar';
        iconElement.className = themeIcon;
        console.log(`🎨 Icona aggiornata per tema ${currentTheme}: ${themeIcon}`);
    }
    
    // Se non ci sono dati tema, mostra messaggio
    if (!chartsData.theme || Object.keys(chartsData.theme).length === 0) {
        chart.data.labels = ['Nessun dato'];
        chart.data.datasets[0].data = [0];
        chart.data.datasets[0].backgroundColor = ['#e5e7eb'];
        chart.data.datasets[0].borderColor = ['#d1d5db'];
        chart.update('none');
        
        const themeTotalElement = document.querySelector('.theme-total-particles');
        if (themeTotalElement) {
            themeTotalElement.textContent = '0';
        }
        return;
    }
    
    const labels = [];
    const data = [];
    const colors = [];
    
    // Ordina per valore decrescente
    const sortedEntries = Object.entries(chartsData.theme)
        .sort(([,a], [,b]) => b - a);
    
    sortedEntries.forEach(([category, count]) => {
        labels.push(category);
        data.push(count);
        
        // Usa colori del tema se disponibili
        if (theme && theme.colors) {
            const colorIndex = labels.length - 1;
            colors.push(theme.colors[colorIndex % theme.colors.length] || '#ff9900');
        } else {
            colors.push('#ff9900');
        }
    });
    
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = colors;
    chart.data.datasets[0].borderColor = colors;
    chart.update('none');
    
    // Aggiorna contatore tema
    const themeTotal = Object.values(chartsData.theme).reduce((a, b) => a + b, 0);
    const themeTotalElement = document.querySelector('.theme-total-particles');
    if (themeTotalElement) {
        themeTotalElement.textContent = themeTotal;
    }
}

/**
 * Aggiorna informazioni generali
 */
function updateChartsInfo() {
    // Aggiorna zoom
    updateZoomInfo();
    
    // Aggiorna area viewport (approssimativa)
    const bounds = map.getBounds();
    const area = turf.area(turf.bboxPolygon([
        bounds.getWest(), bounds.getSouth(),
        bounds.getEast(), bounds.getNorth()
    ]));
    
    const areaElement = document.getElementById('viewport-area');
    if (areaElement) {
        if (area > 1000000) {
            areaElement.textContent = `${(area / 1000000).toFixed(1)} km²`;
        } else {
            areaElement.textContent = `${Math.round(area)} m²`;
        }
    }
    
    // MODIFICATA: Aggiorna filtri attivi includendo filtro grafico
    const filtersElement = document.getElementById('active-filters');
    if (filtersElement) {
        const activeFilters = [];
        
        if (activeChartFilter) {
            const filterLabel = landUseLabels[activeChartFilter] || activeChartFilter;
            activeFilters.push(`Grafico: ${filterLabel}`);
        }
        if (currentMandamentoFilter) {
            activeFilters.push(`Mandamento: ${currentMandamentoFilter}`);
        }
        if (currentFoglioFilter) {
            activeFilters.push(`Foglio: ${currentFoglioFilter}`);
        }
        if (window.legendFilterState && window.legendFilterState.activeCategories.size > 0) {
            activeFilters.push(`Legenda: ${window.legendFilterState.activeCategories.size}`);
        }
        
        filtersElement.textContent = activeFilters.length > 0 ? activeFilters.join(', ') : 'Nessuno';
    }
}

/**
 * Aggiorna informazioni zoom
 */
function updateZoomInfo() {
    const zoomElement = document.getElementById('current-zoom');
    if (zoomElement && map) {
        zoomElement.textContent = map.getZoom().toFixed(1);
    }
}

/**
 * Aggiorna status indicatori
 */
function updateChartsStatus() {
    const indicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    
    if (indicator && statusText) {
        indicator.classList.add('active');
        statusText.textContent = 'Aggiornato';
        
        // Reset dopo 2 secondi
        setTimeout(() => {
            indicator.classList.remove('active');
            statusText.textContent = 'Tempo Reale';
        }, 2000);
    }
}

/**
 * Inizializza ridimensionamento finestra grafici
 */
function initializeChartsResize() {
    const resizeHandle = document.querySelector('.charts-resize-handle');
    const chartsWindow = document.getElementById('charts-window');
    
    if (!resizeHandle || !chartsWindow) return;
    
    let isResizing = false;
    let startX, startY, startWidth, startHeight;
    
    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(chartsWindow).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(chartsWindow).height, 10);
        
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
        e.preventDefault();
    });
    
    function handleResize(e) {
        if (!isResizing) return;
        
        const width = startWidth + e.clientX - startX;
        const height = startHeight + e.clientY - startY;
        
        // Limiti minimi e massimi
        const minWidth = 400;
        const minHeight = 350; // Aumentato per l'indicatore filtro
        const maxWidth = screen.availWidth;
        const maxHeight = screen.availHeight;
        
        const finalWidth = Math.max(minWidth, Math.min(width, maxWidth));
        const finalHeight = Math.max(minHeight, Math.min(height, maxHeight));
        
        chartsWindow.style.width = finalWidth + 'px';
        chartsWindow.style.height = finalHeight + 'px';
        
        // Forza ridisegno grafici con sincronizzazione
        Object.values(chartInstances).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
        
        // Risincronizza gli assi dopo il resize
        setTimeout(() => {
            synchronizeChartScales();
        }, 100);
    }
    
    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
    }
}

/**
 * Rende la finestra grafici trascinabile
 */
function makeChartsDraggable() {
    const header = document.querySelector('.charts-header');
    const chartsWindow = document.getElementById('charts-window');
    
    if (!header || !chartsWindow) return;
    
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    
    header.addEventListener('mousedown', (e) => {
        // Non iniziare drag se si clicca sui pulsanti
        if (e.target.closest('.charts-controls')) return;
        
        isDragging = true;
        initialX = e.clientX - chartsWindow.offsetLeft;
        initialY = e.clientY - chartsWindow.offsetTop;
        
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
        e.preventDefault();
    });
    
    function handleDrag(e) {
        if (!isDragging) return;
        
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        
        // Limiti permissivi per multi-monitor
        const minVisibleArea = 50;
        const maxX = screen.availWidth - minVisibleArea;
        const maxY = screen.availHeight - minVisibleArea;
        const minX = -chartsWindow.offsetWidth + minVisibleArea;
        const minY = -chartsWindow.offsetHeight + minVisibleArea;
        
        currentX = Math.max(minX, Math.min(currentX, maxX));
        currentY = Math.max(minY, Math.min(currentY, maxY));
        
        chartsWindow.style.left = currentX + 'px';
        chartsWindow.style.top = currentY + 'px';
    }
    
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
    }
}

/**
 * Minimizza finestra grafici
 */
function minimizeChartsWindow() {
    const chartsWindow = document.getElementById('charts-window');
    const content = document.querySelector('.charts-content');
    const minimizeBtn = document.querySelector('.charts-minimize i');
    
    if (chartsWindow.classList.contains('minimized')) {
        chartsWindow.classList.remove('minimized');
        content.style.display = 'block';
        minimizeBtn.className = 'fas fa-minus';
        
        // Ridisegna grafici con sincronizzazione
        setTimeout(() => {
            Object.values(chartInstances).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    chart.resize();
                }
            });
            // Risincronizza dopo il restore
            synchronizeChartScales();
        }, 300);
    } else {
        chartsWindow.classList.add('minimized');
        content.style.display = 'none';
        minimizeBtn.className = 'fas fa-plus';
    }
}

/**
 * Esporta funzioni globali
 */
window.toggleChartsSystem = toggleChartsSystem;
window.minimizeChartsWindow = minimizeChartsWindow;
window.initializeChartsSystem = initializeChartsSystem;
window.clearChartFilter = clearChartFilter; // NUOVO

/**
 * Inizializzazione automatica
 */
document.addEventListener('DOMContentLoaded', function() {
    // Attendi che la mappa sia pronta
    setTimeout(() => {
        if (typeof map !== 'undefined' && map.loaded()) {
            initializeChartsSystem();
        } else {
            // Riprova dopo un altro secondo
            setTimeout(() => {
                if (typeof map !== 'undefined' && map.loaded()) {
                    initializeChartsSystem();
                }
            }, 2000);
        }
    }, 3000);
});

// Integrazione con sistema reset esistente
if (typeof window.safeResetMap === 'function') {
    const originalSafeReset = window.safeResetMap;
    window.safeResetMap = function() {
        // Chiudi grafici se aperti e rimuovi filtri
        if (chartsEnabled) {
            clearChartFilter();
            toggleChartsSystem();
        }
        
        // Esegui reset originale
        originalSafeReset.apply(this, arguments);
    };
}

// CORRETTO: Integrazione con cambio tema
if (typeof window.addEventListener !== 'undefined') {
    // Ascolta cambio tema per aggiornare icona immediatamente
    document.addEventListener('themeChanged', function(e) {
        if (chartsEnabled && e.detail && e.detail.theme) {
            // Aggiorna icona quando cambia il tema
            setTimeout(() => {
                const iconElement = document.getElementById('theme-chart-icon');
                const titleElement = document.getElementById('theme-chart-title');
                
                if (iconElement) {
                    const themeIcon = themeIcons[e.detail.theme] || themeIcons['default'] || 'fas fa-chart-bar';
                    iconElement.className = themeIcon;
                    console.log(`🎨 Icona cambiata per tema: ${e.detail.theme} -> ${themeIcon}`);
                }
                
                // Aggiorna anche il nome se disponibile
                if (titleElement && themes[e.detail.theme]) {
                    titleElement.textContent = themes[e.detail.theme].name || e.detail.theme;
                }
                
                // Risincronizza gli assi dopo cambio tema
                setTimeout(() => {
                    synchronizeChartScales();
                }, 200);
            }, 100);
        }
    });
    
    // NUOVO: Listener per cambio tema dal menu select (fallback)
    const territorialSelect = document.getElementById('territorial-select');
    if (territorialSelect) {
        territorialSelect.addEventListener('change', function(e) {
            if (chartsEnabled) {
                setTimeout(() => {
                    updateThemeChart();
                    synchronizeChartScales();
                }, 200);
            }
        });
    }
}

console.log('📊 Sistema grafici dinamici v2.2 caricato - Allineamento completo assi X/Y + filtri interattivi');