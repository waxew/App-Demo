(function(){
'use strict';
if(window.__ALANRANG_FOLLOWUP_AGENDA_V39190_STAGE3__)return;
window.__ALANRANG_FOLLOWUP_AGENDA_V39190_STAGE3__=true;
var VERSION='39.19.0-followup-agenda-stage3-policy-v01';
function current(s){s=s||{counts:{}};var c=s.counts||{},o=Number(c.overdue||0),t=Number(c.today||0),n=Number(c.next7||0);if(o>0)return {level:'urgent',title:'ابتدا پیگیری‌های عقب‌افتاده',message:o+' مورد از موعد گذشته است.'};if(t>0)return {level:'today',title:'برنامه امروز',message:t+' پیگیری برای امروز ثبت شده است.'};if(n>0)return {level:'upcoming',title:'هفته پیش رو',message:n+' پیگیری در ۷ روز آینده دارید.'};return {level:'quiet',title:'برنامه فوری خالی است',message:'پیگیری عقب‌افتاده یا نزدیک ثبت نشده است.'}}
function capabilities(){return {deterministicAgendaPolicy:true,noTimer:true,noBackgroundService:true,noNotificationPermission:true,noStorageWrite:true,noFinancialEffect:true}}
window.AlanRangFollowupAgendaPolicyV39190=Object.freeze({version:VERSION,current:current,capabilities:capabilities});
})();
