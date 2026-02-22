# Chamadas Diretas da Bridge (Sem SDK)

Use este modo apenas quando voce nao puder usar `dtunnel-sdk`.

## Regras

- Objetos nativos ficam no `window` (`window.Dt...`).
- Metodos `execute/get/set` sao sincronos.
- Alguns retornos chegam em JSON string e precisam de parse manual.
- Eventos chegam via callbacks globais `Dt...Event`.

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
dtCall('DtExecuteVpnStart', 'execute');
dtCall('DtExecuteVpnStop', 'execute');

// Config
const configs = dtCallJson('DtGetConfigs', 'execute');
const defaultConfig = dtCallJson('DtGetDefaultConfig', 'execute');
dtCall('DtSetConfig', 'execute', 10);

// App
const appConfig = dtCallJson('DtGetAppConfig', 'execute', 'support_url');

// Android
const networkData = dtCallJson('DtGetNetworkData', 'execute');
const statusBarHeight = dtCall('DtGetStatusBarHeight', 'execute');
const navigationBarHeight = dtCall('DtGetNavigationBarHeight', 'execute');
dtCall('DtOpenExternalUrl', 'execute', 'https://dtunnel.com');
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

## Exemplo HTML minimo

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bridge sem SDK</title>
  </head>
  <body>
    <button id="startVpn">Iniciar VPN</button>
    <button id="stopVpn">Parar VPN</button>
    <pre id="log"></pre>

    <script>
      function dtCall(objectName, methodName, ...args) {
        const target = window[objectName];
        if (!target || typeof target[methodName] !== 'function') return null;
        try {
          return target[methodName](...args);
        } catch {
          return null;
        }
      }

      function append(line) {
        const el = document.getElementById('log');
        el.textContent += line + '\n';
      }

      window.DtVpnStateEvent = function (state) {
        append('vpnState: ' + state);
      };

      document.getElementById('startVpn').addEventListener('click', function () {
        dtCall('DtExecuteVpnStart', 'execute');
      });

      document.getElementById('stopVpn').addEventListener('click', function () {
        dtCall('DtExecuteVpnStop', 'execute');
      });
    </script>
  </body>
</html>
```

