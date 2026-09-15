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
    ['themeToggle','mobileInstallCard','pwaGuide'].forEach(function(id){
      var el=document.getElementById(id);
      if(el) el.remove();
    });
    document.querySelectorAll('.mobile-install-card,.mobile-install-btn,.pwa-guide-veil').forEach(function(el){el.remove();});
  }

  function renameEntryButton(){
    var changed=false;
    document.querySelectorAll('.entry-btn-primary').forEach(function(btn){
      var span=btn.querySelector('span');
      if(span){
        span.textContent='Enter the Arena';
        changed=true;
      }
      btn.setAttribute('aria-label','Enter the Arena');
    });
    document.querySelectorAll('.entry-btn span').forEach(function(el){
      if((el.textContent||'').trim().toLowerCase()==='gang member'){
        el.textContent='Enter the Arena';
        changed=true;
      }
    });
    return changed;
  }

  function findOriginal(tab){
    var selectors=[];
    if(tab.view) selectors.push('[data-view="'+tab.view+'"]');
    if(tab.key==='social') selectors.push('[data-aez-social]');
    selectors.push('.nav-item');
    var candidates=[];
    selectors.forEach(function(selector){
      document.querySelectorAll(selector).forEach(function(el){
        if(!candidates.includes(el)) candidates.push(el);
      });
    });
    return candidates.find(function(el){
      if(tab.key==='social') return el.hasAttribute('data-aez-social') || /^social$/i.test((el.textContent||'').trim());
      var view=(el.getAttribute('data-view')||'').toLowerCase();
      var text=(el.textContent||'').trim().toLowerCase();
      return view===tab.view || text===tab.label.toLowerCase();
    }) || null;
  }

  function activateOriginal(tab){
    var original=findOriginal(tab);
    if(original && !original.classList.contains('aez-mobile-tab')){
      original.click();
      return;
    }
    if(tab.key==='social'){
      var social=document.getElementById('aezSocial');
      if(social) social.classList.add('open');
      return;
    }
    if(typeof window.nav==='function') window.nav({getAttribute:function(name){return name==='data-view'?tab.view:null;}});
  }

  function createMobileNav(nav){
    var bar=nav.querySelector('.aez-mobile-tabbar');
    if(!bar){
      bar=document.createElement('div');
      bar.className='aez-mobile-tabbar';
      bar.setAttribute('role','tablist');
      bar.setAttribute('aria-label','ÆZ Arena navigation');
      nav.appendChild(bar);
    }

    TABS.forEach(function(tab){
      var button=bar.querySelector('[data-aez-mobile-tab="'+tab.key+'"]');
      if(!button){
        button=document.createElement('button');
        button.type='button';
        button.className='aez-mobile-tab';
        button.setAttribute('data-aez-mobile-tab',tab.key);
        button.setAttribute('aria-label',tab.label);
        button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+tab.icon+'</svg><span>'+tab.label+'</span>';
        button.addEventListener('click',function(e){
          e.preventDefault();
          e.stopPropagation();
          if(tab.key==='social'){
            var social=document.getElementById('aezSocial');
            if(social) social.classList.add('open');
            var original=findOriginal(tab);
            if(original && !original.classList.contains('aez-mobile-tab')) original.click();
          }else{
            var social=document.getElementById('aezSocial');
            if(social) social.classList.remove('open');
            activateOriginal(tab);
          }
          setActive(tab.key);
        });
        bar.appendChild(button);
      }
    });
    return bar;
  }

  function setActive(key){
    document.querySelectorAll('.aez-mobile-tab').forEach(function(btn){
      var active=btn.getAttribute('data-aez-mobile-tab')===key;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-selected',active?'true':'false');
    });
  }

  function syncActive(){
    var activeTab='home';
    TABS.forEach(function(tab){
      var original=findOriginal(tab);
      if(original && (original.classList.contains('active') || original.getAttribute('aria-current')==='page')) activeTab=tab.key;
    });
    var social=document.getElementById('aezSocial');
    if(social && social.classList.contains('open')) activeTab='social';
    setActive(activeTab);
  }

  function addStyle(){
    if(document.getElementById('aezGuaranteedMobileNavStyle')) return;
    var style=document.createElement('style');
    style.id='aezGuaranteedMobileNavStyle';
    style.textContent=`
@media(max-width:960px){
  body.authenticated .bottom-nav{position:fixed!important;left:max(7px,env(safe-area-inset-left))!important;right:max(7px,env(safe-area-inset-right))!important;bottom:max(7px,env(safe-area-inset-bottom))!important;width:auto!important;height:68px!important;min-height:68px!important;display:block!important;padding:5px!important;margin:0!important;box-sizing:border-box!important;z-index:10050!important;overflow:hidden!important;border:1px solid rgba(255,255,255,.11)!important;border-radius:21px!important;background:rgba(19,20,19,.82)!important;box-shadow:0 18px 50px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.075)!important;-webkit-backdrop-filter:blur(28px) saturate(145%)!important;backdrop-filter:blur(28px) saturate(145%)!important}
  body.authenticated .aez-mobile-tabbar{width:100%!important;height:56px!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:3px!important}
  body.authenticated .aez-mobile-tab{appearance:none!important;-webkit-appearance:none!important;border:1px solid transparent!important;outline:none!important;border-radius:15px!important;min-width:0!important;width:100%!important;height:56px!important;padding:4px 2px!important;margin:0!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important;background:transparent!important;color:rgba(235,231,221,.58)!important;font-family:inherit!important;font-size:8.5px!important;font-weight:600!important;letter-spacing:.02em!important;line-height:1!important;white-space:nowrap!important;-webkit-tap-highlight-color:transparent!important;touch-action:manipulation!important;transition:background .18s ease,color .18s ease,border-color .18s ease,transform .12s ease,box-shadow .18s ease!important}
  body.authenticated .aez-mobile-tab svg{width:19px!important;height:19px!important;flex:0 0 19px!important;display:block!important;opacity:.82!important}
  body.authenticated .aez-mobile-tab span{display:block!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important}
  body.authenticated .aez-mobile-tab.active{color:#e3c477!important;background:linear-gradient(145deg,rgba(224,194,122,.16),rgba(224,194,122,.055))!important;border-color:rgba(224,194,122,.25)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 5px 16px rgba(0,0,0,.22)!important}
  body.authenticated .aez-mobile-tab.active svg{opacity:1!important;transform:translateY(-1px)}
  body.authenticated .aez-mobile-tab:active{transform:scale(.94)!important}
  body.authenticated .content,body.authenticated .main-content,body.authenticated .page-content{padding-bottom:98px!important}
}
@media(max-width:430px){body.authenticated .bottom-nav{left:6px!important;right:6px!important;bottom:max(6px,env(safe-area-inset-bottom))!important;height:64px!important;min-height:64px!important;border-radius:19px!important;padding:4px!important}.aez-mobile-tabbar,.aez-mobile-tab{height:54px!important}.aez-mobile-tab{border-radius:14px!important;font-size:8px!important;gap:2px!important}.aez-mobile-tab svg{width:18px!important;height:18px!important;flex-basis:18px!important}}
@media(min-width:961px){body.authenticated .aez-mobile-tabbar{display:none!important}}
`;
    document.head.appendChild(style);
  }

  function run(){
    removeUnwantedUI();
    renameEntryButton();
    var nav=document.querySelector('.bottom-nav');
    if(nav){
      addStyle();
      createMobileNav(nav);
      syncActive();
    }
  }

  function observe(){
    run();
    if(window.MutationObserver&&!window.__aezMobileObserver){
      window.__aezMobileObserver=true;
      var scheduled=false;
      var observer=new MutationObserver(function(){
        if(scheduled)return;
        scheduled=true;
        window.requestAnimationFrame(function(){
          scheduled=false;
          run();
        });
      });
      window.__aezMobileObserverInstance=observer;
      observer.observe(document.body,{childList:true,subtree:true});
    }
    /* Entry Selection can be rebuilt after logout, so make the label fix
       explicit even when the landing page is recreated by index.html. */
    setTimeout(renameEntryButton,50);
    setTimeout(renameEntryButton,250);
    setTimeout(renameEntryButton,1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
  window.addEventListener('resize',run,{passive:true});
})();