(function(){
'use strict';
if(window.__ALANRANG_PRODUCT_CORE_V3962__)return;
window.__ALANRANG_PRODUCT_CORE_V3962__=true;

var VERSION='39.6.3';
var SCHEMA_VERSION=3960;
var MAX_AUDIT=400;
var undoEntry=null,pendingAction=null,lastFingerprint='',lastReminderFingerprint='';

function esc(v){try{return typeof safe==='function'?safe(v):String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c})}catch(_){return String(v==null?'':v)}}
function attr(v){try{return typeof safeAttr==='function'?safeAttr(v):esc(v)}catch(_){return esc(v)}}
function n(v){try{return typeof num==='function'?num(v):Number(String(v||'').replace(/[^0-9.-]/g,''))||0}catch(_){return 0}}
function mon(v){try{return typeof money==='function'?money(v):String(Math.round(n(v)))+' تومان'}catch(_){return String(v||0)+' تومان'}}
function fa(v){try{return typeof faDigits==='function'?faDigits(v):String(v).replace(/[0-9]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'[d]})}catch(_){return String(v)}}
function cloneSafe(v){try{return JSON.parse(JSON.stringify(v))}catch(_){return null}}
function nowIso(){return new Date().toISOString()}
function bridge(){try{return window.AlanRangAndroid||null}catch(_){return null}}
function currentData(){return (typeof data!=='undefined'&&data)?data:null}
function currentState(){return (typeof state!=='undefined'&&state)?state:null}
function allFinance(){try{return typeof readFinanceTransactions==='function'?readFinanceTransactions():((state&&Array.isArray(state.v331FinanceTx))?state.v331FinanceTx:[])}catch(_){return []}}
function saveFinance(rows){try{if(typeof writeFinanceTransactions==='function'){writeFinanceTransactions(rows);return true}}catch(_){}return false}
function invoiceTotal(inv){try{return typeof invoiceTotals==='function'?invoiceTotals(inv):{totalAmount:0,totalPaid:0,remainingAmount:0}}catch(_){return {totalAmount:0,totalPaid:0,remainingAmount:0}}}
function customer(id){try{return typeof customerById==='function'?customerById(id):(data.customers||[]).find(function(c){return String(c.id)===String(id)})}catch(_){return null}}
function invoice(id){try{return typeof invoiceById==='function'?invoiceById(id):(data.invoices||[]).find(function(x){return String(x.id)===String(id)})}catch(_){return null}}
function invsOf(id){try{return typeof invoicesOf==='function'?invoicesOf(id):(data.invoices||[]).filter(function(x){return String(x.customerId)===String(id)})}catch(_){return []}}
function parseDate(v){try{return typeof parseJalaliDate==='function'?parseJalaliDate(v):null}catch(_){return null}}
function todayP(){try{return typeof todayJalali==='function'?todayJalali():null}catch(_){return null}}
function dateKey(v){var p=parseDate(v);if(!p)return '';return [p.jy,String(p.jm).padStart(2,'0'),String(p.jd).padStart(2,'0')].join('/')}
function periodMatch(value,period){try{if(typeof reportPeriodMatch==='function')return reportPeriodMatch(value,period)}catch(_){}if(!period||period==='all')return true;var p=parseDate(value),t=todayP();if(!p||!t)return false;if(period==='today')return p.jy===t.jy&&p.jm===t.jm&&p.jd===t.jd;if(period==='month')return p.jy===t.jy&&p.jm===t.jm;if(period==='year')return p.jy===t.jy;return true}

function ensureModel(){
  var d=currentData();if(!d)return;
  d.schemaVersion=Math.max(Number(d.schemaVersion||0),SCHEMA_VERSION);
  if(!Array.isArray(d.auditLog))d.auditLog=[];
}
function addAudit(type,title,details,entityId){
  ensureModel();var d=currentData();if(!d)return;
  d.auditLog.unshift({id:'audit_'+Date.now()+'_'+Math.random().toString(16).slice(2),type:String(type||'change'),title:String(title||'تغییر اطلاعات'),details:String(details||''),entityId:String(entityId||''),createdAt:nowIso()});
  if(d.auditLog.length>MAX_AUDIT)d.auditLog.length=MAX_AUDIT;
}
function coreFingerprint(){
  try{
    var d=currentData(),f=allFinance();if(!d)return '';
    var lite={c:(d.customers||[]).map(function(x){return [x.id,x.name,x.phone,x.balance,x.updatedAt]}),i:(d.invoices||[]).map(function(x){return [x.id,x.invoiceNumber,x.customerId,x.updatedAt,(x.payments||[]).length,x.workflowStatus]}),w:(d.executiveWorks||[]).map(function(x){return [x.id,x.status,x.updatedAt]}),r:(d.workReservations||[]).map(function(x){return [x.id,x.status,x.updatedAt]}),fu:(d.followups||[]).map(function(x){return [x.id,x.status,x.updatedAt]}),f:f.map(function(x){return [x.id,x.type,x.amount,x.status,x.updatedAt]})};
    return JSON.stringify(lite);
  }catch(_){return String(Date.now())}
}
function snapshotForUndo(){return {data:cloneSafe(currentData()),finance:cloneSafe(allFinance()),tab:(currentState()||{}).tab||'home',selectedCustomerId:(currentState()||{}).selectedCustomerId||null}}
function showUndo(title){
  var old=document.getElementById('ar396UndoBar');if(old)old.remove();
  var el=document.createElement('div');el.id='ar396UndoBar';el.className='ar396-undo';el.innerHTML='<span>'+esc(title||'حذف انجام شد')+'</span><button type="button" data-ar396="undo">بازگردانی</button>';
  document.body.appendChild(el);setTimeout(function(){if(el&&el.parentNode)el.remove();},8000);
}
function restoreUndo(){
  if(!undoEntry||!undoEntry.before||!undoEntry.before.data)return;
  try{
    data=cloneSafe(undoEntry.before.data);saveFinance(cloneSafe(undoEntry.before.finance)||[]);if(typeof saveData==='function'&&!saveData())throw new Error('save failed');
    if(state){state.tab=undoEntry.before.tab||'home';state.selectedCustomerId=undoEntry.before.selectedCustomerId||null;state.modal=null}
    addAudit('undo','بازگردانی حذف',undoEntry.label||'',undoEntry.entityId||'');undoEntry=null;lastFingerprint=coreFingerprint();if(typeof renderApp==='function')renderApp();if(typeof showToast==='function')showToast('اطلاعات حذف‌شده بازگردانی شد');
  }catch(e){console.error('AlanRang undo',e);if(typeof showToast==='function')showToast('بازگردانی کامل نشد')}
}

var destructiveActions={deleteCustomer:'حذف مشتری',deleteInvoice:'حذف فاکتور',deleteCurrentInvoice:'حذف فاکتور',deleteExecutionWork:'حذف کار اجرایی',deleteWorkReservation:'حذف رزرو',v331DeleteTx:'حذف ثبت مالی',v335DeleteCheck:'حذف چک',v37DeletePurchase:'حذف خرید',v3736DeleteInvoice:'حذف فاکتور خرید',v3932DeletePurchase:'حذف خرید'};
var saveActions={saveCustomer:'ذخیره مشتری',saveInvoice:'ذخیره فاکتور',saveExecutionWork:'ذخیره کار اجرایی',saveWorkReservation:'ذخیره رزرو',v331SaveTx:'ذخیره دریافت/پرداخت',v335SaveCheck:'ذخیره چک',v335CycleCheck:'تغییر وضعیت چک',v37SavePurchase:'ذخیره خرید',v3733SaveInvoice:'ذخیره فاکتور خرید',quickPayment:'ثبت دریافت',saveFollowup:'ذخیره پیگیری'};
function beginAction(button,action){
  if(!button||pendingAction)return;
  var destructive=!!destructiveActions[action],label=destructiveActions[action]||saveActions[action];if(!label)return;
  if(!destructive&&saveActions[action])setSaveState('saving');
  pendingAction={beforeFingerprint:coreFingerprint(),before:destructive?snapshotForUndo():null,label:label,entityId:button.dataset.id||button.dataset.invoiceId||'',destructive:destructive};
  setTimeout(finishAction,180);
}
function finishAction(){
  var p=pendingAction;pendingAction=null;if(!p)return;var after=coreFingerprint();if(after===p.beforeFingerprint)return;
  if(p.destructive){undoEntry={before:p.before,label:p.label,entityId:p.entityId};showUndo(p.label+' انجام شد');addAudit('delete',p.label,'قابل بازگردانی تا چند ثانیه',p.entityId)}
  else addAudit('save',p.label,'تغییرات با موفقیت ثبت شد',p.entityId);
  try{if(typeof saveData==='function')saveData()}catch(_){}
  lastFingerprint=coreFingerprint();
}

function monthlyBackupStatus(){
  try{var b=bridge(),raw=b&&typeof b.getMonthlyBackupStatus==='function'?b.getMonthlyBackupStatus():'';return raw?JSON.parse(raw):{}}catch(_){return {}}
}
function daysSince(ms){if(!ms)return null;return Math.floor((Date.now()-Number(ms))/86400000)}
function financeStats(period){
  var rows=allFinance().filter(function(x){return periodMatch(x.date||x.dueDate,period||'all')});
  var received=0,paid=0,expenses=0;rows.forEach(function(x){var status=String(x.status||''),bad=status.indexOf('برگشتی')>-1||status.indexOf('لغو')>-1;if((x.type==='دریافت'||x.type==='چک'||x.method==='چک')&&!bad)received+=n(x.amount);if(x.type==='پرداخت')paid+=n(x.amount);if(x.type==='هزینه')expenses+=n(x.amount)});return {received:received,paid:paid,expenses:expenses,rows:rows};
}
function canonicalCheckRows(){
  try{
    var api=window.AlanRangChecksV39120;
    if(api&&typeof api.buildAll==='function'){
      var rows=api.buildAll();
      if(Array.isArray(rows))return rows;
    }
  }catch(_){}
  return null;
}
function legacyCheckStatus(v){return String(v||'').replace(/\u200c/g,' ').replace(/\s+/g,' ').trim()}
function legacyCheckIsClosed(x){
  var st=legacyCheckStatus(x&&x.status);
  return st.indexOf('دریافت شده')>-1||st.indexOf('وصول')>-1||st.indexOf('تسویه')>-1||st.indexOf('پاس')>-1||st.indexOf('خرج')>-1||st.indexOf('لغو')>-1||st.indexOf('برگشتی')>-1;
}
function checkStats(){
  var t=todayP(),today=t?[t.jy,t.jm,t.jd]:null,canonical=canonicalCheckRows(),due=0,overdue=0,waiting=0,returned=0;
  if(canonical){
    canonical.forEach(function(x){
      var st=String(x&&x.status||'');
      if(st==='returned'){returned++;return;}
      if(st!=='in_flow')return;
      waiting++;
      var p=parseDate(x.dueDate||x.receivedDate);if(!p||!today)return;
      var a=p.jy*372+p.jm*31+p.jd,b=today[0]*372+today[1]*31+today[2];
      if(a===b)due++;else if(a<b)overdue++;
    });
    return {total:canonical.length,due:due,overdue:overdue,waiting:waiting,returned:returned,source:'canonical'};
  }
  var checks=allFinance().filter(function(x){return x&&(x.type==='چک'||x.method==='چک')});
  checks.forEach(function(x){
    var st=legacyCheckStatus(x.status);
    if(st.indexOf('برگشتی')>-1){returned++;return;}
    if(st.indexOf('انتظار')>-1)waiting++;
    if(legacyCheckIsClosed(x))return;
    var p=parseDate(x.dueDate||x.date);if(!p||!today)return;
    var a=p.jy*372+p.jm*31+p.jd,b=today[0]*372+today[1]*31+today[2];
    if(a===b)due++;else if(a<b)overdue++;
  });
  return {total:checks.length,due:due,overdue:overdue,waiting:waiting,returned:returned,source:'legacy-fallback'};
}
function dashboardStats(){
  ensureModel();try{if(typeof recalculateAllBalances==='function')recalculateAllBalances(false)}catch(_){}
  var d=currentData()||{},monthInv=(d.invoices||[]).filter(function(i){return periodMatch(i.date,'month')}),todayInv=(d.invoices||[]).filter(function(i){return periodMatch(i.date,'today')});
  var monthSales=monthInv.reduce(function(s,i){return s+n(invoiceTotal(i).totalAmount)},0),todaySales=todayInv.reduce(function(s,i){return s+n(invoiceTotal(i).totalAmount)},0);
  var fMonth=financeStats('month'),fToday=financeStats('today'),debt=(d.customers||[]).reduce(function(s,c){return s+Math.max(0,n(c.balance))},0),credit=(d.customers||[]).reduce(function(s,c){return s+Math.max(0,-n(c.balance))},0);
  var monthPurchases=0;
  var manual=(d.settings&&Array.isArray(d.settings.v37WorkshopPurchases))?d.settings.v37WorkshopPurchases:[];monthPurchases=manual.filter(function(x){var st=String(x.status||'خرید شد');return st.indexOf('لغو')<0&&st.indexOf('نیاز به خرید')<0&&periodMatch(x.purchaseDate||x.needDate||x.date,'month')}).reduce(function(s,x){var q=n(x.quantity)||1,u=n(x.unitPrice||x.unitPriceToman);return s+n(x.totalAmount||x.finalAmount||(u?q*u:0)||x.estimatedAmount||x.amount)},0)
  return {todaySales:todaySales,monthSales:monthSales,todayReceived:fToday.received,monthReceived:fMonth.received,monthPaid:fMonth.paid,monthExpenses:fMonth.expenses,debt:debt,credit:credit,monthPurchases:monthPurchases,estimatedGrossProfit:monthSales-monthPurchases-fMonth.expenses,checks:checkStats()};
}
function topCustomers(mode){var arr=(currentData().customers||[]).map(function(c){var invs=invsOf(c.id),sales=invs.reduce(function(s,i){return s+n(invoiceTotal(i).totalAmount)},0);return {c:c,sales:sales,debt:Math.max(0,n(c.balance))}});arr.sort(function(a,b){return mode==='sales'?b.sales-a.sales:b.debt-a.debt});return arr.filter(function(x){return mode==='sales'?x.sales>0:x.debt>0}).slice(0,5)}
function topListHtml(mode){var rows=topCustomers(mode);if(!rows.length)return '<div class="ar396-empty">موردی برای نمایش وجود ندارد.</div>';return rows.map(function(x,i){var val=mode==='sales'?x.sales:x.debt;return '<button class="ar396-rank" data-action="account" data-id="'+attr(x.c.id)+'"><span>'+fa(i+1)+'</span><b>'+esc(x.c.name||'مشتری')+'</b><em>'+mon(val)+'</em></button>'}).join('')}
function saveIndicatorHtml(){return '<div class="ar396-save-state" id="ar396SaveState"><i></i><span>ذخیره امن آماده است</span></div>'}
function notificationPermissionHtml(){try{var b=bridge();if(b&&typeof b.canPostFinancialNotifications==='function'&&!b.canPostFinancialNotifications())return '<button class="btn ghost small" data-ar396="enableNotifications">فعال‌کردن اعلان چک</button>'}catch(_){}return ''}
function backupAlertHtml(){var s=monthlyBackupStatus(),syncAge=daysSince(s.snapshotAt),fileAge=daysSince(s.lastCreatedAt),warn=!!s.lastError||syncAge==null||syncAge>=2;var meta=s.lastError?('خطا: '+s.lastError):(syncAge==null?'هنوز همگام‌سازی امن ثبت نشده':('آخرین همگام‌سازی امن: '+fa(syncAge)+' روز قبل'+(fileAge!=null?' | فایل ماهانه: '+fa(fileAge)+' روز قبل':'')));return '<button class="ar396-alert '+(warn?'warn':'ok')+'" data-action="tab" data-tab="backup"><b>'+(warn?'⚠ پشتیبان را بررسی کن':'✓ پشتیبان امن به‌روز است')+'</b><span>'+esc(meta)+'</span></button>'}
function compactHomeFinanceHtml(){
  var s=dashboardStats(),c=s.checks;
  return '<section class="ar396-compact-finance">'+
    '<div class="ar396-compact-head"><div><h3>💳 چک و دریافتی</h3><small>خلاصه مالی؛ بدون شلوغ‌کردن خانه</small></div><button type="button" class="ar396-icon-search" data-ar396="search" aria-label="جستجوی سراسری">⌕</button></div>'+
    '<div class="ar396-compact-grid"><button data-action="tab" data-tab="finance"><span>دریافتی امروز</span><b>'+mon(s.todayReceived)+'</b></button><button data-action="tab" data-tab="finance"><span>دریافتی این ماه</span><b>'+mon(s.monthReceived)+'</b></button><button data-action="tab" data-tab="finance"><span>چک امروز</span><b>'+fa(c.due)+'</b></button><button data-action="tab" data-tab="finance" class="danger"><span>چک عقب‌افتاده</span><b>'+fa(c.overdue)+'</b></button></div>'+
    '<div class="ar396-compact-actions"><button class="btn green" data-action="v331NewTx" data-type="دریافت">+ ثبت دریافت</button><button class="btn blue" data-action="v335NewCheck">+ ثبت چک</button></div>'+notificationPermissionHtml()+'</section>';
}
function reportToolsHtml(){return '<section class="ar396-report-tools"><div><h3>ابزار مدیریت</h3><small>امکانات تکمیلی از صفحه خانه جدا شده‌اند تا خانه خلوت بماند.</small></div><div class="ar396-report-tool-grid"><button data-ar396="search">⌕<span>جستجو</span></button><button data-ar396="health">♥<span>سلامت اطلاعات</span></button><button data-ar396="audit">↺<span>تاریخچه</span></button></div></section>'}
function reservationPageHtml(){
  var d=currentData()||{},rows=(Array.isArray(d.workReservations)?d.workReservations:[]).filter(function(r){return r&&r.status!=='تبدیل شده'&&r.status!=='لغو شده'}).slice().sort(function(a,b){return dateKey(a.date).localeCompare(dateKey(b.date))});
  var cards=rows.map(function(r){var c=customer(r.customerId),title=[r.title,r.count,r.workType].filter(Boolean).join('، ')||'رزرو کار';return '<article class="ar396-reserve-card"><div><b>'+esc(c&&c.name||'بدون مشتری')+'</b><span>'+esc(title)+'</span><small>📅 '+esc(r.date||'بدون تاریخ')+(r.notes?' — '+esc(r.notes):'')+'</small></div><div class="ar396-reserve-actions"><button class="btn blue small" data-action="editWorkReservation" data-id="'+attr(r.id)+'">ویرایش</button><button class="btn red small" data-action="deleteWorkReservation" data-id="'+attr(r.id)+'">حذف</button></div></article>'}).join('');
  return '<section class="page ar396-reservation-page"><div class="back-row"><button class="btn ghost" data-action="tab" data-tab="home">برگشت</button><button class="btn gold" data-action="newWorkReservation">+ رزرو کار</button></div><div class="ar396-reserve-hero"><h2>📅 رزرو کارگاه</h2><p>فقط رزروهایی که خودت ثبت می‌کنی؛ ساده و مستقیم.</p></div><div class="ar396-reserve-launch"><button class="btn gold" data-action="newWorkReservation">+ ثبت رزرو کار</button><button class="btn ghost" data-action="ar3921NewNotice">اطلاعیه مشتری</button><button class="btn ghost" data-action="ar3938NewQuote">اعلام قیمت</button></div><div class="ar396-reserve-list">'+(cards||'<div class="ar396-empty">هنوز رزرو کاری ثبت نشده است.</div>')+'</div></section>';
}

function normText(v){return String(v==null?'':v).toLowerCase().replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\u200f]/g,' ').replace(/\s+/g,' ').trim()}
function globalResults(q){
  var term=normText(q);if(!term)return [];var out=[],d=currentData()||{};
  (d.customers||[]).forEach(function(c){var hay=normText([c.name,c.phone,c.address,c.notes,c.id].join(' '));if(hay.indexOf(term)>-1)out.push({kind:'مشتری',title:c.name||'مشتری',meta:(c.phone||'')+' — مانده '+mon(Math.abs(n(c.balance))),action:'account',id:c.id})});
  (d.invoices||[]).forEach(function(i){var c=customer(i.customerId),items=(i.items||[]).map(function(x){return x.description}).join(' '),hay=normText([i.invoiceNumber,i.projectTitle,i.description,i.date,items,c&&c.name].join(' '));if(hay.indexOf(term)>-1)out.push({kind:'فاکتور',title:'فاکتور '+(i.invoiceNumber||'—'),meta:(c?c.name:'بدون مشتری')+' — '+mon(invoiceTotal(i).totalAmount),action:'previewInvoice',id:i.id})});
  allFinance().forEach(function(x){var c=customer(x.customerId),hay=normText([x.type,x.method,x.amount,x.date,x.dueDate,x.status,x.notes,x.checkNumber,x.bankName,c&&c.name].join(' '));if(hay.indexOf(term)>-1)out.push({kind:(x.type==='چک'||x.method==='چک')?'چک':'مالی',title:(x.type||'ثبت مالی')+' '+mon(x.amount),meta:(c?c.name:'بدون مشتری')+' — '+(x.date||x.dueDate||''),productAction:'financeFocus',id:x.id})});
  (d.followups||[]).forEach(function(f){var c=customer(f.customerId),hay=normText([f.note,f.promiseDate,f.amount,f.status,c&&c.name].join(' '));if(hay.indexOf(term)>-1)out.push({kind:'پیگیری',title:(c?c.name:'مشتری')+' — پیگیری',meta:(f.promiseDate||'')+' '+(f.note||''),action:'account',id:f.customerId})});
  return out.slice(0,120);
}
function searchHtml(){var q=(state.ar396Search||'').trim(),rows=globalResults(q);return '<section class="page ar396-page"><div class="back-row"><button class="btn ghost" data-ar396="home">برگشت</button></div><div class="ar396-hero"><h2>جستجوی سراسری</h2><p>نام مشتری، شماره تلفن، شماره فاکتور، شرح، مبلغ، شماره چک، بانک یا توضیحات را بنویس.</p></div><div class="field"><input id="ar396GlobalSearch" class="input ar396-search-input" value="'+esc(q)+'" placeholder="مثلاً رضایی، ۱۸۴، ملت یا ۵۰۰۰۰۰۰" autofocus></div><div class="ar396-results">'+(!q?'<div class="ar396-empty">عبارت جستجو را وارد کن.</div>':(rows.map(function(r){var act=r.productAction?('data-ar396="'+attr(r.productAction)+'"'):('data-action="'+attr(r.action)+'"');return '<button class="ar396-result" '+act+' data-id="'+attr(r.id)+'"><span>'+esc(r.kind)+'</span><b>'+esc(r.title)+'</b><small>'+esc(r.meta)+'</small></button>'}).join('')||'<div class="ar396-empty">چیزی پیدا نشد.</div>'))+'</div></section>'}

function storageSize(){try{return new Blob([JSON.stringify(currentData()||{})]).size}catch(_){try{return JSON.stringify(currentData()||{}).length}catch(__){return 0}}}
function healthHtml(){var d=currentData()||{},b=bridge(),backup=monthlyBackupStatus(),age=daysSince(backup.snapshotAt),secure=!!(b&&typeof b.saveSecureData==='function'&&typeof b.loadSecureData==='function'),size=storageSize(),tests=[{ok:secure,title:'ذخیره رمزگذاری‌شده دستگاه',meta:secure?'AndroidKeyStore/AES-GCM در دسترس است':'Bridge امن در این محیط در دسترس نیست'},{ok:!!backup.storageReady,title:'مسیر پشتیبان',meta:backup.path||'Documents/AlanRang/Backups'},{ok:age!=null&&age<2&&!backup.lastError,title:'همگام‌سازی پشتیبان امن',meta:backup.lastError?String(backup.lastError):(age==null?'هنوز Snapshot امن ثبت نشده':fa(age)+' روز از آخرین Snapshot')},{ok:Number(d.schemaVersion||0)>=SCHEMA_VERSION,title:'نسخه ساختار داده',meta:'Schema '+fa(d.schemaVersion||0)},{ok:size<48*1024*1024,title:'حجم داده اصلی',meta:fa((size/1024/1024).toFixed(2))+' MB'+(size>=48*1024*1024?' — بهتر است آرشیو/پاکسازی بررسی شود':'')}];return '<section class="page ar396-page"><div class="back-row"><button class="btn ghost" data-ar396="home">برگشت</button><button class="btn gold" data-action="tab" data-tab="backup">پشتیبان‌گیری</button></div><div class="ar396-hero"><h2>سلامت اطلاعات</h2><p>وضعیت ذخیره امن، پشتیبان و ساختار داده را یکجا می‌بینی.</p></div><div class="ar396-health-grid">'+tests.map(function(t){return '<div class="ar396-health '+(t.ok?'ok':'warn')+'"><b>'+(t.ok?'✓':'!')+' '+esc(t.title)+'</b><span>'+esc(t.meta)+'</span></div>'}).join('')+'</div><div class="ar396-card"><h3>شمارش اطلاعات</h3><div class="ar396-counts"><div><span>مشتری</span><b>'+fa((d.customers||[]).length)+'</b></div><div><span>فاکتور</span><b>'+fa((d.invoices||[]).length)+'</b></div><div><span>ثبت مالی</span><b>'+fa(allFinance().length)+'</b></div><div><span>پیگیری</span><b>'+fa((d.followups||[]).length)+'</b></div></div></div></section>'}
function auditHtml(){ensureModel();var rows=(currentData().auditLog||[]);return '<section class="page ar396-page"><div class="back-row"><button class="btn ghost" data-ar396="home">برگشت</button><button class="btn red" data-ar396="clearAudit">پاک‌کردن تاریخچه</button></div><div class="ar396-hero"><h2>تاریخچه تغییرات</h2><p>عملیات مهم ثبت، ویرایش، حذف و بازگردانی در این دستگاه نگهداری می‌شود.</p></div><div class="ar396-audit">'+(rows.map(function(x){return '<div class="ar396-audit-row"><span>'+esc(x.type||'change')+'</span><b>'+esc(x.title||'تغییر')+'</b><small>'+esc(x.details||'')+'<br>'+esc(x.createdAt||'')+'</small></div>'}).join('')||'<div class="ar396-empty">هنوز تغییری ثبت نشده است.</div>')+'</div></section>'}

function customerStatementRows(c){var rows=[];invsOf(c.id).forEach(function(i){var t=invoiceTotal(i);rows.push({kind:'فاکتور',date:i.date||'',amount:n(t.totalAmount),invoice:i,note:i.projectTitle||''});(i.payments||[]).forEach(function(p){rows.push({kind:'دریافت',date:p.date||i.date||'',amount:-n(p.amount),invoice:i,note:p.method||p.note||''})})});rows.sort(function(a,b){return dateKey(a.date).localeCompare(dateKey(b.date))});var running=n(c.openingBalance||0);return rows.map(function(r){running+=r.amount;return Object.assign({},r,{running:running})})}
function customerStatementHtml(c){var period=(state.ar396StatementPeriod||'all'),rows=customerStatementRows(c).filter(function(r){return periodMatch(r.date,period)}),totalInv=rows.filter(function(r){return r.kind==='فاکتور'}).reduce(function(s,r){return s+r.amount},0),totalPay=-rows.filter(function(r){return r.kind==='دریافت'}).reduce(function(s,r){return s+r.amount},0);return '<div class="ar396-statement"><div class="ar396-section-head"><div><h3>صورتحساب مشتری</h3><small>فاکتور، دریافت و مانده تجمعی</small></div><button class="btn ghost small" data-ar396="printStatement">چاپ</button></div><div class="ar396-periods">'+[['all','همه'],['today','امروز'],['week','این هفته'],['month','این ماه'],['year','امسال']].map(function(x){return '<button class="'+(period===x[0]?'active':'')+'" data-ar396="statementPeriod" data-period="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div><div class="ar396-counts"><div><span>فاکتور</span><b>'+mon(totalInv)+'</b></div><div><span>دریافت</span><b>'+mon(totalPay)+'</b></div><div><span>مانده فعلی</span><b>'+mon(Math.abs(n(c.balance)))+'</b></div></div><div class="ar396-table-wrap"><table class="ar396-table"><thead><tr><th>تاریخ</th><th>شرح</th><th>بدهکار/بستانکار</th><th>مانده</th></tr></thead><tbody>'+rows.map(function(r){return '<tr><td>'+esc(r.date||'—')+'</td><td>'+esc(r.kind+' '+(r.invoice&&r.invoice.invoiceNumber?r.invoice.invoiceNumber:'')+(r.note?' — '+r.note:''))+'</td><td class="'+(r.amount>=0?'debt':'credit')+'">'+(r.amount>=0?'+':'−')+mon(Math.abs(r.amount))+'</td><td>'+mon(Math.abs(r.running))+'</td></tr>'}).join('')+'</tbody></table></div></div>'}

function attachmentKey(cid){return (typeof KEY!=='undefined'?KEY:'alanrang')+'_customer_files_'+String(cid||'')}
function attachments(cid){try{var raw=alanRangStorageGetItem(attachmentKey(cid)),a=raw?JSON.parse(raw):[];return Array.isArray(a)?a:[]}catch(_){return []}}
function saveAttachments(cid,arr){alanRangStorageSetItem(attachmentKey(cid),JSON.stringify(arr||[]))}
function customerFilesHtml(c){var a=attachments(c.id);return '<div class="ar396-files"><div class="ar396-section-head"><div><h3>فایل‌ها و عکس‌های مشتری</h3><small>عکس‌ها محلی و داخل فضای امن برنامه نگهداری می‌شوند.</small></div><button class="btn gold small" data-ar396="chooseFile" data-id="'+attr(c.id)+'">+ عکس</button></div><input id="ar396CustomerFile" type="file" accept="image/*" class="hidden" data-customer-id="'+attr(c.id)+'"><div class="ar396-file-grid">'+(a.map(function(x){return '<article><img src="'+attr(x.dataUrl)+'" alt="فایل مشتری"><div><b>'+esc(x.name||'عکس')+'</b><small>'+esc(x.createdAt||'')+'</small><button class="btn red small" data-ar396="deleteFile" data-id="'+attr(x.id)+'" data-customer-id="'+attr(c.id)+'">حذف</button></div></article>'}).join('')||'<div class="ar396-empty">هنوز عکسی برای این مشتری ثبت نشده است.</div>')+'</div></div>'}
function compressImage(file,cb){var r=new FileReader();r.onload=function(){var img=new Image();img.onload=function(){var max=1400,w=img.width,h=img.height;if(w>h&&w>max){h=Math.round(h*max/w);w=max}else if(h>=w&&h>max){w=Math.round(w*max/h);h=max}var c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);cb(c.toDataURL('image/jpeg',.72))};img.onerror=function(){cb(String(r.result||''))};img.src=r.result};r.readAsDataURL(file)}

function ensureSaveIndicator(){if(document.getElementById('ar396SaveState'))return;var page=document.querySelector('#app .page');if(page)page.insertAdjacentHTML('afterbegin',saveIndicatorHtml())}
function setSaveState(ok){var el=document.getElementById('ar396SaveState');if(!el)return;el.classList.toggle('error',ok===false);el.classList.toggle('saving',ok==='saving');var span=el.querySelector('span');if(span)span.textContent=ok==='saving'?'در حال ذخیره…':(ok===false?'ذخیره انجام نشد':'✓ ذخیره شد')}
function notifyChecks(){var c=checkStats();if(!(c.due||c.overdue||c.returned))return;try{var b=bridge();if(b&&typeof b.showLocalFinancialReminder==='function'){var key='checks_'+new Date().toISOString().slice(0,10)+'_'+c.due+'_'+c.overdue+'_'+c.returned;b.showLocalFinancialReminder(key,'یادآور چک آلان‌رنگ','امروز '+c.due+' سررسید، '+c.overdue+' عقب‌افتاده و '+c.returned+' برگشتی داری.')}}catch(_){} }
function reminderCheckRows(){
  var canonical=canonicalCheckRows();
  if(canonical)return canonical.filter(function(x){return x&&x.status==='in_flow'});
  return allFinance().filter(function(x){return x&&(x.type==='چک'||x.method==='چک')&&!legacyCheckIsClosed(x)});
}
function syncScheduledCheckReminders(){
  try{
    var b=bridge();if(!b||typeof b.replaceFinancialReminderSchedule!=='function')return;
    var rows=[],now=Date.now();
    reminderCheckRows().forEach(function(x){
      var p=parseDate(x.dueDate||x.date||x.receivedDate);if(!p||typeof jalaaliToGregorian!=='function')return;
      var g=jalaaliToGregorian(p.jy,p.jm,p.jd),due=new Date(g.gy,g.gm-1,g.gd,9,0,0,0),cid=x.customerId||'',c=customer(cid),who=x.customerName||(c&&c.name?c.name:'مشتری'),amount=mon(x.amount||0),dueText=x.dueDate||x.date||x.receivedDate||'';
      [{suffix:'before',at:new Date(due.getTime()-86400000),title:'چک فردا سررسید می‌شود',lead:'فردا'},{suffix:'due',at:due,title:'سررسید چک امروز',lead:'امروز'}].forEach(function(r){
        var ts=r.at.getTime();if(ts<=now+60000)return;rows.push({key:'check_'+String(x.id||x.checkNumber||dueText)+'_'+r.suffix,triggerAt:ts,title:r.title,message:r.lead+' چک '+who+' به مبلغ '+amount+' با سررسید '+dueText+' را بررسی کن.'});
      });
    });
    rows.sort(function(a,c){return a.triggerAt-c.triggerAt});if(rows.length>200)rows.length=200;
    var json=JSON.stringify(rows);if(json===lastReminderFingerprint)return;lastReminderFingerprint=json;b.replaceFinancialReminderSchedule(json);
  }catch(_){}
}

function installStyle(){if(document.getElementById('ar396-product-style'))return;var s=document.createElement('style');s.id='ar396-product-style';s.textContent=`
.ar396-home{padding:14px 14px 118px!important;background:#f5f7fa;color:#102238}.ar396-home-head{display:flex;justify-content:space-between;align-items:center;gap:12px;background:linear-gradient(145deg,#061e35,#0b3552);color:#fff;border-radius:24px;padding:18px;margin-bottom:10px}.ar396-home-head small{color:#9fb4ca;font-weight:800}.ar396-home-head h2{margin:5px 0 0;color:#f4c752;font-size:21px}.ar396-search-btn{border:1px solid rgba(244,199,82,.35);background:rgba(244,199,82,.12);color:#f4c752;border-radius:14px;padding:10px 12px;font-weight:950;white-space:nowrap}.ar396-save-state{display:flex;align-items:center;gap:8px;padding:9px 12px;background:#ecfdf3;color:#166534;border:1px solid #bbf7d0;border-radius:14px;margin-bottom:8px;font-size:12px;font-weight:900}.ar396-save-state i{width:9px;height:9px;border-radius:50%;background:#16a34a}.ar396-save-state.error{background:#fff1f2;color:#b42318;border-color:#fecdd3}.ar396-save-state.error i{background:#dc2626}.ar396-alert{width:100%;display:flex;justify-content:space-between;align-items:center;gap:10px;text-align:right;border-radius:16px;padding:11px 13px;margin-bottom:10px}.ar396-alert.ok{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534}.ar396-alert.warn{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412}.ar396-alert b,.ar396-alert span{display:block}.ar396-alert span{font-size:11px}.ar396-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.ar396-kpis button{border:1px solid #e1e7ef;background:#fff;border-radius:18px;padding:14px;text-align:right;box-shadow:0 7px 18px rgba(16,34,56,.06)}.ar396-kpis span{display:block;color:#64748b;font-size:11px;font-weight:900}.ar396-kpis b{display:block;color:#0f2740;font-size:15px;margin-top:7px}.ar396-finance-focus,.ar396-card{background:#fff;border:1px solid #e1e7ef;border-radius:22px;padding:15px;margin-top:11px;box-shadow:0 8px 20px rgba(16,34,56,.05)}.ar396-section-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.ar396-section-head h3{margin:0;color:#0f2740}.ar396-section-head small{color:#64748b}.ar396-check-grid,.ar396-counts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.ar396-check-grid>div,.ar396-counts>div{background:#f8fafc;border:1px solid #e2e8f0;border-radius:15px;padding:11px}.ar396-check-grid .danger{background:#fff1f2;border-color:#fecdd3}.ar396-check-grid span,.ar396-counts span{display:block;color:#64748b;font-size:11px;font-weight:850}.ar396-check-grid b,.ar396-counts b{display:block;margin-top:5px;font-size:16px;color:#0f2740}.ar396-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.ar396-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ar396-rank{width:100%;display:grid;grid-template-columns:26px minmax(0,1fr) auto;gap:8px;align-items:center;border:0;border-top:1px solid #eef2f6;background:#fff;padding:10px 2px;text-align:right}.ar396-rank span{width:24px;height:24px;border-radius:9px;background:#f1f5f9;display:flex;align-items:center;justify-content:center}.ar396-rank b{overflow:hidden;text-overflow:ellipsis}.ar396-rank em{font-style:normal;color:#9a6700;font-size:11px;font-weight:950}.ar396-tools{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}.ar396-tools button{border:1px solid #e1e7ef;background:#fff;border-radius:16px;min-height:70px;padding:9px 5px;color:#0f2740;font-weight:900}.ar396-tools b{display:block;font-size:20px}.ar396-tools span{display:block;font-size:10px;margin-top:5px}.ar396-page{padding-bottom:110px}.ar396-hero{background:linear-gradient(145deg,#061e35,#0b3552);color:#fff;border-radius:24px;padding:18px;margin:8px 0 14px}.ar396-hero h2{margin:0;color:#f4c752}.ar396-hero p{margin:7px 0 0;color:#dbe7f4;line-height:1.9}.ar396-search-input{height:54px;font-size:16px}.ar396-result{width:100%;display:grid;grid-template-columns:60px minmax(0,1fr);gap:4px 10px;text-align:right;border:1px solid #e2e8f0;border-radius:16px;background:#fff;padding:12px;margin:8px 0}.ar396-result span{grid-row:1/3;background:#eef6ff;color:#164a82;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:950}.ar396-result b{color:#0f2740}.ar396-result small{color:#64748b}.ar396-empty{padding:18px;text-align:center;color:#64748b;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:16px}.ar396-health-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.ar396-health{padding:13px;border-radius:16px}.ar396-health.ok{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534}.ar396-health.warn{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412}.ar396-health b,.ar396-health span{display:block}.ar396-health span{font-size:11px;margin-top:5px}.ar396-audit-row{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:12px;margin:8px 0}.ar396-audit-row span{float:left;background:#f1f5f9;border-radius:999px;padding:4px 7px;font-size:9px}.ar396-audit-row b,.ar396-audit-row small{display:block}.ar396-audit-row small{color:#64748b;line-height:1.8;margin-top:5px}.ar396-undo{position:fixed;z-index:12000;right:14px;left:14px;bottom:92px;background:#061e35;color:#fff;border:1px solid #d79b22;border-radius:16px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;box-shadow:0 18px 42px rgba(0,0,0,.25);direction:rtl}.ar396-undo button{border:0;background:#f4c752;color:#061e35;border-radius:10px;padding:8px 12px;font-weight:1000}.ar396-periods{display:flex;gap:6px;overflow:auto;margin:10px 0}.ar396-periods button{white-space:nowrap;border:1px solid #dbe3ec;background:#fff;border-radius:999px;padding:7px 11px;font-weight:900}.ar396-periods button.active{background:#0b3552;color:#fff;border-color:#0b3552}.ar396-table-wrap{overflow:auto;margin-top:12px}.ar396-table{width:100%;border-collapse:collapse;min-width:620px}.ar396-table th,.ar396-table td{border-bottom:1px solid #e2e8f0;padding:10px;text-align:right;font-size:12px}.ar396-table th{background:#f8fafc}.ar396-table .debt{color:#b42318}.ar396-table .credit{color:#15803d}.ar396-file-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.ar396-file-grid article{border:1px solid #e2e8f0;border-radius:15px;overflow:hidden;background:#fff}.ar396-file-grid img{width:100%;height:130px;object-fit:cover}.ar396-file-grid article>div{padding:9px}.ar396-file-grid b,.ar396-file-grid small{display:block}.ar396-file-grid small{color:#64748b;margin:3px 0 7px}.ar396-native-unlock{width:100%;margin-top:9px;min-height:44px;border:1px solid #93c5fd;border-radius:13px;background:#eff6ff;color:#1d4ed8;font-weight:1000}
.ar396-compact-finance{background:#fff;border:1px solid #dfe6ee;border-radius:22px;padding:13px;margin:0 0 10px;box-shadow:0 8px 20px rgba(15,39,64,.05)}.ar396-compact-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.ar396-compact-head h3{margin:0;color:#0f2740;font-size:17px}.ar396-compact-head small{display:block;color:#64748b;font-size:10.5px;margin-top:3px}.ar396-icon-search{width:44px;height:44px;border-radius:14px;border:1px solid #d79b22;background:#082d49;color:#f4c752;font-size:24px;font-weight:950}.ar396-compact-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.ar396-compact-grid button{border:1px solid #e2e8f0;border-radius:15px;background:#f8fafc;padding:9px 10px;text-align:right;min-height:64px}.ar396-compact-grid button.danger{background:#fff5f5;border-color:#fecaca}.ar396-compact-grid span{display:block;color:#64748b;font-size:10.5px;font-weight:850}.ar396-compact-grid b{display:block;color:#0f2740;font-size:14px;margin-top:4px;line-height:1.6}.ar396-compact-grid .danger b{color:#b42318}.ar396-compact-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}.ar396-compact-finance>.btn{width:100%;margin-top:8px}.ar396-report-tools{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:13px;margin:10px 0}.ar396-report-tools h3{margin:0;color:#0f2740}.ar396-report-tools small{color:#64748b;line-height:1.8}.ar396-report-tool-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.ar396-report-tool-grid button{border:1px solid #dbe3ec;background:#f8fafc;border-radius:14px;min-height:58px;color:#0f2740;font-size:20px;font-weight:950}.ar396-report-tool-grid span{display:block;font-size:10px;margin-top:3px}.ar396-reserve-hero{background:linear-gradient(145deg,#061e35,#0b3552);border-radius:22px;padding:16px;color:#fff;margin:8px 0 12px}.ar396-reserve-hero h2{margin:0;color:#f4c752}.ar396-reserve-hero p{margin:6px 0 0;color:#dbeafe;line-height:1.9;font-size:12px}.ar396-reserve-launch{display:grid;grid-template-columns:1.15fr 1fr 1fr;gap:8px;margin-bottom:10px}.ar396-reserve-card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:12px;margin:8px 0}.ar396-reserve-card b,.ar396-reserve-card span,.ar396-reserve-card small{display:block}.ar396-reserve-card b{color:#0f2740;font-size:15px}.ar396-reserve-card span{font-weight:900;margin-top:4px}.ar396-reserve-card small{color:#64748b;margin-top:5px;line-height:1.8}.ar396-reserve-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
@media(max-width:520px){.ar396-two{grid-template-columns:1fr}.ar396-tools{grid-template-columns:repeat(2,1fr)}.ar396-health-grid{grid-template-columns:1fr}.ar396-file-grid{grid-template-columns:1fr 1fr}}
@media(max-width:370px){.ar396-kpis,.ar396-check-grid,.ar396-counts{grid-template-columns:1fr}.ar396-actions{grid-template-columns:1fr}.ar396-reserve-launch{grid-template-columns:1fr}.ar396-compact-grid{grid-template-columns:1fr}}
@media print{.bottom-nav,.ar396-tools,.ar396-undo,.back-row,.ar396-periods,.ar396-search-btn{display:none!important}.ar396-page{padding:0!important}.ar396-table{min-width:0}}
`;document.head.appendChild(s)}

function handleAction(el,a){
  if(a==='search'){state.tab='globalSearch';renderApp();return true}
  if(a==='health'){state.tab='dataHealth';renderApp();return true}
  if(a==='audit'){state.tab='auditHistory';renderApp();return true}
  if(a==='financeFocus'){state.tab='finance';state.v331FinanceFilter='all';renderApp();return true}
  if(a==='enableNotifications'){try{var nb=bridge();if(nb&&typeof nb.requestFinancialNotificationPermission==='function')nb.requestFinancialNotificationPermission()}catch(_){}showToast('در صورت نمایش درخواست اندروید، اجازه اعلان را فعال کن');return true}
  if(a==='home'){state.tab='home';renderApp();return true}
  if(a==='undo'){restoreUndo();return true}
  if(a==='clearAudit'){if(confirm('تاریخچه تغییرات پاک شود؟')){data.auditLog=[];saveData();renderApp()}return true}
  if(a==='statementPeriod'){state.ar396StatementPeriod=el.dataset.period||'all';renderApp();return true}
  if(a==='printStatement'){window.print();return true}
  if(a==='chooseFile'){var inp=document.getElementById('ar396CustomerFile');if(inp)inp.click();return true}
  if(a==='deleteFile'){var cid=el.dataset.customerId,id=el.dataset.id,arr=attachments(cid).filter(function(x){return String(x.id)!==String(id)});saveAttachments(cid,arr);addAudit('delete','حذف فایل مشتری','یک عکس از پرونده حذف شد',cid);renderApp();return true}
  return false;
}

window.AlanRangProduct={version:VERSION,schemaVersion:SCHEMA_VERSION,ensureModel:ensureModel,compactHomeFinanceHtml:compactHomeFinanceHtml,reportToolsHtml:reportToolsHtml,reservationPageHtml:reservationPageHtml,searchHtml:searchHtml,healthHtml:healthHtml,auditHtml:auditHtml,customerStatementHtml:customerStatementHtml,customerFilesHtml:customerFilesHtml,addAudit:addAudit,setSaveState:setSaveState};

installStyle();ensureModel();lastFingerprint=coreFingerprint();
try{registerAlanRangRoute('v3962-reservations',function(){if(!(state&&state.tab==='executions'))return false;app.innerHTML=baseLayout(reservationPageHtml());return true})}catch(_){}
try{registerAlanRangRoute('v396-global-search',function(){if(!(state&&state.tab==='globalSearch'))return false;app.innerHTML=baseLayout(searchHtml());return true})}catch(_){}
try{registerAlanRangRoute('v396-data-health',function(){if(!(state&&state.tab==='dataHealth'))return false;app.innerHTML=baseLayout(healthHtml());return true})}catch(_){}
try{registerAlanRangRoute('v396-audit-history',function(){if(!(state&&state.tab==='auditHistory'))return false;app.innerHTML=baseLayout(auditHtml());return true})}catch(_){}
try{registerAlanRangAfterSave('v396-save-status',function(result){setSaveState(result!==false);ensureModel();syncScheduledCheckReminders()})}catch(_){}
try{registerAlanRangAfterRender('v396-after-render',function(){ensureSaveIndicator();setSaveState(true);ensureModel();syncScheduledCheckReminders()})}catch(_){}

document.addEventListener('click',function(e){var x=e.target&&e.target.closest?e.target.closest('[data-ar396]'):null;if(x){var a=x.dataset.ar396||'';if(handleAction(x,a)){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();return}}var b=e.target&&e.target.closest?e.target.closest('[data-action]'):null;if(b)beginAction(b,b.dataset.action||'')},true);
document.addEventListener('input',function(e){if(e.target&&e.target.id==='ar396GlobalSearch'){state.ar396Search=e.target.value||'';var p=e.target.selectionStart;renderApp();setTimeout(function(){var x=document.getElementById('ar396GlobalSearch');if(x){x.focus();try{x.setSelectionRange(p,p)}catch(_){}}},0)}},true);
document.addEventListener('change',function(e){var inp=e.target;if(!inp||inp.id!=='ar396CustomerFile'||!inp.files||!inp.files[0])return;var cid=inp.dataset.customerId||state.selectedCustomerId,file=inp.files[0];if(file.size>15*1024*1024){showToast('حجم عکس زیاد است');return}compressImage(file,function(url){var arr=attachments(cid);arr.unshift({id:'file_'+Date.now()+'_'+Math.random().toString(16).slice(2),name:file.name||'عکس مشتری',dataUrl:url,createdAt:nowIso()});if(arr.length>20)arr.length=20;try{saveAttachments(cid,arr);addAudit('file','افزودن فایل مشتری',file.name||'عکس',cid);renderApp();showToast('عکس به پرونده مشتری اضافه شد')}catch(err){console.error(err);showToast('ذخیره عکس انجام نشد')}})},true);

setTimeout(function(){notifyChecks();syncScheduledCheckReminders();try{if(typeof renderApp==='function')renderApp()}catch(e){console.error('AlanRang v39.6.3 init',e)}},120);
})();
