(function(){
'use strict';
if(window.__ALANRANG_PERFORMANCE_V39160_STAGE2__)return;
window.__ALANRANG_PERFORMANCE_V39160_STAGE2__=true;
var VERSION='39.16.0-performance-stage2-ui-v01';
var STYLE_ID='ar39160-performance-style';
var SELECTORS=[
  '.customer-card','.invoice-list-card','.v27-work-card','.v32-task-card','.v323-card-work','.v324-filter-work-card',
  '.v331-tx-card','.v335-card','.v34-card','.v36-card','.v37-card','.v372-card','.v372b-card','.v373-card','.v3734-item',
  '.v3824-entry-card','.ar383-search-item','.ar39110-doc','.v39120-card','.ar39150-card','.ar3954-invoice-row','.ar3959-check-item'
];
function installStyle(){
  if(typeof document==='undefined'||document.getElementById(STYLE_ID))return false;
  var style=document.createElement('style');style.id=STYLE_ID;
  var list=SELECTORS.join(',');
  style.textContent='@supports (content-visibility:auto){'+list+'{content-visibility:auto;contain-intrinsic-size:auto 150px}}'
    +'html.alanrang-android-app button,html.alanrang-android-app [role="button"],html.alanrang-android-app .btn{touch-action:manipulation}'
    +'html.alanrang-android-app .page,html.alanrang-android-app .ar39150-page{overflow-anchor:auto}'
    +'body.exporting '+list+'{content-visibility:visible!important;contain-intrinsic-size:none!important}'
    +'@media print{'+list+'{content-visibility:visible!important;contain-intrinsic-size:none!important}}';
  (document.head||document.documentElement).appendChild(style);return true;
}
function idleWarm(){
  var run=function(){try{var p=window.AlanRangPerformanceV39160;if(p&&typeof p.warm==='function')p.warm()}catch(_){ }};
  try{if(typeof requestIdleCallback==='function'){requestIdleCallback(run,{timeout:600});return true}}catch(_){ }
  try{setTimeout(run,120);return true}catch(_){return false}
}
function afterRender(){
  installStyle();
  idleWarm();
}
try{installStyle()}catch(_){ }
try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39160-ui-performance',afterRender)}catch(_){ }
try{idleWarm()}catch(_){ }
window.AlanRangPerformanceUIV39160=Object.freeze({
  version:VERSION,
  selectors:SELECTORS.slice(),
  installStyle:installStyle,
  idleWarm:idleWarm,
  capabilities:function(){return {offscreenListRendering:true,printSafe:true,exportSafe:true,touchOptimization:true,noDataMutation:true}}
});
})();
