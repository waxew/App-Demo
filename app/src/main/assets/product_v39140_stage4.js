(function(){
'use strict';
if(window.__ALANRANG_ANALYTICS_V39140_STAGE4__)return;
window.__ALANRANG_ANALYTICS_V39140_STAGE4__=true;
var VERSION='39.14.0-analytics-stage4-workspace-v01';
var PERIODS=[3,6,12],period=6,last=null;
function setPeriod(v){v=Number(v);if(PERIODS.indexOf(v)<0)return false;period=v;last=null;return true}
function getPeriod(){return period}
function snapshot(force){var api=window.AlanRangBusinessAnalyticsV39140;if(!api||typeof api.build!=='function')return null;if(force||!last)last=api.build({trendMonths:period});return last}
function clearCache(){last=null;return true}
function integrity(){var s=snapshot(false);return s&&s.audit?s.audit:{clean:false,errors:[{type:'analyticsUnavailable'}],warnings:[]}}
try{if(typeof registerAlanRangAfterSave==='function')registerAlanRangAfterSave('v39140-analytics-cache',clearCache)}catch(_){}
window.AlanRangBusinessAnalyticsWorkspaceV39140={version:VERSION,readOnly:true,metadataOnly:true,periods:PERIODS.slice(),setPeriod:setPeriod,getPeriod:getPeriod,snapshot:snapshot,clearCache:clearCache,integrity:integrity};
})();
