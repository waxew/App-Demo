(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_QUICK_ACTIONS_V39210_STAGE1__)return;
window.__ALANRANG_FOLLOWUP_QUICK_ACTIONS_V39210_STAGE1__=true;
var VERSION='39.21.0-followup-quick-actions-stage1-engine-v01';
function txt(v){return String(v==null?'':v)}
function key(v){return txt(v)}
function arr(name){try{return window.data&&Array.isArray(data[name])?data[name]:[]}catch(_){return []}}
function asciiDigits(v){var m={'\u06f0':'0','\u06f1':'1','\u06f2':'2','\u06f3':'3','\u06f4':'4','\u06f5':'5','\u06f6':'6','\u06f7':'7','\u06f8':'8','\u06f9':'9','\u0660':'0','\u0661':'1','\u0662':'2','\u0663':'3','\u0664':'4','\u0665':'5','\u0666':'6','\u0667':'7','\u0668':'8','\u0669':'9'};return txt(v).replace(/[\u06f0-\u06f9\u0660-\u0669]/g,function(c){return m[c]||c})}
function normalizePhone(v){var s=asciiDigits(v).trim();if(!s)return '';var lead=s.charAt(0)==='+'?'+':'';s=s.replace(/[^0-9]/g,'');if(!s)return '';if(s.indexOf('00')===0){s=s.slice(2);lead='+'}return lead+s}
function validPhone(v){var s=normalizePhone(v);var digits=s.replace(/\D/g,'');return digits.length>=7&&digits.length<=15}
function customerById(cid){cid=key(cid);if(!cid)return null;var list=arr('customers');for(var i=0;i<list.length;i++){var c=list[i];if(c&&key(c.id)===cid)return {id:cid,name:txt(c.name),phone:txt(c.phone),source:c}}return null}
function contact(cid){var c=customerById(cid);if(!c)return {customerId:key(cid),exists:false,name:'',phone:'',normalizedPhone:'',canCall:false,canCopy:false};var p=normalizePhone(c.phone);var ok=validPhone(c.phone);return {customerId:c.id,exists:true,name:c.name,phone:c.phone,normalizedPhone:p,canCall:ok,canCopy:ok,source:c.source}}
function dialUri(cid){var c=contact(cid);return c.canCall?'tel:'+c.normalizedPhone:''}
function capabilities(){return {readsExistingCustomers:true,readOnlyContactLookup:true,normalizesPersianEnglishDigits:true,noDataMutation:true,noStorageWrite:true,noFinancialEffect:true,noSchemaChange:true}}
window.AlanRangFollowupQuickActionsV39210=Object.freeze({version:VERSION,asciiDigits:asciiDigits,normalizePhone:normalizePhone,validPhone:validPhone,customerById:customerById,contact:contact,dialUri:dialUri,capabilities:capabilities});
})();
