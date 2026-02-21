#!/usr/bin/env node
import { existsSync } from 'node:fs';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

function parseArgs(argv) {
  const options = {
    version: null,
    branch: 'main',
    noPush: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];

    if (key === '--version' && value) {
      options.version = value;
      i += 1;
      continue;
    }

    if (key === '--branch' && value) {
      options.branch = value;
      i += 1;
      continue;
    }

    if (key === '--no-push') {
      options.noPush = true;
      continue;
    }
  }

  return options;
}

function run(command, args, opts = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: 'pipe',
    ...opts,
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    const stdout = result.stdout?.trim();
    if (stderr) console.error(stderr);
    if (stdout) console.error(stdout);
    process.exit(result.status ?? 1);
  }

  return (result.stdout ?? '').trim();
}

function runInherit(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function normalizeTag(version) {
  if (!version || /^\s*$/.test(version)) {
    console.error('Version nao pode ser vazia. Use --version X.Y.Z');
    process.exit(1);
  }

  const tag = version.startsWith('v') ? version : `v${version}`;
  const isValid = /^v\d+\.\d+\.\d+([\-+][0-9A-Za-z.\-]+)?$/.test(tag);
  if (!isValid) {
    console.error('Version invalida. Use X.Y.Z (ex: 1.0.1) ou vX.Y.Z.');
    process.exit(1);
  }
  return tag;
}

function parseGithubRepoPath(remoteUrl) {
  const match = remoteUrl.match(/github\.com[:/](.+?)(?:\.git)?$/);
  return match ? match[1] : null;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const tag = normalizeTag(options.version);

  if (!existsSync('sdk/dtunnel-sdk.js')) {
    console.error(
      'Arquivo sdk/dtunnel-sdk.js nao encontrado. Execute na raiz do repositorio.',
    );
    process.exit(1);
  }

  const currentBranch = run('git', ['branch', '--show-current']);
  if (currentBranch !== options.branch) {
    console.error(
      `Branch atual e '${currentBranch}'. Troque para '${options.branch}' antes de publicar.`,
    );
    process.exit(1);
  }

  const dirty = run('git', ['status', '--porcelain']);
  if (dirty) {
    console.error(
      'Existem alteracoes locais nao commitadas. Commit/stash antes de criar release.',
    );
    process.exit(1);
  }

  const existingTag = run('git', ['tag', '--list', tag]);
  if (existingTag === tag) {
    console.error(`A tag ${tag} ja existe.`);
    process.exit(1);
  }

  console.log(`Atualizando branch '${options.branch}'...`);
  runInherit('git', ['fetch', 'origin', options.branch]);
  runInherit('git', ['pull', '--ff-only', 'origin', options.branch]);

  console.log(`Criando tag ${tag}...`);
  runInherit('git', ['tag', '-a', tag, '-m', `release: ${tag}`]);

  if (options.noPush) {
    console.log(`Tag criada localmente: ${tag}`);
    console.log('Para publicar depois, execute:');
    console.log(`  git push origin ${options.branch}`);
    console.log(`  git push origin ${tag}`);
    return;
  }

  console.log('Enviando branch e tag para origin...');
  runInherit('git', ['push', 'origin', options.branch]);
  runInherit('git', ['push', 'origin', tag]);

  const remoteUrl = run('git', ['config', '--get', 'remote.origin.url']);
  const repoPath = parseGithubRepoPath(remoteUrl);

  if (repoPath) {
    console.log('');
    console.log('Release iniciada.');
    console.log(`Acompanhe o workflow: https://github.com/${repoPath}/actions`);
    console.log(`Download da release: https://github.com/${repoPath}/releases/tag/${tag}`);
  } else {
    console.log(
      'Tag enviada com sucesso. Verifique a aba Actions/Releases no seu remoto.',
    );
  }
}

main();
