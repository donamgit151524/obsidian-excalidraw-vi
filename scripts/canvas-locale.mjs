import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

/** Locate the bundled Vietnamese dictionary by its distinctive translated paste label. */
export function findCanvasLocale(source, language) {
  const ast = ts.createSourceFile('canvas.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const matches = [];
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const labels = node.properties.find(p => p.name?.getText(ast) === 'labels');
      if (labels?.initializer && ts.isObjectLiteralExpression(labels.initializer)) {
        const paste = labels.initializer.properties.find(p => p.name?.getText(ast) === 'paste');
        if (paste && ts.isStringLiteral(paste.initializer) && paste.initializer.text === (language === 'vi' ? 'Dán' : 'Paste')) matches.push(node);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  if (matches.length !== 1) throw Error(`Expected one ${language} canvas locale, found ${matches.length}`);
  return {start: matches[0].getStart(ast), end: matches[0].getEnd(), value: vm.runInNewContext('(' + matches[0].getText(ast) + ')')};
}

/** Patch only the language dictionary in memory while assembling the normal Rollup payload. */
export function injectCanvasVietnamese(source) {
  const locale = findCanvasLocale(source, 'vi');
  const translated = JSON.parse(fs.readFileSync('src/lang/canvas-vi.json', 'utf8'));
  return source.slice(0, locale.start) + JSON.stringify(translated) + source.slice(locale.end);
}

if (process.argv.includes('--extract')) {
  const source = fs.readFileSync('node_modules/@zsviczian/excalidraw/dist/obsidian/excalidraw.development.js','utf8');
  fs.writeFileSync('scripts/canvas-en.json', JSON.stringify(findCanvasLocale(source,'en').value,null,2)+'\n');
  fs.writeFileSync('src/lang/canvas-vi.json', JSON.stringify(findCanvasLocale(source,'vi').value,null,2)+'\n');
}
