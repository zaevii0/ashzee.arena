/* ÆZ Arena — mobile UI reliability layer */
(function(){
  'use strict';

  var TABS = [
    {key:'home', label:'Home', view:'dashboard', icon:'<path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/>'},
    {key:'activity', label:'Activity', view:'activities', icon:'<path d="M4 18h16"/><path d="M6 15V9"/><path d="M12 15V5"/><path d="M18 15v-3"/>'},
    {key:'schedule', label:'Schedule', view:'schedule', icon:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 10h18"/>'},
    {key:'social', label:'Social', view:null, icon:'<path d="M7.5 19.5 4 21l1.5-3.5A7.5 7.5 0 1 1 19 12"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>'},
    {key:'profile', label:'Profile', view:'profile', icon:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6"/>'}
  ];

  function removeUnwantedUI(){
    ['themeToggle','mobileInstallCard','pwaGuide'].forEach(function(id){var el=document.getElementById(id);if(el)el.remove();});
    document.querySelectorAll('.mobile-install-card,.mobile-install-btn,.pwa-guide-veil').forEach(function(el){el.remove();});
  }

  function removeRegisterGangButton(){
    document.querySelectorAll('button,a,[role="button"],.entry-btn,.entry-btn-primary').forEach(function(el){
      var text=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(text==='register gang') el.remove();
    });
  }

  function renameEntryButton(){
    document.querySelectorAll('.entry-btn-primary,.entry-btn').forEach(function(btn){
      var span=btn.querySelector('span');
      if(span && (span.textContent||'').trim().toLowerCase()==='gang member') span.textContent='Enter the Arena';
      if(btn.classList.contains('entry-btn-primary')) btn.setAttribute('aria-label','Enter the Arena');
    });
  }

  function forceDarkEntry(){
    if(document.getElementById('aezGuaranteedEntryStyle'))return;
    var style=document.createElement('style');style.id='aezGuaranteedEntryStyle';
    style.textContent=`
html{color-scheme:dark!important;background:#06080C!important}
body{background:#06080C!important;color:#F5F7FA!important}
#landing,#login,#signup,#adminLogin{background:#06080C!important;color:#F5F7FA!important}
#landing{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important}
#landing .wordmark,#landing .tagline,#landing .mark-glyph,#landing .landing-foot,#landing .enter-btn,#landing .entry-choice-grid{margin-left:auto!important;margin-right:auto!important;text-align:center!important}
#landing .entry-choice-grid{align-items:center!important;justify-content:center!important;width:min(92vw,760px)!important}
#landing .entry-btn{box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;color:#F5F7FA!important;background:rgba(20,25,34,.65)!important;border-color:rgba(255,255,255,.14)!important;min-height:64px!important;padding:16px 24px!important;width:100%!important}
#landing .entry-btn span{display:block!important;width:100%!important;text-align:center!important;color:#F5F7FA!important;white-space:normal!important}
#landing .enter-btn{box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;min-height:58px!important;padding:15px 28px!important;width:min(88vw,360px)!important;margin-left:auto!important;margin-right:auto!important}
#landing .tagline{color:#94A3B8!important}
#landing .mark-glyph{color:#64748B!important}
#landing .landing-foot{color:#64748B!important}
@media(min-width:701px){#landing .entry-choice-grid{grid-template-columns:repeat(2,minmax(240px,340px))!important;gap:18px!important}#landing .entry-btn{min-height:68px!important;font-size:15px!important;border-radius:16px!important}#landing .enter-btn{font-size:15px!important}}
@media(max-width:700px){#landing{padding:24px 18px!important;min-height:100svh!important}#landing .entry-choice-grid{grid-template-columns:1fr!important;gap:12px!important;width:min(92vw,420px)!important}#landing .entry-btn{min-height:60px!important;padding:14px 18px!important;font-size:14px!important;border-radius:15px!important}#landing .enter-btn{width:min(88vw,340px)!important;min-height:56px!important;padding:14px 20px!important;font-size:14px!important;border-radius:15px!important}}
@media(max-width:380px){#landing .entry-btn{min-height:56px!important;font-size:13px!important;padding:12px 14px!important}#landing .enter-btn{width:92vw!important;font-size:13px!important}}
@media(prefers-color-scheme:light){html,body,#landing,#login,#signup,#adminLogin{background:#06080C!important;color:#F5F7FA!important}#landing .entry-btn,#landing .enter-btn{color:#F5F7FA!important}}
`;
    document.head.appendChild(style);
  }

  function findOriginal(tab){
    var selectors=[];if(tab.view)selectors.push('[data-view="'+tab.view+'"]');if(tab.key==='social')selectors.push('[data-aez-social]');selectors.push('.nav-item');
    var candidates=[];selectors.forEach(function(selector){document.querySelectorAll(selector).forEach(function(el){if(!candidates.includes(el))candidates.push(el);});});
    return candidates.find(function(el){if(tab.key==='social')return el.hasAttribute('data-aez-social')||/^social$/i.test((el.textContent||'').trim());var view=(el.getAttribute('data-view')||'').toLowerCase();var text=(el.textContent||'').trim().toLowerCase();return view===tab.view||text===tab.label.toLowerCase();})||null;
  }

  function activateOriginal(tab){var original=findOriginal(tab);if(original&&!original.classList.contains('aez-mobile-tab')){original.click();return;}if(tab.key==='social'){var social=document.getElementById('aezSocial');if(social)social.classList.add('open');return;}if(typeof window.nav==='function')window.nav({getAttribute:function(name){return name==='data-view'?tab.view:null;}});}

  function createMobileNav(nav){
    var bar=nav.querySelector('.aez-mobile-tabbar');if(!bar){bar=document.createElement('div');bar.className='aez-mobile-tabbar';bar.setAttribute('role','tablist');bar.setAttribute('aria-label','ÆZ Arena navigation');nav.appendChild(bar);}
    TABS.forEach(function(tab){var button=bar.querySelector('[data-aez-mobile-tab="'+tab.key+'"]');if(!button){button=document.createElement('button');button.type='button';button.className='aez-mobile-tab';button.setAttribute('data-aez-mobile-tab',tab.key);button.setAttribute('aria-label',tab.label);button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+tab.icon+'</svg><span>'+tab.label+'</span>';button.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(tab.key==='social'){var social=document.getElementById('aezSocial');if(social)social.classList.add('open');var original=findOriginal(tab);if(original&&!original.classList.contains('aez-mobile-tab'))original.click();}else{var social=document.getElementById('aezSocial');if(social)social.classList.remove('open');activateOriginal(tab);}setActive(tab.key);});bar.appendChild(button);}});
    return bar;
  }

  function setActive(key){document.querySelectorAll('.aez-mobile-tab').forEach(function(btn){var active=btn.getAttribute('data-aez-mobile-tab')===key;btn.classList.toggle('active',active);btn.setAttribute('aria-selected',active?'true':'false');});}
  function syncActive(){var activeTab='home';TABS.forEach(function(tab){var original=findOriginal(tab);if(original&&(original.classList.contains('active')||original.getAttribute('aria-current')==='page'))activeTab=tab.key;});var social=document.getElementById('aezSocial');if(social&&social.classList.contains('open'))activeTab='social';setActive(activeTab);}

  function addStyle(){
    if(document.getElementById('aezGuaranteedMobileNavStyle'))return;
    var style=document.createElement('style');style.id='aezGuaranteedMobileNavStyle';style.textContent=`
@media(max-width:960px){body.authenticated .bottom-nav{position:fixed!important;left:max(7px,env(safe-area-inset-left))!important;right:max(7px,env(safe-area-inset-right))!important;bottom:max(7px,env(safe-area-inset-bottom))!important;width:auto!important;height:68px!important;min-height:68px!important;display:block!important;padding:5px!important;margin:0!important;box-sizing:border-box!important;z-index:10050!important;overflow:hidden!important;border:1px solid rgba(255,255,255,.11)!important;border-radius:21px!important;background:rgba(19,20,19,.82)!important;box-shadow:0 18px 50px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.075)!important;-webkit-backdrop-filter:blur(28px) saturate(145%)!important;backdrop-filter:blur(28px) saturate(145%)!important}body.authenticated .aez-mobile-tabbar{width:100%!important;height:56px!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:3px!important}body.authenticated .aez-mobile-tab{appearance:none!important;-webkit-appearance:none!important;border:1px solid transparent!important;outline:none!important;border-radius:15px!important;min-width:0!important;width:100%!important;height:56px!important;padding:4px 2px!important;margin:0!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important;background:transparent!important;color:rgba(235,231,221,.58)!important;font-family:inherit!important;font-size:8.5px!important;font-weight:600!important;letter-spacing:.02em!important;line-height:1!important;white-space:nowrap!important;touch-action:manipulation!important;transition:background .18s ease,color .18s ease,border-color .18s ease,transform .12s ease,box-shadow .18s ease!important}body.authenticated .aez-mobile-tab svg{width:19px!important;height:19px!important;flex:0 0 19px!important;display:block!important;opacity:.82!important}body.authenticated .aez-mobile-tab span{display:block!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important}body.authenticated .aez-mobile-tab.active{color:#e3c477!important;background:linear-gradient(145deg,rgba(224,194,122,.16),rgba(224,194,122,.055))!important;border-color:rgba(224,194,122,.25)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 5px 16px rgba(0,0,0,.22)!important}body.authenticated .aez-mobile-tab.active svg{opacity:1!important;transform:translateY(-1px)}body.authenticated .aez-mobile-tab:active{transform:scale(.94)!important}body.authenticated .content,body.authenticated .main-content,body.authenticated .page-content{padding-bottom:98px!important}}
@media(max-width:430px){body.authenticated .bottom-nav{left:6px!important;right:6px!important;bottom:max(6px,env(safe-area-inset-bottom))!important;height:64px!important;min-height:64px!important;border-radius:19px!important;padding:4px!important}.aez-mobile-tabbar,.aez-mobile-tab{height:54px!important}.aez-mobile-tab{border-radius:14px!important;font-size:8px!important;gap:2px!important}.aez-mobile-tab svg{width:18px!important;height:18px!important;flex-basis:18px!important}}
@media(min-width:961px){body.authenticated .aez-mobile-tabbar{display:none!important}}
`;
    document.head.appendChild(style);
  }

  function textMatch(el, values){
    if(!el || el.id==='aezEntryAccessChoice')return false;
    var text=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    return values.indexOf(text)!==-1;
  }

  function findEntryAction(values){
    var selectors='button,a,[role="button"],.entry-btn,.entry-btn-primary';
    var nodes=document.querySelectorAll(selectors);
    for(var i=0;i<nodes.length;i++){
      var el=nodes[i];
      if(el.closest('#aezEntryAccessChoice'))continue;
      if(textMatch(el,values))return el;
    }
    return null;
  }

  function showEntryAccessChoice(){
    var existing=document.getElementById('aezEntryAccessChoice');
    if(existing){existing.classList.add('open');return;}
    var page=document.createElement('section');
    page.id='aezEntryAccessChoice';
    page.setAttribute('aria-label','Arena access selection');
    page.innerHTML=`
      <div class="aez-access-inner">
        <div class="aez-access-kicker">ÆZ ARENA</div>
        <h1>Enter the Arena</h1>
        <p class="aez-access-sub">Choose how you want to enter the network.</p>
        <div class="aez-access-actions">
          <button type="button" class="aez-access-btn" data-aez-access="login">
            <span class="aez-access-index">01</span><span class="aez-access-label">Login</span><span class="aez-access-arrow">→</span>
          </button>
          <button type="button" class="aez-access-btn" data-aez-access="register">
            <span class="aez-access-index">02</span><span class="aez-access-label">Register</span><span class="aez-access-arrow">→</span>
          </button>
        </div>
        <button type="button" class="aez-access-back" data-aez-access="back">Return to Entry</button>
      </div>`;
    document.body.appendChild(page);

    var style=document.getElementById('aezEntryAccessStyle');
    if(!style){
      style=document.createElement('style');style.id='aezEntryAccessStyle';
      style.textContent=`
#aezEntryAccessChoice{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;text-align:center;padding:28px 20px;background:radial-gradient(circle at 50% 42%,rgba(255,255,255,.045),transparent 38%),#06080C;color:#F5F7FA;overflow:auto}
#aezEntryAccessChoice.open{display:flex}
#aezEntryAccessChoice .aez-access-inner{width:min(92vw,520px);margin:auto}
#aezEntryAccessChoice .aez-access-kicker{font:600 11px/1.2 var(--font-mono,monospace);letter-spacing:.24em;color:#64748B;margin-bottom:22px}
#aezEntryAccessChoice h1{font-size:clamp(30px,7vw,54px);line-height:1.05;letter-spacing:-.04em;font-weight:650;margin:0 0 12px}
#aezEntryAccessChoice .aez-access-sub{color:#94A3B8;font-size:14px;line-height:1.6;margin:0 auto 38px;max-width:390px}
#aezEntryAccessChoice .aez-access-actions{display:grid;gap:12px;width:100%}
#aezEntryAccessChoice .aez-access-btn{position:relative;width:100%;min-height:68px;padding:16px 52px 16px 20px;border:1px solid rgba(255,255,255,.13);border-radius:16px;background:rgba(20,25,34,.68);color:#F5F7FA;display:flex;align-items:center;gap:14px;text-align:left;box-shadow:inset 0 1px 0 rgba(255,255,255,.045),0 14px 38px rgba(0,0,0,.25);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);transition:.18s ease}
#aezEntryAccessChoice .aez-access-btn:hover{border-color:rgba(224,194,122,.34);background:rgba(28,31,39,.82);transform:translateY(-1px)}
#aezEntryAccessChoice .aez-access-btn:active{transform:scale(.985)}
#aezEntryAccessChoice .aez-access-index{font:600 10px/1 var(--font-mono,monospace);color:#64748B;min-width:22px}
#aezEntryAccessChoice .aez-access-label{font-size:15px;font-weight:650;letter-spacing:.04em}
#aezEntryAccessChoice .aez-access-arrow{position:absolute;right:20px;color:#C8A95A;font-size:18px}
#aezEntryAccessChoice .aez-access-back{margin-top:24px;border:0;background:transparent;color:#64748B;font:500 11px/1.4 var(--font-mono,monospace);letter-spacing:.06em;padding:10px;cursor:pointer}
#aezEntryAccessChoice .aez-access-back:hover{color:#F5F7FA}
@media(max-width:430px){#aezEntryAccessChoice{padding:22px 16px}#aezEntryAccessChoice .aez-access-sub{margin-bottom:30px}#aezEntryAccessChoice .aez-access-btn{min-height:62px;border-radius:15px}}
`;
      document.head.appendChild(style);
    }

    page.querySelectorAll('[data-aez-access]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var action=btn.getAttribute('data-aez-access');
        if(action==='back'){page.classList.remove('open');return;}
        page.classList.remove('open');
        var target=action==='login'
          ? findEntryAction(['æz secure access','secure access','login'])
          : findEntryAction(['register']);
        if(target)target.click();
      });
    });
  }

  function bindEntryAccess(){
    document.querySelectorAll('.enter-btn,.entry-btn-primary,.entry-btn').forEach(function(btn){
      if(btn.__aezEntryAccessBound)return;
      var text=(btn.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(text!=='enter the arena')return;
      btn.__aezEntryAccessBound=true;
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        showEntryAccessChoice();
      },true);
    });
  }

  function run(){removeUnwantedUI();removeRegisterGangButton();forceDarkEntry();renameEntryButton();bindEntryAccess();var nav=document.querySelector('.bottom-nav');if(nav){addStyle();createMobileNav(nav);syncActive();}}
  function observe(){run();if(window.MutationObserver&&!window.__aezMobileObserver){window.__aezMobileObserver=true;var scheduled=false;var observer=new MutationObserver(function(){if(scheduled)return;scheduled=true;window.requestAnimationFrame(function(){scheduled=false;run();});});window.__aezMobileObserverInstance=observer;observer.observe(document.body,{childList:true,subtree:true});}setTimeout(renameEntryButton,50);setTimeout(renameEntryButton,250);setTimeout(renameEntryButton,1000);setTimeout(bindEntryAccess,50);setTimeout(bindEntryAccess,250);setTimeout(bindEntryAccess,1000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
  window.addEventListener('resize',run,{passive:true});
})();