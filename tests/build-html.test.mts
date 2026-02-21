import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const buildScriptPath = path.join(repoRoot, 'scripts', 'build-html.mjs');

test('build-html inlines local assets safely without mutating $ tokens', () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'dtunnel-build-html-'));
  const distDir = path.join(tempRoot, 'dist');
  const assetsDir = path.join(distDir, 'assets');
  const outFile = path.join(tempRoot, 'webview', 'index.html');

  try {
    mkdirSync(assetsDir, { recursive: true });

    const html = [
      '<!doctype html>',
      '<html>',
      '  <head>',
      '    <link rel="stylesheet" href="/assets/app.css">',
      '    <link rel="modulepreload" href="/assets/chunk.js">',
      '    <link rel="modulepreload" href="https://cdn.example.com/chunk.js">',
      '  </head>',
      '  <body>',
      '    <script type="module" src="/assets/app.js"></script>',
      '    <script src="https://cdn.example.com/keep.js"></script>',
      '  </body>',
      '</html>',
      '',
    ].join('\n');

    const js = [
      'const markerA = "$&";',
      'const markerB = "$`";',
      "const markerC = \"$'\";",
      'const closing = "</script>";',
      'console.log(markerA, markerB, markerC, closing);',
      '',
    ].join('\n');

    const css = [
      '.box::before { content: "$&"; }',
      '.box { color: #fff; }',
      '',
    ].join('\n');

    writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');
    writeFileSync(path.join(assetsDir, 'app.js'), js, 'utf8');
    writeFileSync(path.join(assetsDir, 'app.css'), css, 'utf8');

    const run = spawnSync(
      process.execPath,
      [buildScriptPath, '--dist', distDir, '--out', outFile],
      {
        cwd: repoRoot,
        encoding: 'utf8',
      },
    );

    assert.equal(
      run.status,
      0,
      `build-html failed\nstdout:\n${run.stdout}\nstderr:\n${run.stderr}`,
    );

    const generated = readFileSync(outFile, 'utf8');

    assert.match(generated, /<style data-inline-from="\/assets\/app\.css">/);
    assert.match(generated, /const markerA = "\$&";/);
    assert.match(generated, /const markerB = "\$`";/);
    assert.match(generated, /const markerC = "\$'";/);
    assert.match(generated, /const closing = "<\\\/script>";/);

    assert.doesNotMatch(
      generated,
      /<script type="module" src="\/assets\/app\.js"><\/script>/,
    );
    assert.doesNotMatch(
      generated,
      /<link rel="modulepreload" href="\/assets\/chunk\.js">/,
    );
    assert.match(
      generated,
      /<link rel="modulepreload" href="https:\/\/cdn\.example\.com\/chunk\.js">/,
    );
    assert.match(
      generated,
      /<script src="https:\/\/cdn\.example\.com\/keep\.js"><\/script>/,
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});
