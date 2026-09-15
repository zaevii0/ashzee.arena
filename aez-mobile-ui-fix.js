/* ÆZ Arena — mobile UI reliability layer */
(function(){
  'use strict';

  var navClickBound = false;
  var observerBusy = false;

  function loadMobileCascade(){
    if(window.innerWidth > 960) return;
    if(document.getElementById('aezMobileCascade')) return;

    var link=document.createElement('link');
    link.id='aezMobileCascade';
    link.rel='stylesheet';
    link.href='./mobile-responsive.css?v=20260915-mobile4';
    document.head.appendChild(link);

    var style=document.createElement('style');
    style.id='aezMobileFinalStyle';
    style.textContent='@media (max-width:960px){\n'
      + 'body.authenticated .bottom-nav{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;grid-auto-flow:column!important;gap:0!important;overflow:hidden!important;width:100%!important;padding:6px 8px calc(6px + env(safe-area-inset-bottom))!important;}\n'
      + 'body.authenticated .bottom-nav .bn-item{display:flex!important;width:100%!important;min-width:0!important;flex:1 1 0!important;height:56px!important;padding:5px 2px!important;}\n'
      + 'body.authenticated .bottom-nav .bn-more{display:none!important;}\n'
      + 'body.authenticated .bottom-nav .bn-item.mobile-primary{display:flex!important;}\n'
      + '}';
    document.head.appendChild(style);
  }

  function cleanupSocialShortcut(){
    var b=document.getElementById('aezMobileSocial');
    if(b) b.remove();
    var s=document.getElementById('aezMobileSocialStyle');
    if(s) s.remove();
  }

  function removeUnwantedUI(){
    ['themeToggle','mobileInstallCard','pwaGuide'].forEach(function(id){
      var el=document.getElementById(id);
      if(el) el.remove();
    });
    document.querySelectorAll('.mobile-install-card,.mobile-install-btn,.pwa-guide-veil').forEach(function(el){el.remove();});
  }

  function closeSocialOnNavigation(){
    if(navClickBound) return;
    navClickBound=true;
    document.addEventListener('click',function(e){
      var target=e.target.closest('[data-view], .nav-item, .bn-item');
      if(!target || target.hasAttribute('data-aez-social')) return;
      var social=document.getElementById('aezSocial');
      if(social) social.classList.remove('open');
    },true);
  }

  function makeScheduleItem(){
    var existing=document.querySelector('.bottom-nav .bn-item[data-view="schedule"]');
    if(existing) return existing;

    var source=document.querySelector('.nav-item[data-view="schedule"]');
    if(source){
      var clone=source.cloneNode(true);
      clone.classList.remove('nav-item','active');
      clone.classList.add('bn-item');
      clone.removeAttribute('data-aez-social');
      clone.onclick=function(){ source.click(); };
      return clone;
    }

    /* Fallback: create a real Schedule destination so the five-slot
       navigation remains stable even if the desktop schedule control
       is generated later by another script. */
    var item=document.createElement('a');
    item.href='javascript:void(0)';
    item.className='bn-item mobile-primary';
    item.setAttribute('data-view','schedule');
    item.setAttribute('aria-label','Schedule');
    item.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="3"></rect><path d="M8 2v4M16 2v4M3 9h18M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"></path></svg><span>Schedule</span>';
    item.addEventListener('click',function(){
      var sourceNow=document.querySelector('.nav-item[data-view="schedule"]');
      if(sourceNow) sourceNow.click();
      else if(typeof window.nav==='function') window.nav(item);
    });
    return item;
  }

  function normalizeBottomNav(){
    if(window.innerWidth > 960) return;
    var nav=document.querySelector('.bottom-nav');
    if(!nav) return;

    var all=Array.from(nav.querySelectorAll('.bn-item'));
    var home=all.find(function(el){return el.getAttribute('data-view')==='dashboard' || /^home$/i.test((el.textContent||'').trim());});
    var activity=all.find(function(el){return el.getAttribute('data-view')==='activities' || /^activity$/i.test((el.textContent||'').trim());});
    var profile=all.find(function(el){return el.getAttribute('data-view')==='profile' || /^profile$/i.test((el.textContent||'').trim());});
    var social=all.find(function(el){return el.hasAttribute('data-aez-social') || /^social$/i.test((el.textContent||'').trim());});

    if(!social){
      social=document.querySelector('[data-aez-social]');
      if(social && !social.classList.contains('bn-item')) social.classList.add('bn-item');
    }

    var schedule=makeScheduleItem();
    var ordered=[home,activity,schedule,social,profile].filter(Boolean);

    /* Hide More, Intel, and any other extra bottom-nav entries. */
    all.forEach(function(el){
      el.classList.remove('mobile-primary');
      el.style.display='none';
    });

    ordered.forEach(function(el){
      el.classList.add('mobile-primary');
      el.style.display='flex';
      el.style.width='100%';
      el.style.minWidth='0';
      el.style.flex='1 1 0';
      nav.appendChild(el);
    });

    Array.from(nav.children).forEach(function(el){
      if(!ordered.includes(el)) el.style.display='none';
    });

    nav.style.display='grid';
    nav.style.gridTemplateColumns='repeat(5,minmax(0,1fr))';
    nav.style.gridAutoFlow='column';
    nav.style.overflowX='hidden';
  }

  function observe(){
    if(observerBusy) return;
    observerBusy=true;
    loadMobileCascade();
    cleanupSocialShortcut();
    removeUnwantedUI();
    normalizeBottomNav();
    closeSocialOnNavigation();
    observerBusy=false;
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',observe,{once:true});
  }else{
    observe();
  }

  if(window.MutationObserver){
    var observer=new MutationObserver(function(){
      if(observerBusy) return;
      window.requestAnimationFrame(observe);
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  window.addEventListener('resize',observe);
})();