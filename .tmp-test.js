(async()=>{
  const base='http://localhost:3000';
  const out=async(path,opts)=>{
    try{
      const r=await fetch(base+path,opts);
      console.log('\n==',path,'->',r.status);
      const txt=await r.text();
      console.log(txt.slice(0,3000));
    }catch(e){console.error(path,'err',e)}
  };

  await out('/api/episodes');
  await out('/api/admin/email-template');
  const token=process.env.ADMIN_ONBOARD_TOKEN;
  if(token){ await out('/api/admin/email-template?history=1',{headers:{'x-admin-onboard-token':token}}); }
  else { console.log('\nADMIN_ONBOARD_TOKEN not set — skipping authenticated admin call'); }
  await out('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`test+ci_${Date.now()}@v2u.us`})});
  
  process.exit(0);
})();
