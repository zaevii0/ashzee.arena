/* ÆZ Arena — mobile UI reliability + final mobile noir layer */
(function(){
'use strict';

function loadMobileCascade(){
  if(window.innerWidth>700) return;
  if(document.getElementById('aezMobileCascade')) return;

  var link=document.createElement('link');
  link.id='aezMobileCascade';
  link.rel='stylesheet';
  link.href='./mobile-responsive.css?v=20260915-mobile';
  document.head.appendChild(link);

  var style=document.createElement('style');
  style.id='aezMobileFinalStyle';
  style.textContent=`
@media(max-width:700px){
body.authenticated #app{width:100vw!important;max-width:100vw!important;min-height:100vh!important;overflow-x:hidden!important;background:#090909!important}
body.authenticated .sidebar{display:none!important}
body.authenticated .main{width:100%!important;max-width:100%!important;margin:0!important}
body.authenticated .topbar{height:60px!important;min-height:60px!important;padding:0 14px!important;background:rgba(12,12,12,.94)!important;border-bottom:1px solid rgba(214,174,92,.16)!important;backdrop-filter:blur(22px)!important;-webkit-backdrop-filter:blur(22px)!important}
body.authenticated .content,body.authenticated .main-content,body.authenticated .page-content{width:100%!important;max-width:100%!important;padding:17px 14px 112px!important;box-sizing:border-box!important}
body.authenticated .grid{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:12px!important}
body.authenticated .grid>*{grid-column:1/-1!important;min-width:0!important}
body.authenticated .card{width:100%!important;box-sizing:border-box!important;border-radius:20px!important;border:1px solid rgba(214,174,92,.14)!important;background:linear-gradient(145deg,rgba(28,27,24,.96),rgba(12,12,12,.97))!important;box-shadow:0 18px 50px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.035)!important}
body.authenticated .welcome-card{min-height:210px!important;background:radial-gradient(circle at 90% 15%,rgba(214,174,92,.16),transparent 35%),linear-gradient(145deg,#211d16,#0c0c0c 70%)!important}
body.authenticated input,body.authenticated select,body.authenticated textarea,body.authenticated button{min-height:46px!important;font-size:16px!important}
body.authenticated .table-wrap{width:100%!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important}
body.authenticated .bottom-nav{display:flex!important;position:fixed!important;left:10px!important;right:10px!important;bottom:calc(10px + env(safe-area-inset-bottom))!important;height:66px!important;padding:7px!important;z-index:10050!important;border:1px solid rgba(214,174,92,.18)!important;border-radius:21px!important;background:rgba(15,15,14,.94)!important;backdrop-filter:blur(24px)!important;-webkit-backdrop-filter:blur(24px)!important;box-shadow:0 20px 60px rgba(0,0,0,.55)!important}
body.authenticated .bottom-nav .bn-item{flex:1!important;min-width:0!important;border-radius:16px!important;color:#77736a!important;background:transparent!important;border:0!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;font-size:10px!important;font-weight:700!important;letter-spacing:.04em!important}
body.authenticated .bottom-nav .bn-item.active{color:#e7d4a5!important;background:linear-gradient(145deg,rgba(214,174,92,.18),rgba(214,174,92,.05))!important;border:1px solid rgba(214,174,92,.24)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)!important}
#aezSocial{color:#eee9df!important;background:radial-gradient(circle at 80% 0%,rgba(214,174,92,.10),transparent 32%),linear-gradient(145deg,#11100e,#080808 75%)!important}
#aezSocial .sx{background:linear-gradient(145deg,rgba(25,24,21,.98),rgba(9,9,9,.99))!important;border:1px solid rgba(214,174,92,.22)!important;box-shadow:0 30px 100px rgba(0,0,0,.75)!important}
#aezSocial .sx-head{background:rgba(18,17,15,.94)!important;border-bottom:1px solid rgba(214,174,92,.14)!important}
#aezSocial .sx-title{color:#ead7aa!important}
#aezSocial .sx-sub{color:#817965!important}
#aezSocial .sx-close{color:#ead7aa!important;background:rgba(214,174,92,.06)!important;border-color:rgba(214,174,92,.22)!important}
#aezSocial .sx-tabs{border-bottom-color:rgba(214,174,92,.10)!important;background:rgba(10,10,9,.55)!important}
#aezSocial .sx-tab{color:#8d877b!important;background:rgba(255,255,255,.025)!important;border-color:rgba(214,174,92,.10)!important}
#aezSocial .sx-tab.on{color:#16130e!important;background:linear-gradient(135deg,#e8d08f,#b68a3f)!important;border-color:#d6ae5c!important;box-shadow:0 7px 22px rgba(214,174,92,.18)!important}
#aezSocial .sx-body{background:transparent!important}
#aezSocial .sx-card{background:linear-gradient(145deg,rgba(31,29,25,.94),rgba(13,13,13,.96))!important;border-color:rgba(214,174,92,.14)!important;box-shadow:0 16px 44px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.035)!important}
#aezSocial .sx-input,#aezSocial .sx-text{background:rgba(5,5,5,.72)!important;border-color:rgba(214,174,92,.13)!important;color:#f1eee7!important}
#aezSocial .sx-input:focus,#aezSocial .sx-text:focus{outline:none!important;border-color:rgba(214,174,92,.48)!important;box-shadow:0 0 0 3px rgba(214,174,92,.08)!important}
#aezSocial .sx-btn{color:#17130b!important;background:linear-gradient(135deg,#e8d08f,#b68a3f)!important;border-color:#d6ae5c!important;box-shadow:0 8px 24px rgba(214,174,92,.14)!important}
#aezSocial .sx-btn.alt{color:#d9d0bd!important;background:rgba(255,255,255,.035)!important;border-color:rgba(214,174,92,.14)!important;box-shadow:none!important}
#aezSocial .sx-meta,#aezSocial .sx-empty{color:#777268!important}
#aezSocial .sx-author{color:#f0e8d9!important}
#aezSocial .sx-badge{color:#c5a45e!important}
#aezSocial .sx-post{border-top-color:rgba(214,174,92,.09)!important}
#aezSocial .sx-mini{color:#a9a193!important;background:rgba(255,255,255,.025)!important;border-color:rgba(214,174,92,.10)!important}
#aezSocial .sx-mini:hover{color:#ead7aa!important;border-color:rgba(214,174,92,.28)!important;background:rgba(214,174,92,.06)!important}
#aezSocial .sx-comments{border-left-color:rgba(214,174,92,.18)!important}
#aezSocial .sx-item{background:rgba(255,255,255,.025)!important;border-color:rgba(214,174,92,.11)!important}
}
@media(max-width:700px){#aezSocial{padding:0!important;overflow:auto!important}#aezSocial .sx{width:100%!important;max-width:none!important;min-height:100dvh!important;margin:0!important;border-radius:0!important}#aezSocial .sx-head{position:sticky!important;top:0!important;z-index:5!important;padding:14px!important}#aezSocial .sx-body{padding:14px!important}#aezSocial .sx-grid{grid-template-columns:1fr!important;gap:12px!important}#aezSocial .sx-card{border-radius:15px!important;padding:14px!important}#aezSocial .sx-tabs{padding:10px!important;gap:6px!important;-webkit-overflow-scrolling:touch!important}#aezSocial .sx-tab{min-height:42px!important;padding:9px 12px!important;font-size:12px!important}#aezSocial .sx-row{flex-wrap:wrap!important}#aezSocial .sx-btn,#aezSocial .sx-mini{min-height:44px!important}#aezSocial input,#aezSocial textarea{font-size:16px!important}}
@media(max-width:380px){body.authenticated .content,body.authenticated .main-content,body.authenticated .page-content{padding-left:11px!important;padding-right:11px!important}#aezSocial .sx-body{padding:11px!important}#aezSocial .sx-head{padding:12px!important}}
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