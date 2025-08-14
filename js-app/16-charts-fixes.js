// ===== FILE: 16-charts-fixes.js =====
/**
 * Correzioni e miglioramenti per il sistema grafici dinamici
 * Versione 1.1 - Fix per compatibilità e performance
 */

/**
 * Fallback per getJenksLabels se non definita
 */
if (typeof getJenksLabels === 'undefined') {
    window.getJenksLabels = function(themeKey) {
        // Labels di default per temi Jenks comuni
        const defaultLabels = {
            population: ['0', '1', '2-3', '4-6', '7-12', '13-20', '21-35', '36+'],
            density: ['0', '1-999', '1K-3.5K', '3.5K-7.5K', '7.5K-15K', '15K-30K', '30K-60K', '60K+'],
            age: ['0', '1-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+'],
            elderly: ['0%', '1-5%', '6-15%', '16-25%', '26-35%', '36-45%', '46-52%', '53%+']
        };
        
        return defaultLabels[themeKey] || Array.from({length: 8}, (_, i) => `Classe ${i + 1}`);
    };
}

/**
 * Fallback per turf se non caricata
 */
if (typeof turf === 'undefined') {
    window.turf = {
        area: function(polygon) {
            // Calcolo approssimativo dell'area usando coordinate
            if (!polygon || !polygon.geometry || !polygon.geometry.coordinates) {
                return 0;
            }
            
            try {
                const coords = polygon.geometry.coordinates[0];
                if (!coords || coords.length < 4) return 0;
                
                // Formula semplificata per area approssimativa
                let area = 0;
                for (let i = 0; i < coords.length - 1; i++) {
                    area += (coords[i][0] * coords[i + 1][1]) - (coords[i + 1][0] * coords[i][1]);
                }
                return Math.abs(area) * 6378137 * 6378137; // Approssimazione
            } catch (error) {
                console.warn('Errore calcolo area:', error);
                return 0;
            }
        },
        bboxPolygon: function(bbox) {
            // Crea un poligono da bounding box
            const [west, south, east, north] = bbox;
            return {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [west, south],
                        [east, south],
                        [east, north],
                        [west, north],
                        [west, south]
                    ]]
                }
            };
        }
    };
}

/**
 * Fix per Chart.js se non caricata
 */
if (typeof Chart === 'undefined') {
    console.warn('⚠️ Chart.js non caricata, sistema grafici disabilitato');
    
    // Disabilita il sistema grafici
    window.toggleChartsSystem = function() {
        alert('Sistema grafici non disponibile: Chart.js non caricata');
    };
    
    // Nasconde il controllo
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            const chartsControl = document.querySelector('.maplibre-charts-control');
            if (chartsControl) {
                chartsControl.style.display = 'none';
            }
        }, 2000);
    });
}

/**
 * Performance monitor per i grafici
 */
class ChartsPerformanceMonitor {
    constructor() {
        this.updateCount = 0;
        this.lastUpdateTime = 0;
        this.averageUpdateTime = 0;
        this.maxUpdateTime = 0;
    }
    
    startUpdate() {
        this.lastUpdateTime = performance.now();
    }
    
    endUpdate() {
        const updateTime = performance.now() - this.lastUpdateTime;
        this.updateCount++;
        
        // Calcola media mobile
        this.averageUpdateTime = (this.averageUpdateTime * (this.updateCount - 1) + updateTime) / this.updateCount;
        this.maxUpdateTime = Math.max(this.maxUpdateTime, updateTime);
        
        // Log performance se lenta
        if (updateTime > 1000) {
            console.warn('🐌 Aggiornamento grafici lento:', updateTime.toFixed(2), 'ms');
        }
        
        // Aggiorna display performance ogni 10 aggiornamenti
        if (this.updateCount % 10 === 0) {
            this.updatePerformanceDisplay();
        }
    }
    
    updatePerformanceDisplay() {
        const statusText = document.querySelector('.status-text');
        if (statusText && this.averageUpdateTime > 0) {
            statusText.title = `Aggiornamenti: ${this.updateCount}, Media: ${this.averageUpdateTime.toFixed(1)}ms, Max: ${this.maxUpdateTime.toFixed(1)}ms`;
        }
    }
    
    getStats() {
        return {
            updateCount: this.updateCount,
            averageUpdateTime: this.averageUpdateTime,
            maxUpdateTime: this.maxUpdateTime
        };
    }
}

// Istanza globale del monitor
window.chartsPerformanceMonitor = new ChartsPerformanceMonitor();

/**
 * Intercepta updateChartsData per monitoring
 */
if (typeof window.updateChartsData === 'function') {
    const originalUpdateChartsData = window.updateChartsData;
    
    window.updateChartsData = function() {
        window.chartsPerformanceMonitor.startUpdate();
        
        try {
            const result = originalUpdateChartsData.apply(this, arguments);
            window.chartsPerformanceMonitor.endUpdate();
            return result;
        } catch (error) {
            window.chartsPerformanceMonitor.endUpdate();
            console.error('❌ Errore in updateChartsData:', error);
            throw error;
        }
    };
}

/**
 * Fix per dimensioni responsive della finestra grafici
 */
function fixChartsWindowSize() {
    const chartsWindow = document.getElementById('charts-window');
    if (!chartsWindow) return;
    
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    // Ridimensiona se fuori viewport
    const rect = chartsWindow.getBoundingClientRect();
    
    if (rect.right > viewport.width) {
        chartsWindow.style.left = Math.max(0, viewport.width - rect.width) + 'px';
    }
    
    if (rect.bottom > viewport.height) {
        chartsWindow.style.top = Math.max(0, viewport.height - rect.height) + 'px';
    }
    
    // Ridimensiona se troppo grande
    if (rect.width > viewport.width * 0.9) {
        chartsWindow.style.width = (viewport.width * 0.9) + 'px';
    }
    
    if (rect.height > viewport.height * 0.9) {
        chartsWindow.style.height = (viewport.height * 0.9) + 'px';
    }
}

// Applica fix ridimensionamento
window.addEventListener('resize', fixChartsWindowSize);

/**
 * Migliora la gestione degli errori per i grafici
 */
window.addEventListener('error', function(event) {
    if (event.error && event.error.message && event.error.message.includes('Chart')) {
        console.error('❌ Errore Chart.js:', event.error);
        
        // Tenta di recuperare
        setTimeout(() => {
            if (window.chartsEnabled && typeof window.initializeCharts === 'function') {
                console.log('🔄 Tentativo recupero grafici...');
                try {
                    window.initializeCharts();
                } catch (recoveryError) {
                    console.error('❌ Recupero fallito:', recoveryError);
                }
            }
        }, 2000);
    }
});

/**
 * Debug helper per i grafici
 */
window.debugCharts = function() {
    if (!window.chartsEnabled) {
        console.log('📊 Grafici disattivati');
        return;
    }
    
    console.log('📊 Debug Grafici:');
    console.log('- Istanze attive:', Object.keys(window.chartInstances || {}));
    console.log('- Dati correnti:', window.chartsData);
    console.log('- Performance:', window.chartsPerformanceMonitor.getStats());
    
    // Test update
    if (typeof window.updateChartsData === 'function') {
        console.log('🔄 Test aggiornamento...');
        window.updateChartsData();
    }
};

/**
 * Cleanup automatico per evitare memory leaks
 */
window.addEventListener('beforeunload', function() {
    if (typeof window.destroyCharts === 'function') {
        window.destroyCharts();
    }
});

/**
 * Fix per tema corrente non definito
 */
function ensureCurrentTheme() {
    if (typeof window.currentTheme === 'undefined') {
        window.currentTheme = 'landuse';
    }
}

// Applica fix
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(ensureCurrentTheme, 1000);
});

/**
 * Migliora la gestione dei dati vuoti
 */
function handleEmptyData() {
    const chartsWindow = document.getElementById('charts-window');
    if (!chartsWindow || !window.chartsEnabled) return;
    
    const containers = chartsWindow.querySelectorAll('.chart-container');
    
    containers.forEach(container => {
        const canvas = container.querySelector('canvas');
        if (!canvas) return;
        
        const chart = window.chartInstances[canvas.id.replace('-chart', '')];
        if (!chart) return;
        
        const hasData = chart.data.datasets[0].data.some(value => value > 0);
        
        if (!hasData) {
            container.classList.add('no-data');
        } else {
            container.classList.remove('no-data');
        }
    });
}

// Applica gestione dati vuoti dopo ogni aggiornamento
if (typeof window.updateChartsData === 'function') {
    const originalUpdate = window.updateChartsData;
    
    window.updateChartsData = function() {
        const result = originalUpdate.apply(this, arguments);
        setTimeout(handleEmptyData, 100);
        return result;
    };
}

/**
 * Keyboard shortcuts per i grafici
 */
document.addEventListener('keydown', function(event) {
    // Ctrl+G o Cmd+G per toggle grafici
    if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault();
        if (typeof window.toggleChartsSystem === 'function') {
            window.toggleChartsSystem();
        }
    }
    
    // Esc per chiudere grafici se aperti
    if (event.key === 'Escape' && window.chartsEnabled) {
        if (typeof window.toggleChartsSystem === 'function') {
            window.toggleChartsSystem();
        }
    }
});

/**
 * Touch gestures per mobile
 */
function setupMobileGestures() {
    const chartsWindow = document.getElementById('charts-window');
    if (!chartsWindow) return;
    
    let touchStartY = 0;
    let touchStartX = 0;
    
    chartsWindow.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
    });
    
    chartsWindow.addEventListener('touchend', function(e) {
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        
        const deltaY = touchStartY - touchEndY;
        const deltaX = touchStartX - touchEndX;
        
        // Swipe down per minimizzare
        if (deltaY < -50 && Math.abs(deltaX) < 50) {
            if (typeof window.minimizeChartsWindow === 'function') {
                window.minimizeChartsWindow();
            }
        }
    });
}

// Setup gestures su mobile
if (window.innerWidth <= 768) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(setupMobileGestures, 2000);
    });
}

console.log('🔧 Charts fixes v1.1 caricato - Miglioramenti performance e compatibilità');