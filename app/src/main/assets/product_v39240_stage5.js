(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_MESSAGE_COMPOSER_V39240_STAGE5__)return;
window.__ALANRANG_FOLLOWUP_MESSAGE_COMPOSER_V39240_STAGE5__=true;
var VERSION='39.24.0-followup-message-composer-stage5-release-v01';
var REQUIRED=[['AlanRangFollowupMessageComposerV39240','39.24.0-followup-message-composer-stage1-engine-v01'],['AlanRangFollowupMessageComposerUIV39240','39.24.0-followup-message-composer-stage2-ui-v01'],['AlanRangFollowupMessageComposerPolicyV39240','39.24.0-followup-message-composer-stage3-policy-v01'],['AlanRangFollowupMessageComposerIntegrationV39240','39.24.0-followup-message-composer-stage4-integration-v01']];
function gate(){var errors=[];for(var i=0;i<REQUIRED.length;i++){var o=window[REQUIRED[i][0]];if(!o||o.version!==REQUIRED[i][1])errors.push({type:'missingOrWrongModule',module:REQUIRED[i][0]})}try{var old=window.AlanRangFollowupMessagePresetsReleaseV39230,g=old&&old.gate?old.gate():null;if(!old||!g||!g.clean)errors.push({type:'v39230FinalBaselineNotClean'})}catch(_){errors.push({type:'v39230BaselineGateError'})}try{var fix=window.AlanRangCheckHomeConsistencyV39200,fc=fix&&fix.capabilities?fix.capabilities():null;if(!fc||!fc.canonicalCheckSourceOnly||!fc.overdueNavigationUsesCanonicalFilter||!fc.noCheckWrite||!fc.noFinancialEffect||!fc.noFollowupChange)errors.push({type:'v39200CheckFixNotProtected'})}catch(_){errors.push({type:'checkFixGateError'})}return {clean:errors.length===0,errors:errors}}
window.AlanRangFollowupMessageComposerReleaseV39240=Object.freeze({version:VERSION,semanticVersion:'39.24.0',versionCode:400600,baseline:'v39.23.0-followup-message-presets-final-locked',feature:'followup-message-composer',databaseImpact:'none',financialImpact:'none',checkImpact:'none',permissionImpact:'none',gate:gate});
})();
