# DTunnel SDK (Runtime)

Arquivos do runtime e tipagem:

- `dtunnel-sdk.js`: build principal (script tag + CommonJS)
- `dtunnel-sdk.mjs`: entrada ESM para bundlers
- `dtunnel-sdk.d.ts`: tipagem TypeScript

## Inicializacao

```ts
import DTunnelSDK from 'dtunnel-sdk';

const sdk = new DTunnelSDK({
  strict: false,
  autoRegisterNativeEvents: true,
});
```

## Modulos

- `sdk.config`
- `sdk.main`
- `sdk.text`
- `sdk.app`
- `sdk.android`

## Eventos

Use `sdk.on('<evento>', handler)` com:

- `vpnState`
- `vpnStartedSuccess`
- `vpnStoppedSuccess`
- `newLog`
- `newDefaultConfig`
- `checkUserStarted`
- `checkUserResult`
- `checkUserError`
- `messageError`
- `showSuccessToast`
- `showErrorToast`
- `notification`

## Erros

- `strict: true`: lanca excecao (`DTunnelBridgeError`)
- `strict: false`: retorna `null` e publica evento `error`

## Exemplos completos

- CDN: `examples/cdn/index.html`
- TypeScript: `examples/typescript`
- React + TypeScript: `examples/react-typescript`
- Guia geral: `examples/README.md`

Regra para WebView:
- entregue sempre um unico `index.html` com CSS/JS embutido.
- nos exemplos TypeScript/React, use `npm run build:webview` para gerar `webview/index.html`.
- atalho na raiz: `npm run examples:webview`.

Publicacao npm (raiz do repo):
- scripts de publicacao/release sao cross-platform (Linux, macOS e Windows).
- `npm login`
- `npm run publish:npm`
