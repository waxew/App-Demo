(function(){
'use strict';
if(window.__ALANRANG_CHECK_ENGINE_V39120__)return;
window.__ALANRANG_CHECK_ENGINE_V39120__=true;

var VERSION='39.12.0-checks-stage1-v01';
var AUDIT_REVISION='39.32.0-check-audit-fix2-v01';
var STATUS={IN_FLOW:'in_flow',SPENT:'spent',CLEARED:'cleared',RETURNED:'returned',CANCELLED:'cancelled'};
var DIRECTION={RECEIVED:'received',PAYABLE:'payable'};

function text(v){return String(v==null?'':v).trim()}
function n(v){
  try{if(typeof num==='function')return num(v)}catch(_){ }
  var x=Number(String(v==null?'':v).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(/,/g,'').replace(/[^0-9.\-]/g,''));
  return isFinite(x)?x:0;
}
function same(a,b){return text(a)===text(b)}
function norm(v){return text(v).toLowerCase().replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\s\u200c\u200e\u200f]+/g,' ').trim()}
function compact(v){return norm(v).replace(/[\s\-_/\\.]+/g,'')}
function dateParts(value){
  try{if(typeof parseJalaliDate==='function'){var p=parseJalaliDate(value||'');if(p&&p.jy&&p.jm&&p.jd)return {jy:n(p.jy),jm:n(p.jm),jd:n(p.jd)}}}catch(_){ }
  var s=String(value||'').replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)});
  var m=s.match(/((?:13|14)\d{2})\D+(\d{1,2})\D+(\d{1,2})/);
  return m?{jy:Number(m[1]),jm:Number(m[2]),jd:Number(m[3])}:null;
}
function dateSerial(value){var p=dateParts(value);return p?p.jy*10000+p.jm*100+p.jd:0}
function stamp(row){return Date.parse((row&&row.updatedAt)||(row&&row.createdAt)||'')||0}
function cloneLite(row){var out={};Object.keys(row||{}).forEach(function(k){if(k!=='checkFrontImage'&&k!=='checkBackImage')out[k]=row[k]});return out}

function normalizeStatus(value){
  var s=norm(value);
  if(/لغو|باطل|cancel/.test(s))return STATUS.CANCELLED;
  if(/برگشت|برگشتی|bounce|return/.test(s))return STATUS.RETURNED;
  if(/خرج|واگذار|انتقال/.test(s))return STATUS.SPENT;
  if(/وصول|تسویه|دریافت شده|دریافت‌شده|پاس شد|پاس‌شده|cleared|settled/.test(s))return STATUS.CLEARED;
  return STATUS.IN_FLOW;
}
function statusLabel(status,direction){
  status=normalizeStatus(status);direction=direction===DIRECTION.PAYABLE?DIRECTION.PAYABLE:DIRECTION.RECEIVED;
  if(status===STATUS.SPENT)return 'خرج شد';
  if(status===STATUS.CLEARED)return direction===DIRECTION.PAYABLE?'پاس شد':'وصول شد';
  if(status===STATUS.RETURNED)return 'برگشتی';
  if(status===STATUS.CANCELLED)return 'لغو شد';
  return 'در جریان';
}
function statusIsFinanciallyActive(status){status=normalizeStatus(status);return status!==STATUS.RETURNED&&status!==STATUS.CANCELLED}
function directionOf(row,fallback){
  var explicit=norm(row&&(row.checkDirection||row.direction||row.chequeDirection));
  if(/payable|outgoing|پرداخت|پرداختی|صادر/.test(explicit))return DIRECTION.PAYABLE;
  if(/received|incoming|دریافت|دریافتی|ورودی/.test(explicit))return DIRECTION.RECEIVED;
  var t=norm(row&&(row.type||row.transactionType||row.paymentType));
  if(/پرداخت|payable|outgoing/.test(t))return DIRECTION.PAYABLE;
  return fallback===DIRECTION.PAYABLE?DIRECTION.PAYABLE:DIRECTION.RECEIVED;
}
function isCheckFinance(row){
  if(!row)return false;
  var s=norm([row.type,row.method,row.paymentType,row.checkDirection,row.chequeDirection].filter(Boolean).join(' '));
  return s.indexOf('چک')>-1||s.indexOf('cheque')>-1||s.indexOf('check')>-1||!!text(row.checkNumber)||!!text(row.checkDueDate);
}
function isCheckPayment(row){
  try{if(window.AlanRangCustomerAccountV39100&&typeof window.AlanRangCustomerAccountV39100.isCheckPayment==='function')return !!window.AlanRangCustomerAccountV39100.isCheckPayment(row)}catch(_){ }
  if(!row)return false;
  var s=norm([row.method,row.type,row.paymentType].filter(Boolean).join(' '));
  return s.indexOf('چک')>-1||s.indexOf('cheque')>-1||s.indexOf('check')>-1||!!text(row.checkNumber);
}
function isAutoFinance(row){return !!(row&&(row.v352AutoFromInvoice||row.v353AutoFromInvoice||row.v354AutoFromInvoice||row.v352AutoKey||row.v353AutoKey||row.v354AutoKey||String(row.id||'').indexOf('fin_auto_')===0))}
function isMirrorPayment(row){return !!(row&&(row.v331TxId||String(row.id||'').indexOf('v331pay_')===0))}
function validPayment(row){
  try{if(window.AlanRangCustomerAccountV39100&&typeof window.AlanRangCustomerAccountV39100.validPayment==='function')return !!window.AlanRangCustomerAccountV39100.validPayment(row)}catch(_){ }
  return statusIsFinanciallyActive(row&&(row.status||row.checkStatus));
}
function customerBy(id){
  try{if(typeof customerById==='function')return customerById(id)}catch(_){ }
  return ((window.data&&Array.isArray(data.customers))?data.customers:[]).find(function(c){return c&&same(c.id,id)})||null;
}
function canonicalInvoiceRows(){
  try{if(typeof canonicalInvoices==='function'){var rows=canonicalInvoices();if(Array.isArray(rows))return rows.slice()}}catch(_){ }
  return ((window.data&&Array.isArray(data.invoices))?data.invoices:[]).slice();
}
function financeRows(){
  try{if(typeof state!=='undefined'&&state&&Array.isArray(state.v331FinanceTx))return state.v331FinanceTx.slice()}catch(_){ }
  try{
    var key=(typeof KEY!=='undefined'?KEY:'alanrang_pro')+'_v33_finance_transactions';
    if(typeof alanRangStorageGetItem==='function'){
      var raw=alanRangStorageGetItem(key),rows=raw?JSON.parse(raw):[];
      if(Array.isArray(rows))return rows;
    }
  }catch(_){ }
  return [];
}
function invoiceById(id,rows){return (rows||canonicalInvoiceRows()).find(function(inv){return inv&&same(inv.id,id)})||null}
function paymentIdentity(invoiceId,p,index){return text(invoiceId)+'|'+(text(p&&p.id)||('#'+index))}

function collectNodes(){
  var nodes=[],finIndex={},payIndex={},invoices=canonicalInvoiceRows();
  financeRows().forEach(function(tx,index){
    if(!isCheckFinance(tx))return;
    var node={nodeId:'f#'+index,kind:'finance',row:tx,index:index,sourceId:'finance:'+(text(tx.id)||('#'+index)),financeId:text(tx.id),invoiceId:text(tx.invoiceId),paymentId:text(tx.invoicePaymentId),auto:isAutoFinance(tx),mirror:false};
    nodes.push(node);if(node.financeId)(finIndex[node.financeId]||(finIndex[node.financeId]=[])).push(node);
  });
  invoices.forEach(function(inv,invoiceIndex){
    (Array.isArray(inv&&inv.payments)?inv.payments:[]).forEach(function(p,paymentIndex){
      if(!isCheckPayment(p))return;
      var pid=text(p.id),iid=text(inv.id),node={nodeId:'p#'+invoiceIndex+'#'+paymentIndex,kind:'payment',row:p,index:paymentIndex,invoiceIndex:invoiceIndex,sourceId:'payment:'+iid+':'+(pid||('#'+paymentIndex)),financeId:text(p.v331TxId),invoiceId:iid,paymentId:pid,auto:false,mirror:isMirrorPayment(p),invoice:inv};
      nodes.push(node);(payIndex[paymentIdentity(iid,p,paymentIndex)]||(payIndex[paymentIdentity(iid,p,paymentIndex)]=[])).push(node);
    });
  });
  return {nodes:nodes,finIndex:finIndex,payIndex:payIndex,invoices:invoices};
}
function groupNodes(){
  var c=collectNodes(),nodes=c.nodes,parent={};
  nodes.forEach(function(x){parent[x.nodeId]=x.nodeId});
  function root(id){while(parent[id]!==id){parent[id]=parent[parent[id]];id=parent[id]}return id}
  function union(a,b){var ra=root(a),rb=root(b);if(ra!==rb)parent[rb]=ra}
  Object.keys(c.finIndex).forEach(function(k){var a=c.finIndex[k];for(var i=1;i<a.length;i++)union(a[0].nodeId,a[i].nodeId)});
  Object.keys(c.payIndex).forEach(function(k){var a=c.payIndex[k];for(var i=1;i<a.length;i++)union(a[0].nodeId,a[i].nodeId)});
  nodes.forEach(function(node){
    if(node.kind==='payment'){
      var txId=text(node.row&&node.row.v331TxId);
      if(!txId&&String(node.paymentId||'').indexOf('v331pay_')===0)txId=String(node.paymentId).slice('v331pay_'.length);
      (c.finIndex[txId]||[]).forEach(function(f){union(node.nodeId,f.nodeId)});
    }else if(node.auto&&node.invoiceId&&node.paymentId){
      var exact=c.payIndex[node.invoiceId+'|'+node.paymentId]||[];
      exact.forEach(function(p){union(node.nodeId,p.nodeId)});
    }
  });
  var groups={};nodes.forEach(function(node){var r=root(node.nodeId);(groups[r]||(groups[r]=[])).push(node)});
  return {groups:Object.keys(groups).map(function(k){return groups[k]}),invoices:c.invoices};
}
function choosePrimary(group){
  var manual=group.filter(function(x){return x.kind==='finance'&&!x.auto}).sort(function(a,b){return stamp(b.row)-stamp(a.row)});
  if(manual.length)return manual[0];
  var payment=group.filter(function(x){return x.kind==='payment'&&!x.mirror}).sort(function(a,b){return stamp(b.row)-stamp(a.row)});
  if(payment.length)return payment[0];
  var finance=group.filter(function(x){return x.kind==='finance'}).sort(function(a,b){return stamp(b.row)-stamp(a.row)});
  if(finance.length)return finance[0];
  return group[0];
}
function values(group,field){
  var out=[];group.forEach(function(node){var v=node.row&&node.row[field];if(text(v)&&out.indexOf(v)<0)out.push(v)});return out;
}
function preferred(group,primary,fields){
  var order=[primary].concat(group.filter(function(x){return x!==primary&&x.kind==='finance'&&!x.auto}),group.filter(function(x){return x!==primary&&x.kind==='payment'&&!x.mirror}),group.filter(function(x){return x!==primary}));
  for(var i=0;i<order.length;i++)for(var j=0;j<fields.length;j++){var v=order[i].row&&order[i].row[fields[j]];if(text(v))return v}
  return '';
}
function sourceStatus(node){return text(node&&node.row&&(node.row.status||node.row.checkStatus))}
function canonicalRecord(group,invoices){
  var primary=choosePrimary(group),row=primary.row||{},inv=invoiceById(preferred(group,primary,['invoiceId']),invoices)||(primary.invoice||null);
  var invoiceId=text(inv&&inv.id)||text(preferred(group,primary,['invoiceId']));
  var customerId=text(preferred(group,primary,['customerId']))||text(inv&&inv.customerId);
  var direction=directionOf(row,primary.kind==='payment'?DIRECTION.RECEIVED:null);
  var rawStatus=sourceStatus(primary)||preferred(group,primary,['status','checkStatus'])||'در انتظار';
  var status=normalizeStatus(rawStatus),amount=Math.abs(n(preferred(group,primary,['amount'])));
  var accountingSources=group.filter(function(x){return x.kind==='payment'});
  var activeAccounting=accountingSources.filter(function(x){return validPayment(x.row)});
  var rawAccountCredit=activeAccounting.reduce(function(s,x){return s+Math.abs(n(x.row&&x.row.amount))},0);
  var accountCredit=direction===DIRECTION.RECEIVED?rawAccountCredit:0;
  var financeIds=group.filter(function(x){return x.kind==='finance'}).map(function(x){return text(x.row&&x.row.id)}).filter(Boolean);
  var paymentIds=group.filter(function(x){return x.kind==='payment'}).map(function(x){return text(x.row&&x.row.id)}).filter(Boolean);
  var primaryId=primary.kind==='finance'?(text(row.id)||primary.nodeId):(invoiceId+':'+(text(row.id)||primary.nodeId));
  var rec={
    id:'check:'+primary.kind+':'+primaryId,version:VERSION,direction:direction,status:status,statusLabel:statusLabel(status,direction),statusRaw:rawStatus,
    amount:amount,customerId:customerId,customerName:text((customerBy(customerId)||{}).name),invoiceId:invoiceId,invoiceNumber:text(inv&&(inv.invoiceNumber||inv.number)),invoicePaymentId:text(preferred(group,primary,['invoicePaymentId']))||text(primary.kind==='payment'&&row.id),
    receivedDate:text(preferred(group,primary,['date']))||text(inv&&inv.date),dueDate:text(preferred(group,primary,['dueDate','checkDueDate']))||text(preferred(group,primary,['date']))||text(inv&&inv.date),dueDateSerial:dateSerial(preferred(group,primary,['dueDate','checkDueDate','date'])||text(inv&&inv.date)),
    ownerName:text(preferred(group,primary,['ownerName','checkOwnerName','drawerName','payToName'])),bankName:text(preferred(group,primary,['bankName','checkBank'])),checkNumber:text(preferred(group,primary,['checkNumber'])),spentTo:text(preferred(group,primary,['spentTo'])),notes:text(preferred(group,primary,['notes','note'])),
    hasFrontImage:group.some(function(x){return !!text(x.row&&x.row.checkFrontImage)}),hasBackImage:group.some(function(x){return !!text(x.row&&x.row.checkBackImage)}),
    sourceCount:group.length,financeSourceCount:group.filter(function(x){return x.kind==='finance'}).length,paymentSourceCount:accountingSources.length,accountingEffectSourceCount:direction===DIRECTION.RECEIVED?activeAccounting.length:0,currentCustomerAccountCredit:accountCredit,currentCustomerAccountEffect:direction===DIRECTION.RECEIVED?-accountCredit:0,
    financiallyActive:statusIsFinanciallyActive(status),primarySource:primary.kind,hasManualFinanceSource:group.some(function(x){return x.kind==='finance'&&!x.auto}),hasAutoFinanceSource:group.some(function(x){return x.kind==='finance'&&x.auto}),hasMirrorPaymentSource:group.some(function(x){return x.kind==='payment'&&x.mirror}),
    financeIds:financeIds,paymentIds:paymentIds,sourceIds:group.map(function(x){return x.sourceId}),sourceStatuses:group.map(function(x){return {sourceId:x.sourceId,status:sourceStatus(x),normalized:normalizeStatus(sourceStatus(x))}}).filter(function(x){return !!x.status}),
    sourceRows:group.map(function(x){return {kind:x.kind,sourceId:x.sourceId,auto:!!x.auto,mirror:!!x.mirror,row:cloneLite(x.row)}}),sortStamp:Math.max.apply(Math,[0].concat(group.map(function(x){return stamp(x.row)})))
  };
  rec.strongDuplicateKey=strongDuplicateKey(rec);rec.probableDuplicateKey=probableDuplicateKey(rec);
  return rec;
}
function buildAll(){var g=groupNodes();return g.groups.map(function(group){return canonicalRecord(group,g.invoices)}).sort(function(a,b){return (a.dueDateSerial||99999999)-(b.dueDateSerial||99999999)||b.sortStamp-a.sortStamp||String(a.id).localeCompare(String(b.id))})}

function strongDuplicateKey(row){
  var no=compact(row&&row.checkNumber);if(!no)return '';
  var bank=compact(row&&row.bankName),party=compact(row&&row.customerId)||compact(row&&row.ownerName);
  if(!party)return '';
  return [row&&row.direction||DIRECTION.RECEIVED,party,bank,no].join('|');
}
function probableDuplicateKey(row){
  var amount=Math.abs(n(row&&row.amount)),due=dateSerial(row&&(row.dueDate||row.checkDueDate||row.date)),party=compact(row&&row.customerId)||compact(row&&row.ownerName);
  if(!amount||!due||!party)return '';
  return [row&&row.direction||DIRECTION.RECEIVED,party,amount,due].join('|');
}
function duplicateGroups(rows){
  rows=rows||buildAll();var strong={},probable={};
  rows.forEach(function(r){if(r.strongDuplicateKey)(strong[r.strongDuplicateKey]||(strong[r.strongDuplicateKey]=[])).push(r);if(r.probableDuplicateKey)(probable[r.probableDuplicateKey]||(probable[r.probableDuplicateKey]=[])).push(r)});
  return {strong:Object.keys(strong).filter(function(k){return strong[k].length>1}).map(function(k){return {key:k,rows:strong[k]}}),probable:Object.keys(probable).filter(function(k){return probable[k].length>1}).map(function(k){return {key:k,rows:probable[k]}})};
}
function candidateRecord(input){
  input=input||{};var direction=directionOf(input),status=normalizeStatus(input.status||input.checkStatus||'در انتظار');
  var r={id:text(input.id||input.canonicalId),direction:direction,status:status,amount:Math.abs(n(input.amount)),customerId:text(input.customerId),ownerName:text(input.ownerName||input.checkOwnerName),bankName:text(input.bankName||input.checkBank),checkNumber:text(input.checkNumber),dueDate:text(input.dueDate||input.checkDueDate||input.date),date:text(input.date)};
  r.strongDuplicateKey=strongDuplicateKey(r);r.probableDuplicateKey=probableDuplicateKey(r);return r;
}
function validateCandidate(input,rows){
  var c=candidateRecord(input),exclude=text(input&&(input.canonicalId||input.id)),all=rows||buildAll();
  var exact=all.filter(function(r){return (!exclude||(!same(r.id,exclude)&&r.financeIds.indexOf(exclude)<0&&r.paymentIds.indexOf(exclude)<0))&&c.strongDuplicateKey&&r.strongDuplicateKey===c.strongDuplicateKey});
  var probable=all.filter(function(r){return (!exclude||(!same(r.id,exclude)&&r.financeIds.indexOf(exclude)<0&&r.paymentIds.indexOf(exclude)<0))&&c.probableDuplicateKey&&r.probableDuplicateKey===c.probableDuplicateKey&&exact.indexOf(r)<0});
  var errors=[],warnings=[];
  if(!c.amount)errors.push({type:'invalidAmount',message:'مبلغ چک باید بیشتر از صفر باشد.'});
  if(!text(c.dueDate))errors.push({type:'missingDueDate',message:'تاریخ سررسید الزامی است.'});
  if(c.direction===DIRECTION.RECEIVED&&!text(c.customerId))errors.push({type:'missingCustomer',message:'چک دریافتی باید به مشتری متصل باشد.'});
  if(exact.length)errors.push({type:'strongDuplicate',message:'چک با شماره/بانک یکسان قبلاً ثبت شده است.',matches:exact.map(function(x){return x.id})});
  if(probable.length)warnings.push({type:'probableDuplicate',message:'چکی با مشتری، مبلغ و سررسید یکسان وجود دارد؛ قبل از ثبت بررسی شود.',matches:probable.map(function(x){return x.id})});
  return {ok:errors.length===0,candidate:c,errors:errors,warnings:warnings,strongMatches:exact,probableMatches:probable};
}

function transitionPlan(record,toStatus,options){
  options=options||{};var direction=record&&record.direction===DIRECTION.PAYABLE?DIRECTION.PAYABLE:DIRECTION.RECEIVED;
  var from=normalizeStatus(record&&record.status),to=normalizeStatus(toStatus),terminal={};terminal[STATUS.CLEARED]=1;terminal[STATUS.RETURNED]=1;terminal[STATUS.CANCELLED]=1;
  if(from===to)return {allowed:true,noOp:true,from:from,to:to,requiresConfirmation:false,financialAction:'none',reason:'same-status'};
  if(to===STATUS.SPENT&&direction!==DIRECTION.RECEIVED)return {allowed:false,noOp:false,from:from,to:to,requiresConfirmation:false,financialAction:'none',reason:'spent-only-for-received'};
  if(terminal[from]&&!options.allowCorrection)return {allowed:false,noOp:false,from:from,to:to,requiresConfirmation:true,financialAction:'none',reason:'terminal-status-requires-correction-mode'};
  var allowed=[STATUS.IN_FLOW,STATUS.CLEARED,STATUS.RETURNED,STATUS.CANCELLED];if(direction===DIRECTION.RECEIVED)allowed.splice(1,0,STATUS.SPENT);
  if(allowed.indexOf(to)<0)return {allowed:false,noOp:false,from:from,to:to,requiresConfirmation:false,financialAction:'none',reason:'unsupported-status'};
  var wasActive=statusIsFinanciallyActive(from),willActive=statusIsFinanciallyActive(to),action=wasActive===willActive?'none':(willActive?'activate':'deactivate');
  return {allowed:true,noOp:false,from:from,to:to,requiresConfirmation:action!=='none'||!!terminal[from]||!!terminal[to],financialAction:action,reason:options.allowCorrection&&terminal[from]?'correction':'normal'};
}

function filter(opts){
  opts=opts||{};var q=norm(opts.query),from=dateSerial(opts.from),to=dateSerial(opts.to),statuses=(opts.statuses||[]).map(normalizeStatus),directions=opts.directions||[];
  return buildAll().filter(function(r){
    if(opts.customerId&&!same(r.customerId,opts.customerId))return false;
    if(opts.invoiceId&&!same(r.invoiceId,opts.invoiceId))return false;
    if(statuses.length&&statuses.indexOf(r.status)<0)return false;
    if(directions.length&&directions.indexOf(r.direction)<0)return false;
    if(from&&r.dueDateSerial<from)return false;if(to&&r.dueDateSerial>to)return false;
    if(opts.financiallyActive!=null&&!!opts.financiallyActive!==!!r.financiallyActive)return false;
    if(q){var hay=norm([r.customerName,r.invoiceNumber,r.ownerName,r.bankName,r.checkNumber,r.notes,r.spentTo,r.amount,r.dueDate,r.statusLabel].join(' '));if(hay.indexOf(q)<0)return false}
    return true;
  });
}
function summary(rows){
  rows=rows||buildAll();var s={total:rows.length,received:0,payable:0,inFlow:0,spent:0,cleared:0,returned:0,cancelled:0,amount:0,activeAmount:0,accountCredit:0};
  rows.forEach(function(r){s[r.direction===DIRECTION.PAYABLE?'payable':'received']++;if(r.status===STATUS.IN_FLOW)s.inFlow++;else if(r.status===STATUS.SPENT)s.spent++;else if(r.status===STATUS.CLEARED)s.cleared++;else if(r.status===STATUS.RETURNED)s.returned++;else if(r.status===STATUS.CANCELLED)s.cancelled++;s.amount+=r.amount;if(r.financiallyActive)s.activeAmount+=r.amount;s.accountCredit+=r.currentCustomerAccountCredit});return s;
}
function reconcileCustomerAccount(customerId){
  var rows=buildAll().filter(function(r){return same(r.customerId,customerId)}),canonicalCredit=rows.reduce(function(s,r){return s+n(r.currentCustomerAccountCredit)},0),account=null;
  try{if(window.AlanRangCustomerAccountV39100&&typeof window.AlanRangCustomerAccountV39100.build==='function')account=window.AlanRangCustomerAccountV39100.build(customerId)}catch(_){ }
  var accountCredit=account&&account.summary?n(account.summary.checkPayments):canonicalCredit,delta=accountCredit-canonicalCredit;
  return {customerId:text(customerId),canonicalCheckPayments:canonicalCredit,customerAccountCheckPayments:accountCredit,delta:delta,reconciled:Math.abs(delta)<0.5,recordCount:rows.length};
}
function classifyStatusDrift(row){
  var all={},authoritative={},hasAuthoritative=false;
  (row&&row.sourceRows||[]).forEach(function(src){
    var raw=text(src&&src.row&&(src.row.status||src.row.checkStatus));if(!raw)return;
    var st=normalizeStatus(raw);all[st]=1;
    var shadow=src&&src.kind==='finance'&&!!src.auto;
    if(!shadow){authoritative[st]=1;hasAuthoritative=true}
  });
  var allKeys=Object.keys(all),authKeys=Object.keys(authoritative),shadowOnly=false;
  if(allKeys.length>1&&hasAuthoritative&&authKeys.length===1){
    var auth=authKeys[0];
    shadowOnly=(row&&row.sourceRows||[]).every(function(src){
      var raw=text(src&&src.row&&(src.row.status||src.row.checkStatus));if(!raw)return true;
      var st=normalizeStatus(raw);return st===auth||(src&&src.kind==='finance'&&!!src.auto);
    });
  }
  return {drift:allKeys.length>1,shadowOnly:shadowOnly,authoritativeStatuses:authKeys,allStatuses:allKeys};
}
function audit(){
  var rows=buildAll(),errors=[],warnings=[],invoices=canonicalInvoiceRows(),dups=duplicateGroups(rows);
  rows.forEach(function(r){
    if(!(r.amount>0))errors.push({type:'invalidAmount',id:r.id});
    if(!r.dueDate)warnings.push({type:'missingDueDate',id:r.id});
    if(r.customerId&&!customerBy(r.customerId))errors.push({type:'orphanCustomer',id:r.id,customerId:r.customerId});
    if(r.invoiceId){var inv=invoiceById(r.invoiceId,invoices);if(!inv)errors.push({type:'orphanInvoice',id:r.id,invoiceId:r.invoiceId});else if(r.customerId&&inv.customerId&&!same(r.customerId,inv.customerId))errors.push({type:'customerInvoiceMismatch',id:r.id,customerId:r.customerId,invoiceCustomerId:text(inv.customerId)});}
    if(r.accountingEffectSourceCount>1)errors.push({type:'doubleFinancialEffectRisk',id:r.id,count:r.accountingEffectSourceCount,paymentIds:r.paymentIds.slice()});
    var drift=classifyStatusDrift(r);if(drift.drift)warnings.push({type:'statusDrift',id:r.id,statuses:r.sourceStatuses,shadowOnly:!!drift.shadowOnly,authoritativeStatuses:drift.authoritativeStatuses});
    r.sourceRows.filter(function(x){return x.kind==='finance'&&x.auto&&text(x.row.invoicePaymentId)}).forEach(function(src){var found=r.sourceRows.some(function(p){return p.kind==='payment'&&same(p.row.id,src.row.invoicePaymentId)&&same(r.invoiceId,src.row.invoiceId||r.invoiceId)});if(!found)errors.push({type:'orphanAutoPaymentLink',id:r.id,financeId:text(src.row.id),invoicePaymentId:text(src.row.invoicePaymentId)});});
  });
  dups.strong.forEach(function(g){errors.push({type:'strongDuplicateCheck',key:g.key,ids:g.rows.map(function(r){return r.id})})});
  dups.probable.forEach(function(g){if(!g.rows.some(function(r){return r.strongDuplicateKey})||new Set(g.rows.map(function(r){return r.strongDuplicateKey})).size>1)warnings.push({type:'probableDuplicateCheck',key:g.key,ids:g.rows.map(function(r){return r.id})})});
  var customerReconciliation=((window.data&&Array.isArray(data.customers))?data.customers:[]).map(function(c){return reconcileCustomerAccount(c.id)}).filter(function(x){return !x.reconciled});
  customerReconciliation.forEach(function(x){errors.push({type:'customerAccountCheckMismatch',customerId:x.customerId,delta:x.delta,canonical:x.canonicalCheckPayments,customerAccount:x.customerAccountCheckPayments})});
  var healthWarnings=warnings.filter(function(x){return !(x&&x.type==='statusDrift'&&x.shadowOnly)});
  var observations=warnings.filter(function(x){return x&&x.type==='statusDrift'&&x.shadowOnly}).map(function(x){return {type:'shadowStatusDrift',id:x.id,authoritativeStatuses:(x.authoritativeStatuses||[]).slice(),sourceCount:(x.statuses||[]).length}});
  return {version:VERSION,auditRevision:AUDIT_REVISION,clean:errors.length===0,errors:errors,warnings:warnings,healthWarnings:healthWarnings,observations:observations,rows:rows,summary:summary(rows),duplicates:dups,customerReconciliation:customerReconciliation};
}

window.AlanRangChecksV39120={
  version:VERSION,auditRevision:AUDIT_REVISION,STATUS:STATUS,DIRECTION:DIRECTION,
  normalizeStatus:normalizeStatus,statusLabel:statusLabel,statusIsFinanciallyActive:statusIsFinanciallyActive,directionOf:directionOf,
  buildAll:buildAll,filter:filter,summary:summary,duplicateGroups:duplicateGroups,validateCandidate:validateCandidate,transitionPlan:transitionPlan,reconcileCustomerAccount:reconcileCustomerAccount,audit:audit
};
})();
