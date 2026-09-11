(function(){
'use strict';
if(window.__ALANRANG_LONGTERM_V39400__)return;
window.__ALANRANG_LONGTERM_V39400__=true;
var VERSION='39.40.0-release-safety-gate-v02';
function runtimeGate(){
  var signing={};try{signing=window.AlanRangLongTerm&&window.AlanRangLongTerm.signingStatus?window.AlanRangLongTerm.signingStatus():{ok:false}}catch(_){signing={ok:false}}
  var modules={backup:!!window.__ALANRANG_LONGTERM_V39330__,offDevice:!!window.__ALANRANG_LONGTERM_V39340__,recovery:!!window.__ALANRANG_LONGTERM_V39350__,migration:!!window.__ALANRANG_LONGTERM_V39360__,integrity:!!window.__ALANRANG_LONGTERM_V39370__,portableExport:!!window.__ALANRANG_LONGTERM_V39380__,signing:!!window.__ALANRANG_LONGTERM_V39390__,releaseSafety:true};
  var loaded=Object.keys(modules).every(function(k){return modules[k]});
  return {version:VERSION,ok:loaded&&!!signing.ok,modules:modules,releaseIdentity:signing,policy:{directUpdateRequired:true,clearDataForbidden:true,uninstallForbiddenDuringUpgrade:true,finalLockRequiresRealDeviceApproval:true,finalLockMustBeByteIdenticalToApprovedCandidate:true,privateKeyForbiddenInSource:true,automaticFinancialRepair:false,destructiveCleanupRequiresFreshVerifiedBackup:true,restoreRequiresVerificationAndRollback:true,deviceDataPreservationCheckRequired:true,releaseCertificateCryptographicVerificationRequired:true}};
}
window.AlanRangLongTerm=window.AlanRangLongTerm||{};window.AlanRangLongTerm.version39400=VERSION;window.AlanRangLongTerm.releaseSafetyStatus=runtimeGate;
window.AlanRangLongTermV39400={version:VERSION,runtimeGate:runtimeGate};
})();
