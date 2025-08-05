// Aggiungi Reset mappa - VERSIONE AGGIORNATA
function resetMap() {
    console.log('Eseguendo reset completo della mappa...');
    
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
    
    // Ripristina i checkbox
    document.getElementById('borders-toggle').checked = false;
    document.getElementById('palermo-perimeter').checked = false;
    document.getElementById('centro-storico-perimeter').checked = false;
    document.getElementById('upl-cs-perimeter').checked = true;
    
    // Ripristina la mappa base
    switchBasemap('carto-light');
    
    // Ripristina i layer tematici
    removeTheme();
    
    // Ripristina i bordi
    toggleBorders(false);
    
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
    
    // Rimuovi tutti i filtri dai layer
    map.setFilter('catastale-base', null);
    map.setFilter('catastale-outline', null);
    
    // AGGIUNTA: Ripristina il basemap dropdown
    const basemapSelect = document.getElementById('basemap-select');
    if (basemapSelect) {
        basemapSelect.value = 'carto-light';
    }
    
    console.log('Reset completato - tutti i filtri e impostazioni ripristinati');
}

// Event listener per il pulsante reset
document.addEventListener('DOMContentLoaded', function() {
    const resetButton = document.getElementById('reset-map');
    if (resetButton) {
        resetButton.addEventListener('click', resetMap);
        console.log('Event listener reset aggiunto');
    } else {
        console.error('Pulsante reset-map non trovato!');
    }
});

// Funzione alternativa per chiamare il reset da codice
function triggerMapReset() {
    resetMap();
}

// AGGIUNTA: Gestione errori per il reset
function safeResetMap() {
    try {
        resetMap();
    } catch (error) {
        console.error('Errore durante il reset della mappa:', error);
        // Fallback - almeno prova a resettare i filtri base
        try {
            currentMandamentoFilter = null;
            currentFoglioFilter = null;
            map.setFilter('catastale-base', null);
            map.setFilter('catastale-outline', null);
        } catch (fallbackError) {
            console.error('Errore anche nel fallback reset:', fallbackError);
        }
    }
}