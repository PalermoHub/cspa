        // ============================================
        // FUNZIONI PRINCIPALI PANNELLO FLOTTANTE
        // ============================================
        
        function toggleFloatingPanel() {
            const panel = document.getElementById('floating-panel');
            const toggleBtn = document.getElementById('panel-toggle');
            const toggleIcon = document.getElementById('toggle-icon');
            
            if (panel.classList.contains('open')) {
                // Chiudi il pannello
                panel.classList.remove('open');
                toggleBtn.classList.remove('panel-open');
                toggleIcon.className = 'fas fa-bars';
                
                if (window.innerWidth <= 768) {
                    panel.dataset.manuallyOpened = 'false';
                }
            } else {
                // Apri il pannello
                panel.classList.add('open');
                toggleBtn.classList.add('panel-open');
                toggleIcon.className = 'fa fa-chevron-left';
                
                if (window.innerWidth <= 768) {
                    panel.dataset.manuallyOpened = 'true';
                }
            }
        }

        // ============================================
        // SISTEMA DI RESIZE DELLE SEZIONI
        // ============================================
        let isResizing = false;
        let startY = 0;
        let startHeight = 0;
        let controlsSection = null;
        let legendSection = null;
        let minControlsHeight = 200;
        let minLegendHeight = 150;

        function initializeResize() {
            const resizeHandle = document.getElementById('resize-handle');
            controlsSection = document.getElementById('controls-section');
            legendSection = document.querySelector('.legend-section');
            
            if (!resizeHandle || !controlsSection || !legendSection) return;
            
            // Mouse events
            resizeHandle.addEventListener('mousedown', startResize);
            document.addEventListener('mousemove', doResize);
            document.addEventListener('mouseup', stopResize);
            
            // Touch events per mobile
            resizeHandle.addEventListener('touchstart', startResize);
            document.addEventListener('touchmove', doResize);
            document.addEventListener('touchend', stopResize);
        }

        function startResize(e) {
            e.preventDefault();
            isResizing = true;
            startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            startHeight = controlsSection.offsetHeight;
            
            // Aggiungi classe per feedback visivo
            document.body.style.cursor = 'ns-resize';
            controlsSection.style.userSelect = 'none';
            legendSection.style.userSelect = 'none';
        }

        function doResize(e) {
            if (!isResizing) return;
            
            const currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            const deltaY = currentY - startY;
            const newHeight = startHeight + deltaY;
            
            // Calcola l'altezza totale disponibile
            const panelHeight = document.getElementById('floating-panel').offsetHeight;
            const maxControlsHeight = panelHeight - minLegendHeight - 100; // 100px per margini e header
            
            // Applica i limiti
            if (newHeight >= minControlsHeight && newHeight <= maxControlsHeight) {
                controlsSection.style.flex = 'none';
                controlsSection.style.height = newHeight + 'px';
                
                // La sezione legenda si adatta automaticamente grazie a flex: 1
                legendSection.style.flex = '1';
            }
        }

        function stopResize() {
            if (!isResizing) return;
            
            isResizing = false;
            document.body.style.cursor = '';
            if (controlsSection) controlsSection.style.userSelect = '';
            if (legendSection) legendSection.style.userSelect = '';
        }

   
        // ============================================
        // INIZIALIZZAZIONE PANNELLO
        // ============================================
        function initializePanel() {
            const panel = document.getElementById('floating-panel');
            const toggleBtn = document.getElementById('panel-toggle');
            const toggleIcon = document.getElementById('toggle-icon');
            
            // Su desktop (>768px) il pannello è aperto di default
            if (window.innerWidth > 768) {
                panel.classList.add('open');
                toggleBtn.classList.add('panel-open');
                toggleIcon.className = 'fa fa-chevron-left';
            } else {
                // Su mobile/tablet il pannello è chiuso di default
                panel.classList.remove('open');
                toggleBtn.classList.remove('panel-open');
                toggleIcon.className = 'fas fa-bars';
            }
        }

        // ============================================
        // GESTIONE RESIZE FINESTRA
        // ============================================
        function handleWindowResize() {
            const panel = document.getElementById('floating-panel');
            const toggleBtn = document.getElementById('panel-toggle');
            const toggleIcon = document.getElementById('toggle-icon');
            
            // Solo su desktop, riapri automaticamente se chiuso
            if (window.innerWidth > 768 && !panel.classList.contains('open')) {
                if (!panel.dataset.manuallyOpened || panel.dataset.manuallyOpened !== 'false') {
                    panel.classList.add('open');
                    toggleBtn.classList.add('panel-open');
                    toggleIcon.className = 'fa fa-chevron-left';
                }
            }
            // Su mobile, chiudi se non è stato aperto manualmente
            else if (window.innerWidth <= 768 && panel.classList.contains('open')) {
                if (!panel.dataset.manuallyOpened || panel.dataset.manuallyOpened !== 'true') {
                    panel.classList.remove('open');
                    toggleBtn.classList.remove('panel-open');
                    toggleIcon.className = 'fas fa-bars';
                }
            }
            
            // Disabilita resize su mobile
            const resizeHandle = document.getElementById('resize-handle');
            if (resizeHandle) {
                resizeHandle.style.display = window.innerWidth <= 768 ? 'none' : 'flex';
            }
        }

        // ============================================
        // INIZIALIZZAZIONE AL CARICAMENTO
        // ============================================
        window.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 Inizializzazione CSPA con Legenda Integrata...');
            
            // Inizializza pannello flottante
            initializePanel();
            initializeResize();
            setupEventHandlers();
            
            // Event listener per resize finestra
            window.addEventListener('resize', handleWindowResize);
            
            // Simula caricamento iniziale
            setTimeout(() => {
                console.log('✅ Pannello flottante inizializzato');
                console.log('✅ Sistema di resize sezioni attivo');
                console.log('✅ Legenda dinamica integrata');
                console.log('✅ Event handlers configurati');
                console.log('📱 Responsive mode:', window.innerWidth <= 768 ? 'Mobile/Tablet' : 'Desktop');
                console.log('✅ Sistema CSPA pronto all\'uso');
                
                // Demo: carica automaticamente un indicatore dopo 2 secondi
                setTimeout(() => {
                    const demographicSelect = document.getElementById('demographic-select');
                    if (demographicSelect) {
                        demographicSelect.value = 'population';
                        updateLegend('population', generateMockData());
                        console.log('📊 Demo: Indicatore popolazione caricato automaticamente');
                    }
                }, 2000);
            }, 1000);
        });

        // ============================================
        // GESTIONE ERRORI GLOBALE
        // ============================================
        window.addEventListener('error', function(e) {
            console.error('❌ Errore CSPA:', e.message, 'in', e.filename, 'linea', e.lineno);
        });

        // ============================================
        // API PUBBLICA PER INTEGRAZIONE
        // ============================================
        window.CSPA = {
            // Aggiorna la legenda con dati reali
            updateLegend: updateLegend,
            
            // Apri/chiudi pannello programmaticamente
            togglePanel: toggleFloatingPanel,
            
            // Mostra popup informazioni
            showInfo: showInfoPopup,
            
            // Reset tutti i controlli
            reset: function() {
                document.getElementById('demographic-select').value = '';
                document.getElementById('economic-select').value = '';
                document.getElementById('territorial-select').value = '';
                
                const legendContainer = document.getElementById('legend-items');
                legendContainer.innerHTML = `
                    <div class="legend-empty">
                        <i class="fas fa-info-circle" style="font-size: 24px; color: #FF9900; margin-bottom: 10px;"></i>
                        <p>Seleziona un indicatore per visualizzare la legenda dinamica</p>
                    </div>
                `;
            }
        };
