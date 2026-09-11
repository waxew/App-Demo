(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_V39170_STAGE5__)return;
window.__ALANRANG_FOLLOWUP_V39170_STAGE5__=true;
var VERSION='39.17.0-followup-stage5-release-v01';
var REQUIRED=[
 ['AlanRangFollowupV39170','39.17.0-followup-stage1-engine-v01'],
 ['AlanRangFollowupUIV39170','39.17.0-followup-stage2-ui-v01'],
 ['AlanRangFollowupDiagnosticsV39170','39.17.0-followup-stage3-diagnostics-v01'],
 ['AlanRangFollowupIntegrationV39170','39.17.0-followup-stage4-integration-v01']
];
function gate(){var errors=[];REQUIRED.forEach(function(x){var a=window[x[0]];if(!a)errors.push({type:'missingModule',module:x[0]});else if(String(a.version)!==x[1])errors.push({type:'versionMismatch',module:x[0],expected:x[1],actual:String(a.version||'')})});
  try{var c=window.AlanRangFollowupV39170.capabilities();if(!c.readOnlyEngine||!c.noDataMutation||!c.noFinancialFormulaChange||!c.noNewStorageSchema)errors.push({type:'unsafeFollowupEngine'})}catch(_){errors.push({type:'followupEngineGateError'})}
  try{var u=window.AlanRangFollowupUIV39170.capabilities();if(!u.readOnlyFinancialDisplay||!u.noPersistentUIState||!u.noDataMutation)errors.push({type:'unsafeFollowupUI'})}catch(_){errors.push({type:'followupUIGateError'})}
  try{var d=window.AlanRangFollowupDiagnosticsV39170.capabilities();if(!d.readOnlyDiagnostics||!d.noAutomaticRepair||!d.noFinancialMutation||!d.noStorageWrite)errors.push({type:'unsafeFollowupDiagnostics'})}catch(_){errors.push({type:'followupDiagnosticsGateError'})}
  try{var i=window.AlanRangFollowupIntegrationV39170.capabilities();if(!i.reusesCanonicalFollowupModal||!i.noDirectFollowupWrite||!i.noFinancialMutation)errors.push({type:'unsafeFollowupIntegration'})}catch(_){errors.push({type:'followupIntegrationGateError'})}
  var prev=window.AlanRangPerformanceReleaseV39160;if(!prev||typeof prev.gate!=='function'||!prev.gate().clean)errors.push({type:'baselineV39160NotClean'});
  return {clean:errors.length===0,errors:errors};
}
window.AlanRangFollowupReleaseV39170=Object.freeze({version:VERSION,semanticVersion:'39.17.0',versionCode:399900,baseline:'v39.16.0-final-locked',feature:'customer-followup-center',databaseImpact:'none-existing-followups-only',financialImpact:'none',gate:gate});
})();
