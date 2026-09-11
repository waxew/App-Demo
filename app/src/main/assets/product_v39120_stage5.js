(function(){
'use strict';
if(window.__ALANRANG_CHECK_RELEASE_V39120_STAGE5__)return;
window.__ALANRANG_CHECK_RELEASE_V39120_STAGE5__=true;
var VERSION='39.12.1-checks-status-update-release-v02';
var REQUIRED=[
  ['AlanRangChecksV39120','39.12.0-checks-stage1-v01'],
  ['AlanRangChecksUIV39120','39.12.0-checks-stage2-ui-v01'],
  ['AlanRangChecksStatusV39120','39.12.1-checks-stage3-status-fix-v02'],
  ['AlanRangChecksOpsV39120','39.19.0-checks-stage4-overdue-status-fix1-v01']
];
function validate(){
  var missing=[];
  REQUIRED.forEach(function(item){
    var api=window[item[0]];
    if(!api||api.version!==item[1])missing.push(item[0]);
  });
  return {ok:missing.length===0,missing:missing.slice(),version:VERSION};
}
window.AlanRangChecksReleaseV39120=Object.freeze({
  version:VERSION,
  semanticVersion:'39.12.1',
  versionCode:399402,
  packageId:'ir.alanrang.pro',
  baseline:'v39.12.0-final-locked',
  upgradeSafe:true,
  featureFreeze:true,
  signedUpdateCandidate:true,
  persistenceMode:'none',
  requiredStages:Object.freeze(REQUIRED.map(function(x){return x[0]})),
  validate:validate
});
})();
