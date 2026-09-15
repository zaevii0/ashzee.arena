/* ÆZ Arena — mobile UI reliability + final mobile noir layer */
(function(){
  'use strict';

  /* The desktop design-system stylesheet is loaded after mobile-responsive.css.
     Re-inject the mobile stylesheet at runtime so the phone layout is the final
     cascade layer instead of being partially overridden by the desktop skin. */
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
  /* True phone-first ÆZ shell */
  body.authenticated{background:#070707!important;color:#f3f0e8!important;}
  body.authenticated #app{display:block!important;width:100%!important;min-height:100dvh!important;background:transparent!important;}
  body.authenticated .sidebar{display:none!important;}
  body.authenticated .main{width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;padding:0!important;}

  .topbar{
    height:60px!important;min-height:60px!important;padding:0 14px!important;
    background:rgba(10,10,10,.84)!important;
    border-bottom:1px solid rgba(214,174,92,.16)!important;
    backdrop-filter:blur(24px) saturate(140%)!important;
    -webkit-backdrop-filter:blur(24px) saturate(140%)!important;
  }
  .top-mark{color:#e7d4a1!important;letter-spacing:.18em!important;font-weight:700!important;}
  .top-right{gap:6px!important;}
  .icon-btn,.avatar-chip{
    background:rgba(255,255,255,.045)!important;
    border:1px solid rgba(255,255,255,.09)!important;
    color:#e8e4da!important;
  }

  .content,.main-content,.page-content{
    width:100%!important;max-width:none!important;padding:17px 14px 104px!important;
  }
  .page-head{margin:3px 0 14px!important;}
  .page-head h1{font-size:22px!important;letter-spacing:-.025em!important;color:#f2efe7!important;}
  .page-head .page-sub{color:#8f8a80!important;}

  /* Cards become floating noir glass panels, not compressed desktop cards. */
  .grid{display:grid!important;grid-template-columns:1fr!important;gap:12px!important;}
  .grid>*{grid-column:1/-1!important;}
  .card{
    width:100%!important;min-width:0!important;padding:16px!important;
    border-radius:18px!important;
    background:linear-gradient(145deg,rgba(28,27,25,.82),rgba(12,12,12,.88))!important;
    border:1px solid rgba(255,255,255,.075)!important;
    box-shadow:0 14px 40px rgba(0,0,0,.30),inset 0 1px rgba(255,255,255,.035)!important;
  }
  .welcome-card{
    min-height:210px!important;
    background:
      linear-gradient(135deg,rgba(12,12,11,.78),rgba(10,10,10,.90)),
      radial-gradient(circle at 82% 18%,rgba(214,174,92,.20),transparent 34%)!important;
    border-color:rgba(214,174,92,.20)!important;
  }
  .welcome-card h2{font-size:23px!important;color:#f3eee1!important;}
  .stat-value{color:#f3eee1!important;}
  .stat-delta{color:#d6ae5c!important;}
  .list-row:hover{background:rgba(214,174,92,.05)!important;}
  .list-icon{background:rgba(214,174,92,.09)!important;color:#d6ae5c!important;}

  /* Correct selectors for the actual iOS tab-bar markup: .bn-item */
  body.authenticated .bottom-nav{
    display:flex!important;position:fixed!important;left:10px!important;right:10px!important;
    bottom:calc(9px + env(safe-area-inset-bottom))!important;width:auto!important;
    height:66px!important;min-height:66px!important;padding:6px!important;
    gap:3px!important;overflow:hidden!important;
    border:1px solid rgba(214,174,92,.16)!important;border-radius:21px!important;
    background:rgba(15,14,13,.91)!important;
    box-shadow:0 20px 60px rgba(0,0,0,.62),inset 0 1px rgba(255,255,255,.055)!important;
    backdrop-filter:blur(28px) saturate(150%)!important;
    -webkit-backdrop-filter:blur(28px) saturate(150%)!important;
    z-index:10050!important;
  }
  body.authenticated .bottom-nav .bn-item{
    flex:1 1 0!important;min-width:0!important;width:auto!important;height:52px!important;
    min-height:52px!important;padding:5px 2px!important;border:0!important;border-radius:15px!important;
    color:#77736b!important;font-size:8px!important;letter-spacing:.05em!important;
    background:transparent!important;display:flex!important;align-items:center!important;justify-content:center!important;
  }
  body.authenticated .bottom-nav .bn-item svg{width:19px!important;height:19px!important;}
  body.authenticated .bottom-nav .bn-item.active{
    color:#e0bd73!important;background:rgba(214,174,92,.11)!important;
    box-shadow:inset 0 1px rgba(255,255,255,.04)!important;
  }
  body.authenticated .bottom-nav .bn-more{color:#77736b!important;}

  /* Mobile drawer becomes a polished detective dossier sheet. */
  .mobile-drawer{
    width:min(88vw,350px)!important;max-width:350px!important;
    background:rgba(17,17,16,.96)!important;border:1px solid rgba(214,174,92,.16)!important;
    box-shadow:0 25px 80px rgba(0,0,0,.65)!important;backdrop-filter:blur(30px)!important;
  }

  /* Inputs and buttons feel native on touch screens. */
  .field input,.field select,.rules-search,.admin-search-input,.admin-search-category,textarea{
    min-height:46px!important;font-size:16px!important;border-radius:14px!important;
    background:rgba(255,255,255,.045)!important;border-color:rgba(255,255,255,.09)!important;
  }
  button,.btn,.button,.action-btn,.enter-full,.admin-page-btn,.admin-btn{min-height:46px!important;}
  .filter-row,.rank-tabs,.tabs-row,.week-toggle{max-width:100%!important;overflow-x:auto!important;scrollbar-width:none!important;}
  .filter-row::-webkit-scrollbar,.rank-tabs::-webkit-scrollbar,.tabs-row::-webkit-scrollbar,.week-toggle::-webkit-scrollbar{display:none!important;}
}

@media (max-width:380px){
  .content,.main-content,.page-content{padding-left:11px!important;padding-right:11px!important;}
  body.authenticated .bottom-nav{left:7px!important;right:7px!important;border-radius:19px!important;}
  .page-head h1{font-size:20px!important;}
}
`;
    document.head.appendChild(style);
  }

  function install(){
    loadMobileCascade();
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
    s.textContent='#aezMobileSocial{position:fixed;left:12px;bottom:calc(82px + env(safe-area-inset-bottom));z-index:10060;min-height:46px;padding:11px 15px;border-radius:15px;border:1px solid rgba(214,174,92,.20);background:rgba(18,17,15,.95);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);color:#ead7aa;font:600 13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 14px 45px rgba(0,0,0,.5);display:block}';
    document.head.appendChild(s);
    document.body.appendChild(b);
  }

  function observe(){
    install();
    new MutationObserver(function(){install();}).observe(document.body,{attributes:true,childList:true,subtree:true,attributeFilter:['class']});
    window.addEventListener('resize',function(){
      loadMobileCascade();
      var b=document.getElementById('aezMobileSocial');
      if(b)b.style.display=window.innerWidth<=700&&document.body.classList.contains('authenticated')?'block':'none';
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe);else observe();
})();
