import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const cliPath = path.join(repoRoot, 'bin', 'dtunnel-sdk.mjs');
const repoPkg = JSON.parse(
  readFileSync(path.join(repoRoot, 'package.json'), 'utf8'),
) as { version: string };

function runInit(tempRoot: string, projectName: string, template: string) {
  return spawnSync(
    process.execPath,
    [
      cliPath,
      'init',
      projectName,
      '--template',
      template,
      '--yes',
      '--no-install',
    ],
    {
      cwd: tempRoot,
      encoding: 'utf8',
    },
  );
}

test('cli init cria template typescript com build:webview local', () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'dtunnel-cli-ts-'));

  try {
    const run = runInit(tempRoot, 'my-ts-app', 'typescript');
    assert.equal(
      run.status,
      0,
      `init typescript falhou\nstdout:\n${run.stdout}\nstderr:\n${run.stderr}`,
    );

    const projectDir = path.join(tempRoot, 'my-ts-app');
    const pkgPath = path.join(projectDir, 'package.json');
    const scriptPath = path.join(projectDir, 'scripts', 'build-webview-html.mjs');
    const mainPath = path.join(projectDir, 'src', 'main.ts');

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
    };

    assert.equal(
      pkg.scripts['build:webview'],
      'npm run build && node ./scripts/build-webview-html.mjs --dist dist --out webview/index.html',
    );
    assert.equal(pkg.dependencies['dtunnel-sdk'], `^${repoPkg.version}`);
    assert.ok(statSync(scriptPath).isFile());
    assert.ok(statSync(mainPath).isFile());
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('cli init cria template cdn com script build:webview', () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'dtunnel-cli-cdn-'));

  try {
    const run = runInit(tempRoot, 'my-cdn-app', 'cdn');
    assert.equal(
      run.status,
      0,
      `init cdn falhou\nstdout:\n${run.stdout}\nstderr:\n${run.stderr}`,
    );

    const projectDir = path.join(tempRoot, 'my-cdn-app');
    const pkgPath = path.join(projectDir, 'package.json');
    const copyScriptPath = path.join(projectDir, 'scripts', 'copy-webview.mjs');
    const indexPath = path.join(projectDir, 'index.html');

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
      scripts: Record<string, string>;
    };
    const indexHtml = readFileSync(indexPath, 'utf8');

    assert.equal(pkg.scripts['build:webview'], 'node ./scripts/copy-webview.mjs');
    assert.ok(statSync(copyScriptPath).isFile());
    assert.match(indexHtml, /cdn\.jsdelivr\.net\/npm\/dtunnel-sdk@latest/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});
