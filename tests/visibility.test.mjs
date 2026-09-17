import test from 'node:test';
import assert from 'node:assert/strict';
import {ShaderLib} from 'three';
import {sphereBlocksSegment,rectOverlapsDisc,roundPointShader} from '../src/visibility.js';
test('Labels behind a planet are hidden, foreground and side labels remain',()=>{
 assert.equal(sphereBlocksSegment([0,0,0],[0,0,-10],[0,0,-5],2),true);
 assert.equal(sphereBlocksSegment([0,0,0],[0,0,-2],[0,0,-5],2),false);
 assert.equal(sphereBlocksSegment([0,0,0],[8,0,-10],[0,0,-5],2),false);
 assert.equal(sphereBlocksSegment([0,0,0],[0,0,-10],[0,0,5],2),false);
});
test('Occlusion works at true AU scale and for partial text overlap',()=>{
 assert.equal(sphereBlocksSegment([0,0,0],[0,0,-.01],[0,0,-.005],.002),true);
 const rect={left:100,right:180,top:90,bottom:110};
 assert.equal(rectOverlapsDisc(rect,{x:185,y:100,radius:10}),true);
 assert.equal(rectOverlapsDisc(rect,{x:195,y:100,radius:10}),false);
});
test('Round point shader discards square corners and retains logarithmic depth',()=>{
 const shader={fragmentShader:ShaderLib.points.fragmentShader};roundPointShader(shader);
 assert.match(shader.fragmentShader,/pointRadius >= 0.5\) discard/);
 assert.match(shader.fragmentShader,/smoothstep\(0.22, 0.5, pointRadius\)/);
 assert.match(shader.fragmentShader,/#include <logdepthbuf_fragment>/);
});
