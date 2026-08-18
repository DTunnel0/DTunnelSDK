# Chamadas Diretas da Bridge (Sem SDK)

Use este modo apenas quando você não puder usar `dtunnel-sdk`.

## Regras

- Objetos nativos ficam no `window` (`window.Dt...`).
- Métodos `execute/get/set` são síncronos.
- Alguns retornos chegam em JSON string e precisam de parse manual.
- Eventos chegam via callbacks globais `Dt...Event` (ou aliases legadas `dt...Listener`).

## Helpers recomendados

```js
function dtCall(objectName, methodName, ...args) {
  const target = window[objectName];
  if (!target || typeof target[methodName] !== 'function') return null;
  try {
    return target[methodName](...args);
  } catch {
    return null;
  }
}

function dtCallJson(objectName, methodName, ...args) {
  const raw = dtCall(objectName, methodName, ...args);
  if (raw == null || typeof raw !== 'string') return raw ?? null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
```

## Exemplo de chamadas

```js
// VPN
const vpnState = dtCall('DtGetVpnState', 'execute');
const isRunning = dtCall('DtIsVpnRunning', 'execute');
const remainingSecs = dtCall('DtGetRemainingConnectionTime', 'execute');
const timerText = dtCall('DtGetRemainingConnectionTimerText', 'execute');
dtCall('DtExecuteVpnStart', 'execute');
dtCall('DtExecuteVpnStop', 'execute');
dtCall('DtShowDialogAdsRewarded', 'execute');

// Categorias e Configurações
const categories = dtCallJson('DtGetCategories', 'execute');
const currentCategory = dtCallJson('DtGetSelectedCategory', 'execute');
const configsByCategory = dtCallJson('DtGetConfigsByCategory', 'execute', 1);
const selectedConfig = dtCallJson('DtGetSelectedConfig', 'execute');
dtCall('DtSetConfig', 'execute', 10);

// Importação Offline
const publicKey = dtCall('DtGetImportPublicKey', 'execute');
dtCall('DtImportConfig', 'execute', encryptedPayload);
const hasPending = dtCall('DtHasPendingConfigImport', 'execute');

// Usuário e App
const user = dtCallJson('DtGetUser', 'execute');
const appConfig = dtCallJson('DtGetAppConfig', 'execute', 'support_url');

// Sistema e Dispositivo Android
const colors = dtCallJson('DtGetAppColors', 'execute');
const isDark = dtCall('DtIsDarkMode', 'execute');
dtCall('DtCopyToClipboard', 'execute', 'Texto');
const clipboardText = dtCall('DtGetClipboardText', 'execute');
dtCall('DtShowToast', 'execute', 'Salvo com sucesso!');
dtCall('DtVibrate', 'execute', 50);
const diagReport = dtCall('DtGetDiagnosticReport', 'execute');
```

## Assinaturas dos callbacks globais

- `DtVpnStateEvent(state: string | null): void`
- `DtVpnStartedSuccessEvent(): void`
- `DtVpnStoppedSuccessEvent(): void`
- `DtNewLogEvent(): void`
- `DtNewDefaultConfigEvent(): void`
- `DtCheckUserStartedEvent(): void`
- `DtCheckUserResultEvent(dataJson: string | null): void`
- `DtCheckUserErrorEvent(message: string | null): void`
- `DtMessageErrorEvent(dataJson: string | null): void`
- `DtSuccessToastEvent(message: string | null): void`
- `DtErrorToastEvent(message: string | null): void`
- `DtNotificationEvent(dataJson: string | null): void`
- `DtLocalIpEvent(ip: string | null): void`
- `DtNetworkNameEvent(name: string | null): void`
- `DtPingResultEvent(ping: string | null): void`
- `DtCheckingAppUpdateEvent(isChecking: string | null): void`
- `DtAirplaneStateEvent(state: string | null): void`
- `DtHotSpotStateEvent(status: string | null): void`
- `DtReloadRequestEvent(value: string | null): void`

## Exemplo de eventos sem SDK

```js
window.DtVpnStateEvent = function (state) {
  console.log('vpnState:', state);
};

window.DtNotificationEvent = function (dataJson) {
  const payload = dataJson ? JSON.parse(dataJson) : null;
  console.log('notification:', payload);
};
```
