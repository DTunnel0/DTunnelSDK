# DTunnel SDK

SDK JavaScript/TypeScript para consumir a bridge Android (`window.Dt...`) no WebView.

## Instalacao

```bash
npm install dtunnel-sdk
```

## Inicializar projeto pronto

Crie um projeto novo com template e `build:webview` ja configurado:

```bash
npx dtunnel-sdk init
```

Ou direto com flags:

```bash
npx dtunnel-sdk init meu-app --template react-typescript
npx dtunnel-sdk init meu-app --template typescript --no-install
npx dtunnel-sdk init meu-app --template cdn
```

Tambem funciona com `npm exec`:

```bash
npm exec dtunnel-sdk init meu-app --template react-typescript
```

## Uso rapido

```ts
import DTunnelSDK from 'dtunnel-sdk';

const sdk = new DTunnelSDK({
  strict: false,
  autoRegisterNativeEvents: true,
});

sdk.on('vpnState', (event) => {
  console.log('VPN:', event.payload);
});
```

## Simulador rapido (sem Android)

```ts
import DTunnelSDK from 'dtunnel-sdk';
import { installDTunnelSDKSimulator } from 'dtunnel-sdk/simulator';

const simulator = installDTunnelSDKSimulator();
const sdk = new DTunnelSDK({ strict: false, autoRegisterNativeEvents: true });

sdk.on('vpnState', (event) => {
  console.log('VPN:', event.payload);
});
simulator.emit('vpnState', 'CONNECTED');
```

Browser puro (sem bundler):

```html
<script src="https://cdn.jsdelivr.net/npm/dtunnel-sdk@latest/sdk/dtunnel-sdk.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dtunnel-sdk@latest/sdk/dtunnel-sdk.simulator.js"></script>
<script>
  const sdk = new window.DTunnelSDK({ strict: false, autoRegisterNativeEvents: true });
  const simulator = window.DTunnelSDKSimulator.installDTunnelSDKSimulator();

  sdk.on('vpnState', (event) => {
    console.log('VPN:', event.payload);
  });
  simulator.emit('vpnState', 'CONNECTED');
</script>
```

Nota:
- No WebView real, o simulador nao instala por padrao se detectar bridge nativa.

## Documentacao completa

Toda a documentacao foi movida para `docs/`:

- [Indice geral](./docs/README.md)
- [Guia rapido](./docs/getting-started.md)
- [Referencia da API](./docs/api-reference.md)
- [Eventos e callbacks](./docs/events.md)
- [Chamadas diretas sem SDK](./docs/bridge-sem-sdk.md)

## Fluxo oficial (limpo)

Use apenas `init` para gerar projeto pronto:

```bash
npx dtunnel-sdk init meu-app --template react-typescript
cd meu-app
npm run build:webview
```

O resultado final para o WebView sempre sera:
- `webview/index.html`

## Demos prontas

Tambem deixei demos geradas no repositorio:

- `demos/cdn`
- `demos/typescript`
- `demos/react-typescript`

Guia rapido: `demos/README.md`

## Testes

```bash
npm test
npm run test:typecheck
```

## Release e publicacao

```bash
npm run release:sdk -- --version X.Y.Z
npm run publish:npm
```
