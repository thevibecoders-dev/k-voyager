// Curated evidence is distinct from authored camera positions and illustrative particles.
export const evidence=[
 {id:'ocean',name:'De oceaan',tag:'△ AFGELEID',measured:'Cassini mat kleine schommelingen in de draaiing van Enceladus.',inferred:'Modellen verklaren die met een wereldwijde oceaan tussen ijskorst en kern.',limit:'Vloeibaar water maakt een wereld interessant voor leven. Het is geen bewijs dat daar iets leeft.',source:'https://www.nasa.gov/news-release/cassini-finds-global-ocean-in-saturns-moon-enceladus/',sourceName:'NASA · Een wereldwijde oceaan (2015)'},
 {id:'plume',name:'De pluimen',tag:'● GEMETEN',measured:'Cassini zag pluimen bij de zuidpool en onderzocht hun waterdamp en ijsdeeltjes.',inferred:'Samen met andere metingen wijzen ze op aanvoer uit de verborgen oceaan. Een deel van het materiaal voedt Saturnus’ diffuse E-ring.',limit:'Uitstromend water toont activiteit, maar vertelt niet of daar iets leeft.',source:'https://science.nasa.gov/saturn/moons/enceladus/',sourceName:'NASA · Enceladus'},
 {id:'phosphate',name:'De fosfaten',tag:'● GEMETEN',measured:'Onderzoekers identificeerden natriumfosfaten in Cassini-metingen van ijsdeeltjes uit de E-ring.',inferred:'Laboratoriumonderzoek ondersteunt dat fosfaat aanwezig is in de oceaan die deze deeltjes voedt.',limit:'Fosfor is belangrijk voor aards leven. Dezelfde stof kan zonder leven ontstaan: dit is geen biosignatuur.',source:'https://www.nasa.gov/missions/cassini/nasa-cassini-data-reveals-building-block-for-life-in-enceladus-ocean/',sourceName:'NASA/JPL · Fosfor gevonden (2023)'},
 {id:'heat',name:'Warm gesteente',tag:'△ AFGELEID',measured:'Cassini vond silica-nanodeeltjes en moleculaire waterstof.',inferred:'Experimenten en modellen wijzen op reacties tussen water en gesteente bij de oceaanbodem.',limit:'Hydrothermale bronnen zijn afgeleid, niet gefotografeerd. Een chemische energiebron bewijst geen leven.',source:'https://science.nasa.gov/missions/cassini/hydrothermal-activity/',sourceName:'NASA · Hydrothermale activiteit'}
];
export const stages=[
 {name:'De stilte\nonder het ijs.',location:'Een oceaan hoeft geen hemel te hebben.',chapter:'DE RINGEN',title:'Wat van ver massief lijkt.',copy:'Een ring van licht. Van dichtbij: ontelbare losse stukken ijs en vooral ruimte. Verander je standpunt. Wat denk je tussen de ringen te vinden?',action:'Duik de ringen in',knowledge:'◇ RECONSTRUCTIE',scale:'Saturnus en hoofdringen · relatieve afmetingen',view:'saturn'},
 {name:'Geen muur.\nEen menigte.',location:'Een schematische nabijblik in de hoofdringen.',chapter:'TUSSEN HET IJS',title:'De leegte hoort erbij.',copy:'Dit zijn geen geregistreerde brokstukken. Hun vormen, maten en afstanden zijn illustratief. Kantel je blik: de ring blijkt een dunne laag, niet een rotsenveld dat de hele ruimte vult.',action:'Zoek Enceladus',knowledge:'∿ ILLUSTRATIE',scale:'Nabijblik · deeltjes en onderlinge afstanden illustratief',view:'ring'},
 {name:'Een wereld\ndie lekt.',location:'Enceladus · ongeveer 504 km in diameter.',chapter:'DE ZUIDPOOL',title:'Licht maakt het onzichtbare zichtbaar.',copy:'Uit de zuidpool ontsnappen waterdamp en ijsdeeltjes. In tegenlicht lichten de kleine deeltjes op. Verander de lichthoek en vergelijk deze reconstructie met een echte opname van Cassini.',action:'Onderzoek het bewijs',knowledge:'◇ RECONSTRUCTIE',scale:'Kaart: Cassini · kleur versterkt · pluimvorm illustratief',view:'enceladus'},
 {name:'Ingrediënten\nzijn geen leven.',location:'Het verschil tussen een vondst en een conclusie.',chapter:'HET BEWIJS',title:'Wat weten we eigenlijk?',copy:'Open de vier vondsten. Vergelijk steeds wat Cassini mat met wat onderzoekers daaruit afleiden. Er is geen verborgen meter die vertelt hoeveel kans er op leven is.',action:'Welke vraag blijft?',knowledge:'● GEMETEN / △ AFGELEID',scale:'Gepubliceerde Cassini-resultaten · geen nieuwe meting',view:'enceladus'},
 {name:'Hoeveel weten\nis genoeg?',location:'Een bestemming kan ook een vraag zijn.',chapter:'JOUW VERVOLG',title:'Wat zou jij willen weten?',copy:'Water, chemie, energie. Nog geen aangetoond leven. Welke waarneming zou jouw vermoeden echt veranderen? Je hoeft geen antwoord te kiezen om verder te mogen.',action:'Open mijn logboek',knowledge:'? GEDACHTE-EXPERIMENT',scale:'Geen morele score · geen echt signaal of missie verstuurd',view:'enceladus'}
];
export const sources=[
 ...evidence.map(e=>({title:e.sourceName,url:e.source,detail:'Wetenschappelijke onderbouwing van de bewijskaart.'})),
 {title:'Enceladuskaart · PIA18435',url:'https://science.nasa.gov/photojournal/color-maps-of-enceladus-2014/',detail:'NASA/JPL-Caltech/Space Science Institute/Lunar and Planetary Institute. Paul Schenk. Cassini-mozaïek 2004–2014, verkleind naar 4096 × 2048. IR/zichtbaar/UV-kleuren versterkt; opgenomen schaduwen, geen hoogtekaart.'},
 {title:'Cassini-foto · PIA14599',url:'https://science.nasa.gov/resource/dark-moon-dramatic-plume/',detail:'NASA/JPL-Caltech/Space Science Institute. 20 februari 2012, fasehoek 165°. Dit is de echte foto; de interactieve pluim is een illustratief model.'},
 {title:'JPL · Image Use Policy',url:'https://www.jpl.nasa.gov/jpl-image-use-policy/',detail:'Herbruikbare missiebeelden met volledige bronvermelding, onder de JPL-voorwaarden. NASA/JPL onderschrijft deze app niet.'},
 {title:'Saturnus en ringen · Solar System Scope',url:'https://www.solarsystemscope.com/textures/',detail:'INOVE / Solar System Scope. CC BY 4.0. Gebaseerd op NASA-gegevens; kleuren en hiaten kunnen artistiek zijn bewerkt.'},
 {title:'CC BY 4.0',url:'https://creativecommons.org/licenses/by/4.0/',detail:'Licentie van de Saturnus- en ringtexturen.'},
 {title:'NASA · Ringafmetingen',url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/satringfact.html',detail:'A-ring buitenrand: 136.780 km vanaf Saturnus’ middelpunt. De lichte hoofdringen zijn niet dezelfde ring als de diffuse E-ring bij Enceladus.'},
 {title:'JPL · Maanparameters',url:'https://ssd.jpl.nasa.gov/sats/phys_par/',detail:'Enceladus: gemiddelde straal 252,1 km. Geen perfect bolvormig object.'},
 {title:'Stercatalogus · HYG v4.1',url:'https://github.com/astronexus/HYG-Database',detail:'David Nash / Astronomy Nexus. CC BY-SA 4.0. Richtingen J2000; de expeditie gebruikt een vaste referentiehemel, niet de actuele hemel vanaf Cassini.'},
 {title:'Lokale afgeleide stercatalogus',url:'data/stars.json',detail:'Catalogus met bron en licentie, onder CC BY-SA 4.0. Geen verzonnen sterrenposities.'},
 {title:'HYG · CC BY-SA 4.0',url:'https://creativecommons.org/licenses/by-sa/4.0/',detail:'Licentie voor de stergegevens en de afgeleide catalogus.'}
];
export const STORAGE_KEY='voyager-expedition-journal-v1';
export function safeJournal(value){
 if(!value||value.version!==1||!Array.isArray(value.entries))return {version:1,entries:[],reflection:''};
 return {version:1,entries:value.entries.slice(-80).filter(e=>e&&typeof e.title==='string'&&typeof e.text==='string').map(e=>({id:String(e.id||'').slice(0,100),title:e.title.slice(0,160),text:e.text.slice(0,2000),source:typeof e.source==='string'&&/^https:\/\/(www\.nasa\.gov|science\.nasa\.gov)\//.test(e.source)?e.source:'',time:typeof e.time==='string'?e.time.slice(0,40):''})),reflection:typeof value.reflection==='string'?value.reflection.slice(0,3000):''};
}
export function addEntry(journal,entry){
 if(journal.entries.some(e=>e.id===entry.id))return journal;
 return safeJournal({...journal,entries:[...journal.entries,entry]});
}
export function journalMarkdown(journal){
 return ['# Kosmos Voyager — De stilte onder het ijs','Persoonlijk logboek. Beelden in de expeditie zijn reconstructies, tenzij als foto aangeduid.',...journal.entries.map(e=>`## ${e.title}\n${e.text}\n${e.source?`Bron: ${e.source}`:''}`),'## Wat zou mijn vermoeden veranderen?',journal.reflection||'(Nog geen gedachte genoteerd)'].join('\n\n');
}
export function stageIndex(value){const n=Number(value);return Number.isInteger(n)&&n>=0&&n<stages.length?n:0;}
export function seededRandom(seed=17){return()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};}
