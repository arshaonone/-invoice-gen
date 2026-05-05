const fs = require('fs');
const c = fs.readFileSync('components/invoice/InvoiceCreator.tsx', 'utf8');
const lines = c.split('\n');

let depth = 0;
for (let i = 343; i < 985; i++) {
  const l = lines[i];
  const selfClose = (l.match(/<div[^>]*\/>/g) || []).length;
  const opens = (l.match(/<div/g) || []).length - selfClose;
  const closes = (l.match(/<\/div>/g) || []).length;
  const prev = depth;
  depth += opens - closes;
  
  if (i >= 901) {
    const marker = (opens > 0 || closes > 0) ? `  [o=${opens} c=${closes}]` : '';
    console.log(`L${i+1}:${depth}${marker} ${l.trim().substring(0, 70)}`);
  }
}
