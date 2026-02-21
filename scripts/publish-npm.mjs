#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

function parseArgs(argv) {
  const options = {
    tag: 'latest',
    dryRun: false,
    otp: null,
    skipAuth: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];

    if (key === '--tag' && value) {
      options.tag = value;
      i += 1;
      continue;
    }

    if (key === '--otp' && value) {
      options.otp = value;
      i += 1;
      continue;
    }

    if (key === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (key === '--skip-auth') {
      options.skipAuth = true;
      continue;
    }
  }

  return options;
}

function run(command, args, opts = {}) {
  const resolved = resolveCommand(command, args);
  const result = spawnSync(resolved.command, resolved.args, {
    stdio: 'inherit',
    ...opts,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function resolveCommand(command, args) {
  if (process.platform === 'win32' && command === 'npm') {
    return {
      command: 'cmd.exe',
      args: ['/d', '/s', '/c', command, ...args],
    };
  }

  return { command, args };
}

function readPackageJson() {
  const raw = readFileSync('package.json', 'utf8');
  return JSON.parse(raw);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const pkg = readPackageJson();

  if (!pkg.name || !pkg.version) {
    console.error('package.json invalido: name/version obrigatorios.');
    process.exit(1);
  }

  if (!options.skipAuth) {
    console.log('Validando npm login...');
    run('npm', ['whoami']);
  }

  console.log('Validando pacote (npm pack --dry-run)...');
  run('npm', ['pack', '--dry-run']);

  const publishArgs = ['publish', '--tag', options.tag];
  if (options.dryRun) {
    publishArgs.push('--dry-run');
  }
  if (options.otp) {
    publishArgs.push('--otp', options.otp);
  }

  console.log(
    `Publicando ${pkg.name}@${pkg.version} (tag: ${options.tag})${
      options.dryRun ? ' [dry-run]' : ''
    }...`,
  );
  run('npm', publishArgs);

  if (!options.dryRun) {
    console.log('');
    console.log(`Publicado com sucesso: ${pkg.name}@${pkg.version}`);
    console.log(`Verifique: npm view ${pkg.name} version`);
  }
}

main();
