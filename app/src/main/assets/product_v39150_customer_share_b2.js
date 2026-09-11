(function(){
'use strict';
if(window.__ALANRANG_V39150_CUSTOMER_SHARE_B2__)return;
window.__ALANRANG_V39150_CUSTOMER_SHARE_B2__=true;
var VERSION='39.15.0-customer-invoice-status-share-b2-v01';

function currentInvoice(){
  try{
    if(typeof getCurrentPreviewInvoice==='function')return getCurrentPreviewInvoice();
    if(!window.state)return null;
    return state.previewInvoiceId==='draft'?state.invoiceDraft:(typeof invoiceById==='function'?invoiceById(state.previewInvoiceId):null);
  }catch(_){return null}
}
function isExecutionInvoice(inv){
  if(!inv)return false;
  return String(inv.documentType||'')!=='proforma';
}
function effectiveValue(inv){
  if(!inv)return false;
  if(Object.prototype.hasOwnProperty.call(inv,'showCustomerAccountStatus'))return !!inv.showCustomerAccountStatus;
  try{
    var c=typeof customerById==='function'?customerById(inv.customerId):null;
    return !!(c&&c.includeDebtLevelInShare);
  }catch(_){return false}
}
function setValue(inv,value){
  if(!inv||!isExecutionInvoice(inv))return false;
  inv.showCustomerAccountStatus=!!value;
  try{
    if(window.state&&state.previewInvoiceId!=='draft'&&typeof saveData==='function')saveData();
  }catch(error){console.error('v39.15 B2 customer status share save',error)}
  return true;
}
function controlHtml(inv){
  if(!isExecutionInvoice(inv))return '';
  var on=effectiveValue(inv);
  return '<div class="ar-v39150-customer-share no-print" data-customer-status-share="'+(on?'on':'off')+'">'
    +'<div class="ar-v39150-customer-share-copy"><b>ارسال وضعیت مشتری</b><small>نمایش وضعیت حساب فقط برای همین فاکتور در عکس و PDF. این انتخاب هیچ تغییری در مانده مشتری ایجاد نمی‌کند.</small></div>'
    +'<button type="button" class="btn '+(on?'green':'ghost')+' ar-v39150-customer-share-toggle" data-action="toggleInvoiceCustomerStatusShare" aria-pressed="'+(on?'true':'false')+'">'
    +(on?'✅ ارسال شود':'ارسال نشود')+'</button></div>';
}
function toggle(){
  var inv=currentInvoice();
  if(!inv||!isExecutionInvoice(inv))return false;
  var next=!effectiveValue(inv);
  if(!setValue(inv,next))return false;
  try{if(typeof showToast==='function')showToast(next?'وضعیت مشتری همراه فاکتور ارسال می‌شود':'وضعیت مشتری از فاکتور ارسالی حذف شد')}catch(_){ }
  try{if(typeof renderApp==='function')renderApp()}catch(error){console.error('v39.15 B2 rerender',error)}
  return true;
}

var oldRenderPreview=window.renderPreviewPage;
if(typeof oldRenderPreview==='function'){
  window.renderPreviewPage=function(){
    var html=oldRenderPreview.apply(this,arguments),inv=currentInvoice();
    if(!inv||!isExecutionInvoice(inv))return html;
    var marker='<div class="invoice-actions-v10 invoice-actions-under-preview no-print">';
    if(html.indexOf(marker)<0)return html;
    return html.replace(marker,controlHtml(inv)+marker);
  };
}

var style=document.createElement('style');
style.id='ar-v39150-customer-share-b2-style';
style.textContent='.ar-v39150-customer-share{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;background:#fff;border:1.5px solid #d8a64a;border-radius:18px;padding:14px;margin:14px 0;box-shadow:0 8px 18px rgba(15,39,64,.06)}.ar-v39150-customer-share-copy{min-width:0}.ar-v39150-customer-share-copy b{display:block;color:#0f2740;font-size:16px;margin-bottom:5px}.ar-v39150-customer-share-copy small{display:block;color:#64748b;font-size:11px;line-height:1.9;font-weight:800}.ar-v39150-customer-share-toggle{min-width:132px;height:48px}.ar-v39150-customer-share[data-customer-status-share="on"]{background:#f0fdf4;border-color:#86efac}.ar-v39150-customer-share[data-customer-status-share="off"]{background:#fffaf0;border-color:#efd589}@media(max-width:370px){.ar-v39150-customer-share{grid-template-columns:1fr}.ar-v39150-customer-share-toggle{width:100%}}';
document.head.appendChild(style);

document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('[data-action="toggleInvoiceCustomerStatusShare"]'):null;
  if(!b)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  toggle();
},true);

window.AlanRangCustomerInvoiceStatusShareB2=Object.freeze({
  version:VERSION,
  effectiveValue:effectiveValue,
  setValue:setValue,
  controlHtml:controlHtml,
  toggle:toggle,
  capabilities:function(){return {alwaysVisibleOnInvoicePreview:true,perInvoiceChoice:true,changesCustomerBalance:false,changesFinancialRows:false,persistsPresentationChoice:true}}
});
})();
