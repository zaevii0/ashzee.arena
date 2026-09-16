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
 #aezGuaranteedNav{position:fixed!important;left:50%!important;right:auto!important;bottom:max(14px,calc(env(safe-area-inset-bottom) + 8px))!important;transform:translateX(-50%)!important;width:min(380px,calc(100vw - 28px))!important;height:70px!important;padding:7px!important;display:grid!important;grid-template-columns:repeat(5,1fr)!important;gap:4px!important;z-index:2147483000!important;box-sizing:border-box!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:24px!important;background:linear-gradient(145deg,rgba(34,35,34,.82),rgba(12,13,13,.91))!important;box-shadow:0 20px 55px rgba(0,0,0,.62),0 5px 18px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.10)!important;backdrop-filter:blur(30px) saturate(155%)!important;-webkit-backdrop-filter:blur(30px) saturate(155%)!important;overflow:visible!important}
 #aezGuaranteedNav:before{content:"";position:absolute!important;left:12%!important;right:12%!important;top:0!important;height:1px!important;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent)!important;pointer-events:none!important}
 #aezGuaranteedNav .aez-g-tab{appearance:none!important;-webkit-appearance:none!important;border:1px solid transparent!important;outline:0!important;border-radius:18px!important;width:100%!important;height:56px!important;padding:5px 2px!important;margin:0!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;background:transparent!important;color:rgba(235,231,221,.58)!important;font:600 9px/1 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;cursor:pointer!important;position:relative!important;transform:translateY(0)!important;transition:transform .24s cubic-bezier(.22,1,.36,1),color .2s ease,background .2s ease,border-color .2s ease,box-shadow .24s ease!important;will-change:transform!important}
 #aezGuaranteedNav .aez-g-tab svg{display:block!important;width:22px!important;height:22px!important;fill:none!important;stroke:currentColor!important;stroke-width:2!important;stroke-linecap:round!important;stroke-linejoin:round!important;flex:none!important;transition:transform .24s cubic-bezier(.22,1,.36,1),filter .2s ease!important}
 #aezGuaranteedNav .aez-g-tab span{transition:opacity .2s ease,transform .24s cubic-bezier(.22,1,.36,1)!important}
 #aezGuaranteedNav .aez-g-tab.active{color:#e5c978!important;background:rgba(229,201,120,.10)!important;border-color:rgba(229,201,120,.18)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 5px 15px rgba(0,0,0,.18)!important;transform:translateY(-8px)!important}
 #aezGuaranteedNav .aez-g-tab.active svg{transform:translateY(-1px) scale(1.06)!important;filter:drop-shadow(0 3px 8px rgba(229,201,120,.22))!important}
 #aezGuaranteedNav .aez-g-tab.active span{transform:translateY(-1px)!important}
 #aezGuaranteedNav .aez-g-tab.post{background:rgba(229,201,120,.13)!important;color:#e5c978!important;border-color:rgba(229,201,120,.25)!important}
 #aezGuaranteedNav .aez-g-tab.post.active{background:rgba(229,201,120,.17)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 8px 20px rgba(0,0,0,.24)!important}
 #aezGuaranteedNav .aez-g-tab.post svg{width:24px!important;height:24px!important}
 #aezGuaranteedNav .aez-g-tab:active{transform:translateY(-4px) scale(.97)!important}
}
@media(max-width:430px){
 #aezGuaranteedNav{bottom:max(10px,calc(env(safe-area-inset-bottom) + 6px))!important;width:calc(100vw - 20px)!important;height:66px!important;border-radius:22px!important;padding:6px!important;gap:2px!important}
 #aezGuaranteedNav .aez-g-tab{height:53px!important;border-radius:16px!important;font-size:8.5px!important;gap:3px!important}
 #aezGuaranteedNav .aez-g-tab svg{width:21px!important;height:21px!important}
 #aezGuaranteedNav .aez-g-tab.post svg{width:23px!important;height:23px!important}
 #aezGuaranteedNav .aez-g-tab.active{transform:translateY(-7px)!important}
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
