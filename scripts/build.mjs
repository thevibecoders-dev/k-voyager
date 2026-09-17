import { build } from 'esbuild';
await build({entryPoints:['src/explorer.js'],bundle:true,format:'esm',target:'es2022',minify:true,outfile:'dist/explorer.js',legalComments:'linked'});
