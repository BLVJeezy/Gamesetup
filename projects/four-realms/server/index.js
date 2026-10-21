import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes,randomUUID} from 'node:crypto';
import {WebSocketServer,WebSocket} from 'ws';
import {world,player,input,tick,ELEMENTS} from '../src/simulation.js';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpeg':'image/jpeg','.png':'image/png'};
export function createGameServer(){
 const rooms=new Map();const server=http.createServer(async(req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end('{"ok":true}');}if(pathname==='/')pathname='/index.html';const path=resolve(root,'.'+pathname);if(!path.startsWith(root))throw Error();const data=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}});
 const wss=new WebSocketServer({server,path:'/socket',maxPayload:2048});const send=(ws,data)=>{if(ws.readyState===WebSocket.OPEN&&ws.bufferedAmount<100000)ws.send(JSON.stringify(data));};
 wss.on('connection',ws=>{let room=null,p=null,count=0;const id=randomUUID();const rate=setInterval(()=>count=0,1000);
  ws.on('message',raw=>{if(++count>100)return ws.close(1008,'Rate limit');try{const m=JSON.parse(raw);p=ws.player||p;if(m.type==='join'&&!room){if(!ELEMENTS[m.element])return send(ws,{type:'error',message:'Choose an element.'});let code=String(m.code||'').toUpperCase().trim();if(code){room=rooms.get(code);if(!room)return send(ws,{type:'error',message:'Room not found.'});if(room.clients.size>=2){room=null;return send(ws,{type:'error',message:'Room is full.'});}}else{if(rooms.size>=250)return send(ws,{type:'error',message:'Server is full.'});do{code=randomBytes(3).toString('hex').toUpperCase();}while(rooms.has(code));room={code,world:world(),clients:new Map()};rooms.set(code,room);}
   p=player(id,m.element,room.clients.size);room.world.players.push(p);room.clients.set(id,ws);ws.player=p;if(room.clients.size===2){room.world=world();let slot=0;for(const [pid,client] of room.clients){const fresh=player(pid,client.player.element,slot++);client.player=fresh;room.world.players.push(fresh);}p=ws.player;}send(ws,{type:'joined',id,code});
  }else if(m.type==='input'&&p)p.input=input(m);else if(m.type==='rematch'&&room&&room.world.winner){p.ready=true;if(room.world.players.length===2&&room.world.players.every(a=>a.ready)){room.world=world();let slot=0;for(const [pid,client] of room.clients){const old=client.player;const next=player(pid,old.element,slot++);room.world.players.push(next);client.player=next;}p=ws.player;}}if(p){if(ws.player&&ws.player!==p)p=ws.player;else ws.player=p;}
  }catch{send(ws,{type:'error',message:'Invalid message.'});}});
  ws.on('close',()=>{clearInterval(rate);if(room){room.clients.delete(id);room.world.players=room.world.players.filter(a=>a.id!==id);room.world.shots=[];room.world.winner=null;for(const client of room.clients.values())send(client,{type:'left'});if(!room.clients.size)rooms.delete(room.code);}});
 });
 const timer=setInterval(()=>{for(const r of rooms.values()){if(r.clients.size===2)tick(r.world,1/30);for(const ws of r.clients.values())send(ws,{type:'state',...r.world});}},1000/30);
 server.on('close',()=>{clearInterval(timer);wss.close();});return {server,wss,rooms};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const {server}=createGameServer();server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Four Realms ready on port '+(process.env.PORT||3000)));}
