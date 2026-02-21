# Exemplos Completos

Este diretorio contem 3 exemplos prontos de uso do `dtunnel-sdk`.
Todos os exemplos daqui usam o SDK (sem fallback para chamadas diretas da bridge).

## Regra de entrega para WebView

Para integracao final no app, o artefato esperado deve ser **um unico arquivo `index.html`** com todo CSS/JS embutido.

- CDN: ja e um unico `index.html` por natureza (`examples/cdn/index.html`).
- TypeScript e React + TypeScript: use o comando `build:webview` para gerar `webview/index.html`.
- Atalho da raiz do repositorio: `npm run examples:webview`.

## 1) JavaScript via CDN

Path: `examples/cdn/index.html`

Como usar:
1. Abra o arquivo no WebView do app (ou no navegador para testes de UI).
2. Garanta que a bridge nativa (`window.Dt...`) esteja disponivel para testar chamadas reais.

## 2) TypeScript (Vanilla)

Path: `examples/typescript`

Como rodar:
1. `cd examples/typescript`
2. `npm install`
3. `npm run dev`
4. `npm run build:webview` (gera `webview/index.html`)

## 3) React + TypeScript

Path: `examples/react-typescript`

Como rodar:
1. `cd examples/react-typescript`
2. `npm install`
3. `npm run dev`
4. `npm run build:webview` (gera `webview/index.html`)

Observacao:
- Os exemplos `typescript` e `react-typescript` usam `dtunnel-sdk` via npm (`^1.1.0`).
- Sem bridge Android ativa, as chamadas de bridge retornam `null` em modo `strict: false`.
