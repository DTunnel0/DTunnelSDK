# DTunnel SDK (Runtime)

Arquivos do runtime e tipagem:

- `dtunnel-sdk.js`: build principal (script tag + CommonJS)
- `dtunnel-sdk.mjs`: entrada ESM para bundlers
- `dtunnel-sdk.d.ts`: tipagem TypeScript
- `dtunnel-sdk.simulator.js`: simulador da bridge (`window.Dt...`)
- `dtunnel-sdk.simulator.d.ts`: tipagem TypeScript do simulador
- `dtunnel-sdk.simulator.mjs`: entrada ESM do simulador

## Inicializacao

```ts
import DTunnelSDK from 'dtunnel-sdk';

const sdk = new DTunnelSDK({
  strict: false,
  autoRegisterNativeEvents: true,
});
```

## Simulador da bridge no navegador

### Uso

```ts
import DTunnelSDK from 'dtunnel-sdk';
import { installDTunnelSDKSimulator } from 'dtunnel-sdk/simulator';

const simulator = installDTunnelSDKSimulator();
const sdk = new DTunnelSDK({ strict: false, autoRegisterNativeEvents: true });

sdk.main.startVpn(); // usa simulador
simulator.emit('vpnState', 'CONNECTED'); // dispara callback nativo
```

### Regra de WebView real

Por padrao, `installDTunnelSDKSimulator()` nao instala se detectar bridge nativa no `window` (nao sobrescreve `window.Dt...` no app real).

### Script tag (CDN/browser puro)

```html
<script src="https://cdn.jsdelivr.net/npm/dtunnel-sdk@latest/sdk/dtunnel-sdk.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dtunnel-sdk@latest/sdk/dtunnel-sdk.simulator.js"></script>
```

Depois disso:

```html
<script>
  const sdk = new window.DTunnelSDK({ strict: false, autoRegisterNativeEvents: true });
  const simulator = window.DTunnelSDKSimulator.installDTunnelSDKSimulator();
  simulator.emit('vpnState', 'CONNECTED');
</script>
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
- use `npm run build:android` para gerar `dist/build.html` (arquivo unico).

Publicacao npm (raiz do repo):
- scripts de publicacao/release sao cross-platform (Linux, macOS e Windows).
- `npm login`
- `npm run release:npm`
