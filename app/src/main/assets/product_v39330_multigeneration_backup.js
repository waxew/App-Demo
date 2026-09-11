(function(){
'use strict';
if(window.__ALANRANG_LONGTERM_V39330__)return;
window.__ALANRANG_LONGTERM_V39330__=true;
var VERSION='39.33.0-multigeneration-backup-v02';
var CATALOG_KEY='alanrang_longterm_backup_catalog_v1';
var MAX_GENERATIONS=10;
function parse(v,d){try{var x=JSON.parse(String(v==null?'':v));return x==null?d:x}catch(_){return d}}
function storageGet(k){try{return typeof alanRangStorageGetItem==='function'?alanRangStorageGetItem(k):localStorage.getItem(k)}catch(_){return null}}
function storageSet(k,v){try{if(typeof alanRangStorageSetItem==='function'){alanRangStorageSetItem(k,v);return true}localStorage.setItem(k,v);return true}catch(_){return false}}
function bridge(){try{return window.AlanRangAndroid||window.AndroidAlanRangBackup||null}catch(_){return null}}
function nowTag(){var d=new Date(),p=function(x){return String(x).padStart(2,'0')};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'_'+p(d.getHours())+'-'+p(d.getMinutes())+'-'+p(d.getSeconds())+'_'+String(d.getMilliseconds()).padStart(3,'0')}
function byteLen(s){s=String(s==null?'':s);try{return new TextEncoder().encode(s).length}catch(_){return unescape(encodeURIComponent(s)).length}}
function catalog(){var a=parse(storageGet(CATALOG_KEY),'');if(!Array.isArray(a))a=[];return a.slice(0,MAX_GENERATIONS)}
function saveCatalog(rows){rows=(Array.isArray(rows)?rows:[]).slice().sort(function(a,b){return String(b.createdAt||'').localeCompare(String(a.createdAt||''))}).slice(0,MAX_GENERATIONS);return storageSet(CATALOG_KEY,JSON.stringify(rows))}
function counts(){try{return typeof backupStatsFromPayload==='function'?backupStatsFromPayload({coreData:data,auxStorage:typeof collectAlanRangAuxStorage==='function'?collectAlanRangAuxStorage():{}}):{}}catch(_){return {}}}
async function createVerifiedBackup(options){
  options=options||{};
  var b=bridge();
  if(!b||typeof b.saveBackupFile!=='function')return {ok:false,message:'پل ذخیره پشتیبان آلان‌رنگ در دسترس نیست.'};
  if(typeof createBackupObject!=='function'||typeof encryptBackupForStorage!=='function'||typeof digestText!=='function')return {ok:false,message:'موتور پشتیبان آماده نیست.'};
  var backup=await createBackupObject();
  var plain=JSON.stringify(backup);
  var encrypted=await encryptBackupForStorage(plain);
  if(!encrypted)return {ok:false,cancelled:true,message:'ساخت پشتیبان لغو شد یا رمز پشتیبان آماده نیست.'};
  var digest=await digestText(encrypted,'SHA-256');
  if(!digest||digest.algorithm!=='SHA-256'||!/^[0-9a-f]{64}$/i.test(digest.digest||''))return {ok:false,message:'SHA-256 پشتیبان قابل محاسبه نیست.'};
  var filename='AlanRang_LTBackup_'+nowTag()+'.alr';
  // saveBackupFile in the locked native shell writes with fsync/pending semantics and
  // performs a byte-for-byte read-back before reporting success.
  var saved=false;try{saved=!!b.saveBackupFile(filename,encrypted)}catch(_){saved=false}
  if(!saved)return {ok:false,message:'ذخیره و Read-back پشتیبان تأیید نشد.'};
  var entry={filename:filename,createdAt:new Date().toISOString(),sha256:String(digest.digest).toLowerCase(),bytes:byteLen(encrypted),location:'Documents/AlanRang/Backups',readBackVerified:true,appVersion:String(window.ALANRANG_APP_VERSION||''),runtimeBuildId:String(window.ALANRANG_RUNTIME_BUILD_ID||''),reason:String(options.reason||'manual'),stats:backup.stats||counts()};
  var rows=catalog().filter(function(x){return x&&x.filename!==entry.filename});rows.unshift(entry);saveCatalog(rows);
  return {ok:true,entry:entry,encrypted:encrypted,backup:backup,sha256:entry.sha256,filename:entry.filename,message:'پشتیبان رمزگذاری‌شده ذخیره و Read-back شد.'};
}
function summary(){var rows=catalog();return {version:VERSION,maxGenerations:MAX_GENERATIONS,count:rows.length,latest:rows[0]||null,rows:rows,verifiedOnly:rows.every(function(x){return !!(x&&x.readBackVerified&&/^[0-9a-f]{64}$/i.test(x.sha256||''))}),physicalRetentionPolicy:'never-auto-delete',note:'کاتالوگ ۱۰ نسل آخر را نگه می‌دارد؛ فایل‌های قدیمی‌تر برای ایمنی به‌صورت خودکار حذف نمی‌شوند.'}}
window.AlanRangLongTerm=window.AlanRangLongTerm||{};
Object.assign(window.AlanRangLongTerm,{version39330:VERSION,backupCatalogKey:CATALOG_KEY,maxBackupGenerations:MAX_GENERATIONS,backupCatalog:catalog,backupSummary:summary,createVerifiedBackup:createVerifiedBackup});
window.AlanRangLongTermV39330={version:VERSION,catalog:catalog,summary:summary,createVerifiedBackup:createVerifiedBackup};
})();
