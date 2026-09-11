(function(){
  'use strict';
  if(window.__ALANRANG_V39310_HOME_NAV_HARDENING_FIX1__)return;
  window.__ALANRANG_V39310_HOME_NAV_HARDENING_FIX1__=true;

  var VERSION='39.31.0-home-nav-hardening-fix00000001';
  var scrollMemory=Object.create(null);
  var lastRouteKey='';
  var pendingRender=null;
  var scrollRaf=0;
  var lastNavSignature='';
  var lastNavAt=0;
  var metrics={scrollRestores:0,duplicateNavigationBlocked:0,legacyQuickMenuRemoved:0};

  function stateObj(){try{return (typeof state!=='undefined'&&state)||window.state||null}catch(_){return window.state||null}}
  function routeKey(){
    var s=stateObj()||{},tab=String(s.tab||'home');
    if(tab==='account')return 'account|'+String(s.selectedCustomerId||'')+'|'+String(s.customerProfileTab||'summary');
    if(tab==='preview')return 'preview|'+String(s.previewInvoiceId||'');
    if(tab==='invoice')return 'invoice|'+String(s.editingInvoiceId||s.selectedCustomerId||'draft');
    if(tab==='customerNotice')return 'customerNotice|'+String(s.selectedCustomerId||'');
    return tab;
  }
  function currentY(){try{return Math.max(0,Math.round(window.scrollY||window.pageYOffset||0))}catch(_){return 0}}
  function saveCurrentScroll(){if(lastRouteKey)scrollMemory[lastRouteKey]=currentY()}
  function beforeRender(){
    var incoming=routeKey(),y=currentY();
    if(lastRouteKey)scrollMemory[lastRouteKey]=y;
    pendingRender={key:incoming,same:!!lastRouteKey&&incoming===lastRouteKey,y:y};
    return true;
  }
  function restoreScroll(){
    var incoming=routeKey(),p=pendingRender,target=0;
    if(p&&p.key===incoming&&p.same)target=p.y;
    else if(Object.prototype.hasOwnProperty.call(scrollMemory,incoming))target=scrollMemory[incoming];
    lastRouteKey=incoming;pendingRender=null;
    try{
      requestAnimationFrame(function(){requestAnimationFrame(function(){
        try{window.scrollTo(0,Math.max(0,target||0));metrics.scrollRestores++}catch(_){ }
      })});
    }catch(_){try{window.scrollTo(0,Math.max(0,target||0));metrics.scrollRestores++}catch(__){ }}
    return target;
  }
  function onScroll(){
    if(scrollRaf)return;
    try{scrollRaf=requestAnimationFrame(function(){scrollRaf=0;if(lastRouteKey)scrollMemory[lastRouteKey]=currentY()})}
    catch(_){if(lastRouteKey)scrollMemory[lastRouteKey]=currentY()}
  }

  // FIX1: v39.31 must never inject, reorder or resize Home UI.
  // Remove only remnants created by the rejected v39.31 candidate, if they exist in the live DOM.
  function removeRejectedLegacyUi(){
    if(typeof document==='undefined')return 0;
    var removed=0;
    try{
      var nodes=document.querySelectorAll('[data-ar39310-home-shortcuts]');
      Array.prototype.forEach.call(nodes,function(n){try{n.remove();removed++}catch(_){if(n.parentNode){n.parentNode.removeChild(n);removed++}}});
      var style=document.getElementById('ar39310-home-navigation-hardening-style');
      if(style){try{style.remove()}catch(_){if(style.parentNode)style.parentNode.removeChild(style)}removed++;}
      if(document.documentElement)document.documentElement.classList.remove('ar39310-nav-hard');
      if(document.body)document.body.classList.remove('ar39310-home-nav');
    }catch(_){ }
    metrics.legacyQuickMenuRemoved+=removed;
    return removed;
  }

  function navigationSignature(btn){
    if(!btn||!btn.getAttribute)return '';
    var a=btn.getAttribute('data-action')||'',tab=btn.getAttribute('data-tab')||'',id=btn.getAttribute('data-id')||'';
    if(a==='tab')return 'tab|'+tab;
    if(a==='account')return 'account|'+id;
    if(btn.hasAttribute('data-ar396')&&btn.getAttribute('data-ar396')==='home')return 'home';
    return '';
  }
  function guardDuplicateNavigation(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-action="tab"],[data-action="account"],[data-ar396="home"]'):null;
    var sig=navigationSignature(b);if(!sig)return;
    var now=Date.now();
    if(sig===lastNavSignature&&(now-lastNavAt)<280){
      e.preventDefault();
      if(e.stopImmediatePropagation)e.stopImmediatePropagation();else e.stopPropagation();
      metrics.duplicateNavigationBlocked++;
      return;
    }
    saveCurrentScroll();
    lastNavSignature=sig;lastNavAt=now;
  }

  function afterRender(){removeRejectedLegacyUi();restoreScroll()}

  window.AlanRangHomeNavigationV39310=Object.freeze({
    version:VERSION,
    routeKey:routeKey,
    saveCurrentScroll:saveCurrentScroll,
    removeRejectedLegacyUi:removeRejectedLegacyUi,
    scrollMemory:function(){var out={};Object.keys(scrollMemory).forEach(function(k){out[k]=scrollMemory[k]});return out;},
    metrics:function(){return {scrollRestores:metrics.scrollRestores,duplicateNavigationBlocked:metrics.duplicateNavigationBlocked,legacyQuickMenuRemoved:metrics.legacyQuickMenuRemoved};},
    capabilities:function(){return {presentationNeutral:true,legacyQuickMenuRemoved:true,calendarPresentationUntouched:true,inMemoryScrollOnly:true,noStorageWrite:true,noDatabaseWrite:true,noFinancialMutation:true,noAccountingFormulaChange:true,noDocumentMutation:true,noFeatureRemoval:true,noPermissionChange:true,usesCoreRouteActions:true,noRenderWrapper:true,noDomInsertion:true,noHomeReorder:true,noBottomNavRestyle:true};}
  });

  try{if(typeof registerAlanRangBeforeRender==='function')registerAlanRangBeforeRender('v39310-navigation-scroll-capture-fix1',beforeRender)}catch(_){ }
  try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39310-navigation-stability-fix1',afterRender)}catch(_){ }
  if(typeof document!=='undefined'){
    document.addEventListener('click',guardDuplicateNavigation,true);
    window.addEventListener('scroll',onScroll,{passive:true});
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){lastRouteKey=routeKey();removeRejectedLegacyUi();},{once:true});
    else{lastRouteKey=routeKey();removeRejectedLegacyUi();}
  }
})();
