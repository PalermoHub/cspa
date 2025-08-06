# Prompt: Risoluzione Problemi Legenda Dinamica e Filtri Mappa

## Contesto
Stai lavorando su una mappa interattiva con legenda dinamica e sistema di filtri per particelle/elementi geografici. La legenda funziona ma presenta diversi problemi che necessitano correzione.

## Problemi da Risolvere

### 1. Conteggio Particelle Errato
**Problema:** Quando tutte le particelle sono visibili sul display del dispositivo, il conteggio mostra circa il 23% in meno del totale reale.

**Comportamento atteso:** Il conteggio dovrebbe essere accurato indipendentemente dal livello di zoom.

**Note:** Il problema si verifica solo quando si visualizzano tutte le particelle contemporaneamente. Con i filtri attivi, il conteggio funziona correttamente.

### 2. Instabilità della Legenda con Tematizzazioni
**Problema:** 
- Con la mappa di base: legenda stabile e posizionata correttamente
- Con le tematizzazioni attive: legenda instabile, "ballerina", caricamento difficoltoso

**Comportamento atteso:** La legenda dovrebbe rimanere stabile indipendentemente dalla visualizzazione attiva.

### 3. Filtri Non Interattivi
**Problema:** I filtri per mandamenti e fogli non sono collegati tra loro.

**Comportamento atteso:** 
- Selezionando un mandamento → mostrare solo i fogli relativi a quel mandamento
- Selezionando un foglio → evidenziare il mandamento corrispondente
- Implementare un sistema di filtri bidirezionale e dinamico

## Obiettivi di Sviluppo

1. **Correggere l'algoritmo di conteggio** per le particelle in visualizzazione completa
2. **Stabilizzare la legenda** durante il cambio di tematizzazioni
3. **Implementare filtri interattivi** con collegamento bidirezionale mandamenti-fogli
4. **Ottimizzare le performance** di caricamento della legenda
5. **Garantire consistenza** nel comportamento dell'interfaccia

## Priorità
1. Alta: Correzione conteggio particelle
2. Alta: Stabilizzazione legenda
3. Media: Implementazione filtri interattivi

## Note Tecniche
- Il sistema di zoom funziona correttamente con i filtri attivi
- La mappa di base non presenta problemi di stabilità
- I filtri esistenti funzionano individualmente ma mancano di interattività