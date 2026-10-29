const fs=require('fs'),path=require('path'),ts=require('typescript');
const translations=require('./dynamic-vi.json');
const keys=Object.fromEntries(Object.keys(translations).map((s,i)=>[s,'UI_DYNAMIC_'+String(i+1).padStart(3,'0')]));
function walk(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,f.name);
  if(f.isDirectory()){walk(file);continue;}
  if(!/\.tsx?$/.test(file)||file.includes('lang'))continue;
  let source=fs.readFileSync(file,'utf8');
  const ast=ts.createSourceFile(file,source,99,true),edits=[];
  function visit(n){
    if(ts.isTemplateExpression(n)){
      let i=0,text=n.head.text;
      for(const span of n.templateSpans)text+=`{${i++}}`+span.literal.text;
      if(keys[text]){
        let result=`t("${keys[text]}")`;
        n.templateSpans.forEach((s,i)=>{result+=`.replace("{${i}}", String(${s.expression.getText(ast)}))`;});
        edits.push({start:n.getStart(ast),end:n.getEnd(),text:result});return;
      }
    }
    ts.forEachChild(n,visit);
  }
  visit(ast);
  for(const e of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,e.start)+e.text+source.slice(e.end);
  if(edits.length){
    if(!/import \{[^}]*\bt\b[^}]*\} from ["'][^"']*lang\/helpers["']/.test(source))source='import { t } from "src/lang/helpers";\n'+source;
    fs.writeFileSync(file,source);
  }
}}
walk('src');
for(const lang of ['en','ru','es','zh-cn','zh-tw','vi']){
  const file=`src/lang/locale/${lang}.ts`;if(!fs.existsSync(file))continue;
  let source=fs.readFileSync(file,'utf8');
  const additions=Object.entries(translations).filter(([s])=>!source.includes(keys[s]+':')).map(([s,v])=>`  ${keys[s]}: ${JSON.stringify(lang==='vi'?v:s)},`).join('\n');
  if(additions)source=source.replace('export default {','export default {\n'+additions+'\n');
  fs.writeFileSync(file,source);
}
