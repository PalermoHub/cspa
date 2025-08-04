// Funzioni per le legende
function showJenksLegend(theme) {
    const legend = document.getElementById('legend');
    const title = document.getElementById('legend-title');
    const items = document.getElementById('legend-items');
    
    let titleText = theme.name + ' (Jenks-Fisher)';
    if (currentMandamentoFilter || currentFoglioFilter) {
        const filters = [];
        if (currentMandamentoFilter) filters.push(currentMandamentoFilter);
        if (currentFoglioFilter) filters.push(`Foglio ${currentFoglioFilter}`);
        titleText += ` - ${filters.join(' + ')}`;
    }
    title.textContent = titleText;
    
    items.innerHTML = '';
    
    let labels = [];
    
    if (currentTheme === 'population') {
        labels = [
            '0 abitanti',
            '1 abitante', 
            '2-3 abitanti',
            '4-6 abitanti', 
            '7-12 abitanti',
            '13-20 abitanti',
            '21-35 abitanti'
        ];
    } else if (currentTheme === 'age') {
        labels = [
            '0 anni (nessun dato)',
            '1-24 anni',
            '25-34 anni', 
            '35-44 anni',
            '45-54 anni',
            '55-64 anni',
            '65-74 anni',
            '75-80 anni'
        ];
    } else if (currentTheme === 'elderly') {
        labels = [
            '0% (nessun dato)',
            '0.1-5.2%',
            '5.3-15.4%', 
            '15.5-25.1%',
            '25.2-35.4%',
            '35.5-44.7%',
            '44.8-52.1%',
            '52.2-58.8%'
        ];
    } else if (currentTheme === 'density') {
        labels = [
            '0 ab/km² (nessun dato)',
            '1-999 ab/km²',
            '1.000-3.499 ab/km²', 
            '3.500-7.499 ab/km²',
            '7.500-14.999 ab/km²',
            '15.000-29.999 ab/km²',
            '30.000-59.999 ab/km²',
            '60.000-194.093 ab/km²'
        ];
    } else if (currentTheme === 'foreign') {
        labels = [
            '0% (nessun dato)',
            '1-4%',
            '5-11%', 
            '12-21%',
            '22-34%',
            '35-49%',
            '50-69%',
            '70-100%'
        ];	
    } else {
        // Labels generiche per altri temi
        const numClasses = currentTheme === 'population' ? 7 : 8;
        for (let i = 0; i < numClasses; i++) {
            labels.push(`Classe ${i + 1}`);
        }
    }
    
    // Usa solo le prime 7 classi per popolazione, tutte le 8 per altri temi
    const numClasses = currentTheme === 'population' ? 7 : 8;
    
    for (let i = 0; i < numClasses; i++) {
        const item = document.createElement('div');
        item.className = 'legend-item';
        
        item.innerHTML = `
            <div class="legend-color" style="background-color: ${theme.colors[i]}"></div>
            <span class="legend-label">${labels[i]}</span>
        `;
        items.appendChild(item);
    }
    
    legend.classList.add('visible');
}

function showLegend(theme, range) {
    const legend = document.getElementById('legend');
    const title = document.getElementById('legend-title');
    const items = document.getElementById('legend-items');
    
    let titleText = theme.name;
    if (currentMandamentoFilter || currentFoglioFilter) {
        const filters = [];
        if (currentMandamentoFilter) filters.push(currentMandamentoFilter);
        if (currentFoglioFilter) filters.push(`Foglio ${currentFoglioFilter}`);
        titleText += ` - ${filters.join(' + ')}`;
    }
    title.textContent = titleText;
    
    items.innerHTML = '';
    
    // Gestione legenda per temi categorici
    if (theme.type === 'categorical') {
        let colorMap = {};
        let labelMap = {};
        
        switch (currentTheme) {
            case 'land_cover':
                colorMap = landCoverColors;
                labelMap = landCoverLabels;
                break;
            case 'flood_risk':
                colorMap = floodRiskColors;
                labelMap = floodRiskLabels;
                break;
            case 'landslide_risk':
                colorMap = landslideRiskColors;
                labelMap = landslideRiskLabels;
                break;
            case 'coastal_erosion':
                colorMap = coastalErosionColors;
                labelMap = coastalErosionLabels;
                break;
            case 'seismic_risk':
                colorMap = seismicRiskColors;
                labelMap = seismicRiskLabels;
                break;
        }
        
        for (const [code, color] of Object.entries(colorMap)) {
            const label = labelMap[code] || code;
            
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `
                <div class="legend-color" style="background-color: ${color}"></div>
                <span class="legend-label">${label}</span>
            `;
            items.appendChild(item);
        }
    } 
    else {
        // Gestione standard per temi numerici
        const step = (range.max - range.min) / (theme.colors.length - 1);
        
        theme.colors.forEach((color, i) => {
            const minVal = Math.round(range.min + (step * i));
            const maxVal = i === theme.colors.length - 1 ? 
                range.max : 
                Math.round(range.min + (step * (i + 1)));
            
            const item = document.createElement('div');
            item.className = 'legend-item';
            
            let label = `${minVal} - ${maxVal} ${theme.unit}`;
            
            item.innerHTML = `
                <div class="legend-color" style="background-color: ${color}"></div>
                <span class="legend-label">${label}</span>
            `;
            items.appendChild(item);
        });
    }
    
    legend.classList.add('visible');
}

function showBaseLegenda() {
    const legend = document.getElementById('legend');
    const title = document.getElementById('legend-title');
    const items = document.getElementById('legend-items');
    
    let titleText = 'Base catastale';
    if (currentMandamentoFilter || currentFoglioFilter) {
        const filters = [];
        if (currentMandamentoFilter) filters.push(currentMandamentoFilter);
        if (currentFoglioFilter) filters.push(`Foglio ${currentFoglioFilter}`);
        titleText += ` - ${filters.join(' + ')}`;
    }
    title.textContent = titleText;
    
    items.innerHTML = '';
    
    for (const [className, color] of Object.entries(landUseColors)) {
        const label = landUseLabels[className];
        
        const item = document.createElement('div');
        item.className = 'legend-item';
        
        item.innerHTML = `
            <div class="legend-color" style="background-color: ${color}"></div>
            <span class="legend-label">${label}</span>
        `;
        items.appendChild(item);
    }
    
    legend.classList.add('visible');
}

// Pannello informazioni
        function showFeatureInfo(feature) {
            const panel = document.getElementById('info-panel');
            const title = document.getElementById('panel-title');
            const subtitle = document.getElementById('panel-subtitle');
            const content = document.getElementById('info-content');
            
            const props = feature.properties;
            
            // Correggi il nome del mandamento se necessario
            let mandamentoDisplay = props.Mandamento || 'N/D';
            if (mandamentoDisplay === 'Castellamare') {
                mandamentoDisplay = 'Castellammare';
            }
            
            title.textContent = `Particella ${props.particella || props.fid || 'N/D'}`;
            subtitle.textContent = `Foglio: ${props.foglio || 'N/D'}`;
            
            content.innerHTML = `
                <div class="info-group">
                    <h3><i class="fas fa-map-marker-alt"></i> Informazioni Generali</h3>
                    <div class="info-item">
                     <span class="info-label">Circoscrizione:</span>
                        <span class="info-value">I°</span>
                    </div>
					                    <div class="info-item">
                     <span class="info-label">Mandamento:</span>
                        <span class="info-value">${mandamentoDisplay}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Superficie:</span>
                        <span class="info-value">${props['superfice mq'] ? parseFloat(props['superfice mq']).toLocaleString('it-IT', {maximumFractionDigits: 2}) + ' m²' : 'N/D'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Classe:</span>
                        <span class="info-value">${landUseLabels[props.class] || props.class || 'N/D'}</span>
                    </div>
					<div class="info-item">
                        <span class="info-label">Sottoclasse:</span>
                        <span class="info-value">${landUseLabels[props.subtype] || props.subtype || 'N/D'}</span>
                    </div>
										 <div class="info-item">
                        <span class="info-label">Copertura del suolo:</span>
                        <span class="info-value">${landCoverLabels[props['copertura del suolo']] || props['copertura del suolo'] || 'N/D'}</span>
                    </div>
                </div>

                <div class="info-group">
                    <h3><i class="fas fa-users"></i> Demografia</h3>
                    <div class="info-item">
                        <span class="info-label">Popolazione Stimata:</span>
                        <span class="info-value">${props.popolazione_stimata ? parseFloat(props.popolazione_stimata).toLocaleString('it-IT', {maximumFractionDigits: 2}) : 'N/D'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Età Media:</span>
                        <span class="info-value">${props['età_media'] ? parseFloat(props['età_media']).toFixed(2) + ' anni' : 'N/D'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Tasso Anziani:</span>
                        <span class="info-value">${props.tasso_anziani ? parseFloat(props.tasso_anziani).toFixed(2) + '%' : 'N/D'}</span>
                    </div>
    <div class="info-item">
        <span class="info-label">Dimensione Media Famiglia:</span>
        <span class="info-value">${props['dimensione media della famiglia'] ? parseFloat(props['dimensione media della famiglia']).toFixed(2) + ' componenti' : 'N/D'}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Tasso di Mascolinità:</span>
        <span class="info-value">${props['tasso di mascolinità'] ? parseFloat(props['tasso di mascolinità']).toFixed(2) + '%' : 'N/D'}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Tasso Persona Singola:</span>
        <span class="info-value">${props['tasso_persona singola'] ? parseFloat(props['tasso_persona singola']).toFixed(2) + '%' : 'N/D'}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Tasso Famiglie Numerose:</span>
        <span class="info-value">${props.tasso_famiglie_numerose ? parseFloat(props.tasso_famiglie_numerose).toFixed(2) + '%' : 'N/D'}</span>
    </div>
	<div class="info-item">
                        <span class="info-label">Popolazione Straniera:</span>
                        <span class="info-value">${props.tasso_di_popolazione_straniera ? parseFloat(props.tasso_di_popolazione_straniera).toFixed(2) + '%' : 'N/D'}</span>
                    </div>
					    <div class="info-item">
        <span class="info-label">Stranieri Non-UE:</span>
        <span class="info-value">${props.tasso_stranieri_non_ue ? parseFloat(props.tasso_stranieri_non_ue).toFixed(2) + '%' : 'N/D'}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Giovani Stranieri:</span>
        <span class="info-value">${props.tasso_giovani_stranieri ? parseFloat(props.tasso_giovani_stranieri).toFixed(2) + '%' : 'N/D'}</span>
    </div>
</div>
									
                </div>
                <div class="info-group">
                    <h3><i class="fas fa-briefcase"></i> Socio-Economici</h3>
                    <div class="info-item">
                        <span class="info-label">Tasso Occupazione:</span>
                        <span class="info-value">${props.tasso_di_occupazione ? parseFloat(props.tasso_di_occupazione).toFixed(2) + '%' : 'N/D'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Occup. Femminile:</span>
                        <span class="info-value">${props['tasso di occupazione femminile'] ? parseFloat(props['tasso di occupazione femminile']).toFixed(2) + '%' : 'N/D'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Divario Genere:</span>
                        <span class="info-value">${props['divario di genere nell\'occupazione'] ? parseFloat(props['divario di genere nell\'occupazione']).toFixed(2) + '%' : 'N/D'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Istruzione Superiore:</span>
                        <span class="info-value">${props['tasso di istruzione superiore'] ? parseFloat(props['tasso di istruzione superiore']).toFixed(2) + '%' : 'N/D'}</span>
                    </div>
                </div>

                <div class="info-group">
                    <h3><i class="fas fa-chart-line"></i> Indici</h3>
					<div class="info-item">
    <span class="info-label">Istruzione Superiore:</span>
    <span class="info-value">${props['tasso di istruzione superiore'] ? parseFloat(props['tasso di istruzione superiore']).toFixed(2) + '%' : 'N/D'}</span>
</div>
<div class="info-item">
    <span class="info-label">Basso Tasso Istruzione:</span>
    <span class="info-value">${props.basso_tasso_di_istruzione ? parseFloat(props.basso_tasso_di_istruzione).toFixed(2) + '%' : 'N/D'}</span>
</div>
<div class="info-item">
    <span class="info-label">Integrazione Lavoro:</span>
    <span class="info-value">${props['tasso di integrazione del lavoro'] ? parseFloat(props['tasso di integrazione del lavoro']).toFixed(2) + '%' : 'N/D'}</span>
</div>
                    <div class="info-item">
                        <span class="info-label">Resilienza Economica:</span>
                        <span class="info-value">${props['resilienza_economica'] ? parseFloat(props['resilienza_economica']).toFixed(2) : 'N/D'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Coesione Sociale:</span>
                        <span class="info-value">${props.indice_coesione_sociale ? parseFloat(props.indice_coesione_sociale).toFixed(2) : 'N/D'}</span>
                    </div>
                </div>

                <div class="info-group">
                    <h3><i class="fas fa-hammer"></i> Territoriali</h3>
                    <div class="info-item">
                        <span class="info-label">Numero edifici per particella:</span>
                        <span class="info-value">${props.buildings_count || 'N/D'}</span>
                    </div>
					    <div class="info-item">
        <span class="info-label">Densità Abitativa:</span>
        <span class="info-value">${props['densità abitativa'] ? parseFloat(props['densità abitativa']).toLocaleString('it-IT', {maximumFractionDigits: 2}) + ' ab/km²' : 'N/D'}</span>
    </div>
	    <div class="info-item">
        <span class="info-label">Superficie:</span>
        <span class="info-value">${props['superfice mq'] ? parseFloat(props['superfice mq']).toLocaleString('it-IT', {maximumFractionDigits: 2}) + ' m²' : 'N/D'}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Quota al suolo Min:</span>
        <span class="info-value">${props.elevation_min ? parseFloat(props.elevation_min).toFixed(2) + ' m' : 'N/D'}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Quota al suolo Max:</span>
        <span class="info-value">${props.elevation_max ? parseFloat(props.elevation_max).toFixed(2) + ' m' : 'N/D'}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Occupazione Media Edificio:</span>
        <span class="info-value">${props['occupazione media dell\'edificio'] ? parseFloat(props['occupazione media dell\'edificio']).toFixed(2) + '%' : 'N/D'}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Dipendenza Strutturale:</span>
        <span class="info-value">${props.indice_dipendenza_strutturale ? parseFloat(props.indice_dipendenza_strutturale).toFixed(2) + '%' : 'N/D'}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Indice Robustezza:</span>
        <span class="info-value">${props['indice di robustezza'] ? parseFloat(props['indice di robustezza']).toFixed(2) : 'N/D'}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Opportunità Riqualificazione:</span>
        <span class="info-value">${props['opport_riqualificazione'] ? parseFloat(props['opport_riqualificazione']).toFixed(2) : 'N/D'}</span>
    </div>
	
	
	
    <div class="info-item">
        <span class="info-label">Potenziale Immobiliare:</span>
        <span class="info-value">${props['potenziale_immobiliare'] ? parseFloat(props['potenziale_immobiliare']).toFixed(2) : 'N/D'}</span>
    </div>
                    <div class="info-item">
                        <span class="info-label">CAP:</span>
                        <span class="info-value">${props.postal_code || 'N/D'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Rischio alluvione:</span>
                        <span class="info-value">${floodRiskLabels[props['Ri alluvione']] || props['Ri alluvione'] || 'N/D'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Rischio di frana:</span>
                        <span class="info-value">${landslideRiskLabels[props['rischio di frana']] || props['rischio di frana'] || 'N/D'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Rischio erosione costiera:</span>
                        <span class="info-value">${coastalErosionLabels[props['rischio di erosione costiera']] || props['rischio di erosione costiera'] || 'N/D'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Rischio sismico:</span>
                        <span class="info-value">${seismicRiskLabels[props['rischio sismico']] || props['rischio sismico'] || 'N/D'}</span>
                    </div>
                </div>
            `;
            
            panel.classList.add('visible');
        }

        function closeInfoPanel() {
            document.getElementById('info-panel').classList.remove('visible');
        }

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
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
});

// Correggi il typo nella funzione applyMandamentoFilter
function applyMandamentoFilter(mandamento) {
    console.log('Applicando filtro mandamento:', mandamento);
    // Salva l'indicatore corrente
    const activeTheme = currentTheme;
    
    // Aggiorna il filtro corrente
    currentMandamentoFilter = mandamento || null;
    
    // AGGIUNTA: Mantieni la selezione visibile nel dropdown
    const mandamentoSelect = document.getElementById('mandamento-filter');
    if (mandamentoSelect) {
        mandamentoSelect.value = mandamento || '';
    }
    
    const filter = getCurrentFilter();
    console.log('Filtro combinato:', filter);
    
    // Applica filtro ai layer base
    map.setFilter('catastale-base', filter);
    map.setFilter('catastale-hover', ['==', ['get', 'fid'], '']); // Reset hover
    map.setFilter('catastale-outline', filter);
    
    // Se c'è un indicatore attivo (non uso del suolo), riapplicalo
    if (activeTheme && activeTheme !== 'landuse') {
        applyTheme(activeTheme);
    } else {
        // Altrimenti assicurati che il layer base sia visibile
        if (map.getLayer('catastale-thematic')) {
            map.removeLayer('catastale-thematic');
        }
        map.setPaintProperty('catastale-base', 'fill-opacity', 0.75);
        showBaseLegenda();
    }
	
	
}// Registra il protocollo PMTiles
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

// Configurazione mappa
const center = [13.3614, 38.1157];
const zoom = 14;
const maxBounds = [
    [13.32, 38.09],
    [13.40, 38.14]
];

// Colori uso del suolo dal file QML
const landUseColors = {
    "servizi": "rgba(250,240,230,0.75)",
    "military": "rgba(85,107,47,0.75)",
    "park": "rgba(124,252,0,0.75)",
    "pedestrian": "rgba(123,123,123,0.75)",
    "protected": "rgba(255,192,192,0.75)",
    "recreation": "rgba(111, 167, 183 , 75%)",
    "religious": "rgba(221,101,251,1.0)",
    "residential": "rgba(255,230,153,0.75)",
    "education": "rgba(226,160,54,0.75)",
    "medical": "rgba(222,37,37,0.75)",
    "transportation": "rgba(192,192,192,0.75)",
    "": "rgba(240,240,240,0.75)"
};

const landUseLabels = {
    "servizi": "Servizi",
    "military": "Militare",
    "park": "Verde Pubblico",
    "pedestrian": "Pedonale",
    "protected": "Storico",
    "recreation": "Ricreativo",
    "religious": "Religioso",
    "residential": "Residenziale",
    "education": "Educativo",
    "medical": "Ospedale",
    "transportation": "Trasporti",
    "": "Non Classificato"
};

// Definizioni per le nuove mappe tematiche
const landCoverColors = {
    "1110": "rgba(255,255,100,0.7)",
    "2111": "rgba(34,139,34,0.7)",
    "2112": "rgba(152,251,152,0.7)",
    "2212": "rgba(0,100,0,0.7)"
};

const landCoverLabels = {
    "1110": "Superfici artificiali (Aree urbane)",
    "2111": "Vegetazione erbacea permanente",
    "2112": "Vegetazione erbacea temporanee",
    "2212": "Foreste"
};

const floodRiskColors = {
    "alto": "rgba(255,0,0,0.7)",
    "no": "rgba(200,200,200,0.5)"
};

const floodRiskLabels = {
    "alto": "Alto rischio - R4",
    "no": "Nessun rischio"
};

const landslideRiskColors = {
    "none": "rgba(200,200,200,0.5)"
};

const landslideRiskLabels = {
    "none": "Nessun rischio"
};

const coastalErosionColors = {
    "none": "rgba(200,200,200,0.5)"
};

const coastalErosionLabels = {
    "none": "Nessun rischio"
};

const seismicRiskColors = {
    "low": "rgba(0,255,0,0.7)"
};

const seismicRiskLabels = {
    "low": "Basso rischio"
};

// Variabili globali
let map;
let currentTheme = 'landuse';
let hoveredPolygon = null;
let currentMandamentoFilter = null;
let currentFoglioFilter = null;
let featuresData = [];
let availableFogli = [];

// Configurazioni tematizzazioni con Jenks-Fisher
const themes = {
    population: {
        name: 'Popolazione Stimata',
        property: 'popolazione_stimata',
        colors: ['#ffffff', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5', '#1976d2'],
        unit: 'abitanti',
        format: (val) => `${val || 'N/D'} abitanti`,
        jenksBreaks: [0, 0, 1, 3, 6, 12, 20, 35],
        type: 'jenks'
    },
    
    familySize: {
        name: 'Dimensione Media Famiglia',
        property: 'dimensione media della famiglia',
        colors: ['#ffffff', '#e8f5e8', '#c8e6c8', '#a5d6a5', '#82c782', '#5fb85f', '#3ca83c', '#2e7d32'],
        unit: 'componenti',
        format: (val) => `${val || 'N/D'} componenti`,
        jenksBreaks: [0, 0, 1.5, 2.2, 2.8, 3.5, 4.2, 5.0, 33],
        type: 'jenks'
    },
    
    masculinity: {
        name: 'Tasso di Mascolinità',
        property: 'tasso di mascolinità',
        colors: ['#ffffff', '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1976d2'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 45, 50, 55, 60, 70, 85, 100],
        type: 'jenks'
    },
    
    singlePerson: {
        name: 'Tasso Persona Singola',
        property: 'tasso_persona singola',
        colors: ['#ffffff', '#fff3e0', '#ffe0b2', '#ffcc80', '#ffb74d', '#ffa726', '#ff9800', '#f57c00'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 15, 25, 35, 45, 60, 80, 100],
        type: 'jenks'
    },
    
    largeFamilies: {
        name: 'Tasso Famiglie Numerose',
        property: 'tasso_famiglie_numerose',
        colors: ['#ffffff', '#f1f8e9', '#dcedc8', '#c5e1a5', '#aed581', '#9ccc65', '#8bc34a', '#689f38'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 5, 12, 20, 30, 45, 65, 100],
        type: 'jenks'
    },
    
    femaleEmployment: {
        name: 'Tasso Occupazione Femminile',
        property: 'tasso di occupazione femminile',
        colors: ['#ffffff', '#fce4ec', '#f8bbd9', '#f48fb1', '#f06292', '#ec407a', '#e91e63', '#c2185b'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 20, 35, 45, 55, 70, 85, 100],
        type: 'jenks'
    },

    higherEducation: {
        name: 'Tasso Istruzione Superiore',
        property: 'tasso di istruzione superiore',
        colors: ['#ffffff', '#e8f5e8', '#c8e6c8', '#a5d6a5', '#82c782', '#5fb85f', '#3ca83c', '#1b5e20'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 15, 25, 35, 50, 65, 80, 100],
        type: 'jenks'
    },
    
    lowEducation: {
        name: 'Basso Tasso Istruzione',
        property: 'basso_tasso_di_istruzione',
        colors: ['#ffffff', '#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#d32f2f'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 10, 20, 35, 50, 65, 80, 100],
        type: 'jenks'
    },
    
    workIntegration: {
        name: 'Tasso Integrazione Lavoro',
        property: 'tasso di integrazione del lavoro',
        colors: ['#ffffff', '#e0f2f1', '#b2dfdb', '#80cbc4', '#4db6ac', '#26a69a', '#009688', '#00695c'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 20, 35, 50, 65, 75, 85, 100],
        type: 'jenks'
    },
    
    nonEuForeigners: {
        name: 'Tasso Stranieri Non-UE',
        property: 'tasso_stranieri_non_ue',
        colors: ['#ffffff', '#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#7b1fa2'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 8, 18, 30, 45, 60, 80, 100],
        type: 'jenks'
    },
    
    youngForeigners: {
        name: 'Tasso Giovani Stranieri',
        property: 'tasso_giovani_stranieri',
        colors: ['#ffffff', '#fff8e1', '#ffecb3', '#ffe082', '#ffd54f', '#ffca28', '#ffc107', '#ffa000'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 12, 22, 35, 50, 65, 80, 100],
        type: 'jenks'
    },
    
    age: {
        name: 'Età Media',
        property: 'età_media',
        colors: ['#ffffff', '#ffe0b2', '#ffcc80', '#ffb74d', '#ffa726', '#ff9800', '#fb8c00', '#f57c00'],
        unit: 'anni',
        format: (val) => `${val || 'N/D'} anni`,
        jenksBreaks: [0, 0, 25, 35, 45, 55, 65, 75, 80],
        type: 'jenks'
    },
    
    elderly: {
        name: 'Tasso Anziani',
        property: 'tasso_anziani',
        colors: ['#f1f8e9', '#dcedc8', '#c5e1a5', '#aed581', '#9ccc65', '#8bc34a', '#7cb342', '#689f38'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 5.2, 15.4, 25.1, 35.4, 44.7, 52.1, 58.8],
        type: 'jenks'
    },
    
    density: {
        name: 'Densità Abitativa',
        property: 'densità abitativa',
        colors: ['#fce4ec', '#f8bbd9', '#f48fb1', '#f06292', '#ec407a', '#e91e63', '#d81b60', '#c2185b'],
        unit: 'ab/km²',
        format: (val) => `${val?.toLocaleString() || 'N/D'} ab/km²`,
        jenksBreaks: [0, 0, 1000, 3500, 7500, 15000, 30000, 60000, 194093],
        type: 'jenks'
    },
    
    foreign: {
        name: 'Popolazione Straniera',
        property: 'tasso_di_popolazione_straniera',
        colors: ['#e0f2f1', '#b2dfdb', '#80cbc4', '#4db6ac', '#26a69a', '#009688', '#00897b', '#00695c'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 5, 12, 22, 35, 50, 70, 100],
        type: 'jenks'
    },

    employment: {
        name: 'Tasso Occupazione',
        property: 'tasso_di_occupazione',
        colors: ['#ffffff', '#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#8e24aa'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 12, 25, 40, 55, 70, 85, 100],
        type: 'jenks'
    },

    genderGap: {
        name: 'Divario Genere Occupazione',
        property: 'divario di genere nell\'occupazione',
        colors: ['#4caf50', '#81c784', '#fff59d', '#ffcc02', '#ff9800', '#ff5722', '#d32f2f', '#b71c1c'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [-67, -30, -10, 0, 15, 30, 50, 75, 100],
        type: 'jenks'
    },

    resilience: {
        name: 'Resilienza Economica',
        property: 'resilienza_economica',
        colors: ['#ffffff', '#fff8e1', '#ffecb3', '#ffe082', '#ffd54f', '#ffca28', '#ffc107', '#ffa000'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 12.5, 25, 37.5, 50, 62.5, 75, 100],
        type: 'jenks'
    },

    cohesion: {
        name: 'Coesione Sociale',
        property: 'indice_coesione_sociale',
        colors: ['#ffffff', '#e1f5fe', '#b3e5fc', '#81d4fa', '#4fc3f7', '#29b6f6', '#03a9f4', '#0288d1'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 12, 24, 36, 48, 60, 72, 96.7],
        type: 'jenks'
    },
    
    surface_area: {
        name: 'Superficie Particella',
        property: 'superfice mq',
        colors: ['#ffffff', '#f0f4c3', '#dce775', '#cddc39', '#aed581', '#8bc34a', '#689f38', '#33691e'],
        unit: 'm²',
        format: (val) => `${val?.toLocaleString('it-IT', {maximumFractionDigits: 2}) || 'N/D'} m²`,
        jenksBreaks: [0, 9.77, 85, 180, 320, 580, 1200, 3500, 75549],
        type: 'jenks'
    },

    elevation_min: {
        name: 'Elevazione Minima',
        property: 'elevation_min',
        colors: ['#ffffff', '#e8f5e8', '#c8e6c8', '#a5d6a5', '#82c782', '#5fb85f', '#3ca83c', '#1b5e20'],
        unit: 'm',
        format: (val) => `${val || 'N/D'} m`,
        jenksBreaks: [0, 0, 2, 5, 8, 12, 18, 25, 38.2],
        type: 'jenks'
    },

    elevation_max: {
        name: 'Elevazione Massima',
        property: 'elevation_max',
        colors: ['#ffffff', '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#0d47a1'],
        unit: 'm',
        format: (val) => `${val || 'N/D'} m`,
        jenksBreaks: [0, 0, 3, 6, 10, 15, 20, 28, 38.7],
        type: 'jenks'
    },

    building_occupancy: {
        name: 'Occupazione Media Edificio',
        property: 'occupazione media dell\'edificio',
        colors: ['#ffffff', '#fff3e0', '#ffe0b2', '#ffcc80', '#ffb74d', '#ffa726', '#ff9800', '#e65100'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 2, 4, 7, 12, 18, 25, 33],
        type: 'jenks'
    },

    structural_dependency: {
        name: 'Indice Dipendenza Strutturale',
        property: 'indice_dipendenza_strutturale',
        colors: ['#ffffff', '#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#b71c1c'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 12, 25, 40, 58, 75, 88, 100],
        type: 'jenks'
    },

    robustness: {
        name: 'Indice di Robustezza',
        property: 'indice di robustezza',
        colors: ['#ffffff', '#f1f8e9', '#dcedc8', '#c5e1a5', '#aed581', '#9ccc65', '#8bc34a', '#33691e'],
        unit: '',
        format: (val) => `${val || 'N/D'}`,
        jenksBreaks: [0, 0, 0.15, 0.3, 0.45, 0.6, 0.8, 1.0, 1.2],
        type: 'jenks'
    },

    requalification_opportunity: {
        name: 'Opportunità di Riqualificazione',
        property: 'opport_riqualificazione',
        colors: ['#ffffff', '#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#4a148c'],
        unit: '',
        format: (val) => `${val || 'N/D'}`,
        jenksBreaks: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        type: 'jenks'
    },

    real_estate_potential: {
        name: 'Potenziale Immobiliare',
        property: 'potenziale_immobiliare',
        colors: ['#ffffff', '#e0f2f1', '#b2dfdb', '#80cbc4', '#4db6ac', '#26a69a', '#009688', '#004d40'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 10, 20, 35, 50, 65, 75, 85],
        type: 'jenks'
    },

    buildings: {
        name: 'Numero edifici per particella',
        property: 'buildings_count',
        colors: ['#ffffff', '#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#d32f2f'],
        unit: 'edifici',
        format: (val) => `${val || 'N/D'} edifici`,
        jenksBreaks: [0, 1, 2, 3, 4, 6, 9, 15, 23],
        type: 'jenks'
    },
    
    land_cover: {
        name: 'Copertura del suolo',
        property: 'copertura del suolo',
        colors: ['#FFFF64', '#228B22', '#90EE90', '#006400'],
        unit: '',
        format: (val) => landCoverLabels[val] || val || 'N/D',
        type: 'categorical'
    },
    
    flood_risk: {
        name: 'Rischio alluvione',
        property: 'Ri alluvione',
        colors: ['#FF0000', '#C8C8C8'],
        unit: '',
        format: (val) => floodRiskLabels[val] || val || 'N/D',
        type: 'categorical'
    },
    
    landslide_risk: {
        name: 'Rischio di frana',
        property: 'rischio di frana',
        colors: ['#C8C8C8'],
        unit: '',
        format: (val) => landslideRiskLabels[val] || val || 'N/D',
        type: 'categorical'
    },
    
    coastal_erosion: {
        name: 'Rischio erosione costiera',
        property: 'rischio di erosione costiera',
        colors: ['#C8C8C8'],
        unit: '',
        format: (val) => coastalErosionLabels[val] || val || 'N/D',
        type: 'categorical'
    },
    
    seismic_risk: {
        name: 'Rischio sismico',
        property: 'rischio sismico',
        colors: ['#00FF00'],
        unit: '',
        format: (val) => seismicRiskLabels[val] || val || 'N/D',
        type: 'categorical'
    }
};




// Inizializza mappa
map = new maplibregl.Map({
    container: 'map',
    style: {
        version: 8,
        sources: {
            'carto-light': {
                type: 'raster',
                tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors, © CartoDB - Rielaborazione dataset di <a href="https://www.linkedin.com/in/gbvitrano/" title="@gbvitrano" target="_blank">@gbvitrano </a> - 2025 - by <a href="https://x.com/opendatasicilia" title="@opendatasicilia" target="_blank">@opendatasicilia</a>'
            },
            'satellite': {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
                tileSize: 256,
                attribution: '© Google - Rielaborazione dataset di <a href="https://www.linkedin.com/in/gbvitrano/" title="@gbvitrano" target="_blank">@gbvitrano </a> - 2025 - by <a href="https://x.com/opendatasicilia" title="@opendatasicilia" target="_blank">@opendatasicilia</a>'
            },
            'osm': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors - Rielaborazione dataset di <a href="https://www.linkedin.com/in/gbvitrano/" title="@gbvitrano" target="_blank">@gbvitrano </a> - 2025 - by <a href="https://x.com/opendatasicilia" title="@opendatasicilia" target="_blank">@opendatasicilia</a>'
            },
            'google-maps': {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'],
                tileSize: 256,
                attribution: '© Google Maps - Rielaborazione dataset di <a href="https://www.linkedin.com/in/gbvitrano/" title="@gbvitrano" target="_blank">@gbvitrano </a> - 2025 - by <a href="https://x.com/opendatasicilia" title="@opendatasicilia" target="_blank">@opendatasicilia</a>'
            }
        },
        layers: [
            {
                id: 'carto-light-layer',
                type: 'raster',
                source: 'carto-light',
                minzoom: 0,
                maxzoom: 17
            },
            {
                id: 'satellite-layer',
                type: 'raster',
                source: 'satellite',
                minzoom: 0,
                maxZoom: 17,
                layout: { visibility: 'none' }
            },
            {
                id: 'osm-layer',
                type: 'raster',
                source: 'osm',
                minzoom: 0,
                maxZoom: 19,
                layout: { visibility: 'none' }
            },
            {
                id: 'google-maps-layer',
                type: 'raster',
                source: 'google-maps',
                minzoom: 0,
                maxZoom: 19,
                layout: { visibility: 'none' }
            }
        ]
    },
    center: center,
    zoom: zoom,
    maxBounds: maxBounds,
    maxZoom: 17,
    minZoom: 12,
    hash: true,
    pitch: 0,
    dragRotate: false
});

// Funzione per popolare il filtro dei fogli
function populateFoglioFilter() {
    // Aspetta che la mappa sia completamente caricata
    if (map.isSourceLoaded('palermo_catastale')) {
        const features = map.querySourceFeatures('palermo_catastale', {
            sourceLayer: 'catastale'
        });
        
        console.log('Numero features trovate:', features.length);
        
        if (features.length > 0) {
            const foglioSet = new Set();
            features.forEach(feature => {
                const foglio = feature.properties.foglio;
                if (foglio && foglio !== null && foglio !== '') {
                    foglioSet.add(foglio);
                }
            });
            
            availableFogli = Array.from(foglioSet).sort((a, b) => {
                const numA = parseInt(a);
                const numB = parseInt(b);
                if (!isNaN(numA) && !isNaN(numB)) {
                    return numA - numB;
                }
                return a.localeCompare(b);
            });
            
            console.log('Fogli trovati:', availableFogli);
            updateFoglioDropdown();
            
            // AGGIUNTA: Ripristina la selezione corrente dopo aver aggiornato il dropdown
            restoreFilterSelections();
        }
    } else {
        // Riprova dopo un breve delay
        setTimeout(populateFoglioFilter, 1000);
    }
}

// Funzione per aggiornare il dropdown dei fogli
function updateFoglioDropdown() {
    const foglioSelect = document.getElementById('foglio-filter');
    const currentSelection = foglioSelect.value; // Salva la selezione corrente
    
    // Rimuovi tutte le opzioni tranne la prima (Tutti i Fogli)
    while (foglioSelect.children.length > 1) {
        foglioSelect.removeChild(foglioSelect.lastChild);
    }
    
    // Aggiungi le opzioni per ogni foglio
    availableFogli.forEach(foglio => {
        const option = document.createElement('option');
        option.value = foglio;
        option.textContent = `Foglio ${foglio}`;
        foglioSelect.appendChild(option);
    });
    
    // Ripristina la selezione precedente se era valida
    if (currentSelection && availableFogli.includes(currentSelection)) {
        foglioSelect.value = currentSelection;
    } else if (currentFoglioFilter && availableFogli.includes(currentFoglioFilter)) {
        foglioSelect.value = currentFoglioFilter;
    }
    
    console.log('Dropdown aggiornato con', availableFogli.length, 'fogli');
}

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

// Controllo informazioni
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

// Funzioni per gestire il popup informazioni
function showInfoPopup() {
    document.getElementById('popup-overlay').classList.add('visible');
    document.getElementById('info-popup').classList.add('visible');
}

function closeInfoPopup() {
    document.getElementById('popup-overlay').classList.remove('visible');
    document.getElementById('info-popup').classList.remove('visible');
}

// Caricamento mappa
map.on('load', function() {
    console.log('Mappa caricata');
    
    // Aggiungi sorgente PMTiles
    map.addSource('palermo_catastale', {
        type: 'vector',
        url: 'pmtiles://https://palermohub.github.io/cspa/dati/pacs.pmtiles'
    });
    
    // Layer base - uso del suolo
    map.addLayer({
        id: 'catastale-base',
        type: 'fill',
        source: 'palermo_catastale',
        'source-layer': 'catastale',
        paint: {
            'fill-color': [
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
            ],
            'fill-opacity': 0.75,
            'fill-antialias': true
        }
    });

    // Layer hover
    map.addLayer({
        id: 'catastale-hover',
        type: 'fill',
        source: 'palermo_catastale',
        'source-layer': 'catastale',
        paint: {
            'fill-color': '#ff9900',
            'fill-opacity': 0.8
        },
        filter: ['==', ['get', 'fid'], '']
    });

    // Layer contorni - inizialmente nascosti
    map.addLayer({
        id: 'catastale-outline',
        type: 'line',
        source: 'palermo_catastale',
        'source-layer': 'catastale',
        paint: {
            'line-color': '#333333',
            'line-width': 0.5,
            'line-opacity': 0.6
        },
        layout: {
            'visibility': 'none'
        }
    });

    // LAYER PERIMETRI AGGIUNTIVI
    
    // Perimetro Palermo - tratteggio lungo (12px line, 8px gap)
    map.addLayer({
        id: 'palermo-perimeter',
        type: 'line',
        source: 'palermo_catastale',
        'source-layer': 'Palermo',
        paint: {
            'line-color': '#ff0000',
            'line-width': 2,
            'line-opacity': 0.8,
            'line-dasharray': [12, 8]
        },
        layout: {
            'visibility': 'none'
        }
    }, 'catastale-hover');

    // Centro Storico - tratteggio medio (8px line, 6px gap)
    map.addLayer({
        id: 'centro-storico-perimeter',
        type: 'line',
        source: 'palermo_catastale',
        'source-layer': 'centro_storico',
        paint: {
            'line-color': '#4a4a4a',
            'line-width': 1.5,
            'line-opacity': 0.8,
            'line-dasharray': [8, 6]
        },
        layout: {
            'visibility': 'none'
        }
    }, 'catastale-hover');

    // UPL Centro Storico - tratteggio corto (4px line, 4px gap)
    map.addLayer({
        id: 'upl-cs-perimeter',
        type: 'line',
        source: 'palermo_catastale',
        'source-layer': 'upl_cs',
        paint: {
            'line-color': '#4a4a4a',
            'line-width': 1,
            'line-opacity': 0.8,
            'line-dasharray': [4, 4]
        },
        layout: {
            'visibility': 'visible'
        }
    }, 'catastale-hover');
    
    // Controlli navigazione
	map.addControl(new SearchControl(), 'top-right');
    map.addControl(new maplibregl.NavigationControl());
    map.addControl(new InfoControl(), 'top-right');

					
    // Imposta il valore di default per uso del suolo
    document.getElementById('territorial-select').value = 'landuse';
    
    // Mostra legenda di base
    showBaseLegenda();
    
    console.log('Tutti i layer aggiunti');
});

// Aspetta che la sorgente sia caricata per popolare i fogli
map.on('sourcedata', function(e) {
    if (e.sourceId === 'palermo_catastale' && e.isSourceLoaded) {
        console.log('Sorgente PMTiles caricata');
        // Aspetta un momento per essere sicuri che i dati siano pronti
        setTimeout(populateFoglioFilter, 500);
    }
});

// Funzione per creare il filtro combinato (mandamento + foglio)
function getCurrentFilter() {
    const filters = [];
    
    if (currentMandamentoFilter && currentMandamentoFilter !== '') {
        // Mappa il nome dell'interfaccia al nome del database
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

// Funzione per applicare il filtro foglio
function applyFoglioFilter(foglio) {
    console.log('Applicando filtro foglio:', foglio);
    // Salva l'indicatore corrente
    const activeTheme = currentTheme;
    
    // Aggiorna il filtro corrente
    currentFoglioFilter = foglio || null;
    
    // AGGIUNTA: Mantieni la selezione visibile nel dropdown
    const foglioSelect = document.getElementById('foglio-filter');
    if (foglioSelect) {
        foglioSelect.value = foglio || '';
    }
    
    const filter = getCurrentFilter();
    console.log('Filtro combinato:', filter);
    
    // Applica filtro ai layer base
    map.setFilter('catastale-base', filter);
    map.setFilter('catastale-hover', ['==', ['get', 'fid'], '']); // Reset hover
    map.setFilter('catastale-outline', filter);
    
    // Se c'è un indicatore attivo (non uso del suolo), riapplicalo
    if (activeTheme && activeTheme !== 'landuse') {
        applyTheme(activeTheme);
    } else {
        // Altrimenti assicurati che il layer base sia visibile
        if (map.getLayer('catastale-thematic')) {
            map.removeLayer('catastale-thematic');
        }
        map.setPaintProperty('catastale-base', 'fill-opacity', 0.75);
        showBaseLegenda();
    }
}

// Funzione modificata per applicare il filtro mandamento
function applyMandamentoFilter(mandamento) {
    console.log('Applicando filtro mandamento:', mandamento);
    // Salva l'indicatore corrente
    const activeTheme = currentTheme;
    
    // Aggiorna il filtro corrente
    currentMandamentoFilter = mandamento || null;
    
    const filter = getCurrentFilter();
    console.log('Filtro combinato:', filter);
    
    // Applica filtro ai layer base
    map.setFilter('catastale-base', filter);
    map.setFilter('catastale-hover', ['==', ['get', 'fid'], '']); // Reset hover
    map.setFilter('catastale-outline', filter);
    
    // Se c'è un indicatore attivo (non uso del suolo), riapplicalo
    if (activeTheme && activeThema !== 'landuse') {
        applyTheme(activeTheme);
    } else {
        // Altrimenti assicurati che il layer base sia visibile
        if (map.getLayer('catastale-thematic')) {
            map.removeLayer('catastale-thematic');
        }
        map.setPaintProperty('catastale-base', 'fill-opacity', 0.75);
        showBaseLegenda();
    }
}

// AGGIUNTA: Funzione per ripristinare le selezioni dei filtri (utile dopo aggiornamenti)
function restoreFilterSelections() {
    // Ripristina selezione mandamento
    if (currentMandamentoFilter) {
        const mandamentoSelect = document.getElementById('mandamento-filter');
        if (mandamentoSelect) {
            mandamentoSelect.value = currentMandamentoFilter;
        }
    }
    
    // Ripristina selezione foglio
    if (currentFoglioFilter) {
        const foglioSelect = document.getElementById('foglio-filter');
        if (foglioSelect) {
            foglioSelect.value = currentFoglioFilter;
        }
    }
}



// Gestione hover
map.on('mouseenter', 'catastale-base', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    
    if (e.features.length > 0) {
        const feature = e.features[0];
        const featureId = feature.properties.fid || feature.properties.particella || feature.id;
        
        if (hoveredPolygon !== null) {
            map.setFilter('catastale-hover', ['==', ['get', 'fid'], '']);
        }
        
        hoveredPolygon = featureId;
        map.setFilter('catastale-hover', [
            'any',
            ['==', ['get', 'fid'], featureId],
            ['==', ['get', 'particella'], featureId]
        ]);
    }
});

map.on('mouseleave', 'catastale-base', () => {
    map.getCanvas().style.cursor = '';
    
    if (hoveredPolygon !== null) {
        map.setFilter('catastale-hover', ['==', ['get', 'fid'], '']);
    }
    hoveredPolygon = null;
});

// Gestione click
map.on('click', 'catastale-base', (e) => {
    if (e.features.length > 0) {
        const feature = e.features[0];
        showFeatureInfo(feature);
    }
});

// Funzioni controllo perimetri
function togglePerimeter(layerId, show) {
    const visibility = show ? 'visible' : 'none';
    map.setLayoutProperty(layerId, 'visibility', visibility);
}

function toggleBorders(show) {
    const visibility = show ? 'visible' : 'none';
    map.setLayoutProperty('catastale-outline', 'visibility', visibility);
}

// Event listeners per i controlli
function switchBasemap(value) {
    const layers = [
        'carto-light-layer', 
        'satellite-layer',
        'osm-layer',
        'google-maps-layer'
    ];
    
    const targetLayer = value === 'carto-light' ? 'carto-light-layer' :
                        value === 'satellite' ? 'satellite-layer' :
                        value === 'osm' ? 'osm-layer' :
                        'google-maps-layer';
    
    layers.forEach(layerId => {
        const visibility = (layerId === targetLayer) ? 'visible' : 'none';
        map.setLayoutProperty(layerId, 'visibility', visibility);
    });
}

function resetAllSelects(exceptId) {
    const selects = ['demographic-select', 'economic-select', 'territorial-select'];
    selects.forEach(selectId => {
        if (selectId !== exceptId) {
            document.getElementById(selectId).value = '';
        }
    });
}

function activateTheme(themeKey) {
    if (themeKey === 'landuse' || themeKey === '' || !themeKey) {
        removeTheme();
    } else {
        applyTheme(themeKey);
    }
}

// Funzioni tematizzazione
function applyTheme(themeKey) {
    const theme = themes[themeKey];
    if (!theme) return;

    if (map.getLayer('catastale-thematic')) {
        map.removeLayer('catastale-thematic');
    }

    const currentFilter = getCurrentFilter();

    let layerConfig = {
        id: 'catastale-thematic',
        type: 'fill',
        source: 'palermo_catastale',
        'source-layer': 'catastale',
        paint: {
            'fill-opacity': 0.8
        }
    };

    // Configurazione specifica per temi con Jenks-Fisher
    if (themeKey === 'buildings' || themeKey === 'population' || themeKey === 'age' || themeKey === 'elderly' || 
        themeKey === 'density' || themeKey === 'foreign' || themeKey === 'familySize' || themeKey === 'masculinity' || 
        themeKey === 'singlePerson' || themeKey === 'largeFamilies' || themeKey === 'femaleEmployment' || 
        themeKey === 'genderGap' || themeKey === 'higherEducation' || themeKey === 'lowEducation' || 
        themeKey === 'workIntegration' || themeKey === 'nonEuForeigners' || themeKey === 'youngForeigners' ||
        themeKey === 'resilience' || themeKey === 'cohesion' || themeKey === 'employment' ||
        themeKey === 'surface_area' || themeKey === 'elevation_min' || themeKey === 'elevation_max' ||
        themeKey === 'building_occupancy' || themeKey === 'structural_dependency' || themeKey === 'robustness' ||
        themeKey === 'requalification_opportunity' || themeKey === 'real_estate_potential') {
        
        const jenksBreaks = theme.jenksBreaks;
        
        if (themeKey === 'population') {
            // Configurazione specifica per popolazione con 7 classi effettive
            layerConfig.paint['fill-color'] = [
                'step',
                ['coalesce', ['get', theme.property], 0],
                theme.colors[0], // 0 abitanti
                jenksBreaks[2], theme.colors[1], // 1 abitante
                jenksBreaks[3], theme.colors[2], // 2-5 abitanti
                jenksBreaks[4], theme.colors[3], // 6-15 abitanti
                jenksBreaks[5], theme.colors[4], // 16-35 abitanti
                jenksBreaks[6], theme.colors[5], // 36-70 abitanti
                jenksBreaks[7], theme.colors[6]  // 71-166 abitanti
            ];
        } else if (themeKey === 'genderGap') {
            layerConfig.paint['fill-color'] = [
                'step',
                ['coalesce', ['get', theme.property], -67],
                theme.colors[0], // -67 a -31%
                jenksBreaks[2], theme.colors[1], // -30 a -11%
                jenksBreaks[3], theme.colors[2], // -10 a -1%
                jenksBreaks[4], theme.colors[3], // 0 a 14%
                jenksBreaks[5], theme.colors[4], // 15 a 29%
                jenksBreaks[6], theme.colors[5], // 30 a 49%
                jenksBreaks[7], theme.colors[6], // 50 a 74%
                jenksBreaks[8], theme.colors[7]  // 75 a 100%
            ];
        } else {
            // Configurazione standard per altri temi Jenks
            layerConfig.paint['fill-color'] = [
                'step',
                ['coalesce', ['get', theme.property], 0],
                theme.colors[0],
                jenksBreaks[2], theme.colors[1],
                jenksBreaks[3], theme.colors[2],
                jenksBreaks[4], theme.colors[3],
                jenksBreaks[5], theme.colors[4],
                jenksBreaks[6], theme.colors[5],
                jenksBreaks[7], theme.colors[6],
                jenksBreaks[8], theme.colors[7]
            ];
        }
    }
    // Configurazione specifica per land_cover
    else if (themeKey === 'land_cover') {
        layerConfig.paint['fill-color'] = [
            'match',
            ['get', 'copertura del suolo'],
            '1110', landCoverColors['1110'],
            '2111', landCoverColors['2111'],
            '2112', landCoverColors['2112'],
            '2212', landCoverColors['2212'],
            'rgba(200,200,200,0.5)' // Default per valori non classificati
        ];
    } 
    else if (themeKey === 'flood_risk') {
        // CORREZIONE: Gestione robusta per rischio alluvione con normalizzazione dei valori
        layerConfig.paint['fill-color'] = [
            'match',
            ['downcase', ['coalesce', ['get', 'Ri alluvione'], '']],
            'alto', floodRiskColors['alto'],
            'no', floodRiskColors['no'],
            floodRiskColors['no']  // Default per valori non riconosciuti
        ];
    } 
    else if (themeKey === 'landslide_risk') {
        layerConfig.paint['fill-color'] = [
            'case',
            [
                'any',
                ['==', ['downcase', ['to-string', ['get', 'rischio di frana']]], 'none'],
                ['==', ['get', 'rischio di frana'], 'none'],
                ['==', ['get', 'rischio di frana'], null],
                ['==', ['get', 'rischio di frana'], '']
            ],
            landslideRiskColors['none'],
            'rgba(200,200,200,0.5)' // Default
        ];
    } 
    else if (themeKey === 'coastal_erosion') {
        layerConfig.paint['fill-color'] = [
            'case',
            [
                'any',
                ['==', ['downcase', ['to-string', ['get', 'rischio di erosione costiera']]], 'none'],
                ['==', ['get', 'rischio di erosione costiera'], 'none'],
                ['==', ['get', 'rischio di erosione costiera'], null],
                ['==', ['get', 'rischio di erosione costiera'], '']
            ],
            coastalErosionColors['none'],
            'rgba(200,200,200,0.5)' // Default
        ];
    } 
    else if (themeKey === 'seismic_risk') {
        layerConfig.paint['fill-color'] = [
            'case',
            [
                'any',
                ['==', ['downcase', ['to-string', ['get', 'rischio sismico']]], 'low'],
                ['==', ['get', 'rischio sismico'], 'low'],
                ['==', ['get', 'rischio sismico'], 'LOW']
            ],
            seismicRiskColors['low'],
            'rgba(200,200,200,0.5)' // Default
        ];
    } 
    else {
        // Configurazione standard per temi numerici (usa calcolo dinamico)
        let range = null;
        if (theme.type !== 'categorical') {
            const dynamicRange = calculateDynamicRange(themeKey);
            range = dynamicRange || getStaticRange(themeKey);
        }
        
        const step = (range.max - range.min) / (theme.colors.length - 1);
        layerConfig.paint['fill-color'] = [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', theme.property], range.min],
            range.min, theme.colors[0],
            range.min + step, theme.colors[1],
            range.min + (step * 2), theme.colors[2],
            range.min + (step * 3), theme.colors[3],
            range.min + (step * 4), theme.colors[4],
            range.min + (step * 5), theme.colors[5],
            range.min + (step * 6), theme.colors[6],
            range.max, theme.colors[7]
        ];
    }

    if (currentFilter) {
        layerConfig.filter = currentFilter;
    }

    map.addLayer(layerConfig, 'catastale-outline');
    map.setPaintProperty('catastale-base', 'fill-opacity', 0);
    
    currentTheme = themeKey;
    
    // Mostra legenda appropriata
    if (themeKey === 'buildings' || themeKey === 'population' || themeKey === 'age' || themeKey === 'elderly' || 
        themeKey === 'density' || themeKey === 'foreign' || themeKey === 'familySize' || themeKey === 'masculinity' || 
        themeKey === 'singlePerson' || themeKey === 'largeFamilies' || themeKey === 'femaleEmployment' || 
        themeKey === 'genderGap' || themeKey === 'higherEducation' || themeKey === 'lowEducation' || 
        themeKey === 'workIntegration' || themeKey === 'nonEuForeigners' || themeKey === 'youngForeigners' ||
        themeKey === 'resilience' || themeKey === 'cohesion' || themeKey === 'employment' ||
        themeKey === 'surface_area' || themeKey === 'elevation_min' || themeKey === 'elevation_max' ||
        themeKey === 'building_occupancy' || themeKey === 'structural_dependency' || themeKey === 'robustness' ||
        themeKey === 'requalification_opportunity' || themeKey === 'real_estate_potential') {
        showJenksLegend(theme);
    } else {
        const range = calculateDynamicRange(themeKey) || getStaticRange(themeKey);
        showLegend(theme, range);
    }
}

function removeTheme() {
    if (map.getLayer('catastale-thematic')) {
        map.removeLayer('catastale-thematic');
    }
    
    // Ripristina layer base con opacità corretta
    map.setPaintProperty('catastale-base', 'fill-opacity', 0.75);
    
    // Aplica il filtro corrente al layer base
    const filter = getCurrentFilter();
    map.setFilter('catastale-base', filter);
    
    currentTheme = 'landuse';
    showBaseLegenda();
}

function calculateDynamicRange(themeKey) {
    // Simula il calcolo del range dai dati filtrati
    if (!currentMandamentoFilter && !currentFoglioFilter) return null;
    
    const theme = themes[themeKey];
    if (!theme) return null;
    
    // Range ridotti per simulare l'effetto del filtro
    const filteredRanges = {
        employment: { min: 0, max: 90 },
        genderGap: { min: 0, max: 80 },
        education: { min: 0, max: 90 },
        resilience: { min: 0, max: 90 },
        cohesion: { min: 0, max: 90 }
    };
    
    return filteredRanges[themeKey];
}

function getStaticRange(themeKey) {
    // Range valori - tutti iniziano da 0
    const valueRanges = {
        employment: { min: 0, max: 100 },
        genderGap: { min: 0, max: 100 },
        education: { min: 0, max: 100 },
        resilience: { min: 0, max: 100 },
        cohesion: { min: 0, max: 100 }
    };
    
    return valueRanges[themeKey];
}