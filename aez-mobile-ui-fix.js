/* ÆZ Arena — Entry Gateway / resilient Secure Access patch */
(function(){
'use strict';

/* Entry gateway visual shell. Existing authenticated application is left intact. */
function entryGateway(){
  if(document.getElementById('aezEntryGateway')) return;
  if(document.body.classList.contains('authenticated')) return;
  var g=document.createElement('main'); g.id='aezEntryGateway';
  g.innerHTML='<div class="aeg-noise"></div><div class="aeg-orbit"></div><section class="aeg-panel aeg-entry" data-level="entry"><div class="aeg-mark">ÆZ</div><div class="aeg-kicker">CLASSIFIED NETWORK / 01</div><h1>ÆZ ARENA</h1><p>Beyond the source code. Beneath the surface.</p><button class="aeg-primary" data-aeg="access"><span>01</span> ENTER THE ARENA</button><div class="aeg-status"><i></i> NETWORK STANDBY</div></section><section class="aeg-panel aeg-access" data-level="access" hidden><button class="aeg-back" data-aeg="back">← Return to Entry</button><div class="aeg-kicker">ACCESS GATEWAY / 02</div><h2>Choose your clearance.</h2><div class="aeg-options"><button class="aeg-option" data-aeg="login"><b>A — ÆZ SECURE ACCESS</b><small>Already in the network? Identify yourself.</small></button><button class="aeg-option" data-aeg="register"><b>B — REGISTER</b><small>No record found? Establish your presence.</small></button></div></section><section class="aeg-panel aeg-login" data-level="login" hidden><button class="aeg-back" data-aeg="back">← Back</button><div class="aeg-kicker">SECURE ACCESS / 03</div><h2>Identify yourself.</h2><p class="aeg-sub">Registered agents only.</p><form id="aegLoginForm"><label>Agent / Member ID<input id="aegMemberId" autocomplete="username" required></label><label>Password / Passcode<input id="aegPasscode" type="password" autocomplete="current-password" required></label><label class="aeg-check"><input id="aegRemember" type="checkbox"> Remember this device</label><div class="aeg-links"><button type="button" data-aeg="forgot">Forgot credentials</button></div><button class="aeg-primary" type="submit"><span>03</span> AUTHENTICATE</button><div id="aegLoginMsg" class="aeg-msg"></div></form></section><section class="aeg-panel aeg-register" data-level="register" hidden><button class="aeg-back" data-aeg="back">← Back</button><div class="aeg-kicker">REGISTRATION / 03</div><h2>Establish your presence.</h2><div class="aeg-options"><button class="aeg-option" data-aeg="member"><b>01 — JOIN THE UNDERGROUND</b><small>Register as a Gang Member</small></button><button class="aeg-option" data-aeg="gang"><b>02 — ESTABLISH YOUR SYNDICATE</b><small>Register Your Gang</small></button><button class="aeg-option" data-aeg="official"><b>03 — OBTAIN CLEARANCE</b><small>Register as an Arena Official</small></button></div></section><section class="aeg-panel aeg-form" data-level="form" hidden><button class="aeg-back" data-aeg="back">← Back</button><div id="aegFormBody"></div></section><section class="aeg-panel aeg-confirm" data-level="confirm" hidden><div class="aeg-seal">✓</div><div class="aeg-kicker">TRANSMISSION RECEIVED</div><h2>Application secured.</h2><p>Your information has been submitted for review. Access remains restricted until verification is complete.</p><button class="aeg-primary" data-aeg="entry"><span>01</span> RETURN TO ENTRY</button></section></main>';
  document.body.appendChild(g); injectEntryStyle(); bindEntry(g);
}
function injectEntryStyle(){if(document.getElementById('aezEntryStyle'))return;var s=document.createElement('style');s.id='aezEntryStyle';s.textContent='*{box-sizing:border-box}#aezEntryGateway{position:fixed;inset:0;z-index:999999;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 35%,#1b1d20 0,#090a0c 43%,#030304 100%);color:#f2f2f0;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",sans-serif}.aeg-noise{position:absolute;inset:0;opacity:.035;background-image:radial-gradient(#fff .6px,transparent .6px);background-size:4px 4px;pointer-events:none}.aeg-orbit{position:absolute;width:min(72vw,760px);height:min(72vw,760px);border:1px solid rgba(255,255,255,.06);border-radius:50%;box-shadow:0 0 100px rgba(255,255,255,.025);animation:aegPulse 8s ease-in-out infinite}.aeg-panel{width:min(620px,calc(100vw - 34px));max-height:calc(100vh - 34px);overflow:auto;padding:clamp(28px,5vw,58px);border:1px solid rgba(255,255,255,.12);border-radius:28px;background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025));backdrop-filter:blur(30px) saturate(115%);box-shadow:0 35px 100px rgba(0,0,0,.65),inset 0 1px rgba(255,255,255,.08);animation:aegIn .45s cubic-bezier(.2,.8,.2,1)}.aeg-entry{text-align:center}.aeg-mark{width:58px;height:58px;margin:0 auto 26px;border:1px solid rgba(255,255,255,.22);border-radius:18px;display:grid;place-items:center;font-weight:700;letter-spacing:-.08em;background:rgba(255,255,255,.05);box-shadow:0 0 45px rgba(255,255,255,.07)}.aeg-kicker{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em;color:#8e9094;margin-bottom:12px}.aeg-panel h1{font-size:clamp(42px,8vw,78px);letter-spacing:-.065em;margin:0;font-weight:700}.aeg-panel h2{font-size:clamp(28px,5vw,42px);letter-spacing:-.04em;margin:0 0 8px}.aeg-panel p{color:#a9aaad;line-height:1.6;margin:12px 0 32px}.aeg-sub{margin-top:0!important;font-size:13px}.aeg-primary,.aeg-option{width:100%;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.055);color:#f4f4f2;border-radius:15px;cursor:pointer;transition:transform .18s ease,background .25s,border-color .25s,box-shadow .25s}.aeg-primary{padding:16px 18px;font-size:12px;font-weight:700;letter-spacing:.12em;text-align:left}.aeg-primary span{font-family:ui-monospace,monospace;color:#85878b;margin-right:12px}.aeg-primary:hover,.aeg-option:hover{transform:translateY(-2px);background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.34);box-shadow:0 12px 35px rgba(255,255,255,.06)}.aeg-primary:active,.aeg-option:active{transform:scale(.985)}.aeg-status{margin-top:22px;font:9px ui-monospace,monospace;color:#666;letter-spacing:.16em}.aeg-status i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#a9aaad;box-shadow:0 0 9px rgba(255,255,255,.5);margin-right:7px}.aeg-back{border:0;background:none;color:#777;padding:0 0 28px;cursor:pointer;font:11px ui-monospace,monospace;letter-spacing:.08em}.aeg-options{display:grid;gap:11px;margin-top:28px}.aeg-option{text-align:left;padding:19px 20px}.aeg-option b{display:block;font-size:13px;letter-spacing:.04em}.aeg-option small{display:block;color:#85878b;margin-top:7px;font-size:12px}.aeg-form form{display:grid;gap:15px;margin-top:26px}.aeg-form label,.aeg-login label{display:grid;gap:7px;color:#aaa;font-size:11px;letter-spacing:.06em}.aeg-form input,.aeg-login input,.aeg-form textarea,.aeg-form select{width:100%;padding:13px 14px;border:1px solid rgba(255,255,255,.11);border-radius:12px;background:rgba(0,0,0,.28);color:#eee;outline:none}.aeg-form input:focus,.aeg-login input:focus,.aeg-form textarea:focus,.aeg-form select:focus{border-color:rgba(255,255,255,.35);box-shadow:0 0 0 3px rgba(255,255,255,.035)}.aeg-check{display:flex!important;align-items:center;grid-template-columns:auto 1fr}.aeg-check input{width:auto}.aeg-links button{border:0;background:none;color:#777;text-decoration:underline;cursor:pointer;padding:0;font-size:11px}.aeg-msg{min-height:20px;color:#aaa;font-size:12px;line-height:1.5}.aeg-seal{width:52px;height:52px;border:1px solid rgba(255,255,255,.3);border-radius:50%;display:grid;place-items:center;margin-bottom:22px;font-size:20px}.aeg-confirm p{max-width:470px}.aeg-form .aeg-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.aeg-note{font-size:11px!important;color:#777!important;margin:0!important}.aeg-submit{margin-top:8px}@keyframes aegIn{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}@keyframes aegPulse{0%,100%{transform:scale(.98);opacity:.7}50%{transform:scale(1.02);opacity:1}}@media(max-width:600px){.aeg-panel{padding:26px 20px;border-radius:22px}.aeg-form .aeg-grid{grid-template-columns:1fr}.aeg-panel h1{font-size:44px}.aeg-primary{padding:15px}.aeg-option{padding:17px}}';document.head.appendChild(s)}
function level(name){var g=document.getElementById('aezEntryGateway');if(!g)return;g.querySelectorAll('.aeg-panel').forEach(function(x){x.hidden=x.dataset.level!==name});}
function bindEntry(g){
 g.addEventListener('click',function(e){var b=e.target.closest('[data-aeg]');if(!b)return;var a=b.dataset.aeg;
  if(a==='access')level('access');
  else if(a==='login')level('login');
  else if(a==='register')level('register');
  else if(a==='back')level((g.querySelector('.aeg-panel:not([hidden])')||{}).dataset&&((g.querySelector('.aeg-panel:not([hidden])')||{}).dataset.level==='access'?'entry':(g.querySelector('.aeg-panel:not([hidden])')||{}).dataset.level==='login'||(g.querySelector('.aeg-panel:not([hidden])')||{}).dataset.level==='register'?'access':'register'));
  else if(a==='entry')level('entry');
  else if(a==='member'||a==='gang'||a==='official')showRegistration(a);
  else if(a==='forgot'){var m=document.getElementById('aegLoginMsg');if(m)m.textContent='Credential recovery is handled by Arena Command. Please contact an administrator.';}
 });
 g.addEventListener('submit',function(e){if(e.target.id!=='aegLoginForm')return;e.preventDefault();var id=document.getElementById('aegMemberId').value.trim(),pw=document.getElementById('aegPasscode').value;if(!id||!pw)return;var m=document.getElementById('aegLoginMsg');m.textContent='Authenticating…';if(typeof window.login==='function'){var oldEmail=document.getElementById('emailInput');var oldPw=document.getElementById('passwordInput');if(oldEmail&&oldPw){oldEmail.value=id;oldPw.value=pw;window.login();}else m.textContent='Secure authentication service unavailable. Please use the existing Arena access screen.';}else m.textContent='Secure authentication service unavailable.';});
}
function showRegistration(kind){var body=document.getElementById('aegFormBody');if(!body)return;var title=kind==='member'?'JOIN THE UNDERGROUND':kind==='gang'?'ESTABLISH YOUR SYNDICATE':'OBTAIN CLEARANCE';var sub=kind==='member'?'Create a personal ÆZ Arena identity.':kind==='gang'?'Create a new gang profile and submit it for approval.':'Submit your official identity for verification.';var fields=kind==='member'?'<div class="aeg-grid"><label>Member name<input required></label><label>Alias / Codename<input required></label></div><label>Facebook / Member ID<input required></label><label>Existing gang<input placeholder="Gang name or identifier" required></label><div class="aeg-grid"><label>Password / Passcode<input type="password" required></label><label>Confirm passcode<input type="password" required></label></div>':kind==='gang'?'<div class="aeg-grid"><label>Gang name<input required></label><label>Initials / Alias<input required></label></div><label>Motto<input required></label><label>Gang description<textarea rows="4" required></textarea></label><div class="aeg-grid"><label>Founding date<input type="date" required></label><label>Signature color / identity<input placeholder="Describe identity" required></label></div><label>Gang leaders / member information<textarea rows="4" placeholder="Names, roles, member details" required></textarea></label><label>Gang logo<input type="file" accept="image/*"></label>': '<div class="aeg-grid"><label>Full name<input required></label><label>Official position<input required placeholder="Arena Official / Division / etc."></label></div><label>Member / Facebook ID<input required></label><label>Required credentials<textarea rows="4" required></textarea></label><label>Additional verification information<textarea rows="4"></textarea></label>';body.innerHTML='<div class="aeg-kicker">REGISTRATION / 04</div><h2>'+title+'</h2><p>'+sub+'</p><form id="aegRegForm">'+fields+'<button class="aeg-primary aeg-submit" type="submit"><span>04</span> SUBMIT APPLICATION</button><div id="aegRegMsg" class="aeg-msg"></div></form>';level('form');document.getElementById('aegRegForm').addEventListener('submit',function(e){e.preventDefault();var msg=document.getElementById('aegRegMsg');msg.textContent='Securing transmission…';setTimeout(function(){level('confirm')},500);});}

/* Keep exactly one Social control: the one in the authenticated mobile bottom navigation. */
function fixSocialNavigation(){
  if(!document.body.classList.contains('authenticated')) return;
  var bottom=document.querySelector('.bottom-nav');

  /* Remove Social controls from the sidebar and other page-level containers. */
  document.querySelectorAll('.sidebar button,.sidebar a,.sidebar [role="button"],.sidebar .nav-item').forEach(function(el){
    var text=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(text==='social' || text==='social intelligence') el.remove();
  });

  /* If there is no mobile navigation, there is nothing to create yet. */
  if(!bottom) return;

  var socials=Array.prototype.slice.call(bottom.querySelectorAll('button,a,[role="button"],.bn-item,.nav-item')).filter(function(el){
    var text=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    return text==='social' || text==='social intelligence' || el.hasAttribute('data-aez-social');
  });

  var keeper=socials.find(function(el){return el.hasAttribute('data-aez-social');}) || socials[0] || null;

  socials.forEach(function(el){
    if(el!==keeper) el.remove();
  });

  if(!keeper){
    keeper=document.createElement('button');
    keeper.type='button';
    keeper.className='bn-item aez-social-nav-item';
    keeper.setAttribute('data-aez-social','1');
    keeper.innerHTML='<span style="font-size:16px">◈</span><span>Social</span>';
    bottom.appendChild(keeper);
  }

  keeper.classList.add('aez-social-nav-item');
  keeper.onclick=function(e){
    e.preventDefault();
    e.stopPropagation();
    if(typeof window.openAezSocial==='function') window.openAezSocial();
    else {
      var social=document.getElementById('aezSocial');
      if(social) social.classList.add('open');
    }
  };
}

function injectSocialNavStyle(){
  if(document.getElementById('aezSocialNavStyle')) return;
  var s=document.createElement('style');
  s.id='aezSocialNavStyle';
  s.textContent='@media(max-width:960px){body.authenticated .aez-social-nav-item{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;color:var(--ash-dim,#64748B)!important;background:transparent!important;border:0!important;font-size:9.5px!important}body.authenticated .aez-social-nav-item.active{color:var(--bone,#F5F7FA)!important;background:rgba(232,233,235,.055)!important}}';
  document.head.appendChild(s);
}

function bootEntry(){if(!document.body.classList.contains('authenticated'))entryGateway();else{var g=document.getElementById('aezEntryGateway');if(g)g.remove();fixSocialNavigation();injectSocialNavStyle();}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootEntry);else bootEntry();
window.addEventListener('load',bootEntry);
new MutationObserver(function(){if(!document.body.classList.contains('authenticated'))entryGateway();else{var g=document.getElementById('aezEntryGateway');if(g)g.remove();fixSocialNavigation();injectSocialNavStyle();}}).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
})();