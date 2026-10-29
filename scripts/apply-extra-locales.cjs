// Convert remaining upstream UI literals to normal translation keys.
const fs=require('node:fs'),ts=require('typescript');
const translations=require('./extra-vi.json');
const records=[...require('./hardcoded-ui.json'),...require('./object-ui.json')];
const keys=Object.fromEntries(Object.keys(translations).map((s,i)=>[s,'UI_EXTRA_'+String(i+1).padStart(3,'0')]));
const files=[...new Set(records.filter(r=>translations[r.text]).map(r=>r.file))];
for(const file of files){
  // Titles in the rank table are evaluated during module initialization; use getters.
  if(file.includes('actionIcons')) continue;
  let source=fs.readFileSync(file,'utf8');
  const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
  const edits=[];
  const allowed=new Set(Object.keys(translations));
  function visit(n){
    if((ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))&&allowed.has(n.text)){
      const parent=n.parent;
      // Keep console diagnostics as technical English.
      if(ts.isCallExpression(parent)&&parent.expression.getText(ast).startsWith('console.')) return;
      edits.push({start:n.getStart(ast),end:n.getEnd(),text:`t("${keys[n.text]}")`});
    }
    ts.forEachChild(n,visit);
  }
  visit(ast);
  for(const edit of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,edit.start)+edit.text+source.slice(edit.end);
  if(edits.length&&!/import \{[^}]*\bt\b[^}]*\} from ["'][^"']*lang\/helpers["']/.test(source))source='import { t } from "src/lang/helpers";\n'+source;
  fs.writeFileSync(file,source);
}
for(const lang of ['en','ru','es','zh-cn','zh-tw','vi']){
  const file=`src/lang/locale/${lang}.ts`;
  if(!fs.existsSync(file))continue;
  let source=fs.readFileSync(file,'utf8');
  const additions=Object.entries(translations).filter(([s])=>!source.includes(keys[s]+':')).map(([s,v])=>`  ${keys[s]}: ${JSON.stringify(lang==='vi'?v:s)},`).join('\n');
  if(additions)source=source.replace('export default {','export default {\n'+additions+'\n');
  fs.writeFileSync(file,source);
}
