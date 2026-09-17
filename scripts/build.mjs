import { build } from 'esbuild';
await build({entryPoints:['src/explorer.js','src/expedition.js'],bundle:true,format:'esm',target:'es2022',minify:true,outdir:'dist',legalComments:'linked'});
