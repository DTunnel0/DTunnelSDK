# Exemplo React + TypeScript

Projeto completo usando:
- `dtunnel-sdk`
- `dtunnel-sdk/react`
- React 18
- Vite

## Rodar

```bash
cd examples/react-typescript
npm install
npm run dev
```

## Gerar index unico para WebView

```bash
npm run build:webview
```

Saida:
- `examples/react-typescript/webview/index.html`

## Arquivos principais

- `src/main.tsx`: inicializacao com `DTunnelSDKProvider`
- `src/App.tsx`: hooks `useDTunnelSDK`, `useDTunnelEvent`, `useDTunnelError`
- `src/style.css`: estilo da interface

## Notas

- A dependencia `dtunnel-sdk` usa npm (`^1.1.0`).
- O exemplo usa `strict: false` para nao quebrar sem bridge Android.
- Em ambiente sem bridge, comandos retornam `null` e os eventos nativos nao disparam.
- Para publicacao no app WebView, use sempre o arquivo unico `webview/index.html`.
