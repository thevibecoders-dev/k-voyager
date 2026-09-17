(() => {
  "use strict";

  const $ = s => document.querySelector(s);
  const canvas = $("#space");
  const ctx = canvas.getContext("2d", { alpha: false });
  const viewport = $("#viewport");
  const detailPanel = $("#detailPanel");
  const detailContent = $("#detailContent");
  const search = $("#search");
  const results = $("#searchResults");
  const fmt = new Intl.NumberFormat("nl-NL");
  const compact = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 2 });

  const C = { galaxy: "#7ce7ff", nebula: "#ff8c9d", cluster: "#afa2ff", blackhole: "#f4d58d", star: "#ffe5ac", system: "#8be4ff", planet: "#9dd9ff", dwarf: "#b59cff", moon: "#d3dce1" };
  const state = {
    level: "universe", galaxy: null, system: null, selected: null,
    camera: { x: 0, y: 0, zoom: 1, targetZoom: 1 },
    dragging: false, moved: false, last: null, pointers: new Map(), pinch: null,
    hover: null, width: 0, height: 0, dpr: 1, time: 0, data: null,
    objectsOnScreen: [], searchIndex: [], activeResult: -1
  };

  const universeObjects = [
    { id:"milky-way", name:"Melkweg", catalog:"Milky Way", type:"galaxy", kind:"Balkspiraalstelsel", x:-.09, y:.04, size:48, distance:"Hier wonen wij", zoomable:true, description:"Ons sterrenstelsel: een schijf van meer dan 100.000 lichtjaar. De atlas koppelt hier alle bevestigde planetaire stelsels uit de NASA-catalogus aan hun positie rond de zon.", facts:[["Diameter","> 100.000 lichtjaar"],["Type","Balkspiraal"],["Onze positie","Orionarm"],["Omlooptijd zon","ca. 230 miljoen jaar"]], source:"https://science.nasa.gov/universe/galaxies/" },
    { id:"andromeda", name:"Andromedastelsel", catalog:"M31 · NGC 224", type:"galaxy", kind:"Spiraalstelsel", x:.34, y:-.23, size:42, distance:"2,5 miljoen lichtjaar", zoomable:true, image:"assets/andromeda.jpg", credit:"NASA, ESA, B. Williams, Z. Chen, L. C. Johnson; beeldverwerking: J. DePasquale (STScI)", description:"De dichtstbijzijnde grote buur van de Melkweg. Hubble kan hier afzonderlijke sterren oplossen, maar geen individuele planeten bevestigen.", facts:[["Afstand","2,5 miljoen lichtjaar"],["Type","Spiraalstelsel"],["Catalogus","M31 / NGC 224"],["Status planeten","Niet afzonderlijk meetbaar"]], source:"https://science.nasa.gov/asset/hubble/andromeda-galaxy/" },
    { id:"triangulum", name:"Driehoekstelsel", catalog:"M33 · NGC 598", type:"galaxy", kind:"Spiraalstelsel", x:.22, y:.28, size:28, distance:"2,73 miljoen lichtjaar", zoomable:true, description:"Het derde grote spiraalstelsel van de Lokale Groep, na Andromeda en de Melkweg.", facts:[["Afstand","2,73 miljoen lichtjaar"],["Type","Spiraalstelsel"],["Catalogus","M33 / NGC 598"],["Groep","Lokale Groep"]], source:"https://science.nasa.gov/universe/galaxies/" },
    { id:"lmc", name:"Grote Magelhaense Wolk", catalog:"LMC", type:"galaxy", kind:"Onregelmatig dwergstelsel", x:-.35, y:.25, size:23, distance:"163.000 lichtjaar", zoomable:true, description:"Een satellietstelsel van de Melkweg en een belangrijk laboratorium voor stervorming.", facts:[["Afstand","163.000 lichtjaar"],["Type","Onregelmatig"],["Relatie","Satellietstelsel"],["Halfrond","Zuidelijk"]], source:"https://science.nasa.gov/universe/galaxies/" },
    { id:"carina", name:"Carinanevel", catalog:"NGC 3372", type:"nebula", kind:"Emissienevel", x:-.26, y:-.28, size:31, distance:"ca. 7.600 lichtjaar", image:"assets/carina.png", credit:"NASA, ESA, CSA, STScI", description:"Een uitgestrekte kraamkamer voor sterren. Webb onthulde in NGC 3324 de ‘Kosmische Kliffen’, gevormd door straling en sterrenwinden.", facts:[["Afstand","ca. 7.600 lichtjaar"],["Type","Stervormingsgebied"],["Instrument","Webb / NIRCam"],["Beeldveld","ca. 16 lichtjaar"]], source:"https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/" },
    { id:"pillars", name:"Pilaren der Schepping", catalog:"M16 · Adelaarsnevel", type:"nebula", kind:"Emissienevel", x:.08, y:-.36, size:25, distance:"6.500 lichtjaar", image:"assets/pillars.png", credit:"NASA, ESA, CSA, STScI; beeldverwerking: J. DePasquale, A. Koekemoer, A. Pagan (STScI)", description:"Kolommen van gas en stof waarin jonge sterren ontstaan. Webb ziet door het nabij-infrarood veel pas gevormde sterren aan de randen.", facts:[["Afstand","6.500 lichtjaar"],["Gebied","Adelaarsnevel"],["Instrument","Webb / NIRCam"],["Beeldveld","ca. 8 lichtjaar"]], source:"https://science.nasa.gov/asset/webb/pillars-of-creation-nircam-image/" },
    { id:"orion", name:"Orionnevel", catalog:"M42 · NGC 1976", type:"nebula", kind:"Stervormingsgebied", x:.43, y:.13, size:24, distance:"ca. 1.344 lichtjaar", description:"Het dichtstbijzijnde grote stervormingsgebied, zichtbaar met het blote oog als het middelste ‘sterretje’ in het zwaard van Orion.", facts:[["Afstand","ca. 1.344 lichtjaar"],["Type","Emissienevel"],["Catalogus","M42"],["Locatie","Orion"]], source:"https://science.nasa.gov/universe/stars/nebulae/" },
    { id:"pleiades", name:"Plejaden", catalog:"M45", type:"cluster", kind:"Open sterrenhoop", x:-.42, y:-.04, size:19, distance:"ca. 444 lichtjaar", description:"Een jonge open sterrenhoop waarvan meerdere heldere leden met het blote oog zichtbaar zijn.", facts:[["Afstand","ca. 444 lichtjaar"],["Type","Open sterrenhoop"],["Leeftijd","ca. 100 miljoen jaar"],["Catalogus","M45"]], source:"https://science.nasa.gov/universe/stars/" },
    { id:"m87", name:"Messier 87", catalog:"M87 · Virgo A", type:"galaxy", kind:"Elliptisch reuzenstelsel", x:.43, y:.36, size:26, distance:"ca. 54 miljoen lichtjaar", zoomable:true, description:"Een gigantisch elliptisch stelsel in de Virgocluster. Het zwarte gat in de kern was het eerste waarvan een horizonachtige schaduw werd afgebeeld.", facts:[["Afstand","ca. 54 miljoen lichtjaar"],["Type","Elliptisch reuzenstelsel"],["Cluster","Virgo"],["Kern","Actief zwart gat"]], source:"https://science.nasa.gov/universe/galaxies/" }
  ];

  const galaxyHighlights = [
    {id:"proxima",name:"Proxima Centauri",catalog:"α Centauri C",type:"star",kind:"Rode dwergster",x:-.11,y:.08,size:10,distance:"4,24 lichtjaar",description:"De dichtstbijzijnde bekende ster na de zon. Er zijn meerdere planeten rond deze koele rode dwerg gemeld.",facts:[["Afstand","4,24 lichtjaar"],["Type","Rode dwerg"],["Sterrenbeeld","Centaurus"],["Status","Exoplaneet-gastheer"]],source:"https://science.nasa.gov/universe/stars/"},
    {id:"sirius",name:"Sirius",catalog:"α Canis Majoris",type:"star",kind:"Dubbelster",x:.13,y:.04,size:11,distance:"8,6 lichtjaar",description:"De helderste ster aan de aardse nachthemel is in werkelijkheid een dubbelstersysteem.",facts:[["Afstand","8,6 lichtjaar"],["Type","Dubbelster"],["Helderheid","Helderste nachtster"],["Sterrenbeeld","Grote Hond"]],source:"https://science.nasa.gov/universe/stars/"},
    {id:"betelgeuse",name:"Betelgeuze",catalog:"α Orionis",type:"star",kind:"Rode superreus",x:.32,y:-.1,size:14,distance:"ca. 548 lichtjaar",description:"Een enorme, veranderlijke rode superreus in Orion die zich in een laat stadium van haar evolutie bevindt.",facts:[["Afstand","ca. 548 lichtjaar"],["Type","Rode superreus"],["Sterrenbeeld","Orion"],["Evolutie","Laat stadium"]],source:"https://science.nasa.gov/universe/stars/"},
    {id:"vega",name:"Vega",catalog:"α Lyrae",type:"star",kind:"Wit-blauwe hoofdreeksster",x:-.28,y:-.12,size:11,distance:"25 lichtjaar",description:"Een heldere, relatief nabije ster en historisch ijkpunt voor astronomische helderheidsmetingen.",facts:[["Afstand","25 lichtjaar"],["Type","A0V"],["Sterrenbeeld","Lier"],["Rol","Fotometrisch ijkpunt"]],source:"https://science.nasa.gov/universe/stars/"},
    {id:"polaris",name:"Poolster",catalog:"Polaris · α UMi",type:"star",kind:"Cepheïde en meervoudige ster",x:-.06,y:-.31,size:12,distance:"ca. 447 lichtjaar",description:"Polaris staat dicht bij de noordelijke hemelpool en is een klassiek navigatiebaken.",facts:[["Afstand","ca. 447 lichtjaar"],["Type","Cepheïde"],["Sterrenbeeld","Kleine Beer"],["Rol","Poolster"]],source:"https://science.nasa.gov/universe/stars/"},
    {id:"orion-galaxy",name:"Orionnevel",catalog:"M42",type:"nebula",kind:"Stervormingsgebied",x:.21,y:.2,size:17,distance:"ca. 1.344 lichtjaar",description:"Een van de best bestudeerde stervormingsgebieden en vanaf de aarde met het blote oog zichtbaar.",facts:[["Afstand","ca. 1.344 lichtjaar"],["Type","Emissienevel"],["Catalogus","M42"],["Sterrenbeeld","Orion"]],source:"https://science.nasa.gov/universe/stars/nebulae/"},
    {id:"carina-galaxy",name:"Carinanevel",catalog:"NGC 3372",type:"nebula",kind:"Stervormingsgebied",x:-.31,y:.16,size:19,distance:"ca. 7.600 lichtjaar",image:"assets/carina.png",credit:"NASA, ESA, CSA, STScI",description:"Een uitgestrekte kraamkamer voor zware sterren met de door Webb vastgelegde ‘Kosmische Kliffen’.",facts:[["Afstand","ca. 7.600 lichtjaar"],["Type","Emissienevel"],["Catalogus","NGC 3372"],["Beeld","Webb / NIRCam"]],source:"https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/"},
    {id:"pillars-galaxy",name:"Pilaren der Schepping",catalog:"M16",type:"nebula",kind:"Gas- en stofkolommen",x:.37,y:.18,size:15,distance:"6.500 lichtjaar",image:"assets/pillars.png",credit:"NASA, ESA, CSA, STScI; beeldverwerking: J. DePasquale, A. Koekemoer, A. Pagan (STScI)",description:"Stervormende gas- en stofkolommen in de Adelaarsnevel.",facts:[["Afstand","6.500 lichtjaar"],["Gebied","Adelaarsnevel"],["Catalogus","M16"],["Beeld","Webb / NIRCam"]],source:"https://science.nasa.gov/asset/webb/pillars-of-creation-nircam-image/"},
    {id:"sgr-a-galaxy",name:"Sagittarius A*",catalog:"Sgr A*",type:"blackhole",kind:"Superzwaar zwart gat",x:.01,y:.005,size:13,distance:"26.000 lichtjaar",description:"Het superzware zwarte gat in het dynamische centrum van de Melkweg.",facts:[["Afstand","ca. 26.000 lichtjaar"],["Massa","ca. 4 miljoen zonnen"],["Type","Superzwaar zwart gat"],["Locatie","Galactisch centrum"]],source:"https://science.nasa.gov/universe/black-holes/"}
  ];

  const solarBodies = [
    {name:"Mercurius",type:"planet",a:.387,r:.383,color:"#aaa7a2",period:88,moons:0,temp:440},
    {name:"Venus",type:"planet",a:.723,r:.949,color:"#e7c58e",period:224.7,moons:0,temp:737},
    {name:"Aarde",type:"planet",a:1,r:1,color:"#55a9e8",period:365.25,moons:1,temp:288,namedMoons:["Maan"]},
    {name:"Mars",type:"planet",a:1.524,r:.532,color:"#d26c48",period:687,moons:2,temp:210,namedMoons:["Phobos","Deimos"]},
    {name:"Jupiter",type:"planet",a:5.203,r:11.21,color:"#d9b48e",period:4333,moons:95,temp:165,namedMoons:["Io","Europa","Ganymedes","Callisto"]},
    {name:"Saturnus",type:"planet",a:9.537,r:9.45,color:"#e1cf9b",period:10759,moons:274,temp:134,namedMoons:["Titan","Rhea","Enceladus","Iapetus","Dione","Tethys","Mimas"]},
    {name:"Uranus",type:"planet",a:19.19,r:4.01,color:"#8edadd",period:30687,moons:28,temp:76,namedMoons:["Titania","Oberon","Ariel","Umbriel","Miranda"]},
    {name:"Neptunus",type:"planet",a:30.07,r:3.88,color:"#527bd8",period:60190,moons:16,temp:72,namedMoons:["Triton","Nereïde","Proteus"]},
    {name:"Ceres",type:"dwarf",a:2.77,r:.074,color:"#9e9a91",period:1682,moons:0},
    {name:"Pluto",type:"dwarf",a:39.48,r:.186,color:"#cdb9a5",period:90560,moons:5,namedMoons:["Charon","Styx","Nix","Kerberos","Hydra"]},
    {name:"Haumea",type:"dwarf",a:43.13,r:.13,color:"#d8d5ca",period:103774,moons:2,namedMoons:["Hiʻiaka","Namaka"]},
    {name:"Makemake",type:"dwarf",a:45.79,r:.112,color:"#bc826b",period:111845,moons:1,namedMoons:["S/2015 (136472) 1"]},
    {name:"Eris",type:"dwarf",a:67.67,r:.182,color:"#d7dbe0",period:203830,moons:1,namedMoons:["Dysnomia"]}
  ];

  const seeded = (n) => { const x = Math.sin(n * 999.91) * 43758.5453; return x - Math.floor(x); };
  const bgStars = Array.from({length:700}, (_,i) => ({x:seeded(i+1),y:seeded(i+801),r:.25+seeded(i+1601)*1.2,a:.15+seeded(i+2401)*.65,p:seeded(i+3201)*6.28}));

  function escapeHtml(v) { return String(v ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }
  function nice(v, unit="") { return Number.isFinite(v) ? `${compact.format(v)}${unit}` : "Onbekend"; }
  function resize() {
    state.dpr = Math.min(devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect(); state.width = r.width; state.height = r.height;
    canvas.width = Math.round(r.width * state.dpr); canvas.height = Math.round(r.height * state.dpr);
    ctx.setTransform(state.dpr,0,0,state.dpr,0,0);
  }

  function worldToScreen(x,y) {
    const scale = Math.min(state.width,state.height) * .78 * state.camera.zoom;
    return {x:state.width/2+(x-state.camera.x)*scale,y:state.height/2+(y-state.camera.y)*scale};
  }
  function screenToWorld(x,y) {
    const scale = Math.min(state.width,state.height) * .78 * state.camera.zoom;
    return {x:(x-state.width/2)/scale+state.camera.x,y:(y-state.height/2)/scale+state.camera.y};
  }

  function drawBackground(t) {
    const g=ctx.createRadialGradient(state.width*.48,state.height*.45,0,state.width*.48,state.height*.45,Math.max(state.width,state.height)*.75);
    g.addColorStop(0,"#0d1622"); g.addColorStop(.55,"#05080e"); g.addColorStop(1,"#020305");
    ctx.fillStyle=g; ctx.fillRect(0,0,state.width,state.height);
    for (const s of bgStars) {
      const x=((s.x*state.width-state.camera.x*45)%state.width+state.width)%state.width;
      const y=((s.y*state.height-state.camera.y*45)%state.height+state.height)%state.height;
      ctx.globalAlpha=s.a*(.8+.2*Math.sin(t*.0007+s.p)); ctx.fillStyle="#dcefff"; ctx.beginPath(); ctx.arc(x,y,s.r,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  function drawGalaxyGlyph(o,p,t) {
    const selected=state.selected===o, hover=state.hover===o;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate((seeded(o.id.length)*.7)-.35);
    const pulse=1+Math.sin(t*.001+o.x*9)*.025;
    const size=o.size*p.scale*pulse;
    if (o.type==="galaxy") {
      for(let i=0;i<4;i++){
        ctx.strokeStyle=`rgba(124,231,255,${.23-i*.04})`;ctx.lineWidth=Math.max(.6,1.4*p.scale);
        ctx.beginPath();
        for(let a=0;a<Math.PI*2.2;a+=.08){const r=(4+a*3.8+i*2.2)*p.scale;const x=Math.cos(a+i*Math.PI/2)*r;const y=Math.sin(a+i*Math.PI/2)*r*.38;(a===0?ctx.moveTo(x,y):ctx.lineTo(x,y));}
        ctx.stroke();
      }
      const grad=ctx.createRadialGradient(0,0,0,0,0,size*.58);grad.addColorStop(0,"rgba(255,232,176,.92)");grad.addColorStop(.22,"rgba(124,231,255,.36)");grad.addColorStop(1,"rgba(124,231,255,0)");ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(0,0,size*.68,size*.25,0,0,Math.PI*2);ctx.fill();
    } else if(o.type==="nebula") {
      for(let i=0;i<6;i++){const a=seeded(i+o.id.length)*6.28,r=size*(.12+seeded(i+19)*.5);const grad=ctx.createRadialGradient(Math.cos(a)*r,Math.sin(a)*r,0,Math.cos(a)*r,Math.sin(a)*r,size*.45);grad.addColorStop(0,"rgba(255,108,143,.24)");grad.addColorStop(1,"rgba(92,62,170,0)");ctx.fillStyle=grad;ctx.fillRect(-size,size*-1,size*2,size*2);}
    } else if(o.type==="blackhole") {
      ctx.strokeStyle="rgba(244,213,141,.75)";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,size*.75,size*.2,-.2,0,6.28);ctx.stroke();ctx.fillStyle="#000";ctx.shadowBlur=18;ctx.shadowColor="#f4d58d";ctx.beginPath();ctx.arc(0,0,size*.28,0,6.28);ctx.fill();
    } else {
      ctx.fillStyle=C[o.type]||C.star;ctx.shadowBlur=18;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.arc(0,0,Math.max(3,size*.14),0,6.28);ctx.fill();
    }
    if(selected||hover){ctx.shadowBlur=0;ctx.strokeStyle=selected?"#fff":C[o.type];ctx.lineWidth=1;ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(0,0,size*.7+8,0,6.28);ctx.stroke();}
    ctx.restore();
    const showLabel=state.camera.zoom>.72||selected||hover||o.id==="milky-way"||o.id==="andromeda";
    if(showLabel){ctx.fillStyle=selected?"#fff":"#cad6db";ctx.font=`${selected?600:500} 12px Inter, sans-serif`;ctx.fillText(o.name,p.x+o.size*p.scale*.52+12,p.y-2);ctx.fillStyle="#70808a";ctx.font="10px Inter, sans-serif";ctx.fillText(o.distance,p.x+o.size*p.scale*.52+12,p.y+13);}
  }

  function renderUniverse(t) {
    state.objectsOnScreen=[];
    const gridScale=Math.max(.5,Math.min(2,state.camera.zoom));
    for(const o of universeObjects){const p=worldToScreen(o.x,o.y);p.scale=gridScale;const radius=o.size*gridScale*.75+12;if(p.x>-100&&p.x<state.width+100&&p.y>-100&&p.y<state.height+100){drawGalaxyGlyph(o,p,t);state.objectsOnScreen.push({o,x:p.x,y:p.y,r:radius});}}
  }

  function systemPosition(sys,i) {
    if(sys.name==="Zonnestelsel") return {x:0,y:0};
    const ra=(sys.ra??seeded(i)*360)*Math.PI/180, dec=(sys.dec??0)*Math.PI/180;
    const d=Math.min(1,Math.log10(1+(sys.distancePc||250))/3.7);
    const flatten=.68+.25*Math.abs(Math.sin(dec));
    return {x:Math.cos(ra)*d*.48,y:Math.sin(ra)*d*.48*flatten+(dec/Math.PI)*.13};
  }

  function renderMilkyWay(t) {
    state.objectsOnScreen=[];
    const c=worldToScreen(0,0), scale=Math.min(state.width,state.height)*.78*state.camera.zoom;
    ctx.save();ctx.translate(c.x,c.y);ctx.rotate(-.16);
    const grad=ctx.createRadialGradient(0,0,0,0,0,scale*.55);grad.addColorStop(0,"rgba(244,213,141,.16)");grad.addColorStop(.14,"rgba(124,231,255,.08)");grad.addColorStop(1,"rgba(124,231,255,0)");ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(0,0,scale*.54,scale*.21,0,0,6.28);ctx.fill();
    for(let arm=0;arm<4;arm++){ctx.beginPath();for(let a=.2;a<7;a+=.07){const r=a*.065*scale;const x=Math.cos(a+arm*1.57)*r,y=Math.sin(a+arm*1.57)*r*.42;a===.2?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.strokeStyle="rgba(124,190,220,.055)";ctx.lineWidth=scale*.035;ctx.stroke();}
    ctx.restore();
    const systems=state.data.systems;
    const step=state.camera.zoom<1.2?1:1;
    for(let i=0;i<systems.length;i+=step){const s=systems[i],wp=systemPosition(s,i),p=worldToScreen(wp.x,wp.y);if(p.x<-10||p.x>state.width+10||p.y<-10||p.y>state.height+10)continue;const isSel=state.selected===s;const count=s.planets.length;const r=Math.min(5.5,1.25+count*.35)*(isSel?1.7:1);ctx.globalAlpha=Math.min(.88,.36+state.camera.zoom*.18);ctx.fillStyle=isSel?"#fff":count>=5?"#f4d58d":"#7ce7ff";ctx.shadowBlur=isSel?14:5;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.arc(p.x,p.y,r,0,6.28);ctx.fill();ctx.shadowBlur=0;ctx.globalAlpha=1;if(isSel||state.hover===s||state.camera.zoom>3.8){ctx.fillStyle="#dce7eb";ctx.font=`${isSel?600:450} 11px Inter`;ctx.fillText(s.name,p.x+r+6,p.y+4);}state.objectsOnScreen.push({o:s,x:p.x,y:p.y,r:Math.max(8,r+4),kind:"system"});}
    for(const o of galaxyHighlights){const p=worldToScreen(o.x,o.y);p.scale=Math.max(.55,Math.min(1.1,state.camera.zoom*.72));if(p.x>-70&&p.x<state.width+70&&p.y>-70&&p.y<state.height+70){drawGalaxyGlyph(o,p,t);state.objectsOnScreen.push({o,x:p.x,y:p.y,r:o.size*p.scale+9,kind:o.type});}}
    const sun={name:"Zonnestelsel",isSolar:true,planets:solarBodies.map((_,i)=>i),distancePc:0,spectralType:"G2V",starTempK:5772,starRadiusSun:1,starMassSun:1};
    const p=worldToScreen(0,0);ctx.fillStyle="#fff1b5";ctx.shadowBlur=18;ctx.shadowColor="#ffd46d";ctx.beginPath();ctx.arc(p.x,p.y,5.2,0,6.28);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle="#fff";ctx.font="600 11px Inter";ctx.fillText("Zonnestelsel",p.x+11,p.y+4);state.objectsOnScreen.push({o:sun,x:p.x,y:p.y,r:14,kind:"system"});
  }

  function renderUnresolvedGalaxy(t){
    state.objectsOnScreen=[];const c=worldToScreen(0,0);const scale=Math.min(state.width,state.height)*.34*state.camera.zoom;
    ctx.save();ctx.translate(c.x,c.y);ctx.rotate(-.28);
    for(let i=0;i<950;i++){const a=seeded(i+91)*6.28,r=Math.pow(seeded(i+410),.62)*scale;const arm=Math.sin(a*2.15+i*.03)*scale*.06;const x=Math.cos(a)*r+Math.cos(a+1.57)*arm,y=(Math.sin(a)*r+Math.sin(a+1.57)*arm)*.38;ctx.globalAlpha=.2+seeded(i+250)*.55;ctx.fillStyle=seeded(i+12)>.86?"#9cdfff":"#f8e4b3";ctx.fillRect(x,y,seeded(i+7)*1.5+.4,seeded(i+7)*1.5+.4);}
    const grad=ctx.createRadialGradient(0,0,0,0,0,scale*.35);grad.addColorStop(0,"rgba(255,230,170,.8)");grad.addColorStop(1,"rgba(124,231,255,0)");ctx.globalAlpha=1;ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(0,0,scale*.48,scale*.18,0,0,6.28);ctx.fill();ctx.restore();
  }

  function currentPlanets(){
    if(state.system?.isSolar)return solarBodies;
    return (state.system?.planets||[]).map(id=>state.data.planets[id]);
  }
  function renderSystem(t){
    state.objectsOnScreen=[];const p0=worldToScreen(0,0);const planets=currentPlanets();const maxA=Math.max(1,...planets.map((p,i)=>p.semiMajorAu||p.a||Math.pow(i+1,1.4)*.08));const base=Math.min(state.width,state.height)*.055*state.camera.zoom;
    const starColor=starColour(state.system?.starTempK);ctx.fillStyle=starColor;ctx.shadowBlur=35;ctx.shadowColor=starColor;ctx.beginPath();ctx.arc(p0.x,p0.y,Math.min(28,14*Math.pow(state.system?.starRadiusSun||1,.3)),0,6.28);ctx.fill();ctx.shadowBlur=0;state.objectsOnScreen.push({o:{name:state.system.name,type:"star",isHost:true},x:p0.x,y:p0.y,r:25});
    planets.forEach((pl,i)=>{const a=pl.semiMajorAu||pl.a||(.04*Math.pow(i+1,1.45));const orbit=(Math.log10(1+a*12)/Math.log10(1+maxA*12))*(Math.min(state.width,state.height)*.38)*state.camera.zoom;ctx.strokeStyle="rgba(180,215,225,.12)";ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p0.x,p0.y,orbit,orbit*.52,0,0,6.28);ctx.stroke();const phase=(seeded(i+(state.system.name?.length||2))*6.28)+(t*.000015/Math.sqrt(a+.05));const x=p0.x+Math.cos(phase)*orbit,y=p0.y+Math.sin(phase)*orbit*.52;const rad=state.system.isSolar?Math.max(2.7,Math.min(9,2+(pl.r||.4)*.7)):Math.max(3,Math.min(10,3+Math.sqrt(pl.radiusEarth||1)*1.25));const color=pl.color||planetColour(pl);ctx.fillStyle=color;ctx.shadowBlur=state.selected===pl?18:7;ctx.shadowColor=color;ctx.beginPath();ctx.arc(x,y,rad,0,6.28);ctx.fill();ctx.shadowBlur=0;if(state.system.isSolar&&pl.name==="Saturnus"){ctx.strokeStyle="#e4d09a";ctx.beginPath();ctx.ellipse(x,y,rad*1.75,rad*.55,-.25,0,6.28);ctx.stroke();}if(state.selected===pl||state.hover===pl){ctx.strokeStyle="#fff";ctx.beginPath();ctx.arc(x,y,rad+7,0,6.28);ctx.stroke();ctx.fillStyle="#fff";ctx.font="600 11px Inter";ctx.fillText(pl.name,x+rad+10,y+4);}state.objectsOnScreen.push({o:pl,x,y,r:Math.max(10,rad+6),kind:"planet"});if(state.system.isSolar&&pl.moons){drawMoonCloud(pl,x,y,rad,i);}});
  }

  function drawMoonCloud(pl,x,y,pr,seed){
    const visible=state.camera.zoom>1.15||state.selected===pl;const count=visible?pl.moons:Math.min(pl.moons,8);if(!count)return;
    for(let j=0;j<count;j++){const a=seeded(j+seed*311)*6.28,r=pr+5+Math.sqrt(j+1)*(.65+seeded(j+77)*.9);ctx.globalAlpha=Math.min(.58,.16+state.camera.zoom*.1);ctx.fillStyle="#cfdae0";ctx.fillRect(x+Math.cos(a)*r,y+Math.sin(a)*r*.68,1.1,1.1);}
    ctx.globalAlpha=1;
  }
  function starColour(k){if(!k)return"#ffe6ae";if(k>9000)return"#acd6ff";if(k>6500)return"#e1eaff";if(k>5200)return"#fff0bd";if(k>3800)return"#ffc285";return"#ff9272";}
  function planetColour(p){const t=p.equilibriumK;if(t&&t>1000)return"#ff8e69";if((p.radiusEarth||0)>6)return"#deb181";if((p.radiusEarth||0)>2)return"#85cbd6";return"#9db9d5";}

  function render(t){state.time=t;state.camera.zoom+=(state.camera.targetZoom-state.camera.zoom)*.12;drawBackground(t);if(state.level==="universe")renderUniverse(t);else if(state.level==="galaxy"&&state.galaxy?.id==="milky-way")renderMilkyWay(t);else if(state.level==="galaxy")renderUnresolvedGalaxy(t);else renderSystem(t);requestAnimationFrame(render);}

  function hitTest(x,y){let best=null,d=Infinity;for(const h of state.objectsOnScreen){const dd=Math.hypot(x-h.x,y-h.y);if(dd<h.r&&dd<d){best=h.o;d=dd;}}return best;}
  function setZoom(z,anchor){const old=state.camera.targetZoom;const next=Math.max(.45,Math.min(8,z));if(anchor){const before=screenToWorld(anchor.x,anchor.y);state.camera.zoom=old;state.camera.targetZoom=next;const scale=Math.min(state.width,state.height)*.78*next;state.camera.x=before.x-(anchor.x-state.width/2)/scale;state.camera.y=before.y-(anchor.y-state.height/2)/scale;}else state.camera.targetZoom=next;$("#zoomReadout").textContent=`${compact.format(next)}×`;}
  function resetCamera(){state.camera.x=0;state.camera.y=0;setZoom(1);}
  function enterObject(o){
    if(state.level==="universe"&&o.type==="galaxy"&&o.zoomable){state.level="galaxy";state.galaxy=o;state.system=null;state.selected=null;resetCamera();closePanel();updateUI();return;}
    if(state.level==="galaxy"&&state.galaxy?.id==="milky-way"&&(o.isSolar||o.planets)){state.level="system";state.system=o;state.selected=null;resetCamera();closePanel();updateUI();}
  }
  function goLevel(level){if(level==="universe"){state.level="universe";state.galaxy=null;state.system=null;}else if(level==="galaxy"){state.level="galaxy";state.system=null;}state.selected=null;closePanel();resetCamera();updateUI();}

  function selectObject(o){state.selected=o;if(!o){closePanel();return;}showDetails(o);}
  function closePanel(){detailPanel.classList.remove("open");state.selected=null;}
  function showDetails(o){
    const type=o.kind||(o.isSolar?"Planetaire thuisbasis":o.isHost?"Moederster":o.type==="dwarf"?"Dwergplaneet":o.type==="planet"||o.radiusEarth?"Planeet":o.planets?"Planetair stelsel":"Kosmisch object");
    let facts=o.facts;
    if(o.planets&&!o.isSolar)facts=[["Planeten",fmt.format(o.planets.length)],["Afstand",nice(o.distancePc," parsec")],["Spectraaltype",o.spectralType||"Onbekend"],["Stertemperatuur",nice(o.starTempK," K")]];
    if(o.isSolar)facts=[["Planeten","8"],["Dwergplaneten","5"],["Planetaire manen","421"],["Ster","Zon · G2V"]];
    if(o.radiusEarth!==undefined)facts=[["Straal",nice(o.radiusEarth," × aarde")],["Massa",nice(o.massEarth," × aarde")],["Omlooptijd",nice(o.periodDays," dagen")],["Temperatuur",nice(o.equilibriumK," K")],["Ontdekt",o.year||"Onbekend"],["Methode",o.method||"Onbekend"]];
    if(o.a!==undefined)facts=[["Afstand tot zon",nice(o.a," AE")],["Straal",nice(o.r," × aarde")],["Omlooptijd",nice(o.period," dagen")],["Bekende manen",fmt.format(o.moons||0)],["Type",o.type==="dwarf"?"Dwergplaneet":"Planeet"],["Gem. temperatuur",nice(o.temp," K")]];
    const description=o.description||(o.isSolar?"Ons eigen planetaire stelsel, met acht planeten, vijf officieel erkende dwergplaneten en honderden manen. De banen zijn hier logaritmisch geschaald.":o.planets?`Dit stelsel rond ${escapeHtml(o.name)} bevat ${o.planets.length} bevestigde exoplaneet${o.planets.length===1?"":"en"} in de NASA-catalogus.`:o.radiusEarth!==undefined?`${escapeHtml(o.name)} is een bevestigde exoplaneet rond ${escapeHtml(o.host)}. De weergegeven eigenschappen komen uit samengestelde literatuurwaarden in de NASA Exoplanet Archive.`:o.a!==undefined?`${escapeHtml(o.name)} maakt deel uit van ons zonnestelsel.${o.namedMoons?.length?` Bekende manen: ${o.namedMoons.join(", ")}.`:""}`:"");
    const action=(o.type==="galaxy"&&o.zoomable&&state.level==="universe")||((o.planets||o.isSolar)&&state.level==="galaxy")?`<button class="primary-action" id="openObject">Reis naar ${escapeHtml(o.name)} <span>→</span></button>`:"";
    detailContent.innerHTML=`${o.image?`<img class="object-image" src="${o.image}" alt="Telescoopbeeld van ${escapeHtml(o.name)}">${o.credit?`<p class="image-credit">Beeld: ${escapeHtml(o.credit)}</p>`:""}`:""}<div class="detail-type" style="color:${C[o.type]||C.system}"><i></i>${escapeHtml(type)}</div><h2>${escapeHtml(o.name)}</h2><p class="catalog-name">${escapeHtml(o.catalog||(o.host?`Ster: ${o.host}`:"NASA-catalogus"))}</p><p class="detail-copy">${description}</p><div class="facts">${(facts||[]).map(f=>`<div class="fact"><span>${escapeHtml(f[0])}</span><strong>${escapeHtml(f[1])}</strong></div>`).join("")}</div>${action}${o.source?`<a class="source-link" href="${o.source}" target="_blank" rel="noreferrer">Bekijk bron en beeldcredits ↗</a>`:""}`;
    detailPanel.classList.add("open");$("#openObject")?.addEventListener("click",()=>enterObject(o));
  }

  function updateUI(){
    const title=$("#scopeTitle"),eyebrow=$("#scopeEyebrow"),copy=$("#scopeCopy"),stats=$("#stats"),crumbs=$("#crumbs"),legend=$("#legend");
    if(state.level==="universe"){
      eyebrow.textContent="WAARNEEMBAAR HEELAL";title.textContent="Onze kosmische omgeving";copy.textContent="Selecteer een object. Dubbelklik of zoom in om dieper te reizen.";
      stats.innerHTML=`<div class="stat"><strong>80+</strong><span>stelsels in de Lokale Groep</span></div><div class="stat"><strong>13,8 mld.</strong><span>jaar kosmische geschiedenis</span></div>`;
      crumbs.innerHTML=`<button>Heelal</button>`;legend.innerHTML=legendHtml([["galaxy","Sterrenstelsel"],["nebula","Nevel"],["cluster","Sterrenhoop"],["blackhole","Zwart gat"]]);
    } else if(state.level==="galaxy"){
      const mw=state.galaxy.id==="milky-way";eyebrow.textContent=mw?"MELKWEG · HELIOCENTRISCHE PROJECTIE":"STERRERENSTELSEL · ONOPGELOSTE WERELDEN";title.textContent=state.galaxy.name;copy.textContent=mw?"Elke lichtpunt is een werkelijk bekend planetair stelsel. Zoom en sleep; dubbelklik om een stelsel te openen.":"Sterren zijn als context zichtbaar. Individuele planeten in dit stelsel zijn met huidige telescopen nog niet te bevestigen.";
      stats.innerHTML=mw?`<div class="stat"><strong>${fmt.format(state.data.meta.systemCount)}</strong><span>stelsels</span></div><div class="stat"><strong>${fmt.format(state.data.meta.planetCount)}</strong><span>exoplaneten</span></div><div class="stat"><strong>1</strong><span>thuisstelsel</span></div>`:`<div class="stat"><strong>${state.galaxy.distance}</strong><span>vanaf de aarde</span></div><div class="stat"><strong>0</strong><span>bevestigde individuele planeten</span></div>`;
      crumbs.innerHTML=`<button data-go="universe">Heelal</button><span>/</span><button>${escapeHtml(state.galaxy.name)}</button>`;legend.innerHTML=mw?legendHtml([["system","Planetair stelsel"],["blackhole","Zonnestelsel / rijk stelsel"]]):legendHtml([["star","Onopgeloste sterpopulatie"]]);
    } else {
      eyebrow.textContent="PLANETAIR STELSEL · SCHEMATISCHE ATLAS";title.textContent=state.system.name;copy.textContent=state.system.isSolar?"Symbolisch overzicht; maanpuntjes zijn geen berekende posities. Open 3D Voyager voor planeetbeelden en ephemeriden.":"Banen, baanfasen en objectgroottes zijn illustratief. Oppervlakken van deze exoplaneten zijn onbekend.";
      const pcs=currentPlanets();stats.innerHTML=`<div class="stat"><strong>${fmt.format(pcs.length)}</strong><span>${state.system.isSolar?"planeten + dwergplaneten":"bevestigde planeten"}</span></div>${state.system.isSolar?`<div class="stat"><strong>421</strong><span>planetaire manen</span></div>`:`<div class="stat"><strong>${nice(state.system.distancePc," pc")}</strong><span>vanaf de zon</span></div>`}`;
      crumbs.innerHTML=`<button data-go="universe">Heelal</button><span>/</span><button data-go="galaxy">Melkweg</button><span>/</span><button>${escapeHtml(state.system.name)}</button>`;legend.innerHTML=legendHtml([["star","Ster"],["planet","Planeet"],["dwarf","Dwergplaneet"],["moon","Maan"]]);
    }
    crumbs.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>goLevel(b.dataset.go)));
  }
  function legendHtml(items){return items.map(([k,l])=>`<div class="legend-item" style="color:${C[k]}"><i class="legend-dot"></i><span>${l}</span></div>`).join("");}

  function buildSearch(){
    const idx=[...universeObjects,...galaxyHighlights].map(o=>({kind:"object",label:o.name,sub:o.kind,obj:o}));
    state.data.systems.forEach(s=>idx.push({kind:"system",label:s.name,sub:`${s.planets.length} plane${s.planets.length===1?"et":"ten"}`,obj:s}));
    state.data.planets.forEach(p=>idx.push({kind:"planet",label:p.name,sub:`rond ${p.host}`,obj:p}));
    solarBodies.forEach(p=>idx.push({kind:"solar",label:p.name,sub:p.type==="dwarf"?"dwergplaneet · zonnestelsel":"planeet · zonnestelsel",obj:p}));
    state.searchIndex=idx;
  }
  function runSearch(q){q=q.trim().toLocaleLowerCase("nl");if(!q){results.hidden=true;return;}const hits=state.searchIndex.filter(x=>x.label.toLocaleLowerCase("nl").includes(q)||x.sub.toLocaleLowerCase("nl").includes(q)).slice(0,9);state.activeResult=-1;results.innerHTML=hits.length?hits.map((h,i)=>`<button class="search-result" role="option" data-i="${i}"><i class="result-dot" style="color:${C[h.kind==="object"?h.obj.type:h.kind==="system"?"system":h.kind==="solar"?h.obj.type:"planet"]}"></i><span><strong>${highlight(h.label,q)}</strong><small>${escapeHtml(h.sub)}</small></span><em>${h.kind==="object"?"object":h.kind==="system"?"stelsel":"planeet"}</em></button>`).join(""):`<div class="search-result"><span></span><span><strong>Niets gevonden</strong><small>Probeer een andere naam</small></span></div>`;results.hidden=false;results.querySelectorAll("button").forEach((b,i)=>b.addEventListener("click",()=>chooseSearch(hits[i])));}
  function highlight(label,q){const s=escapeHtml(label),i=label.toLocaleLowerCase("nl").indexOf(q);return i<0?s:`${s.slice(0,i)}<mark>${s.slice(i,i+q.length)}</mark>${s.slice(i+q.length)}`;}
  function chooseSearch(hit){search.value=hit.label;results.hidden=true;if(hit.kind==="object"){if(galaxyHighlights.includes(hit.obj)){state.level="galaxy";state.galaxy=universeObjects[0];state.system=null;resetCamera();updateUI();selectObject(hit.obj);}else{goLevel("universe");selectObject(hit.obj);}}else if(hit.kind==="system"){state.level="galaxy";state.galaxy=universeObjects[0];state.system=null;enterObject(hit.obj);selectObject(hit.obj);}else if(hit.kind==="planet"){const sys=state.data.systems.find(s=>s.name===hit.obj.host);state.level="galaxy";state.galaxy=universeObjects[0];enterObject(sys);selectObject(hit.obj);}else{state.level="galaxy";state.galaxy=universeObjects[0];enterObject({name:"Zonnestelsel",isSolar:true,planets:solarBodies.map((_,i)=>i),distancePc:0,spectralType:"G2V",starTempK:5772,starRadiusSun:1,starMassSun:1});selectObject(hit.obj);}updateUI();}

  function registerWebMCP(){
    const mc=document.modelContext;if(!mc?.registerTool)return;
    const exactMatch=name=>state.searchIndex.find(x=>x.label.toLocaleLowerCase("nl")===name.toLocaleLowerCase("nl"));
    Promise.resolve(mc.registerTool({
      name:"navigate_to_cosmic_object",title:"Reis naar een kosmisch object",
      description:"Zoek een planeet, ster, stelsel, sterrenstelsel of nevel op naam en toon die in de interactieve Kosmos Atlas.",
      inputSchema:{type:"object",properties:{name:{type:"string",minLength:1}},required:["name"],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute(input){if(!input||typeof input.name!=="string"||!input.name.trim())throw new Error("Een objectnaam is verplicht.");const hit=exactMatch(input.name.trim())||state.searchIndex.find(x=>x.label.toLocaleLowerCase("nl").includes(input.name.trim().toLocaleLowerCase("nl")));if(!hit)throw new Error(`Geen object gevonden voor ${input.name}.`);chooseSearch(hit);return{shown:hit.label,kind:hit.kind,level:state.level};}
    })).catch(()=>{});
    Promise.resolve(mc.registerTool({
      name:"read_catalog_summary",title:"Lees catalogusoverzicht",
      description:"Lees de actuele aantallen en broninformatie van de exoplanetencatalogus in deze atlas.",
      inputSchema:{type:"object",properties:{},additionalProperties:false},
      annotations:{readOnlyHint:true,untrustedContentHint:false},
      execute(){return{confirmedExoplanets:state.data.meta.planetCount,planetarySystems:state.data.meta.systemCount,planetaryMoons:421,retrieved:state.data.meta.retrieved,source:state.data.meta.source};}
    })).catch(()=>{});
  }

  canvas.addEventListener("pointerdown",e=>{canvas.setPointerCapture(e.pointerId);state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});state.dragging=true;state.moved=false;state.last={x:e.clientX,y:e.clientY};canvas.classList.add("dragging");if(state.pointers.size===2){const a=[...state.pointers.values()];state.pinch={d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),z:state.camera.targetZoom};}});
  canvas.addEventListener("pointermove",e=>{const old=state.pointers.get(e.pointerId);if(old)state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(state.pointers.size===2&&state.pinch){const a=[...state.pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);setZoom(state.pinch.z*d/state.pinch.d,{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2});state.moved=true;return;}if(state.dragging&&state.last){const dx=e.clientX-state.last.x,dy=e.clientY-state.last.y;if(Math.hypot(dx,dy)>2)state.moved=true;const scale=Math.min(state.width,state.height)*.78*state.camera.zoom;state.camera.x-=dx/scale;state.camera.y-=dy/scale;state.last={x:e.clientX,y:e.clientY};}else{state.hover=hitTest(e.clientX,e.clientY);canvas.style.cursor=state.hover?"pointer":"grab";}});
  canvas.addEventListener("pointerup",e=>{state.pointers.delete(e.pointerId);if(!state.moved){const o=hitTest(e.clientX,e.clientY);selectObject(o);}state.dragging=false;state.last=null;state.pinch=null;canvas.classList.remove("dragging");});
  canvas.addEventListener("dblclick",e=>{const o=hitTest(e.clientX,e.clientY);if(o)enterObject(o);});
  canvas.addEventListener("wheel",e=>{e.preventDefault();const factor=Math.exp(-e.deltaY*.0015);setZoom(state.camera.targetZoom*factor,{x:e.clientX,y:e.clientY});if(state.level==="universe"&&state.hover?.type==="galaxy"&&state.camera.targetZoom>5.6)enterObject(state.hover);},{passive:false});
  canvas.addEventListener("mouseleave",()=>state.hover=null);
  $("#zoomIn").addEventListener("click",()=>setZoom(state.camera.targetZoom*1.35));
  $("#zoomOut").addEventListener("click",()=>setZoom(state.camera.targetZoom/1.35));
  $("#resetView").addEventListener("click",resetCamera);$("#homeBtn").addEventListener("click",()=>goLevel("universe"));
  $("#closePanel").addEventListener("click",closePanel);
  search.addEventListener("input",()=>runSearch(search.value));
  search.addEventListener("keydown",e=>{if(e.key==="Escape"){results.hidden=true;search.blur();}if(e.key==="Enter"&&!results.hidden){results.querySelector("button")?.click();}});
  document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();search.focus();}else if(e.key==="Escape"){if(detailPanel.classList.contains("open"))closePanel();else if(state.level==="system")goLevel("galaxy");else if(state.level==="galaxy")goLevel("universe");}else if(e.key==="+"||e.key==="=")setZoom(state.camera.targetZoom*1.3);else if(e.key==="-")setZoom(state.camera.targetZoom/1.3);});
  document.addEventListener("click",e=>{if(!e.target.closest(".search-wrap"))results.hidden=true;});
  const dialog=$("#aboutDialog");$("#aboutBtn").addEventListener("click",()=>dialog.showModal());$("#aboutClose").addEventListener("click",()=>dialog.close());dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
  addEventListener("resize",resize);

  async function init(){
    resize();requestAnimationFrame(render);
    try{const res=await fetch("data/exoplanets.json");if(!res.ok)throw new Error("catalogus niet bereikbaar");state.data=await res.json();buildSearch();registerWebMCP();$("#aboutPlanets").textContent=fmt.format(state.data.meta.planetCount);$("#aboutSystems").textContent=fmt.format(state.data.meta.systemCount);$("#dataDate").textContent=`Catalogus opgehaald op ${new Date(state.data.meta.retrieved).toLocaleDateString("nl-NL",{day:"numeric",month:"long",year:"numeric"})}.`;updateUI();setTimeout(()=>{const loading=$("#loading");loading.classList.add("done");loading.setAttribute("aria-hidden","true");},350);}catch(err){$("#loading").innerHTML=`<strong>De catalogus kon niet worden geladen</strong><span>${escapeHtml(err.message)}</span>`;}
  }
  init().then(()=>{const requested=new URLSearchParams(location.search).get('system');const hit=state.searchIndex?.find(x=>x.kind==='system'&&x.label===requested);if(hit)chooseSearch(hit);});
})();
