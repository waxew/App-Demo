(function(){
  'use strict';
  if(window.__ALANRANG_V39280_PERFORMANCE_STABILITY__)return;
  window.__ALANRANG_V39280_PERFORMANCE_STABILITY__=true;

  var VERSION='39.28.0-performance-stability-v0000001';
  var STYLE_ID='ar39280-performance-style';
  var CUSTOMER_BATCH=48;
  var CUSTOMER_THRESHOLD=72;
  var customerGeneration=0;
  var activeRenderCycle=0;
  var renderCycleCounter=0;
  var saveEpoch=0;
  var lastBalanceCycle=-1;
  var lastBalanceSaveEpoch=-1;
  var rendering=false;
  var pendingRender=false;
  var pendingRenderArgs=null;
  var shareInFlight=null;
  var lastTransferKey='';
  var lastTransferAt=0;
  var metrics={
    renderReentryCoalesced:0,
    balanceBurstSkipped:0,
    balanceDelegated:0,
    customerBatches:0,
    customerDeferredCards:0,
    transferDuplicateBlocked:0,
    transferErrors:0,
    shareJoined:0
  };

  function now(){try{return performance&&typeof performance.now==='function'?performance.now():Date.now()}catch(_){return Date.now()}}
  function defer(fn){
    try{if(typeof requestIdleCallback==='function'){requestIdleCallback(fn,{timeout:80});return true}}catch(_){ }
    try{setTimeout(fn,0);return true}catch(_){return false}
  }
  function installStyle(){
    if(typeof document==='undefined'||document.getElementById(STYLE_ID))return false;
    var s=document.createElement('style');s.id=STYLE_ID;
    s.textContent='@supports (content-visibility:auto){'
      +'.customer-card,.v29-row,.ar39110-doc,.ar39120-card,.ar391-color,.ar392-match,.ar3959-check-item,.v3824-entry-card,.v3734-item,.ar3938-sheet,.ar39210-card{content-visibility:auto;contain-intrinsic-size:auto 160px}'
      +'.ar3840-home>.ar3840-card,.ar3862-home>section{content-visibility:auto;contain-intrinsic-size:auto 190px}'
      +'}'
      +'[data-ar39280-customer-more]{min-height:44px;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:12px;padding:8px}'
      +'body.exporting [data-ar39280-customer-more]{display:none!important}'
      +'@media print{[data-ar39280-customer-more]{display:none!important}.customer-card,.v29-row,.ar39110-doc,.ar39120-card,.ar391-color,.ar392-match,.ar3959-check-item,.v3824-entry-card,.v3734-item,.ar3938-sheet,.ar39210-card{content-visibility:visible!important;contain-intrinsic-size:none!important}}';
    (document.head||document.documentElement).appendChild(s);return true;
  }

  function beforeRender(){activeRenderCycle=++renderCycleCounter;}
  function afterRender(){activeRenderCycle=0;installStyle();hydrateCustomerList();}
  function afterSave(){saveEpoch++;lastBalanceCycle=-1;lastBalanceSaveEpoch=-1;customerGeneration++;}

  var originalRecalculate=typeof window.recalculateAllBalances==='function'?window.recalculateAllBalances:null;
  function optimizedRecalculateAllBalances(shouldSave){
    if(!originalRecalculate)return;
    if(shouldSave!==true&&activeRenderCycle>0&&lastBalanceCycle===activeRenderCycle&&lastBalanceSaveEpoch===saveEpoch){
      metrics.balanceBurstSkipped++;return;
    }
    metrics.balanceDelegated++;
    var out=originalRecalculate.apply(this,arguments);
    if(shouldSave!==true&&activeRenderCycle>0){lastBalanceCycle=activeRenderCycle;lastBalanceSaveEpoch=saveEpoch;}
    return out;
  }
  if(originalRecalculate){try{recalculateAllBalances=optimizedRecalculateAllBalances}catch(_){ }window.recalculateAllBalances=optimizedRecalculateAllBalances;}

  var originalRender=typeof window.renderApp==='function'?window.renderApp:null;
  function runPendingRender(){
    if(!pendingRender||rendering||!originalRender)return;
    var args=pendingRenderArgs||[];pendingRender=false;pendingRenderArgs=null;
    coordinatedRender.apply(window,args);
  }
  function coordinatedRender(){
    if(!originalRender)return null;
    if(rendering){
      pendingRender=true;pendingRenderArgs=Array.prototype.slice.call(arguments);metrics.renderReentryCoalesced++;return true;
    }
    rendering=true;
    try{return originalRender.apply(this,arguments)}finally{
      rendering=false;
      if(pendingRender)defer(runPendingRender);
    }
  }
  if(originalRender){try{renderApp=coordinatedRender}catch(_){ }window.renderApp=coordinatedRender;}

  var originalCustomerList=typeof window.renderCustomerList==='function'?window.renderCustomerList:null;
  var originalCustomerCard=typeof window.customerCard==='function'?window.customerCard:null;
  var pendingCustomerJob=null;
  function customerRows(){
    try{
      var q=String(window.state&&state.search||'').trim();
      var rows=window.data&&Array.isArray(data.customers)?data.customers:[];
      return {q:q,list:rows.filter(function(c){return !q||[c&&c.name,c&&c.phone,c&&c.address].join(' ').indexOf(q)>-1;})};
    }catch(_){return {q:'',list:[]};}
  }
  function renderCustomerBatch(list,start,end){
    if(!originalCustomerCard)return '';
    return list.slice(start,end).map(function(c){return originalCustomerCard(c)}).join('');
  }
  function fastRenderCustomerList(){
    if(!originalCustomerList||!originalCustomerCard)return originalCustomerList?originalCustomerList.apply(this,arguments):'';
    var rows=customerRows(),list=rows.list;
    if(list.length<=CUSTOMER_THRESHOLD)return originalCustomerList.apply(this,arguments);
    var gen=++customerGeneration;
    pendingCustomerJob={generation:gen,query:rows.q,list:list,index:CUSTOMER_BATCH};
    var first=renderCustomerBatch(list,0,CUSTOMER_BATCH);
    metrics.customerDeferredCards+=Math.max(0,list.length-CUSTOMER_BATCH);
    defer(hydrateCustomerList);
    return first+'<div data-ar39280-customer-more="'+gen+'">در حال آماده‌سازی ادامه فهرست…</div>';
  }
  function hydrateCustomerList(){
    var job=pendingCustomerJob;if(!job||typeof document==='undefined')return false;
    var sentinel=document.querySelector('[data-ar39280-customer-more="'+job.generation+'"]');
    if(!sentinel){if(job.generation!==customerGeneration)pendingCustomerJob=null;return false;}
    try{
      if(!(window.state&&state.tab==='customers')||String(state.search||'').trim()!==job.query){pendingCustomerJob=null;return false;}
    }catch(_){pendingCustomerJob=null;return false;}
    var end=Math.min(job.list.length,job.index+CUSTOMER_BATCH);
    var html=renderCustomerBatch(job.list,job.index,end);
    if(html&&typeof sentinel.insertAdjacentHTML==='function')sentinel.insertAdjacentHTML('beforebegin',html);
    metrics.customerBatches++;job.index=end;
    if(job.index>=job.list.length){try{sentinel.remove()}catch(_){if(sentinel.parentNode)sentinel.parentNode.removeChild(sentinel)}pendingCustomerJob=null;return true;}
    defer(hydrateCustomerList);return true;
  }
  if(originalCustomerList){try{renderCustomerList=fastRenderCustomerList}catch(_){ }window.renderCustomerList=fastRenderCustomerList;}

  function transferActionKey(target){
    if(!target||!target.getAttribute)return '';
    var action=target.getAttribute('data-action')||target.getAttribute('data-ar39220')||target.getAttribute('data-ar39210')||target.getAttribute('data-ar3938')||'';
    var text=String(action||'').toLowerCase();
    if(!/(share|sms|export|download|print|file|send)/.test(text))return '';
    var id=target.getAttribute('data-id')||target.getAttribute('data-invoice-id')||target.getAttribute('data-customer-id')||'';
    return text+'|'+String(id);
  }
  function guardTransferClick(ev){
    var target=ev&&ev.target&&ev.target.closest?ev.target.closest('[data-action],[data-ar39220],[data-ar39210],[data-ar3938]'):null;
    var key=transferActionKey(target);if(!key)return;
    var t=now();
    if(key===lastTransferKey&&t-lastTransferAt<700){
      metrics.transferDuplicateBlocked++;
      try{ev.preventDefault();ev.stopImmediatePropagation()}catch(_){ }
      return false;
    }
    lastTransferKey=key;lastTransferAt=t;return true;
  }

  function wrapNavigatorShare(){
    try{
      if(typeof navigator==='undefined'||typeof navigator.share!=='function'||navigator.share.__ar39280Wrapped)return false;
      var original=navigator.share.bind(navigator);
      var wrapped=function(payload){
        if(shareInFlight){metrics.shareJoined++;return shareInFlight;}
        try{
          shareInFlight=Promise.resolve(original(payload)).catch(function(error){if(!(error&&error.name==='AbortError'))metrics.transferErrors++;throw error;}).then(function(value){shareInFlight=null;return value;},function(error){shareInFlight=null;throw error;});
          return shareInFlight;
        }catch(error){shareInFlight=null;if(!(error&&error.name==='AbortError'))metrics.transferErrors++;throw error;}
      };
      wrapped.__ar39280Wrapped=true;
      try{Object.defineProperty(navigator,'share',{configurable:true,value:wrapped})}catch(_){navigator.share=wrapped;}
      return true;
    }catch(_){return false;}
  }

  function recordUnhandled(ev){
    try{
      var reason=ev&&ev.reason,txt=String(reason&&reason.message||reason||'').toLowerCase();
      if(/share|sms|file|blob|export|download/.test(txt))metrics.transferErrors++;
    }catch(_){ }
  }
  function status(){
    return {version:VERSION,saveEpoch:saveEpoch,renderCycle:renderCycleCounter,metrics:Object.assign({},metrics),customerBatch:CUSTOMER_BATCH,customerThreshold:CUSTOMER_THRESHOLD,capabilities:{renderReentryCoalescing:true,oneBalancePassPerRenderCycle:true,progressiveCustomerRendering:true,offscreenContainment:true,transferDoubleTapGuard:true,shareSingleFlight:true,sessionOnlyMetrics:true,noPersistentTelemetry:true,noDataMutation:true,noStorageWrite:true,noFinancialFormulaChange:true,noSchemaChange:true,noPermissionChange:true}};
  }

  window.AlanRangPerformanceStabilityV39280=Object.freeze({version:VERSION,status:status,hydrateCustomerList:hydrateCustomerList,capabilities:function(){return status().capabilities;}});
  try{if(typeof registerAlanRangBeforeRender==='function')registerAlanRangBeforeRender('v39280-render-cycle-start',beforeRender)}catch(_){ }
  try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39280-render-cycle-end',afterRender)}catch(_){ }
  try{if(typeof registerAlanRangAfterSave==='function')registerAlanRangAfterSave('v39280-save-epoch',afterSave)}catch(_){ }
  if(typeof document!=='undefined'){
    try{document.addEventListener('click',guardTransferClick,true)}catch(_){ }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){installStyle();wrapNavigatorShare();},{once:true});else{installStyle();wrapNavigatorShare();}
  }
  try{if(typeof window.addEventListener==='function')window.addEventListener('unhandledrejection',recordUnhandled)}catch(_){ }
})();
