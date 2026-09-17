import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {bodies,moons,deepSky} from './bodies.js';
import {sphereBlocksSegment,rectOverlapsDisc,roundPointShader} from './visibility.js';
import {AU,DAY,position,moonOffset,modelMoon,displayPosition,starPosition,ecliptic,period} from './ephemeris.js';

const $=s=>document.querySelector(s),num=new Intl.NumberFormat('nl-NL',{maximumFractionDigits:2});
const expeditionCredit=document.createElement('p');expeditionCredit.innerHTML='Enceladus: Cassini-kaart PIA18435, NASA/JPL-Caltech/Space Science Institute/Lunar and Planetary Institute, Paul Schenk. Versterkte IR/zichtbaar/UV-kleuren; geen hoogtekaart. <a href="https://science.nasa.gov/photojournal/color-maps-of-enceladus-2014/">Bron</a> · <a href="assets/expedition-credits.json">Assetverantwoording</a>.';$('#about').append(expeditionCredit);
const state={ms:Date.now(),speed:1,paused:false,physical:false,flight:false,sector:false,tour:false,selected:null,lastEphem:0,starEpoch:0,keys:new Set(),transition:null,track:null};
const scene=new T.Scene(),camera=new T.PerspectiveCamera(48,innerWidth/innerHeight,.000001,100000);
let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,logarithmicDepthBuffer:true,powerPreference:'high-performance'});}catch(e){$('#progress').innerHTML='Dit apparaat ondersteunt de 3D-weergave niet. <a href="atlas.html">Open de lichte atlas</a>';throw e;}
renderer.setClearColor(0x020407);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);$('#universe').prepend(renderer.domElement);
renderer.domElement.setAttribute('aria-label','3D heelal. Selecteer een bestemming, sleep om rond te kijken en knijp om te zoomen.');
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=.00001;controls.maxDistance=10000;controls.enablePan=true;
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new T.Vector2(innerWidth,innerHeight),.24,.45,1.4);composer.addPass(bloom);composer.addPass(new OutputPass());
const solar=new T.Group(),paths=new T.Group(),beltGroup=new T.Group(),sky=new T.Group(),stellar=new T.Group();scene.add(solar,paths,beltGroup,sky,stellar);stellar.visible=false;
scene.add(new T.AmbientLight(0xbcd9ff,.14));
const sunLight=new T.PointLight(0xfff3dd,3,0,0);solar.add(sunLight);
const loader=new T.TextureLoader(),textureCache=new Map(),items=[],byId=new Map(),labels=[],errors=[];
const textureFiles={sun:'2k_sun.jpg',mercury:'2k_mercury.jpg',venus:'2k_venus_atmosphere.jpg',earth:'8k_earth_daymap.jpg',mars:'8k_mars.jpg',jupiter:'8k_jupiter.jpg',saturn:'8k_saturn.jpg',uranus:'2k_uranus.jpg',neptune:'2k_neptune.jpg',moon:'2k_moon.jpg',enceladus:'enceladus-cassini-4k.jpg'};
function texture(file,color=true){if(textureCache.has(file))return textureCache.get(file);const tex=loader.load('assets/planets/'+file,undefined,undefined,()=>{errors.push(file);$('#status').textContent='Een beeldkaart kon niet laden: '+file;});tex.colorSpace=color?T.SRGBColorSpace:T.NoColorSpace;tex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);textureCache.set(file,tex);return tex;}
const sphere=new T.SphereGeometry(1,96,64);
function roundPoints(options){const material=new T.PointsMaterial({...options,depthTest:true,depthWrite:false,transparent:true});material.onBeforeCompile=roundPointShader;material.customProgramCacheKey=()=> 'round-points-v1';return material;}
function visualRadius(d){return d.id==='Sun'?3.2:d.parent?Math.max(.11,Math.sqrt(d.radius/6371)*.58):.5+Math.sqrt(d.radius/6371)*.62;}
function radius(d){return state.physical?d.radius/AU*100:visualRadius(d);}
function addLabel(name,obj,action){const el=document.createElement('button');el.className='object-label';el.textContent=name;el.onclick=action;$('#labels').append(el);labels.push({el,obj});return el;}
for(const d of [...bodies,...moons]){
 const map=d.texture?texture(textureFiles[d.texture]):null;
 const mat=d.id==='Sun'?new T.MeshBasicMaterial({map,color:0xffe8b7}):new T.MeshStandardMaterial({map,color:map?0xffffff:(d.color||0x999b9f),roughness:1,metalness:0});
 if(d.id==='Sun'){mat.color.multiplyScalar(2.1);}
 const root=new T.Group(),tilt=new T.Group(),mesh=new T.Mesh(sphere,mat);root.add(tilt);tilt.add(mesh);solar.add(root);tilt.rotation.z=(d.tilt||0)*Math.PI/180;
 const item={...d,root,tilt,mesh,mat,au:[0,0,0]};mesh.userData.item=item;items.push(item);byId.set(d.id,item);addLabel(d.name,root,()=>select(item));
 if(d.id==='Earth'){
   const clouds=new T.Mesh(sphere,new T.MeshStandardMaterial({color:0xffffff,alphaMap:texture('2k_earth_clouds.jpg',false),transparent:true,opacity:.64,depthWrite:false,roughness:1}));clouds.scale.setScalar(1.009);mesh.add(clouds);
   const night=texture('2k_earth_nightmap.jpg');mat.emissiveMap=night;mat.emissive.set(0xffffff);mat.emissiveIntensity=.75;
   mat.onBeforeCompile=shader=>{shader.uniforms.sunDirection={value:item.root.position.clone().negate().normalize()};item.shader=shader;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 worldN;').replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nworldN = normalize(mat3(modelMatrix) * normal);');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 worldN; uniform vec3 sunDirection;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance *= 1.0-smoothstep(-0.2,0.15,dot(normalize(worldN),sunDirection));');};
   const atm=new T.Mesh(sphere,new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.BackSide,blending:T.AdditiveBlending,uniforms:{tint:{value:new T.Color('#458edb')}},vertexShader:'varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.0); n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 n;varying vec3 v;uniform vec3 tint;void main(){float a=pow(1.0-abs(dot(normalize(n),normalize(v))),3.0);gl_FragColor=vec4(tint,a*.55);}'}));atm.scale.setScalar(1.027);mesh.add(atm);
 }
 if(d.id==='Saturn'){
   const geo=new T.RingGeometry(1.24,2.32,160,8),pos=geo.attributes.position,uv=geo.attributes.uv;
   for(let i=0;i<pos.count;i++){const r=Math.hypot(pos.getX(i),pos.getY(i));uv.setXY(i,(r-1.24)/(2.32-1.24),.5);}
   const ring=new T.Mesh(geo,new T.MeshStandardMaterial({map:texture('2k_saturn_ring_alpha.png'),transparent:true,side:T.DoubleSide,roughness:1,depthWrite:false,alphaTest:.08}));ring.rotation.x=-Math.PI/2;mesh.add(ring);
 }
 if(d.id==='Earth')for(const child of mesh.children)if(child.material.isShaderMaterial)child.material.depthTest=false;
}
function updateBodies(force=false){
 const date=new Date(state.ms);
 for(const item of items){
  let p;
  if(item.parent){const parent=byId.get(item.parent);const off=item.ephemeris?moonOffset(item.id,date):modelMoon(item,date);item.au=parent.au.map((v,i)=>v+off[i]);
   if(state.physical)p=item.au.map(x=>x*100);
   else{const r=parent.mesh.scale.x*(3+Math.log1p(item.distance/parent.radius)*1.6);const l=Math.hypot(...off);p=off.map((v,i)=>parent.root.position.getComponent(i)+v/l*r);}
  }else{item.au=position(item.id,date);p=displayPosition(item.au,state.physical);}
  item.root.position.fromArray(p);item.mesh.scale.setScalar(radius(item));item.mesh.rotation.y=(state.ms/DAY*24/(item.rotation||item.period*24||24)%1)*Math.PI*2;
  if(item.shader)item.shader.uniforms.sunDirection.value.copy(item.root.position).multiplyScalar(-1).normalize();
 }
 state.lastEphem=performance.now();
}
function disposeChildren(group){for(const child of [...group.children]){child.geometry?.dispose();child.material?.dispose();group.remove(child);}}
function orbitLines(){
 disposeChildren(paths);const date=new Date(state.ms);
 for(const d of bodies.filter(b=>b.id!=='Sun')){const points=[];const p=period(d.id);for(let i=0;i<=160;i++)points.push(new T.Vector3(...displayPosition(position(d.id,new Date(+date+i/160*p*DAY)),state.physical)));paths.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0x627b91,transparent:true,opacity:.22}))); }
}
function seeded(i){const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);}
function belts(){
 disposeChildren(beltGroup);
 for(const [lo,hi,n,color,opacity] of [[2.1,3.3,9000,0xb9a68c,.45],[30,50,16000,0x87b7ce,.44],[.4,5,3000,0xd4b18b,.055]]){
 const coords=[];for(let i=0;i<n;i++){const r=lo+(hi-lo)*seeded(i+lo),a=seeded(i+30000)*Math.PI*2,z=(seeded(i+50000)-.5)*r*.09;coords.push(...displayPosition([Math.cos(a)*r,z,Math.sin(a)*r],state.physical));}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(coords,3));beltGroup.add(new T.Points(g,roundPoints({color,size:state.physical?.6:.22,opacity,sizeAttenuation:true,blending:T.AdditiveBlending})));
 }
}
let starsData=[],catalog=null,starPoints=null,skyPoints=null,starTargets=[];
function starVertices(s,year){const t=year-2000;return ecliptic({x:s.x+s.vx*t,y:s.y+s.vy*t,z:s.z+s.vz*t,t:0});}
function setupStars(){
 disposeChildren(sky);disposeChildren(stellar);
 const vertices=[],directions=[],colors=[],spatialColors=[];starTargets=[];
 const year=2000+(state.ms-Date.UTC(2000,0,1))/DAY/365.25;
 for(const s of starsData){
 const p=starVertices(s,year),dir=new T.Vector3(...p).normalize();directions.push(...dir.multiplyScalar(15000).toArray());
 const brightness=Math.max(.12,Math.min(2,Math.pow(10,-.16*s.mag)*2.5)),color=new T.Color(s.ci<.3?'#adceff':s.ci>1.1?'#ffd0a0':'#e8edff');color.multiplyScalar(brightness);colors.push(color.r,color.g,color.b);
 if(s.dist<100000){vertices.push(...p);spatialColors.push(color.r,color.g,color.b);if(s.name&&!s.name.startsWith('HIP')&&s.mag<3.2)starTargets.push({...s,type:'Ster',point:new T.Vector3(...p)});}
 }
 for(const [group,data,isSky] of [[sky,directions,true],[stellar,vertices,false]]){
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(data,3));g.setAttribute('color',new T.Float32BufferAttribute(isSky?colors:spatialColors,3));
 const m=roundPoints({size:isSky?1.6:2.5,sizeAttenuation:false,vertexColors:true,opacity:.92});
 const points=new T.Points(g,m);group.add(points);if(isSky)skyPoints=points;else starPoints=points;
 }
 state.starEpoch=year;
}
const worldDock=document.createElement('div');worldDock.className='world-dock';worldDock.setAttribute('aria-label','Direct naar een planeet');document.body.append(worldDock);
const dockStyles=document.createElement('link');dockStyles.rel='stylesheet';dockStyles.href='dock.css';document.head.append(dockStyles);
for(const d of bodies.filter(d=>d.texture&&d.id!=='Sun')){const b=document.createElement('button'),ball=document.createElement('span'),name=document.createElement('small');ball.className='world-thumb';ball.style.backgroundImage='url(assets/planets/'+(d.texture==='earth'?'2k_earth_daymap.jpg':d.texture==='mars'?'2k_mars.jpg':textureFiles[d.texture])+')';name.textContent=d.name;b.append(ball,name);b.onclick=()=>select(byId.get(d.id));worldDock.append(b);}
function showPanel(){ $('#panel').hidden=false;$('#showPanel').hidden=true;}
function select(item,wide=false){
 if(state.flight)setFlight(false);
 if(state.sector)setSector(false);
 state.selected=item;state.track=item;state.tour=false;$('#tour').classList.remove('active');
 $('#title').textContent=item.name;$('#kind').textContent=(item.parent?'MAAN VAN '+byId.get(item.parent).name:item.type||'Maan').toUpperCase();$('#subtitle').textContent=item.parent?'Een wereld rond een wereld.':'Sleep om rond te kijken. Scroll of knijp om te naderen.';
 $('#objectName').textContent=item.name;$('#fact').textContent=item.fact||'Een natuurlijke satelliet. De neutrale bol toont geen verzonnen oppervlaktekartering.';
 const dist=Math.hypot(...item.au);
 $('#metrics').innerHTML='<div><small>Straal</small><strong>'+num.format(item.radius)+' km</strong></div><div><small>Afstand tot zon</small><strong>'+num.format(dist)+' AE</strong></div><div><small>Positie</small><strong>'+(item.parent&&!item.ephemeris?'Illustratief model':'Berekende ephemeride')+'</strong></div><div><small>Oppervlak</small><strong>'+(item.texture?'Beeldkaart':'Neutraal model')+'</strong></div>';
 $('#moonList').replaceChildren();
 for(const m of moons.filter(m=>m.parent===(item.parent||item.id))){const b=document.createElement('button');b.textContent=m.name;b.onclick=()=>select(byId.get(m.id));$('#moonList').append(b);}
 $('#modelNote').textContent=(state.physical?'Echte afstanden en stralen. ':'Afstanden gecomprimeerd; objecten vergroot. ')+(item.parent&&!item.ephemeris?'Deze maanpositie is illustratief.':'Standen volgen de simulatietijd.')+' Beeldkaarten: Solar System Scope / INOVE, CC BY 4.0.';
 showPanel();$('#moons').disabled=!moons.some(m=>m.parent===item.id);
 const r=radius(item),distance=wide?r*30:r*(item.id==='Saturn'?8:5.8);
 const sunlight=item.root.position.clone().negate().normalize();if(sunlight.lengthSq()===0)sunlight.set(1,0,1);
 const offset=sunlight.multiplyScalar(distance*.7).add(new T.Vector3(distance*.5,distance*.25,distance*.6)).normalize().multiplyScalar(distance);
 moveCamera(item.root.position.clone().add(offset),item.root.position.clone());
}
function moveCamera(to,target){state.transition={start:performance.now(),from:camera.position.clone(),to,fromTarget:controls.target.clone(),target};}
function overview(){if(state.flight)setFlight(false);if(state.sector)setSector(false);state.track=null;state.selected=null;const span=state.physical?8500:240;moveCamera(new T.Vector3(span*.3,span*.68,span*.78),new T.Vector3());$('#title').textContent='Zonnestelsel';$('#kind').textContent='ONZE KOSMISCHE BUURT';$('#subtitle').textContent='Echte baanrichtingen. Werelden van rots, gas en ijs.';$('#panel').hidden=true;$('#showPanel').hidden=true;}
function setSector(on){state.sector=on;solar.visible=!on;paths.visible=!on&&$('#orbits').checked;beltGroup.visible=!on&&$('#belts').checked;stellar.visible=on;sky.visible=!on;$('#stars').classList.toggle('active',on);for(const l of labels)l.el.hidden=on;if(on){state.track=null;state.selected=null;moveCamera(new T.Vector3(12,20,65),new T.Vector3());$('#title').textContent='Het sterrenveld';$('#kind').textContent='HYG · J2000 + RUIMTEBEWEGING';$('#subtitle').textContent='25.791 catalogussterren. Afstanden in parsecs.';$('#panel').hidden=true;$('#showPanel').hidden=true;}}
function setFlight(on){state.flight=on;controls.enabled=!on;state.transition=null;$('#hud').hidden=!on;$('#flight').classList.toggle('active',on);$('#flight').textContent=on?'◇ Verlaat ruimteschip':'◇ Ruimteschip';state.keys.clear();if(on){state.track=null;$('#panel').hidden=true;$('#showPanel').hidden=!state.selected;}else{controls.target.copy(camera.position).add(camera.getWorldDirection(new T.Vector3()).multiplyScalar(state.selected?radius(state.selected)*5:25));}}
const velocity=new T.Vector3();
function fly(dt){
 let nearest=Infinity;
 for(const d of items){if(state.sector)break;const distance=camera.position.distanceTo(d.root.position)-radius(d);nearest=Math.min(nearest,Math.max(distance,radius(d)*.02));}
 const unitSpeed=state.sector?8:Math.max(state.physical?.00002:.08,Math.min(state.physical?2000:80,nearest*.5));
 const k=state.keys;const v=new T.Vector3((k.has('d')||k.has('arrowright')?1:0)-(k.has('a')||k.has('arrowleft')?1:0),(k.has('r')?1:0)-(k.has('f')?1:0),(k.has('s')||k.has('arrowdown')?1:0)-(k.has('w')||k.has('arrowup')?1:0));
 if(v.lengthSq())v.normalize();v.applyQuaternion(camera.quaternion).multiplyScalar(unitSpeed*(k.has('shift')?12:1));velocity.lerp(v,1-Math.exp(-dt*5));camera.position.addScaledVector(velocity,dt);
 if(k.has('q'))camera.rotateZ(dt*.7);if(k.has('e'))camera.rotateZ(-dt*.7);
 for(const d of items){if(state.sector)break;const delta=camera.position.clone().sub(d.root.position),min=radius(d)*1.04;if(delta.length()<min){delta.setLength(min);camera.position.copy(d.root.position).add(delta);velocity.set(0,0,0);}}
 $('#velocity').textContent=state.sector?num.format(velocity.length())+' pc/s':state.physical?num.format(velocity.length()/100*AU)+' km/s':num.format(velocity.length())+' scène-eenheden/s';
}
const raycaster=new T.Raycaster();let down=null,dragged=false;
renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};dragged=false;});
renderer.domElement.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.abs(dx)+Math.abs(dy)>3)dragged=true;if(state.flight){camera.rotateOnWorldAxis(new T.Vector3(0,1,0),-dx*.003);camera.rotateX(-dy*.003);}down={x:e.clientX,y:e.clientY};});
renderer.domElement.addEventListener('pointerup',e=>{if(down&&!dragged&&!state.flight&&!state.sector){raycaster.setFromCamera(new T.Vector2(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1),camera);const hit=raycaster.intersectObjects(items.map(i=>i.mesh),false)[0];if(hit)select(hit.object.userData.item);}down=null;});
renderer.domElement.addEventListener('pointercancel',()=>down=null);
addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='Escape'&&state.flight)setFlight(false);state.keys.add(e.key.toLowerCase());if(state.flight&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();});
addEventListener('keyup',e=>state.keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>{state.keys.clear();down=null;});
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);state.keys.add(b.dataset.key);};b.onpointerup=b.onpointercancel=()=>state.keys.delete(b.dataset.key);});
$('#flight').onclick=()=>setFlight(!state.flight);$('#overview').onclick=overview;$('#stars').onclick=()=>{if(state.flight)setFlight(false);setSector(true);};
$('#focus').onclick=()=>state.selected&&select(state.selected);$('#moons').onclick=()=>state.selected&&select(state.selected,true);
$('#hidePanel').onclick=()=>{$('#panel').hidden=true;$('#showPanel').hidden=false;};$('#showPanel').onclick=showPanel;
$('#tour').onclick=()=>{if(state.flight)setFlight(false);state.tour=!state.tour;$('#tour').classList.toggle('active',state.tour);controls.autoRotate=state.tour;controls.autoRotateSpeed=.6;};
$('#pause').onclick=()=>{state.paused=!state.paused;$('#pause').textContent=state.paused?'▶':'Ⅱ';};$('#speed').onchange=e=>state.speed=+e.target.value;
$('#now').onclick=()=>{state.ms=Date.now();state.speed=1;state.paused=false;$('#pause').textContent='Ⅱ';$('#speed').value='1';updateBodies();};
$('#date').onchange=e=>{const ms=Date.parse(e.target.value+'Z');if(Number.isFinite(ms)&&ms>=Date.UTC(1900,0,1)&&ms<Date.UTC(2101,0,1)){state.ms=ms;state.speed=1;$('#speed').value='1';updateBodies();orbitLines();setupStars();if(state.selected)select(state.selected);}};
$('#scale').onchange=e=>{state.physical=e.target.value==='physical';updateBodies();orbitLines();belts();if(state.selected)select(state.selected);else overview();};
$('#orbits').onchange=e=>paths.visible=e.target.checked&&!state.sector;$('#belts').onchange=e=>beltGroup.visible=e.target.checked&&!state.sector;
$('#quality').onchange=e=>{const q=e.target.value;renderer.setPixelRatio(q==='ultra'?Math.min(3,Math.max(1,devicePixelRatio)):q==='low'?1:Math.min(devicePixelRatio,1.75));bloom.enabled=q!=='low';resize();};
$('#info').onclick=()=>$('#about').showModal();$('#closeAbout').onclick=()=>$('#about').close();
const distanceNote=document.createElement('p');distanceNote.textContent='Sterren zonder bruikbare catalogusafstand worden alleen als hemelrichting getoond, niet als een verzonnen 3D-locatie. De atlasweergave van andere sterrenstelsels blijft schematisch. Dit is geen volledige reconstructie van alle objecten in het heelal.';$('#about').append(distanceNote);
function resultButton(label,sub,action){const b=document.createElement('button');b.textContent=label;const s=document.createElement('small');s.textContent=sub;b.append(s);b.onclick=()=>{$('#results').hidden=true;$('#search').blur();action();};$('#results').append(b);}
$('#search').oninput=e=>{const q=e.target.value.toLocaleLowerCase().trim();$('#results').replaceChildren();$('#results').hidden=!q;if(!q)return;
 for(const d of items.filter(d=>d.name.toLocaleLowerCase().includes(q)||d.id.toLowerCase().includes(q)).slice(0,8))resultButton(d.name,d.parent?'Maan':'Zonnestelsel',()=>select(d));
 for(const d of deepSky.filter(d=>d.name.toLowerCase().includes(q)))resultButton(d.name,d.type,()=>visitDeep(d));
 for(const s of starTargets.filter(s=>s.name.toLowerCase().includes(q)).slice(0,4))resultButton(s.name,'Ster · '+num.format(s.dist)+' pc',()=>visitStar(s));
 if(catalog)for(const s of catalog.systems.filter(s=>s.name.toLowerCase().includes(q)).slice(0,3))resultButton(s.name,s.planets.length+' bevestigde exoplaneten',()=>{location.href='atlas.html?system='+encodeURIComponent(s.name);});
 if(!$('#results').children.length)resultButton('Geen bestemming gevonden','Probeer Aarde, Titan, Carina, Sirius of TRAPPIST',()=>{});
};
document.addEventListener('click',e=>{if(!e.target.closest('.search'))$('#results').hidden=true;});
function visitStar(s){if(state.flight)setFlight(false);setSector(true);state.track=null;moveCamera(s.point.clone().add(new T.Vector3(1,1,3)),s.point);$('#title').textContent=s.name;$('#subtitle').textContent=num.format(s.dist)+' parsec van de zon · magnitude '+s.mag;$('#kind').textContent='CATALOGUSSTER';}
function visitDeep(d){if(state.flight)setFlight(false);setSector(true);state.track=null;state.selected=null;const dir=new T.Vector3(...starPosition(d.ra,d.dec)).normalize();moveCamera(new T.Vector3(),dir.multiplyScalar(1000));$('#title').textContent=d.name;$('#kind').textContent=d.type;$('#subtitle').textContent=num.format(d.distance)+' lichtjaar · J2000-richting';$('#objectName').textContent=d.name;$('#fact').textContent=d.fact;$('#metrics').replaceChildren();$('#moonList').replaceChildren();$('#moons').disabled=true;$('#modelNote').textContent='Telescoopbeeld met toegewezen kleuren; geen realtime zichtbare-lichtopname. Bron en credits onder Bronnen.';if(d.image){const image=document.createElement('img');image.src=d.image;image.alt=d.name;image.style.gridColumn='1 / -1';$('#metrics').append(image);}showPanel();}
function updateLabels(){
 if(state.sector){for(const l of labels)l.el.hidden=true;return;}
 camera.updateMatrixWorld();
 const origin=camera.position.toArray(),focal=innerHeight/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)));
 const projected=items.map(item=>{
  const p=item.root.position,view=p.clone().applyMatrix4(camera.matrixWorldInverse),v=p.clone().project(camera),r=radius(item),depth=-view.z;
  // Conservative projected sphere bounds also cover off-axis, close-up planets.
  const screenRadius=depth>r?focal*r/(depth-r)*(1+Math.hypot(view.x,view.y)/depth):Math.hypot(innerWidth,innerHeight)*2;
  return {item,p:p.toArray(),r,depth,v,x:(v.x*.5+.5)*innerWidth,y:(-.5*v.y+.5)*innerHeight,radius:screenRadius};
 });
 for(let i=0;i<labels.length;i++){
  const l=labels[i],d=projected[i],dist=camera.position.distanceTo(items[i].root.position);
  let hidden=d.depth<=d.r||d.v.z>1||d.v.z< -1||Math.abs(d.v.x)>1||Math.abs(d.v.y)>1;
  if(d.item.parent&&dist>radius(byId.get(d.item.parent))*70)hidden=true;
  if(!hidden)hidden=projected.some(o=>o!==d&&sphereBlocksSegment(origin,d.p,o.p,o.r));
  if(hidden){l.el.hidden=true;continue;}
  l.el.hidden=false;
  l.width ||= l.el.offsetWidth;l.height ||= l.el.offsetHeight;
  const x=d.x+d.radius+8,y=d.y;
  const rect={left:x+12,right:x+12+l.width,top:y-l.height/2,bottom:y+l.height/2};
  hidden=rect.right>innerWidth||rect.left<0||rect.top<0||rect.bottom>innerHeight;
  if(!hidden)hidden=projected.some(o=>o!==d&&o.depth>0&&o.depth-o.r<d.depth&&rectOverlapsDisc(rect,o));
  l.el.hidden=hidden;l.el.style.left=x+'px';l.el.style.top=y+'px';
 }
}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(innerWidth,innerHeight);for(const l of labels){l.width=0;l.height=0;}}
addEventListener('resize',resize);
let last=performance.now(),lastUI=0,frameCount=0;
function animate(now){
 requestAnimationFrame(animate);const elapsed=(now-last)/1000;last=now;const dt=Math.min(elapsed,.08);
 if(!state.paused)state.ms+=elapsed*1000*state.speed;
 if(state.ms>Date.UTC(2101,0,1)){state.ms=Date.UTC(2100,11,31);state.paused=true;}
 const prior=state.track?.root.position.clone();if(now-state.lastEphem>Math.min(1000,60000/state.speed))updateBodies();
 if(prior&&state.track&&!state.flight&&!state.transition){const delta=state.track.root.position.clone().sub(prior);camera.position.add(delta);controls.target.add(delta);}
 if(state.transition){const tr=state.transition,t=Math.min(1,(now-tr.start)/1400),ease=t*t*(3-2*t);camera.position.lerpVectors(tr.from,tr.to,ease);controls.target.lerpVectors(tr.fromTarget,tr.target,ease);camera.lookAt(controls.target);if(t===1)state.transition=null;}
 else if(state.flight)fly(dt);else{controls.autoRotate=state.tour;controls.update();}
 sky.position.copy(camera.position);
 worldDock.hidden=!!state.selected||state.sector||state.flight;
 if(Math.abs(2000+(state.ms-Date.UTC(2000,0,1))/DAY/365.25-state.starEpoch)>.003)setupStars();
 updateLabels();
 if(now-lastUI>500){$('#clock').textContent=new Date(state.ms).toISOString().replace('T',' ').slice(0,19);$('#status').textContent=(state.sector?'HYG catalogus · afstanden in pc':state.physical?'AU-schaal · echte afstanden en stralen':'Verkenbaar · vergrote objecten')+' · '+renderer.domElement.width+' × '+renderer.domElement.height;lastUI=now;}
 composer.render();frameCount++;
}
async function init(){try{
 const res=await fetch('data/stars.json');if(!res.ok)throw Error('Stercatalogus niet beschikbaar');starsData=(await res.json()).stars;setupStars();updateBodies();orbitLines();belts();
 fetch('data/exoplanets.json').then(r=>r.json()).then(d=>catalog=d).catch(()=>{});
 camera.position.set(45,25,70);select(byId.get(new URLSearchParams(location.search).get('body'))||byId.get('Earth'));$('#loading').hidden=true;
 requestAnimationFrame(animate);
 const mc=document.modelContext;if(mc?.registerTool){mc.registerTool({name:'navigate_to_cosmic_object',description:'Navigeer in de 3D-kosmos naar een planeet of maan.',inputSchema:{type:'object',properties:{name:{type:'string'}},required:['name'],additionalProperties:false},annotations:{readOnlyHint:false},execute({name}){if(typeof name!=='string'||!name.trim())throw Error('Naam ontbreekt');const i=items.find(i=>[i.name,i.id].some(x=>x.toLowerCase()===name.toLowerCase()));if(!i)throw Error('Onbekend object');select(i);return{shown:i.name,mode:state.physical?'physical':'explore'};}});
 mc.registerTool({name:'read_catalog_summary',description:'Lees aantallen en simulatietijd.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(){return{stars:starsData.length,planets:bodies.length-1,selectedMoons:moons.length,time:new Date(state.ms).toISOString(),source:'HYG v4.1 / Astronomy Engine'};}});}
 }catch(e){$('#progress').textContent='Laden mislukt: '+e.message;const a=document.createElement('a');a.href='atlas.html';a.textContent='Open de lichte atlas';$('#loading').append(a);}}
init();
