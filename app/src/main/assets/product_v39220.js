(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_SHARING_V39220_STAGE1__)return;
window.__ALANRANG_FOLLOWUP_SHARING_V39220_STAGE1__=true;
var VERSION='39.22.0-followup-sharing-stage1-engine-v01';
function txt(v){return String(v==null?'':v)}
function key(v){return txt(v)}
function contact(cid){try{var e=window.AlanRangFollowupQuickActionsV39210;return e&&e.contact?e.contact(cid):null}catch(_){return null}}
function latest(cid){try{var e=window.AlanRangFollowupV39170,s=e&&e.snapshot?e.snapshot():null,list=s&&Array.isArray(s.rows)?s.rows:[];cid=key(cid);for(var i=0;i<list.length;i++){var r=list[i];if(r&&key(r.customerId)===cid)return r}}catch(_){ }return null}
function compact(v){return txt(v).replace(/\s+/g,' ').trim()}
function buildMessage(cid){
  var c=contact(cid),r=latest(cid);
  if(!c||!c.exists)return {customerId:key(cid),canMessage:false,reason:'customerMissing',message:'',smsUri:'',contact:c||null,followup:r||null};
  if(!c.canCall)return {customerId:key(cid),canMessage:false,reason:'phoneMissingOrInvalid',message:'',smsUri:'',contact:c,followup:r||null};
  if(!r||r.kind==='settled')return {customerId:key(cid),canMessage:false,reason:'noOpenFollowup',message:'',smsUri:'',contact:c,followup:r||null};
  var name=compact(c.name),promise=compact(r.promiseDate),greeting=name?('سلام '+name+'، '):'سلام، ';
  var body=promise?(greeting+'یادآوری پیگیری شما برای تاریخ '+promise+'. لطفاً در صورت امکان نتیجه را اطلاع دهید. با سپاس.'):(greeting+'جهت پیگیری خدمتتان پیام می‌دهم. لطفاً در صورت امکان نتیجه را اطلاع دهید. با سپاس.');
  body=compact(body);if(body.length>280)body=body.slice(0,277)+'...';
  var phone=c.normalizedPhone||c.phone||'';
  var uri='sms:'+phone+'?body='+encodeURIComponent(body);
  return {customerId:key(cid),canMessage:true,reason:'',message:body,smsUri:uri,contact:c,followup:{id:key(r.id),status:txt(r.status),promiseDate:txt(r.promiseDate),kind:txt(r.kind)}};
}
function message(cid){return buildMessage(cid).message}
function smsUri(cid){return buildMessage(cid).smsUri}
function capabilities(){return {readsExistingCustomers:true,readsLatestFollowupReadOnly:true,reusesV39210PhoneNormalization:true,messageExcludesFinancialFields:true,messageExcludesInternalNotes:true,noAutoSend:true,noDataMutation:true,noStorageWrite:true,noFinancialEffect:true,noCheckAccess:true,noSchemaChange:true}}
window.AlanRangFollowupSharingV39220=Object.freeze({version:VERSION,buildMessage:buildMessage,message:message,smsUri:smsUri,capabilities:capabilities});
})();
