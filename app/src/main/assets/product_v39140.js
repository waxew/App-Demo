(function(){
'use strict';
if(window.__ALANRANG_ANALYTICS_V39140_STAGE1__)return;
window.__ALANRANG_ANALYTICS_V39140_STAGE1__=true;

var VERSION='39.14.0-analytics-stage1-contract-v01';
var CONTRACT='alanrang-business-analytics-v1';
var READ_ONLY=true;

function txt(v){return String(v==null?'':v).trim()}
function n(v){var x=Number(v);return isFinite(x)?x:0}
function abs(v){return Math.abs(n(v))}
function clone(v){return JSON.parse(JSON.stringify(v==null?null:v))}
function parseDate(value){
  try{if(typeof parseJalaliDate==='function'){var p=parseJalaliDate(value||'');if(p&&p.jy&&p.jm&&p.jd)return {jy:+p.jy,jm:+p.jm,jd:+p.jd}}}catch(_){}
  var s=txt(value).replace(/[\u06f0-\u06f9]/g,function(d){return String(d.charCodeAt(0)-0x06f0)}).replace(/[\u0660-\u0669]/g,function(d){return String(d.charCodeAt(0)-0x0660)});
  var m=s.match(/((?:13|14)\d{2})\D+(\d{1,2})\D+(\d{1,2})/);return m?{jy:+m[1],jm:+m[2],jd:+m[3]}:null;
}
function serial(p){if(!p)return null;try{if(typeof j2d==='function')return j2d(p.jy,p.jm,p.jd)}catch(_){}return p.jy*372+p.jm*31+p.jd}
function today(){try{if(typeof todayJalali==='function'){var t=todayJalali();if(t&&t.jy&&t.jm&&t.jd)return {jy:+t.jy,jm:+t.jm,jd:+t.jd}}}catch(_){}var d=new Date();return {jy:d.getFullYear(),jm:d.getMonth()+1,jd:d.getDate()}}
function previousMonth(y,m){m--;if(m<1){m=12;y--}return {y:y,m:m}}
function addMonthsBack(y,m,count){for(var i=0;i<count;i++){var p=previousMonth(y,m);y=p.y;m=p.m}return {y:y,m:m}}
function sameMonth(value,y,m){var p=parseDate(value);return !!(p&&p.jy===y&&p.jm===m)}
function percentChange(current,previous){current=n(current);previous=n(previous);if(previous===0)return current===0?0:null;return ((current-previous)/Math.abs(previous))*100}
function monthlyApi(){return window.AlanRangMonthlyReportV3954||null}
function accountApi(){return window.AlanRangCustomerAccountV39100||null}
function checksApi(){return window.AlanRangChecksOpsV39120||null}
function sourceData(){try{return window.data&&typeof window.data==='object'?window.data:{}}catch(_){return {}}}
function monthlyStats(y,m){var api=monthlyApi(),r={};try{if(api&&typeof api.statsMonth==='function')r=api.statsMonth(y,m)||{}}catch(_){}return {year:y,month:m,customers:n(r.customers),invoices:n(r.invoices),sales:n(r.sales),purchases:n(r.purchases),profit:n(r.profit)}}
function accountRows(){var api=accountApi();try{if(api&&typeof api.auditAll==='function'){var a=api.auditAll()||{};return {rows:Array.isArray(a.rows)?a.rows:[],mismatched:Array.isArray(a.mismatched)?a.mismatched:[],total:n(a.total),reconciled:n(a.reconciled)}}}catch(_){}return {rows:[],mismatched:[],total:0,reconciled:0}}
function receiptsForMonth(rows,y,m){var total=0,count=0;(rows||[]).forEach(function(a){(a.events||[]).forEach(function(e){if(e&&e.kind==='payment'&&sameMonth(e.date,y,m)){total+=abs(e.amount);count++}})});return {amount:total,count:count}}
function customerDebt(rows){var debt=0,credit=0,debtors=[];(rows||[]).forEach(function(a){var b=n(a.expectedBalance);if(b>0){debt+=b;debtors.push({customerId:txt(a.customerId),name:txt(a.customer&&a.customer.name),amount:b})}else if(b<0)credit+=Math.abs(b)});debtors.sort(function(a,b){return b.amount-a.amount||a.name.localeCompare(b.name)});return {debt:debt,credit:credit,debtors:debtors}}
function checksSnapshot(){var api=checksApi();try{if(api&&typeof api.buildReport==='function'){var r=api.buildReport({})||{},s=r.allSummary||r.summary||{};return {summary:clone(s),rows:clone(r.all||r.rows||[]),audit:clone(r.audit||{clean:true,errors:[],warnings:[]}),today:clone(r.today||today())}}}catch(_){}return {summary:{},rows:[],audit:{clean:false,errors:[{type:'checksUnavailable'}],warnings:[]},today:today()}}
function workSnapshot(t){var d=sourceData(),rows=Array.isArray(d.executiveWorks)?d.executiveWorks:[],active=[],late=[];var ts=serial(t);rows.forEach(function(w){if(!w||txt(w.status)==='تکمیل شده')return;active.push(w);var p=parseDate(w.endDate);if(p&&serial(p)<ts)late.push(w)});return {activeCount:active.length,lateCount:late.length,estimatedAmount:active.reduce(function(s,w){return s+abs(w.amount)},0),averageProgress:active.length?active.reduce(function(s,w){return s+Math.max(0,Math.min(100,n(w.progress)))},0)/active.length:0,late:late.slice(0,8).map(function(w){return {id:txt(w.id),customerId:txt(w.customerId),title:txt(w.title||'کار اجرایی'),endDate:txt(w.endDate),progress:n(w.progress),amount:abs(w.amount)}})}}
function followupSnapshot(){var d=sourceData(),rows=Array.isArray(d.followups)?d.followups:[];rows=rows.filter(function(f){return f&&txt(f.status)!=='تسویه شد'});return {count:rows.length,amount:rows.reduce(function(s,f){return s+abs(f.amount)},0)}}
function trend(rows,y,m,count){count=Math.max(3,Math.min(12,Number(count)||6));var out=[];for(var i=count-1;i>=0;i--){var p=addMonthsBack(y,m,i),s=monthlyStats(p.y,p.m),r=receiptsForMonth(rows,p.y,p.m);out.push({year:p.y,month:p.m,sales:s.sales,profit:s.profit,purchases:s.purchases,invoices:s.invoices,customers:s.customers,receipts:r.amount,receiptCount:r.count})}return out}
function topUpcoming(checks,t,max){var ts=serial(t);return (checks.rows||[]).filter(function(r){if(!r||txt(r.status)!=='in_flow')return false;var p=parseDate(r.dueDate);if(!p)return false;var diff=serial(p)-ts;return diff>=0&&diff<=7}).sort(function(a,b){return serial(parseDate(a.dueDate))-serial(parseDate(b.dueDate))||abs(b.amount)-abs(a.amount)}).slice(0,max||6).map(function(r){return {id:txt(r.id),direction:txt(r.direction),status:txt(r.status),customerId:txt(r.customerId),customer:txt(r.customerName||r.ownerName||'بدون مشتری'),amount:abs(r.amount),dueDate:txt(r.dueDate),bank:txt(r.bankName),checkNumber:txt(r.checkNumber)}})}
function build(options){options=options||{};var t=options.today||today(),y=+t.jy,m=+t.jm,prev=previousMonth(y,m),accounts=accountRows(),debt=customerDebt(accounts.rows),cur=monthlyStats(y,m),old=monthlyStats(prev.y,prev.m),curR=receiptsForMonth(accounts.rows,y,m),oldR=receiptsForMonth(accounts.rows,prev.y,prev.m),checks=checksSnapshot(),works=workSnapshot(t),followups=followupSnapshot();
  var checkSummary=checks.summary||{},activeChecks=checkSummary.active||{},overdueChecks=checkSummary.overdue||{},returnedChecks=checkSummary.returned||{},due7=checkSummary.due7||{};
  var out={contractVersion:CONTRACT,engineVersion:VERSION,readOnly:true,generatedAt:new Date().toISOString(),period:{year:y,month:m,previousYear:prev.y,previousMonth:prev.m},kpis:{sales:cur.sales,receipts:curR.amount,profit:cur.profit,purchases:cur.purchases,invoices:cur.invoices,customers:cur.customers,receivables:debt.debt,customerCredit:debt.credit,activeChecksCount:n(activeChecks.count),activeChecksAmount:n(activeChecks.amount),overdueChecksCount:n(overdueChecks.count),overdueChecksAmount:n(overdueChecks.amount),returnedChecksCount:n(returnedChecks.count),returnedChecksAmount:n(returnedChecks.amount),due7ChecksCount:n(due7.count),activeWorks:works.activeCount,lateWorks:works.lateCount,activeWorkAmount:works.estimatedAmount,averageWorkProgress:works.averageProgress,openFollowups:followups.count,openFollowupAmount:followups.amount},comparison:{sales:percentChange(cur.sales,old.sales),receipts:percentChange(curR.amount,oldR.amount),profit:percentChange(cur.profit,old.profit),previous:{sales:old.sales,receipts:oldR.amount,profit:old.profit}},trend:trend(accounts.rows,y,m,options.trendMonths),topDebtors:debt.debtors.slice(0,5),upcomingChecks:topUpcoming(checks,t,6),lateWorks:works.late,source:{customerAccounts:{total:accounts.total,reconciled:accounts.reconciled,mismatched:accounts.mismatched.length},checks:{audit:checks.audit},monthly:{version:txt((monthlyApi()||{}).version||'v39.5.4')},works:{source:'executiveWorks'},followups:{source:'followups'}}};
  out.audit=audit(out);return out;
}
function audit(snapshot){var errors=[],warnings=[];if(!snapshot||snapshot.contractVersion!==CONTRACT)errors.push({type:'contractMismatch'});var k=snapshot&&snapshot.kpis||{};Object.keys(k).forEach(function(key){if(typeof k[key]==='number'&&!isFinite(k[key]))errors.push({type:'nonFiniteKpi',key:key})});if(snapshot&&snapshot.source&&snapshot.source.customerAccounts&&snapshot.source.customerAccounts.mismatched)warnings.push({type:'customerAccountMismatch',count:snapshot.source.customerAccounts.mismatched});var ca=snapshot&&snapshot.source&&snapshot.source.checks&&snapshot.source.checks.audit||{};if(ca.errors&&ca.errors.length)warnings.push({type:'checkAuditErrors',count:ca.errors.length});return {clean:errors.length===0&&warnings.length===0,errors:errors,warnings:warnings}}
function capabilities(){return {readOnly:true,financialWrites:false,storageWrites:false,sourceMutation:false,trendMonths:[3,6,12],drillDown:true}}
window.AlanRangBusinessAnalyticsV39140={version:VERSION,contractVersion:CONTRACT,readOnly:READ_ONLY,build:build,audit:audit,capabilities:capabilities,parseDate:parseDate,percentChange:percentChange};
})();
