(function(){
'use strict';
if(window.__ALANRANG_CHECK_HOME_FIX_V39200__)return;
window.__ALANRANG_CHECK_HOME_FIX_V39200__=true;

var VERSION='39.20.0-check-home-consistency-fix1-v01';
var OVERDUE_LABEL='\u0686\u06a9 \u0639\u0642\u0628\u200c\u0627\u0641\u062a\u0627\u062f\u0647';
var TODAY_LABEL='\u0686\u06a9 \u0627\u0645\u0631\u0648\u0632';

function txt(v){return String(v==null?'':v)}
function norm(v){return txt(v).replace(/\u200c/g,' ').replace(/\s+/g,' ').trim()}
function fa(v){try{if(typeof faDigits==='function')return faDigits(v)}catch(_){ }return txt(v)}
function ui(){return window.AlanRangChecksUIV39120||null}
function canonicalStats(){
  try{
    var u=ui();
    if(!u||typeof u.buildViewModel!=='function')return null;
    var vm=u.buildViewModel({filter:'all',direction:'all',query:''})||{};
    return {today:Number(vm.today||0),overdue:Number(vm.overdue||0),due7:Number(vm.due7||0)};
  }catch(_){return null}
}
function findHomeButton(label){
  if(typeof document==='undefined')return null;
  var wanted=norm(label),buttons=document.querySelectorAll('.ar396-compact-grid button');
  for(var i=0;i<buttons.length;i++){
    var span=buttons[i].querySelector('span');
    if(span&&norm(span.textContent)===wanted)return buttons[i];
  }
  return null;
}
function setCount(button,count){
  if(!button)return false;
  var b=button.querySelector('b');if(!b)return false;
  b.textContent=fa(count||0);return true;
}
function decorateHome(){
  try{
    if(!(window.state&&state.tab==='home'))return false;
    var s=canonicalStats();if(!s)return false;
    var overdue=findHomeButton(OVERDUE_LABEL),today=findHomeButton(TODAY_LABEL),changed=false;
    if(overdue){
      setCount(overdue,s.overdue);overdue.removeAttribute('data-action');overdue.removeAttribute('data-tab');
      overdue.setAttribute('data-v39200-check-bucket','overdue');changed=true;
    }
    if(today){setCount(today,s.today);changed=true}
    return changed;
  }catch(_){return false}
}
function refreshFinance(){
  try{
    if(!(window.state&&state.tab==='finance'))return false;
    var u=ui();if(!u||typeof u.refresh!=='function')return false;
    u.refresh();return true;
  }catch(_){return false}
}
function openOverdue(){
  try{
    if(!window.state)return false;
    state.v39120CheckUi=state.v39120CheckUi||{filter:'all',direction:'all',query:''};
    state.v39120CheckUi.filter='overdue';
    state.v39120CheckUi.direction='all';
    state.v39120CheckUi.query='';
    state.v331FinanceFilter='all';
    state.tab='finance';
    state.modal=null;
    if(typeof renderApp==='function')renderApp();
    refreshFinance();
    return true;
  }catch(_){return false}
}
function afterRender(){decorateHome();refreshFinance()}
function wire(){
  try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39200-check-home-consistency-fix1',afterRender)}catch(_){ }
  if(typeof document==='undefined')return;
  document.addEventListener('click',function(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-v39200-check-bucket="overdue"]'):null;
    if(!b)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    openOverdue();
  },true);
}

window.AlanRangCheckHomeConsistencyV39200=Object.freeze({
  version:VERSION,canonicalStats:canonicalStats,decorateHome:decorateHome,refreshFinance:refreshFinance,openOverdue:openOverdue,
  capabilities:function(){return {canonicalCheckSourceOnly:true,rawFinanceCounterDisabledOnHome:true,overdueNavigationUsesCanonicalFilter:true,financeLegacyFlashSuppressed:true,noCheckWrite:true,noSchemaWrite:true,noFinancialEffect:true,noFollowupChange:true}}
});
wire();
try{afterRender()}catch(_){ }
})();
