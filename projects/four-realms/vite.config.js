import {defineConfig} from 'vite';
export default defineConfig({server:{proxy:{'/socket':{target:'ws://localhost:3000',ws:true}}}});
