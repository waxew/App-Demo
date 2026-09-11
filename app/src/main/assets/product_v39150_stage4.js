(function(){
'use strict';
if(window.__ALANRANG_INTEGRITY_V39150_STAGE4__)return;
window.__ALANRANG_INTEGRITY_V39150_STAGE4__=true;
var VERSION='39.15.0-integrity-stage4-diagnostics-v01';
var KEY='ar39150_integrity_history_v1',MAX=20;
function get(k){try{if(typeof alanRangStorageGetItem==='function')return alanRangStorageGetItem(k)}catch(_){}try{return localStorage.getItem(k)}catch(_){return null}}
function set(k,v){try{if(typeof alanRangStorageSetItem==='function'){alanRangStorageSetItem(k,v);return true}}catch(_){}try{localStorage.setItem(k,v);return true}catch(_){return false}}
function list(){try{var a=JSON.parse(get(KEY)||'[]');return Array.isArray(a)?a:[]}catch(_){return []}}
function typeCounts(rows){var out={};(rows||[]).forEach(function(x){var t=String(x&&x.type||'unknown');out[t]=(out[t]||0)+1});return out}
function compact(s){var types={},checks=s&&s.checks||{};(s&&s.issues||[]).forEach(function(x){var key=x.type;if((x.type==='checkAuditWarning'||x.type==='checkAuditError')&&x.detail&&x.detail.issue&&x.detail.issue.type)key=x.type+':'+x.detail.issue.type;types[key]=(types[key]||0)+1});return {at:new Date().toISOString(),summary:s&&s.summary||{},counts:s&&s.counts||{},issueTypes:types,checkAudit:{errorTypes:typeCounts(checks.errors),healthWarningTypes:typeCounts(checks.warnings),technicalWarningTypes:typeCounts(checks.technicalWarnings),observationTypes:typeCounts(checks.observations),auditRevision:String(checks.auditRevision||'')},backup:{available:!!(s&&s.backup&&s.backup.available),encrypted:!!(s&&s.backup&&s.backup.encrypted),version:String(s&&s.backup&&s.backup.version||'')},engines:{integrity:String(s&&s.engineVersion||''),customerAccount:String(window.AlanRangCustomerAccountV39100&&AlanRangCustomerAccountV39100.version||''),checks:String(window.AlanRangChecksV39120&&AlanRangChecksV39120.version||''),checksAuditRevision:String(window.AlanRangChecksV39120&&AlanRangChecksV39120.auditRevision||''),documents:String(window.AlanRangDocumentsV39110&&AlanRangDocumentsV39110.version||'')}}}
function record(s){if(!s)return false;var a=list();a.unshift(compact(s));a=a.slice(0,MAX);return set(KEY,JSON.stringify(a))}
function scanAndRecord(){var api=window.AlanRangIntegrityV39150,s=api&&api.scan?api.scan():null;if(s)record(s);return s}
function diagnostics(){var api=window.AlanRangIntegrityV39150,s=api&&api.scan?api.scan():null;if(!s)return null;return {app:'AlanRang Pro',format:'ALANRANG_INTEGRITY_DIAGNOSTICS_V1',createdAt:new Date().toISOString(),readOnly:true,privacy:'metadata-only-no-customer-names-no-financial-rows',current:compact(s),history:list()}}
function exportDiagnostics(){var d=diagnostics();if(!d)return false;var text=JSON.stringify(d,null,2),blob=new Blob([text],{type:'application/json;charset=utf-8'}),name='AlanRang_Integrity_Diagnostics_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';try{if(typeof downloadBlob==='function'){downloadBlob(blob,name);return true}}catch(_){}try{var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(u)},500);return true}catch(_){return false}}
window.AlanRangIntegrityWorkspaceV39150={version:VERSION,metadataOnly:true,historyKey:KEY,maxHistory:MAX,list:list,record:record,scanAndRecord:scanAndRecord,diagnostics:diagnostics,exportDiagnostics:exportDiagnostics};
try{setTimeout(function(){var a=window.AlanRangIntegrityV39150;if(a&&a.scan)record(a.scan())},800)}catch(_){}
})();
