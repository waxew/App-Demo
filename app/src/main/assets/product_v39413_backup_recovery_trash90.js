(function(){
'use strict';
if(window.__ALANRANG_V39413_BACKUP_RECOVERY_TRASH90__)return;
window.__ALANRANG_V39413_BACKUP_RECOVERY_TRASH90__=true;
var VERSION='39.41.3-backup-recovery-trash90-fix3-v01';
var RETENTION_DAYS=90,DAY_MS=86400000,RETENTION_MS=RETENTION_DAYS*DAY_MS;
var persistingRetention=false;
function n(v){var x=Number(v);return isFinite(x)?x:0}
function esc(v){try{return typeof safe==='function'?safe(v):String(v==null?'':v)}catch(_){return String(v==null?'':v)}}
function attr(v){try{return typeof safeAttr==='function'?safeAttr(v):esc(v)}catch(_){return esc(v)}}
function fa(v){try{return typeof faDigits==='function'?faDigits(v):String(v)}catch(_){return String(v)}}
function rows(){try{if(!data||typeof data!=='object')return[];if(!Array.isArray(data.recycleBin))data.recycleBin=[];return data.recycleBin}catch(_){return[]}}
function deletedMs(row){var v=n(row&&row.deletedAtMs);if(v>0)return v;var p=Date.parse(String(row&&row.deletedAt||''));return isFinite(p)&&p>0?p:Date.now()}
function protectedUntil(row){var d=deletedMs(row),target=d+RETENTION_MS,current=n(row&&row.protectedUntilMs);return Math.max(target,current||0)}
function normalizeRetention(){var changed=0;rows().forEach(function(row){if(!row)return;var target=deletedMs(row)+RETENTION_MS;if(n(row.protectedUntilMs)<target){row.protectedUntilMs=target;changed++}});return changed}
function persistNormalized(){
  if(persistingRetention)return 0;
  var changed=normalizeRetention();if(!changed)return 0;
  try{persistingRetention=true;if(typeof saveData==='function')saveData()}catch(e){console.error('trash90 retention save',e)}finally{persistingRetention=false}
  return changed;
}
function putUnique(list,item){if(!item||!Array.isArray(list))return false;var id=String(item.id||''),at=list.findIndex(function(x){return x&&String(x.id||'')===id});if(at>-1)list[at]=JSON.parse(JSON.stringify(item));else list.push(JSON.parse(JSON.stringify(item)));return true}
function ensureSettings(){if(!data.settings||typeof data.settings!=='object')data.settings={};return data.settings}
function installApi(){
  var api=window.AlanRangTrash;if(!api||api.__v39413Trash90)return false;
  var baseRestore=typeof api.restore==='function'?api.restore.bind(api):null;
  api.retentionDays=RETENTION_DAYS;
  api.protectedUntil=function(entry){return protectedUntil(entry)};
  api.purgeEligible=function(){
    persistNormalized();var list=rows(),now=Date.now(),before=list.length;
    data.recycleBin=list.filter(function(x){return protectedUntil(x)>now});
    try{if(typeof saveData==='function')saveData()}catch(e){console.error('trash90 purge save',e)}
    return before-data.recycleBin.length;
  };
  api.restore=function(id){
    var entry=rows().find(function(x){return x&&String(x.id||'')===String(id||'')});if(!entry)return false;var p=entry.payload||{},handled=false;
    if(entry.type==='followup'){if(!Array.isArray(data.followups))data.followups=[];handled=putUnique(data.followups,p)}
    else if(entry.type==='purchaseInvoice'){var st=ensureSettings();if(!Array.isArray(st.v37PurchaseInvoices))st.v37PurchaseInvoices=[];handled=putUnique(st.v37PurchaseInvoices,p)}
    else if(entry.type==='inventoryOut'){var st2=ensureSettings();if(!Array.isArray(st2.v374InventoryOuts))st2.v374InventoryOuts=[];handled=putUnique(st2.v374InventoryOuts,p)}
    if(handled){data.recycleBin=rows().filter(function(x){return x&&String(x.id||'')!==String(id||'')});try{if(typeof saveData==='function')saveData()}catch(e){console.error('trash90 extended restore save',e);return false}return true}
    return baseRestore?!!baseRestore(id):false;
  };
  api.__v39413Trash90=true;return true;
}
function labelType(x){var t=String(x&&x.type||'');var map={customerBundle:'مشتری و سوابق مرتبط',invoiceBundle:'فاکتور و سوابق مرتبط',finance:'ثبت مالی / چک',reservation:'رزرو',work:'کار اجرایی',purchase:'خرید',purchaseInvoice:'فاکتور خرید',inventoryOut:'مصرف انبار',followup:'پیگیری مشتری',proforma:'پیش‌فاکتور',invoiceAdjustment:'سند اصلاح فاکتور',accountAdjustment:'اصلاح مانده'};return map[t]||'مورد حذف‌شده'}
function trashPage(){
  persistNormalized();installApi();var list=rows(),now=Date.now(),eligible=list.filter(function(x){return protectedUntil(x)<=now}).length;
  var body=list.map(function(x){var d=deletedMs(x),age=Math.max(0,Math.floor((now-d)/DAY_MS)),left=Math.max(0,Math.ceil((protectedUntil(x)-now)/DAY_MS));return '<article class="ar39413-trash-row"><div><b>'+esc(x.label||labelType(x))+'</b><small>'+esc(labelType(x))+' · حذف: '+fa(age)+' روز قبل</small><small>'+(left?'تا '+fa(left)+' روز دیگر قابل بازگردانی است':'دوره ۹۰ روزه تمام شده؛ پاک‌سازی دائمی فقط با تأیید تو')+'</small></div><button type="button" data-v39413-trash="restore" data-id="'+attr(x.id||'')+'">بازگردانی</button></article>'}).join('');
  return '<section class="page ar39413-trash-page"><div class="back-row"><button class="btn ghost" data-action="tab" data-tab="backup">برگشت به پشتیبان‌گیری</button>'+(eligible?'<button class="btn red" data-v39413-trash="purge">پاک‌سازی موارد منقضی</button>':'')+'</div><div class="ar39413-trash-hero"><h2>🗑️ سطل زباله امن ۹۰ روزه</h2><p>مواردی که از مسیر حذف امن آلان‌رنگ پاک می‌شوند تا ۹۰ روز قابل بازگردانی می‌مانند. هیچ موردی قبل از پایان این دوره توسط این مرکز پاک‌سازی دائمی نمی‌شود.</p></div><div class="ar39413-trash-list">'+(body||'<div class="ar39413-trash-empty">سطل زباله خالی است.</div>')+'</div><div class="ar39413-trash-note">این سطل زباله بخشی از داده اصلی آلان‌رنگ است و داخل پشتیبان کامل نیز ذخیره می‌شود. برای ایمنی، فایل‌های پشتیبان مستقل خارج از گوشی را هم نگه دار.</div></section>';
}
function renderRoute(){if(!(state&&state.tab==='trash'))return false;installApi();persistNormalized();app.innerHTML=baseLayout(trashPage());return true}
try{if(typeof registerAlanRangRoute==='function')registerAlanRangRoute('v39413-trash90',renderRoute)}catch(e){console.error('trash90 route',e)}
try{if(typeof registerAlanRangAfterSave==='function')registerAlanRangAfterSave('v39413-trash90-retention',function(){if(persistingRetention)return;persistNormalized()})}catch(e){console.error('trash90 save hook',e)}
try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39413-trash90-install',function(){installApi();if(state&&state.tab==='trash')persistNormalized()})}catch(e){console.error('trash90 render hook',e)}
document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('[data-v39413-trash]'):null;if(!b)return;var a=b.getAttribute('data-v39413-trash');e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();installApi();if(a==='restore'){var api=window.AlanRangTrash,ok=!!(api&&typeof api.restore==='function'&&api.restore(b.dataset.id||''));if(typeof showToast==='function')showToast(ok?'اطلاعات با موفقیت از سطل زباله بازگردانی شد':'بازگردانی انجام نشد');if(ok&&typeof renderApp==='function')renderApp();return}if(a==='purge'){if(!confirm('فقط مواردی که دوره محافظت ۹۰ روزه آن‌ها تمام شده برای همیشه پاک شوند؟'))return;var count=window.AlanRangTrash&&typeof window.AlanRangTrash.purgeEligible==='function'?window.AlanRangTrash.purgeEligible():0;if(typeof showToast==='function')showToast(fa(count)+' مورد منقضی برای همیشه پاک شد');if(typeof renderApp==='function')renderApp();}},true);
setTimeout(function(){installApi();persistNormalized()},0);
window.AlanRangTrash90={version:VERSION,retentionDays:RETENTION_DAYS,normalizeRetention:normalizeRetention,protectedUntil:protectedUntil,render:trashPage};
})();
