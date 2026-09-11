(function(){
'use strict';
if(window.__ALANRANG_LONGTERM_V39370__)return;
window.__ALANRANG_LONGTERM_V39370__=true;
var VERSION='39.37.0-deep-integrity-readonly-v01',SUPPORTED_SCHEMA=3985;
function txt(v){return String(v==null?'':v)}
function issue(type,severity,scope,message,detail){return {type:type,severity:severity,scope:scope,message:message,detail:detail||{},repairable:false}}
function byteLen(v){try{return new TextEncoder().encode(String(v||'')).length}catch(_){return unescape(encodeURIComponent(String(v||''))).length}}
function scan(){
  var base={summary:{critical:0,warnings:0,totalIssues:0,healthy:true},issues:[]};
  try{if(window.AlanRangIntegrityV39150&&typeof window.AlanRangIntegrityV39150.scan==='function')base=window.AlanRangIntegrityV39150.scan()||base}catch(e){base.issues=[issue('baseIntegrityUnavailable','warning','integrity','موتور یکپارچگی پایه در دسترس نبود.',{error:txt(e&&e.message)})]}
  var extras=[],observations=[],d=window.data&&typeof data==='object'?data:null;
  if(!d)extras.push(issue('coreUnavailable','critical','core','داده اصلی برنامه در دسترس نیست.'));
  else{
    var schema=Number(d.schemaVersion||0);if(schema!==SUPPORTED_SCHEMA)extras.push(issue('unexpectedSchema','critical','schema','نسخه ساختار داده با نسخه مورد انتظار این انتشار تطبیق ندارد.',{actual:schema,expected:SUPPORTED_SCHEMA}));
    var cids={},iids={};(Array.isArray(d.customers)?d.customers:[]).forEach(function(c){if(c&&c.id)cids[String(c.id)]=1});(Array.isArray(d.invoices)?d.invoices:[]).forEach(function(inv){if(inv&&inv.id)iids[String(inv.id)]=1;var seen={};(Array.isArray(inv&&inv.payments)?inv.payments:[]).forEach(function(p){if(!p||!p.id)return;var id=String(p.id);if(seen[id])extras.push(issue('duplicatePaymentId','critical','payments','شناسه دریافت تکراری داخل یک فاکتور پیدا شد.',{invoiceId:String(inv.id||''),paymentId:id}));seen[id]=1})});
    try{(typeof readFinanceTransactions==='function'?readFinanceTransactions():[]).forEach(function(tx){if(!tx)return;if(tx.customerId&&!cids[String(tx.customerId)])extras.push(issue('orphanFinanceCustomer','warning','finance','یک رکورد مالی به مشتری ناموجود اشاره می‌کند.',{transactionId:String(tx.id||''),customerId:String(tx.customerId)}));if(tx.invoiceId&&!iids[String(tx.invoiceId)])extras.push(issue('orphanFinanceInvoice','warning','finance','یک رکورد مالی به فاکتور ناموجود اشاره می‌کند.',{transactionId:String(tx.id||''),invoiceId:String(tx.invoiceId)}))})}catch(_){extras.push(issue('financeScanUnavailable','warning','finance','کنترل ارجاعات دفتر مالی انجام نشد.'))}
    var checkpoints={};(Array.isArray(d.customers)?d.customers:[]).forEach(function(c){var cp=c&&c.historyArchiveCheckpoint;if(!cp)return;var h=String(cp.archiveSha256||'');if(!/^[0-9a-f]{64}$/i.test(h))extras.push(issue('archiveCheckpointHashInvalid','critical','archive','Checkpoint آرشیو مشتری هش معتبر ندارد.',{customerId:String(c.id||'')}));if(h&&checkpoints[h])extras.push(issue('archiveCheckpointDuplicate','warning','archive','یک هش آرشیو برای بیش از یک مشتری ثبت شده است.',{customerId:String(c.id||''),otherCustomerId:checkpoints[h]}));if(h)checkpoints[h]=String(c.id||'')});
    var coreBytes=byteLen(JSON.stringify(d));observations.push({type:'coreStorageSize',bytes:coreBytes});if(coreBytes>25*1024*1024)extras.push(issue('coreStorageLarge','warning','storage','حجم داده فعال زیاد شده است؛ برای مشتری‌های کاملاً تسویه‌شده آرشیو پایان سال را بررسی کن.',{bytes:coreBytes}));
  }
  try{var ms=window.AlanRangLongTerm&&window.AlanRangLongTerm.migrationStatus?window.AlanRangLongTerm.migrationStatus():null;if(ms&&ms.failed)extras.push(issue('migrationFailures','critical','migration','Ledger مهاجرت شامل اجرای ناموفق است.',{count:ms.failed}));if(ms&&ms.incomplete)extras.push(issue('migrationIncomplete','critical','migration','Ledger مهاجرت شامل اجرای ناتمام است.',{count:ms.incomplete}))}catch(_){ }
  try{var bs=window.AlanRangLongTerm&&window.AlanRangLongTerm.backupSummary?window.AlanRangLongTerm.backupSummary():null;if(bs&&bs.count===0)extras.push(issue('noLongTermVerifiedBackup','warning','backup','هنوز پشتیبان چندنسلی تأییدشده ساخته نشده است.'));else if(bs&&!bs.verifiedOnly)extras.push(issue('backupCatalogVerificationMissing','warning','backup','یکی از رکوردهای کاتالوگ پشتیبان فاقد علامت Read-back verification است.'))}catch(_){ }
  var all=(Array.isArray(base.issues)?base.issues:[]).concat(extras),critical=all.filter(function(x){return x.severity==='critical'}),warnings=all.filter(function(x){return x.severity==='warning'});
  return {version:VERSION,readOnly:true,automaticFinancialRepair:false,generatedAt:new Date().toISOString(),base:base,issues:all,extraIssues:extras,observations:observations,summary:{critical:critical.length,warnings:warnings.length,totalIssues:all.length,healthy:all.length===0}};
}
window.AlanRangLongTerm=window.AlanRangLongTerm||{};
window.AlanRangLongTerm.version39370=VERSION;window.AlanRangLongTerm.deepIntegrityScan=scan;
window.AlanRangLongTermV39370={version:VERSION,scan:scan,readOnly:true};
})();
