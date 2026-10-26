import { newExercise, uid, type Routine } from './model'
export function demoRoutines():Routine[]{return [['A · Fondamenta','Squat','Panca inclinata manubri','Trazioni'],['B · Forza','Stacco rumeno','Military press','Trazioni'],['C · Controllo','Bulgarian split squat','Panca piana','Rematore bilanciere']].map(([name,...names])=>({id:uid(),name,archived:false,exercises:names.map(newExercise)}))}
