// =====themes.js - REFACTORIZZATO =====
/**
 * Definizioni temi e tematizzazioni
 * AGGIORNATO: Utilizza THEME_FIELD_MAPPING dal config per centralizzazione campi
 */

// Configurazioni tematizzazioni con Jenks-Fisher
const themes = {
    population: {
        name: 'Popolazione Stimata',
        property: THEME_FIELD_MAPPING.population, // ✅ Era: 'popolazione_stimata'
        colors: ['#ffffff', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5', '#1976d2'],
        unit: 'abitanti',
        format: (val) => `${val || 'N/D'} abitanti`,
        jenksBreaks: [0, 0, 1, 3, 6, 12, 20, 35],
        type: 'jenks'
    },
    
    familySize: {
        name: 'Dimensione Media Famiglia',
        property: THEME_FIELD_MAPPING.familySize, // ✅ Era: 'dimensione media della famiglia'
        colors: ['#ffffff', '#e8f5e8', '#c8e6c8', '#a5d6a5', '#82c782', '#5fb85f', '#3ca83c', '#2e7d32'],
        unit: 'componenti',
        format: (val) => `${val || 'N/D'} componenti`,
        jenksBreaks: [0, 0, 1.5, 2.2, 2.8, 3.5, 4.2, 5.0, 33],
        type: 'jenks'
    },
    
    masculinity: {
        name: 'Tasso di Mascolinità',
        property: THEME_FIELD_MAPPING.masculinity, // ✅ Era: 'tasso di mascolinità'
        colors: ['#ffffff', '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1976d2'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 45, 50, 55, 60, 70, 85, 100],
        type: 'jenks'
    },
    
    singlePerson: {
        name: 'Tasso Persona Singola',
        property: THEME_FIELD_MAPPING.singlePerson, // ✅ Era: 'tasso_persona singola'
        colors: ['#ffffff', '#fff3e0', '#ffe0b2', '#ffcc80', '#ffb74d', '#ffa726', '#ff9800', '#f57c00'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 15, 25, 35, 45, 60, 80, 100],
        type: 'jenks'
    },
    
    largeFamilies: {
        name: 'Tasso Famiglie Numerose',
        property: THEME_FIELD_MAPPING.largeFamilies, // ✅ Era: 'tasso_famiglie_numerose'
        colors: ['#ffffff', '#f1f8e9', '#dcedc8', '#c5e1a5', '#aed581', '#9ccc65', '#8bc34a', '#689f38'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 5, 12, 20, 30, 45, 65, 100],
        type: 'jenks'
    },
    
    femaleEmployment: {
        name: 'Tasso Occupazione Femminile',
        property: THEME_FIELD_MAPPING.femaleEmployment, // ✅ Era: 'tasso di occupazione femminile'
        colors: ['#ffffff', '#fce4ec', '#f8bbd9', '#f48fb1', '#f06292', '#ec407a', '#e91e63', '#c2185b'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 20, 35, 45, 55, 70, 85, 100],
        type: 'jenks'
    },

    higherEducation: {
        name: 'Tasso Istruzione Superiore',
        property: THEME_FIELD_MAPPING.higherEducation, // ✅ Era: 'tasso di istruzione superiore'
        colors: ['#ffffff', '#e8f5e8', '#c8e6c8', '#a5d6a5', '#82c782', '#5fb85f', '#3ca83c', '#1b5e20'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 15, 25, 35, 50, 65, 80, 100],
        type: 'jenks'
    },
    
    lowEducation: {
        name: 'Basso Tasso Istruzione',
        property: THEME_FIELD_MAPPING.lowEducation, // ✅ Era: 'basso_tasso_di_istruzione'
        colors: ['#ffffff', '#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#d32f2f'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 10, 20, 35, 50, 65, 80, 100],
        type: 'jenks'
    },
    
    workIntegration: {
        name: 'Tasso Integrazione Lavoro',
        property: THEME_FIELD_MAPPING.workIntegration, // ✅ Era: 'tasso di integrazione del lavoro'
        colors: ['#ffffff', '#e0f2f1', '#b2dfdb', '#80cbc4', '#4db6ac', '#26a69a', '#009688', '#00695c'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 20, 35, 50, 65, 75, 85, 100],
        type: 'jenks'
    },
    
    nonEuForeigners: {
        name: 'Tasso Stranieri Non-UE',
        property: THEME_FIELD_MAPPING.nonEuForeigners, // ✅ Era: 'tasso_stranieri_non_ue'
        colors: ['#ffffff', '#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#7b1fa2'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 8, 18, 30, 45, 60, 80, 100],
        type: 'jenks'
    },
    
    youngForeigners: {
        name: 'Tasso Giovani Stranieri',
        property: THEME_FIELD_MAPPING.youngForeigners, // ✅ Era: 'tasso_giovani_stranieri'
        colors: ['#ffffff', '#fff8e1', '#ffecb3', '#ffe082', '#ffd54f', '#ffca28', '#ffc107', '#ffa000'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 12, 22, 35, 50, 65, 80, 100],
        type: 'jenks'
    },
    
    age: {
        name: 'Età Media',
        property: THEME_FIELD_MAPPING.age, // ✅ Era: 'età_media'
        colors: ['#ffffff', '#ffe0b2', '#ffcc80', '#ffb74d', '#ffa726', '#ff9800', '#fb8c00', '#f57c00'],
        unit: 'anni',
        format: (val) => `${val || 'N/D'} anni`,
        jenksBreaks: [0, 0, 25, 35, 45, 55, 65, 75, 80],
        type: 'jenks'
    },
    
    elderly: {
        name: 'Tasso Anziani',
        property: THEME_FIELD_MAPPING.elderly, // ✅ Era: 'tasso_anziani'
        colors: ['#f1f8e9', '#dcedc8', '#c5e1a5', '#aed581', '#9ccc65', '#8bc34a', '#7cb342', '#689f38'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 5.2, 15.4, 25.1, 35.4, 44.7, 52.1, 58.8],
        type: 'jenks'
    },
    
    density: {
        name: 'Densità Abitativa',
        property: THEME_FIELD_MAPPING.density, // ✅ Era: 'densità abitativa'
        colors: ['#fce4ec', '#f8bbd9', '#f48fb1', '#f06292', '#ec407a', '#e91e63', '#d81b60', '#c2185b'],
        unit: 'ab/km²',
        format: (val) => `${val?.toLocaleString() || 'N/D'} ab/km²`,
        jenksBreaks: [0, 0, 1000, 3500, 7500, 15000, 30000, 60000, 194093],
        type: 'jenks'
    },
    
    foreign: {
        name: 'Popolazione Straniera',
        property: THEME_FIELD_MAPPING.foreign, // ✅ Era: 'tasso_di_popolazione_straniera'
        colors: ['#e0f2f1', '#b2dfdb', '#80cbc4', '#4db6ac', '#26a69a', '#009688', '#00897b', '#00695c'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 5, 12, 22, 35, 50, 70, 100],
        type: 'jenks'
    },

    employment: {
        name: 'Tasso Occupazione',
        property: THEME_FIELD_MAPPING.employment, // ✅ Era: 'tasso_di_occupazione'
        colors: ['#ffffff', '#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#8e24aa'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 12, 25, 40, 55, 70, 85, 100],
        type: 'jenks'
    },

    genderGap: {
        name: 'Divario Genere Occupazione',
        property: THEME_FIELD_MAPPING.genderGap, // ✅ Era: 'divario di genere nell\'occupazione'
        colors: ['#4caf50', '#81c784', '#fff59d', '#ffcc02', '#ff9800', '#ff5722', '#d32f2f', '#b71c1c'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [-67, -30, -10, 0, 15, 30, 50, 75, 100],
        type: 'jenks'
    },

    resilience: {
        name: 'Resilienza Economica',
        property: THEME_FIELD_MAPPING.resilience, // ✅ Era: 'resilienza_economica'
        colors: ['#ffffff', '#fff8e1', '#ffecb3', '#ffe082', '#ffd54f', '#ffca28', '#ffc107', '#ffa000'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 12.5, 25, 37.5, 50, 62.5, 75, 100],
        type: 'jenks'
    },

    cohesion: {
        name: 'Coesione Sociale',
        property: THEME_FIELD_MAPPING.cohesion, // ✅ Era: 'indice_coesione_sociale'
        colors: ['#ffffff', '#e1f5fe', '#b3e5fc', '#81d4fa', '#4fc3f7', '#29b6f6', '#03a9f4', '#0288d1'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 12, 24, 36, 48, 60, 72, 96.7],
        type: 'jenks'
    },
    
    surface_area: {
        name: 'Superficie Particella',
        property: THEME_FIELD_MAPPING.surface_area, // ✅ Era: 'superfice mq'
        colors: ['#ffffff', '#f0f4c3', '#dce775', '#cddc39', '#aed581', '#8bc34a', '#689f38', '#33691e'],
        unit: 'm²',
        format: (val) => `${val?.toLocaleString('it-IT', {maximumFractionDigits: 2}) || 'N/D'} m²`,
        jenksBreaks: [0, 9.77, 85, 180, 320, 580, 1200, 3500, 75549],
        type: 'jenks'
    },

    elevation_min: {
        name: 'Elevazione Minima',
        property: THEME_FIELD_MAPPING.elevation_min, // ✅ Era: 'elevation_min'
        colors: ['#ffffff', '#e8f5e8', '#c8e6c8', '#a5d6a5', '#82c782', '#5fb85f', '#3ca83c', '#1b5e20'],
        unit: 'm',
        format: (val) => `${val || 'N/D'} m`,
        jenksBreaks: [0, 0, 2, 5, 8, 12, 18, 25, 38.2],
        type: 'jenks'
    },

    elevation_max: {
        name: 'Elevazione Massima',
        property: THEME_FIELD_MAPPING.elevation_max, // ✅ Era: 'elevation_max'
        colors: ['#ffffff', '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#0d47a1'],
        unit: 'm',
        format: (val) => `${val || 'N/D'} m`,
        jenksBreaks: [0, 0, 3, 6, 10, 15, 20, 28, 38.7],
        type: 'jenks'
    },

    building_occupancy: {
        name: 'Occupazione Media Edificio',
        property: THEME_FIELD_MAPPING.building_occupancy, // ✅ Era: 'occupazione media dell\'edificio'
        colors: ['#ffffff', '#fff3e0', '#ffe0b2', '#ffcc80', '#ffb74d', '#ffa726', '#ff9800', '#e65100'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 2, 4, 7, 12, 18, 25, 33],
        type: 'jenks'
    },

    structural_dependency: {
        name: 'Indice Dipendenza Strutturale',
        property: THEME_FIELD_MAPPING.structural_dependency, // ✅ Era: 'indice_dipendenza_strutturale'
        colors: ['#ffffff', '#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#b71c1c'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 12, 25, 40, 58, 75, 88, 100],
        type: 'jenks'
    },

    robustness: {
        name: 'Indice di Robustezza',
        property: THEME_FIELD_MAPPING.robustness, // ✅ Era: 'indice di robustezza'
        colors: ['#ffffff', '#f1f8e9', '#dcedc8', '#c5e1a5', '#aed581', '#9ccc65', '#8bc34a', '#33691e'],
        unit: '',
        format: (val) => `${val || 'N/D'}`,
        jenksBreaks: [0, 0, 0.15, 0.3, 0.45, 0.6, 0.8, 1.0, 1.2],
        type: 'jenks'
    },

    requalification_opportunity: {
        name: 'Opportunità di Riqualificazione',
        property: THEME_FIELD_MAPPING.requalification_opportunity, // ✅ Era: 'opport_riqualificazione'
        colors: ['#ffffff', '#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#4a148c'],
        unit: '',
        format: (val) => `${val || 'N/D'}`,
        jenksBreaks: [0, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8],
        type: 'jenks'
    },

    real_estate_potential: {
        name: 'Potenziale Immobiliare',
        property: THEME_FIELD_MAPPING.real_estate_potential, // ✅ Era: 'potenziale_immobiliare'
        colors: ['#ffffff', '#e0f2f1', '#b2dfdb', '#80cbc4', '#4db6ac', '#26a69a', '#009688', '#004d40'],
        unit: '%',
        format: (val) => `${val || 'N/D'}%`,
        jenksBreaks: [0, 0, 10, 20, 35, 50, 65, 75, 85],
        type: 'jenks'
    },

    buildings: {
        name: 'Numero edifici per particella',
        property: THEME_FIELD_MAPPING.buildings, // ✅ Era: 'buildings_count'
        colors: ['#ffffff', '#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#d32f2f'],
        unit: 'edifici',
        format: (val) => `${val || 'N/D'} edifici`,
        jenksBreaks: [0, 1, 2, 3, 4, 6, 9, 15, 23],
        type: 'jenks'
    },
    
    land_cover: {
        name: 'Copertura del suolo',
        property: THEME_FIELD_MAPPING.land_cover, // ✅ Era: 'copertura del suolo'
        colors: ['#FFFF64', '#228B22', '#90EE90', '#006400'],
        unit: '',
        format: (val) => landCoverLabels[val] || val || 'N/D',
        type: 'categorical'
    },
    
    flood_risk: {
        name: 'Rischio alluvione',
        property: THEME_FIELD_MAPPING.flood_risk, // ✅ Era: 'Ri alluvione'
        colors: ['#FF0000', '#C8C8C8'],
        unit: '',
        format: (val) => floodRiskLabels[val] || val || 'N/D',
        type: 'categorical'
    },
    
    landslide_risk: {
        name: 'Rischio di frana',
        property: THEME_FIELD_MAPPING.landslide_risk, // ✅ Era: 'rischio di frana'
        colors: ['#C8C8C8'],
        unit: '',
        format: (val) => landslideRiskLabels[val] || val || 'N/D',
        type: 'categorical'
    },
    
    coastal_erosion: {
        name: 'Rischio erosione costiera',
        property: THEME_FIELD_MAPPING.coastal_erosion, // ✅ Era: 'rischio di erosione costiera'
        colors: ['#C8C8C8'],
        unit: '',
        format: (val) => coastalErosionLabels[val] || val || 'N/D',
        type: 'categorical'
    },
    
    seismic_risk: {
        name: 'Rischio sismico',
        property: THEME_FIELD_MAPPING.seismic_risk, // ✅ Era: 'rischio sismico'
        colors: ['#00FF00'],
        unit: '',
        format: (val) => seismicRiskLabels[val] || val || 'N/D',
        type: 'categorical'
    }
};

/**
 * Applica tema alla mappa
 * INVARIATA: La logica rimane identica, ora usa i campi centralizzati
 */
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
        'source-layer': CONFIG.pmtiles.sourceLayer,
        paint: {
            'fill-opacity': 0.8
        }
    };

    // Configurazione per temi Jenks-Fisher
    if (theme.type === 'jenks') {
        const jenksBreaks = theme.jenksBreaks;
        
        if (themeKey === 'population') {
            layerConfig.paint['fill-color'] = [
                'step',
                ['coalesce', ['get', theme.property], 0],
                theme.colors[0],
                jenksBreaks[2], theme.colors[1],
                jenksBreaks[3], theme.colors[2],
                jenksBreaks[4], theme.colors[3],
                jenksBreaks[5], theme.colors[4],
                jenksBreaks[6], theme.colors[5],
                jenksBreaks[7], theme.colors[6]
            ];
        } else if (themeKey === 'elderly') {
            layerConfig.paint['fill-color'] = [
                'step',
                ['coalesce', ['get', theme.property], 0],
                theme.colors[0],
                jenksBreaks[1], theme.colors[1],
                jenksBreaks[2], theme.colors[2],
                jenksBreaks[3], theme.colors[3],
                jenksBreaks[4], theme.colors[4],
                jenksBreaks[5], theme.colors[5],
                jenksBreaks[6], theme.colors[6],
                jenksBreaks[7], theme.colors[7]
            ];
        } else if (themeKey === 'genderGap') {
            layerConfig.paint['fill-color'] = [
                'step',
                ['coalesce', ['get', theme.property], -67],
                theme.colors[0],
                jenksBreaks[2], theme.colors[1],
                jenksBreaks[3], theme.colors[2],
                jenksBreaks[4], theme.colors[3],
                jenksBreaks[5], theme.colors[4],
                jenksBreaks[6], theme.colors[5],
                jenksBreaks[7], theme.colors[6],
                jenksBreaks[8], theme.colors[7]
            ];
        } else {
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
    // Configurazione per temi categorici
    else if (theme.type === 'categorical') {
        if (themeKey === 'land_cover') {
            layerConfig.paint['fill-color'] = [
                'match',
                ['get', THEME_FIELD_MAPPING.land_cover], // ✅ Era: 'copertura del suolo'
                '1110', landCoverColors['1110'],
                '2111', landCoverColors['2111'],
                '2112', landCoverColors['2112'],
                '2212', landCoverColors['2212'],
                'rgba(200,200,200,0.5)'
            ];
        } else if (themeKey === 'flood_risk') {
            layerConfig.paint['fill-color'] = [
                'match',
                ['downcase', ['coalesce', ['get', THEME_FIELD_MAPPING.flood_risk], '']], // ✅ Era: 'Ri alluvione'
                'alto', floodRiskColors['alto'],
                'no', floodRiskColors['no'],
                floodRiskColors['no']
            ];
        } else if (themeKey === 'landslide_risk') {
            layerConfig.paint['fill-color'] = [
                'case',
                [
                    'any',
                    ['==', ['downcase', ['to-string', ['get', THEME_FIELD_MAPPING.landslide_risk]]], 'none'], // ✅ Era: 'rischio di frana'
                    ['==', ['get', THEME_FIELD_MAPPING.landslide_risk], 'none'],
                    ['==', ['get', THEME_FIELD_MAPPING.landslide_risk], null],
                    ['==', ['get', THEME_FIELD_MAPPING.landslide_risk], '']
                ],
                landslideRiskColors['none'],
                'rgba(200,200,200,0.5)'
            ];
        } else if (themeKey === 'coastal_erosion') {
            layerConfig.paint['fill-color'] = [
                'case',
                [
                    'any',
                    ['==', ['downcase', ['to-string', ['get', THEME_FIELD_MAPPING.coastal_erosion]]], 'none'], // ✅ Era: 'rischio di erosione costiera'
                    ['==', ['get', THEME_FIELD_MAPPING.coastal_erosion], 'none'],
                    ['==', ['get', THEME_FIELD_MAPPING.coastal_erosion], null],
                    ['==', ['get', THEME_FIELD_MAPPING.coastal_erosion], '']
                ],
                coastalErosionColors['none'],
                'rgba(200,200,200,0.5)'
            ];
        } else if (themeKey === 'seismic_risk') {
            layerConfig.paint['fill-color'] = [
                'case',
                [
                    'any',
                    ['==', ['downcase', ['to-string', ['get', THEME_FIELD_MAPPING.seismic_risk]]], 'low'], // ✅ Era: 'rischio sismico'
                    ['==', ['get', THEME_FIELD_MAPPING.seismic_risk], 'low'],
                    ['==', ['get', THEME_FIELD_MAPPING.seismic_risk], 'LOW']
                ],
                seismicRiskColors['low'],
                'rgba(200,200,200,0.5)'
            ];
        }
    }
    // Configurazione per temi numerici standard
    else {
        let range = calculateDynamicRange(themeKey) || getStaticRange(themeKey);
        
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
    if (theme.type === 'jenks') {
        showJenksLegend(theme);
    } else {
        const range = calculateDynamicRange(themeKey) || getStaticRange(themeKey);
        showLegend(theme, range);
    }
}

/**
 * Rimuove tema corrente
 * INVARIATA: Logica identica
 */
function removeTheme() {
    if (map.getLayer('catastale-thematic')) {
        map.removeLayer('catastale-thematic');
    }
    
    map.setPaintProperty('catastale-base', 'fill-opacity', 0.75);
    
    const filter = getCurrentFilter();
    map.setFilter('catastale-base', filter);
    
    currentTheme = 'landuse';
    showBaseLegenda();
}

/**
 * Calcola range dinamico per tema
 * INVARIATA: Logica identica
 */
function calculateDynamicRange(themeKey) {
    if (!currentMandamentoFilter && !currentFoglioFilter) return null;
    
    const theme = themes[themeKey];
    if (!theme) return null;
    
    const filteredRanges = {
        employment: { min: 0, max: 90 },
        genderGap: { min: 0, max: 80 },
        education: { min: 0, max: 90 },
        resilience: { min: 0, max: 90 },
        cohesion: { min: 0, max: 90 }
    };
    
    return filteredRanges[themeKey];
}

/**
 * Ottiene range statico per tema
 * INVARIATA: Logica identica
 */
function getStaticRange(themeKey) {
    const valueRanges = {
        employment: { min: 0, max: 100 },
        genderGap: { min: 0, max: 100 },
        education: { min: 0, max: 100 },
        resilience: { min: 0, max: 100 },
        cohesion: { min: 0, max: 100 }
    };
    
    return valueRanges[themeKey];
}