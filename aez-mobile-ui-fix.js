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
  s.textContent='#aezMobileSocial{position:fixed;left:12px;bottom:calc(82px + env(safe-area-inset-bottom));z-index:10060;min-height:46px;padding:11px 15px;border-radius:15px;border:1px solid rgba(214,174,92,.20);background:rgba(18,17,15,.95);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);color:#ead7aa;font:600 13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 14px 45px rgba(0,0,0,.5);display:block;cursor:pointer;-webkit-tap-highlight-color:transparent}#aezMobileSocial:active{transform:scale(.97)}@media(min-width:701px){#aezMobileSocial{display:none!important}}';
  if(!document.getElementById('aezMobileSocialStyle')) document.head.appendChild(s);
  document.body.appendChild(b);
}

function removeWhenDesktop(){
  var b=document.getElementById('aezMobileSocial');
  if(!b) return;
  if(window.innerWidth>700 || !document.body.classList.contains('authenticated')) b.remove();
}

function observe(){
  install();
  removeWhenDesktop();
  new MutationObserver(function(){install();removeWhenDesktop();}).observe(document.body,{attributes:true,childList:true,subtree:true,attributeFilter:['class']});
  window.addEventListener('resize',function(){install();removeWhenDesktop();});
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',observe); else observe();
})();
