(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_ALERTS_V39180_STAGE4__)return;
window.__ALANRANG_FOLLOWUP_ALERTS_V39180_STAGE4__=true;
var VERSION='39.18.0-followup-alerts-stage4-integration-v01';
function openFilter(kind){try{state.v39170FollowupFilter=String(kind||'open');state.v39170FollowupSearch='';var a=window.AlanRangFollowupIntegrationV39170;return !!(a&&a.open&&a.open())}catch(_){return false}}
function openCenter(){return openFilter('open')}
function openAccount(cid){try{var a=window.AlanRangFollowupIntegrationV39170;return !!(a&&a.openAccount&&a.openAccount(cid))}catch(_){return false}}
function decorateHome(){try{if(!(window.state&&state.tab==='home')||typeof document==='undefined')return false;if(document.querySelector('[data-ar39180-home-card]'))return true;var ui=window.AlanRangFollowupAlertsUIV39180;if(!ui||typeof ui.renderHomeCard!=='function')return false;ui.style&&ui.style();var root=document.querySelector('.ar3862-home')||document.querySelector('.ar3841-home');if(!root)return false;var holder=document.createElement('div');holder.innerHTML=ui.renderHomeCard();var card=holder.firstElementChild;if(!card)return false;var target=null;Array.prototype.some.call(root.querySelectorAll('.ar3841-card'),function(x){var h=x.querySelector('h3');if(h&&String(h.textContent||'').indexOf('مطالبات و پیگیری')>=0){target=x;return true}return false});if(target)root.insertBefore(card,target);else root.appendChild(card);return true}catch(_){return false}}
function wire(){try{if(typeof registerAlanRangAfterRender==='function')registerAlanRangAfterRender('v39180-followup-alerts-home',function(){setTimeout(decorateHome,0)})}catch(_){ }if(typeof document==='undefined')return;document.addEventListener('click',function(ev){var t=ev.target&&ev.target.closest?ev.target.closest('[data-ar39180-open],[data-ar39180-filter],[data-ar39180-account]'):null;if(!t)return;ev.preventDefault();if(t.hasAttribute('data-ar39180-open'))openCenter();else if(t.hasAttribute('data-ar39180-filter'))openFilter(t.getAttribute('data-ar39180-filter'));else if(t.hasAttribute('data-ar39180-account'))openAccount(t.getAttribute('data-ar39180-account'))},true)}
window.AlanRangFollowupAlertsIntegrationV39180=Object.freeze({version:VERSION,decorateHome:decorateHome,openFilter:openFilter,openCenter:openCenter,openAccount:openAccount,capabilities:function(){return {reusesV39170Navigation:true,noDirectDataWrite:true,noStorageWrite:true,noFinancialEffect:true,homeDomDecorationOnly:true}}});
wire();try{setTimeout(decorateHome,0)}catch(_){ }
})();
