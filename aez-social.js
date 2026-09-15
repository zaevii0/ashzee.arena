/* ÆZ Arena — Social Intelligence + resilient Secure Access patch */
(function(){
  'use strict';
  var loginBusy=false;
  function timeout(p,ms,msg){return Promise.race([p,new Promise(function(_,rej){setTimeout(function(){rej(new Error(msg));},ms);})]);}
  function client(){try{return window.supabaseClient||supabaseClient;}catch(e){return null;}}
  function val(id){var e=document.getElementById(id);return e?e.value.trim():'';}
  function err(msg){if(typeof window.showLoginError==='function') window.showLoginError(msg); else alert(msg);}

  async function fixedLogin(){
    if(loginBusy) return;
    var sb=client(); if(!sb){err('Secure Access is unavailable. Please reload the Arena.');return;}
    var btn=document.getElementById('loginSubmitBtn'); loginBusy=true;
    try{
      var uid=val('emailInput'), gang=(document.getElementById('gangSelect')||{}).value||'', cn=val('codenameInput'), pw=(document.getElementById('passwordInput')||{}).value||'';
      if(!uid||!gang||!cn||!pw){err('Enter your Facebook UID, gang, codename, and password to continue.');return;}
      if(btn){btn.disabled=true;btn.textContent='Verifying…';}
      var email='member.'+uid+'@aezarena.local';
      var r=await timeout(sb.auth.signInWithPassword({email:email,password:pw}),12000,'Authentication timed out. Please check your connection and try again.');
      if(r.error){
        var lookup=await timeout(sb.rpc('aez_member_auth_email',{p_facebook_uid:uid}),8000,'Member identity lookup timed out. Please try again.');
        if(!lookup.error&&lookup.data&&String(lookup.data).toLowerCase()!==email.toLowerCase()) r=await timeout(sb.auth.signInWithPassword({email:lookup.data,password:pw}),12000,'Legacy account authentication timed out. Please try again.');
      }
      if(r.error){err('Access denied. Check your Facebook UID and password.');return;}
      var u=r.data&&r.data.user;
      if(!u){await sb.auth.signOut().catch(function(){});err('No active session was returned. Please try again.');return;}
      if(!u.email_confirmed_at){await sb.auth.signOut().catch(function(){});err('This member account is not active yet. Contact Division Command.');return;}
      var pr=await timeout(sb.from('profiles').select('*').eq('id',u.id).single(),10000,'Profile lookup timed out. Please try again.');
      if(pr.error||!pr.data){await sb.auth.signOut().catch(function(){});err('Your application record could not be found. Contact Division Command.');return;}
      var p=pr.data;
      if(String(p.facebook_uid||'')!==String(uid)||String(p.gang||'')!==String(gang)||String(p.codename||'').toLowerCase()!==cn.toLowerCase()){
        await sb.auth.signOut().catch(function(){});err('The selected gang, codename, and Facebook UID do not match this account.');return;
      }
      if(p.status!=='approved'){await sb.auth.signOut().catch(function(){});err(p.status==='pending'?'Your registration is still pending admin approval.':p.status==='rejected'?'Your registration was rejected. Contact Division Command.':'This account is currently suspended.');return;}
      window.currentProfile=p;
      if(typeof window.profileToAgent==='function') window.currentAgent=window.profileToAgent(p);
      if(typeof window.applyAgentToUI==='function'&&window.currentAgent) window.applyAgentToUI(window.currentAgent);
      if(typeof window.hideLoginError==='function') window.hideLoginError();
      if(typeof window.removeAuthScreensAndShowApp==='function') window.removeAuthScreensAndShowApp();
      if(typeof window.nav==='function'){var n=document.querySelector('.nav-item[data-view="dashboard"]');if(n) window.nav(n);}
      if(typeof window.animateCounters==='function') window.animateCounters();
      setTimeout(initSocial,300);
    }catch(e){console.error('ÆZ Secure Access:',e);err(e&&e.message?e.message:'Secure Access could not be completed. Please try again.');}
    finally{loginBusy=false;if(btn&&!window.lockoutTimer){btn.disabled=false;btn.textContent='Enter the Arena';}}
  }
  window.login=fixedLogin;

  var css=''+
  '#aezSocial{position:fixed;inset:0;z-index:10000;background:rgba(5,6,8,.78);backdrop-filter:blur(24px);display:none;padding:clamp(12px,3vw,34px);overflow:auto}'+
  '#aezSocial.open{display:block}#aezSocial .sx{max-width:1100px;margin:auto;min-height:calc(100vh - 24px);background:rgba(20,22,26,.92);border:1px solid rgba(255,255,255,.1);border-radius:24px;box-shadow:0 30px 100px #000;overflow:hidden}'+
  '.sx-head{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08);position:sticky;top:0;background:rgba(20,22,26,.9);backdrop-filter:blur(18px);z-index:2}.sx-title{font-weight:700;letter-spacing:.04em}.sx-sub{font:10px ui-monospace,monospace;color:#777;letter-spacing:.16em;margin-top:4px}.sx-close{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#eee;border-radius:12px;padding:9px 12px}.sx-tabs{display:flex;gap:8px;padding:14px 18px;overflow:auto;border-bottom:1px solid rgba(255,255,255,.06)}.sx-tab{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#aaa;padding:9px 13px;border-radius:999px;white-space:nowrap}.sx-tab.on{background:#eee;color:#111}.sx-body{padding:20px}.sx-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:18px}@media(max-width:800px){.sx-grid{grid-template-columns:1fr}}.sx-card{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);border-radius:17px;padding:16px;margin-bottom:14px}.sx-input,.sx-text{width:100%;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.25);color:#eee;border-radius:12px;padding:12px;font:inherit;resize:vertical}.sx-text{min-height:90px}.sx-row{display:flex;gap:9px;align-items:center}.sx-btn{border:1px solid rgba(255,255,255,.12);background:#eee;color:#111;border-radius:11px;padding:10px 13px;font-weight:650}.sx-btn.alt{background:rgba(255,255,255,.05);color:#ddd}.sx-meta{font-size:11px;color:#777}.sx-post{padding:16px 0;border-top:1px solid rgba(255,255,255,.07)}.sx-post:first-child{border-top:0}.sx-author{font-weight:650}.sx-bodytext{margin:9px 0 13px;line-height:1.55;white-space:pre-wrap}.sx-actions{display:flex;gap:7px;flex-wrap:wrap}.sx-mini{font-size:11px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#aaa;border-radius:9px;padding:7px 9px}.sx-comments{margin-top:10px;padding-left:12px;border-left:1px solid rgba(255,255,255,.08)}.sx-comment{font-size:12px;margin:7px 0;color:#bbb}.sx-list{display:grid;gap:10px}.sx-item{padding:13px;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(255,255,255,.025)}.sx-item b{display:block;margin-bottom:4px}.sx-badge{font:9px ui-monospace,monospace;letter-spacing:.1em;color:#8f9bb0}.sx-empty{padding:28px;text-align:center;color:#666}.sx-search{margin-bottom:12px}';
  function injectStyle(){if(document.getElementById('aezSocialStyle'))return;var s=document.createElement('style');s.id='aezSocialStyle';s.textContent=css;document.head.appendChild(s);}
  function rpc(name,args){var sb=client();return sb.rpc(name,args||{});}
  function esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\\':'&#92;','"':'&quot;'}[c]});}
  function socialShell(){
    if(document.getElementById('aezSocial'))return;
    var d=document.createElement('div');d.id='aezSocial';d.innerHTML='<div class="sx"><div class="sx-head"><div><div class="sx-title">ÆZ SOCIAL INTELLIGENCE</div><div class="sx-sub">SECURE NETWORK / APPROVED AGENTS ONLY</div></div><button class="sx-close" id="sxClose">Close</button></div><div class="sx-tabs"><button class="sx-tab on" data-tab="feed">Timeline</button><button class="sx-tab" data-tab="groups">Groups</button><button class="sx-tab" data-tab="messages">Messages</button><button class="sx-tab" data-tab="agents">Agents</button></div><div class="sx-body" id="sxBody"></div></div>';
    document.body.appendChild(d);document.getElementById('sxClose').onclick=closeSocial;
    d.addEventListener('click',function(e){var t=e.target.closest('.sx-tab');if(t){document.querySelectorAll('.sx-tab').forEach(function(x){x.classList.remove('on')});t.classList.add('on');loadTab(t.dataset.tab);}});
  }
  function openSocial(){if(!document.body.classList.contains('authenticated'))return;socialShell();injectStyle();document.getElementById('aezSocial').classList.add('open');loadTab('feed');}
  function closeSocial(){var d=document.getElementById('aezSocial');if(d)d.classList.remove('open');}
  window.openAezSocial=openSocial;
  function addNav(){
    var side=document.querySelector('.sidebar'); if(side&&!side.querySelector('[data-aez-social]')){var b=document.createElement('button');b.className='nav-item';b.dataset.aezSocial='1';b.innerHTML='<span style="font-size:15px">◈</span><span>Social Intelligence</span>';b.onclick=openSocial;side.appendChild(b);}
    var bottom=document.querySelector('.bottom-nav');if(bottom&&!bottom.querySelector('[data-aez-social]')){var b2=document.createElement('button');b2.className='bn-item';b2.dataset.aezSocial='1';b2.innerHTML='<span style="font-size:16px">◈</span><span>Social</span>';b2.onclick=openSocial;bottom.appendChild(b2);}
  }
  async function loadTab(tab){var body=document.getElementById('sxBody');if(!body)return;body.innerHTML='<div class="sx-empty">Querying secure network…</div>';try{if(tab==='feed')await feed(body);else if(tab==='groups')await groups(body);else if(tab==='messages')await messages(body);else await agents(body);}catch(e){console.error(e);body.innerHTML='<div class="sx-empty">Network query failed. Please try again.</div>';}}
  async function feed(body){
    body.innerHTML='<div class="sx-grid"><main><div class="sx-card"><textarea id="sxPost" class="sx-text" maxlength="1400" placeholder="Transmit a field report, update, or intelligence…"></textarea><div class="sx-row" style="margin-top:9px;justify-content:flex-end"><button class="sx-btn" id="sxPostBtn">Transmit</button></div></div><div class="sx-card"><div class="sx-meta" style="margin-bottom:8px">LIVE TIMELINE</div><div id="sxFeed">Loading…</div></div></main><aside><div class="sx-card"><b>Network status</b><div class="sx-meta" style="margin-top:7px">Approved agents only. Activity is tied to your authenticated Supabase identity.</div></div></aside></div>';
    document.getElementById('sxPostBtn').onclick=async function(){var b=this,txt=document.getElementById('sxPost').value.trim();if(!txt)return;b.disabled=true;var r=await rpc('aez_social_create_post',{p_group_id:null,p_body:txt});b.disabled=false;if(r.error){alert(r.error.message);return}loadTab('feed');};
    var r=await rpc('aez_social_feed',{p_limit:40,p_offset:0});var list=r.data||[];var box=document.getElementById('sxFeed');if(r.error){box.textContent=r.error.message;return}if(!list.length){box.innerHTML='<div class="sx-empty">No intelligence transmitted yet.</div>';return}
    box.innerHTML=list.map(function(p){return '<article class="sx-post"><div class="sx-author">'+esc(p.author_codename||'Agent')+' <span class="sx-badge">'+esc(p.author_gang||'ÆZ')+'</span></div><div class="sx-meta">'+new Date(p.created_at).toLocaleString()+'</div><div class="sx-bodytext">'+esc(p.body)+'</div><div class="sx-actions"><button class="sx-mini" data-react="'+p.id+'">◉ Acknowledge <span>'+Number(p.reaction_count||0)+'</span></button><button class="sx-mini" data-comments="'+p.id+'">Comments '+Number(p.comment_count||0)+'</button></div><div id="comments-'+p.id+'"></div></article>';}).join('');
    box.querySelectorAll('[data-react]').forEach(function(b){b.onclick=async function(){var r=await rpc('aez_social_toggle_reaction',{p_post_id:b.dataset.react});if(!r.error)loadTab('feed');else alert(r.error.message);};});
    box.querySelectorAll('[data-comments]').forEach(function(b){b.onclick=async function(){var id=b.dataset.comments,holder=document.getElementById('comments-'+id);if(holder.dataset.open){holder.innerHTML='';holder.dataset.open='';return}var r=await rpc('aez_social_post_comments',{p_post_id:id});holder.dataset.open='1';holder.innerHTML='<div class="sx-comments">'+(r.data||[]).map(function(c){return '<div class="sx-comment"><b>'+esc(c.author_codename||'Agent')+'</b> — '+esc(c.body)+'</div>';}).join('')+'<div class="sx-row"><input class="sx-input" id="c-'+id+'" maxlength="500" placeholder="Add a comment…"><button class="sx-mini" id="cb-'+id+'">Send</button></div></div>';var cb=document.getElementById('cb-'+id);if(cb)cb.onclick=async function(){var t=document.getElementById('c-'+id).value.trim();if(!t)return;var rr=await rpc('aez_social_add_comment',{p_post_id:id,p_body:t});if(rr.error)alert(rr.error.message);else loadTab('feed');};};});
  }
  async function groups(body){
    body.innerHTML='<div class="sx-grid"><main><div class="sx-card"><div class="sx-row"><input id="gName" class="sx-input" placeholder="New group name"><select id="gVis" class="sx-input" style="max-width:130px"><option value="public">Public</option><option value="private">Private</option></select><button id="gCreate" class="sx-btn">Create</button></div><textarea id="gDesc" class="sx-text" style="margin-top:9px;min-height:65px" placeholder="Group description"></textarea></div><div class="sx-card"><div class="sx-meta" style="margin-bottom:8px">GROUP DIRECTORY</div><div id="gList">Loading…</div></div></main><aside><div class="sx-card"><b>Group channels</b><div class="sx-meta" style="margin-top:7px">Every created group gets a secure group chat channel.</div></div></aside></div>';
    document.getElementById('gCreate').onclick=async function(){var n=document.getElementById('gName').value.trim();if(!n)return;var r=await rpc('aez_social_create_group',{p_name:n,p_description:document.getElementById('gDesc').value.trim(),p_visibility:document.getElementById('gVis').value});if(r.error)alert(r.error.message);else loadTab('groups');};
    var r=await rpc('aez_social_groups',{p_search:null,p_limit:60});var list=r.data||[],box=document.getElementById('gList');if(r.error){box.textContent=r.error.message;return}if(!list.length){box.innerHTML='<div class="sx-empty">No groups yet.</div>';return}
    box.innerHTML='<div class="sx-list">'+list.map(function(g){return '<div class="sx-item"><b>'+esc(g.name)+'</b><div class="sx-meta">'+esc(g.visibility)+' · '+Number(g.member_count||0)+' agents</div><div style="margin:7px 0;color:#aaa">'+esc(g.description||'')+'</div><button class="sx-mini" data-join="'+g.id+'">Join</button> <button class="sx-mini" data-gchat="'+g.id+'">Open group chat</button></div>';}).join('')+'</div>';
    box.querySelectorAll('[data-join]').forEach(function(b){b.onclick=async function(){var r=await rpc('aez_social_join_group',{p_group_id:b.dataset.join});if(r.error)alert(r.error.message);else loadTab('groups');};});
    box.querySelectorAll('[data-gchat]').forEach(function(b){b.onclick=function(){openGroupChat(b.dataset.gchat);};});
  }
  async function agents(body){
    body.innerHTML='<div class="sx-card"><input id="agentSearch" class="sx-input sx-search" placeholder="Search codename or gang…"><div id="agentList">Loading…</div></div>';
    async function run(){var r=await rpc('aez_social_directory',{p_search:document.getElementById('agentSearch').value.trim()||null,p_limit:50});var box=document.getElementById('agentList');if(r.error){box.textContent=r.error.message;return}var a=r.data||[];box.innerHTML=a.length?'<div class="sx-list">'+a.map(function(x){return '<div class="sx-item"><b>'+esc(x.codename||'Agent')+'</b><div class="sx-meta">'+esc(x.gang||'ÆZ')+' · '+esc(x.position||'Member')+' · '+esc(x.role||'member')+'</div></div>';}).join('')+'</div>':'<div class="sx-empty">No approved agents found.</div>';}
    document.getElementById('agentSearch').oninput=run;run();
  }
  async function messages(body){
    body.innerHTML='<div class="sx-grid"><aside><div class="sx-card"><b>Direct secure chat</b><input id="msgSearch" class="sx-input" style="margin-top:10px" placeholder="Find an agent…"><div id="msgAgents" style="margin-top:10px">Loading…</div></div></aside><main><div class="sx-card" id="chatBox"><div class="sx-empty">Select an agent to open a secure channel.</div></div></main></div>';
    var r=await rpc('aez_social_directory',{p_search:null,p_limit:30}),list=r.data||[];document.getElementById('msgAgents').innerHTML=list.map(function(a){return '<button class="sx-item" style="width:100%;text-align:left;color:#eee;background:transparent" data-agent="'+a.user_id+'"><b>'+esc(a.codename||'Agent')+'</b><span class="sx-meta">'+esc(a.gang||'')+'</span></button>';}).join('');document.querySelectorAll('[data-agent]').forEach(function(b){b.onclick=function(){openDirectChat(b.dataset.agent,b.textContent.trim());};});
  }
  async function openDirectChat(id,label){var r=await rpc('aez_social_start_direct_chat',{p_other_user_id:id});if(r.error){alert(r.error.message);return}renderChat(r.data&&r.data.id,label);}
  async function openGroupChat(id){var r=await rpc('aez_social_groups',{p_search:null,p_limit:60});var g=(r.data||[]).find(function(x){return x.id===id});if(!g){alert('Group not found');return}var c=await rpc('aez_social_conversations');var row=(c.data||[]).find(function(x){return x.group_id===id});if(!row){alert('Join the group first.');return}renderChat(row.id,g.name+' — Group Channel');}
  async function renderChat(cid,label){var box=document.getElementById('chatBox');if(!box)return;box.innerHTML='<b>'+esc(label)+'</b><div id="chatMsgs" style="max-height:420px;overflow:auto;margin:12px 0">Loading…</div><div class="sx-row"><input id="chatInput" class="sx-input" maxlength="4000" placeholder="Transmit message…"><button id="chatSend" class="sx-btn">Send</button></div>';
    async function refresh(){var r=await rpc('aez_social_messages',{p_conversation_id:cid,p_limit:100});var m=r.data||[];document.getElementById('chatMsgs').innerHTML=m.length?m.map(function(x){return '<div class="sx-post"><b>'+esc(x.sender_codename||'Agent')+'</b><div class="sx-meta">'+new Date(x.created_at).toLocaleString()+'</div><div class="sx-bodytext">'+esc(x.body)+'</div></div>';}).join(''):'<div class="sx-empty">No messages yet.</div>';var el=document.getElementById('chatMsgs');el.scrollTop=el.scrollHeight;}
    document.getElementById('chatSend').onclick=async function(){var t=document.getElementById('chatInput').value.trim();if(!t)return;var r=await rpc('aez_social_send_message',{p_conversation_id:cid,p_body:t});if(r.error)alert(r.error.message);else{document.getElementById('chatInput').value='';refresh();}};refresh();
  }
  function initSocial(){addNav();}
  document.addEventListener('DOMContentLoaded',function(){injectStyle();addNav();setTimeout(addNav,1000);});
  window.addEventListener('load',function(){setTimeout(addNav,1500);});
  if(typeof MutationObserver!=='undefined'){new MutationObserver(function(){if(document.body.classList.contains('authenticated'))addNav();}).observe(document.body,{attributes:true,attributeFilter:['class']});}
})();