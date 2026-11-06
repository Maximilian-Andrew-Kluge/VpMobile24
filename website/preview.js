"use strict";
// Only the surrounding Home Assistant data is simulated.
// Rendering, interactions and styles come from the integration's unmodified card file.
if(!customElements.get("ha-card"))customElements.define("ha-card",class extends HTMLElement{connectedCallback(){this.style.display="block"}});
const root=document.getElementById("cardRoot"),notice=document.getElementById("previewNotice");
const viewParam=new URLSearchParams(location.search).get("view");
let currentElement=null;
function stamp(m){m=Math.max(0,Math.min(1439,m));return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0")}
function sampleWeek(second=false){
 const days=["monday","tuesday","wednesday","thursday","friday"],subjects=second?["EN","MA","KU","GE","SPO","DE"]:["MA","DE","EN","PH","GEO","SPO"];
 const times=["07:45-08:30","08:40-09:25","09:25-10:10","10:35-11:20","11:30-12:15","12:45-13:30","13:40-14:25","14:35-15:20"];
 const week={};
 days.forEach((day,di)=>{week[day]={};for(let n=1;n<=6;n++){week[day][String(n)]={fach:subjects[(n-1+di)%subjects.length],lehrer:["Mü","Sch","We","Kr"][(di+n)%4],raum:String(101+di*10+n),klasse:second?"7b":"10a",zeit:times[n-1],stunde:n,ist_vertretung:false,zusatzinfo:""}}
 });
 week.tuesday["3"]={...week.tuesday["3"],ist_vertretung:true,zusatzinfo:"Vertretung · Raumänderung",raum:"204"};
 week.thursday["5"]={...week.thursday["5"],fach:"---",ist_ausfall:true,zusatzinfo:"Entfällt"};
 week.friday["6"]={...week.friday["6"],fach:"---",ist_ausfall:true,zusatzinfo:"Entfällt"};
 return week
}
function makeHass(config,view){
 const now=new Date(),mins=now.getHours()*60+now.getMinutes(),start=stamp(mins-18),end=stamp(mins+27);
 const current={fach:"Mathematik",lehrer:"Mü",raum:"201",stunde:3,zeit:start+"-"+end,zeit_start:start,zeit_ende:end,ist_ausfall:false,ist_vertretung:false,zusatzinfo:""};
 const next={fach:"Deutsch",lehrer:"Sch",raum:"103",stunde:4,zeit:stamp(mins+42)+"-"+stamp(mins+87)};
 const one=sampleWeek(),two=sampleWeek(true);
 const states={};const add=(id,state,attributes)=>{states[id]={entity_id:id,state,attributes,last_changed:now.toISOString(),last_updated:now.toISOString()}};
 const weekAttrs=(week,second=false)=>({class:second?"7b":"10a",friendly_name:"VpMobile24 – "+(second?"7b":"10a"),week_table:week,next_week_table:week,next_next_week_table:week,stunden_heute:[current,next],wochentyp:"A"});
 add("sensor.vpmobile24_week_table","OK",weekAttrs(one));add("sensor.vpmobile24_week_table_7b","OK",weekAttrs(two,true));
 add("sensor.vpmobile24_aktueller_unterricht","Mathematik",current);add("sensor.vpmobile24_naechste_stunde","Deutsch",next);
 const holiday={ist_ferien:view==="holiday",end:new Date(now.getTime()+7*86400000).toISOString().slice(0,10)};
 add("sensor.vpmobile24_ferien",view==="holiday"?"Ferien · Beispiel":"Keine Ferien",holiday);
 add("sensor.vpmobile24_zusatzinfos","1",{week_infos:{monday:{allgemeine_infos:["Hinweis: Projektwoche (Beispiel)"],stunden_infos:[]}},allgemeine_infos:["Projektwoche (Beispiel)"],stunden_infos:[]});
 if(config.entities)config.entities.forEach((id,i)=>add(id,"OK",weekAttrs(i?two:one,!!i)));
 else if(view==="current"){add(config.entity,"Mathematik",current);if(config.week_entity)add(config.week_entity,"OK",weekAttrs(one));if(config.next_entity)add(config.next_entity,"Deutsch",next)}
 else add(config.entity,"OK",weekAttrs(one));
 if(config.holiday_entity)add(config.holiday_entity,view==="holiday"?"Ferien · Beispiel":"Keine Ferien",holiday);
 if(config.additional_info_entity)add(config.additional_info_entity,"1",states["sensor.vpmobile24_zusatzinfos"].attributes);
 return {states,language:"de",locale:{language:"de",time_format:"24",date_format:"DMY"},themes:{darkMode:false},user:{name:"Demo"},callService:async()=>parent.postMessage({kind:"vpm-preview-action"},location.origin)}
}
function height(){const h=Math.ceil(Math.max(root.getBoundingClientRect().height,notice.hidden?0:notice.getBoundingClientRect().height)+16);parent.postMessage({kind:"vpm-preview-height",height:h},location.origin)}
async function show(view,config){
 const tag=view==="current"?"vpmobile24-current-card":view==="multi"?"vpmobile24-multi-card":"vpmobile24-card";
 try{
  if(!customElements.get(tag)){notice.hidden=false;notice.textContent="Die Originalkarte konnte nicht geladen werden. Bitte lade die Seite erneut.";height();return}
  const el=document.createElement(tag);const cfg={...config};
  delete cfg.type;
  if(view==="holiday")cfg.holiday_entity="sensor.vpmobile24_ferien";
  if(view==="week")cfg.additional_info_entity="sensor.vpmobile24_zusatzinfos";
  el.setConfig(cfg);root.replaceChildren(el);currentElement=el;
  el.hass=makeHass(cfg,view);notice.hidden=true;requestAnimationFrame(height)
 }catch(e){root.replaceChildren();notice.hidden=false;notice.textContent="Die Vorschau konnte nicht geladen werden. Prüfe die Konfiguration oder lade die Seite erneut.";height();console.error("VpMobile24 preview",e)}
}
window.addEventListener("message",e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.kind!=="vpm-preview-config")return;const v=e.data.view;if(!["week","current","multi","holiday"].includes(v)||!e.data.config||typeof e.data.config!=="object")return;show(v,e.data.config)});
new ResizeObserver(height).observe(root);
const initial=viewParam==="current"?"current":"week";
show(initial,initial==="current"?{entity:"sensor.vpmobile24_aktueller_unterricht",next_entity:"sensor.vpmobile24_naechste_stunde",week_entity:"sensor.vpmobile24_week_table",theme:"navy"}:{entity:"sensor.vpmobile24_week_table",theme:"navy",header_settings:{title:"Stundenplan",class_name:"10a"}});
parent.postMessage({kind:"vpm-preview-ready"},location.origin);
