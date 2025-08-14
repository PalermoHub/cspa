// ===== FILE: 15-charts.js =====
/**
 * Sistema Grafici Dinamici a Pile - Tempo Reale
 * Versione 2.0 - Grafici a pile coerenti + trascinamento libero
 */

// Variabili globali per il sistema grafici
let chartsWindow = null;
let chartsEnabled = false;
let chartInstances = {};
let chartsUpdateTimer = null;
let lastChartsUpdateHash = '';
let chartsData = {};
let isChartsUpdating = false;
let activeLanduseFilter = null; // NUOVO: Filtro uso del suolo attivo

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
 * Inizializza il sistema grafici
 */
function initializeChartsSystem() {
    console.log('📊 Inizializzazione sistema grafici dinamici...');
    
    // Aggiungi controllo alla mappa
    if (map && map.loaded()) {
        map.addControl(new ChartsControl(), 'top-right');
        console.log('✅ Controllo grafici aggiunto alla mappa');
    }
    
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
            <div class="charts-grid">
                <!-- Grafico Uso del Suolo - ORA A PILE -->
                <div class="chart-container">
                    <div class="chart-header">
                        <h4><i class="fas fa-map"></i> Uso del Suolo</h4>
                        <div class="chart-stats">
                            <span class="total-particles">0</span> particelle
                        </div>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="landuse-chart"></canvas>
                    </div>
                </div>
                
                <!-- Grafico Tema Corrente -->
                <div class="chart-container" id="theme-chart-container">
                    <div class="chart-header">
                        <h4><i class="fas fa-analytics"></i> <span id="theme-chart-title">Indicatore Tematico</span></h4>
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
    
    // Rendi la finestra trascinabile OVUNQUE
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
        
        // Distruggi istanze grafici per liberare memoria
        destroyCharts();
        
        console.log('📊 Grafici disattivati');
    }
}

/**
 * Inizializza le istanze dei grafici - ENTRAMBI A PILE
 */
function initializeCharts() {
    // Distruggi grafici esistenti
    destroyCharts();
    
    // CAMBIATO: Inizializza grafico uso del suolo COME BAR CHART con INTERATTIVITÀ
    const landuseCtx = document.getElementById('landuse-chart');
    if (landuseCtx) {
        chartInstances.landuse = new Chart(landuseCtx, {
            type: 'bar', // CAMBIATO da 'doughnut' a 'bar'
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
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            font: {
                                size: 10
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // Nascosto per risparmiare spazio
                    },
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
                },
                animation: {
                    duration: 300
                },
                // NUOVO: Event listener per click
                onClick: (event, activeElements) => {
                    handleLanduseChartClick(event, activeElements);
                }
            }
        });
    }
    
    // Inizializza grafico tema corrente (rimane uguale)
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
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            font: {
                                size: 10
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y || 0;
                                return `Particelle: ${value}`;
                            }
                        }
                    }
                },
                animation: {
                    duration: 300
                }
            }
        });
    }
    
    console.log('📊 Istanze grafici create (entrambi a pile)');
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
 * NUOVO: Gestisce click sul grafico uso del suolo per filtrare il secondo grafico
 */
function handleLanduseChartClick(event, activeElements) {
    if (activeElements.length > 0) {
        const clickedIndex = activeElements[0].index;
        const chart = chartInstances.landuse;
        const clickedLabel = chart.data.labels[clickedIndex];
        
        // Trova la chiave originale dell'uso del suolo dal label
        let clickedLanduseKey = null;
        for (const [key, label] of Object.entries(landUseLabels)) {
            if (label === clickedLabel) {
                clickedLanduseKey = key;
                break;
            }
        }
        
        // Se non trovato, usa il label come chiave
        if (!clickedLanduseKey) {
            clickedLanduseKey = clickedLabel;
        }
        
        // Toggle filtro
        if (activeLanduseFilter === clickedLanduseKey) {
            // Deseleziona se già selezionato
            activeLanduseFilter = null;
            console.log('🔄 Filtro uso del suolo rimosso');
        } else {
            // Seleziona nuovo filtro
            activeLanduseFilter = clickedLanduseKey;
            console.log('🎯 Filtro uso del suolo attivato:', clickedLabel);
        }
        
        // Aggiorna grafici con nuovo filtro
        updateChartsWithFilter();
        
        // Aggiorna indicatori visivi
        updateLanduseChartSelection();
        
        // Aggiorna header del secondo grafico
        updateThemeChartHeader();
    }
}

/**
 * NUOVO: Aggiorna grafici applicando il filtro uso del suolo
 */
function updateChartsWithFilter() {
    // Ricalcola dati applicando il filtro
    const newData = calculateChartsData();
    chartsData = newData;
    
    // Aggiorna entrambi i grafici
    updateLanduseChart();
    updateThemeChart();
    updateChartsInfo();
    updateChartsStatus();
}

/**
 * NUOVO: Aggiorna selezione visiva nel grafico uso del suolo
 */
function updateLanduseChartSelection() {
    const chart = chartInstances.landuse;
    if (!chart) return;
    
    const colors = [];
    const borderColors = [];
    
    chart.data.labels.forEach((label, index) => {
        // Trova la chiave dell'uso del suolo
        let landuseKey = null;
        for (const [key, labelValue] of Object.entries(landUseLabels)) {
            if (labelValue === label) {
                landuseKey = key;
                break;
            }
        }
        
        const originalColor = landUseColors[landuseKey] || 'rgba(200,200,200,0.7)';
        
        if (activeLanduseFilter === landuseKey) {
            // Evidenzia la barra selezionata
            colors.push(originalColor);
            borderColors.push('#ff9900');
        } else if (activeLanduseFilter !== null) {
            // Opacizza le barre non selezionate
            colors.push(originalColor.replace('0.7)', '0.3)').replace('0.75)', '0.3)'));
            borderColors.push('rgba(0,0,0,0.1)');
        } else {
            // Nessun filtro - colori normali
            colors.push(originalColor);
            borderColors.push(originalColor.replace('0.7)', '1)').replace('0.75)', '1)'));
        }
    });
    
    chart.data.datasets[0].backgroundColor = colors;
    chart.data.datasets[0].borderColor = borderColors;
    chart.data.datasets[0].borderWidth = activeLanduseFilter ? 3 : 1;
    chart.update('none');
}

/**
 * NUOVO: Aggiorna header del secondo grafico con informazioni filtro
 */
function updateThemeChartHeader() {
    const headerElement = document.querySelector('#theme-chart-container .chart-header h4');
    if (!headerElement) return;
    
    const icon = '<i class="fas fa-analytics"></i>';
    const baseTitle = document.getElementById('theme-chart-title')?.textContent || 'Indicatore Tematico';
    
    if (activeLanduseFilter) {
        const filterLabel = landUseLabels[activeLanduseFilter] || activeLanduseFilter;
        headerElement.innerHTML = `${icon} ${baseTitle} <small>(solo ${filterLabel})</small>`;
        headerElement.style.color = '#ff9900';
    } else {
        headerElement.innerHTML = `${icon} <span id="theme-chart-title">${baseTitle}</span>`;
        headerElement.style.color = '#2c3e50';
    }
}
function debounceChartsUpdate() {
    clearTimeout(chartsUpdateTimer);
    chartsUpdateTimer = setTimeout(() => {
        updateChartsData();
    }, 800);
}

/**
 * Calcola dati per i grafici dalle particelle visibili con supporto filtro uso del suolo
 */
function calculateChartsData() {
    if (!map || !map.getLayer('catastale-base')) {
        return { landuse: {}, theme: {}, total: 0, filteredTotal: 0 };
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
        filteredTotal: 0, // NUOVO: Conteggio particelle filtrate
        uniqueParticles: new Set(),
        filteredParticles: new Set() // NUOVO: Particelle che passano il filtro uso del suolo
    };
    
    features.forEach(feature => {
        const fid = feature.properties.fid;
        
        if (fid && !data.uniqueParticles.has(fid)) {
            data.uniqueParticles.add(fid);
            data.total++;
            
            // Conteggio uso del suolo (sempre completo)
            const landUse = feature.properties.class || 'N/D';
            if (!data.landuse[landUse]) {
                data.landuse[landUse] = 0;
            }
            data.landuse[landUse]++;
            
            // NUOVO: Verifica se la particella passa il filtro uso del suolo
            const passesLanduseFilter = !activeLanduseFilter || landUse === activeLanduseFilter;
            
            if (passesLanduseFilter) {
                data.filteredParticles.add(fid);
                data.filteredTotal++;
                
                // Conteggio tema corrente (solo per particelle filtrate)
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
 * Aggiorna i dati dei grafici
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
        
        // Aggiorna informazioni
        updateChartsInfo();
        
        // Aggiorna status
        updateChartsStatus();
        
        console.log('📊 Grafici aggiornati -', newData.total, 'particelle');
        
    } catch (error) {
        console.error('❌ Errore aggiornamento grafici:', error);
    } finally {
        isChartsUpdating = false;
    }
}

/**
 * AGGIORNATO: Aggiorna grafico uso del suolo con selezione visiva
 */
function updateLanduseChart() {
    const chart = chartInstances.landuse;
    if (!chart || !chartsData.landuse) return;
    
    const labels = [];
    const data = [];
    const colors = [];
    const borderColors = [];
    
    // Ordina per valore decrescente per migliore visualizzazione
    const sortedEntries = Object.entries(chartsData.landuse)
        .sort(([,a], [,b]) => b - a);
    
    sortedEntries.forEach(([landUse, count]) => {
        const label = landUseLabels[landUse] || landUse;
        const originalColor = landUseColors[landUse] || 'rgba(200,200,200,0.7)';
        
        labels.push(label);
        data.push(count);
        
        // Applica colori in base al filtro attivo
        if (activeLanduseFilter === landUse) {
            // Evidenzia la barra selezionata
            colors.push(originalColor);
            borderColors.push('#ff9900');
        } else if (activeLanduseFilter !== null) {
            // Opacizza le barre non selezionate
            colors.push(originalColor.replace('0.7)', '0.3)').replace('0.75)', '0.3)'));
            borderColors.push('rgba(0,0,0,0.1)');
        } else {
            // Nessun filtro - colori normali
            colors.push(originalColor);
            borderColors.push(originalColor.replace('0.7)', '1)').replace('0.75)', '1)'));
        }
    });
    
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = colors;
    chart.data.datasets[0].borderColor = borderColors;
    chart.data.datasets[0].borderWidth = activeLanduseFilter ? 3 : 1;
    chart.update('none');
    
    // Aggiorna contatore
    const totalElement = document.querySelector('.total-particles');
    if (totalElement) {
        totalElement.textContent = chartsData.total;
    }
}

/**
 * AGGIORNATO: Aggiorna grafico tema corrente con dati filtrati
 */
function updateThemeChart() {
    const chart = chartInstances.theme;
    const container = document.getElementById('theme-chart-container');
    
    if (!chart || !chartsData.theme) return;
    
    // Se non c'è tema o è landuse, nascondi
    if (!currentTheme || currentTheme === 'landuse') {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    
    // Aggiorna titolo con filtro
    const theme = themes[currentTheme];
    const titleElement = document.getElementById('theme-chart-title');
    if (titleElement && theme) {
        titleElement.textContent = theme.name;
    }
    updateThemeChartHeader();
    
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
    
    // AGGIORNATO: Mostra conteggio filtrato se c'è un filtro attivo
    const themeTotal = Object.values(chartsData.theme).reduce((a, b) => a + b, 0);
    const themeTotalElement = document.querySelector('.theme-total-particles');
    if (themeTotalElement) {
        if (activeLanduseFilter) {
            const filterLabel = landUseLabels[activeLanduseFilter] || activeLanduseFilter;
            themeTotalElement.innerHTML = `${themeTotal} <small>(${filterLabel})</small>`;
            themeTotalElement.style.color = '#ff9900';
        } else {
            themeTotalElement.textContent = themeTotal;
            themeTotalElement.style.color = '';
        }
    }
}

/**
 * AGGIORNATO: Aggiorna informazioni generali includendo filtro uso del suolo
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
    
    // AGGIORNATO: Aggiorna filtri attivi includendo filtro uso del suolo
    const filtersElement = document.getElementById('active-filters');
    if (filtersElement) {
        const activeFilters = [];
        
        if (currentMandamentoFilter) {
            activeFilters.push(`Mandamento: ${currentMandamentoFilter}`);
        }
        if (currentFoglioFilter) {
            activeFilters.push(`Foglio: ${currentFoglioFilter}`);
        }
        if (window.legendFilterState && window.legendFilterState.activeCategories.size > 0) {
            activeFilters.push(`Legenda: ${window.legendFilterState.activeCategories.size}`);
        }
        // NUOVO: Filtro uso del suolo
        if (activeLanduseFilter) {
            const filterLabel = landUseLabels[activeLanduseFilter] || activeLanduseFilter;
            activeFilters.push(`Uso Suolo: ${filterLabel}`);
        }
        
        filtersElement.innerHTML = activeFilters.length > 0 ? 
            activeFilters.join(', ') + 
            (activeLanduseFilter ? ' <button onclick="clearLanduseFilter()" class="clear-filter-btn" title="Rimuovi filtro uso del suolo">×</button>' : '') : 
            'Nessuno';
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
        const minHeight = 300;
        const maxWidth = screen.availWidth; // CAMBIATO: usa screen invece di window per multi-monitor
        const maxHeight = screen.availHeight; // CAMBIATO: usa screen invece di window
        
        const finalWidth = Math.max(minWidth, Math.min(width, maxWidth));
        const finalHeight = Math.max(minHeight, Math.min(height, maxHeight));
        
        chartsWindow.style.width = finalWidth + 'px';
        chartsWindow.style.height = finalHeight + 'px';
        
        // Forza ridisegno grafici
        Object.values(chartInstances).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }
    
    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
    }
}

/**
 * AGGIORNATO: Rende la finestra grafici trascinabile OVUNQUE
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
        
        // RIMOSSO: Nessun limite di viewport - può andare ovunque!
        // La finestra può essere trascinata anche su monitor secondari
        // Limiti minimi opzionali solo per evitare che sparisca completamente
        const minVisibleArea = 50; // Almeno 50px visibili
        const maxX = screen.availWidth - minVisibleArea;
        const maxY = screen.availHeight - minVisibleArea;
        const minX = -chartsWindow.offsetWidth + minVisibleArea;
        const minY = -chartsWindow.offsetHeight + minVisibleArea;
        
        // Applica limiti molto permissivi per multi-monitor
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
        
        // Ridisegna grafici
        setTimeout(() => {
            Object.values(chartInstances).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    chart.resize();
                }
            });
        }, 300);
    } else {
        chartsWindow.classList.add('minimized');
        content.style.display = 'none';
        minimizeBtn.className = 'fas fa-plus';
    }
}

/**
 * NUOVO: Pulisce il filtro uso del suolo
 */
function clearLanduseFilter() {
    activeLanduseFilter = null;
    console.log('🧹 Filtro uso del suolo rimosso');
    
    // Aggiorna grafici
    updateChartsWithFilter();
    updateThemeChartHeader();
}

/**
 * NUOVO: Reset completo filtri grafici
 */
function resetChartsFilters() {
    activeLanduseFilter = null;
    console.log('🔄 Reset completo filtri grafici');
    
    // Aggiorna tutto
    if (chartsEnabled) {
        updateChartsData();
    }
}

/**
 * Esporta funzioni globali
 */
window.toggleChartsSystem = toggleChartsSystem;
window.minimizeChartsWindow = minimizeChartsWindow;
window.initializeChartsSystem = initializeChartsSystem;
window.clearLanduseFilter = clearLanduseFilter; // NUOVO
window.resetChartsFilters = resetChartsFilters; // NUOVO

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
        // Reset filtri grafici
        resetChartsFilters();
        
        // Chiudi grafici se aperti
        if (chartsEnabled) {
            toggleChartsSystem();
        }
        
        // Esegui reset originale
        originalSafeReset.apply(this, arguments);
    };
}

console.log('📊 Sistema grafici dinamici v2.0 caricato - Grafici a pile coerenti + trascinamento libero + interattività filtri');