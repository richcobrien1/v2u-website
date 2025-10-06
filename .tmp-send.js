(async()=>{
  try{
    const base='http://localhost:3000';
    const email='test+ci@v2u.us';
    console.log('Sending subscribe POST for', email);
    const resp=await fetch(base+'/api/subscribe',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email})
    });
    console.log('HTTP',resp.status);
    const txt=await resp.text();
    console.log('BODY:',txt);
  }catch(e){
    console.error('ERROR',e);
  }
  process.exit(0);
})();
