// ===== FILE: info-panel.js - REFACTORIZZATO =====
/**
 * Gestione pannello informazioni particelle
 * AGGIORNATO: Utilizza CONFIG.fields per centralizzazione campi
 */

/**
 * Mostra informazioni feature selezionata
 * REFACTORIZZATO: Tutti i props['campo'] sostituiti con props[CONFIG.fields.*]
 */
function showFeatureInfo(feature) {
    const panel = document.getElementById('info-panel');
    const title = document.getElementById('panel-title');
    const subtitle = document.getElementById('panel-subtitle');
    const content = document.getElementById('info-content');
    
    const props = feature.properties;
    
    // Correggi il nome del mandamento se necessario
    let mandamentoDisplay = props[CONFIG.fields.identifiers.mandamento] || 'N/D'; // ✅ Era: props.Mandamento
    if (mandamentoDisplay === 'Castellamare') {
        mandamentoDisplay = 'Castellammare';
    }
    
    title.textContent = `Particella ${props[CONFIG.fields.identifiers.particella] || props[CONFIG.fields.identifiers.fid] || 'N/D'}`; // ✅ Era: props.particella || props.fid
    subtitle.textContent = `Foglio: ${props[CONFIG.fields.identifiers.foglio] || 'N/D'}`; // ✅ Era: props.foglio
    
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
                <span class="info-value">${props[CONFIG.fields.geography.surface] ? parseFloat(props[CONFIG.fields.geography.surface]).toLocaleString('it-IT', {maximumFractionDigits: 2}) + ' m²' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Classe:</span>
                <span class="info-value">${landUseLabels[props[CONFIG.fields.geography.landUseClass]] || props[CONFIG.fields.geography.landUseClass] || 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Sottoclasse:</span>
                <span class="info-value">${landUseLabels[props[CONFIG.fields.geography.landUseSubtype]] || props[CONFIG.fields.geography.landUseSubtype] || 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Copertura del suolo:</span>
                <span class="info-value">${landCoverLabels[props[CONFIG.fields.geography.landCover]] || props[CONFIG.fields.geography.landCover] || 'N/D'}</span>
            </div>
        </div>

        <div class="info-group">
            <h3><i class="fas fa-users"></i> Demografia</h3>
            <div class="info-item">
                <span class="info-label">Popolazione Stimata:</span>
                <span class="info-value">${props[CONFIG.fields.demographics.population] ? parseFloat(props[CONFIG.fields.demographics.population]).toLocaleString('it-IT', {maximumFractionDigits: 2}) : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Età Media:</span>
                <span class="info-value">${props[CONFIG.fields.demographics.averageAge] ? parseFloat(props[CONFIG.fields.demographics.averageAge]).toFixed(2) + ' anni' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Tasso Anziani:</span>
                <span class="info-value">${props[CONFIG.fields.demographics.elderly] ? parseFloat(props[CONFIG.fields.demographics.elderly]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Dimensione Media Famiglia:</span>
                <span class="info-value">${props[CONFIG.fields.demographics.familySize] ? parseFloat(props[CONFIG.fields.demographics.familySize]).toFixed(2) + ' componenti' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Tasso di Mascolinità:</span>
                <span class="info-value">${props[CONFIG.fields.demographics.masculinity] ? parseFloat(props[CONFIG.fields.demographics.masculinity]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Tasso Persona Singola:</span>
                <span class="info-value">${props[CONFIG.fields.demographics.singlePerson] ? parseFloat(props[CONFIG.fields.demographics.singlePerson]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Tasso Famiglie Numerose:</span>
                <span class="info-value">${props[CONFIG.fields.demographics.largeFamilies] ? parseFloat(props[CONFIG.fields.demographics.largeFamilies]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Popolazione Straniera:</span>
                <span class="info-value">${props[CONFIG.fields.demographics.foreigners] ? parseFloat(props[CONFIG.fields.demographics.foreigners]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Stranieri Non-UE:</span>
                <span class="info-value">${props[CONFIG.fields.demographics.nonEuForeigners] ? parseFloat(props[CONFIG.fields.demographics.nonEuForeigners]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Giovani Stranieri:</span>
                <span class="info-value">${props[CONFIG.fields.demographics.youngForeigners] ? parseFloat(props[CONFIG.fields.demographics.youngForeigners]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
        </div>
                            
        <div class="info-group">
            <h3><i class="fas fa-briefcase"></i> Socio-Economici</h3>
            <div class="info-item">
                <span class="info-label">Tasso Occupazione:</span>
                <span class="info-value">${props[CONFIG.fields.socioEconomic.employment] ? parseFloat(props[CONFIG.fields.socioEconomic.employment]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Occup. Femminile:</span>
                <span class="info-value">${props[CONFIG.fields.socioEconomic.femaleEmployment] ? parseFloat(props[CONFIG.fields.socioEconomic.femaleEmployment]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Divario Genere:</span>
                <span class="info-value">${props[CONFIG.fields.socioEconomic.genderGap] ? parseFloat(props[CONFIG.fields.socioEconomic.genderGap]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Istruzione Superiore:</span>
                <span class="info-value">${props[CONFIG.fields.socioEconomic.higherEducation] ? parseFloat(props[CONFIG.fields.socioEconomic.higherEducation]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
        </div>

        <div class="info-group">
            <h3><i class="fas fa-chart-line"></i> Indici</h3>
            <div class="info-item">
                <span class="info-label">Istruzione Superiore:</span>
                <span class="info-value">${props[CONFIG.fields.socioEconomic.higherEducation] ? parseFloat(props[CONFIG.fields.socioEconomic.higherEducation]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Basso Tasso Istruzione:</span>
                <span class="info-value">${props[CONFIG.fields.socioEconomic.lowEducation] ? parseFloat(props[CONFIG.fields.socioEconomic.lowEducation]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Integrazione Lavoro:</span>
                <span class="info-value">${props[CONFIG.fields.socioEconomic.workIntegration] ? parseFloat(props[CONFIG.fields.socioEconomic.workIntegration]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Resilienza Economica:</span>
                <span class="info-value">${props[CONFIG.fields.socioEconomic.economicResilience] ? parseFloat(props[CONFIG.fields.socioEconomic.economicResilience]).toFixed(2) : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Coesione Sociale:</span>
                <span class="info-value">${props[CONFIG.fields.socioEconomic.socialCohesion] ? parseFloat(props[CONFIG.fields.socioEconomic.socialCohesion]).toFixed(2) : 'N/D'}</span>
            </div>
        </div>

        <div class="info-group">
            <h3><i class="fas fa-hammer"></i> Territoriali</h3>
            <div class="info-item">
                <span class="info-label">Numero edifici per particella:</span>
                <span class="info-value">${props[CONFIG.fields.territorial.buildingsCount] || 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Densità Abitativa:</span>
                <span class="info-value">${props[CONFIG.fields.territorial.density] ? parseFloat(props[CONFIG.fields.territorial.density]).toLocaleString('it-IT', {maximumFractionDigits: 2}) + ' ab/km²' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Superficie:</span>
                <span class="info-value">${props[CONFIG.fields.geography.surface] ? parseFloat(props[CONFIG.fields.geography.surface]).toLocaleString('it-IT', {maximumFractionDigits: 2}) + ' m²' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Quota al suolo Min:</span>
                <span class="info-value">${props[CONFIG.fields.territorial.elevationMin] ? parseFloat(props[CONFIG.fields.territorial.elevationMin]).toFixed(2) + ' m' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Quota al suolo Max:</span>
                <span class="info-value">${props[CONFIG.fields.territorial.elevationMax] ? parseFloat(props[CONFIG.fields.territorial.elevationMax]).toFixed(2) + ' m' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Occupazione Media Edificio:</span>
                <span class="info-value">${props[CONFIG.fields.territorial.buildingOccupancy] ? parseFloat(props[CONFIG.fields.territorial.buildingOccupancy]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Dipendenza Strutturale:</span>
                <span class="info-value">${props[CONFIG.fields.territorial.structuralDependency] ? parseFloat(props[CONFIG.fields.territorial.structuralDependency]).toFixed(2) + '%' : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Indice Robustezza:</span>
                <span class="info-value">${props[CONFIG.fields.territorial.robustness] ? parseFloat(props[CONFIG.fields.territorial.robustness]).toFixed(2) : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Opportunità Riqualificazione:</span>
                <span class="info-value">${props[CONFIG.fields.territorial.requalificationOpportunity] ? parseFloat(props[CONFIG.fields.territorial.requalificationOpportunity]).toFixed(2) : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Potenziale Immobiliare:</span>
                <span class="info-value">${props[CONFIG.fields.territorial.realEstatePotential] ? parseFloat(props[CONFIG.fields.territorial.realEstatePotential]).toFixed(2) : 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">CAP:</span>
                <span class="info-value">${props[CONFIG.fields.geography.postalCode] || 'N/D'}</span>
            </div>
            
            <h4><i class="fas fa-exclamation-triangle"></i> Rischi</h4>
            <div class="info-item">
                <span class="info-label">Rischio alluvione:</span>
                <span class="info-value">${floodRiskLabels[props[CONFIG.fields.risks.flood]] || props[CONFIG.fields.risks.flood] || 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Rischio di frana:</span>
                <span class="info-value">${landslideRiskLabels[props[CONFIG.fields.risks.landslide]] || props[CONFIG.fields.risks.landslide] || 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Rischio erosione costiera:</span>
                <span class="info-value">${coastalErosionLabels[props[CONFIG.fields.risks.coastalErosion]] || props[CONFIG.fields.risks.coastalErosion] || 'N/D'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Rischio sismico:</span>
                <span class="info-value">${seismicRiskLabels[props[CONFIG.fields.risks.seismic]] || props[CONFIG.fields.risks.seismic] || 'N/D'}</span>
            </div>
        </div>
    `;
    
    panel.classList.add('visible');
}

/**
 * Chiude pannello informazioni
 * INVARIATA: Nessuna modifica necessaria
 */
function closeInfoPanel() {
    document.getElementById('info-panel').classList.remove('visible');
}