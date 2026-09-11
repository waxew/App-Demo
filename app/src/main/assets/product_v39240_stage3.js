(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_MESSAGE_COMPOSER_V39240_STAGE3__)return;
window.__ALANRANG_FOLLOWUP_MESSAGE_COMPOSER_V39240_STAGE3__=true;
var VERSION='39.24.0-followup-message-composer-stage3-policy-v01';
var ALLOWED=Object.freeze(['formal','short','warm']);
function allowed(id){return ALLOWED.indexOf(String(id||''))>=0}
function inspect(text){try{var e=window.AlanRangFollowupMessageComposerV39240,n=e&&e.normalize?e.normalize(text):{text:'',chars:0,maxChars:500,valid:false};return {valid:!!n.valid,chars:n.chars,maxChars:n.maxChars,trimmed:n.text}}catch(_){return {valid:false,chars:0,maxChars:500,trimmed:''}}}
function capabilities(){return {allowedTemplateIds:ALLOWED.slice(),userEditableDraft:true,sessionOnly:true,noSetInterval:true,noBackgroundService:true,noNotification:true,noPermissionRequest:true,noStorageWrite:true,noFinancialEffect:true,noCheckMutation:true}}
window.AlanRangFollowupMessageComposerPolicyV39240=Object.freeze({version:VERSION,allowed:allowed,inspect:inspect,capabilities:capabilities});
})();
