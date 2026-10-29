# Verifica della versione diario semplice

Ultima verifica locale: 26 ottobre 2026, Node 24.19.0.

- TypeScript strict e lint superati.
- 38 test Vitest: motore e metriche, celle NULL e compatibilità con bozze legacy, raggruppamento settimane, schemi diversi, nessun incremento automatico, corpo libero senza carichi; storage offline; PostgreSQL/PGlite con migrazioni 001 e 002, RLS, quote, rollback, idempotenza e sincronizzazione NULL.
- 11 test Deno della Edge Function con HTTP simulato: autenticazione, CORS, analisi seduta/settimana, quota locale/upstream, timeout, JSON invalido, cache e duplicati.
- 5 test Playwright/Chromium: creazione/modifica scheda, campi vuoti senza spinbutton e checkbox, decimali italiani, persistenza dopo reload, editing offline e salvataggio parziale, modifica dal diario, corpo libero senza peso/incrementi, confronto settimane con carichi invariati e diversi, temi, PWA offline, desktop e AI solo su richiesta.
- Build Vite/PWA sotto `/repwise-ai/` prodotta correttamente.

Le prove correnti sostituiscono quelle del precedente tracker in tempo reale. Screenshot generati in `test-results/mobile-journal.png`, `weekly-comparison.png` e `desktop.png` (non inclusi nel commit).

PGlite esegue la migrazione in PostgreSQL WASM con Auth e ruoli controllati; non collauda il gateway Supabase ospitato. I test Edge non chiamano Gemini reale e non consumano quota. I test browser girano su Chromium con viewport mobile/desktop, non su un iPhone fisico.

La versione aggiornata non è stata distribuita da questa workspace al repository remoto dell'utente. Migrazione 002, deploy frontend, eventuale redeploy Edge e smoke test reale vanno eseguiti sul progetto già configurato. Nessuna credenziale o variabile GitHub esistente deve essere modificata per questo aggiornamento.
