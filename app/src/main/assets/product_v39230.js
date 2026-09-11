(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_MESSAGE_PRESETS_V39230_STAGE1__)return;
window.__ALANRANG_FOLLOWUP_MESSAGE_PRESETS_V39230_STAGE1__=true;
var VERSION='39.23.0-followup-message-presets-stage1-engine-v01';
function txt(v){return String(v==null?'':v)}
function compact(v){return txt(v).replace(/\s+/g,' ').trim()}
function safeBase(cid){try{var e=window.AlanRangFollowupSharingV39220;return e&&e.buildMessage?e.buildMessage(cid):null}catch(_){return null}}
function compose(kind,name,promise){
  name=compact(name);promise=compact(promise);
  var hello=name?('سلام '+name+'، '):'سلام، ';
  var dateText=promise?('تاریخ '+promise):'پیگیری قبلی';
  if(kind==='short')return compact(hello+'یادآوری '+dateText+'. لطفاً نتیجه را اطلاع دهید. سپاس.');
  if(kind==='warm')return compact(hello+'وقت بخیر. برای '+dateText+' پیام دادم. ممنون می‌شوم نتیجه را اطلاع دهید.');
  return compact(hello+(promise?('یادآوری پیگیری شما برای تاریخ '+promise+'. '):'جهت پیگیری خدمتتان پیام می‌دهم. ')+'لطفاً در صورت امکان نتیجه را اطلاع دهید. با سپاس.');
}
function build(cid){
  var b=safeBase(cid);
  if(!b||!b.canMessage)return {customerId:txt(cid),available:false,reason:b&&b.reason||'baseUnavailable',templates:[]};
  var name=b.contact&&b.contact.name||'',promise=b.followup&&b.followup.promiseDate||'';
  var defs=[['formal','رسمی'],['short','کوتاه'],['warm','صمیمی محترمانه']];
  var list=defs.map(function(d){var m=compose(d[0],name,promise);if(m.length>280)m=m.slice(0,277)+'...';return {id:d[0],label:d[1],message:m,chars:m.length}});
  return {customerId:txt(cid),available:true,reason:'',templates:list};
}
function one(cid,id){var x=build(cid),idv=txt(id);for(var i=0;i<x.templates.length;i++)if(x.templates[i].id===idv)return x.templates[i];return null}
function capabilities(){return {wrapsStableV39220Availability:true,usesOnlyCustomerNameAndPromiseDate:true,threeFixedTemplates:true,maxMessageChars:280,noAutoSend:true,noDataMutation:true,noStorageWrite:true,noFinancialEffect:true,noCheckAccess:true,noSchemaChange:true}}
window.AlanRangFollowupMessagePresetsV39230=Object.freeze({version:VERSION,build:build,template:one,capabilities:capabilities});
})();
