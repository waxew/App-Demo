(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_AGENDA_V39190_STAGE1__)return;
window.__ALANRANG_FOLLOWUP_AGENDA_V39190_STAGE1__=true;
var VERSION='39.19.0-followup-agenda-stage1-engine-v01';
function base(){var a=window.AlanRangFollowupV39170;return a&&typeof a.snapshot==='function'?a:null}
function txt(v){return String(v==null?'':v)}
function copy(r){return {id:txt(r&&r.id),customerId:txt(r&&r.customerId),customerName:txt(r&&r.customerName),phone:txt(r&&r.phone),status:txt(r&&r.status),promiseDate:txt(r&&r.promiseDate),amount:Number(r&&r.amount||0),balance:Number(r&&r.balance||0),note:txt(r&&r.note),kind:txt(r&&r.kind),diff:r&&r.diff==null?null:Number(r.diff),orphan:!!(r&&r.orphan),source:r&&r.source||null}}
function sortRows(a,b){var ad=a.diff==null?999999:a.diff,bd=b.diff==null?999999:b.diff;if(ad!==bd)return ad-bd;return a.customerName.localeCompare(b.customerName,'fa')}
function snapshot(){
  var a=base();if(!a)return {version:VERSION,available:false,rows:[],days:[],counts:{all:0,overdue:0,today:0,next7:0,next30:0,noDate:0,later:0,invalidDate:0}};
  var s=a.snapshot(),rows=(Array.isArray(s.rows)?s.rows:[]).filter(function(r){return r&&r.kind!=='settled'}).map(copy).sort(sortRows);
  var c={all:rows.length,overdue:0,today:0,next7:0,next30:0,noDate:0,later:0,invalidDate:0};
  var dayMap=new Map();
  rows.forEach(function(r){
    if(r.kind==='overdue'||r.kind==='today'||r.kind==='noDate'||r.kind==='later'||r.kind==='invalidDate')c[r.kind]++;
    if(r.diff!=null&&r.diff>=0&&r.diff<=30){if(r.diff>=1&&r.diff<=7)c.next7++;if(r.diff>=1&&r.diff<=30)c.next30++;var k=r.promiseDate||('day-'+r.diff);if(!dayMap.has(k))dayMap.set(k,{date:r.promiseDate,diff:r.diff,rows:[]});dayMap.get(k).rows.push(r)}
  });
  var days=Array.from(dayMap.values()).sort(function(x,y){return x.diff-y.diff});
  return {version:VERSION,available:true,rows:rows,days:days,counts:c,source:s};
}
function filter(kind){var s=snapshot(),k=txt(kind||'all');if(k==='all')return s.rows;if(k==='overdue'||k==='today'||k==='noDate'||k==='invalidDate'||k==='later')return s.rows.filter(function(r){return r.kind===k});if(k==='next7')return s.rows.filter(function(r){return r.diff!=null&&r.diff>=1&&r.diff<=7});if(k==='next30')return s.rows.filter(function(r){return r.diff!=null&&r.diff>=1&&r.diff<=30});return s.rows}
function capabilities(){return {readsV39170:true,readOnlyAgenda:true,noDataMutation:true,noStorageWrite:true,noFinancialEffect:true,noSchemaChange:true,sessionComputationOnly:true}}
window.AlanRangFollowupAgendaV39190=Object.freeze({version:VERSION,snapshot:snapshot,filter:filter,capabilities:capabilities});
})();
