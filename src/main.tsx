import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './style.css'
const client=new QueryClient({defaultOptions:{queries:{retry:1,staleTime:30000}}})
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><QueryClientProvider client={client}><App/></QueryClientProvider></React.StrictMode>)
if('serviceWorker' in navigator){window.addEventListener('load',()=>{void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(reg=>{reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller){const button=document.createElement('button');button.className='update-toast';button.textContent='Aggiornamento disponibile · Ricarica quando hai salvato';button.onclick=()=>{navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});reg.waiting?.postMessage({type:'SKIP_WAITING'})};document.body.append(button)}})})})})}
