(function(){
'use strict';
if(window.__ALANRANG_LONGTERM_V39390__)return;
window.__ALANRANG_LONGTERM_V39390__=true;
var VERSION='39.39.0-signing-continuity-v02';
var EXPECTED_PACKAGE='ir.alanrang.pro';
var EXPECTED_VERSION='39.43.0-workshop-core-v000000000000001';
var EXPECTED_CERT='00558486c79eba56727f1f7debade477a5ff4dbd5cc1c7ced112baaf44aa09f4';
function status(){
  var b=window.AlanRangAndroid||window.AndroidAlanRangBackup,installed='';try{if(b&&typeof b.getAppVersion==='function')installed=String(b.getAppVersion()||'')}catch(_){ }
  var identityOk=installed===EXPECTED_VERSION;
  return {ok:identityOk,available:!!b,package:EXPECTED_PACKAGE,installedVersion:installed,expectedVersion:EXPECTED_VERSION,releaseCertificateSha256:EXPECTED_CERT,runtimeCertificateChecked:false,certificateMatches:null,updateLineageProof:'Android direct-update install + release-time cryptographic certificate verification',message:identityOk?'هویت نسخه نصب‌شده مطابق Release است. تطبیق گواهی در Gate ساخت و نصب Update کنترل می‌شود.':'هویت نسخه نصب‌شده با Release مورد انتظار تطبیق ندارد.'};
}
window.AlanRangLongTerm=window.AlanRangLongTerm||{};window.AlanRangLongTerm.version39390=VERSION;window.AlanRangLongTerm.signingStatus=status;
window.AlanRangLongTermV39390={version:VERSION,expectedPackage:EXPECTED_PACKAGE,expectedVersion:EXPECTED_VERSION,expectedCertificateSha256:EXPECTED_CERT,status:status};
})();
