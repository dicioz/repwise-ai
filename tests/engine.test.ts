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
 it('prefill non conferma né copia RPE',()=>{const r:Routine={id:uid(),name:'A',archived:false,exercises:[exercise()]};const previous=startSession(r,[]);previous.finished=new Date().toISOString();previous.status='completed';previous.exercises[0].sets.forEach(s=>{s.weight=90;s.done=true});const next=startSession(r,[previous]);expect(next.exercises[0].sets[0]).toMatchObject({weight:90,rpe:null,done:false});expect(next.exercises[0].sets[0].id).not.toBe(previous.exercises[0].sets[0].id)})
 it('frequenza esclude parziali',()=>{const r:Routine={id:uid(),name:'A',archived:false,exercises:[exercise()]};const s=startSession(r,[]);s.status='partial';expect(frequency([s],new Date())).toBe(0);s.status='completed';expect(frequency([s],new Date())).toBe(1);expect(sessionVolume(s)).toBe(0)})
})

it('riepilogo settimanale rispetta estremi e volume effettivo',()=>{const r:Routine={id:uid(),name:'A',archived:false,exercises:[exercise()]};const s=startSession(r,[]);s.started='2026-10-26T12:00:00Z';s.finished=s.started;s.status='partial';s.exercises[0].sets=exercise().sets;const result=weeklySummary([s],new Date('2026-10-28T12:00:00Z'));expect(result).toMatchObject({completed:0,volume:1530,sets:3,rpe:8});expect(weeklySummary([s],new Date('2026-11-04T12:00:00Z')).volume).toBe(0)})
