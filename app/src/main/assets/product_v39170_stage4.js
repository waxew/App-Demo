(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_V39170_STAGE4__)return;
window.__ALANRANG_FOLLOWUP_V39170_STAGE4__=true;
var VERSION='39.17.0-followup-stage4-integration-v01';
function render(){var ui=window.AlanRangFollowupUIV39170;return ui&&ui.render?ui.render():'<section class="page"><p>مرکز پیگیری در دسترس نیست.</p></section>'}
function route(){if(!(window.state&&state.tab==='followupCenter'))return false;try{if(window.AlanRangFollowupUIV39170)window.AlanRangFollowupUIV39170.style()}catch(_){ }var root=window.app||(typeof document!=='undefined'?document.getElementById('app'):null),html=render();if(root)root.innerHTML=typeof baseLayout==='function'?baseLayout(html):html;return true}
function open(){try{state.tab='followupCenter';state.modal=null;if(typeof renderApp==='function')renderApp();return true}catch(_){return false}}
function back(){try{state.tab='more';state.modal=null;if(typeof renderApp==='function')renderApp();return true}catch(_){return false}}
function decorateMenu(){try{var menu=document.querySelector('.ar3980-menu');if(!menu||menu.querySelector('[data-ar39170-open]'))return false;var b=document.createElement('button');b.className='ar39170-menu-entry';b.setAttribute('data-ar39170-open','1');var snap=window.AlanRangFollowupV39170&&window.AlanRangFollowupV39170.snapshot?window.AlanRangFollowupV39170.snapshot():{counts:{open:0,overdue:0}};b.innerHTML='<b>مرکز پیگیری مطالبات</b><span>'+String(snap.counts.open||0)+' پیگیری باز — '+String(snap.counts.overdue||0)+' عقب‌افتاده</span>';menu.appendChild(b);return true}catch(_){return false}}
function setFilter(v){try{state.v39170FollowupFilter=String(v||'open');if(typeof renderApp==='function')renderApp();return true}catch(_){return false}}
function setSearch(v){try{state.v39170FollowupSearch=String(v||'');if(typeof renderApp==='function')renderApp();return true}catch(_){return false}}
function openAccount(cid){try{state.selectedCustomerId=String(cid||'');state.customerProfileTab='followups';state.tab='account';state.modal=null;if(typeof renderApp==='function')renderApp();return true}catch(_){return false}}
function newFollowup(cid){try{state.selectedCustomerId=String(cid||'');state.followupCustomerId=String(cid||'');state.followupDraft={status:'قول پرداخت',promiseDate:'',amount:'',note:''};state.modal='followup';if(typeof renderApp==='function')renderApp();return true}catch(_){return false}}
function wire(){
  try{if(typeof registerAlanRangRoute==='function')registerAlanRangRoute('v39170-followup-center',route)}catch(_){ }
  try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39170-followup-entry',decorateMenu)}catch(_){ }
  if(typeof document==='undefined')return;
  document.addEventListener('click',function(ev){var t=ev.target&&ev.target.closest?ev.target.closest('[data-ar39170-open],[data-ar39170-back],[data-ar39170-filter],[data-ar39170-account],[data-ar39170-new]'):null;if(!t)return;ev.preventDefault();if(t.hasAttribute('data-ar39170-open'))open();else if(t.hasAttribute('data-ar39170-back'))back();else if(t.hasAttribute('data-ar39170-filter'))setFilter(t.getAttribute('data-ar39170-filter'));else if(t.hasAttribute('data-ar39170-account'))openAccount(t.getAttribute('data-ar39170-account'));else if(t.hasAttribute('data-ar39170-new'))newFollowup(t.getAttribute('data-ar39170-new'))},true);
  document.addEventListener('input',function(ev){var t=ev.target;if(!t||t.id!=='ar39170Search')return;var value=t.value||'';try{state.v39170FollowupSearch=value;renderApp();var el=document.getElementById('ar39170Search');if(el){el.focus();var len=el.value.length;if(el.setSelectionRange)el.setSelectionRange(len,len)}}catch(_){ }},true);
}
window.AlanRangFollowupIntegrationV39170=Object.freeze({version:VERSION,route:route,open:open,back:back,decorateMenu:decorateMenu,setFilter:setFilter,setSearch:setSearch,openAccount:openAccount,newFollowup:newFollowup,capabilities:function(){return {reusesCanonicalFollowupModal:true,noDirectFollowupWrite:true,noFinancialMutation:true,noPersistentSessionFilter:true}}});
wire();try{setTimeout(decorateMenu,0)}catch(_){ }
})();
