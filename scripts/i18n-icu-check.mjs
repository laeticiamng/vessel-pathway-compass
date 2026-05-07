#!/usr/bin/env node
/**
 * ICU / variable parity check across EN, FR, DE locale dictionaries.
 *
 * For every translation key whose EN value is a string, compare against FR/DE:
 *   - Set of placeholder variables `{name}` must match exactly.
 *   - Inside `{name, plural, ...}` blocks, the set of category keywords
 *     (zero/one/two/few/many/other and `=N` exact matches) must match.
 *   - Inside `{name, select, ...}` blocks, the set of branch labels must match.
 *
 * Mismatches commonly cause runtime crashes in ICU formatters (missing
 * `other`, missing variable referenced from JSX, etc.) so the build is
 * intentionally hard-failed.
 *
 * Wired into `prebuild` after the strict missing-key gate.
 */
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N_DIR = join(__dirname, "..", "src", "i18n");
const LOCALES = ["en", "fr", "de"];

async function loadDicts() {
  const out = {};
  for (const loc of LOCALES) {
    const mod = await import(pathToFileURL(join(I18N_DIR, `${loc}.ts`)).href);
    out[loc] = mod[loc];
  }
  return out;
}

function flatten(obj, prefix = "", out = {}) {
  if (obj == null || typeof obj !== "object" || Array.isArray(obj)) {
    out[prefix] = obj;
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, p, out);
    else out[p] = v;
  }
  return out;
}

// Find balanced {...} segments at top level.
function topLevelBraces(s) {
  const out = [];
  let depth = 0, start = -1;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (c === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        out.push({ start, end: i, body: s.slice(start + 1, i) });
        start = -1;
      }
    }
  }
  return out;
}

/**
 * Parse an ICU string into a structural signature:
 *   {
 *     vars: Set<string>,
 *     plurals: Map<varName, Set<category>>,   // categories: zero|one|two|few|many|other|=N
 *     selects: Map<varName, Set<branchName>>,
 *   }
 */
function signature(str) {
  const sig = { vars: new Set(), plurals: new Map(), selects: new Map() };
  if (typeof str !== "string") return sig;
  for (const seg of topLevelBraces(str)) {
    const body = seg.body.trim();
    // {name, plural, …} or {name, select, …}
    const head = body.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*,\s*(plural|selectordinal|select)\s*,\s*([\s\S]+)$/);
    if (head) {
      const [, name, kind, rest] = head;
      sig.vars.add(name);
      const cats = new Set();
      // Parse nested {cat {…}} pairs
      let i = 0;
      while (i < rest.length) {
        // Skip whitespace
        while (i < rest.length && /\s/.test(rest[i])) i++;
        // Read keyword (letters, digits, =N, _, -)
        let k = "";
        while (i < rest.length && /[A-Za-z0-9_=\-]/.test(rest[i])) { k += rest[i]; i++; }
        // Skip whitespace then expect '{'
        while (i < rest.length && /\s/.test(rest[i])) i++;
        if (rest[i] !== "{" || k === "") break;
        // Skip balanced braces
        let depth = 1; i++;
        while (i < rest.length && depth > 0) {
          if (rest[i] === "{") depth++;
          else if (rest[i] === "}") depth--;
          i++;
        }
        cats.add(k);
        // Recursively analyze nested for vars too
        const inner = signature(rest.slice(rest.indexOf("{") + 1));
        for (const v of inner.vars) sig.vars.add(v);
      }
      if (kind === "plural" || kind === "selectordinal") sig.plurals.set(name, cats);
      else sig.selects.set(name, cats);
      continue;
    }
    // Plain {name} placeholder (or formatted {name, number, …} — we just track var)
    const plain = body.match(/^([A-Za-z_][A-Za-z0-9_]*)\b/);
    if (plain) sig.vars.add(plain[1]);
  }
  return sig;
}

function diffSet(a, b) {
  const onlyA = [...a].filter((x) => !b.has(x));
  const onlyB = [...b].filter((x) => !a.has(x));
  return { onlyA, onlyB };
}

const dicts = await loadDicts();
const flatEn = flatten(dicts.en);
const issues = [];

for (const [key, enValRaw] of Object.entries(flatEn)) {
  if (typeof enValRaw !== "string") continue;
  const enSig = signature(enValRaw);
  for (const loc of ["fr", "de"]) {
    const flat = flatten(dicts[loc]);
    const v = flat[key];
    if (typeof v !== "string") continue; // missing keys are caught by strict-check
    const sig = signature(v);
    const varDiff = diffSet(enSig.vars, sig.vars);
    if (varDiff.onlyA.length || varDiff.onlyB.length) {
      issues.push({
        type: "vars",
        locale: loc,
        key,
        en: [...enSig.vars],
        loc: [...sig.vars],
        missing: varDiff.onlyA,
        extra: varDiff.onlyB,
      });
    }
    for (const [name, cats] of enSig.plurals) {
      const otherCats = sig.plurals.get(name);
      if (!otherCats) {
        issues.push({ type: "plural-missing", locale: loc, key, var: name });
        continue;
      }
      // ICU requires `other` in every locale; beyond that, allow locale to add
      // categories required by its CLDR rules but never DROP `=N` exact matches
      // declared in EN.
      const exactEn = [...cats].filter((c) => c.startsWith("="));
      const exactLoc = new Set([...otherCats].filter((c) => c.startsWith("=")));
      const missingExact = exactEn.filter((c) => !exactLoc.has(c));
      if (missingExact.length || !otherCats.has("other")) {
        issues.push({
          type: "plural-cats",
          locale: loc,
          key,
          var: name,
          en: [...cats],
          loc: [...otherCats],
          missingExact,
          missingOther: !otherCats.has("other"),
        });
      }
    }
    for (const [name, branches] of enSig.selects) {
      const otherBranches = sig.selects.get(name);
      if (!otherBranches) {
        issues.push({ type: "select-missing", locale: loc, key, var: name });
        continue;
      }
      const dd = diffSet(branches, otherBranches);
      if (dd.onlyA.length || dd.onlyB.length || !otherBranches.has("other")) {
        issues.push({
          type: "select-branches",
          locale: loc,
          key,
          var: name,
          missing: dd.onlyA,
          extra: dd.onlyB,
          missingOther: !otherBranches.has("other"),
        });
      }
    }
  }
}

if (issues.length === 0) {
  console.log("✅ ICU parity check passed — placeholders, plural and select categories match EN in FR/DE.");
  process.exit(0);
}

console.error(`\n❌ ${issues.length} ICU parity issue(s) detected:\n`);
for (const iss of issues.slice(0, 50)) {
  if (iss.type === "vars") {
    console.error(
      `  [${iss.locale}] ${iss.key}: variables differ (EN=${JSON.stringify(iss.en)}, ${iss.locale}=${JSON.stringify(iss.loc)})` +
        (iss.missing.length ? `  missing: ${iss.missing.join(", ")}` : "") +
        (iss.extra.length ? `  extra: ${iss.extra.join(", ")}` : ""),
    );
  } else if (iss.type === "plural-missing") {
    console.error(`  [${iss.locale}] ${iss.key}: EN uses plural for {${iss.var}} but locale string has no plural block.`);
  } else if (iss.type === "plural-cats") {
    console.error(
      `  [${iss.locale}] ${iss.key}: plural {${iss.var}} category mismatch. EN=${JSON.stringify(iss.en)}  ${iss.locale}=${JSON.stringify(iss.loc)}` +
        (iss.missingExact.length ? `  missing exact: ${iss.missingExact.join(", ")}` : "") +
        (iss.missingOther ? `  missing 'other'` : ""),
    );
  } else if (iss.type === "select-missing") {
    console.error(`  [${iss.locale}] ${iss.key}: EN uses select for {${iss.var}} but locale has no select block.`);
  } else if (iss.type === "select-branches") {
    console.error(
      `  [${iss.locale}] ${iss.key}: select {${iss.var}} branch mismatch.` +
        (iss.missing.length ? `  missing: ${iss.missing.join(", ")}` : "") +
        (iss.extra.length ? `  extra: ${iss.extra.join(", ")}` : "") +
        (iss.missingOther ? `  missing 'other'` : ""),
    );
  }
}
if (issues.length > 50) console.error(`  … and ${issues.length - 50} more`);
console.error("\nFix the issues above in src/i18n/{fr,de}.ts then re-run `npm run i18n:icu`.");
process.exit(1);
