// Funzione per mostrare legenda Jenks-Fisher
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
    } else if (currentTheme === 'familySize') {
        labels = [
            '0 componenti (nessun dato)',
            '1-1.4 componenti',
            '1.5-2.1 componenti',
            '2.2-2.7 componenti',
            '2.8-3.4 componenti',
            '3.5-4.1 componenti',
            '4.2-4.9 componenti',
            '5.0-33 componenti'
        ];
    } else if (currentTheme === 'masculinity') {
        labels = [
            '0% (nessun dato)',
            '1-44%',
            '45-49%',
            '50-54%',
            '55-59%',
            '60-69%',
            '70-84%',
            '85-100%'
        ];
    } else if (currentTheme === 'singlePerson') {
        labels = [
            '0% (nessun dato)',
            '1-14%',
            '15-24%',
            '25-34%',
            '35-44%',
            '45-59%',
            '60-79%',
            '80-100%'
        ];
    } else if (currentTheme === 'employment') {
        labels = [
            '0% (nessun dato)',
            '1-12%',
            '13-25%',
            '26-40%',
            '41-55%',
            '56-70%',
            '71-85%',
            '86-100%'
        ];
    } else if (currentTheme === 'largeFamilies') {
        labels = [
            '0% (nessun dato)',
            '1-4%',
            '5-11%',
            '12-19%',
            '20-29%',
            '30-44%',
            '45-64%',
            '65-100%'
        ];
    } else if (currentTheme === 'femaleEmployment') {
        labels = [
            '0% (nessun dato)',
            '1-19%',
            '20-34%',
            '35-44%',
            '45-54%',
            '55-69%',
            '70-84%',
            '85-100%'
        ];
    } else if (currentTheme === 'genderGap') {
        labels = [
            '-67% a -31% (Favorevole donne)',
            '-30% a -11% (Lievemente favorevole donne)',
            '-10% a -1% (Quasi paritario - donne)',
            '0% a 14% (Quasi paritario - uomini)',
            '15% a 29% (Lievemente favorevole uomini)',
            '30% a 49% (Favorevole uomini)',
            '50% a 74% (Molto favorevole uomini)',
            '75% a 100% (Estremamente favorevole uomini)'
        ];
    } else if (currentTheme === 'higherEducation') {
        labels = [
            '0% (nessun dato)',
            '1-14%',
            '15-24%',
            '25-34%',
            '35-49%',
            '50-64%',
            '65-79%',
            '80-100%'
        ];
    } else if (currentTheme === 'lowEducation') {
        labels = [
            '0% (nessun dato)',
            '1-9%',
            '10-19%',
            '20-34%',
            '35-49%',
            '50-64%',
            '65-79%',
            '80-100%'
        ];
    } else if (currentTheme === 'workIntegration') {
        labels = [
            '0% (nessun dato)',
            '1-19%',
            '20-34%',
            '35-49%',
            '50-64%',
            '65-74%',
            '75-84%',
            '85-100%'
        ];
    } else if (currentTheme === 'nonEuForeigners') {
        labels = [
            '0% (nessun dato)',
            '1-7%',
            '8-17%',
            '18-29%',
            '30-44%',
            '45-59%',
            '60-79%',
            '80-100%'
        ];
    } else if (currentTheme === 'youngForeigners') {
        labels = [
            '0% (nessun dato)',
            '1-11%',
            '12-21%',
            '22-34%',
            '35-49%',
            '50-64%',
            '65-79%',
            '80-100%'
        ];			
    } else if (currentTheme === 'buildings') {
        labels = [
            '0 edifici',
            '1 edificio', 
            '2 edifici',
            '3 edifici',
            '4-5 edifici',
            '6-8 edifici',
            '9-14 edifici',
            '15-23 edifici'
        ];
    } else if (currentTheme === 'resilience') {
        labels = [
            '0% (nessun dato)',
            '1-12.5%',
            '12.6-25%',
            '25.1-37.5%',
            '37.6-50%',
            '50.1-62.5%',
            '62.6-75%',
            '75.1-100%'
        ];
    } else if (currentTheme === 'cohesion') {
        labels = [
            '0% (nessun dato)',
            '1-12%',
            '12.1-24%',
            '24.1-36%',
            '36.1-48%',
            '48.1-60%',
            '60.1-72%',
            '72.1-96.7%'
        ];
    } else if (currentTheme === 'surface_area') {
        labels = [
            '0 m² (nessun dato)',
            '9.77-84 m²',
            '85-179 m²',
            '180-319 m²',
            '320-579 m²',
            '580-1.199 m²',
            '1.200-3.499 m²',
            '3.500-75.549 m²'
        ];
    } else if (currentTheme === 'elevation_min') {
        labels = [
            '0 m (nessun dato)',
            '0-1 m',
            '2-4 m',
            '5-7 m',
            '8-11 m',
            '12-17 m',
            '18-24 m',
            '25-38.2 m'
        ];
    } else if (currentTheme === 'elevation_max') {
        labels = [
            '0 m (nessun dato)',
            '0-2 m',
            '3-5 m',
            '6-9 m',
            '10-14 m',
            '15-19 m',
            '20-27 m',
            '28-38.7 m'
        ];
    } else if (currentTheme === 'building_occupancy') {
        labels = [
            '0% (nessun dato)',
            '0-1%',
            '2-3%',
            '4-6%',
            '7-11%',
            '12-17%',
            '18-24%',
            '25-33%'
        ];
    } else if (currentTheme === 'structural_dependency') {
        labels = [
            '0% (nessun dato)',
            '0-11%',
            '12-24%',
            '25-39%',
            '40-57%',
            '58-74%',
            '75-87%',
            '88-100%'
        ];
    } else if (currentTheme === 'robustness') {
        labels = [
            '0 (nessun dato)',
            '0-0.14',
            '0.15-0.29',
            '0.3-0.44',
            '0.45-0.59',
            '0.6-0.79',
            '0.8-0.99',
            '1.0-1.2'
        ];
    } else if (currentTheme === 'requalification_opportunity') {
        labels = [
            'Tutti i valori = 0',
            '', '', '', '', '', '', '' // Classi vuote
        ];
    } else if (currentTheme === 'real_estate_potential') {
        labels = [
            '0% (nessun dato)',
            '0-9%',
            '10-19%',
            '20-34%',
            '35-49%',
            '50-64%',
            '65-74%',
            '75-85%'
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

// Funzione showLegend per gestire temi categorici
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