const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const rootDir      = path.resolve(__dirname, '..');
const frontendDir  = path.resolve(rootDir, '..', 'frontend');
const backendDir   = path.resolve(rootDir, '..', 'backend');
const buildDir     = path.join(rootDir, 'build');
const distDir      = path.join(rootDir, 'dist');
const javaDir      = path.join(rootDir, 'java');
const frontendOut  = path.join(frontendDir, 'dist');

function log(s){ console.log(`\n[build] ${s}`); }

function run(cmd, args, cwd) {
  log(`run: ${cmd} ${args.join(' ')}  (cwd: ${cwd})`);
  const res = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  if (res.status !== 0) {
    console.error(`[build] Command failed with code ${res.status}`);
    process.exit(res.status || 1);
  }
}

function rm(p) {
  try { fs.rmSync(p, { recursive: true, force: true }); } catch(_) {}
}
function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) throw new Error(`Source not found: ${src}`);
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

(function main() {
  // 1) clean
  log('clean dist, build, java/*.jar');
  rm(distDir);
  rm(buildDir);
  ensureDir(javaDir);
  for (const f of (fs.existsSync(javaDir) ? fs.readdirSync(javaDir) : [])) {
    if (f.endsWith('.jar')) rm(path.join(javaDir, f));
  }

  log('build frontend');
  run('npm', ['run', 'build'], frontendDir);

  log(`copy frontend: ${frontendOut} -> ${buildDir}`);
  copyDir(frontendOut, buildDir);

  log('build backend (Maven)');
  const mvnwWin  = path.join(backendDir, 'mvnw.cmd');
  const mvnwNix  = path.join(backendDir, 'mvnw');
  const hasMvnw  = fs.existsSync(process.platform === 'win32' ? mvnwWin : mvnwNix);
  const mvnCmd   = hasMvnw
    ? (process.platform === 'win32' ? 'mvnw.cmd' : './mvnw')
    : 'mvn';

  run(mvnCmd, ['-q', '-DskipTests', 'clean', 'package'], backendDir);

  const targetDir = path.join(backendDir, 'target');
  if (!fs.existsSync(targetDir)) {
    console.error(`[build] target not found: ${targetDir}`);
    process.exit(1);
  }
  const jars = fs.readdirSync(targetDir).filter(n => n.endsWith('.jar'));
  if (jars.length === 0) {
    console.error('[build] no JAR artifacts found in backend/target');
    process.exit(1);
  }
  log(`copy JAR(s) → ${javaDir}`);
  for (const j of jars) {
    const src = path.join(targetDir, j);
    const dst = path.join(javaDir, j);
    fs.copyFileSync(src, dst);
  }

  log('run electron-builder');
  run('npx', ['electron-builder', '--publish', 'always'], rootDir);

  log('DONE ✅');
})();