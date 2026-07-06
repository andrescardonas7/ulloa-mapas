import fs from 'node:fs';
import path from 'node:path';

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return [
    d.getFullYear(),
    pad(d.getMonth() + 1),
    pad(d.getDate()),
    '-',
    pad(d.getHours()),
    pad(d.getMinutes()),
    pad(d.getSeconds()),
  ].join('');
}

export function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function pathExists(p) {
  try {
    fs.lstatSync(p);
    return true;
  } catch {
    return false;
  }
}

function isSymlink(p) {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

function safeRealpath(p) {
  try {
    return fs.realpathSync(p);
  } catch {
    return null;
  }
}

function backupExisting(p) {
  if (!pathExists(p)) return null;
  const parent = path.dirname(p);
  const base = path.basename(p);
  const backup = path.join(parent, `${base}.bak-${nowStamp()}`);
  fs.renameSync(p, backup);
  return backup;
}

export function ensureLinkedDirectory({
  linkPath,
  targetPath,
  preferJunction = process.platform === 'win32',
  fallbackCopy = true,
}) {
  const linkAbs = path.resolve(linkPath);
  const targetAbs = path.resolve(targetPath);

  if (isSymlink(linkAbs)) {
    const resolved = safeRealpath(linkAbs);
    const targetResolved = safeRealpath(targetAbs) ?? targetAbs;
    if (resolved && resolved === targetResolved) {
      return { action: 'noop', method: 'symlink', linkPath: linkAbs, targetPath: targetAbs };
    }
  }

  const backup = backupExisting(linkAbs);
  ensureDir(path.dirname(linkAbs));

  try {
    if (preferJunction && process.platform === 'win32') {
      fs.symlinkSync(targetAbs, linkAbs, 'junction');
      return { action: 'linked', method: 'junction', linkPath: linkAbs, targetPath: targetAbs, backup };
    }

    fs.symlinkSync(targetAbs, linkAbs, 'dir');
    return { action: 'linked', method: 'symlink', linkPath: linkAbs, targetPath: targetAbs, backup };
  } catch (err) {
    if (!fallbackCopy) throw err;
    fs.cpSync(targetAbs, linkAbs, { recursive: true });
    return { action: 'copied', method: 'copy', linkPath: linkAbs, targetPath: targetAbs, backup, error: String(err) };
  }
}

export function ensureCopiedDirectory({ destPath, sourcePath }) {
  const destAbs = path.resolve(destPath);
  const sourceAbs = path.resolve(sourcePath);
  const backup = backupExisting(destAbs);
  ensureDir(path.dirname(destAbs));
  fs.cpSync(sourceAbs, destAbs, { recursive: true });
  return { action: 'copied', method: 'copy', destPath: destAbs, sourcePath: sourceAbs, backup };
}

export function ensureCopiedFile({ destPath, sourcePath }) {
  const destAbs = path.resolve(destPath);
  const sourceAbs = path.resolve(sourcePath);
  const backup = backupExisting(destAbs);
  ensureDir(path.dirname(destAbs));
  fs.copyFileSync(sourceAbs, destAbs);
  return { action: 'copied', method: 'copy', destPath: destAbs, sourcePath: sourceAbs, backup };
}

export function ensureLinkedFile({
  linkPath,
  targetPath,
  fallbackCopy = true,
}) {
  const linkAbs = path.resolve(linkPath);
  const targetAbs = path.resolve(targetPath);

  if (isSymlink(linkAbs)) {
    const resolved = safeRealpath(linkAbs);
    const targetResolved = safeRealpath(targetAbs) ?? targetAbs;
    if (resolved && resolved === targetResolved) {
      return { action: 'noop', method: 'symlink', linkPath: linkAbs, targetPath: targetAbs };
    }
  }

  const backup = backupExisting(linkAbs);
  ensureDir(path.dirname(linkAbs));

  try {
    fs.symlinkSync(targetAbs, linkAbs, 'file');
    return { action: 'linked', method: 'symlink', linkPath: linkAbs, targetPath: targetAbs, backup };
  } catch (err) {
    if (!fallbackCopy) throw err;
    fs.copyFileSync(targetAbs, linkAbs);
    return { action: 'copied', method: 'copy', linkPath: linkAbs, targetPath: targetAbs, backup, error: String(err) };
  }
}

export function describePath(p) {
  const abs = path.resolve(p);
  if (!pathExists(abs)) return { path: abs, exists: false };

  const st = fs.lstatSync(abs);
  const result = {
    path: abs,
    exists: true,
    isSymlink: st.isSymbolicLink(),
    isDirectory: st.isDirectory(),
    isFile: st.isFile(),
    realpath: safeRealpath(abs),
  };

  if (result.isSymlink) {
    try {
      result.readlink = fs.readlinkSync(abs);
    } catch {
      // ignore
    }
  }

  return result;
}

