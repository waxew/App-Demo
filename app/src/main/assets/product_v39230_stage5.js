(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_MESSAGE_PRESETS_V39230_STAGE5__)return;
window.__ALANRANG_FOLLOWUP_MESSAGE_PRESETS_V39230_STAGE5__=true;
var VERSION='39.23.0-followup-message-presets-stage5-release-v01';
var REQUIRED=[['AlanRangFollowupMessagePresetsV39230','39.23.0-followup-message-presets-stage1-engine-v01'],['AlanRangFollowupMessagePresetsUIV39230','39.23.0-followup-message-presets-stage2-ui-v01'],['AlanRangFollowupMessagePresetsPolicyV39230','39.23.0-followup-message-presets-stage3-policy-v01'],['AlanRangFollowupMessagePresetsIntegrationV39230','39.23.0-followup-message-presets-stage4-integration-v01']];
function gate(){var errors=[];for(var i=0;i<REQUIRED.length;i++){var o=window[REQUIRED[i][0]];if(!o||o.version!==REQUIRED[i][1])errors.push({type:'missingOrWrongModule',module:REQUIRED[i][0]})}try{var old=window.AlanRangFollowupSharingReleaseV39220,g=old&&old.gate?old.gate():null;if(!old||!g||!g.clean)errors.push({type:'v39220FinalBaselineNotClean'})}catch(_){errors.push({type:'v39220BaselineGateError'})}try{var fix=window.AlanRangCheckHomeConsistencyV39200,fc=fix&&fix.capabilities?fix.capabilities():null;if(!fc||!fc.canonicalCheckSourceOnly||!fc.overdueNavigationUsesCanonicalFilter||!fc.noCheckWrite||!fc.noFinancialEffect||!fc.noFollowupChange)errors.push({type:'v39200CheckFixNotProtected'})}catch(_){errors.push({type:'checkFixGateError'})}return {clean:errors.length===0,errors:errors}}
window.AlanRangFollowupMessagePresetsReleaseV39230=Object.freeze({version:VERSION,semanticVersion:'39.23.0',versionCode:400500,baseline:'v39.22.0-customer-followup-sharing-sms-fix2-final-locked',feature:'followup-message-presets',databaseImpact:'none',financialImpact:'none',checkImpact:'none',permissionImpact:'none',gate:gate});
})();
