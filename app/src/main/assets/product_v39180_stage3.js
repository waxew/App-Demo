(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_ALERTS_V39180_STAGE3__)return;
window.__ALANRANG_FOLLOWUP_ALERTS_V39180_STAGE3__=true;
var VERSION='39.18.0-followup-alerts-stage3-policy-v01';
function current(s){s=s||{counts:{}};var c=s.counts||{},o=Number(c.overdue||0),t=Number(c.today||0),n=Number(c.next7||0);if(o>0)return {severity:'critical',title:'پیگیری عقب‌افتاده دارید',message:o+' مورد عقب‌افتاده'+(t?' و '+t+' مورد برای امروز':'')};if(t>0)return {severity:'due',title:'پیگیری امروز دارید',message:t+' مورد برای امروز آماده پیگیری است.'};if(n>0)return {severity:'upcoming',title:'پیگیری‌های نزدیک',message:n+' مورد در ۷ روز آینده موعد دارد.'};return {severity:'quiet',title:'پیگیری فوری ندارید',message:'در حال حاضر مورد عقب‌افتاده یا نزدیک ثبت نشده است.'}}
function capabilities(){return {deterministicPolicy:true,noTimer:true,noBackgroundService:true,noNotificationPermission:true,noStorageWrite:true,noFinancialEffect:true}}
window.AlanRangFollowupAlertPolicyV39180=Object.freeze({version:VERSION,current:current,capabilities:capabilities});
})();
