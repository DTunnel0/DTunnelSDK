#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');
const PKG_JSON_PATH = path.join(ROOT_DIR, 'package.json');

const TEMPLATE_CHOICES = [
  { id: 'react-typescript', label: 'React + TypeScript (Vite)' },
  { id: 'typescript', label: 'TypeScript (Vite)' },
  { id: 'cdn', label: 'CDN (index.html unico)' },
];

const TEMPLATE_ALIASES = new Map([
  ['react', 'react-typescript'],
  ['react-ts', 'react-typescript'],
  ['react-typescript', 'react-typescript'],
  ['typescript', 'typescript'],
  ['ts', 'typescript'],
  ['cdn', 'cdn'],
  ['js', 'cdn'],
  ['javascript', 'cdn'],
]);

function printHelp() {
  console.log(`
DTunnel SDK CLI

Uso:
  dtunnel-sdk init [nome-do-projeto] [opcoes]

Opcoes:
  -t, --template <template>  Template: react-typescript | typescript | cdn
  -y, --yes                  Usa defaults sem perguntas interativas
      --no-install           Nao roda instalacao de dependencias
      --install              Forca instalacao de dependencias
      --pm <gerenciador>     npm | pnpm | yarn | bun
      --force                Permite usar pasta existente (se vazia)
  -h, --help                 Mostra esta ajuda

Exemplos:
  npx dtunnel-sdk init
  npx dtunnel-sdk init meu-app --template react-typescript
  npx dtunnel-sdk init meu-app --template typescript --no-install
  npm exec dtunnel-sdk init meu-app --template cdn
`);
}

function parseArgs(argv) {
  const parsed = {
    command: null,
    projectName: null,
    template: null,
    yes: false,
    install: null,
    packageManager: null,
    force: false,
    help: false,
  };

  const positional = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '-h' || arg === '--help') {
      parsed.help = true;
      continue;
    }

    if (arg === '-y' || arg === '--yes') {
      parsed.yes = true;
      continue;
    }

    if (arg === '--no-install') {
      parsed.install = false;
      continue;
    }

    if (arg === '--install') {
      parsed.install = true;
      continue;
    }

    if (arg === '--force') {
      parsed.force = true;
      continue;
    }

    if (arg === '-t' || arg === '--template') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('Informe um valor para --template.');
      }
      parsed.template = normalizeTemplateName(value);
      i += 1;
      continue;
    }

    if (arg === '--pm') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('Informe um valor para --pm.');
      }
      parsed.packageManager = normalizePackageManager(value);
      i += 1;
      continue;
    }

    positional.push(arg);
  }

  if (positional.length > 0) {
    parsed.command = positional[0];
  }

  if (positional.length > 1) {
    parsed.projectName = positional[1];
  }

  return parsed;
}

function normalizeTemplateName(value) {
  const normalized = TEMPLATE_ALIASES.get(String(value).toLowerCase());
  if (!normalized) {
    throw new Error(
      `Template invalido: ${value}. Use react-typescript, typescript ou cdn.`,
    );
  }
  return normalized;
}

function normalizePackageManager(value) {
  const normalized = String(value).toLowerCase();
  if (!['npm', 'pnpm', 'yarn', 'bun'].includes(normalized)) {
    throw new Error(
      `Gerenciador invalido: ${value}. Use npm, pnpm, yarn ou bun.`,
    );
  }
  return normalized;
}

function detectPackageManager() {
  const userAgent = process.env.npm_config_user_agent || '';
  if (userAgent.startsWith('pnpm/')) return 'pnpm';
  if (userAgent.startsWith('yarn/')) return 'yarn';
  if (userAgent.startsWith('bun/')) return 'bun';
  return 'npm';
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function promptTemplate(rl) {
  console.log('\nEscolha o template:');
  TEMPLATE_CHOICES.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.label} (${item.id})`);
  });

  while (true) {
    const answer = await ask(rl, '\nTemplate (1/2/3): ');
    const index = Number(answer);
    if (Number.isInteger(index) && index >= 1 && index <= TEMPLATE_CHOICES.length) {
      return TEMPLATE_CHOICES[index - 1].id;
    }
    console.log('Valor invalido. Digite 1, 2 ou 3.');
  }
}

async function promptYesNo(rl, question, defaultYes = true) {
  const defaultLabel = defaultYes ? 'Y/n' : 'y/N';
  while (true) {
    const answer = (await ask(rl, `${question} (${defaultLabel}): `)).toLowerCase();
    if (!answer) return defaultYes;
    if (answer === 'y' || answer === 'yes' || answer === 's' || answer === 'sim') {
      return true;
    }
    if (answer === 'n' || answer === 'no' || answer === 'nao') {
      return false;
    }
    console.log('Resposta invalida. Use y/n.');
  }
}

async function promptPackageManager(rl, defaultPm) {
  while (true) {
    const answer = (await ask(
      rl,
      `Gerenciador de pacotes [npm/pnpm/yarn/bun] (padrao: ${defaultPm}): `,
    )).toLowerCase();

    if (!answer) return defaultPm;
    if (['npm', 'pnpm', 'yarn', 'bun'].includes(answer)) {
      return answer;
    }
    console.log('Valor invalido. Use npm, pnpm, yarn ou bun.');
  }
}

async function readSdkVersion() {
  const pkgRaw = await fs.readFile(PKG_JSON_PATH, 'utf8');
  const pkg = JSON.parse(pkgRaw);
  return pkg.version || 'latest';
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureTargetDirectory(targetDir, force) {
  const exists = await pathExists(targetDir);
  if (!exists) {
    await fs.mkdir(targetDir, { recursive: true });
    return;
  }

  const entries = await fs.readdir(targetDir);
  if (entries.length > 0 && !force) {
    throw new Error(
      `Diretorio ja existe e nao esta vazio: ${targetDir}\nUse --force ou escolha outro nome.`,
    );
  }
}

async function copyDirRecursive(sourceDir, targetDir) {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirRecursive(sourcePath, targetPath);
      continue;
    }

    await fs.copyFile(sourcePath, targetPath);
  }
}

function isTextLikeFile(fileName) {
  if (fileName === '.gitignore') return true;
  const ext = path.extname(fileName);
  return ['.json', '.md', '.html', '.ts', '.tsx', '.css', '.js', '.mjs'].includes(
    ext,
  );
}

async function applyReplacements(targetDir, replacements) {
  const entries = await fs.readdir(targetDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await applyReplacements(fullPath, replacements);
      continue;
    }

    if (!isTextLikeFile(entry.name)) continue;

    let content = await fs.readFile(fullPath, 'utf8');
    for (const [key, value] of Object.entries(replacements)) {
      content = content.split(key).join(value);
    }
    await fs.writeFile(fullPath, content, 'utf8');
  }
}

function installDependencies(projectDir, packageManager) {
  const result = spawnSync(packageManager, ['install'], {
    cwd: projectDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status === 0) {
    return {
      ok: true,
      packageManager,
      status: result.status,
      error: null,
    };
  }

  return {
    ok: false,
    packageManager,
    status: result.status,
    error: result.error || null,
  };
}

function runScriptCommand(packageManager, scriptName) {
  if (packageManager === 'yarn') {
    return `yarn ${scriptName}`;
  }
  if (packageManager === 'bun') {
    return `bun run ${scriptName}`;
  }
  return `${packageManager} run ${scriptName}`;
}

function printNextSteps({
  projectName,
  template,
  packageManager,
  install,
}) {
  console.log('\nProjeto criado com sucesso.');
  console.log(`Template: ${template}`);
  console.log(`Pasta: ${projectName}`);

  console.log('\nProximos passos:');
  console.log(`  cd ${projectName}`);

  if (!install) {
    console.log(`  ${packageManager} install`);
  }

  if (template === 'cdn') {
    console.log(`  ${runScriptCommand(packageManager, 'build:webview')}`);
    console.log('\nArquivo final para WebView:');
    console.log(`  ${path.join(projectName, 'webview', 'index.html')}`);
    return;
  }

  console.log(`  ${runScriptCommand(packageManager, 'dev')}`);
  console.log(`  ${runScriptCommand(packageManager, 'build:webview')}`);
  console.log('\nArquivo final para WebView:');
  console.log(`  ${path.join(projectName, 'webview', 'index.html')}`);
}

async function runInit(parsed) {
  const interactive = process.stdin.isTTY && !parsed.yes;
  const rl = interactive
    ? createInterface({
        input: process.stdin,
        output: process.stdout,
      })
    : null;

  try {
    let projectName = parsed.projectName;
    if (!projectName) {
      if (!interactive) {
        throw new Error(
          'Informe o nome do projeto: dtunnel-sdk init <nome-do-projeto>',
        );
      }
      projectName = await ask(rl, 'Nome do projeto: ');
      if (!projectName) {
        throw new Error('Nome do projeto e obrigatorio.');
      }
    }

    let template = parsed.template;
    if (!template) {
      if (!interactive) {
        template = 'react-typescript';
      } else {
        template = await promptTemplate(rl);
      }
    }

    let packageManager = parsed.packageManager || detectPackageManager();
    if (!parsed.packageManager && interactive) {
      packageManager = await promptPackageManager(rl, packageManager);
    }

    let install = parsed.install;
    if (install == null) {
      install = parsed.yes ? true : interactive
        ? await promptYesNo(rl, 'Instalar dependencias agora?', true)
        : true;
    }

    const templateDir = path.join(TEMPLATES_DIR, template);
    if (!(await pathExists(templateDir))) {
      throw new Error(`Template nao encontrado: ${template}`);
    }

    const targetDir = path.resolve(process.cwd(), projectName);
    await ensureTargetDirectory(targetDir, parsed.force);
    await copyDirRecursive(templateDir, targetDir);

    const sdkVersion = await readSdkVersion();
    await applyReplacements(targetDir, {
      '__PROJECT_NAME__': path.basename(projectName),
      '__DTUNNEL_SDK_VERSION__': sdkVersion,
    });

    if (install) {
      console.log(`\nInstalando dependencias com ${packageManager}...`);
      let installResult = installDependencies(targetDir, packageManager);

      if (
        !installResult.ok &&
        packageManager !== 'npm' &&
        installResult.error &&
        installResult.error.code === 'ENOENT'
      ) {
        console.warn(
          `\n${packageManager} nao foi encontrado no PATH. Tentando com npm...`,
        );
        installResult = installDependencies(targetDir, 'npm');
        if (installResult.ok) {
          packageManager = 'npm';
        }
      }

      if (!installResult.ok) {
        const detail = installResult.error
          ? `${installResult.error.code ?? 'ERROR'}: ${installResult.error.message}`
          : `codigo de saida: ${String(installResult.status ?? 'desconhecido')}`;
        console.warn(
          `\nNao foi possivel instalar dependencias automaticamente (${detail}).`,
        );
        console.warn(`Rode manualmente: cd ${projectName} && ${packageManager} install`);
      }
    }

    printNextSteps({
      projectName,
      template,
      packageManager,
      install,
    });
  } finally {
    if (rl) rl.close();
  }
}

async function main() {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`[dtunnel-sdk] ${error.message}`);
    printHelp();
    process.exit(1);
  }

  if (parsed.help || !parsed.command) {
    printHelp();
    return;
  }

  if (parsed.command !== 'init') {
    console.error(`[dtunnel-sdk] Comando desconhecido: ${parsed.command}`);
    printHelp();
    process.exit(1);
  }

  try {
    await runInit(parsed);
  } catch (error) {
    console.error(`\n[dtunnel-sdk] Falha: ${error.message}`);
    process.exit(1);
  }
}

main();
