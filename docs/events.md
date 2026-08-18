# Eventos e Callbacks

## Eventos semanticos (`sdk.on`)

| Evento | Callback nativo / Alias legada | Payload no SDK |
| --- | --- | --- |
| `vpnState` | `DtVpnStateEvent(state)` / `dtVpnStateListener(state)` | `DTunnelVPNState \| null` |
| `vpnStartedSuccess` | `DtVpnStartedSuccessEvent()` / `dtVpnStartedSuccessListener()` | `undefined` |
| `vpnStoppedSuccess` | `DtVpnStoppedSuccessEvent()` / `dtVpnStoppedSuccessListener()` | `undefined` |
| `newLog` | `DtNewLogEvent()` / `dtOnNewLogListener()` | `undefined` |
| `newDefaultConfig` | `DtNewDefaultConfigEvent()` / `dtConfigClickListener()` | `undefined` |
| `checkUserStarted` | `DtCheckUserStartedEvent()` / `dtCheckUserStartedListener()` | `undefined` |
| `checkUserResult` | `DtCheckUserResultEvent(json)` / `dtCheckUserModelListener(json)` | `DTunnelCheckUserResult \| string \| null` |
| `checkUserError` | `DtCheckUserErrorEvent(message)` / `dtCheckUserErrorListener(message)` | `string \| null` |
| `messageError` | `DtMessageErrorEvent(json)` / `dtMessageErrorListener(json)` | `DTunnelMessage \| string \| null` |
| `showSuccessToast` | `DtSuccessToastEvent(message)` / `dtShowSuccessToastListener(message)` | `string \| null` |
| `showErrorToast` | `DtErrorToastEvent(message)` / `dtShowErrorToastListener(message)` | `string \| null` |
| `notification` | `DtNotificationEvent(json)` | `DTunnelNotification \| string \| null` |
| `localIp` | `DtLocalIpEvent(ip)` / `dtLocalIpListener(ip)` | `string \| null` |
| `networkName` | `DtNetworkNameEvent(name)` / `dtNetworkNameListener(name)` | `string \| null` |
| `pingResult` | `DtPingResultEvent(ping)` / `dtPingResultListener(ping)` | `string \| null` |
| `checkingAppUpdate` | `DtCheckingAppUpdateEvent(isChecking)` / `dtCheckingAppUpdateListener(isChecking)` | `boolean \| string \| null` |
| `airplaneState` | `DtAirplaneStateEvent(state)` / `dtAirplaneStateListener(state)` | `DTunnelAirplaneState \| string \| null` |
| `hotSpotState` | `DtHotSpotStateEvent(status)` / `dtHotSpotStateListener(status)` | `DTunnelHotSpotStatus \| string \| null` |
| `reloadRequest` | `DtReloadRequestEvent(value)` / `dtReloadRequestListener(value)` | `string \| null` |

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

Quando `autoRegisterNativeEvents: true` (padrao), o SDK registra automaticamente no `window` tanto os nomes padronizados (`Dt...Event`) quanto as aliases legadas (`dt...Listener`):

- `DtVpnStateEvent` / `dtVpnStateListener`
- `DtVpnStartedSuccessEvent` / `dtVpnStartedSuccessListener`
- `DtVpnStoppedSuccessEvent` / `dtVpnStoppedSuccessListener`
- `DtNewLogEvent` / `dtOnNewLogListener`
- `DtNewDefaultConfigEvent` / `dtConfigClickListener`
- `DtCheckUserStartedEvent` / `dtCheckUserStartedListener`
- `DtCheckUserResultEvent` / `dtCheckUserModelListener`
- `DtCheckUserErrorEvent` / `dtCheckUserErrorListener`
- `DtMessageErrorEvent` / `dtMessageErrorListener`
- `DtSuccessToastEvent` / `dtShowSuccessToastListener`
- `DtErrorToastEvent` / `dtShowErrorToastListener`
- `DtNotificationEvent`
- `DtLocalIpEvent` / `dtLocalIpListener`
- `DtNetworkNameEvent` / `dtNetworkNameListener`
- `DtPingResultEvent` / `dtPingResultListener`
- `DtCheckingAppUpdateEvent` / `dtCheckingAppUpdateListener`
- `DtAirplaneStateEvent` / `dtAirplaneStateListener`
- `DtHotSpotStateEvent` / `dtHotSpotStateListener`
- `DtReloadRequestEvent` / `dtReloadRequestListener`

Se precisar controlar manualmente:

```ts
const sdk = new DTunnelSDK({ autoRegisterNativeEvents: false });
sdk.registerNativeEventHandlers();
// ...
sdk.unregisterNativeEventHandlers();
```
