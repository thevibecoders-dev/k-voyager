export const bodies=[
{id:'Sun',name:'Zon',radius:695700,rotation:609.12,tilt:7.25,color:'#ffbf56',texture:'sun',fact:'Elke seconde zet de zon ongeveer vier miljoen ton massa om in energie.',type:'Ster'},
{id:'Mercury',name:'Mercurius',radius:2439.7,rotation:1407.6,tilt:.03,color:'#a9a199',texture:'mercury',fact:'Een zonnedag duurt hier twee Mercuriusjaren: ongeveer 176 aardse dagen.',type:'Rotsplaneet'},
{id:'Venus',name:'Venus',radius:6051.8,rotation:-5832.5,tilt:177.4,color:'#efc993',texture:'venus',fact:'De dichte CO₂-atmosfeer houdt zoveel warmte vast dat Venus heter is dan Mercurius.',type:'Rotsplaneet'},
{id:'Earth',name:'Aarde',radius:6371,rotation:23.934,tilt:23.44,color:'#78bde7',texture:'earth',fact:'De blauwe rand is onze dunne atmosfeer. Het grootste deel van de lucht bevindt zich dicht boven het oppervlak.',type:'Rotsplaneet'},
{id:'Mars',name:'Mars',radius:3389.5,rotation:24.623,tilt:25.19,color:'#dc8861',texture:'mars',fact:'Olympus Mons is een schildvulkaan van ongeveer 22 kilometer hoog. Valles Marineris strekt zich duizenden kilometers uit.',type:'Rotsplaneet'},
{id:'Jupiter',name:'Jupiter',radius:69911,rotation:9.925,tilt:3.13,color:'#debfa1',texture:'jupiter',fact:'De Grote Rode Vlek is een enorme storm. Io is vulkanisch actief en Europa verbergt waarschijnlijk een oceaan onder ijs.',type:'Gasreus'},
{id:'Saturn',name:'Saturnus',radius:58232,rotation:10.656,tilt:26.73,color:'#dccda8',texture:'saturn',fact:'De ringen bestaan uit talloze stukken ijs en gesteente. De donkere Cassinischeiding ligt tussen de A- en B-ring.',type:'Gasreus'},
{id:'Uranus',name:'Uranus',radius:25362,rotation:-17.24,tilt:97.77,color:'#9bdcdd',texture:'uranus',fact:'Uranus draait bijna op zijn kant. Daardoor kunnen de poolgebieden tientallen jaren dag of nacht meemaken.',type:'IJsreus'},
{id:'Neptune',name:'Neptunus',radius:24622,rotation:16.11,tilt:28.32,color:'#648adb',texture:'neptune',fact:'Neptunus heeft bijzonder snelle winden. Zijn grootste maan Triton draait tegen de draairichting van de planeet in.',type:'IJsreus'},
{id:'Pluto',name:'Pluto',radius:1188.3,rotation:-153.3,tilt:119.6,color:'#b9ab9e',fact:'Pluto en Charon draaien rond een gemeenschappelijk zwaartepunt dat buiten Pluto ligt.',type:'Dwergplaneet',unmapped:true}
];
export const moons=[
{id:'Moon',name:'Maan',parent:'Earth',radius:1737.4,distance:384400,period:27.322,texture:'moon',fact:'De Maan verwijdert zich gemiddeld ongeveer 3,8 centimeter per jaar van de Aarde.',ephemeris:true},
{id:'Phobos',name:'Phobos',parent:'Mars',radius:11.27,distance:9376,period:.319,phase:.2},
{id:'Deimos',name:'Deimos',parent:'Mars',radius:6.2,distance:23463,period:1.263,phase:.6},
{id:'Io',name:'Io',parent:'Jupiter',radius:1821.6,distance:421700,period:1.769,ephemeris:true,color:'#d6bf60'},
{id:'Europa',name:'Europa',parent:'Jupiter',radius:1560.8,distance:671034,period:3.551,ephemeris:true,color:'#d9cbb1'},
{id:'Ganymede',name:'Ganymedes',parent:'Jupiter',radius:2631.2,distance:1070412,period:7.155,ephemeris:true},
{id:'Callisto',name:'Callisto',parent:'Jupiter',radius:2410.3,distance:1882709,period:16.689,ephemeris:true},
{id:'Mimas',name:'Mimas',parent:'Saturn',radius:198.2,distance:185539,period:.942,phase:.1},
{id:'Enceladus',name:'Enceladus',parent:'Saturn',radius:252.1,distance:238037,period:1.37,phase:.3,fact:'Pluimen bij de zuidpool voeren materiaal uit een ondergrondse oceaan de ruimte in.'},
{id:'Tethys',name:'Tethys',parent:'Saturn',radius:531.1,distance:294672,period:1.888,phase:.5},
{id:'Dione',name:'Dione',parent:'Saturn',radius:561.4,distance:377415,period:2.737,phase:.7},
{id:'Rhea',name:'Rhea',parent:'Saturn',radius:763.8,distance:527068,period:4.518,phase:.9},
{id:'Titan',name:'Titan',parent:'Saturn',radius:2574.7,distance:1221865,period:15.945,phase:.4,color:'#d9a65a',fact:'Titan heeft een dikke atmosfeer en meren van vloeibaar methaan en ethaan.'},
{id:'Iapetus',name:'Iapetus',parent:'Saturn',radius:734.5,distance:3560820,period:79.321,phase:.8},
{id:'Miranda',name:'Miranda',parent:'Uranus',radius:235.8,distance:129390,period:1.413,phase:.2},
{id:'Ariel',name:'Ariel',parent:'Uranus',radius:578.9,distance:190900,period:2.52,phase:.4},
{id:'Umbriel',name:'Umbriel',parent:'Uranus',radius:584.7,distance:266000,period:4.144,phase:.6},
{id:'Titania',name:'Titania',parent:'Uranus',radius:788.9,distance:436300,period:8.706,phase:.8},
{id:'Oberon',name:'Oberon',parent:'Uranus',radius:761.4,distance:583500,period:13.463,phase:.1},
{id:'Triton',name:'Triton',parent:'Neptune',radius:1353.4,distance:354759,period:-5.877,phase:.3},
{id:'Charon',name:'Charon',parent:'Pluto',radius:606,distance:19596,period:6.387,phase:.2}
];
export const deepSky=[
{name:'Orionnevel',ra:83.822,dec:-5.391,distance:1344,type:'Stervormingsgebied',fact:'In deze stellaire kraamkamer worden nieuwe sterren geboren. Richting uit J2000-coördinaten.'},
{name:'Pilaren der Schepping',ra:274.701,dec:-13.807,distance:6500,type:'Adelaarsnevel · M16',image:'assets/pillars.png',fact:'Gas- en stofkolommen worden door jonge sterren uitgehold. Webb toont hier nabij-infraroodlicht.'},
{name:'Carinanevel',ra:159.2458,dec:-58.6167,distance:7600,type:'NGC 3324 · Cosmic Cliffs',image:'assets/carina.png',fact:'Een wand van gas, weggeblazen door de straling en wind van zware jonge sterren.'},
{name:'Andromeda',ra:10.6847,dec:41.269,distance:2500000,type:'Sterrenstelsel · M31',image:'assets/andromeda.jpg',fact:'Het licht in dit telescoopbeeld begon zijn reis ongeveer 2,5 miljoen jaar geleden.'},
{name:'Sagittarius A*',ra:266.4168,dec:-29.0078,distance:26000,type:'Superzwaar zwart gat',fact:'Het centrale zwarte gat van de Melkweg bevat ongeveer vier miljoen zonsmassa’s.'}
];
