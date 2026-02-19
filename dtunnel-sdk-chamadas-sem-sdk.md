# Chamadas Diretas da Bridge (Sem SDK)

## Objetivo

Este guia mostra como consumir a bridge nativa diretamente pelo `window.Dt...`, sem usar `DTunnelSDK`.

## Regras de uso

- os objetos de bridge sao globais no `window`.
- os metodos `execute/get/set` sao sincronos.
- retornos JSON chegam como `string` e devem ser parseados manualmente.
- eventos chegam por callbacks globais `Dt...Event`.

## Helpers recomendados

```js
function dtCall(objectName, methodName, ...args) {
  const target = window[objectName];
  if (!target || typeof target[methodName] !== "function") return null;
  try {
    return target[methodName](...args);
  } catch {
    return null;
  }
}

function dtCallJson(objectName, methodName, ...args) {
  const raw = dtCall(objectName, methodName, ...args);
  if (raw == null || typeof raw !== "string") return raw ?? null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
```

## Chamadas sem SDK

```js
// VPN
const vpnState = dtCall("DtGetVpnState", "execute");
dtCall("DtExecuteVpnStart", "execute");
dtCall("DtExecuteVpnStop", "execute");

// Config
const configs = dtCallJson("DtGetConfigs", "execute");
const defaultConfig = dtCallJson("DtGetDefaultConfig", "execute");
dtCall("DtSetConfig", "execute", 10);

// App config
const appConfig = dtCallJson("DtGetAppConfig", "execute", "my_key");

// Android
const networkData = dtCallJson("DtGetNetworkData", "execute");
dtCall("DtOpenExternalUrl", "execute", "https://example.com");
```

## Eventos oficiais e tipagem

Assinaturas dos callbacks:

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

Exemplo TypeScript:

```ts
declare global {
  interface Window {
    DtVpnStateEvent?: (state: string | null) => void;
    DtNotificationEvent?: (dataJson: string | null) => void;
  }
}

window.DtVpnStateEvent = (state) => {
  console.log("VPN state:", state);
};

window.DtNotificationEvent = (dataJson) => {
  const payload = dataJson ? JSON.parse(dataJson) : null;
  console.log("Notification:", payload);
};
```

## Exemplo HTML completo (sem SDK)

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>DTunnel Bridge (sem SDK)</title>
  </head>
  <body>
    <button id="startVpn">Iniciar VPN</button>
    <button id="stopVpn">Parar VPN</button>
    <pre id="log"></pre>

    <script>
      const log = (value) => {
        document.getElementById("log").textContent += String(value) + "\n";
      };

      function dtCall(objectName, methodName, ...args) {
        const target = window[objectName];
        if (!target || typeof target[methodName] !== "function") return null;
        try {
          return target[methodName](...args);
        } catch {
          return null;
        }
      }

      window.DtVpnStateEvent = (state) => {
        log("vpnState: " + state);
      };

      window.DtNotificationEvent = (dataJson) => {
        log("notification(raw): " + dataJson);
      };

      document.getElementById("startVpn").addEventListener("click", () => {
        dtCall("DtExecuteVpnStart", "execute");
      });

      document.getElementById("stopVpn").addEventListener("click", () => {
        dtCall("DtExecuteVpnStop", "execute");
      });
    </script>
  </body>
</html>
```

## Arquivos relacionados

- `dtunnel-sdk-api-eventos.md`
- `sdk/dtunnel-sdk.d.ts`
