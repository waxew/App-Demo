(function(){
'use strict';
if(window.__ALANRANG_LONGTERM_V39340__)return;
window.__ALANRANG_LONGTERM_V39340__=true;
var VERSION='39.34.0-offdevice-backup-v02';
function bridge(){try{return window.AlanRangAndroid||window.AndroidAlanRangBackup||null}catch(_){return null}}
function utf8b64(text){var s=String(text==null?'':text);try{var bytes=new TextEncoder().encode(s),out='',chunk=0x4000;for(var i=0;i<bytes.length;i+=chunk)out+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+chunk,bytes.length)));return btoa(out)}catch(_){try{return btoa(unescape(encodeURIComponent(s)))}catch(__){return ''}}}
async function createOffDeviceCopy(){
  var api=window.AlanRangLongTerm;
  if(!api||typeof api.createVerifiedBackup!=='function')return {ok:false,message:'موتور پشتیبان چندنسلی آماده نیست.'};
  var result=await api.createVerifiedBackup({reason:'off-device'});if(!result.ok)return result;
  var b=bridge(),encoded=utf8b64(result.encrypted);
  if(!b||typeof b.shareData!=='function'||!encoded)return {ok:false,localSaved:true,entry:result.entry,message:'پشتیبان محلی سالم ساخته شد، اما اشتراک‌گذاری خارج از گوشی در دسترس نیست.'};
  var started=false;try{started=!!b.shareData(encoded,'application/octet-stream',result.filename,'ذخیره نسخه خارج از گوشی')}catch(_){started=false}
  return {ok:started,shareStarted:started,localSaved:true,entry:result.entry,message:started?'پنجره اشتراک‌گذاری باز شد. این فایل رمزگذاری‌شده را روی یک محل مستقل از گوشی ذخیره کن.':'پشتیبان محلی سالم ساخته شد، اما پنجره اشتراک‌گذاری باز نشد.'};
}
window.AlanRangLongTerm=window.AlanRangLongTerm||{};
window.AlanRangLongTerm.version39340=VERSION;
window.AlanRangLongTerm.createOffDeviceCopy=createOffDeviceCopy;
window.AlanRangLongTermV39340={version:VERSION,createOffDeviceCopy:createOffDeviceCopy};
})();
