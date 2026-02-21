# DTunnel SDK

SDK JavaScript/TypeScript para consumir a bridge Android (`window.Dt...`) usada no WebView do DTunnel.

Inclui:
- wrappers dos objetos nativos (`sdk.config`, `sdk.main`, `sdk.text`, `sdk.app`, `sdk.android`)
- eventos nativos com API semantica (`sdk.on('vpnState', ...)`)
- tipagem completa para TypeScript
- helper para React em `dtunnel-sdk/react`

## Instalacao (npm)

```bash
npm install dtunnel-sdk
```

## Uso com TypeScript

```ts
import DTunnelSDK from 'dtunnel-sdk';

const sdk = new DTunnelSDK({
  strict: false,
  autoRegisterNativeEvents: true,
});

sdk.on('vpnState', (event) => {
  console.log(event.payload);
});
```

## Uso com React + TypeScript

```tsx
import { DTunnelSDKProvider, useDTunnelEvent } from 'dtunnel-sdk/react';

function VpnStateLabel() {
  useDTunnelEvent('vpnState', (event) => {
    console.log('VPN:', event.payload);
  });

  return <span>Escutando eventos...</span>;
}

export function App() {
  return (
    <DTunnelSDKProvider options={{ strict: false }}>
      <VpnStateLabel />
    </DTunnelSDKProvider>
  );
}
```

## Uso via script (CDN)

```html
<script src="https://cdn.jsdelivr.net/gh/DTunnel0/DTunnelSDK@main/sdk/dtunnel-sdk.js"></script>
<script>
  const sdk = new DTunnelSDK({ strict: false, autoRegisterNativeEvents: true });
</script>
```

## Eventos semanticos

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

## Estrutura principal

- runtime CJS/global: `sdk/dtunnel-sdk.js`
- runtime ESM: `sdk/dtunnel-sdk.mjs`
- tipos TS: `sdk/dtunnel-sdk.d.ts`
- helpers React: `react/index.js`, `react/index.mjs`, `react/index.d.ts`
- exemplos completos: `examples/`

## Exemplos completos

- CDN (JavaScript puro): `examples/cdn/index.html`
- TypeScript (Vite): `examples/typescript`
- React + TypeScript (Vite): `examples/react-typescript`
- Guia geral: `examples/README.md`

### Regra para WebView

Sempre gere/entregue **um unico `index.html`** com todo CSS/JS embutido para carregar no WebView.

- CDN: `examples/cdn/index.html` ja atende esse formato.
- TypeScript e React + TypeScript: rode `npm run build:webview` no exemplo para gerar `webview/index.html`.
- Atalho na raiz para gerar ambos: `npm run examples:webview`.

Guia rapido:

```bash
# TypeScript
cd examples/typescript
npm install
npm run dev
```

```bash
# React + TypeScript
cd examples/react-typescript
npm install
npm run dev
```

## Publicacao de release

Com o repositorio limpo e commitado:

```bash
npm run release:sdk -- --version 1.1.0
```

## Publicacao no npm

Scripts de release/publicacao sao cross-platform (Linux, macOS e Windows) via Node.js.

```bash
npm login
npm run publish:npm
```

Opcional (tag diferente de `latest`):

```bash
npm run publish:npm -- --tag next
```

Dry-run:

```bash
npm run publish:npm:dry
```
