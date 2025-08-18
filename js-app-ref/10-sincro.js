// ============================================
// SISTEMA SINCRONIZZAZIONE AFFIDABILE v4.0
// Solo con floating-panel - Soluzione definitiva
// ============================================

(function() {
    'use strict';
    
    let container = null;
    let isInitialized = false;
    let observer = null;
    
    /**
     * Crea o trova il contenitore dei pulsanti
     */
    function initializeContainer() {
        if (isInitialized) return;
        
        // Cerca o crea il contenitore
        container = document.getElementById('synced-buttons-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'synced-buttons-container';
            container.className = 'synced-buttons-container';
            
            // Trova o crea beta
            let beta = document.getElementById('beta');
            if (!beta) {
                beta = document.createElement('div');
                beta.id = 'beta';
                beta.innerHTML = '<img src="img/beta.png" width="40" title="beta version" alt="beta version">';
            }
            
            // Trova o crea share button
            let shareButton = document.querySelector('.share-button') || document.getElementById('share-button');
            if (!shareButton) {
                shareButton = document.createElement('div');
                shareButton.id = 'share-button';
                shareButton.className = 'share-button';
                shareButton.innerHTML = '<i class="fas fa-share-alt"></i>';
                shareButton.onclick = function() {
                    if (typeof shareConfiguration === 'function') {
                        shareConfiguration();
                    }
                };
            }
            
            // Aggiungi al contenitore
            container.appendChild(beta);
            container.appendChild(shareButton);
            document.body.appendChild(container);
        }
        
        isInitialized = true;
        console.log('✅ Container pulsanti inizializzato');
    }
    
    /**
     * Aggiorna lo stato del container in base al floating-panel
     */
    function updateContainerState() {
        const floatingPanel = document.getElementById('floating-panel');
        if (!floatingPanel || !container) return;
        
        const isPanelOpen = floatingPanel.classList.contains('open');
        container.classList.toggle('panel-open', isPanelOpen);
        
        console.log(isPanelOpen ? 
            '➡️ Pannello flottante aperto - pulsanti spostati' : 
            '⬅️ Pannello flottante chiuso - pulsanti tornati');
    }
    
    /**
     * Sincronizza con floating-panel
     */
    function setupSync() {
        const floatingPanel = document.getElementById('floating-panel');
        if (!floatingPanel || !container) {
            console.warn('⚠️ Elementi necessari non trovati');
            return;
        }
        
        // Pulisci eventuali observer precedenti
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        
        // Crea nuovo observer
        observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class') {
                    updateContainerState();
                    break;
                }
            }
        });
        
        // Osserva SOLO floating-panel
        observer.observe(floatingPanel, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Imposta stato iniziale
        updateContainerState();
        
        console.log('🔗 Sincronizzazione configurata (solo con floating-panel)');
    }
    
    /**
     * Override della funzione toggle
     */
    function overrideToggle() {
        const originalToggle = window.toggleFloatingPanel;
        
        if (originalToggle && !originalToggle._overridden) {
            window.toggleFloatingPanel = function() {
                originalToggle.apply(this, arguments);
                
                // Aggiorna stato dopo toggle
                setTimeout(updateContainerState, 50);
            };
            
            window.toggleFloatingPanel._overridden = true;
            console.log('✅ Toggle function override completato');
        }
    }
    
    /**
     * Gestisce il resize della finestra
     */
    function handleResize() {
        // Forza aggiornamento stato su resize
        setTimeout(updateContainerState, 100);
    }
    
    /**
     * Inizializzazione principale
     */
    function initialize() {
        console.log('🚀 Inizializzazione sistema pulsanti sincronizzati v4.0');
        
        // Inizializza container
        initializeContainer();
        
        // Attendi che il pannello flottante sia pronto
        const checkPanel = () => {
            const floatingPanel = document.getElementById('floating-panel');
            if (floatingPanel) {
                setupSync();
                overrideToggle();
                
                // Aggiungi pulse dopo 5 secondi
                setTimeout(() => {
                    const shareBtn = container?.querySelector('.share-button');
                    if (shareBtn) {
                        shareBtn.classList.add('pulse');
                        setTimeout(() => {
                            shareBtn.classList.remove('pulse');
                        }, 10000);
                    }
                }, 5000);
                
                // Ascolta resize della finestra
                window.addEventListener('resize', handleResize);
                
                console.log('✅ Sistema completamente operativo');
                return true;
            }
            return false;
        };
        
        // Prova immediatamente
        if (!checkPanel()) {
            // Ritenta ogni 100ms se necessario
            const intervalId = setInterval(() => {
                if (checkPanel()) {
                    clearInterval(intervalId);
                }
            }, 100);
            
            // Timeout di sicurezza
            setTimeout(() => clearInterval(intervalId), 10000);
        }
    }
    
    // Avvia inizializzazione
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
})();

console.log('📍 Sistema sincronizzazione mobile v4.0 - Soluzione definitiva');