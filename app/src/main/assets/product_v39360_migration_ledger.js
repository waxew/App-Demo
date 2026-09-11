(function(){
'use strict';
if(window.__ALANRANG_LONGTERM_V39360__)return;
window.__ALANRANG_LONGTERM_V39360__=true;
var VERSION='39.36.0-schema-migration-ledger-v01';
var KEY_LEDGER='alanrang_schema_migration_ledger_v1';
function clone(v){return JSON.parse(JSON.stringify(v))}
function get(k){try{return typeof alanRangStorageGetItem==='function'?alanRangStorageGetItem(k):localStorage.getItem(k)}catch(_){return null}}
function set(k,v){try{if(typeof alanRangStorageSetItem==='function'){alanRangStorageSetItem(k,v);return true}localStorage.setItem(k,v);return true}catch(_){return false}}
function read(){try{var x=JSON.parse(String(get(KEY_LEDGER)||'[]'));return Array.isArray(x)?x:[]}catch(_){return []}}
function write(rows){return set(KEY_LEDGER,JSON.stringify((Array.isArray(rows)?rows:[]).slice(-250)))}
function hasSuccess(id){return read().some(function(x){return x&&x.id===id&&x.status==='success'})}
function append(row){var rows=read();rows.push(Object.assign({at:new Date().toISOString(),appVersion:String(window.ALANRANG_APP_VERSION||''),runtimeBuildId:String(window.ALANRANG_RUNTIME_BUILD_ID||'')},row||{}));return write(rows)}
function recordCurrentMilestone(){var id='milestone:'+VERSION+':schema:'+Number(window.data&&data.schemaVersion||0);if(hasSuccess(id))return true;return append({id:id,kind:'milestone',fromSchema:Number(window.data&&data.schemaVersion||0),toSchema:Number(window.data&&data.schemaVersion||0),status:'success',dataMutation:false,idempotent:true})}
function runCoreMigration(id,fromSchema,toSchema,fn){
  id=String(id||'').trim();fromSchema=Number(fromSchema||0);toSchema=Number(toSchema||0);
  if(!id||typeof fn!=='function'||!toSchema)return {ok:false,message:'migration contract invalid'};
  if(hasSuccess(id))return {ok:true,alreadyApplied:true,id:id};
  if(!window.data||typeof data!=='object')return {ok:false,message:'core unavailable'};
  var current=Number(data.schemaVersion||0);if(current!==fromSchema)return {ok:false,message:'unexpected source schema',currentSchema:current,expectedSchema:fromSchema};
  var before=clone(data),work=clone(data);append({id:id,kind:'core',fromSchema:fromSchema,toSchema:toSchema,status:'started',dataMutation:true,idempotent:true});
  try{
    var out=fn(work);if(out&&typeof out==='object')work=out;
    if(!work||typeof work!=='object'||Array.isArray(work))throw new Error('invalid migrated core');
    work.schemaVersion=toSchema;
    data=work;
    if(typeof saveData!=='function'||saveData()!==true)throw new Error('verified save failed');
    if(Number(data.schemaVersion||0)!==toSchema)throw new Error('post-save schema mismatch');
    append({id:id,kind:'core',fromSchema:fromSchema,toSchema:toSchema,status:'success',dataMutation:true,idempotent:true});
    return {ok:true,id:id,fromSchema:fromSchema,toSchema:toSchema};
  }catch(error){
    var rollbackOk=false,rollbackError='';
    try{
      data=before;
      if(typeof saveData!=='function'||saveData()!==true)throw new Error('rollback verified save failed');
      if(Number(data.schemaVersion||0)!==fromSchema)throw new Error('rollback schema mismatch');
      rollbackOk=JSON.stringify(data)===JSON.stringify(before);
      if(!rollbackOk)throw new Error('rollback in-memory mismatch');
    }catch(re){rollbackError=String(re&&re.message||re||'rollback failed');rollbackOk=false}
    append({id:id,kind:'core',fromSchema:fromSchema,toSchema:toSchema,status:'failed',dataMutation:true,idempotent:true,rollbackVerified:rollbackOk,error:String(error&&error.message||error||'migration failed').slice(0,180),rollbackError:rollbackError.slice(0,180)});
    return rollbackOk?{ok:false,id:id,rolledBack:true,rollbackVerified:true,message:'migration failed and core was restored'}:{ok:false,id:id,rolledBack:false,rollbackFailed:true,recoveryRequired:true,message:'migration failed and verified rollback did not complete'};
  }
}
function status(){var rows=read(),failed=rows.filter(function(x){return x&&x.status==='failed'}),started=rows.filter(function(x){return x&&x.status==='started'&&!rows.some(function(y){return y&&y.id===x.id&&(y.status==='success'||y.status==='failed')&&String(y.at||'')>=String(x.at||'')})});return {version:VERSION,ledgerKey:KEY_LEDGER,entries:rows.length,failed:failed.length,incomplete:started.length,currentSchema:Number(window.data&&data.schemaVersion||0),rows:rows.slice(-20)}}
recordCurrentMilestone();
window.AlanRangLongTerm=window.AlanRangLongTerm||{};
Object.assign(window.AlanRangLongTerm,{version39360:VERSION,migrationLedgerKey:KEY_LEDGER,migrationStatus:status,runCoreMigration:runCoreMigration});
window.AlanRangLongTermV39360={version:VERSION,read:read,status:status,runCoreMigration:runCoreMigration};
})();
