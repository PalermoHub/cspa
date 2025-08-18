// ===== FILE: 11-reset.js - Aggiornato con Sistema Grafici =====

function resetMap() {
    console.log('Eseguendo reset completo della mappa...');
    
    // NUOVO: Chiudi grafici se aperti
    if (typeof window.chartsEnabled !== 'undefined' && window.chartsEnabled) {
        if (typeof window.toggleChartsSystem === 'function') {
            window.toggleChartsSystem();
        }
    }
    
    // Ripristina i selettori
    document.getElementById('demographic-select').value = '';
    document.getElementById('economic-select').value = '';
    document.getElementById('territorial-select').value = 'landuse';
    document.getElementById('mandamento-filter').value = '';
    
    // AGGIUNTA: Ripristina anche il filtro foglio
    const foglioFilter = document.getElementById('foglio-filter');
    if (foglioFilter) {
        foglioFilter.value = '';
    }
    
    // Ripristina i checkbox (solo quelli che rimangono nel pannello)
    const bordersToggle = document.getElementById('borders-toggle');
    if (bordersToggle) {
        bordersToggle.checked = false;
    }
    
    document.getElementById('palermo-perimeter').checked = false;
    document.getElementById('centro-storico-perimeter').checked = false;
    document.getElementById('upl-cs-perimeter').checked = true;
    
    // Ripristina la mappa base
    switchBasemap('carto-light');
    
    // Ripristina i layer tematici
    removeTheme();
    
    // Ripristina i bordi
    toggleBorders(false);
    
    // AGGIUNTA: Ripristina anche il controllo MapLibre dei bordi
    const bordersControlButton = document.querySelector('.maplibre-borders-control');
    if (bordersControlButton) {
        bordersControlButton.classList.remove('active');
    }
    
    // NUOVO: Reset controllo grafici
    const chartsControlButton = document.querySelector('.maplibre-charts-control');
    if (chartsControlButton) {
        chartsControlButton.classList.remove('active');
    }
    
    // Ripristina i perimetri
    togglePerimeter('palermo-perimeter', false);
    togglePerimeter('centro-storico-perimeter', false);
    togglePerimeter('upl-cs-perimeter', true);
    
    // Chiudi il pannello informazioni
    closeInfoPanel();
    
    // Rimuovi eventuali feature hover
    if (hoveredPolygon !== null) {
        map.setFilter('catastale-hover', ['==', ['get', 'fid'], '']);
        hoveredPolygon = null;
    }
    
    // AGGIORNAMENTO: Ripristina ENTRAMBI i filtri (mandamento E foglio)
    currentMandamentoFilter = null;
    currentFoglioFilter = null; // AGGIUNTA: Reset del filtro foglio
    
    // NUOVO: Reset filtri legenda se presenti
    if (typeof window.clearLegendFilters === 'function') {
        window.clearLegendFilters();
    }
    
    // Rimuovi tutti i filtri dai layer
    map.setFilter('catastale-base', null);
    map.setFilter('catastale-outline', null);
    
    // AGGIUNTA: Ripristina il basemap dropdown
    const basemapSelect = document.getElementById('basemap-select');
    if (basemapSelect) {
        basemapSelect.value = 'carto-light';
    }
    
    // AGGIUNTA: Ripristina la vista della mappa
    map.flyTo({
        center: [13.3614, 38.1157],
        zoom: 14,
        duration: 1000
    });
    
    console.log('Reset completato - tutti i filtri, grafici e impostazioni ripristinati');
}

// Controllo Reset personalizzato per MapLibre
class ResetControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        
        const button = document.createElement('button');
        button.className = 'maplibre-custom-control maplibre-reset-control';
        button.type = 'button';
        button.innerHTML = '<i class="fas fa-sync-alt"></i>';
        button.title = 'Reset vista predefinita';
        button.addEventListener('click', () => {
            safeResetMap(); // Usa la versione sicura del reset
        });
        
        this._container.appendChild(button);
        return this._container;
    }
    
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

// Controllo Toggle Bordi personalizzato per MapLibre
class BordersControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        
        const button = document.createElement('button');
        button.className = 'maplibre-custom-control maplibre-borders-control';
        button.type = 'button';
        button.innerHTML = '<i class="fas fa-border-style"></i>';
        button.title = 'Mostra/Nascondi bordi poligoni';
        button.addEventListener('click', () => {
            const currentVisibility = this._map.getLayoutProperty('catastale-outline', 'visibility');
            const newVisibility = currentVisibility === 'visible' ? 'none' : 'visible';
            this._map.setLayoutProperty('catastale-outline', 'visibility', newVisibility);
            
            // Aggiorna lo stile del bottone
            if (newVisibility === 'visible') {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
            
            // AGGIUNTA: Sincronizza con il checkbox se esiste ancora
            const bordersToggle = document.getElementById('borders-toggle');
            if (bordersToggle) {
                bordersToggle.checked = (newVisibility === 'visible');
            }
        });
        
        this._container.appendChild(button);
        return this._container;
    }
    
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

// Funzione per inizializzare i controlli MapLibre
function initializeMapLibreControls() {
    if (typeof map !== 'undefined' && map.loaded()) {
        try {
            map.addControl(new ResetControl(), 'top-right');
            map.addControl(new BordersControl(), 'top-right');
		    map.addControl(new ChartsControl())
            console.log('Controlli MapLibre aggiunti con successo');
        } catch (error) {
            console.error('Errore nell\'aggiunta dei controlli MapLibre:', error);
        }
    } else {
        console.log('Mappa non ancora caricata, riprovo...');
        setTimeout(initializeMapLibreControls, 500);
    }
}

// Event listener per il pulsante reset tradizionale (se esiste ancora)
document.addEventListener('DOMContentLoaded', function() {
    const resetButton = document.getElementById('reset-map');
    if (resetButton) {
        resetButton.addEventListener('click', resetMap);
        console.log('Event listener reset tradizionale aggiunto');
    }
    
    // Inizializza i controlli MapLibre quando la mappa è pronta
    if (typeof map !== 'undefined') {
        if (map.loaded()) {
            initializeMapLibreControls();
        } else {
            map.on('load', initializeMapLibreControls);
        }
    } else {
        // Se la mappa non è ancora definita, aspetta
        setTimeout(initializeMapLibreControls, 1000);
    }
});

// Funzione alternativa per chiamare il reset da codice
function triggerMapReset() {
    safeResetMap();
}

// AGGIUNTA: Gestione errori per il reset - VERSIONE MIGLIORATA con supporto grafici
function safeResetMap() {
    try {
        resetMap();
    } catch (error) {
        console.error('Errore durante il reset della mappa:', error);
        // Fallback - almeno prova a resettare i filtri base
        try {
            // Reset base
            currentMandamentoFilter = null;
            if (typeof currentFoglioFilter !== 'undefined') {
                currentFoglioFilter = null;
            }
            
            // NUOVO: Reset grafici in caso di errore
            if (typeof window.chartsEnabled !== 'undefined' && window.chartsEnabled) {
                try {
                    if (typeof window.toggleChartsSystem === 'function') {
                        window.toggleChartsSystem();
                    }
                } catch (chartsError) {
                    console.warn('Errore reset grafici:', chartsError);
                }
            }
            
            if (typeof map !== 'undefined') {
                map.setFilter('catastale-base', null);
                map.setFilter('catastale-outline', null);
                
                // Reset vista mappa
                map.flyTo({
                    center: [13.3614, 38.1157],
                    zoom: 14,
                    duration: 1000
                });
            }
            
            console.log('Fallback reset completato');
        } catch (fallbackError) {
            console.error('Errore anche nel fallback reset:', fallbackError);
        }
    }
}

// AGGIUNTA: Funzione per sincronizzare i controlli
function syncBordersControls(visible) {
    // Sincronizza checkbox tradizionale
    const bordersToggle = document.getElementById('borders-toggle');
    if (bordersToggle) {
        bordersToggle.checked = visible;
    }
    
    // Sincronizza controllo MapLibre
    const bordersControlButton = document.querySelector('.maplibre-borders-control');
    if (bordersControlButton) {
        if (visible) {
            bordersControlButton.classList.add('active');
        } else {
            bordersControlButton.classList.remove('active');
        }
    }
}

// AGGIUNTA: Funzione toggleBorders migliorata per sincronizzazione
function toggleBorders(show) {
    const visibility = show ? 'visible' : 'none';
    if (typeof map !== 'undefined') {
        map.setLayoutProperty('catastale-outline', 'visibility', visibility);
    }
    syncBordersControls(show);
}

// NUOVO: Integrazione completa con sistema grafici per reset
window.addEventListener('load', function() {
    // Override del reset per includere grafici
    if (typeof window.resetMap === 'function') {
        const originalReset = window.resetMap;
        window.resetMap = function() {
            // Chiudi grafici prima del reset
            if (typeof window.chartsEnabled !== 'undefined' && window.chartsEnabled) {
                if (typeof window.toggleChartsSystem === 'function') {
                    window.toggleChartsSystem();
                }
            }
            
            // Esegui reset originale
            originalReset.apply(this, arguments);
        };
    }
});

console.log('🔄 Reset system v2.0 caricato - Con supporto completo sistema grafici');