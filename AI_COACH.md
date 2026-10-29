# Diario semplice e decisioni dell’utente

Il percorso principale non mostra più proposte da accettare o ignorare: confronta soltanto valori reali tra settimane. Nessun aumento di peso o ripetizioni è obbligatorio, automatico o previsto ogni settimana. Il corpo libero non espone carichi. Il prompt Gemini lo specifica esplicitamente; i campi bozza NULL sono supportati.

Il motore descritto sotto resta un componente interno per analisi facoltative su richiesta; i precedenti controlli Accetta/Ignora/Modifica non sono più presenti nella UI.

# AI Coach

Il motore deterministico e Gemini sono separati. Il primo funziona offline e non necessita di API. Valuta completezza delle serie, target, RPE, carichi omogenei, tipo esercizio, incremento e precedenti equivalenti. Le soglie RPE rimangono configurabili nel motore interno. Il corpo libero propone ripetizioni; oltre il limite configurato consolida invece di aumentare senza fine. Nessun incremento viene applicato automaticamente.

Ogni risultato interno include azione, motivazione, dati e affidabilità. Nessun risultato viene applicato al diario o alla scheda; la UI mostra soltanto confronti descrittivi.

## Richieste Gemini

`POST /functions/v1/ai-coach` con bearer token, body `{kind:"session",sessionId:UUID,regenerate:false}` oppure `{kind:"week",week:"YYYY-MM-DD",regenerate:false}`. Il giorno identifica la settimana UTC contenente quella data. Nessun user_id o metrica client viene accettato come fonte.

La funzione controlla origin, token con getUser e allowlist. Legge con RLS sessioni/serie/preferenze dal database. Calcola statistiche e suggerimenti deterministici condivisi, allega sessione o settimana e precedenti con esercizi pertinenti. I confronti devono rispettare identità, tipo, unilateralità e target. Le note sono dati non istruzioni. Le fonti sono limitate a 200 sessioni recenti e 12 precedenti pertinenti, esplicitato come limite.

Quota giornaliera `AI_DAILY_LIMIT` (default 10, massimo 100). Lock SQL impedisce doppie richieste dello stesso periodo/revisione; i report già presenti sono restituiti senza chiamata Gemini. Rigenerazione solo manuale e conteggiata. Un tentativo fallito resta conteggiato e richiede rigenerazione esplicita. Timeout 45 secondi. 429 per quota locale/upstream, 409 per duplicato pendente, 422 per JSON/schema invalido, 503 per configurazione mancante, 504 per timeout, 502 per errore upstream/rete. Nessun errore del coach interrompe il diario.

Risposta JSON: title, summary, facts, progress, monitor, comparison, suggestions, limitations. JSON Schema nella chiamata Gemini e Zod dopo la risposta; solo report validi vengono salvati. La funzione impone nel prompt fatti separati da interpretazioni, divieto di inventare numeri, riconoscimento insufficienza dati, nessuna diagnosi o allenamento attraverso dolore. La validazione dello schema non garantisce che ogni interpretazione sia corretta: i numeri e le decisioni restano verificabili dall'utente.

Modello iniziale `gemini-3.8-flash`, server secret configurabile. Consultati elenco e prezzi ufficiali il 26/10/2026; Free Tier elencato per input/output. Nessun fallback automatico verso modelli a pagamento. Confermare quote nella console del progetto. Note volontarie e dati di allenamento vengono inviati al servizio quando si richiede il report: verificare le condizioni Google applicabili al piano usato.

I test Deno simulano il trasporto HTTP e verificano tutti i rami principali senza chiavi reali o consumo quota. Una chiamata reale e la distribuzione su Supabase non sono state eseguite senza configurazione esterna.
