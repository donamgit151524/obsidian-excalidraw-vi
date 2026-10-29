// Offline checks for dictionary coverage, runtime switching and protected syntax.
const fs=require('node:fs'),vm=require('node:vm'),zlib=require('node:zlib'),assert=require('node:assert/strict'),ts=require('typescript');
function dictionary(file){
  const source=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,source,99,true);
  assert.equal(ast.parseDiagnostics.length,0,file+' must parse');
  const obj=ast.statements.find(ts.isExportAssignment).expression;
  const globals={
    DEVICE:{isDesktop:true,isMobile:false,isMacOS:false,isIOS:false},
    FRONTMATTER_KEYS:new Proxy({},{get:(_,k)=>({name:String(k)})}),CJK_FONTS:'CJK Fonts',
    URLs:new Proxy({},{get:(_,k)=>'https://example.invalid/'+String(k)}),
    labelALT:()=> 'Alt',labelCTRL:()=> 'Ctrl',labelMETA:()=> 'Meta',labelSHIFT:()=> 'Shift',
    TAG_AUTOEXPORT:'autoexport',TAG_MDREADINGMODE:'reading',TAG_PDFEXPORT:'pdf',PLUGIN_VERSION:'2.29.0-vi.1',
  };
  return {value:vm.runInNewContext('('+obj.getText(ast)+')',globals),code:obj.getText(ast),globals};
}
const en=dictionary('src/lang/locale/en.ts'),vi=dictionary('src/lang/locale/vi.ts');
assert.deepEqual(Object.keys(vi.value).sort(),Object.keys(en.value).sort());
const tokens=s=>(s.match(/\{\{?[^{}\n]+\}\}?/g)||[]).sort();
const codes=s=>s.match(/<code\b[^>]*>[\s\S]*?<\/code>/g)||[];
for(const key of Object.keys(en.value)){
  assert.equal(typeof vi.value[key],'string',key);
  assert.ok(vi.value[key].trim(),key+' empty');
  assert.ok(!/ZXQ\d+QXZ|QQEXPR\d+QQ/.test(vi.value[key]),key+' draft marker');
  assert.deepEqual(tokens(vi.value[key]),tokens(en.value[key]),key+' placeholders');
  assert.deepEqual(codes(vi.value[key]),codes(en.value[key]),key+' code examples');
}
const helpers=ts.transpileModule(fs.readFileSync('src/lang/helpers.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const context=vm.createContext({
  exports:{},console,PLUGIN_VERSION:'2.29.0-vi.1',
  PLUGIN_LANGUAGES:{vi:zlib.deflateSync('x = '+vi.code).toString('base64')},
  window:{unpackBase64Deflate:s=>zlib.inflateSync(Buffer.from(s,'base64')).toString()},
});
context.require=id=>id.includes('locale/en')?{default:en.value}:id.includes('ErrorHandler')?{errorHandler:{safeEval:code=>vm.runInContext(code,context)}}:en.globals;
vm.runInContext(helpers,context);
const {t,setPluginLanguage}=context.exports;
assert.equal(t('CREATE_NEW'),vi.value.CREATE_NEW);
setPluginLanguage('en');assert.equal(t('CREATE_NEW'),en.value.CREATE_NEW);
setPluginLanguage('vi');assert.equal(t('TRAY_SAVE'),'Lưu');
setPluginLanguage('invalid');assert.equal(t('CREATE_NEW'),vi.value.CREATE_NEW);
const canvasEn=JSON.parse(fs.readFileSync('scripts/canvas-en.json','utf8')),canvasVi=JSON.parse(fs.readFileSync('src/lang/canvas-vi.json','utf8'));
let canvasKeys=0;
function check(a,b,path=''){
  for(const [k,value]of Object.entries(a)){
    const p=path?path+'.'+k:k;
    if(typeof value==='object')check(value,b?.[k],p);
    else {canvasKeys++;assert.ok(b?.[k],p+' missing');assert.deepEqual(tokens(b[k]),tokens(value),p+' placeholders');}
  }
}
check(canvasEn,canvasVi);
const result={pluginKeys:Object.keys(en.value).length,canvasKeys,languageSwitch:'passed',placeholders:'passed',codeExamples:'passed'};
fs.writeFileSync('translation-report.json',JSON.stringify(result,null,2)+'\n');console.log(result);
