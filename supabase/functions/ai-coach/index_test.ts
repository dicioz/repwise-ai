import { handler } from './index.ts'
const user='11111111-1111-4111-8111-111111111111',session='22222222-2222-4222-8222-222222222222'
const validReport={title:'Seduta controllata',summary:'Hai confermato una serie.',facts:['85 kg per 6 ripetizioni.'],progress:[],monitor:[],comparison:[],suggestions:['Consolida la tecnica.'],limitations:['Una sola serie.']}
const fixture=[{id:session,name:'A',started_at:'2026-10-26T10:00:00Z',status:'partial',notes:'',session_exercises:[{exercise_id:'33333333-3333-4333-8333-333333333333',name_snapshot:'Squat',type_snapshot:'weight',unilateral:false,notes:'',performed_sets:[{id:'44444444-4444-4444-8444-444444444444',kind:'work',weight:85,reps:6,target:6,rpe:8,completed:true,skipped:false}]}]}]
function assert(value:unknown,message='assertion failed'){if(!value)throw Error(message)}
async function run(body:unknown,options:{unauth?:boolean;quota?:boolean;duplicate?:boolean;cached?:boolean;upstreamQuota?:boolean;invalid?:boolean;timeout?:boolean;origin?:string}={}){
 const original=globalThis.fetch
 for(const [k,v] of Object.entries({ALLOWED_ORIGIN:'https://example.test',SUPABASE_URL:'https://supabase.test',SUPABASE_ANON_KEY:'test-public-key',SUPABASE_SERVICE_ROLE_KEY:'test-service-key',GEMINI_API_KEY:'test-gemini-key',GEMINI_MODEL:'gemini-3.8-flash'}))Deno.env.set(k,v)
 let inserted=false,payload:unknown
 globalThis.fetch=async(input,init)=>{const url=String(input instanceof Request?input.url:input);const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}})
  if(url.includes('/auth/v1/user'))return options.unauth?json({message:'Invalid token'},401):json({id:user,aud:'authenticated'})
  if(url.includes('/rpc/is_authorized'))return json(true)
  if(url.includes('/user_settings'))return json({revision:1})
  if(url.includes('/workout_sessions'))return json(fixture)
  if(url.includes('/progression_preferences'))return json([])
  if(url.includes('/rpc/claim_ai'))return options.quota?json({message:'QUOTA'},400):json(!options.duplicate)
  if(url.includes('generativelanguage.googleapis.com')){payload=JSON.parse(String(init?.body));if(options.timeout)throw new DOMException('timeout','TimeoutError');if(options.upstreamQuota)return json({},429);return json({candidates:[{content:{parts:[{text:options.invalid?'not json':JSON.stringify(validReport)}]}}]})}
  if(url.includes('/ai_reports')){if(init?.method==='POST'){inserted=true;return json({id:session,report:validReport})}return json(options.cached?[{id:session,report:validReport}]:[])}
  throw Error('Unexpected URL '+url)
 }
 try{const result=await handler(new Request('https://edge.test/ai-coach',{method:'POST',headers:{origin:options.origin??'https://example.test',Authorization:'Bearer test-token'},body:JSON.stringify(body)}));return {status:result.status,data:await result.json(),inserted,payload}}finally{globalThis.fetch=original}
}
Deno.test('richiesta non autenticata è respinta',async()=>assert((await run({kind:'session',sessionId:session},{unauth:true})).status===401))
Deno.test('CORS rifiuta origini diverse',async()=>assert((await run({kind:'week',week:'2026-10-26'},{origin:'https://other.test'})).status===403))
Deno.test('report seduta validato e persistito, statistiche server-side',async()=>{const r=await run({kind:'session',sessionId:session});assert(r.status===200);assert(r.inserted);assert(JSON.stringify(r.payload).includes('510'));assert(JSON.stringify(r.payload).includes('deterministic'))})
Deno.test('report settimanale esplicito',async()=>{const r=await run({kind:'week',week:'2026-10-28'});assert(r.status===200);assert(r.inserted)})
Deno.test('quota locale blocca Gemini',async()=>{const r=await run({kind:'session',sessionId:session},{quota:true});assert(r.status===429);assert(!r.payload)})
Deno.test('quota upstream gestita',async()=>{const r=await run({kind:'session',sessionId:session},{upstreamQuota:true});assert(r.status===429);assert(!r.inserted)})
Deno.test('JSON invalido non salva report',async()=>{const r=await run({kind:'session',sessionId:session},{invalid:true});assert(r.status===422);assert(!r.inserted)})
Deno.test('duplicati in corso non richiamano Gemini',async()=>{const r=await run({kind:'session',sessionId:session},{duplicate:true});assert(r.status===409);assert(!r.payload)})
Deno.test('cache report non consuma quota',async()=>{const r=await run({kind:'session',sessionId:session},{cached:true});assert(r.status===200);assert(!r.inserted);assert(!r.payload)})
Deno.test('timeout mantiene disponibile diario',async()=>{const r=await run({kind:'session',sessionId:session},{timeout:true});assert(r.status===504);assert(!r.inserted)})
Deno.test('input client invalido respinto',async()=>assert((await run({kind:'session',sessionId:'inventato'})).status===422))
