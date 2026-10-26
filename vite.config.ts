import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({build:{rollupOptions:{output:{manualChunks:{charts:['recharts'],supabase:['@supabase/supabase-js']}}}},base:'/repwise-ai/',plugins:[react(),tailwindcss(),VitePWA({registerType:'prompt',includeAssets:['icon.svg','icon-192.png','icon-512.png','apple-touch-icon.png'],manifest:{name:'Repwise AI',short_name:'Repwise',lang:'it',description:'Il tuo diario di allenamento intelligente',start_url:'/repwise-ai/',scope:'/repwise-ai/',display:'standalone',background_color:'#111217',theme_color:'#7970ff',icons:[{src:'icon-192.png',sizes:'192x192',type:'image/png'},{src:'icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]},workbox:{clientsClaim:true,navigateFallback:'index.html',globPatterns:['**/*.{js,css,html,png,svg,woff2}']}})],test:{include:['tests/**/*.test.ts']}})
