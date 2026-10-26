# Architettura

La SPA non richiede router: le cinque sezioni sono viste di una singola pagina. Tutti gli URL restano sotto `/repwise-ai/`, quindi Pages non deve risolvere percorsi dinamici. UI italiana, temi CSS automatici o manuali, navigazione laterale desktop e inferiore mobile.

- `src/lib/model.ts`: schemi Zod, ID UUID, libreria, snapshot e precompilazione. Il prefill non conferma serie e non copia RPE.
- `src/lib/metrics.ts`: funzioni pure condivise fra frontend e Edge Function. I confronti richiedono identità esercizio, tipo, unilateralità e sequenza target equivalenti. Il carico può progredire, le serie di riscaldamento non contano.
- `src/lib/storage.ts`: persistenza locale isolata per UUID account e snapshot pendente, con ID operazione e revisione attesa.
- `src/App.tsx`: login, schede, diario, timer a scadenza assoluta, storico, grafici e richieste AI. TanStack Query gestisce il caricamento report; React Hook Form/Zod il login; editor e serie sono validati prima della conferma.
- PostgreSQL: fatti normalizzati e cache documentale per ripristino. Una sola RPC transazionale muta i dati; le tabelle non sono direttamente scrivibili dal client.
- Edge Function: autenticazione, allowlist, query RLS, statistiche e progressione deterministiche, Gemini, validazione, persistenza report.

## Offline e concorrenza

Ogni modifica salva immediatamente una nuova generazione in localStorage. Le operazioni consecutive non inviate sono compattate in uno snapshot pendente; non si eliminano serie pendenti. La sincronizzazione è seriale e debounced. Durante una richiesta, le modifiche successive restano dirty e usano la revisione confermata per il prossimo invio. Retry della stessa operazione restituisce la revisione già salvata. I set hanno UUID stabili e primary key per proprietario: nessun inserimento duplicato.

La RPC blocca user_settings con `FOR UPDATE`. Una revisione diversa produce CONFLICT e lascia intatto il client. Il merge tra dispositivi è manuale: esportare entrambi gli stati prima di scegliere un recupero. Nessuna funzione elimina automaticamente la coda. Dati locali illeggibili bloccano l'editor con esportazione del valore originale.

La cache service worker contiene solo asset, mai risposte Auth/Supabase/Gemini. Gli aggiornamenti richiedono click; i dati locali sopravvivono al reload. Il tema segue `matchMedia` e rispetta reduced-motion.

## Limiti architetturali

Sincronizzazione a snapshot completa, adatta a un account personale, non a una piattaforma multiutente ad alto volume. Massimo 10 MB per richiesta SQL, 2.000 sessioni nello schema client; la quota localStorage dipende dal browser ed è spesso inferiore. La UI segnala errori di scrittura senza cancellare l'archivio. Per volumi elevati migrare a IndexedDB e RPC per aggregate con un log di operazioni server.

L'archivio locale non è cifrato: è protetto dall'isolamento origine del browser. Esci dall'account sui dispositivi condivisi; le copie locali non vengono eliminate automaticamente per preservare dati non sincronizzati. I grafici non stimano massa corporea o conversioni tra macchine.
