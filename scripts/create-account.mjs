// Run locally in an administrator shell. Values are read from environment, never committed.
import process from 'node:process'
import console from 'node:console'
import { createClient } from '@supabase/supabase-js'
const {SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,REPWISE_EMAIL,REPWISE_PASSWORD}=process.env
if(!SUPABASE_URL||!SUPABASE_SERVICE_ROLE_KEY||!REPWISE_EMAIL||!REPWISE_PASSWORD)throw Error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, REPWISE_EMAIL, REPWISE_PASSWORD in your administrator environment.')
const settings=await globalThis.fetch(`${SUPABASE_URL}/auth/v1/settings`,{headers:{apikey:SUPABASE_SERVICE_ROLE_KEY}})
if(!settings.ok||(await settings.json()).disable_signup!==true)throw Error('Disable public signup in Supabase Auth before provisioning an account.')
const client=createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
const {data:existing,error:checkError}=await client.from('authorized_account').select('user_id').limit(1)
if(checkError)throw Error('Apply database migration first.')
if(existing.length)throw Error('An account is already authorized; no change performed.')
const {data,error}=await client.auth.admin.createUser({email:REPWISE_EMAIL,password:REPWISE_PASSWORD,email_confirm:true})
if(error)throw Error('Account creation failed. Check Supabase admin configuration.')
const inserted=await client.from('authorized_account').insert({user_id:data.user.id})
if(inserted.error)throw Error('Account created but authorization failed. Review authorized_account in Supabase before retrying.')
console.log('Account created and authorized. No credentials were logged.')
