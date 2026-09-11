(function(){
'use strict';
if(window.__ALANRANG_ANALYTICS_V39140_STAGE3__)return;
window.__ALANRANG_ANALYTICS_V39140_STAGE3__=true;
var VERSION='39.14.0-analytics-stage3-insights-v01';
function n(v){var x=Number(v);return isFinite(x)?x:0}
function fmt(v){var x=n(v);return Math.round(x*10)/10}
function insights(snapshot){var k=snapshot&&snapshot.kpis||{},c=snapshot&&snapshot.comparison||{},out=[];
  if(c.sales==null)out.push({kind:'neutral',title:'فروش ماه',text:k.sales>0?'این ماه فروش ثبت شده اما ماه قبل مبنای مقایسه نداشته است.':'برای مقایسه فروش هنوز داده کافی وجود ندارد.'});else if(c.sales>10)out.push({kind:'good',title:'رشد فروش',text:'فروش این ماه حدود '+fmt(c.sales)+'٪ بیشتر از ماه قبل است.'});else if(c.sales<-10)out.push({kind:'warn',title:'افت فروش',text:'فروش این ماه حدود '+fmt(Math.abs(c.sales))+'٪ کمتر از ماه قبل است.'});else out.push({kind:'neutral',title:'فروش پایدار',text:'فروش این ماه نزدیک به ماه قبل است.'});
  var margin=k.sales>0?(k.profit/k.sales*100):0;out.push({kind:margin>=20?'good':margin>=0?'neutral':'warn',title:'حاشیه سود',text:'حاشیه سود ثبت‌شده این ماه حدود '+fmt(margin)+'٪ است.'});
  var collection=k.sales>0?(k.receipts/k.sales*100):0;out.push({kind:collection>=75?'good':collection>=40?'neutral':'warn',title:'نسبت وصول',text:'دریافت‌های این ماه معادل حدود '+fmt(collection)+'٪ فروش همین ماه است.'});
  if(k.overdueChecksCount>0)out.push({kind:'warn',title:'چک عقب‌افتاده',text:k.overdueChecksCount+' چک فعال از سررسید گذشته است و نیاز به پیگیری دارد.'});
  if(k.lateWorks>0)out.push({kind:'warn',title:'کار اجرایی عقب‌افتاده',text:k.lateWorks+' کار فعال از تاریخ پایان ثبت‌شده عبور کرده است.'});
  if(k.receivables>0&&snapshot.topDebtors&&snapshot.topDebtors.length){var top=(snapshot.topDebtors||[]).slice(0,3).reduce(function(s,r){return s+n(r.amount)},0),share=top/k.receivables*100;if(share>=70)out.push({kind:'neutral',title:'تمرکز مطالبات',text:'حدود '+fmt(share)+'٪ مطالبات روی سه مشتری اول متمرکز است.'})}
  return out.slice(0,6);
}
function trendDirection(snapshot){var t=snapshot&&snapshot.trend||[];if(t.length<2)return {sales:'flat',profit:'flat'};var a=t[t.length-2],b=t[t.length-1];function dir(x,y){return y>x?'up':y<x?'down':'flat'}return {sales:dir(n(a.sales),n(b.sales)),profit:dir(n(a.profit),n(b.profit))}}
window.AlanRangBusinessInsightsV39140={version:VERSION,readOnly:true,insights:insights,trendDirection:trendDirection};
})();
