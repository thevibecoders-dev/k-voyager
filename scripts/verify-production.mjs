const revision=process.argv[2];
const origin='https://k-voyager.thevibecoders.app';
for(let attempt=0;attempt<12;attempt++){
 try{
  const r=await fetch(origin+'/release.json?revision='+revision,{signal:AbortSignal.timeout(15000)});
  if(!r.ok||(await r.json()).revision!==revision)throw Error('Release mismatch');
  break;
 }catch(e){if(attempt===11)throw e;await new Promise(r=>setTimeout(r,5000));}
}
for(const [url,expected] of [[origin+'/',200],[origin+'/explorer.js',200],[origin+'/assets/planets/8k_earth_daymap.jpg',200],['https://kido.thevibecoders.app/api/health',200],['https://kidsquest.thevibecoders.app/',301],['https://vibeveilig.thevibecoders.app/',200],['https://beatframe.thevibecoders.app/',401]]){
 const r=await fetch(url,{method:'HEAD',redirect:'manual',signal:AbortSignal.timeout(20000)});
 if(r.status!==expected)throw Error(url+': expected '+expected+', got '+r.status);
 console.log(r.status,url);
}
console.log('Public release verified:',revision);
