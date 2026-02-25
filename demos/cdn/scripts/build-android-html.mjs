#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const inputPath = path.join(cwd, 'index.html');
const outputPath = path.join(cwd, 'dist', 'build.html');

const html = await fs.readFile(inputPath, 'utf8');
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, html, 'utf8');

console.log(`[build-android] Gerado: ${outputPath}`);
