const {chromium}=require('playwright');
const fs=require('fs');const assert=require('assert');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {}),args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1100,height:1000}});let errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setContent('<style>body{margin:20px}vpmobile24-card{display:block;width:500px}</style>');
 await page.addScriptTag({content:"customElements.define('ha-card',class extends HTMLElement{connectedCallback(){this.style.display='block'}})"});
 await page.addScriptTag({content:fs.readFileSync(process.env.BUNDLE||require('path').join(__dirname,'../../custom_components/vpmobile24/vpmobile24-card.js'),'utf8')});
 await page.evaluate(()=>{
  const week={};for(const d of ['monday','tuesday','wednesday','thursday','friday'])week[d]={1:{fach:'PH',zeit:'08:00-08:45',lehrer:'STM',raum:'1-03'},2:{fach:'DE',zeit:'08:50-09:35'},3:{fach:'EN',zeit:'10:00-10:45'},4:{fach:'MA',zeit:'10:45-11:30'}};
  window.card=document.createElement('vpmobile24-card');document.body.append(card);card.setConfig({entity:'sensor.x',theme:'ha_default'});
  window.ha={themes:{darkMode:false},states:{'sensor.x':{state:'x',attributes:{week_table:week,next_week_table:week,class:'09f'}}}};
 });
 for(const width of [1100,390])for(const dark of [false,true,false]){
  await page.setViewportSize({width,height:1000});
  await page.evaluate(width=>card.style.width=width===390?'350px':'500px',width);
  await page.evaluate(dark=>{document.body.style.cssText=`--ha-card-background:${dark?'#202020':'#fff'};--primary-text-color:${dark?'#fff':'#212121'};--secondary-text-color:${dark?'#bbb':'#757575'};--secondary-background-color:#252535;--divider-color:transparent;--ha-card-border-color:transparent;--primary-color:#517bb8`;ha.themes={darkMode:dark};card.hass=ha},dark);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const result=await page.evaluate(async()=>{
   let mutations=0;const observer=new MutationObserver(ms=>mutations+=ms.length);observer.observe(card,{attributes:true,attributeFilter:['style']});
   const samples=[];for(let i=0;i<90;i++){
    card.hass={...ha,states:{...ha.states,'sensor.unrelated':{state:String(i),attributes:{}}}};
    await new Promise(requestAnimationFrame);
    const tile=card.shadowRoot.querySelector('.vp-tile-clickable');const style=getComputedStyle(tile);
    samples.push([style.backgroundColor,style.color].join('|'));
   }
   observer.disconnect();return {mutations,colors:[...new Set(samples)]};
  });
  assert.equal(result.colors.length,1,JSON.stringify(result));assert.equal(result.mutations,0,'stable updates reset live colors: '+JSON.stringify(result));
  await page.locator('.vp-tile-clickable:visible, .vp-mob-clickable:visible').first().click();
  await page.evaluate(()=>new Promise(requestAnimationFrame));
  const borders=await page.evaluate(()=>['.vp-hdr','.vp-legend','.vp-popup-title','.vp-popup-footer'].map(s=>{const el=card.shadowRoot.querySelector(s),st=getComputedStyle(el);return {s,top:st.borderTopWidth,bottom:st.borderBottomWidth,color:st.borderTopWidth!=='0px'?st.borderTopColor:st.borderBottomColor,bg:st.backgroundColor}}));
  for(const border of borders){assert(border.top!=='0px'||border.bottom!=='0px',JSON.stringify(border));assert(!border.color.includes('rgba'),JSON.stringify(border));}
  await page.screenshot({path:dark?'popup-dark.png':'popup-light.png'});
  await page.locator('.vp-popup-btn:visible').first().click();
  await page.screenshot({path:dark?'card-dark.png':'card-light.png'});
  console.log(JSON.stringify({width,dark,frames:90,...result,borders}));
 }
 assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
