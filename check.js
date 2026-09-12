

/* ============ SUPABASE CONFIG ============ */
/* Replace these two placeholders with your Supabase Project URL and
   Publishable Key. NEVER put a service_role/secret key in this HTML. */
var SUPABASE_URL = "https://watkmdnuielghrfrbrbu.supabase.co";
var SUPABASE_PUBLISHABLE_KEY = "sb_publishable_oVjZrLazgSUgZx_o4kFyiw_7B00QjM9";
var supabaseReady = SUPABASE_URL.indexOf("YOUR_") !== 0 && SUPABASE_PUBLISHABLE_KEY.indexOf("YOUR_") !== 0;
var supabaseClient = supabaseReady ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;

/* ============ LIVE ACCESS CONTROL ============ */
/* Authentication, passwords, registration records, approval status, and ID
   documents are handled by Supabase. The browser never stores user passwords
   or a client-side roster. */
var currentAgent = null;
var currentProfile = null;

/* ============ FAILED-ATTEMPT LOCKOUT ============ */
var failedAttempts = 0;
var LOCKOUT_AFTER = 3;
var LOCKOUT_SECONDS = 20;
var lockoutTimer = null;

function setLoginFormDisabled(disabled){
  ['gangSelect','codenameInput','passwordInput','loginSubmitBtn'].forEach(function(id){
    document.getElementById(id).disabled = disabled;
  });
}
function startLockout(){
  var remaining = LOCKOUT_SECONDS;
  setLoginFormDisabled(true);
  var btn = document.getElementById('loginSubmitBtn');
  function tick(){
    showLoginError('Too many failed attempts. Access locked for '+remaining+'s.');
    btn.textContent = 'Locked — '+remaining+'s';
    if(remaining<=0){
      clearInterval(lockoutTimer);
      lockoutTimer = null;
      setLoginFormDisabled(false);
      btn.textContent = 'Enter the Arena';
      failedAttempts = 0;
      hideLoginError();
      return;
    }
    remaining--;
  }
  tick();
  lockoutTimer = setInterval(tick, 1000);
}

/* ============ SCREEN / NAV ============ */
function showScreen(id){
  /* While registration is open, no other screen is allowed to replace it.
     This protects the registration view from session/auth callbacks firing
     in the background and accidentally bringing Secure Access back. */
  if(window.aezRegistrationOpen && id !== 'signup' && id !== 'gangRegister'){
    id = 'signup';
  }

  var screens = document.querySelectorAll('.screen');

  /* Registration is a hard visual boundary: when opened, hide every other
     screen explicitly (not only via the .active class). This prevents the
     login / Secure Access UI from remaining visible behind registration. */
  if(id === 'signup' || id === 'gangRegister'){
    screens.forEach(function(s){
      s.classList.remove('active');
      s.style.display = 'none';
      s.setAttribute('aria-hidden','true');
    });

    var signupScreen = document.getElementById('signup');
    if(signupScreen){
      signupScreen.classList.add('active');
      signupScreen.style.display = 'flex';
      signupScreen.setAttribute('aria-hidden','false');
    }
    return;
  }

  /* The Secure Access page is only reachable after the explicit landing CTA. */
  var arenaEntered = sessionStorage.getItem('aez_arena_entered') === '1';
  if((id === 'login' || id === 'adminLogin' || id === 'app') && !arenaEntered){
    id = 'landing';
  }

  /* Never allow an unauthenticated browser state to display the protected app. */
  if(id === 'app' && (!currentProfile || currentProfile.status !== 'approved')){
    id = arenaEntered ? (id === 'adminLogin' ? 'adminLogin' : 'login') : 'landing';
  }

  screens.forEach(function(s){
    s.classList.remove('active');
    s.style.display = 'none';
    s.setAttribute('aria-hidden','true');
  });

  var screen = document.getElementById(id);
  if(screen){
    screen.classList.add('active');
    screen.style.display = (id === 'login' || id === 'signup' || id === 'gangRegister' || id === 'adminLogin') ? 'flex' : 'block';
    screen.setAttribute('aria-hidden','false');
  }
}

function closeRegistration(){
  window.aezRegistrationOpen = false;
}

/* Dedicated registration entry point. The explicit inline handler calls this
   so the registration transition cannot accidentally leave Secure Access
   visible. */
async function loadApprovedGangOptions(){
  var selects=[document.getElementById('suGangSelect'),document.getElementById('gangSelect')].filter(Boolean);
  if(!selects.length) return;
  selects.forEach(function(sel){sel.innerHTML='<option value="" selected disabled>Loading approved gangs…</option>';sel.disabled=true;});
  if(!supabaseReady){
    selects.forEach(function(sel){sel.innerHTML='<option value="" selected disabled>Supabase unavailable</option>';});
    return;
  }
  var res=await supabaseClient.rpc('aez_approved_gang_initials');
  if(res.error){
    console.warn('Approved gang list unavailable:',res.error.message);
    selects.forEach(function(sel){sel.innerHTML='<option value="" selected disabled>No approved gangs available</option>';});
    return;
  }
  var rows=res.data||[];
  selects.forEach(function(sel){
    sel.innerHTML='';
    if(!rows.length){
      sel.innerHTML='<option value="" selected disabled>No approved gangs available</option>';
      sel.disabled=true;
      return;
    }
    var first=document.createElement('option'); first.value=''; first.textContent='Select an approved gang'; first.disabled=true; first.selected=true; sel.appendChild(first);
    rows.forEach(function(row){
      var initial=String(row.gang_initial||'').trim().toUpperCase();
      if(!initial) return;
      var opt=document.createElement('option'); opt.value=initial; opt.textContent=initial; sel.appendChild(opt);
    });
    sel.disabled=false;
  });
  ADMIN_GANGS=rows.map(function(row){return String(row.gang_initial||'').trim().toUpperCase();}).filter(Boolean);
  if(typeof renderAdminFilters==='function') renderAdminFilters();
}

function openRegistration(){
  window.aezRegistrationOpen = true;

  /* Hard-hide every other screen before showing registration. */
  document.querySelectorAll('.screen').forEach(function(screen){
    screen.classList.remove('active');
    screen.style.setProperty('display','none','important');
    screen.setAttribute('aria-hidden','true');
  });

  var signup = document.getElementById('signup');
  if(signup){
    signup.classList.add('active');
    signup.style.setProperty('display','flex','important');
    signup.setAttribute('aria-hidden','false');
  }

  /* Ensure the registration form itself is the visible registration state. */
  var form = document.getElementById('signupForm');
  var pending = document.getElementById('signupPending');
  if(form) form.style.display = 'block';
  if(pending) pending.style.display = 'none';
  loadApprovedGangOptions();
}

/* First-time entry:
   fade out the splash screen, remove it completely, then show
   the requested access screen. */
var arenaEntryMode = 'member';

function openGangRegistration(){
  window.aezRegistrationOpen=true;
  sessionStorage.setItem('aez_arena_entered','1');
  document.querySelectorAll('.screen').forEach(function(screen){
    screen.classList.remove('active');
    screen.style.setProperty('display','none','important');
    screen.setAttribute('aria-hidden','true');
  });
  var screen=document.getElementById('gangRegister');
  if(screen){screen.classList.add('active');screen.style.setProperty('display','flex','important');screen.setAttribute('aria-hidden','false');}
  var form=document.getElementById('gangRegisterForm');
  var verify=document.getElementById('gangVerifyBox');
  var success=document.getElementById('gangRegisterSuccess');
  if(form) form.style.display='block';
  if(verify) verify.classList.remove('show');
  if(success) success.classList.remove('show');
  hideGangRegistrationError();
}
function showGangRegistrationError(msg){
  var el=document.getElementById('gangRegisterError'); if(!el) return;
  el.textContent=msg; el.style.display='flex';
  var card=document.getElementById('gangRegisterCard');
  if(card){card.classList.remove('shake');void card.offsetWidth;card.classList.add('shake');}
}
function hideGangRegistrationError(){var el=document.getElementById('gangRegisterError');if(el){el.style.display='none';el.textContent='';}}
function clearGangRegistrationFields(){
  ['grEmailInput','grGangNameInput','grGangInitialInput','grAliasInput','grCreatedInput','grMembersInput','grMottoInput','grLeaderInput','grCooInput'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
}
function validGangEmail(input){
  if(!input || !input.checkValidity()) return false;
  var email=input.value.trim().toLowerCase(), at=email.lastIndexOf('@'), domain=at<0?'':email.slice(at+1);
  if(email.length>254 || !domain || domain.indexOf('.')<1) return false;
  return domain.split('.').every(function(label){return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label);});
}
function getGangRegistrationPayload(){
  return {
    email:document.getElementById('grEmailInput').value.trim().toLowerCase(),
    gang_name:document.getElementById('grGangNameInput').value.trim(),
    gang_initial:document.getElementById('grGangInitialInput').value.trim().toUpperCase(),
    alias:document.getElementById('grAliasInput').value.trim(),
    motto:document.getElementById('grMottoInput').value.trim(),
    date_created:document.getElementById('grCreatedInput').value,
    active_members:Number(document.getElementById('grMembersInput').value),
    leader_name:document.getElementById('grLeaderInput').value.trim(),
    coo_leader_name:document.getElementById('grCooInput').value.trim()
  };
}
function validateGangRegistration(p){
  ['grFieldEmail','grFieldName','grFieldInitial','grFieldAlias','grFieldCreated','grFieldMembers','grFieldMotto','grFieldLeader','grFieldCoo'].forEach(clearFieldError);
  var missing=[];
  if(!p.email) {markFieldError('grFieldEmail');missing.push('officer email');}
  if(!p.gang_name){markFieldError('grFieldName');missing.push('gang name');}
  if(!p.gang_initial){markFieldError('grFieldInitial');missing.push('gang initial');}
  if(!p.alias){markFieldError('grFieldAlias');missing.push('alias');}
  if(!p.motto){markFieldError('grFieldMotto');missing.push('motto');}
  if(!p.date_created){markFieldError('grFieldCreated');missing.push('date created');}
  if(!Number.isInteger(p.active_members)||p.active_members<1){markFieldError('grFieldMembers');missing.push('active member count');}
  if(!p.leader_name){markFieldError('grFieldLeader');missing.push("leader's name");}
  if(!p.coo_leader_name){markFieldError('grFieldCoo');missing.push("COO leader's name");}
  if(missing.length){showGangRegistrationError('Complete '+(missing.length===1?missing[0]:missing.slice(0,-1).join(', ')+' and '+missing[missing.length-1])+'.');return false;}
  if(!validGangEmail(document.getElementById('grEmailInput'))){markFieldError('grFieldEmail');showGangRegistrationError('Enter a valid email address that can receive verification mail.');return false;}
  return true;
}
async function sendGangVerification(){
  hideGangRegistrationError();
  if(!supabaseReady){showGangRegistrationError('Supabase is not configured.');return;}
  var p=getGangRegistrationPayload();
  if(!validateGangRegistration(p)) return;
  var btn=document.getElementById('gangRegisterSendBtn'); if(btn){btn.disabled=true;btn.textContent='Sending Verification…';}
  /* Store only the submitted gang fields locally until the verified email session is established. */
  localStorage.setItem('aez_pending_gang_registration',JSON.stringify(p));
  var auth=await supabaseClient.auth.signInWithOtp({email:p.email,options:{shouldCreateUser:true,emailRedirectTo:window.location.origin+window.location.pathname}});
  if(auth.error){localStorage.removeItem('aez_pending_gang_registration');if(btn){btn.disabled=false;btn.textContent='Verify Email & Continue';}showGangRegistrationError(auth.error.message);return;}
  document.getElementById('gangVerifyEmail').textContent=p.email;
  document.getElementById('gangVerifyBox').classList.add('show');
  if(btn){btn.disabled=false;btn.textContent='Verification Email Sent';}
}
async function checkGangVerification(){
  var r=await supabaseClient.auth.getUser();
  if(r.error || !r.data || !r.data.user){
    showGangRegistrationError('Your email is not verified in this browser yet. Open the verification email, tap the link, then return here.');
    return;
  }
  await finalizeGangRegistration(r.data.user);
}
async function finalizeGangRegistration(user){
  var raw=localStorage.getItem('aez_pending_gang_registration');
  if(!raw || !user) return false;
  var p; try{p=JSON.parse(raw);}catch(e){localStorage.removeItem('aez_pending_gang_registration');return false;}
  if(String(user.email||'').toLowerCase()!==String(p.email||'').toLowerCase()){
    showGangRegistrationError('The verified email does not match the email used for this gang registration.');
    return false;
  }
  var insert=await supabaseClient.from('gang_registrations').insert({officer_user_id:user.id,email:p.email,gang_name:p.gang_name,gang_initial:p.gang_initial,alias:p.alias,motto:p.motto,date_created:p.date_created,active_members:p.active_members,leader_name:p.leader_name,coo_leader_name:p.coo_leader_name,status:'pending'}).select('id').single();
  if(insert.error){
    var duplicate=/duplicate|unique/i.test(insert.error.message||'');
    showGangRegistrationError(duplicate?'That gang name or initial is already registered or awaiting review.':'Gang registration could not be saved: '+insert.error.message);
    return false;
  }
  localStorage.removeItem('aez_pending_gang_registration');
  await supabaseClient.auth.signOut();
  document.getElementById('gangRegisterForm').style.display='none';
  document.getElementById('gangVerifyBox').classList.remove('show');
  document.getElementById('gangRegisterSuccess').classList.add('show');
  return true;
}
function backToEntryFromGangRegistration(){
  window.aezRegistrationOpen=false;sessionStorage.removeItem('aez_arena_entered');arenaEntryMode='member';currentAgent=null;currentProfile=null;document.body.classList.remove('authenticated');
  if(supabaseClient){supabaseClient.auth.signOut().finally(showEntryPageOnly);}else{showEntryPageOnly();}
}

function enterArenaAsMember(){
  /* Member/Gangster entry is isolated to the member Secure Access screen.
     The Admin Command screen is explicitly hidden and cannot appear behind it. */
  arenaEntryMode='member';
  sessionStorage.setItem('aez_arena_entered','1');

  var adminScreen=document.getElementById('adminLogin');
  if(adminScreen){
    adminScreen.classList.remove('active');
    adminScreen.style.display='none';
    adminScreen.setAttribute('aria-hidden','true');
  }

  transitionFromLanding('login', function(){
    /* Keep the member login in its default state. Never inject Admin Command
       fields or navigation into this screen after a Member/Gangster click. */
    var gangField=document.getElementById('fieldGang');
    var codenameField=document.getElementById('fieldCodename');
    var gangSelect=document.getElementById('gangSelect');
    var codenameInput=document.getElementById('codenameInput');
    var title=document.querySelector('#login .login-head .glyph');
    var sub=document.querySelector('#login .login-head .sub');
    var btn=document.getElementById('loginSubmitBtn');
    var note=document.querySelector('#login .login-note');
    var switcher=document.querySelector('#login .login-switch');

    if(gangField) gangField.style.display='';
    if(codenameField) codenameField.style.display='';
    if(gangSelect) gangSelect.disabled=false;
    if(codenameInput) codenameInput.disabled=false;
    if(title) title.textContent='ÆZ SECURE ACCESS';
    if(sub) sub.textContent='IDENTIFY YOURSELF TO PROCEED';
    if(btn) btn.textContent='Enter the Arena';
    if(note) note.textContent='Unauthorized access is logged and reported to Division Command. Approved accounts only.';
    if(switcher) switcher.innerHTML='New agent? <a href="javascript:void(0)" onclick="openRegistration(); return false;">Register with your gang</a>';

    var email=document.getElementById('emailInput');
    if(email) email.focus();
  });
}

function enterArenaAsAdmin(){
  arenaEntryMode='admin';
  sessionStorage.setItem('aez_arena_entered','1');
  transitionFromLanding('adminLogin', function(){
    var email=document.getElementById('adminEmailInput');
    if(email) email.focus();
  });
}

function transitionFromLanding(targetId, after){
  var landing=document.getElementById('landing');
  if(!landing){ showScreen(targetId); if(after) after(); return; }
  landing.classList.add('leaving');
  setTimeout(function(){
    landing.remove();
    showScreen(targetId);
    if(after) setTimeout(after,50);
  },250);
}

function backToEntryFromAdmin(){
  /* Leave Admin Command completely and return to the first entry page.
     Also clear any active Supabase session so the dashboard cannot reappear. */
  sessionStorage.removeItem('aez_arena_entered');
  arenaEntryMode='member';
  currentAgent=null;
  currentProfile=null;
  document.body.classList.remove('authenticated');
  if(supabaseClient){
    supabaseClient.auth.signOut().finally(function(){
      showEntryPageOnly();
    });
  }else{
    showEntryPageOnly();
  }
}

var ENTRY_PAGE_MARKUP = "<section id=\"landing\" class=\"screen active\">\n  <div class=\"grid-veil\"></div>\n  <div class=\"noise-drift\"></div>\n  <div class=\"mark-glyph\"><span class=\"dot\"></span> SECURE CHANNEL · ENCRYPTED</div>\n  <div class=\"wordmark\">ÆZ<small>Ash · Zee Arena</small></div>\n  <div class=\"tagline\">\"Beyond the source code.\"</div>\n  <div class=\"entry-choice-label\"></div>\n  <div class=\"entry-choice-grid\">\n    <button class=\"enter-btn entry-btn-primary\" onclick=\"enterArenaAsMember()\" aria-label=\"Enter the Arena as Gangster or Member\">\n      <span>Gang Member</span>\n      <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></svg>\n    </button>\n    <button class=\"enter-btn entry-btn-admin\" onclick=\"enterArenaAsAdmin()\" aria-label=\"Enter the Arena as Admin Command\">\n      <span>Admin Command</span>\n      <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z\"/><path d=\"m9 12 2 2 4-4\"/></svg>\n    </button>\n    <button class=\"enter-btn gang-open-btn\" onclick=\"openGangRegistration(); return false;\" aria-label=\"Register a gang\">\n      <span>Register Gang</span>\n      <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 5v14M5 12h14\"/></svg>\n    </button>\n  </div>\n  <div class=\"landing-foot\">\n    <span>EST. 2024</span><span>DIVISION-CLASS SYSTEM</span><span>NO PUBLIC RECORD</span>\n  </div>\n</section>"

function showEntryPageOnly(){
  /* Hard-return to the exact first entry page. Rebuild it if a previous
     transition removed the landing section from the DOM. */
  window.aezRegistrationOpen=false;
  sessionStorage.removeItem('aez_arena_entered');
  arenaEntryMode='member';
  currentAgent=null;
  currentProfile=null;
  document.body.classList.remove('authenticated');

  var landing=document.getElementById('landing');
  if(!landing){
    var wrapper=document.createElement('div');
    wrapper.innerHTML=ENTRY_PAGE_MARKUP;
    landing=wrapper.firstElementChild;
    document.body.insertBefore(landing,document.body.firstChild);
  }

  document.querySelectorAll('.screen').forEach(function(screen){
    screen.classList.remove('active');
    screen.style.setProperty('display','none','important');
    screen.setAttribute('aria-hidden','true');
  });

  landing.classList.remove('leaving');
  landing.classList.add('active');
  landing.style.setProperty('display','flex','important');
  landing.setAttribute('aria-hidden','false');
}


function goToMemberSecureAccess(){
  window.aezRegistrationOpen=false;
  arenaEntryMode='member';
  sessionStorage.setItem('aez_arena_entered','1');

  document.querySelectorAll('.screen').forEach(function(screen){
    screen.classList.remove('active');
    screen.style.setProperty('display','none','important');
    screen.setAttribute('aria-hidden','true');
  });

  var login=document.getElementById('login');
  if(login){
    login.classList.add('active');
    login.style.setProperty('display','flex','important');
    login.setAttribute('aria-hidden','false');
  }

  var admin=document.getElementById('adminLogin');
  if(admin){
    admin.classList.remove('active');
    admin.style.setProperty('display','none','important');
    admin.setAttribute('aria-hidden','true');
  }

  var signup=document.getElementById('signup');
  if(signup){
    signup.classList.remove('active');
    signup.style.setProperty('display','none','important');
    signup.setAttribute('aria-hidden','true');
  }

  var title=document.querySelector('#login .login-head .glyph');
  var sub=document.querySelector('#login .login-head .sub');
  var btn=document.getElementById('loginSubmitBtn');
  var note=document.querySelector('#login .login-note');
  var switcher=document.querySelector('#login .login-switch');

  if(title) title.textContent='ÆZ SECURE ACCESS';
  if(sub) sub.textContent='IDENTIFY YOURSELF TO PROCEED';
  if(btn) btn.textContent='Enter the Arena';
  if(note) note.textContent='Unauthorized access is logged and reported to Division Command. Approved accounts only.';
  if(switcher) switcher.innerHTML='';

  var gangField=document.getElementById('fieldGang');
  var codenameField=document.getElementById('fieldCodename');
  var gangSelect=document.getElementById('gangSelect');
  var codenameInput=document.getElementById('codenameInput');
  if(gangField) gangField.style.display='';
  if(codenameField) codenameField.style.display='';
  if(gangSelect) gangSelect.disabled=false;
  if(codenameInput) codenameInput.disabled=false;

  hideLoginError();
  loadApprovedGangOptions();
  var email=document.getElementById('emailInput');
  if(email) setTimeout(function(){ email.focus(); },50);
}

function backToEntryFromRegistration(){
  /* Registration exit is always a hard return to the first entry page.
     Do not reopen Secure Access or Admin Command in the process. */
  window.aezRegistrationOpen = false;
  sessionStorage.removeItem('aez_arena_entered');
  arenaEntryMode='member';
  currentAgent=null;
  currentProfile=null;
  document.body.classList.remove('authenticated');

  var finish=function(){
    showEntryPageOnly();
  };

  if(supabaseClient){
    supabaseClient.auth.signOut().then(finish).catch(finish);
  }else{
    finish();
  }
}

function backToEntryChoice(){
  /* Return directly to the first entry-selection page. */
  window.aezRegistrationOpen = false;
  sessionStorage.removeItem('aez_arena_entered');
  arenaEntryMode='member';
  currentAgent=null;
  currentProfile=null;
  document.body.classList.remove('authenticated');

  var finish=function(){
    showEntryPageOnly();
  };

  if(supabaseClient){
    supabaseClient.auth.signOut().then(finish).catch(finish);
  }else{
    finish();
  }
}

function showAdminLoginError(msg){
  var el=document.getElementById('adminLoginError');
  if(!el) return;
  el.textContent=msg;
  el.style.display='flex';
  var card=document.getElementById('adminLoginCard');
  card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
}
function hideAdminLoginError(){
  var el=document.getElementById('adminLoginError');
  if(el) el.style.display='none';
}

function configureAdminLoginMode(){
  var gangField=document.getElementById('fieldGang');
  var codenameField=document.getElementById('fieldCodename');
  var gangSelect=document.getElementById('gangSelect');
  var codenameInput=document.getElementById('codenameInput');
  var title=document.querySelector('#login .login-head .glyph');
  var sub=document.querySelector('#login .login-head .sub');
  var btn=document.getElementById('loginSubmitBtn');
  var note=document.querySelector('#login .login-note');
  var switcher=document.querySelector('#login .login-switch');

  if(arenaEntryMode==='admin'){
    if(gangField) gangField.style.display='none';
    if(codenameField) codenameField.style.display='none';
    if(gangSelect) gangSelect.disabled=true;
    if(codenameInput) codenameInput.disabled=true;
    if(title) title.textContent='ÆZ ADMIN COMMAND';
    if(sub) sub.textContent='AUTHORIZED COMMAND PERSONNEL ONLY';
    if(btn) btn.textContent='Enter Admin Command';
    if(note) note.textContent='Admin access is restricted to approved Admin and Owner accounts.';
    if(switcher) switcher.innerHTML="<a href='javascript:void(0)' onclick=\"switchEntryMode('member'); return false;\">Enter as Member / Gangster</a>";
  }else{
    if(gangField) gangField.style.display='';
    if(codenameField) codenameField.style.display='';
    if(gangSelect) gangSelect.disabled=false;
    if(codenameInput) codenameInput.disabled=false;
    if(title) title.textContent='ÆZ SECURE ACCESS';
    if(sub) sub.textContent='IDENTIFY YOURSELF TO PROCEED';
    if(btn) btn.textContent='Enter the Arena';
    if(note) note.textContent='Unauthorized access is logged and reported to Division Command. Approved accounts only.';
    if(switcher) switcher.innerHTML='New agent? <a href="javascript:void(0)" onclick="openRegistration(); return false;">Register with your gang</a>';
  }
}

function switchEntryMode(mode){
  /* Deliberately disabled for the member Secure Access page.
     Admin Command has its own dedicated login screen from the first page. */
  if(mode==='admin'){
    enterArenaAsAdmin();
    return;
  }
  arenaEntryMode='member';
  hideLoginError();
  enterArenaAsMember();
}


function enterArena(){
  enterArenaAsMember();
}

function showLoginError(msg){
  var el = document.getElementById('loginError');
  el.textContent = msg;
  el.style.display = 'flex';
  var card = document.getElementById('loginCard');
  card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
}
function hideLoginError(){
  document.getElementById('loginError').style.display = 'none';
}
function clearFieldError(fieldId){
  document.getElementById(fieldId).classList.remove('error');
}
function markFieldError(fieldId){
  document.getElementById(fieldId).classList.add('error');
}
function togglePasswordVisibility(){
  var input = document.getElementById('passwordInput');
  var icon = document.getElementById('pwEyeIcon');
  var showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  icon.innerHTML = showing
    ? '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/>'
    : '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.6 19.6 0 0 1 4.22-5.5M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.6 19.6 0 0 1-2.68 3.9M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/>';
}
async function login(){
  if(lockoutTimer) return;
  ['fieldEmail','fieldGang','fieldCodename','fieldPassword'].forEach(clearFieldError);
  if(!supabaseReady){ showLoginError('Supabase is not configured yet. Add your Project URL and Publishable Key in the CONFIG section.'); return; }

  var fbUid = document.getElementById('emailInput').value.trim();
  var gang = document.getElementById('gangSelect').value;
  var cn = document.getElementById('codenameInput').value.trim();
  var pw = document.getElementById('passwordInput').value;
  var missing=[];
  if(!fbUid){markFieldError('fieldEmail');missing.push('Facebook UID');}
  if(!gang){markFieldError('fieldGang');missing.push('gang');}
  if(!cn){markFieldError('fieldCodename');missing.push('codename');}
  if(!pw){markFieldError('fieldPassword');missing.push('password');}
  if(missing.length){showLoginError('Enter your '+(missing.length===1?missing[0]:missing.slice(0,-1).join(', ')+' and '+missing[missing.length-1])+' to continue.');return;}

  var emailLookup=await supabaseClient.rpc('aez_member_auth_email',{p_facebook_uid:fbUid});
  if(emailLookup.error || !emailLookup.data){
    failedAttempts++;
    if(failedAttempts>=LOCKOUT_AFTER) startLockout();
    else showLoginError('Access denied. Check your Facebook UID and password.');
    return;
  }
  var authEmail=emailLookup.data;
  var btn=document.getElementById('loginSubmitBtn');
  btn.textContent='Verifying…'; btn.disabled=true;
  var result=await supabaseClient.auth.signInWithPassword({email:authEmail,password:pw});
  btn.textContent='Enter the Arena'; btn.disabled=false;
  if(result.error){
    failedAttempts++;
    if(failedAttempts>=LOCKOUT_AFTER) startLockout();
    else showLoginError('Access denied. Check your Facebook UID and password.');
    return;
  }

  var user=result.data.user;
  if(!user.email_confirmed_at){
    await supabaseClient.auth.signOut();
    showLoginError('This member account is not active yet. Contact Division Command.');
    return;
  }
  var profileResult=await supabaseClient.from('profiles').select('*').eq('id',user.id).single();
  if(profileResult.error || !profileResult.data){ await supabaseClient.auth.signOut(); showLoginError('Your application record could not be found. Contact Division Command.'); return; }
  var profile=profileResult.data;
  if(profile.gang!==gang || profile.codename.toLowerCase()!==cn.toLowerCase() || String(profile.facebook_uid||'')!==String(fbUid)){
    await supabaseClient.auth.signOut(); showLoginError('The selected gang, codename, and Facebook UID do not match this account.'); return;
  }
  if(profile.status!=='approved'){
    await supabaseClient.auth.signOut();
    if(profile.status==='pending') showLoginError('Your registration is still pending admin approval.');
    else if(profile.status==='rejected') showLoginError('Your registration was rejected. Contact Division Command.');
    else showLoginError('This account is currently suspended.');
    return;
  }

  failedAttempts=0; hideLoginError(); currentProfile=profile;
  currentAgent=profileToAgent(profile); applyAgentToUI(currentAgent);
  await logAgentActivity('Secure Access', 'ACCESS', 'Signed into ÆZ Arena successfully.', {method:'facebook_uid'});
  removeAuthScreensAndShowApp();
  nav(document.querySelector('.nav-item[data-view="dashboard"]'));
  animateCounters();
  document.querySelectorAll('#view-dashboard .card').forEach(function(card,i){card.classList.add('stagger-in');card.style.animationDelay=(i*45)+'ms';});
}

function profileToAgent(p){
  return {full_name:p.full_name||'',codename:p.codename,gang:p.gang,position:p.position||'Member',joined_date:p.joined_date||'',passwordHash:'',accessLevel:p.access_level||'I',points:p.points||0,divisionRank:p.division_rank||6,individualRank:p.individual_rank||1,attendance:p.attendance||100,titles:p.titles||'0',passes:p.passes||0,role:p.role,email:p.email,facebook_uid:p.facebook_uid||'',id_photo_path:p.id_photo_path||null,approved_at:p.approved_at||null};
}

/* Load the private ID image saved during registration and display it only for
   the currently authenticated agent. The database stores the storage path;
   Supabase generates a short-lived signed URL for the private object. */
async function loadCurrentAgentPhoto(profile){
  var img=document.getElementById('idCardPhoto');
  if(!img) return;
  img.style.display='none';
  img.removeAttribute('src');
  if(!profile || !profile.id_photo_path || !supabaseClient) return;

  var result=await supabaseClient.storage.from('id-documents').createSignedUrl(profile.id_photo_path,3600);
  if(result.error || !result.data || !result.data.signedUrl){
    console.warn('Could not load agent ID photo:', result.error ? result.error.message : 'No signed URL returned');
    return;
  }

  img.src=result.data.signedUrl;
  img.style.display='block';
}


function removeAuthScreensAndShowApp(){
  /* This function is only valid after an approved Supabase profile has been
     loaded. The extra guard prevents accidental dashboard exposure. */
  if(!currentProfile || !currentProfile.id || currentProfile.status!=='approved'){
    document.body.classList.remove('authenticated');
    showScreen('login');
    return;
  }

  ['landing','login','signup','adminLogin'].forEach(function(id){var el=document.getElementById(id);if(el)el.remove();});
  document.body.classList.add('authenticated');
  /* After any approved login, land directly on the main dashboard. */
  document.querySelectorAll('.view').forEach(function(v){v.classList.remove('active');});
  var dashboard=document.getElementById('view-dashboard');
  if(dashboard) dashboard.classList.add('active');
  showScreen('app');
  var isAdminCapable=(currentProfile.role==='admin'||currentProfile.role==='owner');
  var adminNav=document.getElementById('adminNavItem');
  if(adminNav) adminNav.style.display=isAdminCapable?'flex':'none';
  document.body.classList.toggle('admin-capable',isAdminCapable);
  syncMobileAdminNavVisibility();
}

function applyAgentToUI(a){
  document.getElementById('topCodename').textContent = a.codename;
  document.getElementById('wcCodename').textContent = a.codename;
  document.getElementById('wcDivision').textContent = a.gang;
  document.getElementById('wcRank').textContent = '#'+a.individualRank+' Individual';
  document.getElementById('wcAccessLevel').textContent = a.accessLevel;
  document.getElementById('wcSubline').textContent = a.gang+' · Clearance confirmed';

  document.getElementById('statPoints').setAttribute('data-count', a.points);
  document.getElementById('statDivRank').setAttribute('data-count', a.divisionRank);
  document.getElementById('statIndRank').setAttribute('data-count', a.individualRank);
  document.getElementById('statAttendance').setAttribute('data-count', a.attendance);
  document.getElementById('statPasses').setAttribute('data-count', a.passes);

  document.getElementById('idCardName').textContent = a.codename;
  document.getElementById('idCardDiv').textContent = a.gang+(a.titles!=='0' ? ' · '+a.titles.split('— ')[1] : '');
  var positionEl=document.getElementById('idPosition'); if(positionEl) positionEl.textContent=a.position||'Member';
  loadCurrentAgentPhoto(currentProfile);
  document.getElementById('idAccessLevel').textContent = a.accessLevel;
  document.getElementById('idPoints').textContent = a.points.toLocaleString();
  document.getElementById('idRank').textContent = '#'+a.individualRank+' Individual';
  document.getElementById('idAttendance').textContent = a.attendance+'%';
  document.getElementById('idTitles').textContent = a.titles;
  document.getElementById('idPasses').textContent = a.passes+' Available';
  document.getElementById('idFacebookUid').textContent = a.facebook_uid || '—';
  var approvedEl = document.getElementById('idApprovedAt');
  if(approvedEl){
    approvedEl.textContent = a.approved_at ? new Date(a.approved_at).toLocaleString(undefined,{year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit'}) : '—';
  }
  loadLatestProfileChangeRequest();
}


/* ============ PROFILE EDIT REQUESTS ============ */
var profileEditPhotoFile=null;
var lastProfileChangeRequest=null;
function openProfileEdit(){
  if(!currentProfile || currentProfile.status!=='approved') return;
  document.getElementById('editEmailInput').value=currentProfile.email||'';
  document.getElementById('editGangInput').value=currentProfile.gang||'NUDE Gang';
  document.getElementById('editPositionInput').value=currentProfile.position||'Member';
  document.getElementById('editCodenameInput').value=currentProfile.codename||'';
  document.getElementById('editFacebookInput').value=currentProfile.facebook_uid||'';
  document.getElementById('editJoinedInput').value=isoToDateText(currentProfile.joined_date||'');
  profileEditPhotoFile=null;
  var preview=document.getElementById('editProfilePhotoPreview');
  if(preview) preview.src=document.getElementById('idCardPhoto').src||'';
  var err=document.getElementById('profileEditError'); if(err) err.style.display='none';
  var modal=document.getElementById('profileEditModal'); if(modal) modal.classList.add('show');
}
function closeProfileEdit(){var m=document.getElementById('profileEditModal'); if(m) m.classList.remove('show');}
function closeProfileEditOutside(e){if(e.target===e.currentTarget) closeProfileEdit();}
function handleProfileEditPhoto(input){
  var file=input.files && input.files[0]; if(!file) return;
  if(file.size>5*1024*1024){input.value='';showProfileEditError('ID picture must be 5 MB or smaller.');return;}
  profileEditPhotoFile=file;
  var reader=new FileReader(); reader.onload=function(){var img=document.getElementById('editProfilePhotoPreview');if(img)img.src=reader.result;}; reader.readAsDataURL(file);
}
function showProfileEditError(msg){var el=document.getElementById('profileEditError');if(el){el.textContent=msg;el.style.display='flex';}}

function formatDateEntry(input){
  var digits=(input.value||'').replace(/\D/g,'').slice(0,8);
  var out='';
  if(digits.length<=2) out=digits;
  else if(digits.length<=4) out=digits.slice(0,2)+'/'+digits.slice(2);
  else out=digits.slice(0,2)+'/'+digits.slice(2,4)+'/'+digits.slice(4);
  input.value=out;
}

function dateTextToIso(value){
  var m=(value||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if(!m) return '';
  var mm=Number(m[1]), dd=Number(m[2]), yy=Number(m[3]);
  var d=new Date(yy,mm-1,dd);
  if(d.getFullYear()!==yy || d.getMonth()!==mm-1 || d.getDate()!==dd) return '';
  return yy+'-'+String(mm).padStart(2,'0')+'-'+String(dd).padStart(2,'0');
}

function isoToDateText(value){
  var m=(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? m[2]+'/'+m[3]+'/'+m[1] : '';
}

function openDatePicker(textId){
  var pickerId=textId==='suJoinedInput'?'suJoinedPicker':'editJoinedPicker';
  var textInput=document.getElementById(textId);
  var picker=document.getElementById(pickerId);
  if(!picker) return;

  var iso=dateTextToIso(textInput.value);
  if(iso) picker.value=iso;

  try{
    if(typeof picker.showPicker==='function'){
      picker.showPicker();
    }else{
      picker.focus();
      picker.click();
    }
  }catch(e){
    picker.focus();
    picker.click();
  }
}

function syncDatePicker(pickerId,textId){
  var picker=document.getElementById(pickerId);
  var textInput=document.getElementById(textId);
  if(picker && textInput && picker.value){
    textInput.value=isoToDateText(picker.value);
  }
}

async function submitProfileEditRequest(){
  if(!supabaseReady || !currentProfile || !currentProfile.id){
    showProfileEditError('Your approved session could not be verified.');
    return;
  }

  var btn=document.getElementById('profileEditSubmitBtn');
  if(btn){btn.disabled=true;btn.textContent='Submitting…';}

  try{
    /* Always verify the browser session against Supabase before writing. */
    var authResult=await supabaseClient.auth.getUser();
    var authUser=authResult.data && authResult.data.user;
    if(authResult.error || !authUser || authUser.id!==currentProfile.id){
      throw new Error('Your secure session is no longer valid. Please log in again.');
    }

    var requested={
      gang:document.getElementById('editGangInput').value,
      position:document.getElementById('editPositionInput').value,
      codename:document.getElementById('editCodenameInput').value.trim(),
      facebook_uid:document.getElementById('editFacebookInput').value.trim(),
      joined_date:dateTextToIso(document.getElementById('editJoinedInput').value)
    };

    if(!requested.gang||!requested.position||!requested.codename||!requested.facebook_uid||!requested.joined_date){
      throw new Error('Complete all profile fields before submitting.');
    }

    /* Keep the current photo unless the member selected a replacement. */
    if(profileEditPhotoFile){
      var ext=(profileEditPhotoFile.name.split('.').pop()||'jpg')
        .toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
      var path=currentProfile.id+'/edit-'+crypto.randomUUID()+'.'+ext;

      var upload=await supabaseClient.storage
        .from('id-documents')
        .upload(path,profileEditPhotoFile,{
          upsert:false,
          contentType:profileEditPhotoFile.type||'image/jpeg'
        });

      if(upload.error){
        throw new Error('The new ID picture could not be uploaded: '+upload.error.message);
      }
      requested.id_photo_path=path;
    }

    var currentVals={
      gang:currentProfile.gang||'',
      position:currentProfile.position||'Member',
      codename:currentProfile.codename||'',
      facebook_uid:currentProfile.facebook_uid||'',
      joined_date:currentProfile.joined_date||'',
      id_photo_path:currentProfile.id_photo_path||null
    };

    var same=Object.keys(requested).every(function(k){
      return requested[k]===currentVals[k];
    });

    if(same) throw new Error('No changes were detected.');

    /* Do not allow multiple pending requests for the same member. */
    var pendingCheck=await supabaseClient
      .from('profile_change_requests')
      .select('id,status,requested_at')
      .eq('profile_id',currentProfile.id)
      .eq('status','pending')
      .limit(1)
      .maybeSingle();

    if(pendingCheck.error){
      throw new Error('The profile-change system is not available yet: '+pendingCheck.error.message);
    }

    if(pendingCheck.data){
      throw new Error('You already have a profile change request waiting for Owner/Admin approval.');
    }

    var res=await supabaseClient
      .from('profile_change_requests')
      .insert({
        profile_id:currentProfile.id,
        requested_by:authUser.id,
        current_values:currentVals,
        requested_values:requested,
        status:'pending'
      })
      .select('id,requested_at,status')
      .single();

    if(res.error){
      /* Show the real Supabase message so configuration/RLS problems are diagnosable. */
      throw new Error(
        'Profile change request could not be submitted. Supabase returned: '+
        res.error.message
      );
    }

    lastProfileChangeRequest=res.data;

    await logAgentActivity(
      'Profile Change Request',
      'PROFILE',
      'Submitted profile changes for Owner/Admin approval.',
      {request_id:res.data.id}
    );

    closeProfileEdit();

    var status=document.getElementById('profileEditStatus');
    if(status){
      status.className='profile-edit-status pending';
      status.style.display='block';
      status.textContent='Profile changes submitted for approval. Your current approved information remains active until Command reviews the request.';
    }

  }catch(err){
    console.error('Profile edit submission failed:',err);
    showProfileEditError(err && err.message ? err.message : 'Profile change request could not be submitted.');
  }finally{
    if(btn){
      btn.disabled=false;
      btn.textContent='Submit for Approval';
    }
  }
}
async function loadLatestProfileChangeRequest(){
  if(!supabaseReady || !currentProfile) return;
  var r=await supabaseClient.from('profile_change_requests').select('*').eq('profile_id',currentProfile.id).order('requested_at',{ascending:false}).limit(1).maybeSingle();
  var el=document.getElementById('profileEditStatus'); if(!el) return;
  if(r.error || !r.data){el.style.display='none';return;}
  lastProfileChangeRequest=r.data;
  var status=r.data.status||'pending';
  el.style.display='block';
  el.className='profile-edit-status '+status;
  if(status==='pending') el.textContent='A profile change request is waiting for Owner/Admin approval. Your current information remains active.';
  else if(status==='approved') el.textContent='Your latest profile change request was approved on '+new Date(r.data.reviewed_at||r.data.requested_at).toLocaleString()+'.';
  else el.textContent='Your latest profile change request was rejected'+(r.data.rejection_reason?': '+r.data.rejection_reason:'.');
}

/* ============ SIGN UP / REGISTRATION ============ */
var pendingApplicant = null;

function handleIdUpload(input){
  var file = input.files[0];
  if(!file) return;
  clearFieldError('suFieldId');
  var reader = new FileReader();
  reader.onload = function(e){
    var img = document.getElementById('uploadPreview');
    img.src = e.target.result;
    img.style.display = 'block';
    document.getElementById('uploadPrompt').style.display = 'none';
    document.getElementById('uploadWell').classList.add('has-image');
  };
  reader.readAsDataURL(file);
}

function showSignupError(msg){
  var el = document.getElementById('signupError');
  el.textContent = msg;
  el.style.display = 'flex';
  var card = document.getElementById('signupCard');
  card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
}

/* Facebook profile URL helper. A numeric UID can be extracted locally from
   common profile URLs such as /profile.php?id=123 or /123456789012345/.
   Vanity URLs (facebook.com/username) cannot reliably be resolved to a UID
   from the browser without Facebook's API and an approved app/token, so the
   manual UID field remains available. */
function extractFacebookUid(value){
  var raw=(value||'').trim();
  if(!raw) return '';
  var candidate=raw;
  if(/^\d{5,30}$/.test(candidate)) return candidate;
  try{
    var url=new URL(/^https?:\/\//i.test(candidate)?candidate:'https://'+candidate);
    var host=url.hostname.toLowerCase().replace(/^www\./,'');
    if(host!=='facebook.com' && !host.endsWith('.facebook.com')) return '';
    var id=url.searchParams.get('id');
    if(id && /^\d{5,30}$/.test(id)) return id;
    var parts=url.pathname.split('/').filter(Boolean);
    for(var i=0;i<parts.length;i++){
      if(/^\d{5,30}$/.test(parts[i])) return parts[i];
    }
  }catch(e){}
  return '';
}

function handleFacebookLinkInput(input){
  var link=input.value.trim();
  var uid=extractFacebookUid(link);
  var uidInput=document.getElementById('suFbInput');
  var hint=document.getElementById('suFbHint');
  clearFieldError('suFieldFb');
  if(uid){
    uidInput.value=uid;
    hint.textContent='Facebook UID detected automatically: '+uid;
    hint.style.display='block';
    return;
  }
  if(link){
    hint.textContent='This profile link does not expose a numeric UID. If Facebook uses a username in the link, enter the Facebook UID manually.';
    hint.style.display='block';
  }else{
    hint.style.display='none';
  }
}

/* Browser validation catches malformed addresses before a request is sent.
   Mailbox ownership/deliverability is then proven by Supabase's confirmation
   email; that cannot be established safely with a client-side DNS or SMTP check. */
function isDeliverableEmailFormat(input){
  if(!input.checkValidity()) return false;
  var email=input.value;
  var at=email.lastIndexOf('@');
  var domain=at===-1 ? '' : email.slice(at+1);
  if(email.length>254 || domain.length>253 || domain.indexOf('.')===-1) return false;
  return domain.split('.').every(function(label){
    return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label);
  });
}

async function submitSignup(){
  var fieldIds=['suFieldName','suFieldGang','suFieldPosition','suFieldCodename','suFieldFb','suFieldJoined','suFieldPassword','suFieldId'];
  fieldIds.forEach(clearFieldError);
  if(!supabaseReady){showSignupError('Supabase is not configured yet. Add your Project URL and Publishable Key in the CONFIG section.');return;}

  var name=document.getElementById('suNameInput').value.trim();
  var gang=document.getElementById('suGangSelect').value;
  var position=document.getElementById('suPositionSelect').value;
  var codename=document.getElementById('suCodenameInput').value.trim();
  var fbUid=document.getElementById('suFbInput').value.trim();
  var joined=dateTextToIso(document.getElementById('suJoinedInput').value);
  var pw=document.getElementById('suPasswordInput').value;
  var file=document.getElementById('suIdFile').files[0];
  var missing=[];
  if(!name){markFieldError('suFieldName');missing.push('name');}
  if(!gang){markFieldError('suFieldGang');missing.push('gang');}
  if(!position){markFieldError('suFieldPosition');missing.push('position');}
  if(!codename){markFieldError('suFieldCodename');missing.push('codename');}
  if(!fbUid){markFieldError('suFieldFb');missing.push('Facebook UID');}
  if(!joined){markFieldError('suFieldJoined');missing.push('join date');}
  if(!pw){markFieldError('suFieldPassword');missing.push('password');}
  if(!document.getElementById('suPasswordResponsibility').checked){markFieldError('suFieldPassword');missing.push('password responsibility acknowledgment');}
  if(!file){markFieldError('suFieldId');missing.push('ID picture');}
  if(missing.length){showSignupError('Enter your '+(missing.length===1?missing[0]:missing.slice(0,-1).join(', ')+' and '+missing[missing.length-1])+' to submit for verification.');return;}
  if(file.size>5*1024*1024){markFieldError('suFieldId');showSignupError('ID picture must be 5 MB or smaller.');return;}

  var uidCheck=await supabaseClient.rpc('aez_facebook_uid_exists',{p_facebook_uid:fbUid});
  if(uidCheck.error){showSignupError('Facebook UID verification is unavailable. Make sure the ÆZ member registration SQL update has been applied.');return;}
  if(uidCheck.data===true){markFieldError('suFieldFb');showSignupError('This Facebook UID is already registered. Each member must use a unique Facebook UID.');return;}

  var btn=document.querySelector('#signupForm .enter-full');
  btn.disabled=true; btn.textContent='Creating Account…';
  /* Members do not enter an email. A Supabase Edge Function creates the Auth
     user server-side with email_confirm=true, so the existing gang officer
     email-verification requirement can remain enabled for gang registration.
     The service-role key never reaches this browser. */
  var created=await supabaseClient.functions.invoke('create-member',{body:{
    name:name,gang:gang,position:position,codename:codename,facebook_uid:fbUid,joined_date:joined,password:pw
  }});
  if(created.error){btn.disabled=false;btn.textContent='Submit Registration';showSignupError(created.error.message||'Member account could not be created.');return;}
  if(!created.data || !created.data.user_id || !created.data.auth_email){btn.disabled=false;btn.textContent='Submit Registration';showSignupError('Member account could not be created. Deploy the create-member Supabase Edge Function first.');return;}

  var auth=await supabaseClient.auth.signInWithPassword({email:created.data.auth_email,password:pw});
  if(auth.error || !auth.data || !auth.data.user){btn.disabled=false;btn.textContent='Submit Registration';showSignupError('The member account was created but could not be signed in for registration. Please contact Division Command.');return;}
  var user=auth.data.user;

  btn.textContent='Saving Registration…';
  var ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
  var path=user.id+'/'+crypto.randomUUID()+'.'+ext;
  var upload=await supabaseClient.storage.from('id-documents').upload(path,file,{upsert:false,contentType:file.type||'image/jpeg'});
  if(upload.error){await supabaseClient.auth.signOut();btn.disabled=false;btn.textContent='Submit Registration';showSignupError('Account created, but the ID upload failed: '+upload.error.message);return;}

  var upd=await supabaseClient.from('profiles').update({full_name:name,email_verified:true,id_photo_path:path}).eq('id',user.id);
  if(upd.error){await supabaseClient.auth.signOut();btn.disabled=false;btn.textContent='Submit Registration';showSignupError('Your account was created but the member information could not be saved: '+upd.error.message);return;}

  pendingApplicant={full_name:name,codename:codename,gang:gang,position:position,fbUid:fbUid,joined:joined,photoPath:path};
  localStorage.setItem('aez_pending_member_submission',JSON.stringify(pendingApplicant));

  document.getElementById('pendingName').textContent=name;
  document.getElementById('pendingCodename').textContent=codename;
  document.getElementById('pendingGang').textContent=gang;
  document.getElementById('pendingFb').textContent=fbUid;
  document.getElementById('pendingJoined').textContent=new Date(joined+'T00:00:00').toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});
  document.getElementById('pendingPhoto').src=document.getElementById('uploadPreview').src;
  document.getElementById('pendingStamp').textContent='PENDING ADMIN APPROVAL';
  document.getElementById('pendingStamp').className='stamp neutral';
  document.getElementById('pendingApplicationStatus').textContent='Submitted to Admin Review';
  document.getElementById('pendingNote').innerHTML='Your registration has been submitted to Admin Review. You cannot enter the Arena until an authorized administrator approves the application.';
  document.getElementById('signupForm').style.display='none';
  document.getElementById('signupPending').style.display='block';
  await logAgentActivity('Registration Submitted','REGISTRATION','Submitted an ÆZ Agent registration for Admin Review.',{name:name,gang:gang,position:position,facebook_uid:fbUid});
  await supabaseClient.auth.signOut();
  btn.disabled=false;btn.textContent='Submit Registration';
}

async function adminLogin(){
  ['adminFieldEmail','adminFieldPosition','adminFieldPassword'].forEach(clearFieldError);
  hideAdminLoginError();
  if(!supabaseReady){showAdminLoginError('Supabase is not configured yet.');return;}
  var email=document.getElementById('adminEmailInput').value.trim().toLowerCase();
  var position=document.getElementById('adminPositionSelect').value;
  var pw=document.getElementById('adminPasswordInput').value;
  var missing=[];
  if(!email){markFieldError('adminFieldEmail');missing.push('email');}
  if(!position){markFieldError('adminFieldPosition');missing.push('position');}
  if(!pw){markFieldError('adminFieldPassword');missing.push('password');}
  if(missing.length){showAdminLoginError('Enter your '+missing.join(', ')+' to continue.');return;}

  var btn=document.getElementById('adminLoginSubmitBtn');
  btn.disabled=true; btn.textContent='Verifying…';
  var result=await supabaseClient.auth.signInWithPassword({email:email,password:pw});
  if(result.error){
    btn.disabled=false; btn.textContent='Enter Admin Command';
    failedAttempts++;
    if(failedAttempts>=LOCKOUT_AFTER){
      showAdminLoginError('Too many failed attempts. Please wait before trying again.');
    }else{
      showAdminLoginError('Access denied. Check your email and position.');
    }
    return;
  }

  var user=result.data.user;
  if(!user.email_confirmed_at){
    await supabaseClient.auth.signOut();
    btn.disabled=false; btn.textContent='Enter Admin Command';
    showAdminLoginError('Verify your email address using the link we sent before signing in.');
    return;
  }
  var profileResult=await supabaseClient.from('profiles').select('*').eq('id',user.id).single();
  if(profileResult.error || !profileResult.data){
    await supabaseClient.auth.signOut(); btn.disabled=false; btn.textContent='Enter Admin Command';
    showAdminLoginError('Your command profile could not be found. Contact Division Command.'); return;
  }
  var profile=profileResult.data;
  if(profile.status!=='approved'){
    await supabaseClient.auth.signOut(); btn.disabled=false; btn.textContent='Enter Admin Command';
    showAdminLoginError('Your command profile is not approved for access.'); return;
  }
  if(profile.role!==position){
    await supabaseClient.auth.signOut(); btn.disabled=false; btn.textContent='Enter Admin Command';
    showAdminLoginError('The selected position does not match your approved command role.'); return;
  }
  if(!['owner','admin','editor'].includes(profile.role)){
    await supabaseClient.auth.signOut(); btn.disabled=false; btn.textContent='Enter Admin Command';
    showAdminLoginError('This account is not authorized for Admin Command.'); return;
  }

  failedAttempts=0; currentProfile=profile; currentAgent=profileToAgent(profile);
  applyAgentToUI(currentAgent);
  await logAgentActivity('Admin Command Login', 'ACCESS', 'Entered Admin Command successfully.', {role:profile.role});
  removeAuthScreensAndShowApp();
  nav(document.querySelector('.nav-item[data-view="dashboard"]'));
  animateCounters();
}

function simulateGangVerification(){
  showSignupError('Demo verification has been disabled. Approvals are now controlled by the Supabase Admin Review panel.');
}

function exitAdminReviewPage(){
  document.body.classList.remove('admin-review-mode');
  var adminPage=document.getElementById('view-admin');
  if(adminPage){
    adminPage.classList.remove('active');
    adminPage.style.setProperty('display','none','important');
  }
  var app=document.getElementById('app');
  if(app){
    app.style.removeProperty('display');
  }
  var dashboard=document.querySelector('.nav-item[data-view="dashboard"]');
  if(dashboard){
    document.querySelectorAll('.nav-item, .bn-item').forEach(function(n){
      n.classList.toggle('active', n.getAttribute('data-view')==='dashboard');
    });
    document.querySelectorAll('#app .view').forEach(function(v){
      v.classList.remove('active');
      v.style.display='none';
    });
    var dash=document.getElementById('view-dashboard');
    if(dash){ dash.classList.add('active'); dash.style.display='block'; }
  }
  window.scrollTo({top:0,behavior:'instant'});
}

function syncMobileAdminNavVisibility(){
  var allowed=!!currentProfile && currentProfile.status==='approved' && ['admin','owner'].includes(currentProfile.role);
  document.querySelectorAll('#mobileNavContent .nav-item[data-view="admin"]').forEach(function(item){
    /* The desktop source carries style="display:none" until login. A cloned
       mobile item keeps that inline style, so explicitly sync it after auth. */
    item.style.display=allowed?'flex':'none';
  });
  document.querySelectorAll('.bn-item.admin-mobile').forEach(function(item){
    item.style.display=allowed?'flex':'none';
  });
}
function initMobileMenu(){
  var source=document.querySelector('.sidebar');
  var target=document.getElementById('mobileNavContent');
  if(!source || !target || target.childElementCount){ syncMobileAdminNavVisibility(); return; }
  source.querySelectorAll('.nav-group').forEach(function(group){
    var clone=group.cloneNode(true);
    clone.querySelectorAll('[id]').forEach(function(node){ node.removeAttribute('id'); });
    clone.querySelectorAll('.nav-item').forEach(function(item){
      item.setAttribute('onclick','nav(this)');
      item.addEventListener('click', closeMobileMenu);
    });
    target.appendChild(clone);
  });
  syncMobileAdminNavVisibility();
}
function toggleMobileMenu(){
  var drawer=document.getElementById('mobileDrawer');
  var backdrop=document.getElementById('mobileMenuBackdrop');
  var btn=document.getElementById('mobileMenuBtn');
  if(!drawer || !backdrop) return;
  initMobileMenu();
  var open=!drawer.classList.contains('open');
  drawer.classList.toggle('open',open);
  backdrop.classList.toggle('open',open);
  document.body.classList.toggle('mobile-menu-open',open);
  drawer.setAttribute('aria-hidden',open?'false':'true');
  if(btn) btn.setAttribute('aria-expanded',open?'true':'false');
}
function closeMobileMenu(){
  var drawer=document.getElementById('mobileDrawer');
  var backdrop=document.getElementById('mobileMenuBackdrop');
  var btn=document.getElementById('mobileMenuBtn');
  if(drawer) drawer.classList.remove('open');
  if(backdrop) backdrop.classList.remove('open');
  document.body.classList.remove('mobile-menu-open');
  if(drawer) drawer.setAttribute('aria-hidden','true');
  if(btn) btn.setAttribute('aria-expanded','false');
}
window.addEventListener('keydown',function(e){ if(e.key==='Escape') closeMobileMenu(); });
window.addEventListener('resize',function(){ if(window.innerWidth>960) closeMobileMenu(); });
document.addEventListener('DOMContentLoaded',initMobileMenu);

function nav(el){
  closeMobileMenu();
  if(!currentProfile || currentProfile.status!=='approved'){ showScreen('login'); return; }
  var view = el.getAttribute('data-view');

  if(view==='admin' && !['admin','owner'].includes(currentProfile.role)){
    return;
  }

  logAgentActivity('Opened '+(view==='dashboard'?'Home':view.charAt(0).toUpperCase()+view.slice(1)), 'NAVIGATION', 'Opened the '+view+' section.').catch(function(){});

  document.querySelectorAll('.nav-item, .bn-item').forEach(function(n){
    n.classList.toggle('active', n.getAttribute('data-view')===view);
  });

  /* Admin Review is a standalone page outside #app. Never leave an empty
     dashboard shell behind it, and never show a transition/blank view first. */
  if(view==='admin'){
    document.body.classList.add('admin-review-mode');
    var app=document.getElementById('app');
    if(app){ app.style.setProperty('display','none','important'); }
    var adminPage=document.getElementById('view-admin');
    if(adminPage){
      adminPage.classList.add('active');
      adminPage.style.setProperty('display','block','important');
    }
    window.scrollTo({top:0,behavior:'instant'});
    loadAdminApplications();
    loadGangRegistrations();
    return;
  }

  document.body.classList.remove('admin-review-mode');
  var adminPage=document.getElementById('view-admin');
  if(adminPage){
    adminPage.classList.remove('active');
    adminPage.style.setProperty('display','none','important');
  }
  var app=document.getElementById('app');
  if(app){ app.style.removeProperty('display'); }

  /* Only switch among the normal Arena views inside #app. */
  document.querySelectorAll('#app .view').forEach(function(v){
    v.classList.remove('active');
    v.style.display='none';
  });
  var target=document.getElementById('view-'+view);
  if(!target) return;
  target.classList.add('active');
  target.style.display='block';
}

/* ============ ACCOUNT MENU / LOGOUT ============ */
function toggleAvatarMenu(){
  document.getElementById('avatarMenu').classList.toggle('show');
}
document.addEventListener('click', function(e){
  var chip = document.getElementById('avatarChip');
  if(chip && !chip.contains(e.target)){
    document.getElementById('avatarMenu').classList.remove('show');
  }
});
var aezLoggingOut = false;

async function logout(){
  /* Logout is a hard return to the entry-choice screen. Prevent the
     Supabase SIGNED_OUT listener from briefly showing either Secure Access
     screen during the transition. */
  aezLoggingOut = true;
  sessionStorage.removeItem('aez_arena_entered');
  arenaEntryMode='member';
  document.body.classList.remove('authenticated');
  document.body.classList.remove('admin-review-mode');
  currentAgent=null;
  currentProfile=null;
  var menu=document.getElementById('avatarMenu');
  if(menu) menu.classList.remove('show');

  /* Hide every screen immediately so no login page can flash on logout. */
  document.querySelectorAll('.screen').forEach(function(screen){
    screen.classList.remove('active');
    screen.style.setProperty('display','none','important');
    screen.setAttribute('aria-hidden','true');
  });

  if(supabaseClient){
    try{ await supabaseClient.auth.signOut(); }catch(e){ console.warn('Logout error:', e); }
  }

  /* Rebuild the original entry state exactly as it appears on first load. */
  location.reload();
}

/* ============ SUPABASE SESSION / ADMIN REVIEW ============ */
async function restoreSupabaseSession(){
  /* HARD INITIAL ENTRY LOCK: every fresh website load starts on the entry-choice page only.
     Existing Supabase sessions never bypass this screen. */
  document.body.classList.remove('authenticated');
  currentAgent=null;
  currentProfile=null;
  sessionStorage.removeItem('aez_arena_entered');
  arenaEntryMode='member';

  document.querySelectorAll('.screen').forEach(function(screen){
    screen.classList.remove('active');
    screen.style.setProperty('display','none','important');
    screen.setAttribute('aria-hidden','true');
  });

  var landing=document.getElementById('landing');
  if(landing){
    landing.classList.remove('leaving');
    landing.classList.add('active');
    landing.style.setProperty('display','flex','important');
    landing.setAttribute('aria-hidden','false');
  }
}

/* React immediately to Supabase session changes. This prevents the dashboard
   from remaining visible after an expired/removed session. */
if(supabaseReady){
  supabaseClient.auth.onAuthStateChange(function(event, session){
    if(event==='SIGNED_IN' && session && localStorage.getItem('aez_pending_gang_registration')){
      setTimeout(function(){ finalizeGangRegistration(session.user).catch(function(err){ console.warn('Gang registration finalization failed:',err); }); },250);
    }
    if(event==='SIGNED_OUT' || !session){
      document.body.classList.remove('authenticated');
      currentAgent=null;
      currentProfile=null;
      if(aezLoggingOut){ return; }
      if(!aezLoggingOut && document.body.classList.contains('authenticated')){ showScreen('login'); }
    }
  });
}

var ADMIN_GANGS=[];
var adminGangFilter='ALL';
var adminStatusFilter='ALL';
var adminSearchQuery='';
var adminSearchCategory='all';
var adminRosterData=[];

function renderAdminFilters(){
  var gangBox=document.getElementById('adminGangFilters');
  var statusBox=document.getElementById('adminStatusFilters');
  if(gangBox){
    gangBox.innerHTML=['ALL'].concat(ADMIN_GANGS).map(function(g){
      return '<button type="button" class="admin-filter-btn '+(adminGangFilter===g?'active':'')+'" onclick="setAdminGangFilter(this.dataset.gang)" data-gang="'+escapeHtml(g)+'">'+escapeHtml(g)+'</button>';
    }).join('');
  }
  if(statusBox){
    var statuses=[['ALL','All statuses'],['pending','Pending'],['approved','Approved'],['rejected','Rejected']];
    statusBox.innerHTML=statuses.map(function(it){
      return '<button type="button" class="admin-filter-btn '+(adminStatusFilter===it[0]?'active':'')+'" onclick="setAdminStatusFilter(this.dataset.status)" data-status="'+it[0]+'">'+it[1]+'</button>';
    }).join('');
  }
}
function setAdminGangFilter(v){adminGangFilter=v||'ALL';renderAdminFilters();renderAdminApplications();}
function setAdminStatusFilter(v){adminStatusFilter=v||'ALL';renderAdminFilters();renderAdminApplications();}
function setAdminSearch(v){adminSearchQuery=String(v||'').trim().toLowerCase();renderAdminApplications();}
function setAdminSearchCategory(v){adminSearchCategory=v||'all';renderAdminApplications();}
function getAdminSearchValue(a){
  if(adminSearchCategory==='gang') return String(a.gang||'');
  if(adminSearchCategory==='status') return String(a.status||'');
  if(adminSearchCategory==='codename') return String(a.codename||'');
  if(adminSearchCategory==='email') return String(a.email||'');
  if(adminSearchCategory==='facebook_uid') return String(a.facebook_uid||'');
  if(adminSearchCategory==='role') return String(a.role||'');
  return [a.gang,a.status,a.codename,a.email,a.facebook_uid,a.role].filter(Boolean).join(' ');
}
function adminStatusClass(status){
  return status==='approved'?'admin-status-approved':status==='rejected'?'admin-status-rejected':'admin-status-pending';
}
function adminStatusLabel(status){
  return status?status:'unknown';
}
function signedAdminPhoto(path,cb){
  if(!path || !supabaseClient){cb(null);return;}
  supabaseClient.storage.from('id-documents').createSignedUrl(path,3600).then(function(r){cb(r && r.data ? r.data.signedUrl : null);});
}

function renderAdminApplications(){
  var box=document.getElementById('adminApplications');
  var statusEl=document.getElementById('adminStatus');
  if(!box) return;
  if(!adminRosterData.length){
    box.innerHTML='<div class="page-sub" style="padding:12px 2px">No registrations found.</div>';
    if(statusEl) statusEl.textContent='0 members';
    renderAdminSelectedMember(null);
    return;
  }
  var filtered=adminRosterData.filter(function(a){
    var matchesGang=(adminGangFilter==='ALL' || (a.gang||'')===adminGangFilter);
    var matchesStatus=(adminStatusFilter==='ALL' || (a.status||'pending')===adminStatusFilter);
    var haystack=getAdminSearchValue(a).toLowerCase();
    var matchesSearch=!adminSearchQuery || haystack.indexOf(adminSearchQuery)!==-1;
    return matchesGang && matchesStatus && matchesSearch;
  });
  if(statusEl){
    var pending=adminRosterData.filter(function(a){return a.status==='pending';}).length;
    var approved=adminRosterData.filter(function(a){return a.status==='approved';}).length;
    var rejected=adminRosterData.filter(function(a){return a.status==='rejected';}).length;
    statusEl.textContent=adminRosterData.length+' total · '+pending+' pending';
    statusEl.title=approved+' approved · '+rejected+' rejected';
  }
  if(!filtered.length){
    box.innerHTML='<div class="page-sub" style="padding:12px 2px">No registrations match the selected filters or search.</div>';
    renderAdminSelectedMember(null);
    return;
  }
  if(!adminSelectedMemberId || !filtered.some(function(a){return a.id===adminSelectedMemberId;})){
    adminSelectedMemberId=filtered[0].id;
  }
  var groups={};
  filtered.forEach(function(a){var g=a.gang||'Unassigned';(groups[g]||(groups[g]=[])).push(a);});
  var order=(adminGangFilter==='ALL'?ADMIN_GANGS.concat(['Unassigned']):[adminGangFilter]);
  var html='';
  order.forEach(function(g){
    if(!groups[g] || !groups[g].length) return;
    html+='<section class="admin-gang-section">';
    html+='<div class="admin-gang-heading"><div class="name">'+escapeHtml(g)+'</div><div class="count">'+groups[g].length+' member'+(groups[g].length===1?'':'s')+'</div></div>';
    html+='<div class="admin-member-list">';
    groups[g].forEach(function(a){
      var safeId=escapeHtml(a.id||'');
      var status=a.status||'pending';
      var safeCode=escapeHtml(a.codename||'Unnamed');
      var safeName=escapeHtml(a.full_name||a.codename||'Unnamed');
      var initials=(a.codename||'AEZ').trim().slice(0,2).toUpperCase();
      html+='<button type="button" class="admin-roster-item '+(a.id===adminSelectedMemberId?'active':'')+'" data-member-id="'+safeId+'" onclick="selectAdminMember(this.dataset.memberId)">'
        +'<div id="adminRosterPhoto_'+safeId+'" class="admin-roster-avatar">'+escapeHtml(initials)+'</div>'
        +'<div class="admin-roster-copy"><strong>'+safeName+'</strong><div class="sub">'+safeCode+'</div><div class="gang">'+escapeHtml(a.gang||'Unassigned')+'</div></div>'
        +'<span class="admin-roster-status '+adminStatusClass(status)+' '+escapeHtml(status)+'">'+escapeHtml(adminStatusLabel(status))+'</span>'
        +'</button>';
    });
    html+='</div></section>';
  });
  box.innerHTML=html;
  filtered.forEach(function(a){
    if(!a.id_photo_path) return;
    signedAdminPhoto(a.id_photo_path,function(url){
      var wrap=document.getElementById('adminRosterPhoto_'+a.id);
      if(!wrap || !url) return;
      wrap.innerHTML='<img src="'+escapeHtml(url)+'" alt="ID picture">';
    });
  });
  renderAdminSelectedMember(adminSelectedMemberId);
}

var adminSelectedMemberId=null;
function selectAdminMember(id){
  adminSelectedMemberId=id;
  document.querySelectorAll('.admin-roster-item').forEach(function(el){
    el.classList.toggle('active',el.dataset.memberId===id);
  });
  if(window.matchMedia && window.matchMedia('(max-width:600px)').matches){
    document.body.classList.add('admin-member-selected');
  }
  renderAdminSelectedMember(id);
  setTimeout(function(){ window.scrollTo({top:0,behavior:'smooth'}); },20);
}
function backToAdminRosterMobile(){
  document.body.classList.remove('admin-member-selected');
  var panel=document.getElementById('adminSelectedMemberPanel');
  if(panel){ panel.scrollIntoView({behavior:'smooth',block:'start'}); }
}
function renderAdminSelectedMember(id){
  var panel=document.getElementById('adminSelectedMemberPanel');
  if(!panel) return;
  var a=adminRosterData.find(function(x){return x.id===id;});
  if(!a){
    panel.innerHTML='<button type="button" class="admin-mobile-back admin-page-btn" onclick="backToAdminRosterMobile(); return false;" style="margin-bottom:12px;width:100%;justify-content:center;">← Back to Members</button><div class="card admin-detail-empty"><div><div class="stamp active" style="margin-bottom:14px">COMMAND REVIEW</div><h2 style="font-size:20px;margin-bottom:8px">Select a Member</h2><div class="page-sub" style="max-width:620px;margin:0 auto;line-height:1.6">Choose a registered member from the left-side roster. Their complete submitted information, ID picture, status, registration date/time, gang details, and decision history will appear here.</div></div></div>';
    return;
  }
  var status=a.status||'pending';
  var safeId=escapeHtml(a.id||'');
  var initials=(a.codename||'AEZ').trim().slice(0,2).toUpperCase();
  var approved=formatAdminDate(a.approved_at);
  var submitted=formatAdminDate(a.created_at);
  var joined=formatAdminJoinedDate(a.joined_date);
  var rejection=escapeHtml(a.rejection_reason||'—');
  var actions='';
  if(status==='pending'){
    actions='<div class="admin-member-actions">'
      +'<button class="admin-btn approve" data-application-id="'+safeId+'" onclick="approveApplication(this.dataset.applicationId)">Approve Registration</button>'
      +'<button class="admin-btn reject" data-application-id="'+safeId+'" onclick="rejectApplication(this.dataset.applicationId)">Reject Registration</button>'
      +'</div>';
  }
  var mobileBack='<button type="button" class="admin-mobile-back admin-page-btn" onclick="backToAdminRosterMobile(); return false;" style="margin-bottom:12px;width:100%;justify-content:center;">← Back to Members</button>';
  panel.innerHTML=mobileBack+'<div class="card admin-detail-card">'
    +'<div class="admin-detail-head">'
      +'<div class="admin-detail-identity">'
        +'<div id="adminDetailPhoto_'+safeId+'" class="admin-detail-photo">'+escapeHtml(initials)+'</div>'
        +'<div><div class="admin-detail-name">'+escapeHtml(a.full_name||a.codename||'Unnamed Member')+'</div><div class="admin-detail-email">'+escapeHtml(a.codename||'—')+'</div>'
        +'<div class="admin-detail-meta"><span class="mini">'+escapeHtml(a.gang||'Unassigned')+'</span><span class="mini">Role: '+escapeHtml(a.role||'member')+'</span><span class="mini">Facebook UID: '+escapeHtml(a.facebook_uid||'—')+'</span></div></div>'
      +'</div>'
      +'<span class="admin-status-badge '+adminStatusClass(status)+'">'+escapeHtml(adminStatusLabel(status))+'</span>'
    +'</div>'
    +'<div class="admin-detail-grid">'
      +'<div class="admin-member-field"><div class="label">Name</div><div class="value">'+escapeHtml(a.full_name||'—')+'</div></div>'
      +'<div class="admin-member-field"><div class="label">Gang</div><div class="value">'+escapeHtml(a.gang||'Unassigned')+'</div></div>'
      +'<div class="admin-member-field"><div class="label">Codename</div><div class="value">'+escapeHtml(a.codename||'—')+'</div></div>'
      +'<div class="admin-member-field"><div class="label">Facebook UID</div><div class="value">'+escapeHtml(a.facebook_uid||'—')+'</div></div>'
      +'<div class="admin-member-field"><div class="label">Date joined the gang</div><div class="value">'+escapeHtml(joined)+'</div></div>'
      +'<div class="admin-member-field"><div class="label">Registration submitted</div><div class="value">'+escapeHtml(submitted)+'</div></div>'
      +'<div class="admin-member-field"><div class="label">Current status</div><div class="value">'+escapeHtml(adminStatusLabel(status))+'</div></div>'
      +'<div class="admin-member-field"><div class="label">Decision date / time</div><div class="value">'+(a.approved_at?escapeHtml(approved):'—')+'</div></div>'
      +'<div class="admin-member-field"><div class="label">Decision by</div><div class="value">'+escapeHtml(a.approved_by||'—')+'</div></div>'
      +(status==='rejected'?'<div class="admin-member-field full"><div class="label">Rejection reason</div><div class="value">'+rejection+'</div></div>':'')
    +'</div>'
    +actions
    +'<div class="admin-readonly-note">Password is never displayed or retrievable here. The ID picture is available only to authorized Command reviewers.</div>'
    +'</div>';
  if(a.id_photo_path){
    signedAdminPhoto(a.id_photo_path,function(url){
      var wrap=document.getElementById('adminDetailPhoto_'+a.id);
      if(!wrap || !url) return;
      wrap.innerHTML='<img src="'+escapeHtml(url)+'" alt="ID picture">';
    });
  }
}


async function loadProfileChangeRequests(){
  var box=document.getElementById('adminChangeRequests'); if(!box||!supabaseReady||!currentProfile) return;
  box.innerHTML='<div class="page-sub">Loading…</div>';
  var res=await supabaseClient.from('profile_change_requests').select('*').order('requested_at',{ascending:false});
  if(res.error){box.innerHTML='<div class="page-sub">Profile change approvals are unavailable. Configure the profile_change_requests table and RLS policies in Supabase.</div>';return;}
  var rows=res.data||[];
  if(!rows.length){box.innerHTML='<div class="page-sub">No profile change requests.</div>';return;}
  box.innerHTML=rows.map(function(r){
    var req=r.requested_values||{}; var cur=r.current_values||{}; var status=r.status||'pending';
    var prof=(adminRosterData||[]).find(function(a){return a.id===r.profile_id;});
    var name=prof?(prof.codename||prof.email||'Member'):r.profile_id;
    var gang=prof?(prof.gang||'—'):'—';
    var cell=function(label,oldv,newv){return '<div class="admin-change-cell"><div class="label">'+escapeHtml(label)+'</div><div class="value"><span style="color:var(--ash-dim)">'+escapeHtml(oldv||'—')+'</span> <span style="color:var(--gold)">→</span> <strong>'+escapeHtml(newv||'—')+'</strong></div></div>';};
    var actions=status==='pending'?'<div class="admin-change-actions"><button class="admin-btn approve" data-request-id="'+escapeHtml(r.id)+'" onclick="approveProfileChangeRequest(this.dataset.requestId)">Approve Changes</button><button class="admin-btn reject" data-request-id="'+escapeHtml(r.id)+'" onclick="rejectProfileChangeRequest(this.dataset.requestId)">Reject Changes</button></div>':'';
    return '<div class="admin-change-request"><div class="admin-change-request-head"><div><div class="admin-change-request-name">'+escapeHtml(name)+'</div><div class="admin-change-request-meta">'+escapeHtml(gang)+' · Submitted '+escapeHtml(formatAdminDate(r.requested_at))+'</div></div><span class="admin-status-badge '+adminStatusClass(status)+'">'+escapeHtml(status)+'</span></div><div class="admin-change-request-body">'+cell('Gang',cur.gang,req.gang)+cell('Position',cur.position,req.position)+cell('Codename',cur.codename,req.codename)+cell('Facebook UID',cur.facebook_uid,req.facebook_uid)+cell('Joined Date',cur.joined_date,req.joined_date)+cell('ID Picture',cur.id_photo_path?'On file':'None',req.id_photo_path?'Replacement uploaded':'No change')+'</div>'+actions+'</div>';
  }).join('');
}
async function approveProfileChangeRequest(id){
  if(!currentProfile || !['owner','admin'].includes(currentProfile.role)){
    alert('Restricted: only an ÆZ Owner or Admin can approve profile changes.');
    return;
  }

  if(!confirm('Approve these profile changes?')) return;

  var r=await supabaseClient
    .from('profile_change_requests')
    .select('*')
    .eq('id',id)
    .single();

  if(r.error||!r.data){
    alert('Change request not found: '+(r.error?r.error.message:'Unknown error'));
    return;
  }

  if(r.data.status!=='pending'){
    alert('This request has already been reviewed.');
    return;
  }

  var req=r.data.requested_values||{};
  var cur=r.data.current_values||{};

  var updatePayload={
    gang:req.gang,
    position:req.position,
    codename:req.codename,
    facebook_uid:req.facebook_uid,
    joined_date:req.joined_date,
    id_photo_path:Object.prototype.hasOwnProperty.call(req,'id_photo_path')
      ? req.id_photo_path
      : (cur.id_photo_path||null)
  };

  var upd=await supabaseClient
    .from('profiles')
    .update(updatePayload)
    .eq('id',r.data.profile_id)
    .select('id')
    .single();

  if(upd.error){
    alert(
      'Profile update failed: '+upd.error.message+
      '\n\nMake sure the Owner/Admin profiles UPDATE policy from the supplied SQL has been applied.'
    );
    return;
  }

  var done=await supabaseClient
    .from('profile_change_requests')
    .update({
      status:'approved',
      reviewed_by:currentProfile.id,
      reviewed_at:new Date().toISOString(),
      rejection_reason:null
    })
    .eq('id',id)
    .eq('status','pending');

  if(done.error){
    alert('Profile was updated, but the request status could not be recorded: '+done.error.message);
    return;
  }

  await logAgentActivity(
    'Approved Profile Change',
    'ADMIN',
    'Approved a member profile change request.',
    {request_id:id, profile_id:r.data.profile_id}
  );

  await loadProfileChangeRequests();
  await loadAdminApplications();
}

async function rejectProfileChangeRequest(id){
  if(!currentProfile || !['owner','admin'].includes(currentProfile.role)) return;
  var reason=prompt('Reason for rejecting this profile change request:','Please revise the submitted information.');
  if(reason===null) return;
  var done=await supabaseClient.from('profile_change_requests').update({status:'rejected',reviewed_by:currentProfile.id,reviewed_at:new Date().toISOString(),rejection_reason:reason.trim()||null}).eq('id',id).eq('status','pending');
  if(done.error){alert('Could not reject the request: '+done.error.message+'\n\nMake sure the profile_change_requests UPDATE policy from the supplied SQL has been applied.');return;}
  await loadProfileChangeRequests();
}

var gangRegistrationData=[];
async function loadGangRegistrations(){
  var box=document.getElementById('gangRegistrationList'), statusEl=document.getElementById('gangRegistrationStatus');
  if(!box || !currentProfile || !['admin','owner'].includes(currentProfile.role)) return;
  if(statusEl) statusEl.textContent='Loading gang registrations…';
  var res=await supabaseClient.from('gang_registrations').select('*').order('created_at',{ascending:false});
  if(res.error){if(statusEl)statusEl.textContent='Could not load: '+res.error.message;if(box)box.innerHTML='<div class="page-sub">Create the gang_registrations table and apply the supplied RLS SQL.</div>';return;}
  gangRegistrationData=res.data||[];
  var pending=gangRegistrationData.filter(function(x){return x.status==='pending';}).length;
  if(statusEl)statusEl.textContent=gangRegistrationData.length+' total · '+pending+' pending';
  if(!gangRegistrationData.length){box.innerHTML='<div class="page-sub">No gang registrations yet.</div>';return;}
  box.innerHTML=gangRegistrationData.map(function(g){
    var status=g.status||'pending';
    var actions=status==='pending'?'<div class="gang-admin-actions"><button class="admin-btn approve" onclick="reviewGangRegistration(\''+escapeHtml(g.id)+'\',\'approved\')">Approve Gang</button><button class="admin-btn reject" onclick="reviewGangRegistration(\''+escapeHtml(g.id)+'\',\'rejected\')">Reject Gang</button></div>':'';
    return '<article class="gang-admin-item"><div class="gang-admin-head"><div><div class="gang-admin-name">'+escapeHtml(g.gang_name||'Unnamed Gang')+' <span style="color:var(--gold)">['+escapeHtml(g.gang_initial||'—')+']</span></div><div class="gang-admin-meta">Submitted by '+escapeHtml(g.email||'—')+' · '+escapeHtml(formatAdminDate(g.created_at))+'</div></div><span class="gang-status '+escapeHtml(status)+'">'+escapeHtml(status)+'</span></div><div class="gang-admin-fields">'+
      gangCell('Alias / Alis',g.alias)+gangCell('Motto',g.motto)+gangCell('Date Created',formatAdminJoinedDate(g.date_created))+gangCell('Active Members',g.active_members)+gangCell("Leader's Name",g.leader_name)+gangCell('COO Leader',g.coo_leader_name)+gangCell('Officer Email',g.email)+gangCell('Decision',g.reviewed_at?formatAdminDate(g.reviewed_at):'Pending')+'</div>'+actions+'</article>';
  }).join('');
}
function gangCell(label,value){return '<div class="gang-admin-field"><div class="label">'+escapeHtml(label)+'</div><div class="value">'+escapeHtml(value==null||value===''?'—':value)+'</div></div>';}
async function reviewGangRegistration(id,status){
  if(!currentProfile || !['owner','admin'].includes(currentProfile.role)){alert('Restricted: only an ÆZ Owner or Admin can review gang registrations.');return;}
  var verb=status==='approved'?'approve':'reject';
  var reason=null;
  if(status==='rejected'){reason=prompt('Reason for rejecting this gang registration:','Please revise the submitted information.');if(reason===null)return;}
  else if(!confirm('Approve this gang registration?')) return;
  var upd=await supabaseClient.from('gang_registrations').update({status:status,reviewed_by:currentProfile.id,reviewed_at:new Date().toISOString(),rejection_reason:reason?reason.trim():null}).eq('id',id).eq('status','pending');
  if(upd.error){alert('Could not '+verb+' the gang: '+upd.error.message+'\\n\\nMake sure the gang_registrations RLS policies are applied.');return;}
  await logAgentActivity((status==='approved'?'Approved':'Rejected')+' Gang Registration','ADMIN','Reviewed a gang registration.',{gang_registration_id:id,status:status});
  await loadGangRegistrations();
}

async function loadAdminApplications(){
  var statusEl=document.getElementById('adminStatus');
  var box=document.getElementById('adminApplications');

  if(!currentProfile || currentProfile.status!=='approved' || !['admin','owner'].includes(currentProfile.role)){
    if(statusEl) statusEl.textContent='Restricted: ÆZ Owner/Admin access only.';
    if(box) box.innerHTML='';
    return;
  }
  if(!supabaseReady){if(statusEl) statusEl.textContent='Supabase not configured.';return;}

  if(statusEl) statusEl.textContent='Loading registrations…';
  if(box) box.innerHTML='';
  renderAdminFilters();

  var res=await supabaseClient
    .from('profiles')
    .select('id,email,full_name,codename,gang,facebook_uid,joined_date,status,role,id_photo_path,created_at,approved_at,approved_by,rejection_reason,email_verified')
    .eq('email_verified',true)
    .order('gang',{ascending:true})
    .order('created_at',{ascending:true});

  if(res.error){
    if(statusEl) statusEl.textContent='Could not load registrations: '+res.error.message;
    return;
  }
  adminRosterData=res.data||[];
  ADMIN_GANGS=[...new Set(adminRosterData.map(function(a){return String(a.gang||'').trim();}).filter(Boolean))].sort();
  renderAdminApplications();
}
function formatAdminJoinedDate(v){
  if(!v) return '—';
  try{return new Date(v+'T00:00:00').toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});}catch(e){return v;}
}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];});}
function formatAdminDate(v){try{return new Date(v).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});}catch(e){return v||'';}}
async function approveApplication(id){
  if(!currentProfile || !['admin','owner'].includes(currentProfile.role)){
    alert('Restricted: only an ÆZ Owner or Admin can approve members.');
    return;
  }
  if(!confirm('Approve this registration?')) return;

  var userResult = await supabaseClient.auth.getUser();
  var user = userResult.data && userResult.data.user;
  if(userResult.error || !user){
    alert('Approval failed: your admin session is no longer valid. Please log in again.');
    return;
  }

  var now = new Date().toISOString();
  var r = await supabaseClient
    .from('profiles')
    .update({
      status:'approved',
      approved_by:user.id,
      approved_at:now,
      rejection_reason:null
    })
    .eq('id',id)
    .eq('status','pending')
    .select('id,status');

  if(r.error){
    alert('Approval failed: '+r.error.message+'\n\nIf this says the operation is blocked by Row Level Security, apply the Supabase policy supplied with this update.');
    return;
  }

  if(!r.data || r.data.length===0){
    alert('This application is no longer pending, or Supabase did not allow the update.');
    await loadAdminApplications();
    return;
  }

  await logAgentActivity('Approved Registration', 'ADMIN', 'Approved a pending ÆZ registration.', {member_id:id});
  await loadAdminApplications();
}

async function rejectApplication(id){
  if(!currentProfile || !['admin','owner'].includes(currentProfile.role)){
    alert('Restricted: only an ÆZ Owner or Admin can reject members.');
    return;
  }

  var reason=prompt('Optional rejection reason:','');
  if(reason===null) return;

  var userResult=await supabaseClient.auth.getUser();
  var user=userResult.data && userResult.data.user;
  if(userResult.error || !user){
    alert('Rejection failed: your admin session is no longer valid. Please log in again.');
    return;
  }

  var r=await supabaseClient
    .from('profiles')
    .update({
      status:'rejected',
      approved_by:user.id,
      approved_at:new Date().toISOString(),
      rejection_reason:reason||null
    })
    .eq('id',id)
    .eq('status','pending')
    .select('id,status');

  if(r.error){
    alert('Rejection failed: '+r.error.message+'\n\nIf this says the operation is blocked by Row Level Security, apply the Supabase policy supplied with this update.');
    return;
  }

  await logAgentActivity('Rejected Registration', 'ADMIN', 'Rejected a pending ÆZ registration.', {member_id:id, reason:reason||''});
  await loadAdminApplications();
}

/* ============ ANIMATED COUNTERS ============ */
function animateCounters(){
  document.querySelectorAll('[data-count]').forEach(function(el){
    var target = parseInt(el.getAttribute('data-count'),10);
    if(el._done) return; el._done = true;
    var dur = 900, start = performance.now();
    function tick(now){
      var p = Math.min(1,(now-start)/dur);
      var eased = 1-Math.pow(1-p,3);
      var val = Math.round(target*eased);
      el.firstChild ? el.childNodes[0].nodeValue = val.toLocaleString() : el.textContent = val.toLocaleString();
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

/* ============ CLOCK ============ */
function tickClock(){
  var d = new Date();
  var s = d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  document.getElementById('liveClock').textContent = s;
  var dashTime = document.getElementById('dashTime');
  if(dashTime) dashTime.textContent = s;
}
setInterval(tickClock,1000); tickClock();

/* ============ BLACK OP COUNTDOWN ============ */
var opRemaining = 14*3600 + 22*60 + 5;
setInterval(function(){
  if(opRemaining<=0) return;
  opRemaining--;
  var h=Math.floor(opRemaining/3600), m=Math.floor((opRemaining%3600)/60), s=opRemaining%60;
  document.getElementById('cdH').textContent = String(h).padStart(2,'0');
  document.getElementById('cdM').textContent = String(m).padStart(2,'0');
  document.getElementById('cdS').textContent = String(s).padStart(2,'0');
},1000);

/* ============ ACTIVITIES ============ */
var activities = [
  {id:'CASE-0501', name:'Case Log Submission', cat:'INTELLIGENCE', status:'Open', time:'Weekly · Fri 11:59 PM', participants:'All agents', points:'1,000 / head', desc:'Submit your weekly head count for division credit. Deductions apply for late or incomplete filings.',
    agent:'Ashford-9', division:'Cadence Gang', filed:'Sep 06, 2026', evidence:'6 heads attached', award:'+6,000',
    history:[['Sep 06, 2026','Filed by Ashford-9'],['Sep 05, 2026','Reminder sent to division']],
    records:[['Cycle total','24,000 pts'],['Deductions this cycle','0']]},
  {id:'CASE-0502', name:'Operation Round 12', cat:'OPERATIONS', status:'Live', time:'Ends in 6h', participants:'42 registered', points:'Up to 5,000', desc:'Answer the operation prompt correctly to claim tiered points. Speed determines your tier.',
    agent:'Marlowe-2', division:'Discourse Gang', filed:'Sep 06, 2026', evidence:'1st correct answer logged', award:'+5,000',
    history:[['Sep 06, 2026, 8:14 PM','Marlowe-2 answered correctly — 1st'],['Sep 06, 2026, 8:20 PM','Vesper-6 answered correctly — 2nd']],
    records:[['Correct answers so far','2'],['Incorrect submissions','5']]},
  {id:'CASE-0503', name:'Intel Hub Drop', cat:'INTELLIGENCE', status:'Open', time:'Ongoing', participants:'Division-wide', points:'5,000 / message', desc:'Contribute verified intelligence to the shared hub for division-wide point credit.',
    agent:'Odessa-4', division:'Charm Gang', filed:'Sep 05, 2026', evidence:'1 verified message', award:'+5,000',
    history:[['Sep 05, 2026','Odessa-4 posted verified intel']],
    records:[['Messages this cycle','3'],['Points from Intel Hub','15,000']]},
  {id:'CASE-0504', name:'Fliptop War — Prelims', cat:'CAMPAIGN BREACH', status:'Registration', time:'Wed & Fri nights', participants:'6 divisions', points:'Up to 100,000', desc:'Qualifying rounds for the Trojan of Cadence title. Registration closes 24h before the war.',
    agent:'Ashford-9', division:'Cadence Gang', filed:'Sep 04, 2026', evidence:'Registration confirmed', award:'+10,000',
    history:[['Sep 04, 2026','Ashford-9 registered as challenger']],
    records:[['Title','Trojan of Cadence'],['Current holder','Ashford-9']]},
  {id:'CASE-0505', name:'Division Arrival — Welcome', cat:'DIVISION', status:'Scheduled', time:'On new gang entry', participants:'Welcoming division', points:'50,000', desc:'Formal welcome protocol for incoming gangs, recorded for division credit.',
    agent:'Kestrel-1', division:'Retort Gang', filed:'Pending', evidence:'Awaiting new gang arrival', award:'—',
    history:[['—','Not yet triggered']],
    records:[['Last welcomed gang','Verse Gang, Aug 12']]},
  {id:'CASE-0506', name:'Code Class — Ciphers II', cat:'TRAINING', status:'Enrolling', time:'Tue, 7:00 PM', participants:'50 max / division', points:'Attendance-based', desc:'Second module in applied cipher-solving, with a recitation component.',
    agent:'Renner-8', division:'Retort Gang', filed:'Sep 03, 2026', evidence:'Attendance sheet open', award:'Pending',
    history:[['Sep 03, 2026','Enrollment opened']],
    records:[['Seats filled','31 / 50']]}
];
var caseIndex = {};
activities.forEach(function(a){ caseIndex[a.id] = a; });

var activeFilter = 'ALL';
function renderActivityFilters(){
  var cats = ['ALL'].concat(Array.from(new Set(activities.map(function(a){ return a.cat; }))));
  var wrap = document.getElementById('actFilters');
  wrap.innerHTML = cats.map(function(c){
    var label = c==='ALL' ? 'All' : c.charAt(0)+c.slice(1).toLowerCase();
    var activeClass = c===activeFilter ? ' active' : '';
    return '<button class="chip'+activeClass+'" onclick="setActivityFilter(&#39;'+c+'&#39;)">'+label+'</button>';
  }).join('');
}
function setActivityFilter(cat){
  activeFilter = cat;
  renderActivityFilters();
  renderActivities();
}
function renderActivities(){
  var grid = document.getElementById('actGrid');
  var list = activeFilter==='ALL' ? activities : activities.filter(function(a){ return a.cat===activeFilter; });
  if(list.length===0){
    grid.innerHTML = '<div class="page-sub" style="padding:20px 4px">No activities in this category right now.</div>';
    return;
  }
  grid.innerHTML = list.map(function(a){
    var pillClass = a.status==='Live' ? 'pill live' : 'pill';
    return '<div class="card clickable act-card" onclick="openCase(&#39;'+a.id+'&#39;)">'
      +'<div class="act-top"><div><div class="act-cat">'+a.cat+'</div><div class="act-name">'+a.name+'</div></div><span class="'+pillClass+'">'+a.status+'</span></div>'
      +'<div class="act-desc">'+a.desc+'</div>'
      +'<div class="act-foot"><span>'+a.time+' · '+a.participants+'</span><span class="act-points">'+a.points+'</span></div>'
      +'</div>';
  }).join('');
}
renderActivityFilters();
renderActivities();

function renderCaseLogRows(){
  var wrap = document.getElementById('caseLogRows');
  if(!wrap) return;
  var logs = activities.filter(function(a){ return a.cat==='INTELLIGENCE'; });
  wrap.innerHTML = logs.map(function(a){
    var pillClass = a.status==='Open' ? 'pill live' : 'pill';
    return '<div class="list-row clickable" onclick="openCase(&#39;'+a.id+'&#39;)"><div class="list-left"><div class="list-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/></svg></div><div><div class="list-title">'+a.id+' · '+a.name+'</div><div class="list-sub">Filed '+a.filed+' · '+a.evidence+'</div></div></div><span class="'+pillClass+'">'+a.status+'</span></div>';
  }).join('');
}
renderCaseLogRows();

/* ============ CASE FILE MODAL ============ */
var currentCase = null;
function openCase(id){
  currentCase = caseIndex[id] || activities[0];
  logAgentActivity('Opened Activity: '+currentCase.name, 'ACTIVITY', 'Viewed the activity record '+currentCase.id+'.', {activity_id:currentCase.id, category:currentCase.cat}).catch(function(){});
  document.getElementById('modalCaseNo').textContent = currentCase.id;
  renderModalPane('overview');
  document.querySelectorAll('#modalTabs .tab-btn').forEach(function(b,i){ b.classList.toggle('active', i===0); });
  document.querySelectorAll('.modal-pane').forEach(function(p,i){ p.style.display = i===0 ? 'block' : 'none'; });
  document.getElementById('caseModal').classList.add('show');
}
function renderModalPane(key){
  var c = currentCase; if(!c) return;
  if(key==='overview'){
    document.getElementById('modalPane-overview').innerHTML =
      '<div class="kv-row"><span class="k">Case number</span><span class="v">'+c.id+'</span></div>'
      +'<div class="kv-row"><span class="k">Agent</span><span class="v">'+c.agent+'</span></div>'
      +'<div class="kv-row"><span class="k">Division</span><span class="v">'+c.division+'</span></div>'
      +'<div class="kv-row"><span class="k">Status</span><span class="v">'+c.status+'</span></div>'
      +'<div class="kv-row"><span class="k">Date filed</span><span class="v">'+c.filed+'</span></div>'
      +'<div class="kv-row"><span class="k">Evidence</span><span class="v">'+c.evidence+'</span></div>'
      +'<div class="kv-row"><span class="k">Points</span><span class="v pos">'+c.award+'</span></div>';
  } else if(key==='activity'){
    document.getElementById('modalPane-activity').innerHTML =
      '<div class="kv-row"><span class="k">Activity</span><span class="v">'+c.name+'</span></div>'
      +'<div class="kv-row"><span class="k">Category</span><span class="v">'+c.cat+'</span></div>'
      +'<div class="kv-row"><span class="k">Timing</span><span class="v">'+c.time+'</span></div>'
      +'<div class="kv-row"><span class="k">Participants</span><span class="v">'+c.participants+'</span></div>';
  } else if(key==='history'){
    document.getElementById('modalPane-history').innerHTML = c.history.map(function(h){
      return '<div class="kv-row"><span class="k">'+h[0]+'</span><span class="v" style="text-align:right;max-width:60%">'+h[1]+'</span></div>';
    }).join('');
  } else if(key==='records'){
    document.getElementById('modalPane-records').innerHTML = c.records.map(function(r){
      return '<div class="kv-row"><span class="k">'+r[0]+'</span><span class="v">'+r[1]+'</span></div>';
    }).join('');
  }
}
function setModalTab(el,key){
  document.querySelectorAll('#modalTabs .tab-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.modal-pane').forEach(p=>p.style.display='none');
  renderModalPane(key);
  document.getElementById('modalPane-'+key).style.display='block';
}
function closeModal(){ document.getElementById('caseModal').classList.remove('show'); }
function closeModalOutside(e){ if(e.target.id==='caseModal') closeModal(); }

/* ============ QUICK SEARCH ============ */
function openSearch(){
  document.getElementById('searchModal').classList.add('show');
  document.getElementById('quickSearchInput').value='';
  runQuickSearch('');
  setTimeout(function(){ document.getElementById('quickSearchInput').focus(); }, 200);
}
function closeSearch(){ document.getElementById('searchModal').classList.remove('show'); }
function closeSearchOutside(e){ if(e.target.id==='searchModal') closeSearch(); }
function runQuickSearch(q){
  q = q.toLowerCase();
  var results = [];
  activities.forEach(function(a){
    if(!q || a.name.toLowerCase().includes(q) || a.cat.toLowerCase().includes(q)){
      results.push({label:a.name, sub:a.cat+' · Activity', action:"nav(document.querySelector('[data-view=activities]'));closeSearch();openCase('"+a.id+"')"});
    }
  });
  ruleSections.forEach(function(r){
    if(!q || r.title.toLowerCase().includes(q) || r.body.toLowerCase().includes(q)){
      results.push({label:r.title, sub:'Rules Center', action:"nav(document.querySelector('[data-view=rules]'));closeSearch();"});
    }
  });
  var out = document.getElementById('quickSearchResults');
  if(results.length===0){ out.innerHTML = '<div class="page-sub" style="padding:12px 4px">No matches.</div>'; return; }
  out.innerHTML = results.slice(0,8).map(function(r){
    return '<div class="list-row clickable" onclick="'+r.action+'"><div class="list-left"><div class="list-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></div><div><div class="list-title">'+r.label+'</div><div class="list-sub">'+r.sub+'</div></div></div></div>';
  }).join('');
}


/* ============ PROFILE SEGMENTED CONTROL ============ */
function setProfileTab(el,key){
  document.querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('profile-id').style.display = key==='id' ? 'block' : 'none';
  document.getElementById('profile-log').style.display = key==='log' ? 'block' : 'none';
  if(key==='log') renderProfileLog();
}
async function logAgentActivity(action, category, description, metadata){
  if(!supabaseReady || !currentProfile || !currentProfile.id) return;
  try{
    await supabaseClient.from('agent_activity_log').insert({
      agent_id: currentProfile.id,
      action: String(action||'').slice(0,120),
      category: String(category||'GENERAL').slice(0,50),
      description: String(description||'').slice(0,500),
      metadata: metadata && typeof metadata==='object' ? metadata : {}
    });
  }catch(e){
    console.warn('Activity log write failed:', e);
  }
}

async function renderProfileLog(){
  var list = document.getElementById('profileLogList');
  if(!list) return;
  if(!supabaseReady || !currentProfile || !currentProfile.id){
    list.innerHTML='<div class="activity-log-empty">Activity history is unavailable until your secure session is connected.</div>';
    return;
  }
  list.innerHTML='<div class="activity-log-empty">Loading activity history…</div>';
  try{
    var res=await supabaseClient
      .from('agent_activity_log')
      .select('id,action,category,description,created_at')
      .eq('agent_id',currentProfile.id)
      .order('created_at',{ascending:false})
      .limit(200);
    if(res.error){
      list.innerHTML='<div class="activity-log-empty">Activity history could not be loaded. Make sure the <b>agent_activity_log</b> table and its RLS policies are installed.</div>';
      return;
    }
    var rows=res.data||[];
    if(!rows.length){
      list.innerHTML='<div class="activity-log-empty">No recorded activity yet. Your future Arena actions will appear here with the exact date and time.</div>';
      return;
    }
    list.innerHTML='<div class="activity-log-list">'+rows.map(function(r){
      var when='—';
      try{ when=new Date(r.created_at).toLocaleString(undefined,{year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit',second:'2-digit'}); }catch(e){}
      return '<div class="activity-log-item">'
        +'<div class="activity-log-main">'
        +'<div class="activity-log-category">'+escapeHtml(r.category||'GENERAL')+'</div>'
        +'<div class="activity-log-title">'+escapeHtml(r.action||'Activity')+'</div>'
        +'<div class="activity-log-sub">'+escapeHtml(r.description||'')+'</div>'
        +'</div>'
        +'<div class="activity-log-time">'+escapeHtml(when)+'</div>'
        +'</div>';
    }).join('')+'</div>';
  }catch(e){
    list.innerHTML='<div class="activity-log-empty">Activity history could not be loaded.</div>';
  }
}

/* ============ NOTIFICATIONS ============ */
function openNotif(){ document.getElementById('notifModal').classList.add('show'); }
function closeNotif(){ document.getElementById('notifModal').classList.remove('show'); }
function closeNotifOutside(e){ if(e.target.id==='notifModal') closeNotif(); }

/* ============ SCHEDULE ============ */
var schedules = {
  w13:[
    {day:'Monday', items:[['7:00 PM','Case Log Review']]},
    {day:'Tuesday', items:[['7:00 PM','Intel Hub Sync']]},
    {day:'Wednesday', items:[['8:00 PM','Major War Night']]},
    {day:'Thursday', items:[['7:30 PM','Division Huddle']]},
    {day:'Friday', items:[['9:00 PM','Minor War Night']]}
  ],
  w2:[
    {day:'Monday', items:[['7:00 PM','Casefile Audit']]},
    {day:'Wednesday', items:[['8:00 PM','Campaign Breach Prelims']]},
    {day:'Friday', items:[['9:00 PM','Case Review Session']]}
  ],
  w4:[
    {day:'Tuesday', items:[['7:00 PM','Archive Reconciliation']]},
    {day:'Wednesday', items:[['8:00 PM','Major War Night']]},
    {day:'Friday', items:[['9:00 PM','Points Ledger Close-out']]}
  ]
};
function renderSchedule(key){
  var grid = document.getElementById('schedGrid');
  var now = new Date();
  var todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][now.getDay()];

  var monday = new Date(now);
  var dayOffset = (now.getDay() + 6) % 7;
  monday.setDate(now.getDate() - dayOffset);
  monday.setHours(0,0,0,0);

  function fullDateForDay(dayName){
    var names = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    var offset = names.indexOf(dayName);
    if(offset < 0) return '';
    var date = new Date(monday);
    date.setDate(monday.getDate() + offset);
    return date.toLocaleDateString(undefined, {
      year:'numeric',
      month:'long',
      day:'numeric'
    });
  }

  grid.innerHTML = schedules[key].map(function(d){
    var fullDate = fullDateForDay(d.day);
    var items = d.items.map(function(it){
      return '<div class="sched-item"><div class="sched-time">'+fullDate+' · '+it[0]+'</div><div class="sched-name">'+it[1]+'</div></div>';
    }).join('');
    var isToday = d.day===todayName;
    var todayTag = isToday ? '<span class="pill live" style="margin-left:8px">Today</span>' : '';
    var cardStyle = isToday ? 'border-color:rgba(201,162,39,0.4)' : '';
    return '<div class="card span-4" style="'+cardStyle+'"><div class="day-col" style="border:none;background:none;padding:0"><h4>'+d.day+todayTag+'</h4>'+items+'</div></div>';
  }).join('');
}
function setWeek(el,key){
  document.querySelectorAll('.wk-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderSchedule(key);
}
renderSchedule('w13');

/* ============ RANKINGS ============ */
var rankData = {
  agents:[['1','Ashford-9','Cadence','184,500'],['2','Marlowe-2','Discourse','179,200'],['3','Vesper-6','Verse','171,050'],['4','Odessa-4','Charm','168,400'],['5','Kestrel-1','Retort','159,900'],['6','Dresden-3','Strife','151,200']],
  individual:[['1','Ashford-9','Cadence','184,500'],['2','Marlowe-2','Discourse','179,200'],['3','Vesper-6','Verse','171,050']],
  division:[['1','Cadence Gang','—','1,204,500'],['2','Discourse Gang','—','1,188,900'],['3','Verse Gang','—','1,050,200']],
  titles:[['1','Trojan of Cadence','Cadence','—'],['2','Trojan of Discourse','Discourse','—'],['3','Trojan of Strife','Strife','—']],
  records:[['1','Ashford-9','Cadence','29-session streak'],['2','Marlowe-2','Discourse','12 wars won']]
};
var rankHeaders = {
  agents:['CODENAME','DIVISION','POINTS'],
  individual:['CODENAME','DIVISION','POINTS'],
  division:['DIVISION','—','POINTS'],
  titles:['TITLE','DIVISION','STATUS'],
  records:['CODENAME','DIVISION','RECORD']
};
var rankSort = {}; // per-tab sort state: {col: 1|2|3, dir:'asc'|'desc'}
var currentRankTab = 'agents';

function isNumericColumn(key, col){
  return rankData[key].every(function(r){ return r[col]==='—' || /^[\d,]+$/.test(r[col]); });
}
function sortedRows(key){
  var rows = rankData[key].slice();
  var s = rankSort[key];
  if(!s) return rows;
  var numeric = isNumericColumn(key, s.col);
  rows.sort(function(a,b){
    var av = a[s.col], bv = b[s.col];
    var cmp;
    if(numeric){
      var an = av==='—' ? -1 : parseInt(av.replace(/,/g,''),10);
      var bn = bv==='—' ? -1 : parseInt(bv.replace(/,/g,''),10);
      cmp = an - bn;
    } else {
      cmp = av.localeCompare(bv);
    }
    return s.dir==='asc' ? cmp : -cmp;
  });
  return rows;
}
function renderRankHead(key){
  var head = document.getElementById('rankHead');
  var labels = rankHeaders[key];
  var s = rankSort[key];
  var cells = labels.map(function(label,i){
    var col = i+1;
    var arrow = '';
    if(s && s.col===col) arrow = s.dir==='asc' ? ' ↑' : ' ↓';
    var align = col===3 ? 'text-align:right' : '';
    return '<div class="rank-head-cell" style="'+align+'" onclick="toggleRankSort(&#39;'+key+'&#39;,'+col+')">'+label+arrow+'</div>';
  }).join('');
  head.innerHTML = '<div class="rank-pos" style="color:var(--ash-dim)">#</div>'+cells;
}
function toggleRankSort(key,col){
  var s = rankSort[key];
  if(s && s.col===col){
    s.dir = s.dir==='asc' ? 'desc' : 'asc';
  } else {
    rankSort[key] = {col:col, dir:'asc'};
  }
  renderRankHead(key);
  renderRanks(key);
}
function renderRanks(key){
  currentRankTab = key;
  var rows = document.getElementById('rankRows');
  rows.innerHTML = sortedRows(key).map(function(r){
    var posClass = (r[0]==='1'||r[0]==='2'||r[0]==='3') ? 'rank-pos top3' : 'rank-pos';
    return '<div class="rank-row"><div class="'+posClass+'">'+r[0]+'</div><div>'+r[1]+'</div><div style="color:var(--ash-dim)">'+r[2]+'</div><div class="num-mono" style="text-align:right">'+r[3]+'</div></div>';
  }).join('');
}
function setRankTab(el,key){
  document.querySelectorAll('.rtab').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderRankHead(key);
  renderRanks(key);
}
renderRankHead('agents');
renderRanks('agents');

/* ============ INTEL TABS ============ */
function setIntelTab(el,key){
  document.querySelectorAll('#view-intel .tab-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.intel-pane').forEach(p=>p.style.display='none');
  document.getElementById('intel-'+key).style.display='block';
}

/* ============ CAMPAIGN BREACH TITLES ============ */
var titles = [
  {name:'Trojan of Discourse', sub:'Debate War', holder:'Marlowe-2', challenger:'Ashford-9', status:'Registration open'},
  {name:'Trojan of Cadence', sub:'Fliptop War', holder:'Ashford-9', challenger:'Vesper-6', status:'Wed / Fri scheduled'},
  {name:'Trojan of Strife', sub:'Narrative Combat', holder:'Odessa-4', challenger:'—', status:'Awaiting challenger'},
  {name:'Trojan of Charm', sub:'Flirt War', holder:'Kestrel-1', challenger:'Renner-8', status:'Registration open'},
  {name:'Trojan of Verse', sub:'Makata Trashtalk', holder:'Vesper-6', challenger:'—', status:'Title defended'},
  {name:'Trojan of Retort', sub:'Classic Trashtalk', holder:'Renner-8', challenger:'Marlowe-2', status:'Wed / Fri scheduled'}
];
function renderTitles(){
  var board = document.getElementById('titleBoard');
  board.innerHTML = titles.map(function(t){
    return '<div class="title-row">'
      +'<div><div class="title-name">'+t.name+'</div><div class="title-sub">'+t.sub+'</div></div>'
      +'<div class="holder-chip"><div class="av"></div><div><div style="font-size:12.5px">'+t.holder+'</div><div class="title-sub">Title Holder</div></div></div>'
      +'<div class="holder-chip"><div class="av"></div><div><div style="font-size:12.5px">'+t.challenger+'</div><div class="title-sub">Challenger</div></div></div>'
      +'<div class="transfer-badge">'+t.status+'</div>'
      +'</div>';
  }).join('');
}
renderTitles();

/* ============ RULES ============ */
var ruleSections = [
  {title:'General Rules', body:'All agents must operate under an assigned codename at all times within ÆZ channels. Division loyalty is expected; cross-division interference outside sanctioned wars is not permitted.'},
  {title:'MGC Rules', body:'Major Gang Conduct standards apply during all war nights. Judging follows the 50/50 War Judge and Division Representative split defined in Case Review.'},
  {title:'Identification', body:'Codenames must be declared before participating in any Operation, Case Log, or Campaign Breach activity. Impersonation of another agent\'s codename is a violation.'},
  {title:'Respect', body:'Trashtalk and combat formats are confined to their designated war categories. Personal attacks outside those formats are not tolerated.'},
  {title:'Privacy', body:'Casefiles, points ledgers, and personal identification records are confidential to the agent and Division Command. Screenshots or redistribution outside the division are prohibited.'},
  {title:'Concerns', body:'Disputes over Operation answers, war judging, or point deductions should be raised through Directive channels within 24 hours.'},
  {title:'AI Use', body:'Assistive tools may be used for Code Class practice and drafting, but Operation and Black Operation answers must reflect the agent\'s own submission.'},
  {title:'Relationships', body:'Flirt War (Trojan of Charm) content is confined to the sanctioned format and does not extend to conduct outside of it.'},
  {title:'Spamming', body:'Repeated identical submissions to Operations or the Intel Hub beyond reasonable attempts may be treated as spam and are not eligible for points.'},
  {title:'Content Restrictions', body:'All submitted content — Case Logs, Intel Hub messages, war material — must stay within the division\'s conduct standards.'},
  {title:'Penalties', body:'Violations are recorded against the agent\'s Casefile and may result in point deductions as outlined in the Points Intelligence ledger.'}
];
function renderRules(filter){
  filter = (filter||'').toLowerCase();
  var list = document.getElementById('rulesList');
  var filtered = ruleSections.filter(function(r){
    return !filter || r.title.toLowerCase().includes(filter) || r.body.toLowerCase().includes(filter);
  });
  list.innerHTML = filtered.map(function(r,i){
    return '<div class="acc-item'+(i===0?' open':'')+'"><div class="acc-head" onclick="this.parentElement.classList.toggle(&#39;open&#39;)"><span>'+r.title+'</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></div><div class="acc-body"><div class="acc-inner">'+r.body+'</div></div></div>';
  }).join('') || '<div class="page-sub" style="padding:20px 4px">No rules match that search.</div>';
}
function filterRules(v){ renderRules(v); }
renderRules('');
restoreSupabaseSession();


/* ÆZ THEME SCRIPT START */
(function(){
  function setTheme(light){
    document.body.classList.toggle('light-mode', light);
    var t=document.getElementById('themeToggle');
    if(t){
      t.setAttribute('aria-pressed',String(light));
      t.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode');
      t.title=light?'Light mode':'Dark mode';
    }
    try{localStorage.setItem('aez-theme',light?'light':'dark');}catch(e){}
  }
  function initTheme(){
    var saved=null;
    try{saved=localStorage.getItem('aez-theme');}catch(e){}
    setTheme(saved==='light');
  }
  function addToggle(){
    if(document.getElementById('themeToggle')) return;
    var b=document.createElement('button');
    b.id='themeToggle';
    b.type='button';
    b.setAttribute('aria-pressed','false');
    b.setAttribute('aria-label','Switch to light mode');
    b.innerHTML='<span class="theme-icon sun-icon">☼</span><span class="theme-icon moon-icon">☾</span><span class="theme-knob"></span>';
    b.addEventListener('click',function(){setTheme(!document.body.classList.contains('light-mode'));});
    document.body.appendChild(b);
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){addToggle();initTheme();});
  }else{addToggle();initTheme();}
})();
/* ÆZ THEME SCRIPT END */


(function(){
  var deferredPrompt=null;
  var installCard=document.getElementById('mobileInstallCard');
  var installBtn=document.getElementById('mobileInstallBtn');
  var installSub=document.getElementById('mobileInstallSub');
  var guide=document.getElementById('pwaGuide');
  var guideContent=document.getElementById('pwaGuideContent');

  function isStandalone(){
    return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
  }
  function isIOS(){
    return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
  }
  function showInstallCard(mode){
    if(!installCard || isStandalone()) return;
    installCard.classList.add('show');
    if(mode==='ios'){
      if(installSub) installSub.textContent='Add Arena to your iPhone Home Screen for an app-like experience.';
      if(installBtn) installBtn.textContent='How to install on iPhone';
    }else{
      if(installSub) installSub.textContent='Install Arena on your phone for quick access and an app-like window.';
      if(installBtn) installBtn.textContent='Install app';
    }
  }
  function buildGuide(){
    if(!guideContent) return;
    if(isIOS()){
      guideContent.innerHTML=''
        +'<div class="pwa-guide-step"><div class="pwa-step-num">1</div><div><b>Open ÆZ Arena in Safari</b><span>Use Safari on your iPhone or iPad. The Add to Home Screen option is not available from every in-app browser.</span></div></div>'
        +'<div class="pwa-guide-step"><div class="pwa-step-num">2</div><div><b>Tap Share</b><span>Tap the Share button in Safari, then scroll through the actions.</span></div></div>'
        +'<div class="pwa-guide-step"><div class="pwa-step-num">3</div><div><b>Choose “Add to Home Screen”</b><span>Keep the name “ÆZ Arena” and tap Add. The ÆZ icon will appear on your Home Screen.</span></div></div>'
        +'<div class="pwa-guide-note">After installation, launch ÆZ Arena from the Home Screen to open it as a standalone app.</div>';
    }else{
      guideContent.innerHTML=''
        +'<div class="pwa-guide-step"><div class="pwa-step-num">1</div><div><b>Approve the install prompt</b><span>Tap Install when your browser asks to install ÆZ Arena.</span></div></div>'
        +'<div class="pwa-guide-step"><div class="pwa-step-num">2</div><div><b>Launch from your Home Screen</b><span>ÆZ Arena will open in its own app-style window instead of a normal browser tab.</span></div></div>'
        +'<div class="pwa-guide-note">If no install prompt appears, use your browser menu and look for “Install app” or “Add to Home screen.”</div>';
    }
  }
  window.installAezPwa=function(){
    if(isStandalone()) return;
    if(isIOS()){
      buildGuide(); if(guide) guide.classList.add('show'); return;
    }
    if(deferredPrompt){
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function(){ deferredPrompt=null; if(installCard) installCard.classList.remove('show'); }).catch(function(){});
      return;
    }
    buildGuide(); if(guide) guide.classList.add('show');
  };
  window.closePwaGuide=function(){if(guide) guide.classList.remove('show');};
  window.closePwaGuideOutside=function(e){if(e.target===guide) closePwaGuide();};

  window.addEventListener('beforeinstallprompt',function(e){
    e.preventDefault(); deferredPrompt=e; showInstallCard('android');
  });
  window.addEventListener('appinstalled',function(){deferredPrompt=null; if(installCard) installCard.classList.remove('show');});
  window.addEventListener('load',function(){
    if(!isStandalone() && isIOS()) showInstallCard('ios');
    else if(!isStandalone() && deferredPrompt) showInstallCard('android');
  });
  window.addEventListener('resize',function(){ if(isStandalone() && installCard) installCard.classList.remove('show'); });
})();


(function(){
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('./sw.js', {scope:'./'})
        .catch(function(err){ console.warn('ÆZ PWA service worker registration failed:', err); });
    });
  }
})();
