import fs from 'node:fs';
const revision=process.argv[2];
if(!/^[a-f0-9]{40}$/.test(revision||''))throw Error('Expected full commit SHA');
fs.writeFileSync('dist/release.json',JSON.stringify({app:'k-voyager',revision})+'\n');
