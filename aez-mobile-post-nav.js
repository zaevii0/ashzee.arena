/* ÆZ Arena — mobile plus/post navigation */
(function(){
  'use strict';

  function postFromPlus(){
    var social=document.getElementById('aezSocial');
    if(!social && typeof window.openAezSocial==='function'){
      window.openAezSocial();
    }else if(social){
      social.classList.add('open');
    }

    setTimeout(function(){
      var feedTab=document.querySelector('#aezSocial .sx-tab[data-tab="feed"]');
      if(feedTab) feedTab.click();
      setTimeout(function(){
        var input=document.getElementById('sxPost');
        if(input){
          input.focus();
          input.scrollIntoView({behavior:'smooth',block:'center'});
        }
      },120);
    },180);
  }

  function apply(){
    document.querySelectorAll('.aez-mobile-tab[data-aez-mobile-tab="schedule"]').forEach(function(btn){
      if(btn.__aezPlusNav)return;
      btn.__aezPlusNav=true;
      btn.setAttribute('data-aez-mobile-tab','post');
      btn.setAttribute('aria-label','Create Post');
      btn.title='Create Post';
      btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>Post</span>';
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        postFromPlus();
      },true);
    });
  }

  function start(){
    apply();
    if(!window.__aezPlusNavObserver && document.body){
      window.__aezPlusNavObserver=true;
      new MutationObserver(function(){apply();}).observe(document.body,{childList:true,subtree:true});
    }
    setTimeout(apply,100);
    setTimeout(apply,400);
    setTimeout(apply,1000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
