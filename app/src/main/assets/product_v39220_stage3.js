(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_SHARING_V39220_STAGE3__)return;
window.__ALANRANG_FOLLOWUP_SHARING_V39220_STAGE3__=true;
var VERSION='39.22.0-followup-sharing-stage3-policy-v01';
function availability(cid){var e=window.AlanRangFollowupSharingV39220,i=e&&e.buildMessage?e.buildMessage(cid):{canMessage:false,message:'',reason:'engineMissing'};return {customerId:String(cid==null?'':cid),sms:!!i.canMessage,copyMessage:!!i.canMessage,reason:String(i.reason||''),messageChars:String(i.message||'').length}}
function capabilities(){return {deterministicAvailability:true,maxMessageChars:280,sessionOnly:true,noTimer:true,noBackgroundService:true,noNotification:true,noPermissionRequest:true,noStorageWrite:true,noFinancialEffect:true,noCheckMutation:true}}
window.AlanRangFollowupSharingPolicyV39220=Object.freeze({version:VERSION,availability:availability,capabilities:capabilities});
})();
