"use strict";
const REPO="https://github.com/Maximilian-Andrew-Kluge/VpMobile24";
const THEMES=[{"id":"ha_default","name":"HA Standard"},{"id":"navy","name":"Standard (Dunkel)"},{"id":"graphite","name":"Anthrazit"},{"id":"ocean_blue","name":"Ozeanblau"},{"id":"deep_purple","name":"Violett"},{"id":"forest_green","name":"Waldgrün"},{"id":"ruby","name":"Rubinrot"},{"id":"sunset","name":"Sonnenuntergang"},{"id":"deep_teal","name":"Petrol"},{"id":"dark_rose","name":"Rosé Dunkel"},{"id":"light","name":"Standard (Hell)"},{"id":"sky_blue","name":"Himmelblau"},{"id":"fresh_green","name":"Frühlingsgrün"},{"id":"soft_purple","name":"Lavendel"},{"id":"soft_rose","name":"Rosé Hell"},{"id":"warm_orange","name":"Herbst"}];
const $=s=>document.querySelector(s);
const state={view:"week",device:"desktop"};
const theme=$("#cardTheme"), title=$("#cardTitle"), entity=$("#cardEntity"), second=$("#secondEntity");
const defaults={week:{title:"Stundenplan",entity:"sensor.vpmobile24_week_table"},current:{title:"Aktueller Unterricht",entity:"sensor.vpmobile24_aktueller_unterricht"},multi:{title:"Stundenplan Übersicht",entity:"sensor.vpmobile24_week_table"},holiday:{title:"Stundenplan",entity:"sensor.vpmobile24_week_table"}};
const descriptions={week:"Eine Woche, fünf Tage und alle Änderungen. Klicke auf eine Unterrichtsstunde, um die Details zu sehen.",current:"Die Originalkarte für die aktuelle Stunde mit Fach, Raum und verbleibender Zeit. Die Demo verwendet eine Beispielstunde passend zur aktuellen Uhrzeit.",multi:"Zwei Klassen in einer Ansicht. Öffne die einzelnen Klassen und wechsle zwischen den Wochen.",holiday:"Die Ferienansicht der Originalkarte. Ferienname und Enddatum sind hier frei gewählte Beispieldaten."};
THEMES.forEach(t=>{const o=document.createElement("option");o.value=t.id;o.textContent=t.name;theme.append(o)});theme.value="navy";
function getConfig(){
 const base={type:"custom:vpmobile24-card",entity:entity.value.trim()||defaults[state.view].entity,theme:theme.value};
 if(state.view==="multi")return {type:"custom:vpmobile24-multi-card",entities:[base.entity,second.value.trim()||"sensor.vpmobile24_week_table_7b"],title:title.value,theme:theme.value,default_expanded:true,show_week_nav:true,show_legend:true};
 if(state.view==="current")return {...base,type:"custom:vpmobile24-current-card",next_entity:"sensor.vpmobile24_naechste_stunde",week_entity:"sensor.vpmobile24_week_table",title:title.value,show_progress:true,show_countdown:true,show_next:true};
 return {...base,header_settings:{title:title.value},show_header:true,show_time:true,highlight_today:true};
}
function yaml(value,depth=0){const pad="  ".repeat(depth);return Object.entries(value).map(([k,v])=>{
 if(Array.isArray(v))return pad+k+":\n"+v.map(item=>pad+"  - "+JSON.stringify(item)).join("\n");
 if(v&&typeof v==="object")return pad+k+":\n"+yaml(v,depth+1);
 return pad+k+": "+(typeof v==="string"?JSON.stringify(v):String(v));
}).join("\n")}
function notify(text){const el=$("#toast");el.textContent=text;el.classList.add("visible");clearTimeout(notify.timer);notify.timer=setTimeout(()=>el.classList.remove("visible"),3500)}
function sendPreview(){const f=$("#cardPreview");if(f.contentWindow)f.contentWindow.postMessage({kind:"vpm-preview-config",view:state.view,config:getConfig()},location.origin)}
function update(){ $("#yamlOutput").textContent=yaml(getConfig());sendPreview()}
function setView(view,focus=false){
 if(!defaults[view])return;
 state.view=view;title.value=defaults[view].title;entity.value=defaults[view].entity;
 document.querySelectorAll("[data-view]").forEach(b=>{const selected=b.dataset.view===view;b.setAttribute("aria-selected",String(selected));b.tabIndex=selected?0:-1;if(selected&&focus)b.focus()});
 $("#cardPanel").setAttribute("aria-labelledby","tab-"+view);
 $("#secondEntityField").hidden=view!=="multi";
 $("#viewDescription").textContent=descriptions[view];update()
}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
$(".showcase-tabs").addEventListener("keydown",e=>{
 const tabs=[...document.querySelectorAll("[data-view]")];let index=tabs.indexOf(document.activeElement);if(index<0)return;
 if(e.key==="ArrowRight")index=(index+1)%tabs.length;else if(e.key==="ArrowLeft")index=(index-1+tabs.length)%tabs.length;else if(e.key==="Home")index=0;else if(e.key==="End")index=tabs.length-1;else return;
 e.preventDefault();setView(tabs[index].dataset.view,true)
});
[theme,title,entity,second].forEach(el=>el.addEventListener("input",update));
document.querySelectorAll("[data-device]").forEach(b=>b.addEventListener("click",()=>{
 state.device=b.dataset.device;$("#frameWrap").classList.toggle("mobile",state.device==="mobile");
 document.querySelectorAll("[data-device]").forEach(x=>{const on=x===b;x.classList.toggle("selected",on);x.setAttribute("aria-pressed",String(on))})
}));
document.querySelectorAll("[data-jump-view]").forEach(a=>a.addEventListener("click",()=>setView(a.dataset.jumpView)));
async function copy(text){try{await navigator.clipboard.writeText(text);notify("In die Zwischenablage kopiert.");return true}catch(e){notify("Kopieren war nicht möglich. Markiere den Text oder lade die YAML-Datei herunter.");return false}}
$("#copyYaml").addEventListener("click",()=>copy($("#yamlOutput").textContent));
document.querySelectorAll(".copy-repo").forEach(b=>b.addEventListener("click",()=>copy(REPO)));
$("#downloadYaml").addEventListener("click",()=>{
 const url=URL.createObjectURL(new Blob([$("#yamlOutput").textContent+"\n"],{type:"application/yaml;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="vpmobile24-"+state.view+".yaml";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
});
const menu=$("#menuToggle"),nav=$("#navigation");
function closeMenu(){nav.classList.remove("open");menu.setAttribute("aria-expanded","false");menu.setAttribute("aria-label","Menü öffnen")}
menu.addEventListener("click",()=>{const on=menu.getAttribute("aria-expanded")!=="true";nav.classList.toggle("open",on);menu.setAttribute("aria-expanded",String(on));menu.setAttribute("aria-label",on?"Menü schließen":"Menü öffnen")});
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));document.addEventListener("keydown",e=>{if(e.key==="Escape"&&nav.classList.contains("open")){closeMenu();menu.focus()}});
document.querySelector('a[href="#automationExample"]').addEventListener("click",()=>$("#automationExample").open=true);
window.addEventListener("message",e=>{
 if(e.origin!==location.origin||!e.data)return;
 const frames=[$("#heroPreview"),$("#cardPreview")];const frame=frames.find(f=>f.contentWindow===e.source);if(!frame)return;
 if(e.data.kind==="vpm-preview-height"&&Number.isFinite(e.data.height))frame.style.height=Math.min(2400,Math.max(180,e.data.height))+"px";
 if(e.data.kind==="vpm-preview-ready"&&frame.id==="cardPreview")sendPreview();
 if(e.data.kind==="vpm-preview-action")notify("Die Vorschau verwendet Beispieldaten. In Home Assistant führt dieser Button die entsprechende Aktion aus.")
});
$("#cardPreview").addEventListener("load",sendPreview);update();
fetch("https://api.github.com/repos/Maximilian-Andrew-Kluge/VpMobile24/releases?per_page=20").then(r=>{if(!r.ok)throw Error("releases");return r.json()}).then(releases=>{
 if(!Array.isArray(releases))return;
 const stable=releases.find(r=>!r.draft&&!r.prerelease), beta=releases.find(r=>!r.draft&&r.prerelease);
 for(const [name,rel] of [["stable",stable],["beta",beta]]){if(!rel)continue;const url=new URL(rel.html_url);if(url.origin!=="https://github.com")continue;$("#"+name+"Version").textContent=rel.tag_name;$("#"+name+"Release").href=url.href;if(name==="beta")$("#betaNotesLink").href=url.href}
}).catch(()=>{});
