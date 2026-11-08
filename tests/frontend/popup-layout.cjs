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

 for (const width of [390,1100]) for (const dark of [false,true]) {
  await page.setViewportSize({width,height:850});
  await page.evaluate(({width,dark})=>{
   card.style.width=width===390?'350px':'500px';
   document.body.style.cssText=`--ha-card-background:${dark?'#202020':'#fff'};--primary-text-color:${dark?'#fff':'#212121'};--secondary-text-color:${dark?'#bbb':'#757575'};--secondary-background-color:#252535;--divider-color:transparent;--primary-color:#517bb8`;
   ha.themes={darkMode:dark};ha.language='de';card.hass=ha;
  },{width,dark});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  for(const kind of ['normal','sub','cancel','info']) {
   await page.evaluate(kind=>{
    card._closePopup();card._closeInfoPopup();
    if(kind==='info'){
     card._config.additional_info_entity='sensor.info';card._weekOffset=0;
     card._hass.states['sensor.info']={attributes:{week_infos:{wednesday:{allgemeine_infos:['Heute Unterricht nach Kurzplan.','Bitte die Unterlagen mitbringen. <Hinweis>','Mehrzeiliger Hinweis.\nWeitere Angaben für den Unterricht.']}}}};
     card._showInfoPopup('wednesday');
    } else card._showLessonDetail({fach:kind==='cancel'?'---':'Physik',lehrer:'STM',raum:'1-03',klasse:'09f',zeit:'08:00-08:45',zusatzinfo:'Bitte das Arbeitsheft mitbringen.\nTreffpunkt vor dem Fachraum.',ist_vertretung:kind==='sub'},'Montag',1,'08:00-08:45',kind==='cancel');
   },kind);
   const result=await page.evaluate(kind=>{
    const popup=card.shadowRoot.getElementById(kind==='info'?'info-popup':'popup'),r=popup.getBoundingClientRect(),btn=popup.querySelector('.vp-popup-btn').getBoundingClientRect();
    return {text:popup.textContent,inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,button:btn.bottom<=innerHeight,overflow:popup.scrollWidth>popup.clientWidth+1};
   },kind);
   assert(result.inside&&result.button&&!result.overflow,JSON.stringify({width,dark,kind,result}));
   assert(result.text.includes(kind==='info'?'Kurzplan':'1-03'));
   if(kind==='info') assert(result.text.includes('<Hinweis>'));
   await page.screenshot({path:`dialog-${kind}-${width}-${dark?'dark':'light'}.png`});
   // Stress long notes: footer must remain reachable in the viewport.
   if(kind==='info') {
    const long=await page.evaluate(()=>{card._hass.states['sensor.info'].attributes.week_infos.wednesday.allgemeine_infos=Array(30).fill('Langer Hinweis mit weiteren Angaben zum Unterricht.');card._renderInfoPopupContent();const c=card.shadowRoot.getElementById('info-popup-content'),b=card.shadowRoot.querySelector('#info-popup .vp-popup-btn').getBoundingClientRect();return {scroll:c.scrollHeight>c.clientHeight,button:b.bottom<=innerHeight};});
    assert(long.scroll&&long.button,JSON.stringify(long));
   }
  }
 }
 assert.deepEqual(errors,[]);console.log('16 dialog layouts, metadata, escaping, long-info scrolling passed.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
