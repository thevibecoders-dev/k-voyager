// Analytic line-of-sight check, independent of GPU/DOM rendering.
export function sphereBlocksSegment(origin,target,center,radius){
 const d=target.map((v,i)=>v-origin[i]),c=center.map((v,i)=>v-origin[i]);
 const length=Math.hypot(...d);if(!length)return false;
 const along=c.reduce((sum,v,i)=>sum+v*d[i]/length,0);
 const perpendicular=c.reduce((sum,v)=>sum+v*v,0)-along*along;
 if(perpendicular>radius*radius)return false;
 const half=Math.sqrt(Math.max(0,radius*radius-perpendicular));
 return along+half>0&&along-half<length&&along-half>0;
}
export function rectOverlapsDisc(rect,disc){
 const x=Math.max(rect.left,Math.min(disc.x,rect.right));
 const y=Math.max(rect.top,Math.min(disc.y,rect.bottom));
 return (x-disc.x)**2+(y-disc.y)**2<=disc.radius**2;
}
// Keep Three's standard depth / logarithmic-depth chunks; only mask point corners.
export function roundPointShader(shader){
 shader.fragmentShader=shader.fragmentShader.replace('#include <map_particle_fragment>',`#include <map_particle_fragment>
 float pointRadius = length(gl_PointCoord - vec2(0.5));
 if (pointRadius >= 0.5) discard;
 diffuseColor.a *= 1.0 - smoothstep(0.22, 0.5, pointRadius);`);
}
