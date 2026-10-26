import type { Exercise, Session, SetRecord } from './model.ts'
export const working=(e:Exercise)=>e.sets.filter(s=>s.kind==='work'&&s.done&&!s.skipped)
export const averageRpe=(sets:SetRecord[])=>{const v=sets.filter(s=>s.done&&!s.skipped&&s.kind==='work'&&s.rpe!==null);return v.length?v.reduce((a,s)=>a+s.rpe!,0)/v.length:null}
// External load only. Unilateral weight is per side, reps per side; sum both sides.
export const volume=(e:Exercise)=>e.type==='bodyweight'?null:working(e).reduce((n,s)=>n+s.weight*s.reps*(e.unilateral?2:1),0)
export const percent=(current:number,previous:number)=>previous>0?(current-previous)/previous*100:null
export const repDelta=(a:Exercise,b:Exercise)=>comparable(a,b)?working(a).reduce((n,s)=>n+s.reps,0)-working(b).reduce((n,s)=>n+s.reps,0):null
export const comparable=(a:Exercise,b:Exercise)=>a.id===b.id&&a.type===b.type&&a.unilateral===b.unilateral&&a.sets.filter(s=>s.kind==='work').map(s=>s.target).join()===b.sets.filter(s=>s.kind==='work').map(s=>s.target).join()
export const bestLoad=(e:Exercise)=>working(e).length?Math.max(...working(e).map(s=>s.weight)):null
export const e1rm=(e:Exercise)=>{if(e.type!=='weight'||e.unilateral)return null;const sets=working(e).filter(s=>s.reps>=1&&s.reps<=10&&s.weight>0&&s.rpe!==null&&s.rpe>=8);return sets.length?Math.max(...sets.map(s=>s.weight*(1+s.reps/30))):null}
export const weekStart=(date:Date)=>{const d=new Date(date);d.setHours(0,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d}
export const frequency=(sessions:Session[],date:Date)=>{const start=weekStart(date),end=new Date(start);end.setDate(end.getDate()+7);return sessions.filter(s=>s.status==='completed'&&new Date(s.started)>=start&&new Date(s.started)<end).length}
export const sessionVolume=(s:Session)=>s.exercises.reduce((n,e)=>n+(volume(e)??0),0)
export type Suggestion={action:'increase_weight'|'increase_reps'|'maintain'|'reduce'|'insufficient';reason:string;confidence:'bassa'|'media'|'alta';weight:number|null;data:{sets:number;rpe:number|null;history:number}}
export function progression(e:Exercise,history:Exercise[]=[],config={easyRpe:8,hardRpe:9.5,maxReps:12}):Suggestion{
 const sets=working(e),expected=e.sets.filter(s=>s.kind==='work'),rpe=averageRpe(sets),validHistory=history.filter(x=>comparable(e,x));
 const result=(action:Suggestion['action'],reason:string,weight:number|null=null):Suggestion=>({action,reason,weight,confidence:validHistory.length>=2?'alta':validHistory.length?'media':'bassa',data:{sets:sets.length,rpe,history:validHistory.length}})
 if(!sets.length||sets.length!==expected.length||rpe===null||sets.some(s=>s.rpe===null||s.reps===0)||new Set(sets.map(s=>s.weight)).size!==1)return result('insufficient','Servono tutte le serie allenanti confermate, carico omogeneo e RPE per ogni serie.')
 const load=sets[0].weight,hit=sets.every(s=>s.reps>=s.target)
 if(!hit&&rpe>=config.hardRpe&&validHistory.some(h=>working(h).some(s=>s.reps<s.target)))return result('reduce','Target mancato ad alto RPE in più sedute confrontabili. Valuta una riduzione.',Math.max(0,load-e.increment))
 if(!hit)return result('maintain','Completa le ripetizioni target prima di valutare un incremento.',load)
 if(rpe<=config.easyRpe){if(e.type==='bodyweight'&&sets.some(s=>s.reps>=config.maxReps))return result('maintain','Limite di ripetizioni preferito raggiunto: rivaluta manualmente il target.');if(e.type==='bodyweight')return result('increase_reps','Target completato con margine: valuta una ripetizione in più, senza applicazione automatica.');return result('increase_weight','Target completato con RPE gestibile. Valuta il tuo incremento preferito.',load+e.increment)}
 return result('maintain','Target completato con impegno elevato: consolida questa prestazione.',load)
}

export function weeklySummary(sessions:Session[],date:Date){const start=weekStart(date),end=new Date(start);end.setDate(end.getDate()+7);const selected=sessions.filter(s=>s.finished&&new Date(s.started)>=start&&new Date(s.started)<end);const sets=selected.flatMap(s=>s.exercises.flatMap(working));return {completed:frequency(sessions,date),volume:selected.reduce((n,s)=>n+sessionVolume(s),0),sets:sets.length,rpe:averageRpe(sets)}}
