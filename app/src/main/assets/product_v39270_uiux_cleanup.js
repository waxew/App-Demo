(function(){
  'use strict';
  if(window.__ALANRANG_V39270_UIUX_CLEANUP__)return;
  window.__ALANRANG_V39270_UIUX_CLEANUP__=true;
  var VERSION='39.27.0-ui-ux-cleanup-consistent-v0001';
  var STYLE_ID='ar39270-uiux-cleanup-style';
  var FLOATERS=['#arAndroidSavedAction','.ar3937-quick-save','.ar3959-floating','.ar383-price-notice'];

  function installStyle(){
    if(typeof document==='undefined'||document.getElementById(STYLE_ID))return false;
    var s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=[
      'body.ar39270-ui-clean .page{padding-left:13px!important;padding-right:13px!important;padding-bottom:calc(var(--ar-bottom-safe,88px) + 12px)!important}',
      'body.ar39270-ui-clean .hero{margin-bottom:12px!important;padding:22px 16px 24px!important;border-radius:0 0 24px 24px!important;box-shadow:0 9px 22px rgba(5,25,50,.15)!important}',
      'body.ar39270-ui-clean .hero h1{font-size:24px!important;margin-bottom:7px!important}',
      'body.ar39270-ui-clean .hero p{font-size:12.5px!important;line-height:1.75!important}',
      'body.ar39270-ui-clean .section-title,body.ar39270-ui-clean .back-row,body.ar39270-ui-clean .top-actions{gap:8px!important;margin:8px 0 10px!important;align-items:center!important}',
      'body.ar39270-ui-clean .section-title h2,body.ar39270-ui-clean .section-title h3{font-size:20px!important;line-height:1.55!important}',
      'body.ar39270-ui-clean .card{border-radius:17px!important;padding:13px!important;margin-bottom:10px!important;box-shadow:0 6px 16px rgba(16,24,40,.045)!important}',
      'body.ar39270-ui-clean .btn{min-height:44px!important;height:auto!important;border-radius:13px!important;padding:8px 12px!important;font-size:14px!important;line-height:1.35!important}',
      'body.ar39270-ui-clean .btn.small{min-height:38px!important;border-radius:11px!important;padding:7px 10px!important;font-size:12.5px!important}',
      'body.ar39270-ui-clean .actions,body.ar39270-ui-clean [class$="-actions"]{gap:7px!important}',
      'body.ar39270-ui-clean .back-row .btn,body.ar39270-ui-clean .top-actions .btn{min-width:86px!important;flex:0 1 auto!important}',
      'body.ar39270-ui-clean .modal-back{padding-top:max(12px,env(safe-area-inset-top,0px))!important}',
      'body.ar39270-ui-clean .modal{border-radius:22px 22px 0 0!important;padding:16px 14px calc(18px + env(safe-area-inset-bottom,0px))!important;max-height:88vh!important;box-shadow:0 -18px 44px rgba(3,14,27,.24)!important}',
      'body.ar39270-ui-clean .modal h3{font-size:19px!important;line-height:1.6!important;margin-bottom:10px!important}',
      'body.ar39270-ui-clean .ar3840-home{padding:9px 11px calc(var(--ar-bottom-safe,88px) + 8px)!important;display:grid!important;gap:9px!important}',
      'body.ar39270-ui-clean .ar3840-home>.ar3840-calendar,body.ar39270-ui-clean .ar3840-home>.ar3840-card{margin:0!important;border-radius:19px!important;padding:12px!important;box-shadow:0 7px 18px rgba(6,30,53,.08)!important}',
      'body.ar39270-ui-clean .ar3840-home h3{font-size:17px!important;margin-bottom:6px!important}',
      'body.ar39270-ui-clean .ar3840-row{padding:8px 2px!important;line-height:1.65!important}',
      'body.ar39270-ui-clean .ar3840-actions{display:grid!important;grid-template-columns:1fr 1fr!important;margin-top:7px!important}',
      'body.ar39270-ui-clean .customer-card .actions{display:grid!important;grid-template-columns:1.25fr 1fr 1fr!important}',
      'body.ar39270-ui-clean .bottom-nav{box-shadow:0 -5px 18px rgba(0,0,0,.08)!important}',
      'body.ar39270-ui-clean .bottom-nav .nav-item{min-width:0!important;padding-left:2px!important;padding-right:2px!important}',
      'body.ar39270-ui-clean [data-ar39270-duplicate="1"]{display:none!important}',
      '@media(max-width:380px){body.ar39270-ui-clean .customer-card .actions{grid-template-columns:1fr 1fr!important}body.ar39270-ui-clean .customer-card .actions .btn:first-child{grid-column:1/-1}body.ar39270-ui-clean .btn{font-size:13px!important;padding-left:9px!important;padding-right:9px!important}}',
      '@media print{body.ar39270-ui-clean [data-ar39270-duplicate="1"]{display:none!important}}'
    ].join('');
    (document.head||document.documentElement).appendChild(s);return true;
  }

  function keyFor(btn){
    if(!btn||!btn.getAttribute)return '';
    var a=btn.getAttribute('data-action')||'';
    var id=btn.getAttribute('data-id')||btn.getAttribute('data-invoice-id')||btn.getAttribute('data-customer-id')||'';
    var tab=btn.getAttribute('data-tab')||'';
    var text=String(btn.textContent||'').replace(/\s+/g,' ').trim();
    if(!a||!text)return '';
    return [a,id,tab,text].join('|');
  }

  function dedupe(container){
    if(!container||!container.querySelectorAll)return 0;
    var seen=Object.create(null),hidden=0;
    Array.prototype.forEach.call(container.querySelectorAll('button[data-action]'),function(btn){
      btn.removeAttribute('data-ar39270-duplicate');
      var k=keyFor(btn);if(!k)return;
      if(seen[k]){btn.setAttribute('data-ar39270-duplicate','1');btn.setAttribute('aria-hidden','true');hidden++;}
      else{seen[k]=btn;btn.removeAttribute('aria-hidden');}
    });
    return hidden;
  }

  function dedupeActions(){
    if(typeof document==='undefined')return 0;
    var total=0;
    Array.prototype.forEach.call(document.querySelectorAll('.actions,.back-row,.top-actions,.ar3840-actions,.ar39210-quickbar[data-ar39210-quickbar]'),function(c){total+=dedupe(c)});
    return total;
  }

  function visible(el){
    if(!el)return false;
    try{if(el.hidden)return false;var cs=window.getComputedStyle?getComputedStyle(el):null;if(cs&&(cs.display==='none'||cs.visibility==='hidden'))return false;}catch(_){}
    return true;
  }
  function floatHeight(el){try{var r=el.getBoundingClientRect&&el.getBoundingClientRect();return Math.max(44,Math.ceil(r&&r.height||0));}catch(_){return 56}}
  function stackFloaters(){
    if(typeof document==='undefined')return 0;
    var list=[];
    FLOATERS.forEach(function(sel){Array.prototype.forEach.call(document.querySelectorAll(sel),function(el){if(list.indexOf(el)<0&&visible(el))list.push(el)})});
    list.forEach(function(el){if(el&&el.style)el.style.removeProperty('bottom')});
    if(list.length<2)return list.length;
    var bottom=88;
    list.forEach(function(el){if(!el||!el.style)return;el.style.bottom='calc('+bottom+'px + env(safe-area-inset-bottom,0px))';el.setAttribute('data-ar39270-float-stacked','1');bottom+=floatHeight(el)+8});
    return list.length;
  }

  function apply(){
    try{
      installStyle();
      if(typeof document==='undefined')return false;
      if(document.body)document.body.classList.add('ar39270-ui-clean');
      var root=document.getElementById('app');if(root)root.setAttribute('data-ar39270-uiux','1');
      dedupeActions();stackFloaters();return true;
    }catch(e){console.error('v39.27 UI/UX cleanup',e);return false;}
  }

  window.AlanRangUIUXV39270=Object.freeze({version:VERSION,apply:apply,dedupeActions:dedupeActions,stackFloaters:stackFloaters,capabilities:function(){return {domOnly:true,cssOnlyLayout:true,noDataMutation:true,noStorageWrite:true,noFinancialMutation:true,noFeatureRemoval:true,noSchemaChange:true,noPermissionChange:true}}});
  try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39270-uiux-cleanup',apply)}catch(_){ }
  if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();}
})();
