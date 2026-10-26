import { z } from 'zod'
export const uid=()=>crypto.randomUUID()
export const setSchema=z.object({id:z.string().uuid(),kind:z.enum(['warmup','work']),weight:z.number().min(0).max(2000),reps:z.number().int().min(0).max(500),target:z.number().int().min(1).max(500),rpe:z.number().min(1).max(10).multipleOf(.5).nullable(),done:z.boolean(),skipped:z.boolean()})
export const exerciseSchema=z.object({id:z.string().uuid(),name:z.string().trim().min(1).max(120),type:z.enum(['weight','bodyweight','weighted','machine']),unilateral:z.boolean(),increment:z.number().positive().max(100),rest:z.number().int().min(0).max(900),notes:z.string().max(2000),sets:z.array(setSchema).max(30)})
export const routineSchema=z.object({id:z.string().uuid(),name:z.string().trim().min(1).max(100),archived:z.boolean(),exercises:z.array(exerciseSchema).max(50)})
export const sessionSchema=z.object({id:z.string().uuid(),routineId:z.string().uuid(),name:z.string(),started:z.string().datetime(),finished:z.string().datetime().nullable(),status:z.enum(['active','paused','completed','partial']),notes:z.string().max(4000),exercises:z.array(exerciseSchema).max(50)})
export const stateSchema=z.object({routines:z.array(routineSchema).max(100),sessions:z.array(sessionSchema).max(2000),decisions:z.record(z.string(),z.enum(['accepted','ignored'])),theme:z.enum(['system','light','dark']),progression:z.object({easyRpe:z.number().min(1).max(9.5),hardRpe:z.number().min(1.5).max(10),maxReps:z.number().int().min(1).max(100)}).default({easyRpe:8,hardRpe:9.5,maxReps:12})})
export type SetRecord=z.infer<typeof setSchema>
export type Exercise=z.infer<typeof exerciseSchema>
export type Routine=z.infer<typeof routineSchema>
export type Session=z.infer<typeof sessionSchema>
export type State=z.infer<typeof stateSchema>
export const emptyState=():State=>({routines:[],sessions:[],decisions:{},theme:'system',progression:{easyRpe:8,hardRpe:9.5,maxReps:12}})
export const newSet=(target=6,weight=0):SetRecord=>({id:uid(),kind:'work',weight,reps:target,target,rpe:null,done:false,skipped:false})
export const library=['Squat','Panca inclinata manubri','Trazioni','Stacco rumeno','Military press','Bulgarian split squat','Panca piana','Rematore bilanciere']
export const newExercise=(name:string):Exercise=>({id:uid(),name,type:name==='Trazioni'?'bodyweight':'weight',unilateral:name==='Bulgarian split squat',increment:2.5,rest:120,notes:'',sets:Array.from({length:3},()=>newSet())})
export function startSession(r:Routine,history:Session[]):Session{
 const previous=history.filter(s=>s.routineId===r.id&&s.finished).sort((a,b)=>b.started.localeCompare(a.started))[0]
 return {id:uid(),routineId:r.id,name:r.name,started:new Date().toISOString(),finished:null,status:'active',notes:'',exercises:r.exercises.map(e=>({...e,sets:e.sets.map((s,i)=>{const old=previous?.exercises.find(x=>x.id===e.id&&x.type===e.type&&x.unilateral===e.unilateral)?.sets[i];return {...s,id:uid(),weight:old?.done?old.weight:s.weight,reps:old?.done?old.reps:s.target,rpe:null,done:false,skipped:false}})}))}
}
