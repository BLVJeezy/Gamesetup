export const ELEMENTS = {
 fire: {name:'Fire',color:'#ff773e',robe:0x742d24,skill:'Flame burst',speed:23,damage:22,cooldown:.65},
 water: {name:'Water',color:'#76d9ff',robe:0x214d70,skill:'Ice lance',speed:28,damage:18,cooldown:.5},
 earth: {name:'Earth',color:'#d8bf70',robe:0x3c5030,skill:'Stone strike',speed:18,damage:30,cooldown:.95},
 air: {name:'Air',color:'#d9fff0',robe:0xaf7435,skill:'Wind blade',speed:34,damage:14,cooldown:.38}
};
export const PILLARS = [[-9,-6],[9,-6],[-9,6],[9,6]];
export function player(id,element='fire',slot=0){return {id,element,x:0,y:0,z:slot?10:-10,yaw:slot?Math.PI:0,hp:100,energy:100,vy:0,cooldown:0,dash:0,shield:0,score:0,input:{},cast:0};}
export function input(data){const n=v=>Number.isFinite(v)?Math.max(-1,Math.min(1,v)):0;return {x:n(data.x),z:n(data.z),yaw:Number.isFinite(data.yaw)?data.yaw%(Math.PI*2):0,jump:data.jump===true,sprint:data.sprint===true,attack:data.attack===true,dodge:data.dodge===true,shield:data.shield===true};}
export function world(){return {players:[],shots:[],time:0,winner:null,nextShot:0};}
export function tick(w,dt){
 dt=Math.max(0,Math.min(dt,.05));w.time+=dt;if(w.winner)return;
 for(const p of w.players){
  const i=p.input;p.cooldown=Math.max(0,p.cooldown-dt);p.dash=Math.max(0,p.dash-dt);p.cast=Math.max(0,p.cast-dt);p.shield=Math.max(0,p.shield-dt);p.energy=Math.min(100,p.energy+dt*12);if(p.hp<=0)continue;
  p.yaw=i.yaw??p.yaw;
  if(i.dodge&&p.dash===0&&p.energy>=28){p.dash=.8;p.energy-=28;}
  if(i.shield&&p.energy>dt*35){p.shield=.12;p.energy-=dt*35;}
  const length=Math.hypot(i.x||0,i.z||0), speed=p.dash>.6?19:i.sprint?8:5;
  if(length){const dx=i.x/Math.max(1,length)*speed*dt,dz=i.z/Math.max(1,length)*speed*dt;const nx=p.x+dx,nz=p.z+dz;if(Math.hypot(nx,nz)<19.2&&!PILLARS.some(([x,z])=>Math.hypot(nx-x,nz-z)<1.45)){p.x=nx;p.z=nz;}}
  if(i.jump&&p.y===0)p.vy=8;
  p.vy-=22*dt;p.y=Math.max(0,p.y+p.vy*dt);if(p.y===0)p.vy=0;
  const e=ELEMENTS[p.element];
  if(i.attack&&p.cooldown===0&&p.energy>=9){p.energy-=9;p.cooldown=e.cooldown;p.cast=.3;w.shots.push({id:++w.nextShot,owner:p.id,element:p.element,x:p.x+Math.sin(p.yaw),y:p.y+1.25,z:p.z+Math.cos(p.yaw),dx:Math.sin(p.yaw)*e.speed,dz:Math.cos(p.yaw)*e.speed,life:2});}
 }
 for(const s of w.shots){const ax=s.x,az=s.z;s.x+=s.dx*dt;s.z+=s.dz*dt;s.life-=dt;
  if(Math.hypot(s.x,s.z)>21||PILLARS.some(([x,z])=>Math.hypot(s.x-x,s.z-z)<1))s.life=0;
  for(const p of w.players){if(p.id===s.owner||p.hp<=0||s.life<=0)continue;const vx=s.x-ax,vz=s.z-az;const t=Math.max(0,Math.min(1,((p.x-ax)*vx+(p.z-az)*vz)/(vx*vx+vz*vz||1)));
   if(Math.hypot(p.x-ax-t*vx,p.z-az-t*vz)<.8&&Math.abs(s.y-(p.y+1))<1.2){s.life=0;if(p.dash>.6)continue;p.hp=Math.max(0,p.hp-ELEMENTS[s.element].damage*(p.shield>0?.2:1));if(p.hp===0){const owner=w.players.find(a=>a.id===s.owner);if(owner)owner.score++;w.winner=s.owner;}}
  }
 }
 w.shots=w.shots.filter(s=>s.life>0);
}
