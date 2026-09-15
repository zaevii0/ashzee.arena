/* ÆZ MOBILE UI FIX — keeps mobile navigation compact, consistent and touch-friendly. */
(function(){
  'use strict';

  function removeUnwantedUI(){
    ['themeToggle','mobileInstallCard','pwaGuide'].forEach(function(id){
      var el=document.getElementById(id); if(el) el.remove();
    });
    document.querySelectorAll('.mobile-install-card,.mobile-install-btn,.pwa-guide-veil').forEach(function(el){el.remove();});
  }

  function closeSocialOnNavigation(){
    document.addEventListener('click',function(e){
      var target=e.target.closest('[data-view], .nav-item, .bn-item');
      if(!target || target.hasAttribute('data-aez-social')) return;
      var social=document.getElementById('aezSocial');
      if(social) social.classList.remove('open');
    },true);
  }

  function normalizeBottomNav(){
    var nav=document.querySelector('.bottom-nav');
    if(!nav) return;

    var items=Array.from(nav.querySelectorAll('.bn-item'));
    var social=items.find(function(el){return el.hasAttribute('data-aez-social') || /social/i.test(el.textContent||'');});
    var profile=items.find(function(el){return el.getAttribute('data-view')==='profile' || /^profile$/i.test((el.textContent||'').trim());});
    var home=items.find(function(el){return el.getAttribute('data-view')==='dashboard' || /^home$/i.test((el.textContent||'').trim());});
    var activity=items.find(function(el){return el.getAttribute('data-view')==='activities' || /^activity$/i.test((el.textContent||'').trim());});
    var schedule=items.find(function(el){return el.getAttribute('data-view')==='schedule' || /^schedule$/i.test((el.textContent||'').trim());});

    /* If Social is injected dynamically, keep it in the bar. */
    if(!social){
      social=document.querySelector('[data-aez-social]');
      if(social && !social.classList.contains('bn-item')) social.classList.add('bn-item');
    }

    /* Reuse an existing schedule destination if one exists elsewhere. */
    if(!schedule){
      var source=document.querySelector('.nav-item[data-view="schedule"], [data-view="schedule"]');
      if(source && source!==nav){
        schedule=source.cloneNode(true);
        schedule.classList.remove('nav-item','active');
        schedule.classList.add('bn-item');
        schedule.removeAttribute('data-aez-social');
        schedule.onclick=function(){
          var original=document.querySelector('.nav-item[data-view="schedule"]');
          if(original && original!==schedule) original.click();
          else if(typeof nav==='function') nav(schedule);
        };
      }
    }

    /* Remove/hide every non-primary item, especially More. */
    items.forEach(function(el){
      el.classList.remove('mobile-primary');
      el.style.display='none';
    });

    var ordered=[home,activity,schedule,social,profile].filter(Boolean);
    ordered.forEach(function(el){
      el.classList.add('mobile-primary');
      el.style.display='flex';
      nav.appendChild(el);
    });

    /* Any remaining item is not part of the five-button mobile bar. */
    Array.from(nav.children).forEach(function(el){
      if(!ordered.includes(el)) el.style.display='none';
    });

    nav.style.gridTemplateColumns='repeat(5,minmax(0,1fr))';
    nav.style.display='grid';
    nav.style.overflowX='hidden';
    ordered.forEach(function(el){
      el.style.width='100%';
      el.style.minWidth='0';
      el.style.flex='none';
    });
  }

  function addNavInfoPanel(){
    if(document.getElementById('aezNavInfo')) return;
    var style=document.createElement('style');
    style.id='aezNavInfoStyle';
    style.textContent='@media(max-width:960px){#aezNavInfo{position:fixed;left:12px;right:12px;bottom:84px;z-index:120;display:none;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:10px;border:1px solid rgba(211,179,103,.28);border-radius:16px;background:rgba(12,13,15,.94);backdrop-filter:blur(24px);box-shadow:0 18px 55px rgba(0,0,0,.55)}#aezNavInfo.open{display:grid}.aez-nav-info-item{padding:10px 9px;border:1px solid rgba(211,179,103,.12);border-radius:11px;color:#ddd5c4;background:rgba(255,255,255,.035)}.aez-nav-info-item b{display:block;color:#d5b66d;font-size:10px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:3px}.aez-nav-info-item span{font-size:10px;color:#aaa49a;line-height:1.35}.aez-nav-info-close{grid-column:1/-1;text-align:center;color:#d5b66d;font-size:10px;letter-spacing:.12em;text-transform:uppercase;padding:6px;cursor:pointer}}';
    document.head.appendChild(style);
    var panel=document.createElement('div');
    panel.id='aezNavInfo';
    panel.innerHTML='<div class="aez-nav-info-item"><b>Home</b><span>Dashboard and arena overview.</span></div><div class="aez-nav-info-item"><b>Activity</b><span>Activities, records and updates.</span></div><div class="aez-nav-info-item"><b>Schedule</b><span>Upcoming events and arena schedule.</span></div><div class="aez-nav-info-item"><b>Social</b><span>Timeline, groups and messages.</span></div><div class="aez-nav-info-item"><b>Profile</b><span>Your account and personal details.</span></div><div class="aez-nav-info-close" onclick="document.getElementById(\'aezNavInfo\').classList.remove(\'open\')">Close</div>';
    document.body.appendChild(panel);

    document.addEventListener('click',function(e){
      var hamburger=e.target.closest('.mobile-menu-btn,[aria-label*="menu" i],[aria-label*="hamburger" i],.hamburger');
      if(!hamburger) return;
      setTimeout(function(){panel.classList.toggle('open');},0);
    },true);
  }

  function observe(){
    removeUnwantedUI();
    normalizeBottomNav();
    addNavInfoPanel();
    closeSocialOnNavigation();
    if(window.MutationObserver){
      var observer=new MutationObserver(function(){
        removeUnwantedUI();
        normalizeBottomNav();
      });
      observer.observe(document.body,{childList:true,subtree:true});
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',observe); else observe();
  window.addEventListener('resize',normalizeBottomNav);
})();