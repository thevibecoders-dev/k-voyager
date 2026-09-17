import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AU,DAY,position,moonOffset,modelMoon,displayPosition,starPosition,period} from '../src/ephemeris.js';
import {bodies,moons} from '../src/bodies.js';
const date=new Date('2026-09-17T00:00:00Z');
test('Earth agrees with independent JPL Horizons DE441 fixture within 0.0003 AU',()=>{
 // Horizons: Earth(399), Sun(10), geometric, ecliptic J2000, 2026-09-17 00:00 TDB.
 // The UTC/TDB offset (~70s) is below this educational-model tolerance.
 const ref=[.9993145538976742,.000003506590807943129,.1091754988883263];
 const got=position('Earth',date);assert.ok(Math.hypot(...got.map((x,i)=>x-ref[i]))<.0003);
});
test('All planets produce finite heliocentric positions and periods',()=>{
 for(const b of bodies){assert.ok(position(b.id,date).every(Number.isFinite));if(b.id!=='Sun')assert.ok(period(b.id)>0);}
 assert.ok(Math.hypot(...position('Earth',date))>.98);
 assert.ok(Math.hypot(...position('Earth',date))<1.02);
});
test('Minute-by-minute Earth motion is plausible',()=>{
 const p=position('Earth',date),q=position('Earth',new Date(+date+60000));
 const km=Math.hypot(...p.map((x,i)=>x-q[i]))*AU;assert.ok(km>1600&&km<2000);
});
test('Moon and Galilean distances use AU offsets, not absolute coordinates',()=>{
 for(const m of moons.filter(x=>x.ephemeris)){
 const km=Math.hypot(...moonOffset(m.id,date))*AU;
 assert.ok(km>m.distance*.8&&km<m.distance*1.2,m.id+': '+km);
 }
});
test('Illustrative moons are finite and progress with time',()=>{
 for(const m of moons.filter(x=>!x.ephemeris)){const p=modelMoon(m,date),q=modelMoon(m,new Date(+date+DAY/10));assert.ok(p.every(Number.isFinite));assert.notDeepEqual(p,q);}
});
test('Physical scale preserves AU and distance ratios',()=>{
 assert.deepEqual(displayPosition([1,0,0],true),[100,0,0]);
 assert.deepEqual(displayPosition([0,0,0]),[0,0,0]);
 assert.ok(Math.abs(Math.hypot(...starPosition(45,70,10))-10)<1e-9);
});
test('Star catalog has finite coordinates and correctly decoded names',()=>{
 const {stars}=JSON.parse(fs.readFileSync('dist/data/stars.json','utf8'));
 assert.equal(stars.length,25791);assert.ok(stars.some(s=>s.name==='Sirius'));
 for(const s of stars){assert.ok(!s.name.includes('"'));for(const k of ['x','y','z','vx','vy','vz','mag'])assert.ok(Number.isFinite(s[k]),s.id+' '+k);}
});
test('All configured surface assets exist locally',()=>{
 for(const f of ['8k_earth_daymap.jpg','8k_mars.jpg','8k_jupiter.jpg','8k_saturn.jpg','2k_saturn_ring_alpha.png','2k_earth_nightmap.jpg','2k_earth_clouds.jpg','2k_sun.jpg','2k_mercury.jpg','2k_venus_atmosphere.jpg','2k_uranus.jpg','2k_neptune.jpg','2k_moon.jpg'])assert.ok(fs.statSync('dist/assets/planets/'+f).size>1000);
});
