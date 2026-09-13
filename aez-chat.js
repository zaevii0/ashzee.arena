/* ÆZ Arena — Functional Groups + Realtime Chat layer */
(function(){
  'use strict';
  var sb=null, activeGroup=null, chatChannel=null, refreshTimer=null;
  function client(){try{return window.supabaseClient||supabaseClient;}catch(e){return null;}}
  function esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\\':'&#92;','"':'&quot;'}[c]});}
  function rpc(name,args){sb=client();return sb.rpc(name,args||{});}
  function body(){return document.getElementById('sxBody');}
  function setBody(html){var b=body();if(b)b.innerHTML=html;}
  function stopRealtime(){if(refreshTimer){clearInterval(refreshTimer);refreshTimer=null;}if(sb&&chatChannel){try{sb.removeChannel(chatChannel);}catch(e){}chatChannel=null;}}
  function mobileCss(){
    if(document.getElementById('aezChatStyle'))return;
    var s=document.createElement('style');s.id='aezChatStyle';s.textContent=''+
      '.aez-groups{display:grid;grid-template-columns:300px minmax(0,1fr);gap:14px;height:calc(100vh - 190px);min-height:480px}'+
      '.aez-group-list{overflow:auto;padding-right:3px}.aez-group-card{width:100%;text-align:left;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);color:#eee;border-radius:14px;padding:13px;margin-bottom:8px}.aez-group-card.active{border-color:rgba(255,255,255,.25);background:rgba(255,255,255,.07)}.aez-group-card b{display:block}.aez-group-card small{display:block;color:#777;margin-top:5px}.aez-chat{display:flex;flex-direction:column;min-width:0;border:1px solid rgba(255,255,255,.08);border-radius:17px;background:rgba(0,0,0,.18);overflow:hidden}.aez-chat-head{padding:15px 17px;border-bottom:1px solid rgba(255,255,255,.07)}.aez-chat-head b{display:block}.aez-chat-head small{color:#777}.aez-chat-log{flex:1;overflow:auto;padding:15px}.aez-msg{display:flex;margin:7px 0}.aez-msg.mine{justify-content:flex-end}.aez-bubble{max-width:min(78%,620px);padding:9px 12px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.07)}.aez-msg.mine .aez-bubble{background:rgba(241,240,236,.12);border-color:rgba(241,240,236,.18)}.aez-msg-name{font-size:10px;color:#8d96a5;margin-bottom:4px}.aez-msg-text{font-size:13px;line-height:1.45;white-space:pre-wrap;word-break:break-word}.aez-msg-time{font-size:9px;color:#666;margin-top:5px}.aez-chat-compose{display:flex;gap:8px;padding:11px;border-top:1px solid rgba(255,255,255,.07)}.aez-chat-compose textarea{flex:1;min-height:44px;max-height:130px;resize:none}.aez-chat-compose button{flex:0 0 auto}.aez-join{margin-top:9px}.aez-online{font-size:9px;letter-spacing:.12em;color:#7c8797}.aez-empty{padding:30px;text-align:center;color:#666}.aez-back{margin-bottom:10px}.aez-group-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}@media(max-width:800px){.aez-groups{grid-template-columns:1fr;height:auto;min-height:0}.aez-group-list{max-height:300px}.aez-chat{height:calc(100dvh - 330px);min-height:400px}.aez-bubble{max-width:88%}.aez-chat-compose{position:sticky;bottom:0;background:rgba(20,22,26,.95);backdrop-filter:blur(15px)}}';document.head.appendChild(s);
  }
  async function groups(){
    mobileCss();stopRealtime();
    setBody('<div class="sx-card"><div class="sx-meta">CASE ROOMS / GROUP NETWORK</div><div id="aezGroups" style="margin-top:10px">Loading groups…</div></div>');
    var r=await rpc('aez_chat_groups',{});var box=document.getElementById('aezGroups');
    if(r.error){box.innerHTML='<div class="aez-empty">Unable to load groups.<br><small>'+esc(r.error.message)+'</small></div>';return;}
    var list=r.data||[];
    if(!list.length){box.innerHTML='<div class="aez-empty">No public case rooms yet.</div>';return;}
    box.innerHTML='<div class="aez-groups"><div class="aez-group-list">'+list.map(function(g){return '<button class="aez-group-card '+(g.is_member?'active':'')+'" data-group="'+esc(g.group_id)+'"><b>'+esc(g.name)+'</b><small>'+esc(g.visibility)+' · '+Number(g.member_count||0)+' agents'+(g.is_member?' · joined':'')+'</small></button>';}).join('')+'</div><div id="aezGroupPreview" class="sx-card"><div class="aez-empty">Select a case room to inspect it.</div></div></div>';
    box.querySelectorAll('[data-group]').forEach(function(b){b.onclick=function(){var g=list.find(function(x){return String(x.group_id)===String(b.dataset.group);});if(g)openGroup(g);};});
  }
  async function openGroup(g){
    activeGroup=g;
    var box=document.getElementById('aezGroupPreview');if(!box)return;
    box.innerHTML='<div class="sx-meta">CASE ROOM</div><h3 style="margin:7px 0">'+esc(g.name)+'</h3><div class="sx-meta">'+esc(g.description||'No description')+'</div><div class="sx-group-actions"><button class="sx-btn" id="aezJoin">'+(g.is_member?'Open secure chat':'Join case room')+'</button></div>';
    document.getElementById('aezJoin').onclick=function(){if(g.is_member)openChat(g);else joinGroup(g);};
  }
  async function joinGroup(g){
    var b=document.getElementById('aezJoin');if(b)b.disabled=true;
    var r=await rpc('aez_chat_join_group',{p_group_id:g.group_id});
    if(r.error){if(b)b.disabled=false;alert(r.error.message);return;}
    g.is_member=true;g.conversation_id=r.data;openChat(g);
  }
  async function openChat(g){
    stopRealtime();
    var r=g.conversation_id?{data:g.conversation_id,error:null}:await rpc('aez_chat_open_group',{p_group_id:g.group_id});
    if(r.error||!r.data){alert(r.error?r.error.message:'Join this group first.');return;}
    g.conversation_id=r.data;activeGroup=g;
    setBody('<div class="aez-back"><button class="sx-btn alt" id="aezBack">‹ Case rooms</button></div><div class="aez-chat"><div class="aez-chat-head"><b>'+esc(g.name)+'</b><small>'+esc(g.description||'Secure group channel')+'</small><div class="aez-online" style="margin-top:6px">REALTIME SECURE CHANNEL</div></div><div class="aez-chat-log" id="aezChatLog">Loading messages…</div><div class="aez-chat-compose"><textarea id="aezChatInput" class="sx-text" maxlength="4000" placeholder="Transmit a message…"></textarea><button id="aezChatSend" class="sx-btn">Send</button></div></div>');
    document.getElementById('aezBack').onclick=groups;
    document.getElementById('aezChatSend').onclick=send;
    document.getElementById('aezChatInput').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
    await loadMessages();
    subscribe(g.conversation_id);
  }
  async function loadMessages(){
    var r=await rpc('aez_chat_messages',{p_conversation_id:activeGroup.conversation_id,p_limit:100});var log=document.getElementById('aezChatLog');if(!log)return;
    if(r.error){log.innerHTML='<div class="aez-empty">Could not load messages.<br><small>'+esc(r.error.message)+'</small></div>';return;}
    renderMessages(r.data||[],false);
  }
  function renderMessages(list,append){
    var log=document.getElementById('aezChatLog');if(!log)return;
    if(!append)log.innerHTML='';
    var uid='';try{uid=sb.auth.getUser?null:'';}catch(e){}
    list.forEach(function(m){
      var mine=window.currentProfile&&String(m.sender_id)===String(window.currentProfile.id);
      var el=document.createElement('div');el.className='aez-msg'+(mine?' mine':'');el.dataset.mid=m.id;el.innerHTML='<div class="aez-bubble"><div class="aez-msg-name">'+esc(m.sender_codename||'Agent')+'</div><div class="aez-msg-text">'+esc(m.body)+'</div><div class="aez-msg-time">'+new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})+'</div></div>';
      if(!log.querySelector('[data-mid="'+CSS.escape(String(m.id))+'"]'))log.appendChild(el);
    });
    log.scrollTop=log.scrollHeight;
  }
  async function send(){
    var input=document.getElementById('aezChatInput'),button=document.getElementById('aezChatSend');if(!input||!activeGroup)return;var text=input.value.trim();if(!text)return;
    button.disabled=true;
    var r=await rpc('aez_chat_send_message',{p_conversation_id:activeGroup.conversation_id,p_body:text});
    button.disabled=false;
    if(r.error){alert(r.error.message);return;}
    input.value='';
    await loadMessages();
  }
  function subscribe(cid){
    sb=client();if(!sb)return;
    chatChannel=sb.channel('aez-chat-'+cid).on('postgres_changes',{event:'INSERT',schema:'public',table:'aez_social_messages',filter:'conversation_id=eq.'+cid},function(payload){renderMessages([payload.new],true);}).subscribe(function(status,err){if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')console.error('ÆZ chat realtime:',status,err);});
    /* Polling fallback keeps chat usable if Realtime is not enabled yet. */
    refreshTimer=setInterval(function(){if(document.getElementById('aezChatLog'))loadMessages();},5000);
  }
  async function messages(){
    mobileCss();stopRealtime();
    setBody('<div class="sx-card"><div class="sx-meta">YOUR CASE ROOMS</div><div id="aezMyGroups" style="margin-top:10px">Loading…</div></div>');
    var r=await rpc('aez_chat_groups',{});var box=document.getElementById('aezMyGroups');if(r.error){box.textContent=r.error.message;return;}
    var list=(r.data||[]).filter(function(g){return g.is_member;});
    if(!list.length){box.innerHTML='<div class="aez-empty">You have not joined any case rooms yet.<br>Open Groups and join a public room.</div>';return;}
    box.innerHTML='<div class="sx-list">'+list.map(function(g){return '<button class="aez-group-card" data-open="'+esc(g.group_id)+'"><b>'+esc(g.name)+'</b><small>'+Number(g.member_count||0)+' agents · secure channel</small></button>';}).join('')+'</div>';
    box.querySelectorAll('[data-open]').forEach(function(b){b.onclick=function(){var g=list.find(function(x){return String(x.group_id)===String(b.dataset.open);});if(g)openChat(g);};});
  }
  function intercept(){
    document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('.sx-tab');if(!t)return;var tab=t.dataset.tab;if(tab!=='groups'&&tab!=='messages')return;e.preventDefault();e.stopImmediatePropagation();document.querySelectorAll('.sx-tab').forEach(function(x){x.classList.remove('on')});t.classList.add('on');if(tab==='groups')groups();else messages();},true);
  }
  function boot(){
    intercept();
    var old=window.openAezSocial;
    if(old)window.openAezSocial=function(){old();setTimeout(function(){var t=document.querySelector('.sx-tab[data-tab="groups"]');if(t)t.addEventListener('click',function(){},false);},50);};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
