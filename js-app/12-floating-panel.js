// ============================================
        // FUNZIONI PRINCIPALI PANNELLO FLOTTANTE
        // ============================================
        
         // SISTEMA DI RIDIMENSIONAMENTO MIGLIORATO
        class PanelResizer {
            constructor() {
                this.isDragging = false;
                this.startY = 0;
                this.startControlsHeight = 0;
                this.panelHeight = 0;
                this.minControlsHeight = 200; // Altezza minima sezione controlli
                this.minLegendHeight = 150;   // Altezza minima sezione legenda
                
                this.controlsSection = document.getElementById('controls-section');
                this.legendSection = document.getElementById('legend-section');
                this.resizeHandle = document.getElementById('resize-handle');
                this.panel = document.getElementById('floating-panel');
                
                this.init();
            }

            init() {
                // Eventi mouse
                this.resizeHandle.addEventListener('mousedown', this.startResize.bind(this));
                document.addEventListener('mousemove', this.handleResize.bind(this));
                document.addEventListener('mouseup', this.stopResize.bind(this));

                // Eventi touch per dispositivi mobili
                this.resizeHandle.addEventListener('touchstart', this.startResize.bind(this));
                document.addEventListener('touchmove', this.handleResize.bind(this));
                document.addEventListener('touchend', this.stopResize.bind(this));

                // Impedisci la selezione del testo durante il trascinamento
                this.resizeHandle.addEventListener('selectstart', (e) => e.preventDefault());
                
                // AGGIUNTO: Imposta dimensioni iniziali uguali
                this.setInitialEqualSections();
            }

            // NUOVO METODO: Imposta sezioni uguali all'avvio
            setInitialEqualSections() {
                // Piccolo delay per assicurarsi che il DOM sia completamente renderizzato
                setTimeout(() => {
                    this.setEqualSections();
                }, 50);
            }

            // NUOVO METODO: Imposta sezioni uguali (50% ciascuna)
            setEqualSections() {
                const handleHeight = this.resizeHandle.offsetHeight;
                this.panelHeight = this.panel.offsetHeight;
                const usableHeight = this.panelHeight - handleHeight;
                
                // 50% per ciascuna sezione
                const sectionHeight = Math.floor(usableHeight / 2);
                const remainingHeight = usableHeight - sectionHeight;

                this.controlsSection.style.height = `${sectionHeight}px`;
                this.legendSection.style.height = `${remainingHeight}px`;
                
                this.updateSizeIndicators(sectionHeight, remainingHeight);
            }

            startResize(e) {
                this.isDragging = true;
                this.resizeHandle.classList.add('dragging');
                
                // Ottieni coordinate Y (mouse o touch)
                this.startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
                
                // Calcola altezze attuali
                this.panelHeight = this.panel.offsetHeight;
                this.startControlsHeight = this.controlsSection.offsetHeight;
                
                // Impedisci comportamenti di default
                e.preventDefault();
                
                // Aggiungi classe per feedback visivo
                document.body.style.cursor = 'ns-resize';
                document.body.style.userSelect = 'none';
            }

            handleResize(e) {
                if (!this.isDragging) return;

                // Ottieni coordinate Y correnti
                const currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
                const deltaY = currentY - this.startY;

                // Calcola nuova altezza sezione controlli
                const newControlsHeight = this.startControlsHeight + deltaY;
                
                // Calcola altezza handle (12px)
                const handleHeight = this.resizeHandle.offsetHeight;
                
                // Calcola nuova altezza sezione legenda
                const newLegendHeight = this.panelHeight - newControlsHeight - handleHeight;

                // Applica limiti minimi
                const finalControlsHeight = Math.max(
                    this.minControlsHeight, 
                    Math.min(newControlsHeight, this.panelHeight - this.minLegendHeight - handleHeight)
                );

                const finalLegendHeight = this.panelHeight - finalControlsHeight - handleHeight;

                // Applica le nuove altezze
                this.controlsSection.style.height = `${finalControlsHeight}px`;
                this.legendSection.style.height = `${finalLegendHeight}px`;

                // Aggiorna indicatori percentuali
                this.updateSizeIndicators(finalControlsHeight, finalLegendHeight);

                e.preventDefault();
            }

            stopResize() {
                if (!this.isDragging) return;

                this.isDragging = false;
                this.resizeHandle.classList.remove('dragging');
                
                // Rimuovi stili temporanei
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }

            updateSizeIndicators(controlsHeight, legendHeight) {
                const totalUsableHeight = controlsHeight + legendHeight;
                const controlsPercentage = Math.round((controlsHeight / totalUsableHeight) * 100);
                const legendPercentage = Math.round((legendHeight / totalUsableHeight) * 100);

                const controlsIndicator = document.getElementById('controls-size');
                const legendIndicator = document.getElementById('legend-size');

                if (controlsIndicator) {
                    controlsIndicator.textContent = `${controlsPercentage}%`;
                }
                if (legendIndicator) {
                    legendIndicator.textContent = `${legendPercentage}%`;
                }
            }

            // MODIFICATO: Metodo per reimpostare le proporzioni di default (ora 50-50)
            resetToDefault() {
                this.setEqualSections();
            }
        }

        // SISTEMA TOGGLE PANNELLO CON RILEVAMENTO MOBILE/DESKTOP
        class PanelToggle {
            constructor() {
                this.panel = document.getElementById('floating-panel');
                this.toggleButton = document.getElementById('panel-toggle');
                this.isOpen = false;
                
                this.init();
            }

            // Rileva se il dispositivo è mobile
            isMobileDevice() {
                // Combina più metodi di rilevamento per maggiore accuratezza
                const screenWidth = window.innerWidth;
                const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
                const userAgent = navigator.userAgent.toLowerCase();
                
                // Controlli dimensioni schermo
                const isSmallScreen = screenWidth <= 768;
                
                // Controlli user agent per dispositivi mobili comuni
                const mobileKeywords = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/;
                const isMobileUserAgent = mobileKeywords.test(userAgent);
                
                // Un dispositivo è considerato mobile se:
                // - Ha schermo piccolo E capacità touch, OPPURE
                // - È identificato come mobile dall'user agent
                return (isSmallScreen && isTouchDevice) || isMobileUserAgent;
            }

            init() {
                // Imposta stato iniziale in base al tipo di dispositivo
                this.setInitialState();
                
                // Aggiunge event listener per il toggle
                this.toggleButton.addEventListener('click', this.toggle.bind(this));
                
                // Riaggiusta stato se la finestra viene ridimensionata
                window.addEventListener('resize', this.handleResize.bind(this));
            }

            setInitialState() {
                if (this.isMobileDevice()) {
                    // Mobile: pannello chiuso
                    this.isOpen = false;
                    this.panel.classList.remove('open');
                    this.toggleButton.classList.remove('panel-open');
                    this.toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
                } else {
                    // Desktop: pannello aperto
                    this.isOpen = true;
                    this.panel.classList.add('open');
                    this.toggleButton.classList.add('panel-open');
                    this.toggleButton.innerHTML = '<i class="fas fa-times"></i>';
                }
            }

            toggle() {
                this.isOpen = !this.isOpen;
                
                if (this.isOpen) {
                    this.panel.classList.add('open');
                    this.toggleButton.classList.add('panel-open');
                    this.toggleButton.innerHTML = '<i class="fas fa-times"></i>';
                } else {
                    this.panel.classList.remove('open');
                    this.toggleButton.classList.remove('panel-open');
                    this.toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }

            // Gestisce il ridimensionamento della finestra
            handleResize() {
                // Debounce per evitare troppi controlli durante il resize
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    // Solo se cambiamo da mobile a desktop o viceversa
                    const wasMobile = !this.wasDesktop;
                    const isMobile = this.isMobileDevice();
                    
                    if (wasMobile !== isMobile) {
                        this.setInitialState();
                    }
                    
                    this.wasDesktop = !isMobile;
                }, 250);
            }
        }

        // INIZIALIZZAZIONE
        document.addEventListener('DOMContentLoaded', function() {
            // Inizializza toggle pannello (deve essere primo per impostare stato iniziale)
            const toggle = new PanelToggle();
            
            // Inizializza sistema di ridimensionamento
            const resizer = new PanelResizer();

            // Aggiunge funzionalità di reset (doppio click sull'handle)
            document.getElementById('resize-handle').addEventListener('dblclick', function() {
                resizer.resetToDefault();
            });

            console.log('Sistema di ridimensionamento pannello inizializzato');
            console.log('Dispositivo mobile rilevato:', toggle.isMobileDevice());
            console.log('Sezioni impostate a dimensioni uguali (50%-50%)');
        });

        // GESTIONE RESIZE FINESTRA
        window.addEventListener('resize', function() {
            // Ricalcola le dimensioni quando la finestra cambia
            setTimeout(() => {
                const resizer = new PanelResizer();
            }, 100);
        });