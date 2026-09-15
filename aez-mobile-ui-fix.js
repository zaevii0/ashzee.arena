/* ÆZ Arena — mobile UI reliability layer */
(function(){
  'use strict';

  var NAV_LABELS = ['Home','Activity','Schedule','Social','Profile'];

  function removeUnwantedUI(){
    ['themeToggle','mobileInstallCard','pwaGuide'].forEach(function(id){
      var el=document.getElementById(id);
      if(el) el.remove();
    });
    document.querySelectorAll('.mobile-install-card,.mobile-install-btn,.pwa-guide-veil').forEach(function(el){el.remove();});
  }

  function closeSocialOnNavigation(){
    if(window.__aezSocialNavBound) return;
    window.__aezSocialNavBound=true;
    document.addEventListener('click',function(e){
      var target=e.target.closest('[data-view],.nav-item,.bn-item');
      if(!target || target.hasAttribute('data-aez-social')) return;
      var social=document.getElementById('aezSocial');
      if(social) social.classList.remove('open');
    },true);
  }

  function isNamed(el,name){
    if(!el) return false;
    var view=(el.getAttribute('data-view')||'').trim().toLowerCase();
    var text=(el.textContent||'').trim().toLowerCase();
    return view===name.toLowerCase() || text===name.toLowerCase();
  }

  function findNavItem(nav, selector, label){
    if(selector){
      var selected=nav.querySelector(selector);
      if(selected) return selected;
    }
    return Array.from(nav.querySelectorAll('.bn-item')).find(function(item){
      return isNamed(item,label);
    }) || null;
  }

  function makeScheduleItem(nav){
    var existing=nav.querySelector('.bn-item[data-view="schedule"]');
    if(existing) return existing;

    var source=document.querySelector('.nav-item[data-view="schedule"],[data-view="schedule"]');
    if(source && source.parentElement===nav) return source;

    if(source){
      var item=source.cloneNode(true);
      item.classList.remove('nav-item','active','sidebar-item');
      item.classList.add('bn-item');
      item.removeAttribute('aria-current');
      item.removeAttribute('data-aez-social');
      item.setAttribute('data-view','schedule');
      item.setAttribute('aria-label','Schedule');
      item.onclick=function(e){
        e.preventDefault();
        var original=document.querySelector('.nav-item[data-view="schedule"],[data-view="schedule"]');
        if(original && original!==item) original.click();
        else if(typeof window.nav==='function') window.nav(item);
      };
      return item;
    }

    return null;
  }

  function normalizeBottomNav(){
    var nav=document.querySelector('.bottom-nav');
    if(!nav) return;

    var home=findNavItem(nav,'[data-view="dashboard"]','Home');
    var activity=findNavItem(nav,'[data-view="activities"]','Activity');
    var schedule=findNavItem(nav,'[data-view="schedule"]','Schedule') || makeScheduleItem(nav);
    var social=nav.querySelector('.bn-item[data-aez-social]') || nav.querySelector('[data-aez-social]');
    if(!social){
      social=document.querySelector('[data-aez-social]');
    }
    var profile=findNavItem(nav,'[data-view="profile"]','Profile');

    if(social && !social.classList.contains('bn-item')) social.classList.add('bn-item');

    var ordered=[home,activity,schedule,social,profile].filter(Boolean);
    var orderedSet=new Set(ordered);

    /* Hide all legacy destinations. Intel and More are intentionally removed. */
    nav.querySelectorAll('.bn-item,.bn-more').forEach(function(item){
      if(!orderedSet.has(item)){
        item.classList.remove('aez-ios-primary');
        item.style.display='none';
      }
    });

    /* Put the available destinations in the exact requested order. */
    ordered.forEach(function(item,index){
      if(!item.classList.contains('bn-item')) item.classList.add('bn-item');
      item.classList.add('aez-ios-primary');
      item.style.display='flex';
      item.style.order=String(index);
      item.style.width='100%';
      item.style.minWidth='0';
      item.style.flex='none';
      item.style.height='54px';
      item.style.margin='0';
      item.style.padding='4px 2px';
      item.style.borderRadius='14px';
      item.setAttribute('aria-label',NAV_LABELS[index]);
      if(item.parentElement!==nav) nav.appendChild(item);
    });

    nav.querySelectorAll('.bn-more').forEach(function(item){item.remove();});

    if(nav.dataset.aezNavLayout!=='5'){
      nav.style.display='grid';
      nav.style.gridTemplateColumns='repeat(5,minmax(0,1fr))';
      nav.style.gridTemplateRows='1fr';
      nav.style.gridAutoFlow='column';
      nav.style.overflow='hidden';
      nav.style.gap='4px';
      nav.dataset.aezNavLayout='5';
    }
  }

  function addUnifiedNavStyle(){
    if(document.getElementById('aezUnifiedBottomNavStyle')) return;
    var style=document.createElement('style');
    style.id='aezUnifiedBottomNavStyle';
    style.textContent=`
@media(max-width:960px){
  body.authenticated .bottom-nav{
    position:fixed!important;
    left:max(8px,env(safe-area-inset-left))!important;
    right:max(8px,env(safe-area-inset-right))!important;
    bottom:max(8px,env(safe-area-inset-bottom))!important;
    width:auto!important;
    height:64px!important;
    min-height:64px!important;
    display:grid!important;
    grid-template-columns:repeat(5,minmax(0,1fr))!important;
    grid-template-rows:1fr!important;
    gap:4px!important;
    padding:5px!important;
    overflow:hidden!important;
    box-sizing:border-box!important;
    z-index:10050!important;
    background:rgba(18,18,17,.82)!important;
    border:1px solid rgba(255,255,255,.10)!important;
    border-radius:20px!important;
    box-shadow:0 18px 50px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.07)!important;
    -webkit-backdrop-filter:blur(26px) saturate(145%)!important;
    backdrop-filter:blur(26px) saturate(145%)!important;
  }

  body.authenticated .bottom-nav .aez-ios-primary{
    appearance:none!important;
    -webkit-appearance:none!important;
    display:flex!important;
    flex-direction:column!important;
    align-items:center!important;
    justify-content:center!important;
    width:100%!important;
    min-width:0!important;
    height:54px!important;
    margin:0!important;
    padding:4px 2px!important;
    gap:3px!important;
    box-sizing:border-box!important;
    border:1px solid transparent!important;
    border-radius:15px!important;
    outline:none!important;
    background:transparent!important;
    color:rgba(232,228,218,.58)!important;
    font-family:inherit!important;
    font-size:9px!important;
    font-weight:600!important;
    line-height:1!important;
    letter-spacing:.025em!important;
    white-space:nowrap!important;
    overflow:hidden!important;
    text-decoration:none!important;
    transition:color .18s ease,background .18s ease,border-color .18s ease,transform .18s ease,box-shadow .18s ease!important;
    -webkit-tap-highlight-color:transparent!important;
    touch-action:manipulation!important;
  }

  body.authenticated .bottom-nav .aez-ios-primary:active{transform:scale(.94)!important;}

  body.authenticated .bottom-nav .aez-ios-primary svg{
    display:block!important;
    width:19px!important;
    height:19px!important;
    min-width:19px!important;
    min-height:19px!important;
    flex:0 0 19px!important;
    fill:none!important;
    stroke:currentColor!important;
    opacity:.82!important;
    transition:opacity .18s ease,transform .18s ease!important;
  }

  body.authenticated .bottom-nav .aez-ios-primary span{
    display:block!important;
    max-width:100%!important;
    overflow:hidden!important;
    text-overflow:ellipsis!important;
    line-height:1!important;
  }

  /* Every destination shares one iOS-style selected state. */
  body.authenticated .bottom-nav .aez-ios-primary.active,
  body.authenticated .bottom-nav .aez-ios-primary[aria-current="page"]{
    color:#e3c477!important;
    background:linear-gradient(145deg,rgba(224,194,122,.15),rgba(224,194,122,.055))!important;
    border-color:rgba(224,194,122,.22)!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 5px 16px rgba(0,0,0,.20)!important;
  }

  body.authenticated .bottom-nav .aez-ios-primary.active svg,
  body.authenticated .bottom-nav .aez-ios-primary[aria-current="page"] svg{
    opacity:1!important;
    transform:translateY(-1px)!important;
  }

  /* Social is intentionally identical to the other tabs. */
  body.authenticated .bottom-nav .aez-ios-primary[data-aez-social]{
    color:rgba(232,228,218,.58)!important;
    background:transparent!important;
    border-color:transparent!important;
    box-shadow:none!important;
  }
  body.authenticated .bottom-nav .aez-ios-primary[data-aez-social].active,
  body.authenticated .bottom-nav .aez-ios-primary[data-aez-social][aria-current="page"]{
    color:#e3c477!important;
    background:linear-gradient(145deg,rgba(224,194,122,.15),rgba(224,194,122,.055))!important;
    border-color:rgba(224,194,122,.22)!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 5px 16px rgba(0,0,0,.20)!important;
  }

  body.authenticated .bottom-nav .bn-more,
  body.authenticated .bottom-nav .bn-item:not(.aez-ios-primary){display:none!important;}

  .content,.main-content,.page-content{padding-bottom:92px!important;}
}

@media(max-width:430px){
  body.authenticated .bottom-nav{
    left:6px!important;
    right:6px!important;
    bottom:max(6px,env(safe-area-inset-bottom))!important;
    height:62px!important;
    min-height:62px!important;
    padding:4px!important;
    border-radius:19px!important;
    gap:2px!important;
  }
  body.authenticated .bottom-nav .aez-ios-primary{
    height:52px!important;
    border-radius:14px!important;
    font-size:8px!important;
    gap:2px!important;
  }
  body.authenticated .bottom-nav .aez-ios-primary svg{
    width:18px!important;
    height:18px!important;
    min-width:18px!important;
    min-height:18px!important;
    flex-basis:18px!important;
  }
}
`;
    document.head.appendChild(style);
  }

  function run(){
    removeUnwantedUI();
    addUnifiedNavStyle();
    normalizeBottomNav();
    closeSocialOnNavigation();
  }

  function observe(){
    run();
    if(window.MutationObserver && !window.__aezMobileObserver){
      window.__aezMobileObserver=true;
      var scheduled=false;
      var observer=new MutationObserver(function(){
        if(scheduled) return;
        scheduled=true;
        window.requestAnimationFrame(function(){
          scheduled=false;
          run();
        });
      });
      window.__aezMobileObserverInstance=observer;
      observer.observe(document.body,{childList:true,subtree:true});
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',observe,{once:true});
  }else{
    observe();
  }

  window.addEventListener('resize',normalizeBottomNav,{passive:true});
})();
