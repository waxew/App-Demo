(function(){
'use strict';
if(window.__ALANRANG_ANALYTICS_V39140_STAGE5__)return;
window.__ALANRANG_ANALYTICS_V39140_STAGE5__=true;
var VERSION='39.14.0-analytics-stage5-release-v01';
var REQUIRED=[
 ['AlanRangBusinessAnalyticsV39140','39.14.0-analytics-stage1-contract-v01'],
 ['AlanRangBusinessDashboardUIV39140','39.14.0-analytics-stage2-dashboard-ui-v01'],
 ['AlanRangBusinessInsightsV39140','39.14.0-analytics-stage3-insights-v01'],
 ['AlanRangBusinessAnalyticsWorkspaceV39140','39.14.0-analytics-stage4-workspace-v01']
];
function gate(){var errors=[];REQUIRED.forEach(function(x){var api=window[x[0]];if(!api)errors.push({type:'missingModule',module:x[0]});else if(String(api.version)!==x[1])errors.push({type:'versionMismatch',module:x[0],expected:x[1],actual:String(api.version||'')})});var core=window.AlanRangBusinessAnalyticsV39140;if(core&&typeof core.capabilities==='function'){var c=core.capabilities();if(!c.readOnly||c.financialWrites||c.storageWrites||c.sourceMutation)errors.push({type:'readOnlyContractViolation'})}return {clean:errors.length===0,errors:errors}}
window.AlanRangBusinessAnalyticsReleaseV39140=Object.freeze({version:VERSION,semanticVersion:'39.14.0',versionCode:399600,baseline:'v39.13.0-final-locked',feature:'business-dashboard-analytics',readOnly:true,gate:gate});
})();
