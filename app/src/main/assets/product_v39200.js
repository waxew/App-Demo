(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_TIMELINE_V39200_STAGE1__)return;
window.__ALANRANG_FOLLOWUP_TIMELINE_V39200_STAGE1__=true;
var VERSION='39.20.0-followup-timeline-stage1-engine-v01';
function arr(name){try{return window.data&&Array.isArray(data[name])?data[name]:[]}catch(_){return []}}
function txt(v){return String(v==null?'':v)}
function key(v){return txt(v)}
function num(v){var n=Number(String(v==null?'':v).replace(/[,٬،\s]/g,''));return isFinite(n)?n:0}
function customerMap(){var m=new Map();arr('customers').forEach(function(c){if(c&&!m.has(key(c.id)))m.set(key(c.id),c)});return m}
function createdScore(f){var s=txt(f&&f.createdAt);var t=Date.parse(s);return isFinite(t)?t:0}
function due(f){try{var e=window.AlanRangFollowupV39170;if(e&&typeof e.dueInfo==='function')return e.dueInfo(f&&f.promiseDate)}catch(_){ }return {kind:txt(f&&f.promiseDate)?'dated':'noDate',diff:null,valid:true}}
function record(f,c,idx){var d=due(f);return {id:key(f&&f.id),customerId:key(f&&f.customerId),customerName:txt(c&&c.name)||'مشتری حذف‌شده',phone:txt(c&&c.phone),balance:num(c&&c.balance),status:txt(f&&f.status)||'پیگیری',promiseDate:txt(f&&f.promiseDate),amount:num(f&&f.amount),note:txt(f&&f.note),date:txt(f&&f.date),createdAt:txt(f&&f.createdAt),dueKind:txt(d&&d.kind),dueDiff:d&&d.diff==null?null:Number(d.diff),orphan:!c,source:f,__score:createdScore(f),__index:Number(idx||0)}}
function clean(r){return {id:r.id,customerId:r.customerId,customerName:r.customerName,phone:r.phone,balance:r.balance,status:r.status,promiseDate:r.promiseDate,amount:r.amount,note:r.note,date:r.date,createdAt:r.createdAt,dueKind:r.dueKind,dueDiff:r.dueDiff,orphan:r.orphan,source:r.source}}
function forCustomer(cid){cid=key(cid);if(!cid)return [];var cm=customerMap(),c=cm.get(cid)||null;return arr('followups').map(function(f,i){return {f:f,i:i}}).filter(function(x){return x.f&&key(x.f.customerId)===cid}).map(function(x){return record(x.f,c,x.i)}).sort(function(a,b){if(a.__score!==b.__score)return b.__score-a.__score;return b.__index-a.__index}).map(clean)}
function summary(cid){cid=key(cid);var cm=customerMap(),c=cm.get(cid)||null,events=forCustomer(cid),counts={events:events.length,withPromise:0,withNote:0,settled:0};events.forEach(function(r){if(txt(r.promiseDate).trim())counts.withPromise++;if(txt(r.note).trim())counts.withNote++;if(txt(r.status).trim()==='تسویه شد')counts.settled++});return {version:VERSION,customerId:cid,customer:c,customerName:txt(c&&c.name)||'مشتری حذف‌شده',phone:txt(c&&c.phone),balance:num(c&&c.balance),orphan:!c,counts:counts,latest:events[0]||null,events:events}}
function capabilities(){return {readsExistingFollowups:true,fullHistoryPerCustomer:true,readOnlyTimeline:true,noDataMutation:true,noStorageWrite:true,noFinancialEffect:true,noSchemaChange:true,usesCustomerBalanceReadOnly:true}}
window.AlanRangFollowupTimelineV39200=Object.freeze({version:VERSION,forCustomer:forCustomer,summary:summary,capabilities:capabilities});
})();
