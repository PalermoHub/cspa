// Event listeners per dropdown
document.getElementById('basemap-select').addEventListener('change', (e) => {
    switchBasemap(e.target.value);
});

document.getElementById('mandamento-filter').addEventListener('change', (e) => {
    applyMandamentoFilter(e.target.value);
});

// Nuovo event listener per il filtro foglio
document.getElementById('foglio-filter').addEventListener('change', (e) => {
    applyFoglioFilter(e.target.value);
});

document.getElementById('borders-toggle').addEventListener('change', (e) => {
    toggleBorders(e.target.checked);
});

// Event listeners per perimetri
document.getElementById('palermo-perimeter').addEventListener('change', (e) => {
    togglePerimeter('palermo-perimeter', e.target.checked);
});

document.getElementById('centro-storico-perimeter').addEventListener('change', (e) => {
    togglePerimeter('centro-storico-perimeter', e.target.checked);
});

document.getElementById('upl-cs-perimeter').addEventListener('change', (e) => {
    togglePerimeter('upl-cs-perimeter', e.target.checked);
});

document.getElementById('demographic-select').addEventListener('change', (e) => {
    if (e.target.value) {
        resetAllSelects('demographic-select');
        activateTheme(e.target.value);
    } else {
        activateTheme('landuse');
    }
});

document.getElementById('economic-select').addEventListener('change', (e) => {
    if (e.target.value) {
        resetAllSelects('economic-select');
        activateTheme(e.target.value);
    } else {
        activateTheme('landuse');
    }
});

document.getElementById('territorial-select').addEventListener('change', (e) => {
    if (e.target.value) {
        resetAllSelects('territorial-select');
        activateTheme(e.target.value);
    } else {
        activateTheme('landuse');
    }
});

// Gestione responsive
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        const panel = document.getElementById('info-panel');
        if (panel.classList.contains('visible')) {
            panel.style.width = `${window.innerWidth - 20}px`;
        }
    }
});

// Gestione tastiera
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeInfoPanel();
    }
});