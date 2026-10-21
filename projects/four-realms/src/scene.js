import * as T from 'three';
import {ELEMENTS,PILLARS} from './simulation.js';
// Original, stylized arena blockout. Reference art is used only in the menu.
export function createScene(canvas){
 const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 const scene=new T.Scene();scene.background=new T.Color('#b8c9cd');scene.fog=new T.FogExp2('#b8c9cd',.008);
 const camera=new T.PerspectiveCamera(58,1,.1,600);const hemi=new T.HemisphereLight(0xe9f6ff,0x726044,2.2);scene.add(hemi);
 const sun=new T.DirectionalLight(0xffddac,3.4);sun.position.set(-35,55,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,far:150});sun.shadow.bias=-.0005;scene.add(sun);
 const materials=new Map();const mat=(color,metalness=0)=>{const key=color+':'+metalness;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:.78,metalness}));return materials.get(key);};
 function mesh(geo,color,x,y,z,parent=scene){const m=new T.Mesh(geo,typeof color==='object'?color:mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(w,h,d,c,x,y,z,parent){return mesh(new T.BoxGeometry(w,h,d),c,x,y,z,parent);}
 function cyl(top,bottom,h,c,x,y,z,parent,n=32){return mesh(new T.CylinderGeometry(top,bottom,h,n),c,x,y,z,parent);}
 const ground=cyl(21,23,2,0x888473,0,-1,0);cyl(20.6,20.6,.1,0xb5ad92,0,.02,0);cyl(18.8,18.8,.11,0x727b73,0,.07,0);
 for(let j=0;j<7;j++){const r=3+j*2.5;const ring=mesh(new T.TorusGeometry(r,.025,5,128),0xd0bd80,0,.145,0);ring.rotation.x=Math.PI/2;}
 for(let j=0;j<24;j++){const a=j*Math.PI/12;const line=box(.035,.015,36,0xc2b48a,0,.14,0);line.rotation.y=a;}
 cyl(2.8,2.8,.1,0xaaa38b,0,.12,0);const emblem=mesh(new T.TorusGeometry(1.8,.07,8,64),0xd6bc72,0,.2,0);emblem.rotation.x=Math.PI/2;
 function pavilion(x,z,scale=1){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g);box(5,.5,5,0x99917c,0,.25,0,g);for(const dx of [-1.9,1.9])for(const dz of [-1.9,1.9]){cyl(.15,.22,4,0x693f2e,dx,2.4,dz,g);box(.4,.3,.4,0xd5b16a,dx,3.9,dz,g);}for(let tier=0;tier<3;tier++){const w=7-tier*1.5,y=4.3+tier*1.2;const roof=cyl(0,w*.72,1.4,0x274b47,0,y,0,g,4);roof.rotation.y=Math.PI/4;box(w,.14,w,0x957349,0,y-.65,0,g);}cyl(.04,.13,1.4,0xd9b364,0,7.3,0,g);return g;}
 for(const [x,z]of PILLARS){cyl(.85,1.1,4.8,0x88816b,x,2.4,z);cyl(1.15,1.15,.3,0xb8a77b,x,4.9,z);const roof=cyl(0,1.8,1.1,0x2f4b42,x,5.55,z,scene,4);roof.rotation.y=Math.PI/4;box(.6,2.5,.08,0x5b332c,x,3,z+1.03);}
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2,x=Math.sin(a)*20.5,z=Math.cos(a)*20.5;if(i%4===0){pavilion(x*1.3,z*1.3,.9);continue;}box(2.8,1.1,.45,0x96917c,x,.55,z).rotation.y=a;box(.5,1.6,.5,0xc1b498,x, .8,z);}
 const water=mesh(new T.PlaneGeometry(900,900),new T.MeshStandardMaterial({color:0x4d858c,metalness:.5,roughness:.28}),0,-9,0);water.rotation.x=-Math.PI/2;
 let seed=23;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 for(let i=0;i<65;i++){const a=rand()*6.283,r=60+rand()*190,x=Math.sin(a)*r,z=Math.cos(a)*r,h=15+rand()*75;const mountain=cyl(2+rand()*3,12+rand()*13,h,0x7a8981,x,h/2-10,z,scene,7);mountain.rotation.y=rand()*6;if(i%5===0){const p=pavilion(x,z,1.3);p.position.y=h-10;}}
 for(let i=0;i<26;i++){const a=i/26*6.283,r=32+rand()*8,x=Math.sin(a)*r,z=Math.cos(a)*r;cyl(.25,.55,5,0x66523a,x,1.5,z);for(let k=0;k<3;k++){const leaf=mesh(new T.IcosahedronGeometry(2.5,1),i%3===0?0x95513b:0x496552,x+(rand()-.5)*2,4+k,z);leaf.scale.y=.55;}}
 const actors=new Map(),shots=new Map();
 function actor(p){const root=new T.Group();scene.add(root);const robe=mat(ELEMENTS[p.element].robe),gold=mat(0xc5aa68),dark=mat(0x282a26),skin=mat(0xc49a77);
 cyl(.32,.27,.66,robe,0,1.25,0,root);cyl(.28,.44,.65,robe,0,.73,0,root);cyl(.31,.31,.12,gold,0,.99,0,root);
 const head=mesh(new T.SphereGeometry(.205,20,16),skin,0,1.89,0,root);head.scale.y=1.18;const hair=mesh(new T.SphereGeometry(.215,16,12),dark,0,1.99,-.035,root);hair.scale.y=.65;mesh(new T.SphereGeometry(.12,12,10),dark,0,2.16,-.06,root);cyl(.085,.09,.16,skin,0,1.65,0,root);
 const limbs=[];for(const side of [-1,1]){const arm=new T.Group();arm.position.set(side*.37,1.48,0);root.add(arm);cyl(.11,.09,.39,robe,0,-.16,0,arm,12);cyl(.085,.065,.35,skin,0,-.48,.02,arm,12);cyl(.09,.09,.16,gold,0,-.49,.02,arm,12);mesh(new T.SphereGeometry(.075,12,8),skin,0,-.68,.02,arm);limbs.push(arm);
 const leg=new T.Group();leg.position.set(side*.17,.69,0);root.add(leg);cyl(.12,.1,.42,dark,0,-.18,0,leg,12);cyl(.11,.095,.3,dark,0,-.48,0,leg,12);box(.21,.15,.35,0x302d24,0,-.6,.07,leg);limbs.push(leg);}
 const sash=box(.15,.8,.055,0xb29c66,0,1.3,.29,root);sash.rotation.z=-.45;
 const cape=mesh(new T.PlaneGeometry(.7,.85,6,8),new T.MeshStandardMaterial({color:ELEMENTS[p.element].robe,side:T.DoubleSide,roughness:.85}),0,.95,-.29,root);cape.rotation.x=.18;
 const shield=mesh(new T.SphereGeometry(.95,20,16),new T.MeshBasicMaterial({color:ELEMENTS[p.element].color,transparent:true,opacity:.18,wireframe:true}),0,1,0,root);shield.visible=false;
 actors.set(p.id,{root,limbs,cape,shield,last:new T.Vector3(p.x,p.y,p.z),phase:0});return actors.get(p.id);}
 let yaw=0,pitch=.22,initialized=false;
 function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}resize();window.addEventListener('resize',resize);
 return {camera,look(dx,dy){yaw-=dx*.003;pitch=T.MathUtils.clamp(pitch+dy*.002,-.1,.75);},get yaw(){return yaw;},reset(){initialized=false;},render(w,id,dt){
  for(const [id,a]of actors)if(!w.players.some(p=>p.id===id)){scene.remove(a.root);actors.delete(id);}
  for(const p of w.players){const a=actors.get(p.id)||actor(p);const target=new T.Vector3(p.x,p.y,p.z),moving=a.last.distanceTo(target)>.015;a.phase+=moving?dt*12:dt*2;a.last.copy(target);a.root.position.lerp(target,1-Math.exp(-20*dt));a.root.rotation.y=p.yaw;a.limbs[0].rotation.x=p.cast>0?-1.4:Math.sin(a.phase)*(moving?.45:.04);a.limbs[2].rotation.x=p.cast>0?-.9:-Math.sin(a.phase)*(moving?.45:.04);a.limbs[1].rotation.x=Math.sin(a.phase)*(moving?.65:0);a.limbs[3].rotation.x=-Math.sin(a.phase)*(moving?.65:0);a.cape.rotation.x=.15+Math.sin(a.phase)*.09+(moving?.25:0);a.shield.visible=p.shield>0;}
  for(const [id,m]of shots)if(!w.shots.some(s=>s.id===id)){scene.remove(m);m.geometry.dispose();m.material.dispose();shots.delete(id);}
  for(const s of w.shots){let m=shots.get(s.id);if(!m){m=mesh(new T.IcosahedronGeometry(s.element==='earth'?.36:.2,1),new T.MeshStandardMaterial({color:ELEMENTS[s.element].color,emissive:ELEMENTS[s.element].color,emissiveIntensity:2}),s.x,s.y,s.z);shots.set(s.id,m);}m.position.set(s.x,s.y,s.z);m.rotation.x+=dt*8;m.rotation.z+=dt*6;}
  const p=w.players.find(p=>p.id===id);if(p){if(!initialized){yaw=p.yaw;initialized=true;}const offset=new T.Vector3(-Math.sin(yaw)*5.6,2.3+pitch*5,-Math.cos(yaw)*5.6);const target=new T.Vector3(p.x,p.y+1,p.z);camera.position.lerp(target.clone().add(offset),1-Math.exp(-9*dt));camera.lookAt(target.x+Math.sin(yaw)*3,target.y+.4-pitch*2,target.z+Math.cos(yaw)*3);camera.fov=T.MathUtils.lerp(camera.fov,p.input?.sprint?66:58,dt*5);camera.updateProjectionMatrix();}renderer.render(scene,camera);
 }};
}
