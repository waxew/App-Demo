(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_V39170_STAGE1__)return;
window.__ALANRANG_FOLLOWUP_V39170_STAGE1__=true;
var VERSION='39.17.0-followup-stage1-engine-v01';
function rows(name){try{return window.data&&Array.isArray(data[name])?data[name]:[]}catch(_){return []}}
function txt(v){return String(v==null?'':v)}
function key(v){return txt(v)}
function num(v){var n=Number(String(v==null?'':v).replace(/[,٬،\s]/g,''));return isFinite(n)?n:0}
function latin(v){return txt(v).replace(/[۰-۹]/g,function(c){return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))}).replace(/[٠-٩]/g,function(c){return String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))})}
function norm(v){return latin(v).replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,' ').trim().toLowerCase()}
function customerMap(){var m=new Map();rows('customers').forEach(function(c){if(c&&!m.has(key(c.id)))m.set(key(c.id),c)});return m}
function createdScore(f){var s=txt(f&&f.createdAt);var t=Date.parse(s);if(isFinite(t))return t;return 0}
function parseJ(v){
  var raw=latin(v).replace(/-/g,'/').trim();if(!raw)return null;
  try{if(typeof window.parseJalaliDate==='function'){var p=window.parseJalaliDate(raw);if(p&&p.jy&&p.jm&&p.jd)return {jy:Number(p.jy),jm:Number(p.jm),jd:Number(p.jd)}}}catch(_){ }
  var m=raw.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);if(!m)return null;
  var jy=Number(m[1]),jm=Number(m[2]),jd=Number(m[3]);if(jm<1||jm>12||jd<1||jd>31)return null;return {jy:jy,jm:jm,jd:jd};
}
function ordinal(p){
  if(!p)return null;
  try{if(typeof window.j2d==='function')return Number(window.j2d(p.jy,p.jm,p.jd))}catch(_){ }
  var md=p.jm<=6?31:(p.jm<=11?30:29);if(p.jd>md)return null;
  return p.jy*372+(Math.min(p.jm,7)-1)*31+Math.max(0,p.jm-7)*30+p.jd;
}
function todayParts(){
  try{if(typeof window.todayJalali==='function'){var t=window.todayJalali();if(t&&t.jy)return {jy:Number(t.jy),jm:Number(t.jm),jd:Number(t.jd)}}}catch(_){ }
  try{if(typeof window.todayFa==='function')return parseJ(String(window.todayFa()).replace(/^.*?(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}).*$/,'$1'))}catch(_){ }
  return null;
}
function dueInfo(date,today){
  var p=parseJ(date);if(!p)return {valid:!txt(date).trim(),kind:txt(date).trim()?'invalidDate':'noDate',diff:null,parts:null};
  var a=ordinal(p),b=ordinal(today||todayParts());if(a==null||b==null)return {valid:false,kind:'invalidDate',diff:null,parts:p};
  var diff=a-b,kind=diff<0?'overdue':diff===0?'today':diff<=7?'next7':'later';
  return {valid:true,kind:kind,diff:diff,parts:p};
}
function latestEvents(){
  var by=new Map();rows('followups').forEach(function(f,idx){if(!f)return;var cid=key(f.customerId);if(!cid)return;var prev=by.get(cid);var score=createdScore(f);if(!prev||score>prev.score||(score===prev.score&&idx>prev.idx))by.set(cid,{f:f,score:score,idx:idx})});
  return Array.from(by.values(),function(x){return x.f});
}
function record(f,c,today){
  var settled=txt(f&&f.status)==='تسویه شد';var due=settled?{valid:true,kind:'settled',diff:null,parts:parseJ(f&&f.promiseDate)}:dueInfo(f&&f.promiseDate,today);
  return {id:key(f&&f.id),customerId:key(f&&f.customerId),customer:c||null,customerName:txt(c&&c.name)||'مشتری حذف‌شده',phone:txt(c&&c.phone),balance:num(c&&c.balance),status:txt(f&&f.status)||'پیگیری',promiseDate:txt(f&&f.promiseDate),amount:num(f&&f.amount),note:txt(f&&f.note),date:txt(f&&f.date),createdAt:txt(f&&f.createdAt),kind:due.kind,diff:due.diff,validDate:due.valid,orphan:!c,source:f};
}
var priority={overdue:0,today:1,next7:2,noDate:3,later:4,invalidDate:5,settled:6};
function compare(a,b){var pa=priority[a.kind]??9,pb=priority[b.kind]??9;if(pa!==pb)return pa-pb;if(a.diff!=null&&b.diff!=null&&a.diff!==b.diff)return a.diff-b.diff;var bal=Math.abs(b.balance)-Math.abs(a.balance);if(bal)return bal;return a.customerName.localeCompare(b.customerName,'fa')}
function snapshot(){
  var cm=customerMap(),today=todayParts();var list=latestEvents().map(function(f){return record(f,cm.get(key(f.customerId))||null,today)}).sort(compare);
  var counts={all:list.length,open:0,overdue:0,today:0,next7:0,noDate:0,later:0,invalidDate:0,settled:0,orphan:0};
  list.forEach(function(r){if(r.kind!=='settled')counts.open++;if(Object.prototype.hasOwnProperty.call(counts,r.kind))counts[r.kind]++;if(r.orphan)counts.orphan++});
  return {version:VERSION,today:today,rows:list,counts:counts,sourceEvents:rows('followups').length,customerCount:rows('customers').length};
}
function matches(r,q){q=norm(q);if(!q)return true;return norm([r.customerName,r.phone,r.status,r.promiseDate,r.amount,r.note,r.date].join(' ')).indexOf(q)>-1}
function filter(options){options=options||{};var kind=txt(options.kind||'open'),q=options.q||'';return snapshot().rows.filter(function(r){var k=kind==='all'?true:kind==='open'?r.kind!=='settled':r.kind===kind;return k&&matches(r,q)})}
function statusLabel(r){if(!r)return '';if(r.kind==='overdue')return Math.abs(Number(r.diff||0))+' روز گذشته';if(r.kind==='today')return 'امروز';if(r.kind==='next7')return Number(r.diff||0)+' روز مانده';if(r.kind==='noDate')return 'بدون موعد';if(r.kind==='invalidDate')return 'تاریخ نامعتبر';if(r.kind==='settled')return 'تسویه شده';return r.promiseDate||'آینده'}
function capabilities(){return {readOnlyEngine:true,noDataMutation:true,noFinancialFormulaChange:true,usesExistingFollowups:true,usesExistingCustomerBalancesReadOnly:true,noNewStorageSchema:true,latestEventPerCustomer:true}}
window.AlanRangFollowupV39170=Object.freeze({version:VERSION,snapshot:snapshot,filter:filter,parseJalali:parseJ,dueInfo:dueInfo,statusLabel:statusLabel,capabilities:capabilities});
})();
