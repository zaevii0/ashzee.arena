/* ÆZ Arena — mobile UI reliability + final mobile noir layer */
(function(){
'use strict';

function loadMobileCascade(){
  if(window.innerWidth > 700) return;
  if(document.getElementById('aezMobileCascade')) return;

  var link=document.createElement('link');
  link.id='aezMobileCascade';
  link.rel='stylesheet';
  link.href='./mobile-responsive.css?v=20260915-mobile';
  document.head.appendChild(link);

  var style=document.createElement('style');
  style.id='aezMobileFinalStyle';
  style.textContent=`
@media (max-width:700px){
  body.authenticated{background:#070707!important;color:#f3f0e8!important}
  body.authenticated #app{display:block!important;width:100%!important;max-width:100%!important;min-height:100dvh!important;overflow-x:hidden!important;background:transparent!important}
  body.authenticated .sidebar{display:none!important}
  body.authenticated .main{width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;padding:0!important}
  .topbar{height:60px!important;min-height:60px!important;padding:0 14px!important;background:rgba(10,10,10,.88)!important;border-bottom:1px solid rgba(214,174,92,.16)!important;backdrop-filter:blur(24px) saturate(140%)!important;-webkit-backdrop-filter:blur(24px) saturate(140%)!important}
  .top-mark{color:#e7d4a1!important;letter-spacing:.18em!important;font-weight:700!important}
  .content,.main-content,.page-content{width:100%!important;max-width:none!important;padding:17px 14px 104px!important;box-sizing:border-box!important}
  .page-head{margin:3px 0 14px!important}
  .page-head h1{font-size:22px!important;color:#f2efe7!important}
  .page-head .page-sub{color:#8f8a80!important}
  .grid{display:grid!important;grid-template-columns:1fr!important;gap:12px!important}
  .grid>*{grid-column:1/-1!important;min-width:0!important}
  .card{width:100%!important;min-width:0!important;box-sizing:border-box!important;padding:16px!important;border-radius:18px!important;background:linear-gradient(145deg,rgba(28,27,25,.84),rgba(12,12,12,.92))!important;border:1px solid rgba(214,174,92,.14)!important;box-shadow:0 14px 40px rgba(0,0,0,.30),inset 0 1px rgba(255,255,255,.035)!important}
  .welcome-card{min-height:210px!important;background:radial-gradient(circle at 82% 18%,rgba(214,174,92,.20),transparent 34%),linear-gradient(135deg,rgba(12,12,11,.82),rgba(10,10,10,.94))!important;border-color:rgba(214,174,92,.20)!important}
  .welcome-card h2{font-size:23px!important;color:#f3eee1!important}
  .stat-value{color:#f3eee1!important}.stat-delta{color:#d6ae5c!important}
  body.authenticated .bottom-nav{display:flex!important;position:fixed!important;left:10px!important;right:10px!important;bottom:calc(9px + env(safe-area-inset-bottom))!important;width:auto!important;height:66px!important;min-height:66px!important;padding:6px!important;gap:3px!important;overflow:hidden!important;border:1px solid rgba(214,174,92,.16)!important;border-radius:21px!important;background:rgba(15,14,13,.93)!important;box-shadow:0 20px 60px rgba(0,0,0,.62),inset 0 1px rgba(255,255,255,.055)!important;backdrop-filter:blur(28px) saturate(150%)!important;-webkit-backdrop-filter:blur(28px) saturate(150%)!important;z-index:10050!important}
  body.authenticated .bottom-nav .bn-item{flex:1 1 0!important;min-width:0!important;width:auto!important;height:52px!important;min-height:52px!important;padding:5px 2px!important;border:0!important;border-radius:15px!important;color:#77736b!important;font-size:9px!important;letter-spacing:.05em!important;background:transparent!important;display:flex!important;align-items:center!important;justify-content:center!important}
  body.authenticated .bottom-nav .bn-item.active{color:#e0bd73!important;background:rgba(214,174,92,.11)!important;box-shadow:inset 0 1px rgba(255,255,255,.04)!important}
  .field input,.field select,.rules-search,.admin-search-input,.admin-search-category,textarea{min-height:46px!important;font-size:16px!important;border-radius:14px!important}
  button,.btn,.button,.action-btn,.enter-full,.admin-page-btn,.admin-btn{min-height:46px!important}
  .filter-row,.rank-tabs,.tabs-row,.week-toggle{max-width:100%!important;overflow-x:auto!important;scrollbar-width:none!important}
  .filter-row::-webkit-scrollbar,.rank-tabs::-webkit-scrollbar,.tabs-row::-webkit-scrollbar,.week-toggle::-webkit-scrollbar{display:none!important}
  #aezSocial{padding:0!important;color:#eee9df!important;background:radial-gradient(circle at 80% 0%,rgba(214,174,92,.10),transparent 32%),linear-gradient(145deg,#11100e,#080808 75%)!important;overflow:auto!important}
  #aezSocial .sx{width:100%!important;max-width:none!important;min-height:100dvh!important;margin:0!important;border-radius:0!important;background:linear-gradient(145deg,rgba(25,24,21,.98),rgba(9,9,9,.99))!important;border:1px solid rgba(214,174,92,.22)!important;box-shadow:0 30px 100px rgba(0,0,0,.75)!important}
  #aezSocial .sx-head{position:sticky!important;top:0!important;z-index:5!important;padding:14px!important;background:rgba(18,17,15,.94)!important;border-bottom:1px solid rgba(214,174,92,.14)!important}
  #aezSocial .sx-title{color:#ead7aa!important}.sx-sub{color:#817965!important}
  #aezSocial .sx-close{color:#ead7aa!important;background:rgba(214,174,92,.06)!important;border-color:rgba(214,174,92,.22)!important}
  #aezSocial .sx-tabs{padding:10px!important;gap:6px!important;border-bottom-color:rgba(214,174,92,.10)!important;background:rgba(10,10,9,.55)!important;-webkit-overflow-scrolling:touch!important}
  #aezSocial .sx-tab{min-height:42px!important;padding:9px 12px!important;font-size:12px!important;color:#8d877b!important;background:rgba(255,255,255,.025)!important;border-color:rgba(214,174,92,.10)!important;white-space:nowrap!important}
  #aezSocial .sx-tab.on{color:#16130e!important;background:linear-gradient(135deg,#e8d08f,#b68a3f)!important;border-color:#d6ae5c!important;box-shadow:0 7px 22px rgba(214,174,92,.18)!important}
  #aezSocial .sx-body{padding:14px!important;background:transparent!important}
  #aezSocial .sx-grid{grid-template-columns:1fr!important;gap:12px!important}
  #aezSocial .sx-card{border-radius:15px!important;padding:14px!important;background:linear-gradient(145deg,rgba(31,29,25,.94),rgba(13,13,13,.96))!important;border-color:rgba(214,174,92,.14)!important;box-shadow:0 16px 44px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.035)!important}
  #aezSocial .sx-input,#aezSocial .sx-text{background:rgba(5,5,5,.72)!important;border-color:rgba(214,174,92,.13)!important;color:#f1eee7!important;font-size:16px!important}
  #aezSocial .sx-input:focus,#aezSocial .sx-text:focus{outline:none!important;border-color:rgba(214,174,92,.48)!important;box-shadow:0 0 0 3px rgba(214,174,92,.08)!important}
  #aezSocial .sx-btn{min-height:44px!important;color:#17130b!important;background:linear-gradient(135deg,#e8d08f,#b68a3f)!important;border-color:#d6ae5c!important;box-shadow:0 8px 24px rgba(214,174,92,.14)!important}
  #aezSocial .sx-btn.alt{color:#d9d0bd!important;background:rgba(255,255,255,.035)!important;border-color:rgba(214,174,92,.14)!important;box-shadow:none!important}
  #aezSocial .sx-meta,#aezSocial .sx-empty{color:#777268!important}#aezSocial .sx-author{color:#f0e8d9!important}#aezSocial .sx-badge{color:#c5a45e!important}
  #aezSocial .sx-post{border-top-color:rgba(214,174,92,.09)!important}#aezSocial .sx-comments{border-left-color:rgba(214,174,92,.18)!important}
  #aezSocial .sx-mini{min-height:44px!important;color:#a9a193!important;background:rgba(255,255,255,.025)!important;border-color:rgba(214,174,92,.10)!important}
  #aezSocial .sx-item{background:rgba(255,255,255,.025)!important;border-color:rgba(214,174,92,.11)!important}
}
@media(max-width:380px){
  .content,.main-content,.page-content{padding-left:11px!important;padding-right:11px!important}
  body.authenticated .bottom-nav{left:7px!important;right:7px!important;border-radius:19px!important}
  #aezSocial .sx-body{padding:11px!important}#aezSocial .sx-head{padding:12px!important}
}
`;
  document.head.appendChild(style);
}

function installSocialShortcut(){
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
  document.head.appendChild(s);
  document.body.appendChild(b);
}

function cleanup(){
  var b=document.getElementById('aezMobileSocial');
  if(b&&(window.innerWidth>700||!document.body.classList.contains('authenticated'))) b.remove();
}

function observe(){
  loadMobileCascade();
  installSocialShortcut();
  cleanup();
  new MutationObserver(function(){loadMobileCascade();installSocialShortcut();cleanup();}).observe(document.body,{attributes:true,childList:true,subtree:true,attributeFilter:['class']});
  window.addEventListener('resize',function(){loadMobileCascade();installSocialShortcut();cleanup();});
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',observe); else observe();
})();