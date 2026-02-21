#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
  const options = {
    dist: 'dist',
    out: 'webview/index.html',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];

    if (key === '--dist' && value) {
      options.dist = value;
      i += 1;
      continue;
    }

    if (key === '--out' && value) {
      options.out = value;
      i += 1;
      continue;
    }
  }

  return options;
}

function isExternalUrl(value) {
  return /^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith('data:');
}

function resolveLocalAssetPath(distDir, assetPath) {
  const normalized = assetPath.split('?')[0].split('#')[0];
  if (normalized.startsWith('/')) {
    return path.join(distDir, normalized.slice(1));
  }
  return path.join(distDir, normalized);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalizeScriptContent(content) {
  return content.replace(/<\/script/gi, '<\\/script');
}

async function inlineStyles(html, distDir) {
  const linkRegex =
    /<link\b([^>]*?\brel=(["'])stylesheet\2[^>]*?\bhref=(["'])([^"']+)\3[^>]*)>/gi;

  let nextHtml = html;
  const matches = Array.from(html.matchAll(linkRegex));

  for (const match of matches) {
    const fullTag = match[0];
    const href = match[4];

    if (!href || isExternalUrl(href)) continue;

    const stylePath = resolveLocalAssetPath(distDir, href);
    if (!(await fileExists(stylePath))) continue;

    const css = await fs.readFile(stylePath, 'utf8');
    const styleTag = `<style data-inline-from="${href}">\n${css}\n</style>`;
    nextHtml = nextHtml.replace(fullTag, styleTag);
  }

  return nextHtml;
}

async function inlineScripts(html, distDir) {
  const scriptRegex =
    /<script\b([^>]*?)\bsrc=(["'])([^"']+)\2([^>]*)>\s*<\/script>/gi;

  let nextHtml = html;
  const matches = Array.from(html.matchAll(scriptRegex));

  for (const match of matches) {
    const fullTag = match[0];
    const beforeSrcAttrs = match[1] || '';
    const src = match[3];
    const afterSrcAttrs = match[4] || '';

    if (!src || isExternalUrl(src)) continue;

    const scriptPath = resolveLocalAssetPath(distDir, src);
    if (!(await fileExists(scriptPath))) continue;

    const js = await fs.readFile(scriptPath, 'utf8');
    const attrs = `${beforeSrcAttrs} ${afterSrcAttrs}`.trim();
    const attrSuffix = attrs.length > 0 ? ` ${attrs}` : '';
    const inlineTag = `<script${attrSuffix}>\n${normalizeScriptContent(js)}\n</script>`;
    nextHtml = nextHtml.replace(fullTag, inlineTag);
  }

  return nextHtml;
}

function removeLocalModulePreloads(html) {
  const modulePreloadRegex =
    /<link\b[^>]*\brel=(["'])modulepreload\1[^>]*\bhref=(["'])([^"']+)\2[^>]*>\s*/gi;

  return html.replace(modulePreloadRegex, (full, _relQ, _hrefQ, href) => {
    if (!href || isExternalUrl(href)) return full;
    return '';
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();

  const distDir = path.resolve(cwd, args.dist);
  const inputPath = path.join(distDir, 'index.html');
  const outputPath = path.resolve(cwd, args.out);
  const outputDir = path.dirname(outputPath);

  if (!(await fileExists(inputPath))) {
    console.error(`[build-html] index nao encontrado: ${inputPath}`);
    process.exit(1);
  }

  let html = await fs.readFile(inputPath, 'utf8');
  html = removeLocalModulePreloads(html);
  html = await inlineStyles(html, distDir);
  html = await inlineScripts(html, distDir);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, html, 'utf8');

  console.log(`[build-html] Gerado: ${outputPath}`);
}

main().catch((error) => {
  console.error('[build-html] Falha:', error);
  process.exit(1);
});
