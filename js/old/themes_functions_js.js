// Funzioni tematizzazione AGGIORNATE con Jenks-Fisher
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
        } else if (themeKey === 'age') {
            // Nuova configurazione per età media con 8 classi
            layerConfig.paint['fill-color'] = [
                'step',
                ['coalesce', ['get', theme.property], 0],
                theme.colors[0], // 0 anni (nessun dato)
                jenksBreaks[2], theme.colors[1], // 1-24 anni
                jenksBreaks[3], theme.colors[2], // 25-34 anni
                jenksBreaks[4], theme.colors[3], // 35-44 anni
                jenksBreaks[5], theme.colors[4], // 45-54 anni
                jenksBreaks[6], theme.colors[5], // 55-64 anni
                jenksBreaks[7], theme.colors[6], // 65-74 anni
                jenksBreaks[8], theme.colors[7]  // 75-80 anni
            ];
        } else if (themeKey === 'elderly') {
            // Configurazione specifica per tasso anziani con 8 classi
            layerConfig.paint['fill-color'] = [
                'step',
                ['coalesce', ['get', theme.property], 0],
                theme.colors[0], // 0% (nessun dato)
                jenksBreaks[1], theme.colors[1], // 0.1-5.2%
                jenksBreaks[2], theme.colors[2], // 5.3-15.4%
                jenksBreaks[3], theme.colors[3], // 15.5-25.1%
                jenksBreaks[4], theme.colors[4], // 25.2-35.4%
                jenksBreaks[5], theme.colors[5], // 35.5-44.7%
                jenksBreaks[6], theme.colors[6], // 44.8-52.1%
                jenksBreaks[7], theme.colors[7]  // 52.2-58.8%
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
    
    // Applica il filtro corrente al layer base
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
} 'land_cover') {
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
    else if (themeKey ===