/* ÆZ Arena — preserve the current app screen across refresh */
(function(){
'use strict';
var KEY='aez_refresh_state_v1';
var VALID=['dashboard','activities','profile'];
function save(){
 try{
  var active=document.querySelector('[data-view].active,[data-view][aria-current="page"]');
  var view=active&&active.getAttribute('data-view');
  if(!view||VALID.indexOf(view)<0)view='dashboard';
  var social=document.getElementById('aezSocial');
  sessionStorage.setItem(KEY,JSON.stringify({view:view,social:!!(social&&social.classList.contains('open')),y:window.scrollY||0,t:Date.now()}));
 }catch(e){}
}
function get(){
 try{
  var s=sessionStorage.getItem(KEY);if(!s)return null;
  var x=JSON.parse(s);if(!x||Date.now()-x.t>1800000)return null;
  return x;
 }catch(e){return null}
}
function restore(){
 var state=get();if(!state)return false;
 if(!document.body.classList.contains('authenticated'))return false;
 var target=document.querySelector('[data-view="'+state.view+'"]');
 if(target){try{target.click()}catch(e){}}
 if(state.social){
  var socialBtn=document.querySelector('[data-aez-social]');
  if(socialBtn){try{socialBtn.click()}catch(e){}}
  var panel=document.getElementById('aezSocial');
  if(panel){panel.classList.add('open');panel.style.display='block';}
 }
 setTimeout(function(){try{window.scrollTo(0,state.y||0)}catch(e){}},120);
 try{sessionStorage.removeItem(KEY)}catch(e){}
 return true;
}
function boot(){
 var tries=0;
 function attempt(){
  if(restore())return;
  if(++tries<15)setTimeout(attempt,200);
 }
 attempt();
}
window.addEventListener('beforeunload',save);
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')save()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
