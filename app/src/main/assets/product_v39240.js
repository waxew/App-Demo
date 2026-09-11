(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_MESSAGE_COMPOSER_V39240_STAGE1__)return;
window.__ALANRANG_FOLLOWUP_MESSAGE_COMPOSER_V39240_STAGE1__=true;
var VERSION='39.24.0-followup-message-composer-stage1-engine-v01';
var MAX_CHARS=500;
function txt(v){return String(v==null?'':v)}
function clean(v){return txt(v).replace(/\r\n/g,'\n').replace(/\r/g,'\n').trim()}
function presets(cid){try{var e=window.AlanRangFollowupMessagePresetsV39230;return e&&e.build?e.build(cid):null}catch(_){return null}}
function build(cid,kind){
  var p=presets(cid),id=txt(kind||'formal');
  if(!p||!p.available)return {customerId:txt(cid),available:false,reason:p&&p.reason||'presetsUnavailable',templateId:id,text:'',maxChars:MAX_CHARS};
  var selected=null;
  for(var i=0;i<p.templates.length;i++)if(p.templates[i].id===id){selected=p.templates[i];break}
  if(!selected&&p.templates.length)selected=p.templates[0];
  if(!selected)return {customerId:txt(cid),available:false,reason:'templateUnavailable',templateId:id,text:'',maxChars:MAX_CHARS};
  var value=clean(selected.message);if(value.length>MAX_CHARS)value=value.slice(0,MAX_CHARS);
  return {customerId:txt(cid),available:true,reason:'',templateId:selected.id,label:selected.label,text:value,maxChars:MAX_CHARS,chars:value.length};
}
function normalize(value){var x=clean(value);if(x.length>MAX_CHARS)x=x.slice(0,MAX_CHARS);return {text:x,chars:x.length,maxChars:MAX_CHARS,valid:x.length>0}}
function capabilities(){return {wrapsV39230Presets:true,editableSessionDraft:true,maxDraftChars:MAX_CHARS,noAutoSend:true,noDataMutation:true,noStorageWrite:true,noFinancialEffect:true,noCheckAccess:true,noSchemaChange:true}}
window.AlanRangFollowupMessageComposerV39240=Object.freeze({version:VERSION,build:build,normalize:normalize,maxChars:MAX_CHARS,capabilities:capabilities});
})();
