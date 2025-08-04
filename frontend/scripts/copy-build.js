import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontRoot = path.resolve(__dirname, '..');
const distDir   = path.join(frontRoot, 'dist');
const targetDir = path.resolve(frontRoot, '..', 'backend', 'src', 'main', 'resources', 'static');

function rm(p) {
  try { fs.rmSync(p, { recursive: true, force: true }); } catch (_) {}
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`[copy-static] Source not found: ${src}`);
    process.exit(1);
  }
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

console.log(`[copy-static] Clean: ${targetDir}`);
rm(targetDir);

console.log(`[copy-static] Copy: ${distDir} -> ${targetDir}`);
copyDir(distDir, targetDir);

console.log('[copy-static] Done ✅');