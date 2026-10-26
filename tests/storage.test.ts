import { beforeAll,beforeEach,describe,it,expect,vi } from 'vitest'
import { emptyState,uid } from '../src/lib/model'
const mock=vi.hoisted(()=>({rpc:vi.fn()}))
vi.mock('@supabase/supabase-js',()=>({createClient:()=>({rpc:mock.rpc})}))
beforeAll(()=>{vi.stubEnv('VITE_SUPABASE_URL','https://test.supabase.co');vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY','test-public')})
beforeEach(()=>{const memory=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>memory.get(k)??null,setItem:(k:string,v:string)=>memory.set(k,v)});mock.rpc.mockReset()})
describe('Coda offline persistente',()=>{
 it('persiste modifiche e le recupera dopo la riapertura',async()=>{const {readLocal,writeLocal}=await import('../src/lib/storage');const e={state:emptyState(),revision:2,dirty:true,generation:3,operationId:uid()};writeLocal('user',e);expect(readLocal('user')).toEqual(e);expect(readLocal('different-user').state.sessions).toEqual([])})
 it('ritenta stessa operazione, conferma solo dopo successo remoto',async()=>{const {syncEnvelope}=await import('../src/lib/storage');const e={state:emptyState(),revision:0,dirty:true,generation:1,operationId:uid()};mock.rpc.mockResolvedValueOnce({error:{message:'Network failed'}}).mockResolvedValueOnce({data:1,error:null});await expect(syncEnvelope('user',e)).rejects.toThrow();expect(e.dirty).toBe(true);const result=await syncEnvelope('user',e);expect(result.dirty).toBe(false);expect(result.revision).toBe(1);expect(mock.rpc.mock.calls[0]).toEqual(mock.rpc.mock.calls[1])})
 it('conflitto non scarta stato locale',async()=>{const {syncEnvelope}=await import('../src/lib/storage');const e={state:emptyState(),revision:1,dirty:true,generation:2,operationId:uid()};mock.rpc.mockResolvedValue({error:{message:'CONFLICT'}});await expect(syncEnvelope('user',e)).rejects.toThrow('Conflitto');expect(e.dirty).toBe(true);expect(e.revision).toBe(1)})
})
