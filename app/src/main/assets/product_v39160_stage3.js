(function(){
'use strict';
if(window.__ALANRANG_PERFORMANCE_V39160_STAGE3__)return;
window.__ALANRANG_PERFORMANCE_V39160_STAGE3__=true;
var VERSION='39.16.0-performance-stage3-diagnostics-v01';
var originalRender=typeof window.renderApp==='function'?window.renderApp:null;
var m={renders:0,totalMs:0,lastMs:0,maxMs:0,slowRenders:0,lastTab:'',startedAt:Date.now()};
function now(){try{return performance&&typeof performance.now==='function'?performance.now():Date.now()}catch(_){return Date.now()}}
function measuredRender(){
  if(!originalRender)return null;
  var start=now(),result;
  try{return result=originalRender.apply(this,arguments)}finally{
    var elapsed=Math.max(0,now()-start);m.renders++;m.totalMs+=elapsed;m.lastMs=elapsed;if(elapsed>m.maxMs)m.maxMs=elapsed;if(elapsed>=80)m.slowRenders++;
    try{m.lastTab=String(window.state&&state.tab||'')}catch(_){m.lastTab=''}
  }
}
function round(v){return Math.round(Number(v||0)*10)/10}
function status(){
  var core=window.AlanRangPerformanceV39160,cs=core&&typeof core.status==='function'?core.status():null;
  return {version:VERSION,active:!!originalRender,renders:m.renders,lastMs:round(m.lastMs),averageMs:round(m.renders?m.totalMs/m.renders:0),maxMs:round(m.maxMs),slowRenders:m.slowRenders,lastTab:m.lastTab,sessionSeconds:Math.round((Date.now()-m.startedAt)/1000),cache:cs};
}
function clearMetrics(){m.renders=0;m.totalMs=0;m.lastMs=0;m.maxMs=0;m.slowRenders=0;m.startedAt=Date.now();return true}
function refreshCaches(){try{var core=window.AlanRangPerformanceV39160;if(core&&core.invalidate)core.invalidate('performance-center');if(core&&core.warm)core.warm();return true}catch(_){return false}}
if(originalRender){try{renderApp=measuredRender}catch(_){ }window.renderApp=measuredRender}
window.AlanRangPerformanceDiagnosticsV39160=Object.freeze({version:VERSION,status:status,clearMetrics:clearMetrics,refreshCaches:refreshCaches,capabilities:function(){return {sessionOnlyMetrics:true,noPersistentTelemetry:true,noBusinessDataCapture:true,synchronousRenderSemantics:true}}});
})();
