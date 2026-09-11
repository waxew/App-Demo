(function(){
'use strict';
if(window.__ALANRANG_INTEGRITY_V39150_STAGE3__)return;
window.__ALANRANG_INTEGRITY_V39150_STAGE3__=true;
var VERSION='39.15.0-integrity-stage3-safe-recovery-v01';
var SNAPSHOT_KEY='ar39150_last_repair_snapshot_v1';
function txt(v){return String(v==null?'':v).trim()}
function getStore(k){try{if(typeof alanRangStorageGetItem==='function')return alanRangStorageGetItem(k)}catch(_){}try{return localStorage.getItem(k)}catch(_){return null}}
function setStore(k,v){try{if(typeof alanRangStorageSetItem==='function'){alanRangStorageSetItem(k,v);return true}}catch(_){}try{localStorage.setItem(k,v);return true}catch(_){return false}}
function removeStore(k){try{if(typeof alanRangStorageRemoveItem==='function'){alanRangStorageRemoveItem(k);return true}}catch(_){}try{localStorage.removeItem(k);return true}catch(_){return false}}
function scan(){var a=window.AlanRangIntegrityV39150;return a&&typeof a.scan==='function'?a.scan():null}
function plan(){var s=scan(),actions=[],seen={};function add(a){var k=a.path.join('.');if(seen[k])return;seen[k]=1;actions.push(a)}(s&&s.issues||[]).forEach(function(x){if(!x||!x.repairable)return;if(x.type==='missingSettings'){add({type:'createObject',path:['settings'],issueType:x.type});add({type:'createArray',path:['settings','v37WorkshopPurchases'],issueType:'missingCollection'});add({type:'createArray',path:['settings','v37PurchaseInvoices'],issueType:'missingCollection'})}else if(x.type==='missingCollection'){var k=txt(x.detail&&x.detail.key);if(!k)return;add({type:'createArray',path:x.scope==='settings'?['settings',k]:[k],issueType:x.type})}});return {version:VERSION,scanSummary:s&&s.summary||{},actions:actions,blockedIssues:(s&&s.issues||[]).filter(function(x){return !x.repairable})}}
function readPath(root,path){var cur=root;for(var i=0;i<path.length;i++){if(cur==null||typeof cur!=='object'||!(path[i] in cur))return {exists:false};cur=cur[path[i]]}return {exists:true,value:cur}}
function ensureParent(root,path){var cur=root;for(var i=0;i<path.length-1;i++){var k=path[i];if(cur[k]==null)cur[k]={};if(typeof cur[k]!=='object'||Array.isArray(cur[k]))throw new Error('unsafe-parent:'+k);cur=cur[k]}return cur}
function snapshotActions(actions){var d=window.data;if(!d||typeof d!=='object')throw new Error('data-unavailable');return {version:1,createdAt:new Date().toISOString(),actions:actions.map(function(a){var r=readPath(d,a.path);return {path:a.path.slice(),beforeExists:r.exists,before:r.exists?r.value:null,actionType:a.type}})}}
function restoreSnapshot(snap){var d=window.data;if(!d||typeof d!=='object'||!snap||!Array.isArray(snap.actions))return false;snap.actions.slice().reverse().forEach(function(x){var p=x.path||[],parent=ensureParent(d,p),key=p[p.length-1];if(x.beforeExists)parent[key]=x.before;else delete parent[key]});try{if(typeof saveData==='function')saveData()}catch(e){return false}return true}
function criticalCount(s){return Number(s&&s.summary&&s.summary.critical||0)}
function financialFingerprint(s){return {accountMismatch:s&&s.accounts&&s.accounts.mismatched?s.accounts.mismatched.length:0,checkErrors:s&&s.checks&&s.checks.errors?s.checks.errors.length:0,documentIssues:s&&s.documents&&s.documents.issues?s.documents.issues.length:0}}
function sameFinancial(a,b){return a.accountMismatch===b.accountMismatch&&a.checkErrors===b.checkErrors&&a.documentIssues===b.documentIssues}
function applySafeRepairs(){
  var p=plan();if(!p.actions.length)return {ok:false,noOp:true,message:'مورد ساختاری قابل اصلاح امن وجود ندارد.'};
  var d=window.data;if(!d||typeof d!=='object')return {ok:false,message:'داده اصلی برنامه در دسترس نیست.'};
  var before=scan(),fp=financialFingerprint(before),snap;
  try{snap=snapshotActions(p.actions);if(!setStore(SNAPSHOT_KEY,JSON.stringify(snap)))return {ok:false,message:'ذخیره Snapshot بازگشت انجام نشد.'};p.actions.forEach(function(a){var r=readPath(d,a.path);if(r.exists&&r.value!=null)throw new Error('target-already-exists');var parent=ensureParent(d,a.path),key=a.path[a.path.length-1];parent[key]=a.type==='createArray'?[]:{}});if(typeof saveData!=='function')throw new Error('save-unavailable');saveData();var after=scan();if(criticalCount(after)>criticalCount(before)||!sameFinancial(fp,financialFingerprint(after))){restoreSnapshot(snap);return {ok:false,rolledBack:true,message:'پس از اصلاح، کنترل مالی/یکپارچگی بهتر نشد؛ تغییرات بازگردانی شد.'}}return {ok:true,applied:p.actions.length,before:before.summary,after:after.summary}
  }catch(e){try{if(snap)restoreSnapshot(snap)}catch(_){}return {ok:false,rolledBack:!!snap,message:'اصلاح متوقف شد: '+txt(e&&e.message)}}
}
function rollbackLast(){var raw=getStore(SNAPSHOT_KEY);if(!raw)return {ok:false,message:'Snapshot اصلاح قبلی پیدا نشد.'};try{var snap=JSON.parse(raw);if(!restoreSnapshot(snap))return {ok:false,message:'بازگردانی Snapshot انجام نشد.'};removeStore(SNAPSHOT_KEY);return {ok:true}}catch(e){return {ok:false,message:'Snapshot معتبر نیست.'}}}
function capabilities(){return {explicitOnly:true,snapshotBeforeRepair:true,rollback:true,postRepairRescan:true,financialAutoFix:false,duplicateAutoFix:false,orphanAutoFix:false,balanceAutoFix:false,checkAutoFix:false}}
window.AlanRangRecoveryV39150={version:VERSION,snapshotKey:SNAPSHOT_KEY,plan:plan,applySafeRepairs:applySafeRepairs,rollbackLast:rollbackLast,capabilities:capabilities};
})();
