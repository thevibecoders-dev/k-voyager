import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {roundPointShader} from './visibility.js';
import {seededRandom} from './expedition-data.js';

// Local render coordinates. These are authored views, not astronomical ephemerides.
export function createCosmos(host,{report,calm=false}={}){
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setClearColor(0x03060a);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;host.prepend(renderer.domElement);
 renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','3D-scène. Sleep om te draaien, knijp of scroll om te zoomen. Gebruik de etappeknoppen voor vaste gezichtspunten.');
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(44,1,.02,6000),controls=new OrbitControls(camera,renderer.domElement);
 controls.enablePan=false;controls.enableDamping=!calm;controls.dampingFactor=.07;controls.rotateSpeed=.5;controls.zoomSpeed=.65;
 const ambient=new T.AmbientLight(0xc9ddf1,.14),sun=new T.DirectionalLight(0xfff0d6,3.3);scene.add(ambient,sun);sun.position.set(-10,7,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-10;sun.shadow.camera.right=10;sun.shadow.camera.top=10;sun.shadow.camera.bottom=-10;sun.shadow.camera.near=.1;sun.shadow.camera.far=50;sun.shadow.bias=-.0003;sun.shadow.normalBias=.015;
 const overview=new T.Group(),nearRing=new T.Group(),moonView=new T.Group();scene.add(overview,nearRing,moonView);
 const loader=new T.TextureLoader(),textures=new Map();let failedAssets=false;
 function texture(path){if(textures.has(path))return textures.get(path);const map=loader.load(path,()=>{if(!failedAssets)report?.('');},undefined,()=>{failedAssets=true;report?.('Een beeldkaart kon niet laden. Vernieuw de pagina om het opnieuw te proberen. De bewijskaarten blijven beschikbaar.');});map.colorSpace=T.SRGBColorSpace;map.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);textures.set(path,map);return map;}
 const saturn=new T.Mesh(new T.SphereGeometry(3.5,128,80),new T.MeshStandardMaterial({map:texture('assets/planets/8k_saturn.jpg'),roughness:1}));saturn.scale.y=.902;saturn.castShadow=true;saturn.receiveShadow=true;overview.add(saturn);
 const ringGeo=new T.RingGeometry(4.32,8.15,320);const p=ringGeo.attributes.position,uv=ringGeo.attributes.uv;
 for(let i=0;i<p.count;i++)uv.setXY(i,(Math.hypot(p.getX(i),p.getY(i))-4.32)/3.83,.5);
 const rings=new T.Mesh(ringGeo,new T.MeshStandardMaterial({map:texture('assets/planets/2k_saturn_ring_alpha.png'),transparent:true,side:T.DoubleSide,roughness:1,alphaTest:.12,depthWrite:false}));rings.rotation.x=-Math.PI/2;rings.receiveShadow=true;rings.castShadow=true;overview.add(rings);
 // Satellite is physically sized in the overview. A locator is intentionally optional.
 const enceladusMap=texture('assets/planets/enceladus-cassini-4k.jpg');
 const orbitRadius=3.5*238037/60268;
 const smallMoon=new T.Mesh(new T.SphereGeometry(3.5*252.1/60268,16,12),new T.MeshStandardMaterial({map:enceladusMap,roughness:1}));smallMoon.position.set(Math.cos(-.58)*orbitRadius,0,Math.sin(-.58)*orbitRadius);overview.add(smallMoon);
 const orbitalLine=new T.LineLoop(new T.BufferGeometry().setFromPoints(Array.from({length:256},(_,i)=>new T.Vector3(Math.cos(i/256*Math.PI*2)*orbitRadius,0,Math.sin(i/256*Math.PI*2)*orbitRadius))),new T.LineBasicMaterial({color:0x608e9a,transparent:true,opacity:.24}));orbitalLine.visible=false;overview.add(orbitalLine);
 const locator=new T.Mesh(new T.RingGeometry(.19,.205,48),new T.MeshBasicMaterial({color:0xa5e5eb,side:T.DoubleSide,depthTest:true}));locator.position.copy(smallMoon.position);locator.visible=false;overview.add(locator);
 const random=seededRandom(1610),rockGeometry=new T.IcosahedronGeometry(1,1),rockMaterial=new T.MeshStandardMaterial({color:0xd0dadd,roughness:.95,flatShading:true});
 const particles=new T.InstancedMesh(rockGeometry,rockMaterial,720),dummy=new T.Object3D();
 for(let i=0;i<720;i++){dummy.position.set((random()-.5)*54,(random()-.5)*.7,(random()-.5)*54);const size=.045+Math.pow(random(),4)*.5;dummy.scale.set(size,size*(.6+random()*.5),size*(.8+random()*.5));dummy.rotation.set(random()*6,random()*6,random()*6);dummy.updateMatrix();particles.setMatrixAt(i,dummy.matrix);}particles.castShadow=false;particles.receiveShadow=false;nearRing.add(particles);
 // A fixed ruler in an explicitly schematic scene; never a physical claim about these ice fragments.
 const ruler=new T.LineSegments(new T.BufferGeometry().setFromPoints([new T.Vector3(-.5,0,0),new T.Vector3(.5,0,0),new T.Vector3(-.5,-.08,0),new T.Vector3(-.5,.08,0),new T.Vector3(.5,-.08,0),new T.Vector3(.5,.08,0)]),new T.LineBasicMaterial({color:0x96dfe9}));ruler.position.set(0,.6,3);nearRing.add(ruler);
 const moon=new T.Mesh(new T.SphereGeometry(1.65,128,96),new T.MeshStandardMaterial({map:enceladusMap,roughness:.92}));moon.rotation.y=.7;moon.castShadow=true;moon.receiveShadow=true;moonView.add(moon);
 const plumeGeometry=new T.BufferGeometry(),plumePoints=new Float32Array(7000*3),plumeSeeds=[];
 for(let i=0;i<7000;i++){const t=random(),jet=i%5,angle=random()*Math.PI*2,spread=(.015+t*t*.38)*Math.sqrt(random());plumeSeeds.push({t,jet,angle,spread});plumePoints[i*3]=(jet-2)*.095+Math.cos(angle)*spread;plumePoints[i*3+1]=-1.62-t*1.7;plumePoints[i*3+2]=Math.sin(angle)*spread;}
 plumeGeometry.setAttribute('position',new T.BufferAttribute(plumePoints,3));
 const plumeMaterial=new T.PointsMaterial({color:0xc2e8f4,size:.025,transparent:true,opacity:.2,depthWrite:false,blending:T.AdditiveBlending});plumeMaterial.onBeforeCompile=roundPointShader;
 const plume=new T.Points(plumeGeometry,plumeMaterial);plume.frustumCulled=false;moonView.add(plume);
 const presets={saturn:{position:[13,9,17],target:[0,0,0],min:9,max:65},ring:{position:[3,2.2,8],target:[0,0,0],min:1.3,max:45},enceladus:{position:[3.5,-1.2,6.8],target:[0,-.4,0],min:2.2,max:18}};
 let view='saturn',transition=null,last=0,time=0,disposed=false,phase=35,quality='auto';
 function applyLight(){if(view==='enceladus'){const toCamera=camera.position.clone().normalize(),right=new T.Vector3().crossVectors(new T.Vector3(0,1,0),toCamera).normalize();const a=phase*Math.PI/180;sun.position.copy(toCamera.multiplyScalar(Math.cos(a)*14).add(right.multiplyScalar(Math.sin(a)*14)));sun.position.y+=2;ambient.intensity=.06;}else{sun.position.set(-10,7,9);ambient.intensity=view==='ring'?.21:.14;}}
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.clearViewOffset();if(w>900)camera.setViewOffset(w,h,w*.11,0,w,h);camera.updateProjectionMatrix();}
 function setQuality(q){quality=q;renderer.setPixelRatio(Math.min(devicePixelRatio,q==='low'?1:q==='high'?2:1.5));renderer.shadowMap.enabled=q!=='low';particles.count=q==='low'?320:720;plumeGeometry.setDrawRange(0,q==='low'?2500:7000);resize();}
 function setView(name,instant=false){if(!presets[name])return;view=name;overview.visible=view==='saturn';nearRing.visible=view==='ring';moonView.visible=view==='enceladus';const v=presets[view];controls.minDistance=v.min;controls.maxDistance=v.max;const end=new T.Vector3(...v.position);if(host.clientWidth<650&&view==='saturn')end.multiplyScalar(1.35);const target=new T.Vector3(...v.target);controls.update();if(calm||instant){camera.position.copy(end);controls.target.copy(target);transition=null;}else transition={from:camera.position.clone(),to:end,start:performance.now(),targetFrom:controls.target.clone(),targetTo:target};applyLight();controls.update();}
 controls.addEventListener('start',()=>{transition=null;});
 const observer=new ResizeObserver(resize);observer.observe(host);setQuality('auto');setView('saturn',true);
 // Load actual catalogue directions, not randomly positioned decorative stars.
 fetch('data/stars.json').then(r=>{if(!r.ok)throw Error('stars');return r.json();}).then(data=>{
  if(disposed)return;const positions=[],colors=[];for(const star of data.stars){if(star.mag>5.8)continue;const a=star.ra*Math.PI/180,d=star.dec*Math.PI/180;positions.push(1800*Math.cos(d)*Math.cos(a),1800*Math.sin(d),1800*Math.cos(d)*Math.sin(a));const b=T.MathUtils.clamp(.8*Math.pow(10,-.15*(star.mag-1)),.12,1);colors.push(b*.87,b*.92,b);}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));const material=new T.PointsMaterial({size:1.45,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:.7,depthWrite:false});material.onBeforeCompile=roundPointShader;scene.add(new T.Points(geometry,material));
 }).catch(()=>{report?.('De sterrenachtergrond kon niet laden. De expeditie en bewijskaarten blijven beschikbaar.');});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer.setAnimationLoop(null);report?.('Het 3D-beeld is onderbroken. Vernieuw de pagina om het te herstellen; je kunt het logboek nog downloaden.');});
 renderer.setAnimationLoop(now=>{
  if(document.hidden){last=now;return;}if((quality==='low'||(quality==='auto'&&host.clientWidth<650))&&now-last<32)return;const dt=Math.min((now-last)/1000,.05);last=now;if(!calm)time+=dt;
  if(transition){const t=Math.min(1,(now-transition.start)/1500),e=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,e);controls.target.lerpVectors(transition.targetFrom,transition.targetTo,e);if(t===1)transition=null;}
  controls.update();if(view==='saturn'&&locator.visible)locator.quaternion.copy(camera.quaternion);
  if(view==='enceladus'){
   const towardSun=sun.position.clone().normalize(),towardCamera=camera.position.clone().normalize(),backlight=Math.pow((1-towardSun.dot(towardCamera))/2,2);plumeMaterial.opacity=.035+backlight*.58;
   if(!calm){for(let i=0;i<plumeSeeds.length;i++){const s=plumeSeeds[i],t=(s.t+time*.06)%1,spread=s.spread*(.15+t*1.2);plumePoints[i*3]=(s.jet-2)*.095+Math.cos(s.angle)*spread;plumePoints[i*3+1]=-1.62-t*1.7;plumePoints[i*3+2]=Math.sin(s.angle)*spread;}plumeGeometry.attributes.position.needsUpdate=true;}
  }
  renderer.render(scene,camera);
 });
 return {setView,reset:()=>setView(view,calm),setPhase(value){phase=T.MathUtils.clamp(Number(value)||0,5,170);applyLight();},setCalm(value){calm=!!value;controls.enableDamping=!calm;if(calm&&transition)setView(view,true);},setQuality,setLocator(value){locator.visible=!!value;orbitalLine.visible=!!value;},ringAngle(value){transition=null;const a=Number(value)*Math.PI/180;camera.position.set(3,Math.sin(a)*9,Math.cos(a)*9);controls.target.set(0,0,0);controls.update();},zoom(amount){transition=null;camera.position.sub(controls.target).multiplyScalar(amount).clampLength(controls.minDistance,controls.maxDistance).add(controls.target);controls.update();},dispose(){disposed=true;renderer.setAnimationLoop(null);observer.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of [o.material].flat())m.dispose();});textures.forEach(t=>t.dispose());renderer.dispose();}};
}
