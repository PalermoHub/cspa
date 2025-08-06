// =====legends.js =====
/**
 * Gestione legende per tutti i tipi di tema
 */

/**
 * Mostra legenda Jenks-Fisher
 */
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
    
    const labels = getJenksLabels(currentTheme);
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

/**
 * Mostra legenda standard
 */
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
    } else {
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

/**
 * Mostra legenda base uso del suolo
 */
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

/**
 * Inizializza la legenda base
 */
function initBaseLegend() {
    if (!currentTheme || currentTheme === 'landuse') {
        showBaseLegenda();
    }
}

/**
 * Ottiene labels per temi Jenks
 */
function getJenksLabels(themeKey) {
    const labelMaps = {
        population: [
            '0 abitanti',
            '1 abitante', 
            '2-3 abitanti',
            '4-6 abitanti', 
            '7-12 abitanti',
            '13-20 abitanti',
            '21-35 abitanti'
        ],
        age: [
            '0 anni (nessun dato)',
            '1-24 anni',
            '25-34 anni', 
            '35-44 anni',
            '45-54 anni',
            '55-64 anni',
            '65-74 anni',
            '75-80 anni'
        ],
        elderly: [
            '0% (nessun dato)',
            '0.1-5.2%',
            '5.3-15.4%', 
            '15.5-25.1%',
            '25.2-35.4%',
            '35.5-44.7%',
            '44.8-52.1%',
            '52.2-58.8%'
        ],
        density: [
            '0 ab/km² (nessun dato)',
            '1-999 ab/km²',
            '1.000-3.499 ab/km²', 
            '3.500-7.499 ab/km²',
            '7.500-14.999 ab/km²',
            '15.000-29.999 ab/km²',
            '30.000-59.999 ab/km²',
            '60.000-194.093 ab/km²'
        ],
        foreign: [
            '0% (nessun dato)',
            '1-4%',
            '5-11%', 
            '12-21%',
            '22-34%',
            '35-49%',
            '50-69%',
            '70-100%'
        ],
        familySize: [
            '0 componenti (nessun dato)',
            '1-1.5 componenti',
            '1.6-2.2 componenti',
            '2.3-2.8 componenti',
            '2.9-3.5 componenti',
            '3.6-4.2 componenti',
            '4.3-5.0 componenti',
            'Oltre 5 componenti'
        ],
        masculinity: [
            '0% (nessun dato)',
            '1-45%',
            '46-50%',
            '51-55%',
            '56-60%',
            '61-70%',
            '71-85%',
            '86-100%'
        ],
        singlePerson: [
            '0% (nessun dato)',
            '1-15%',
            '16-25%',
            '26-35%',
            '36-45%',
            '46-60%',
            '61-80%',
            '81-100%'
        ],
        largeFamilies: [
            '0% (nessun dato)',
            '1-5%',
            '6-12%',
            '13-20%',
            '21-30%',
            '31-45%',
            '46-65%',
            '66-100%'
        ],
        femaleEmployment: [
            '0% (nessun dato)',
            '1-20%',
            '21-35%',
            '36-45%',
            '46-55%',
            '56-70%',
            '71-85%',
            '86-100%'
        ],
        higherEducation: [
            '0% (nessun dato)',
            '1-15%',
            '16-25%',
            '26-35%',
            '36-50%',
            '51-65%',
            '66-80%',
            '81-100%'
        ],
        lowEducation: [
            '0% (nessun dato)',
            '1-10%',
            '11-20%',
            '21-35%',
            '36-50%',
            '51-65%',
            '66-80%',
            '81-100%'
        ],
        workIntegration: [
            '0% (nessun dato)',
            '1-20%',
            '21-35%',
            '36-50%',
            '51-65%',
            '66-75%',
            '76-85%',
            '86-100%'
        ],
        nonEuForeigners: [
            '0% (nessun dato)',
            '1-8%',
            '9-18%',
            '19-30%',
            '31-45%',
            '46-60%',
            '61-80%',
            '81-100%'
        ],
        youngForeigners: [
            '0% (nessun dato)',
            '1-12%',
            '13-22%',
            '23-35%',
            '36-50%',
            '51-65%',
            '66-80%',
            '81-100%'
        ],
        employment: [
            '0% (nessun dato)',
            '1-12%',
            '13-25%',
            '26-40%',
            '41-55%',
            '56-70%',
            '71-85%',
            '86-100%'
        ],
        genderGap: [
            'Molto negativo (-67% a -31%)',
            'Negativo (-30% a -11%)',
            'Lievemente negativo (-10% a -1%)',
            'Equilibrato (0% a 14%)',
            'Lievemente positivo (15% a 29%)',
            'Positivo (30% a 49%)',
            'Molto positivo (50% a 74%)',
            'Estremo (75% a 100%)'
        ],
        resilience: [
            '0% (nessun dato)',
            '1-12.5%',
            '12.6-25%',
            '25.1-37.5%',
            '37.6-50%',
            '50.1-62.5%',
            '62.6-75%',
            '75.1-100%'
        ],
        cohesion: [
            '0% (nessun dato)',
            '1-12%',
            '13-24%',
            '25-36%',
            '37-48%',
            '49-60%',
            '61-72%',
            '73-96.7%'
        ],
        surface_area: [
            '0 m² (nessun dato)',
            '1-85 m²',
            '86-180 m²',
            '181-320 m²',
            '321-580 m²',
            '581-1.200 m²',
            '1.201-3.500 m²',
            'Oltre 3.500 m²'
        ],
        elevation_min: [
            '0 m (nessun dato)',
            '1-2 m',
            '3-5 m',
            '6-8 m',
            '9-12 m',
            '13-18 m',
            '19-25 m',
            '26-38.2 m'
        ],
        elevation_max: [
            '0 m (nessun dato)',
            '1-3 m',
            '4-6 m',
            '7-10 m',
            '11-15 m',
            '16-20 m',
            '21-28 m',
            '29-38.7 m'
        ],
        building_occupancy: [
            '0% (nessun dato)',
            '1-2%',
            '3-4%',
            '5-7%',
            '8-12%',
            '13-18%',
            '19-25%',
            '26-33%'
        ],
        structural_dependency: [
            '0% (nessun dato)',
            '1-12%',
            '13-25%',
            '26-40%',
            '41-58%',
            '59-75%',
            '76-88%',
            '89-100%'
        ],
        robustness: [
            '0 (nessun dato)',
            '0.01-0.15',
            '0.16-0.30',
            '0.31-0.45',
            '0.46-0.60',
            '0.61-0.80',
            '0.81-1.00',
            '1.01-1.20'
        ],
        requalification_opportunity: [
            'Nessuna opportunità',
            'Molto bassa',
            'Bassa',
            'Medio-bassa',
            'Media',
            'Medio-alta',
            'Alta',
            'Molto alta'
        ],
        real_estate_potential: [
            '0% (nessun dato)',
            '1-10%',
            '11-20%',
            '21-35%',
            '36-50%',
            '51-65%',
            '66-75%',
            '76-85%'
        ],
        buildings: [
            '0 edifici',
            '1 edificio',
            '2 edifici',
            '3 edifici',
            '4-6 edifici',
            '7-9 edifici',
            '10-15 edifici',
            '16+ edifici'
        ]
    };
    
    return labelMaps[themeKey] || Array.from({length: 8}, (_, i) => `Classe ${i + 1}`);
}