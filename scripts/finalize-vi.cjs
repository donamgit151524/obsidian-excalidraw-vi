const fs=require('node:fs'),ts=require('typescript');
const overrides=require('./vi-overrides.json'),extra=require('./extra-vi.json');
function parse(file){
  const source=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
  const obj=ast.statements.find(ts.isExportAssignment).expression;
  return {source,ast,properties:new Map(obj.properties.map(p=>[p.name.text,p.initializer]))};
}
function read(node,ast,expressions){
  if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))return node.text;
  if(ts.isBinaryExpression(node))return read(node.left,ast,expressions)+read(node.right,ast,expressions);
  if(!ts.isTemplateExpression(node))throw Error(node.getText(ast));
  let text=node.head.text;
  for(const span of node.templateSpans){
    const code=span.expression.getText(ast);
    let index=expressions.indexOf(code);
    if(index<0){index=expressions.length;expressions.push(code);}
    text+=`QQEXPR${index}QQ`+span.literal.text;
  }
  return text;
}
const en=parse('src/lang/locale/en.ts'),vi=parse('src/lang/locale/vi.ts');
let out=en.source.slice(0,en.source.indexOf('export default'))+'export default {\n';
const extraKeys=Object.fromEntries(Object.keys(extra).map((s,i)=>['UI_EXTRA_'+String(i+1).padStart(3,'0'),extra[s]]));
const repairs=[];
for(const [key,node]of en.properties){
  const expressions=[];
  const english=read(node,en.ast,expressions);
  let text=overrides[key]??extraKeys[key];
  if(text===undefined){
    if(!vi.properties.has(key))throw Error('Missing Vietnamese key '+key);
    text=read(vi.properties.get(key),vi.ast,expressions);
    // Example code and config syntax must stay in the original language.
    for(const pattern of [/<code\b[^>]*>[\s\S]*?<\/code>/g,/`[^`]+`/g]){
      const before=english.match(pattern)||[],after=text.match(pattern)||[];
      if(before.length!==after.length)throw Error('Code span count mismatch: '+key);
      let i=0;text=text.replace(pattern,()=>before[i++]);
    }
    // Restore named placeholders translated by the draft provider.
    const pattern=/\{\{?[^{}\n]+\}\}?/g;
    const before=english.match(pattern)||[],after=text.match(pattern)||[];
    if(before.length!==after.length)throw Error('Placeholder count mismatch: '+key+' '+JSON.stringify({before,after}));
    if(JSON.stringify(before)!==JSON.stringify(after))repairs.push(key);
    let i=0;text=text.replace(pattern,()=>before[i++]);
    text=text.replace(/tập tin/g,'tệp').replace(/Tập tin/g,'Tệp').replace(/xuất khẩu/gi,'xuất').replace(/clipboard/gi,'bảng tạm').replace(/bảng nhớ tạm/g,'bảng tạm').replace(/người mẫu/gi,'mô hình').replace(/mã thông báo/gi,'token').replace(/xương tác vụ/gi,'Taskbone').replace(/Excalidraw tự động/g,'Excalidraw Automate').replace(/kẻ nói dối/gi,'Linter');
    if(/Markdown/.test(english))text=text.replace(/đánh dấu/gi,'Markdown');
    if(/transclu/i.test(english))text=text.replace(/loại trừ/gi,'nội dung nhúng').replace(/chuyển đổi/g,'nhúng');
    if(/theme/i.test(english))text=text.replace(/chủ đề/gi,'giao diện');
    if(/canvas/i.test(english)&&!/Obsidian Canvas|Canvas of/i.test(english))text=text.replace(/canvas/gi,'bảng vẽ');
    if(/vault/i.test(english))text=text.replace(/vault/gi,'kho ghi chú');
    if(/pane/i.test(english))text=text.replace(/bảng điều khiển/g,'khung');
    if(/stroke/i.test(english))text=text.replace(/đột quỵ/g,'nét vẽ');
  }
  text=text.replace(/[\u200b\ufeff]/g,'').replace(/[\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g,' ');
  let escaped=text.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${');
  escaped=escaped.replace(/QQEXPR(\d+)QQ/g,(_,i)=>'${'+expressions[Number(i)]+'}');
  out+=`  ${key}: \`${escaped}\`,\n`;
}
fs.writeFileSync('src/lang/locale/vi.ts',out+'};\n');
console.log(JSON.stringify({pluginKeys:en.properties.size,repairedPlaceholders:repairs},null,2));
