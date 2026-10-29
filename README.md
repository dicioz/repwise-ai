# Repwise AI

Diario palestra in italiano, mobile first. **Nuovo flusso semplice: risultati inseriti da tastiera, nessun timer o obbligo di progressione. Per aggiornare un progetto già pubblicato leggere [AGGIORNAMENTO.md](AGGIORNAMENTO.md), inclusa la migrazione aggiuntiva 002.** React 19, TypeScript strict, Vite, Tailwind 4, componenti locali basati sul pattern shadcn/Radix, TanStack Query, React Hook Form/Zod, Recharts. Backend Supabase separato; Gemini esclusivamente server-side.

## Avvio

Richiede Node 24 e npm. Il repository contiene il lockfile.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Apri `http://localhost:5173/repwise-ai/`. Senza configurazione, è disponibile una **demo esplicita e separata**. Le routine di esempio si caricano solo premendo il relativo pulsante; nessuno storico o report inventato. Gli account reali partono vuoti.

## Supabase e primo account

1. Crea un progetto Supabase sul piano gratuito. In Authentication → General configuration disabilita **Allow new users to sign up** e gli accessi anonimi. Disabilita provider OAuth non utilizzati. `supabase/config.toml` configura queste opzioni per l'ambiente CLI locale: non assumere che cambi automaticamente il progetto ospitato.
2. Installa Supabase CLI secondo la documentazione ufficiale, esegui `supabase login`, `supabase link --project-ref YOUR_PROJECT_REF`, poi `supabase db push`. In alternativa applica le migrazioni versionate in ordine (001 e 002) nel SQL Editor su un progetto nuovo. Non eseguire reset su database esistenti.
3. In una shell amministrativa imposta `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `REPWISE_EMAIL`, `REPWISE_PASSWORD` tramite il tuo gestore di segreti; esegui `npm run admin:create-account`. Lo script controlla che le registrazioni siano disabilitate, crea l'utente confermato e lo inserisce nella allowlist singleton. Non eseguirlo nel browser o in una build frontend. Non inserire credenziali in comandi salvati nello storico.
4. In `.env.local` inserisci solo `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, ottenuti dalle impostazioni API di Supabase. Usa la chiave publishable (oppure la anon legacy), mai service-role/secret.
5. In Auth URL configuration imposta Site URL alla URL GitHub Pages finale con `/repwise-ai/`; limita i redirect agli ambienti usati. Il login usa email/password; nessuna route callback è necessaria.
6. Verifica che `/auth/v1/signup` rifiuti un account nuovo: la sola UI senza registrazione non basta. Le policy RLS impediscono comunque accesso ai dati a qualsiasi account non autorizzato.

Non sono presenti email o UUID personali hardcoded. La allowlist ammette un solo utente; la sostituzione deve essere una decisione amministrativa esplicita.

## Gemini

Ottieni una chiave su [Google AI Studio](https://aistudio.google.com/apikey). Usa un progetto senza fatturazione per evitare servizi a pagamento. La pagina [prezzi Gemini](https://ai.google.dev/gemini-api/docs/pricing), consultata il 26 ottobre 2026, elenca `gemini-3.8-flash` con input/output gratuiti nel Free Tier. Quote, paese e disponibilità del progetto vanno verificati nell'account. Non è stata effettuata una chiamata reale in questa workspace.

Imposta tramite dashboard Supabase → Edge Functions → Secrets oppure `supabase secrets set --env-file /percorso/protetto/server.env`:

```dotenv
GEMINI_API_KEY=your-server-key
GEMINI_MODEL=gemini-3.8-flash
ALLOWED_ORIGIN=https://YOUR_USERNAME.github.io
AI_DAILY_LIMIT=10
```

Il file con segreti deve restare fuori dal repository. L'origin non contiene `/repwise-ai/` né slash finale. Supabase fornisce automaticamente le variabili server `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Distribuisci separatamente:

```sh
supabase functions deploy ai-coach
```

`verify_jwt=false` è intenzionale: l'Edge Function verifica il bearer token con `auth.getUser()` prima di accedere ai dati e controlla la allowlist. Non significa funzione anonima. Vedi [AI_COACH.md](AI_COACH.md).

## Test e build

```sh
npm run typecheck
npm run lint
npm test
npm run check:edge
npm run test:edge
npm run build
npm run test:e2e
```

I test PostgreSQL usano PGlite con Auth e ruoli controllati: eseguono davvero la migrazione e le policy. I test Edge usano Deno con trasporto HTTP simulato e risultati controllati; non consumano quota Gemini. I test browser usano Chromium locale `/usr/bin/chromium`; in CI Playwright installa il proprio browser. Per altri sistemi modifica `playwright.config.ts` o imposta `CI=1` dopo `npx playwright install chromium`.

## Pubblicazione e PWA

Vedi [DEPLOYMENT.md](DEPLOYMENT.md): GitHub Pages ospita solo `dist`, Supabase ospita database e funzioni. Il workflow esegue i controlli prima di pubblicare. Base path fisso `/repwise-ai/`: usa un repository con questo nome o modifica la configurazione in modo coerente.

Su iPhone apri la URL HTTPS in Safari, Condividi → Aggiungi alla schermata Home. Apri l'app una volta online per installare la cache. L'archivio locale conserva le modifiche offline per account, e le invia al ritorno della connessione. Se Safari cancella i dati del sito prima della sincronizzazione, il server non può recuperarli: esporta un backup per dati importanti. Non vengono cancellati automaticamente dati locali pendenti.

## Stato e limiti

Consulta [CHECKLIST.md](CHECKLIST.md) e [TESTING.md](TESTING.md). Non è ancora una distribuzione reale: mancano progetto Supabase, account, segreti Gemini e accesso GitHub valido. Installazione su iPhone fisico e quota reale richiedono collaudo esterno. Il primo client usa un singolo snapshot pendente con controllo revisione; un conflitto tra dispositivi richiede recupero manuale, non un merge silenzioso.
