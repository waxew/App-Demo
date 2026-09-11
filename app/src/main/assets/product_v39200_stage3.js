(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_TIMELINE_V39200_STAGE3__)return;
window.__ALANRANG_FOLLOWUP_TIMELINE_V39200_STAGE3__=true;
var VERSION='39.20.0-followup-timeline-stage3-policy-v01';
function txt(v){return String(v==null?'':v)}
function latin(v){return txt(v).replace(/[۰-۹]/g,function(c){return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))}).replace(/[٠-٩]/g,function(c){return String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))})}
function norm(v){return latin(v).replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,' ').trim().toLowerCase()}
function apply(events,opt){events=Array.isArray(events)?events:[];opt=opt||{};var f=txt(opt.filter||'all'),q=norm(opt.q||'');return events.filter(function(r){var ok=f==='all'||(f==='promise'&&txt(r.promiseDate).trim())||(f==='note'&&txt(r.note).trim())||(f==='settled'&&txt(r.status).trim()==='تسویه شد');if(!ok)return false;if(!q)return true;return norm([r.status,r.promiseDate,r.note,r.date,r.createdAt,r.amount].join(' ')).indexOf(q)>-1})}
function capabilities(){return {deterministicTimelineFilter:true,sessionOnly:true,noTimer:true,noBackgroundService:true,noStorageWrite:true,noFinancialEffect:true}}
window.AlanRangFollowupTimelinePolicyV39200=Object.freeze({version:VERSION,apply:apply,capabilities:capabilities});
})();
