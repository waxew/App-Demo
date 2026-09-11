(function(){
'use strict';
if(window.__ALANRANG_CHECK_STATUS_V39120_STAGE3__)return;
window.__ALANRANG_CHECK_STATUS_V39120_STAGE3__=true;

var VERSION='39.12.1-checks-stage3-status-fix-v02';
var ENGINE_NAME='AlanRangChecksV39120';
var busy=false;
var lastDetailId='';
var decorateTimer=null;

function engine(){return window[ENGINE_NAME]||null}
function txt(v){return String(v==null?'':v).trim()}
function num2(v){
  try{if(typeof num==='function')return num(v)}catch(_){}
  var x=Number(txt(v).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(/,/g,'').replace(/[^0-9.\-]/g,''));
  return isFinite(x)?x:0;
}
function clone(v){try{return JSON.parse(JSON.stringify(v))}catch(_){return null}}
function esc(v){
  try{if(typeof safe==='function')return safe(v)}catch(_){}
  return txt(v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]});
}
function attr(v){try{if(typeof safeAttr==='function')return safeAttr(v)}catch(_){}return esc(v)}
function cash(v){try{if(typeof money==='function')return money(v)}catch(_){}return Math.round(num2(v)).toLocaleString('fa-IR')+' تومان'}
function toast(v){try{if(typeof showToast==='function'){showToast(v);return}}catch(_){}try{alert(v)}catch(_){}}
function financeRows(){
  try{if(typeof state!=='undefined'&&state&&Array.isArray(state.v331FinanceTx))return state.v331FinanceTx}catch(_){}
  try{if(typeof readFinanceTransactions==='function'){var rows=readFinanceTransactions();if(Array.isArray(rows))return rows}}catch(_){}
  return [];
}
function invoices(){try{return (window.data&&Array.isArray(data.invoices))?data.invoices:[]}catch(_){return []}}
function customers(){try{return (window.data&&Array.isArray(data.customers))?data.customers:[]}catch(_){return []}}
function invoiceById(id){return invoices().find(function(x){return x&&txt(x.id)===txt(id)})||null}
function customerBy(id){
  try{if(typeof customerById==='function')return customerById(id)}catch(_){}
  return customers().find(function(x){return x&&txt(x.id)===txt(id)})||null;
}
function recordById(id){
  var e=engine(),rows=e&&typeof e.buildAll==='function'?e.buildAll():[];
  return rows.find(function(x){return x&&txt(x.id)===txt(id)})||null;
}
function normalizedStatus(value){var e=engine();return e&&typeof e.normalizeStatus==='function'?e.normalizeStatus(value):txt(value)}
function persistedStatus(status,direction){
  var e=engine(),s=normalizedStatus(status),payable=direction==='payable';
  if(e&&s===e.STATUS.SPENT)return 'خرج شد';
  if(e&&s===e.STATUS.CLEARED)return payable?'پاس شد':'وصول شد';
  if(e&&s===e.STATUS.RETURNED)return 'برگشتی';
  if(e&&s===e.STATUS.CANCELLED)return 'لغو شد';
  return 'در انتظار';
}
function statusTitle(status,direction){
  var e=engine(),s=normalizedStatus(status);
  if(e&&typeof e.statusLabel==='function')return e.statusLabel(s,direction);
  return persistedStatus(s,direction);
}
function quickSpecs(record){
  if(!record)return [];
  var items=[{status:'cleared',label:record.direction==='payable'?'پاس شد':'وصول شد',tone:'good'}];
  if(record.direction==='received')items.push({status:'spent',label:'خرج شد',tone:'gold'});
  return items;
}
function terminalStatus(status){
  status=normalizedStatus(status);
  return status==='cleared'||status==='returned'||status==='cancelled';
}
function hasRepairableStatusIssue(record){
  var e=engine();if(!e||!record||typeof e.audit!=='function'||terminalStatus(record.status))return false;
  return relatedDrift(e.audit(),record).length>0;
}
function quickButtonsHtml(record){
  if(!record)return '';
  var allowCorrection=hasRepairableStatusIssue(record);
  return quickSpecs(record).map(function(spec){
    var pf=preflight(record.id,spec.status,{allowCorrection:allowCorrection});
    var disabled=!pf.ok||!!(pf.plan&&pf.plan.noOp);
    return '<button type="button" class="btn small v39120-status-quick-btn '+attr(spec.tone)+(disabled?' is-disabled':'')+'" data-v39120-stage3-action="quick" data-id="'+attr(record.id)+'" data-status="'+attr(spec.status)+'" data-correction="'+(allowCorrection?'1':'0')+'" '+(disabled?'disabled':'')+'>'+esc(spec.label)+'</button>';
  }).join('');
}
function paymentInvoiceId(source,record){
  var row=source&&source.row||{},pid=txt(row.id),sid=txt(source&&source.sourceId);
  if(pid&&sid.indexOf('payment:')===0){
    var rest=sid.slice('payment:'.length),suffix=':'+pid;
    if(rest.slice(-suffix.length)===suffix)return rest.slice(0,-suffix.length);
  }
  return txt(record&&record.invoiceId);
}
function sourceResolution(record){
  var result={ok:true,errors:[],finance:[],payments:[],invoices:[]},seenInvoice={};
  if(!record||!Array.isArray(record.sourceRows)||!record.sourceRows.length){
    result.errors.push({type:'missingSources',message:'منبع پایدار برای این چک پیدا نشد.'});
    result.ok=false;return result;
  }
  record.sourceRows.forEach(function(source){
    var row=source&&source.row||{},id=txt(row.id);
    if(source.kind==='finance'){
      if(!id){result.errors.push({type:'unstableFinanceSource',message:'شناسه منبع مالی این چک پایدار نیست.'});return}
      var hits=financeRows().filter(function(x){return x&&txt(x.id)===id});
      if(hits.length!==1){result.errors.push({type:'financeSourceResolution',sourceId:id,message:'منبع مالی چک به‌صورت یکتا پیدا نشد.'});return}
      result.finance.push({source:source,row:hits[0]});
      return;
    }
    if(source.kind==='payment'){
      if(!id){result.errors.push({type:'unstablePaymentSource',message:'شناسه دریافت فاکتور این چک پایدار نیست.'});return}
      var iid=paymentInvoiceId(source,record),inv=invoiceById(iid);
      if(!iid||!inv){result.errors.push({type:'paymentInvoiceResolution',sourceId:id,message:'فاکتور مرتبط با دریافت چک پیدا نشد.'});return}
      var ph=(Array.isArray(inv.payments)?inv.payments:[]).filter(function(p){return p&&txt(p.id)===id});
      if(ph.length!==1){result.errors.push({type:'paymentSourceResolution',sourceId:id,message:'دریافت چک داخل فاکتور به‌صورت یکتا پیدا نشد.'});return}
      result.payments.push({source:source,row:ph[0],invoice:inv});
      if(!seenInvoice[iid]){seenInvoice[iid]=1;result.invoices.push(inv)}
    }
  });
  result.ok=result.errors.length===0;
  return result;
}
function auditErrorKey(x){
  if(!x)return '';
  return [txt(x.type),txt(x.id),txt(x.key),txt(x.customerId),txt(x.invoiceId),(x.ids||[]).slice().sort().join(',')].join('|');
}
function relatedAuditErrors(audit,record){
  var out=[];
  (audit&&audit.errors||[]).forEach(function(x){
    if(txt(x.id)===txt(record.id)){out.push(x);return}
    if(Array.isArray(x.ids)&&x.ids.some(function(id){return txt(id)===txt(record.id)})){out.push(x);return}
    if(x.type==='customerAccountCheckMismatch'&&record.customerId&&txt(x.customerId)===txt(record.customerId)){out.push(x);return}
    if(x.invoiceId&&record.invoiceId&&txt(x.invoiceId)===txt(record.invoiceId)){out.push(x)}
  });
  return out;
}
function relatedDrift(audit,record){
  return (audit&&audit.warnings||[]).filter(function(x){return x&&x.type==='statusDrift'&&txt(x.id)===txt(record.id)});
}
function preflight(recordOrId,toStatus,options){
  options=options||{};
  var e=engine(),errors=[],warnings=[];
  if(!e||typeof e.transitionPlan!=='function'||typeof e.audit!=='function')return {ok:false,errors:[{type:'engineUnavailable',message:'موتور امن چک‌ها در دسترس نیست.'}],warnings:[]};
  var record=typeof recordOrId==='string'?recordById(recordOrId):recordById(recordOrId&&recordOrId.id);
  if(!record)return {ok:false,errors:[{type:'recordMissing',message:'رکورد چک پیدا نشد.'}],warnings:[]};
  var plan=e.transitionPlan(record,toStatus,{allowCorrection:!!options.allowCorrection});
  if(!plan.allowed)errors.push({type:'transitionBlocked',reason:plan.reason,message:plan.reason==='terminal-status-requires-correction-mode'?'این چک وضعیت نهایی دارد؛ برای تغییر آن باید حالت اصلاح وضعیت را صریحاً فعال کنی.':'این تغییر وضعیت برای این چک مجاز نیست.'});
  if(record.accountingEffectSourceCount>1)errors.push({type:'doubleFinancialEffectRisk',message:'این چک بیش از یک منبع اثر مالی دارد و تغییر وضعیت آن متوقف شد.'});
  var sources=sourceResolution(record);errors=errors.concat(sources.errors);
  var audit=e.audit(),related=relatedAuditErrors(audit,record),drift=relatedDrift(audit,record);
  related.forEach(function(x){
    errors.push({type:'audit:'+txt(x.type),message:'قبل از تغییر وضعیت، خطای یکپارچگی مرتبط با این چک باید برطرف شود.',detail:x});
  });
  drift.forEach(function(x){
    if(options.allowCorrection)warnings.push({type:'repairableStatusDrift',message:'اختلاف وضعیت منابع با ثبت جدید همسان‌سازی می‌شود.',detail:x});
    else errors.push({type:'statusDrift',message:'وضعیت منابع مرتبط با این چک با هم یکسان نیست؛ برای اصلاح از مسیر اصلاح وضعیت استفاده کن.',detail:x});
  });
  if(record.invoiceId){
    var inv=invoiceById(record.invoiceId);
    if(!inv)errors.push({type:'orphanInvoice',message:'فاکتور مرتبط با چک پیدا نشد.'});
    else if(record.customerId&&inv.customerId&&txt(record.customerId)!==txt(inv.customerId))errors.push({type:'customerInvoiceMismatch',message:'مشتری چک با مشتری فاکتور مرتبط یکسان نیست.'});
  }
  if(record.customerId&&typeof recalculateCustomerBalance!=='function')errors.push({type:'customerRecalcUnavailable',message:'موتور محاسبه مانده مشتری در دسترس نیست؛ تغییر وضعیت متوقف شد.'});
  if(record.customerId&&typeof e.reconcileCustomerAccount==='function'){
    var rec=e.reconcileCustomerAccount(record.customerId);
    if(rec&&!rec.reconciled)errors.push({type:'customerAccountMismatch',message:'حساب مشتری با دفتر چک‌ها تطبیق ندارد؛ تغییر وضعیت تا رفع اختلاف متوقف شد.',detail:rec});
  }
  if(plan.noOp)warnings.push({type:'noOp',message:'این چک همین حالا در وضعیت انتخاب‌شده قرار دارد.'});
  return {ok:errors.length===0,record:record,plan:plan,sources:sources,audit:audit,errors:errors,warnings:warnings};
}
function financeMethod(tx){
  var m=txt(tx&&tx.method)||'چک';
  if(m==='کارت‌به‌کارت')return 'کارت';
  return m||'چک';
}
function ensureManualInvoiceMirrors(record,sources,target,label,now){
  var e=engine();
  if(!e||record.direction!=='received'||!e.statusIsFinanciallyActive(target))return;
  sources.finance.forEach(function(item){
    var src=item.source,tx=item.row;
    if(!src||src.auto||!tx||!txt(tx.invoiceId))return;
    var inv=invoiceById(tx.invoiceId);
    if(!inv)throw new Error('TARGET_INVOICE_MISSING');
    if(!Array.isArray(inv.payments))inv.payments=[];
    var pid='v331pay_'+txt(tx.id);
    var hits=inv.payments.filter(function(p){return p&&(txt(p.v331TxId)===txt(tx.id)||txt(p.id)===pid)});
    if(hits.length>1)throw new Error('MULTIPLE_MANUAL_MIRRORS');
    var p=hits[0];
    if(!p){
      p={id:pid,date:tx.date||'',amount:Math.abs(num2(tx.amount)),method:financeMethod(tx),note:'دریافت متصل به دفتر مالی',v331TxId:tx.id||''};
      inv.payments.push(p);
    }
    p.status=label;p.checkStatus=label;p.amount=Math.abs(num2(tx.amount));p.date=tx.date||p.date||'';
    p.dueDate=tx.dueDate||p.dueDate||p.date||'';p.checkDueDate=p.dueDate;
    p.bankName=tx.bankName||p.bankName||'';p.checkBank=p.bankName;
    p.checkNumber=tx.checkNumber||p.checkNumber||'';p.ownerName=tx.ownerName||p.ownerName||'';p.checkOwnerName=p.ownerName;
    p.updatedAt=now;inv.updatedAt=now;
  });
}
function mutateSources(record,sources,target,label,now){
  sources.finance.forEach(function(item){
    item.row.status=label;item.row.checkStatus=label;item.row.updatedAt=now;
  });
  sources.payments.forEach(function(item){
    item.row.status=label;item.row.checkStatus=label;item.row.updatedAt=now;item.invoice.updatedAt=now;
  });
  ensureManualInvoiceMirrors(record,sources,target,label,now);
}
function recalcCustomer(id){
  if(!id)return true;
  if(typeof recalculateCustomerBalance!=='function')throw new Error('CUSTOMER_RECALC_UNAVAILABLE');
  recalculateCustomerBalance(id);return true;
}
function persistFinance(){
  var rows=financeRows();
  if(typeof writeFinanceTransactions==='function'){writeFinanceTransactions(rows);return true}
  try{
    if(typeof state!=='undefined'&&state)state.v331FinanceTx=rows;
    var key=(typeof KEY!=='undefined'?KEY:'alanrang_pro')+'_v33_finance_transactions';
    if(typeof alanRangStorageSetItem==='function'){alanRangStorageSetItem(key,JSON.stringify(rows));return true}
  }catch(_){}
  return false;
}
function saveCore(){
  if(typeof saveData!=='function')return true;
  var result=saveData();
  return result!==false;
}
function snapshot(){
  return {data:clone(window.data||data)||{},finance:clone(financeRows())||[]};
}
function restoreSnapshot(snap){
  try{
    var restored=clone(snap.data)||{},target=(typeof data!=='undefined'&&data)?data:(window.data||{});
    Object.keys(target).forEach(function(k){delete target[k]});
    Object.keys(restored).forEach(function(k){target[k]=restored[k]});
    if(typeof data!=='undefined')data=target;
    if(typeof window!=='undefined')window.data=target;
    if(typeof state!=='undefined'&&state)state.v331FinanceTx=clone(snap.finance)||[];
    persistFinance();
    return saveCore();
  }catch(_){return false}
}
function newAuditErrors(beforeAudit,afterAudit){
  var seen={};(beforeAudit&&beforeAudit.errors||[]).forEach(function(x){seen[auditErrorKey(x)]=1});
  return (afterAudit&&afterAudit.errors||[]).filter(function(x){return !seen[auditErrorKey(x)]});
}
function unchangedOtherBalances(before,targetCustomerId){
  var old={};((before&&before.data&&before.data.customers)||[]).forEach(function(c){old[txt(c.id)]=num2(c.balance)});
  return customers().every(function(c){return txt(c.id)===txt(targetCustomerId)||Math.abs(num2(c.balance)-num2(old[txt(c.id)]))<0.5});
}
function addStatusAudit(record,from,to,operationId){
  try{
    var p=window.AlanRangProduct;
    if(p&&typeof p.addAudit==='function'){
      p.addAudit('check-status','تغییر وضعیت چک',
        (record.customerName||'بدون مشتری')+' — '+(record.checkNumber?'شماره '+record.checkNumber+' — ':'')+statusTitle(from,record.direction)+' ← '+statusTitle(to,record.direction),
        record.id||operationId);
    }
  }catch(_){}
}
function applyStatus(recordOrId,toStatus,options){
  options=options||{};
  if(busy)return {ok:false,code:'busy',message:'یک عملیات چک در حال انجام است.'};
  var pf=preflight(recordOrId,toStatus,options);
  if(!pf.ok)return {ok:false,code:'preflight',message:(pf.errors[0]&&pf.errors[0].message)||'تغییر وضعیت متوقف شد.',preflight:pf};
  if(pf.plan.noOp)return {ok:true,noOp:true,record:pf.record,plan:pf.plan};
  busy=true;
  var snap=snapshot(),record=pf.record,e=engine(),target=pf.plan.to,label=persistedStatus(target,record.direction);
  var customerBefore=record.customerId?customerBy(record.customerId):null,balanceBefore=customerBefore?num2(customerBefore.balance):0;
  var operationId='check_status_'+Date.now()+'_'+Math.random().toString(16).slice(2),now=new Date().toISOString();
  try{
    mutateSources(record,pf.sources,target,label,now);
    if(pf.plan.financialAction!=='none')recalcCustomer(record.customerId);
    var after=recordById(record.id);
    if(!after)throw new Error('CANONICAL_RECORD_LOST');
    if(normalizedStatus(after.status)!==target)throw new Error('STATUS_NOT_APPLIED');
    var sourceStates={};(after.sourceStatuses||[]).forEach(function(x){sourceStates[normalizedStatus(x.normalized||x.status)]=1});
    if(Object.keys(sourceStates).some(function(x){return x!==target}))throw new Error('SOURCE_STATUS_DRIFT');
    if(after.accountingEffectSourceCount>1)throw new Error('DOUBLE_FINANCIAL_EFFECT');
    var afterAudit=e.audit(),related=relatedAuditErrors(afterAudit,after),drift=relatedDrift(afterAudit,after),newErrors=newAuditErrors(pf.audit,afterAudit);
    if(related.length||drift.length||newErrors.length)throw new Error('POST_AUDIT_FAILED');
    if(after.customerId&&typeof e.reconcileCustomerAccount==='function'){
      var reconciliation=e.reconcileCustomerAccount(after.customerId);
      if(reconciliation&&!reconciliation.reconciled)throw new Error('CUSTOMER_ACCOUNT_RECONCILIATION_FAILED');
    }
    var customerAfter=after.customerId?customerBy(after.customerId):null;
    if(customerAfter&&record.direction==='received'){
      var expectedDelta=num2(record.currentCustomerAccountCredit)-num2(after.currentCustomerAccountCredit);
      var actualDelta=num2(customerAfter.balance)-balanceBefore;
      if(Math.abs(expectedDelta-actualDelta)>=0.5)throw new Error('CUSTOMER_BALANCE_DELTA_MISMATCH');
    }
    if(!unchangedOtherBalances(snap,record.customerId))throw new Error('UNRELATED_CUSTOMER_BALANCE_CHANGED');
    addStatusAudit(record,pf.plan.from,target,operationId);
    if(!persistFinance())throw new Error('FINANCE_PERSIST_FAILED');
    if(!saveCore())throw new Error('CORE_PERSIST_FAILED');
    var finalRecord=recordById(record.id);
    if(!finalRecord||normalizedStatus(finalRecord.status)!==target)throw new Error('POST_SAVE_STATUS_MISMATCH');
    return {ok:true,operationId:operationId,from:pf.plan.from,to:target,label:label,plan:pf.plan,record:finalRecord,balanceBefore:balanceBefore,balanceAfter:finalRecord.customerId?(customerBy(finalRecord.customerId)||{}).balance:null};
  }catch(err){
    var rolledBack=restoreSnapshot(snap);
    try{console.error('AlanRang check status operation',err)}catch(_){}
    return {ok:false,code:'rolledBack',rolledBack:!!rolledBack,message:'تغییر وضعیت کامل نشد و اطلاعات به حالت قبل بازگردانده شد.',error:txt(err&&err.message||err)};
  }finally{busy=false}
}
function statusOptions(record,allowCorrection){
  var e=engine();if(!e||!record)return [];
  var list=[e.STATUS.IN_FLOW];
  if(record.direction==='received')list.push(e.STATUS.SPENT);
  list.push(e.STATUS.CLEARED,e.STATUS.RETURNED,e.STATUS.CANCELLED);
  return list.map(function(status){
    var plan=e.transitionPlan(record,status,{allowCorrection:!!allowCorrection});
    return {status:status,label:statusTitle(status,record.direction),current:status===record.status,allowed:!!plan.allowed,plan:plan};
  });
}
function effectText(record,plan){
  if(record.direction==='payable')return 'این تغییر روی مانده حساب مشتری اثر مستقیم ایجاد نمی‌کند.';
  if(plan.financialAction==='deactivate')return 'با این تغییر، اثر این چک از دریافت‌های معتبر مشتری خارج می‌شود و بدهی مشتری به همان اندازه برمی‌گردد.';
  if(plan.financialAction==='activate')return 'با این اصلاح، اثر این چک دوباره فقط یک‌بار در دریافت‌های معتبر مشتری فعال می‌شود.';
  return 'این تغییر وضعیت، مانده حساب مشتری را تغییر نمی‌دهد.';
}
function closeStatusModal(){try{var x=document.querySelector('.v39120-status-back');if(x)x.remove()}catch(_){}}
function statusModal(id,allowCorrection){
  var record=recordById(id);if(!record)return toast('رکورد چک پیدا نشد.');
  closeStatusModal();
  var options=statusOptions(record,allowCorrection),normalAllowed=options.some(function(x){return !x.current&&x.allowed}),terminal=['cleared','returned','cancelled'].indexOf(record.status)>-1;
  var buttons=options.map(function(x){
    return '<button type="button" class="v39120-status-option '+(x.current?'current':'')+'" '+(!x.allowed||x.current?'disabled':'')+' data-v39120-stage3-action="apply" data-id="'+attr(record.id)+'" data-status="'+attr(x.status)+'" data-correction="'+(allowCorrection?'1':'0')+'"><b>'+esc(x.label)+'</b><small>'+(x.current?'وضعیت فعلی':esc(effectText(record,x.plan)))+'</small></button>';
  }).join('');
  var correction=terminal&&!allowCorrection?'<button type="button" class="btn ghost full v39120-correction" data-v39120-stage3-action="correction" data-id="'+attr(record.id)+'">اصلاح وضعیت نهایی</button>':'';
  var note=!normalAllowed&&!allowCorrection&&terminal?'<div class="v39120-status-warning">این وضعیت نهایی است. اگر ثبت آن اشتباه بوده، از «اصلاح وضعیت نهایی» استفاده کن؛ اصلاح با تأیید دوباره انجام می‌شود.</div>':'';
  var html='<div class="v39120-status-back"><div class="v39120-status-modal"><div class="v39120-status-title"><div><h3>تغییر وضعیت چک</h3><p>'+esc(record.customerName||record.ownerName||'بدون مشتری')+' — '+esc(cash(record.amount))+'</p></div><button type="button" data-v39120-stage3-action="close">×</button></div>'+
    '<div class="v39120-status-current">وضعیت فعلی: <b>'+esc(record.statusLabel||statusTitle(record.status,record.direction))+'</b></div>'+note+
    '<div class="v39120-status-options">'+buttons+'</div>'+correction+
    '<div class="v39120-status-safe">هر تغییر ابتدا اعتبارسنجی می‌شود؛ اگر کنترل نهایی یا ذخیره کامل نشود، اطلاعات به حالت قبل برمی‌گردد.</div></div></div>';
  try{document.body.insertAdjacentHTML('beforeend',html)}catch(_){}
}
function executeUi(id,status,allowCorrection){
  var record=recordById(id),pf=preflight(id,status,{allowCorrection:allowCorrection});
  if(!record||!pf.ok)return toast((pf.errors&&pf.errors[0]&&pf.errors[0].message)||'این تغییر وضعیت قابل انجام نیست.');
  if(pf.plan.noOp){closeStatusModal();return toast('وضعیت چک تغییری نکرد.')}
  var msg='وضعیت چک از «'+statusTitle(pf.plan.from,record.direction)+'» به «'+statusTitle(pf.plan.to,record.direction)+'» تغییر کند؟\n\n'+effectText(record,pf.plan);
  if(allowCorrection)msg+=terminalStatus(record.status)?'\n\nاین عملیات در حالت اصلاح وضعیت نهایی انجام می‌شود.':'\n\nاختلاف قدیمی وضعیت منابع با همین ثبت، به‌صورت کنترل‌شده همسان می‌شود.';
  var yes=false;try{yes=confirm(msg)}catch(_){}
  if(!yes)return;
  var result=applyStatus(id,status,{allowCorrection:allowCorrection});
  if(!result.ok)return toast(result.message||'تغییر وضعیت انجام نشد.');
  closeStatusModal();
  try{if(window.AlanRangChecksUIV39120&&typeof window.AlanRangChecksUIV39120.refresh==='function')window.AlanRangChecksUIV39120.refresh()}catch(_){}
  toast('وضعیت چک با موفقیت ثبت شد.');
}
function installStyle(){
  if(typeof document==='undefined'||document.getElementById('v39120-check-stage3-style'))return;
  var s=document.createElement('style');s.id='v39120-check-stage3-style';s.textContent=
  '.v39120-status-safe-btn{background:#071e34!important;color:#f4c752!important;border-color:#d79b22!important}.v39120-status-back{position:fixed;inset:0;z-index:100300;background:rgba(2,6,23,.66);display:flex;align-items:flex-end;justify-content:center;padding:10px;direction:rtl}.v39120-status-modal{width:min(680px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:24px 24px 16px 16px;padding:15px;box-shadow:0 -18px 45px rgba(2,6,23,.38)}'+
  '.v39120-status-title{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.v39120-status-title h3{margin:0;color:#061e35}.v39120-status-title p{margin:4px 0 0;color:#64748b;font-weight:850;font-size:11px}.v39120-status-title>button{width:36px;height:36px;border:0;border-radius:12px;background:#f1f5f9;color:#334155;font-size:22px}.v39120-status-current{margin:12px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:13px;padding:9px 10px;color:#475569;font-size:12px;font-weight:850}.v39120-status-current b{color:#0f2740}'+
  '.v39120-status-options{display:grid;gap:7px}.v39120-status-option{width:100%;text-align:right;border:1px solid #dbe3ec;border-radius:14px;background:#fff;padding:10px 11px;font-family:inherit}.v39120-status-option b,.v39120-status-option small{display:block}.v39120-status-option b{color:#0f2740;font-size:13px}.v39120-status-option small{color:#64748b;font-size:10px;line-height:1.8;margin-top:4px}.v39120-status-option.current{background:#f8fafc}.v39120-status-option:disabled{opacity:.58}.v39120-status-warning{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:13px;padding:9px 10px;font-size:11px;font-weight:850;line-height:1.9;margin-bottom:9px}.v39120-correction{margin-top:9px}.v39120-status-safe{margin-top:10px;background:#ecfdf5;border:1px solid #bbf7d0;color:#166534;border-radius:13px;padding:9px 10px;font-size:10px;font-weight:850;line-height:1.9}.v39120-inline-status-actions{display:inline-flex;gap:6px;flex-wrap:wrap}.v39120-status-quick-btn.good{background:#e8f7ef!important;border-color:#86efac!important;color:#166534!important}.v39120-status-quick-btn.gold{background:#fff7ed!important;border-color:#fcd34d!important;color:#92400e!important}.v39120-status-quick-btn.is-disabled{opacity:.55}';
  (document.head||document.documentElement).appendChild(s);
}
function decoratePanel(){
  if(typeof document==='undefined')return;
  installStyle();
  try{
    document.querySelectorAll('.v39120-card[data-canonical-id]').forEach(function(card){
      var actions=card.querySelector('.v39120-actions'),id=card.getAttribute('data-canonical-id');if(!actions||!id||actions.querySelector('[data-v39120-stage3-action="status"]'))return;
      var record=recordById(id);
      var b=document.createElement('button');b.type='button';b.className='btn small v39120-status-safe-btn';b.setAttribute('data-v39120-stage3-action','status');b.setAttribute('data-id',id);b.textContent='تغییر وضعیت';actions.insertBefore(b,actions.firstChild||null);
      if(record){var wrap=document.createElement('span');wrap.className='v39120-inline-status-actions';wrap.innerHTML=quickButtonsHtml(record);actions.insertBefore(wrap,b.nextSibling||null)}
    });
    var note=document.querySelector('.v39120-stage-note');
    if(note)note.textContent='تغییر وضعیت با کنترل یکپارچگی، تأیید و بازگردانی امن انجام می‌شود. حذف از نمای یکپارچه همچنان غیرفعال است.';
  }catch(_){}
}
function decorateDetail(id){
  if(typeof document==='undefined')return;
  try{
    var detail=document.querySelector('.v39120-detail');if(!detail||detail.querySelector('[data-v39120-stage3-action="status"]'))return;
    var foot=detail.querySelector('.v39120-detail-foot');if(!foot)return;
    var record=recordById(id);
    var b=document.createElement('button');b.type='button';b.className='btn v39120-status-safe-btn';b.setAttribute('data-v39120-stage3-action','status');b.setAttribute('data-id',id);b.textContent='تغییر وضعیت';foot.appendChild(b);
    if(record){var wrap=document.createElement('span');wrap.className='v39120-inline-status-actions';wrap.innerHTML=quickButtonsHtml(record);foot.appendChild(wrap)}
  }catch(_){}
}
function scheduleDecorate(){
  try{if(decorateTimer)clearTimeout(decorateTimer)}catch(_){}
  try{decorateTimer=setTimeout(function(){decorateTimer=null;decoratePanel();if(lastDetailId)decorateDetail(lastDetailId)},0)}catch(_){}
}
function wire(){
  if(typeof document==='undefined')return;
  installStyle();
  try{if(typeof window.registerAlanRangAfterRender==='function')window.registerAlanRangAfterRender('v39120-check-status-stage3',scheduleDecorate)}catch(_){}
  document.addEventListener('click',function(e){
    var details=e.target&&e.target.closest?e.target.closest('[data-v39120-action="details"]'):null;
    if(details){lastDetailId=details.getAttribute('data-id')||'';scheduleDecorate()}
    var b=e.target&&e.target.closest?e.target.closest('[data-v39120-stage3-action]'):null;if(!b)return;
    var action=b.getAttribute('data-v39120-stage3-action'),id=b.getAttribute('data-id')||'';
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    if(action==='status'){var statusRecord=recordById(id);statusModal(id,!!(statusRecord&&hasRepairableStatusIssue(statusRecord)));return}
    if(action==='correction'){statusModal(id,true);return}
    if(action==='quick'){executeUi(id,b.getAttribute('data-status')||'',b.getAttribute('data-correction')==='1');return}
    if(action==='apply'){executeUi(id,b.getAttribute('data-status')||'',b.getAttribute('data-correction')==='1');return}
    if(action==='close'){closeStatusModal();return}
  },true);
  ['input','change'].forEach(function(type){document.addEventListener(type,function(e){if(e.target&&e.target.id==='v39120CheckSearch')scheduleDecorate()},true)});
  document.addEventListener('click',function(e){
    var x=e.target&&e.target.closest?e.target.closest('[data-v39120-filter],[data-v39120-direction]'):null;if(x)scheduleDecorate();
  },true);
  try{if(document.readyState!=='loading')scheduleDecorate()}catch(_){}
}

window.AlanRangChecksStatusV39120={
  version:VERSION,
  preflight:preflight,
  applyStatus:applyStatus,
  statusOptions:statusOptions,
  persistedStatus:persistedStatus,
  sourceResolution:sourceResolution,
  refresh:decoratePanel
};
wire();
})();
