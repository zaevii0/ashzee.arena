const CACHE_NAME = 'aez-arena-v10';
const APP_SHELL = [
  './',
  './index.html',
  './mobile-responsive.css',
  './aez-social.js',
  './aez-chat.js',
  './aez-mobile-install.js',
  './aez-mobile-ui-fix.js',
  './aez-ios-design.css',
  './aez-light-palette.css',
  './aez-premium-ui.css',
  './aez-design-system.css',
  './aez-minimal-geometric.css',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

const UPDATE_BANNER = `
<style id="aez-update-banner-style">
#aezUpdateBanner{position:fixed;left:14px;right:14px;bottom:max(86px,calc(env(safe-area-inset-bottom) + 78px));z-index:2147483647;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;border:1px solid rgba(224,194,122,.28);border-radius:16px;background:rgba(16,18,22,.94);color:#F5F7FA;box-shadow:0 18px 50px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.06);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);font:500 13px/1.35 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;transform:translateY(12px);opacity:0;transition:opacity .25s ease,transform .25s ease}
#aezUpdateBanner.aez-update-visible{opacity:1;transform:translateY(0)}
#aezUpdateBanner .aez-update-copy{display:flex;align-items:center;gap:9px;min-width:0}
#aezUpdateBanner .aez-update-dot{width:8px;height:8px;flex:none;border-radius:50%;background:#E3C477;box-shadow:0 0 12px rgba(227,196,119,.65)}
#aezUpdateBanner .aez-update-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#aezUpdateBanner button{appearance:none;border:1px solid rgba(224,194,122,.35);border-radius:999px;padding:8px 13px;flex:none;background:rgba(224,194,122,.12);color:#E3C477;font:700 11px/1 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer}
#aezUpdateBanner button:active{transform:scale(.97)}
@media(max-width:430px){#aezUpdateBanner{bottom:max(78px,calc(env(safe-area-inset-bottom) + 72px));padding:11px 12px}.aez-update-text{font-size:12px}#aezUpdateBanner button{padding:8px 11px}}
</style>
<div id="aezUpdateBanner" role="status" aria-live="polite" hidden>
  <div class="aez-update-copy"><span class="aez-update-dot"></span><span class="aez-update-text">ÆZ Arena updated</span></div>
  <button type="button" id="aezUpdateRefresh">Tap to refresh</button>
</div>
<script>
(function(){
  var VERSION='v10';
  try{
    if(localStorage.getItem('aez_seen_version')===VERSION)return;
  }catch(e){}
  function show(){
    var b=document.getElementById('aezUpdateBanner');
    if(!b)return;
    b.hidden=false;
    requestAnimationFrame(function(){b.classList.add('aez-update-visible');});
    var btn=document.getElementById('aezUpdateRefresh');
    if(btn)btn.onclick=function(){
      try{localStorage.setItem('aez_seen_version',VERSION);}catch(e){}
      window.location.reload();
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',show,{once:true});else show();
})();
</script>`;

function injectUpdateBanner(response){
  if(!response || !response.ok) return response;
  const type=response.headers.get('content-type') || '';
  if(!type.includes('text/html')) return response;
  return response.text().then(html=>{
    if(html.includes('id="aezUpdateBanner"')) return new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});
    const updated=html.includes('</body>') ? html.replace('</body>', UPDATE_BANNER + '</body>') : html + UPDATE_BANNER;
    const headers=new Headers(response.headers);
    headers.set('content-type','text/html; charset=utf-8');
    return new Response(updated,{status:response.status,statusText:response.statusText,headers});
  });
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => { const copy=response.clone(); caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy)); return injectUpdateBanner(response); })
        .catch(() => caches.match('./index.html').then(cached => injectUpdateBanner(cached)))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}
      return response;
    }))
  );
});