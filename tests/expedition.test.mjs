import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {evidence,stages,safeJournal,addEntry,journalMarkdown,stageIndex,seededRandom} from '../src/expedition-data.js';

test('five openly addressable stages have knowledge labels and valid views',()=>{
 assert.equal(stages.length,5);
 for(const [i,s] of stages.entries()){assert.equal(stageIndex(i),i);assert.ok(s.knowledge);assert.ok(['saturn','ring','enceladus'].includes(s.view));}
 for(const invalid of ['no',99,-1,2.5,Infinity])assert.equal(stageIndex(invalid),0);
});
test('evidence separates measurement, inference and uncertainty, with primary sources',()=>{
 assert.equal(evidence.length,4);assert.equal(new Set(evidence.map(e=>e.id)).size,4);
 for(const e of evidence){assert.ok(e.measured.length>30);assert.ok(e.inferred.length>30);assert.match(e.limit,/leven|leeft|biologie/);assert.match(e.source,/^https:\/\/(www\.nasa\.gov|science\.nasa\.gov)\//);}
});
test('malformed or oversized local journals cannot inject sources or unbounded records',()=>{
 assert.deepEqual(safeJournal(null),{version:1,entries:[],reflection:''});
 const j=safeJournal({version:1,entries:Array.from({length:100},()=>({title:'a'.repeat(300),text:'b'.repeat(4000),source:'javascript:alert(1)',id:'x'})),reflection:'x'.repeat(4000)});
 assert.equal(j.entries.length,80);assert.equal(j.entries[0].title.length,160);assert.equal(j.entries[0].text.length,2000);assert.equal(j.entries[0].source,'');assert.equal(j.reflection.length,3000);
});
test('journal deduplicates evidence and exports provenance and a personal reflection',()=>{
 const e={id:'ocean',title:'De oceaan',text:'Een afleiding, geen bewijs van leven.',source:evidence[0].source};let j=addEntry(safeJournal(null),e);j=addEntry(j,e);assert.equal(j.entries.length,1);j.reflection='Welke meting verandert mijn idee?';const text=journalMarkdown(j);assert.ok(text.includes(e.source));assert.ok(text.includes(j.reflection));assert.ok(text.includes('reconstructies'));
});
test('illustrative ring sampling is stable across visits',()=>{const a=seededRandom(17),b=seededRandom(17);for(let i=0;i<100;i++){const value=a();assert.equal(value,b());assert.ok(value>=0&&value<1);}});
test('new mission imagery matches the credited files exactly',()=>{
 const manifest=JSON.parse(fs.readFileSync('dist/assets/expedition-credits.json','utf8'));
 for(const asset of manifest.assets){assert.equal(crypto.createHash('sha256').update(fs.readFileSync('dist/assets/'+asset.file)).digest('hex').toUpperCase(),asset.sha256);}
});
test('new entrypoint retains the free explorer and atlas, all direct assets exist',()=>{
 for(const path of ['dist/index.html','dist/explore.html','dist/atlas.html']){
  const html=fs.readFileSync(path,'utf8');
  for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
   if(/^(https?:|data:|#|\.\/)/.test(url))continue;
   assert.ok(fs.existsSync('dist/'+url.split('?')[0]),`${path} references ${url}`);
  }
 }
 assert.match(fs.readFileSync('dist/index.html','utf8'),/href="explore.html"/);
});
