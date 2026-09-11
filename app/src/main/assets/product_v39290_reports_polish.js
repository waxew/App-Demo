(function(){
  'use strict';
  if(window.__ALANRANG_V39290_REPORTS_POLISH__)return;
  window.__ALANRANG_V39290_REPORTS_POLISH__=true;

  var VERSION='39.29.0-reports-polish-v0000002';
  var STYLE_ID='ar39290-reports-polish-style';
  var CSV_MODAL_ID='ar39290CsvPreview';
  var filterTimer=0;

  function installStyle(){
    if(typeof document==='undefined'||document.getElementById(STYLE_ID))return false;
    var s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=[
      'body.ar39290-reports-polish .ar39130-s2-page{padding-left:12px!important;padding-right:12px!important;display:grid!important;gap:10px!important}',
      'body.ar39290-reports-polish .ar39130-s2-hero{border-radius:20px!important;padding:15px!important;margin:0!important;box-shadow:0 9px 24px rgba(6,30,53,.13)!important;align-items:center!important}',
      'body.ar39290-reports-polish .ar39130-s2-hero span{font-size:12px!important;line-height:1.7!important}',
      'body.ar39290-reports-polish .ar39130-s2-hero h2{font-size:21px!important;line-height:1.55!important;margin:2px 0 4px!important}',
      'body.ar39290-reports-polish .ar39130-s2-hero p{font-size:11.5px!important;line-height:1.85!important}',
      'body.ar39290-reports-polish .ar39130-s2-lock{font-size:10.5px!important;padding:7px 9px!important;border-radius:12px!important}',
      'body.ar39290-reports-polish .ar39130-s2-box,body.ar39290-reports-polish .ar39130-s2-preview,body.ar39290-reports-polish .ar39130-s3-panel,body.ar39290-reports-polish .ar39130-s4-panel{border-radius:18px!important;padding:13px!important;margin:0!important;box-shadow:0 6px 18px rgba(15,39,64,.045)!important}',
      '.ar39290-filter-head,.ar39290-preview-tools{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:0 0 11px}',
      '.ar39290-filter-head>div b,.ar39290-preview-tools>div b{display:block;color:#0f2740;font-size:15px;line-height:1.6}',
      '.ar39290-filter-head>div small,.ar39290-preview-tools>div small{display:block;color:#64748b;font-size:10px;line-height:1.75;font-weight:800}',
      '.ar39290-filter-count{display:inline-flex;align-items:center;min-height:28px;padding:4px 9px;border-radius:999px;background:#eef6ff;border:1px solid #bfdbfe;color:#1d4ed8;font-size:10px;font-weight:950;white-space:nowrap}',
      'body.ar39290-reports-polish .ar39130-s2-grid{gap:9px!important;margin-top:4px!important}',
      'body.ar39290-reports-polish .ar39130-s2-grid .field{margin-bottom:0!important;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:9px!important;transition:border-color .16s ease,background .16s ease,box-shadow .16s ease}',
      'body.ar39290-reports-polish .ar39130-s2-grid .field.ar39290-filter-active{background:#fffaf0;border-color:#e8c768;box-shadow:0 0 0 2px rgba(244,199,82,.08)}',
      'body.ar39290-reports-polish .ar39130-s2-grid .field label{font-size:11.5px!important;margin:0 0 6px!important;color:#334155!important}',
      'body.ar39290-reports-polish .ar39130-s2-grid .input,body.ar39290-reports-polish .ar39130-s2-grid .select,body.ar39290-reports-polish #ar39130Kind{height:44px!important;border-radius:11px!important;font-size:13px!important;background:#fff!important}',
      'body.ar39290-reports-polish .ar39130-s2-box>.field:first-of-type{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:9px!important;margin-bottom:9px!important}',
      'body.ar39290-reports-polish .ar39130-s2-box>.btn.full{margin-top:10px!important;height:46px!important}',
      'body.ar39290-reports-polish .ar39130-s2-preview-head{gap:10px!important;align-items:center!important;margin-bottom:10px!important}',
      'body.ar39290-reports-polish .ar39130-s2-preview-head h3{font-size:17px!important;line-height:1.65!important;margin:0!important;color:#0f2740!important}',
      'body.ar39290-reports-polish .ar39130-s2-preview-head p{font-size:10.5px!important;line-height:1.7!important;margin:2px 0 0!important}',
      'body.ar39290-reports-polish .ar39130-s2-audit{font-size:9.5px!important;padding:6px 8px!important;white-space:nowrap}',
      'body.ar39290-reports-polish .ar39130-s2-kpis{gap:8px!important;margin:9px 0!important}',
      'body.ar39290-reports-polish .ar39130-s2-kpis>div{min-height:72px!important;border-radius:14px!important;padding:10px!important;background:#f8fafc!important;border:1px solid #e2e8f0!important}',
      'body.ar39290-reports-polish .ar39130-s2-kpis span{font-size:10px!important;color:#64748b!important}',
      'body.ar39290-reports-polish .ar39130-s2-kpis b{font-size:14px!important;line-height:1.65!important;color:#0f2740!important;font-variant-numeric:tabular-nums!important;unicode-bidi:plaintext!important}',
      'body.ar39290-reports-polish .ar39130-s2-table-wrap{border:1px solid #dfe6ee!important;border-radius:14px!important;overflow:auto!important;max-height:330px!important;background:#fff!important;-webkit-overflow-scrolling:touch}',
      'body.ar39290-reports-polish .ar39130-s2-table-wrap table{min-width:620px!important;font-size:10.5px!important;border-collapse:separate!important;border-spacing:0!important}',
      'body.ar39290-reports-polish .ar39130-s2-table-wrap th{position:sticky!important;top:0!important;z-index:2!important;background:#071e34!important;color:#f4c752!important;padding:9px 7px!important;white-space:nowrap!important}',
      'body.ar39290-reports-polish .ar39130-s2-table-wrap td{padding:9px 7px!important;border-bottom:1px solid #eef2f6!important;line-height:1.6!important;font-variant-numeric:tabular-nums!important;unicode-bidi:plaintext!important}',
      'body.ar39290-reports-polish .ar39130-s2-table-wrap tr:nth-child(even) td{background:#fbfcfe!important}',
      'body.ar39290-reports-polish .ar39130-s2-more{margin-top:8px!important;border-radius:11px!important;background:#f8fafc!important;padding:8px 10px!important;font-size:10px!important;color:#64748b!important}',
      'body.ar39290-reports-polish .ar39130-s2-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;margin-top:10px!important}',
      '.ar39290-preview-switches{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;width:100%}',
      '.ar39290-preview-switches .btn{min-height:42px!important;font-size:12px!important}',
      'body.ar39290-reports-polish .ar39130-s3-panel>div:first-child,body.ar39290-reports-polish .ar39130-s4-head{align-items:flex-start!important}',
      'body.ar39290-reports-polish .ar39130-s3-panel b,body.ar39290-reports-polish .ar39130-s4-head b{font-size:14.5px!important;line-height:1.6!important}',
      'body.ar39290-reports-polish .ar39130-s3-panel small,body.ar39290-reports-polish .ar39130-s4-head small{font-size:10px!important;line-height:1.75!important}',
      'body.ar39290-reports-polish .ar39130-s3-actions{gap:8px!important;margin-top:10px!important}',
      'body.ar39290-reports-polish .ar39130-s3-actions .btn,body.ar39290-reports-polish .ar39130-s4-export .btn{min-height:43px!important;font-size:12px!important}',
      'body.ar39290-reports-polish .ar39130-s4-builtins{gap:7px!important;margin:9px 0!important}',
      'body.ar39290-reports-polish .ar39130-s4-chip{font-size:10px!important;padding:7px 10px!important}',
      'body.ar39290-reports-polish .ar39130-s4-export{gap:7px!important}',
      'body.ar39290-reports-polish .ar39130-s4-history{padding:9px 0!important}',
      'body.ar39290-reports-polish .ar39130-s4-history b{font-size:10.5px!important}.ar39130-s4-history small{font-size:9px!important}',
      '.ar39130-s3-modal.ar39290-media-modal{padding:10px!important;align-items:flex-start!important;padding-top:max(10px,env(safe-area-inset-top,0px))!important}',
      '.ar39130-s3-modal.ar39290-media-modal .ar39130-s3-sheet{max-width:720px!important;border-radius:16px!important;padding:0!important;overflow:auto!important;max-height:calc(100vh - 20px)!important}',
      '.ar39130-s3-modal.ar39290-media-modal .ar39130-s3-head{position:sticky!important;top:0!important;z-index:5!important;background:#fff!important;padding:10px 11px!important;margin:0!important;border-bottom:1px solid #e2e8f0!important}',
      '.ar39130-s3-modal.ar39290-media-modal img{width:var(--ar39290-preview-width,100%)!important;max-width:none!important;margin:10px auto!important;border-radius:8px!important;transition:width .12s ease!important}',
      '.ar39290-media-controls{display:flex;align-items:center;gap:6px;margin-right:auto;margin-left:7px;direction:ltr}',
      '.ar39290-media-controls button{width:32px!important;height:32px!important;border-radius:9px!important;font-size:17px!important;font-weight:900!important;color:#0f2740!important}',
      '.ar39290-csv-modal{position:fixed;inset:0;z-index:100002;background:rgba(0,12,25,.76);padding:10px;display:flex;align-items:flex-start;justify-content:center;padding-top:max(10px,env(safe-area-inset-top,0px))}',
      '.ar39290-csv-sheet{width:min(760px,100%);max-height:calc(100vh - 20px);overflow:auto;background:#fff;border-radius:16px;box-shadow:0 18px 46px rgba(0,0,0,.3)}',
      '.ar39290-csv-head{position:sticky;top:0;z-index:2;background:#fff;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 12px;border-bottom:1px solid #e2e8f0}',
      '.ar39290-csv-head b{color:#0f2740;font-size:15px}.ar39290-csv-head small{display:block;color:#64748b;font-size:9.5px;margin-top:2px}',
      '.ar39290-csv-head button{width:34px;height:34px;border-radius:10px;background:#eef2f7;color:#0f2740;font-size:21px}',
      '.ar39290-csv-body{padding:11px}.ar39290-csv-body pre{direction:ltr;text-align:left;unicode-bidi:plaintext;margin:0;background:#071e34;color:#e5eef7;border-radius:12px;padding:12px;overflow:auto;min-height:220px;font:12px/1.75 monospace;white-space:pre}',
      '.ar39290-csv-note{margin:9px 0 0;color:#64748b;font-size:10px;line-height:1.8;font-weight:800}',
      'body.ar39290-reports-polish .ar39100-account{gap:10px!important}',
      'body.ar39290-reports-polish .ar39100-heading{border-radius:18px!important;padding:14px!important}',
      'body.ar39290-reports-polish .ar39100-heading h3{font-size:18px!important}.ar39100-heading p{font-size:10.5px!important}',
      'body.ar39290-reports-polish .ar39100-kpis{gap:8px!important}.ar39100-kpi{border-radius:14px!important;padding:11px!important;min-height:82px!important}',
      'body.ar39290-reports-polish .ar39100-kpi b{font-size:15px!important;font-variant-numeric:tabular-nums!important;unicode-bidi:plaintext!important}',
      'body.ar39290-reports-polish .ar39100-ledger-wrap{border-radius:14px!important}.ar39100-ledger th{white-space:nowrap!important}.ar39100-ledger td{font-variant-numeric:tabular-nums!important;unicode-bidi:plaintext!important}',
      'body.ar39290-reports-polish .ar39100-report-sheet{border-radius:16px!important;box-shadow:0 9px 25px rgba(15,39,64,.08)!important}',
      'body.ar39290-reports-polish .ar39100-report-meta b,body.ar39290-reports-polish .ar39100-report-summary b,body.ar39290-reports-polish .ar39100-report-ledger td{font-variant-numeric:tabular-nums!important;unicode-bidi:plaintext!important}',
      'body.ar39290-reports-polish .v382-report{border-radius:18px!important;padding:13px!important;margin:10px 0!important;box-shadow:0 7px 20px rgba(6,30,53,.08)!important}',
      'body.ar39290-reports-polish .v382-filter{gap:8px!important}.v382-kpis{gap:8px!important}.v382-kpi{border-radius:14px!important;min-height:74px!important;padding:10px!important}',
      'body.ar39290-reports-polish .v382-kpi b,body.ar39290-reports-polish .v382-table td,body.ar39290-reports-polish .v382-total-row b{font-variant-numeric:tabular-nums!important;unicode-bidi:plaintext!important}',
      '@media(max-width:390px){.ar39130-s2-hero{display:block!important}.ar39130-s2-lock{display:inline-flex!important;margin-top:7px!important}.ar39290-filter-head,.ar39290-preview-tools{align-items:flex-start!important}.ar39130-s2-preview-head{display:block!important}.ar39130-s2-audit{display:inline-flex!important;margin-top:7px!important}.ar39290-preview-switches{grid-template-columns:1fr!important}}',
      '@media print{.ar39290-filter-head,.ar39290-preview-tools,.ar39290-csv-modal,.ar39290-media-controls{display:none!important}}'
    ].join('');
    (document.head||document.documentElement).appendChild(s);return true;
  }

  function selectValue(id){var el=document.getElementById(id);return el?String(el.value||'').trim():'';}
  function reportKindLabel(){
    var k=selectValue('ar39130Kind');
    if(k==='checks')return 'گزارش چک‌ها';
    if(k==='customer_statement')return 'صورتحساب مشتری';
    return 'گزارش حساب و سود';
  }
  function isDefault(id,value){
    if(id==='ar39130CheckDirection'||id==='ar39130CheckStatus'||id==='ar39130CheckBucket')return !value||value==='all';
    if(id==='ar39130Month')return !value;
    if(id==='ar39130Year'||id==='ar39130CustomerId')return true;
    return !value;
  }
  function updateFilterState(){
    if(typeof document==='undefined')return 0;
    var ids=['ar39130CheckDirection','ar39130CheckStatus','ar39130CheckBucket','ar39130CheckQuery','ar39130CheckFrom','ar39130CheckTo','ar39130CustomerFrom','ar39130CustomerTo','ar39130CustomerQuery','ar39130Month'];
    var count=0;
    ids.forEach(function(id){var el=document.getElementById(id);if(!el)return;var field=el.closest?el.closest('.field'):null,active=!isDefault(id,String(el.value||'').trim());if(field)field.classList.toggle('ar39290-filter-active',active);if(active)count++;});
    var badge=document.querySelector('.ar39290-filter-count');if(badge)badge.textContent=count?('فیلتر فعال: '+String(count)):'بدون فیلتر محدودکننده';
    var title=document.querySelector('.ar39290-preview-tools [data-ar39290-kind]');if(title)title.textContent=reportKindLabel();
    return count;
  }
  function makeFilterHead(box){
    if(!box||box.querySelector('.ar39290-filter-head'))return;
    var head=document.createElement('div');head.className='ar39290-filter-head';
    head.innerHTML='<div><b>فیلترهای گزارش</b><small>نوع گزارش و بازه را مشخص کن؛ فقط نتیجه نمایش و خروجی محدود می‌شود.</small></div><span class="ar39290-filter-count">بدون فیلتر محدودکننده</span>';
    box.insertBefore(head,box.firstChild);
  }
  function makePreviewTools(preview){
    if(!preview||preview.querySelector('.ar39290-preview-tools'))return;
    var tools=document.createElement('div');tools.className='ar39290-preview-tools';
    tools.innerHTML='<div><b data-ar39290-kind>'+reportKindLabel()+'</b><small>پیش‌نمایش و خروجی‌ها از همان Report Contract رسمی ساخته می‌شوند.</small></div><div class="ar39290-preview-switches"><button type="button" class="btn ghost" data-ar39290-action="media-preview">پیش‌نمایش PDF / JPG</button><button type="button" class="btn ghost" data-ar39290-action="csv-preview">پیش‌نمایش CSV</button></div>';
    preview.insertBefore(tools,preview.firstChild);
  }
  function decorateReportCenter(){
    var page=document.querySelector('.ar39130-s2-page');if(!page)return false;
    page.setAttribute('data-ar39290-reports-polish','1');
    var hero=page.querySelector('.ar39130-s2-hero');
    if(hero&&!hero.getAttribute('data-ar39290-title')){var span=hero.querySelector('span'),h=hero.querySelector('h2'),p=hero.querySelector('p');if(span)span.textContent='مرکز گزارش‌های آلان‌رنگ';if(h)h.textContent='گزارش حرفه‌ای و خروجی خوانا';if(p)p.textContent='گزارش مشتری، حساب و چک با همان داده و فرمول رسمی؛ فقط نمایش، فیلتر و پیش‌نمایش مرتب‌تر شده است.';hero.setAttribute('data-ar39290-title','1');}
    var box=page.querySelector('.ar39130-s2-box');makeFilterHead(box);
    var preview=document.getElementById('ar39130Preview')||page.querySelector('.ar39130-s2-preview');makePreviewTools(preview);
    var media=document.getElementById('ar39130Stage3Panel');if(media){var previewBtn=media.querySelector('[data-ar39130-stage3="preview"]');if(previewBtn)previewBtn.textContent='پیش‌نمایش PDF / JPG';}
    updateFilterState();return true;
  }
  function decorateCustomerReports(){
    Array.prototype.forEach.call(document.querySelectorAll('.ar39100-account,.ar39100-report-sheet,.v382-report'),function(el){el.setAttribute('data-ar39290-polished','1');});
  }
  function decorateMediaModal(){
    var modal=document.getElementById('ar39130Stage3Preview');if(!modal)return false;
    modal.classList.add('ar39290-media-modal');
    var head=modal.querySelector('.ar39130-s3-head');if(!head)return true;
    if(!head.querySelector('.ar39290-media-controls')){var controls=document.createElement('div');controls.className='ar39290-media-controls';controls.innerHTML='<button type="button" data-ar39290-action="zoom-out" aria-label="کوچک‌نمایی">−</button><button type="button" data-ar39290-action="zoom-reset" aria-label="اندازه اصلی">۱:۱</button><button type="button" data-ar39290-action="zoom-in" aria-label="بزرگ‌نمایی">+</button>';var close=head.querySelector('[data-ar39130-stage3="close"]');head.insertBefore(controls,close||null);}
    var img=modal.querySelector('img');if(img&&!img.dataset.ar39290Zoom){img.dataset.ar39290Zoom='100';img.style.setProperty('--ar39290-preview-width','100%');}
    return true;
  }
  function activeReport(){
    var ui=window.AlanRangReportsUIV39130;if(!ui||typeof ui.activeReport!=='function')throw new Error('report UI unavailable');
    var r=ui.activeReport(),contract=window.AlanRangReportsV39130;if(!contract||typeof contract.audit!=='function'||!contract.audit(r).clean)throw new Error('report audit failed');return r;
  }
  function escapeHtml(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function showCsvPreview(){
    var contract=window.AlanRangReportsV39130;if(!contract||typeof contract.toCsv!=='function')throw new Error('CSV contract unavailable');
    var r=activeReport(),ui=window.AlanRangReportsUIV39130,presented=(ui&&typeof ui.presentation==='function')?ui.presentation(r):r,csv=contract.toCsv(presented),lines=String(csv||'').replace(/^\ufeff/,'').split(/\r?\n/),limit=14,shown=lines.slice(0,limit).join('\n'),old=document.getElementById(CSV_MODAL_ID);if(old)old.remove();
    var modal=document.createElement('div');modal.id=CSV_MODAL_ID;modal.className='ar39290-csv-modal';modal.innerHTML='<div class="ar39290-csv-sheet"><div class="ar39290-csv-head"><div><b>پیش‌نمایش CSV — '+escapeHtml(reportKindLabel())+'</b><small>'+String(lines.length>0?lines.length-1:0)+' ردیف داده؛ نمایش نمونه '+String(Math.max(0,Math.min(lines.length-1,limit-1)))+' ردیف</small></div><button type="button" data-ar39290-action="csv-close">×</button></div><div class="ar39290-csv-body"><pre>'+escapeHtml(shown)+'</pre><p class="ar39290-csv-note">این فقط پیش‌نمایش خواندنی است؛ فایل CSV واقعی با همان Contract و CSV Formula Injection Guard قبلی ساخته می‌شود.</p></div></div>';
    document.body.appendChild(modal);return true;
  }
  function closeCsv(){var m=document.getElementById(CSV_MODAL_ID);if(m)m.remove();}
  function mediaPreview(){var b=document.querySelector('[data-ar39130-stage3="preview"]');if(b){b.click();return true;}return false;}
  function zoomMedia(delta,reset){
    var modal=document.getElementById('ar39130Stage3Preview'),img=modal&&modal.querySelector('img');if(!img)return false;
    var z=Number(img.dataset.ar39290Zoom||100);if(reset)z=100;else z=Math.max(70,Math.min(180,z+delta));img.dataset.ar39290Zoom=String(z);img.style.setProperty('--ar39290-preview-width',z+'%');return true;
  }
  function apply(){
    try{installStyle();if(typeof document==='undefined')return false;if(document.body)document.body.classList.add('ar39290-reports-polish');decorateReportCenter();decorateCustomerReports();decorateMediaModal();return true;}catch(e){console.error('v39.29 reports polish',e);return false;}
  }
  function onClick(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-ar39290-action]'):null;if(!b)return;var a=b.getAttribute('data-ar39290-action');
    if(a==='csv-preview'){e.preventDefault();try{showCsvPreview();}catch(err){console.error(err);try{if(typeof showToast==='function')showToast('پیش‌نمایش CSV در دسترس نیست.');}catch(_){}}return;}
    if(a==='csv-close'){e.preventDefault();closeCsv();return;}
    if(a==='media-preview'){e.preventDefault();mediaPreview();return;}
    if(a==='zoom-in'){e.preventDefault();zoomMedia(15,false);return;}
    if(a==='zoom-out'){e.preventDefault();zoomMedia(-15,false);return;}
    if(a==='zoom-reset'){e.preventDefault();zoomMedia(0,true);return;}
  }
  function onFilterEvent(e){
    var el=e.target;if(!el||!el.id||el.id.indexOf('ar39130')!==0)return;
    clearTimeout(filterTimer);filterTimer=setTimeout(updateFilterState,30);
  }

  window.AlanRangReportsPolishV39290=Object.freeze({
    version:VERSION,
    apply:apply,
    updateFilterState:updateFilterState,
    showCsvPreview:showCsvPreview,
    capabilities:function(){return {presentationOnly:true,readOnlyPreview:true,usesExistingReportContract:true,noDataMutation:true,noStorageWrite:true,noFinancialFormulaChange:true,noSchemaChange:true,noDocumentIdentityChange:true,noPermissionChange:true};}
  });
  try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39290-reports-polish',apply);}catch(_){ }
  if(typeof document!=='undefined'){
    document.addEventListener('click',onClick,true);document.addEventListener('input',onFilterEvent,true);document.addEventListener('change',onFilterEvent,true);
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  }
})();
