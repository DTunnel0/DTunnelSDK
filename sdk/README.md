# DTunnel SDK

SDK JavaScript para encapsular toda a bridge do WebView:
- wrappers de todas as APIs JavaScript de bridge (`window.Dt...`)
- sistema de eventos nativos (`Dt...Event`)
- parse seguro de payload JSON
- controle de erro (`strict` ou fallback)

Nome publico atual:
- `DTunnelSDK`

Arquivos:
- runtime: `sdk/dtunnel-sdk.js`
- tipagem: `sdk/dtunnel-sdk.d.ts`
- chamadas diretas sem SDK: `dtunnel-sdk-chamadas-sem-sdk.md`

## Arquitetura

O runtime foi organizado em camadas para manter separacao de responsabilidades:
- `core`: `EventBus`, `DTunnelBridgeError`, utilitarios de parse/validacao
- `gateway`: `BridgeGateway` (invocacao dos objetos nativos e tratamento de erro)
- `events`: `NativeEventsAdapter` (registro/desregistro de callbacks Android -> JS)
- `modules`: `ConfigModule`, `MainModule`, `TextModule`, `AppModule`, `AndroidModule`
- `facade`: `DTunnelSDK` (API publica unica consumida pelo HTML)

## Inicio rapido

```html
<script src="../sdk/dtunnel-sdk.js"></script>
<script>
  const sdk = new DTunnelSDK({
    strict: false,
    autoRegisterNativeEvents: true,
  });

  const state = sdk.main.getVpnState();
  console.log("VPN state:", state);

  sdk.main.startVpn();
</script>
```

## Exemplo completo

Use:
- `examples/dtunnel-sdk-example.html`

## API principal

Modulos:
- `sdk.config`
- `sdk.main`
- `sdk.text`
- `sdk.app`
- `sdk.android`

Eventos:
- `sdk.on("<evento>", handler)`
- `sdk.onNativeEvent(handler)`
- `sdk.onError(handler)`

Exemplo:

```js
const stop = sdk.on("vpnState", (event) => {
  console.log(event.payload);
});

// depois
stop();
```

## Semantica de eventos

Eventos semanticos suportados:
- `vpnState`
- `vpnStartedSuccess`
- `vpnStoppedSuccess`
- `newLog`
- `configClick`
- `checkUserStarted`
- `checkUserResult`
- `checkUserError`
- `messageError`
- `showSuccessToast`
- `showErrorToast`
- `notification`

Cada handler recebe:

```ts
{
  name: string | null;
  callbackName: string;
  payload: unknown;
  rawPayload: unknown;
  args: unknown[];
  timestamp: number;
}
```

## Modo strict

`strict: true`:
- erros de objeto/metodo inexistente e falha de execucao lancam excecao.

`strict: false` (padrao):
- retorna `null` na chamada falha
- publica evento `error`
- escreve log em `console.error`

## Boas praticas

- Crie uma unica instancia global do SDK por pagina.
- Registre listeners antes de acionar comandos criticos.
- Use metodos `get...Raw()` quando quiser payload sem parse automatico.
- Use `sdk.destroy()` em teardown da pagina para remover listeners.
