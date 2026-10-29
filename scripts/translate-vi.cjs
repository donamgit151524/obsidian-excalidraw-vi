// Build-time helper: only public upstream UI copy is sent for a draft translation.
// Never included in the plugin runtime. Cached results can be reviewed offline.
const fs = require('node:fs');
const ts = require('typescript');
const source = fs.readFileSync('src/lang/locale/en.ts', 'utf8');
const ast = ts.createSourceFile('en.ts', source, ts.ScriptTarget.Latest, true);
const obj = ast.statements.find(ts.isExportAssignment).expression;
const cachePath = 'scripts/vi-draft.json';
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};
const entries = obj.properties.map(p => {
  const expressions = [];
  function read(v) {
    if (ts.isStringLiteral(v) || ts.isNoSubstitutionTemplateLiteral(v)) return v.text;
    if (ts.isBinaryExpression(v) && v.operatorToken.kind === ts.SyntaxKind.PlusToken) return read(v.left) + read(v.right);
    if (!ts.isTemplateExpression(v)) throw Error('Unsupported: '+p.name.text);
    let result = v.head.text;
    for (const span of v.templateSpans) {
      result += `ZXQ${expressions.length}QXZ` + span.literal.text;
      expressions.push('${' + span.expression.getText(ast) + '}');
    }
    return result;
  }
  let text = read(p.initializer);
  // Keep syntax, destinations and technical placeholders byte-for-byte intact.
  text = text.replace(/<[^>]+>|https?:\/\/[^\s<>"']+|\{\{[^}]+\}\}|\{[A-Za-z_0-9]+\}|`[^`]+`|&[a-zA-Z#0-9]+;/g, token => {
    const marker = `ZXQ${expressions.length}QXZ`;
    expressions.push(token);
    return marker;
  });
  return {key: p.name.text, text, expressions};
});
async function translate(entry) {
  if (cache[entry.key]) return;
  if (!/[a-zA-Z]{2}/.test(entry.text.replace(/ZXQ\d+QXZ/g,''))) {
    cache[entry.key] = entry.text;
    return;
  }
  for (let attempt=0; attempt<5; attempt++) {
    try {
      const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + encodeURIComponent(entry.text);
      const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
      if (!response.ok) throw Error('HTTP ' + response.status);
      const data = await response.json();
      const result = data[0].map(x => x[0] || '').join('').replace(/ZXQ\s*(\d+)\s*QXZ/gi, (_,i)=>`ZXQ${i}QXZ`);
      for (let i=0;i<entry.expressions.length;i++) {
        if (entry.text.includes(`ZXQ${i}QXZ`) && !result.includes(`ZXQ${i}QXZ`)) throw Error('Missing protected token ' + i);
      }
      cache[entry.key]=result;
      fs.writeFileSync(cachePath, JSON.stringify(cache,null,2)+'\n');
      return;
    } catch (e) {
      if (attempt===4) { console.error(entry.key, e.message); return; }
      await new Promise(r=>setTimeout(r,10000*(attempt+1)));
    }
  }
}
async function main() {
  let next=0;
  await Promise.all(Array.from({length:1}, async()=> {
    while(next<entries.length) {
      const n=next++;
      if (cache[entries[n].key]) continue;
      await translate(entries[n]);
      if (!cache[entries[n].key]) continue;
      await new Promise(r=>setTimeout(r,900));
      if(n%50===0) console.log(n+'/'+entries.length);
    }
  }));
  const missing=entries.filter(e=>!cache[e.key]);
  if(missing.length) throw Error('Missing translations: '+missing.map(e=>e.key).join(', '));
  let out=source.slice(0,source.indexOf('export default'))+'export default {\n';
  for(const e of entries) {
    let translated=cache[e.key];
    for(let pass=0; pass<10 && /ZXQ\d+QXZ/.test(translated); pass++) {
      translated=translated.replace(/ZXQ(\d+)QXZ/g,(_,i)=> e.expressions[Number(i)].startsWith('${') ? `QQEXPR${i}QQ` : e.expressions[Number(i)]);
    }
    // Escape as a template literal before restoring the original expressions.
    translated=translated.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${');
    translated=translated.replace(/QQEXPR(\d+)QQ/g,(_,i)=>e.expressions[Number(i)]);
    out+=`  ${e.key}: \`${translated}\`,\n`;
  }
  out+='};\n';
  fs.writeFileSync('src/lang/locale/vi.ts',out);
  console.log('Vietnamese entries:',entries.length);
}
main().catch(e=>{console.error(e); process.exitCode=1;});
