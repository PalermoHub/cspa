// ===== STRUTTURA MODULARE - SUDDIVISIONE APP.JS =====

// 1. config.js - Configurazioni e costanti
// 2. map-init.js - Inizializzazione mappa e layer base
// 3. themes.js - Definizioni temi e tematizzazioni
// 4. legends.js - Gestione legende
// 5. info-panel.js - Pannello informazioni
// 6. search-controls.js - Controlli di ricerca e navigazione
// 7. filters.js - Sistema filtri base
// 8. dynamic-filters.js - Sistema filtri dinamici (NUOVO)
// 9. event-handlers.js - Gestori eventi principali
// 10. utils.js - Funzioni di utilità
// 11. reset.js - Funzioni reset (già esistente)

// ===== FILE: config.js =====
/**
 * Configurazioni globali e costanti dell'applicazione
 */

// Registra il protocollo PMTiles
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

// Configurazione mappa
const CONFIG = {
    map: {
        center: [13.3614, 38.1157],
        zoom: 14,
        maxBounds: [
            [13.32, 38.09],
            [13.40, 38.14]
        ],
        maxZoom: 17,
        minZoom: 12
    },
    
    pmtiles: {
        source: 'pmtiles://https://palermohub.github.io/cspa/dati/pacs.pmtiles',
        sourceLayer: 'catastale'
    }
};

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

// Definizioni per le mappe tematiche categoriche
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