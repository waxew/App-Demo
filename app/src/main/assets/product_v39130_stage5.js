(function(){
'use strict';
if(window.__ALANRANG_REPORTS_V39130_STAGE5__)return;
window.__ALANRANG_REPORTS_V39130_STAGE5__=true;
var VERSION='39.13.0-reports-stage5-release-v02';
var REQUIRED=[
  ['AlanRangReportsV39130','39.13.0-reports-stage1-contract-v01'],
  ['AlanRangReportsUIV39130','39.13.0-reports-stage2-ui-export-v01'],
  ['AlanRangReportsMediaV39130','39.13.0-reports-stage3-pdf-jpg-share-v01'],
  ['AlanRangReportsWorkspaceV39130','39.13.0-reports-stage4-presets-history-v01']
];
function validate(){
  var missing=[],mismatch=[];
  REQUIRED.forEach(function(item){
    var api=window[item[0]];
    if(!api){missing.push(item[0]);return;}
    if(api.version!==item[1])mismatch.push({name:item[0],expected:item[1],actual:String(api.version||'')});
  });
  return {ok:missing.length===0&&mismatch.length===0,missing:missing.slice(),mismatch:mismatch.slice(),version:VERSION};
}
window.AlanRangReportsReleaseV39130=Object.freeze({
  version:VERSION,
  semanticVersion:'39.13.0',
  versionCode:399500,
  packageId:'ir.alanrang.pro',
  baseline:'v39.12.1-final-locked',
  upgradeSafe:true,
  featureFreeze:true,
  signedUpdateCandidate:true,
  persistenceMode:'metadata-only-workspace',
  requiredStages:Object.freeze(REQUIRED.map(function(x){return x[0]})),
  validate:validate
});
})();
