(function(){
'use strict';
if(window.__ALANRANG_CUSTOMER_ACCOUNT_V39100__)return;
window.__ALANRANG_CUSTOMER_ACCOUNT_V39100__=true;

var VERSION='39.10.0-customer-account-stage1-v01';
var EPSILON=0.5;

function n(v){
  try{if(typeof num==='function')return num(v)}catch(_){ }
  var s=String(v==null?'':v).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(/,/g,'').replace(/[^0-9.\-]/g,'');
  var x=Number(s);return isFinite(x)?x:0;
}
function same(a,b){return String(a==null?'':a)===String(b==null?'':b)}
function customerBy(id){
  try{if(typeof customerById==='function')return customerById(id)}catch(_){ }
  return ((window.data&&Array.isArray(data.customers))?data.customers:[]).find(function(c){return c&&same(c.id,id)})||null;
}
function invoiceKey(inv){
  try{if(typeof invoiceLedgerKey==='function')return invoiceLedgerKey(inv)}catch(_){ }
  if(!inv)return '';
  var cid=String(inv.customerId||''),raw=String(inv.invoiceNumber||'').replace(/[\s\u200c\u200e\u200f]+/g,'').toUpperCase();
  return raw?cid+'|number:'+raw:cid+'|id:'+String(inv.id||'');
}
function canonicalInvoices(customerId){
  var canonical=[];
  try{
    if(typeof canonicalCustomerLedgerEntries==='function')canonical=canonicalCustomerLedgerEntries(customerId).map(function(x){return x&&x.invoice}).filter(Boolean);
  }catch(_){canonical=[]}
  if(canonical.length)return canonical;
  var raw=((window.data&&Array.isArray(data.invoices))?data.invoices:[]).filter(function(inv){return inv&&same(inv.customerId,customerId)}),out=[],byKey={};
  raw.forEach(function(inv,index){
    var key=invoiceKey(inv)||('row:'+index),stamp=Date.parse(inv.updatedAt||inv.createdAt||'')||0,slot=byKey[key];
    if(!slot){slot={index:out.length,stamp:stamp};byKey[key]=slot;out.push(inv);return}
    if(stamp>=slot.stamp){out[slot.index]=inv;slot.stamp=stamp}
  });
  return out;
}
function openingBalance(customer){
  try{if(typeof protectedCustomerOpeningBalance==='function')return n(protectedCustomerOpeningBalance(customer))}catch(_){ }
  return n(customer&&customer.openingBalance);
}
function totals(inv){
  try{if(typeof invoiceTotals==='function')return invoiceTotals(inv)}catch(_){ }
  var totalAmount=((inv&&inv.items)||[]).reduce(function(s,x){return s+n(x&&x.quantity)*n(x&&x.unitPrice)},0);
  var totalPaid=((inv&&inv.payments)||[]).filter(validPayment).reduce(function(s,x){return s+n(x&&x.amount)},0);
  return {totalAmount:totalAmount,totalPaid:totalPaid,remainingAmount:totalAmount-totalPaid};
}
function paymentStatus(p){return String((p&&(p.status||p.checkStatus))||'').trim()}
function validPayment(p){var s=paymentStatus(p);return s.indexOf('برگشتی')<0&&s.indexOf('لغو')<0}
function isCheckPayment(p){var text=[p&&p.method,p&&p.type,p&&p.paymentType,p&&p.checkNumber].filter(Boolean).join(' ');return text.indexOf('چک')>-1||!!(p&&p.checkNumber)}
function effect(row){var amount=Math.abs(n(row&&row.amount));return row&&row.direction==='debit'?amount:-amount}
function invoiceAdjustmentLabel(row){if(!row)return 'اصلاح فاکتور';if(row.adjustmentKind==='increase')return 'اصلاح افزایشی فاکتور';if(row.adjustmentKind==='decrease')return 'اصلاح کاهشی فاکتور';if(row.adjustmentKind==='return')return 'برگشت فاکتور';return 'اصلاح فاکتور'}
function dateSerial(value){
  try{if(typeof parseJalaliDate==='function'){var p=parseJalaliDate(value||'');if(p&&p.jy&&p.jm&&p.jd)return n(p.jy)*10000+n(p.jm)*100+n(p.jd)}}catch(_){ }
  var s=String(value||'').replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}),m=s.match(/((?:13|14)\d{2})\D+(\d{1,2})\D+(\d{1,2})/);
  if(m)return Number(m[1])*10000+Number(m[2])*100+Number(m[3]);
  return 0;
}
function eventStamp(row){return Date.parse((row&&row.createdAt)||(row&&row.updatedAt)||'')||0}
function compareEvents(a,b){
  var ad=dateSerial(a.date),bd=dateSerial(b.date),av=ad||99999999,bv=bd||99999999;
  return av-bv||eventStamp(a)-eventStamp(b)||n(a.order)-n(b.order)||String(a.id||'').localeCompare(String(b.id||''));
}
function adjustmentRows(customerId,key){
  var rows=(window.data&&Array.isArray(data[key]))?data[key]:[];
  return rows.filter(function(x){return x&&same(x.customerId,customerId)})
}
function buildCustomerAccount(customerOrId){
  var customer=typeof customerOrId==='object'&&customerOrId?customerOrId:customerBy(customerOrId);
  if(!customer)return null;
  var invoices=canonicalInvoices(customer.id),events=[],order=0;
  var summary={
    invoiceCount:0,paymentCount:0,checkPaymentCount:0,ignoredPaymentCount:0,
    invoices:0,payments:0,checkPayments:0,cashAndOtherPayments:0,ignoredPayments:0,
    invoiceAdjustments:0,accountAdjustments:0,netAdjustments:0
  };
  invoices.forEach(function(inv){
    var t=totals(inv),invoiceAmount=n(t.totalAmount);
    summary.invoiceCount+=1;summary.invoices+=invoiceAmount;
    events.push({id:inv.id||('invoice_'+order),kind:'invoice',kindLabel:'فاکتور اجرا',customerId:customer.id,invoiceId:inv.id||'',invoiceNumber:inv.invoiceNumber||'',date:inv.date||inv.createdAtJalali||'',createdAt:inv.createdAt||inv.updatedAt||'',amount:invoiceAmount,direction:'debit',note:inv.projectTitle||inv.description||'',order:order++});
    (Array.isArray(inv.payments)?inv.payments:[]).forEach(function(p){
      var amount=Math.abs(n(p&&p.amount));if(!amount)return;
      if(!validPayment(p)){summary.ignoredPaymentCount+=1;summary.ignoredPayments+=amount;return}
      var check=isCheckPayment(p);summary.paymentCount+=1;summary.payments+=amount;if(check){summary.checkPaymentCount+=1;summary.checkPayments+=amount}else summary.cashAndOtherPayments+=amount;
      events.push({id:p.id||('payment_'+order),kind:'payment',kindLabel:check?'دریافت چک':'دریافت',customerId:customer.id,invoiceId:inv.id||'',invoiceNumber:inv.invoiceNumber||'',paymentId:p.id||'',date:p.date||inv.date||'',createdAt:p.createdAt||inv.updatedAt||inv.createdAt||'',amount:-amount,direction:'credit',method:p.method||'',status:paymentStatus(p),note:p.note||'',isCheck:check,order:order++});
    });
  });
  adjustmentRows(customer.id,'invoiceAdjustments').forEach(function(row){
    var amount=effect(row);summary.invoiceAdjustments+=amount;
    events.push({id:row.id||('invoice_adjustment_'+order),kind:'invoiceAdjustment',kindLabel:invoiceAdjustmentLabel(row),customerId:customer.id,invoiceId:row.invoiceId||'',invoiceNumber:row.invoiceNumber||'',documentNumber:row.documentNumber||'',date:row.date||'',createdAt:row.createdAt||row.updatedAt||'',amount:amount,direction:amount>=0?'debit':'credit',note:row.reason||'',order:order++});
  });
  adjustmentRows(customer.id,'accountAdjustments').forEach(function(row){
    var amount=effect(row);summary.accountAdjustments+=amount;
    events.push({id:row.id||('account_adjustment_'+order),kind:'accountAdjustment',kindLabel:'اصلاح دستی مانده',customerId:customer.id,documentNumber:row.documentNumber||'',date:row.date||'',createdAt:row.createdAt||row.updatedAt||'',amount:amount,direction:amount>=0?'debit':'credit',note:row.reason||'',order:order++});
  });
  summary.netAdjustments=summary.invoiceAdjustments+summary.accountAdjustments;
  events.sort(compareEvents);
  var opening=openingBalance(customer),running=opening;
  events.forEach(function(row){running+=n(row.amount);row.running=running});
  var expected=opening+summary.invoices-summary.payments+summary.netAdjustments,stored=n(customer.balance),delta=stored-expected;
  return {
    version:VERSION,customer:customer,customerId:customer.id,openingBalance:opening,
    events:events,summary:summary,expectedBalance:expected,storedBalance:stored,balanceDelta:delta,
    reconciled:Math.abs(delta)<EPSILON,invoiceCount:summary.invoiceCount,
    invariants:{pendingCheckReducesBalance:true,returnedOrCancelledPaymentExcluded:true,proformaExcluded:true,canonicalInvoiceDedup:true,immutableAdjustmentsIncluded:true}
  };
}
function auditAllCustomers(){
  var rows=((window.data&&Array.isArray(data.customers))?data.customers:[]).map(function(c){return buildCustomerAccount(c)}).filter(Boolean);
  return {version:VERSION,total:rows.length,reconciled:rows.filter(function(x){return x.reconciled}).length,mismatched:rows.filter(function(x){return !x.reconciled}).map(function(x){return {customerId:x.customerId,name:x.customer&&x.customer.name||'',storedBalance:x.storedBalance,expectedBalance:x.expectedBalance,delta:x.balanceDelta}}),rows:rows};
}

window.AlanRangCustomerAccountV39100={
  version:VERSION,
  epsilon:EPSILON,
  canonicalInvoices:canonicalInvoices,
  validPayment:validPayment,
  isCheckPayment:isCheckPayment,
  build:buildCustomerAccount,
  auditAll:auditAllCustomers
};
})();

/* ===== AlanRang Pro v39.10.0 Stage 2 — Comprehensive Customer Account UI ===== */
(function(){
'use strict';
if(window.__ALANRANG_CUSTOMER_ACCOUNT_V39100_STAGE2__)return;
window.__ALANRANG_CUSTOMER_ACCOUNT_V39100_STAGE2__=true;

var API=window.AlanRangCustomerAccountV39100;
if(!API||typeof API.build!=='function')return;
var STAGE2_VERSION='39.10.0-customer-account-stage2-v01';

function esc(v){try{return typeof safe==='function'?safe(v):String(v==null?'':v)}catch(_){return String(v==null?'':v)}}
function attr(v){try{return typeof safeAttr==='function'?safeAttr(v):esc(v)}catch(_){return esc(v)}}
function mon(v){try{return typeof money==='function'?money(Math.round(Number(v)||0)):String(Math.round(Number(v)||0))+' تومان'}catch(_){return String(v||0)+' تومان'}}
function fa(v){try{return typeof faDigits==='function'?faDigits(v):String(v)}catch(_){return String(v)}}
function abs(v){v=Number(v)||0;return Math.abs(v)}
function status(v){try{var s=typeof statusOf==='function'?statusOf(Number(v)||0):null;if(s&&s.length)return {label:s[0],cls:s[1]||''}}catch(_){ }v=Number(v)||0;return v<0?{label:'بستانکار',cls:'blue'}:v>0?{label:'بدهکار',cls:'red'}:{label:'تسویه',cls:'green'}}
function signedMoney(v){v=Number(v)||0;return (v>0?'+':v<0?'−':'')+mon(abs(v))}
function eventRef(row){
  if(!row)return '—';
  if(row.kind==='invoice')return row.invoiceNumber||'فاکتور';
  if(row.kind==='payment')return row.invoiceNumber?('فاکتور '+row.invoiceNumber):(row.method||'دریافت');
  if(row.documentNumber)return row.documentNumber;
  if(row.invoiceNumber)return row.invoiceNumber;
  return '—';
}
function eventAction(row){
  var label=esc(eventRef(row));
  if(!row)return label;
  if(row.kind==='invoice'&&row.invoiceId)return '<button class="ar39100-ref" data-action="previewInvoice" data-id="'+attr(row.invoiceId)+'">'+label+'</button>';
  if(row.kind==='payment'&&row.invoiceId&&row.paymentId)return '<button class="ar39100-ref" data-action="openPaymentDetail" data-invoice-id="'+attr(row.invoiceId)+'" data-payment-id="'+attr(row.paymentId)+'">'+label+'</button>';
  if(row.kind==='invoiceAdjustment')return '<button class="ar39100-ref" data-v3990="openInvoiceAdjustmentDetail" data-id="'+attr(row.id)+'">'+label+'</button>';
  if(row.kind==='accountAdjustment')return '<button class="ar39100-ref" data-v3990="openAccountAdjustmentDetail" data-id="'+attr(row.id)+'">'+label+'</button>';
  return label;
}
function reconciliationHtml(a){
  if(a.reconciled)return '<div class="ar39100-reconcile ok"><b>✓ کنترل حساب: بدون اختلاف</b><span>مانده محاسبه‌شده با مانده ذخیره‌شده برنامه مطابقت دارد.</span></div>';
  return '<div class="ar39100-reconcile warn"><b>⚠ اختلاف حساب شناسایی شد</b><span>مانده ذخیره‌شده: '+mon(a.storedBalance)+' — مانده محاسبه‌شده: '+mon(a.expectedBalance)+' — اختلاف: '+signedMoney(a.balanceDelta)+'. هیچ داده‌ای به‌صورت خودکار تغییر نکرده است.</span></div>';
}
function ignoredPaymentsHtml(a){
  var s=a.summary||{};
  if(!(Number(s.ignoredPaymentCount)||0))return '';
  return '<div class="ar39100-ignore"><b>'+fa(s.ignoredPaymentCount)+' دریافت برگشتی/لغوشده از محاسبه کنار گذاشته شد.</b><span>جمع این موارد: '+mon(s.ignoredPayments)+'. این مبلغ در مانده نهایی اثر ندارد.</span></div>';
}
function eventRowsHtml(a){
  var rows=Array.isArray(a.events)?a.events:[];
  if(!rows.length)return '<div class="ar39100-empty">هنوز رویداد مالی برای این مشتری ثبت نشده است.</div>';
  return '<div class="ar39100-ledger-wrap"><table class="ar39100-ledger"><thead><tr><th>تاریخ</th><th>رویداد / مرجع</th><th>بدهکار</th><th>بستانکار</th><th>مانده</th></tr></thead><tbody>'+rows.map(function(r){
    var amount=Number(r.amount)||0,st=status(r.running),note=r.note?'<small>'+esc(r.note)+'</small>':'';
    return '<tr><td>'+esc(r.date||'—')+'</td><td><b>'+esc(r.kindLabel||'رویداد')+'</b>'+eventAction(r)+note+'</td><td class="debit">'+(amount>0?mon(amount):'—')+'</td><td class="credit">'+(amount<0?mon(abs(amount)):'—')+'</td><td><strong>'+mon(abs(r.running))+'</strong><small class="ar39100-status '+esc(st.cls)+'">'+esc(st.label)+'</small></td></tr>';
  }).join('')+'</tbody></table></div>';
}
function comprehensiveHtml(customerOrId){
  var a=API.build(customerOrId);if(!a)return '<div class="ar39100-empty">اطلاعات حساب این مشتری در دسترس نیست.</div>';
  var s=a.summary||{},st=status(a.expectedBalance),adj=Number(s.netAdjustments)||0;
  return '<div class="ar39100-account">'+
    '<div class="ar39100-heading"><div><h3>حساب جامع مشتری</h3><p>تمام فاکتورها، دریافت‌ها، چک‌ها و اسناد اصلاحی از یک موتور مالی واحد محاسبه می‌شوند.</p></div><span class="status '+esc(st.cls)+'">'+esc(st.label)+'</span></div>'+
    '<div class="ar39100-kpis">'+
      '<div class="ar39100-kpi opening"><span>مانده قبلی</span><b>'+mon(a.openingBalance)+'</b><small>مانده انتقالی محافظت‌شده</small></div>'+
      '<div class="ar39100-kpi invoice"><span>جمع فاکتورها</span><b>'+mon(s.invoices)+'</b><small>'+fa(s.invoiceCount||0)+' فاکتور قطعی</small></div>'+
      '<div class="ar39100-kpi payment"><span>جمع دریافت‌ها</span><b>'+mon(s.payments)+'</b><small>'+fa(s.paymentCount||0)+' دریافت معتبر</small></div>'+
      '<div class="ar39100-kpi check"><span>دریافت چک</span><b>'+mon(s.checkPayments)+'</b><small>'+fa(s.checkPaymentCount||0)+' چک معتبر/در انتظار</small></div>'+
      '<div class="ar39100-kpi adjustment"><span>اصلاحات خالص</span><b>'+signedMoney(adj)+'</b><small>برگشت، اصلاح فاکتور و اصلاح مانده</small></div>'+
      '<div class="ar39100-kpi balance"><span>مانده نهایی</span><b>'+mon(abs(a.expectedBalance))+'</b><small>'+esc(st.label)+'</small></div>'+
    '</div>'+
    reconciliationHtml(a)+ignoredPaymentsHtml(a)+
    '<div class="ar39100-actions"><button class="btn gold" data-action="newInvoiceFor" data-id="'+attr(a.customerId)+'">ساخت فاکتور</button><button class="btn green" data-action="quickPayment" data-id="'+attr(a.customerId)+'">ثبت دریافت</button><button class="btn blue" data-v3990="newAccountAdjustment" data-customer-id="'+attr(a.customerId)+'">اصلاح مانده</button><button class="btn ghost" data-action="customerProfileTab" data-profile-tab="statement">صورتحساب</button></div>'+
    '<div class="ar39100-ledger-head"><div><h3>گردش کامل حساب</h3><p>مانده بعد از هر رویداد به‌ترتیب تاریخ محاسبه شده است.</p></div><span>'+fa((a.events||[]).length)+' رویداد</span></div>'+
    '<div class="ar39100-opening-row"><span>مانده شروع حساب</span><b>'+mon(abs(a.openingBalance))+' — '+esc(status(a.openingBalance).label)+'</b></div>'+
    eventRowsHtml(a)+
  '</div>';
}
function tabsHtml(active){
  var tabs=[['summary','حساب جامع'],['info','اطلاعات'],['invoices','فاکتورها'],['payments','دریافت‌ها'],['statement','صورتحساب'],['ledger','ریزحساب'],['followups','پیگیری'],['tasks','کارها'],['activity','فعالیت‌ها'],['files','فایل‌ها'],['report','گزارش کوتاه']];
  return '<div class="v30-tabbar">'+tabs.map(function(x){return '<button class="'+(active===x[0]?'active':'')+'" data-action="customerProfileTab" data-profile-tab="'+attr(x[0])+'">'+x[1]+'</button>'}).join('')+'</div>';
}
function comprehensivePage(customer){
  var a=API.build(customer),st=status(a?a.expectedBalance:customer.balance),name=customer&&customer.name||'مشتری';
  return '<section class="page ar39100-page"><div class="back-row"><button class="btn ghost" data-action="tab" data-tab="customers">برگشت</button><button class="btn blue" data-action="editCustomer" data-id="'+attr(customer.id)+'">⚙️ ویرایش</button><button class="btn ghost v30-menu-btn" data-action="customerQuickMenu" data-id="'+attr(customer.id)+'">⋯</button></div><div class="v30-profile-hero"><div class="v30-profile-head"><div><h2>'+esc(name)+'</h2><div class="v30-profile-meta">'+(customer.phone?'<button class="v30-plain-touch" data-action="phoneOptions" data-phone="'+attr(customer.phone)+'">'+esc(customer.phone)+'</button>':'بدون شماره')+'<br>'+esc(customer.address||'بدون آدرس')+'</div></div><div class="avatar">'+esc((name||'م')[0])+'</div></div><span class="status '+esc(st.cls)+'" style="margin-top:14px">'+esc(st.label)+'</span></div>'+tabsHtml('summary')+comprehensiveHtml(customer)+'</section>';
}
function installStyle(){
  if(typeof document==='undefined'||!document.head||document.getElementById('ar39100-stage2-style'))return;
  var s=document.createElement('style');s.id='ar39100-stage2-style';s.textContent='\
.ar39100-account{display:grid;gap:14px}.ar39100-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;background:linear-gradient(145deg,#061e35,#10395d);color:#fff;border:1px solid #d79b22;border-radius:22px;padding:18px}.ar39100-heading h3{margin:0;color:#f4c752;font-size:20px}.ar39100-heading p{margin:7px 0 0;font-size:11px;line-height:1.9;color:#dbe7f2}.ar39100-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.ar39100-kpi{background:#fff;border:1px solid #dfe6ee;border-radius:18px;padding:13px;min-height:92px;box-shadow:0 7px 18px rgba(15,39,64,.045)}.ar39100-kpi span,.ar39100-kpi small,.ar39100-kpi b{display:block}.ar39100-kpi span{font-size:11px;color:#64748b;font-weight:850}.ar39100-kpi b{font-size:17px;color:#0f2740;margin:6px 0}.ar39100-kpi small{font-size:9.5px;color:#7b8794;line-height:1.7}.ar39100-kpi.invoice{border-top:3px solid #d79b22}.ar39100-kpi.payment{border-top:3px solid #16a34a}.ar39100-kpi.check{border-top:3px solid #2563eb}.ar39100-kpi.adjustment{border-top:3px solid #8b5cf6}.ar39100-kpi.balance{border:2px solid #d79b22;background:#fffaf0}.ar39100-reconcile,.ar39100-ignore{display:grid;gap:4px;border-radius:16px;padding:12px 14px;font-size:11px;line-height:1.85}.ar39100-reconcile.ok{background:#ecfdf3;border:1px solid #86efac;color:#166534}.ar39100-reconcile.warn{background:#fff7ed;border:1px solid #fdba74;color:#9a3412}.ar39100-ignore{background:#fff1f2;border:1px solid #fda4af;color:#9f1239}.ar39100-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.ar39100-ledger-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:4px}.ar39100-ledger-head h3{margin:0;color:#0f2740}.ar39100-ledger-head p{margin:4px 0 0;color:#64748b;font-size:10px}.ar39100-ledger-head>span{background:#eaf0f6;color:#334155;border-radius:999px;padding:6px 10px;font-size:10px;font-weight:900;white-space:nowrap}.ar39100-opening-row{display:flex;justify-content:space-between;gap:10px;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:13px;padding:9px 12px;font-size:10.5px}.ar39100-ledger-wrap{overflow:auto;border:1px solid #dfe6ee;border-radius:18px;background:#fff;-webkit-overflow-scrolling:touch}.ar39100-ledger{width:100%;min-width:720px;border-collapse:collapse;font-size:10.5px}.ar39100-ledger th{background:#071e34;color:#f4c752;padding:10px 8px;position:sticky;top:0;z-index:1}.ar39100-ledger td{border-bottom:1px solid #edf1f5;padding:10px 8px;vertical-align:top}.ar39100-ledger td:nth-child(2){min-width:220px}.ar39100-ledger td b,.ar39100-ledger td small{display:block}.ar39100-ledger td small{color:#64748b;margin-top:4px;line-height:1.65}.ar39100-ledger td.debit{color:#b42318;font-weight:900}.ar39100-ledger td.credit{color:#15803d;font-weight:900}.ar39100-ref{display:block;border:0;background:transparent;color:#1d4ed8;padding:3px 0 0;font-weight:900;text-align:right;text-decoration:underline;text-underline-offset:3px}.ar39100-status{display:block!important;margin-top:3px!important;font-size:9px!important;font-weight:900}.ar39100-empty{text-align:center;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:15px;padding:18px;color:#64748b}.ar39100-page .v30-tabbar{margin-bottom:14px}@media(min-width:720px){.ar39100-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}.ar39100-actions{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:390px){.ar39100-heading{flex-direction:column}.ar39100-kpi b{font-size:15px}}@media print{.ar39100-actions,.ar39100-page .back-row,.ar39100-page .v30-tabbar{display:none!important}.ar39100-ledger-wrap{overflow:visible}.ar39100-ledger{min-width:0}.ar39100-ledger th{position:static}}';document.head.appendChild(s);
}

var previousRenderAccount=(typeof renderAccount==='function')?renderAccount:null;
if(previousRenderAccount){
  renderAccount=function(){
    var customer=null;
    try{customer=typeof customerById==='function'?(customerById(state.selectedCustomerId)||((data.customers||[])[0])):null}catch(_){customer=null}
    if(customer&&(!state.customerProfileTab||state.customerProfileTab==='summary')){state.selectedCustomerId=customer.id;state.customerProfileTab='summary';return comprehensivePage(customer)}
    var html=previousRenderAccount.apply(this,arguments);
    return String(html||'').replace(/data-profile-tab="summary">خلاصه<\/button>/g,'data-profile-tab="summary">حساب جامع</button>');
  };
}

API.version=STAGE2_VERSION;
API.renderComprehensive=comprehensiveHtml;
API.renderComprehensivePage=comprehensivePage;
API.stage2={version:STAGE2_VERSION,readOnly:true,canonicalSource:true,reconciliationVisible:true};
installStyle();
try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39100-stage2-style',installStyle)}catch(_){ }
})();

/* ===== AlanRang Pro v39.10.0 Stage 3 — Customer Account Filters, Search & Export ===== */
(function(){
'use strict';
if(window.__ALANRANG_CUSTOMER_ACCOUNT_V39100_STAGE3__)return;
window.__ALANRANG_CUSTOMER_ACCOUNT_V39100_STAGE3__=true;

var API=window.AlanRangCustomerAccountV39100;
if(!API||typeof API.build!=='function')return;
var STAGE3_VERSION='39.10.0-customer-account-stage3-v01';
var SHARE_ROW_LIMIT=250;

function esc3(v){try{return typeof safe==='function'?safe(v):String(v==null?'':v)}catch(_){return String(v==null?'':v)}}
function attr3(v){try{return typeof safeAttr==='function'?safeAttr(v):esc3(v)}catch(_){return esc3(v)}}
function mon3(v){try{return typeof money==='function'?money(Math.round(Number(v)||0)):String(Math.round(Number(v)||0))+' تومان'}catch(_){return String(Math.round(Number(v)||0))+' تومان'}}
function fa3(v){try{return typeof faDigits==='function'?faDigits(v):String(v)}catch(_){return String(v)}}
function abs3(v){return Math.abs(Number(v)||0)}
function status3(v){try{var s=typeof statusOf==='function'?statusOf(Number(v)||0):null;if(s&&s.length)return {label:s[0],cls:s[1]||''}}catch(_){ }v=Number(v)||0;return v<0?{label:'بستانکار',cls:'blue'}:v>0?{label:'بدهکار',cls:'red'}:{label:'تسویه',cls:'green'}}
function norm3(v){return String(v==null?'':v).toLowerCase().replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\u200e\u200f]/g,' ').replace(/,/g,'').replace(/\s+/g,' ').trim()}
function parse3(v){
  try{if(typeof parseJalaliDate==='function'){var p=parseJalaliDate(v||'');if(p&&p.jy&&p.jm&&p.jd)return {jy:Number(p.jy),jm:Number(p.jm),jd:Number(p.jd)}}}catch(_){ }
  var s=norm3(v),m=s.match(/((?:13|14)\d{2})\D+(\d{1,2})\D+(\d{1,2})/);
  return m?{jy:Number(m[1]),jm:Number(m[2]),jd:Number(m[3])}:null;
}
function daySerial3(p){
  if(!p)return 0;
  try{
    if(typeof jalaaliToGregorian==='function'){
      var g=jalaaliToGregorian(Number(p.jy||0),Number(p.jm||0),Number(p.jd||0));
      if(g&&g.gy&&g.gm&&g.gd)return Math.floor(Date.UTC(Number(g.gy),Number(g.gm)-1,Number(g.gd))/86400000);
    }
  }catch(_){ }
  var md=[0,31,31,31,31,31,31,30,30,30,30,30,30],d=Number(p.jy||0)*366+Number(p.jd||0);
  for(var i=1;i<Number(p.jm||0);i++)d+=md[i]||30;
  return d;
}
function today3(){
  try{if(typeof todayJalali==='function'){var t=todayJalali();if(t&&t.jy)return t}}catch(_){ }
  try{
    var s=new Intl.DateTimeFormat('fa-IR-u-ca-persian',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/\u200f/g,'');
    return parse3(s);
  }catch(_){return null}
}
function filterState3(customerId){
  if(!window.state)window.state={};
  var f=state.ar39100AccountFilter;
  if(!f||String(f.customerId||'')!==String(customerId||'')){
    f={customerId:customerId||'',period:'all',from:'',to:'',query:''};
    state.ar39100AccountFilter=f;
  }
  if(!f.period)f.period='all';
  return f;
}
function periodLabel3(f){
  f=f||{};
  if(f.period==='today')return 'امروز';
  if(f.period==='week')return '۷ روز اخیر';
  if(f.period==='month')return 'این ماه';
  if(f.period==='year')return 'امسال';
  if(f.period==='custom'){
    if(f.from&&f.to)return 'از '+f.from+' تا '+f.to;
    if(f.from)return 'از '+f.from;
    if(f.to)return 'تا '+f.to;
    return 'بازه دلخواه';
  }
  return 'کل حساب';
}
function range3(f){
  f=f||{};
  if(!f.period||f.period==='all')return {from:null,to:null};
  var t=today3(),ts=daySerial3(t);
  if(f.period==='today')return {from:ts,to:ts};
  if(f.period==='week')return {from:ts?ts-6:null,to:ts||null};
  if(f.period==='month'&&t)return {from:daySerial3({jy:t.jy,jm:t.jm,jd:1}),to:daySerial3({jy:t.jy,jm:t.jm,jd:t.jm<=6?31:30})};
  if(f.period==='year'&&t)return {from:daySerial3({jy:t.jy,jm:1,jd:1}),to:daySerial3({jy:t.jy,jm:12,jd:30})};
  if(f.period==='custom')return {from:f.from?daySerial3(parse3(f.from)):null,to:f.to?daySerial3(parse3(f.to)):null};
  return {from:null,to:null};
}
function rowDay3(row){return daySerial3(parse3(row&&row.date||''))}
function inRange3(row,f){
  if(!f||!f.period||f.period==='all')return true;
  var rs=range3(f),d=rowDay3(row);
  if(!d)return false;
  if(rs.from&&d<rs.from)return false;
  if(rs.to&&d>rs.to)return false;
  return true;
}
function refText3(row){
  if(!row)return '—';
  if(row.kind==='invoice')return row.invoiceNumber?('فاکتور '+row.invoiceNumber):'فاکتور';
  if(row.kind==='payment')return row.invoiceNumber?('فاکتور '+row.invoiceNumber):(row.method||'دریافت');
  return row.documentNumber||row.invoiceNumber||'—';
}
function searchMatch3(row,q){
  var term=norm3(q);if(!term)return true;
  var amount=Number(row&&row.amount)||0,running=Number(row&&row.running)||0;
  var hay=norm3([row&&row.date,row&&row.kindLabel,refText3(row),row&&row.note,row&&row.method,row&&row.status,amount,abs3(amount),running,abs3(running)].join(' '));
  return hay.indexOf(term)>-1;
}
function summarizeRows3(rows){
  var out={invoiceCount:0,paymentCount:0,checkPaymentCount:0,invoices:0,payments:0,checkPayments:0,adjustments:0};
  (rows||[]).forEach(function(r){
    var amount=Number(r&&r.amount)||0;
    if(r.kind==='invoice'){out.invoiceCount++;out.invoices+=Math.max(0,amount);return}
    if(r.kind==='payment'){out.paymentCount++;out.payments+=abs3(amount);if(r.isCheck){out.checkPaymentCount++;out.checkPayments+=abs3(amount)}return}
    out.adjustments+=amount;
  });
  return out;
}
function filterAccount3(customerOrId,filter){
  var a=API.build(customerOrId);if(!a)return null;
  var f=filter||filterState3(a.customerId),all=Array.isArray(a.events)?a.events:[],rs=range3(f);
  var periodRows=all.filter(function(r){return inRange3(r,f)});
  var opening=Number(a.openingBalance)||0;
  if(rs.from){
    all.forEach(function(r){var d=rowDay3(r);if(d&&d<rs.from)opening+=Number(r.amount)||0});
  }
  var summary=summarizeRows3(periodRows),closing=opening+periodRows.reduce(function(s,r){return s+(Number(r.amount)||0)},0);
  var visibleRows=periodRows.filter(function(r){return searchMatch3(r,f.query)});
  return {
    account:a,filter:f,periodRows:periodRows,rows:visibleRows,summary:summary,
    openingBalance:opening,closingBalance:closing,periodLabel:periodLabel3(f),
    periodCount:periodRows.length,visibleCount:visibleRows.length
  };
}
function eventAction3(row){
  var label=esc3(refText3(row));
  if(!row)return label;
  if(row.kind==='invoice'&&row.invoiceId)return '<button class="ar39100-ref" data-action="previewInvoice" data-id="'+attr3(row.invoiceId)+'">'+label+'</button>';
  if(row.kind==='payment'&&row.invoiceId&&row.paymentId)return '<button class="ar39100-ref" data-action="openPaymentDetail" data-invoice-id="'+attr3(row.invoiceId)+'" data-payment-id="'+attr3(row.paymentId)+'">'+label+'</button>';
  if(row.kind==='invoiceAdjustment')return '<button class="ar39100-ref" data-v3990="openInvoiceAdjustmentDetail" data-id="'+attr3(row.id)+'">'+label+'</button>';
  if(row.kind==='accountAdjustment')return '<button class="ar39100-ref" data-v3990="openAccountAdjustmentDetail" data-id="'+attr3(row.id)+'">'+label+'</button>';
  return label;
}
function filterBar3(v){
  var f=v.filter||{},period=f.period||'all',buttons=[['all','همه'],['today','امروز'],['week','۷ روز'],['month','این ماه'],['year','امسال']];
  return '<section class="ar39100-filter-card">'+
    '<div class="ar39100-filter-head"><div><b>فیلتر گردش حساب</b><small>بازه زمانی و جستجو فقط نمایش و خروجی را محدود می‌کند؛ اطلاعات اصلی تغییر نمی‌کند.</small></div><button class="btn ghost small" data-ar39100="clearFilters">پاک‌کردن فیلتر</button></div>'+
    '<div class="ar39100-periods">'+buttons.map(function(x){return '<button class="'+(period===x[0]?'active':'')+'" data-ar39100="period" data-period="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'+
    '<div class="ar39100-range">'+
      '<label><span>از تاریخ</span><input id="ar39100From" class="input" inputmode="numeric" value="'+attr3(f.from||'')+'" placeholder="۱۴۰۵/۰۱/۰۱"></label>'+
      '<label><span>تا تاریخ</span><input id="ar39100To" class="input" inputmode="numeric" value="'+attr3(f.to||'')+'" placeholder="۱۴۰۵/۱۲/۲۹"></label>'+
      '<button class="btn blue" data-ar39100="applyRange">اعمال بازه</button>'+
    '</div>'+
    '<div class="ar39100-search-line"><input id="ar39100LedgerSearch" class="input" value="'+attr3(f.query||'')+'" placeholder="جستجو در شرح، شماره فاکتور، سند، روش پرداخت، مبلغ..."><span>'+fa3(v.visibleCount)+' از '+fa3(v.periodCount)+' رویداد</span></div>'+
  '</section>';
}
function rowsHtml3(v){
  var rows=v.rows||[];
  if(!rows.length)return '<div class="ar39100-empty">'+(v.filter&&v.filter.query?'رویدادی مطابق جستجو پیدا نشد.':'در این بازه رویدادی ثبت نشده است.')+'</div>';
  return '<div class="ar39100-ledger-wrap"><table class="ar39100-ledger"><thead><tr><th>تاریخ</th><th>رویداد / مرجع</th><th>بدهکار</th><th>بستانکار</th><th>مانده</th></tr></thead><tbody>'+rows.map(function(r){
    var amount=Number(r.amount)||0,st=status3(r.running),note=r.note?'<small>'+esc3(r.note)+'</small>':'';
    return '<tr><td>'+esc3(r.date||'—')+'</td><td><b>'+esc3(r.kindLabel||'رویداد')+'</b>'+eventAction3(r)+note+'</td><td class="debit">'+(amount>0?mon3(amount):'—')+'</td><td class="credit">'+(amount<0?mon3(abs3(amount)):'—')+'</td><td><strong>'+mon3(abs3(r.running))+'</strong><small class="ar39100-status '+esc3(st.cls)+'">'+esc3(st.label)+'</small></td></tr>';
  }).join('')+'</tbody></table></div>';
}
function reconciliation3(a){
  if(a.reconciled)return '<div class="ar39100-reconcile ok"><b>✓ کنترل حساب: بدون اختلاف</b><span>مانده محاسبه‌شده با مانده ذخیره‌شده برنامه مطابقت دارد.</span></div>';
  return '<div class="ar39100-reconcile warn"><b>⚠ اختلاف حساب شناسایی شد</b><span>مانده ذخیره‌شده: '+mon3(a.storedBalance)+' — مانده محاسبه‌شده: '+mon3(a.expectedBalance)+' — اختلاف: '+(a.balanceDelta>0?'+':a.balanceDelta<0?'−':'')+mon3(abs3(a.balanceDelta))+'. هیچ داده‌ای به‌صورت خودکار تغییر نکرده است.</span></div>';
}
function ignored3(a){
  var s=a.summary||{};if(!(Number(s.ignoredPaymentCount)||0))return '';
  return '<div class="ar39100-ignore"><b>'+fa3(s.ignoredPaymentCount)+' دریافت برگشتی/لغوشده از محاسبه کنار گذاشته شد.</b><span>جمع این موارد: '+mon3(s.ignoredPayments)+'. این مبلغ در مانده نهایی اثر ندارد.</span></div>';
}
function accountHtml3(customerOrId){
  var v=filterAccount3(customerOrId);if(!v)return '<div class="ar39100-empty">اطلاعات حساب این مشتری در دسترس نیست.</div>';
  var a=v.account,s=v.summary||{},st=status3(v.closingBalance),adj=Number(s.adjustments)||0;
  return '<div class="ar39100-account">'+
    '<div class="ar39100-heading"><div><h3>حساب جامع مشتری</h3><p>گردش کامل و دقیق حساب با فیلتر زمانی، جستجو و خروجی؛ همه محاسبات از موتور مالی واحد و فقط‌خواندنی برنامه انجام می‌شود.</p></div><span class="status '+esc3(st.cls)+'">'+esc3(st.label)+'</span></div>'+
    filterBar3(v)+
    '<div class="ar39100-scope"><b>'+esc3(v.periodLabel)+'</b><span>خلاصه ارقام بر اساس کل رویدادهای بازه انتخابی است؛ جستجو فقط ردیف‌های جدول و خروجی را محدود می‌کند.</span></div>'+
    '<div class="ar39100-kpis">'+
      '<div class="ar39100-kpi opening"><span>مانده شروع بازه</span><b>'+mon3(abs3(v.openingBalance))+'</b><small>'+esc3(status3(v.openingBalance).label)+'</small></div>'+
      '<div class="ar39100-kpi invoice"><span>فاکتورهای بازه</span><b>'+mon3(s.invoices)+'</b><small>'+fa3(s.invoiceCount||0)+' فاکتور قطعی</small></div>'+
      '<div class="ar39100-kpi payment"><span>دریافت‌های بازه</span><b>'+mon3(s.payments)+'</b><small>'+fa3(s.paymentCount||0)+' دریافت معتبر</small></div>'+
      '<div class="ar39100-kpi check"><span>چک‌های بازه</span><b>'+mon3(s.checkPayments)+'</b><small>'+fa3(s.checkPaymentCount||0)+' دریافت چکی</small></div>'+
      '<div class="ar39100-kpi adjustment"><span>اصلاحات بازه</span><b>'+(adj>0?'+':adj<0?'−':'')+mon3(abs3(adj))+'</b><small>برگشت، اصلاح فاکتور و اصلاح مانده</small></div>'+
      '<div class="ar39100-kpi balance"><span>مانده پایان بازه</span><b>'+mon3(abs3(v.closingBalance))+'</b><small>'+esc3(st.label)+'</small></div>'+
    '</div>'+
    reconciliation3(a)+ignored3(a)+
    '<div class="ar39100-actions ar39100-export-actions"><button class="btn gold" data-action="newInvoiceFor" data-id="'+attr3(a.customerId)+'">ساخت فاکتور</button><button class="btn green" data-action="quickPayment" data-id="'+attr3(a.customerId)+'">ثبت دریافت</button><button class="btn blue" data-v3990="newAccountAdjustment" data-customer-id="'+attr3(a.customerId)+'">اصلاح مانده</button><button class="btn blue" data-ar39100="exportXlsx">خروجی Excel</button><button class="btn gold" data-ar39100="shareStatement">ارسال صورتحساب</button><button class="btn gold" data-ar39100-stage4="openReport">گزارش حرفه‌ای مشتری</button><button class="btn ghost" data-ar39100="printStatement">چاپ</button></div>'+
    '<div class="ar39100-ledger-head"><div><h3>گردش کامل حساب</h3><p>مانده هر ردیف، مانده واقعی همان لحظه در حساب کامل مشتری است.</p></div><span>'+fa3(v.visibleCount)+' / '+fa3(v.periodCount)+' رویداد</span></div>'+
    '<div class="ar39100-opening-row"><span>مانده شروع بازه</span><b>'+mon3(abs3(v.openingBalance))+' — '+esc3(status3(v.openingBalance).label)+'</b></div>'+
    rowsHtml3(v)+
  '</div>';
}
function tabs3(active){
  var tabs=[['summary','حساب جامع'],['info','اطلاعات'],['invoices','فاکتورها'],['payments','دریافت‌ها'],['statement','صورتحساب'],['ledger','ریزحساب'],['followups','پیگیری'],['tasks','کارها'],['activity','فعالیت‌ها'],['files','فایل‌ها'],['report','گزارش کوتاه']];
  return '<div class="v30-tabbar">'+tabs.map(function(x){return '<button class="'+(active===x[0]?'active':'')+'" data-action="customerProfileTab" data-profile-tab="'+attr3(x[0])+'">'+x[1]+'</button>'}).join('')+'</div>';
}
function page3(customer){
  var v=filterAccount3(customer),st=status3(v?v.closingBalance:customer.balance),name=customer&&customer.name||'مشتری';
  return '<section class="page ar39100-page ar39100-stage3-page"><div class="back-row"><button class="btn ghost" data-action="tab" data-tab="customers">برگشت</button><button class="btn blue" data-action="editCustomer" data-id="'+attr3(customer.id)+'">⚙️ ویرایش</button><button class="btn ghost v30-menu-btn" data-action="customerQuickMenu" data-id="'+attr3(customer.id)+'">⋯</button></div><div class="v30-profile-hero"><div class="v30-profile-head"><div><h2>'+esc3(name)+'</h2><div class="v30-profile-meta">'+(customer.phone?'<button class="v30-plain-touch" data-action="phoneOptions" data-phone="'+attr3(customer.phone)+'">'+esc3(customer.phone)+'</button>':'بدون شماره')+'<br>'+esc3(customer.address||'بدون آدرس')+'</div></div><div class="avatar">'+esc3((name||'م')[0])+'</div></div><span class="status '+esc3(st.cls)+'" style="margin-top:14px">'+esc3(st.label)+'</span></div>'+tabs3('summary')+accountHtml3(customer)+'</section>';
}
function xlsxRows3(v){
  var rows=[['','مانده شروع بازه','','',v.openingBalance>0?Math.round(v.openingBalance):'',v.openingBalance<0?Math.round(abs3(v.openingBalance)):'',Math.round(abs3(v.openingBalance)),status3(v.openingBalance).label]];
  (v.rows||[]).forEach(function(r){
    var amount=Number(r.amount)||0;
    rows.push([r.date||'',r.kindLabel||'رویداد',refText3(r),r.note||'',amount>0?Math.round(amount):'',amount<0?Math.round(abs3(amount)):'',Math.round(abs3(r.running)),status3(r.running).label]);
  });
  return rows;
}
function cleanFilePart3(v){return String(v||'مشتری').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim().slice(0,60)||'مشتری'}
function exportXlsx3(customerOrId){
  var v=filterAccount3(customerOrId);if(!v)return false;
  var name=cleanFilePart3(v.account.customer&&v.account.customer.name||'مشتری'),title='صورتحساب جامع آلان رنگ - '+name+' - '+periodLabel3(v.filter);
  if(typeof downloadExcelReportFile==='function'){
    downloadExcelReportFile(title,['تاریخ','شرح','مرجع','توضیح','بدهکار','بستانکار','مانده','وضعیت'],xlsxRows3(v));
    return true;
  }
  var csv=[['تاریخ','شرح','مرجع','توضیح','بدهکار','بستانکار','مانده','وضعیت']].concat(xlsxRows3(v)).map(function(row){return row.map(function(x){return '"'+String(x==null?'':x).replace(/"/g,'""')+'"'}).join(',')}).join('\r\n');
  var blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
  if(typeof downloadBlob==='function'){downloadBlob(blob,'صورتحساب-'+name+'.csv');return true}
  return false;
}
function shareText3(customerOrId){
  var v=filterAccount3(customerOrId);if(!v)return '';
  var a=v.account,c=a.customer||{},s=v.summary||{},q=String(v.filter&&v.filter.query||'').trim(),lines=[];
  lines.push('آلان رنگ — صورتحساب جامع مشتری');
  lines.push('مشتری: '+(c.name||'—'));
  if(c.phone)lines.push('تلفن: '+c.phone);
  lines.push('بازه: '+v.periodLabel);
  if(q)lines.push('جستجو: '+q+' — نمایش '+v.visibleCount+' از '+v.periodCount+' رویداد');
  lines.push('مانده شروع بازه: '+mon3(abs3(v.openingBalance))+' — '+status3(v.openingBalance).label);
  lines.push('جمع فاکتورها: '+mon3(s.invoices));
  lines.push('جمع دریافت‌ها: '+mon3(s.payments));
  lines.push('دریافت چک: '+mon3(s.checkPayments));
  lines.push('اصلاحات خالص: '+(s.adjustments>0?'+':s.adjustments<0?'−':'')+mon3(abs3(s.adjustments)));
  lines.push('مانده پایان بازه: '+mon3(abs3(v.closingBalance))+' — '+status3(v.closingBalance).label);
  lines.push('');
  lines.push('گردش حساب:');
  var rows=(v.rows||[]).slice(0,SHARE_ROW_LIMIT);
  if(!rows.length)lines.push('رویدادی برای نمایش وجود ندارد.');
  rows.forEach(function(r,i){
    var amount=Number(r.amount)||0,side=amount>0?'بدهکار ':amount<0?'بستانکار ':'';
    lines.push((i+1)+') '+(r.date||'—')+' | '+(r.kindLabel||'رویداد')+' | '+refText3(r)+' | '+side+mon3(abs3(amount))+' | مانده '+mon3(abs3(r.running))+' '+status3(r.running).label+(r.note?' | '+r.note:''));
  });
  if((v.rows||[]).length>SHARE_ROW_LIMIT)lines.push('... '+((v.rows||[]).length-SHARE_ROW_LIMIT)+' ردیف دیگر در خروجی Excel موجود است.');
  lines.push('');
  lines.push('آلان رنگ');
  return lines.join('\n');
}
function share3(customerOrId){
  var text=shareText3(customerOrId);if(!text)return Promise.resolve(false);
  var title='صورتحساب جامع آلان رنگ';
  try{
    if(typeof navigator!=='undefined'&&typeof navigator.share==='function')return Promise.resolve(navigator.share({title:title,text:text})).then(function(){try{showToast('صورتحساب آماده ارسال شد')}catch(_){ }return true}).catch(function(e){if(e&&e.name==='AbortError')return false;if(typeof copyText==='function'){copyText(text);try{showToast('متن صورتحساب کپی شد')}catch(_){ }return true}throw e});
  }catch(_){ }
  if(typeof copyText==='function'){copyText(text);try{showToast('متن صورتحساب کپی شد')}catch(_){ }return Promise.resolve(true)}
  return Promise.resolve(false);
}
function installStyle3(){
  if(typeof document==='undefined'||!document.head||document.getElementById('ar39100-stage3-style'))return;
  var s=document.createElement('style');s.id='ar39100-stage3-style';s.textContent='\
.ar39100-filter-card{display:grid;gap:10px;background:#fff;border:1px solid #dce5ee;border-radius:20px;padding:13px;box-shadow:0 7px 18px rgba(15,39,64,.035)}.ar39100-filter-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.ar39100-filter-head b,.ar39100-filter-head small{display:block}.ar39100-filter-head b{color:#0f2740}.ar39100-filter-head small{margin-top:4px;color:#64748b;font-size:9.5px;line-height:1.7}.ar39100-periods{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}.ar39100-periods button{border:1px solid #dbe3ec;background:#f8fafc;color:#334155;border-radius:12px;min-height:39px;font-weight:900;font-size:10px}.ar39100-periods button.active{background:#071e34;color:#f4c752;border-color:#d79b22}.ar39100-range{display:grid;grid-template-columns:1fr 1fr auto;gap:7px;align-items:end}.ar39100-range label span{display:block;color:#64748b;font-size:9px;font-weight:900;margin:0 2px 4px}.ar39100-range .input{min-width:0}.ar39100-search-line{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}.ar39100-search-line>span{background:#eaf0f6;color:#334155;border-radius:999px;padding:7px 10px;font-size:9.5px;font-weight:900;white-space:nowrap}.ar39100-scope{display:flex;justify-content:space-between;gap:10px;align-items:center;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:14px;padding:9px 12px;color:#475569}.ar39100-scope b{color:#0f2740;white-space:nowrap}.ar39100-scope span{font-size:9px;line-height:1.65}.ar39100-export-actions{grid-template-columns:repeat(2,minmax(0,1fr))}@media(min-width:720px){.ar39100-export-actions{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:520px){.ar39100-periods{grid-template-columns:repeat(3,minmax(0,1fr))}.ar39100-range{grid-template-columns:1fr 1fr}.ar39100-range>button{grid-column:1/-1}.ar39100-scope{display:grid}.ar39100-search-line{grid-template-columns:1fr}.ar39100-search-line>span{justify-self:start}}@media(max-width:360px){.ar39100-periods,.ar39100-range{grid-template-columns:1fr}.ar39100-range>button{grid-column:auto}}@media print{.ar39100-filter-card,.ar39100-export-actions,.ar39100-stage3-page .back-row,.ar39100-stage3-page .v30-tabbar{display:none!important}.ar39100-scope{border:0;padding:4px 0}.ar39100-heading{break-inside:avoid}.ar39100-ledger-wrap{overflow:visible!important}.ar39100-ledger{min-width:0!important}}';document.head.appendChild(s);
}

var previousRenderAccount3=(typeof renderAccount==='function')?renderAccount:null;
if(previousRenderAccount3){
  renderAccount=function(){
    var customer=null;
    try{customer=typeof customerById==='function'?(customerById(state.selectedCustomerId)||((data.customers||[])[0])):null}catch(_){customer=null}
    if(customer&&(!state.customerProfileTab||state.customerProfileTab==='summary')){state.selectedCustomerId=customer.id;state.customerProfileTab='summary';return page3(customer)}
    return previousRenderAccount3.apply(this,arguments);
  };
}

function activeCustomer3(){
  try{return typeof customerById==='function'?customerById(state&&state.selectedCustomerId):null}catch(_){return null}
}
if(typeof document!=='undefined'&&document.addEventListener){
document.addEventListener('click',function(e){
  var el=e.target&&e.target.closest?e.target.closest('[data-ar39100]'):null;if(!el)return;
  var action=el.dataset.ar39100||'',customer=activeCustomer3();if(!customer)return;
  var f=filterState3(customer.id);
  if(action==='period'){
    f.period=el.dataset.period||'all';
    if(typeof renderApp==='function')renderApp();
  }else if(action==='clearFilters'){
    state.ar39100AccountFilter={customerId:customer.id,period:'all',from:'',to:'',query:''};
    if(typeof renderApp==='function')renderApp();
  }else if(action==='applyRange'){
    var from=(document.getElementById('ar39100From')||{}).value||'',to=(document.getElementById('ar39100To')||{}).value||'';
    if(from&&!parse3(from)){try{showToast('تاریخ شروع معتبر نیست')}catch(_){ }e.preventDefault();e.stopImmediatePropagation();return}
    if(to&&!parse3(to)){try{showToast('تاریخ پایان معتبر نیست')}catch(_){ }e.preventDefault();e.stopImmediatePropagation();return}
    if(from&&to&&daySerial3(parse3(from))>daySerial3(parse3(to))){try{showToast('تاریخ شروع نباید بعد از تاریخ پایان باشد')}catch(_){ }e.preventDefault();e.stopImmediatePropagation();return}
    f.from=from.trim();f.to=to.trim();f.period=(f.from||f.to)?'custom':'all';
    if(typeof renderApp==='function')renderApp();
  }else if(action==='exportXlsx'){
    if(!exportXlsx3(customer)){try{showToast('خروجی صورتحساب آماده نشد')}catch(_){ }}
  }else if(action==='shareStatement'){
    var sharePromise=(API&&typeof API.stage4ShareImages==='function')?API.stage4ShareImages(customer):share3(customer);
    Promise.resolve(sharePromise).catch(function(err){console.error(err);if(!(err&&err.name==='AbortError'))try{showToast('ارسال تصویری صورتحساب انجام نشد')}catch(_){ }});
  }else if(action==='printStatement'){
    try{window.print()}catch(_){ }
  }else return;
  e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
},true);

document.addEventListener('input',function(e){
  if(!e.target||e.target.id!=='ar39100LedgerSearch')return;
  var customer=activeCustomer3();if(!customer)return;
  var f=filterState3(customer.id),pos=e.target.selectionStart;f.query=e.target.value||'';
  if(typeof renderApp==='function')renderApp();
  setTimeout(function(){var x=document.getElementById('ar39100LedgerSearch');if(x){x.focus();try{x.setSelectionRange(pos,pos)}catch(_){ }}},0);
},true);

}
API.runtimeVersion=STAGE3_VERSION;
API.stage3={version:STAGE3_VERSION,readOnly:true,dateFilter:true,search:true,xlsxExport:true,nativeShare:true,canonicalSource:true};
API.filterAccount=filterAccount3;
API.renderFilteredComprehensive=accountHtml3;
API.stage3XlsxRows=xlsxRows3;
API.stage3ShareText=shareText3;
API.stage3ExportXlsx=exportXlsx3;
API.stage3Share=share3;
installStyle3();
try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39100-stage3-style',installStyle3)}catch(_){ }
})();

/* ===== AlanRang Pro v39.10.0 Stage 4 — Professional Customer Statement Report ===== */
(function(){
'use strict';
if(window.__ALANRANG_CUSTOMER_ACCOUNT_V39100_STAGE4__)return;
window.__ALANRANG_CUSTOMER_ACCOUNT_V39100_STAGE4__=true;

var API=window.AlanRangCustomerAccountV39100;
if(!API||typeof API.filterAccount!=='function')return;
var STAGE4_VERSION='39.10.0-customer-account-stage4-v01';
var REPORT_WIDTH=1240,REPORT_HEIGHT=1754,FIRST_PAGE_ROWS=11,NEXT_PAGE_ROWS=17;

function esc4(v){try{return typeof safe==='function'?safe(v):String(v==null?'':v)}catch(_){return String(v==null?'':v)}}
function attr4(v){try{return typeof safeAttr==='function'?safeAttr(v):esc4(v)}catch(_){return esc4(v)}}
function abs4(v){return Math.abs(Number(v)||0)}
function fa4(v){try{return typeof faDigits==='function'?faDigits(v):String(v)}catch(_){return String(v)}}
function money4(v){var x=Math.round(abs4(v));return fa4(x.toLocaleString('en-US'))+' تومان'}
function status4(v){try{var s=typeof statusOf==='function'?statusOf(Number(v)||0):null;if(s&&s.length)return {label:s[0],cls:s[1]||''}}catch(_){ }v=Number(v)||0;return v<0?{label:'بستانکار',cls:'blue'}:v>0?{label:'بدهکار',cls:'red'}:{label:'تسویه',cls:'green'}}
function signed4(v){v=Number(v)||0;return (v>0?'+':v<0?'−':'')+money4(v)}
function settings4(){return (window.data&&data.settings)||{}}
function activeAsset4(type){try{return typeof getActiveAssetImage==='function'?getActiveAssetImage(type):''}catch(_){return ''}}
function currentInvoiceTemplateCode4(){
  var raw=String(settings4().activeInvoiceTemplateId||'invoice_template_t4').trim().toLowerCase();
  if(raw==='invoice_template_t6'||raw==='t6')return 't6';
  if(raw==='invoice_template_t7'||raw==='t7')return 't7';
  return 't4';
}
function currentInvoiceShell4(code){
  code=code||currentInvoiceTemplateCode4();
  try{var map=window.AlanRangInvoiceFullShellDataV3970||{};if(map&&map[code])return map[code]}catch(_){ }
  return 'invoice_full_shells_v3970/'+code+'.png';
}
function todayText4(){
  try{if(typeof todayJalali==='function'){var t=todayJalali();if(t&&t.jy)return fa4(t.jy+'/'+String(t.jm).padStart(2,'0')+'/'+String(t.jd).padStart(2,'0'))}}catch(_){ }
  try{return new Intl.DateTimeFormat('fa-IR-u-ca-persian',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/\u200f/g,'')}catch(_){return ''}
}
function ref4(row){
  if(!row)return '—';
  if(row.kind==='invoice')return row.invoiceNumber?('فاکتور '+row.invoiceNumber):'فاکتور';
  if(row.kind==='payment')return row.invoiceNumber?('فاکتور '+row.invoiceNumber):(row.method||'دریافت');
  return row.documentNumber||row.invoiceNumber||'—';
}
function cleanFile4(v){return String(v||'مشتری').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim().slice(0,56)||'مشتری'}
function reportModel4(customerOrId){
  var v=API.filterAccount(customerOrId);if(!v)return null;
  var a=v.account||{},c=a.customer||{},s=settings4(),q=String(v.filter&&v.filter.query||'').trim();
  return {
    version:STAGE4_VERSION,customer:c,customerId:a.customerId||c.id||'',periodLabel:v.periodLabel||'کل حساب',query:q,
    visibleCount:Number(v.visibleCount)||0,periodCount:Number(v.periodCount)||0,openingBalance:Number(v.openingBalance)||0,
    closingBalance:Number(v.closingBalance)||0,summary:v.summary||{},rows:(v.rows||[]).slice(),reportDate:todayText4(),
    brand:{name:s.brandName||'آلان رنگ',subtitle:s.businessSubtitle||'خدمات تخصصی رنگ و نقاشی صنعتی',phone1:s.phone1||'',phone2:s.phone2||'',address:s.address||''},
    templateCode:currentInvoiceTemplateCode4(),
    assets:{invoiceShell:currentInvoiceShell4(currentInvoiceTemplateCode4())},readOnly:true
  };
}
function reportLedger4(model){
  var rows=[{opening:true,date:'',kindLabel:'مانده شروع بازه',ref:'',note:'',amount:0,running:model.openingBalance}];
  (model.rows||[]).forEach(function(r){rows.push({opening:false,date:r.date||'',kindLabel:r.kindLabel||'رویداد',ref:ref4(r),note:r.note||'',amount:Number(r.amount)||0,running:Number(r.running)||0,kind:r.kind||''})});
  return rows;
}
function pagePlan4(model){
  var rows=reportLedger4(model),pages=[],i=0;
  pages.push({index:0,first:true,rows:rows.slice(0,FIRST_PAGE_ROWS)});i=FIRST_PAGE_ROWS;
  while(i<rows.length){pages.push({index:pages.length,first:false,rows:rows.slice(i,i+NEXT_PAGE_ROWS)});i+=NEXT_PAGE_ROWS}
  if(!pages.length)pages=[{index:0,first:true,rows:[]}];
  pages.forEach(function(p){p.total=pages.length;p.last=p.index===pages.length-1});
  return pages;
}
function reportScope4(model){
  var txt='بازه گزارش: '+model.periodLabel;
  if(model.query)txt+=' — جستجو: «'+model.query+'» — نمایش '+fa4(model.visibleCount)+' از '+fa4(model.periodCount)+' رویداد';
  else txt+=' — '+fa4(model.periodCount)+' رویداد';
  return txt;
}
function htmlRows4(model){
  var rows=reportLedger4(model);
  return rows.map(function(r,i){
    var amount=Number(r.amount)||0,st=status4(r.running),desc=r.opening?'مانده انتقالی به ابتدای بازه':(r.kindLabel+(r.ref&&r.ref!=='—'?' — '+r.ref:''));
    return '<tr class="'+(r.opening?'opening':'')+'"><td>'+fa4(i)+'</td><td>'+esc4(r.date||'—')+'</td><td><b>'+esc4(desc)+'</b>'+(r.note?'<small>'+esc4(r.note)+'</small>':'')+'</td><td>'+(amount>0?money4(amount):'—')+'</td><td>'+(amount<0?money4(amount):'—')+'</td><td><b>'+money4(r.running)+'</b><small>'+esc4(st.label)+'</small></td></tr>';
  }).join('');
}
function reportSheet4(model){
  var s=model.summary||{},st=status4(model.closingBalance),code=model.templateCode||'t4',shell=model.assets&&model.assets.invoiceShell||currentInvoiceShell4(code);
  return '<article id="ar39100ProfessionalStatement" class="ar39100-report-sheet">'+
    '<header class="ar39100-report-header ar39100-current-invoice-header ar39100-current-invoice-'+attr4(code)+'"><img class="ar39100-current-shell-image" src="'+attr4(shell)+'" alt="سربرگ رسمی جاری آلان رنگ"><div class="ar39100-current-shell-contact">'+(model.brand.phone1?'<b dir="ltr">'+esc4(model.brand.phone1)+'</b>':'')+(model.brand.phone2?'<b dir="ltr">'+esc4(model.brand.phone2)+'</b>':'')+(model.brand.address?'<small>'+esc4(model.brand.address)+'</small>':'')+'</div><span class="ar39100-current-shell-title">صورتحساب رسمی مشتری</span></header>'+
    '<section class="ar39100-report-meta"><div><span>نام مشتری</span><b>'+esc4(model.customer.name||'—')+'</b></div><div><span>تلفن</span><b>'+esc4(model.customer.phone||'—')+'</b></div><div><span>بازه حساب</span><b>'+esc4(model.periodLabel)+'</b></div><div><span>تاریخ گزارش</span><b>'+esc4(model.reportDate||'—')+'</b></div><div class="wide"><span>آدرس مشتری</span><b>'+esc4(model.customer.address||'—')+'</b></div></section>'+
    (model.query?'<div class="ar39100-report-filter-note">این گزارش با جستجوی «'+esc4(model.query)+'» ساخته شده و '+fa4(model.visibleCount)+' ردیف از '+fa4(model.periodCount)+' رویداد بازه را نمایش می‌دهد. ارقام خلاصه مربوط به کل بازه هستند.</div>':'')+
    '<section class="ar39100-report-summary">'+
      '<div><span>مانده شروع</span><b>'+money4(model.openingBalance)+'</b><small>'+esc4(status4(model.openingBalance).label)+'</small></div>'+
      '<div><span>جمع فاکتورها</span><b>'+money4(s.invoices)+'</b><small>'+fa4(s.invoiceCount||0)+' فاکتور</small></div>'+
      '<div><span>جمع دریافت‌ها</span><b>'+money4(s.payments)+'</b><small>'+fa4(s.paymentCount||0)+' دریافت</small></div>'+
      '<div><span>دریافت چک</span><b>'+money4(s.checkPayments)+'</b><small>'+fa4(s.checkPaymentCount||0)+' چک</small></div>'+
      '<div><span>اصلاحات خالص</span><b>'+signed4(s.adjustments)+'</b><small>اسناد اصلاحی</small></div>'+
      '<div class="final"><span>مانده پایان</span><b>'+money4(model.closingBalance)+'</b><small>'+esc4(st.label)+'</small></div>'+
    '</section>'+
    '<section class="ar39100-report-ledger"><div class="title"><b>گردش حساب</b><span>'+esc4(reportScope4(model))+'</span></div><table><thead><tr><th>ردیف</th><th>تاریخ</th><th>شرح / مرجع</th><th>بدهکار</th><th>بستانکار</th><th>مانده</th></tr></thead><tbody>'+htmlRows4(model)+'</tbody></table></section>'+
    '<footer class="ar39100-report-footer"><div><b>'+esc4(model.brand.name)+'</b><span>گزارش فقط‌خواندنی از حساب ثبت‌شده در آلان‌رنگ</span></div><strong>✦ نظم در کار، آرامش در حساب ✦</strong></footer>'+
  '</article>';
}
function reportPage4(customer){
  var model=reportModel4(customer);if(!model)return '<section class="page"><div class="card">گزارش در دسترس نیست.</div></section>';
  return '<section class="page ar39100-stage4-report-page"><div class="back-row no-print"><button class="btn ghost" data-ar39100-stage4="closeReport">برگشت به حساب</button></div>'+reportSheet4(model)+'<div class="ar39100-report-actions no-print"><button class="btn blue" data-ar39100-stage4="saveImage">ذخیره عکس</button><button class="btn gold" data-ar39100-stage4="shareImage">ارسال تصویر</button><button class="btn blue" data-ar39100-stage4="savePdf">ذخیره PDF</button><button class="btn gold" data-ar39100-stage4="sharePdf">ارسال PDF</button><button class="btn ghost full" data-ar39100-stage4="printReport">چاپ / PDF سیستم</button></div></section>';
}
function rr4(ctx,x,y,w,h,r,fill,stroke,lw){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw||2;ctx.stroke()}}
function setText4(ctx,font,fill,align){ctx.font=font;ctx.fillStyle=fill||'#0f2740';ctx.textAlign=align||'right';ctx.textBaseline='alphabetic';try{ctx.direction='rtl'}catch(_){ }}
function ellipsis4(ctx,text,maxWidth){text=String(text==null?'':text);if(ctx.measureText(text).width<=maxWidth)return text;var out=text;while(out.length>2&&ctx.measureText(out+'…').width>maxWidth)out=out.slice(0,-1);return out+'…'}
function wrap4(ctx,text,maxWidth,maxLines){var words=String(text||'').trim().split(/\s+/).filter(Boolean),lines=[],line='';for(var i=0;i<words.length;i++){var next=line?line+' '+words[i]:words[i];if(ctx.measureText(next).width<=maxWidth){line=next}else{if(line)lines.push(line);line=words[i];if(lines.length>=maxLines-1)break}}if(line&&lines.length<maxLines)lines.push(line);if(i<words.length-1&&lines.length)lines[lines.length-1]=ellipsis4(ctx,lines[lines.length-1],maxWidth);return lines}
function drawText4(ctx,text,x,y,maxWidth,font,fill,align){setText4(ctx,font,fill,align);ctx.fillText(ellipsis4(ctx,text,maxWidth),x,y,maxWidth)}
function drawWrapped4(ctx,text,x,y,maxWidth,font,fill,align,lineHeight,maxLines){setText4(ctx,font,fill,align);var lines=wrap4(ctx,text,maxWidth,maxLines||3);for(var i=0;i<lines.length;i++)ctx.fillText(lines[i],x,y+i*(lineHeight||20),maxWidth);return lines.length}
function loadImage4(src){src=String(src||'').trim();if(!src)return Promise.resolve(null);try{var engine=window.AlanRangDocumentEngineV2;if(engine&&typeof engine.loadImage==='function')return engine.loadImage(src)}catch(_){ }return new Promise(function(resolve){try{var im=new Image();im.onload=function(){resolve(im)};im.onerror=function(){resolve(null)};im.src=src}catch(_){resolve(null)}})}
function drawContain4(ctx,img,x,y,w,h){if(!img)return;var iw=img.naturalWidth||img.width||1,ih=img.naturalHeight||img.height||1,scale=Math.min(w/iw,h/ih),dw=iw*scale,dh=ih*scale;ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
function drawHeader4(ctx,model,shell,first,pageNo,total){
  var x=50,y=50,w=1140,h=first?300:205,code=model.templateCode||'t4',cropH=code==='t6'?310:(code==='t7'?315:285);
  rr4(ctx,x,y,w,h,24,'#061e35','#d79b22',3);
  if(shell){try{ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(shell,0,0,shell.naturalWidth||shell.width||1087,Math.min(cropH,shell.naturalHeight||shell.height||cropH),x,y,w,h);ctx.restore()}catch(_){ }}
  var cfg=code==='t4'?{side:'left',sx:170,sw:205,y1:78,y2:118,ya:153}:{side:'right',sx:(code==='t6'?862:850),sw:(code==='t6'?190:195),y1:(code==='t6'?86:92),y2:(code==='t6'?129:164),ya:(code==='t6'?174:225)};
  var scaleX=w/1087,scaleY=h/cropH,cx=x+(cfg.sx+cfg.sw/2)*scaleX,cw=Math.max(180,cfg.sw*scaleX*1.25),phoneFont=first?'bold 19px Tahoma,Arial':'bold 15px Tahoma,Arial',addressFont=first?'16px Tahoma,Arial':'13px Tahoma,Arial';
  if(model.brand.phone1)drawText4(ctx,model.brand.phone1,cx,y+cfg.y1*scaleY,cw,phoneFont,'#fff1bd','center');
  if(model.brand.phone2)drawText4(ctx,model.brand.phone2,cx,y+cfg.y2*scaleY,cw,phoneFont,'#fff1bd','center');
  if(first&&model.brand.address)drawWrapped4(ctx,model.brand.address,cx,y+cfg.ya*scaleY,cw,addressFont,'#f8e8ba','center',18,4);
  var pillW=430,pillH=58,pillX=x+(w-pillW)/2,pillY=y+h-pillH+10;rr4(ctx,pillX,pillY,pillW,pillH,28,'rgba(6,30,53,.94)','#d79b22',3);drawText4(ctx,first?'صورتحساب رسمی مشتری':'صورتحساب مشتری — ادامه',pillX+pillW/2,pillY+38,pillW-36,first?'bold 25px Tahoma,Arial':'bold 21px Tahoma,Arial','#ffffff','center');
  drawText4(ctx,'صفحه '+fa4(pageNo)+' از '+fa4(total),x+82,y+h-20,120,'15px Tahoma,Arial','#f4c752','center');
}
function drawMeta4(ctx,model,y){
  rr4(ctx,50,y,1140,138,18,'#fffaf0','#dfbd65',2);var right=1160,mid=620,left=80;
  drawText4(ctx,'نام مشتری',right,y+34,210,'18px Tahoma,Arial','#9a6b10','right');drawText4(ctx,model.customer.name||'—',right,y+70,400,'bold 25px Tahoma,Arial','#0f2740','right');
  drawText4(ctx,'تلفن',mid,y+34,170,'18px Tahoma,Arial','#9a6b10','right');drawText4(ctx,model.customer.phone||'—',mid,y+70,300,'bold 23px Tahoma,Arial','#0f2740','right');
  drawText4(ctx,'بازه حساب',right,y+101,210,'18px Tahoma,Arial','#9a6b10','right');drawText4(ctx,model.periodLabel,right-105,y+101,330,'bold 20px Tahoma,Arial','#0f2740','right');
  drawText4(ctx,'تاریخ گزارش',mid,y+101,170,'18px Tahoma,Arial','#9a6b10','right');drawText4(ctx,model.reportDate||'—',mid-110,y+101,260,'bold 20px Tahoma,Arial','#0f2740','right');
  if(model.customer.address)drawText4(ctx,model.customer.address,left+400,y+128,430,'17px Tahoma,Arial','#64748b','center');
}
function drawSummary4(ctx,model,y){
  var s=model.summary||{},items=[['مانده شروع',money4(model.openingBalance),status4(model.openingBalance).label],['فاکتورها',money4(s.invoices),fa4(s.invoiceCount||0)+' فاکتور'],['دریافت‌ها',money4(s.payments),fa4(s.paymentCount||0)+' دریافت'],['چک',money4(s.checkPayments),fa4(s.checkPaymentCount||0)+' چک'],['اصلاحات',signed4(s.adjustments),'خالص'],['مانده پایان',money4(model.closingBalance),status4(model.closingBalance).label]],gap=10,w=(1140-gap*5)/6;
  items.forEach(function(it,i){var x=50+(5-i)*(w+gap),final=i===5;rr4(ctx,x,y,w,132,16,final?'#fff3cd':'#ffffff',final?'#d79b22':'#dce5ee',final?3:2);drawText4(ctx,it[0],x+w-14,y+31,w-28,'16px Tahoma,Arial','#64748b','right');drawText4(ctx,it[1],x+w-14,y+73,w-28,'bold 20px Tahoma,Arial',final?'#8a5a00':'#0f2740','right');drawText4(ctx,it[2],x+w-14,y+108,w-28,'14px Tahoma,Arial','#64748b','right')});
}
function drawScope4(ctx,model,y){rr4(ctx,50,y,1140,58,14,'#f8fafc','#cbd5e1',2);drawText4(ctx,reportScope4(model),1165,y+37,1090,'17px Tahoma,Arial','#475569','right')}
function drawTable4(ctx,page,model,y){
  var x=50,w=1140,headH=56,rowH=72,cols=[{x:1120,w:70,label:'ردیف'},{x:975,w:145,label:'تاریخ'},{x:630,w:345,label:'شرح / مرجع'},{x:455,w:175,label:'بدهکار'},{x:280,w:175,label:'بستانکار'},{x:50,w:230,label:'مانده'}];
  rr4(ctx,x,y,w,headH,10,'#061e35','#d79b22',2);cols.forEach(function(c){drawText4(ctx,c.label,c.x+c.w/2,y+36,c.w-12,'bold 17px Tahoma,Arial','#ffffff','center')});
  page.rows.forEach(function(r,idx){var yy=y+headH+idx*rowH,bg=r.opening?'#fffaf0':(idx%2?'#f8fafc':'#ffffff');ctx.fillStyle=bg;ctx.fillRect(x,yy,w,rowH);ctx.strokeStyle='#d9e0e7';ctx.lineWidth=1;ctx.strokeRect(x,yy,w,rowH);cols.slice(0,-1).forEach(function(c){ctx.beginPath();ctx.moveTo(c.x,yy);ctx.lineTo(c.x,yy+rowH);ctx.stroke()});
    var globalIndex=(page.first?idx:(FIRST_PAGE_ROWS+((page.index-1)*NEXT_PAGE_ROWS)+idx));drawText4(ctx,fa4(globalIndex),1185,yy+44,55,'16px Tahoma,Arial','#334155','center');drawText4(ctx,r.date||'—',1047,yy+44,125,'16px Tahoma,Arial','#334155','center');
    var desc=r.opening?'مانده انتقالی به ابتدای بازه':(r.kindLabel+(r.ref&&r.ref!=='—'?' — '+r.ref:''));drawText4(ctx,desc,960,yy+31,315,'bold 16px Tahoma,Arial','#0f2740','right');if(r.note&&!r.opening){drawText4(ctx,r.note,960,yy+58,315,'12px Tahoma,Arial','#64748b','right')}
    var amount=Number(r.amount)||0;drawText4(ctx,amount>0?money4(amount):'—',542,yy+44,155,'15px Tahoma,Arial','#7f1d1d','center');drawText4(ctx,amount<0?money4(amount):'—',367,yy+44,155,'15px Tahoma,Arial','#166534','center');drawText4(ctx,money4(r.running),165,yy+30,205,'bold 16px Tahoma,Arial','#0f2740','center');drawText4(ctx,status4(r.running).label,165,yy+56,205,'13px Tahoma,Arial','#64748b','center');
  });
  return y+headH+page.rows.length*rowH;
}
function drawFooter4(ctx,model,pageNo,total,y){y=Number(y)||1640;ctx.fillStyle='#d79b22';ctx.fillRect(50,y,1140,4);ctx.fillStyle='#061e35';ctx.fillRect(50,y+4,1140,66);drawText4(ctx,'✦ '+model.brand.name+'؛ نظم در کار، آرامش در حساب ✦',REPORT_WIDTH/2,y+45,760,'bold 20px Tahoma,Arial','#ffffff','center');drawText4(ctx,fa4(pageNo)+' / '+fa4(total),105,y+45,90,'15px Tahoma,Arial','#f4c752','center')}
async function buildCanvases4(customerOrModel,options){
  var model=customerOrModel&&customerOrModel.version===STAGE4_VERSION?customerOrModel:reportModel4(customerOrModel);if(!model)return [];
  options=options||{};var pages=pagePlan4(model),shell=await loadImage4(model.assets&&model.assets.invoiceShell),out=[];
  for(var i=0;i<pages.length;i++){
    var p=pages[i],tableY=p.first?758:350,tableBottom=tableY+56+p.rows.length*72,compact=!!options.compactImage&&p.last,targetH=compact?Math.max(1040,Math.min(REPORT_HEIGHT,tableBottom+146)):REPORT_HEIGHT,canvas=document.createElement('canvas');canvas.width=REPORT_WIDTH;canvas.height=targetH;var ctx=canvas.getContext('2d');ctx.fillStyle='#eef2f6';ctx.fillRect(0,0,REPORT_WIDTH,targetH);rr4(ctx,28,28,REPORT_WIDTH-56,targetH-56,28,'#ffffff','#d79b22',3);drawHeader4(ctx,model,shell,p.first,i+1,pages.length);
    if(p.first){drawMeta4(ctx,model,370);drawSummary4(ctx,model,528);drawScope4(ctx,model,680)}else{drawScope4(ctx,model,272)}
    drawTable4(ctx,p,model,tableY);drawFooter4(ctx,model,i+1,pages.length,targetH-98);out.push(canvas);
  }
  return out;
}
function blobCanvas4(canvas){if(typeof canvasToBlob==='function')return canvasToBlob(canvas,'image/jpeg',.94);if(window.AlanRangDocumentEngineV2&&typeof window.AlanRangDocumentEngineV2.canvasToBlob==='function')return window.AlanRangDocumentEngineV2.canvasToBlob(canvas,'image/jpeg',.94);return new Promise(function(resolve){canvas.toBlob(resolve,'image/jpeg',.94)})}
function baseName4(model){var date=String(model.reportDate||'').replace(/[^0-9۰-۹٠-٩]+/g,'-');return 'AlanRang_Statement_'+cleanFile4(model.customer.name||'Customer')+'_'+date}
async function imageBlobs4(customerOrId){var model=reportModel4(customerOrId);if(!model)return {model:null,canvases:[],blobs:[]};var canvases=await buildCanvases4(model,{compactImage:true}),blobs=[];for(var i=0;i<canvases.length;i++)blobs.push(await blobCanvas4(canvases[i]));return {model:model,canvases:canvases,blobs:blobs}}
async function saveImages4(customerOrId){var pack=await imageBlobs4(customerOrId);if(!pack.model||!pack.blobs.length)return false;var base=baseName4(pack.model);for(var i=0;i<pack.blobs.length;i++){var name=base+(pack.blobs.length>1?('_p'+(i+1)):'')+'.jpg';if(typeof downloadBlob==='function')downloadBlob(pack.blobs[i],name)}try{showToast(pack.blobs.length>1?fa4(pack.blobs.length)+' صفحه گزارش ذخیره شد':'تصویر گزارش ذخیره شد')}catch(_){ }return true}
async function shareImages4(customerOrId){var pack=await imageBlobs4(customerOrId);if(!pack.model||!pack.blobs.length)return false;var base=baseName4(pack.model),files=pack.blobs.map(function(b,i){var name=base+(pack.blobs.length>1?('_p'+(i+1)):'')+'.jpg';return typeof exportFileFromBlob==='function'?exportFileFromBlob(b,name,'image/jpeg'):new File([b],name,{type:'image/jpeg'})});try{if(typeof navigator!=='undefined'&&navigator.share&&navigator.canShare&&navigator.canShare({files:files})){await navigator.share({title:'صورتحساب '+(pack.model.customer.name||'مشتری')+' - آلان رنگ',files:files});try{showToast('گزارش تصویری آماده ارسال شد')}catch(_){ }return true}}catch(e){if(e&&e.name==='AbortError')return false;throw e}await saveImages4(customerOrId);try{showToast('ارسال چندتصویری پشتیبانی نشد؛ صفحات ذخیره شدند')}catch(_){ }return true}
async function pdfBlob4(customerOrId){var model=reportModel4(customerOrId);if(!model)return {model:null,blob:null};var canvases=await buildCanvases4(model,{compactImage:false}),blobs=[];for(var i=0;i<canvases.length;i++)blobs.push(await blobCanvas4(canvases[i]));if(!blobs.length||typeof makePdfBlobFromJpegPages!=='function')return {model:model,blob:null};var blob=await makePdfBlobFromJpegPages(blobs,canvases.map(function(c){return {w:c.width,h:c.height}}));return {model:model,blob:blob}}
async function savePdf4(customerOrId){var pack=await pdfBlob4(customerOrId);if(!pack.model||!pack.blob){try{showToast('ساخت PDF گزارش در دسترس نیست')}catch(_){ }return false}if(typeof downloadBlob==='function')downloadBlob(pack.blob,baseName4(pack.model)+'.pdf');try{showToast('PDF صورتحساب ذخیره شد')}catch(_){ }return true}
async function sharePdf4(customerOrId){var pack=await pdfBlob4(customerOrId);if(!pack.model||!pack.blob)return false;var name=baseName4(pack.model)+'.pdf',file=typeof exportFileFromBlob==='function'?exportFileFromBlob(pack.blob,name,'application/pdf'):new File([pack.blob],name,{type:'application/pdf'});try{if(typeof navigator!=='undefined'&&navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({title:'صورتحساب '+(pack.model.customer.name||'مشتری')+' - آلان رنگ',files:[file]});try{showToast('PDF صورتحساب آماده ارسال شد')}catch(_){ }return true}}catch(e){if(e&&e.name==='AbortError')return false;throw e}if(typeof downloadBlob==='function')downloadBlob(pack.blob,name);try{showToast('ارسال مستقیم پشتیبانی نشد؛ PDF ذخیره شد')}catch(_){ }return true}
function installStyle4(){
  if(typeof document==='undefined'||!document.head||document.getElementById('ar39100-stage4-style'))return;
  var s=document.createElement('style');s.id='ar39100-stage4-style';s.textContent='\
.ar39100-report-sheet{background:#fff;border:2px solid #d79b22;border-radius:20px;overflow:hidden;color:#0f2740;box-shadow:0 14px 34px rgba(15,39,64,.1);direction:rtl}.ar39100-report-header{position:relative;overflow:hidden;padding:0;background:#061e35;color:#fff;border-bottom:3px solid #d79b22}.ar39100-current-invoice-header{width:100%}.ar39100-current-invoice-t4{aspect-ratio:1087/285}.ar39100-current-invoice-t6{aspect-ratio:1087/310}.ar39100-current-invoice-t7{aspect-ratio:1087/315}.ar39100-current-shell-image{position:absolute;inset:0 auto auto 0;width:100%;height:auto;max-width:none;display:block}.ar39100-current-shell-contact{position:absolute;z-index:2;color:#fff1bd;text-align:center;font-weight:950;line-height:1.38;text-shadow:0 1px 2px #000;display:grid;gap:2px;white-space:normal;overflow:visible}.ar39100-current-shell-contact b,.ar39100-current-shell-contact small{display:block;overflow:visible;text-overflow:clip;white-space:normal}.ar39100-current-shell-contact b{font-size:clamp(9px,1.8vw,14px);direction:ltr}.ar39100-current-shell-contact small{font-size:clamp(7px,1.45vw,11px);line-height:1.45}.ar39100-current-invoice-t4 .ar39100-current-shell-contact{left:10.5%;top:24%;width:25%}.ar39100-current-invoice-t6 .ar39100-current-shell-contact{right:5%;top:25%;width:21%}.ar39100-current-invoice-t7 .ar39100-current-shell-contact{right:4.5%;top:25%;width:22%}.ar39100-current-shell-title{position:absolute;z-index:3;left:50%;bottom:5px;transform:translateX(-50%);min-width:38%;max-width:65%;padding:6px 18px;border:2px solid #d79b22;border-radius:999px;background:rgba(6,30,53,.94);color:#fff;font-weight:1000;text-align:center;font-size:clamp(10px,2vw,16px);box-shadow:0 2px 8px rgba(0,0,0,.3)}.ar39100-report-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px}.ar39100-report-meta>div{border:1px solid #e5cf91;background:#fffaf0;border-radius:12px;padding:10px}.ar39100-report-meta .wide{grid-column:1/-1}.ar39100-report-meta span,.ar39100-report-meta b{display:block}.ar39100-report-meta span{font-size:9px;color:#9a6b10;font-weight:900}.ar39100-report-meta b{font-size:12px;margin-top:4px}.ar39100-report-filter-note{margin:0 14px 10px;background:#eef6ff;border:1px solid #93c5fd;color:#1e3a8a;border-radius:12px;padding:9px 11px;font-size:9px;line-height:1.8}.ar39100-report-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:0 14px 14px}.ar39100-report-summary>div{border:1px solid #dfe6ee;border-radius:12px;padding:9px;background:#fff}.ar39100-report-summary>div.final{background:#fff3cd;border:2px solid #d79b22}.ar39100-report-summary span,.ar39100-report-summary b,.ar39100-report-summary small{display:block}.ar39100-report-summary span{font-size:8.5px;color:#64748b;font-weight:900}.ar39100-report-summary b{font-size:12px;margin:5px 0}.ar39100-report-summary small{font-size:8px;color:#64748b}.ar39100-report-ledger{padding:0 14px 14px}.ar39100-report-ledger .title{display:flex;justify-content:space-between;gap:10px;align-items:flex-end;margin-bottom:8px}.ar39100-report-ledger .title b{font-size:14px}.ar39100-report-ledger .title span{font-size:8px;color:#64748b;text-align:left}.ar39100-report-ledger table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:8px}.ar39100-report-ledger th{background:#061e35;color:#fff;padding:8px 3px;border-left:1px solid #64748b}.ar39100-report-ledger td{border:1px solid #d5dde5;padding:7px 4px;text-align:center;vertical-align:middle}.ar39100-report-ledger td:nth-child(3){text-align:right}.ar39100-report-ledger td b,.ar39100-report-ledger td small{display:block}.ar39100-report-ledger td small{font-size:7px;color:#64748b;margin-top:3px}.ar39100-report-ledger tr.opening td{background:#fffaf0;font-weight:900}.ar39100-report-footer{background:#061e35;color:#fff;border-top:3px solid #d79b22;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px}.ar39100-report-footer b,.ar39100-report-footer span{display:block}.ar39100-report-footer b{color:#f4c752}.ar39100-report-footer span{font-size:8px;color:#dbe7f2;margin-top:3px}.ar39100-report-footer strong{font-size:10px}.ar39100-report-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.ar39100-report-actions .full{grid-column:1/-1}@media(max-width:360px){.ar39100-current-shell-title{max-width:78%;padding:5px 12px}.ar39100-report-summary{grid-template-columns:repeat(2,minmax(0,1fr))}}@media print{body.ar39100-report-mode *{visibility:hidden!important}body.ar39100-report-mode .ar39100-report-sheet,body.ar39100-report-mode .ar39100-report-sheet *{visibility:visible!important}body.ar39100-report-mode .ar39100-report-sheet{position:absolute!important;left:0!important;right:0!important;top:0!important;width:190mm!important;max-width:190mm!important;border-radius:0!important;box-shadow:none!important;margin:0 auto!important}body.ar39100-report-mode .ar39100-report-actions,body.ar39100-report-mode .back-row{display:none!important}body.ar39100-report-mode .ar39100-report-ledger thead{display:table-header-group!important}body.ar39100-report-mode .ar39100-report-ledger tr{break-inside:avoid!important;page-break-inside:avoid!important}}';document.head.appendChild(s);
}

var previousRenderAccount4=(typeof renderAccount==='function')?renderAccount:null;
if(previousRenderAccount4){
  renderAccount=function(){
    var customer=null;try{customer=typeof customerById==='function'?(customerById(state.selectedCustomerId)||((data.customers||[])[0])):null}catch(_){customer=null}
    if(customer&&state&&state.ar39100ProfessionalReport){try{if(typeof setTimeout==='function')setTimeout(function(){if(document&&document.body)document.body.classList.add('ar39100-report-mode')},0)}catch(_){ }return reportPage4(customer)}
    try{if(typeof document!=='undefined'&&document.body)document.body.classList.remove('ar39100-report-mode')}catch(_){ }
    return previousRenderAccount4.apply(this,arguments);
  };
}
function currentCustomer4(){try{return typeof customerById==='function'?customerById(state&&state.selectedCustomerId):null}catch(_){return null}}
if(typeof document!=='undefined'&&document.addEventListener){
  document.addEventListener('click',function(e){
    var el=e.target&&e.target.closest?e.target.closest('[data-ar39100-stage4]'):null;if(!el)return;var action=el.dataset.ar39100Stage4||'',customer=currentCustomer4();if(!customer)return;
    if(action==='openReport'){if(!state)window.state={};state.ar39100ProfessionalReport=true;try{document.body.classList.add('ar39100-report-mode')}catch(_){ }if(typeof renderApp==='function')renderApp()}
    else if(action==='closeReport'){state.ar39100ProfessionalReport=false;try{document.body.classList.remove('ar39100-report-mode')}catch(_){ }if(typeof renderApp==='function')renderApp()}
    else if(action==='saveImage'){saveImages4(customer).catch(function(err){console.error(err);try{showToast('ذخیره تصویر گزارش انجام نشد')}catch(_){ }})}
    else if(action==='shareImage'){shareImages4(customer).catch(function(err){console.error(err);if(!(err&&err.name==='AbortError'))try{showToast('ارسال تصویر گزارش انجام نشد')}catch(_){ }})}
    else if(action==='savePdf'){savePdf4(customer).catch(function(err){console.error(err);try{showToast('ذخیره PDF گزارش انجام نشد')}catch(_){ }})}
    else if(action==='sharePdf'){sharePdf4(customer).catch(function(err){console.error(err);if(!(err&&err.name==='AbortError'))try{showToast('ارسال PDF گزارش انجام نشد')}catch(_){ }})}
    else if(action==='printReport'){try{document.body.classList.add('ar39100-report-mode');window.print()}catch(_){ }}else return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  },true);
}
API.runtimeVersion=STAGE4_VERSION;
API.stage4={version:STAGE4_VERSION,readOnly:true,professionalReport:true,multiPageImage:true,pdfExport:true,imageShare:true,pdfShare:true,canonicalSource:true};
API.stage4ReportModel=reportModel4;
API.stage4PagePlan=pagePlan4;
API.stage4ReportHtml=reportSheet4;
API.stage4BuildCanvases=buildCanvases4;
API.stage4SaveImages=saveImages4;
API.stage4ShareImages=shareImages4;
API.stage4SavePdf=savePdf4;
API.stage4SharePdf=sharePdf4;
API.runtimeVersion='39.10.0-customer-account-stage5-fix2-v01';
API.stage5Fix2={version:'39.10.0-customer-account-stage5-fix2-v01',currentInvoiceShell:true,statementShareAsImage:true,compactImageExport:true,pdfKeepsA4:true,technicalCopyCleaned:true};
installStyle4();
try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39100-stage4-style',installStyle4)}catch(_){ }
})();
