# Aggiornamento: diario semplice

Questa versione sostituisce il flusso di allenamento in tempo reale. Non gestisce recuperi, timer, pausa o conferme per singola serie. Si registrano i risultati durante o dopo l'allenamento e si preme **Salva allenamento**. Data e risultati sono modificabili. Le bozze sono salvate automaticamente sul dispositivo e sincronizzate.

- Nuovi valori di peso, ripetizioni, RPE e target iniziano vuoti (NULL, non zero).
- Inserimento da tastiera, senza frecce; virgola e punto decimale supportati. RPE facoltativo, passo 0,5.
- Corpo libero: solo ripetizioni/RPE, senza peso, incremento o suggerimento di carico. La zavorra è un tipo distinto selezionato dall'utente.
- Confronti delle ultime quattro settimane per ogni esercizio, nella compilazione e nello storico. Stessa identità, tipologia e unilateralità; schemi diversi visibili ma segnalati, differenze numeriche solo tra schemi equivalenti. Serie registrate e dati reali. Le differenze descrivono ciò che è stato inserito e non impongono una progressione.
- Nessun aumento obbligatorio, automatico o con scadenza settimanale. Nessuna proposta da accettare/ignorare nel percorso principale. Il motore rimane come utilità interna/AI su richiesta, senza modificare dati.
- Nessun volume settimanale in kg nell'interfaccia. Le funzioni statistiche rimangono interne per compatibilità dei report.

## Installazione su un progetto già esistente

1. Scarica lo ZIP aggiornato ed estrailo in una cartella temporanea.
2. Copia i file nella cartella locale già collegata a GitHub, sostituendo quelli presenti. **Conserva `.env.local` e la cartella `.git` esistenti**: lo ZIP non li contiene. Non eliminare i dati del browser.
3. Prima della nuova pubblicazione, aggiorna il database. Nel terminale, dalla cartella con package.json:

```powershell
Get-Content ".\supabase\migrations\202610260002_simple_journal.sql" -Raw | Set-Clipboard
```

4. Supabase → SQL Editor → New query → incolla → Run. Esegui **solo la migrazione 002** una volta: la 001 è già stata applicata. La 002 cambia solo vincoli sui campi vuoti, non elimina tabelle o allenamenti. Se appare un errore, fermati e riporta il messaggio.
5. `npm ci`, poi avvia come prima (`npm run dev -- --configLoader native` su Windows).
6. Verifica login e dati esistenti, registra una serie di prova e controlla sincronizzazione/ripristino. Poi salva e pubblica dal repository locale:

```powershell
git add .
git commit -m "Semplifica diario e confronti settimanali"
git push
```

7. Attendi il nuovo workflow GitHub Pages. Apri il sito in finestra privata oppure applica l'aggiornamento PWA. Le variabili GitHub e Supabase già configurate restano valide.
8. Se avevi già attivato Gemini, ridistribuisci la funzione (`supabase functions deploy ai-coach`): ora accetta valori vuoti nello storico e rispetta esplicitamente la scelta di non aumentare i carichi. Se non usi Gemini, non serve configurarlo per il diario.

Per una nuova installazione applicare **001 e poi 002**, oppure usare `supabase db push` che esegue le migrazioni non ancora applicate. Non eseguire `db reset` sul progetto reale.

## Compatibilità

Le sessioni vecchie conservano peso, ripetizioni, RPE, ID e conferme storiche. I nuovi campi vuoti non vengono sostituiti con valori del passato. I campi legacy di recupero/stato restano nello schema per non rompere le installazioni precedenti, ma non sono più gestiti dall'interfaccia. Il ripristino da conflitto tra dispositivi resta manuale; nessuna modifica locale pendente viene cancellata automaticamente.
