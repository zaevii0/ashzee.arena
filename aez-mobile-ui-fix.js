/* ÆZ Arena — mobile UI reliability + entry gateway */
(function(){
'use strict';

var TABS=[
 {key:'home',label:'Home',view:'dashboard',icon:'<path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/>'},
 {key:'activity',label:'Activity',view:'activities',icon:'<path d="M4 18h16"/><path d="M6 15V9"/><path d="M12 15V5"/><path d="M18 15v-3"/>'},
 {key:'schedule',label:'Schedule',view:'schedule',icon:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 10h18"/>'},
 {key:'social',label:'Social',view:null,icon:'<path d="M7.5 19.5 4 21l1.5-3.5A7.5 7.5 0 1 1 19 12"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>'},
 {key:'profile',label:'Profile',view:'profile',icon:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6"/>'}
];

function removeUnwantedUI(){
 ['themeToggle','mobileInstallCard','pwaGuide'].forEach(function(id){var e=document.getElementById(id);if(e)e.remove();});
 document.querySelectorAll('.mobile-install-card,.mobile-install-btn,.pwa-guide-veil').forEach(function(e){e.remove();});
}
function removeRegisterGangButton(){
 var landing=document.getElementById('landing');if(!landing)return;
 landing.querySelectorAll('button,a,[role="button"],.entry-btn,.entry-btn-primary').forEach(function(e){
  if((e.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()==='register gang')e.remove();
 });
}
function renameEntryButton(){
 document.querySelectorAll('#landing .entry-btn-primary,#landing .entry-btn').forEach(function(btn){
  var s=btn.querySelector('span');
  if(s&&(s.textContent||'').trim().toLowerCase()==='gang member')s.textContent='Enter the Arena';
  if(btn.classList.contains('entry-btn-primary'))btn.setAttribute('aria-label','Enter the Arena');
 });
}

function injectEntryStyles(){
 if(document.getElementById('aezEntryThemeStyle'))return;
 var st=document.createElement('style');st.id='aezEntryThemeStyle';st.textContent=`
html{color-scheme:dark!important;background:#06080C!important}
body{background:#06080C!important;color:#F5F7FA!important}
#landing,#login,#signup,#adminLogin{background:#06080C!important;color:#F5F7FA!important}
#landing{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;min-height:100svh!important;padding:34px 20px 76px!important}
#landing .wordmark,#landing .tagline,#landing .mark-glyph,#landing .landing-foot{text-align:center!important;margin-left:auto!important;margin-right:auto!important}
#landing .enter-btn{display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;margin:34px auto 0!important;width:min(88vw,360px)!important}
#landing .entry-choice-grid{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;width:min(92vw,520px)!important;margin:44px auto 0!important;gap:12px!important}
#landing .entry-btn{display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;width:100%!important;min-height:64px!important;padding:15px 24px!important;box-sizing:border-box!important;color:#F5F7FA!important;background:linear-gradient(145deg,rgba(25,29,37,.86),rgba(12,15,20,.82))!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:16px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 18px 42px rgba(0,0,0,.30)!important;backdrop-filter:blur(20px)!important;-webkit-backdrop-filter:blur(20px)!important}
#landing .entry-btn span{display:block!important;width:100%!important;text-align:center!important;color:#F5F7FA!important}
#landing .tagline{color:#94A3B8!important}.mark-glyph,.landing-foot{color:#64748B!important}
#aezEntryAccessChoice,#aezRegistrationChoice,#aezSecureAccess{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;text-align:center;padding:28px 20px;background:radial-gradient(circle at 50% 30%,rgba(224,194,122,.075),transparent 30%),radial-gradient(circle at 50% 100%,rgba(255,255,255,.035),transparent 42%),#06080C;color:#F5F7FA;overflow:auto}
#aezEntryAccessChoice.open,#aezRegistrationChoice.open,#aezSecureAccess.open{display:flex}
#aezEntryAccessChoice:before,#aezRegistrationChoice:before,#aezSecureAccess:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.55;background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);background-size:56px 56px;mask-image:radial-gradient(circle at 50% 45%,black,transparent 76%);-webkit-mask-image:radial-gradient(circle at 50% 45%,black,transparent 76%)}
.aez-gateway-inner{position:relative;z-index:1;width:min(92vw,560px);margin:auto;text-align:center}
.aez-gateway-mark{width:48px;height:48px;margin:0 auto 22px;border:1px solid rgba(224,194,122,.28);border-radius:14px;display:flex;align-items:center;justify-content:center;color:#D9B96A;font:600 14px/1 monospace;background:rgba(224,194,122,.055);box-shadow:0 0 34px rgba(224,194,122,.06),inset 0 1px 0 rgba(255,255,255,.06)}
.aez-gateway-kicker{font:600 10px/1.2 monospace;letter-spacing:.28em;color:#64748B;margin-bottom:18px}
.aez-gateway-inner h1{margin:0 0 12px;font-size:clamp(34px,7vw,58px);line-height:1.02;letter-spacing:-.045em;font-weight:650}
.aez-gateway-sub{margin:0 auto 36px;max-width:430px;color:#94A3B8;font-size:14px;line-height:1.65}
.aez-gateway-rule{height:1px;width:100%;margin:0 auto 18px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.13),transparent)}
.aez-gateway-actions{display:grid;gap:12px;width:min(420px,100%);margin:0 auto}
.aez-gateway-btn{position:relative;width:100%;min-height:72px;padding:16px 42px!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:17px!important;background:linear-gradient(145deg,rgba(25,29,37,.86),rgba(12,15,20,.82))!important;color:#F5F7FA!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 18px 42px rgba(0,0,0,.3);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);transition:.18s ease}
.aez-gateway-btn:hover{transform:translateY(-2px);border-color:rgba(224,194,122,.38)!important}
.aez-gateway-label{display:block!important;width:auto!important;font-size:15px;font-weight:650;letter-spacing:.045em;text-align:center!important}
.aez-gateway-arrow{position:absolute;right:20px;color:#D9B96A;font-size:19px}
.aez-gateway-back{display:block;margin:22px auto 0;border:0;background:transparent;color:#64748B;font:500 10px/1.4 monospace;letter-spacing:.08em;padding:10px 14px;cursor:pointer}
#aezSecureAccess .aez-secure-box{position:relative;z-index:1;width:min(92vw,500px);padding:34px 30px;border:1px solid rgba(255,255,255,.11);border-radius:24px;background:linear-gradient(145deg,rgba(25,29,37,.78),rgba(10,13,18,.88));box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 24px 70px rgba(0,0,0,.42);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);text-align:left}
#aezSecureAccess .aez-secure-title{text-align:center;margin:0 0 8px;font-size:clamp(30px,6vw,46px);letter-spacing:-.04em}
#aezSecureAccess .aez-secure-sub{text-align:center;color:#94A3B8;font-size:13px;line-height:1.6;margin:0 0 26px}
.aez-gang-pending{margin:18px auto;max-width:440px;padding:15px;border:1px solid rgba(224,194,122,.2);border-radius:16px;background:rgba(224,194,122,.045);text-align:left}
.aez-gang-pending .status{font-size:10px;letter-spacing:.1em;color:#D9B96A;font-weight:700;margin-bottom:10px}
.aez-gang-pending .row{display:flex;justify-content:space-between;gap:16px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:11px}
.aez-gang-pending .row:last-child{border-bottom:0}.aez-gang-pending .k{color:#64748B}.aez-gang-pending .v{color:#F5F7FA;text-align:right;overflow-wrap:anywhere}
.aez-gang-pending-note{font-size:11px;line-height:1.6;color:#94A3B8;margin-top:12px}
@media(max-width:700px){#landing{padding:24px 18px 76px!important}.aez-gateway-inner{width:min(92vw,430px)}.aez-gateway-btn{min-height:64px;border-radius:15px!important}.aez-secure-box{padding:28px 20px!important}}
@media(prefers-color-scheme:light){html,body,#landing,#login,#signup,#adminLogin,#aezEntryAccessChoice,#aezRegistrationChoice,#aezSecureAccess{background:#06080C!important;color:#F5F7FA!important}}
`;
 document.head.appendChild(st);
}

function findOriginal(tab){
 var selectors=[];if(tab.view)selectors.push('[data-view="'+tab.view+'"]');if(tab.key==='social')selectors.push('[data-aez-social]');selectors.push('.nav-item');var c=[];
 selectors.forEach(function(s){document.querySelectorAll(s).forEach(function(e){if(c.indexOf(e)<0)c.push(e);});});
 return c.find(function(e){if(tab.key==='social')return e.hasAttribute('data-aez-social')||/^social$/i.test((e.textContent||'').trim());return (e.getAttribute('data-view')||'').toLowerCase()===tab.view||(e.textContent||'').trim().toLowerCase()===tab.label.toLowerCase();})||null;
}
function activateOriginal(tab){var e=findOriginal(tab);if(e&&!e.classList.contains('aez-mobile-tab')){e.click();return;}if(tab.key==='social'){var s=document.getElementById('aezSocial');if(s)s.classList.add('open');return;}if(typeof window.nav==='function')window.nav({getAttribute:function(n){return n==='data-view'?tab.view:null;}});}
function createMobileNav(nav){
 var bar=nav.querySelector('.aez-mobile-tabbar');if(!bar){bar=document.createElement('div');bar.className='aez-mobile-tabbar';bar.setAttribute('role','tablist');nav.appendChild(bar);}
 TABS.forEach(function(tab){var b=bar.querySelector('[data-aez-mobile-tab="'+tab.key+'"]');if(b)return;b=document.createElement('button');b.type='button';b.className='aez-mobile-tab';b.setAttribute('data-aez-mobile-tab',tab.key);b.setAttribute('aria-label',tab.label);b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+tab.icon+'</svg><span>'+tab.label+'</span>';b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var s=document.getElementById('aezSocial');if(tab.key==='social'){if(s)s.classList.add('open');var o=findOriginal(tab);if(o&&!o.classList.contains('aez-mobile-tab'))o.click();}else{if(s)s.classList.remove('open');activateOriginal(tab);}setActive(tab.key);});bar.appendChild(b);});
}
function setActive(key){document.querySelectorAll('.aez-mobile-tab').forEach(function(b){var a=b.getAttribute('data-aez-mobile-tab')===key;b.classList.toggle('active',a);b.setAttribute('aria-selected',a?'true':'false');});}
function syncActive(){var key='home';TABS.forEach(function(t){var e=findOriginal(t);if(e&&(e.classList.contains('active')||e.getAttribute('aria-current')==='page'))key=t.key;});var s=document.getElementById('aezSocial');if(s&&s.classList.contains('open'))key='social';setActive(key);}
function addNavStyle(){
 if(document.getElementById('aezGuaranteedMobileNavStyle'))return;var st=document.createElement('style');st.id='aezGuaranteedMobileNavStyle';st.textContent=`@media(max-width:960px){body.authenticated .bottom-nav{position:fixed!important;left:6px!important;right:6px!important;bottom:max(6px,env(safe-area-inset-bottom))!important;width:auto!important;height:68px!important;display:block!important;padding:5px!important;z-index:10050!important;border:1px solid rgba(255,255,255,.11)!important;border-radius:21px!important;background:rgba(19,20,19,.82)!important;box-shadow:0 18px 50px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.075)!important;backdrop-filter:blur(28px) saturate(145%)!important}.aez-mobile-tabbar{width:100%!important;height:56px!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:3px!important}.aez-mobile-tab{appearance:none!important;border:1px solid transparent!important;border-radius:15px!important;width:100%!important;height:56px!important;padding:4px 2px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important;background:transparent!important;color:rgba(235,231,221,.58)!important;font:600 8.5px/1 inherit!important}.aez-mobile-tab svg{width:19px!important;height:19px!important}.aez-mobile-tab.active{color:#e3c477!important;background:rgba(224,194,122,.11)!important;border-color:rgba(224,194,122,.25)!important}}@media(min-width:961px){body.authenticated .aez-mobile-tabbar{display:none!important}}`;document.head.appendChild(st);
}

function hideGateway(id){var e=document.getElementById(id);if(e)e.classList.remove('open');}
function findEntryAction(values){var nodes=document.querySelectorAll('button,a,[role="button"],.entry-btn,.entry-btn-primary');for(var i=0;i<nodes.length;i++){var e=nodes[i];if(e.closest('#aezEntryAccessChoice,#aezRegistrationChoice,#aezSecureAccess'))continue;var text=(e.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(values.indexOf(text)>=0)return e;}return null;}

function showSecureAccess(){
 hideGateway('aezEntryAccessChoice');hideGateway('aezRegistrationChoice');
 var page=document.getElementById('aezSecureAccess');
 if(!page){page=document.createElement('section');page.id='aezSecureAccess';page.innerHTML='<div class="aez-secure-box"><div class="aez-gateway-mark" style="margin-left:auto;margin-right:auto">ÆZ</div><h1 class="aez-secure-title">ÆZ Secure Access</h1><p class="aez-secure-sub">Identify yourself to enter the network.</p><div class="aez-secure-form-slot"></div><button type="button" class="aez-gateway-back" data-aez-secure-back>Return to Entry</button></div>';document.body.appendChild(page);injectEntryStyles();}
 var login=document.getElementById('login'),slot=page.querySelector('.aez-secure-form-slot');
 if(login&&slot&&!slot.contains(login))slot.appendChild(login);
 page.classList.add('open');
 if(login){login.style.display='block';login.style.minHeight='auto';login.style.background='transparent';login.style.padding='0';}
 page.querySelector('[data-aez-secure-back]').onclick=function(){page.classList.remove('open');if(login){document.body.appendChild(login);login.style.removeProperty('display');login.style.removeProperty('min-height');login.style.removeProperty('background');login.style.removeProperty('padding');}showEntryAccessChoice();};
}

function showGangPendingInfo(){
 var success=document.getElementById('gangRegisterSuccess');if(!success)return;
 var old=success.querySelector('.aez-gang-pending');if(old)old.remove();
 var get=function(id){var e=document.getElementById(id);return e?(e.value||e.textContent||'').trim():'—';};
 var name=get('grNameInput'),initial=get('grInitialInput'),alias=get('grAliasInput'),leader=get('grLeaderInput'),coo=get('grCooInput');
 var info=document.createElement('div');info.className='aez-gang-pending';
 info.innerHTML='<div class="status">PENDING — AWAITING REVIEW</div>'+[['Gang Name',name],['Initial / Alias',initial+(alias?' · '+alias:'')],['Leader',leader],['Co-leader',coo],['Application','Submitted — Pending Review']].map(function(r){return '<div class="row"><span class="k">'+r[0]+'</span><span class="v">'+(r[1]||'—')+'</span></div>';}).join('')+'<div class="aez-gang-pending-note">Your gang registration has been received but is not yet official. An authorized Arena Admin/Official must review and approve the gang before it becomes active. Keep this confirmation for your records.</div>';
 var h=success.querySelector('h2');if(h)h.textContent='Gang registration pending.';var p=success.querySelector('#gangSuccessCopy');if(p)p.textContent='Your gang information has been securely submitted for review. Approval is required before the gang is officially registered.';success.insertBefore(info,success.querySelector('button'));
}
function watchGangRegistration(){
 var success=document.getElementById('gangRegisterSuccess');if(!success)return;
 if(success.classList.contains('show'))showGangPendingInfo();
}
function openGangRegistrationFlow(){
 hideGateway('aezRegistrationChoice');
 if(typeof window.openGangRegistration==='function'){window.openGangRegistration();setTimeout(watchGangRegistration,150);return;}
 var screen=document.getElementById('gangRegister');if(screen){document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');s.style.display='none';});screen.classList.add('active');screen.style.display='flex';setTimeout(watchGangRegistration,150);}
}
function showRegistrationChoice(){
 hideGateway('aezEntryAccessChoice');hideGateway('aezSecureAccess');
 var page=document.getElementById('aezRegistrationChoice');
 if(!page){page=document.createElement('section');page.id='aezRegistrationChoice';page.innerHTML='<div class="aez-gateway-inner"><div class="aez-gateway-mark">ÆZ</div><div class="aez-gateway-kicker">ÆZ ARENA // REGISTRATION</div><h1>Join the Network</h1><p class="aez-gateway-sub">Choose how you want to establish your presence in the Arena.</p><div class="aez-gateway-rule"></div><div class="aez-gateway-actions"><button type="button" class="aez-gateway-btn" data-aez-register="gang"><span class="aez-gateway-label">Register Our Gang</span><span class="aez-gateway-arrow">→</span></button><button type="button" class="aez-gateway-btn" data-aez-register="agent"><span class="aez-gateway-label">Register as Agent</span><span class="aez-gateway-arrow">→</span></button></div><p class="aez-gateway-sub" style="margin:18px auto 0;font-size:12px">Register as Agent — join as a Gang Member.</p><button type="button" class="aez-gateway-back" data-aez-register="back">Return to Entry</button></div>';document.body.appendChild(page);injectEntryStyles();
  page.querySelector('[data-aez-register="gang"]').onclick=openGangRegistrationFlow;
  page.querySelector('[data-aez-register="agent"]').onclick=function(){page.classList.remove('open');var target=findEntryAction(['register','register as agent','gang member']);if(target)target.click();else if(typeof window.openRegistration==='function')window.openRegistration();};
  page.querySelector('[data-aez-register="back"]').onclick=function(){page.classList.remove('open');showEntryAccessChoice();};
 }
 page.classList.add('open');
}
function showEntryAccessChoice(){
 var page=document.getElementById('aezEntryAccessChoice');
 if(!page){page=document.createElement('section');page.id='aezEntryAccessChoice';page.innerHTML='<div class="aez-gateway-inner"><div class="aez-gateway-mark">ÆZ</div><div class="aez-gateway-kicker">ÆZ ARENA // ACCESS PROTOCOL</div><h1>Enter the Arena</h1><p class="aez-gateway-sub">Choose how you want to enter the network.</p><div class="aez-gateway-rule"></div><div class="aez-gateway-actions"><button type="button" class="aez-gateway-btn" data-aez-access="login"><span class="aez-gateway-label">Login</span><span class="aez-gateway-arrow">→</span></button><button type="button" class="aez-gateway-btn" data-aez-access="register"><span class="aez-gateway-label">Register</span><span class="aez-gateway-arrow">→</span></button></div><button type="button" class="aez-gateway-back" data-aez-access="back">Return to Entry</button></div>';document.body.appendChild(page);injectEntryStyles();
  page.querySelector('[data-aez-access="login"]').onclick=showSecureAccess;
  page.querySelector('[data-aez-access="register"]').onclick=showRegistrationChoice;
  page.querySelector('[data-aez-access="back"]').onclick=function(){page.classList.remove('open');};
 }
 page.classList.add('open');
}
function bindEntryAccess(){
 document.querySelectorAll('#landing .enter-btn,#landing .entry-btn-primary,#landing .entry-btn').forEach(function(btn){if(btn.__aezEntryAccessBound)return;var text=(btn.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(text!=='enter the arena')return;btn.__aezEntryAccessBound=true;btn.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();showEntryAccessChoice();},true);});
}
function run(){
 removeUnwantedUI();removeRegisterGangButton();renameEntryButton();injectEntryStyles();bindEntryAccess();
 var nav=document.querySelector('.bottom-nav');if(nav){addNavStyle();createMobileNav(nav);syncActive();}
 var success=document.getElementById('gangRegisterSuccess');if(success&&!success.__aezPendingObserver){success.__aezPendingObserver=new MutationObserver(function(){if(success.classList.contains('show'))showGangPendingInfo();});success.__aezPendingObserver.observe(success,{attributes:true,attributeFilter:['class']});}
}
function observe(){
 run();
 if(window.MutationObserver&&!window.__aezMobileObserver){window.__aezMobileObserver=true;var scheduled=false;var observer=new MutationObserver(function(){if(scheduled)return;scheduled=true;window.requestAnimationFrame(function(){scheduled=false;run();});});observer.observe(document.body,{childList:true,subtree:true});}
 setTimeout(renameEntryButton,50);setTimeout(bindEntryAccess,50);setTimeout(bindEntryAccess,250);setTimeout(watchGangRegistration,250);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
window.addEventListener('resize',run,{passive:true});
})();