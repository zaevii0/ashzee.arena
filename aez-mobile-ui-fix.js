/* ÆZ Arena — mobile UI reliability layer */
(function(){
  'use strict';

  function removeUnwantedUI(){
    ['themeToggle','mobileInstallCard','pwaGuide'].forEach(function(id){
      var el=document.getElementById(id); if(el) el.remove();
    });
    document.querySelectorAll('.mobile-install-card,.mobile-install-btn,.pwa-guide-veil').forEach(function(el){el.remove();});
  }

  function closeSocialOnNavigation(){
    if(window.__aezSocialNavBound) return;
    window.__aezSocialNavBound=true;
    document.addEventListener('click',function(e){
      var target=e.target.closest('[data-view], .nav-item, .bn-item');
      if(!target || target.hasAttribute('data-aez-social')) return;
      var social=document.getElementById('aezSocial'); if(social) social.classList.remove('open');
    },true);
  }

  function normalizeBottomNav(){
    var nav=document.querySelector('.bottom-nav'); if(!nav) return;
    var items=Array.from(nav.querySelectorAll('.bn-item'));
    var find=function(test){return items.find(test)||null;};
    var home=find(function(el){return el.getAttribute('data-view')==='dashboard' || /^home$/i.test((el.textContent||'').trim());});
    var activity=find(function(el){return el.getAttribute('data-view')==='activities' || /^activity$/i.test((el.textContent||'').trim());});
    var profile=find(function(el){return el.getAttribute('data-view')==='profile' || /^profile$/i.test((el.textContent||'').trim());});
    var social=find(function(el){return el.hasAttribute('data-aez-social') || /^social$/i.test((el.textContent||'').trim());});
    var schedule=find(function(el){return el.getAttribute('data-view')==='schedule' || /^schedule$/i.test((el.textContent||'').trim());});

    if(!social){
      social=document.querySelector('.bottom-nav [data-aez-social], [data-aez-social]');
      if(social && !social.classList.contains('bn-item')) social.classList.add('bn-item');
    }
    if(!schedule){
      var source=document.querySelector('.nav-item[data-view="schedule"]');
      if(source){
        schedule=source.cloneNode(true);
        schedule.classList.remove('nav-item','active');
        schedule.classList.add('bn-item');
        schedule.removeAttribute('data-aez-social');
        schedule.removeAttribute('aria-current');
        schedule.onclick=function(){var original=document.querySelector('.nav-item[data-view="schedule"]');if(original) original.click();};
      }
    }

    var ordered=[home,activity,schedule,social,profile].filter(Boolean);
    items.forEach(function(el){el.style.display='none';el.classList.remove('mobile-primary');});
    ordered.forEach(function(el){
      el.classList.add('mobile-primary'); el.style.display='flex'; el.style.width='100%'; el.style.minWidth='0'; el.style.flex='none';
      el.style.height='58px'; el.style.margin='0'; el.style.borderRadius='14px'; nav.appendChild(el);
    });
    nav.querySelectorAll('.bn-more').forEach(function(el){el.remove();});
    nav.style.display='grid'; nav.style.gridTemplateColumns='repeat(5,minmax(0,1fr))'; nav.style.overflow='hidden'; nav.style.gap='4px';
  }

  function addUnifiedNavStyle(){
    if(document.getElementById('aezUnifiedBottomNavStyle')) return;
    var style=document.createElement('style'); style.id='aezUnifiedBottomNavStyle';
    style.textContent=`
@media(max-width:960px){
body.authenticated .bottom-nav{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:4px!important;padding:6px!important;overflow:hidden!important;background:rgba(8,9,11,.88)!important;border:1px solid rgba(211,179,103,.18)!important;border-radius:18px!important;backdrop-filter:blur(24px)!important;-webkit-backdrop-filter:blur(24px)!important;box-shadow:0 -10px 35px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.04)!important;}
body.authenticated .bottom-nav .bn-item.mobile-primary{display:flex!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;gap:4px!important;width:100%!important;min-width:0!important;height:58px!important;padding:5px 2px!important;margin:0!important;border-radius:14px!important;border:1px solid rgba(211,179,103,.14)!important;background:rgba(255,255,255,.035)!important;color:#8e8a82!important;box-shadow:none!important;font-size:9px!important;letter-spacing:.02em!important;backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important;transition:background .2s ease,border-color .2s ease,color .2s ease,transform .2s ease!important;}
body.authenticated .bottom-nav .bn-item.mobile-primary svg{width:19px!important;height:19px!important;opacity:.82!important;}
body.authenticated .bottom-nav .bn-item.mobile-primary.active{color:#d5b66d!important;background:rgba(211,179,103,.10)!important;border-color:rgba(211,179,103,.34)!important;box-shadow:inset 0 0 18px rgba(211,179,103,.045),0 3px 14px rgba(0,0,0,.18)!important;}
body.authenticated .bottom-nav .bn-item.mobile-primary.active svg{opacity:1!important;}
body.authenticated .bottom-nav .bn-more{display:none!important;}
}
@media(max-width:430px){body.authenticated .bottom-nav{gap:2px!important;padding:5px!important;border-radius:16px!important;}body.authenticated .bottom-nav .bn-item.mobile-primary{height:55px!important;border-radius:12px!important;font-size:8.5px!important;}body.authenticated .bottom-nav .bn-item.mobile-primary svg{width:18px!important;height:18px!important;}}
`;
    document.head.appendChild(style);
  }

  function observe(){
    removeUnwantedUI(); addUnifiedNavStyle(); normalizeBottomNav(); closeSocialOnNavigation();
    if(window.MutationObserver){new MutationObserver(function(){removeUnwantedUI();addUnifiedNavStyle();normalizeBottomNav();}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',observe); else observe();
  window.addEventListener('resize',normalizeBottomNav);
})();