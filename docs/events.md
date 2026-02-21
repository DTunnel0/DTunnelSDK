# Eventos e Callbacks

## Eventos semanticos (`sdk.on`)

| Evento | Callback nativo | Payload no SDK |
| --- | --- | --- |
| `vpnState` | `DtVpnStateEvent(state)` | `DTunnelVPNState \| null` |
| `vpnStartedSuccess` | `DtVpnStartedSuccessEvent()` | `undefined` |
| `vpnStoppedSuccess` | `DtVpnStoppedSuccessEvent()` | `undefined` |
| `newLog` | `DtNewLogEvent()` | `undefined` |
| `newDefaultConfig` | `DtNewDefaultConfigEvent()` | `undefined` |
| `checkUserStarted` | `DtCheckUserStartedEvent()` | `undefined` |
| `checkUserResult` | `DtCheckUserResultEvent(json)` | `DTunnelCheckUserResult \| string \| null` |
| `checkUserError` | `DtCheckUserErrorEvent(message)` | `string \| null` |
| `messageError` | `DtMessageErrorEvent(json)` | `DTunnelMessage \| string \| null` |
| `showSuccessToast` | `DtSuccessToastEvent(message)` | `string \| null` |
| `showErrorToast` | `DtErrorToastEvent(message)` | `string \| null` |
| `notification` | `DtNotificationEvent(json)` | `DTunnelNotification \| string \| null` |

Observacao:

- `checkUserResult`, `messageError` e `notification` sao parseados como JSON pelo SDK quando possivel.
- Se o parse falhar, o valor permanece `string`.

## Tipos de inscricao

```ts
sdk.on('vpnState', (event) => {});
sdk.on('nativeEvent', (event) => {});
sdk.on('native:DtVpnStateEvent', (event) => {});
sdk.on('error', (event) => {});

sdk.once(...);
sdk.off(...);
```

## Exemplo completo

```ts
import DTunnelSDK from 'dtunnel-sdk';

const sdk = new DTunnelSDK({ strict: false, autoRegisterNativeEvents: true });

const unbindVpn = sdk.on('vpnState', (event) => {
  console.log('vpnState:', event.payload);
});

sdk.on('nativeEvent', (event) => {
  console.log('native:', event.callbackName, event.payload);
});

sdk.on('native:DtNotificationEvent', (event) => {
  console.log('notification payload:', event.payload);
});

sdk.on('error', (event) => {
  console.error(event.error.code, event.error.message, event.error.details);
});

// quando nao precisar mais:
unbindVpn();
```

## Callbacks globais da bridge

Quando `autoRegisterNativeEvents: true` (padrao), o SDK registra automaticamente no `window`:

- `DtVpnStateEvent`
- `DtVpnStartedSuccessEvent`
- `DtVpnStoppedSuccessEvent`
- `DtNewLogEvent`
- `DtNewDefaultConfigEvent`
- `DtCheckUserStartedEvent`
- `DtCheckUserResultEvent`
- `DtCheckUserErrorEvent`
- `DtMessageErrorEvent`
- `DtSuccessToastEvent`
- `DtErrorToastEvent`
- `DtNotificationEvent`

Se precisar controlar manualmente:

```ts
const sdk = new DTunnelSDK({ autoRegisterNativeEvents: false });
sdk.registerNativeEventHandlers();
// ...
sdk.unregisterNativeEventHandlers();
```

