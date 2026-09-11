(function(){
'use strict';
if(window.__ALANRANG_PRODUCT_V3990__)return;
window.__ALANRANG_PRODUCT_V3990__=true;

var VERSION='39.8.7';
var SCHEMA_VERSION=3985;
var old={};

function n(v){try{return typeof num==='function'?num(v):Number(String(v||'').replace(/[^0-9.-]/g,''))||0}catch(_){return 0}}
function esc(v){try{return typeof safe==='function'?safe(v):String(v==null?'':v)}catch(_){return String(v==null?'':v)}}
function attr(v){try{return typeof safeAttr==='function'?safeAttr(v):esc(v)}catch(_){return esc(v)}}
function mon(v){try{return typeof money==='function'?money(Math.round(n(v))):String(Math.round(n(v)))+' تومان'}catch(_){return String(v||0)+' تومان'}}
function fa(v){try{return typeof faDigits==='function'?faDigits(v):String(v)}catch(_){return String(v)} }
function copy(v){try{return JSON.parse(JSON.stringify(v))}catch(_){return null}}
function newId(prefix){try{return uid(prefix)}catch(_){return String(prefix||'id')+'_'+Date.now()+'_'+Math.random().toString(16).slice(2)}}
function now(){return new Date().toISOString()}
function customer(id){try{return customerById(id)}catch(_){return null}}
function invoiceRaw(id){return (data.invoices||[]).find(function(x){return x&&String(x.id)===String(id)})||null}
function proforma(id){return (data.proformas||[]).find(function(x){return x&&String(x.id)===String(id)})||null}
function invoiceAdjustment(id){return (data.invoiceAdjustments||[]).find(function(x){return x&&String(x.id)===String(id)})||null}
function accountAdjustment(id){return (data.accountAdjustments||[]).find(function(x){return x&&String(x.id)===String(id)})||null}
old.invoiceTotals=invoiceTotals;
function dateSerial(value){try{var p=parseJalaliDate(value||'');return p?p.jy*372+p.jm*31+p.jd:0}catch(_){return 0}}
function period(value,y,m){try{var p=parseJalaliDate(value||'');return !!(p&&p.jy===n(y)&&p.jm===n(m))}catch(_){return false}}
function effect(row){var amount=Math.abs(n(row&&row.amount));return row&&row.direction==='debit'?amount:-amount}
function documentLabel(row){
  if(!row)return 'سند';
  if(row.documentType==='proforma')return 'پیش‌فاکتور';
  if(row.documentType==='invoiceAdjustmentPreview'||row.documentType==='invoiceAdjustment')return row.adjustmentKind==='increase'?'سند اصلاح افزایشی':row.adjustmentKind==='decrease'?'سند اصلاح کاهشی':'سند برگشت فاکتور';
  return 'فاکتور اجرا';
}

function migrateV3983(){
  if(!data||typeof data!=='object')return;
  if(!data.settings||typeof data.settings!=='object'||Array.isArray(data.settings))data.settings={};
  if(!Array.isArray(data.proformas))data.proformas=[];
  if(!Array.isArray(data.invoiceAdjustments))data.invoiceAdjustments=[];
  if(!Array.isArray(data.accountAdjustments))data.accountAdjustments=[];
  var previous=data.settings.v3984AccountingMigration;
  if(previous&&previous.done)return;
  var legacy=data.settings.v3983Accounting;
  var migrated={manualEntries:0,quotes:0,creditNotes:0};
  function hasLegacy(list,key){return (list||[]).some(function(x){return x&&String(x.legacyV3983Id||'')===String(key||'')})}
  if(legacy&&typeof legacy==='object'&&!Array.isArray(legacy)){
    (Array.isArray(legacy.manualEntries)?legacy.manualEntries:[]).forEach(function(x,index){
      if(!x)return;var legacyId=x.id||('manual_'+index);if(hasLegacy(data.accountAdjustments,legacyId))return;
      var reason=[String(x.title||'اصلاح حساب').trim(),String(x.note||'').trim()].filter(Boolean).join(' — ');
      data.accountAdjustments.push({id:newId('aadj_mig'),documentType:'accountAdjustment',documentNumber:'BAL-MIG-'+String(index+1).padStart(4,'0'),customerId:x.customerId,date:x.date||'',direction:x.direction==='debit'?'debit':'credit',amount:Math.abs(n(x.amount)),reason:reason||'اصلاح حساب منتقل‌شده از نسخه 39.8.3',createdAt:x.createdAt||now(),updatedAt:x.updatedAt||x.createdAt||now(),legacyV3983Id:legacyId,legacyV3983:true});
      migrated.manualEntries++;
    });
    (Array.isArray(legacy.quotes)?legacy.quotes:[]).forEach(function(q,index){
      if(!q)return;var legacyId=q.id||q.quoteId||('quote_'+index);if(hasLegacy(data.proformas,legacyId))return;
      var raw=copy(q)||{};
      data.proformas.push({id:newId('pf_mig'),documentType:'proforma',invoiceNumber:q.quoteId||('PF-MIG-'+String(index+1).padStart(4,'0')),customerId:q.customerId,date:q.date||'',projectTitle:q.work||q.subject||'پیش‌فاکتور منتقل‌شده',description:[q.message||'', 'منتقل‌شده از پیش‌فاکتور نسخه 39.8.3'].filter(Boolean).join(' — '),items:[],payments:[],workflowStatus:'پیش‌فاکتور',status:q.status==='converted'?'converted':'open',convertedInvoiceId:q.convertedInvoiceId||'',convertedAt:q.convertedAt||'',createdAt:q.createdAt||now(),updatedAt:q.updatedAt||q.createdAt||now(),legacyV3983Id:legacyId,legacyV3983:true,legacyV3983Quote:raw});
      migrated.quotes++;
    });
  }
  if(Array.isArray(data.invoices)){
    var kept=[];
    data.invoices.forEach(function(inv,index){
      if(!inv||inv.documentType!=='credit_note'){kept.push(inv);return}
      var legacyId=inv.id||('credit_note_'+index);
      if(!hasLegacy(data.invoiceAdjustments,legacyId)){
        var amount=0;try{amount=Math.abs(n(old.invoiceTotals(inv).totalAmount))}catch(_){amount=Math.abs((inv.items||[]).reduce(function(sum,row){return sum+n(row&&row.total!=null?row.total:n(row&&row.quantity)*n(row&&row.unitPrice))},0))}
        data.invoiceAdjustments.push({id:newId('iadj_mig'),documentType:'invoiceAdjustment',documentNumber:inv.invoiceNumber||('ADJ-MIG-'+String(index+1).padStart(4,'0')),invoiceId:inv.sourceInvoiceId||'',invoiceNumber:inv.sourceInvoiceNumber||'',customerId:inv.customerId,date:inv.date||'',adjustmentKind:inv.correctionKind==='full'?'return':'decrease',direction:'credit',amount:Math.abs(amount),reason:inv.correctionReason||inv.description||'اصلاحیه منتقل‌شده از نسخه 39.8.3',invoiceTemplateId:inv.invoiceTemplateId||((data.settings||{}).activeInvoiceTemplateId),createdAt:inv.createdAt||now(),updatedAt:inv.updatedAt||inv.createdAt||now(),legacyV3983Id:legacyId,legacyV3983:true});
        migrated.creditNotes++;
      }
    });
    data.invoices=kept;
  }
  data.settings.v3984AccountingMigration={done:true,source:'39.8.3',completedAt:now(),migrated:migrated};
}

function ensureModel(){
  if(!Array.isArray(data.proformas))data.proformas=[];
  if(!Array.isArray(data.invoiceAdjustments))data.invoiceAdjustments=[];
  if(!Array.isArray(data.accountAdjustments))data.accountAdjustments=[];
  if(!Array.isArray(data.recycleBin))data.recycleBin=[];
  migrateV3983();
  data.schemaVersion=Math.max(n(data.schemaVersion),SCHEMA_VERSION);
  data.proformas.forEach(function(p){if(!p)return;p.documentType='proforma';p.workflowStatus='پیش‌فاکتور';p.payments=[];if(!p.status)p.status=p.convertedInvoiceId?'converted':'open'});
  data.invoiceAdjustments.forEach(function(a){if(!a)return;a.documentType='invoiceAdjustment';a.amount=Math.abs(n(a.amount));if(!a.direction)a.direction=a.adjustmentKind==='increase'?'debit':'credit'});
  data.accountAdjustments.forEach(function(a){if(!a)return;a.documentType='accountAdjustment';a.amount=Math.abs(n(a.amount));if(a.direction!=='debit')a.direction='credit'});
}
function save(){ensureModel();try{if(typeof recalculateAllBalances==='function')recalculateAllBalances(false);return saveData()!==false}catch(e){console.error('v39.8.7 save',e);return false}}
function audit(type,title,details,id){try{if(window.AlanRangProduct&&typeof window.AlanRangProduct.addAudit==='function')window.AlanRangProduct.addAudit(type,title,details,id)}catch(_){}}

function customerInvoiceAdjustments(customerId){return (data.invoiceAdjustments||[]).filter(function(x){return x&&String(x.customerId)===String(customerId)})}
function customerAccountAdjustments(customerId){return (data.accountAdjustments||[]).filter(function(x){return x&&String(x.customerId)===String(customerId)})}
function effectsForCustomer(customerId){return customerInvoiceAdjustments(customerId).reduce(function(s,x){return s+effect(x)},0)+customerAccountAdjustments(customerId).reduce(function(s,x){return s+effect(x)},0)}
function isEffectBeforeInvoice(row,inv){
  if(!inv||!inv.id||!invoiceRaw(inv.id))return true;
  var a=dateSerial(row&&row.date),b=dateSerial(inv.date);if(a&&b&&a!==b)return a<b;
  var invStamp=Date.parse(inv.createdAt||'')||0,rowStamp=Date.parse(row&&row.createdAt||'')||0;
  return !!(invStamp&&rowStamp&&rowStamp<invStamp);
}
function monthlyInvoiceAdjustment(y,m){return (data.invoiceAdjustments||[]).filter(function(x){return x&&period(x.date,y,m)}).reduce(function(s,x){return s+effect(x)},0)}
function linkedAdjustments(invoiceId){return (data.invoiceAdjustments||[]).filter(function(x){return x&&String(x.invoiceId)===String(invoiceId)})}
function adjustedInvoiceAmount(inv){var base=old.invoiceTotals?old.invoiceTotals(inv).totalAmount:0;return base+linkedAdjustments(inv&&inv.id).reduce(function(s,x){return s+effect(x)},0)}
function balanceBeforeEvent(target){
  var cid=target&&target.customerId,c=customer(cid);if(!c)return 0;
  var rows=[],order=0;
  (typeof invoicesOf==='function'?invoicesOf(cid):(data.invoices||[]).filter(function(x){return x&&x.customerId===cid})).forEach(function(inv){
    var t=old.invoiceTotals?old.invoiceTotals(inv):invoiceTotals(inv);rows.push({id:inv.id,type:'invoice',date:inv.date,createdAt:inv.createdAt,amount:n(t.totalAmount),order:order++});
    (inv.payments||[]).forEach(function(p){var st=String((p&&(p.status||p.checkStatus))||'');if(st.indexOf('برگشتی')>-1||st.indexOf('لغو')>-1)return;rows.push({id:p.id,type:'payment',date:p.date||inv.date,createdAt:p.createdAt||inv.updatedAt||inv.createdAt,amount:-Math.abs(n(p.amount)),order:order++})});
  });
  customerInvoiceAdjustments(cid).forEach(function(x){rows.push({id:x.id,type:'invoiceAdjustment',date:x.date,createdAt:x.createdAt,amount:effect(x),order:order++})});
  customerAccountAdjustments(cid).forEach(function(x){rows.push({id:x.id,type:'accountAdjustment',date:x.date,createdAt:x.createdAt,amount:effect(x),order:order++})});
  rows.sort(function(a,b){return dateSerial(a.date)-dateSerial(b.date)||(Date.parse(a.createdAt||'')||0)-(Date.parse(b.createdAt||'')||0)||a.order-b.order});
  var running=typeof protectedCustomerOpeningBalance==='function'?protectedCustomerOpeningBalance(c):n(c.openingBalance);
  for(var i=0;i<rows.length;i++){if(rows[i].id===target.id&&rows[i].type===target.documentType)break;running+=rows[i].amount}
  return running;
}

old.recalculateCustomerBalance=recalculateCustomerBalance;
recalculateCustomerBalance=function(customerId){old.recalculateCustomerBalance(customerId);var c=customer(customerId);if(c)c.balance=n(c.balance)+effectsForCustomer(customerId)};
old.previousBalanceForInvoice=previousBalanceForInvoice;
previousBalanceForInvoice=function(inv){
  if(inv&&inv.documentType==='proforma')return 0;
  if(inv&&inv.documentType==='invoiceAdjustmentPreview')return balanceBeforeEvent({id:inv.adjustmentId,customerId:inv.customerId,documentType:'invoiceAdjustment'});
  var base=old.previousBalanceForInvoice(inv);return base+customerInvoiceAdjustments(inv&&inv.customerId).filter(function(x){return isEffectBeforeInvoice(x,inv)}).reduce(function(s,x){return s+effect(x)},0)+customerAccountAdjustments(inv&&inv.customerId).filter(function(x){return isEffectBeforeInvoice(x,inv)}).reduce(function(s,x){return s+effect(x)},0);
};
old.invoiceAccountBreakdown=invoiceAccountBreakdown;
invoiceAccountBreakdown=function(inv){
  if(inv&&inv.documentType==='proforma'){var pt=old.invoiceTotals(inv);return {totalAmount:pt.totalAmount,totalPaid:0,remainingAmount:pt.totalAmount,previousBalance:0,totalDebt:pt.totalAmount,received:0,finalBalance:0}}
  if(inv&&inv.documentType==='invoiceAdjustmentPreview'){var at=old.invoiceTotals(inv),prev=previousBalanceForInvoice(inv);return {totalAmount:at.totalAmount,totalPaid:0,remainingAmount:at.totalAmount,previousBalance:prev,totalDebt:prev+at.totalAmount,received:0,finalBalance:prev+at.totalAmount}}
  return old.invoiceAccountBreakdown(inv);
};
function virtualAdjustmentInvoice(adj){
  if(!adj)return null;var signed=effect(adj),source=invoiceRaw(adj.invoiceId);
  return {id:adj.id,adjustmentId:adj.id,documentType:'invoiceAdjustmentPreview',adjustmentKind:adj.adjustmentKind,customerId:adj.customerId,invoiceNumber:adj.documentNumber||'اصلاح',date:adj.date,projectTitle:documentLabel({documentType:'invoiceAdjustment',adjustmentKind:adj.adjustmentKind})+' مرتبط با فاکتور '+(adj.invoiceNumber||(source&&source.invoiceNumber)||'—'),description:adj.reason||'',items:[{id:'adjustment_line',description:(adj.reason||documentLabel({documentType:'invoiceAdjustment',adjustmentKind:adj.adjustmentKind})),quantity:1,unit:'سند',unitPrice:signed,total:signed}],payments:[],showCustomerAccountStatus:false,invoiceTemplateId:adj.invoiceTemplateId||(source&&source.invoiceTemplateId),createdAt:adj.createdAt,updatedAt:adj.updatedAt||adj.createdAt};
}
old.invoiceById=invoiceById;
invoiceById=function(id){return old.invoiceById(id)||proforma(id)||virtualAdjustmentInvoice(invoiceAdjustment(id))};

function nextProformaNumber(){
  var t=typeof todayJalali==='function'?todayJalali():{jy:1405,jm:1},prefix='PF-'+String(t.jy)+'-',max=0;
  (data.proformas||[]).forEach(function(p){var m=String(p&&p.invoiceNumber||'').match(/^PF-\d{4}-(\d+)$/);if(m)max=Math.max(max,n(m[1]))});
  return prefix+String(max+1).padStart(3,'0');
}
old.resetInvoiceDraft=resetInvoiceDraft;
resetInvoiceDraft=function(customerId){old.resetInvoiceDraft(customerId);state.editingProformaId=null;if(state.invoiceDraft){state.invoiceDraft.documentType='executionInvoice';state.invoiceDraft.workflowStatus='فاکتور';delete state.invoiceDraft.sourceProformaId;delete state.invoiceDraft.sourceProformaNumber}};
function startProforma(customerId){
  resetInvoiceDraft(customerId);state.editingInvoiceId=null;state.editingProformaId=null;
  Object.assign(state.invoiceDraft,{documentType:'proforma',workflowStatus:'پیش‌فاکتور',invoiceNumber:nextProformaNumber(),payments:[],showCustomerAccountStatus:false});
}
function validatedDraftItems(d){
  var items=(d.items||[]).filter(function(it){return String(it&&it.description||'').trim()||n(it&&it.quantity)||n(it&&it.unitPrice)});
  if(!items.length){showToast('حداقل یک ردیف برای پیش‌فاکتور وارد کن');return null}
  for(var i=0;i<items.length;i++){if(!String(items[i].description||'').trim()){showToast('شرح یکی از ردیف‌ها خالی است');return null}if(!(n(items[i].quantity)>0)){showToast('تعداد همه ردیف‌ها باید بیشتر از صفر باشد');return null}if(!(n(items[i].unitPrice)>0)){showToast('قیمت واحد همه ردیف‌ها باید بیشتر از صفر باشد');return null}}
  return items.map(function(it){return Object.assign({},it,{quantity:n(it.quantity),unitPrice:n(it.unitPrice),total:n(it.quantity)*n(it.unitPrice)})});
}
function saveProforma(){
  syncDraftFromDom();if(typeof hasUnsavedInvoiceItemBuilder==='function'&&hasUnsavedInvoiceItemBuilder())commitInvoiceItemFromBuilder(true);
  var d=state.invoiceDraft||{};if(!d.customerId){showToast('اول مشتری را انتخاب کن');return}if(!String(d.invoiceNumber||'').trim()){showToast('شماره پیش‌فاکتور را وارد کن');return}if(!parseJalaliDate(d.date||'')){showToast('تاریخ پیش‌فاکتور معتبر نیست');return}
  var duplicate=(data.proformas||[]).find(function(p){return p&&p.id!==state.editingProformaId&&String(p.customerId)===String(d.customerId)&&normalizedInvoiceLedgerNumber(p.invoiceNumber)===normalizedInvoiceLedgerNumber(d.invoiceNumber)});if(duplicate){showToast('این شماره پیش‌فاکتور برای همین مشتری قبلاً ثبت شده است');return}
  var items=validatedDraftItems(d);if(!items)return;
  var stamp=now(),saved=Object.assign({},copy(d),{id:state.editingProformaId||newId('pro'),documentType:'proforma',workflowStatus:'پیش‌فاکتور',items:items,payments:[],showCustomerAccountStatus:false,status:d.status||'open',createdAt:d.createdAt||stamp,updatedAt:stamp});
  var at=data.proformas.findIndex(function(x){return x&&x.id===saved.id});if(at>-1)data.proformas[at]=saved;else data.proformas.push(saved);
  audit('save','ذخیره پیش‌فاکتور','پیش‌فاکتور '+saved.invoiceNumber+' بدون اثر روی مانده مشتری ذخیره شد',saved.id);save();state.selectedCustomerId=saved.customerId;startProforma(saved.customerId);state.tab='invoice';showToast('پیش‌فاکتور ذخیره شد؛ هنوز وارد حساب مشتری نشده است');
}
old.saveInvoice=saveInvoice;
saveInvoice=function(){
  if(state.invoiceDraft&&state.invoiceDraft.documentType==='proforma'){saveProforma();return}
  if(state.invoiceDraft){state.invoiceDraft.documentType='executionInvoice';if(state.invoiceDraft.workflowStatus==='پیش‌فاکتور')state.invoiceDraft.workflowStatus='فاکتور'}
  var source=state.invoiceDraft&&state.invoiceDraft.sourceProformaId;old.saveInvoice();
  if(source){var made=(data.invoices||[]).filter(function(x){return x&&x.sourceProformaId===source}).slice().sort(function(a,b){return String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))})[0],p=proforma(source);if(made&&p){p.status='converted';p.convertedInvoiceId=made.id;p.convertedAt=now();p.updatedAt=now();audit('convert','تبدیل پیش‌فاکتور','پیش‌فاکتور '+(p.invoiceNumber||'')+' به فاکتور اجرا '+(made.invoiceNumber||'')+' تبدیل شد',p.id);save();showToast('فاکتور اجرا ذخیره شد و پیش‌فاکتور به آن پیوند خورد')}}
};
function editProforma(id){var p=proforma(id);if(!p)return;if(p.convertedInvoiceId){showToast('این پیش‌فاکتور تبدیل شده است؛ تاریخچه آن فقط خواندنی است');return}state.editingInvoiceId=null;state.editingProformaId=id;state.invoiceDraft=copy(p);state.selectedCustomerId=p.customerId;state.tab='invoice';renderApp()}
function convertProforma(id){
  var p=proforma(id);if(!p)return;if(p.convertedInvoiceId&&invoiceRaw(p.convertedInvoiceId)){state.previewInvoiceId=p.convertedInvoiceId;state.tab='preview';renderApp();return}
  resetInvoiceDraft(p.customerId);Object.assign(state.invoiceDraft,{documentType:'executionInvoice',workflowStatus:'فاکتور',customerId:p.customerId,invoiceNumber:nextInvoiceNumber(p.customerId),date:todayFa(),projectTitle:p.projectTitle||'',description:p.description||'',items:(p.items||[]).map(function(x){return Object.assign({},copy(x),{id:newId('it')})}),payments:[],sourceProformaId:p.id,sourceProformaNumber:p.invoiceNumber||'',invoiceTemplateId:p.invoiceTemplateId||((data.settings||{}).activeInvoiceTemplateId)});state.selectedCustomerId=p.customerId;state.tab='invoice';showToast('پیش‌فاکتور برای بررسی به فاکتور اجرا تبدیل شد؛ برای قطعی‌شدن آن را ذخیره کن')
}

function archiveNew(type,payload,label){
  ensureModel();var body=copy(payload);if(!body)return null;var stamp=Date.now(),entry={id:newId('trash'),type:type,entityId:String(body.id||''),label:label||'سند حذف‌شده',payload:body,deletedAt:new Date(stamp).toISOString(),deletedAtMs:stamp,protectedUntilMs:stamp+30*86400000};data.recycleBin.unshift(entry);save();return entry
}
function deleteProforma(id){var p=proforma(id);if(!p)return;if(!confirm('پیش‌فاکتور به حذف‌شده‌ها منتقل شود؟ تا حداقل یک ماه امکان بازگردانی آن وجود دارد.'))return;archiveNew('proforma',p,'پیش‌فاکتور '+(p.invoiceNumber||''));data.proformas=data.proformas.filter(function(x){return x&&x.id!==id});save();if(state.editingProformaId===id)startProforma(p.customerId);showToast('پیش‌فاکتور به حذف‌شده‌ها منتقل شد');renderApp()}
function adjustmentNumber(inv){return 'ADJ-'+String(inv&&inv.invoiceNumber||'F').replace(/\s+/g,'-')+'-'+String(linkedAdjustments(inv&&inv.id).length+1).padStart(2,'0')}
function currentAdjustableAmount(inv){return Math.max(0,adjustedInvoiceAmount(inv))}
function saveInvoiceAdjustment(){
  syncAdjustmentDraft();var d=state.ar3990InvoiceAdjustmentDraft||{},inv=invoiceRaw(d.invoiceId);if(!inv){showToast('فاکتور اصلی پیدا نشد');return}var amount=Math.abs(n(d.amount));if(!amount){showToast('مبلغ سند را وارد کن');return}if(!parseJalaliDate(d.date||'')){showToast('تاریخ سند معتبر نیست');return}if(!String(d.reason||'').trim()){showToast('دلیل اصلاح یا برگشت را بنویس');return}
  var kind=d.adjustmentKind||'return',direction=kind==='increase'?'debit':'credit';if(direction==='credit'&&amount>currentAdjustableAmount(inv)){showToast('مبلغ کاهش نمی‌تواند از مانده قابل اصلاح این فاکتور بیشتر باشد');return}
  var row={id:newId('iadj'),documentType:'invoiceAdjustment',documentNumber:adjustmentNumber(inv),invoiceId:inv.id,invoiceNumber:inv.invoiceNumber||'',customerId:inv.customerId,date:d.date,adjustmentKind:kind,direction:direction,amount:amount,reason:String(d.reason||'').trim(),invoiceTemplateId:inv.invoiceTemplateId||((data.settings||{}).activeInvoiceTemplateId),createdAt:now(),updatedAt:now()};data.invoiceAdjustments.push(row);audit('accounting','ثبت '+documentLabel(row),(direction==='debit'?'+':'−')+mon(amount)+' — فاکتور '+(inv.invoiceNumber||''),row.id);save();state.modal=null;state.ar3990InvoiceAdjustmentDraft=null;showToast(documentLabel(row)+' ثبت شد؛ فاکتور اصلی بدون تغییر ماند');renderApp()
}
function saveAccountAdjustment(){
  syncAccountDraft();var d=state.ar3990AccountAdjustmentDraft||{},c=customer(d.customerId);if(!c){showToast('مشتری پیدا نشد');return}var amount=Math.abs(n(d.amount));if(!amount){showToast('مبلغ اصلاح مانده را وارد کن');return}if(!parseJalaliDate(d.date||'')){showToast('تاریخ سند معتبر نیست');return}if(!String(d.reason||'').trim()){showToast('دلیل اصلاح مانده را بنویس');return}
  var row={id:newId('aadj'),documentType:'accountAdjustment',documentNumber:'BAL-'+String((data.accountAdjustments||[]).length+1).padStart(4,'0'),customerId:c.id,date:d.date,direction:d.direction==='debit'?'debit':'credit',amount:amount,reason:String(d.reason||'').trim(),createdAt:now(),updatedAt:now()};data.accountAdjustments.push(row);audit('accounting','اصلاح دستی مانده مشتری',(row.direction==='debit'?'بدهکار +':'بستانکار −')+mon(amount)+' — '+c.name,row.id);save();state.modal=null;state.ar3990AccountAdjustmentDraft=null;showToast('سند اصلاح مانده ذخیره شد');renderApp()
}
function deleteInvoiceAdjustment(id){var row=invoiceAdjustment(id);if(!row)return;if(!confirm('این سند به حذف‌شده‌ها منتقل شود؟ اثر آن از حساب برداشته می‌شود.'))return;archiveNew('invoiceAdjustment',row,documentLabel(row)+' '+(row.documentNumber||''));data.invoiceAdjustments=data.invoiceAdjustments.filter(function(x){return x&&x.id!==id});save();state.modal=null;showToast('سند به حذف‌شده‌ها منتقل شد و مانده دوباره محاسبه شد');renderApp()}
function deleteAccountAdjustment(id){var row=accountAdjustment(id);if(!row)return;if(!confirm('این سند داخلی به حذف‌شده‌ها منتقل شود؟ اثر آن از مانده برداشته می‌شود.'))return;archiveNew('accountAdjustment',row,'اصلاح مانده '+(row.documentNumber||''));data.accountAdjustments=data.accountAdjustments.filter(function(x){return x&&x.id!==id});save();state.modal=null;showToast('سند داخلی به حذف‌شده‌ها منتقل شد');renderApp()}

old.editInvoice=editInvoice;
editInvoice=function(id){if(proforma(id)){editProforma(id);return}if(invoiceAdjustment(id)){state.ar3990DetailId=id;state.modal='ar3990InvoiceAdjustmentDetail';renderApp();return}old.editInvoice(id)};
old.deleteInvoice=deleteInvoice;
deleteInvoice=function(id){
  if(proforma(id)){deleteProforma(id);return}if(invoiceAdjustment(id)){deleteInvoiceAdjustment(id);return}
  var inv=invoiceRaw(id);old.deleteInvoice(id);if(inv&&!invoiceRaw(id)){data.invoiceAdjustments=data.invoiceAdjustments.filter(function(x){return x&&String(x.invoiceId)!==String(id)});save()}
};
old.deleteCustomer=deleteCustomer;
deleteCustomer=function(id){var c=customer(id);old.deleteCustomer(id);if(c&&!customer(id)){data.proformas=data.proformas.filter(function(x){return x&&String(x.customerId)!==String(id)});data.invoiceAdjustments=data.invoiceAdjustments.filter(function(x){return x&&String(x.customerId)!==String(id)});data.accountAdjustments=data.accountAdjustments.filter(function(x){return x&&String(x.customerId)!==String(id)});save()}};

function putUnique(list,item){if(!item)return;var at=list.findIndex(function(x){return x&&String(x.id)===String(item.id)});if(at>-1)list[at]=copy(item);else list.push(copy(item))}
function installTrashBridge(){
  var api=window.AlanRangTrash;if(!api||api.__v3990)return;var base={archiveCustomerBundle:api.archiveCustomerBundle,archiveInvoiceBundle:api.archiveInvoiceBundle,restore:api.restore,purgeEligible:api.purgeEligible};
  api.archiveCustomerBundle=function(id){var entry=base.archiveCustomerBundle(id);if(entry&&entry.payload){entry.payload.proformas=(data.proformas||[]).filter(function(x){return x&&String(x.customerId)===String(id)});entry.payload.invoiceAdjustments=customerInvoiceAdjustments(id);entry.payload.accountAdjustments=customerAccountAdjustments(id);save()}return entry};
  api.archiveInvoiceBundle=function(id){var entry=base.archiveInvoiceBundle(id);if(entry&&entry.payload){entry.payload.invoiceAdjustments=linkedAdjustments(id);save()}return entry};
  api.restore=function(id){
    var entry=(data.recycleBin||[]).find(function(x){return x&&x.id===id});if(!entry)return false;
    if(entry.type==='proforma'||entry.type==='invoiceAdjustment'||entry.type==='accountAdjustment'){
      var target=entry.type==='proforma'?data.proformas:(entry.type==='invoiceAdjustment'?data.invoiceAdjustments:data.accountAdjustments);putUnique(target,entry.payload);data.recycleBin=data.recycleBin.filter(function(x){return x&&x.id!==id});save();return true
    }
    var payload=copy(entry.payload)||{},ok=base.restore(id);if(ok){(payload.proformas||[]).forEach(function(x){putUnique(data.proformas,x)});(payload.invoiceAdjustments||[]).forEach(function(x){putUnique(data.invoiceAdjustments,x)});(payload.accountAdjustments||[]).forEach(function(x){putUnique(data.accountAdjustments,x)});save()}return ok;
  };
  api.__v3990=true;
}

function syncAdjustmentDraft(){var d=state.ar3990InvoiceAdjustmentDraft;if(!d)return;var get=function(id){return document.getElementById(id)};if(get('ar3990AdjKind'))d.adjustmentKind=get('ar3990AdjKind').value;if(get('ar3990AdjDate'))d.date=get('ar3990AdjDate').value;if(get('ar3990AdjAmount'))d.amount=get('ar3990AdjAmount').value;if(get('ar3990AdjReason'))d.reason=get('ar3990AdjReason').value}
function syncAccountDraft(){var d=state.ar3990AccountAdjustmentDraft;if(!d)return;var get=function(id){return document.getElementById(id)};if(get('ar3990BalDirection'))d.direction=get('ar3990BalDirection').value;if(get('ar3990BalDate'))d.date=get('ar3990BalDate').value;if(get('ar3990BalAmount'))d.amount=get('ar3990BalAmount').value;if(get('ar3990BalReason'))d.reason=get('ar3990BalReason').value}
function pickerHtml(target,current){
  var chosen=parseJalaliDate(current||''),pick=state.ar3990Picker||chosen||todayJalali(),first=jalaaliToGregorian(pick.jy,pick.jm,1),offset=(new Date(first.gy,first.gm-1,first.gd,12).getDay()+1)%7,total=daysInJalaliMonth(pick.jy,pick.jm),today=todayJalali(),cells='';
  for(var i=0;i<offset;i++)cells+='<button type="button" class="jalali-day empty"></button>';
  for(var d=1;d<=total;d++){var isToday=today.jy===pick.jy&&today.jm===pick.jm&&today.jd===d,isSelected=chosen&&chosen.jy===pick.jy&&chosen.jm===pick.jm&&chosen.jd===d;cells+='<button type="button" class="jalali-day '+(isToday?'today ':'')+(isSelected?'selected':'')+'" data-v3990="selectDate" data-target="'+attr(target)+'" data-jy="'+pick.jy+'" data-jm="'+pick.jm+'" data-jd="'+d+'">'+fa(d)+'</button>'}
  return '<div class="jalali-picker"><div class="jalali-head"><button type="button" class="jalali-nav" data-v3990="moveMonth" data-dir="-1">‹</button><b>'+FA_MONTHS[pick.jm-1]+' '+fa(pick.jy)+'</b><button type="button" class="jalali-nav" data-v3990="moveMonth" data-dir="1">›</button></div><div class="jalali-week">'+FA_WEEKDAYS.map(function(x){return '<span>'+x.slice(0,2)+'</span>'}).join('')+'</div><div class="jalali-grid">'+cells+'</div><div class="jalali-footer"><button type="button" class="jalali-today-btn" data-v3990="todayDate" data-target="'+attr(target)+'">امروز</button><button type="button" class="jalali-close-btn" data-v3990="closeDate">انصراف</button></div></div>'
}
function dateField(id,label,value){return '<div class="field"><label>'+esc(label)+'</label><div class="work-date-wrap"><button type="button" class="work-date-btn" data-v3990="openDate" data-target="'+attr(id)+'">تقویم</button><input id="'+attr(id)+'" class="input" value="'+esc(value||'')+'" placeholder="۱۴۰۵/۰۵/۲۹"></div>'+(state.ar3990Picker&&state.ar3990Picker.target===id?pickerHtml(id,value):'')+'</div>'}

function invoiceAdjustmentModal(){
  var d=state.ar3990InvoiceAdjustmentDraft||{},inv=invoiceRaw(d.invoiceId);if(!inv)return '<div class="modal-back"><div class="modal"><h3>سند اصلاح/برگشت</h3><p>فاکتور اصلی پیدا نشد.</p><button class="btn ghost full" data-action="closeModal">بستن</button></div></div>';
  var base=old.invoiceTotals(inv).totalAmount,linked=linkedAdjustments(inv.id).reduce(function(s,x){return s+effect(x)},0);
  return '<div class="modal-back"><div class="modal ar3990-modal"><h3>ثبت سند اصلاح یا برگشت</h3><div class="ar3990-ledger-hint"><b>فاکتور اصلی '+esc(inv.invoiceNumber||'—')+'</b><span>مبلغ اولیه: '+mon(base)+'</span><span>اصلاحات قبلی: '+(linked>=0?'+':'−')+mon(Math.abs(linked))+'</span><span>مبلغ فعلی قابل اصلاح: '+mon(currentAdjustableAmount(inv))+'</span></div><div class="field"><label>نوع سند</label><select id="ar3990AdjKind" class="select"><option value="return" '+(d.adjustmentKind==='return'?'selected':'')+'>برگشت از فاکتور — کاهش بدهی مشتری</option><option value="decrease" '+(d.adjustmentKind==='decrease'?'selected':'')+'>اصلاح کاهشی — کاهش بدهی مشتری</option><option value="increase" '+(d.adjustmentKind==='increase'?'selected':'')+'>اصلاح افزایشی — افزایش بدهی مشتری</option></select></div>'+dateField('ar3990AdjDate','تاریخ صدور سند',d.date)+'<div class="field"><label>مبلغ سند (تومان)</label><input id="ar3990AdjAmount" class="input money-input" inputmode="numeric" value="'+esc(d.amount||'')+'" placeholder="مثلاً ۲,۰۰۰,۰۰۰"></div><div class="field"><label>دلیل اصلاح / برگشت</label><textarea id="ar3990AdjReason" class="textarea" placeholder="مثلاً یک ردیف اجرا نشد یا مبلغ اصلاح شد">'+esc(d.reason||'')+'</textarea></div><div class="ar3990-immutable">فاکتور اصلی تغییر نمی‌کند. این سند بعد از ذخیره خواندنی است؛ برای اصلاح اشتباه، سند معکوس جدید ثبت کن.</div><div class="grid2"><button class="btn gold" data-v3990="saveInvoiceAdjustment">ذخیره سند</button><button class="btn ghost" data-action="closeModal">انصراف</button></div></div></div>'
}
function accountAdjustmentModal(){
  var d=state.ar3990AccountAdjustmentDraft||{},c=customer(d.customerId);
  return '<div class="modal-back"><div class="modal ar3990-modal"><h3>اصلاح دستی مانده مشتری</h3><div class="ar3990-ledger-hint"><b>'+esc(c&&c.name||'مشتری')+'</b><span>مانده فعلی: '+mon(Math.abs(n(c&&c.balance)))+' — '+esc(c?statusOf(c.balance)[0]:'')+'</span></div><div class="field"><label>اثر سند روی حساب</label><select id="ar3990BalDirection" class="select"><option value="debit" '+(d.direction==='debit'?'selected':'')+'>بدهکار کردن مشتری — مانده بیشتر می‌شود</option><option value="credit" '+(d.direction!=='debit'?'selected':'')+'>بستانکار کردن مشتری — مانده کمتر می‌شود</option></select></div>'+dateField('ar3990BalDate','تاریخ سند',d.date)+'<div class="field"><label>مبلغ (تومان)</label><input id="ar3990BalAmount" class="input money-input" inputmode="numeric" value="'+esc(d.amount||'')+'" placeholder="مثلاً ۱,۰۰۰,۰۰۰"></div><div class="field"><label>دلیل اصلاح</label><textarea id="ar3990BalReason" class="textarea" placeholder="مثلاً اصلاح مانده انتقالی یا ثبت توافق حساب">'+esc(d.reason||'')+'</textarea></div><div class="ar3990-immutable">این سند داخلی است و داخل فاکتور مشتری چاپ نمی‌شود. برای حفظ تاریخچه، ویرایش مستقیم ندارد.</div><div class="grid2"><button class="btn gold" data-v3990="saveAccountAdjustment">ذخیره سند</button><button class="btn ghost" data-action="closeModal">انصراف</button></div></div></div>'
}
function adjustmentDetailModal(){
  var row=invoiceAdjustment(state.ar3990DetailId),inv=row&&invoiceRaw(row.invoiceId),c=row&&customer(row.customerId);if(!row)return null;
  return '<div class="modal-back"><div class="modal ar3990-modal"><h3>'+esc(documentLabel(row))+'</h3><div class="summary"><div class="summary-row"><span>شماره سند</span><b>'+esc(row.documentNumber||'—')+'</b></div><div class="summary-row"><span>فاکتور اصلی</span><b>'+esc(row.invoiceNumber||(inv&&inv.invoiceNumber)||'—')+'</b></div><div class="summary-row"><span>مشتری</span><b>'+esc(c&&c.name||'—')+'</b></div><div class="summary-row"><span>تاریخ</span><b>'+esc(row.date||'—')+'</b></div><div class="summary-row total"><span>اثر روی حساب</span><b>'+(effect(row)>=0?'+':'−')+mon(Math.abs(effect(row)))+'</b></div><div class="summary-row"><span>دلیل</span><b>'+esc(row.reason||'—')+'</b></div></div><div class="grid2"><button class="btn gold" data-v3990="previewAdjustment" data-id="'+attr(row.id)+'">مشاهده سند</button><button class="btn red" data-v3990="deleteInvoiceAdjustment" data-id="'+attr(row.id)+'">حذف به سطل</button></div><button class="btn ghost full" style="margin-top:9px" data-action="closeModal">بستن</button></div></div>'
}
function accountAdjustmentDetailModal(){
  var row=accountAdjustment(state.ar3990DetailId),c=row&&customer(row.customerId);if(!row)return null;
  return '<div class="modal-back"><div class="modal ar3990-modal"><h3>سند اصلاح مانده</h3><div class="summary"><div class="summary-row"><span>شماره سند</span><b>'+esc(row.documentNumber||'—')+'</b></div><div class="summary-row"><span>مشتری</span><b>'+esc(c&&c.name||'—')+'</b></div><div class="summary-row"><span>تاریخ</span><b>'+esc(row.date||'—')+'</b></div><div class="summary-row total"><span>اثر روی حساب</span><b>'+(effect(row)>=0?'بدهکار +':'بستانکار −')+mon(Math.abs(effect(row)))+'</b></div><div class="summary-row"><span>دلیل</span><b>'+esc(row.reason||'—')+'</b></div></div><button class="btn red full" data-v3990="deleteAccountAdjustment" data-id="'+attr(row.id)+'">حذف به سطل</button><button class="btn ghost full" style="margin-top:9px" data-action="closeModal">بستن</button></div></div>'
}

try{registerAlanRangModal('v3990-accounting-documents',function(){if(state.modal==='ar3990InvoiceAdjustment')return invoiceAdjustmentModal();if(state.modal==='ar3990AccountAdjustment')return accountAdjustmentModal();if(state.modal==='ar3990InvoiceAdjustmentDetail')return adjustmentDetailModal();if(state.modal==='ar3990AccountAdjustmentDetail')return accountAdjustmentDetailModal();return null})}catch(_){}

function proformaCard(p){
  var c=customer(p.customerId),t=old.invoiceTotals(p),converted=p.convertedInvoiceId&&invoiceRaw(p.convertedInvoiceId);
  return '<article class="card ar3990-proforma-card"><div class="ar3990-doc-head"><div><span class="ar3990-doc-badge proforma">پیش‌فاکتور</span><h3>'+esc(p.invoiceNumber||'—')+'</h3><small>'+esc(c&&c.name||'مشتری حذف‌شده')+' — '+esc(p.date||'')+'</small></div><b>'+mon(t.totalAmount)+'</b></div><div class="muted tiny">'+esc(p.projectTitle||'بدون عنوان')+'</div><div class="ar3990-status '+(converted?'converted':'open')+'">'+(converted?'تبدیل‌شده به فاکتور اجرا '+esc(converted.invoiceNumber||''):'بدون اثر روی حساب مشتری')+'</div><div class="actions"><button class="btn ghost small" data-v3990="previewProforma" data-id="'+attr(p.id)+'">مشاهده</button>'+(converted?'<button class="btn gold small" data-v3990="convertProforma" data-id="'+attr(p.id)+'">مشاهده فاکتور اجرا</button>':'<button class="btn blue small" data-v3990="editProforma" data-id="'+attr(p.id)+'">ویرایش</button><button class="btn gold small" data-v3990="convertProforma" data-id="'+attr(p.id)+'">تبدیل به فاکتور اجرا</button>')+'<button class="btn red small" data-v3990="deleteProforma" data-id="'+attr(p.id)+'">حذف</button></div></article>'
}
function invoiceAdjustmentCard(row){var inv=invoiceRaw(row.invoiceId);return '<article class="ar3990-adjustment-row"><button data-v3990="openInvoiceAdjustmentDetail" data-id="'+attr(row.id)+'"><span class="ar3990-doc-badge '+(effect(row)>=0?'debit':'credit')+'">'+esc(documentLabel(row))+'</span><b>'+esc(row.documentNumber||'—')+'</b><small>فاکتور '+esc(row.invoiceNumber||(inv&&inv.invoiceNumber)||'—')+' — '+esc(row.date||'')+' — '+esc(row.reason||'')+'</small></button><strong class="'+(effect(row)>=0?'debt':'credit')+'">'+(effect(row)>=0?'+':'−')+mon(Math.abs(effect(row)))+'</strong></article>'}
function accountAdjustmentCard(row){return '<article class="ar3990-adjustment-row"><button data-v3990="openAccountAdjustmentDetail" data-id="'+attr(row.id)+'"><span class="ar3990-doc-badge '+(effect(row)>=0?'debit':'credit')+'">اصلاح مانده</span><b>'+esc(row.documentNumber||'—')+'</b><small>'+esc(row.date||'')+' — '+esc(row.reason||'')+'</small></button><strong class="'+(effect(row)>=0?'debt':'credit')+'">'+(effect(row)>=0?'+':'−')+mon(Math.abs(effect(row)))+'</strong></article>'}
function proformaListHtml(cid){var rows=(data.proformas||[]).filter(function(x){return !cid||String(x.customerId)===String(cid)}).slice().reverse();return '<section class="ar3990-doc-section"><div class="ar3990-section-head"><div><h3>پیش‌فاکتورها</h3><small>تا زمان تبدیل، وارد حساب و سود نمی‌شوند.</small></div><button class="btn gold small" data-v3990="newProforma" data-customer-id="'+attr(cid||'')+'">+ پیش‌فاکتور</button></div>'+(rows.map(proformaCard).join('')||'<div class="ar3990-empty">پیش‌فاکتوری ثبت نشده است.</div>')+'</section>'}
function accountingDocumentsHtml(cid){var invRows=customerInvoiceAdjustments(cid).slice().reverse(),accRows=customerAccountAdjustments(cid).slice().reverse();return '<section class="ar3990-doc-section"><div class="ar3990-section-head"><div><h3>اسناد اصلاحی حساب</h3><small>تاریخچه مستقل و غیرقابل‌ویرایش</small></div><button class="btn blue small" data-v3990="newAccountAdjustment" data-customer-id="'+attr(cid||'')+'">+ اصلاح مانده</button></div>'+((invRows.length||accRows.length)?invRows.map(invoiceAdjustmentCard).join('')+accRows.map(accountAdjustmentCard).join(''):'<div class="ar3990-empty">سند اصلاحی ثبت نشده است.</div>')+'</section>'}

old.invoiceCard=invoiceCard;
invoiceCard=function(inv){
  var html=old.invoiceCard(inv),rows=linkedAdjustments(inv&&inv.id);if(!inv||inv.documentType==='proforma')return html;
  var info=rows.length?'<div class="ar3990-invoice-adjusted"><span>'+fa(rows.length)+' سند اصلاح/برگشت</span><b>مبلغ مؤثر: '+mon(adjustedInvoiceAmount(inv))+'</b></div>':'';
  html=html.replace('<div class="actions">',info+'<div class="actions">');
  return html.replace(/<\/div>\s*<\/article>$/,'<button class="btn gold small" data-v3990="newInvoiceAdjustment" data-id="'+attr(inv.id)+'">اصلاح / برگشت</button></div></article>')
};

function documentSwitchHtml(d){var pro=d&&d.documentType==='proforma';return '<div class="ar3990-document-switch no-print"><button class="'+(!pro?'active':'')+'" data-v3990="switchDocument" data-kind="executionInvoice">فاکتور اجرا</button><button class="'+(pro?'active':'')+'" data-v3990="switchDocument" data-kind="proforma">پیش‌فاکتور</button></div><div class="ar3990-document-note '+(pro?'proforma':'invoice')+'">'+(pro?'پیش‌فاکتور فقط برای اعلام مبلغ است و مانده مشتری را تغییر نمی‌دهد.':'فاکتور اجرا در حساب مشتری و کارکرد ماه محاسبه می‌شود.')+'</div>'}
old.renderInvoicePage=renderInvoicePage;
renderInvoicePage=function(){
  ensureModel();var d=state.invoiceDraft||{},isPro=d.documentType==='proforma',html=old.renderInvoicePage();
  html=html.replace('<section class="page">','<section class="page '+(isPro?'ar3990-proforma-mode':'ar3990-invoice-mode')+'">');
  html=html.replace(/<div class="section-title"><h2>فاکتور<\/h2><button class="btn ghost" data-action="resetInvoice">فاکتور جدید<\/button><\/div>/,documentSwitchHtml(d)+'<div class="section-title"><h2>'+(isPro?'پیش‌فاکتور':'فاکتور اجرا')+'</h2><button class="btn ghost" data-v3990="'+(isPro?'newProforma':'newExecutionInvoice')+'" data-customer-id="'+attr(d.customerId||'')+'">سند جدید</button></div>');
  html=html.replace(/<option(?: selected)?>پیش‌فاکتور<\/option>/g,'');
  if(isPro)html=html.replace(/<select class="select" id="invWorkflowStatus">[\s\S]*?<\/select>/,'<select class="select" id="invWorkflowStatus"><option selected>پیش‌فاکتور</option></select>');
  html=html.replace('<div class="card"><div class="section-title"><h3>پرداخت‌ها</h3>','<div class="card ar3990-account-only"><div class="section-title"><h3>پرداخت‌ها</h3>');
  html=html.replace('<div class="card"><div class="field"><label>بدهی قبلی مشتری / مانده انتقالی</label>','<div class="card ar3990-account-only"><div class="field"><label>بدهی قبلی مشتری / مانده انتقالی</label>');
  if(isPro){
    var summaryStart=html.indexOf('<div class="summary" id="invoiceSummary">'),actionStart=html.indexOf('<div class="grid2 card no-print">',summaryStart),listStart=html.indexOf('<div class="section-title"><h3>فاکتورهای مشتری</h3>',actionStart);
    if(summaryStart>-1&&actionStart>-1){var total=old.invoiceTotals(d).totalAmount,proSummary='<div class="summary ar3990-proforma-summary"><div class="summary-row total"><span>جمع پیش‌فاکتور</span><b>'+mon(total)+'</b></div><div class="muted tiny">این مبلغ هنوز بدهی مشتری و کارکرد قطعی نیست.</div></div>';html=html.slice(0,summaryStart)+proSummary+html.slice(actionStart)}
    actionStart=html.indexOf('<div class="grid2 card no-print">');listStart=html.indexOf('<div class="section-title"><h3>فاکتورهای مشتری</h3>',actionStart);
    if(actionStart>-1&&listStart>-1){var buttons='<div class="grid2 card no-print"><button class="btn gold" data-action="saveInvoice">'+(state.editingProformaId?'ذخیره تغییرات پیش‌فاکتور':'ذخیره پیش‌فاکتور')+'</button><button class="btn blue" data-action="previewDraft">پیش‌نمایش</button><button class="btn ghost" data-v3990="newProforma" data-customer-id="'+attr(d.customerId||'')+'">پیش‌فاکتور جدید</button>'+(state.editingProformaId?'<button class="btn red" data-v3990="deleteProforma" data-id="'+attr(state.editingProformaId)+'">حذف پیش‌فاکتور</button>':'<button class="btn ghost" data-v3990="switchDocument" data-kind="executionInvoice">رفتن به فاکتور اجرا</button>')+'</div>';html=html.slice(0,actionStart)+buttons+html.slice(listStart)}
  }
  var cid=d.customerId||state.selectedCustomerId||'';return html.replace(/<\/section>\s*$/,proformaListHtml(cid)+accountingDocumentsHtml(cid)+'</section>')
};

function statementRows(c){
  var rows=[],order=0;
  invoicesOf(c.id).forEach(function(inv){var t=old.invoiceTotals(inv);rows.push({kind:'فاکتور اجرا',date:inv.date||'',createdAt:inv.createdAt,amount:n(t.totalAmount),note:inv.invoiceNumber||'',order:order++});(inv.payments||[]).forEach(function(p){var st=String((p&&(p.status||p.checkStatus))||'');if(st.indexOf('برگشتی')>-1||st.indexOf('لغو')>-1)return;rows.push({kind:'دریافت',date:p.date||inv.date||'',createdAt:p.createdAt||inv.updatedAt,amount:-Math.abs(n(p.amount)),note:(inv.invoiceNumber||'')+' — '+(p.method||''),order:order++})})});
  customerInvoiceAdjustments(c.id).forEach(function(x){rows.push({kind:documentLabel(x),date:x.date||'',createdAt:x.createdAt,amount:effect(x),note:(x.documentNumber||'')+' — '+(x.reason||''),order:order++})});
  customerAccountAdjustments(c.id).forEach(function(x){rows.push({kind:'اصلاح دستی مانده',date:x.date||'',createdAt:x.createdAt,amount:effect(x),note:(x.documentNumber||'')+' — '+(x.reason||''),order:order++})});
  rows.sort(function(a,b){return dateSerial(a.date)-dateSerial(b.date)||(Date.parse(a.createdAt||'')||0)-(Date.parse(b.createdAt||'')||0)||a.order-b.order});var running=protectedCustomerOpeningBalance(c);rows.forEach(function(r){running+=r.amount;r.running=running});return rows
}
function customerStatementHtml(c){
  var which=state.ar396StatementPeriod||'all',all=statementRows(c),rows=all.filter(function(r){return typeof reportPeriodMatch==='function'?reportPeriodMatch(r.date,which):true}),sales=rows.filter(function(r){return r.kind==='فاکتور اجرا'}).reduce(function(s,r){return s+r.amount},0),received=-rows.filter(function(r){return r.kind==='دریافت'}).reduce(function(s,r){return s+r.amount},0),adjustments=rows.filter(function(r){return r.kind!=='فاکتور اجرا'&&r.kind!=='دریافت'}).reduce(function(s,r){return s+r.amount},0);
  return '<div class="ar396-statement"><div class="ar396-section-head"><div><h3>صورتحساب کامل مشتری</h3><small>فاکتور، دریافت، اصلاح/برگشت و اصلاح دستی مانده</small></div><button class="btn ghost small" data-ar396="printStatement">چاپ</button></div><div class="ar396-periods">'+[['all','همه'],['today','امروز'],['week','این هفته'],['month','این ماه'],['year','امسال']].map(function(x){return '<button class="'+(which===x[0]?'active':'')+'" data-ar396="statementPeriod" data-period="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div><div class="ar396-counts"><div><span>فاکتور اجرا</span><b>'+mon(sales)+'</b></div><div><span>دریافت</span><b>'+mon(received)+'</b></div><div><span>خالص اصلاحات</span><b>'+(adjustments>=0?'+':'−')+mon(Math.abs(adjustments))+'</b></div><div><span>مانده فعلی</span><b>'+mon(Math.abs(n(c.balance)))+' — '+esc(statusOf(c.balance)[0])+'</b></div></div><div class="ar396-table-wrap"><table class="ar396-table"><thead><tr><th>تاریخ</th><th>شرح</th><th>بدهکار/بستانکار</th><th>مانده</th></tr></thead><tbody>'+(rows.map(function(r){return '<tr><td>'+esc(r.date||'—')+'</td><td>'+esc(r.kind+(r.note?' — '+r.note:''))+'</td><td class="'+(r.amount>=0?'debt':'credit')+'">'+(r.amount>=0?'+':'−')+mon(Math.abs(r.amount))+'</td><td>'+mon(Math.abs(r.running))+' — '+esc(statusOf(r.running)[0])+'</td></tr>'}).join('')||'<tr><td colspan="4">در این بازه رویدادی ثبت نشده است.</td></tr>')+'</tbody></table></div></div>'
}
old.renderAccount=renderAccount;
renderAccount=function(){ensureModel();var c=customer(state.selectedCustomerId)||data.customers[0],html=old.renderAccount();if(!c)return html;var extra='';if(state.customerProfileTab==='summary')extra='<div class="ar3990-account-actions"><button class="btn blue full" data-v3990="newAccountAdjustment" data-customer-id="'+attr(c.id)+'">ثبت اصلاح دستی بدهکار / بستانکار</button></div>'+accountingDocumentsHtml(c.id);if(state.customerProfileTab==='invoices')extra=proformaListHtml(c.id)+accountingDocumentsHtml(c.id);return html.replace(/<\/section>\s*$/,extra+'</section>')};
if(window.AlanRangProduct)window.AlanRangProduct.customerStatementHtml=customerStatementHtml;

function searchRows(q){var base=[];try{base=window.AlanRangV3980&&window.AlanRangV3980.search?window.AlanRangV3980.search(q):[]}catch(_){}var term=String(q||'').toLowerCase().replace(/ي/g,'ی').replace(/ك/g,'ک').trim();function has(values){return values.join(' ').toLowerCase().replace(/ي/g,'ی').replace(/ك/g,'ک').indexOf(term)>-1}if(!term)return [];(data.proformas||[]).forEach(function(p){var c=customer(p.customerId);if(has([p.invoiceNumber,p.date,p.projectTitle,p.description,c&&c.name,(p.items||[]).map(function(x){return x.description}).join(' ')]))base.push({kind:'پیش‌فاکتور',title:p.invoiceNumber||'—',meta:(c&&c.name||'')+' — '+mon(old.invoiceTotals(p).totalAmount),v3990:'previewProforma',id:p.id})});(data.invoiceAdjustments||[]).forEach(function(x){if(has([x.documentNumber,x.invoiceNumber,x.date,x.reason,x.amount,(customer(x.customerId)||{}).name]))base.push({kind:'اصلاح/برگشت',title:x.documentNumber||'—',meta:(effect(x)>=0?'+':'−')+mon(Math.abs(effect(x)))+' — '+x.reason,v3990:'openInvoiceAdjustmentDetail',id:x.id})});(data.accountAdjustments||[]).forEach(function(x){if(has([x.documentNumber,x.date,x.reason,x.amount,(customer(x.customerId)||{}).name]))base.push({kind:'اصلاح مانده',title:x.documentNumber||'—',meta:(effect(x)>=0?'+':'−')+mon(Math.abs(effect(x)))+' — '+x.reason,v3990:'openAccountAdjustmentDetail',id:x.id})});return base.slice(0,150)}
function searchHtml(){var q=String(state.ar3980Search||''),rows=searchRows(q);return '<section class="page ar3980-page"><div class="back-row"><button class="btn ghost" data-action="tab" data-tab="'+attr(state.ar3980SearchBack||'home')+'">برگشت</button></div><div class="ar3980-hero"><h2>جست‌وجوی کل برنامه</h2><p>مشتری، فاکتور اجرا، پیش‌فاکتور، اصلاح/برگشت، چک، مالی، خرید و رزرو را هم‌زمان می‌گردد.</p></div><input id="ar3980SearchInput" class="input ar3980-search-input" value="'+esc(q)+'" placeholder="نام، شماره سند، مبلغ، شرح یا تاریخ..." autofocus><div class="ar3980-results">'+(!q?'<div class="ar3980-empty">عبارت جست‌وجو را وارد کن.</div>':(rows.map(function(r){var action=r.v3990?'data-v3990="'+attr(r.v3990)+'"':'data-action="'+attr(r.action)+'"';return '<button '+action+' data-id="'+attr(r.id)+'"><span>'+esc(r.kind)+'</span><div><b>'+esc(r.title)+'</b><small>'+esc(r.meta)+'</small></div></button>'}).join('')||'<div class="ar3980-empty">نتیجه‌ای پیدا نشد.</div>'))+'</div></section>'}
try{registerAlanRangRoute('v3990-search',function(){if(!state||state.tab!=='globalSearch')return false;app.innerHTML=baseLayout(searchHtml());return true})}catch(_){}

function trashHtml(){var rows=data.recycleBin||[],eligible=rows.filter(function(x){return n(x.protectedUntilMs)<=Date.now()}).length;return '<section class="page ar3980-page"><div class="back-row"><button class="btn ghost" data-action="tab" data-tab="more">برگشت</button>'+(eligible?'<button class="btn red" data-v3990="purgeTrash">پاک‌سازی قدیمی‌ها</button>':'')+'</div><div class="ar3980-hero"><h2>حذف‌شده‌ها</h2><p>فاکتور، پیش‌فاکتور و اسناد اصلاحی حداقل ۳۰ روز قابل بازگردانی می‌مانند.</p></div><div class="ar3980-trash">'+(rows.map(function(x){var age=Math.max(0,Math.floor((Date.now()-n(x.deletedAtMs||Date.parse(x.deletedAt)))/86400000)),left=Math.max(0,30-age);return '<article><div><b>'+esc(x.label||'مورد حذف‌شده')+'</b><small>حذف: '+fa(age)+' روز قبل — '+(left?'تا '+fa(left)+' روز دیگر محافظت می‌شود':'آماده پاک‌سازی اختیاری')+'</small></div><button data-v3990="restoreTrash" data-id="'+attr(x.id)+'">بازگردانی</button></article>'}).join('')||'<div class="ar3980-empty">چیزی حذف نشده است.</div>')+'</div></section>'}
try{registerAlanRangRoute('v3990-trash',function(){if(!state||state.tab!=='trash')return false;app.innerHTML=baseLayout(trashHtml());return true})}catch(_){}

function patchMonthlyReports(){var api=window.AlanRangMonthlyReportV3954;if(!api||api.__v3990)return;var base=api.statsMonth;api.statsMonth=function(y,m){var row=base(y,m),delta=monthlyInvoiceAdjustment(y,m);return Object.assign({},row,{sales:n(row.sales)+delta,profit:n(row.profit)+delta,invoiceAdjustments:delta})};api.__v3990=true}
old.getInvoiceFileName=getInvoiceFileName;
getInvoiceFileName=function(ext){var inv=getCurrentPreviewInvoice();if(inv&&inv.documentType==='proforma')return 'AlanRang-Proforma-'+String(inv.invoiceNumber||'document').replace(/[\\/:*?"<>|]/g,'-')+'.'+ext;if(inv&&inv.documentType==='invoiceAdjustmentPreview')return 'AlanRang-Adjustment-'+String(inv.invoiceNumber||'document').replace(/[\\/:*?"<>|]/g,'-')+'.'+ext;return old.getInvoiceFileName(ext)};

function installStyle(){if(document.getElementById('ar3990-style'))return;var s=document.createElement('style');s.id='ar3990-style';s.textContent=`
.ar3990-document-switch{display:grid;grid-template-columns:1fr 1fr;gap:7px;background:#e8eef4;border:1px solid #d5dee8;border-radius:16px;padding:5px;margin:8px 0}.ar3990-document-switch button{min-height:46px;border:0;border-radius:12px;background:transparent;color:#526273;font:900 14px Tahoma}.ar3990-document-switch button.active{background:#071e34;color:#f4c752;box-shadow:0 5px 14px rgba(7,30,52,.18)}.ar3990-document-note{border-radius:14px;padding:9px 12px;margin-bottom:11px;font-size:11px;font-weight:850;line-height:1.9}.ar3990-document-note.invoice{background:#ecfdf3;border:1px solid #bbf7d0;color:#166534}.ar3990-document-note.proforma{background:#eff6ff;border:1px solid #bfdbfe;color:#1e40af}.ar3990-proforma-mode .ar3990-account-only,.ar3990-proforma-mode .invoice-account-status-option{display:none!important}.ar3990-proforma-summary{background:#eff6ff!important;border-color:#93c5fd!important}.ar3990-proforma-summary .summary-row.total{background:#dbeafe!important;color:#1e3a8a!important}.ar3990-doc-section{margin:13px 0;background:#fff;border:1px solid #dfe6ee;border-radius:20px;padding:13px;box-shadow:0 8px 20px rgba(15,39,64,.05)}.ar3990-section-head{display:flex;justify-content:space-between;align-items:center;gap:9px;margin-bottom:9px}.ar3990-section-head h3{margin:0;color:#0f2740}.ar3990-section-head small{display:block;color:#64748b;font-size:10px;margin-top:3px}.ar3990-proforma-card{border-color:#bfdbfe!important;background:#f8fbff!important}.ar3990-doc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.ar3990-doc-head h3{margin:6px 0 4px}.ar3990-doc-head small{color:#64748b}.ar3990-doc-head>b{color:#174f7a;white-space:nowrap}.ar3990-doc-badge{display:inline-flex;border-radius:999px;padding:4px 8px;font-size:9px;font-weight:950}.ar3990-doc-badge.proforma{background:#dbeafe;color:#1d4ed8}.ar3990-doc-badge.debit{background:#fee2e2;color:#b42318}.ar3990-doc-badge.credit{background:#dcfce7;color:#166534}.ar3990-status{border-radius:10px;padding:7px 9px;margin:8px 0;font-size:10px;font-weight:900}.ar3990-status.open{background:#eff6ff;color:#1d4ed8}.ar3990-status.converted{background:#ecfdf3;color:#166534}.ar3990-adjustment-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;border-top:1px solid #edf1f5;padding:9px 0}.ar3990-adjustment-row>button{border:0;background:transparent;text-align:right;padding:0}.ar3990-adjustment-row b,.ar3990-adjustment-row small{display:block}.ar3990-adjustment-row b{margin-top:5px;color:#0f2740}.ar3990-adjustment-row small{color:#64748b;line-height:1.7;margin-top:3px}.ar3990-adjustment-row strong{white-space:nowrap;font-size:11px}.ar3990-adjustment-row strong.debt{color:#b42318}.ar3990-adjustment-row strong.credit{color:#15803d}.ar3990-invoice-adjusted{display:flex;justify-content:space-between;gap:8px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:11px;padding:7px 9px;margin-top:8px;font-size:10px;font-weight:900}.ar3990-account-actions{margin:10px 0}.ar3990-empty{padding:15px;text-align:center;border:1px dashed #cbd5e1;border-radius:14px;color:#64748b;background:#f8fafc}.ar3990-ledger-hint{display:grid;gap:5px;background:#071e34;color:#fff;border:1px solid #d79b22;border-radius:15px;padding:11px;margin-bottom:11px}.ar3990-ledger-hint b{color:#f4c752}.ar3990-ledger-hint span{font-size:11px}.ar3990-immutable{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:13px;padding:9px 11px;line-height:1.9;font-size:10.5px;font-weight:850;margin:8px 0 12px}.ar3990-preview-label{background:#071e34;color:#f4c752;border:1px solid #d79b22;border-radius:13px;padding:9px 12px;margin:0 0 10px;text-align:center;font-weight:950}.ar3990-modal .money-input{font-weight:950}@media(max-width:370px){.ar3990-document-switch{grid-template-columns:1fr}.ar3990-section-head{align-items:flex-start;flex-direction:column}.ar3990-section-head .btn{width:100%}}@media print{.ar3990-document-switch,.ar3990-document-note,.ar3990-doc-section,.ar3990-account-actions{display:none!important}}
`;document.head.appendChild(s)}
function decorate(){
  installStyle();ensureModel();installTrashBridge();patchMonthlyReports();
  var financeTitle=document.querySelector('.ar3980-launch [data-tab="invoice"] b');if(financeTitle)financeTitle.textContent='فاکتور اجرا و پیش‌فاکتور';var financeMeta=document.querySelector('.ar3980-launch [data-tab="invoice"] span');if(financeMeta)financeMeta.textContent='ثبت، اصلاح، برگشت و تبدیل پیش‌فاکتور';
  if(state.tab==='preview'){var inv=getCurrentPreviewInvoice(),title=document.querySelector('.preview-only-title b'),viewport=document.querySelector('.invoice-preview-viewport');if(inv&&title)title.textContent='پیش نمایش '+documentLabel(inv);if(inv&&viewport&&!viewport.previousElementSibling?.classList?.contains('ar3990-preview-label'))viewport.insertAdjacentHTML('beforebegin','<div class="ar3990-preview-label">'+esc(documentLabel(inv))+(inv.documentType==='proforma'?' — بدون اثر روی حساب':'')+'</div>')}
}
try{registerAlanRangAfterRender('v3990-decorate',function(){setTimeout(decorate,0)})}catch(_){}

function setPickedDate(target,value){if(target==='ar3990AdjDate'&&state.ar3990InvoiceAdjustmentDraft)state.ar3990InvoiceAdjustmentDraft.date=value;if(target==='ar3990BalDate'&&state.ar3990AccountAdjustmentDraft)state.ar3990AccountAdjustmentDraft.date=value;state.ar3990Picker=null;renderApp()}
function handleAction(b,a){
  var id=b.dataset.id||'',cid=b.dataset.customerId||state.selectedCustomerId||'';
  if(a==='switchDocument'){if(b.dataset.kind==='proforma')startProforma((state.invoiceDraft||{}).customerId||cid);else resetInvoiceDraft((state.invoiceDraft||{}).customerId||cid);renderApp();return true}
  if(a==='newProforma'){startProforma(cid||(state.invoiceDraft||{}).customerId);state.tab='invoice';renderApp();return true}
  if(a==='newExecutionInvoice'){resetInvoiceDraft(cid||(state.invoiceDraft||{}).customerId);state.tab='invoice';renderApp();return true}
  if(a==='editProforma'){editProforma(id);return true}
  if(a==='convertProforma'){convertProforma(id);return true}
  if(a==='deleteProforma'){deleteProforma(id);return true}
  if(a==='previewProforma'){state.previewInvoiceId=id;state.tab='preview';state.modal=null;renderApp();return true}
  if(a==='newInvoiceAdjustment'){var inv=invoiceRaw(id);if(!inv)return true;state.ar3990InvoiceAdjustmentDraft={invoiceId:id,adjustmentKind:'return',date:todayFa(),amount:'',reason:''};state.modal='ar3990InvoiceAdjustment';renderApp();return true}
  if(a==='saveInvoiceAdjustment'){saveInvoiceAdjustment();return true}
  if(a==='openInvoiceAdjustmentDetail'){state.ar3990DetailId=id;state.modal='ar3990InvoiceAdjustmentDetail';renderApp();return true}
  if(a==='previewAdjustment'){state.previewInvoiceId=id;state.modal=null;state.tab='preview';renderApp();return true}
  if(a==='deleteInvoiceAdjustment'){deleteInvoiceAdjustment(id);return true}
  if(a==='newAccountAdjustment'){state.ar3990AccountAdjustmentDraft={customerId:cid,direction:'credit',date:todayFa(),amount:'',reason:''};state.modal='ar3990AccountAdjustment';renderApp();return true}
  if(a==='saveAccountAdjustment'){saveAccountAdjustment();return true}
  if(a==='openAccountAdjustmentDetail'){state.ar3990DetailId=id;state.modal='ar3990AccountAdjustmentDetail';renderApp();return true}
  if(a==='deleteAccountAdjustment'){deleteAccountAdjustment(id);return true}
  if(a==='restoreTrash'){if(window.AlanRangTrash.restore(id)){showToast('اطلاعات با موفقیت بازگردانی شد');renderApp()}return true}
  if(a==='purgeTrash'){if(!confirm('فقط مواردی که بیش از ۳۰ روز از حذفشان گذشته برای همیشه پاک شوند؟'))return true;var count=window.AlanRangTrash.purgeEligible();showToast(fa(count)+' مورد قدیمی پاک شد');renderApp();return true}
  if(a==='openDate'){syncAdjustmentDraft();syncAccountDraft();var value=b.dataset.target==='ar3990AdjDate'?(state.ar3990InvoiceAdjustmentDraft||{}).date:(state.ar3990AccountAdjustmentDraft||{}).date,p=parseJalaliDate(value||'')||todayJalali();state.ar3990Picker={target:b.dataset.target,jy:p.jy,jm:p.jm};renderApp();return true}
  if(a==='moveMonth'){var p2=state.ar3990Picker;if(!p2)return true;var m=p2.jm+n(b.dataset.dir),y=p2.jy;if(m<1){m=12;y--}if(m>12){m=1;y++}state.ar3990Picker=Object.assign({},p2,{jy:y,jm:m});renderApp();return true}
  if(a==='selectDate'){setPickedDate(b.dataset.target,formatJalaliDate(n(b.dataset.jy),n(b.dataset.jm),n(b.dataset.jd),true));return true}
  if(a==='todayDate'){var t=todayJalali();setPickedDate(b.dataset.target,formatJalaliDate(t.jy,t.jm,t.jd,true));return true}
  if(a==='closeDate'){state.ar3990Picker=null;renderApp();return true}
  return false
}
document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('[data-v3990]'):null;if(!b)return;var handled=handleAction(b,b.dataset.v3990||'');if(handled){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation()}},true);
document.addEventListener('input',function(e){var t=e.target;if(!t)return;if(t.id==='ar3990AdjAmount'||t.id==='ar3990BalAmount')try{formatMoneyField(t)}catch(_){}},true);

ensureModel();installTrashBridge();patchMonthlyReports();installStyle();save();setTimeout(function(){try{renderApp()}catch(e){console.error('AlanRang v39.8.7 init',e)}},100);
window.AlanRangAccountingDocumentsV3990={version:VERSION,schemaVersion:SCHEMA_VERSION,ensureModel:ensureModel,effect:effect,adjustedInvoiceAmount:adjustedInvoiceAmount,monthlyInvoiceAdjustment:monthlyInvoiceAdjustment,saveProforma:saveProforma,convertProforma:convertProforma,saveInvoiceAdjustment:saveInvoiceAdjustment,saveAccountAdjustment:saveAccountAdjustment,customerStatementRows:statementRows,archiveNew:archiveNew};
})();
