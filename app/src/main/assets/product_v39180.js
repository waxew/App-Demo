(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_ALERTS_V39180_STAGE1__)return;
window.__ALANRANG_FOLLOWUP_ALERTS_V39180_STAGE1__=true;
var VERSION='39.18.0-followup-alerts-stage1-engine-v01';
function base(){var a=window.AlanRangFollowupV39170;return a&&typeof a.snapshot==='function'?a:null}
function snapshot(){
  var a=base();if(!a)return {version:VERSION,available:false,counts:{overdue:0,today:0,next7:0,open:0},urgent:0,upcoming:0,top:[],source:null};
  var s=a.snapshot(),rows=Array.isArray(s.rows)?s.rows:[];
  var actionable=rows.filter(function(r){return r&&!r.orphan&&(r.kind==='overdue'||r.kind==='today'||r.kind==='next7')});
  var c=s.counts||{},overdue=Number(c.overdue||0),today=Number(c.today||0),next7=Number(c.next7||0),open=Number(c.open||0);
  return {version:VERSION,available:true,counts:{overdue:overdue,today:today,next7:next7,open:open},urgent:overdue+today,upcoming:next7,top:actionable.slice(0,3),source:s};
}
function capabilities(){return {readsV39170:true,noDataMutation:true,noStorageWrite:true,noFinancialEffect:true,noSchemaChange:true,noOsNotificationPermission:true,sessionRenderOnly:true}}
window.AlanRangFollowupAlertsV39180=Object.freeze({version:VERSION,snapshot:snapshot,capabilities:capabilities});
})();
