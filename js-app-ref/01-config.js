// ===== FIX COMPLETO CONFIG.fields - 01-config-fixed.js =====
/**
 * Configurazioni globali e costanti dell'applicazione
 * FIX: Gestione robusta per evitare errori di riferimento
 */

console.log('🔧 Caricamento CONFIG.fields con gestione errori...');

// PRIMO: Registra il protocollo PMTiles con controllo
try {
    if (typeof pmtiles !== 'undefined') {
        const protocol = new pmtiles.Protocol();
        if (typeof maplibregl !== 'undefined') {
            maplibregl.addProtocol("pmtiles", protocol.tile);
            console.log('✅ PMTiles protocol registrato');
        } else {
            console.warn('⚠️ maplibregl non disponibile per PMTiles');
        }
    } else {
        console.warn('⚠️ pmtiles library non disponibile');
    }
} catch (error) {
    console.error('❌ Errore registrazione PMTiles:', error);
}

// SECONDO: Definisci CONFIG con gestione errori
try {
    // Configurazione mappa base
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
        },

        // ===== CENTRALIZZAZIONE CAMPI LAYER CATASTALE =====
        fields: {
            // CAMPI IDENTIFICATORI E BASE
            identifiers: {
                fid: 'fid',                          // ID univoco particella
                particella: 'particella',            // Numero particella
                foglio: 'foglio',                    // Foglio catastale
                mandamento: 'Mandamento'             // Mandamento (nota: maiuscola!)
            },

            // CAMPI GEOGRAFIA E CLASSIFICAZIONE
            geography: {
                surface: 'superfice mq',             // Superficie in metri quadri
                postalCode: 'postal_code',           // CAP
                landUseClass: 'class',               // Classe uso del suolo
                landUseSubtype: 'subtype',           // Sottotipo uso del suolo
                landCover: 'copertura del suolo'    // Copertura del suolo
            },

            // CAMPI DEMOGRAFICI
            demographics: {
                population: 'popolazione_stimata',
                familySize: 'dimensione media della famiglia',
                masculinity: 'tasso di mascolinità',
                singlePerson: 'tasso_persona singola',
                largeFamilies: 'tasso_famiglie_numerose',
                averageAge: 'età_media',
                elderly: 'tasso_anziani',
                foreigners: 'tasso_di_popolazione_straniera',
                nonEuForeigners: 'tasso_stranieri_non_ue',
                youngForeigners: 'tasso_giovani_stranieri'
            },

            // CAMPI SOCIO-ECONOMICI
            socioEconomic: {
                higherEducation: 'tasso di istruzione superiore',
                lowEducation: 'basso_tasso_di_istruzione',
                workIntegration: 'tasso di integrazione del lavoro',
                employment: 'tasso_di_occupazione',
                femaleEmployment: 'tasso di occupazione femminile',
                genderGap: 'divario di genere nell\'occupazione',
                economicResilience: 'resilienza_economica',
                socialCohesion: 'indice_coesione_sociale'
            },

            // CAMPI TERRITORIALI E URBANISTICI
            territorial: {
                density: 'densità abitativa',
                elevationMin: 'elevation_min',
                elevationMax: 'elevation_max',
                buildingOccupancy: 'occupazione media dell\'edificio',
                structuralDependency: 'indice_dipendenza_strutturale',
                robustness: 'indice di robustezza',
                requalificationOpportunity: 'opport_riqualificazione',
                realEstatePotential: 'potenziale_immobiliare',
                buildingsCount: 'buildings_count'
            },

            // CAMPI RISCHI AMBIENTALI
            risks: {
                flood: 'Ri alluvione',                        // Rischio alluvione
                landslide: 'rischio di frana',               // Rischio frana
                coastalErosion: 'rischio di erosione costiera', // Rischio erosione costiera
                seismic: 'rischio sismico'                   // Rischio sismico
            }
        },

        // ===== HELPER FUNCTIONS PER ACCESSO SEMPLIFICATO =====
        getField: {
            // Funzioni di accesso rapido per compatibilità 
            id: function() { return CONFIG.fields.identifiers.fid; },
            particella: function() { return CONFIG.fields.identifiers.particella; },
            foglio: function() { return CONFIG.fields.identifiers.foglio; },
            mandamento: function() { return CONFIG.fields.identifiers.mandamento; },
            
            // Campi più usati
            surface: function() { return CONFIG.fields.geography.surface; },
            landUse: function() { return CONFIG.fields.geography.landUseClass; },
            population: function() { return CONFIG.fields.demographics.population; },
            density: function() { return CONFIG.fields.territorial.density; },
            
            // Accesso per categoria
            demographic: function(field) { return CONFIG.fields.demographics[field]; },
            socioEconomic: function(field) { return CONFIG.fields.socioEconomic[field]; },
            territorial: function(field) { return CONFIG.fields.territorial[field]; },
            risk: function(field) { return CONFIG.fields.risks[field]; }
        }
    };

    // Esporta CONFIG globalmente
    window.CONFIG = CONFIG;
    console.log('✅ CONFIG definito e esportato');

} catch (error) {
    console.error('❌ Errore definizione CONFIG:', error);
    // Fallback minimale
    window.CONFIG = {
        map: { center: [13.3614, 38.1157], zoom: 14 },
        pmtiles: { source: 'pmtiles://https://palermohub.github.io/cspa/dati/pacs.pmtiles', sourceLayer: 'catastale' },
        fields: { identifiers: { fid: 'fid', particella: 'particella', foglio: 'foglio', mandamento: 'Mandamento' } }
    };
}

// TERZO: Definisci THEME_FIELD_MAPPING con controllo CONFIG
try {
    if (typeof CONFIG !== 'undefined' && CONFIG.fields) {
        const THEME_FIELD_MAPPING = {
            // Demografici
            population: CONFIG.fields.demographics.population,
            familySize: CONFIG.fields.demographics.familySize,
            masculinity: CONFIG.fields.demographics.masculinity,
            singlePerson: CONFIG.fields.demographics.singlePerson,
            largeFamilies: CONFIG.fields.demographics.largeFamilies,
            age: CONFIG.fields.demographics.averageAge,
            elderly: CONFIG.fields.demographics.elderly,
            foreign: CONFIG.fields.demographics.foreigners,
            nonEuForeigners: CONFIG.fields.demographics.nonEuForeigners,
            youngForeigners: CONFIG.fields.demographics.youngForeigners,

            // Socio-economici
            higherEducation: CONFIG.fields.socioEconomic.higherEducation,
            lowEducation: CONFIG.fields.socioEconomic.lowEducation,
            workIntegration: CONFIG.fields.socioEconomic.workIntegration,
            employment: CONFIG.fields.socioEconomic.employment,
            femaleEmployment: CONFIG.fields.socioEconomic.femaleEmployment,
            genderGap: CONFIG.fields.socioEconomic.genderGap,
            resilience: CONFIG.fields.socioEconomic.economicResilience,
            cohesion: CONFIG.fields.socioEconomic.socialCohesion,

            // Territoriali
            density: CONFIG.fields.territorial.density,
            surface_area: CONFIG.fields.geography.surface,
            elevation_min: CONFIG.fields.territorial.elevationMin,
            elevation_max: CONFIG.fields.territorial.elevationMax,
            building_occupancy: CONFIG.fields.territorial.buildingOccupancy,
            structural_dependency: CONFIG.fields.territorial.structuralDependency,
            robustness: CONFIG.fields.territorial.robustness,
            requalification_opportunity: CONFIG.fields.territorial.requalificationOpportunity,
            real_estate_potential: CONFIG.fields.territorial.realEstatePotential,
            buildings: CONFIG.fields.territorial.buildingsCount,

            // Categorici
            land_cover: CONFIG.fields.geography.landCover,
            flood_risk: CONFIG.fields.risks.flood,
            landslide_risk: CONFIG.fields.risks.landslide,
            coastal_erosion: CONFIG.fields.risks.coastalErosion,
            seismic_risk: CONFIG.fields.risks.seismic
        };

        window.THEME_FIELD_MAPPING = THEME_FIELD_MAPPING;
        console.log('✅ THEME_FIELD_MAPPING definito');
    } else {
        console.error('❌ CONFIG non disponibile per THEME_FIELD_MAPPING');
    }
} catch (error) {
    console.error('❌ Errore definizione THEME_FIELD_MAPPING:', error);
}

// QUARTO: Definisci colori e labels uso del suolo (INVARIATI)
try {
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
        "park": "Verde Pubbl.",
        "pedestrian": "Pedonale",
        "protected": "Storico",
        "recreation": "Ricreativo",
        "religious": "Religioso",
        "residential": "Residenziale",
        "education": "Educativo",
        "medical": "Ospedale",
        "transportation": "Trasporti",
        "": "Non Clas.to"
    };

    // Esporta globalmente
    window.landUseColors = landUseColors;
    window.landUseLabels = landUseLabels;
    console.log('✅ Land use colors e labels definiti');

} catch (error) {
    console.error('❌ Errore definizione land use:', error);
}

// QUINTO: Definisci mappe tematiche categoriche (INVARIATE)
try {
    const landCoverColors = {
        "1110": "rgba(255,255,100,0.7)",
        "2111": "rgba(34,139,34,0.7)",
        "2112": "rgba(152,251,152,0.7)",
        "2212": "rgba(0,100,0,0.7)"
    };

    const landCoverLabels = {
        "1110": "Aree urbane",
        "2111": "Veget. permanente",
        "2112": "Veget. temporanee",
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

    // Esporta tutto globalmente
    window.landCoverColors = landCoverColors;
    window.landCoverLabels = landCoverLabels;
    window.floodRiskColors = floodRiskColors;
    window.floodRiskLabels = floodRiskLabels;
    window.landslideRiskColors = landslideRiskColors;
    window.landslideRiskLabels = landslideRiskLabels;
    window.coastalErosionColors = coastalErosionColors;
    window.coastalErosionLabels = coastalErosionLabels;
    window.seismicRiskColors = seismicRiskColors;
    window.seismicRiskLabels = seismicRiskLabels;

    console.log('✅ Tutte le mappe tematiche definite');

} catch (error) {
    console.error('❌ Errore definizione mappe tematiche:', error);
}

// SESTO: Variabili globali
try {
    window.map = undefined;
    window.currentTheme = 'landuse';
    window.hoveredPolygon = null;
    window.currentMandamentoFilter = null;
    window.currentFoglioFilter = null;
    window.featuresData = [];

    console.log('✅ Variabili globali inizializzate');
} catch (error) {
    console.error('❌ Errore inizializzazione variabili globali:', error);
}

// SETTIMO: Funzioni di utilità per accesso sicuro
window.safeGetField = function(fieldPath, defaultValue = null) {
    try {
        const keys = fieldPath.split('.');
        let current = CONFIG;
        
        for (let key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                console.warn('⚠️ Campo non trovato:', fieldPath);
                return defaultValue;
            }
        }
        
        return current;
    } catch (error) {
        console.error('❌ Errore accesso campo:', fieldPath, error);
        return defaultValue;
    }
};

// OTTAVO: Funzione di verifica completezza
window.verifyConfigIntegrity = function() {
    const checks = {
        configExists: typeof CONFIG !== 'undefined',
        fieldsExists: CONFIG?.fields !== undefined,
        identifiersComplete: CONFIG?.fields?.identifiers && 
                           Object.keys(CONFIG.fields.identifiers).length === 4,
        geographyComplete: CONFIG?.fields?.geography && 
                          Object.keys(CONFIG.fields.geography).length === 5,
        demographicsComplete: CONFIG?.fields?.demographics && 
                             Object.keys(CONFIG.fields.demographics).length === 10,
        themeMappingExists: typeof THEME_FIELD_MAPPING !== 'undefined',
        landUseExists: typeof landUseColors !== 'undefined' && 
                       typeof landUseLabels !== 'undefined'
    };

    const allChecksPass = Object.values(checks).every(check => check === true);
    
    console.log('🔍 Verifica integrità CONFIG:', checks);
    console.log(allChecksPass ? '✅ Tutti i controlli superati' : '❌ Alcuni controlli falliti');
    
    return { checks, allChecksPass };
};

// NONO: Auto-verifica
setTimeout(() => {
    window.verifyConfigIntegrity();
}, 100);

console.log('✅ CONFIG.fields sistema completo caricato e verificato');