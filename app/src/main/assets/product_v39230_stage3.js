(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_MESSAGE_PRESETS_V39230_STAGE3__)return;
window.__ALANRANG_FOLLOWUP_MESSAGE_PRESETS_V39230_STAGE3__=true;
var VERSION='39.23.0-followup-message-presets-stage3-policy-v01';
var ALLOWED=Object.freeze(['formal','short','warm']);
function allowed(id){return ALLOWED.indexOf(String(id||''))>=0}
function availability(cid){try{var e=window.AlanRangFollowupMessagePresetsV39230,x=e&&e.build?e.build(cid):null;return {available:!!(x&&x.available),templates:x&&x.templates?x.templates.length:0}}catch(_){return {available:false,templates:0}}}
function capabilities(){return {allowedTemplateIds:ALLOWED.slice(),deterministicTemplates:true,sessionOnly:true,noSetInterval:true,noBackgroundService:true,noNotification:true,noPermissionRequest:true,noStorageWrite:true,noFinancialEffect:true,noCheckMutation:true}}
window.AlanRangFollowupMessagePresetsPolicyV39230=Object.freeze({version:VERSION,allowed:allowed,availability:availability,capabilities:capabilities});
})();
