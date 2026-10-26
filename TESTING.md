# Verifica

Ultima verifica locale: 26 ottobre 2026, Node 24.19.0. Nessun risultato di produzione è incluso.

- TypeScript strict e lint: superati.
- Vitest: 30 test di metriche/progressione, sync offline e PostgreSQL/PGlite.
- Deno: 11 test dell'Edge Function, con fetch simulato e dati controllati.
- Playwright/Chromium: 5 test end-to-end, viewport 390×844 e 1440×1000.
- Build: artefatti Vite/PWA prodotti in `dist`, base path `/repwise-ai/`.
- `npm audit`: zero vulnerabilità dopo aggiornamento Vitest. Anche audit runtime senza dev: zero.

| Scenario richiesto | Copertura effettiva |
|---|---|
| 1 Creazione scheda | Browser, routine senza dati preesistenti |
| 2 Modifica scheda | Browser, rinomina e salvataggio |
| 3 Avvio allenamento | Browser, dalla routine creata |
| 4 Conferma serie | Browser, checkbox prima/poi e recupero dopo reload |
| 5 RPE | Browser 7,5; engine e vincoli SQL |
| 6 Chiusura e ripristino | Browser reload, ripresa valori e conferma |
| 7 Seduta parziale | Browser, una serie confermata su tre |
| 8 Confronto seduta | Browser con due snapshot controllati |
| 9 Aumento carico | Engine e browser: 85 → 87,5 kg proposto |
| 10 Mantenimento | Engine: 87,5 kg con 6/6/5 e RPE 8/8,5/9 |
| 11 Rifiuto | Browser, Ignora conservato dopo reload |
| 12 Gemini | Handler Deno con risposta strutturata simulata; chiamata reale pendente |
| 13 Errore/quota | Handler: quota locale/upstream, timeout, JSON invalido; SQL quota/lock |
| 14 Report settimana | Handler con selezione settimana esplicita e dati controllati |
| 15 Offline | Browser, modifica senza rete e riapertura da cache PWA |
| 16 Sincronizzazione | Storage: errore poi successo con stesso operation ID; SQL idempotenza, conflitto e rollback. Rete Supabase reale pendente |
| 17 Tema | Browser selezione dark/light e attributo applicato |
| 18 Mobile | Browser 390×844, screenshot, nessun overflow. iPhone fisico pendente |
| 19 Build Pages | Build e manifest sotto base path; esecuzione GitHub Actions remota pendente |
| 20 Accesso estraneo | PostgreSQL con ruoli e due utenti: niente lettura/scrittura; Edge senza token rifiutata. Signup remoto pendente |

PGlite esegue PostgreSQL reale compilato in WASM, non un mock SQL. Le primitive Auth vengono ricreate per verificare `auth.uid()` e le policy della migrazione. Non copre il gateway Supabase o GoTrue ospitato. I test Edge intercettano HTTP per rendere numeri, quote e JSON verificabili; non dimostrano disponibilità della chiave o del modello nell'account reale.

In precedenti passaggi sono emersi e sono stati corretti: dipendenze incompatibili del resolver, ambiguità SQL sul documento, aggiornamento necessario del runner per audit, ripristino della modalità demo, controllo del service worker e nome accessibile del selettore tema. I risultati sopra si riferiscono all'ultima esecuzione completata, non ai tentativi iniziali.

Limiti aperti: Safari fisico, sincronizzazione multi-device reale, Auth/signup remoti, distribuzione funzione e Gemini live, GitHub Actions/Pages sul repository dell'utente. I conflitti multi-device conservano i dati locali e richiedono recupero manuale. Nessun test esterno è segnato come superato.
