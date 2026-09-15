/* ÆZ Arena — guaranteed mobile navigation */
(function(){
'use strict';

var TABS=[
 {key:'home',label:'Home',view:'dashboard',icon:'<path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/>'},
 {key:'activity',label:'Activities',view:'activities',icon:'<path d="M4 18h16"/><path d="M6 15V9"/><path d="M12 15V5"/><path d="M18 15v-3"/>'},
 {key:'post',label:'Post',view:null,icon:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20c.6-4 2.5-6 5.5-6s4.9 2 5.5 6"/><path d="M15 14.5c2.8.2 4.5 2 5 5.5"/>'},
 {key:'social',label:'Social',view:null,icon:'<path d="M7.5 19.5 4 21l1.5-3.5A7.5 7.5 0 1 1 19 12"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>'},
 {key:'profile',label:'Profile',view:'profile',icon:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6"/>'}
];

function style(){
 if(document.getElementById('aezNavGuaranteeStyle'))return;
 var s=document.createElement('style');s.id='aezNavGuaranteeStyle';s.textContent=`
@media(max-width:960px){
 body.authenticated .bottom-nav{display:none!important}
 #aezGuaranteedNav{position:fixed!important;left:6px!important;right:6px!important;bottom:max(6px,env(safe-area-inset-bottom))!important;width:auto!important;height:68px!important;padding:5px!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:3px!important;z-index:2147483000!important;box-sizing:border-box!important;border:1px solid rgba(255,255,255,.11)!important;border-radius:21px!important;background:rgba(19,20,19,.88)!important;box-shadow:0 18px 50px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.075)!important;backdrop-filter:blur(28px) saturate(145%)!important;-webkit-backdrop-filter:blur(28px) saturate(145%)!important}
 #aezGuaranteedNav .aez-g-tab{appearance:none!important;-webkit-appearance:none!important;border:1px solid transparent!important;outline:0!important;border-radius:15px!important;width:100%!important;height:56px!important;padding:4px 2px!important;margin:0!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important;background:transparent!important;color:rgba(235,231,221,.64)!important;font:600 8.5px/1 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;cursor:pointer!important}
 #aezGuaranteedNav .aez-g-tab svg{display:block!important;width:22px!important;height:22px!important;fill:none!important;stroke:currentColor!important;stroke-width:2!important;stroke-linecap:round!important;stroke-linejoin:round!important;flex:none!important}
 #aezGuaranteedNav .aez-g-tab.active{color:#e3c477!important;background:rgba(224,194,122,.12)!important;border-color:rgba(224,194,122,.27)!important}
 #aezGuaranteedNav .aez-g-tab.post{background:rgba(224,194,122,.16)!important;color:#e3c477!important;border-color:rgba(224,194,122,.30)!important}
 #aezGuaranteedNav .aez-g-tab.post svg{width:24px!important;height:24px!important}
}
@media(min-width:961px){#aezGuaranteedNav{display:none!important}}
`;
 document.head.appendChild(s);
}

function findTarget(tab){
 if(tab.key==='social')return document.querySelector('[data-aez-social]');
 if(tab.view)return document.querySelector('[data-view="'+tab.view+'"]');
 return null;
}
function openSocial(){
 var target=findTarget({key:'social'});
 if(target)target.click();
 var panel=document.getElementById('aezSocial');
 if(panel){panel.classList.add('open');panel.style.display='block';}
}
function focusComposer(){
 openSocial();
 setTimeout(function(){
  var el=document.querySelector('#aezSocial textarea,#aezSocial [contenteditable="true"],#aezSocial input[type="text"],#aezSocial .post-composer textarea');
  if(el){el.focus();try{el.scrollIntoView({block:'center',behavior:'smooth'});}catch(e){}}
 },180);
}
function go(tab){
 if(tab.key==='social'){openSocial();return;}
 if(tab.key==='post'){focusComposer();return;}
 var panel=document.getElementById('aezSocial');if(panel){panel.classList.remove('open');panel.style.removeProperty('display');}
 var target=findTarget(tab);
 if(target&&!target.classList.contains('aez-g-tab')){target.click();return;}
 if(typeof window.nav==='function')window.nav({getAttribute:function(n){return n==='data-view'?tab.view:null;}});
}
function activeKey(){
 var panel=document.getElementById('aezSocial');if(panel&&panel.classList.contains('open'))return 'social';
 for(var i=0;i<TABS.length;i++){
  var t=TABS[i],e=findTarget(t);
  if(e&&(e.classList.contains('active')||e.getAttribute('aria-current')==='page'))return t.key;
 }
 return 'home';
}
function build(){
 if(!document.body.classList.contains('authenticated'))return;
 style();
 var nav=document.getElementById('aezGuaranteedNav');
 if(!nav){nav=document.createElement('nav');nav.id='aezGuaranteedNav';nav.setAttribute('aria-label','Primary navigation');document.body.appendChild(nav);}
 TABS.forEach(function(t){
  var b=nav.querySelector('[data-aez-g-tab="'+t.key+'"]');
  if(!b){b=document.createElement('button');b.type='button';b.className='aez-g-tab '+(t.key==='post'?'post':'');b.setAttribute('data-aez-g-tab',t.key);b.setAttribute('aria-label',t.label);b.innerHTML='<svg viewBox="0 0 24 24">'+t.icon+'</svg><span>'+t.label+'</span>';b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();go(t);setActive(t.key);});nav.appendChild(b);}
 });
 setActive(activeKey());
}
function setActive(key){document.querySelectorAll('#aezGuaranteedNav .aez-g-tab').forEach(function(b){var yes=b.getAttribute('data-aez-g-tab')===key;b.classList.toggle('active',yes);b.setAttribute('aria-selected',yes?'true':'false');});}
function run(){build();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
if(window.MutationObserver&&!window.__aezNavGuaranteeObserver){window.__aezNavGuaranteeObserver=true;var timer=false;new MutationObserver(function(){if(timer)return;timer=true;setTimeout(function(){timer=false;run();},120);}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-current']});}
window.addEventListener('resize',run,{passive:true});
})();
