(function(){
'use strict';
if(window.__ALANRANG_CHECK_OPS_V39120_STAGE4__)return;
window.__ALANRANG_CHECK_OPS_V39120_STAGE4__=true;

var VERSION='39.19.0-checks-stage4-overdue-status-fix1-v01';
var ENGINE_NAME='AlanRangChecksV39120';
var UI_NAME='AlanRangChecksUIV39120';
var STATUS_NAME='AlanRangChecksStatusV39120';
var refreshWrapped=false,decorateTimer=null;

function engine(){return window[ENGINE_NAME]||null}
function ui(){return window[UI_NAME]||null}
function statusApi(){return window[STATUS_NAME]||null}
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
function toast(v){try{if(typeof showToast==='function'){showToast(v);return}}catch(_){}try{alert(v)}catch(_){} }
function norm(v){return txt(v).toLowerCase().replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\s\u200c\u200e\u200f]+/g,' ').trim()}
function parseDate(value){
  try{if(typeof parseJalaliDate==='function'){var p=parseJalaliDate(value||'');if(p&&p.jy&&p.jm&&p.jd)return {jy:+p.jy,jm:+p.jm,jd:+p.jd}}}catch(_){}
  var s=txt(value).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)});
  var m=s.match(/((?:13|14)\d{2})\D+(\d{1,2})\D+(\d{1,2})/);
  return m?{jy:+m[1],jm:+m[2],jd:+m[3]}:null;
}
function dayNo(p){
  if(!p)return null;
  try{if(typeof j2d==='function')return j2d(p.jy,p.jm,p.jd)}catch(_){}
  return p.jy*372+p.jm*31+p.jd;
}
function todayParts(){try{if(typeof todayJalali==='function')return todayJalali()}catch(_){}return null}
function dueDiff(row,today){var a=dayNo(parseDate(row&&row.dueDate)),b=dayNo(today||todayParts());return a==null||b==null?null:a-b}
function activeForDue(row){return !!row&&row.status==='in_flow'}
function dueBucket(row,today){
  if(!row)return 'unknown';
  if(row.status==='returned')return 'returned';
  if(row.status==='cancelled')return 'cancelled';
  if(row.status==='cleared')return 'cleared';
  if(!activeForDue(row))return row.status||'unknown';
  var d=dueDiff(row,today);
  if(d==null)return 'missing';
  if(d<0)return 'overdue';
  if(d===0)return 'today';
  if(d===1)return 'tomorrow';
  if(d<=3)return 'due3';
  if(d<=7)return 'due7';
  return 'future';
}
function statusTitle(status,direction){
  var e=engine();try{if(e&&typeof e.statusLabel==='function')return e.statusLabel(status,direction)}catch(_){}
  if(status==='spent')return 'خرج‌شده';if(status==='cleared')return direction==='payable'?'پاس‌شده':'وصول‌شده';if(status==='returned')return 'برگشتی';if(status==='cancelled')return 'لغوشده';return 'در جریان';
}
function repairableAuditIssue(issue){
  var t=txt(issue&&issue.type);
  return t==='statusDrift'||t==='statusDriftGuard';
}
function directionTitle(direction){return direction==='payable'?'پرداختی':'دریافتی'}
function addAgg(target,row){
  target.count++;target.amount+=Math.abs(num2(row&&row.amount));
  if(row&&row.direction==='payable'){target.payableCount++;target.payableAmount+=Math.abs(num2(row.amount))}else{target.receivedCount++;target.receivedAmount+=Math.abs(num2(row&&row.amount))}
  return target;
}
function emptyAgg(){return {count:0,amount:0,receivedCount:0,receivedAmount:0,payableCount:0,payableAmount:0}}
function summarizeRows(rows,today){
  rows=Array.isArray(rows)?rows:[];
  var out={total:emptyAgg(),active:emptyAgg(),inFlow:emptyAgg(),spent:emptyAgg(),cleared:emptyAgg(),returned:emptyAgg(),cancelled:emptyAgg(),overdue:emptyAgg(),today:emptyAgg(),tomorrow:emptyAgg(),due3:emptyAgg(),due7:emptyAgg(),missing:emptyAgg()};
  rows.forEach(function(row){
    addAgg(out.total,row);
    if(row.status==='in_flow')addAgg(out.inFlow,row);else if(row.status==='spent')addAgg(out.spent,row);else if(row.status==='cleared')addAgg(out.cleared,row);else if(row.status==='returned')addAgg(out.returned,row);else if(row.status==='cancelled')addAgg(out.cancelled,row);
    if(activeForDue(row))addAgg(out.active,row);
    if(activeForDue(row)){var b=dueBucket(row,today);if(out[b])addAgg(out[b],row)}
  });
  return out;
}
function rowMatches(row,options,today){
  options=options||{};
  if(options.direction&&options.direction!=='all'&&row.direction!==options.direction)return false;
  if(options.status&&options.status!=='all'&&row.status!==options.status)return false;
  if(options.bucket&&options.bucket!=='all'&&dueBucket(row,today)!==options.bucket)return false;
  if(options.customerId&&txt(row.customerId)!==txt(options.customerId))return false;
  if(options.invoiceId&&txt(row.invoiceId)!==txt(options.invoiceId))return false;
  var amount=Math.abs(num2(row.amount));if(options.minAmount!=null&&txt(options.minAmount)!==''&&amount<num2(options.minAmount))return false;if(options.maxAmount!=null&&txt(options.maxAmount)!==''&&amount>num2(options.maxAmount))return false;
  var from=dayNo(parseDate(options.from)),to=dayNo(parseDate(options.to)),due=dayNo(parseDate(row.dueDate));
  if(from!=null&&(due==null||due<from))return false;if(to!=null&&(due==null||due>to))return false;
  var q=norm(options.query);if(q){var hay=norm([row.customerName,row.ownerName,row.bankName,row.checkNumber,row.invoiceNumber,row.notes,row.spentTo,row.amount,row.dueDate,row.statusLabel,directionTitle(row.direction)].join(' '));if(hay.indexOf(q)<0)return false}
  return true;
}
function buildReport(options){
  options=options||{};var e=engine(),today=options.today||todayParts();
  var all=e&&typeof e.buildAll==='function'?e.buildAll().slice():[];
  var rows=all.filter(function(row){return rowMatches(row,options,today)});
  rows.sort(function(a,b){var ad=dueDiff(a,today),bd=dueDiff(b,today);ad=ad==null?999999:ad;bd=bd==null?999999:bd;return ad-bd||(a.dueDateSerial||99999999)-(b.dueDateSerial||99999999)||(b.sortStamp||0)-(a.sortStamp||0)});
  var audit={clean:true,errors:[],warnings:[]};try{if(e&&typeof e.audit==='function')audit=e.audit()}catch(err){audit={clean:false,errors:[{type:'reportAuditFailure'}],warnings:[]}}
  var summary=summarizeRows(rows,today),allSummary=summarizeRows(all,today);
  return {version:VERSION,generatedAt:new Date().toISOString(),today:today,options:options,rows:rows,all:all,summary:summary,allSummary:allSummary,audit:audit};
}
function operationalAlerts(options){
  options=options||{};var report=buildReport({today:options.today}),rows=report.all,today=report.today,audit=report.audit||{},alerts=[];
  function bucket(id,severity,title,items,message){items=items||[];var agg=summarizeRows(items,today).total;if(!items.length)return;alerts.push({id:id,severity:severity,title:title,count:items.length,amount:agg.amount,rows:items,message:message||''})}
  var relatedIds={};(audit.errors||[]).forEach(function(x){if(x&&x.id)relatedIds[txt(x.id)]=1;if(x&&Array.isArray(x.ids))x.ids.forEach(function(id){relatedIds[txt(id)]=1})});
  var integrityRows=rows.filter(function(r){return relatedIds[txt(r.id)]});
  if((audit.errors||[]).length)alerts.push({id:'integrity',severity:'critical',title:'نیاز به بررسی یکپارچگی',count:(audit.errors||[]).length,amount:summarizeRows(integrityRows,today).total.amount,rows:integrityRows,message:'تا رفع خطاهای مرتبط، عملیات حساس همان چک‌ها به‌صورت ایمن متوقف می‌شود.'});
  bucket('returned','critical','چک‌های برگشتی',rows.filter(function(r){return r.status==='returned'}),'این چک‌ها نیاز به پیگیری عملیاتی دارند.');
  bucket('overdue','danger','چک‌های عقب‌افتاده',rows.filter(function(r){return activeForDue(r)&&dueBucket(r,today)==='overdue'}),'سررسید گذشته و هنوز وضعیت نهایی ثبت نشده است.');
  bucket('today','warning','سررسید امروز',rows.filter(function(r){return activeForDue(r)&&dueBucket(r,today)==='today'}),'امروز نیاز به پیگیری دارد.');
  bucket('due7','info','سررسید ۷ روز آینده',rows.filter(function(r){var b=dueBucket(r,today);return activeForDue(r)&&['tomorrow','due3','due7'].indexOf(b)>-1}),'برای پیگیری هفتگی آماده شود.');
  bucket('spent','info','چک‌های خرج‌شده',rows.filter(function(r){return r.status==='spent'}),'این چک‌ها وضعیت «خرج شد» دارند و در سررسید/عقب‌افتاده محاسبه نمی‌شوند.');
  bucket('missing','warning','سررسید نامعتبر یا خالی',rows.filter(function(r){return activeForDue(r)&&dueBucket(r,today)==='missing'}),'برای هشدار دقیق، تاریخ سررسید باید معتبر باشد.');
  var rank={critical:0,danger:1,warning:2,info:3};alerts.sort(function(a,b){return rank[a.severity]-rank[b.severity]||b.count-a.count||b.amount-a.amount});
  return {version:VERSION,alerts:alerts,audit:audit,summary:report.allSummary,today:today};
}
function guardRecord(recordOrId){
  var e=engine(),s=statusApi(),id=typeof recordOrId==='string'?recordOrId:txt(recordOrId&&recordOrId.id),record=(e&&typeof e.buildAll==='function'?e.buildAll():[]).find(function(r){return txt(r.id)===txt(id)});
  if(!record)return {ok:false,record:null,errors:[{type:'recordMissing'}],warnings:[]};
  var audit=e&&typeof e.audit==='function'?e.audit():{errors:[],warnings:[]},errors=[],warnings=[];
  (audit.errors||[]).forEach(function(x){if(txt(x.id)===txt(record.id)||(Array.isArray(x.ids)&&x.ids.some(function(v){return txt(v)===txt(record.id)}))||(x.type==='customerAccountCheckMismatch'&&record.customerId&&txt(x.customerId)===txt(record.customerId)))errors.push(x)});
  (audit.warnings||[]).forEach(function(x){if(txt(x.id)===txt(record.id))warnings.push(x)});
  if(s&&typeof s.preflight==='function'){
    var targets=['in_flow','spent','cleared','returned','cancelled'],hasSafeTarget=false;
    targets.forEach(function(target){if(target==='spent'&&record.direction!=='received')return;var pf=s.preflight(record.id,target,{allowCorrection:true});if(pf&&pf.ok&&!pf.plan.noOp)hasSafeTarget=true});
    if(!hasSafeTarget&&errors.filter(function(x){return !repairableAuditIssue(x)}).length===0&&warnings.some(function(x){return x.type==='statusDrift'}))warnings.push({type:'statusDriftGuard'});
  }
  var blockingErrors=errors.filter(function(x){return !repairableAuditIssue(x)});
  return {ok:blockingErrors.length===0,record:record,errors:blockingErrors,warnings:warnings};
}
function reportText(report){
  report=report||buildReport({});var s=report.summary||{},lines=[];
  lines.push('گزارش چک‌های آلان‌رنگ');
  if(report.today)lines.push('تاریخ گزارش: '+[report.today.jy,report.today.jm,report.today.jd].join('/'));
  lines.push('تعداد رکوردها: '+s.total.count+' | مبلغ کل: '+cash(s.total.amount));
  lines.push('دریافتی: '+s.total.receivedCount+' | '+cash(s.total.receivedAmount));
  lines.push('پرداختی: '+s.total.payableCount+' | '+cash(s.total.payableAmount));
  lines.push('فعال: '+s.active.count+' | '+cash(s.active.amount));
  lines.push('عقب‌افتاده: '+s.overdue.count+' | '+cash(s.overdue.amount));
  lines.push('سررسید امروز: '+s.today.count+' | '+cash(s.today.amount));
  lines.push('برگشتی: '+s.returned.count+' | '+cash(s.returned.amount));
  lines.push('');
  report.rows.forEach(function(r,i){lines.push((i+1)+'. '+directionTitle(r.direction)+' | '+txt(r.customerName||r.ownerName||'بدون مشتری')+' | '+cash(r.amount)+' | '+txt(r.dueDate||'بدون سررسید')+' | '+statusTitle(r.status,r.direction)+' | '+txt(r.bankName||'')+(r.checkNumber?' | '+r.checkNumber:''))});
  return lines.join('\n');
}
function copyText(value){
  var v=txt(value);if(!v)return Promise.resolve(false);
  try{if(navigator&&navigator.clipboard&&typeof navigator.clipboard.writeText==='function')return navigator.clipboard.writeText(v).then(function(){return true}).catch(function(){return fallbackCopy(v)})}catch(_){}
  return Promise.resolve(fallbackCopy(v));
}
function fallbackCopy(value){try{if(typeof copyTextToClipboard==='function'){copyTextToClipboard(value);return true}}catch(_){}try{var t=document.createElement('textarea');t.value=value;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();var ok=document.execCommand&&document.execCommand('copy');t.remove();return !!ok}catch(_){return false}}
function reportRowsHtml(rows,today){
  if(!rows.length)return '<div class="v39120-stage4-empty">برای این گزارش رکوردی وجود ندارد.</div>';
  return rows.slice(0,120).map(function(r){var d=dueDiff(r,today),due=d==null?'بدون تاریخ':d<0?fa(Math.abs(d))+' روز گذشته':d===0?'امروز':fa(d)+' روز مانده';return '<div class="v39120-stage4-report-row"><div><b>'+esc(r.customerName||r.ownerName||'بدون مشتری')+'</b><small>'+esc(directionTitle(r.direction))+' — '+esc(r.bankName||'بانک ثبت نشده')+(r.checkNumber?' — '+esc(r.checkNumber):'')+'</small></div><div><b>'+esc(cash(r.amount))+'</b><small>'+esc(r.dueDate||'—')+' — '+esc(due)+'</small></div><span class="v39120-stage4-state">'+esc(statusTitle(r.status,r.direction))+'</span></div>'}).join('')+(rows.length>120?'<div class="v39120-stage4-limit">'+fa(rows.length-120)+' رکورد دیگر در محاسبات گزارش لحاظ شده‌اند اما برای سبک ماندن صفحه نمایش داده نشده‌اند.</div>':'');
}
function closeModal(){try{var x=document.querySelector('.v39120-stage4-back');if(x)x.remove()}catch(_){} }
function reportModal(mode){
  closeModal();var alerts=operationalAlerts({}),report=buildReport({}),s=report.summary;
  var alertHtml=alerts.alerts.length?alerts.alerts.map(function(a){return '<button type="button" class="v39120-stage4-alert '+attr(a.severity)+'" data-v39120-stage4-action="alert-filter" data-alert="'+attr(a.id)+'"><b>'+esc(a.title)+'</b><span>'+fa(a.count)+' مورد — '+esc(cash(a.amount))+'</span></button>'}).join(''):'<div class="v39120-stage4-empty good">هشدار عملیاتی فعالی ثبت نشده است.</div>';
  var html='<div class="v39120-stage4-back"><div class="v39120-stage4-modal"><div class="v39120-stage4-title"><div><h3>'+(mode==='alerts'?'هشدارهای چک‌ها':'گزارش عملیاتی چک‌ها')+'</h3><p>گزارش فقط از دفتر یکپارچه چک‌ها ساخته می‌شود و هیچ داده مالی را تغییر نمی‌دهد.</p></div><button type="button" data-v39120-stage4-action="close">×</button></div>'+
    '<div class="v39120-stage4-modal-stats"><div><span>کل</span><b>'+fa(s.total.count)+'</b><small>'+esc(cash(s.total.amount))+'</small></div><div><span>فعال</span><b>'+fa(s.active.count)+'</b><small>'+esc(cash(s.active.amount))+'</small></div><div class="danger"><span>عقب‌افتاده</span><b>'+fa(s.overdue.count)+'</b><small>'+esc(cash(s.overdue.amount))+'</small></div><div class="bad"><span>برگشتی</span><b>'+fa(s.returned.count)+'</b><small>'+esc(cash(s.returned.amount))+'</small></div></div>'+
    '<div class="v39120-stage4-alerts">'+alertHtml+'</div>'+
    (mode==='alerts'?'':'<div class="v39120-stage4-report-head"><b>ریز چک‌ها</b><button type="button" class="btn ghost small" data-v39120-stage4-action="copy-report">کپی گزارش</button></div><div class="v39120-stage4-report-list">'+reportRowsHtml(report.rows,report.today)+'</div>')+
    '<div class="v39120-stage4-safe-note">خروجی فایل در بخش گزارش‌های حرفه‌ای ارائه می‌شود و در این صفحه فقط گزارش داخلی و قابل کپی نمایش داده می‌شود.</div></div></div>';
  try{document.body.insertAdjacentHTML('beforeend',html)}catch(_){}
}
function setLedgerFilter(alertId){
  try{
    if(typeof state==='undefined'||!state)return false;
    state.v39120CheckUi=state.v39120CheckUi||{filter:'all',direction:'all',query:''};
    var map={returned:'returned',overdue:'overdue',today:'due7',due7:'due7',spent:'spent',missing:'all',integrity:'all'};
    state.v39120CheckUi.filter=map[alertId]||'all';state.v39120CheckUi.query='';
    var u=ui();if(u&&typeof u.refresh==='function')u.refresh();return true;
  }catch(_){return false}
}
function installStyle(){
  if(typeof document==='undefined'||document.getElementById('v39120-check-stage4-style'))return;
  var s=document.createElement('style');s.id='v39120-check-stage4-style';s.textContent=
  '.v39120-stage4-ops{margin:10px 0 12px;border:1px solid #dbe3ec;border-radius:16px;background:#fff;padding:10px}.v39120-stage4-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}.v39120-stage4-toolbar strong{color:#0f2740;font-size:13px}.v39120-stage4-toolbar-actions{display:flex;gap:6px;flex-wrap:wrap}.v39120-stage4-mini{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:9px}.v39120-stage4-mini>div{border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;padding:7px 8px}.v39120-stage4-mini span,.v39120-stage4-mini small{display:block;color:#64748b;font-size:9px;font-weight:850}.v39120-stage4-mini b{display:block;margin:3px 0;color:#0f2740;font-size:12px}.v39120-stage4-mini .danger b{color:#be123c}.v39120-stage4-mini .warn b{color:#b45309}.v39120-stage4-blocked{opacity:.58!important;cursor:not-allowed!important}.v39120-stage4-card-alert{margin-top:7px;border-radius:10px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;padding:6px 8px;font-size:9px;font-weight:900}'+
  '.v39120-stage4-back{position:fixed;inset:0;z-index:100500;background:rgba(2,6,23,.7);display:flex;align-items:flex-end;justify-content:center;padding:10px;direction:rtl}.v39120-stage4-modal{width:min(760px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:24px 24px 16px 16px;padding:15px;box-shadow:0 -18px 48px rgba(2,6,23,.4)}.v39120-stage4-title{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.v39120-stage4-title h3{margin:0;color:#061e35}.v39120-stage4-title p{margin:4px 0 0;color:#64748b;font-size:10px;font-weight:850;line-height:1.8}.v39120-stage4-title>button{width:36px;height:36px;border:0;border-radius:12px;background:#f1f5f9;color:#334155;font-size:22px}.v39120-stage4-modal-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:12px 0}.v39120-stage4-modal-stats>div{border-radius:13px;background:#071e34;color:#fff;padding:9px}.v39120-stage4-modal-stats span,.v39120-stage4-modal-stats small{display:block;color:#cbd5e1;font-size:9px;font-weight:850}.v39120-stage4-modal-stats b{display:block;color:#f4c752;font-size:15px;margin:4px 0}.v39120-stage4-modal-stats .danger b,.v39120-stage4-modal-stats .bad b{color:#fda4af}'+
  '.v39120-stage4-alerts{display:grid;gap:6px;margin:10px 0}.v39120-stage4-alert{width:100%;display:flex;justify-content:space-between;gap:8px;align-items:center;text-align:right;border:1px solid #dbe3ec;border-radius:12px;background:#f8fafc;padding:9px 10px;font-family:inherit}.v39120-stage4-alert b{color:#0f2740;font-size:11px}.v39120-stage4-alert span{color:#64748b;font-size:9px;font-weight:900}.v39120-stage4-alert.critical,.v39120-stage4-alert.danger{background:#fff1f2;border-color:#fecdd3}.v39120-stage4-alert.warning{background:#fffbeb;border-color:#fde68a}.v39120-stage4-alert.info{background:#eff6ff;border-color:#bfdbfe}.v39120-stage4-report-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:12px 0 7px}.v39120-stage4-report-list{display:grid;gap:6px}.v39120-stage4-report-row{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr) auto;gap:8px;align-items:center;border:1px solid #e2e8f0;border-radius:12px;padding:8px;background:#fff}.v39120-stage4-report-row b,.v39120-stage4-report-row small{display:block}.v39120-stage4-report-row b{font-size:10px;color:#0f2740}.v39120-stage4-report-row small{font-size:9px;color:#64748b;margin-top:3px;font-weight:800}.v39120-stage4-state{font-size:9px;font-weight:1000;border-radius:999px;background:#e2e8f0;color:#334155;padding:5px 7px;white-space:nowrap}.v39120-stage4-empty{text-align:center;color:#64748b;border:1px dashed #cbd5e1;border-radius:12px;padding:12px;font-size:10px;font-weight:900}.v39120-stage4-empty.good{color:#166534;background:#ecfdf5;border-color:#bbf7d0}.v39120-stage4-limit,.v39120-stage4-safe-note{margin-top:8px;border-radius:10px;background:#f8fafc;border:1px dashed #cbd5e1;color:#64748b;padding:7px 8px;font-size:9px;font-weight:850;line-height:1.8}'+
  '@media(max-width:720px){.v39120-stage4-mini,.v39120-stage4-modal-stats{grid-template-columns:repeat(2,1fr)}.v39120-stage4-report-row{grid-template-columns:1fr auto}.v39120-stage4-report-row>div:nth-child(2){grid-column:1/2}.v39120-stage4-state{grid-column:2;grid-row:1/3}}';
  (document.head||document.documentElement).appendChild(s);
}
function dashboardHtml(){
  var a=operationalAlerts({}),s=a.summary||{},critical=(a.audit&&a.audit.errors||[]).length;
  return '<div class="v39120-stage4-ops"><div class="v39120-stage4-toolbar"><strong>پیگیری و گزارش چک‌ها</strong><div class="v39120-stage4-toolbar-actions"><button type="button" class="btn ghost small" data-v39120-stage4-action="alerts">هشدارها'+(a.alerts.length?' ('+fa(a.alerts.length)+')':'')+'</button><button type="button" class="btn blue small" data-v39120-stage4-action="report">گزارش چک‌ها</button></div></div><div class="v39120-stage4-mini"><div class="danger"><span>عقب‌افتاده</span><b>'+fa(s.overdue.count)+'</b><small>'+esc(cash(s.overdue.amount))+'</small></div><div class="warn"><span>سررسید امروز</span><b>'+fa(s.today.count)+'</b><small>'+esc(cash(s.today.amount))+'</small></div><div class="danger"><span>برگشتی</span><b>'+fa(s.returned.count)+'</b><small>'+esc(cash(s.returned.amount))+'</small></div><div class="'+(critical?'danger':'')+'"><span>خطای یکپارچگی</span><b>'+fa(critical)+'</b><small>'+(critical?'عملیات مرتبط مسدود است':'کنترل سالم')+'</small></div></div></div>';
}
function decoratePanel(){
  if(typeof document==='undefined')return;installStyle();wrapRefresh();
  var panel=document.querySelector('.v39120-canonical-ledger');if(!panel)return;
  var old=panel.querySelector('.v39120-stage4-ops');if(old)old.remove();
  var head=panel.querySelector('.v39120-head'),node=document.createElement('div');node.innerHTML=dashboardHtml();var dash=node.firstChild;
  if(head&&head.parentNode)head.parentNode.insertBefore(dash,head.nextSibling);else panel.insertBefore(dash,panel.firstChild||null);
  try{
    var e=engine(),audit=e&&typeof e.audit==='function'?e.audit():{errors:[],warnings:[]},blocked={};
    var allRows=e&&typeof e.buildAll==='function'?e.buildAll():[];
    (audit.errors||[]).forEach(function(x){
      if(repairableAuditIssue(x))return;
      if(x&&x.id)blocked[txt(x.id)]=1;if(x&&Array.isArray(x.ids))x.ids.forEach(function(id){blocked[txt(id)]=1});
      if(x&&x.invoiceId)allRows.forEach(function(r){if(txt(r.invoiceId)===txt(x.invoiceId))blocked[txt(r.id)]=1});
    });
    panel.querySelectorAll('.v39120-card[data-canonical-id]').forEach(function(card){var id=txt(card.getAttribute('data-canonical-id'));if(!blocked[id])return;card.querySelectorAll('[data-v39120-stage3-action="status"],[data-v39120-stage3-action="quick"]').forEach(function(btn){btn.disabled=true;btn.classList.add('v39120-stage4-blocked');btn.title='ابتدا خطای سخت یکپارچگی این چک بررسی شود.'});if(!card.querySelector('.v39120-stage4-card-alert')){var note=document.createElement('div');note.className='v39120-stage4-card-alert';note.textContent='عملیات این چک به دلیل خطای سخت یکپارچگی متوقف است.';card.appendChild(note)}});
  }catch(_){}
  var note=panel.querySelector('.v39120-stage-note');if(note)note.textContent='هشدارها و گزارش عملیاتی از دفتر یکپارچه چک‌ها ساخته می‌شوند. تغییر وضعیت همچنان از مسیر امن و قابل بازگردانی انجام می‌شود؛ حذف مستقیم غیرفعال است.';
}
function scheduleDecorate(){try{if(decorateTimer)clearTimeout(decorateTimer)}catch(_){}try{decorateTimer=setTimeout(function(){decorateTimer=null;decoratePanel()},0)}catch(_){} }
function wrapRefresh(){
  if(refreshWrapped)return;var u=ui();if(!u||typeof u.refresh!=='function')return;var original=u.refresh;
  u.refresh=function(){var result=original.apply(this,arguments);scheduleDecorate();return result};u.__stage4OriginalRefresh=original;refreshWrapped=true;
}
function wire(){
  if(typeof document==='undefined')return;installStyle();wrapRefresh();
  try{if(typeof window.registerAlanRangAfterRender==='function')window.registerAlanRangAfterRender('v39120-check-ops-stage4',scheduleDecorate)}catch(_){}
  document.addEventListener('click',function(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-v39120-stage4-action]'):null;if(!b)return;var action=b.getAttribute('data-v39120-stage4-action');
    e.preventDefault();e.stopPropagation();
    if(action==='report'){reportModal('report');return}
    if(action==='alerts'){reportModal('alerts');return}
    if(action==='close'){closeModal();return}
    if(action==='alert-filter'){var id=b.getAttribute('data-alert')||'';closeModal();if(setLedgerFilter(id))toast('فیلتر دفتر چک‌ها روی هشدار انتخاب‌شده اعمال شد.');return}
    if(action==='copy-report'){copyText(reportText(buildReport({}))).then(function(ok){toast(ok?'گزارش چک‌ها کپی شد.':'کپی گزارش انجام نشد.')});return}
  },true);
  document.addEventListener('click',function(e){if(e.target&&e.target.classList&&e.target.classList.contains('v39120-stage4-back'))closeModal()},true);
  document.addEventListener('click',function(e){var x=e.target&&e.target.closest?e.target.closest('[data-v39120-filter],[data-v39120-direction],[data-v39120-stage3-action="apply"]'):null;if(x)scheduleDecorate()},true);
  try{if(document.readyState!=='loading')scheduleDecorate()}catch(_){}
}

window.AlanRangChecksOpsV39120={
  version:VERSION,
  dueDiff:dueDiff,
  dueBucket:dueBucket,
  summarizeRows:summarizeRows,
  buildReport:buildReport,
  alerts:operationalAlerts,
  guardRecord:guardRecord,
  reportText:reportText,
  refresh:decoratePanel
};
wire();
})();
