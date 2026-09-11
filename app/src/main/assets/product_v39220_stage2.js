(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_SHARING_V39220_STAGE2__)return;
window.__ALANRANG_FOLLOWUP_SHARING_V39220_STAGE2__=true;
var VERSION='39.22.0-followup-sharing-stage2-ui-v01';
function esc(v){try{return typeof safe==='function'?safe(v):String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}catch(_){return String(v==null?'':v)}}
function button(action,label,cid,enabled,klass){return '<button type="button" class="ar39220-share '+(klass||'')+'" data-ar39220-action="'+action+'" data-ar39220-customer="'+esc(cid)+'"'+(enabled?'':' disabled aria-disabled="true"')+'>'+label+'</button>'}
function render(cid){var e=window.AlanRangFollowupSharingV39220,info=e&&e.buildMessage?e.buildMessage(cid):{canMessage:false};return button('sms','✉ پیامک',cid,!!info.canMessage,'sms')+button('copy-message','کپی متن پیگیری',cid,!!info.canMessage,'copy')}
function style(){if(typeof document==='undefined'||document.getElementById('ar39220-style'))return;var s=document.createElement('style');s.id='ar39220-style';s.textContent='.ar39220-share{flex:0 0 auto;min-height:36px;border:1px solid #e9d8a6;border-radius:12px;background:#fff8df;color:#7a570d;padding:0 10px;font:900 11px Tahoma,Arial;white-space:nowrap}.ar39220-share.sms{background:#fff7ed;border-color:#fed7aa;color:#9a3412}.ar39220-share.copy{background:#f5f3ff;border-color:#ddd6fe;color:#5b21b6}.ar39220-share:disabled{opacity:.42;filter:grayscale(.35);cursor:not-allowed}.ar39180-card .ar39220-share{background:rgba(244,199,82,.12);border-color:rgba(244,199,82,.30);color:#ffe08a}.ar39180-card .ar39220-share.sms{color:#ffd6a5}.ar39180-card .ar39220-share.copy{color:#ddd6fe}';(document.head||document.documentElement).appendChild(s)}
window.AlanRangFollowupSharingUIV39220=Object.freeze({version:VERSION,render:render,style:style,capabilities:function(){return {decoratesExistingQuickBarsOnly:true,horizontalOverflowSafe:true,disabledWhenUnsafe:true,noDataMutation:true,noStorageWrite:true,noFinancialEffect:true}}});
try{style()}catch(_){ }
})();
