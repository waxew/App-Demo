(function(){
'use strict';
if(window.AlanRangInvoiceRendererV3970)return;
const VERSION='39.43.1';
const IDS=['invoice_template_t4','invoice_template_t6','invoice_template_t7'];
const DEFAULT_ID='invoice_template_t4';
const REMOVED_IDS=new Set(['invoice_template_t1','invoice_template_t2','invoice_template_t3','invoice_template_t5','invoice_template_t8','invoice_template_default']);
const SHELL=window.AlanRangInvoiceFullShellDataV3970||{};
const W=1087,H=1536;
function fn(n,f){return typeof window[n]==='function'?window[n]:f}
const safe=v=>String(v==null?'':v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const num=v=>fn('num',x=>Number(String(x||'').replace(/[^0-9.-]/g,''))||0)(v);
const fa=v=>fn('faDigits',x=>String(x==null?'':x))(v);
const money=v=>fn('money',x=>(Number(x)||0).toLocaleString('fa-IR')+' تومان')(v);
const words=v=>{try{return fn('numberToWords',x=>String(x))(v)}catch(_){return String(v)}};
const card=v=>{try{return fn('displayCardNumber',x=>String(x||''))(v)}catch(_){return String(v||'')}};
const latinDigits=v=>String(v==null?'':v).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
function normalize(id){
  const raw=String(id||'').trim();
  if(IDS.includes(raw))return raw;
  if(REMOVED_IDS.has(raw)||!raw)return DEFAULT_ID;
  try{const ext=fn('normalizeInvoiceTemplateId',x=>x)(raw);return IDS.includes(ext)?ext:DEFAULT_ID}catch(_){return DEFAULT_ID}
}
function codeFrom(id){return normalize(id).replace('invoice_template_','')}
// The UI keeps the historic 14..30 setting for data compatibility, but the
// renderer converts it to a real, visible scale. Each final template has a
// small optical correction because its usable boxes and contrast differ.
const FONT_TUNING={t4:1.02,t6:1.05,t7:1.07};
function fontScaleFor(value,code){
  const n=Math.max(14,Math.min(30,Number(value)||26));
  const readableBase=1.18+(n-14)*.042;
  return Math.max(1.12,Math.min(1.95,readableBase*(FONT_TUNING[code]||1)));
}
function settings(){return (window.data&&data.settings)||{}}
function customer(inv){try{return fn('customerById',()=>null)(inv&&inv.customerId)||{}}catch(_){return {}}}
function account(inv){try{return fn('invoiceAccountBreakdown',()=>({}))(inv)||{}}catch(_){return {}}}
function asset(type){try{return fn('getActiveAssetImage',()=> '')(type)||''}catch(_){return ''}}
function resolveIdentityAssetSource(src){
  src=String(src||'').trim();if(!src)return '';
  try{if(typeof window.resolveDocumentAssetImage==='function')return window.resolveDocumentAssetImage(src)||''}catch(_){ }
  try{const engine=window.AlanRangDocumentEngineV2;if(engine&&typeof engine.resolveAsset==='function')return engine.resolveAsset(src)||''}catch(_){ }
  return src;
}
function identityAssetById(type,id){
  const s=settings(),list=Array.isArray(s[type])?s[type]:[],needle=String(id||'');
  const item=list.find(x=>x&&String(x.id||'')===needle);
  return item?resolveIdentityAssetSource(item.imageData||''):'';
}
function documentIdentityAssets(inv){
  const s=settings(),raw=inv&&inv.documentIdentity&&typeof inv.documentIdentity==='object'?inv.documentIdentity:null;
  const mode=raw&&raw.mode==='none'?'none':raw&&raw.mode==='custom'?'custom':'inherit';
  if(mode==='none')return {stamp:'',signature:''};
  if(mode==='custom'){
    const stamp=raw.showStamp===false?'':identityAssetById('stamps',raw.stampId);
    const signature=raw.showSignature===false?'':identityAssetById('signatures',raw.signatureId);
    return {stamp,signature};
  }
  if(s.showStampSignature===false)return {stamp:'',signature:''};
  return {stamp:asset('stamps'),signature:asset('signatures')};
}
function presentationNotes(inv){
  try{if(typeof window.AlanRangInvoicePresentationNotes==='function')return (window.AlanRangInvoicePresentationNotes(inv)||[]).filter(Boolean)}catch(_){}
  const out=[];
  if(inv&&inv.documentType==='proforma')out.push('این پیش‌فاکتور تا زمان تبدیل به فاکتور اجرا، اثر حسابداری ندارد.');
  String(inv&&inv.description||'').split(/\r?\n|<br\s*\/?\s*>/i).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean).forEach(x=>out.push(x));
  // Payment notes are private workshop/accounting notes. Customer-facing
  // invoice output contains only method, amount and date.
  (inv&&Array.isArray(inv.payments)?inv.payments:[]).forEach(p=>{const a=num(p.amount);if(a>0)out.push(`دریافت ${p.method||'نقدی'} مبلغ ${money(a)}${p.date?' در تاریخ '+p.date:''}`)});
  return [...new Set(out)].slice(0,8);
}
function shouldShowAccountStatus(inv,c){
  if(inv&&Object.prototype.hasOwnProperty.call(inv,'showCustomerAccountStatus'))return !!inv.showCustomerAccountStatus;
  return !!(c&&c.includeDebtLevelInShare);
}
function fallbackAccountStatus(final,c){
  const raw=num(final),amount=Math.abs(raw),l1=Math.max(0,num(c&&c.debtLevelLightLimit)||5000000),l2=Math.max(l1,num(c&&c.debtLevelMediumLimit)||20000000),l3=Math.max(l2,num(c&&c.debtLevelHeavyLimit)||50000000);
  if(raw<0)return {label:'بستانکار',tone:'blue',kind:'creditor',amount:raw,absoluteAmount:amount};
  if(raw===0)return {label:'تسویه',tone:'green',kind:'settled',amount:0,absoluteAmount:0};
  if(amount<=l1)return {label:'بدهکاری سبک',tone:'green',kind:'debtor',amount:raw,absoluteAmount:amount};
  if(amount<=l2)return {label:'بدهکاری متوسط',tone:'yellow',kind:'debtor',amount:raw,absoluteAmount:amount};
  if(amount<=l3)return {label:'بدهکاری سنگین',tone:'orange',kind:'debtor',amount:raw,absoluteAmount:amount};
  return {label:'بدهکاری بحرانی',tone:'red',kind:'debtor',amount:raw,absoluteAmount:amount};
}
function accountStatus(inv,c,final){
  if(!shouldShowAccountStatus(inv,c))return null;
  let src=null;try{if(typeof window.debtLevelInfoForInvoice==='function')src=window.debtLevelInfoForInvoice(inv)}catch(_){}
  const base=src&&src.label?src:fallbackAccountStatus(final,c),raw=num(base.amount!=null?base.amount:final),absoluteAmount=num(base.absoluteAmount!=null?base.absoluteAmount:Math.abs(raw));
  return {label:String(base.label||'تسویه'),tone:String(base.tone||'green'),kind:String(base.kind||(raw<0?'creditor':raw>0?'debtor':'settled')),amount:raw,absoluteAmount};
}
function viewModel(inv){
  const s=settings(),c=customer(inv),ac=account(inv),rows=(inv&&Array.isArray(inv.items)?inv.items:[]).filter(x=>x&&(String(x.description||'').trim()||num(x.quantity)||num(x.unitPrice)));
  const total=num(ac.totalAmount!=null?ac.totalAmount:rows.reduce((z,x)=>z+num(x.quantity)*num(x.unitPrice),0));
  const prev=num(ac.previousBalance||0),debt=num(ac.totalDebt!=null?ac.totalDebt:prev+total),received=num(ac.received||0),final=num(ac.finalBalance!=null?ac.finalBalance:debt-received);
  const templateId=normalize((inv&&inv.invoiceTemplateId)||s.activeInvoiceTemplateId),code=codeFrom(templateId),fontSize=Math.max(14,Math.min(30,Number(s.invoiceFontSize)||26));
  const kind=String(inv&&inv.documentType||''),adjustmentKind=String(inv&&inv.adjustmentKind||''),wordsAmount=kind==='proforma'?total:final;
  const documentTitle=kind==='proforma'?'پیش‌فاکتور':kind==='invoiceAdjustmentPreview'?(adjustmentKind==='increase'?'سند اصلاح افزایشی':adjustmentKind==='decrease'?'سند اصلاح کاهشی':'سند برگشت فاکتور'):'فاکتور اجرا';
  return {templateId,code,documentTitle,invoice:inv||{},customer:c,rows,summary:{total,prev,debt,received,final,words:(wordsAmount<0?'منفی ':'')+words(Math.abs(Math.round(wordsAmount)))+' تومان'},notes:presentationNotes(inv),status:accountStatus(inv,c,final),contact:{phone1:String(s.phone1||''),phone2:String(s.phone2||''),address:String(s.address||'')},payment:{name:String(s.signerName||''),nationalId:String(s.nationalId||''),card:card(s.cardNumber)},assets:documentIdentityAssets(inv),flags:{showAmountInWords:s.showAmountInWords!==false},fontSize,fontScale:fontScaleFor(fontSize,code)};
}

// Field profile contract: every dynamic text field is bounded by x/y/width/height/alignment/fontSize/fontWeight/lineHeight/maxLines.
const PROFILES={
 t4:{
  paper:'#fffaf0',ink:'#102238',gold:'#b9851e',contactColor:'#f5e7bd',contactMaxScale:1.82,contactLatinDigits:true,drawInfoLabels:true,dark:false,footerY:1452,
  contact:{phone1:{x:170,y:78,width:185,height:34,alignment:'right',fontSize:15.2,minFontSize:13.2,fontWeight:'950',lineHeight:18,maxLines:1,ltr:true,charWidthFactor:.70,fontFamily:'Tahoma, Arial, sans-serif',letterSpacing:.15},phone2:{x:170,y:118,width:185,height:34,alignment:'right',fontSize:15.2,minFontSize:13.2,fontWeight:'950',lineHeight:18,maxLines:1,ltr:true,charWidthFactor:.70,fontFamily:'Tahoma, Arial, sans-serif',letterSpacing:.15},address:{x:170,y:151,width:185,height:82,alignment:'right',fontSize:13.2,minFontSize:12.2,fontWeight:'900',lineHeight:16,maxLines:4,fontFamily:'Tahoma, Arial, sans-serif'}},
  info:{
   customerName:{label:'نام کارفرما:',labelBox:{x:835,y:438,width:155,height:34,alignment:'right',fontSize:12.4,fontWeight:'800',lineHeight:15,maxLines:1},box:{x:590,y:435,width:235,height:40,alignment:'center',fontSize:14.2,fontWeight:'850',lineHeight:17,maxLines:1}},
   customerPhone:{label:'تلفن:',labelBox:{x:390,y:340,width:115,height:34,alignment:'right',fontSize:12.4,fontWeight:'800',lineHeight:15,maxLines:1},box:{x:145,y:337,width:235,height:40,alignment:'center',fontSize:14.0,fontWeight:'850',lineHeight:17,maxLines:1,ltr:true}},
   customerAddress:{label:'آدرس:',labelBox:{x:390,y:400,width:115,height:34,alignment:'right',fontSize:12.4,fontWeight:'800',lineHeight:15,maxLines:1},box:{x:105,y:392,width:275,height:54,alignment:'center',fontSize:13.0,fontWeight:'750',lineHeight:17,maxLines:2}},
   invoiceNumber:{label:'شماره فاکتور:',labelBox:{x:835,y:330,width:155,height:34,alignment:'right',fontSize:12.4,fontWeight:'800',lineHeight:15,maxLines:1},box:{x:590,y:327,width:235,height:40,alignment:'center',fontSize:14.2,fontWeight:'850',lineHeight:17,maxLines:1,ltr:true}},
   invoiceDate:{label:'تاریخ فاکتور:',labelBox:{x:835,y:384,width:155,height:34,alignment:'right',fontSize:12.4,fontWeight:'800',lineHeight:15,maxLines:1},box:{x:620,y:381,width:205,height:40,alignment:'center',fontSize:14.2,fontWeight:'850',lineHeight:17,maxLines:1}}
  },
  table:{x:50,bodyY:575,width:985,height:255,rowHeight:55,minRowHeight:46,cols:[.17,.18,.15,.41,.09]},
  summary:{values:[{x:60,y:848,width:145,height:36,alignment:'center',fontSize:12.2,fontWeight:'700',lineHeight:14,maxLines:1,ltr:true},{x:60,y:904,width:145,height:36,alignment:'center',fontSize:12.2,fontWeight:'700',lineHeight:14,maxLines:1,ltr:true},{x:60,y:954,width:145,height:36,alignment:'center',fontSize:12.2,fontWeight:'700',lineHeight:14,maxLines:1,ltr:true},{x:60,y:1004,width:145,height:36,alignment:'center',fontSize:12.2,fontWeight:'700',lineHeight:14,maxLines:1,ltr:true},{x:60,y:1052,width:145,height:38,alignment:'center',fontSize:12.4,fontWeight:'700',lineHeight:14,maxLines:1,ltr:true}],words:{x:58,y:1127,width:315,height:41,alignment:'center',fontSize:11.2,fontWeight:'650',lineHeight:14,maxLines:2}},
  notes:{x:442,y:892,width:565,height:246,alignment:'right',fontSize:11.8,fontWeight:'650',lineHeight:17,maxLines:10},
  payment:{mode:'single',cardColor:'#050505',nameLabel:{x:790,y:1235,width:180,height:30,alignment:'right',fontSize:11,fontWeight:'700',lineHeight:14,maxLines:1},name:{x:550,y:1233,width:225,height:40,alignment:'center',fontSize:14.0,fontWeight:'850',lineHeight:16,maxLines:1},nationalLabel:{x:790,y:1280,width:180,height:30,alignment:'right',fontSize:11,fontWeight:'700',lineHeight:14,maxLines:1},national:{x:550,y:1278,width:225,height:40,alignment:'center',fontSize:13.8,fontWeight:'850',lineHeight:16,maxLines:1,ltr:true},cardLabel:{x:790,y:1325,width:180,height:30,alignment:'right',fontSize:11,fontWeight:'750',lineHeight:14,maxLines:1},card:{x:515,y:1321,width:270,height:46,alignment:'center',fontSize:17.5,minFontSize:15.5,fontWeight:'950',lineHeight:19,maxLines:1,ltr:true,letterSpacing:.35}},
  sign:{x:75,y:1220,width:385,height:155},
  status:{x:438,y:846,width:300,height:58}
 },
 t6:{
  paper:'#101417',ink:'#f5f1e7',gold:'#c3912b',contactColor:'#f3dda2',contactMaxScale:1.82,contactLatinDigits:true,dark:true,footerY:1452,
  contact:{phone1:{x:862,y:86,width:190,height:36,alignment:'right',fontSize:15.7,minFontSize:13.2,fontWeight:'950',lineHeight:18,maxLines:1,ltr:true,charWidthFactor:.70,fontFamily:'Tahoma, Arial, sans-serif',letterSpacing:.18},phone2:{x:862,y:129,width:190,height:36,alignment:'right',fontSize:15.7,minFontSize:13.2,fontWeight:'950',lineHeight:18,maxLines:1,ltr:true,charWidthFactor:.70,fontFamily:'Tahoma, Arial, sans-serif',letterSpacing:.18},address:{x:860,y:174,width:192,height:68,alignment:'right',fontSize:13.8,minFontSize:12.6,fontWeight:'900',lineHeight:17,maxLines:3,fontFamily:'Tahoma, Arial, sans-serif'}},
  info:{
   customerName:{label:'نام کارفرما:',labelBox:{x:345,y:398,width:135,height:28,alignment:'right',fontSize:11.3,fontWeight:'500',lineHeight:14,maxLines:1},box:{x:185,y:400,width:190,height:38,alignment:'center',fontSize:12.8,fontWeight:'650',lineHeight:16,maxLines:1}},
   customerPhone:{label:'تلفن:',labelBox:{x:345,y:438,width:135,height:28,alignment:'right',fontSize:11.3,fontWeight:'500',lineHeight:14,maxLines:1},box:{x:185,y:440,width:190,height:38,alignment:'center',fontSize:12.6,fontWeight:'650',lineHeight:16,maxLines:1,ltr:true}},
   customerAddress:{label:'آدرس:',labelBox:{x:345,y:478,width:135,height:28,alignment:'right',fontSize:11.3,fontWeight:'500',lineHeight:14,maxLines:1},box:{x:155,y:475,width:220,height:44,alignment:'center',fontSize:11.4,fontWeight:'500',lineHeight:14,maxLines:2}},
   invoiceNumber:{label:'شماره فاکتور:',labelBox:{x:820,y:399,width:150,height:28,alignment:'right',fontSize:11.3,fontWeight:'500',lineHeight:14,maxLines:1},box:{x:635,y:400,width:200,height:38,alignment:'center',fontSize:12.8,fontWeight:'650',lineHeight:16,maxLines:1,ltr:true}},
   invoiceDate:{label:'تاریخ فاکتور:',labelBox:{x:820,y:449,width:150,height:28,alignment:'right',fontSize:11.3,fontWeight:'500',lineHeight:14,maxLines:1},box:{x:675,y:455,width:160,height:38,alignment:'center',fontSize:12.8,fontWeight:'650',lineHeight:16,maxLines:1}}
  },
  table:{x:50,bodyY:607,width:987,height:243,rowHeight:55,minRowHeight:46,cols:[.17,.18,.15,.41,.09]},
  summary:{values:[{x:62,y:872,width:170,height:36,alignment:'center',fontSize:12.1,fontWeight:'650',lineHeight:14,maxLines:1,ltr:true},{x:62,y:922,width:170,height:36,alignment:'center',fontSize:12.1,fontWeight:'650',lineHeight:14,maxLines:1,ltr:true},{x:62,y:972,width:170,height:36,alignment:'center',fontSize:12.1,fontWeight:'650',lineHeight:14,maxLines:1,ltr:true},{x:62,y:1022,width:170,height:36,alignment:'center',fontSize:12.1,fontWeight:'650',lineHeight:14,maxLines:1,ltr:true},{x:62,y:1070,width:170,height:38,alignment:'center',fontSize:12.5,fontWeight:'700',lineHeight:14,maxLines:1,ltr:true}],words:{x:60,y:1142,width:370,height:43,alignment:'center',fontSize:11.2,fontWeight:'650',lineHeight:14,maxLines:2}},
  notes:{x:500,y:920,width:500,height:225,alignment:'right',fontSize:11.5,fontWeight:'500',lineHeight:18,maxLines:10},
  payment:{mode:'single',cardColor:'#f8f0dc',nameLabel:{x:300,y:1275,width:135,height:30,alignment:'right',fontSize:11.0,fontWeight:'700',lineHeight:14,maxLines:1},name:{x:58,y:1273,width:230,height:40,alignment:'center',fontSize:14.0,fontWeight:'850',lineHeight:16,maxLines:1},nationalLabel:{x:300,y:1320,width:135,height:30,alignment:'right',fontSize:11.0,fontWeight:'700',lineHeight:14,maxLines:1},national:{x:58,y:1318,width:230,height:40,alignment:'center',fontSize:13.8,fontWeight:'850',lineHeight:16,maxLines:1,ltr:true},cardLabel:{x:300,y:1365,width:135,height:30,alignment:'right',fontSize:11.0,fontWeight:'750',lineHeight:14,maxLines:1},card:{x:52,y:1365,width:232,height:52,alignment:'center',fontSize:18.0,minFontSize:15.2,fontWeight:'950',lineHeight:19,maxLines:1,ltr:true,letterSpacing:.28}},
  sign:{x:520,y:1275,width:485,height:165},
  status:{x:510,y:876,width:300,height:58}
 },
 t7:{
  paper:'#fff9ee',ink:'#102238',gold:'#c08a1d',contactColor:'#fff0c2',contactMaxScale:1.72,contactLatinDigits:true,dark:false,footerY:1455,integratedContactPlaque:true,
  // v39.8.2: keep every contact value inside the plaque with a safer right
  // inset and a larger optical size. This prevents the phone/address text
  // from touching the plaque frame while remaining legible in shared JPG/PDF.
  contact:{phone1:{x:850,y:92,width:185,height:66,alignment:'right',fontSize:15.4,minFontSize:14.4,fontWeight:'900',lineHeight:19,maxLines:1,ltr:true,charWidthFactor:.56,fontFamily:'Tahoma, Arial, sans-serif',letterSpacing:.12},phone2:{x:850,y:164,width:185,height:59,alignment:'right',fontSize:15.4,minFontSize:14.4,fontWeight:'900',lineHeight:19,maxLines:1,ltr:true,charWidthFactor:.56,fontFamily:'Tahoma, Arial, sans-serif',letterSpacing:.12},address:{x:842,y:225,width:195,height:68,alignment:'right',fontSize:11.5,minFontSize:11.1,fontWeight:'850',lineHeight:14.2,maxLines:3,charWidthFactor:.53,fontFamily:'Tahoma, Arial, sans-serif'}},
  info:{
   customerName:{label:'نام کارفرما:',labelBox:{x:850,y:570,width:170,height:34,alignment:'right',fontSize:11.5,fontWeight:'600',lineHeight:14,maxLines:1},box:{x:640,y:570,width:200,height:38,alignment:'center',fontSize:12.9,fontWeight:'700',lineHeight:16,maxLines:1}},
   customerPhone:{label:'تلفن:',labelBox:{x:430,y:470,width:100,height:34,alignment:'right',fontSize:11.5,fontWeight:'600',lineHeight:14,maxLines:1},box:{x:245,y:470,width:170,height:38,alignment:'center',fontSize:12.7,fontWeight:'700',lineHeight:16,maxLines:1,ltr:true}},
   customerAddress:{label:'آدرس:',labelBox:{x:430,y:520,width:100,height:34,alignment:'right',fontSize:11.5,fontWeight:'600',lineHeight:14,maxLines:1},box:{x:175,y:515,width:240,height:52,alignment:'center',fontSize:11.6,fontWeight:'600',lineHeight:15,maxLines:2}},
   invoiceNumber:{label:'شماره فاکتور:',labelBox:{x:850,y:470,width:170,height:34,alignment:'right',fontSize:11.5,fontWeight:'600',lineHeight:14,maxLines:1},box:{x:635,y:470,width:205,height:38,alignment:'center',fontSize:12.9,fontWeight:'700',lineHeight:16,maxLines:1,ltr:true}},
   invoiceDate:{label:'تاریخ فاکتور:',labelBox:{x:850,y:520,width:170,height:34,alignment:'right',fontSize:11.5,fontWeight:'600',lineHeight:14,maxLines:1},box:{x:665,y:520,width:175,height:38,alignment:'center',fontSize:12.9,fontWeight:'700',lineHeight:16,maxLines:1}}
  },
  table:{x:48,bodyY:703,width:990,height:270,rowHeight:54,minRowHeight:45,cols:[.17,.18,.15,.41,.09]},
  summary:{custom:true,values:[{x:58,y:998,width:145,height:30,alignment:'center',fontSize:11.9,fontWeight:'750',lineHeight:14,maxLines:1,ltr:true},{x:58,y:1030,width:145,height:30,alignment:'center',fontSize:11.9,fontWeight:'750',lineHeight:14,maxLines:1,ltr:true},{x:58,y:1062,width:145,height:30,alignment:'center',fontSize:11.9,fontWeight:'750',lineHeight:14,maxLines:1,ltr:true},{x:58,y:1094,width:145,height:30,alignment:'center',fontSize:11.9,fontWeight:'750',lineHeight:14,maxLines:1,ltr:true},{x:58,y:1126,width:145,height:30,alignment:'center',fontSize:12.2,fontWeight:'850',lineHeight:14,maxLines:1,ltr:true}],words:{x:57,y:1160,width:390,height:48,alignment:'center',fontSize:11.2,fontWeight:'750',lineHeight:14,maxLines:2}},
  notes:{x:500,y:1035,width:490,height:92,alignment:'right',fontSize:11.3,fontWeight:'600',lineHeight:17,maxLines:5},
  payment:{mode:'single',cardColor:'#050505',nameLabel:{x:340,y:1285,width:150,height:30,alignment:'right',fontSize:11.0,fontWeight:'750',lineHeight:14,maxLines:1},name:{x:65,y:1281,width:265,height:40,alignment:'center',fontSize:14.2,fontWeight:'850',lineHeight:16,maxLines:1},nationalLabel:{x:340,y:1330,width:150,height:30,alignment:'right',fontSize:11.0,fontWeight:'750',lineHeight:14,maxLines:1},national:{x:65,y:1326,width:265,height:40,alignment:'center',fontSize:14.0,fontWeight:'850',lineHeight:16,maxLines:1,ltr:true},cardLabel:{x:340,y:1374,width:150,height:30,alignment:'right',fontSize:11.0,fontWeight:'800',lineHeight:14,maxLines:1},card:{x:50,y:1368,width:278,height:44,alignment:'center',fontSize:17.5,minFontSize:15.5,fontWeight:'950',lineHeight:19,maxLines:1,ltr:true,letterSpacing:.35}},
  sign:{x:560,y:1280,width:430,height:155},
  status:{x:500,y:1152,width:305,height:58}
 }
};
function profile(code){return PROFILES[code]||PROFILES.t4}
const IMG=(href,x,y,w,h,extra='')=>href?`<image href="${href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" ${extra}/>`:'';
const RECT=(x,y,w,h,fill,stroke='none',sw=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const LINE=(x1,y1,x2,y2,color,w=1,op=1)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" opacity="${op}"/>`;
function splitWords(text,maxChars,maxLines){
  const words=String(text==null?'':text).replace(/\s+/g,' ').trim().split(' ').filter(Boolean),out=[];let line='';
  for(const word of words){
    const next=line?line+' '+word:word;
    if(next.length>maxChars&&line){out.push(line);line=word}else line=next;
    if(out.length>=maxLines)break;
  }
  if(line&&out.length<maxLines)out.push(line);
  const original=words.join(' '),joined=out.join(' ');if(original.length>joined.length&&out.length)out[out.length-1]=out[out.length-1].replace(/…$/,'')+'…';
  return out;
}
function lineHeightFor(box,size){
  const base=Math.max(1,Number(box.fontSize||12)),requested=Number(box.lineHeight||base*1.25),ratio=Math.max(1.12,Math.min(1.48,requested/base));
  return size*ratio;
}
function fitField(value,box,scale=1){
  const raw=String(value==null?'':value).trim()||'—',base=Math.max(8,Number(box.fontSize||12));
  let size=Math.max(10.5,base*scale),min=Math.max(10.5,Number(box.minFontSize||base*.82)),lines=[];
  min=Math.min(size,min);
  const maxLines=Math.max(1,Number(box.maxLines||1));
  while(size>=min-.01){
    const chars=Math.max(4,Math.floor(Number(box.width||100)/(size*Number(box.charWidthFactor||(box.ltr?.66:.56)))));
    lines=splitWords(raw,chars,maxLines);
    const tooLong=lines.some(line=>line.length>chars+(box.ltr?0:2)),height=lines.length*lineHeightFor(box,size);
    const clipped=raw.replace(/\s+/g,' ').length>lines.join(' ').replace(/…$/,'').length+2;
    if(!tooLong&&height<=Number(box.height||999)&&(!clipped||size<=min+.15||maxLines>1))break;
    size-=.35;
  }
  size=Math.max(min,size);
  return {size,lineHeight:lineHeightFor(box,size),lines};
}
function fieldText(value,box,color,scale=1){
  if(!box)return'';const fit=fitField(value,box,scale),lh=fit.lineHeight;
  const align=box.alignment||'right',rtl=!box.ltr;
  // SVG text-anchor start/end follows writing direction. For RTL, right alignment is start at the right edge.
  const anchor=align==='center'?'middle':align==='left'?(rtl?'end':'start'):(rtl?'start':'end');
  const lx=align==='center'?box.width/2:align==='left'?0:box.width;
  const total=fit.lines.length*lh,start=(box.height-total)/2+lh/2;
  // A nested SVG is the physical Bounding Box. overflow=hidden guarantees that no glyph can escape it.
  const weight=Math.max(650,Number(box.fontWeight)||600);
  const tracking=Number(box.letterSpacing||0),opacity=Math.max(0,Math.min(1,Number(box.opacity==null?1:box.opacity)));
  return `<svg x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" overflow="hidden">`+fit.lines.map((line,i)=>`<text x="${lx}" y="${start+i*lh}" font-family="${box.fontFamily||'sans-serif'}" font-size="${fit.size.toFixed(2)}" font-weight="${weight}" fill="${color}" fill-opacity="${opacity}" letter-spacing="${tracking}" text-anchor="${anchor}" direction="${box.ltr?'ltr':'rtl'}" unicode-bidi="plaintext" dominant-baseline="middle" text-rendering="geometricPrecision">${safe(line)}</text>`).join('')+`</svg>`;
}
function contactSvg(v,p){const c=p.contactColor||p.ink,scale=Math.min(v.fontScale,Number(p.contactMaxScale||1.72)),digits=p.contactLatinDigits?latinDigits:fa;let out='';if(v.contact.phone1)out+=fieldText(digits(v.contact.phone1),p.contact.phone1,c,scale);if(v.contact.phone2)out+=fieldText(digits(v.contact.phone2),p.contact.phone2,c,scale);if(v.contact.address)out+=fieldText(v.contact.address,p.contact.address,c,scale);return out}
function infoBackdropSvg(v,p){
  if(v.code!=='t4')return'';
  const outer='<rect x="47" y="294" width="993" height="217" rx="16" fill="#fbf7ed" stroke="#b9985c" stroke-width="2.2"/>';
  const inner='<rect x="53" y="300" width="981" height="205" rx="12" fill="none" stroke="#d9c69d" stroke-width="1" opacity=".82"/>';
  const divider=LINE(544,316,544,488,p.gold,1.6,.62);
  return `<g data-unified-customer-invoice-info="true">${outer}${inner}${divider}</g>`;
}
function documentTitleSvg(v,p){
  if(v.documentTitle==='فاکتور اجرا')return'';
  const boxes={
    t4:{x:382,y:232,width:323,height:55,fill:'#061d38',stroke:'#c69735',text:'#f5d06f',fontSize:20,maxLines:1},
    t6:{x:349,y:286,width:389,height:79,fill:'#111417',stroke:'#c3912b',text:'#f2c45c',fontSize:25,maxLines:2},
    t7:{x:326,y:304,width:436,height:116,fill:'#061d38',stroke:'#c69735',text:'#f5d06f',fontSize:27,maxLines:2}
  },z=boxes[v.code]||boxes.t4;
  const inset=7,inner=`<rect x="${z.x+inset}" y="${z.y+inset}" width="${z.width-inset*2}" height="${z.height-inset*2}" rx="${Math.max(11,24-inset)}" fill="none" stroke="${z.stroke}" stroke-width="1.1" opacity=".72"/>`;
  const title=fieldText(v.documentTitle,{x:z.x+18,y:z.y+8,width:z.width-36,height:z.height-16,alignment:'center',fontSize:z.fontSize,minFontSize:16,fontWeight:'950',lineHeight:z.fontSize*1.18,maxLines:z.maxLines},z.text,1);
  return `<g data-document-title="${safe(v.documentTitle)}"><rect x="${z.x}" y="${z.y}" width="${z.width}" height="${z.height}" rx="24" fill="${z.fill}" stroke="${z.stroke}" stroke-width="3"/>${inner}${title}</g>`;
}
function labeled(value,field,p,v,labelOverride=''){let out='',label=labelOverride||field.label||'';if(p.drawInfoLabels&&label&&field.labelBox)out+=fieldText(label,field.labelBox,p.gold,v.fontScale);return out+fieldText(value,field.box,p.ink,v.fontScale)}
function infoSvg(v,p){const z=p.info,custom=v.documentTitle==='پیش‌فاکتور'?['شماره پیش‌فاکتور:','تاریخ پیش‌فاکتور:']:v.invoice.documentType==='invoiceAdjustmentPreview'?['شماره سند:','تاریخ سند:']:['',''];return labeled(v.customer.name||'—',z.customerName,p,v)+labeled(fa(v.customer.phone||'—'),z.customerPhone,p,v)+labeled(v.customer.address||'—',z.customerAddress,p,v)+labeled(v.invoice.invoiceNumber||'—',z.invoiceNumber,p,v,custom[0])+labeled(v.invoice.date||'—',z.invoiceDate,p,v,custom[1])}
function tableSvg(v,p,page){
  const z=p.table,rows=page.rows||[],fr=z.cols,bounds=[z.x];let acc=z.x,out='';for(const f of fr){acc+=z.width*f;bounds.push(acc)}
  const n=rows.length,rowH=z.rowHeight,tableH=Math.max(z.height,n*rowH),usedH=n*rowH;
  out+=RECT(z.x+2,z.bodyY,z.width-4,tableH,p.paper);
  if(!n)return out;
  for(let i=1;i<bounds.length-1;i++)out+=LINE(bounds[i],z.bodyY,bounds[i],z.bodyY+usedH,p.dark?'#6d542a':'#c8a04c',1,.9);
  for(let r=0;r<n;r++){
    const top=z.bodyY+r*rowH,it=rows[r];if(r)out+=LINE(z.x,top,z.x+z.width,top,p.dark?'#6d542a':'#c8a04c',1,.9);
    const amount=num(it.quantity)*num(it.unitPrice);
    const boxes=[
      {x:bounds[0]+5,y:top+4,width:bounds[1]-bounds[0]-10,height:rowH-8,alignment:'center',fontSize:11.8,fontWeight:'650',lineHeight:14,maxLines:1,ltr:true},
      {x:bounds[1]+5,y:top+4,width:bounds[2]-bounds[1]-10,height:rowH-8,alignment:'center',fontSize:11.8,fontWeight:'650',lineHeight:14,maxLines:1,ltr:true},
      {x:bounds[2]+5,y:top+4,width:bounds[3]-bounds[2]-10,height:rowH-8,alignment:'center',fontSize:11.8,fontWeight:'650',lineHeight:14,maxLines:1},
      {x:bounds[3]+9,y:top+4,width:bounds[4]-bounds[3]-18,height:rowH-8,alignment:'right',fontSize:12.0,fontWeight:'600',lineHeight:15,maxLines:2},
      {x:bounds[4]+4,y:top+4,width:bounds[5]-bounds[4]-8,height:rowH-8,alignment:'center',fontSize:11.8,fontWeight:'650',lineHeight:14,maxLines:1}
    ];
    out+=fieldText(money(amount).replace(' تومان',''),boxes[0],p.ink,v.fontScale)+fieldText(money(num(it.unitPrice)).replace(' تومان',''),boxes[1],p.ink,v.fontScale)+fieldText(`${fa(it.quantity||'')} ${it.unit||''}`.trim(),boxes[2],p.ink,v.fontScale)+fieldText(String(it.description||''),boxes[3],p.ink,v.fontScale)+fieldText(fa(page.offset+r+1),boxes[4],p.ink,v.fontScale);
  }
  out+=LINE(z.x,z.bodyY+usedH,z.x+z.width,z.bodyY+usedH,p.dark?'#6d542a':'#c8a04c',1.3,1);return out;
}
function customSummarySvg(v,p){
  const s=p.summary,vals=[v.summary.total,v.summary.prev,v.summary.debt,v.summary.received,v.summary.final],labels=v.documentTitle==='پیش‌فاکتور'?['جمع مبلغ پیش‌فاکتور:','مانده قبلی:','مبلغ پیشنهادی:','دریافتی:','اثر روی حساب:']:v.invoice.documentType==='invoiceAdjustmentPreview'?['مبلغ سند:','مانده قبل:','جمع با سند:','دریافتی:','مانده بعد:']:['حساب این فاکتور:','بدهی فاکتور قبلی:','جمع کل این فاکتور:','دریافتی:','جمع کل حساب:'];
  let out='<g data-summary-words-position="under-totals"><rect x="46" y="989" width="415" height="226" rx="12" fill="#fffaf0" stroke="#bd9952" stroke-width="2"/>';
  out+=RECT(50,1125,407,34,'#f3c466');
  [1029,1061,1093,1125,1159].forEach(y=>out+=LINE(51,y,456,y,'#d7bd84',1,.78));
  out+=LINE(210,994,210,1158,'#d0ad64',1.1,.8);
  vals.forEach((x,i)=>{
    out+=fieldText(money(x).replace(' تومان',''),s.values[i],p.ink,v.fontScale);
    out+=fieldText(labels[i],{x:218,y:s.values[i].y,width:225,height:s.values[i].height,alignment:'right',fontSize:i===4?12.3:11.7,fontWeight:i===4?'900':'750',lineHeight:14,maxLines:1},p.ink,v.fontScale);
  });
  if(v.flags.showAmountInWords)out+=fieldText('به حروف: '+v.summary.words,s.words,p.ink,v.fontScale);
  return out+'</g>';
}
function summarySvg(v,p){if(p.summary.custom)return customSummarySvg(v,p);const vals=[v.summary.total,v.summary.prev,v.summary.debt,v.summary.received,v.summary.final];let out='';vals.forEach((x,i)=>out+=fieldText(money(x).replace(' تومان',''),p.summary.values[i],p.ink,v.fontScale));if(v.flags.showAmountInWords)out+=fieldText(v.summary.words,p.summary.words,p.dark?p.gold:p.ink,v.fontScale);return out}
function notesSvg(v,p){const arr=v.notes.length?v.notes:['—'];return fieldText(arr.map(x=>'• '+x).join('  '),p.notes,p.ink,v.fontScale)}
function statusBadgeSvg(v,p){
  if(!v.status||!p.status)return'';
  const palettes={green:{fill:'#ecfdf5',stroke:'#22a06b',text:'#14532d'},blue:{fill:'#eff6ff',stroke:'#3b82f6',text:'#1e3a8a'},yellow:{fill:'#fffbeb',stroke:'#eab308',text:'#854d0e'},orange:{fill:'#fff7ed',stroke:'#f97316',text:'#9a3412'},red:{fill:'#fef2f2',stroke:'#ef4444',text:'#991b1b'}},z=p.status,c=palettes[v.status.tone]||palettes.green;
  const amount=v.status.kind==='settled'?'بدون مانده':(v.status.kind==='creditor'?'بستانکاری ':'مانده ')+money(v.status.absoluteAmount||0);
  const label={x:z.x+42,y:z.y+5,width:z.width-54,height:24,alignment:'right',fontSize:13.2,fontWeight:'900',lineHeight:15,maxLines:1};
  const amountBox={x:z.x+42,y:z.y+29,width:z.width-54,height:23,alignment:'right',fontSize:11.6,fontWeight:'800',lineHeight:14,maxLines:1,ltr:false};
  return `<g data-account-status="${safe(v.status.kind)}" data-account-status-tone="${safe(v.status.tone)}"><rect x="${z.x}" y="${z.y}" width="${z.width}" height="${z.height}" rx="13" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/><circle cx="${z.x+21}" cy="${z.y+z.height/2}" r="7" fill="${c.stroke}"/>${fieldText('وضعیت حساب: '+v.status.label,label,c.text,1)}${fieldText(amount,amountBox,c.text,1)}</g>`;
}
function paymentSvg(v,p){const z=p.payment;let out='';
  out+=fieldText(v.payment.name||'—',z.name,p.ink,v.fontScale);
  out+=fieldText(fa(v.payment.nationalId||'—'),z.national,p.ink,v.fontScale);
  out+=fieldText(v.payment.card||'—',z.card,z.cardColor||(p.dark?'#f8f0dc':'#050505'),v.fontScale);
  return out;
}
function signSvg(v,p){const z=p.sign;let out='';if(v.assets.signature){if(v.code==='t6')out+='<defs><filter id="alanrang-t6-white-signature" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter></defs>';out+=IMG(v.assets.signature,z.x,z.y+z.height*.18,z.width*.58,z.height*.65,v.code==='t6'?'filter="url(#alanrang-t6-white-signature)" data-signature-tone="white"':'');}if(v.assets.stamp)out+=IMG(v.assets.stamp,z.x+z.width*.60,z.y+z.height*.10,z.width*.34,z.height*.78);return out}
function lowerBackdropSvg(v,p,last){
  if(v.code!=='t4')return'';
  // T4 used to contain a second, empty payment-detail box beside notes.
  // Cover both baked boxes with one integrated customer-facing notes panel.
  const outer='<rect x="411" y="834" width="628" height="341" rx="13" fill="#fbf7ed" stroke="#bda06a" stroke-width="2.2"/>';
  const inner='<rect x="417" y="840" width="616" height="329" rx="9" fill="none" stroke="#d8c49a" stroke-width="1" opacity=".72"/>';
  const rule=LINE(438,882,1012,882,p.gold,1.15,.5);
  const title=fieldText('توضیحات',{x:815,y:842,width:180,height:34,alignment:'right',fontSize:14.5,fontWeight:'850',lineHeight:16,maxLines:1},p.ink,1.2);
  return outer+inner+rule+`<text x="1010" y="864" fill="${p.gold}" font-size="17" font-weight="900" text-anchor="middle">✦</text>`+title;
}
function lowerSvg(v,p,last){return last?summarySvg(v,p)+notesSvg(v,p)+statusBadgeSvg(v,p)+paymentSvg(v,p)+signSvg(v,p):''}
function pageCapacity(p){return Number.MAX_SAFE_INTEGER}
function continuousPage(v){return {rows:(v.rows||[]).slice(),offset:0,index:0,total:1,last:true}}
function continuousLayout(v,p){
  const n=(v.rows||[]).length,rowH=p.table.rowHeight,tableH=Math.max(p.table.height,n*rowH),extra=Math.max(0,tableH-p.table.height),cutY=p.table.bodyY+p.table.height;
  return {rowH,tableH,extra,cutY,docHeight:H+extra};
}
function shellContinuousSvg(v,p,layout){
  const shell=SHELL[v.code]||SHELL.t4;if(!shell)throw new Error('invoice clean shell missing: '+v.code);
  if(!layout.extra)return `<image href="${shell}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/>`;
  const cut=layout.cutY,extra=layout.extra,bottomH=H-cut,sampleY=Math.max(0,cut-8),sampleH=2;
  return `<svg x="0" y="0" width="${W}" height="${cut}" viewBox="0 0 ${W} ${cut}" preserveAspectRatio="none" overflow="hidden"><image href="${shell}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/></svg>`+
    `<svg x="0" y="${cut}" width="${W}" height="${extra}" viewBox="0 ${sampleY} ${W} ${sampleH}" preserveAspectRatio="none" overflow="hidden"><image href="${shell}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/></svg>`+
    `<svg x="0" y="${cut+extra}" width="${W}" height="${bottomH}" viewBox="0 ${cut} ${W} ${bottomH}" preserveAspectRatio="none" overflow="hidden"><image href="${shell}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/></svg>`;
}
function pageSvg(v,p,page){
  const layout=continuousLayout(v,p),shift=layout.extra;
  let out=shellContinuousSvg(v,p,layout)+documentTitleSvg(v,p)+infoBackdropSvg(v,p)+contactSvg(v,p)+infoSvg(v,p)+tableSvg(v,p,page);
  out+=`<g transform="translate(0 ${shift})">`+lowerBackdropSvg(v,p,true)+lowerSvg(v,p,true)+`</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${layout.docHeight}" viewBox="0 0 ${W} ${layout.docHeight}" role="img" aria-label="${safe(v.documentTitle)} ${safe(v.code.toUpperCase())}">${out}</svg>`;
}
function svgPages(inv){const v=viewModel(inv),p=profile(v.code);return [pageSvg(v,p,continuousPage(v))]}
function render(inv){const v=viewModel(inv),svg=svgPages(inv)[0];return `<div class="ar70-invoice-stack alan-final-invoice" data-invoice-template="${safe(v.code)}" data-document-title="${safe(v.documentTitle)}" data-font-size="${v.fontSize}" data-font-scale="${v.fontScale.toFixed(3)}" data-canonical-renderer="39.43.1-invoice-rows-continuous-v01"><div class="ar70-page" data-page="1">${svg}</div></div>`}
function svgToCanvas(svg,scale=2,height=H){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=W*scale;c.height=height*scale;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(im,0,0,c.width,c.height);resolve(c)};im.onerror=()=>reject(new Error('invoice SVG rasterize failed'));im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)})}
function exportLoadImage(src){
  src=String(src||'').trim();
  if(!src)return Promise.resolve(null);
  try{
    var engine=window.AlanRangDocumentEngineV2;
    if(engine&&typeof engine.loadImage==='function')return engine.loadImage(src);
  }catch(_){ }
  return new Promise(function(resolve){
    try{var im=new Image();im.onload=function(){resolve(im)};im.onerror=function(){resolve(null)};im.src=src}catch(_){resolve(null)}
  });
}
function containRect(img,x,y,w,h){
  var iw=Math.max(1,Number(img&&(img.naturalWidth||img.width)||1)),ih=Math.max(1,Number(img&&(img.naturalHeight||img.height)||1)),r=Math.min(w/iw,h/ih),dw=iw*r,dh=ih*r;
  return {x:x+(w-dw)/2,y:y+(h-dh)/2,w:dw,h:dh};
}
function drawExportImage(ctx,img,x,y,w,h,tint){
  if(!img)return;
  var r=containRect(img,x,y,w,h);
  if(!tint){ctx.drawImage(img,r.x,r.y,r.w,r.h);return;}
  var mask=document.createElement('canvas');mask.width=Math.max(1,Math.ceil(r.w));mask.height=Math.max(1,Math.ceil(r.h));
  var mx=mask.getContext('2d');mx.clearRect(0,0,mask.width,mask.height);mx.drawImage(img,0,0,mask.width,mask.height);mx.globalCompositeOperation='source-in';mx.fillStyle=tint;mx.fillRect(0,0,mask.width,mask.height);mx.globalCompositeOperation='source-over';
  ctx.drawImage(mask,r.x,r.y,r.w,r.h);
}
async function compositeIdentityAssets(canvas,v,p,scale){
  if(!v||!v.assets||(!v.assets.stamp&&!v.assets.signature))return canvas;
  var loaded=await Promise.all([exportLoadImage(v.assets.stamp),exportLoadImage(v.assets.signature)]),stamp=loaded[0],signature=loaded[1];
  if(v.assets.stamp&&!stamp)throw new Error('invoice export stamp image failed to load');
  if(v.assets.signature&&!signature)throw new Error('invoice export signature image failed to load');
  var z=p.sign,ctx=canvas.getContext('2d'),s=Number(scale)||1;
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(signature)drawExportImage(ctx,signature,z.x*s,(z.y+z.height*.18)*s,z.width*.58*s,z.height*.65*s,v.code==='t6'?'#ffffff':'');
  if(stamp)drawExportImage(ctx,stamp,(z.x+z.width*.60)*s,(z.y+z.height*.10)*s,z.width*.34*s,z.height*.78*s,'');
  ctx.restore();
  return canvas;
}
async function renderPageCanvases(inv){
  const v=viewModel(inv),p=profile(v.code),layout=continuousLayout(v,p),page=continuousPage(v),base=Object.assign({},v,{assets:Object.assign({},v.assets,{stamp:'',signature:''})});
  const canvas=await svgToCanvas(pageSvg(base,p,page),2,layout.docHeight);
  await compositeIdentityAssetsShifted(canvas,v,p,2,layout.extra);
  return [canvas];
}
async function compositeIdentityAssetsShifted(canvas,v,p,scale,shift){
  if(!shift)return compositeIdentityAssets(canvas,v,p,scale);
  if(!v||!v.assets||(!v.assets.stamp&&!v.assets.signature))return canvas;
  var loaded=await Promise.all([exportLoadImage(v.assets.stamp),exportLoadImage(v.assets.signature)]),stamp=loaded[0],signature=loaded[1];
  if(v.assets.stamp&&!stamp)throw new Error('invoice export stamp image failed to load');
  if(v.assets.signature&&!signature)throw new Error('invoice export signature image failed to load');
  var z=p.sign,ctx=canvas.getContext('2d'),s=Number(scale)||1,dy=Number(shift||0)*s;
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(signature)drawExportImage(ctx,signature,z.x*s,(z.y+z.height*.18)*s+dy,z.width*.58*s,z.height*.65*s,v.code==='t6'?'#ffffff':'');
  if(stamp)drawExportImage(ctx,stamp,(z.x+z.width*.60)*s,(z.y+z.height*.10)*s+dy,z.width*.34*s,z.height*.78*s,'');
  ctx.restore();
  return canvas;
}
async function renderCanvas(inv){
  const pages=await renderPageCanvases(inv);if(!pages.length)return null;
  try{Object.defineProperties(pages[0],{__alanrangInvoiceRenderer:{value:'v39.43.1-invoice-rows-continuous-v01'},__alanrangInvoiceTemplate:{value:viewModel(inv).code},__alanrangInvoicePages:{value:1}})}catch(_){}
  return pages[0];
}
window.AlanRangInvoiceRendererV3970={version:VERSION,allowedTemplateIds:IDS.slice(),defaultTemplateId:DEFAULT_ID,viewModel,render,svgPages,renderPageCanvases,renderCanvas,normalize,codeFrom,fontScaleFor,fitField,pageCapacity,profiles:PROFILES,compositeIdentityAssets,documentIdentityAssets};
})();
