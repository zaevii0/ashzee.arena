/* ÆZ Arena — Mobile install experience */
(function(){
  'use strict';
  var deferredPrompt=null;
  var isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var isStandalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;

  function style(){
    if(document.getElementById('aezInstallStyle'))return;
    var s=document.createElement('style');s.id='aezInstallStyle';s.textContent=''+
      '#aezInstallBtn{position:fixed;right:16px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:9998;border:1px solid rgba(255,255,255,.18);background:rgba(22,23,26,.9);backdrop-filter:blur(18px);color:#f4f4f2;border-radius:16px;padding:12px 15px;font:600 13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.35);display:none}'+
      '#aezInstallBtn.show{display:block}'+
      '#aezInstallSheet{position:fixed;inset:0;z-index:10050;background:rgba(3,4,5,.72);backdrop-filter:blur(22px);display:none;align-items:flex-end;padding:14px}'+
      '#aezInstallSheet.open{display:flex}'+
      '.aez-install-card{width:100%;max-width:520px;margin:auto auto 0;background:#17181b;border:1px solid rgba(255,255,255,.12);border-radius:25px;padding:22px;box-shadow:0 30px 90px #000}'+
      '.aez-install-card h3{margin:0 0 7px;font-size:19px}.aez-install-card p{color:#aaa;line-height:1.5;font-size:13px}.aez-install-step{padding:11px 0;border-top:1px solid rgba(255,255,255,.08);font-size:13px;color:#ddd}.aez-install-close{width:100%;margin-top:14px;border:0;border-radius:13px;padding:12px;background:#eee;color:#111;font-weight:700}';
    document.head.appendChild(s);
  }
  function sheet(){
    if(document.getElementById('aezInstallSheet'))return;
    var d=document.createElement('div');d.id='aezInstallSheet';d.innerHTML='<div class="aez-install-card"><h3>Install ÆZ Arena</h3><p>Install ÆZ Arena on your phone for a faster, app-like experience. Your account and social features stay connected to the web app.</p><div class="aez-install-step"><b>Android:</b> tap <b>Install app</b> when your browser shows the installation prompt, or open the browser menu and choose <b>Add to Home screen</b>.</div><div class="aez-install-step"><b>iPhone:</b> tap <b>Share</b> in Safari, then choose <b>Add to Home Screen</b>.</div><button class="aez-install-close">Close</button></div>';
    document.body.appendChild(d);d.querySelector('.aez-install-close').onclick=function(){d.classList.remove('open');};
  }
  function button(){
    if(isStandalone||document.getElementById('aezInstallBtn'))return;
    var b=document.createElement('button');b.id='aezInstallBtn';b.textContent='Install ÆZ Arena';b.onclick=function(){
      if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.finally(function(){deferredPrompt=null;b.classList.remove('show');});}
      else{sheet();document.getElementById('aezInstallSheet').classList.add('open');}
    };document.body.appendChild(b);
    if(deferredPrompt||isIOS)b.classList.add('show');
  }
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredPrompt=e;button();});
  window.addEventListener('appinstalled',function(){deferredPrompt=null;var b=document.getElementById('aezInstallBtn');if(b)b.remove();});
  window.addEventListener('load',function(){style();button();});
})();
