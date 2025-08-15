// ===== FILE: info-panel.js =====
/**
 * Gestione pannello informazioni particelle
 */

/**
 * Mostra informazioni feature selezionata
 */
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
            
            <h4><i class="fas fa-exclamation-triangle"></i> Rischi</h4>
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

/**
 * Chiude pannello informazioni
 */
function closeInfoPanel() {
    document.getElementById('info-panel').classList.remove('visible');
}