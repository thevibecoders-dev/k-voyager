import fs from 'node:fs';
const lines=fs.readFileSync('work/hyg.csv','utf8').trim().split('\n');
const header=lines.shift().trim().split(',').map(x=>x.replaceAll('"',''));
const result=[];
for(const line of lines){const v=(line.match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g)||[]).map(x=>x.replace(/,$/,'').replace(/^"|"$/g,'').replaceAll('""','"'));const p=Object.fromEntries(header.map((k,i)=>[k,v[i]]));if(+p.id===0||+p.mag>7.5)continue;result.push({id:+p.id,name:p.proper||p.bf||`HIP ${p.hip}`,ra:+p.ra*15,dec:+p.dec,mag:+p.mag,dist:+p.dist,ci:p.ci?+p.ci:.6,x:+p.x,y:+p.y,z:+p.z,vx:+p.vx,vy:+p.vy,vz:+p.vz});}
fs.writeFileSync('dist/data/stars.json',JSON.stringify({credit:'David Nash / Astronomy Nexus, HYG v4.1; filtered mag <= 7.5',license:'CC BY-SA 4.0',source:'https://github.com/astronexus/HYG-Database',epoch:2000,stars:result}));console.log(result.length+' real catalog stars');
