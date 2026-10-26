import { createClient } from '@supabase/supabase-js'
import { emptyState, stateSchema, type State } from './model'
export const configured=Boolean(import.meta.env.VITE_SUPABASE_URL&&import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
export const supabase=configured?createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY):null
export type Envelope={state:State;revision:number;dirty:boolean;generation:number;operationId?:string}
export const storageKey=(owner:string)=>`repwise-v1:${owner}`
export function readLocal(owner:string):Envelope{const raw=localStorage.getItem(storageKey(owner));if(!raw)return {state:emptyState(),revision:0,dirty:false,generation:0};const e=JSON.parse(raw) as Envelope;return {...e,state:stateSchema.parse(e.state)}}
export function writeLocal(owner:string,e:Envelope){localStorage.setItem(storageKey(owner),JSON.stringify(e))}
export async function syncEnvelope(owner:string,e:Envelope):Promise<Envelope>{
 if(!supabase)throw Error('Supabase non configurato')
 if(e.dirty){const {data,error}=await supabase.rpc('save_state',{document:e.state,expected_revision:e.revision,operation_id:e.operationId??crypto.randomUUID()});if(error)throw Error(error.message.includes('CONFLICT')?'Conflitto tra dispositivi. Le modifiche locali sono conservate. Esporta una copia prima di risolvere.':error.message);return {...e,revision:Number(data),dirty:false}}
 const {data,error}=await supabase.from('user_settings').select('revision').eq('user_id',owner).maybeSingle();if(error)throw error
 if(data&&data.revision!==e.revision){const response=await supabase.rpc('load_state');if(response.error)throw response.error;return {state:stateSchema.parse(response.data),revision:data.revision,dirty:false,generation:e.generation}}
 return e
}
