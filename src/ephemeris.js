import * as A from 'astronomy-engine';
export const AU=149597870.7, DAY=86400000;
const rot=A.Rotation_EQJ_ECL();
export function ecliptic(v){const p=A.RotateVector(rot,v);return [p.x,p.z,-p.y];}
export function position(id,date){return ecliptic(A.HelioVector(id,date));}
export function moonOffset(id,date){return id==='Moon'?ecliptic(A.GeoMoon(date)):ecliptic(A.JupiterMoons(date)[id.toLowerCase()]);}
export function starPosition(ra,dec,distance=1){const a=ra*Math.PI/180,b=dec*Math.PI/180;return ecliptic(new A.Vector(distance*Math.cos(b)*Math.cos(a),distance*Math.cos(b)*Math.sin(a),distance*Math.sin(b),new A.AstroTime(0)));}
export function displayPosition(p,physical=false){if(physical)return p.map(x=>x*100);const d=Math.hypot(...p);return d?p.map(x=>x/d*28*Math.log1p(d*2)):p;}
export function axis(id,date){return A.RotationAxis(id,date);}
export function period(id){return A.PlanetOrbitalPeriod(id);}
export function modelMoon(m,date){const phase=(date.getTime()/DAY/m.period+m.phase)*Math.PI*2;return [Math.cos(phase)*m.distance/AU,Math.sin(phase)*m.distance/AU*.05,Math.sin(phase)*m.distance/AU];}
