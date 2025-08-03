		// Aggiungi Reset mappa
function resetMap() {
    // Ripristina i selettori
    document.getElementById('demographic-select').value = '';
    document.getElementById('economic-select').value = '';
    document.getElementById('territorial-select').value = 'landuse';
    document.getElementById('mandamento-filter').value = '';
    
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
    
    // Ripristina il filtro mandamento
    currentMandamentoFilter = null;
    map.setFilter('catastale-base', null);
}

// Aggiungi l'event listener per il pulsante
document.getElementById('reset-map').addEventListener('click', resetMap);