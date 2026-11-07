// Requires playwright and its Chromium browser. Run: node tests/frontend/theme-contrast.cjs
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {}),headless:true,args:['--no-sandbox']});const page=await b.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent('<style>ha-card{display:block}body{margin:12px}</style><body></body>');await page.addScriptTag({content:fs.readFileSync(require('path').join(__dirname,'../../custom_components/vpmobile24/vpmobile24-card.js'),'utf8')+';window.Card=VpMobile24Card;'});
const themes=await page.evaluate(()=>Object.keys(Card._THEMES));let count=0;let failed=[];
for(const kind of ['vpmobile24-card','vpmobile24-multi-card','vpmobile24-current-card'])for(const width of [390,1280])for(const dark of [false,true,"mixed-light"])for(const theme of themes){await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme:dark===true?'dark':'light'});const result=await page.evaluate(async({theme,dark,kind})=>{
 document.body.innerHTML='';document.body.style.cssText=`--primary-background-color:${dark===true?'#111':'#fafafa'};--ha-card-background:${dark===true?'#1c1c1c':'#fff'};--card-background-color:${dark===true?'#1c1c1c':'#fff'};--secondary-background-color:${dark?'#282828':'#eee'};--primary-text-color:${dark?'#fff':'#212121'};--secondary-text-color:${dark?'#999':'#727272'};--disabled-text-color:#999;--primary-color:#03a9f4;`;
 const c=document.createElement(kind);document.body.append(c);const week={};for(const d of ['monday','tuesday','wednesday','thursday','friday'])week[d]={'1':{fach:'Mathe',lehrer:'AB',raum:'1',zeit:'08:00-08:45'},'2':{fach:'Deutsch',lehrer:'CD',raum:'2',zeit:'08:50-09:35'}};
 c.setConfig({entity:'sensor.test',entities:['sensor.test'],theme});c.hass={language:'de',themes:{darkMode:dark===true},states:{'sensor.test':{state:'OK',attributes:{week_table:week,next_week_table:week,class:'09f'}}}};
 await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 const probe=document.createElement('span');c.shadowRoot.append(probe);const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 const read=t=>{probe.style.color=`var(--vpm-${t})`;ctx.clearRect(0,0,1,1);ctx.fillStyle=getComputedStyle(probe).color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};
 const lum=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((v,x,i)=>v+x*[.2126,.7152,.0722][i],0);
 const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
 const bad=[];for(const t of ['text','text-muted','text-faint','primary','success','warning','error'])if(ratio(read(t),read('card'))<4.45)bad.push(t);
 probe.remove();return {bad,rendered:!!c.shadowRoot.querySelector('ha-card')};
 },{theme,dark,kind});count++;if(result.bad.length||!result.rendered)failed.push({width,dark,theme,...result});}
console.log(JSON.stringify({count,failed,errors}));await b.close();if(failed.length||errors.length)process.exitCode=1;})();
