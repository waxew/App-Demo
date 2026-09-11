(function(){
'use strict';
if(window.__ALANRANG_LONGTERM_V39380__)return;
window.__ALANRANG_LONGTERM_V39380__=true;
var VERSION='39.38.0-portable-readable-export-v02';
function val(v){if(v==null)return '';if(typeof v==='object')return JSON.stringify(v);return String(v)}
function csvCell(v){return '"'+val(v).replace(/"/g,'""').replace(/\r?\n/g,' ')+ '"'}
function csv(headers,rows){return '\ufeff'+headers.map(csvCell).join(',')+'\r\n'+rows.map(function(r){return headers.map(function(h){return csvCell(r[h])}).join(',')}).join('\r\n')+'\r\n'}
function tag(){var d=new Date(),p=function(x){return String(x).padStart(2,'0')};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'_'+p(d.getHours())+'-'+p(d.getMinutes())+'-'+p(d.getSeconds())}
function safeRows(x){return Array.isArray(x)?x:[]}
function customerName(id){var c=safeRows(data&&data.customers).find(function(x){return x&&String(x.id)===String(id)});return c&&c.name||''}
function bridge(){try{return window.AlanRangAndroid||window.AndroidAlanRangBackup||null}catch(_){return null}}
function utf8b64(text){var s=String(text==null?'':text);try{var bytes=new TextEncoder().encode(s),out='',chunk=0x4000;for(var i=0;i<bytes.length;i+=chunk)out+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+chunk,bytes.length)));return btoa(out)}catch(_){try{return btoa(unescape(encodeURIComponent(s)))}catch(__){return ''}}}
function sha(text){var b=bridge();try{if(b&&typeof b.sha256Text==='function'){var h=String(b.sha256Text(String(text))||'').toLowerCase();if(/^[0-9a-f]{64}$/.test(h))return h}}catch(_){ }return ''}
function build(){
  var customers=safeRows(data&&data.customers).map(function(c){return {id:c.id,name:c.name,phone:c.phone,address:c.address,openingBalance:c.openingBalance,balance:c.balance,notes:c.notes,createdAt:c.createdAt,updatedAt:c.updatedAt,archiveCheckpoint:c.historyArchiveCheckpoint?JSON.stringify(c.historyArchiveCheckpoint):''}});
  var invoices=safeRows(data&&data.invoices).map(function(i){var t={};try{t=typeof invoiceTotals==='function'?invoiceTotals(i):{}}catch(_){ }return {id:i.id,invoiceNumber:i.invoiceNumber,customerId:i.customerId,customerName:customerName(i.customerId),date:i.date,projectTitle:i.projectTitle||i.description||'',status:i.status||i.invoiceStatus||'',totalAmount:Number(t.totalAmount||i.totalAmount||0),totalPaid:Number(t.totalPaid||i.totalPaid||0),remainingAmount:Number(t.remainingAmount||i.remainingAmount||0),createdAt:i.createdAt,updatedAt:i.updatedAt}});
  var items=[],payments=[];safeRows(data&&data.invoices).forEach(function(i){safeRows(i&&i.items).forEach(function(x,n){items.push({invoiceId:i.id,invoiceNumber:i.invoiceNumber,customerId:i.customerId,row:n+1,description:x.description,quantity:x.quantity,unitPrice:x.unitPrice,total:x.total||Number(x.quantity||0)*Number(x.unitPrice||0)})});safeRows(i&&i.payments).forEach(function(p){payments.push({id:p.id,invoiceId:i.id,invoiceNumber:i.invoiceNumber,customerId:i.customerId,customerName:customerName(i.customerId),date:p.date,method:p.method||p.type||p.paymentType||'',amount:p.amount,status:p.status||p.checkStatus||'',checkNumber:p.checkNumber||'',dueDate:p.dueDate||p.checkDueDate||'',note:p.note||''})})});
  var checks=[];try{var ca=window.AlanRangChecksV39120&&window.AlanRangChecksV39120.buildAll?window.AlanRangChecksV39120.buildAll():[];checks=safeRows(ca).map(function(c){return {id:c.id,direction:c.direction,status:c.status,statusLabel:c.statusLabel,amount:c.amount,customerId:c.customerId,customerName:c.customerName,invoiceId:c.invoiceId,invoiceNumber:c.invoiceNumber,receivedDate:c.receivedDate,dueDate:c.dueDate,ownerName:c.ownerName,bankName:c.bankName,checkNumber:c.checkNumber,spentTo:c.spentTo,notes:c.notes}})}catch(_){ }
  var finance=[];try{finance=(typeof readFinanceTransactions==='function'?readFinanceTransactions():[]).map(function(x){return {id:x.id,type:x.type,method:x.method,status:x.status||x.checkStatus,date:x.date,dueDate:x.dueDate||x.checkDueDate,amount:x.amount,customerId:x.customerId,customerName:customerName(x.customerId),invoiceId:x.invoiceId,invoiceNumber:x.invoiceNumber,checkNumber:x.checkNumber,note:x.note||x.notes||''}})}catch(_){ }
  var exportObj={app:'AlanRang Pro',format:'ALANRANG_PORTABLE_READABLE_EXPORT_V1',createdAt:new Date().toISOString(),appVersion:String(window.ALANRANG_APP_VERSION||''),dataSchemaVersion:Number(data&&data.schemaVersion||0),customers:customers,invoices:invoices,invoiceItems:items,payments:payments,checks:checks,finance:finance,followups:safeRows(data&&data.followups),executiveWorks:safeRows(data&&data.executiveWorks),workReservations:safeRows(data&&data.workReservations),invoiceAdjustments:safeRows(data&&data.invoiceAdjustments),accountAdjustments:safeRows(data&&data.accountAdjustments)};
  var files={
    'customers.csv':csv(['id','name','phone','address','openingBalance','balance','notes','createdAt','updatedAt','archiveCheckpoint'],customers),
    'invoices.csv':csv(['id','invoiceNumber','customerId','customerName','date','projectTitle','status','totalAmount','totalPaid','remainingAmount','createdAt','updatedAt'],invoices),
    'invoice_items.csv':csv(['invoiceId','invoiceNumber','customerId','row','description','quantity','unitPrice','total'],items),
    'payments.csv':csv(['id','invoiceId','invoiceNumber','customerId','customerName','date','method','amount','status','checkNumber','dueDate','note'],payments),
    'checks.csv':csv(['id','direction','status','statusLabel','amount','customerId','customerName','invoiceId','invoiceNumber','receivedDate','dueDate','ownerName','bankName','checkNumber','spentTo','notes'],checks),
    'finance.csv':csv(['id','type','method','status','date','dueDate','amount','customerId','customerName','invoiceId','invoiceNumber','checkNumber','note'],finance),
    'readable_export.json':JSON.stringify(exportObj,null,2),
    'README_FA.txt':'خروجی قابل‌خواندن آلان‌رنگ\nاین مجموعه رمزگذاری نشده و برای دسترسی بلندمدت به داده‌های متنی ساخته شده است. برای بازیابی کامل برنامه از فایل پشتیبان رمزگذاری‌شده .alr استفاده کن. تصاویر و کلیدهای امنیتی داخل این خروجی قرار نمی‌گیرند.\n'
  };
  return {files:files,metadata:{format:'ALANRANG_PORTABLE_READABLE_EXPORT_V1',createdAt:exportObj.createdAt,appVersion:exportObj.appVersion,dataSchemaVersion:exportObj.dataSchemaVersion,encrypted:false,containsImages:false,completeRestoreBackup:false}};
}
function createPortableExport(confirmed){
  if(!confirmed&&!confirm('این خروجی برای خوانایی بلندمدت رمزگذاری نمی‌شود و ممکن است نام، تلفن و اطلاعات مالی مشتری‌ها را داشته باشد. فایل‌ها را فقط در محل امن نگه می‌داری؟'))return {ok:false,cancelled:true};
  var b=bridge();if(!b||typeof b.saveDataV2!=='function')return {ok:false,message:'ذخیره خروجی روی Android در دسترس نیست.'};
  var bundle=build(),prefix='AlanRang_Portable_'+tag()+'_',saved=[],failed=[],hashes={};
  Object.keys(bundle.files).forEach(function(name){var text=String(bundle.files[name]),encoded=utf8b64(text),outName=prefix+name,key='portable-'+Date.now()+'-'+name;var ok=false;hashes[name]=sha(text);try{ok=!!encoded&&!!b.saveDataV2(encoded,name.endsWith('.csv')?'text/csv':(name.endsWith('.json')?'application/json':'text/plain'),outName,key)}catch(_){ok=false}(ok?saved:failed).push(outName)});
  var manifest={app:'AlanRang Pro',format:'ALANRANG_PORTABLE_EXPORT_MANIFEST_V1',createdAt:new Date().toISOString(),prefix:prefix,hashAlgorithm:'SHA-256',hashes:hashes,files:Object.keys(bundle.files),encrypted:false,warning:'این خروجی رمزگذاری نشده است و جایگزین Backup .alr نیست.'},manifestText=JSON.stringify(manifest,null,2),manifestName=prefix+'MANIFEST_SHA256.json',manifestOk=false;try{manifestOk=!!b.saveDataV2(utf8b64(manifestText),'application/json',manifestName,'portable-manifest-'+Date.now())}catch(_){manifestOk=false}
  if(manifestOk)saved.push(manifestName);else failed.push(manifestName);
  return {ok:failed.length===0,saved:saved,failed:failed,manifest:manifest,metadata:bundle.metadata,message:failed.length===0?'خروجی CSV/JSON و Manifest در Documents/AlanRang/Exports ذخیره شد.':'بخشی از فایل‌های خروجی ذخیره نشد؛ پشتیبان اصلی .alr تغییری نکرد.'};
}
window.AlanRangLongTerm=window.AlanRangLongTerm||{};window.AlanRangLongTerm.version39380=VERSION;window.AlanRangLongTerm.buildPortableExport=build;window.AlanRangLongTerm.createPortableExport=createPortableExport;
window.AlanRangLongTermV39380={version:VERSION,build:build,createPortableExport:createPortableExport};
})();
