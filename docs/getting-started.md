# Guia Rapido

## Instalacao

```bash
npm install dtunnel-sdk
```

## Bootstrap de projeto (CLI)

Crie um projeto novo com template e script de build para Android pronto:

```bash
npx dtunnel-sdk init
```

Templates suportados:

- `react-typescript`
- `typescript`
- `cdn`

Exemplos:

```bash
npx dtunnel-sdk init meu-app --template react-typescript
npx dtunnel-sdk init meu-app --template typescript --no-install
npx dtunnel-sdk init meu-app --template cdn
```

## Uso com TypeScript

```ts
import DTunnelSDK from 'dtunnel-sdk';

const sdk = new DTunnelSDK({
  strict: false,
  autoRegisterNativeEvents: true,
});

sdk.on('vpnState', (event) => {
  console.log('VPN:', event.payload);
});

sdk.main.startVpn();
```

## Uso com React + TypeScript

```tsx
import { DTunnelSDKProvider, useDTunnelEvent } from 'dtunnel-sdk/react';

function VpnStateListener() {
  useDTunnelEvent('vpnState', (event) => {
    console.log('VPN:', event.payload);
  });
  return null;
}

export function App() {
  return (
    <DTunnelSDKProvider options={{ strict: false }}>
      <VpnStateListener />
    </DTunnelSDKProvider>
  );
}
```

## Uso via CDN (JavaScript)

```html
<script src="https://cdn.jsdelivr.net/npm/dtunnel-sdk@latest/sdk/dtunnel-sdk.js"></script>
<script>
  const sdk = new DTunnelSDK({
    strict: false,
    autoRegisterNativeEvents: true,
  });

  sdk.on('vpnState', function (event) {
    console.log('VPN:', event.payload);
  });
</script>
```

## Build para Android em arquivo unico

Para publicar no Android, o artefato final e um unico `dist/build.html`.

- Todo projeto criado pelo CLI inclui `npm run build:android`.

Fluxo recomendado:

```bash
npx dtunnel-sdk init meu-app --template react-typescript
cd meu-app
npm run build:android
```

## Comportamento de erro (`strict`)

- `strict: false` (padrao recomendado para WebView): erros de bridge retornam `null` e disparam evento `error`.
- `strict: true`: a chamada lanca `DTunnelBridgeError`.

## Proximos passos

- API completa: [api-reference.md](./api-reference.md)
- Eventos: [events.md](./events.md)
- Sem SDK: [bridge-sem-sdk.md](./bridge-sem-sdk.md)
