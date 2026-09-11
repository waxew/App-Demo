(function(){
'use strict';
if(window.__ALANRANG_DOCUMENT_ARCHIVE_V39110__)return;
window.__ALANRANG_DOCUMENT_ARCHIVE_V39110__=true;

var VERSION='39.11.0-documents-stage1-v01';

function n(v){
  try{if(typeof num==='function')return num(v)}catch(_){ }
  var x=Number(String(v==null?'':v).replace(/,/g,'').replace(/[^0-9.\-]/g,''));
  return isFinite(x)?x:0;
}
function same(a,b){return String(a==null?'':a)===String(b==null?'':b)}
function text(v){return String(v==null?'':v).trim()}
function norm(v){return text(v).toLowerCase().replace(/[\s\u200c\u200e\u200f]+/g,' ').trim()}
function dateParts(value){
  try{if(typeof parseJalaliDate==='function'){var p=parseJalaliDate(value||'');if(p&&p.jy&&p.jm&&p.jd)return {jy:n(p.jy),jm:n(p.jm),jd:n(p.jd)}}}catch(_){ }
  var s=String(value||'').replace(/[\u06f0-\u06f9]/g,function(d){return '\u06f0\u06f1\u06f2\u06f3\u06f4\u06f5\u06f6\u06f7\u06f8\u06f9'.indexOf(d)}).replace(/[\u0660-\u0669]/g,function(d){return '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669'.indexOf(d)});
  var m=s.match(/((?:13|14)\d{2})\D+(\d{1,2})\D+(\d{1,2})/);
  return m?{jy:Number(m[1]),jm:Number(m[2]),jd:Number(m[3])}:null;
}
function dateSerial(value){var p=dateParts(value);return p?p.jy*10000+p.jm*100+p.jd:0}
function stamp(row){return Date.parse((row&&row.updatedAt)||(row&&row.createdAt)||'')||0}
function customer(id){
  try{if(typeof customerById==='function')return customerById(id)}catch(_){ }
  return ((window.data&&Array.isArray(data.customers))?data.customers:[]).find(function(c){return c&&same(c.id,id)})||null;
}
function invoiceKey(inv,index){
  try{if(typeof invoiceLedgerKey==='function'){var k=invoiceLedgerKey(inv);if(k)return String(k)}}catch(_){ }
  var cid=text(inv&&inv.customerId),raw=text(inv&&inv.invoiceNumber).replace(/[\s\u200c\u200e\u200f]+/g,'').toUpperCase();
  return raw?cid+'|number:'+raw:cid+'|id:'+text(inv&&inv.id||index);
}
function invoiceAmount(inv){
  try{if(typeof invoiceTotals==='function'){var t=invoiceTotals(inv)||{};return n(t.totalAmount)}}catch(_){ }
  return ((inv&&Array.isArray(inv.items))?inv.items:[]).reduce(function(s,x){return s+n(x&&x.total!=null?x.total:n(x&&x.quantity)*n(x&&x.unitPrice))},0);
}
function canonicalInvoiceRecords(){
  var raw=(window.data&&Array.isArray(data.invoices))?data.invoices:[],order=[],byKey={};
  raw.forEach(function(inv,index){
    if(!inv)return;
    var key=invoiceKey(inv,index),ts=stamp(inv),slot=byKey[key];
    if(!slot){slot={key:key,index:order.length,sourceCount:1,sourceIds:[text(inv.id)],stamp:ts,row:inv};byKey[key]=slot;order.push(slot);return}
    slot.sourceCount+=1;slot.sourceIds.push(text(inv.id));
    if(ts>=slot.stamp){slot.stamp=ts;slot.row=inv}
  });
  return order.map(function(x){return {invoice:x.row,key:x.key,sourceCount:x.sourceCount,sourceIds:x.sourceIds.slice()}});
}
function assetById(type,id){
  var s=(window.data&&data.settings)||{},list=Array.isArray(s[type])?s[type]:[];
  return list.find(function(x){return x&&same(x.id,id)})||null;
}
function activeAsset(type,activeKey,legacyKey){
  var s=(window.data&&data.settings)||{},id=text(s[activeKey]),item=assetById(type,id);
  if(!item)item=(Array.isArray(s[type])?s[type]:[]).find(function(x){return x&&x.isActive})||null;
  return {id:item&&item.id||id||'',image:item&&item.imageData||text(s[legacyKey]),name:item&&item.name||''};
}
function effectiveIdentity(doc){
  var s=(window.data&&data.settings)||{},policy=(doc&&doc.documentIdentity&&typeof doc.documentIdentity==='object')?doc.documentIdentity:{};
  var mode=policy.mode==='none'?'none':(policy.mode==='custom'?'custom':'inherit');
  var globalStamp=activeAsset('stamps','activeStampId','stampImage'),globalSign=activeAsset('signatures','activeSignatureId','signatureImage');
  if(s.showStampSignature===false&&mode==='inherit')mode='none';
  if(mode==='none')return {mode:'none',stampId:'',signatureId:'',stampImage:'',signatureImage:'',showStamp:false,showSignature:false,valid:true};
  var stampId=mode==='custom'?text(policy.stampId):globalStamp.id,signId=mode==='custom'?text(policy.signatureId):globalSign.id;
  var st=mode==='custom'?assetById('stamps',stampId):assetById('stamps',stampId),sg=mode==='custom'?assetById('signatures',signId):assetById('signatures',signId);
  var stampImage=st&&st.imageData||((mode==='inherit')?globalStamp.image:''),signatureImage=sg&&sg.imageData||((mode==='inherit')?globalSign.image:'');
  var showStamp=policy.showStamp!==false&&!!stampImage,showSignature=policy.showSignature!==false&&!!signatureImage;
  return {mode:mode,stampId:stampId,signatureId:signId,stampImage:showStamp?stampImage:'',signatureImage:showSignature?signatureImage:'',showStamp:showStamp,showSignature:showSignature,valid:mode!=='custom'||((!stampId||!!st)&&(!signId||!!sg))};
}
function itemText(row){return ((row&&Array.isArray(row.items))?row.items:[]).map(function(x){return [x&&x.description,x&&x.title,x&&x.unit].filter(Boolean).join(' ')}).join(' ')}
function makeSearchText(row,c){
  return norm([row.kind,row.number,row.date,row.status,row.projectTitle,row.description,row.reason,row.templateId,row.amount,c&&c.name,c&&c.phone,c&&c.mobile,itemText(row.raw)].filter(Boolean).join(' '));
}
function invoiceRecord(rec){
  var inv=rec.invoice||{},c=customer(inv.customerId),amount=invoiceAmount(inv),identity=effectiveIdentity(inv);
  var row={id:text(inv.id),kind:'executionInvoice',customerId:text(inv.customerId),customerName:text(c&&c.name),number:text(inv.invoiceNumber),date:text(inv.date),dateSerial:dateSerial(inv.date),status:'final',amount:amount,direction:'debit',templateId:text(inv.invoiceTemplateId||((data.settings||{}).activeInvoiceTemplateId)),projectTitle:text(inv.projectTitle),description:text(inv.description),createdAt:text(inv.createdAt),updatedAt:text(inv.updatedAt),sortStamp:stamp(inv),duplicateSourceCount:rec.sourceCount,duplicateSourceIds:rec.sourceIds.slice(),identity:identity,raw:inv};
  row.searchText=makeSearchText(row,c);return row;
}
function proformaRecord(p){
  var c=customer(p.customerId),amount=invoiceAmount(p),status=p.convertedInvoiceId||p.status==='converted'?'converted':(text(p.status)||'open'),identity=effectiveIdentity(p);
  var row={id:text(p.id),kind:'proforma',customerId:text(p.customerId),customerName:text(c&&c.name),number:text(p.invoiceNumber),date:text(p.date),dateSerial:dateSerial(p.date),status:status,amount:amount,direction:'neutral',templateId:text(p.invoiceTemplateId||((data.settings||{}).activeInvoiceTemplateId)),projectTitle:text(p.projectTitle),description:text(p.description),createdAt:text(p.createdAt),updatedAt:text(p.updatedAt),sortStamp:stamp(p),convertedInvoiceId:text(p.convertedInvoiceId),duplicateSourceCount:1,duplicateSourceIds:[text(p.id)],identity:identity,raw:p};
  row.searchText=makeSearchText(row,c);return row;
}
function invoiceAdjustmentRecord(a){
  var c=customer(a.customerId),amount=Math.abs(n(a.amount)),direction=a.direction==='debit'?'debit':'credit';
  var row={id:text(a.id),kind:'invoiceAdjustment',customerId:text(a.customerId),customerName:text(c&&c.name),number:text(a.documentNumber||a.invoiceNumber),sourceInvoiceId:text(a.invoiceId),sourceInvoiceNumber:text(a.invoiceNumber),date:text(a.date),dateSerial:dateSerial(a.date),status:text(a.adjustmentKind||'adjustment'),amount:amount,direction:direction,templateId:text(a.invoiceTemplateId||((data.settings||{}).activeInvoiceTemplateId)),reason:text(a.reason),createdAt:text(a.createdAt),updatedAt:text(a.updatedAt),sortStamp:stamp(a),duplicateSourceCount:1,duplicateSourceIds:[text(a.id)],identity:effectiveIdentity(a),raw:a};
  row.searchText=makeSearchText(row,c);return row;
}
function accountAdjustmentRecord(a){
  var c=customer(a.customerId),amount=Math.abs(n(a.amount)),direction=a.direction==='debit'?'debit':'credit';
  var row={id:text(a.id),kind:'accountAdjustment',customerId:text(a.customerId),customerName:text(c&&c.name),number:text(a.documentNumber),date:text(a.date),dateSerial:dateSerial(a.date),status:'account-adjustment',amount:amount,direction:direction,templateId:'',reason:text(a.reason),createdAt:text(a.createdAt),updatedAt:text(a.updatedAt),sortStamp:stamp(a),duplicateSourceCount:1,duplicateSourceIds:[text(a.id)],identity:{mode:'none',stampId:'',signatureId:'',stampImage:'',signatureImage:'',showStamp:false,showSignature:false,valid:true},raw:a};
  row.searchText=makeSearchText(row,c);return row;
}
function compareRows(a,b){return (b.dateSerial||0)-(a.dateSerial||0)||(b.sortStamp||0)-(a.sortStamp||0)||String(b.id||'').localeCompare(String(a.id||''))}
function buildAll(){
  var rows=[];
  canonicalInvoiceRecords().forEach(function(x){rows.push(invoiceRecord(x))});
  ((window.data&&Array.isArray(data.proformas))?data.proformas:[]).forEach(function(x){if(x)rows.push(proformaRecord(x))});
  ((window.data&&Array.isArray(data.invoiceAdjustments))?data.invoiceAdjustments:[]).forEach(function(x){if(x)rows.push(invoiceAdjustmentRecord(x))});
  ((window.data&&Array.isArray(data.accountAdjustments))?data.accountAdjustments:[]).forEach(function(x){if(x)rows.push(accountAdjustmentRecord(x))});
  rows.sort(compareRows);return rows;
}
function filterRows(options){
  var o=options||{},q=norm(o.query),types=Array.isArray(o.types)?o.types.map(String):null,statuses=Array.isArray(o.statuses)?o.statuses.map(String):null,from=dateSerial(o.from),to=dateSerial(o.to);
  return buildAll().filter(function(r){
    if(o.customerId&&!same(r.customerId,o.customerId))return false;
    if(types&&types.length&&types.indexOf(r.kind)<0)return false;
    if(statuses&&statuses.length&&statuses.indexOf(r.status)<0)return false;
    if(o.templateId&&!same(r.templateId,o.templateId))return false;
    if(from&&(!r.dateSerial||r.dateSerial<from))return false;
    if(to&&(!r.dateSerial||r.dateSerial>to))return false;
    if(q&&r.searchText.indexOf(q)<0)return false;
    return true;
  });
}
function summary(rows){
  var list=Array.isArray(rows)?rows:buildAll(),out={total:list.length,executionInvoices:0,proformas:0,invoiceAdjustments:0,accountAdjustments:0,convertedProformas:0,openProformas:0,duplicateInvoiceGroups:0,duplicateInvoiceSources:0,amounts:{executionInvoices:0,proformas:0,invoiceAdjustments:0,accountAdjustments:0}};
  list.forEach(function(r){
    if(r.kind==='executionInvoice'){out.executionInvoices++;out.amounts.executionInvoices+=n(r.amount);if(r.duplicateSourceCount>1){out.duplicateInvoiceGroups++;out.duplicateInvoiceSources+=r.duplicateSourceCount}}
    else if(r.kind==='proforma'){out.proformas++;out.amounts.proformas+=n(r.amount);if(r.status==='converted')out.convertedProformas++;else out.openProformas++}
    else if(r.kind==='invoiceAdjustment'){out.invoiceAdjustments++;out.amounts.invoiceAdjustments+=n(r.amount)}
    else if(r.kind==='accountAdjustment'){out.accountAdjustments++;out.amounts.accountAdjustments+=n(r.amount)}
  });return out;
}
function audit(){
  var rows=buildAll(),issues=[];
  rows.forEach(function(r){
    if(r.customerId&&!customer(r.customerId))issues.push({type:'orphanCustomer',kind:r.kind,id:r.id,customerId:r.customerId});
    if(r.kind==='invoiceAdjustment'&&r.sourceInvoiceId&&!((window.data&&Array.isArray(data.invoices))?data.invoices:[]).some(function(x){return x&&same(x.id,r.sourceInvoiceId)}))issues.push({type:'orphanInvoiceAdjustment',id:r.id,sourceInvoiceId:r.sourceInvoiceId});
    if(r.identity&&r.identity.valid===false)issues.push({type:'invalidIdentityOverride',kind:r.kind,id:r.id});
  });
  var s=summary(rows);return {version:VERSION,summary:s,issues:issues,clean:issues.length===0,rows:rows};
}

window.AlanRangDocumentsV39110={version:VERSION,canonicalInvoiceRecords:canonicalInvoiceRecords,effectiveIdentity:effectiveIdentity,buildAll:buildAll,filter:filterRows,summary:summary,audit:audit,dateSerial:dateSerial};
})();

/* ===== AlanRang Pro v39.11.0 Stage 2 — Unified Document Archive UI ===== */
(function(){
'use strict';
if(window.__ALANRANG_DOCUMENT_ARCHIVE_V39110_STAGE2__)return;
window.__ALANRANG_DOCUMENT_ARCHIVE_V39110_STAGE2__=true;

var API=window.AlanRangDocumentsV39110;
if(!API||typeof API.filter!=='function')return;
var STAGE2_VERSION='39.11.0-documents-stage2-v01';

function esc(v){try{return typeof safe==='function'?safe(v):String(v==null?'':v)}catch(_){return String(v==null?'':v)}}
function attr(v){try{return typeof safeAttr==='function'?safeAttr(v):esc(v)}catch(_){return esc(v)}}
function no(v){try{return typeof num==='function'?num(v):Number(String(v==null?'':v).replace(/,/g,'').replace(/[^0-9.\-]/g,''))||0}catch(_){return 0}}
function mon(v){try{return typeof money==='function'?money(Math.round(no(v))):String(Math.round(no(v)))+' تومان'}catch(_){return String(v||0)+' تومان'}}
function fa(v){try{return typeof faDigits==='function'?faDigits(v):String(v)}catch(_){return String(v)}}
function selected(a,b){return String(a==null?'':a)===String(b==null?'':b)?' selected':''}
function stateFilter(){
  if(!window.state)window.state={};
  var current=state.ar39110ArchiveFilter;
  if(!current||typeof current!=='object')current={type:'all',status:'all',customerId:'',from:'',to:'',minAmount:'',maxAmount:'',query:''};
  state.ar39110ArchiveFilter=current;
  return current;
}
function typeKinds(type){
  if(type==='invoice')return ['executionInvoice'];
  if(type==='proforma')return ['proforma'];
  if(type==='adjustment')return ['invoiceAdjustment','accountAdjustment'];
  return null;
}
function filteredRows(filter){
  var f=filter||stateFilter(),types=typeKinds(f.type),statuses=f.status&&f.status!=='all'?[f.status]:null;
  var rows=API.filter({query:f.query||'',types:types,statuses:statuses,customerId:f.customerId||'',from:f.from||'',to:f.to||''});
  var min=no(f.minAmount),max=no(f.maxAmount);
  if(min>0)rows=rows.filter(function(r){return no(r.amount)>=min});
  if(max>0)rows=rows.filter(function(r){return no(r.amount)<=max});
  return rows;
}
function kindLabel(kind){
  if(kind==='executionInvoice')return 'فاکتور اجرا';
  if(kind==='proforma')return 'پیش‌فاکتور';
  if(kind==='invoiceAdjustment')return 'اصلاح / برگشت فاکتور';
  if(kind==='accountAdjustment')return 'اصلاح مانده';
  return 'سند';
}
function kindIcon(kind){return kind==='executionInvoice'?'📄':kind==='proforma'?'📝':kind==='invoiceAdjustment'?'↩️':'⚖️'}
function statusLabel(row){
  var s=String(row&&row.status||'');
  if(row&&row.kind==='executionInvoice')return 'قطعی';
  if(s==='open')return 'باز';
  if(s==='converted')return 'تبدیل‌شده';
  if(s==='increase')return 'افزایشی';
  if(s==='decrease')return 'کاهشی';
  if(s==='return')return 'برگشت';
  if(s==='account-adjustment')return 'ثبت‌شده';
  return s||'ثبت‌شده';
}
function statusClass(row){
  var s=String(row&&row.status||'');
  if(s==='converted'||(row&&row.kind==='executionInvoice'))return 'ok';
  if(s==='open')return 'open';
  if(s==='return'||s==='decrease')return 'credit';
  if(s==='increase')return 'debit';
  return 'neutral';
}
function identityLabel(row){
  var i=row&&row.identity||{};
  if(i.mode==='none')return 'بدون مهر و امضا';
  if(i.mode==='custom'){
    if(i.showStamp&&i.showSignature)return 'مهر و امضای اختصاصی';
    if(i.showStamp)return 'مهر اختصاصی';
    if(i.showSignature)return 'امضای اختصاصی';
    return 'بدون مهر و امضا';
  }
  return 'مهر و امضای عمومی';
}
function customerOptions(value){
  var rows=(window.data&&Array.isArray(data.customers))?data.customers.slice():[];
  rows.sort(function(a,b){return String(a&&a.name||'').localeCompare(String(b&&b.name||''),'fa')});
  return '<option value="">همه مشتری‌ها</option>'+rows.map(function(c){return '<option value="'+attr(c.id)+'"'+selected(c.id,value)+'>'+esc(c.name||'بدون نام')+'</option>'}).join('');
}
function statusOptions(value){
  var rows=[['all','همه وضعیت‌ها'],['final','قطعی'],['open','پیش‌فاکتور باز'],['converted','پیش‌فاکتور تبدیل‌شده'],['increase','اصلاح افزایشی'],['decrease','اصلاح کاهشی'],['return','برگشت فاکتور'],['account-adjustment','اصلاح مانده']];
  return rows.map(function(x){return '<option value="'+x[0]+'"'+selected(x[0],value)+'>'+x[1]+'</option>'}).join('');
}
function summaryCards(rows){
  var s=API.summary(rows),amount=s.amounts||{};
  return '<div class="ar39110-summary">'+
    '<div><span>نتیجه فعلی</span><b>'+fa(s.total||0)+' سند</b><small>طبق فیلترهای انتخاب‌شده</small></div>'+
    '<div><span>فاکتور اجرا</span><b>'+fa(s.executionInvoices||0)+'</b><small>'+mon(amount.executionInvoices||0)+'</small></div>'+
    '<div><span>پیش‌فاکتور</span><b>'+fa(s.proformas||0)+'</b><small>'+fa(s.openProformas||0)+' باز / '+fa(s.convertedProformas||0)+' تبدیل‌شده</small></div>'+
    '<div><span>اصلاحات</span><b>'+fa((s.invoiceAdjustments||0)+(s.accountAdjustments||0))+'</b><small>اسناد اصلاح و مانده</small></div>'+
  '</div>';
}
function rowTitle(row){
  if(row.number)return kindLabel(row.kind)+' '+esc(row.number);
  return kindLabel(row.kind)+' '+esc(row.id||'');
}
function rowMeta(row){
  var parts=[];
  if(row.customerName)parts.push(row.customerName);
  if(row.date)parts.push(row.date);
  if(row.sourceInvoiceNumber)parts.push('فاکتور مرجع '+row.sourceInvoiceNumber);
  if(row.projectTitle)parts.push(row.projectTitle);
  if(row.reason)parts.push(row.reason);
  return parts.map(esc).join(' • ');
}
function documentCard(row){
  var duplicate=Number(row.duplicateSourceCount||0)>1?'<span class="ar39110-duplicate">'+fa(row.duplicateSourceCount)+' نسخه تکراری ادغام شد</span>':'';
  var amountClass=row.direction==='credit'?'credit':row.direction==='debit'?'debit':'neutral';
  return '<article class="ar39110-doc" data-kind="'+attr(row.kind)+'">'+
    '<div class="ar39110-doc-main"><div class="ar39110-doc-title"><span class="ar39110-kind">'+kindIcon(row.kind)+'</span><div><b>'+rowTitle(row)+'</b><small>'+rowMeta(row)+'</small></div></div><div class="ar39110-badges"><span class="ar39110-status '+statusClass(row)+'">'+esc(statusLabel(row))+'</span>'+duplicate+'</div></div>'+
    '<div class="ar39110-doc-info"><div><span>مبلغ</span><strong class="'+amountClass+'">'+mon(row.amount||0)+'</strong></div><div><span>مشتری</span><strong>'+esc(row.customerName||'بدون مشتری')+'</strong></div><div><span>هویت سند</span><strong>'+esc(identityLabel(row))+'</strong></div></div>'+
    '<div class="ar39110-doc-actions"><button class="btn blue" data-ar39110="open" data-id="'+attr(row.id)+'" data-kind="'+attr(row.kind)+'">باز کردن سند</button>'+(row.kind==='accountAdjustment'?'':'<button class="btn ghost" data-ar39110-stage3="identity" data-id="'+attr(row.id)+'" data-kind="'+attr(row.kind)+'">مهر و امضای این سند</button>')+'</div>'+
  '</article>';
}
function filtersHtml(f){
  var types=[['all','همه'],['invoice','فاکتور'],['proforma','پیش‌فاکتور'],['adjustment','اصلاحات']];
  return '<section class="ar39110-filter-card"><div class="ar39110-filter-head"><div><h3>فیلتر و جستجوی اسناد</h3><p>فقط نمایش آرشیو را محدود می‌کند؛ اطلاعات و محاسبات مالی تغییر نمی‌کنند.</p></div><button class="btn ghost small" data-ar39110="clear">پاک کردن</button></div>'+
    '<div class="ar39110-type-tabs">'+types.map(function(x){return '<button class="'+(f.type===x[0]?'active':'')+'" data-ar39110="type" data-type="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'+
    '<div class="field"><label>جستجوی سریع</label><input id="ar39110Query" class="input" value="'+attr(f.query||'')+'" placeholder="شماره سند، نام مشتری، شرح کار، دلیل اصلاح..."></div>'+
    '<div class="grid2"><div class="field"><label>مشتری</label><select id="ar39110Customer" class="select">'+customerOptions(f.customerId)+'</select></div><div class="field"><label>وضعیت سند</label><select id="ar39110Status" class="select">'+statusOptions(f.status)+'</select></div></div>'+
    '<div class="grid2"><div class="field"><label>از تاریخ</label><input id="ar39110From" class="input" inputmode="numeric" value="'+attr(f.from||'')+'" placeholder="۱۴۰۵/۰۱/۰۱"></div><div class="field"><label>تا تاریخ</label><input id="ar39110To" class="input" inputmode="numeric" value="'+attr(f.to||'')+'" placeholder="۱۴۰۵/۱۲/۲۹"></div></div>'+
    '<div class="grid2"><div class="field"><label>حداقل مبلغ</label><input id="ar39110Min" class="input money-input" inputmode="numeric" value="'+attr(f.minAmount||'')+'" placeholder="مثلاً ۱,۰۰۰,۰۰۰"></div><div class="field"><label>حداکثر مبلغ</label><input id="ar39110Max" class="input money-input" inputmode="numeric" value="'+attr(f.maxAmount||'')+'" placeholder="اختیاری"></div></div>'+
    '<button class="btn blue full" data-ar39110="apply">اعمال فیلتر</button></section>';
}
function archivePage(){
  var f=stateFilter(),rows=filteredRows(f),all=API.buildAll(),audit=API.audit();
  var duplicate=API.summary(all).duplicateInvoiceGroups||0;
  return '<section class="page ar39110-page"><div class="back-row"><button class="btn ghost" data-action="tab" data-tab="more">برگشت</button></div>'+
    '<div class="ar39110-hero"><div><h2>آرشیو اسناد</h2><p>فاکتور اجرا، پیش‌فاکتور و اسناد اصلاحی در یک آرشیو واحد و فقط‌خواندنی.</p></div><span>'+fa(all.length)+' سند فعال</span></div>'+
    '<div class="ar39110-audit '+(audit.clean?'ok':'warn')+'"><b>'+(audit.clean?'✓ آرشیو سالم است':'⚠ نیاز به بررسی آرشیو')+'</b><span>'+fa(audit.issues.length)+' مورد ساختاری • '+fa(duplicate)+' گروه فاکتور تکراری شناسایی‌شده</span></div>'+
    filtersHtml(f)+summaryCards(rows)+
    '<div class="ar39110-list-head"><div><h3>اسناد</h3><p>'+fa(rows.length)+' نتیجه از '+fa(all.length)+' سند</p></div></div>'+
    '<div class="ar39110-list">'+(rows.map(documentCard).join('')||'<div class="ar39110-empty">سندی با این فیلتر پیدا نشد.</div>')+'</div></section>';
}
function readFilterDom(){
  var f=stateFilter();
  f.query=((document.getElementById('ar39110Query')||{}).value||'').trim();
  f.customerId=(document.getElementById('ar39110Customer')||{}).value||'';
  f.status=(document.getElementById('ar39110Status')||{}).value||'all';
  f.from=((document.getElementById('ar39110From')||{}).value||'').trim();
  f.to=((document.getElementById('ar39110To')||{}).value||'').trim();
  f.minAmount=((document.getElementById('ar39110Min')||{}).value||'').trim();
  f.maxAmount=((document.getElementById('ar39110Max')||{}).value||'').trim();
  return f;
}
function findRow(id,kind){return API.buildAll().find(function(r){return String(r.id)===String(id)&&(!kind||String(r.kind)===String(kind))})||null}
function openDocument(row){
  if(!row||!window.state)return false;
  state.selectedCustomerId=row.customerId||state.selectedCustomerId||null;
  state.modal=null;
  if(row.kind==='accountAdjustment'){
    state.ar3990DetailId=row.id;
    state.modal='ar3990AccountAdjustmentDetail';
  }else{
    state.previewInvoiceId=row.id;
    state.tab='preview';
  }
  try{if(typeof renderApp==='function')renderApp()}catch(_){ }
  return true;
}
function injectMoreEntry(){
  try{
    if(!window.state||state.tab!=='more')return;
    var grid=document.querySelector('.ar3980-menu');if(!grid||grid.querySelector('[data-tab="documentsArchive"]'))return;
    var b=document.createElement('button');b.setAttribute('data-action','tab');b.setAttribute('data-tab','documentsArchive');b.innerHTML='<b>آرشیو اسناد</b><span>فاکتور، پیش‌فاکتور و اصلاحات در یک صفحه</span>';grid.insertBefore(b,grid.firstChild||null);
  }catch(e){console.error('v39.11 stage2 more entry',e)}
}
function installStyle(){
  if(typeof document==='undefined'||!document.head||document.getElementById('ar39110-stage2-style'))return;
  var s=document.createElement('style');s.id='ar39110-stage2-style';s.textContent='\
.ar39110-page{padding-bottom:110px}.ar39110-hero{display:flex;justify-content:space-between;align-items:center;gap:12px;background:linear-gradient(145deg,#061e35,#0d3559);border:1px solid #d79b22;color:#fff;border-radius:24px;padding:18px;margin-bottom:12px;box-shadow:0 12px 28px rgba(5,27,48,.16)}.ar39110-hero h2{margin:0 0 6px;color:#f4c752;font-size:23px}.ar39110-hero p{margin:0;color:#dbe7f2;font-size:11px;line-height:1.9}.ar39110-hero>span{background:rgba(244,199,82,.14);border:1px solid rgba(244,199,82,.38);color:#f4c752;border-radius:999px;padding:7px 10px;font-size:10px;font-weight:950;white-space:nowrap}.ar39110-audit{display:flex;justify-content:space-between;gap:10px;align-items:center;border-radius:15px;padding:10px 12px;margin-bottom:12px;font-size:10.5px;line-height:1.75}.ar39110-audit.ok{background:#ecfdf3;border:1px solid #86efac;color:#166534}.ar39110-audit.warn{background:#fff7ed;border:1px solid #fdba74;color:#9a3412}.ar39110-filter-card{background:#fff;border:1px solid #dfe6ee;border-radius:21px;padding:14px;margin-bottom:12px;box-shadow:0 8px 20px rgba(15,39,64,.045)}.ar39110-filter-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.ar39110-filter-head h3{margin:0;color:#102a43}.ar39110-filter-head p{margin:5px 0 10px;color:#64748b;font-size:10px;line-height:1.8}.ar39110-type-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:5px 0 12px}.ar39110-type-tabs button{border:1px solid #d7e0e9;background:#f8fafc;color:#334155;border-radius:12px;min-height:40px;font-weight:900;font-size:11px}.ar39110-type-tabs button.active{background:#071e34;border-color:#d79b22;color:#f4c752}.ar39110-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:12px 0}.ar39110-summary>div{background:#fff;border:1px solid #dfe6ee;border-radius:17px;padding:12px;min-height:82px}.ar39110-summary span,.ar39110-summary b,.ar39110-summary small{display:block}.ar39110-summary span{font-size:10px;color:#64748b;font-weight:900}.ar39110-summary b{margin:5px 0;color:#0f2740;font-size:16px}.ar39110-summary small{font-size:9px;color:#7b8794;line-height:1.6}.ar39110-list-head{display:flex;justify-content:space-between;align-items:end;margin:14px 2px 8px}.ar39110-list-head h3{margin:0;color:#0f2740;font-size:20px}.ar39110-list-head p{margin:4px 0 0;color:#64748b;font-size:10px}.ar39110-list{display:grid;gap:10px}.ar39110-doc{background:#fff;border:1px solid #dfe6ee;border-radius:19px;padding:13px;box-shadow:0 7px 18px rgba(15,39,64,.045)}.ar39110-doc-main{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.ar39110-doc-title{display:flex;gap:9px;min-width:0}.ar39110-kind{width:38px;height:38px;border-radius:12px;background:#eef4fa;display:flex;align-items:center;justify-content:center;flex:0 0 38px;font-size:19px}.ar39110-doc-title b,.ar39110-doc-title small{display:block}.ar39110-doc-title b{color:#0f2740;font-size:14px;word-break:break-word}.ar39110-doc-title small{color:#64748b;font-size:9.5px;line-height:1.75;margin-top:4px}.ar39110-badges{display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex:0 0 auto}.ar39110-status,.ar39110-duplicate{border-radius:999px;padding:5px 8px;font-size:8.5px;font-weight:950;white-space:nowrap}.ar39110-status.ok{background:#dcfce7;color:#166534}.ar39110-status.open{background:#dbeafe;color:#1d4ed8}.ar39110-status.credit{background:#dcfce7;color:#166534}.ar39110-status.debit{background:#fee2e2;color:#b42318}.ar39110-status.neutral{background:#e2e8f0;color:#334155}.ar39110-duplicate{background:#fff7ed;color:#9a3412}.ar39110-doc-info{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:10px}.ar39110-doc-info>div{background:#f8fafc;border-radius:11px;padding:8px;min-width:0}.ar39110-doc-info span,.ar39110-doc-info strong{display:block}.ar39110-doc-info span{font-size:8.5px;color:#64748b}.ar39110-doc-info strong{font-size:10px;color:#183b56;margin-top:4px;word-break:break-word}.ar39110-doc-info strong.debit{color:#b42318}.ar39110-doc-info strong.credit{color:#15803d}.ar39110-doc-actions{margin-top:9px;display:grid;grid-template-columns:1fr 1fr;gap:7px}.ar39110-doc-actions .btn{width:100%}.ar39110-empty{text-align:center;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:17px;padding:22px;color:#64748b}.ar3980-menu [data-tab="documentsArchive"]{border-color:#d79b22;background:linear-gradient(180deg,#fffdf7,#fff8e5)}.ar3980-menu [data-tab="documentsArchive"] b{color:#8a5b00}@media(min-width:720px){.ar39110-summary{grid-template-columns:repeat(4,minmax(0,1fr))}.ar39110-list{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:390px){.ar39110-doc-actions{grid-template-columns:1fr}.ar39110-hero,.ar39110-audit,.ar39110-filter-head{align-items:flex-start;flex-direction:column}.ar39110-type-tabs{grid-template-columns:repeat(2,1fr)}.ar39110-doc-main{flex-direction:column}.ar39110-badges{align-items:flex-start;flex-direction:row;flex-wrap:wrap}.ar39110-doc-info{grid-template-columns:1fr 1fr}.ar39110-doc-info>div:last-child{grid-column:1/-1}}@media print{.ar39110-filter-card,.ar39110-doc-actions,.ar39110-page .back-row,.ar3980-search-trigger{display:none!important}}';document.head.appendChild(s);
}

try{registerAlanRangRoute('v39110-document-archive-stage2',function(){if(!window.state||state.tab!=='documentsArchive')return false;app.innerHTML=baseLayout(archivePage());return true})}catch(_){ }
try{registerAlanRangAfterRender('v39110-document-archive-entry',function(){setTimeout(injectMoreEntry,0)})}catch(_){ }

var previousBottom=(typeof bottomNav==='function')?bottomNav:null;
if(previousBottom){
  bottomNav=function(){
    var html=String(previousBottom.apply(this,arguments)||'');
    if(window.state&&state.tab==='documentsArchive'){
      html=html.replace(/class="nav-item ([^"]*)" data-action="tab" data-tab="more"/,function(_,classes){classes=String(classes||'').replace(/\bactive\b/g,'').trim();return 'class="nav-item active '+classes+'" data-action="tab" data-tab="more"'});
    }
    return html;
  };
  try{window.bottomNav=bottomNav}catch(_){ }
}

if(typeof document!=='undefined'&&document.addEventListener){
  document.addEventListener('click',function(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-ar39110]'):null;if(!b)return;
    var a=b.getAttribute('data-ar39110');
    if(a==='type'){
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      stateFilter().type=b.dataset.type||'all';renderApp();return;
    }
    if(a==='apply'){
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      readFilterDom();renderApp();return;
    }
    if(a==='clear'){
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      state.ar39110ArchiveFilter={type:'all',status:'all',customerId:'',from:'',to:'',minAmount:'',maxAmount:'',query:''};renderApp();return;
    }
    if(a==='open'){
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      openDocument(findRow(b.dataset.id,b.dataset.kind));return;
    }
  },true);

  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter'||!e.target||e.target.id!=='ar39110Query')return;
    e.preventDefault();readFilterDom();renderApp();
  },true);

  document.addEventListener('input',function(e){
    var t=e.target;if(!t)return;
    if(t.id==='ar39110Min'||t.id==='ar39110Max')try{if(typeof formatMoneyField==='function')formatMoneyField(t)}catch(_){ }
  },true);
}

installStyle();
window.AlanRangDocumentsStage2V39110={version:STAGE2_VERSION,filteredRows:filteredRows,archivePage:archivePage,kindLabel:kindLabel,statusLabel:statusLabel,openDocument:openDocument,findRow:findRow};
})();
/* ===== AlanRang Pro v39.11.0 Stage 3 — Per-document stamp/signature policy ===== */
(function(){
'use strict';
if(window.__ALANRANG_DOCUMENT_IDENTITY_V39110_STAGE3__)return;
window.__ALANRANG_DOCUMENT_IDENTITY_V39110_STAGE3__=true;

var DOC_API=window.AlanRangDocumentsV39110;
var UI_API=window.AlanRangDocumentsStage2V39110;
if(!DOC_API||typeof DOC_API.buildAll!=='function')return;
var STAGE3_VERSION='39.11.0-documents-stage3-v01';

function str(v){return String(v==null?'':v).trim()}
function eq(a,b){return String(a==null?'':a)===String(b==null?'':b)}
function clone(v){try{return JSON.parse(JSON.stringify(v))}catch(_){return v}}
function esc3(v){try{return typeof safe==='function'?safe(v):String(v==null?'':v)}catch(_){return String(v==null?'':v)}}
function attr3(v){try{return typeof safeAttr==='function'?safeAttr(v):esc3(v)}catch(_){return esc3(v)}}
function rawDocument(id,kind){
  var d=window.data||{},list=[];
  if(kind==='executionInvoice')list=Array.isArray(d.invoices)?d.invoices:[];
  else if(kind==='proforma')list=Array.isArray(d.proformas)?d.proformas:[];
  else if(kind==='invoiceAdjustment')list=Array.isArray(d.invoiceAdjustments)?d.invoiceAdjustments:[];
  else return null;
  return list.find(function(x){return x&&eq(x.id,id)})||null;
}
function rowById(id,kind){
  if(UI_API&&typeof UI_API.findRow==='function')return UI_API.findRow(id,kind);
  return DOC_API.buildAll().find(function(r){return r&&eq(r.id,id)&&(!kind||eq(r.kind,kind))})||null;
}
function settings(){return (window.data&&data.settings)||{}}
function assets(type){var s=settings();return Array.isArray(s[type])?s[type].filter(Boolean):[]}
function assetById(type,id){return assets(type).find(function(x){return x&&eq(x.id,id)})||null}
function activeAsset(type,activeKey){var s=settings(),id=str(s[activeKey]);return assetById(type,id)||assets(type).find(function(x){return x&&x.isActive})||assets(type)[0]||null}
function normalizePolicy(input){
  var p=input&&typeof input==='object'?input:{},mode=p.mode==='none'?'none':p.mode==='custom'?'custom':'inherit';
  if(mode==='inherit')return {mode:'inherit'};
  if(mode==='none')return {mode:'none'};
  var stampId=str(p.stampId),signatureId=str(p.signatureId);
  return {mode:'custom',stampId:stampId,signatureId:signatureId,showStamp:p.showStamp!==false&&!!stampId,showSignature:p.showSignature!==false&&!!signatureId};
}
function currentPolicy(raw){return normalizePolicy(raw&&raw.documentIdentity)}
function effectiveLabel(raw){
  var i=DOC_API.effectiveIdentity(raw)||{};
  if(i.mode==='none')return 'بدون مهر و امضا';
  if(i.mode==='custom'){
    if(i.showStamp&&i.showSignature)return 'مهر و امضای اختصاصی';
    if(i.showStamp)return 'مهر اختصاصی';
    if(i.showSignature)return 'امضای اختصاصی';
    return 'بدون مهر و امضا';
  }
  return 'پیش‌فرض عمومی برنامه';
}
function persistPresentationOnly(){
  try{if(typeof saveData==='function')saveData()}catch(e){console.error('v39.11 stage3 identity save',e);return false}
  try{var engine=window.AlanRangDocumentEngineV2;if(engine&&typeof engine.clearExportCache==='function')engine.clearExportCache()}catch(_){ }
  try{if(typeof nativePrimeKeys!=='undefined'&&nativePrimeKeys&&nativePrimeKeys.clear)nativePrimeKeys.clear()}catch(_){ }
  return true;
}
function setDocumentIdentity(id,kind,policy,shouldPersist){
  if(kind==='accountAdjustment')return {ok:false,error:'unsupported-document'};
  var raw=rawDocument(id,kind);if(!raw)return {ok:false,error:'document-not-found'};
  var p=normalizePolicy(policy);
  if(p.mode==='custom'){
    if(!p.stampId&&!p.signatureId)return {ok:false,error:'custom-empty'};
    if(p.stampId&&!assetById('stamps',p.stampId))return {ok:false,error:'stamp-not-found'};
    if(p.signatureId&&!assetById('signatures',p.signatureId))return {ok:false,error:'signature-not-found'};
  }
  if(p.mode==='inherit')delete raw.documentIdentity;
  else if(p.mode==='none')raw.documentIdentity={mode:'none',identityUpdatedAt:new Date().toISOString()};
  else raw.documentIdentity={mode:'custom',stampId:p.stampId,signatureId:p.signatureId,showStamp:p.showStamp,showSignature:p.showSignature,identityUpdatedAt:new Date().toISOString()};
  // Presentation-only metadata intentionally does not touch raw.updatedAt.
  // That timestamp participates in canonical duplicate selection and ledger ordering.
  if(shouldPersist!==false&&!persistPresentationOnly())return {ok:false,error:'save-failed'};
  return {ok:true,policy:currentPolicy(raw),effective:DOC_API.effectiveIdentity(raw),raw:raw};
}
function optionList(type,selectedId,emptyLabel){
  var list=assets(type),out='<option value="">'+esc3(emptyLabel)+'</option>';
  list.forEach(function(x){out+='<option value="'+attr3(x.id)+'"'+(eq(x.id,selectedId)?' selected':'')+'>'+esc3(x.name||x.id||'بدون نام')+'</option>'});
  return out;
}
function kindLabel3(kind){
  try{if(UI_API&&typeof UI_API.kindLabel==='function')return UI_API.kindLabel(kind)}catch(_){ }
  return kind==='executionInvoice'?'فاکتور اجرا':kind==='proforma'?'پیش‌فاکتور':kind==='invoiceAdjustment'?'اصلاح / برگشت فاکتور':'سند';
}
function identityModal(){
  var t=state&&state.ar39110IdentityTarget||{},row=rowById(t.id,t.kind),raw=rawDocument(t.id,t.kind);
  if(!row||!raw)return '<div class="modal-back"><div class="modal ar39110-id-modal"><h3>مهر و امضای سند</h3><p>سند پیدا نشد.</p><button class="btn ghost full" data-action="closeModal">بستن</button></div></div>';
  var p=currentPolicy(raw),s=settings(),globalStamp=activeAsset('stamps','activeStampId'),globalSign=activeAsset('signatures','activeSignatureId');
  var stampId=p.mode==='custom'?p.stampId:(globalStamp&&globalStamp.id||''),signatureId=p.mode==='custom'?p.signatureId:(globalSign&&globalSign.id||'');
  var globalText=s.showStampSignature===false?'نمایش عمومی مهر و امضا خاموش است.':'مهر عمومی: '+esc3(globalStamp&&globalStamp.name||'ندارد')+' • امضای عمومی: '+esc3(globalSign&&globalSign.name||'ندارد');
  return '<div class="modal-back"><div class="modal ar39110-id-modal" data-ar39110-identity-mode="'+attr3(p.mode)+'">'+
    '<h3>مهر و امضای این سند</h3><p class="ar39110-id-sub">'+esc3(kindLabel3(row.kind))+' '+esc3(row.number||'')+' • '+esc3(row.customerName||'')+'</p>'+
    '<div class="ar39110-id-current"><b>وضعیت فعلی: '+esc3(effectiveLabel(raw))+'</b><span>'+globalText+'</span></div>'+
    '<div class="ar39110-id-modes">'+
      '<label><input type="radio" name="ar39110IdentityMode" value="inherit" '+(p.mode==='inherit'?'checked':'')+'><b>استفاده از پیش‌فرض برنامه</b><small>هر زمان مهر یا امضای عمومی عوض شود، این سند هم از همان پیش‌فرض استفاده می‌کند.</small></label>'+
      '<label><input type="radio" name="ar39110IdentityMode" value="custom" '+(p.mode==='custom'?'checked':'')+'><b>انتخاب اختصاصی برای همین سند</b><small>بدون تغییر تنظیم عمومی، مهر و/یا امضای دلخواه فقط روی همین سند استفاده می‌شود.</small></label>'+
      '<label><input type="radio" name="ar39110IdentityMode" value="none" '+(p.mode==='none'?'checked':'')+'><b>بدون مهر و امضا</b><small>Preview، JPG و PDF این سند بدون مهر و امضا ساخته می‌شوند.</small></label>'+
    '</div>'+
    '<div id="ar39110IdentityCustom" class="ar39110-id-custom" '+(p.mode==='custom'?'':'hidden')+'>'+
      '<div class="field"><label>مهر اختصاصی</label><select id="ar39110IdentityStamp" class="select">'+optionList('stamps',stampId,'بدون مهر')+'</select></div>'+
      '<div class="field"><label>امضای اختصاصی</label><select id="ar39110IdentitySignature" class="select">'+optionList('signatures',signatureId,'بدون امضا')+'</select></div>'+
      '<div class="ar39110-id-note">می‌توانی فقط مهر، فقط امضا یا هر دو را برای این سند انتخاب کنی.</div>'+
    '</div>'+
    '<div class="ar39110-id-safety">این تغییر فقط ظاهر همین سند را عوض می‌کند؛ مبلغ، مانده مشتری، تاریخ حسابداری، شماره سند و تنظیم عمومی مهر/امضا دست‌نخورده می‌مانند.</div>'+
    '<div class="grid2"><button class="btn gold" data-ar39110-stage3="save">ذخیره برای همین سند</button><button class="btn ghost" data-action="closeModal">انصراف</button></div>'+
  '</div></div>';
}
function openIdentity(id,kind){
  var row=rowById(id,kind);if(!row||row.kind==='accountAdjustment')return false;
  state.ar39110IdentityTarget={id:row.id,kind:row.kind};state.modal='ar39110DocumentIdentity';
  try{if(typeof renderApp==='function')renderApp()}catch(_){ }
  return true;
}
function syncModeUi(){
  try{var checked=document.querySelector('input[name="ar39110IdentityMode"]:checked'),box=document.getElementById('ar39110IdentityCustom');if(box)box.hidden=!checked||checked.value!=='custom'}catch(_){ }
}
function saveIdentityFromModal(){
  var t=state&&state.ar39110IdentityTarget||{},modeEl=document.querySelector('input[name="ar39110IdentityMode"]:checked'),mode=modeEl&&modeEl.value||'inherit';
  var stamp=(document.getElementById('ar39110IdentityStamp')||{}).value||'',signature=(document.getElementById('ar39110IdentitySignature')||{}).value||'';
  var result=setDocumentIdentity(t.id,t.kind,{mode:mode,stampId:stamp,signatureId:signature,showStamp:!!stamp,showSignature:!!signature},true);
  if(!result.ok){
    var msg=result.error==='custom-empty'?'برای حالت اختصاصی حداقل مهر یا امضا انتخاب کن.':result.error==='stamp-not-found'?'مهر انتخاب‌شده دیگر موجود نیست.':result.error==='signature-not-found'?'امضای انتخاب‌شده دیگر موجود نیست.':'ذخیره تنظیم سند انجام نشد.';
    try{if(typeof showToast==='function')showToast(msg)}catch(_){ }return false;
  }
  state.modal=null;state.ar39110IdentityTarget=null;
  try{if(typeof showToast==='function')showToast('مهر و امضای همین سند ذخیره شد');else if(typeof renderApp==='function')renderApp()}catch(_){ }
  return true;
}
function previewArchiveRow(){
  if(!window.state||state.tab!=='preview'||!state.previewInvoiceId||state.previewInvoiceId==='draft')return null;
  var id=String(state.previewInvoiceId);return DOC_API.buildAll().find(function(r){return r&&r.kind!=='accountAdjustment'&&String(r.id)===id})||null;
}
function injectPreviewIdentityButton(){
  try{
    var row=previewArchiveRow(),actions=document.querySelector('.invoice-actions-under-preview');if(!row||!actions||actions.querySelector('[data-ar39110-stage3="identity"]'))return;
    var b=document.createElement('button');b.className='btn ghost';b.setAttribute('data-ar39110-stage3','identity');b.setAttribute('data-id',row.id);b.setAttribute('data-kind',row.kind);b.textContent='مهر و امضای این سند';actions.insertBefore(b,actions.firstChild||null);
  }catch(e){console.error('v39.11 stage3 preview identity',e)}
}
function installStage3Style(){
  if(typeof document==='undefined'||!document.head||document.getElementById('ar39110-stage3-style'))return;
  var s=document.createElement('style');s.id='ar39110-stage3-style';s.textContent=`
.ar39110-id-modal{max-width:620px}.ar39110-id-modal h3{margin-bottom:4px;color:#0f2740}.ar39110-id-sub{margin:0 0 10px;color:#64748b;font-size:11px;line-height:1.8}.ar39110-id-current{background:#071e34;color:#fff;border:1px solid #d79b22;border-radius:14px;padding:10px 12px;margin-bottom:10px}.ar39110-id-current b,.ar39110-id-current span{display:block}.ar39110-id-current b{color:#f4c752}.ar39110-id-current span{font-size:10px;margin-top:5px;line-height:1.8;color:#dbe7f2}.ar39110-id-modes{display:grid;gap:7px;margin:10px 0}.ar39110-id-modes label{display:grid;grid-template-columns:auto 1fr;column-gap:8px;align-items:start;border:1px solid #dfe6ee;border-radius:14px;padding:10px;background:#fff}.ar39110-id-modes input{margin-top:4px}.ar39110-id-modes b,.ar39110-id-modes small{grid-column:2}.ar39110-id-modes b{color:#17324d}.ar39110-id-modes small{color:#64748b;font-size:9.5px;line-height:1.75;margin-top:3px}.ar39110-id-custom{background:#f8fafc;border:1px solid #dbe4ee;border-radius:15px;padding:10px;margin:9px 0}.ar39110-id-custom[hidden]{display:none!important}.ar39110-id-note{font-size:9.5px;color:#64748b;line-height:1.8}.ar39110-id-safety{background:#ecfdf3;border:1px solid #a7f3d0;color:#166534;border-radius:13px;padding:9px 11px;font-size:9.5px;font-weight:850;line-height:1.85;margin:10px 0}.invoice-actions-under-preview [data-ar39110-stage3="identity"]{grid-column:1/-1;border-color:#d79b22!important;color:#7c5704!important;background:#fffdf5!important}`;document.head.appendChild(s);
}

// Invoice-adjustment previews are virtual objects created by v39.9.0. Attach the
// stored presentation policy without changing the immutable accounting record.
if(typeof window.invoiceById==='function'&&!window.__ALANRANG_V39110_ADJUSTMENT_IDENTITY_BRIDGE__){
  window.__ALANRANG_V39110_ADJUSTMENT_IDENTITY_BRIDGE__=true;
  var baseInvoiceById=window.invoiceById;
  window.invoiceById=function(id){
    var inv=baseInvoiceById(id);
    if(inv&&inv.documentType==='invoiceAdjustmentPreview'){
      var rows=(window.data&&Array.isArray(data.invoiceAdjustments))?data.invoiceAdjustments:[],raw=rows.find(function(x){return x&&eq(x.id,id)});
      if(raw&&raw.documentIdentity)inv.documentIdentity=clone(raw.documentIdentity);
    }
    return inv;
  };
}

try{registerAlanRangModal('v39110-document-identity-stage3',function(){return state&&state.modal==='ar39110DocumentIdentity'?identityModal():null})}catch(_){ }
try{registerAlanRangAfterRender('v39110-document-identity-preview-stage3',function(){setTimeout(function(){injectPreviewIdentityButton();syncModeUi()},0)})}catch(_){ }

if(typeof document!=='undefined'&&document.addEventListener){
  document.addEventListener('click',function(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-ar39110-stage3]'):null;if(!b)return;
    var a=b.getAttribute('data-ar39110-stage3');
    if(a==='identity'){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();openIdentity(b.dataset.id,b.dataset.kind);return}
    if(a==='save'){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();saveIdentityFromModal();return}
  },true);
  document.addEventListener('change',function(e){if(e.target&&e.target.name==='ar39110IdentityMode')syncModeUi()},true);
}

installStage3Style();
window.AlanRangDocumentIdentityV39110={version:STAGE3_VERSION,rawDocument:rawDocument,rowById:rowById,normalizePolicy:normalizePolicy,currentPolicy:currentPolicy,setDocumentIdentity:setDocumentIdentity,identityModal:identityModal,openIdentity:openIdentity,effectiveLabel:effectiveLabel,injectPreviewIdentityButton:injectPreviewIdentityButton};
})();
/* ===== AlanRang Pro v39.11.0 Stage 4 — Archive quick actions, smart views and sorting ===== */
(function(){
'use strict';
if(window.__ALANRANG_DOCUMENT_ARCHIVE_V39110_STAGE4__)return;
window.__ALANRANG_DOCUMENT_ARCHIVE_V39110_STAGE4__=true;

var DOC_API=window.AlanRangDocumentsV39110;
var UI_API=window.AlanRangDocumentsStage2V39110;
var ID_API=window.AlanRangDocumentIdentityV39110;
if(!DOC_API||!UI_API||typeof UI_API.archivePage!=='function')return;
var STAGE4_VERSION='39.11.0-documents-stage4-v01';

function str(v){return String(v==null?'':v).trim()}
function eq(a,b){return String(a==null?'':a)===String(b==null?'':b)}
function esc4(v){try{return typeof safe==='function'?safe(v):String(v==null?'':v)}catch(_){return String(v==null?'':v)}}
function attr4(v){try{return typeof safeAttr==='function'?safeAttr(v):esc4(v)}catch(_){return esc4(v)}}
function fa4(v){try{return typeof faDigits==='function'?faDigits(v):String(v)}catch(_){return String(v)}}
function mon4(v){try{return typeof money==='function'?money(Math.round(Number(v)||0)):String(Math.round(Number(v)||0))+' تومان'}catch(_){return String(v||0)+' تومان'}}
function archiveFilter4(){
  if(!window.state)window.state={};
  var f=state.ar39110ArchiveFilter;
  if(!f||typeof f!=='object')f={type:'all',status:'all',customerId:'',from:'',to:'',minAmount:'',maxAmount:'',query:''};
  if(!f.sort)f.sort='newest';
  state.ar39110ArchiveFilter=f;
  return f;
}
function compareTextFa(a,b){return String(a||'').localeCompare(String(b||''),'fa')}
function sortRows(rows,sort){
  var out=(Array.isArray(rows)?rows:[]).slice(),mode=sort||'newest';
  out.sort(function(a,b){
    var ad=Number(a&&a.dateSerial||0),bd=Number(b&&b.dateSerial||0),as=Number(a&&a.sortStamp||0),bs=Number(b&&b.sortStamp||0);
    if(mode==='oldest')return ad-bd||as-bs||compareTextFa(a&&a.number,b&&b.number);
    if(mode==='amountDesc')return Number(b&&b.amount||0)-Number(a&&a.amount||0)||bd-ad||bs-as;
    if(mode==='amountAsc')return Number(a&&a.amount||0)-Number(b&&b.amount||0)||bd-ad||bs-as;
    if(mode==='customer')return compareTextFa(a&&a.customerName,b&&b.customerName)||bd-ad||compareTextFa(a&&a.number,b&&b.number);
    if(mode==='number')return compareTextFa(a&&a.number,b&&b.number)||bd-ad;
    return bd-ad||bs-as||compareTextFa(b&&b.number,a&&a.number);
  });
  return out;
}
var baseFilter4=DOC_API.filter;
if(typeof baseFilter4==='function'&&!DOC_API.__stage4SortWrapped){
  DOC_API.__stage4SortWrapped=true;
  DOC_API.filter=function(options){
    return sortRows(baseFilter4.call(DOC_API,options),archiveFilter4().sort);
  };
}
function quickViewKey(f){
  f=f||archiveFilter4();
  if(f.type==='proforma'&&f.status==='open')return 'action';
  if(f.type==='invoice'&&f.status==='all')return 'final';
  if(f.type==='proforma'&&f.status==='converted')return 'converted';
  if(f.type==='adjustment'&&f.status==='all')return 'adjustments';
  if(f.type==='all'&&f.status==='all')return 'all';
  return 'custom';
}
function quickViewCounts(){
  var all=DOC_API.buildAll(),out={all:all.length,action:0,final:0,converted:0,adjustments:0};
  all.forEach(function(r){
    if(r.kind==='proforma'&&r.status==='open')out.action++;
    if(r.kind==='executionInvoice')out.final++;
    if(r.kind==='proforma'&&r.status==='converted')out.converted++;
    if(r.kind==='invoiceAdjustment'||r.kind==='accountAdjustment')out.adjustments++;
  });
  return out;
}
function applyQuickView(key){
  var f=archiveFilter4();
  if(key==='action'){f.type='proforma';f.status='open'}
  else if(key==='final'){f.type='invoice';f.status='all'}
  else if(key==='converted'){f.type='proforma';f.status='converted'}
  else if(key==='adjustments'){f.type='adjustment';f.status='all'}
  else {f.type='all';f.status='all'}
  return f;
}
function sortOptions(value){
  var rows=[
    ['newest','جدیدترین سندها'],
    ['oldest','قدیمی‌ترین سندها'],
    ['amountDesc','بیشترین مبلغ'],
    ['amountAsc','کمترین مبلغ'],
    ['customer','نام مشتری'],
    ['number','شماره سند']
  ];
  return rows.map(function(x){return '<option value="'+x[0]+'"'+(eq(x[0],value)?' selected':'')+'>'+x[1]+'</option>'}).join('');
}
function quickBarHtml(){
  var f=archiveFilter4(),active=quickViewKey(f),c=quickViewCounts();
  var views=[
    ['all','همه',c.all],
    ['action','نیاز به اقدام',c.action],
    ['final','فاکتور قطعی',c.final],
    ['converted','تبدیل‌شده',c.converted],
    ['adjustments','اصلاحات',c.adjustments]
  ];
  return '<section class="ar39110-stage4-toolbar">'+
    '<div class="ar39110-stage4-toolbar-head"><div><h3>نمایش سریع آرشیو</h3><p>فقط نوع نمایش و ترتیب اسناد را عوض می‌کند؛ هیچ سند یا مانده‌ای تغییر نمی‌کند.</p></div>'+
    '<div class="field ar39110-stage4-sort"><label>مرتب‌سازی</label><select id="ar39110Sort" class="select">'+sortOptions(f.sort)+'</select></div></div>'+
    '<div class="ar39110-stage4-views">'+views.map(function(x){return '<button class="'+(active===x[0]?'active':'')+'" data-ar39110-stage4="quickView" data-view="'+x[0]+'"><span>'+x[1]+'</span><b>'+fa4(x[2])+'</b></button>'}).join('')+'</div>'+
  '</section>';
}
function addQuickActionButtons(html){
  return String(html||'').replace(/<div class="ar39110-doc-actions">([\s\S]*?)<\/div><\/article>/g,function(full,actions){
    var m=String(actions).match(/data-ar39110="open" data-id="([^"]*)" data-kind="([^"]*)"/);
    if(!m)return full;
    return '<div class="ar39110-doc-actions">'+actions+'<button class="btn ar39110-more-btn" data-ar39110-stage4="menu" data-id="'+m[1]+'" data-kind="'+m[2]+'">عملیات سریع</button></div></article>';
  });
}
function archivePage4(){
  var html=UI_API.archivePage();
  html=String(html||'').replace('<section class="ar39110-filter-card">',quickBarHtml()+'<section class="ar39110-filter-card">');
  return addQuickActionButtons(html);
}
function rowById4(id,kind){
  try{if(typeof UI_API.findRow==='function')return UI_API.findRow(id,kind)}catch(_){ }
  return DOC_API.buildAll().find(function(r){return r&&eq(r.id,id)&&(!kind||eq(r.kind,kind))})||null;
}
function kindLabel4(row){
  try{return UI_API.kindLabel(row&&row.kind)||'سند'}catch(_){return 'سند'}
}
function statusLabel4(row){
  try{return UI_API.statusLabel(row)||'ثبت‌شده'}catch(_){return 'ثبت‌شده'}
}
function quickTarget(){
  var t=state&&state.ar39110QuickTarget||{};
  return rowById4(t.id,t.kind);
}
function actionButton(label,action,row,cls){
  return '<button class="btn '+(cls||'ghost')+'" data-ar39110-stage4="'+action+'" data-id="'+attr4(row.id)+'" data-kind="'+attr4(row.kind)+'">'+label+'</button>';
}
function quickMenuModal(){
  var row=quickTarget();
  if(!row)return '<div class="modal-back"><div class="modal ar39110-quick-modal"><h3>عملیات سریع</h3><p>سند پیدا نشد.</p><button class="btn ghost full" data-action="closeModal">بستن</button></div></div>';
  var buttons=[];
  buttons.push(actionButton('باز کردن سند','open',row,'blue'));
  if(row.customerId)buttons.push(actionButton('حساب مشتری','customer',row,'ghost'));
  if(row.kind!=='accountAdjustment'){
    buttons.push(actionButton('ارسال عکس','shareImage',row,'green'));
    buttons.push(actionButton('ارسال PDF','sharePdf',row,'gold'));
    buttons.push(actionButton('مهر و امضای این سند','identity',row,'ghost'));
  }
  if(row.kind==='executionInvoice')buttons.push(actionButton('کپی برای فاکتور جدید','copyInvoice',row,'ghost'));
  if(row.kind==='proforma'&&row.status==='open')buttons.push(actionButton('تبدیل به فاکتور اجرا','convert',row,'gold'));
  if(row.kind==='proforma'&&row.status==='converted'&&row.convertedInvoiceId)buttons.push(actionButton('باز کردن فاکتور نهایی','openFinal',row,'blue'));
  if(row.kind==='invoiceAdjustment'&&row.sourceInvoiceId)buttons.push(actionButton('باز کردن فاکتور مرجع','openSource',row,'ghost'));
  buttons.push(actionButton('کپی مشخصات سند','copyInfo',row,'ghost'));
  return '<div class="modal-back"><div class="modal ar39110-quick-modal">'+
    '<div class="ar39110-quick-head"><div><h3>عملیات سریع سند</h3><p>'+esc4(kindLabel4(row))+' '+esc4(row.number||'')+' • '+esc4(row.customerName||'بدون مشتری')+'</p></div><span>'+esc4(statusLabel4(row))+'</span></div>'+
    '<div class="ar39110-quick-summary"><div><small>تاریخ</small><b>'+esc4(row.date||'—')+'</b></div><div><small>مبلغ</small><b>'+esc4(mon4(row.amount||0))+'</b></div></div>'+
    '<div class="ar39110-quick-actions">'+buttons.join('')+'</div>'+
    '<div class="ar39110-quick-safe">این منو فقط از عملیات موجود برنامه استفاده می‌کند و هیچ حذف، تغییر مبلغ یا تغییر مانده‌ای از داخل آرشیو انجام نمی‌دهد.</div>'+
    '<button class="btn ghost full" data-action="closeModal">بستن</button>'+
  '</div></div>';
}
function openQuickMenu(id,kind){
  var row=rowById4(id,kind);if(!row)return false;
  state.ar39110QuickTarget={id:row.id,kind:row.kind};state.modal='ar39110QuickDocumentMenu';
  try{if(typeof renderApp==='function')renderApp()}catch(_){ }
  return true;
}
function closeQuickState(){try{state.modal=null;state.ar39110QuickTarget=null}catch(_){ }}
function openCustomer4(row){
  if(!row||!row.customerId)return false;
  state.selectedCustomerId=row.customerId;state.customerProfileTab='summary';state.modal=null;state.tab='account';
  try{if(typeof renderApp==='function')renderApp()}catch(_){ }
  return true;
}
function openPreviewThen(row,fn){
  if(!row||row.kind==='accountAdjustment')return false;
  state.selectedCustomerId=row.customerId||state.selectedCustomerId||null;state.previewInvoiceId=row.id;state.modal=null;state.tab='preview';
  try{if(typeof renderApp==='function')renderApp()}catch(_){ }
  setTimeout(function(){try{if(typeof fn==='function')fn()}catch(e){console.error('v39.11 stage4 preview action',e)}},80);
  return true;
}
function shareImage4(row){return openPreviewThen(row,function(){if(typeof shareInvoiceAsImage==='function')shareInvoiceAsImage()})}
function sharePdf4(row){return openPreviewThen(row,function(){if(typeof shareInvoiceAsPdf==='function')shareInvoiceAsPdf()})}
function copyInvoice4(row){return openPreviewThen(row,function(){if(typeof copyInvoiceInternal==='function')copyInvoiceInternal()})}
function convertProforma4(row){
  var api=window.AlanRangAccountingDocumentsV3990;
  if(!row||row.kind!=='proforma'||row.status!=='open'||!api||typeof api.convertProforma!=='function')return false;
  closeQuickState();api.convertProforma(row.id);return true;
}
function openFinal4(row){
  if(!row||row.kind!=='proforma'||!row.convertedInvoiceId)return false;
  var target=rowById4(row.convertedInvoiceId,'executionInvoice');if(!target)return false;
  closeQuickState();return UI_API.openDocument(target);
}
function openSource4(row){
  if(!row||row.kind!=='invoiceAdjustment'||!row.sourceInvoiceId)return false;
  var target=rowById4(row.sourceInvoiceId,'executionInvoice');if(!target)return false;
  closeQuickState();return UI_API.openDocument(target);
}
function infoText4(row){
  var parts=[
    'آلان رنگ — '+kindLabel4(row),
    row.number?'شماره: '+row.number:'',
    row.customerName?'مشتری: '+row.customerName:'',
    row.date?'تاریخ: '+row.date:'',
    'مبلغ: '+mon4(row.amount||0),
    'وضعیت: '+statusLabel4(row)
  ];
  if(row.sourceInvoiceNumber)parts.push('فاکتور مرجع: '+row.sourceInvoiceNumber);
  return parts.filter(Boolean).join('\n');
}
function copyInfo4(row){
  if(!row)return false;var value=infoText4(row),done=false;
  try{if(typeof copyTextToClipboard==='function'){copyTextToClipboard(value,'مشخصات سند کپی شد');done=true}}catch(_){ }
  if(!done&&navigator&&navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(value).then(function(){try{if(typeof showToast==='function')showToast('مشخصات سند کپی شد')}catch(_){ }}).catch(function(){});
    done=true;
  }
  if(done)closeQuickState();
  return done;
}
function handleQuickAction(action,row){
  if(!row)return false;
  if(action==='open'){closeQuickState();return UI_API.openDocument(row)}
  if(action==='customer')return openCustomer4(row);
  if(action==='shareImage')return shareImage4(row);
  if(action==='sharePdf')return sharePdf4(row);
  if(action==='identity'){closeQuickState();return ID_API&&typeof ID_API.openIdentity==='function'?ID_API.openIdentity(row.id,row.kind):false}
  if(action==='copyInvoice')return copyInvoice4(row);
  if(action==='convert')return convertProforma4(row);
  if(action==='openFinal')return openFinal4(row);
  if(action==='openSource')return openSource4(row);
  if(action==='copyInfo')return copyInfo4(row);
  return false;
}
function installStage4Style(){
  if(typeof document==='undefined'||!document.head||document.getElementById('ar39110-stage4-style'))return;
  var s=document.createElement('style');s.id='ar39110-stage4-style';s.textContent=`
.ar39110-stage4-toolbar{background:#fff;border:1px solid #dfe6ee;border-radius:21px;padding:13px;margin-bottom:12px;box-shadow:0 8px 20px rgba(15,39,64,.045)}.ar39110-stage4-toolbar-head{display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:12px;align-items:end}.ar39110-stage4-toolbar h3{margin:0;color:#102a43}.ar39110-stage4-toolbar p{margin:5px 0 0;color:#64748b;font-size:9.5px;line-height:1.8}.ar39110-stage4-sort{margin:0}.ar39110-stage4-views{display:flex;gap:7px;overflow:auto;padding:10px 0 2px;scrollbar-width:none}.ar39110-stage4-views::-webkit-scrollbar{display:none}.ar39110-stage4-views button{border:1px solid #d7e0e9;background:#f8fafc;color:#334155;border-radius:13px;min-height:42px;padding:7px 10px;display:flex;align-items:center;gap:7px;font-weight:900;white-space:nowrap}.ar39110-stage4-views button b{display:inline-flex;min-width:22px;height:22px;border-radius:999px;background:#e8eef5;align-items:center;justify-content:center;font-size:9px}.ar39110-stage4-views button.active{background:#071e34;color:#f4c752;border-color:#d79b22}.ar39110-stage4-views button.active b{background:rgba(244,199,82,.16);color:#f4c752}.ar39110-more-btn{background:#f8fafc!important;color:#334155!important;border:1px dashed #94a3b8!important}.ar39110-quick-modal{max-width:620px}.ar39110-quick-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.ar39110-quick-head h3{margin:0;color:#0f2740}.ar39110-quick-head p{margin:5px 0 0;color:#64748b;font-size:10px;line-height:1.8}.ar39110-quick-head>span{background:#071e34;color:#f4c752;border:1px solid #d79b22;border-radius:999px;padding:6px 9px;font-size:9px;font-weight:900;white-space:nowrap}.ar39110-quick-summary{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.ar39110-quick-summary>div{background:#f8fafc;border:1px solid #dfe6ee;border-radius:13px;padding:10px}.ar39110-quick-summary small,.ar39110-quick-summary b{display:block}.ar39110-quick-summary small{color:#64748b;font-size:9px}.ar39110-quick-summary b{color:#0f2740;margin-top:4px}.ar39110-quick-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ar39110-quick-safe{background:#ecfdf3;border:1px solid #a7f3d0;color:#166534;border-radius:13px;padding:9px 11px;font-size:9.5px;font-weight:850;line-height:1.85;margin:11px 0}@media(max-width:520px){.ar39110-stage4-toolbar-head{grid-template-columns:1fr}.ar39110-quick-actions{grid-template-columns:1fr}.ar39110-quick-head{flex-direction:column}.ar39110-quick-head>span{align-self:flex-start}}@media print{.ar39110-stage4-toolbar,.ar39110-more-btn{display:none!important}}`;
  document.head.appendChild(s);
}
try{registerAlanRangRoute('v39110-document-archive-stage4',function(){if(!window.state||state.tab!=='documentsArchive')return false;app.innerHTML=baseLayout(archivePage4());return true})}catch(_){ }
try{registerAlanRangModal('v39110-document-archive-quick-menu-stage4',function(){return state&&state.modal==='ar39110QuickDocumentMenu'?quickMenuModal():null})}catch(_){ }

if(typeof document!=='undefined'&&document.addEventListener){
  document.addEventListener('change',function(e){
    if(!e.target||e.target.id!=='ar39110Sort')return;
    archiveFilter4().sort=e.target.value||'newest';
    try{if(typeof renderApp==='function')renderApp()}catch(_){ }
  },true);
  document.addEventListener('click',function(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-ar39110-stage4]'):null;if(!b)return;
    var action=b.getAttribute('data-ar39110-stage4');
    if(action==='quickView'){
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      applyQuickView(b.dataset.view||'all');try{if(typeof renderApp==='function')renderApp()}catch(_){ }return;
    }
    if(action==='menu'){
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      openQuickMenu(b.dataset.id,b.dataset.kind);return;
    }
    var row=rowById4(b.dataset.id,b.dataset.kind);
    if(!row)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    handleQuickAction(action,row);
  },true);
}
installStage4Style();
window.AlanRangDocumentArchiveStage4V39110={
  version:STAGE4_VERSION,
  archiveFilter:archiveFilter4,
  sortRows:sortRows,
  quickViewKey:quickViewKey,
  quickViewCounts:quickViewCounts,
  applyQuickView:applyQuickView,
  quickBarHtml:quickBarHtml,
  archivePage:archivePage4,
  rowById:rowById4,
  quickMenuModal:quickMenuModal,
  openQuickMenu:openQuickMenu,
  handleQuickAction:handleQuickAction,
  infoText:infoText4
};
})();


/* ===== AlanRang Pro v39.11.0 Stage 5 — Signed upgrade release marker ===== */
(function(){
  var STAGE5_VERSION='39.11.0-documents-stage5-v01';
  try{
    if(window.AlanRangDocumentArchiveStage4V39110){
      window.AlanRangDocumentArchiveStage5V39110={version:STAGE5_VERSION,upgradeSafe:true,baseline:'v39.10.0-locked'};
    }
  }catch(_){ }
})();
