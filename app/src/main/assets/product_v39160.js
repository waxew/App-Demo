(function(){
'use strict';
if(window.__ALANRANG_PERFORMANCE_V39160_STAGE1__)return;
window.__ALANRANG_PERFORMANCE_V39160_STAGE1__=true;
var VERSION='39.16.0-performance-stage1-cache-v01';

var original={
  customerById:typeof window.customerById==='function'?window.customerById:null,
  invoiceById:typeof window.invoiceById==='function'?window.invoiceById:null,
  invoicesOf:typeof window.invoicesOf==='function'?window.invoicesOf:null,
  recalculateAllBalances:typeof window.recalculateAllBalances==='function'?window.recalculateAllBalances:null,
  saveData:typeof window.saveData==='function'?window.saveData:null
};

var cache={
  customersRef:null,customersLen:-1,customerIndex:null,
  invoicesRef:null,invoicesLen:-1,invoiceIndex:null,invoicesByCustomer:null,
  financialStamp:null
};
var metrics={
  customerIndexBuilds:0,invoiceIndexBuilds:0,
  customerLookupHits:0,invoiceLookupHits:0,invoicesOfHits:0,
  balanceRecalculations:0,balanceRecalculationsSkipped:0,
  invalidations:0,lastInvalidationReason:'boot'
};

function sameKey(v){return String(v==null?'':v)}
function rows(name){try{return window.data&&Array.isArray(data[name])?data[name]:[]}catch(_){return []}}
function numberText(v){var n=Number(v);return isFinite(n)?String(n):String(v==null?'':v)}
function mix(h,text){text=String(text==null?'':text);for(var i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}

function ensureCustomers(force){
  var list=rows('customers');
  if(!force&&cache.customerIndex&&cache.customersRef===list&&cache.customersLen===list.length)return cache.customerIndex;
  var map=new Map();
  list.forEach(function(c){if(c&&!map.has(sameKey(c.id)))map.set(sameKey(c.id),c)});
  cache.customersRef=list;cache.customersLen=list.length;cache.customerIndex=map;metrics.customerIndexBuilds++;
  return map;
}
function ensureInvoices(force){
  var list=rows('invoices');
  if(!force&&cache.invoiceIndex&&cache.invoicesRef===list&&cache.invoicesLen===list.length)return cache.invoiceIndex;
  var byId=new Map(),byCustomer=new Map();
  list.forEach(function(inv){
    if(!inv)return;
    var ik=sameKey(inv.id);if(!byId.has(ik))byId.set(ik,inv);
    var ck=sameKey(inv.customerId),bucket=byCustomer.get(ck);if(!bucket){bucket=[];byCustomer.set(ck,bucket)}bucket.push(inv);
  });
  cache.invoicesRef=list;cache.invoicesLen=list.length;cache.invoiceIndex=byId;cache.invoicesByCustomer=byCustomer;metrics.invoiceIndexBuilds++;
  return byId;
}
function indexedCustomerById(id){var map=ensureCustomers(false),value=map.get(sameKey(id))||null;if(value)metrics.customerLookupHits++;return value}
function indexedInvoiceById(id){var map=ensureInvoices(false),value=map.get(sameKey(id))||null;if(value)metrics.invoiceLookupHits++;return value}
function indexedInvoicesOf(customerId){ensureInvoices(false);var bucket=cache.invoicesByCustomer.get(sameKey(customerId))||[];metrics.invoicesOfHits++;return bucket.slice()}

function financialStamp(){
  var h=2166136261,customers=rows('customers'),invoices=rows('invoices');
  h=mix(h,'c:'+customers.length+'|i:'+invoices.length);
  customers.forEach(function(c){if(!c)return;h=mix(h,'|c|'+sameKey(c.id)+'|'+numberText(c.openingBalance))});
  invoices.forEach(function(inv){
    if(!inv)return;
    h=mix(h,'|i|'+sameKey(inv.id)+'|'+sameKey(inv.customerId));
    var items=Array.isArray(inv.items)?inv.items:[];h=mix(h,'|nI|'+items.length);
    items.forEach(function(it){if(!it)return;h=mix(h,'|it|'+numberText(it.quantity)+'|'+numberText(it.unitPrice))});
    var pays=Array.isArray(inv.payments)?inv.payments:[];h=mix(h,'|nP|'+pays.length);
    pays.forEach(function(p){if(!p)return;h=mix(h,'|p|'+numberText(p.amount)+'|'+String(p.status||'')+'|'+String(p.checkStatus||''))});
  });
  return h.toString(16);
}
function guardedRecalculateAllBalances(shouldSave){
  if(!original.recalculateAllBalances)return;
  if(shouldSave===true){
    metrics.balanceRecalculations++;
    var out=original.recalculateAllBalances.apply(this,arguments);
    cache.financialStamp=financialStamp();
    return out;
  }
  var stamp=financialStamp();
  if(cache.financialStamp===stamp){metrics.balanceRecalculationsSkipped++;return;}
  metrics.balanceRecalculations++;
  var result=original.recalculateAllBalances.apply(this,arguments);
  cache.financialStamp=financialStamp();
  return result;
}
function invalidate(reason){
  cache.customersRef=null;cache.customersLen=-1;cache.customerIndex=null;
  cache.invoicesRef=null;cache.invoicesLen=-1;cache.invoiceIndex=null;cache.invoicesByCustomer=null;
  cache.financialStamp=null;metrics.invalidations++;metrics.lastInvalidationReason=String(reason||'manual');
  return true;
}
function warm(){ensureCustomers(false);ensureInvoices(false);return true}
function wrappedSaveData(){invalidate('saveData');return original.saveData?original.saveData.apply(this,arguments):false}
function status(){return {
  version:VERSION,
  active:true,
  customerCount:rows('customers').length,
  invoiceCount:rows('invoices').length,
  financialStamp:cache.financialStamp,
  metrics:Object.assign({},metrics),
  capabilities:{indexedLookups:true,changeAwareBalanceRecalculation:true,noFinancialFormulaChange:true,noPersistentTelemetry:true}
}}

try{customerById=indexedCustomerById}catch(_){ }window.customerById=indexedCustomerById;
try{invoiceById=indexedInvoiceById}catch(_){ }window.invoiceById=indexedInvoiceById;
try{invoicesOf=indexedInvoicesOf}catch(_){ }window.invoicesOf=indexedInvoicesOf;
try{recalculateAllBalances=guardedRecalculateAllBalances}catch(_){ }window.recalculateAllBalances=guardedRecalculateAllBalances;
if(original.saveData){try{saveData=wrappedSaveData}catch(_){ }window.saveData=wrappedSaveData}

try{warm()}catch(error){console.error('v39.16 performance warmup',error)}

window.AlanRangPerformanceV39160=Object.freeze({
  version:VERSION,
  invalidate:invalidate,
  warm:warm,
  status:status,
  financialStamp:financialStamp,
  customerById:indexedCustomerById,
  invoiceById:indexedInvoiceById,
  invoicesOf:indexedInvoicesOf,
  recalculateAllBalances:guardedRecalculateAllBalances,
  capabilities:function(){return {indexedLookups:true,changeAwareBalanceRecalculation:true,preservesStringIdEquality:true,preservesInvoiceOrder:true,noFinancialFormulaChange:true,noPersistentTelemetry:true}}
});
})();
