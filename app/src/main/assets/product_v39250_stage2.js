(function(){
  'use strict';
  if(window.__ALANRANG_V39250_STAGE2__)return;
  window.__ALANRANG_V39250_STAGE2__=true;
  var VERSION='39.25.0-performance-ux-stage2-daily-actions-v02',STYLE='ar39250-stage2-style';
  function style(){if(typeof document==='undefined'||document.getElementById(STYLE))return false;var s=document.createElement('style');s.id=STYLE;s.textContent='.ar39210-quickbar[data-ar39210-quickbar]{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.ar39210-quickbar[data-ar39210-quickbar] .btn{min-height:38px;white-space:nowrap}';(document.head||document.documentElement).appendChild(s);return true}
  function apply(){try{style();if(typeof document==='undefined')return false;document.querySelectorAll('.ar39210-quickbar[data-ar39210-quickbar]').forEach(function(b){b.setAttribute('data-ar39250-consistent','1')});return true}catch(_){return false}}
  window.AlanRangDailyUXV39250=Object.freeze({version:VERSION,style:style,apply:apply,capabilities:function(){return {domOnly:true,noDataMutation:true,noStorageWrite:true,noFinancialMutation:true,noNewScreen:true,noPermissionChange:true}}});
  try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39250-stage2-daily-ux',apply)}catch(_){}
})();
