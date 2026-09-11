(function(){
  'use strict';
  if(window.__ALANRANG_V39300_DOCUMENT_ARCHIVE_UX__)return;
  window.__ALANRANG_V39300_DOCUMENT_ARCHIVE_UX__=true;

  var VERSION='39.30.0-document-archive-ux-v0000002';
  var STYLE_ID='ar39300-document-archive-ux-style';
  var PREVIEW_ID='ar39300ArchivePreview';

  function archiveApi(){return window.AlanRangDocumentsV39110||null;}
  function uiApi(){return window.AlanRangDocumentsStage2V39110||null;}
  function quickApi(){return window.AlanRangDocumentArchiveStage4V39110||null;}
  function filter(){
    if(!window.state)window.state={};
    var f=state.ar39110ArchiveFilter;
    if(!f||typeof f!=='object')f={type:'all',status:'all',customerId:'',from:'',to:'',minAmount:'',maxAmount:'',query:'',sort:'newest'};
    if(!f.type)f.type='all';if(!f.status)f.status='all';if(!f.sort)f.sort='newest';
    state.ar39110ArchiveFilter=f;return f;
  }
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function eq(a,b){return String(a==null?'':a)===String(b==null?'':b);}
  function fa(v){try{return typeof faDigits==='function'?faDigits(v):String(v)}catch(_){return String(v)}}
  function moneyText(v){try{return typeof money==='function'?money(Math.round(Number(v)||0)):String(Math.round(Number(v)||0))+' تومان'}catch(_){return String(v||0)+' تومان'}}
  function kindLabel(row){try{var api=uiApi();return api&&typeof api.kindLabel==='function'?api.kindLabel(row&&row.kind):'سند'}catch(_){return 'سند'}}
  function statusLabel(row){try{var api=uiApi();return api&&typeof api.statusLabel==='function'?api.statusLabel(row):String(row&&row.status||'ثبت‌شده')}catch(_){return String(row&&row.status||'ثبت‌شده')}}
  function identityLabel(row){
    var i=row&&row.identity||{};
    if(i.mode==='none')return 'بدون مهر و امضا';
    if(i.mode==='custom')return i.showStamp&&i.showSignature?'مهر و امضای اختصاصی':i.showStamp?'مهر اختصاصی':i.showSignature?'امضای اختصاصی':'بدون مهر و امضا';
    return 'مهر و امضای عمومی';
  }
  function customerNameById(id){
    var list=(window.data&&Array.isArray(data.customers))?data.customers:[];
    var c=list.find(function(x){return x&&eq(x.id,id)});return c&&c.name||'';
  }
  function activeFilterParts(){
    var f=filter(),parts=[];
    if(f.type&&f.type!=='all')parts.push(f.type==='invoice'?'فاکتور':f.type==='proforma'?'پیش‌فاکتور':'اصلاحات');
    if(f.status&&f.status!=='all'){var sm={final:'قطعی',open:'پیش‌فاکتور باز',converted:'تبدیل‌شده',increase:'اصلاح افزایشی',decrease:'اصلاح کاهشی',return:'برگشت فاکتور','account-adjustment':'اصلاح مانده'};parts.push('وضعیت: '+(sm[f.status]||String(f.status)));}
    if(f.customerId)parts.push('مشتری: '+(customerNameById(f.customerId)||'انتخاب‌شده'));
    if(String(f.from||'').trim())parts.push('از '+String(f.from).trim());
    if(String(f.to||'').trim())parts.push('تا '+String(f.to).trim());
    if(String(f.minAmount||'').trim())parts.push('حداقل مبلغ');
    if(String(f.maxAmount||'').trim())parts.push('حداکثر مبلغ');
    if(String(f.query||'').trim())parts.push('جستجو: '+String(f.query).trim());
    return parts;
  }
  function advancedActive(){var f=filter();return !!(f.customerId||(f.status&&f.status!=='all')||String(f.from||'').trim()||String(f.to||'').trim()||String(f.minAmount||'').trim()||String(f.maxAmount||'').trim());}

  function installStyle(){
    if(typeof document==='undefined'||document.getElementById(STYLE_ID))return false;
    var s=document.createElement('style');s.id=STYLE_ID;s.textContent=[
      'body.ar39300-archive-ux .ar39110-page{padding-left:9px!important;padding-right:9px!important;display:grid!important;gap:8px!important;width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:hidden!important;-webkit-text-size-adjust:100%!important;text-size-adjust:100%!important}',
      'body.ar39300-archive-ux .ar39110-page>*{min-width:0!important;max-width:100%!important}',
      'body.ar39300-archive-ux .ar39110-page>.back-row{margin:0!important}',
      'body.ar39300-archive-ux .ar39110-hero{margin:0!important;padding:15px!important;border-radius:21px!important;box-shadow:0 9px 24px rgba(6,30,53,.13)!important}',
      'body.ar39300-archive-ux .ar39110-hero h2{font-size:21px!important;line-height:1.55!important}',
      'body.ar39300-archive-ux .ar39110-hero p{font-size:10.5px!important;line-height:1.8!important}',
      'body.ar39300-archive-ux .ar39110-audit{margin:0!important;border-radius:13px!important;padding:8px 10px!important;font-size:9.5px!important}',
      'body.ar39300-archive-ux .ar39110-stage4-toolbar{margin:0!important;border-radius:18px!important;padding:11px!important;box-shadow:0 5px 16px rgba(15,39,64,.04)!important}',
      'body.ar39300-archive-ux .ar39110-stage4-toolbar-head{grid-template-columns:minmax(0,1fr) 170px!important;gap:9px!important}',
      'body.ar39300-archive-ux .ar39110-stage4-toolbar h3{font-size:15px!important;line-height:1.6!important}',
      'body.ar39300-archive-ux .ar39110-stage4-toolbar p{font-size:9.5px!important;line-height:1.7!important}',
      'body.ar39300-archive-ux .ar39110-stage4-views{gap:6px!important;padding-top:8px!important}',
      'body.ar39300-archive-ux .ar39110-stage4-views button{min-height:38px!important;border-radius:11px!important;padding:6px 9px!important;font-size:10.5px!important}',
      'body.ar39300-archive-ux .ar39110-filter-card{margin:0!important;border-radius:18px!important;padding:11px!important;box-shadow:0 5px 16px rgba(15,39,64,.04)!important}',
      'body.ar39300-archive-ux .ar39110-filter-head{align-items:center!important;margin-bottom:8px!important}',
      'body.ar39300-archive-ux .ar39110-filter-head h3{font-size:15px!important;line-height:1.6!important}',
      'body.ar39300-archive-ux .ar39110-filter-head p{font-size:9.5px!important;margin:2px 0 0!important;line-height:1.7!important}',
      '.ar39300-filter-head-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end}',
      '.ar39300-filter-head-actions .btn{min-height:35px!important;padding:6px 9px!important;font-size:10px!important}',
      '.ar39300-filter-count{display:inline-flex;align-items:center;min-height:28px;padding:4px 8px;border-radius:999px;background:#eef6ff;border:1px solid #bfdbfe;color:#1d4ed8;font-size:9.5px;font-weight:950;white-space:nowrap}',
      'body.ar39300-archive-ux .ar39110-type-tabs{margin:4px 0 8px!important;gap:5px!important}',
      'body.ar39300-archive-ux .ar39110-type-tabs button{min-height:38px!important;border-radius:11px!important;font-size:10.5px!important}',
      '.ar39300-search-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;align-items:end;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:8px;margin-bottom:8px}',
      '.ar39300-search-row .field{margin:0!important}.ar39300-search-row label{font-size:10.5px!important;margin-bottom:5px!important}',
      '.ar39300-search-row .input{height:43px!important;border-radius:10px!important;font-size:12.5px!important;background:#fff!important}',
      '.ar39300-search-row .btn{height:43px!important;min-width:78px!important;border-radius:10px!important}',
      '.ar39300-active-filters{display:flex;gap:5px;flex-wrap:wrap;margin:0 0 8px}',
      '.ar39300-active-filters:empty{display:none}',
      '.ar39300-filter-chip{display:inline-flex;align-items:center;min-height:27px;padding:4px 8px;border-radius:999px;background:#fff8e5;border:1px solid #efd27b;color:#7a5700;font-size:9px;font-weight:900}',
      '.ar39300-advanced{display:none;border-top:1px dashed #d7e0e9;padding-top:8px;margin-top:3px}',
      '.ar39110-filter-card.ar39300-advanced-open .ar39300-advanced{display:block}',
      '.ar39300-advanced .grid2{gap:7px!important;margin-bottom:7px!important}',
      '.ar39300-advanced .field{margin:0!important;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:7px!important}',
      '.ar39300-advanced .field label{font-size:10px!important;margin:0 0 5px!important}',
      '.ar39300-advanced .input,.ar39300-advanced .select{height:41px!important;border-radius:9px!important;background:#fff!important;font-size:11.5px!important}',
      '.ar39300-advanced>.btn.full{height:43px!important;margin-top:1px!important}',
      'body.ar39300-archive-ux .ar39110-summary{margin:0!important;gap:7px!important}',
      'body.ar39300-archive-ux .ar39110-summary>div{min-height:70px!important;border-radius:14px!important;padding:9px!important}',
      'body.ar39300-archive-ux .ar39110-summary span{font-size:9px!important}body.ar39300-archive-ux .ar39110-summary b{font-size:14px!important;margin:3px 0!important}',
      'body.ar39300-archive-ux .ar39110-list-head{margin:3px 1px 0!important;align-items:center!important}',
      'body.ar39300-archive-ux .ar39110-list-head h3{font-size:17px!important}body.ar39300-archive-ux .ar39110-list-head p{font-size:9.5px!important}',
      'body.ar39300-archive-ux .ar39110-list{gap:7px!important;width:100%!important;max-width:100%!important;min-width:0!important}',
      'body.ar39300-archive-ux .ar39110-doc{border-radius:15px!important;padding:9px!important;box-shadow:0 4px 14px rgba(15,39,64,.04)!important;width:100%!important;max-width:100%!important;min-width:0!important;overflow:hidden!important}',
      'body.ar39300-archive-ux .ar39110-doc-main{gap:7px!important;width:100%!important;max-width:100%!important;min-width:0!important;align-items:flex-start!important}',
      'body.ar39300-archive-ux .ar39110-kind{width:30px!important;height:30px!important;flex-basis:30px!important;border-radius:9px!important;font-size:15px!important}',
      'body.ar39300-archive-ux .ar39110-doc-title{flex:1 1 0!important;min-width:0!important;max-width:100%!important;gap:7px!important}body.ar39300-archive-ux .ar39110-doc-title>div{min-width:0!important;max-width:100%!important}body.ar39300-archive-ux .ar39110-doc-title b{font-size:11.5px!important;line-height:1.45!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important}',
      'body.ar39300-archive-ux .ar39110-doc-title small{font-size:8.2px!important;line-height:1.5!important;margin-top:1px!important;white-space:normal!important;overflow-wrap:anywhere!important}',
      'body.ar39300-archive-ux .ar39110-badges{max-width:34%!important;min-width:0!important;gap:3px!important}body.ar39300-archive-ux .ar39110-status,body.ar39300-archive-ux .ar39110-duplicate{font-size:7.2px!important;padding:3px 6px!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important}',
      'body.ar39300-archive-ux .ar39110-doc-info{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:4px!important;margin-top:6px!important;width:100%!important;min-width:0!important}',
      'body.ar39300-archive-ux .ar39110-doc-info>div{border:1px solid #edf1f5!important;border-radius:9px!important;padding:5px 6px!important;min-width:0!important;max-width:100%!important;overflow:hidden!important}',
      'body.ar39300-archive-ux .ar39110-doc-info span{font-size:7.2px!important;line-height:1.35!important}body.ar39300-archive-ux .ar39110-doc-info strong{font-size:8.5px!important;margin-top:2px!important;line-height:1.4!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important}',
      '.ar39300-card-actions{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:5px!important;margin-top:6px!important;width:100%!important;max-width:100%!important;min-width:0!important;overflow:hidden!important}',
      '.ar39300-card-actions .btn{width:100%!important;max-width:100%!important;min-width:0!important;height:36px!important;min-height:36px!important;border-radius:9px!important;font-size:9.2px!important;line-height:1.25!important;padding:4px 5px!important;white-space:normal!important;overflow:hidden!important;text-overflow:ellipsis!important;text-align:center!important}',
      '.ar39300-card-actions [data-ar39110-stage3="identity"]{display:none!important}',
      '.ar39300-card-actions .ar39110-more-btn{background:#f8fafc!important;border-style:solid!important}',
      '.ar39300-preview-back{position:fixed;inset:0;z-index:100006;background:rgba(0,12,25,.72);display:flex;align-items:flex-end;justify-content:center;padding:10px;padding-bottom:max(10px,env(safe-area-inset-bottom,0px))}',
      '.ar39300-preview-sheet{width:min(680px,100%);max-height:min(88vh,760px);overflow:auto;background:#fff;border-radius:22px 22px 15px 15px;box-shadow:0 18px 50px rgba(0,0,0,.32)}',
      '.ar39300-preview-head{position:sticky;top:0;z-index:3;background:#071e34;color:#fff;padding:13px 14px;display:flex;justify-content:space-between;align-items:flex-start;gap:10px;border-bottom:1px solid rgba(244,199,82,.38)}',
      '.ar39300-preview-head b{display:block;color:#f4c752;font-size:16px;line-height:1.6}.ar39300-preview-head small{display:block;color:#d7e3ef;font-size:9.5px;line-height:1.7;margin-top:2px}',
      '.ar39300-preview-close{width:35px;height:35px;flex:0 0 35px;border-radius:10px;background:rgba(255,255,255,.1);color:#fff;font-size:22px}',
      '.ar39300-preview-body{padding:12px}',
      '.ar39300-preview-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:9px}',
      '.ar39300-preview-grid>div{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:9px;min-width:0}',
      '.ar39300-preview-grid span,.ar39300-preview-grid b{display:block}.ar39300-preview-grid span{font-size:8.5px;color:#64748b}.ar39300-preview-grid b{font-size:11px;color:#0f2740;margin-top:3px;line-height:1.6;overflow-wrap:anywhere}',
      '.ar39300-preview-note{background:#fffaf0;border:1px solid #f0d58a;border-radius:12px;padding:9px 10px;color:#6f5208;font-size:9.5px;line-height:1.8;margin-bottom:9px}',
      '.ar39300-preview-items{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:9px}.ar39300-preview-items h4{margin:0;background:#f8fafc;color:#0f2740;padding:8px 10px;font-size:11px}',
      '.ar39300-preview-item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;padding:8px 10px;border-top:1px solid #eef2f6;align-items:center}.ar39300-preview-item span{font-size:9.5px;color:#334155;line-height:1.6}.ar39300-preview-item b{font-size:9.5px;color:#0f2740;white-space:nowrap}',
      '.ar39300-preview-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}.ar39300-preview-actions .btn{min-height:42px!important;border-radius:11px!important;font-size:10.5px!important}',
      '.ar39300-preview-actions .wide{grid-column:1/-1}',
      '@media(max-width:520px){body.ar39300-archive-ux .ar39110-stage4-toolbar-head{grid-template-columns:1fr!important}.ar39300-search-row{grid-template-columns:1fr!important}.ar39300-search-row .btn{width:100%!important}.ar39300-filter-head-actions{justify-content:flex-start}.ar39300-preview-sheet{max-height:91vh}.ar39300-preview-grid{grid-template-columns:1fr 1fr}body.ar39300-archive-ux .ar39110-page>*{min-width:0!important;max-width:100%!important}body.ar39300-archive-ux .ar39110-doc-main{flex-direction:row!important}body.ar39300-archive-ux .ar39110-doc-title b{font-size:11px!important}body.ar39300-archive-ux .ar39110-doc-title small{font-size:8px!important}body.ar39300-archive-ux .ar39110-doc-info strong{font-size:8.2px!important}.ar39300-card-actions .btn{font-size:9px!important}}',
      '@media(max-width:370px){body.ar39300-archive-ux .ar39110-page{padding-left:7px!important;padding-right:7px!important}body.ar39300-archive-ux .ar39110-doc{padding:8px!important}body.ar39300-archive-ux .ar39110-kind{width:28px!important;height:28px!important;flex-basis:28px!important;font-size:14px!important}body.ar39300-archive-ux .ar39110-doc-title b{font-size:10.4px!important}body.ar39300-archive-ux .ar39110-doc-title small{font-size:7.6px!important}body.ar39300-archive-ux .ar39110-doc-info{gap:3px!important}body.ar39300-archive-ux .ar39110-doc-info>div{padding:4px!important}body.ar39300-archive-ux .ar39110-doc-info span{font-size:6.8px!important}body.ar39300-archive-ux .ar39110-doc-info strong{font-size:7.8px!important}.ar39300-card-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:4px!important}.ar39300-card-actions .btn{height:34px!important;min-height:34px!important;font-size:8.4px!important;padding:3px 4px!important}.ar39300-preview-actions{grid-template-columns:1fr!important}.ar39300-preview-actions .wide{grid-column:auto}.ar39300-preview-grid{grid-template-columns:1fr}.ar39300-filter-head-actions{width:100%}}',
      '@media print{.ar39300-preview-back,.ar39300-filter-head-actions,.ar39300-search-row .btn,.ar39300-active-filters{display:none!important}}'
    ].join('');
    (document.head||document.documentElement).appendChild(s);return true;
  }

  function decorateToolbar(){
    var bar=document.querySelector('.ar39110-stage4-toolbar');if(!bar)return false;
    bar.setAttribute('data-ar39300-toolbar','1');
    var h=bar.querySelector('h3'),p=bar.querySelector('p'),label=bar.querySelector('.ar39110-stage4-sort label');
    if(h)h.textContent='نمایش و ترتیب آرشیو';
    if(p)p.textContent='یک نمای سریع انتخاب کن یا ترتیب اسناد را عوض کن؛ داده‌های سند تغییر نمی‌کنند.';
    if(label)label.textContent='ترتیب نمایش';
    return true;
  }
  function advancedGrids(card){
    var ids=['ar39110Customer','ar39110From','ar39110Min'],out=[];
    ids.forEach(function(id){var el=document.getElementById(id),g=el&&el.closest?el.closest('.grid2'):null;if(g&&out.indexOf(g)<0)out.push(g);});
    return out;
  }
  function decorateFilters(){
    var card=document.querySelector('.ar39110-filter-card');if(!card||card.dataset.ar39300==='1')return !!card;
    card.dataset.ar39300='1';
    var head=card.querySelector('.ar39110-filter-head');
    if(head){
      var h=head.querySelector('h3'),p=head.querySelector('p');if(h)h.textContent='جستجو و فیلتر آرشیو';if(p)p.textContent='جستجو همیشه جلوی چشم است؛ فیلترهای تکمیلی را فقط در صورت نیاز باز کن.';
      var oldClear=head.querySelector('[data-ar39110="clear"]');if(oldClear)oldClear.remove();
      var actions=document.createElement('div');actions.className='ar39300-filter-head-actions';actions.innerHTML='<span class="ar39300-filter-count">بدون فیلتر</span><button type="button" class="btn ghost small" data-ar39300-action="toggle-filters">فیلترهای بیشتر</button><button type="button" class="btn ghost small" data-ar39110="clear">پاک کردن</button>';head.appendChild(actions);
    }
    var typeTabs=card.querySelector('.ar39110-type-tabs');
    var query=document.getElementById('ar39110Query'),queryField=query&&query.closest?query.closest('.field'):null;
    if(queryField){
      var label=queryField.querySelector('label');if(label)label.textContent='جستجوی سریع اسناد';if(query)query.placeholder='شماره سند، نام مشتری، شرح کار یا دلیل اصلاح';
      var search=document.createElement('div');search.className='ar39300-search-row';
      if(typeTabs&&typeTabs.nextSibling)card.insertBefore(search,typeTabs.nextSibling);else card.appendChild(search);
      search.appendChild(queryField);var go=document.createElement('button');go.type='button';go.className='btn blue';go.setAttribute('data-ar39110','apply');go.textContent='جستجو';search.appendChild(go);
    }
    var chips=document.createElement('div');chips.className='ar39300-active-filters';
    var searchRow=card.querySelector('.ar39300-search-row');if(searchRow&&searchRow.nextSibling)card.insertBefore(chips,searchRow.nextSibling);else card.appendChild(chips);
    var advanced=document.createElement('div');advanced.className='ar39300-advanced';
    advancedGrids(card).forEach(function(g){advanced.appendChild(g)});
    var apply=null;Array.prototype.some.call(card.children,function(ch){if(ch&&ch.getAttribute&&ch.getAttribute('data-ar39110')==='apply'){apply=ch;return true}return false});if(apply){apply.textContent='اعمال فیلترها';advanced.appendChild(apply)}
    card.appendChild(advanced);
    var open=advancedActive()||state.ar39300ArchiveAdvancedOpen===true;card.classList.toggle('ar39300-advanced-open',open);state.ar39300ArchiveAdvancedOpen=open;
    updateFilterBadge(card);return true;
  }
  function updateFilterBadge(card){
    card=card||document.querySelector('.ar39110-filter-card');if(!card)return 0;
    var parts=activeFilterParts(),badge=card.querySelector('.ar39300-filter-count'),chips=card.querySelector('.ar39300-active-filters');
    if(badge)badge.textContent=parts.length?fa(parts.length)+' فیلتر فعال':'بدون فیلتر';
    if(chips)chips.innerHTML=parts.map(function(x){return '<span class="ar39300-filter-chip">'+esc(x)+'</span>';}).join('');
    return parts.length;
  }
  function decorateCards(){
    var cards=document.querySelectorAll('.ar39110-doc');
    Array.prototype.forEach.call(cards,function(card){
      if(card.dataset.ar39300==='1')return;
      var open=card.querySelector('[data-ar39110="open"]');if(!open)return;
      var id=open.getAttribute('data-id')||'',kind=open.getAttribute('data-kind')||'';card.dataset.ar39300='1';card.dataset.id=id;card.dataset.kind=kind;
      var actions=card.querySelector('.ar39110-doc-actions');if(!actions)return;actions.classList.add('ar39300-card-actions');
      open.textContent='باز کردن';
      var identity=actions.querySelector('[data-ar39110-stage3="identity"]');if(identity)identity.textContent='مهر / امضا';
      var more=actions.querySelector('[data-ar39110-stage4="menu"]');if(more)more.textContent='بیشتر';
      var preview=document.createElement('button');preview.type='button';preview.className='btn ghost';preview.dataset.ar39300Action='preview';preview.dataset.id=id;preview.dataset.kind=kind;preview.textContent='پیش‌نمایش';
      var exportBtn=document.createElement('button');exportBtn.type='button';exportBtn.className='btn gold';exportBtn.dataset.ar39300Action='export';exportBtn.dataset.id=id;exportBtn.dataset.kind=kind;exportBtn.textContent=kind==='accountAdjustment'?'جزئیات':'ارسال / ذخیره';
      actions.insertBefore(preview,actions.firstChild);actions.appendChild(exportBtn);
    });
    return cards.length;
  }
  function rowById(id,kind){
    try{var api=uiApi();if(api&&typeof api.findRow==='function')return api.findRow(id,kind)}catch(_){ }
    try{var a=archiveApi();return a&&typeof a.buildAll==='function'?a.buildAll().find(function(r){return r&&eq(r.id,id)&&(!kind||eq(r.kind,kind))}):null}catch(_){return null}
  }
  function itemDescription(x){return String(x&&((x.description||x.title||x.name))||'آیتم').trim()||'آیتم';}
  function itemAmount(x){
    var total=Number(x&&x.total);if(!isFinite(total)||total===0){var q=Number(x&&x.quantity)||0,p=Number(x&&x.unitPrice)||0;total=q*p;}
    return moneyText(total||0);
  }
  function previewItems(row){
    var items=row&&row.raw&&Array.isArray(row.raw.items)?row.raw.items:[];if(!items.length)return '';
    var shown=items.slice(0,6),html=shown.map(function(x){return '<div class="ar39300-preview-item"><span>'+esc(itemDescription(x))+'</span><b>'+esc(itemAmount(x))+'</b></div>';}).join('');
    if(items.length>shown.length)html+='<div class="ar39300-preview-item"><span>+'+fa(items.length-shown.length)+' ردیف دیگر</span><b>در مشاهده کامل</b></div>';
    return '<div class="ar39300-preview-items"><h4>خلاصه ردیف‌های سند</h4>'+html+'</div>';
  }
  function previewNote(row){
    var parts=[];if(row&&row.projectTitle)parts.push('پروژه: '+row.projectTitle);if(row&&row.reason)parts.push('دلیل: '+row.reason);if(row&&row.sourceInvoiceNumber)parts.push('فاکتور مرجع: '+row.sourceInvoiceNumber);if(row&&row.description)parts.push(row.description);
    return parts.length?'<div class="ar39300-preview-note">'+parts.map(esc).join('<br>')+'</div>':'';
  }
  function closePreview(){var m=document.getElementById(PREVIEW_ID);if(m)m.remove();}
  function showPreview(row,mode){
    if(!row)return false;closePreview();
    var modal=document.createElement('div');modal.id=PREVIEW_ID;modal.className='ar39300-preview-back';modal.dataset.id=row.id||'';modal.dataset.kind=row.kind||'';
    var isAccount=row.kind==='accountAdjustment';
    var actions='<button type="button" class="btn blue wide" data-ar39300-action="open" data-id="'+esc(row.id)+'" data-kind="'+esc(row.kind)+'">باز کردن سند</button>';
    if(row.customerId)actions+='<button type="button" class="btn ghost" data-ar39300-action="customer" data-id="'+esc(row.id)+'" data-kind="'+esc(row.kind)+'">حساب مشتری</button>';
    if(!isAccount){
      actions+='<button type="button" class="btn green" data-ar39300-action="share-image" data-id="'+esc(row.id)+'" data-kind="'+esc(row.kind)+'">ارسال JPG</button>'+
        '<button type="button" class="btn gold" data-ar39300-action="share-pdf" data-id="'+esc(row.id)+'" data-kind="'+esc(row.kind)+'">ارسال PDF</button>'+
        '<button type="button" class="btn ghost" data-ar39300-action="save-image" data-id="'+esc(row.id)+'" data-kind="'+esc(row.kind)+'">ذخیره JPG</button>'+
        '<button type="button" class="btn ghost" data-ar39300-action="save-pdf" data-id="'+esc(row.id)+'" data-kind="'+esc(row.kind)+'">ذخیره PDF</button>';
    }
    actions+='<button type="button" class="btn ghost" data-ar39300-action="more" data-id="'+esc(row.id)+'" data-kind="'+esc(row.kind)+'">عملیات بیشتر</button>';
    modal.innerHTML='<div class="ar39300-preview-sheet"><div class="ar39300-preview-head"><div><b>'+(mode==='export'?'ارسال و خروجی سند':'پیش‌نمایش سریع سند')+'</b><small>'+esc(kindLabel(row))+' '+esc(row.number||row.id||'')+' • '+esc(statusLabel(row))+'</small></div><button type="button" class="ar39300-preview-close" data-ar39300-action="close-preview">×</button></div><div class="ar39300-preview-body">'+
      '<div class="ar39300-preview-grid"><div><span>مشتری</span><b>'+esc(row.customerName||'بدون مشتری')+'</b></div><div><span>تاریخ</span><b>'+esc(row.date||'—')+'</b></div><div><span>مبلغ</span><b>'+esc(moneyText(row.amount||0))+'</b></div><div><span>هویت سند</span><b>'+esc(identityLabel(row))+'</b></div></div>'+previewNote(row)+previewItems(row)+'<div class="ar39300-preview-actions">'+actions+'</div></div></div>';
    document.body.appendChild(modal);return true;
  }
  function renderAppSafe(){try{if(typeof renderApp==='function'){renderApp();return true}}catch(e){console.error('v39.30 archive render',e)}return false;}
  function openThen(row,fn){
    if(!row||row.kind==='accountAdjustment')return false;
    closePreview();state.selectedCustomerId=row.customerId||state.selectedCustomerId||null;state.previewInvoiceId=row.id;state.modal=null;state.tab='preview';renderAppSafe();
    setTimeout(function(){try{var r=typeof fn==='function'?fn():null;if(r&&typeof r.catch==='function')r.catch(function(e){console.error('v39.30 archive export',e)})}catch(e){console.error('v39.30 archive export',e)}},120);return true;
  }
  function perform(action,row){
    if(!row)return false;var qa=quickApi();
    if(action==='open'){closePreview();var ui=uiApi();return !!(ui&&typeof ui.openDocument==='function'&&ui.openDocument(row));}
    if(action==='customer'){closePreview();if(qa&&typeof qa.handleQuickAction==='function')return !!qa.handleQuickAction('customer',row);return false;}
    if(action==='share-image'){closePreview();if(qa&&typeof qa.handleQuickAction==='function')return !!qa.handleQuickAction('shareImage',row);return openThen(row,function(){return typeof shareInvoiceAsImage==='function'?shareInvoiceAsImage():null});}
    if(action==='share-pdf'){closePreview();if(qa&&typeof qa.handleQuickAction==='function')return !!qa.handleQuickAction('sharePdf',row);return openThen(row,function(){return typeof shareInvoiceAsPdf==='function'?shareInvoiceAsPdf():null});}
    if(action==='save-image')return openThen(row,function(){return typeof saveInvoiceAsImage==='function'?saveInvoiceAsImage():null});
    if(action==='save-pdf')return openThen(row,function(){return typeof saveInvoiceAsPdf==='function'?saveInvoiceAsPdf():null});
    if(action==='more'){closePreview();return !!(qa&&typeof qa.openQuickMenu==='function'&&qa.openQuickMenu(row.id,row.kind));}
    return false;
  }
  function apply(){
    try{
      installStyle();if(typeof document==='undefined')return false;
      if(document.body)document.body.classList.add('ar39300-archive-ux');
      if(!(window.state&&state.tab==='documentsArchive')){closePreview();return false;}
      decorateToolbar();decorateFilters();decorateCards();updateFilterBadge();return true;
    }catch(e){console.error('v39.30 document archive ux',e);return false;}
  }
  function onClick(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-ar39300-action]'):null;if(!b)return;var action=b.getAttribute('data-ar39300-action');
    if(action==='toggle-filters'){e.preventDefault();var card=document.querySelector('.ar39110-filter-card');if(!card)return;var open=!card.classList.contains('ar39300-advanced-open');card.classList.toggle('ar39300-advanced-open',open);state.ar39300ArchiveAdvancedOpen=open;return;}
    if(action==='close-preview'){e.preventDefault();closePreview();return;}
    var row=rowById(b.getAttribute('data-id'),b.getAttribute('data-kind'));if(!row)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    if(action==='preview'||action==='export'){showPreview(row,action);return;}
    perform(action,row);
  }
  function onKey(e){if(e.key==='Escape')closePreview();}

  window.AlanRangDocumentArchiveUXV39300=Object.freeze({
    version:VERSION,
    apply:apply,
    rowById:rowById,
    showPreview:showPreview,
    activeFilterParts:activeFilterParts,
    capabilities:function(){return {presentationOnly:true,usesExistingArchiveEngine:true,usesExistingDocumentIds:true,noDocumentIdRewrite:true,noFileStructureChange:true,noDatabaseWrite:true,noStorageWrite:true,noFinancialMutation:true,noAccountingFormulaChange:true,noPermissionChange:true,shareExportUsesExistingInvoicePipeline:true};}
  });
  try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39300-document-archive-ux',apply);}catch(_){ }
  if(typeof document!=='undefined'){
    document.addEventListener('click',onClick,true);document.addEventListener('keydown',onKey,true);
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  }
})();
