(function(){
'use strict';
if(window.__ALANRANG_INTEGRITY_V39150_STAGE5__)return;
window.__ALANRANG_INTEGRITY_V39150_STAGE5__=true;
var VERSION='39.15.0-integrity-stage5-release-v01';
var REQUIRED=[
 ['AlanRangIntegrityV39150','39.15.0-integrity-stage1-scan-v01'],
 ['AlanRangIntegrityUIV39150','39.15.0-integrity-stage2-center-ui-v01'],
 ['AlanRangRecoveryV39150','39.15.0-integrity-stage3-safe-recovery-v01'],
 ['AlanRangIntegrityWorkspaceV39150','39.15.0-integrity-stage4-diagnostics-v01']
];
function gate(){var errors=[];REQUIRED.forEach(function(x){var a=window[x[0]];if(!a)errors.push({type:'missingModule',module:x[0]});else if(String(a.version)!==x[1])errors.push({type:'versionMismatch',module:x[0],expected:x[1],actual:String(a.version||'')})});var core=window.AlanRangIntegrityV39150,rec=window.AlanRangRecoveryV39150;if(core&&typeof core.capabilities==='function'){var c=core.capabilities();if(!c.readOnlyScan||c.automaticFinancialRepair||c.automaticReferenceRepair)errors.push({type:'unsafeIntegrityContract'})}if(rec&&typeof rec.capabilities==='function'){var r=rec.capabilities();if(!r.explicitOnly||!r.snapshotBeforeRepair||!r.rollback||r.financialAutoFix||r.balanceAutoFix||r.checkAutoFix)errors.push({type:'unsafeRecoveryContract'})}return {clean:errors.length===0,errors:errors}}
window.AlanRangIntegrityReleaseV39150=Object.freeze({version:VERSION,semanticVersion:'39.15.0',versionCode:399701,baseline:'v39.14.0-final-locked',feature:'data-integrity-recovery-center',safeRecoveryOnly:true,noFinancialAutofix:true,gate:gate});
})();
