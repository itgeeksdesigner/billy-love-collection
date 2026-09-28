// Added by Vercel Cleanup to cut Edge Requests without stale files.
// On every Vercel deploy this copies the site into the output folder and adds ?v=<content hash>
// to local CSS/JS/image/font links. vercel.json caches only ?v= URLs for a year, so browsers
// stop re-requesting them, and any file you change gets a new hash, so a normal reload
// always shows the latest version. HTML itself is never cached.
// To undo: delete this file and remove "buildCommand", "outputDirectory" and the ?v= header rule from vercel.json.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const OUT_NAME = process.argv[2] || 'dist';
const OUT = path.join(ROOT, OUT_NAME);
const SELF = path.basename(new URL(import.meta.url).pathname);
const SKIP = new Set(['.git', 'node_modules', '.vercel', OUT_NAME, SELF]);
const ASSET = /\.(css|js|mjs|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|eot|mp4|webm|mp3)$/i;

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (src === ROOT && SKIP.has(e.name)) continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else if (e.isFile()) fs.copyFileSync(s, d);
  }
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile()) out.push(p);
  }
  return out;
}

function resolve(ref, baseDir) {
  ref = (ref || '').trim();
  if (!ref || /^(#|data:|blob:|mailto:|tel:|javascript:)/i.test(ref) || /^[a-z][a-z0-9+.-]*:|^\/\//i.test(ref)) return null;
  if (ref.includes('${') || ref.includes('{{') || ref.includes('<')) return null;
  let p = ref.split('#')[0].split('?')[0];
  try { p = decodeURI(p); } catch { return null; }
  if (!p || !ASSET.test(p)) return null;
  const full = path.normalize(p.startsWith('/') ? path.join(OUT, p) : path.join(baseDir, p));
  if (!full.startsWith(OUT + path.sep)) return null;
  return fs.existsSync(full) && fs.statSync(full).isFile() ? full : null;
}

const hashes = new Map();
const cssDone = new Set();
let versioned = 0;

function hashOf(full) {
  if (!hashes.has(full)) {
    if (/\.css$/i.test(full)) rewriteCss(full);
    hashes.set(full, crypto.createHash('sha1').update(fs.readFileSync(full)).digest('hex').slice(0, 10));
  }
  return hashes.get(full);
}

function version(ref, baseDir) {
  const full = resolve(ref, baseDir);
  if (!full) return ref;
  const h = hashOf(full);
  const i = ref.indexOf('#');
  let main = i < 0 ? ref : ref.slice(0, i);
  const frag = i < 0 ? '' : ref.slice(i);
  // a hand-written ?v=... is replaced by the content hash, so a forgotten bump can never serve stale files
  main = main.replace(/([?&])v=[^&]*(&|$)/, (m, a, b) => (b ? a : '')).replace(/[?&]$/, '');
  versioned++;
  return main + (main.includes('?') ? '&' : '?') + 'v=' + h + frag;
}

function rewriteCss(file) {
  if (cssDone.has(file)) return;
  cssDone.add(file);
  const dir = path.dirname(file);
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/url\(\s*(["']?)([^"')]+?)\1\s*\)/gi, (m, q, ref) => `url(${q}${version(ref, dir)}${q})`);
  text = text.replace(/@import\s+(["'])([^"']+)\1/gi, (m, q, ref) => `@import ${q}${version(ref, dir)}${q}`);
  fs.writeFileSync(file, text);
}

function rewriteHtml(file) {
  const dir = path.dirname(file);
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/(\s(?:src|href|poster|data-src|data-bg)\s*=\s*)(["'])([^"']*)\2/gi,
    (m, pre, q, ref) => pre + q + version(ref, dir) + q);
  text = text.replace(/(\s(?:srcset|data-srcset)\s*=\s*)(["'])([^"']*)\2/gi,
    (m, pre, q, set) => pre + q + set.split(',').map(part => {
      const bits = part.trim().split(/\s+/);
      bits[0] = version(bits[0], dir);
      return (part.match(/^\s*/)[0]) + bits.join(' ');
    }).join(',') + q);
  text = text.replace(/url\(\s*(&quot;|["']?)([^"')&]+?)\1\s*\)/gi, (m, q, ref) => `url(${q}${version(ref, dir)}${q})`);
  fs.writeFileSync(file, text);
}

fs.rmSync(OUT, { recursive: true, force: true });
copyDir(ROOT, OUT);
const files = walk(OUT);
const css = files.filter(f => /\.css$/i.test(f));
const html = files.filter(f => /\.html?$/i.test(f));
css.forEach(f => hashOf(f));
html.forEach(rewriteHtml);
console.log(`vercel-build: copied ${files.length} files, versioned ${versioned} links in ${html.length} pages and ${css.length} stylesheets`);
