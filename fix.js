const fs = require('fs');

let cssPath = 'src/app/globals.css';
let css = fs.readFileSync(cssPath, 'utf8');
if(!css.includes('select, option')) {
    css += '\n\nselect, option { background-color: var(--color-surface); color: inherit; }\n.dark select, .dark option { background-color: #1e293b; color: #f8fafc; }\n';
    fs.writeFileSync(cssPath, css);
}

let seedPath = 'prisma/seed.ts';
let seed = fs.readFileSync(seedPath, 'utf8');
seed = seed.replace(
  /const paymentMethods = \[\s*\{ name: 'Bank Transfer'[\s\S]*?\},\s*\{ name: 'UPI'[\s\S]*?\},\s*\{ name: 'USDT \(TRC-20\)'[\s\S]*?\},\s*\]/,
  "const paymentMethods = [\n    { name: 'USDT (BEP-20)', type: 'CRYPTO', details: { network: 'BEP-20', walletAddress: '0x1234567890abcdef1234567890abcdef12345678' } }\n  ]"
);
fs.writeFileSync(seedPath, seed);

let depPath = 'src/app/(dashboard)/deposits/page.tsx';
let dep = fs.readFileSync(depPath, 'utf8');
dep = dep.replace(/<Card><CardHeader><CardTitle>USDT \(TRC-20\)<\/CardTitle><\/CardHeader><CardContent>Address: T...<\/CardContent><\/Card>/, "<Card><CardHeader><CardTitle>USDT (BEP-20)</CardTitle></CardHeader><CardContent>Address: 0x1234567890abcdef1234567890abcdef12345678</CardContent></Card>");
dep = dep.replace(/<Card><CardHeader><CardTitle>Bank Transfer.*?<\/Card>/s, '');
dep = dep.replace(/<Card><CardHeader><CardTitle>UPI.*?<\/Card>/s, '');
dep = dep.replace(/<option>USDT<\/option>\s*<option>Bank Transfer<\/option>\s*<option>UPI<\/option>/s, "<option>USDT (BEP-20)</option>");
dep = dep.replace(/<tr><td>DEP-1.*?<\/tr>/s, '');
fs.writeFileSync(depPath, dep);

let wdPath = 'src/app/(dashboard)/withdrawals/page.tsx';
let wd = fs.readFileSync(wdPath, 'utf8');
wd = wd.replace(/<option>USDT<\/option>\s*<option>Bank Transfer<\/option>\s*<option>UPI<\/option>/s, "<option>USDT (BEP-20)</option>");
wd = wd.replace(/<tr><td>WD-1.*?<\/tr>/s, '');
fs.writeFileSync(wdPath, wd);

console.log("Done fixes part 1");
