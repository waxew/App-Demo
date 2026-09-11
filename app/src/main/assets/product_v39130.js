(function(){
'use strict';
if(window.__ALANRANG_REPORTS_V39130_STAGE1__)return;
window.__ALANRANG_REPORTS_V39130_STAGE1__=true;

var VERSION='39.13.0-reports-stage1-contract-v01';
var CONTRACT_VERSION='alanrang-report-contract-v1';
var READ_ONLY=true;
var KINDS={CHECKS:'checks',CUSTOMER:'customer_statement',MONTHLY:'monthly_profit'};

function text(v){return String(v==null?'':v).trim()}
function number(v){var n=Number(v);return isFinite(n)?n:0}
function abs(v){return Math.abs(number(v))}
function clone(v){return JSON.parse(JSON.stringify(v==null?null:v))}
function nowIso(){return new Date().toISOString()}
function checksApi(){return window.AlanRangChecksOpsV39120||null}
function customerApi(){return window.AlanRangCustomerAccountV39100||null}
function monthlyApi(){return window.AlanRangMonthlyReportV3954||null}
function parseDate(value){
  try{if(typeof parseJalaliDate==='function'){var p=parseJalaliDate(value||'');if(p&&p.jy&&p.jm&&p.jd)return {jy:+p.jy,jm:+p.jm,jd:+p.jd}}}catch(_){}
  var s=text(value).replace(/[\u06f0-\u06f9]/g,function(d){return String(d.charCodeAt(0)-0x06f0)}).replace(/[\u0660-\u0669]/g,function(d){return String(d.charCodeAt(0)-0x0660)});
  var m=s.match(/((?:13|14)\d{2})\D+(\d{1,2})\D+(\d{1,2})/);
  return m?{jy:+m[1],jm:+m[2],jd:+m[3]}:null;
}
function dateSerial(value){
  var p=typeof value==='object'&&value?value:parseDate(value);if(!p)return null;
  try{if(typeof j2d==='function')return j2d(p.jy,p.jm,p.jd)}catch(_){}
  return p.jy*372+p.jm*31+p.jd;
}
function normalizeQuery(v){return text(v).toLowerCase().replace(/[\u064a\u0649]/g,'\u06cc').replace(/\u0643/g,'\u06a9').replace(/[\s\u200c\u200e\u200f]+/g,' ').trim()}
function sourceVersions(){
  return {
    checks:text((window.AlanRangChecksV39120||{}).version),
    checkOps:text((checksApi()||{}).version),
    customerAccount:text((customerApi()||{}).version),
    monthlyReport:'v39.5.4-canonical-monthly-report'
  };
}
function envelope(kind,filters,columns,rows,summary,audit,extra){
  var out={contractVersion:CONTRACT_VERSION,engineVersion:VERSION,kind:kind,readOnly:true,generatedAt:nowIso(),sourceVersions:sourceVersions(),filters:clone(filters||{}),columns:clone(columns||[]),rows:clone(rows||[]),summary:clone(summary||{}),audit:clone(audit||{clean:true,errors:[],warnings:[]})};
  if(extra)Object.keys(extra).forEach(function(k){out[k]=clone(extra[k])});
  return out;
}
function checkColumns(){return [
  {key:'rowNo',label:'Row',type:'number'},
  {key:'canonicalId',label:'Canonical ID',type:'text'},
  {key:'direction',label:'Direction',type:'text'},
  {key:'status',label:'Status',type:'text'},
  {key:'customer',label:'Customer',type:'text'},
  {key:'bank',label:'Bank',type:'text'},
  {key:'checkNumber',label:'Check Number',type:'text'},
  {key:'amount',label:'Amount',type:'money'},
  {key:'date',label:'Issue Date',type:'date'},
  {key:'dueDate',label:'Due Date',type:'date'},
  {key:'invoiceNumber',label:'Invoice',type:'text'},
  {key:'spentTo',label:'Spent To',type:'text'},
  {key:'notes',label:'Notes',type:'text'}
]}
function buildChecks(options){
  options=options||{};var api=checksApi();if(!api||typeof api.buildReport!=='function')return envelope(KINDS.CHECKS,options,checkColumns(),[],{}, {clean:false,errors:[{type:'checksSourceUnavailable'}],warnings:[]});
  var src=api.buildReport(options),rows=(src.rows||[]).map(function(r,i){return {rowNo:i+1,canonicalId:text(r.id),direction:text(r.direction),status:text(r.status),customer:text(r.customerName||r.ownerName),bank:text(r.bankName),checkNumber:text(r.checkNumber),amount:abs(r.amount),date:text(r.date),dueDate:text(r.dueDate),invoiceNumber:text(r.invoiceNumber),spentTo:text(r.spentTo),notes:text(r.notes)}});
  var audit=auditChecks(rows,src.summary||{});var sourceAudit=src.audit||{clean:true,errors:[],warnings:[]};
  if(sourceAudit.errors&&sourceAudit.errors.length){audit.clean=false;audit.errors.push({type:'sourceAuditErrors',count:sourceAudit.errors.length})}
  if(sourceAudit.warnings&&sourceAudit.warnings.length)audit.warnings.push({type:'sourceAuditWarnings',count:sourceAudit.warnings.length});
  return envelope(KINDS.CHECKS,options,checkColumns(),rows,src.summary||{},audit,{canonical:true,sourceAudit:sourceAudit,today:src.today||null});
}
function customerColumns(){return [
  {key:'rowNo',label:'Row',type:'number'},
  {key:'date',label:'Date',type:'date'},
  {key:'kind',label:'Type',type:'text'},
  {key:'reference',label:'Reference',type:'text'},
  {key:'debit',label:'Debit',type:'money'},
  {key:'credit',label:'Credit',type:'money'},
  {key:'runningBalance',label:'Running Balance',type:'money_signed'},
  {key:'note',label:'Note',type:'text'}
]}
function eventRef(row){if(!row)return '';if(row.invoiceNumber)return text(row.invoiceNumber);if(row.documentNumber)return text(row.documentNumber);if(row.paymentId)return text(row.paymentId);return text(row.id)}
function eventMatches(row,options){
  var from=dateSerial(options.from),to=dateSerial(options.to),d=dateSerial(row.date);
  if(from!=null&&(d==null||d<from))return false;if(to!=null&&(d==null||d>to))return false;
  var q=normalizeQuery(options.query);if(q){var hay=normalizeQuery([row.kindLabel,row.kind,row.invoiceNumber,row.documentNumber,row.method,row.status,row.note,row.amount,row.date].join(' '));if(hay.indexOf(q)<0)return false}
  return true;
}
function buildCustomer(customerId,options){
  options=options||{};var api=customerApi();if(!api||typeof api.build!=='function')return envelope(KINDS.CUSTOMER,Object.assign({customerId:customerId},options),customerColumns(),[],{}, {clean:false,errors:[{type:'customerSourceUnavailable'}],warnings:[]});
  var account=api.build(customerId);if(!account)return envelope(KINDS.CUSTOMER,Object.assign({customerId:customerId},options),customerColumns(),[],{}, {clean:false,errors:[{type:'customerMissing'}],warnings:[]});
  var events=(account.events||[]).filter(function(r){return eventMatches(r,options)}),rows=events.map(function(r,i){var a=number(r.amount);return {rowNo:i+1,date:text(r.date),kind:text(r.kindLabel||r.kind),reference:eventRef(r),debit:a>0?a:0,credit:a<0?Math.abs(a):0,runningBalance:number(r.running),note:text(r.note)}});
  var visibleDebit=rows.reduce(function(s,r){return s+r.debit},0),visibleCredit=rows.reduce(function(s,r){return s+r.credit},0);
  var summary={customerId:text(account.customerId),customerName:text(account.customer&&account.customer.name),openingBalance:number(account.openingBalance),storedBalance:number(account.storedBalance),expectedBalance:number(account.expectedBalance),balanceDelta:number(account.balanceDelta),reconciled:!!account.reconciled,visibleCount:rows.length,visibleDebit:visibleDebit,visibleCredit:visibleCredit,sourceSummary:clone(account.summary||{})};
  var audit=auditCustomer(rows,account,options);
  return envelope(KINDS.CUSTOMER,Object.assign({customerId:customerId},options),customerColumns(),rows,summary,audit,{customer:{id:text(account.customerId),name:text(account.customer&&account.customer.name),phone:text(account.customer&&account.customer.phone),address:text(account.customer&&account.customer.address)},invariants:account.invariants||{}});
}
function monthColumns(){return [
  {key:'month',label:'Month',type:'number'},
  {key:'customers',label:'Active Customers',type:'number'},
  {key:'invoices',label:'Invoices',type:'number'},
  {key:'sales',label:'Sales',type:'money'},
  {key:'purchases',label:'Purchases',type:'money'},
  {key:'profit',label:'Net',type:'money_signed'}
]}
function buildMonthly(year,options){
  options=options||{};var api=monthlyApi(),y=Number(year||options.year)||0;if(!api||typeof api.statsMonth!=='function')return envelope(KINDS.MONTHLY,{year:y},monthColumns(),[],{}, {clean:false,errors:[{type:'monthlySourceUnavailable'}],warnings:[]});
  var months=[];for(var m=1;m<=12;m++){var s=api.statsMonth(y,m)||{};months.push({month:m,customers:number(s.customers),invoices:number(s.invoices),sales:number(s.sales),purchases:number(s.purchases),profit:number(s.profit)})}
  if(options.month){var mm=Number(options.month)||0;months=months.filter(function(r){return r.month===mm})}
  var summary={year:y,months:months.length,invoices:months.reduce(function(s,r){return s+r.invoices},0),sales:months.reduce(function(s,r){return s+r.sales},0),purchases:months.reduce(function(s,r){return s+r.purchases},0),profit:months.reduce(function(s,r){return s+r.profit},0)};
  return envelope(KINDS.MONTHLY,{year:y,month:options.month||null},monthColumns(),months,summary,auditMonthly(months,summary),{formula:'sales - purchases = profit'});
}
function auditChecks(rows,summary){
  var errors=[],warnings=[],ids={};rows.forEach(function(r){if(!r.canonicalId)errors.push({type:'missingCanonicalId',row:r.rowNo});else if(ids[r.canonicalId])errors.push({type:'duplicateCanonicalId',id:r.canonicalId});else ids[r.canonicalId]=1;if(!isFinite(r.amount)||r.amount<0)errors.push({type:'invalidAmount',row:r.rowNo})});
  var total=rows.reduce(function(s,r){return s+abs(r.amount)},0);if(summary&&summary.total){if(number(summary.total.count)!==rows.length)errors.push({type:'summaryCountMismatch',expected:rows.length,actual:number(summary.total.count)});if(Math.abs(number(summary.total.amount)-total)>0.5)errors.push({type:'summaryAmountMismatch',expected:total,actual:number(summary.total.amount)})}
  return {clean:errors.length===0,errors:errors,warnings:warnings};
}
function auditCustomer(rows,account,options){
  var errors=[],warnings=[];rows.forEach(function(r){if(!isFinite(r.debit)||!isFinite(r.credit)||!isFinite(r.runningBalance))errors.push({type:'invalidCustomerNumber',row:r.rowNo})});
  if(!account.reconciled)errors.push({type:'customerAccountNotReconciled',customerId:text(account.customerId),delta:number(account.balanceDelta)});
  if(options&&options.query)warnings.push({type:'queryFilteredStatement',message:'Running balance is source balance, while visible totals are query-filtered.'});
  return {clean:errors.length===0,errors:errors,warnings:warnings};
}
function auditMonthly(rows,summary){
  var errors=[],warnings=[];rows.forEach(function(r){if(Math.abs((r.sales-r.purchases)-r.profit)>0.5)errors.push({type:'monthlyFormulaMismatch',month:r.month});if(!isFinite(r.sales)||!isFinite(r.purchases)||!isFinite(r.profit))errors.push({type:'invalidMonthlyNumber',month:r.month})});
  if(Math.abs((summary.sales-summary.purchases)-summary.profit)>0.5)errors.push({type:'yearFormulaMismatch'});
  return {clean:errors.length===0,errors:errors,warnings:warnings};
}
function auditReport(report){
  if(!report||report.contractVersion!==CONTRACT_VERSION)return {clean:false,errors:[{type:'invalidContract'}],warnings:[]};
  if(report.kind===KINDS.CHECKS)return auditChecks(report.rows||[],report.summary||{});
  if(report.kind===KINDS.CUSTOMER)return {clean:!!(report.audit&&report.audit.clean),errors:clone(report.audit&&report.audit.errors||[]),warnings:clone(report.audit&&report.audit.warnings||[])};
  if(report.kind===KINDS.MONTHLY)return auditMonthly(report.rows||[],report.summary||{});
  return {clean:false,errors:[{type:'unsupportedKind'}],warnings:[]};
}
function csvCell(value){
  var s=text(value);if(/^[=+@]/.test(s)||/^-[^0-9]/.test(s))s="'"+s;
  if(/[",\r\n]/.test(s))s='"'+s.replace(/"/g,'""')+'"';return s;
}
function toCsv(report){
  var a=auditReport(report);if(!a.clean)throw new Error('report contract audit failed');var columns=report.columns||[],lines=[];
  lines.push(columns.map(function(c){return csvCell(c.label||c.key)}).join(','));
  (report.rows||[]).forEach(function(row){lines.push(columns.map(function(c){return csvCell(row[c.key])}).join(','))});
  return '\ufeff'+lines.join('\r\n');
}
function fileDescriptor(report,format){
  format=text(format||'csv').toLowerCase();var ext=format==='xlsx'?'xlsx':format==='pdf'?'pdf':format==='jpg'||format==='jpeg'?'jpg':'csv';var stamp=(report.generatedAt||nowIso()).slice(0,10).replace(/-/g,'');
  return {kind:report.kind,format:format,extension:ext,mime:ext==='csv'?'text/csv;charset=utf-8':ext==='xlsx'?'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':ext==='pdf'?'application/pdf':'image/jpeg',suggestedName:'AlanRang_'+report.kind+'_'+stamp+'.'+ext,readOnly:true};
}
function capabilities(){return {version:VERSION,contractVersion:CONTRACT_VERSION,readOnly:READ_ONLY,kinds:[KINDS.CHECKS,KINDS.CUSTOMER,KINDS.MONTHLY],formatsPlanned:['csv','xlsx','pdf','jpg'],stage1FileWrites:false,canonicalChecksOnly:true,customerAccountEngineOnly:true,monthlyReportEngineOnly:true,csvFormulaInjectionGuard:true}}

window.AlanRangReportsV39130={version:VERSION,contractVersion:CONTRACT_VERSION,readOnly:READ_ONLY,kinds:KINDS,capabilities:capabilities,buildChecks:buildChecks,buildCustomerStatement:buildCustomer,buildMonthlyProfit:buildMonthly,audit:auditReport,toCsv:toCsv,fileDescriptor:fileDescriptor};
})();
