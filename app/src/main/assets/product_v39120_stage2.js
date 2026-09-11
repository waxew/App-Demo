(function(){
'use strict';
if(window.__ALANRANG_CHECK_UI_V39120_STAGE2__)return;
window.__ALANRANG_CHECK_UI_V39120_STAGE2__=true;

var VERSION='39.12.0-checks-stage2-ui-v01';
var UI_STATE_KEY='v39120CheckUi';
var ENGINE_NAME='AlanRangChecksV39120';

function engine(){return window[ENGINE_NAME]||null}
function txt(v){return String(v==null?'':v).trim()}
function esc(v){
  try{if(typeof safe==='function')return safe(v)}catch(_){}
  return txt(v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]});
}
function attr(v){try{if(typeof safeAttr==='function')return safeAttr(v)}catch(_){}return esc(v)}
function num2(v){
  try{if(typeof num==='function')return num(v)}catch(_){}
  var x=Number(txt(v).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(/,/g,'').replace(/[^0-9.\-]/g,''));
  return isFinite(x)?x:0;
}
function fa(v){try{if(typeof faDigits==='function')return faDigits(v)}catch(_){}return txt(v)}
function cash(v){try{if(typeof money==='function')return money(v)}catch(_){}return Math.round(num2(v)).toLocaleString('fa-IR')+' تومان'}
function toast(v){try{if(typeof showToast==='function'){showToast(v);return}}catch(_){}try{alert(v)}catch(_){}}
function st(){
  try{
    if(typeof state!=='undefined'&&state){
      if(!state[UI_STATE_KEY])state[UI_STATE_KEY]={filter:'all',direction:'all',query:''};
      return state[UI_STATE_KEY];
    }
  }catch(_){}
  window.__ALANRANG_CHECK_UI_STATE__=window.__ALANRANG_CHECK_UI_STATE__||{filter:'all',direction:'all',query:''};
  return window.__ALANRANG_CHECK_UI_STATE__;
}
function parseDate(value){
  try{if(typeof parseJalaliDate==='function'){var p=parseJalaliDate(value||'');if(p&&p.jy&&p.jm&&p.jd)return p}}catch(_){}
  var s=txt(value).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)});
  var m=s.match(/((?:13|14)\d{2})\D+(\d{1,2})\D+(\d{1,2})/);
  return m?{jy:+m[1],jm:+m[2],jd:+m[3]}:null;
}
function dayNo(p){
  if(!p)return null;
  try{if(typeof j2d==='function')return j2d(p.jy,p.jm,p.jd)}catch(_){}
  return p.jy*372+p.jm*31+p.jd;
}
function todayParts(){
  try{if(typeof todayJalali==='function')return todayJalali()}catch(_){}
  return null;
}
function statusClass(status){
  if(status==='returned')return 'bad';
  if(status==='cancelled')return 'cancel';
  if(status==='cleared')return 'done';
  if(status==='spent')return 'spent';
  return 'wait';
}
function directionLabel(direction){return direction==='payable'?'پرداختی':'دریافتی'}
function dueInfo(row){
  if(!row)return {kind:'unknown',label:'بدون تاریخ معتبر',diff:null,rank:7};
  if(row.status==='returned')return {kind:'returned',label:'برگشتی',diff:null,rank:0};
  if(row.status==='cancelled')return {kind:'cancelled',label:'لغو شده',diff:null,rank:9};
  if(row.status==='cleared')return {kind:'cleared',label:row.direction==='payable'?'پاس شده':'وصول شده',diff:null,rank:8};
  if(row.status==='spent')return {kind:'spent',label:'خرج شده',diff:null,rank:8};
  var p=parseDate(row.dueDate),t=todayParts(),a=dayNo(p),b=dayNo(t);
  if(a==null||b==null)return {kind:'unknown',label:'بدون تاریخ معتبر',diff:null,rank:7};
  var diff=a-b;
  if(diff<0)return {kind:'overdue',label:fa(Math.abs(diff))+' روز عقب‌افتاده',diff:diff,rank:1};
  if(diff===0)return {kind:'today',label:'سررسید امروز',diff:0,rank:2};
  if(diff===1)return {kind:'soon',label:'سررسید فردا',diff:1,rank:3};
  if(diff<=7)return {kind:'soon',label:fa(diff)+' روز مانده',diff:diff,rank:4};
  return {kind:'future',label:fa(diff)+' روز مانده',diff:diff,rank:5};
}
function uniqueStatuses(row){
  var seen={};
  (row&&row.sourceStatuses||[]).forEach(function(x){if(x&&x.normalized)seen[x.normalized]=1});
  return Object.keys(seen);
}
function integrity(row){
  var errors=[],warnings=[];
  if(num2(row&&row.accountingEffectSourceCount)>1)errors.push('double-effect');
  if(uniqueStatuses(row).length>1)warnings.push('status-drift');
  if(row&&row.direction==='received'&&!txt(row.customerId))errors.push('missing-customer');
  if(row&&num2(row.amount)<=0)errors.push('invalid-amount');
  return {ok:errors.length===0,errors:errors,warnings:warnings};
}
function manualFinanceIds(row){
  return (row&&row.sourceRows||[]).filter(function(x){return x&&x.kind==='finance'&&!x.auto&&x.row&&txt(x.row.id)}).map(function(x){return txt(x.row.id)});
}
function isSafelyEditable(row){
  var ids=manualFinanceIds(row);
  return row&&row.direction==='received'&&ids.length===1&&integrity(row).ok;
}
function viewRows(options){
  options=options||{};
  var e=engine(),rows=e&&typeof e.buildAll==='function'?e.buildAll().slice():[];
  var q=txt(options.query).toLowerCase(),filter=options.filter||'all',direction=options.direction||'all';
  rows=rows.filter(function(r){
    if(direction!=='all'&&r.direction!==direction)return false;
    if(q){
      var hay=[r.customerName,r.invoiceNumber,r.ownerName,r.bankName,r.checkNumber,r.notes,r.spentTo,r.amount,r.dueDate,r.statusLabel,directionLabel(r.direction)].join(' ').toLowerCase();
      if(hay.indexOf(q)<0)return false;
    }
    var d=dueInfo(r);
    if(filter==='in_flow'&&r.status!=='in_flow')return false;
    if(filter==='due7'&&!(r.status==='in_flow'&&d.diff!=null&&d.diff>=0&&d.diff<=7))return false;
    if(filter==='overdue'&&!(r.status==='in_flow'&&d.diff!=null&&d.diff<0))return false;
    if(filter==='spent'&&r.status!=='spent')return false;
    if(filter==='cleared'&&r.status!=='cleared')return false;
    if(filter==='returned'&&r.status!=='returned')return false;
    if(filter==='cancelled'&&r.status!=='cancelled')return false;
    return true;
  });
  rows.sort(function(a,b){
    var da=dueInfo(a),db=dueInfo(b);
    if(da.rank!==db.rank)return da.rank-db.rank;
    return (a.dueDateSerial||99999999)-(b.dueDateSerial||99999999)||(b.sortStamp||0)-(a.sortStamp||0);
  });
  return rows;
}
function buildViewModel(options){
  var e=engine(),all=e&&typeof e.buildAll==='function'?e.buildAll().slice():[],rows=viewRows(options||{}),sum=e&&typeof e.summary==='function'?e.summary(all):{total:all.length,received:0,payable:0,inFlow:0,spent:0,cleared:0,returned:0,cancelled:0,amount:0,activeAmount:0,accountCredit:0};
  var due7=0,overdue=0,today=0;
  all.forEach(function(r){var d=dueInfo(r);if(r.status==='in_flow'&&d.diff!=null){if(d.diff<0)overdue++;if(d.diff===0)today++;if(d.diff>=0&&d.diff<=7)due7++;}});
  var audit={clean:true,errors:[],warnings:[]};
  try{if(e&&typeof e.audit==='function')audit=e.audit()}catch(err){audit={clean:false,errors:[{type:'uiAuditFailure'}],warnings:[]}}
  return {version:VERSION,rows:rows,all:all,summary:sum,due7:due7,overdue:overdue,today:today,audit:audit};
}
function preflightCandidate(candidate){
  var e=engine();
  if(!e||typeof e.validateCandidate!=='function')return {ok:false,errors:[{type:'engineUnavailable',message:'هسته مرکزی چک در دسترس نیست.'}],warnings:[]};
  var result=e.validateCandidate(candidate)||{ok:false,errors:[{type:'validationFailure',message:'اعتبارسنجی چک انجام نشد.'}],warnings:[]};
  var iid=txt(candidate&&candidate.invoiceId),cid=txt(candidate&&candidate.customerId);
  if(iid&&cid){
    try{
      var inv=((typeof data!=='undefined'&&data&&Array.isArray(data.invoices))?data.invoices:[]).find(function(x){return x&&txt(x.id)===iid});
      if(!inv)result.errors.push({type:'orphanInvoice',message:'فاکتور انتخاب‌شده پیدا نشد.'});
      else if(txt(inv.customerId)&&txt(inv.customerId)!==cid)result.errors.push({type:'customerInvoiceMismatch',message:'فاکتور انتخاب‌شده متعلق به این مشتری نیست.'});
    }catch(_){}
  }
  result.ok=!result.errors.length;
  return result;
}
function readCheckForm(){
  function val(id){var el=document.getElementById(id);return el?el.value:''}
  var editing='';
  try{editing=txt(state&&state.v335EditingCheckId)}catch(_){}
  return {
    id:editing,canonicalId:editing,direction:'received',customerId:val('v335Customer'),invoiceId:val('v335Invoice'),
    amount:val('v335Amount'),date:val('v335ReceiveDate'),dueDate:val('v335DueDate'),ownerName:val('v335OwnerName'),
    bankName:val('v335Bank'),checkNumber:val('v335CheckNumber'),status:val('v335Status')
  };
}
function blockEvent(e,message){
  try{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}catch(_){}
  if(message)toast(message);
  return false;
}
function savePreflight(e,button){
  if(!button||button.getAttribute('data-action')!=='v335SaveCheck')return true;
  var result=preflightCandidate(readCheckForm());
  if(!result.ok){
    var message=(result.errors[0]&&result.errors[0].message)||'ثبت چک به دلیل خطای اعتبارسنجی متوقف شد.';
    blockEvent(e,message);
    return false;
  }
  if(result.warnings&&result.warnings.length){
    var warn=(result.warnings[0]&&result.warnings[0].message)||'چک مشابهی پیدا شد. ثبت ادامه پیدا کند؟';
    var ok=false;try{ok=confirm(warn+'\n\nاگر مطمئن هستی «تأیید» را بزن.')}catch(_){}
    if(!ok){blockEvent(e,'ثبت چک لغو شد تا مورد مشابه بررسی شود.');return false}
  }
  return true;
}
function cardHtml(row){
  var due=dueInfo(row),health=integrity(row),manual=manualFinanceIds(row),editable=isSafelyEditable(row);
  var inv=row.invoiceNumber||'بدون فاکتور',owner=row.ownerName||'ثبت نشده',bank=[row.bankName||'بانک ثبت نشده',row.checkNumber?'شماره '+row.checkNumber:''].filter(Boolean).join(' — ');
  return '<article class="v39120-card" data-canonical-id="'+attr(row.id)+'">'+
    '<div class="v39120-card-head"><div><div class="v39120-dir '+attr(row.direction)+'">'+esc(directionLabel(row.direction))+'</div><h4>'+esc(row.customerName||owner||'بدون مشتری')+' — '+esc(cash(row.amount))+'</h4><small>'+esc(bank)+'</small></div><div class="v39120-badges"><span class="v39120-status '+attr(statusClass(row.status))+'">'+esc(row.statusLabel||'در جریان')+'</span><span class="v39120-due '+attr(due.kind)+'">'+esc(due.label)+'</span></div></div>'+
    '<div class="v39120-meta"><div><span>سررسید</span><b>'+esc(row.dueDate||'—')+'</b></div><div><span>فاکتور</span><b>'+esc(inv)+'</b></div><div><span>نام روی چک</span><b>'+esc(owner)+'</b></div><div><span>کنترل یکپارچگی</span><b class="'+(health.ok?'ok':'warn')+'">'+(health.ok?'سالم':'نیاز به بررسی')+'</b></div></div>'+
    (row.spentTo?'<div class="v39120-note"><b>تحویل/خرج:</b> '+esc(row.spentTo)+'</div>':'')+
    '<div class="v39120-actions"><button type="button" class="btn ghost small" data-v39120-action="details" data-id="'+attr(row.id)+'">جزئیات</button>'+
    (editable?'<button type="button" class="btn blue small" data-action="v335EditCheck" data-id="'+attr(manual[0])+'">ویرایش امن</button>':'')+
    (row.customerId?'<button type="button" class="btn ghost small" data-action="account" data-id="'+attr(row.customerId)+'">پرونده مشتری</button>':'')+
    (row.invoiceId?'<button type="button" class="btn gold small" data-action="previewInvoice" data-id="'+attr(row.invoiceId)+'">فاکتور</button>':'')+
    '</div></article>';
}
function panelHtml(){
  var ui=st(),vm=buildViewModel(ui),sum=vm.summary||{},filter=ui.filter||'all',direction=ui.direction||'all';
  var filters=[['all','همه'],['in_flow','در جریان'],['due7','۷ روز آینده'],['overdue','عقب‌افتاده'],['spent','خرج‌شده'],['cleared','وصول/پاس'],['returned','برگشتی'],['cancelled','لغوشده']];
  var directions=[['all','همه'],['received','دریافتی'],['payable','پرداختی']];
  var integrityBanner=vm.audit&&vm.audit.clean?
    '<div class="v39120-integrity ok">✓ کنترل یکپارچگی اطلاعات بدون خطای بحرانی</div>':
    '<div class="v39120-integrity warn">⚠ '+fa((vm.audit&&vm.audit.errors||[]).length)+' مورد نیازمند بررسی داخلی شناسایی شد؛ نمایش اطلاعات ادامه دارد اما عملیات پرریسک در این مرحله فعال نیست.</div>';
  return '<div class="v39120-head"><div><h3>دفتر حرفه‌ای چک‌ها</h3><p>نمایش یکپارچه چک‌های دریافتی و پرداختی؛ هر چک فقط یک‌بار نمایش داده می‌شود.</p></div><button class="btn blue small" data-action="v335NewCheck">+ چک دریافتی</button></div>'+
    integrityBanner+
    '<div class="v39120-stats"><div><span>کل چک‌ها</span><b>'+fa(sum.total||0)+'</b></div><div><span>در جریان</span><b>'+fa(sum.inFlow||0)+'</b></div><div><span>سررسید ۷ روز</span><b>'+fa(vm.due7||0)+'</b></div><div class="'+(vm.overdue?'danger':'')+'"><span>عقب‌افتاده</span><b>'+fa(vm.overdue||0)+'</b></div><div><span>دریافتی</span><b>'+fa(sum.received||0)+'</b></div><div><span>پرداختی</span><b>'+fa(sum.payable||0)+'</b></div></div>'+
    '<div class="v39120-search"><input id="v39120CheckSearch" class="input" value="'+attr(ui.query||'')+'" placeholder="جستجو در مشتری، بانک، شماره چک، فاکتور..."></div>'+
    '<div class="v39120-direction">'+directions.map(function(x){return '<button type="button" class="'+(direction===x[0]?'active':'')+'" data-v39120-direction="'+attr(x[0])+'">'+esc(x[1])+'</button>'}).join('')+'</div>'+
    '<div class="v39120-filters">'+filters.map(function(x){return '<button type="button" class="'+(filter===x[0]?'active':'')+'" data-v39120-filter="'+attr(x[0])+'">'+esc(x[1])+'</button>'}).join('')+'</div>'+
    '<div class="v39120-list">'+(vm.rows.length?vm.rows.map(cardHtml).join(''):'<div class="v39120-empty">برای این فیلتر چکی پیدا نشد.</div>')+'</div>'+
    '<div class="v39120-stage-note">برای جلوگیری از خطای مالی، حذف و تغییر وضعیت از این نمای یکپارچه فعلاً غیرفعال است.</div>';
}
function installStyle(){
  if(typeof document==='undefined'||document.getElementById('v39120-check-ui-style'))return;
  var s=document.createElement('style');s.id='v39120-check-ui-style';s.textContent=
  '.v39120-canonical-ledger{border-color:rgba(215,155,34,.30)!important;background:linear-gradient(180deg,#fff,#f8fafc)!important}'+
  '.v39120-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.v39120-head h3{margin:0;color:#061e35;font-size:19px}.v39120-head p{margin:4px 0 0;color:#64748b;font-size:12px;line-height:1.8;font-weight:800}'+
  '.v39120-integrity{margin:10px 0;border-radius:14px;padding:9px 11px;font-size:12px;font-weight:900;line-height:1.7}.v39120-integrity.ok{background:#ecfdf5;color:#166534;border:1px solid #bbf7d0}.v39120-integrity.warn{background:#fff7ed;color:#9a3412;border:1px solid #fed7aa}'+
  '.v39120-stats{display:grid;grid-template-columns:repeat(6,1fr);gap:7px;margin:11px 0}.v39120-stats>div{background:#071e34;color:#fff;border-radius:15px;padding:9px;min-height:68px;border:1px solid rgba(244,199,82,.16)}.v39120-stats span{display:block;font-size:10px;color:#cbd5e1;font-weight:900}.v39120-stats b{display:block;color:#f4c752;margin-top:7px;font-size:15px}.v39120-stats .danger b{color:#fda4af}'+
  '.v39120-search{margin:10px 0}.v39120-direction,.v39120-filters{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.v39120-direction button,.v39120-filters button{border:1px solid #d8e1eb;background:#fff;color:#0f2740;border-radius:12px;min-height:36px;padding:6px 10px;font-weight:950;font-size:11px;font-family:inherit}.v39120-direction button.active,.v39120-filters button.active{background:linear-gradient(135deg,#d79b22,#f4c752);border-color:#d79b22;color:#061e35}'+
  '.v39120-list{display:grid;gap:9px;margin-top:10px}.v39120-card{border:1px solid #e2e8f0;background:#fff;border-radius:18px;padding:12px;box-shadow:0 10px 22px rgba(15,23,42,.05)}.v39120-card-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.v39120-card h4{margin:4px 0 0;color:#061e35;font-size:15px}.v39120-card small{display:block;color:#64748b;font-weight:850;line-height:1.7;margin-top:4px}.v39120-dir{display:inline-flex;border-radius:999px;padding:3px 8px;font-size:10px;font-weight:1000;background:#e0f2fe;color:#075985}.v39120-dir.payable{background:#fef3c7;color:#92400e}'+
  '.v39120-badges{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}.v39120-status,.v39120-due{border-radius:999px;padding:5px 8px;font-size:10px;font-weight:1000;white-space:nowrap}.v39120-status.wait{background:#dbeafe;color:#1d4ed8}.v39120-status.done{background:#dcfce7;color:#166534}.v39120-status.bad{background:#fee2e2;color:#991b1b}.v39120-status.cancel,.v39120-status.spent{background:#e5e7eb;color:#374151}.v39120-due.overdue,.v39120-due.returned{background:#ffe4e6;color:#be123c}.v39120-due.today,.v39120-due.soon{background:#fef3c7;color:#92400e}.v39120-due.future,.v39120-due.unknown{background:#e0f2fe;color:#075985}.v39120-due.cleared{background:#dcfce7;color:#166534}.v39120-due.spent,.v39120-due.cancelled{background:#e5e7eb;color:#374151}'+
  '.v39120-meta{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:10px 0}.v39120-meta>div{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:7px 8px}.v39120-meta span{display:block;color:#64748b;font-size:10px;font-weight:850}.v39120-meta b{display:block;color:#1e293b;font-size:11px;margin-top:3px}.v39120-meta b.ok{color:#166534}.v39120-meta b.warn{color:#b45309}.v39120-note{background:#fffaf0;border:1px solid #fde68a;border-radius:12px;padding:8px 9px;font-size:11px;color:#713f12}.v39120-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.v39120-empty{text-align:center;color:#64748b;background:#fff;border:1px dashed #cbd5e1;border-radius:16px;padding:17px;font-weight:900}.v39120-stage-note{margin-top:10px;border-radius:12px;background:#f8fafc;border:1px dashed #cbd5e1;padding:8px 10px;color:#64748b;font-size:10px;font-weight:850;line-height:1.8}'+
  '.v39120-detail-back{position:fixed;inset:0;z-index:100100;background:rgba(2,6,23,.62);display:flex;align-items:flex-end;justify-content:center;padding:10px;direction:rtl}.v39120-detail{width:min(680px,100%);max-height:88vh;overflow:auto;background:#fff;border-radius:24px 24px 16px 16px;padding:15px;box-shadow:0 -18px 45px rgba(2,6,23,.35)}.v39120-detail h3{margin:0;color:#061e35}.v39120-detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin:12px 0}.v39120-detail-grid>div{border:1px solid #e2e8f0;border-radius:13px;padding:9px;background:#f8fafc}.v39120-detail-grid span{display:block;color:#64748b;font-size:10px;font-weight:850}.v39120-detail-grid b{display:block;color:#0f172a;margin-top:4px;font-size:12px}.v39120-detail-foot{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}'+
  '@media(max-width:720px){.v39120-stats{grid-template-columns:repeat(3,1fr)}.v39120-meta{grid-template-columns:repeat(2,1fr)}.v39120-card-head{display:block}.v39120-badges{justify-content:flex-start;margin-top:8px}}';
  (document.head||document.documentElement).appendChild(s);
}
function rowById(id){
  var e=engine(),rows=e&&typeof e.buildAll==='function'?e.buildAll():[];
  return rows.find(function(x){return x&&txt(x.id)===txt(id)})||null;
}
function closeDetails(){try{var x=document.querySelector('.v39120-detail-back');if(x)x.remove()}catch(_){}}
function openDetails(id){
  var row=rowById(id);if(!row)return toast('رکورد چک پیدا نشد.');
  closeDetails();
  var due=dueInfo(row),health=integrity(row),src=fa(row.sourceCount||0),finance=fa(row.financeSourceCount||0),payments=fa(row.paymentSourceCount||0);
  var html='<div class="v39120-detail-back" data-v39120-detail="1"><div class="v39120-detail"><h3>جزئیات چک '+esc(directionLabel(row.direction))+'</h3><div class="v39120-detail-grid">'+
    '<div><span>مشتری</span><b>'+esc(row.customerName||'—')+'</b></div><div><span>مبلغ</span><b>'+esc(cash(row.amount))+'</b></div>'+
    '<div><span>وضعیت</span><b>'+esc(row.statusLabel||'—')+'</b></div><div><span>سررسید</span><b>'+esc(row.dueDate||'—')+' — '+esc(due.label)+'</b></div>'+
    '<div><span>بانک</span><b>'+esc(row.bankName||'—')+'</b></div><div><span>شماره چک</span><b>'+esc(row.checkNumber||'—')+'</b></div>'+
    '<div><span>نام روی چک</span><b>'+esc(row.ownerName||'—')+'</b></div><div><span>فاکتور</span><b>'+esc(row.invoiceNumber||'بدون فاکتور')+'</b></div>'+
    '<div><span>اتصال‌های داخلی</span><b>'+src+' منبع ('+finance+' مالی / '+payments+' دریافت)</b></div><div><span>اثر حساب مشتری</span><b>'+esc(cash(Math.abs(num2(row.currentCustomerAccountEffect||0))))+'</b></div>'+
    '<div><span>عکس روی چک</span><b>'+(row.hasFrontImage?'دارد':'ندارد')+'</b></div><div><span>عکس پشت چک</span><b>'+(row.hasBackImage?'دارد':'ندارد')+'</b></div>'+
    '</div>'+(row.notes?'<div class="v39120-note"><b>یادداشت داخلی:</b> '+esc(row.notes)+'</div>':'')+
    '<div class="v39120-integrity '+(health.ok?'ok':'warn')+'">'+(health.ok?'کنترل یکپارچگی این چک سالم است.':'این چک قبل از عملیات وضعیت نیاز به بررسی داخلی دارد.')+'</div>'+
    '<div class="v39120-detail-foot"><button type="button" class="btn ghost" data-v39120-action="close">بستن</button>'+(row.customerId?'<button type="button" class="btn gold" data-action="account" data-id="'+attr(row.customerId)+'">پرونده مشتری</button>':'')+'</div></div></div>';
  try{document.body.insertAdjacentHTML('beforeend',html)}catch(_){}
}
function hideLegacyCheckTransactions(page){
  if(!page)return;
  try{
    page.querySelectorAll('.v331-tx-list .v331-tx-card').forEach(function(card){
      var btn=card.querySelector('[data-action="v331EditTx"][data-id]')||card.querySelector('[data-action="v331DeleteTx"][data-id]');
      if(!btn)return;
      var id=txt(btn.getAttribute('data-id')),row=null;
      try{row=(state&&Array.isArray(state.v331FinanceTx)?state.v331FinanceTx:[]).find(function(x){return x&&txt(x.id)===id})}catch(_){}
      var sig=txt(row&&[row.type,row.method,row.checkNumber,row.dueDate].join(' '));
      if(row&&(sig.indexOf('چک')>-1||txt(row.checkNumber)||txt(row.dueDate)))card.style.display='none';
    });
    page.querySelectorAll('.v331-filter-tabs [data-filter]').forEach(function(btn){
      var f=btn.getAttribute('data-filter');if(f==='check'||f==='waiting'||f==='bad')btn.style.display='none';
    });
  }catch(_){}
}
function refreshPanel(){
  if(typeof document==='undefined')return;
  installStyle();
  var page=document.querySelector('.v331-finance-page');if(!page)return;
  var panel=page.querySelector('.v335-check-ledger');
  if(!panel){
    panel=document.createElement('div');panel.className='v335-check-ledger v35-simple-ledger';
    var list=page.querySelector('.v331-tx-list');if(list)page.insertBefore(panel,list);else page.appendChild(panel);
  }
  panel.classList.add('v39120-canonical-ledger');panel.setAttribute('data-v39120-canonical','1');panel.innerHTML=panelHtml();
  hideLegacyCheckTransactions(page);
}
function decorate(){
  if(typeof document==='undefined')return;
  installStyle();
  try{
    if(typeof state!=='undefined'&&state&&state.tab==='finance')refreshPanel();
  }catch(_){}
}
function wire(){
  if(typeof document==='undefined')return;
  installStyle();
  try{if(typeof window.registerAlanRangAfterRender==='function')window.registerAlanRangAfterRender('v39120-check-ui-stage2',function(){setTimeout(decorate,0)})}catch(_){}
  if(typeof window.addEventListener==='function')window.addEventListener('click',function(e){
    var action=e.target&&e.target.closest?e.target.closest('[data-action]'):null;
    if(action&&action.getAttribute('data-action')==='v335SaveCheck')savePreflight(e,action);
  },true);
  document.addEventListener('click',function(e){
    var f=e.target&&e.target.closest?e.target.closest('[data-v39120-filter]'):null;
    if(f){e.preventDefault();e.stopPropagation();st().filter=f.getAttribute('data-v39120-filter')||'all';refreshPanel();return}
    var d=e.target&&e.target.closest?e.target.closest('[data-v39120-direction]'):null;
    if(d){e.preventDefault();e.stopPropagation();st().direction=d.getAttribute('data-v39120-direction')||'all';refreshPanel();return}
    var a=e.target&&e.target.closest?e.target.closest('[data-v39120-action]'):null;
    if(a){var name=a.getAttribute('data-v39120-action');if(name==='details'){e.preventDefault();e.stopPropagation();openDetails(a.getAttribute('data-id'))}else if(name==='close'){e.preventDefault();e.stopPropagation();closeDetails()}return}
    if(e.target&&e.target.classList&&e.target.classList.contains('v39120-detail-back'))closeDetails();
  },true);
  document.addEventListener('input',function(e){
    if(!e.target||e.target.id!=='v39120CheckSearch')return;
    st().query=e.target.value||'';
    var pos=e.target.selectionStart;
    refreshPanel();
    var next=document.getElementById('v39120CheckSearch');if(next){next.focus();try{next.setSelectionRange(pos,pos)}catch(_){}}
  },true);
  try{if(document.readyState!=='loading')setTimeout(decorate,50)}catch(_){}
}

window.AlanRangChecksUIV39120={
  version:VERSION,
  dueInfo:dueInfo,
  integrity:integrity,
  viewRows:viewRows,
  buildViewModel:buildViewModel,
  preflightCandidate:preflightCandidate,
  refresh:refreshPanel,
  decorate:decorate
};
wire();
})();
