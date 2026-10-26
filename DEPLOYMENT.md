# Deployment

## Frontend GitHub Pages

Nessun repository remoto o deployment è stato creato da questa workspace: `gh auth status` ha segnalato autenticazione non valida. Il connettore disponibile legge il profilo ma non espone la creazione di repository. Non sono stati modificati repository esistenti.

Crea un repository **nuovo** `repwise-ai` nel tuo account. Il frontend statico è pubblicabile da un repository pubblico con GitHub Free; per repository privati verifica che il tuo piano includa Pages prima di usarlo. Non è necessario sottoscrivere un piano a pagamento.

```sh
# dal checkout locale, dopo aver verificato il remote scelto
# gh auth login  # solo nella tua shell
# gh repo create repwise-ai --public --source=. --remote=origin --push
```

Oppure crea il repository dall'interfaccia GitHub e aggiungi il suo remote. Non puntare questo checkout a un repository esistente senza revisione.

In Settings → Pages scegli Source: GitHub Actions. In Settings → Secrets and variables → Actions → Variables aggiungi:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Sono configurazioni pubbliche, non credenziali amministrative. Non inserire Gemini o service-role nelle variabili di build. Il workflow `.github/workflows/deploy.yml` installa via `npm ci`, controlla TypeScript, lint, test motore/database/Edge, build, test browser e poi pubblica `dist` dal branch main. Pull request eseguono i controlli senza pubblicazione. L'ambiente github-pages può richiedere una configurazione repository da parte dell'owner.

Base path `/repwise-ai/` in Vite, manifest, icone e SW. Nessuna route client con pathname separato; i reload non producono 404 su Pages. Per un nome repository differente aggiornare tutti i percorsi e testare la build.

## Backend Supabase separato

Esegui i passi README per Auth, account, migration e secrets. `supabase db push` non distribuisce le funzioni; esegui anche `supabase functions deploy ai-coach`. Non usare `db reset` in produzione.

CORS: `ALLOWED_ORIGIN=https://nome.github.io` (solo origin); in sviluppo usare `http://localhost:5173`. La funzione consente un solo origin configurato e gli header documentati dal client Supabase, inclusi quelli di retry/tracing. Per cambiare ambiente distribuire i secrets appropriati. CORS non sostituisce Auth e RLS.

Fonti controllate il 26/10/2026:
- https://supabase.com/docs/guides/auth/general-configuration
- https://supabase.com/docs/guides/functions/cors
- https://supabase.com/docs/guides/functions/auth

## Smoke test dopo configurazione

Verificare accesso con account autorizzato, rifiuto signup, rifiuto token assente e account estraneo; creare scheda e registrare una seduta; controllare righe reali dopo logout/login da un altro browser. Ripetere con rete disabilitata e riconnessa. Richiedere entrambi i report, errore quota e rigenerazione manuale. Installare su Safari iPhone fisico e testare riapertura offline. L'URL pubblico va comunicato solo dopo esito positivo del workflow Pages.
