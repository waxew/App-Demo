(function(){
'use strict';
if(window.__ALANRANG_PERFORMANCE_V39160_STAGE5__)return;
window.__ALANRANG_PERFORMANCE_V39160_STAGE5__=true;
var VERSION='39.16.0-performance-stage5-release-v01';
var REQUIRED=[
 ['AlanRangPerformanceV39160','39.16.0-performance-stage1-cache-v01'],
 ['AlanRangPerformanceUIV39160','39.16.0-performance-stage2-ui-v01'],
 ['AlanRangPerformanceDiagnosticsV39160','39.16.0-performance-stage3-diagnostics-v01'],
 ['AlanRangPerformanceCenterV39160','39.16.0-performance-stage4-center-v01']
];
function gate(){
  var errors=[];
  REQUIRED.forEach(function(x){var a=window[x[0]];if(!a)errors.push({type:'missingModule',module:x[0]});else if(String(a.version)!==x[1])errors.push({type:'versionMismatch',module:x[0],expected:x[1],actual:String(a.version||'')})});
  var core=window.AlanRangPerformanceV39160,ui=window.AlanRangPerformanceUIV39160,diag=window.AlanRangPerformanceDiagnosticsV39160,center=window.AlanRangPerformanceCenterV39160;
  try{var c=core&&core.capabilities?core.capabilities():{};if(!c.indexedLookups||!c.changeAwareBalanceRecalculation||!c.noFinancialFormulaChange||!c.noPersistentTelemetry)errors.push({type:'unsafePerformanceCore'})}catch(_){errors.push({type:'performanceCoreGateError'})}
  try{var u=ui&&ui.capabilities?ui.capabilities():{};if(!u.printSafe||!u.exportSafe||!u.noDataMutation)errors.push({type:'unsafePerformanceUI'})}catch(_){errors.push({type:'performanceUIGateError'})}
  try{var d=diag&&diag.capabilities?diag.capabilities():{};if(!d.sessionOnlyMetrics||!d.noPersistentTelemetry||!d.noBusinessDataCapture||!d.synchronousRenderSemantics)errors.push({type:'unsafeDiagnostics'})}catch(_){errors.push({type:'diagnosticsGateError'})}
  try{var p=center&&center.capabilities?center.capabilities():{};if(!p.readOnlyMetrics||!p.sessionOnly||!p.cacheRefreshOnly||!p.noFinancialMutation)errors.push({type:'unsafePerformanceCenter'})}catch(_){errors.push({type:'performanceCenterGateError'})}
  var prev=window.AlanRangIntegrityReleaseV39150;if(!prev||typeof prev.gate!=='function'||!prev.gate().clean)errors.push({type:'baselineIntegrityReleaseNotClean'});
  var share=window.AlanRangCustomerInvoiceStatusShareB2;if(!share||typeof share.capabilities!=='function'||!share.capabilities().alwaysVisibleOnInvoicePreview)errors.push({type:'baselineCustomerShareB2Missing'});
  return {clean:errors.length===0,errors:errors};
}
window.AlanRangPerformanceReleaseV39160=Object.freeze({version:VERSION,semanticVersion:'39.16.0',versionCode:399800,baseline:'v39.15.0-b2-final-locked',feature:'performance-ux-hardening',noFinancialFormulaChange:true,noPersistentTelemetry:true,gate:gate});
})();
