(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_V39170_STAGE3__)return;
window.__ALANRANG_FOLLOWUP_V39170_STAGE3__=true;
var VERSION='39.17.0-followup-stage3-diagnostics-v01';
function arr(name){try{return window.data&&Array.isArray(data[name])?data[name]:[]}catch(_){return []}}
function s(v){return String(v==null?'':v)}
function inspect(){
  var customers=new Set(arr('customers').map(function(c){return s(c&&c.id)})),ids=new Set(),issues=[];
  var engine=window.AlanRangFollowupV39170;
  arr('followups').forEach(function(f,index){
    if(!f||typeof f!=='object'){issues.push({type:'invalidRecord',index:index});return}
    var id=s(f.id),cid=s(f.customerId);
    if(!cid)issues.push({type:'missingCustomerId',index:index,id:id});else if(!customers.has(cid))issues.push({type:'orphanCustomer',index:index,id:id,customerId:cid});
    if(id){if(ids.has(id))issues.push({type:'duplicateId',index:index,id:id});ids.add(id)}else issues.push({type:'missingId',index:index});
    if(s(f.promiseDate).trim()&&engine&&engine.parseJalali&&!engine.parseJalali(f.promiseDate))issues.push({type:'invalidPromiseDate',index:index,id:id,value:s(f.promiseDate)});
  });
  var counts={};issues.forEach(function(x){counts[x.type]=(counts[x.type]||0)+1});
  return {version:VERSION,clean:issues.length===0,issueCount:issues.length,issues:issues,counts:counts,records:arr('followups').length,customers:arr('customers').length};
}
window.AlanRangFollowupDiagnosticsV39170=Object.freeze({version:VERSION,inspect:inspect,capabilities:function(){return {readOnlyDiagnostics:true,noAutomaticRepair:true,noFinancialMutation:true,noStorageWrite:true}}});
})();
