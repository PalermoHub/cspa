// ===== FILE: unified-filters.js =====
/**
 * SISTEMA FILTRI UNIFICATO CON SELECT PERSONALIZZATI E ICONE FONT AWESOME
 * REFACTORED: Usa CONFIG.fields per centralizzazione campi catastali
 */

// ===== STRUTTURE DATI UNIFICATE =====
let mandamentoFoglioMap = new Map();           // mandamento -> array di fogli
let foglioMandamentoMap = new Map();           // foglio -> mandamento
let availableFogli = [];                       // array di tutti i fogli ordinati
let completeSystemReady = false;

// ===== CONFIGURAZIONE SELECT PERSONALIZZATI =====
const customSelectOptions = {
    'demographic-select': [
        { value: '', text: 'Seleziona indicatore...', icon: '' },
        { value: 'population', text: 'Popolazione Stimata', icon: 'fas fa-users' },
        { value: 'masculinity', text: 'Tasso di Mascolinità', icon: 'fas fa-mars' },
        { value: 'singlePerson', text: 'Tasso Persona Singola', icon: 'fas fa-user' },
        { value: 'familySize', text: 'Dimensione Media Famiglia', icon: 'fas fa-home-heart' },
        { value: 'largeFamilies', text: 'Tasso Famiglie Numerose', icon: 'fas fa-users' },
        { value: 'age', text: 'Età Media', icon: 'fas fa-user-clock' },
        { value: 'elderly', text: 'Tasso Anziani', icon: 'fas fa-user-friends' },
        { value: 'foreign', text: 'Popolazione Straniera', icon: 'fas fa-globe' },
        { value: 'nonEuForeigners', text: 'Stranieri Non-UE', icon: 'fas fa-passport' },
        { value: 'youngForeigners', text: 'Giovani Stranieri', icon: 'fas fa-child' }
    ],
    'economic-select': [
        { value: '', text: 'Seleziona indicatore...', icon: '' },
        { value: 'higherEducation', text: 'Istruzione Superiore', icon: 'fas fa-graduation-cap' },
        { value: 'lowEducation', text: 'Basso Tasso Istruzione', icon: 'fas fa-book' },
        { value: 'workIntegration', text: 'Integrazione Lavoro', icon: 'fas fa-handshake' },
        { value: 'employment', text: 'Tasso Occupazione', icon: 'fas fa-briefcase' },
        { value: 'femaleEmployment', text: 'Tasso Occupazione Femminile', icon: 'fas fa-female' },
        { value: 'genderGap', text: 'Divario Genere Occupazione', icon: 'fas fa-balance-scale' },
        { value: 'resilience', text: 'Resilienza Economica', icon: 'fas fa-shield-alt' },
        { value: 'cohesion', text: 'Coesione Sociale', icon: 'fas fa-handshake' }
    ],
    'territorial-select': [
        { value: 'landuse', text: 'Seleziona indicatore...', icon: '' },
        { value: 'density', text: 'Densità Abitativa', icon: 'fas fa-home' },
        { value: 'surface_area', text: 'Superficie Particella', icon: 'fas fa-expand-arrows-alt' },
        { value: 'elevation_min', text: 'Elevazione Minima', icon: 'fas fa-mountain' },
        { value: 'elevation_max', text: 'Elevazione Massima', icon: 'fas fa-mountain' },
        { value: 'building_occupancy', text: 'Occupazione Media Edificio', icon: 'fas fa-building' },
        { value: 'structural_dependency', text: 'Dipendenza Strutturale', icon: 'fas fa-tools' },
        { value: 'robustness', text: 'Indice Robustezza', icon: 'fas fa-shield-alt' },
        { value: 'requalification_opportunity', text: 'Opportunità Riqualificazione', icon: 'fas fa-hammer' },
        { value: 'real_estate_potential', text: 'Potenziale Immobiliare', icon: 'fas fa-chart-line' },
        { value: 'buildings', text: 'Numero Edifici', icon: 'fas fa-city' },
        { value: 'flood_risk', text: 'Rischio alluvione', icon: 'fas fa-water' },
        { value: 'land_cover', text: 'Copertura del suolo', icon: 'fas fa-leaf' },
        { value: 'landslide_risk', text: 'Rischio di frana', icon: 'fas fa-mountain' },
        { value: 'coastal_erosion', text: 'Rischio erosione costiera', icon: 'fas fa-umbrella-beach' },
        { value: 'seismic_risk', text: 'Rischio sismico', icon: 'fas fa-house-damage' }
    ]
};

// ===== FUNZIONI SELECT PERSONALIZZATI =====

/**
 * Inizializza i select personalizzati sostituendo quelli HTML standard
 */
function initializeCustomSelects() {
    console.log('🎨 Inizializzazione select personalizzati con icone...');
    
    // Sostituisci i select standard con versioni personalizzate
    Object.keys(customSelectOptions).forEach(selectId => {
        const originalSelect = document.getElementById(selectId);
        if (originalSelect) {
            const customSelect = createCustomSelect(selectId, customSelectOptions[selectId]);
            originalSelect.parentNode.replaceChild(customSelect, originalSelect);
        }
    });
    
    // Aggiungi CSS per i select personalizzati se non esiste
    addCustomSelectStyles();
    
    console.log('✅ Select personalizzati inizializzati');
}

/**
 * Crea un select personalizzato con supporto per icone
 */
function createCustomSelect(selectId, options) {
    const container = document.createElement('div');
    container.className = 'custom-select';
    container.id = selectId;
    
    // Pulsante principale del select
    const button = document.createElement('div');
    button.className = 'select-button';
    button.onclick = () => toggleCustomSelect(selectId);
    
    const selectedSpan = document.createElement('span');
    selectedSpan.id = selectId + '-selected';
    selectedSpan.innerHTML = options[0].icon ? `<i class="${options[0].icon}"></i> ${options[0].text}` : options[0].text;
    
    button.appendChild(selectedSpan);
    
    // Container delle opzioni
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'select-options';
    optionsContainer.id = selectId + '-options';
    
    // Crea le opzioni
    options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'select-option';
        optionElement.setAttribute('data-value', option.value);
        optionElement.onclick = () => selectCustomOption(selectId, option.value, optionElement);
        
        if (option.icon) {
            optionElement.innerHTML = `<i class="${option.icon}"></i> ${option.text}`;
        } else {
            optionElement.textContent = option.text;
        }
        
        optionsContainer.appendChild(optionElement);
    });
    
    container.appendChild(button);
    container.appendChild(optionsContainer);
    
    return container;
}

/**
 * Gestisce il toggle del dropdown personalizzato
 */
function toggleCustomSelect(selectId) {
    const select = document.getElementById(selectId);
    const button = select.querySelector('.select-button');
    const options = select.querySelector('.select-options');
    
    // Chiudi tutti gli altri select
    document.querySelectorAll('.custom-select').forEach(otherSelect => {
        if (otherSelect.id !== selectId) {
            otherSelect.querySelector('.select-button').classList.remove('open');
            otherSelect.querySelector('.select-options').classList.remove('show');
        }
    });
    
    // Toggle questo select
    button.classList.toggle('open');
    options.classList.toggle('show');
}

/**
 * Gestisce la selezione di un'opzione personalizzata
 */
function selectCustomOption(selectId, value, element) {
    const select = document.getElementById(selectId);
    const selectedSpan = select.querySelector('span[id$="-selected"]');
    const button = select.querySelector('.select-button');
    const options = select.querySelector('.select-options');
    
    // Aggiorna il testo selezionato
    selectedSpan.innerHTML = element.innerHTML;
    
    // Chiudi il dropdown
    button.classList.remove('open');
    options.classList.remove('show');
    
    // Gestisci la selezione in base al tipo di select
    handleCustomSelectChange(selectId, value);
}

/**
 * Gestisce i cambiamenti dei select personalizzati
 */
function handleCustomSelectChange(selectId, value) {
    console.log(`📋 Select personalizzato ${selectId} cambiato:`, value);
    
    switch (selectId) {
        case 'demographic-select':
            // Gestisci selezione demografica
            if (typeof applyTheme === 'function') {
                applyTheme(value || 'landuse');
            }
            break;
            
        case 'economic-select':
            // Gestisci selezione economica
            if (typeof applyTheme === 'function') {
                applyTheme(value || 'landuse');
            }
            break;
            
        case 'territorial-select':
            // Gestisci selezione territoriale
            if (typeof applyTheme === 'function') {
                applyTheme(value || 'landuse');
            }
            break;
    }
    
    // Trigger evento personalizzato per compatibilità 
    const event = new CustomEvent('customSelectChanged', {
        detail: { 
            selectId: selectId, 
            value: value 
        }
    });
    document.dispatchEvent(event);
}

/**
 * Ottiene il valore corrente di un select personalizzato
 */
function getCustomSelectValue(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return null;
    
    const selectedOption = select.querySelector('.select-option.selected');
    return selectedOption ? selectedOption.getAttribute('data-value') : '';
}

/**
 * Imposta il valore di un select personalizzato
 */
function setCustomSelectValue(selectId, value) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const options = select.querySelectorAll('.select-option');
    const targetOption = Array.from(options).find(opt => opt.getAttribute('data-value') === value);
    
    if (targetOption) {
        selectCustomOption(selectId, value, targetOption);
    }
}

/**
 * Aggiunge gli stili CSS per i select personalizzati
 */
function addCustomSelectStyles() {
    // Controlla se gli stili esistono già 
    if (document.getElementById('custom-select-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'custom-select-styles';
    styles.textContent = `
        .custom-select {
            position: relative;
            width: 100%;
            margin-bottom: 15px;
        }

        .select-button {
            width: 84%;
			    margin: 6px 0;
            padding: 1px 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #f8f9fa;
            cursor: pointer;
            text-align: left;
            position: relative;
            font-size: 12px;
            min-height: 38px;
            display: flex;
            align-items: center;
            transition: all 0.2s ease;
        }

        .select-button:hover {
            border-color: #ff9900;
            box-shadow: 0 2px 4px rgba(255, 153, 0, 0.1);
        }

        .select-button:after {
            content: '\\f078';
            font-family: "Font Awesome 6 Free";
            font-weight: 900;
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            transition: transform 0.2s;
            color: #666;
        }

        .select-button.open {
            border-color: #ff9900;
            box-shadow: 0 0 0 2px rgba(255, 153, 0, 0.1);
        }

        .select-button.open:after {
            transform: translateY(-50%) rotate(180deg);
        }

        .select-options {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #f8f9fa;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 4px 4px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
			font-size: 12px;
        }

        .select-options.show {
            display: block;
			
        }

        .select-option {
            padding: 10px 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
			    height: 5px;
        }

     .select-option:hover {
            background-color: #767676!important;
			color: #ffffff;
        }

        .select-option:active {
            background-color: #e9ecef;
        }

        .select-option:last-child {
            border-bottom: none;
        }

        .select-option i {
            margin-right: 8px;
            color: #666;
            width: 16px;
            text-align: center;
        }

        .select-option[data-value=""] i {
            opacity: 0.5;
        }

        /* Stili responsive */
        @media (max-width: 768px) {
            .select-options {
                max-height: 150px;
            }
            
            .select-option {
                padding: 10px;
                font-size: 12px;
            }
        }

        /* Stili per opzioni evidenziate */
        .highlighted-option {
            background-color: #fff3cd !important;
            border-left: 3px solid #ff9900 !important;
        }

        .dimmed-option {
            opacity: 0.5 !important;
            background-color: #f8f9fa !important;
        }

        /* Animazioni */
        .select-options {
            animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    
    document.head.appendChild(styles);
}

// ===== FUNZIONI CORE UNIFICATE (REFACTORED) =====

/**
 * Inizializzazione completa del sistema filtri
 */
function initializeUnifiedFilters() {
    console.log('🎨 Inizializzazione sistema filtri unificato...');
    
    if (!map || !map.isSourceLoaded('palermo_catastale')) {
        setTimeout(initializeUnifiedFilters, 1000);
        return;
    }
    
    // Inizializza select personalizzati PRIMA della logica dei filtri
    initializeCustomSelects();
    
    buildUnifiedRelations();
    setupUnifiedEventListeners();
    addFilterIndicators();
    
    completeSystemReady = true;
    
    // Ripristina filtri se presenti
    restoreFilterSelections();
    
    console.log('✅ Sistema filtri unificato pronto');
}

/**
 * Costruisce le relazioni tra mandamenti e fogli (UNIFICATA) (REFACTORED: usa CONFIG.fields)
 */
function buildUnifiedRelations() {
    try {
        const features = map.querySourceFeatures('palermo_catastale', {
            sourceLayer: CONFIG.pmtiles.sourceLayer
        });
        
        // Reset strutture dati
        mandamentoFoglioMap.clear();
        foglioMandamentoMap.clear();
        availableFogli = [];
        
        const foglioSet = new Set();
        const foglioMandamentoArray = [];
        
        features.forEach(feature => {
            const props = feature.properties;
            // REFACTORED: usa CONFIG.fields invece di nomi hardcoded
            let mandamento = props[CONFIG.fields.identifiers.mandamento];
            const foglio = props[CONFIG.fields.identifiers.foglio];
            
            // Normalizza il nome del mandamento
            if (mandamento === 'Castellamare') mandamento = 'Castellammare';
            
            if (mandamento && foglio && foglio !== null && foglio !== '') {
                // Aggiungi al set per evitare duplicati
                foglioSet.add(foglio);
                
                // Costruisci mappa foglio -> mandamento
                foglioMandamentoMap.set(foglio, mandamento);
                
                // Costruisci mappa mandamento -> fogli
                if (!mandamentoFoglioMap.has(mandamento)) {
                    mandamentoFoglioMap.set(mandamento, new Set());
                }
                mandamentoFoglioMap.get(mandamento).add(foglio);
            }
        });
        
        // Prepara array per ordinamento
        foglioSet.forEach(foglio => {
            foglioMandamentoArray.push({
                foglio: foglio,
                mandamento: foglioMandamentoMap.get(foglio),
                numericFoglio: parseInt(foglio) || 999999
            });
        });
        
        // Ordina prima per mandamento, poi per numero foglio
        foglioMandamentoArray.sort((a, b) => {
            const mandamentoCompare = a.mandamento.localeCompare(b.mandamento);
            if (mandamentoCompare !== 0) {
                return mandamentoCompare;
            }
            return a.numericFoglio - b.numericFoglio;
        });
        
        // Estrai fogli ordinati
        availableFogli = foglioMandamentoArray.map(item => item.foglio);
        
        // Converti Set in Array ordinati per mandamentoFoglioMap
        mandamentoFoglioMap.forEach((foglioSet, mandamento) => {
            const sortedFogli = Array.from(foglioSet).sort((a, b) => {
                return parseInt(a) - parseInt(b);
            });
            mandamentoFoglioMap.set(mandamento, sortedFogli);
        });
        
        console.log('🗺️ Relazioni unificate costruite:');
        console.log('- Fogli totali:', availableFogli.length);
        console.log('- Mandamenti:', mandamentoFoglioMap.size);
        
        updateUnifiedFoglioDropdown();
        
    } catch (error) {
        console.error('❌ Errore costruzione relazioni unificate:', error);
    }
}

/**
 * Setup event listeners unificati (AGGIORNATO per select personalizzati)
 */
function setupUnifiedEventListeners() {
    const mandamentoSelect = document.getElementById('mandamento-filter');
    const foglioSelect = document.getElementById('foglio-filter');
    
    // Event listeners per select standard (mandamento e foglio)
    if (mandamentoSelect) {
        mandamentoSelect.addEventListener('change', function(e) {
            if (!completeSystemReady) return;
            
            const selectedMandamento = e.target.value;
            console.log('🏛️ Mandamento selezionato:', selectedMandamento || 'TUTTI');
            
            // Evidenzia fogli correlati
            highlightFogliForMandamento(selectedMandamento);
            
            // Applica filtro
            applyUnifiedMandamentoFilter(selectedMandamento);
        });
    }
    
    if (foglioSelect) {
        foglioSelect.addEventListener('change', function(e) {
            if (!completeSystemReady) return;
            
            const selectedFoglio = e.target.value;
            console.log('📄 Foglio selezionato:', selectedFoglio || 'TUTTI');
            
            // Auto-seleziona mandamento correlato se necessario
            if (selectedFoglio) {
                const mandamentoForFoglio = foglioMandamentoMap.get(selectedFoglio);
                if (mandamentoForFoglio && mandamentoSelect && mandamentoSelect.value !== mandamentoForFoglio) {
                    mandamentoSelect.value = mandamentoForFoglio;
                    highlightFogliForMandamento(mandamentoForFoglio);
                }
            }
            
            // Applica filtro
            applyUnifiedFoglioFilter(selectedFoglio);
        });
    }
    
    // Event listener per select personalizzati
    document.addEventListener('customSelectChanged', function(event) {
        if (!completeSystemReady) return;
        
        const { selectId, value } = event.detail;
        console.log('🎨 Select personalizzato cambiato:', selectId, value);
        
        // La gestione è già stata fatta in handleCustomSelectChange
    });
    
    // Chiudi dropdown quando si clicca fuori
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.custom-select')) {
            document.querySelectorAll('.custom-select').forEach(select => {
                select.querySelector('.select-button').classList.remove('open');
                select.querySelector('.select-options').classList.remove('show');
            });
        }
    });
}

// ===== RESTO DELLE FUNZIONI (MANTENUTE COME ORIGINALE) =====

/**
 * Aggiorna dropdown fogli con formato migliorato
 */
function updateUnifiedFoglioDropdown() {
    const foglioSelect = document.getElementById('foglio-filter');
    if (!foglioSelect) return;
    
    const currentSelection = foglioSelect.value;
    
    // Rimuovi tutte le opzioni tranne la prima ("Tutti i Fogli")
    while (foglioSelect.children.length > 1) {
        foglioSelect.removeChild(foglioSelect.lastChild);
    }
    
    // Aggiungi opzioni con formato "Foglio X - Mandamento"
    availableFogli.forEach(foglio => {
        const mandamento = foglioMandamentoMap.get(foglio);
        const option = document.createElement('option');
        option.value = foglio;
        option.textContent = `Foglio ${foglio} - ${mandamento || 'N/D'}`;
        option.setAttribute('data-mandamento', mandamento || '');
        
        foglioSelect.appendChild(option);
    });
    
    // Ripristina selezione precedente
    if (currentSelection && availableFogli.includes(currentSelection)) {
        foglioSelect.value = currentSelection;
    } else if (currentFoglioFilter && availableFogli.includes(currentFoglioFilter)) {
        foglioSelect.value = currentFoglioFilter;
    }
    
    console.log('📋 Dropdown fogli aggiornato:', availableFogli.length, 'fogli');
}

/**
 * Evidenzia fogli correlati al mandamento selezionato
 */
function highlightFogliForMandamento(selectedMandamento) {
    const foglioSelect = document.getElementById('foglio-filter');
    if (!foglioSelect) return;
    
    // Reset stili
    Array.from(foglioSelect.options).forEach(option => {
        option.classList.remove('highlighted-option', 'dimmed-option');
        option.style.backgroundColor = '';
        option.style.color = '';
    });
    
    if (!selectedMandamento) {
        updateFoglioSelectTitle('');
        return;
    }
    
    const fogliDelMandamento = mandamentoFoglioMap.get(selectedMandamento) || [];
    
    Array.from(foglioSelect.options).forEach(option => {
        if (!option.value) return; // Salta opzione "Tutti"
        
        if (fogliDelMandamento.includes(option.value)) {
            option.classList.add('highlighted-option');
        } else {
            option.classList.add('dimmed-option');
        }
    });
    
    updateFoglioSelectTitle(selectedMandamento, fogliDelMandamento.length);
}

/**
 * Aggiorna il titolo del selettore fogli
 */
function updateFoglioSelectTitle(selectedMandamento, count = 0) {
    const title = document.querySelector('#foglio-filter')?.closest('.control-section')?.querySelector('h3');
    if (!title) return;
    
    const img = title.querySelector('img')?.outerHTML || '';
    title.innerHTML = `${img} Filtra per Foglio`;
    
    if (selectedMandamento) {
        title.innerHTML += ` <small>(${count} fogli)</small>`;
    }
}

/**
 * Applica filtro mandamento (UNIFICATA)
 */
function applyUnifiedMandamentoFilter(selectedMandamento) {
    console.log('🔍 Applicando filtro mandamento unificato:', selectedMandamento);
    
    currentMandamentoFilter = selectedMandamento || null;
    
    // Aggiorna UI
    const mandamentoSelect = document.getElementById('mandamento-filter');
    if (mandamentoSelect) {
        mandamentoSelect.value = selectedMandamento || '';
    }
    
    applyUnifiedFiltersToMap();
}

/**
 * Applica filtro foglio (UNIFICATA)
 */
function applyUnifiedFoglioFilter(selectedFoglio) {
    console.log('🔍 Applicando filtro foglio unificato:', selectedFoglio);
    
    currentFoglioFilter = selectedFoglio || null;
    
    // Auto-seleziona mandamento correlato se necessario
    if (selectedFoglio) {
        const mandamentoForFoglio = foglioMandamentoMap.get(selectedFoglio);
        if (mandamentoForFoglio) {
            currentMandamentoFilter = mandamentoForFoglio;
            const mandamentoSelect = document.getElementById('mandamento-filter');
            if (mandamentoSelect) {
                mandamentoSelect.value = mandamentoForFoglio;
            }
        }
    }
    
    // Aggiorna UI
    const foglioSelect = document.getElementById('foglio-filter');
    if (foglioSelect) {
        foglioSelect.value = selectedFoglio || '';
    }
    
    applyUnifiedFiltersToMap();
}

/**
 * Costruisce il filtro per la mappa (UNIFICATA) (REFACTORED: usa CONFIG.fields)
 */
function buildUnifiedMapFilter() {
    const filters = [];
    
    if (currentMandamentoFilter) {
        let dbValue = currentMandamentoFilter;
        // Normalizza per il database
        if (dbValue === 'Castellammare') dbValue = 'Castellamare';
        // REFACTORED: usa CONFIG.fields.identifiers.mandamento invece di 'Mandamento'
        filters.push(['==', ['get', CONFIG.fields.identifiers.mandamento], dbValue]);
    }
    
    if (currentFoglioFilter) {
        // REFACTORED: usa CONFIG.fields.identifiers.foglio invece di 'foglio'
        filters.push(['==', ['get', CONFIG.fields.identifiers.foglio], currentFoglioFilter]);
    }
    
    if (filters.length === 0) {
        return null;
    } else if (filters.length === 1) {
        return filters[0];
    } else {
        return ['all', ...filters];
    }
}

/**
 * Applica i filtri correnti alla mappa (UNIFICATA)
 */
function applyUnifiedFiltersToMap() {
    const filter = buildUnifiedMapFilter();
    
    console.log('🗺️ Applicando filtro unificato alla mappa:', filter);
    
    // Applica filtri ai layer
    map.setFilter('catastale-base', filter);
    map.setFilter('catastale-outline', filter);
    map.setFilter('catastale-hover', ['==', ['get', 'fid'], '']);
    
    // Centra la vista sugli oggetti filtrati
    if (filter) {
        centerOnFilteredFeatures(filter);
    } else {
        // Se non ci sono filtri, torna alla vista iniziale
        map.flyTo({
            center: CONFIG.map.center,
            zoom: CONFIG.map.zoom,
            duration: 1500
        });
    }
    
    // Riapplica il tema corrente se presente
    if (currentTheme && currentTheme !== 'landuse') {
        applyTheme(currentTheme);
    } else {
        // Rimuovi layer tematici e mostra base
        if (map.getLayer('catastale-thematic')) {
            map.removeLayer('catastale-thematic');
        }
        map.setPaintProperty('catastale-base', 'fill-opacity', 0.75);
        
        if (typeof showBaseLegenda === 'function') {
            showBaseLegenda();
        }
    }
    
    // Forza aggiornamento legenda dopo un ritardo
    setTimeout(() => {
        if (typeof forceLegendUpdate === 'function') {
            forceLegendUpdate();
        }
    }, 800);
}

/**
 * Centra la mappa sugli oggetti filtrati
 */
function centerOnFilteredFeatures(filter) {
    try {
        // Ottieni tutte le features che corrispondono al filtro
        const features = map.querySourceFeatures('palermo_catastale', {
            sourceLayer: CONFIG.pmtiles.sourceLayer,
            filter: filter
        });
        
        if (features.length === 0) {
            console.log('⚠️ Nessuna feature trovata per il filtro');
            return;
        }
        
        // Calcola il bounding box delle features filtrate
        let minLng = Infinity;
        let maxLng = -Infinity;
        let minLat = Infinity;
        let maxLat = -Infinity;
        
        features.forEach(feature => {
            if (feature.geometry && feature.geometry.coordinates) {
                const coords = feature.geometry.coordinates[0]; // Assumendo poligoni
                
                coords.forEach(coord => {
                    // Gestisci array annidati per poligoni complessi
                    if (Array.isArray(coord[0])) {
                        coord.forEach(innerCoord => {
                            minLng = Math.min(minLng, innerCoord[0]);
                            maxLng = Math.max(maxLng, innerCoord[0]);
                            minLat = Math.min(minLat, innerCoord[1]);
                            maxLat = Math.max(maxLat, innerCoord[1]);
                        });
                    } else {
                        minLng = Math.min(minLng, coord[0]);
                        maxLng = Math.max(maxLng, coord[0]);
                        minLat = Math.min(minLat, coord[1]);
                        maxLat = Math.max(maxLat, coord[1]);
                    }
                });
            }
        });
        
        // Verifica che i bounds siano validi
        if (minLng === Infinity || maxLng === -Infinity || 
            minLat === Infinity || maxLat === -Infinity) {
            console.log('⚠️ Bounds non validi');
            return;
        }
        
        // Calcola il centro e applica padding
        const bounds = [[minLng, minLat], [maxLng, maxLat]];
        
        // Adatta la vista con padding per dispositivi mobili e desktop
        const isMobile = window.innerWidth <= 768;
        const padding = isMobile ? 
            { top: 100, bottom: 100, left: 50, right: 50 } :
            { top: 100, bottom: 100, left: 320, right: 420 }; // Considera pannelli laterali
        
        // Anima la transizione verso i nuovi bounds
        map.fitBounds(bounds, {
            padding: padding,
            duration: 1500,
            maxZoom: 16 // Non zoomare troppo
        });
        
        console.log('🎯 Vista centrata su', features.length, 'features');
        
        // Mostra notifica temporanea (opzionale)
        showFilterNotification(features.length);
        
    } catch (error) {
        console.error('❌ Errore nel centrare le features:', error);
    }
}

/**
 * Mostra notifica temporanea del numero di particelle filtrate
 */
function showFilterNotification(count) {
    // Rimuovi notifiche esistenti
    const existingNotification = document.querySelector('.filter-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crea nuova notifica
    const notification = document.createElement('div');
    notification.className = 'filter-notification';
    notification.innerHTML = `
        <i class="fas fa-filter"></i>
        <span>${count} particelle selezionate</span>
    `;
    
    // Aggiungi stili inline temporanei
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #ff9900 0%, #ff5100 100%);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        font-weight: 600;
        animation: slideDown 0.5s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Rimuovi dopo 3 secondi con fade out
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

/**
 * Ripristina selezioni filtri salvate
 */
function restoreFilterSelections() {
    if (currentMandamentoFilter) {
        const mandamentoSelect = document.getElementById('mandamento-filter');
        if (mandamentoSelect) {
            mandamentoSelect.value = currentMandamentoFilter;
            highlightFogliForMandamento(currentMandamentoFilter);
        }
    }
    
    if (currentFoglioFilter) {
        const foglioSelect = document.getElementById('foglio-filter');
        if (foglioSelect) {
            foglioSelect.value = currentFoglioFilter;
        }
    }
}

/**
 * Aggiunge indicatori di filtro attivo
 */
function addFilterIndicators() {
    // Indicatore per mandamento
    const mandamentoSection = document.querySelector('#mandamento-filter')?.closest('.control-section');
    const mandamentoTitle = mandamentoSection?.querySelector('h3');
    if (mandamentoTitle && !mandamentoTitle.querySelector('.filter-indicator')) {
        mandamentoTitle.style.position = 'relative';
        
        const indicator = document.createElement('span');
        indicator.className = 'filter-indicator';
        indicator.innerHTML = ' <i class="fas fa-filter"></i>';
        indicator.style.display = 'none';
        
        mandamentoTitle.appendChild(indicator);
    }
    
    // Indicatore per foglio
    const foglioSection = document.querySelector('#foglio-filter')?.closest('.control-section');
    const foglioTitle = foglioSection?.querySelector('h3');
    if (foglioTitle && !foglioTitle.querySelector('.filter-indicator')) {
        foglioTitle.style.position = 'relative';
        
        const indicator = document.createElement('span');
        indicator.className = 'filter-indicator';
        indicator.innerHTML = ' <i class="fas fa-filter"></i>';
        indicator.style.display = 'none';
        
        foglioTitle.appendChild(indicator);
    }
}

/**
 * Reset completo filtri (UNIFICATA)
 */
function resetUnifiedFilters() {
    console.log('🔄 Reset filtri unificato');
    
    currentMandamentoFilter = null;
    currentFoglioFilter = null;
    
    // NUOVO: Reset filtri legenda
    if (window.clearLegendFilters) {
        window.clearLegendFilters();
    }
    
    currentMandamentoFilter = null;
    currentFoglioFilter = null;
    
    // Reset UI
    const mandamentoSelect = document.getElementById('mandamento-filter');
    const foglioSelect = document.getElementById('foglio-filter');
    
    if (mandamentoSelect) mandamentoSelect.value = '';
    if (foglioSelect) foglioSelect.value = '';
    
    // Reset evidenziazioni
    highlightFogliForMandamento('');
    
    // Applica filtri (che saranno nulli) - questo ricentrerà anche la mappa
    applyUnifiedFiltersToMap();
    
    // Nascondi indicatori
    document.querySelectorAll('.filter-indicator').forEach(indicator => {
        indicator.style.display = 'none';
    });
    
    // Rimuovi eventuali notifiche
    const notification = document.querySelector('.filter-notification');
    if (notification) {
        notification.remove();
    }
}

// ===== FUNZIONI CRITICHE PER THEMES.JS =====

/**
 * Ottiene il filtro corrente per i layer tematici
 * QUESTA È LA FUNZIONE MANCANTE CHE CAUSA IL PROBLEMA!
 */
function getCurrentFilter() {
    return buildUnifiedMapFilter();
}

// Aggiungi dopo la funzione getCurrentFilter()
window.getCombinedFilter = function() {
    const territorialFilter = getCurrentFilter();
    const legendFilter = window.legendFilterState && window.legendFilterState.isFiltering ? 
        window.getCurrentLegendFilter() : null;
    
    if (territorialFilter && legendFilter) {
        return ['all', territorialFilter, legendFilter];
    }
    return territorialFilter || legendFilter || null;
};

// Funzione helper per ottenere il filtro corrente della legenda
window.getCurrentLegendFilter = function() {
    if (!window.legendFilterState || window.legendFilterState.activeCategories.size === 0) {
        return null;
    }
    
    // Costruisci filtro basato sulle categorie selezionate
    // (Logica già implementata in applyLegendFilters di dynamic-legend.js)
    return null; // Placeholder - usa la logica da dynamic-legend.js
};


// ===== FUNZIONI UTILITY ESPORTATE =====

/**
 * Ottieni il mandamento di un foglio specifico
 */
function getMandamentoForFoglio(foglio) {
    return foglioMandamentoMap.get(foglio) || null;
}

/**
 * Ottieni tutti i fogli di un mandamento specifico
 */
function getFogliForMandamento(mandamento) {
    return mandamentoFoglioMap.get(mandamento) || [];
}

/**
 * Ottieni statistiche sui mandamenti e fogli
 */
function getUnifiedFilterStats() {
    const stats = {
        totalFogli: availableFogli.length,
        totalMandamenti: mandamentoFoglioMap.size,
        mandamenti: {}
    };
    
    mandamentoFoglioMap.forEach((fogli, mandamento) => {
        stats.mandamenti[mandamento] = {
            count: fogli.length,
            fogli: [...fogli] // copia array
        };
    });
    
    console.log('📊 Statistiche filtri unificate:', stats);
    return stats;
}

/**
 * Verifica se i filtri sono attivi
 */
function hasActiveFilters() {
    return currentMandamentoFilter !== null || currentFoglioFilter !== null;
}

// ===== COMPATIBILITÀ CON CODICE ESISTENTE =====

// Funzioni compatibili con filters.js
function applyFoglioFilter(foglio) {
    return applyUnifiedFoglioFilter(foglio);
}

function applyMandamentoFilter(mandamento) {
    return applyUnifiedMandamentoFilter(mandamento);
}

function populateFoglioFilter() {
    return buildUnifiedRelations();
}

// Funzioni compatibili con dynamic-filters.js
function applyFoglioFilterToMap(foglio) {
    return applyUnifiedFoglioFilter(foglio);
}

function applyMandamentoFilterToMap(mandamento) {
    return applyUnifiedMandamentoFilter(mandamento);
}

function resetDynamicFilters() {
    return resetUnifiedFilters();
}

function applyCurrentFiltersToMap() {
    return applyUnifiedFiltersToMap();
}

// Funzione per forzare l'aggiornamento completo
function resetAllDynamicFilters() {
    return resetUnifiedFilters();
}

// ===== ESPORTAZIONE FUNZIONI GLOBALI =====
window.getCurrentFilter = getCurrentFilter;  // CRITICO!
window.getMandamentoForFoglio = getMandamentoForFoglio;
window.getFogliForMandamento = getFogliForMandamento;
window.getUnifiedFilterStats = getUnifiedFilterStats;
window.getFilterStats = getUnifiedFilterStats; // Alias per compatibilità 
window.hasActiveFilters = hasActiveFilters;
window.resetUnifiedFilters = resetUnifiedFilters;
window.applyUnifiedFoglioFilter = applyUnifiedFoglioFilter;
window.applyUnifiedMandamentoFilter = applyUnifiedMandamentoFilter;

// Compatibilità con nomi precedenti
window.applyFoglioFilter = applyFoglioFilter;
window.applyMandamentoFilter = applyMandamentoFilter;
window.resetDynamicFilters = resetDynamicFilters;
window.resetAllDynamicFilters = resetAllDynamicFilters;

// ===== INIZIALIZZAZIONE =====
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeUnifiedFilters, 2000);
    
    // Integra con reset globale se esiste
    if (window.safeResetMap) {
        const originalReset = window.safeResetMap;
        window.safeResetMap = function() {
            resetUnifiedFilters();
            originalReset();
        }
    }
});

console.log('✅ unified-filters.js caricato - Sistema filtri unificato pronto');