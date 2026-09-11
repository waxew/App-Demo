(function(){
'use strict';
if(window.__ALANRANG_LONGTERM_V39350__)return;
window.__ALANRANG_LONGTERM_V39350__=true;
var VERSION='39.35.0-emergency-recovery-set-v02';
var OFFICIAL_CERT_SHA256='00558486c79eba56727f1f7debade477a5ff4dbd5cc1c7ced112baaf44aa09f4';
function bridge(){try{return window.AlanRangAndroid||window.AndroidAlanRangBackup||null}catch(_){return null}}
function tag(){var d=new Date(),p=function(x){return String(x).padStart(2,'0')};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'_'+p(d.getHours())+'-'+p(d.getMinutes())+'-'+p(d.getSeconds())}
function utf8b64(text){var s=String(text==null?'':text);try{var bytes=new TextEncoder().encode(s),out='',chunk=0x4000;for(var i=0;i<bytes.length;i+=chunk)out+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+chunk,bytes.length)));return btoa(out)}catch(_){try{return btoa(unescape(encodeURIComponent(s)))}catch(__){return ''}}}
async function createEmergencyPackage(){
  var api=window.AlanRangLongTerm,b=bridge();
  if(!api||typeof api.createVerifiedBackup!=='function')return {ok:false,message:'موتور پشتیبان آماده نیست.'};
  if(!b||typeof b.saveDataV2!=='function')return {ok:false,message:'ذخیره Manifest نجات در این محیط در دسترس نیست.'};
  var fresh=await api.createVerifiedBackup({reason:'emergency-recovery-set'});if(!fresh.ok)return fresh;
  var metadata={app:'AlanRang Pro',format:'ALANRANG_EMERGENCY_RECOVERY_MANIFEST_V1',createdAt:new Date().toISOString(),purpose:'long-term-disaster-recovery',packageName:'ir.alanrang.pro',appVersion:String(window.ALANRANG_APP_VERSION||''),runtimeBuildId:String(window.ALANRANG_RUNTIME_BUILD_ID||''),dataSchemaVersion:Number(window.data&&data.schemaVersion||0),backupFilename:fresh.filename,backupSha256:fresh.sha256,backupStats:fresh.backup&&fresh.backup.stats||{},officialCertificateSha256:OFFICIAL_CERT_SHA256,privateSigningKeyIncluded:false,passwordIncluded:false,exactApkCompanionRequired:true,instructions:['این Manifest و فایل .alr را کنار APK رسمی همان Release نگه دار.','APK را فقط از بسته نجات رسمی همین Release بردار.','برنامه را حذف یا Clear Data نکن مگر در سناریوی بازیابی روی دستگاه جدید/خالی.','پس از نصب APK، Restore را فقط از فایل .alr با رمز پشتیبان انجام بده.']};
  var text=JSON.stringify(metadata,null,2),filename='AlanRang_Emergency_Recovery_Manifest_'+tag()+'.json',encoded=utf8b64(text);if(!encoded)return {ok:false,entry:fresh.entry,message:'ساخت Manifest نجات انجام نشد.'};
  var key='emergency-'+Date.now()+'-'+fresh.sha256.slice(0,12),saved=false;try{saved=!!b.saveDataV2(encoded,'application/json',filename,key)}catch(_){saved=false}
  if(!saved)return {ok:false,entry:fresh.entry,message:'پشتیبان سالم ساخته شد، اما Manifest نجات ذخیره نشد.'};
  return {ok:true,backupEntry:fresh.entry,manifest:{filename:filename,metadata:metadata},companionKitRequired:true,message:'پشتیبان نجات و Manifest ساخته شد. آن‌ها را کنار بسته APK/SOURCE رسمی همین نسخه نگه دار.'};
}
window.AlanRangLongTerm=window.AlanRangLongTerm||{};
window.AlanRangLongTerm.version39350=VERSION;
window.AlanRangLongTerm.createEmergencyPackage=createEmergencyPackage;
window.AlanRangLongTermV39350={version:VERSION,officialCertificateSha256:OFFICIAL_CERT_SHA256,createEmergencyPackage:createEmergencyPackage};
})();
