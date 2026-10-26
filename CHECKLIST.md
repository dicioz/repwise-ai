# Checklist di implementazione

## Fase 1 — Fondamenta
- [x] React/TypeScript strict/Vite, Tailwind, componente Button locale Radix/shadcn, Lucide.
- [x] Cinque sezioni, layout responsive, tema di sistema/manuale, reduced-motion.
- [x] Client Supabase condizionale, login senza signup, demo esplicitamente separata.
- [x] Migrazione versionata, RLS, allowlist singleton, procedura amministrativa.
- [x] Verifica locale typecheck/lint/build e migrazione PostgreSQL.
- [ ] Applicazione migrazione e impostazioni Auth su progetto Supabase reale.

## Fase 2 — Diario
- [x] Creazione/modifica/duplicazione/archiviazione routine, ordinamento e rimozione esercizi.
- [x] Libreria iniziale e nomi personalizzati, serie distinte di riscaldamento/lavoro.
- [x] Peso, ripetizioni e RPE 0,5, conferma e salto, serie/esercizi aggiuntivi.
- [x] Prefill da seduta precedente, confronto e snapshot; nessuna conferma implicita.
- [x] Pausa/ripresa, timer persistente, note, chiusura parziale, riapertura dallo storico.
- [x] Test browser del flusso completo e recupero dopo reload.

## Fase 3 — Progressione
- [x] Statistiche pure testate, confronti equivalenti, corpo libero/zavorra/macchine/unilaterali.
- [x] Motore deterministico condiviso, soglie configurabili, affidabilità e motivazioni.
- [x] Accetta/ignora/modifica manuale; nessun incremento automatico.
- [x] Grafici per esercizio, periodo e metrica, storico dettagliato e riepilogo settimane.
- [x] Test aumento/mantenimento/riduzione/dati insufficienti, rifiuto persistente nel browser.

## Fase 4 — AI
- [x] Edge Function autenticata, dati recuperati con RLS e metriche calcolate sul server.
- [x] Analisi seduta/settimana su richiesta, JSON Schema + Zod, report persistenti/storico.
- [x] Quota e lock SQL, cache, rigenerazione, timeout, errori, fonti modificate.
- [x] Verifica documentazione modello/prezzi, versione server configurabile.
- [x] 11 test HTTP simulati, typecheck Deno.
- [ ] Secrets e deploy reale della funzione, collaudo Gemini con chiave del progetto.

## Fase 5 — PWA
- [x] Manifest e icone PNG, asset precache, aggiornamento manuale, base path.
- [x] Modifiche persistenti, compattazione della coda, ID operazione, retry idempotenti.
- [x] Stato offline/sync/errore, conflitti senza perdita silenziosa, esportazione backup.
- [x] Test riapertura offline in Chromium e viewport mobile/desktop senza overflow.
- [ ] Installazione e collaudo su Safari/iPhone fisico.

## Fase 6 — Qualità e deployment
- [x] Unit/integration PostgreSQL, test Edge, cinque flussi browser, lint/typecheck/build.
- [x] Audit dipendenze, nessuna chiave server nel frontend, CI/CD Pages configurata.
- [x] Documentazione richiesta, env example, procedura account amministrativo.
- [ ] Ripristino autenticazione GitHub, creazione repository nuovo e pubblicazione Pages.
- [ ] Smoke test integrato sul progetto Supabase e URL pubblico.

I checkbox esterni restano aperti: il codice pronto per la configurazione non equivale ad accettazione in produzione.
