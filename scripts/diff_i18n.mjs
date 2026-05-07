import en from '../src/i18n/en.ts';
import fr from '../src/i18n/fr.ts';
import de from '../src/i18n/de.ts';

function flatten(o, p='', acc={}) {
  if (o === null || typeof o !== 'object') { acc[p]=typeof o; return acc; }
  if (Array.isArray(o)) { acc[p]=`array(${o.length})`; o.forEach((v,i)=>flatten(v,`${p}[${i}]`,acc)); return acc; }
  for (const k of Object.keys(o)) flatten(o[k], p?`${p}.${k}`:k, acc);
  return acc;
}
const E=flatten(en.default||en), F=flatten(fr.default||fr), D=flatten(de.default||de);
const allKeys=new Set([...Object.keys(E),...Object.keys(F),...Object.keys(D)]);
const missingFr=[], missingDe=[], missingEn=[];
for (const k of allKeys) {
  if (!(k in E)) missingEn.push(k);
  if (!(k in F)) missingFr.push(k);
  if (!(k in D)) missingDe.push(k);
}
console.log('Missing in FR:', missingFr.length);
missingFr.slice(0,300).forEach(k=>console.log('  FR:', k));
console.log('Missing in DE:', missingDe.length);
missingDe.slice(0,300).forEach(k=>console.log('  DE:', k));
console.log('Missing in EN:', missingEn.length);
missingEn.slice(0,300).forEach(k=>console.log('  EN:', k));
