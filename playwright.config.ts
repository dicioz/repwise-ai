import { defineConfig } from '@playwright/test'
export default defineConfig({testDir:'./e2e',use:{baseURL:'http://localhost:4173/repwise-ai/',viewport:{width:390,height:844},launchOptions:process.env.CI?{}:{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}},webServer:{command:'npm run preview -- --port 4173',url:'http://localhost:4173/repwise-ai/',reuseExistingServer:!process.env.CI}})
