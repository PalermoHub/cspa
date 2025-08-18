// ===== FILE: search-controls.js =====
/**
 * Controlli di ricerca e navigazione
 */

/**
 * Controllo di ricerca personalizzato
 */
class SearchControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        this._container.style.position = 'relative';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Cerca indirizzo...';
        searchInput.className = 'search-control';
        
        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'search-results';
        resultsDiv.id = 'search-results';
        
        this._container.appendChild(searchInput);
        this._container.appendChild(resultsDiv);
        
        // Event listener per la ricerca
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 3) {
                resultsDiv.style.display = 'none';
                return;
            }
            
            searchTimeout = setTimeout(() => {
                this.searchAddress(query, resultsDiv);
            }, 300);
        });
        
        // Nasconde i risultati quando si clicca fuori
        document.addEventListener('click', (e) => {
            if (!this._container.contains(e.target)) {
                resultsDiv.style.display = 'none';
            }
        });
        
        return this._container;
    }
    
    async searchAddress(query, resultsDiv) {
        try {
            // Limita la ricerca all'area di Palermo
            const bounds = '13.32,38.09,13.40,38.14';
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Palermo')}&limit=5&bounded=1&viewbox=${bounds}&addressdetails=1`
            );
            const results = await response.json();
            
            resultsDiv.innerHTML = '';
            
            if (results.length === 0) {
                resultsDiv.innerHTML = '<div class="search-result-item">Nessun risultato trovato</div>';
            } else {
                results.forEach(result => {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.textContent = result.display_name;
                    item.addEventListener('click', () => {
                        const lat = parseFloat(result.lat);
                        const lon = parseFloat(result.lon);
                        this._map.flyTo({
                            center: [lon, lat],
                            zoom: 17,
                            duration: 1000
                        });
                        resultsDiv.style.display = 'none';
                    });
                    resultsDiv.appendChild(item);
                });
            }
            
            resultsDiv.style.display = 'block';
        } catch (error) {
            console.error('Errore nella ricerca:', error);
            resultsDiv.innerHTML = '<div class="search-result-item">Errore nella ricerca</div>';
            resultsDiv.style.display = 'block';
        }
    }
    
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

/**
 * Controllo informazioni
 */
class InfoControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        
        const button = document.createElement('button');
        button.className = 'custom-control';
        button.type = 'button';
        button.innerHTML = '<i class="fas fa-info"></i>';
        button.title = 'Informazioni progetto';
        button.addEventListener('click', showInfoPopup);
        
        this._container.appendChild(button);
        return this._container;
    }
    
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

/**
 * Funzioni per gestire il popup informazioni
 */
function showInfoPopup() {
    document.getElementById('popup-overlay').classList.add('visible');
    document.getElementById('info-popup').classList.add('visible');
}

function closeInfoPopup() {
    document.getElementById('popup-overlay').classList.remove('visible');
    document.getElementById('info-popup').classList.remove('visible');
}

// ===== INTEGRAZIONE RESET.JS ESTESA =====
/**
 * Integrazione completa con reset.js per i filtri dinamici
 */

// Estende la funzione resetMap esistente
function extendResetSystem() {
    // Backup delle funzioni originali
    const originalResetMap = window.resetMap;
    const originalSafeResetMap = window.safeResetMap;
    
    // Override resetMap per includere filtri dinamici
    window.resetMap = function() {
        console.log('🔄 Reset esteso: resettando filtri dinamici...');
        
        // Reset filtri dinamici prima
        if (typeof resetAllDynamicFilters === 'function') {
            try {
                resetAllDynamicFilters();
            } catch (error) {
                console.warn('Errore reset filtri dinamici:', error);
            }
        }
        
        // Esegue il reset originale
        if (originalResetMap) {
            try {
                originalResetMap();
            } catch (error) {
                console.warn('Errore reset originale:', error);
            }
        }
        
        console.log('✅ Reset esteso completato');
    };
    
    // Override safeResetMap per includere filtri dinamici
    window.safeResetMap = function() {
        console.log('🔄 Safe reset esteso: resettando filtri dinamici...');
        
        try {
            // Reset filtri dinamici prima
            if (typeof resetAllDynamicFilters === 'function') {
                resetAllDynamicFilters();
            }
            
            // Esegue il safe reset originale
            if (originalSafeResetMap) {
                originalSafeResetMap();
            } else if (originalResetMap) {
                originalResetMap();
            }
            
            console.log('✅ Safe reset esteso completato');
        } catch (error) {
            console.error('❌ Errore nel safe reset esteso:', error);
            
            // Fallback minimo
            try {
                currentMandamentoFilter = null;
                currentFoglioFilter = null;
                
                if (typeof map !== 'undefined') {
                    map.setFilter('catastale-base', null);
                    map.setFilter('catastale-outline', null);
                    map.flyTo({
                        center: CONFIG.map.center,
                        zoom: CONFIG.map.zoom,
                        duration: 1000
                    });
                }
                
                console.log('✅ Fallback reset completato');
            } catch (fallbackError) {
                console.error('❌ Errore anche nel fallback:', fallbackError);
            }
        }
    };
    
    console.log('🔧 Sistema reset esteso configurato');
}

// Auto-inizializzazione del sistema esteso
document.addEventListener('DOMContentLoaded', function() {
    // Configura il sistema reset esteso
    setTimeout(() => {
        extendResetSystem();
        
        // Riconfigura i pulsanti esistenti
        const resetButton = document.getElementById('reset-map');
        if (resetButton) {
            resetButton.removeEventListener('click', window.resetMap);
            resetButton.addEventListener('click', window.resetMap);
            console.log('🔘 Pulsante reset tradizionale aggiornato');
        }
        
        // Riconfigura controlli MapLibre
        setTimeout(() => {
            const mapLibreResetButton = document.querySelector('.maplibre-reset-control');
            if (mapLibreResetButton) {
                mapLibreResetButton.removeEventListener('click', window.safeResetMap);
                mapLibreResetButton.addEventListener('click', window.safeResetMap);
                console.log('🔘 Controllo MapLibre reset aggiornato');
            }
        }, 500);
        
    }, 1000);
});

console.log('📦 Moduli completi caricati: themes, legends, info-panel, search-controls, integrazione reset estesa');