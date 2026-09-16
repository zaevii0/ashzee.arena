/* ÆZ Arena — five-item mobile floating glass navigation */
(function(){
'use strict';

var TABS=[
 {key:'home',label:'Home',view:'dashboard',icon:'<path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/>'},
 {key:'activity',label:'Activities',view:'activities',icon:'<path d="M4 18h16"/><path d="M6 15V9"/><path d="M12 15V5"/><path d="M18 15v-3"/>'},
 {key:'post',label:'',view:null,icon:'<path d="M12 5v14"/><path d="M5 12h14"/>'},
 {key:'social',label:'Social',view:null,icon:'<path d="M7.5 19.5 4 21l1.5-3.5A7.5 7.5 0 1 1 19 12"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>'},
 {key:'profile',label:'Profile',view:'profile',icon:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6"/>'}
];

function style(){
 if(document.getElementById('aezNavGuaranteeStyle'))return;
 var s=document.createElement('style');s.id='aezNavGuaranteeStyle';s.textContent=`
@media(max-width:960px){
 body.authenticated .bottom-nav{display:none!important}
 #aezGuaranteedNav{
  position:fixed!important;left:50%!important;right:auto!important;
  bottom:max(18px,calc(env(safe-area-inset-bottom) + 10px))!important;
  transform:translateX(-50%)!important;width:min(392px,calc(100vw - 20px))!important;
  height:70px!important;padding:6px 8px!important;display:grid!important;
  grid-template-columns:repeat(5,1fr)!important;align-items:end!important;gap:2px!important;
  z-index:2147483000!important;box-sizing:border-box!important;overflow:visible!important;
  border:1px solid rgba(212,175,55,.20)!important;border-radius:27px!important;
  background:linear-gradient(145deg,rgba(25,25,25,.82),rgba(7,7,7,.94))!important;
  box-shadow:0 22px 60px rgba(0,0,0,.66),0 5px 22px rgba(0,0,0,.38),0 0 30px rgba(212,175,55,.06)!important;
  backdrop-filter:blur(30px) saturate(155%)!important;-webkit-backdrop-filter:blur(30px) saturate(155%)!important;
  transition:height .36s cubic-bezier(.22,1,.36,1),border-radius .36s ease,box-shadow .36s ease!important
 }
 #aezGuaranteedNav:before{display:none!important}
 #aezGuaranteedNav:after{content:"";position:absolute!important;left:var(--aez-focus-x,50%)!important;top:-24px!important;width:112px!important;height:112px!important;transform:translateX(-50%)!important;border-radius:50%!important;background:radial-gradient(circle,rgba(212,175,55,.20) 0%,rgba(212,175,55,.07) 42%,transparent 72%)!important;filter:blur(7px)!important;pointer-events:none!important;z-index:-1!important;transition:left .45s cubic-bezier(.22,1,.36,1),opacity .25s ease!important}
 #aezGuaranteedNav .aez-focus-indicator{display:none!important}
 #aezGuaranteedNav .aez-g-tab{appearance:none!important;-webkit-appearance:none!important;border:1px solid transparent!important;outline:0!important;border-radius:18px!important;width:100%!important;height:55px!important;padding:4px 2px!important;margin:0!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;background:transparent!important;color:rgba(235,231,221,.58)!important;font:600 9px/1 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;cursor:pointer!important;position:relative!important;z-index:1!important;transform:translateY(0)!important;transition:color .22s ease!important;will-change:auto!important}
 #aezGuaranteedNav .aez-g-tab svg{display:block!important;width:22px!important;height:22px!important;fill:none!important;stroke:currentColor!important;stroke-width:2!important;stroke-linecap:round!important;stroke-linejoin:round!important;flex:none!important;transition:none!important}
 #aezGuaranteedNav .aez-g-tab span{transition:none!important}
 #aezGuaranteedNav .aez-g-tab.active{color:#D4AF37!important;background:transparent!important;border-color:transparent!important;box-shadow:none!important;transform:translateY(0)!important}
 #aezGuaranteedNav .aez-g-tab.active svg{transform:none!important;filter:none!important}
 #aezGuaranteedNav .aez-g-tab.active span{transform:none!important}
 #aezGuaranteedNav .aez-g-tab:not(.active):hover{background:transparent!important;color:rgba(255,255,255,.78)!important}
 #aezGuaranteedNav .aez-g-tab:active:not(.post){transform:none!important}

 /* Center FAB: action-first, elevated, always centered */
 #aezGuaranteedNav .aez-g-tab.post{width:60px!important;height:60px!important;justify-self:center!important;align-self:start!important;margin-top:-19px!important;padding:0!important;border-radius:50%!important;background:linear-gradient(145deg,#FFD978 0%,#D4AF37 52%,#B58E24 100%)!important;color:#0A0A0A!important;border:1px solid rgba(255,255,255,.48)!important;box-shadow:0 15px 30px rgba(0,0,0,.52),0 0 0 6px rgba(212,175,55,.075),0 0 30px rgba(212,175,55,.22)!important;z-index:5!important;transform:none!important;transition:box-shadow .3s ease,filter .25s ease!important}
 #aezGuaranteedNav .aez-g-tab.post:before{display:none!important}
 #aezGuaranteedNav .aez-g-tab.post svg{width:28px!important;height:28px!important;stroke-width:2.15!important;filter:none!important;transform:none!important}
 #aezGuaranteedNav .aez-g-tab.post span{display:none!important}
 #aezGuaranteedNav .aez-g-tab.post:hover{filter:brightness(1.045)!important;box-shadow:0 18px 34px rgba(0,0,0,.54),0 0 0 7px rgba(212,175,55,.085),0 0 34px rgba(212,175,55,.29)!important}
 #aezGuaranteedNav .aez-g-tab.post:active{transform:none!important}
 #aezGuaranteedNav.post-focus .aez-g-tab.post{transform:none!important;box-shadow:0 15px 30px rgba(0,0,0,.52),0 0 0 6px rgba(212,175,55,.075),0 0 30px rgba(212,175,55,.22)!important}
}
@media(max-width:430px){
 #aezGuaranteedNav{bottom:max(12px,calc(env(safe-area-inset-bottom) + 7px))!important;width:calc(100vw - 14px)!important;height:67px!important;border-radius:24px!important;padding:5px 6px!important}
 #aezGuaranteedNav .aez-g-tab{height:53px!important;border-radius:16px!important;font-size:8.5px!important;gap:3px!important}
 #aezGuaranteedNav .aez-g-tab svg{width:21px!important;height:21px!important}
 #aezGuaranteedNav .aez-g-tab.post{width:57px!important;height:57px!important;margin-top:-18px!important}
 #aezGuaranteedNav .aez-g-tab.post svg{width:26px!important;height:26px!important}
 #aezGuaranteedNav .aez-g-tab.active{transform:none!important}
 #aezGuaranteedNav .aez-g-tab:active:not(.post){transform:none!important}
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
function focusX(key){
 var nav=document.getElementById('aezGuaranteedNav');if(!nav)return;
 var b=nav.querySelector('[data-aez-g-tab="'+key+'"]');
 if(!b)return;
 var nr=nav.getBoundingClientRect(),br=b.getBoundingClientRect();
 nav.style.setProperty('--aez-focus-x',(br.left+br.width/2-nr.left)+'px');
}
function setActive(key){
 var nav=document.getElementById('aezGuaranteedNav');if(!nav)return;
 document.querySelectorAll('#aezGuaranteedNav .aez-g-tab').forEach(function(b){var yes=b.getAttribute('data-aez-g-tab')===key;b.classList.toggle('active',yes);b.setAttribute('aria-selected',yes?'true':'false');});
 nav.classList.toggle('has-focus',false);
 nav.classList.toggle('post-focus',false);
 nav.style.setProperty('--aez-focus-x','50%');
}
function build(){
 if(!document.body.classList.contains('authenticated'))return;
 style();
 var nav=document.getElementById('aezGuaranteedNav');
 if(!nav){nav=document.createElement('nav');nav.id='aezGuaranteedNav';nav.setAttribute('aria-label','Primary navigation');document.body.appendChild(nav);}
 if(!nav.querySelector('.aez-focus-indicator')){var ind=document.createElement('div');ind.className='aez-focus-indicator';nav.appendChild(ind);}
 TABS.forEach(function(t){
  var b=nav.querySelector('[data-aez-g-tab="'+t.key+'"]');
  if(!b){b=document.createElement('button');b.type='button';b.className='aez-g-tab '+(t.key==='post'?'post':'');b.setAttribute('data-aez-g-tab',t.key);b.setAttribute('aria-label',t.key==='post'?'Create post':t.label);b.innerHTML='<svg viewBox="0 0 24 24">'+t.icon+'</svg><span>'+t.label+'</span>';b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();go(t);setActive(t.key);});nav.appendChild(b);}
 });
 setActive(activeKey());
}
function run(){build();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
if(window.MutationObserver&&!window.__aezNavGuaranteeObserver){window.__aezNavGuaranteeObserver=true;var timer=false;new MutationObserver(function(){if(timer)return;timer=true;setTimeout(function(){timer=false;run();},120);}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-current']});}
window.addEventListener('resize',run,{passive:true});
})();
