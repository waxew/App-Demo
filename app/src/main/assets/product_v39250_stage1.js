(function(){
  'use strict';
  if(window.__ALANRANG_V39250_STAGE1__)return;
  window.__ALANRANG_V39250_STAGE1__=true;
  var VERSION='39.25.0-performance-ux-stage1-measurement-v02';
  var m={renders:0,duplicateCandidates:0,lastTab:'',lastAt:0};
  function now(){try{return performance&&performance.now?performance.now():Date.now()}catch(_){return Date.now()}}
  function observe(){var t=now(),tab='';try{tab=String(window.state&&state.tab||'')}catch(_){}
    m.renders++;
    if(m.lastTab===tab&&t-m.lastAt<16)m.duplicateCandidates++;
    m.lastTab=tab;m.lastAt=t;
  }
  function status(){return {version:VERSION,renders:m.renders,duplicateCandidates:m.duplicateCandidates,lastTab:m.lastTab,capabilities:{sessionOnly:true,noPersistentTelemetry:true,noDataMutation:true,noFinancialMutation:true,noRenderSemanticsChange:true}}}
  function clear(){m.renders=0;m.duplicateCandidates=0;m.lastTab='';m.lastAt=0;return true}
  window.AlanRangPerformanceUXV39250=Object.freeze({version:VERSION,observe:observe,status:status,clear:clear,capabilities:function(){return status().capabilities}});
  try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39250-stage1-observer',observe)}catch(_){}
})();
