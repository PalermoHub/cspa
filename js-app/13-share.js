// ====================================
// SISTEMA DI CONDIVISIONE COMPLETO
// ====================================

/**
 * Cattura la configurazione corrente della mappa
 */
function captureCurrentConfiguration() {
    const config = {
        // Posizione e zoom (già gestiti dall'hash della mappa)
        center: map.getCenter(),
        zoom: map.getZoom(),
        
        // Basemap
        basemap: document.getElementById('basemap-select')?.value || 'carto-light',
        
        // Filtri territoriali
        mandamento: currentMandamentoFilter || '',
        foglio: currentFoglioFilter || '',
        
        // Tema corrente e categoria
        theme: currentTheme || 'landuse',
        themeCategory: getCurrentThemeCategory(),
        
        // Perimetri
        palermoPerimeter: document.getElementById('palermo-perimeter')?.checked || false,
        centroStoricoPerimeter: document.getElementById('centro-storico-perimeter')?.checked || false,
        uplCsPerimeter: document.getElementById('upl-cs-perimeter')?.checked || false,
        
        // Bordi
        borders: map.getLayoutProperty('catastale-outline', 'visibility') === 'visible',
        
        // Filtri legenda (se presenti)
        legendFilters: window.legendFilterState ? 
            Array.from(window.legendFilterState.activeCategories) : []
    };
    
    return config;
}

/**
 * Determina la categoria del tema corrente
 */
function getCurrentThemeCategory() {
    // Verifica in quale select si trova il tema corrente
    const selects = ['demographic-select', 'economic-select', 'territorial-select'];
    for (let selectId of selects) {
        const select = document.getElementById(selectId);
        if (select) {
            // Per select personalizzati
            const customSelect = document.getElementById(selectId);
            if (customSelect && customSelect.classList.contains('custom-select')) {
                const selectedSpan = customSelect.querySelector('span[id$="-selected"]');
                if (selectedSpan) {
                    // Estrai il valore dal data-value degli option
                    const options = customSelect.querySelectorAll('.select-option');
                    for (let opt of options) {
                        if (opt.innerHTML === selectedSpan.innerHTML) {
                            if (opt.getAttribute('data-value') === currentTheme) {
                                return selectId.replace('-select', '');
                            }
                        }
                    }
                }
            } else if (select.value === currentTheme) {
                return selectId.replace('-select', '');
            }
        }
    }
    return '';
}

/**
 * Genera URL con parametri di configurazione
 */
function generateShareUrl(config) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();
    
    // Aggiungi tutti i parametri di configurazione
    if (config.basemap && config.basemap !== 'carto-light') {
        params.set('basemap', config.basemap);
    }
    if (config.mandamento) {
        params.set('mandamento', config.mandamento);
    }
    if (config.foglio) {
        params.set('foglio', config.foglio);
    }
    if (config.theme && config.theme !== 'landuse') {
        params.set('theme', config.theme);
        if (config.themeCategory) {
            params.set('cat', config.themeCategory);
        }
    }
    if (config.palermoPerimeter) {
        params.set('pp', '1');
    }
    if (config.centroStoricoPerimeter) {
        params.set('csp', '1');
    }
    if (!config.uplCsPerimeter) { // Default è true, quindi salva solo se false
        params.set('upl', '0');
    }
    if (config.borders) {
        params.set('borders', '1');
    }
    if (config.legendFilters && config.legendFilters.length > 0) {
        params.set('lf', config.legendFilters.join(','));
    }
    
    // Mantieni l'hash esistente per posizione e zoom
    url.search = params.toString();
    
    return url.toString();
}

/**
 * Mostra popup di condivisione
 */
function shareConfiguration() {
    const config = captureCurrentConfiguration();
    const shareUrl = generateShareUrl(config);
    
    // Popola l'URL nel campo di input
    document.getElementById('share-url').value = shareUrl;
    
    // Mostra i dettagli della configurazione
    updateConfigDetails(config);
    
    // Mostra il popup
    document.getElementById('share-popup').classList.add('visible');
    
    // Seleziona automaticamente l'URL
    setTimeout(() => {
        document.getElementById('share-url').select();
    }, 100);
}

/**
 * Aggiorna i dettagli della configurazione nel popup
 */
function updateConfigDetails(config) {
    const list = document.getElementById('share-config-list');
    const items = [];
    
    // Basemap
    const basemapLabels = {
        'carto-light': 'CartoDB Light',
        'osm': 'OpenStreetMap',
        'google-maps': 'Google Maps',
        'satellite': 'Google Satellite'
    };
    items.push(`<li><strong>Mappa base:</strong> <span>${basemapLabels[config.basemap] || 'CartoDB Light'}</span></li>`);
    
    // Filtri territoriali
    if (config.mandamento) {
        items.push(`<li><strong>Mandamento:</strong> <span>${config.mandamento}</span></li>`);
    }
    if (config.foglio) {
        items.push(`<li><strong>Foglio:</strong> <span>${config.foglio}</span></li>`);
    }
    
    // Tema
    if (config.theme && config.theme !== 'landuse') {
        const theme = themes[config.theme];
        if (theme) {
            items.push(`<li><strong>Indicatore:</strong> <span>${theme.name}</span></li>`);
        }
    }
    
    // Perimetri attivi
    const perimetri = [];
    if (config.palermoPerimeter) perimetri.push('Palermo');
    if (config.centroStoricoPerimeter) perimetri.push('Centro Storico');
    if (config.uplCsPerimeter) perimetri.push('Mandamenti');
    if (perimetri.length > 0) {
        items.push(`<li><strong>Perimetri:</strong> <span>${perimetri.join(', ')}</span></li>`);
    }
    
    // Altri
    if (config.borders) {
        items.push(`<li><strong>Bordi:</strong> <span>Visibili</span></li>`);
    }
    
    if (config.legendFilters && config.legendFilters.length > 0) {
        items.push(`<li><strong>Filtri legenda:</strong> <span>${config.legendFilters.length} attivi</span></li>`);
    }
    
    list.innerHTML = items.join('');
}

/**
 * Chiude il popup di condivisione
 */
function closeSharePopup() {
    document.getElementById('share-popup').classList.remove('visible');
    document.getElementById('copy-feedback').style.display = 'none';
}

/**
 * Copia l'URL negli appunti
 */
async function copyShareUrl() {
    const urlInput = document.getElementById('share-url');
    const feedback = document.getElementById('copy-feedback');
    
    try {
        // Metodo moderno
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(urlInput.value);
        } else {
            // Fallback per browser più vecchi
            urlInput.select();
            document.execCommand('copy');
        }
        
        // Mostra feedback di successo
        feedback.textContent = '✓ Link copiato negli appunti!';
        feedback.className = 'copy-feedback success';
        
        // Cambia temporaneamente l'icona del pulsante
        const copyBtn = document.querySelector('.copy-btn i');
        copyBtn.className = 'fas fa-check';
        setTimeout(() => {
            copyBtn.className = 'fas fa-copy';
        }, 2000);
        
    } catch (err) {
        console.error('Errore nella copia:', err);
        feedback.textContent = 'Errore nella copia. Seleziona e copia manualmente.';
        feedback.className = 'copy-feedback error';
    }
}

/**
 * Condivisione via WhatsApp
 */
function shareViaWhatsApp() {
    const url = document.getElementById('share-url').value;
    const text = 'Guarda questa vista del Centro Storico di Palermo:';
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
}

/**
 * Condivisione via Telegram
 */
function shareViaTelegram() {
    const url = document.getElementById('share-url').value;
    const text = 'Studio Demografico e Socio-Economico del Centro Storico di Palermo';
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
}

/**
 * Condivisione via Facebook
 */
function shareViaFacebook() {
    const url = document.getElementById('share-url').value;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
}

/**
 * Condivisione via X (Twitter)
 */
function shareViaX() {
    const url = document.getElementById('share-url').value;
    const text = 'Studio Demografico e Socio-Economico del Centro Storico di Palermo';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
}

/**
 * Condivisione via Email
 */
function shareViaEmail() {
    const url = document.getElementById('share-url').value;
    const subject = 'Centro Storico di Palermo - Vista Mappa';
    const body = `Ti invio questa vista interessante del Centro Storico di Palermo:\n\n${url}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
}

/**
 * Applica il tema con gestione dei select personalizzati
 */
function applyThemeFromUrl(theme, category) {
    console.log('🎨 Applicando tema da URL:', theme, 'categoria:', category);
    
    // Mappa delle categorie ai select ID
    const categoryToSelect = {
        'demographic': 'demographic-select',
        'economic': 'economic-select',
        'territorial': 'territorial-select'
    };
    
    const selectId = categoryToSelect[category];
    if (!selectId) {
        console.warn('Categoria non trovata:', category);
        return;
    }
    
    // Reset tutti i select
    ['demographic-select', 'economic-select', 'territorial-select'].forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            if (select.classList.contains('custom-select')) {
                // Select personalizzato - usa la funzione helper
                if (typeof setCustomSelectValue === 'function') {
                    setCustomSelectValue(id, id === selectId ? theme : '');
                }
            } else {
                // Select standard
                select.value = id === selectId ? theme : '';
            }
        }
    });
    
    // Applica il tema dopo un breve ritardo per assicurarsi che i dati siano caricati
    setTimeout(() => {
        if (typeof applyTheme === 'function') {
            console.log('🎨 Chiamata applyTheme con:', theme);
            applyTheme(theme);
            
            // Forza un aggiornamento della legenda
            if (typeof forceLegendUpdate === 'function') {
                setTimeout(forceLegendUpdate, 500);
            }
        } else {
            console.error('❌ Funzione applyTheme non trovata');
        }
    }, 1000);
}

/**
 * Applica configurazione da URL al caricamento
 */
function applyConfigurationFromUrl() {
    const params = new URLSearchParams(window.location.search);
    
    if (!params.toString()) {
        console.log('📍 Nessun parametro URL da applicare');
        return;
    }
    
    console.log('📍 Applicazione configurazione da URL con parametri:', params.toString());
    
    // Funzione per applicare la configurazione
    const applyConfig = () => {
        console.log('🔧 Inizio applicazione configurazione...');
        
        // 1. Basemap (immediato)
        const basemap = params.get('basemap');
        if (basemap) {
            console.log('📍 Applicando basemap:', basemap);
            const basemapSelect = document.getElementById('basemap-select');
            if (basemapSelect) {
                basemapSelect.value = basemap;
                if (typeof switchBasemap === 'function') {
                    switchBasemap(basemap);
                }
            }
        }
        
        // 2. Perimetri (immediato)
        if (params.get('pp') === '1') {
            document.getElementById('palermo-perimeter').checked = true;
            if (typeof togglePerimeter === 'function') {
                togglePerimeter('palermo-perimeter', true);
            }
        }
        
        if (params.get('csp') === '1') {
            document.getElementById('centro-storico-perimeter').checked = true;
            if (typeof togglePerimeter === 'function') {
                togglePerimeter('centro-storico-perimeter', true);
            }
        }
        
        if (params.get('upl') === '0') {
            document.getElementById('upl-cs-perimeter').checked = false;
            if (typeof togglePerimeter === 'function') {
                togglePerimeter('upl-cs-perimeter', false);
            }
        }
        
        // 3. Bordi (dopo 500ms)
        if (params.get('borders') === '1') {
            setTimeout(() => {
                if (typeof toggleBorders === 'function') {
                    toggleBorders(true);
                }
            }, 500);
        }
        
        // 4. Mandamento (dopo 2s per dare tempo ai dati di caricarsi)
        const mandamento = params.get('mandamento');
        if (mandamento) {
            setTimeout(() => {
                console.log('📍 Applicando mandamento:', mandamento);
                const mandamentoSelect = document.getElementById('mandamento-filter');
                if (mandamentoSelect) {
                    mandamentoSelect.value = mandamento;
                    if (typeof applyUnifiedMandamentoFilter === 'function') {
                        applyUnifiedMandamentoFilter(mandamento);
                    }
                }
            }, 2000);
        }
        
        // 5. Foglio (dopo 2.5s)
        const foglio = params.get('foglio');
        if (foglio) {
            setTimeout(() => {
                console.log('📍 Applicando foglio:', foglio);
                const foglioSelect = document.getElementById('foglio-filter');
                if (foglioSelect) {
                    foglioSelect.value = foglio;
                    if (typeof applyUnifiedFoglioFilter === 'function') {
                        applyUnifiedFoglioFilter(foglio);
                    }
                }
            }, 2500);
        }
        
        // 6. Tema (dopo 3s per assicurarsi che tutto sia caricato)
        const theme = params.get('theme');
        const category = params.get('cat');
        if (theme && theme !== 'landuse') {
            setTimeout(() => {
                console.log('📍 Applicando tema:', theme, 'con categoria:', category);
                applyThemeFromUrl(theme, category || 'demographic');
            }, 3000);
        }
        
        // 7. Filtri legenda (dopo 4s)
        const legendFilters = params.get('lf');
        if (legendFilters && window.legendFilterState) {
            setTimeout(() => {
                console.log('📍 Applicando filtri legenda:', legendFilters);
                const filters = legendFilters.split(',');
                filters.forEach(filter => {
                    if (typeof handleLegendItemClick === 'function') {
                        handleLegendItemClick(filter, true);
                    }
                });
            }, 4000);
        }
        
        console.log('✅ Configurazione applicata da URL');
    };
    
    // Attendi che la mappa e i sistemi siano pronti
    let attempts = 0;
    const maxAttempts = 20;
    
    const checkAndApply = () => {
        attempts++;
        
        // Verifica che tutti i sistemi siano pronti
        const isReady = (
            typeof map !== 'undefined' && 
            map.loaded() && 
            typeof applyTheme === 'function' &&
            document.getElementById('demographic-select') !== null
        );
        
        if (isReady) {
            console.log('✅ Sistemi pronti, applicazione configurazione...');
            applyConfig();
        } else if (attempts < maxAttempts) {
            console.log(`⏳ In attesa sistemi... tentativo ${attempts}/${maxAttempts}`);
            setTimeout(checkAndApply, 500);
        } else {
            console.warn('⚠️ Timeout raggiunto, applicazione parziale configurazione');
            applyConfig();
        }
    };
    
    checkAndApply();
}

// ====================================
// INIZIALIZZAZIONE
// ====================================

// Applica configurazione da URL al caricamento
document.addEventListener('DOMContentLoaded', function() {
    // Controlla se ci sono parametri nell'URL
    if (window.location.search) {
        console.log('🌐 Parametri URL rilevati:', window.location.search);
        
        // Attendi un po' per assicurarsi che tutto sia inizializzato
        setTimeout(() => {
            applyConfigurationFromUrl();
        }, 1000);
    }
    
    // Aggiungi animazione pulse al pulsante dopo 5 secondi
    setTimeout(() => {
        const shareBtn = document.getElementById('share-button');
        if (shareBtn) {
            shareBtn.classList.add('pulse');
            // Rimuovi dopo 10 secondi
            setTimeout(() => {
                shareBtn.classList.remove('pulse');
            }, 10000);
        }
    }, 5000);
});

// Chiudi popup con ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSharePopup();
    }
});

// Chiudi popup cliccando fuori
document.getElementById('share-popup')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeSharePopup();
    }
});

console.log('📤 Sistema di condivisione v2.0 caricato - con fix indicatori e select personalizzati');