# DTunnel SDK Demos

Demos prontas geradas pelo CLI oficial (`dtunnel-sdk init`):

- `demos/cdn`
- `demos/typescript`
- `demos/react-typescript`

Cada demo ja vem com `build:webview` para gerar um unico arquivo final:

- `webview/index.html`

## Como usar

CDN:

```bash
cd demos/cdn
npm install
npm run build:webview
```

TypeScript:

```bash
cd demos/typescript
npm install
npm run dev
npm run build:webview
```

React + TypeScript:

```bash
cd demos/react-typescript
npm install
npm run dev
npm run build:webview
```
