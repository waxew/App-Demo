(function(){
'use strict';
if(window.__ALANRANG_PERFORMANCE_V39160_STAGE4__)return;
window.__ALANRANG_PERFORMANCE_V39160_STAGE4__=true;
var VERSION='39.16.0-performance-stage4-center-v01';
function e(v){try{return typeof safe==='function'?safe(v):String(v==null?'':v)}catch(_){return String(v==null?'':v)}}
function fa(v){try{return typeof faDigits==='function'?faDigits(v):String(v)}catch(_){return String(v)}}
function snap(){var d=window.AlanRangPerformanceDiagnosticsV39160;return d&&d.status?d.status():{active:false,renders:0,lastMs:0,averageMs:0,maxMs:0,slowRenders:0,cache:null}}
function render(){
  var s=snap(),c=s.cache||{},m=c.metrics||{};
  return '<section class="ar39160-page">'
    +'<div class="back-row"><button class="back-icon" data-ar39160-back="1">←</button><button class="btn blue" data-ar39160-refresh="1">تازه‌سازی کش رابط</button></div>'
    +'<div class="ar39160-hero"><div><small>AlanRang Performance</small><h2>بهینه‌سازی سرعت و رابط</h2><p>کش فقط در حافظهٔ همان اجرای برنامه نگهداری می‌شود. هیچ مبلغ، مشتری، چک، فاکتور یا سابقهٔ مالی در این بخش ذخیره یا تغییر نمی‌کند.</p></div><span class="ar39160-state '+(s.active?'good':'warn')+'">'+(s.active?'فعال':'نیاز به بررسی')+'</span></div>'
    +'<div class="ar39160-grid">'
      +'<div><span>آخرین رندر</span><b>'+fa(s.lastMs)+' ms</b></div>'
      +'<div><span>میانگین رندر</span><b>'+fa(s.averageMs)+' ms</b></div>'
      +'<div><span>بیشترین رندر</span><b>'+fa(s.maxMs)+' ms</b></div>'
      +'<div><span>رندر کند ≥ ۸۰ms</span><b>'+fa(s.slowRenders)+'</b></div>'
      +'<div><span>محاسبه مانده انجام‌شده</span><b>'+fa(m.balanceRecalculations||0)+'</b></div>'
      +'<div><span>محاسبه تکراری حذف‌شده</span><b>'+fa(m.balanceRecalculationsSkipped||0)+'</b></div>'
      +'<div><span>ایندکس مشتری</span><b>'+fa(m.customerIndexBuilds||0)+'</b></div>'
      +'<div><span>ایندکس فاکتور</span><b>'+fa(m.invoiceIndexBuilds||0)+'</b></div>'
    +'</div>'
    +'<div class="ar39160-card"><h3>چه چیزی بهینه شده؟</h3><ul><li>جستجوی مشتری و فاکتور با ایندکس حافظه‌ای و بدون تغییر داده</li><li>حذف محاسبهٔ تکراری مانده وقتی ورودی مالی از رندر قبلی تغییر نکرده است</li><li>رندر تنبل کارت‌های خارج از صفحه برای اسکرول روان‌تر در فهرست‌های طولانی</li><li>ثبت زمان رندر فقط در حافظهٔ همین نشست؛ بدون ارسال یا ذخیرهٔ Telemetry</li></ul></div>'
    +'<div class="ar39160-card safe"><h3>سطوح محافظت‌شده</h3><p>فرمول حسابداری، مانده مشتری، موتور چک، Backup/Restore، PIN/Recovery، فاکتور رسمی، مهر و امضا، RAL، آرشیو اسناد، گزارش‌ها و مرکز سلامت v39.15 بدون بازنویسی باقی مانده‌اند.</p></div>'
    +'</section>';
}
function style(){if(typeof document==='undefined'||document.getElementById('ar39160-center-style'))return;var s=document.createElement('style');s.id='ar39160-center-style';s.textContent='.ar39160-page{direction:rtl;padding:12px 12px 100px;color:#10283f}.ar39160-hero{background:linear-gradient(145deg,#061e35,#123f63);border:1px solid rgba(244,199,82,.36);border-radius:25px;padding:17px;color:#fff;display:flex;gap:12px;justify-content:space-between;align-items:flex-start}.ar39160-hero small{color:#f4c752;font-weight:900}.ar39160-hero h2{margin:4px 0 7px;color:#fff}.ar39160-hero p{margin:0;color:#dbeafe;font-size:12px;line-height:1.9}.ar39160-state{border-radius:999px;padding:7px 10px;font-size:10px;font-weight:1000;white-space:nowrap}.ar39160-state.good{background:#dcfce7;color:#166534}.ar39160-state.warn{background:#fff7ed;color:#9a3412}.ar39160-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin:12px 0}.ar39160-grid div{background:#fff;border:1px solid #e2e8f0;border-radius:17px;padding:11px;text-align:center}.ar39160-grid span{display:block;font-size:10px;color:#64748b}.ar39160-grid b{display:block;margin-top:6px;font-size:17px}.ar39160-card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:14px;margin:10px 0}.ar39160-card h3{margin:0 0 8px}.ar39160-card p,.ar39160-card li{font-size:12px;line-height:1.95;color:#475569}.ar39160-card ul{margin:0;padding-right:20px}.ar39160-card.safe{background:#f0fdf4;border-color:#bbf7d0}.ar39160-menu-entry{border-color:#bfdbfe!important;background:linear-gradient(135deg,#eff6ff,#fff)!important}.ar39160-menu-entry b{color:#1d4ed8!important}@media(max-width:370px){.ar39160-hero{display:block}.ar39160-state{display:inline-block;margin-top:8px}.ar39160-grid{grid-template-columns:1fr}}';(document.head||document.documentElement).appendChild(s)}
function decorateMenu(){try{style();var menu=document.querySelector('.ar3980-menu');if(!menu||menu.querySelector('[data-ar39160-open]'))return;var b=document.createElement('button');b.className='ar39160-menu-entry';b.setAttribute('data-ar39160-open','1');b.innerHTML='<b>بهینه‌سازی عملکرد</b><span>سرعت، کش حافظه‌ای و وضعیت رندر برنامه</span>';menu.appendChild(b)}catch(_){}}
function route(){if(!(window.state&&state.tab==='performanceCenter'))return false;style();var root=window.app||document.getElementById('app'),html=render();if(root)root.innerHTML=typeof baseLayout==='function'?baseLayout(html):html;return true}
function open(){try{state.tab='performanceCenter';state.modal=null;if(typeof renderApp==='function')renderApp();return true}catch(_){return false}}
function back(){try{state.tab='home';if(typeof renderApp==='function')renderApp();return true}catch(_){return false}}
function refresh(){try{var d=window.AlanRangPerformanceDiagnosticsV39160;if(d&&d.refreshCaches)d.refreshCaches();if(typeof showToast==='function')showToast('کش عملکرد تازه‌سازی شد؛ اطلاعات مالی تغییر نکرد');if(typeof renderApp==='function')renderApp();return true}catch(_){return false}}
function wire(){try{if(typeof registerAlanRangRoute==='function')registerAlanRangRoute('v39160-performance-center',route)}catch(_){ }try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39160-performance-entry',decorateMenu)}catch(_){ }if(typeof document==='undefined')return;document.addEventListener('click',function(ev){var t=ev.target&&ev.target.closest?ev.target.closest('[data-ar39160-open],[data-ar39160-back],[data-ar39160-refresh]'):null;if(!t)return;ev.preventDefault();if(t.hasAttribute('data-ar39160-open'))open();else if(t.hasAttribute('data-ar39160-back'))back();else if(t.hasAttribute('data-ar39160-refresh'))refresh()},true)}
window.AlanRangPerformanceCenterV39160=Object.freeze({version:VERSION,render:render,route:route,decorateMenu:decorateMenu,capabilities:function(){return {readOnlyMetrics:true,sessionOnly:true,cacheRefreshOnly:true,noFinancialMutation:true}}});
wire();try{setTimeout(decorateMenu,0)}catch(_){ }
})();
