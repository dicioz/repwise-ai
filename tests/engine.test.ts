import { describe,it,expect } from 'vitest'
import { newExercise,startSession,uid, type Routine } from '../src/lib/model'
import { averageRpe,comparable,e1rm,frequency,percent,progression,repDelta,sessionVolume,volume,weeklySummary,working } from '../src/lib/metrics'
const exercise=()=>{const e=newExercise('Squat');e.sets=e.sets.map(s=>({...s,weight:85,reps:6,target:6,rpe:8,done:true}));return e}
describe('Motore di progressione',()=>{
 it('propone 87.5 senza mutare la seduta',()=>{const e=exercise();e.sets[0].rpe=7.5;expect(progression(e).weight).toBe(87.5);expect(e.sets[0].weight).toBe(85)})
 it('mantiene quando manca una ripetizione',()=>{const e=exercise();e.sets.forEach((s,i)=>{s.weight=87.5;s.rpe=8+i*.5});e.sets[2].reps=5;expect(progression(e).action).toBe('maintain')})
 it('non usa serie non confermate o mancanti',()=>{const e=exercise();e.sets[2].done=false;expect(progression(e).action).toBe('insufficient')})
 it('non inventa RPE',()=>{const e=exercise();e.sets[0].rpe=null;expect(progression(e).action).toBe('insufficient')})
 it('riduce solo con fatica ripetuta',()=>{const e=exercise();e.sets.forEach(s=>{s.reps=4;s.rpe=10});expect(progression(e).action).toBe('maintain');expect(progression(e,[e]).action).toBe('reduce')})
 it('esclude riscaldamento e serie saltate',()=>{const e=exercise();e.sets.push({...e.sets[0],kind:'warmup',rpe:10,weight:500});expect(volume(e)).toBe(1530);expect(progression(e).action).toBe('increase_weight');e.sets[0].skipped=true;expect(working(e)).toHaveLength(2)})
 it('non confronta target e tipi diversi',()=>{const e=exercise(),other=structuredClone(e);other.sets[0].target=10;expect(comparable(e,other)).toBe(false);expect(progression(e,[other]).data.history).toBe(0)})
 it('corpo libero progredisce nelle ripetizioni',()=>{const e=exercise();e.type='bodyweight';expect(volume(e)).toBeNull();expect(progression(e).action).toBe('increase_reps');expect(e1rm(e)).toBeNull()})
 it('soglie configurabili',()=>{expect(progression(exercise(),[],{easyRpe:7,hardRpe:10,maxReps:12}).action).toBe('maintain')})
 it('carichi eterogenei richiedono interpretazione manuale',()=>{const e=exercise();e.sets[2].weight=80;expect(progression(e).action).toBe('insufficient')})
})
describe('Metriche e sessioni',()=>{
 it('calcola volume e RPE solo su lavoro confermato',()=>{const e=exercise();expect(volume(e)).toBe(1530);expect(averageRpe(e.sets)).toBe(8)})
 it('unilaterale somma i lati e zavorra solo kg esterni',()=>{const e=exercise();e.unilateral=true;expect(volume(e)).toBe(3060);e.type='weighted';expect(e1rm(e)).toBeNull()})
 it('1RM solo intervallo significativo',()=>{const e=exercise();expect(e1rm(e)).toBe(102);e.sets.forEach(s=>s.reps=15);expect(e1rm(e)).toBeNull()})
 it('variazione percentuale evita base zero',()=>{expect(percent(87.5,85)).toBeCloseTo(2.94,2);expect(percent(10,0)).toBeNull()})
 it('delta rep solo equivalente',()=>{const e=exercise(),p=structuredClone(e);p.sets[0].reps=5;expect(repDelta(e,p)).toBe(1)})
 it('nuovo diario vuoto senza prefill e senza conferme',()=>{const r:Routine={id:uid(),name:'A',archived:false,exercises:[exercise()]};const previous=startSession(r,[]);previous.finished=new Date().toISOString();previous.status='completed';previous.exercises[0].sets.forEach(s=>{s.weight=90;s.done=true});const next=startSession(r,[previous]);expect(next.exercises[0].sets[0]).toMatchObject({weight:null,reps:null,rpe:null,done:false});expect(next.exercises[0].sets[0].id).not.toBe(previous.exercises[0].sets[0].id)})
 it('frequenza esclude parziali',()=>{const r:Routine={id:uid(),name:'A',archived:false,exercises:[exercise()]};const s=startSession(r,[]);s.status='partial';expect(frequency([s],new Date())).toBe(0);s.status='completed';expect(frequency([s],new Date())).toBe(1);expect(sessionVolume(s)).toBe(0)})
})

it('riepilogo settimanale rispetta estremi e volume effettivo',()=>{const r:Routine={id:uid(),name:'A',archived:false,exercises:[exercise()]};const s=startSession(r,[]);s.started='2026-10-26T12:00:00Z';s.finished=s.started;s.status='partial';s.exercises[0].sets=exercise().sets;const result=weeklySummary([s],new Date('2026-10-28T12:00:00Z'));expect(result).toMatchObject({completed:0,volume:1530,sets:3,rpe:8});expect(weeklySummary([s],new Date('2026-11-04T12:00:00Z')).volume).toBe(0)})

it('nuove celle vuote sono diverse da zero esplicito',async()=>{const {newSet,setSchema}=await import('../src/lib/model');const set=newSet();expect(set).toMatchObject({weight:null,reps:null,rpe:null,target:null,done:false});expect(setSchema.parse({...set,weight:0}).weight).toBe(0)})
it('corpo libero non restituisce mai un carico anche con fatica ripetuta',()=>{const e=exercise();e.type='bodyweight';e.sets.forEach(s=>{s.rpe=10;s.reps=4});const suggestion=progression(e,[e]);expect(suggestion.weight).toBeNull();expect(suggestion.action).toBe('maintain')})
it('stessi valori per più settimane non impongono alcuna modifica ai dati',()=>{const e=exercise();const original=structuredClone(e);progression(e,[structuredClone(e),structuredClone(e)]);expect(e).toEqual(original)})
it('raggruppa settimane e rifiuta esercizi o schemi non equivalenti',async()=>{const {exerciseWeeks}=await import('../src/lib/metrics');const r:Routine={id:uid(),name:'A',archived:false,exercises:[exercise()]};const sessions=['2026-10-05','2026-10-12','2026-10-19'].map(d=>{const s=startSession(r,[]);s.started=d+'T12:00:00Z';s.finished=s.started;s.exercises[0].sets=exercise().sets;return s});const current=r.exercises[0];expect(exerciseWeeks(current,sessions)).toHaveLength(3);expect(exerciseWeeks({...current,id:uid()},sessions)).toHaveLength(0);expect(exerciseWeeks(current,sessions,'2026-10-15T12:00:00Z')).toHaveLength(2)})
it('registrazione non richiede checkbox, corpo libero senza kg e campi incompleti esclusi',async()=>{const {recorded}=await import('../src/lib/model');const e=newExercise('Trazioni');e.sets[0].reps=8;expect(recorded(e).sets[0]).toMatchObject({done:true,weight:null});expect(recorded(e).sets[1].done).toBe(false);e.type='weight';expect(recorded(e).sets[0].done).toBe(false);e.sets[0].weight=0;expect(recorded(e).sets[0].done).toBe(true)})
it('legge bozze legacy con rep zero come celle vuote',async()=>{const {setSchema,newSet}=await import('../src/lib/model');expect(setSchema.parse({...newSet(),reps:0}).reps).toBeNull()})
it('mostra la storia dello stesso esercizio anche con numero di serie diverso',async()=>{const {exerciseWeeks}=await import('../src/lib/metrics');const e=exercise(),r:Routine={id:uid(),name:'A',archived:false,exercises:[e]},s=startSession(r,[]);s.finished=s.started;s.exercises[0].sets=exercise().sets.slice(0,2);expect(exerciseWeeks(e,[s])[0].sets).toHaveLength(2);expect(comparable(e,s.exercises[0])).toBe(false)})
