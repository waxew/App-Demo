(function(){
'use strict';
if(window.__ALANRANG_INTEGRITY_V39150_STAGE1__)return;
window.__ALANRANG_INTEGRITY_V39150_STAGE1__=true;

var VERSION='39.15.0-integrity-stage1-scan-v01';
var CONTRACT='alanrang-integrity-scan-v1';
var CORE_COLLECTIONS=['customers','invoices','followups','executiveWorks','workReservations','invoiceAdjustments','accountAdjustments','recycleBin','auditLog'];
var SETTINGS_COLLECTIONS=['v37WorkshopPurchases','v37PurchaseInvoices'];

function txt(v){return String(v==null?'':v).trim()}
function n(v){var x=Number(v);return isFinite(x)?x:0}
function clone(v){try{return JSON.parse(JSON.stringify(v==null?null:v))}catch(_){return null}}
function dataRef(){try{return window.data&&typeof window.data==='object'?window.data:null}catch(_){return null}}
function storageGet(k){try{if(typeof alanRangStorageGetItem==='function')return alanRangStorageGetItem(k)}catch(_){}try{return window.localStorage&&localStorage.getItem(k)}catch(_){return null}}
function customerIds(d){var out={};(d&&Array.isArray(d.customers)?d.customers:[]).forEach(function(x){if(x&&txt(x.id))out[txt(x.id)]=1});return out}
function invoiceIds(d){var out={};(d&&Array.isArray(d.invoices)?d.invoices:[]).forEach(function(x){if(x&&txt(x.id))out[txt(x.id)]=1});return out}
function issue(type,severity,scope,message,detail,repairable){return {type:type,severity:severity,scope:scope,message:message,detail:detail||{},repairable:!!repairable}}
function checkCollection(d,key,scope,out){
  if(!d||!(key in d)||d[key]==null){out.push(issue('missingCollection','warning',scope,'مجموعه «'+key+'» وجود ندارد.',{key:key},true));return}
  if(!Array.isArray(d[key])){out.push(issue('invalidCollectionType','critical',scope,'ساختار «'+key+'» آرایه نیست و برای جلوگیری از حذف داده خودکار اصلاح نمی‌شود.',{key:key,actual:typeof d[key]},false));return}
  var seen={};d[key].forEach(function(row,index){if(!row||typeof row!=='object'){out.push(issue('invalidRow','warning',scope,'یک ردیف نامعتبر در «'+key+'» دیده شد.',{key:key,index:index},false));return}var id=txt(row.id);if(!id){out.push(issue('missingId','warning',scope,'یک ردیف بدون شناسه در «'+key+'» وجود دارد.',{key:key,index:index},false));return}if(seen[id])out.push(issue('duplicateId','critical',scope,'شناسه تکراری در «'+key+'» پیدا شد؛ اصلاح خودکار انجام نمی‌شود.',{key:key,id:id,firstIndex:seen[id]-1,index:index},false));else seen[id]=index+1})
}
function structuralIssues(d){
  var out=[];
  if(!d){out.push(issue('dataUnavailable','critical','core','داده اصلی برنامه در دسترس نیست.',{},false));return out}
  CORE_COLLECTIONS.forEach(function(k){checkCollection(d,k,'core',out)});
  if(!('settings' in d)||d.settings==null){out.push(issue('missingSettings','warning','settings','بخش تنظیمات ساختاری وجود ندارد.',{},true))}
  else if(typeof d.settings!=='object'||Array.isArray(d.settings)){out.push(issue('invalidSettingsType','critical','settings','ساختار settings معتبر نیست و خودکار جایگزین نمی‌شود.',{actual:typeof d.settings},false))}
  else SETTINGS_COLLECTIONS.forEach(function(k){checkCollection(d.settings,k,'settings',out)});
  return out
}
function relationIssues(d){
  var out=[],cids=customerIds(d),iids=invoiceIds(d);
  (d&&Array.isArray(d.invoices)?d.invoices:[]).forEach(function(x){if(x&&txt(x.customerId)&&!cids[txt(x.customerId)])out.push(issue('orphanInvoiceCustomer','critical','relations','فاکتور به مشتری موجود متصل نیست.',{invoiceId:txt(x.id),customerId:txt(x.customerId)},false))});
  ['followups','executiveWorks','workReservations'].forEach(function(k){(d&&Array.isArray(d[k])?d[k]:[]).forEach(function(x){if(x&&txt(x.customerId)&&!cids[txt(x.customerId)])out.push(issue('orphanCustomerReference','warning','relations','یک رکورد «'+k+'» به مشتری ناموجود اشاره می‌کند.',{collection:k,id:txt(x.id),customerId:txt(x.customerId)},false))})});
  ['invoiceAdjustments','accountAdjustments'].forEach(function(k){(d&&Array.isArray(d[k])?d[k]:[]).forEach(function(x){if(!x)return;if(txt(x.customerId)&&!cids[txt(x.customerId)])out.push(issue('orphanAdjustmentCustomer','critical','relations','سند اصلاحی به مشتری ناموجود متصل است.',{collection:k,id:txt(x.id),customerId:txt(x.customerId)},false));if(k==='invoiceAdjustments'&&txt(x.invoiceId)&&!iids[txt(x.invoiceId)])out.push(issue('orphanAdjustmentInvoice','critical','relations','اصلاح فاکتور به فاکتور ناموجود متصل است.',{id:txt(x.id),invoiceId:txt(x.invoiceId)},false))})});
  return out
}
function accountAudit(){try{var a=window.AlanRangCustomerAccountV39100;if(a&&typeof a.auditAll==='function'){var r=a.auditAll()||{};return {available:true,total:n(r.total),reconciled:n(r.reconciled),mismatched:clone(r.mismatched)||[]}}}catch(e){return {available:false,error:txt(e&&e.message)}}return {available:false}}
function checkAudit(){try{var a=window.AlanRangChecksV39120;if(a&&typeof a.audit==='function'){var r=a.audit()||{},raw=clone(r.warnings)||[],health=Array.isArray(r.healthWarnings)?(clone(r.healthWarnings)||[]):raw.filter(function(x){return !(x&&x.type==='statusDrift'&&x.shadowOnly)});return {available:true,clean:!!r.clean,errors:clone(r.errors)||[],warnings:health,technicalWarnings:raw,observations:clone(r.observations)||[],auditRevision:txt(r.auditRevision||a.auditRevision),summary:clone(r.summary)||{}}}}catch(e){return {available:false,error:txt(e&&e.message)}}return {available:false}}
function documentAudit(){try{var a=window.AlanRangDocumentsV39110;if(a&&typeof a.audit==='function'){var r=a.audit()||{};return {available:true,clean:!!r.clean,issues:clone(r.issues)||[],summary:clone(r.summary)||{}}}}catch(e){return {available:false,error:txt(e&&e.message)}}return {available:false}}
function backupMeta(){var raw=storageGet('ar_pro_backup_center_meta_v3990');if(!raw)return {available:false};try{var x=JSON.parse(raw);return {available:!!(x&&x.filename),filename:txt(x&&x.filename),createdAt:txt(x&&x.createdAt),version:txt(x&&x.version),encrypted:!!(x&&x.encrypted),location:txt(x&&x.location),stats:clone(x&&x.stats)||{}}}catch(_){return {available:false,invalid:true}}}
function translateExternal(accounts,checks,documents){
  var out=[];
  if(accounts.available){(accounts.mismatched||[]).forEach(function(x){out.push(issue('customerBalanceMismatch','critical','customerAccount','مانده ذخیره‌شده مشتری با موتور حساب جامع تطبیق ندارد.',{customerId:txt(x.customerId),delta:n(x.delta)},false))})}else out.push(issue('customerAccountAuditUnavailable','warning','customerAccount','ممیزی حساب مشتری در دسترس نیست.',{},false));
  if(checks.available){(checks.errors||[]).forEach(function(x){out.push(issue('checkAuditError','critical','checks','موتور چک خطای یکپارچگی گزارش کرده است.',{issue:clone(x)},false))});(checks.warnings||[]).forEach(function(x){out.push(issue('checkAuditWarning','warning','checks','موتور چک هشدار یکپارچگی گزارش کرده است.',{issue:clone(x)},false))})}else out.push(issue('checkAuditUnavailable','warning','checks','ممیزی چک‌ها در دسترس نیست.',{},false));
  if(documents.available){(documents.issues||[]).forEach(function(x){out.push(issue('documentAuditIssue','critical','documents','آرشیو اسناد مشکل مرجع یا هویت گزارش کرده است.',{issue:clone(x)},false))})}else out.push(issue('documentAuditUnavailable','warning','documents','ممیزی آرشیو اسناد در دسترس نیست.',{},false));
  return out
}
function counts(d){return {customers:d&&Array.isArray(d.customers)?d.customers.length:0,invoices:d&&Array.isArray(d.invoices)?d.invoices.length:0,followups:d&&Array.isArray(d.followups)?d.followups.length:0,works:d&&Array.isArray(d.executiveWorks)?d.executiveWorks.length:0,reservations:d&&Array.isArray(d.workReservations)?d.workReservations.length:0,invoiceAdjustments:d&&Array.isArray(d.invoiceAdjustments)?d.invoiceAdjustments.length:0,accountAdjustments:d&&Array.isArray(d.accountAdjustments)?d.accountAdjustments.length:0,recycleBin:d&&Array.isArray(d.recycleBin)?d.recycleBin.length:0}}
function scan(){
  var d=dataRef(),accounts=accountAudit(),checks=checkAudit(),documents=documentAudit(),backup=backupMeta();
  var issues=structuralIssues(d).concat(relationIssues(d)).concat(translateExternal(accounts,checks,documents));
  if(!backup.available)issues.push(issue('backupNotRegistered','warning','backup','آخرین پشتیبان موفق این دستگاه در مرکز پشتیبان ثبت نشده است.',{},false));
  else if(!backup.encrypted)issues.push(issue('backupNotEncrypted','warning','backup','آخرین پشتیبان ثبت‌شده رمزگذاری‌شده نیست.',{},false));
  var critical=issues.filter(function(x){return x.severity==='critical'}),warnings=issues.filter(function(x){return x.severity==='warning'}),repairable=issues.filter(function(x){return x.repairable});
  var c=counts(d);c.checks=n(checks&&checks.summary&&checks.summary.total);
  return {contractVersion:CONTRACT,engineVersion:VERSION,readOnly:true,generatedAt:new Date().toISOString(),summary:{critical:critical.length,warnings:warnings.length,totalIssues:issues.length,repairable:repairable.length,healthy:issues.length===0},counts:c,issues:issues,accounts:accounts,checks:checks,documents:documents,backup:backup,capabilities:capabilities()}
}
function capabilities(){return {readOnlyScan:true,automaticFinancialRepair:false,automaticReferenceRepair:false,safeStructuralRepairTypes:['missingCollection','missingSettings'],requiresExplicitRepair:true,requiresPostRepairRescan:true,rollbackRequired:true}}
window.AlanRangIntegrityV39150={version:VERSION,contractVersion:CONTRACT,readOnly:true,scan:scan,capabilities:capabilities,structuralIssues:structuralIssues,relationIssues:relationIssues};
})();
