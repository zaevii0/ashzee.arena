/* ÆZ Arena — mobile UI reliability layer */
(function(){
  'use strict';
  function install(){
    if(window.innerWidth>700 || !document.body.classList.contains('authenticated')) return;
    if(document.getElementById('aezMobileSocial')) return;
    var target=document.querySelector('[data-aez-social]');
    if(!target) return;
    var b=document.createElement('button');
    b.id='aezMobileSocial';
    b.type='button';
    b.textContent='◈ Social';
    b.setAttribute('aria-label','Open ÆZ Social Intelligence');
    b.onclick=function(){target.click();};
    var s=document.createElement('style');
    s.id='aezMobileSocialStyle';
    s.textContent='#aezMobileSocial{position:fixed;left:12px;bottom:calc(76px + env(safe-area-inset-bottom));z-index:10060;min-height:46px;padding:11px 15px;border-radius:15px;border:1px solid rgba(255,255,255,.14);background:rgba(22,23,26,.94);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);color:#f4f4f2;font:600 13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 14px 45px rgba(0,0,0,.5);display:block}';
    document.head.appendChild(s);
    document.body.appendChild(b);
  }
  function observe(){
    install();
    new MutationObserver(function(){install();}).observe(document.body,{attributes:true,childList:true,subtree:true,attributeFilter:['class']});
    window.addEventListener('resize',function(){var b=document.getElementById('aezMobileSocial');if(b)b.style.display=window.innerWidth<=700&&document.body.classList.contains('authenticated')?'block':'none';});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe);else observe();
})();
