# Database

Migrazione: `supabase/migrations/202610260001_initial.sql`. Timestamp PostgreSQL `timestamptz`, UUID e unità kg. Le tabelle hanno RLS e SELECT limitata a `auth.uid()` più allowlist. Anon non ha accesso. La chiave service-role resta server-side.

| Entità | Contenuto |
|---|---|
| authorized_account | Singleton amministrativo con un unico UUID autorizzato |
| profiles | Proprietario, unità e creazione |
| exercises | Identità, nome, tipo e unilateralità |
| workout_routines | Nome, archiviazione, versione |
| routine_exercises | Ordinamento, recupero e note; FK composite proprietario/ID |
| routine_sets | Riscaldamento/allenante, target, carico indicativo, ordine |
| workout_sessions | Inizio/fine, stato, routine di origine e snapshot storico |
| session_exercises | Identità esercizio e caratteristiche fotografate alla seduta |
| performed_sets | Valori effettivi, target, RPE, conferma e salto |
| progression_preferences | Incremento e soglie RPE per esercizio |
| progression_suggestions | Decisioni accetta/ignora con riferimento seduta/esercizio |
| ai_reports | JSON validato, modello, periodo e revisione della fonte |
| user_settings | Tema, revisione e cache snapshot per sync/ripristino |
| ai_requests | Lock richieste, data e consumo quota |

I suggerimenti sono ricalcolati dal motore puro; la tabella memorizza la decisione, non duplica il risultato derivabile. I report sono immutabili e si rigenerano creando un nuovo record. La revisione globale rende conservativa la segnalazione report obsoleto (anche modifiche di preferenze possono marcarlo).

`save_state(document, expected_revision, operation_id)` verifica allowlist e limiti, blocca la revisione, verifica idempotenza e decompone lo snapshot in un'unica transazione. Le FK composite impediscono riferimenti a righe di altri utenti. Routines e sessioni vengono ricostruite atomicamente; exercises restano come identità stabili. Lo snapshot JSON è una cache duplicata intenzionalmente, non la fonte delle statistiche AI. La funzione esegue SQL con `search_path=''`, senza SQL dinamico.

`load_state()` è solo lettura del proprio snapshot. `claim_ai` è eseguibile solo da service-role e usa lock advisory per quota giornaliera e richieste duplicate. Tentativi falliti consumano quota; le richieste più vecchie di due giorni vengono rimosse. Il giorno quota è il giorno UTC del database.

Lo stato client è validato Zod. PostgreSQL applica anche vincoli su enum, intervalli, RPE a passi di 0,5 e stato confermato/saltato. Non c'è API client di inserimento report: solo la funzione autorizzata può scriverli.

## Semantica metriche

- Peso libero e macchine: kg × ripetizioni nelle sole serie allenanti confermate.
- Corpo libero: volume kg nullo; nessuna massa corporea stimata.
- Zavorra: solo kg aggiuntivi, senza trattarli come carico totale del corpo.
- Unilaterale: peso e ripetizioni per lato, volume moltiplicato per due; nessun 1RM.
- Serie saltate/non confermate/riscaldamento: escluse da volume, RPE e progressione.
- Macchine o attrezzi diversi: creare identità distinte, nessuna conversione arbitraria.
- 1RM: Epley, solo peso libero bilaterale, 1–10 ripetizioni, RPE almeno 8. È una stima indicativa, non un massimale misurato.
- Frequenza: solo sedute completate; parziali visibili nello storico e nel volume realmente confermato.
- Settimana UI: lunedì–domenica nel fuso del dispositivo; analisi AI: lunedì–domenica UTC, esplicitato nel payload. Non confrontare i due conteggi su sedute a cavallo della mezzanotte senza considerarne il fuso.
