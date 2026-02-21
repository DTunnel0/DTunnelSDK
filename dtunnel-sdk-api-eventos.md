# Referencia JavaScript do DTunnel SDK

## Objetivo

Este documento descreve o contrato JavaScript disponivel para paginas HTML:
- objetos globais de bridge (`window.Dt...`)
- wrappers do `DTunnelSDK`
- eventos oficiais enviados para o JavaScript
- fluxo de chamadas diretas sem SDK (guia dedicado)

## Inicializacao

```html
<script src="./sdk/dtunnel-sdk.js"></script>
<script>
  const sdk = new DTunnelSDK({
    strict: false,
    autoRegisterNativeEvents: true,
  });
</script>
```

## Convencoes

- metodos `execute/get/set` sao sincronos.
- metodos `void` nao retornam valor util.
- valores JSON chegam como `string` e devem ser parseados.
- callbacks oficiais usam apenas nome `Dt...Event`.

## Objetos globais de bridge

| Objeto | Modulo | Metodos |
| --- | --- | --- |
| `DtSetConfig` | `config` | `execute(id)` |
| `DtGetConfigs` | `config` | `execute()` |
| `DtGetDefaultConfig` | `config` | `execute()` |
| `DtExecuteDialogConfig` | `config` | `execute()` |
| `DtUsername` | `config` | `get()`, `set(value)` |
| `DtPassword` | `config` | `get()`, `set(value)` |
| `DtGetLocalConfigVersion` | `config` | `execute()` |
| `DtCDNCount` | `config` | `execute()` |
| `DtUuid` | `config` | `get()`, `set(value)` |
| `DtGetLogs` | `main` | `execute()` |
| `DtClearLogs` | `main` | `execute()` |
| `DtExecuteVpnStart` | `main` | `execute()` |
| `DtExecuteVpnStop` | `main` | `execute()` |
| `DtGetVpnState` | `main` | `execute()` |
| `DtStartAppUpdate` | `main` | `execute()` |
| `DtStartCheckUser` | `main` | `execute()` |
| `DtShowLoggerDialog` | `main` | `execute()` |
| `DtGetLocalIP` | `main` | `execute()` |
| `DtAirplaneActivate` | `main` | `execute()` |
| `DtAirplaneDeactivate` | `main` | `execute()` |
| `DtAirplaneState` | `main` | `execute()` |
| `DtAppIsCurrentAssistant` | `main` | `execute()` |
| `DtShowMenuDialog` | `main` | `execute()` |
| `DtGetNetworkName` | `main` | `execute()` |
| `DtGetPingResult` | `main` | `execute()` |
| `DtTranslateText` | `text` | `execute(label)` |
| `DtCleanApp` | `app` | `execute()` |
| `DtGoToVoiceInputSettings` | `app` | `execute()` |
| `DtGetAppConfig` | `app` | `execute(name)` |
| `DtIgnoreBatteryOptimizations` | `app` | `execute()` |
| `DtStartApnActivity` | `app` | `execute()` |
| `DtStartNetworkActivity` | `app` | `execute()` |
| `DtStartWebViewActivity` | `app` | `execute(url)`, `execute()` |
| `DtStartRadioInfoActivity` | `app` | `execute()` |
| `DtGetDeviceID` | `android` | `execute()` |
| `DtSendNotification` | `android` | `execute(title, message, imageUrl)` |
| `DtGetNetworkData` | `android` | `execute()` |
| `DtGetStatusBarHeight` | `android` | `execute()` |
| `DtGetNavigationBarHeight` | `android` | `execute()` |
| `DtOpenExternalUrl` | `android` | `execute(url)` |
| `DtStartHotSpotService` | `android` | `execute(port)`, `execute()` |
| `DtStopHotSpotService` | `android` | `execute()` |
| `DtGetStatusHotSpotService` | `android` | `execute()` |
| `DtGetNetworkDownloadBytes` | `android` | `execute()` |
| `DtGetNetworkUploadBytes` | `android` | `execute()` |
| `DtAppVersion` | `android` | `execute()` |
| `DtActionHandler` | `android` | `execute(action)` |
| `DtCloseApp` | `android` | `execute()` |

## Wrappers do DTunnelSDK

Modulos da facade:
- `sdk.config`
- `sdk.main`
- `sdk.text`
- `sdk.app`
- `sdk.android`

Exemplo:

```js
const state = sdk.main.getVpnState();
sdk.main.startVpn();
const configs = sdk.config.getConfigs();
```

## Eventos oficiais (somente atuais)

| Evento semantico (`sdk.on`) | Callback global | Payload |
| --- | --- | --- |
| `vpnState` | `DtVpnStateEvent(state)` | `string | null` |
| `vpnStartedSuccess` | `DtVpnStartedSuccessEvent()` | sem payload |
| `vpnStoppedSuccess` | `DtVpnStoppedSuccessEvent()` | sem payload |
| `newLog` | `DtNewLogEvent()` | sem payload |
| `configClick` | `DtNewDefaultConfigEvent()` | sem payload |
| `checkUserStarted` | `DtCheckUserStartedEvent()` | sem payload |
| `checkUserResult` | `DtCheckUserResultEvent(dataJson)` | `string JSON | null` |
| `checkUserError` | `DtCheckUserErrorEvent(message)` | `string | null` |
| `messageError` | `DtMessageErrorEvent(dataJson)` | `string JSON | null` |
| `showSuccessToast` | `DtSuccessToastEvent(message)` | `string | null` |
| `showErrorToast` | `DtErrorToastEvent(message)` | `string | null` |
| `notification` | `DtNotificationEvent(dataJson)` | `string JSON | null` |

## Contratos JSON comuns

### `DtGetConfigs.execute()`

```json
[
  {
    "id": 1,
    "name": "Categoria",
    "sorter": 10,
    "color": "#123456",
    "items": [
      {
        "id": 100,
        "name": "Config",
        "description": "Descricao",
        "mode": "SSH",
        "sorter": 1,
        "icon": "https://..."
      }
    ]
  }
]
```

### `DtGetAppConfig.execute(name)`

```json
{ "value": "..." }
```

## Exemplo rapido

```js
const sdk = new DTunnelSDK({ strict: false, autoRegisterNativeEvents: true });

sdk.on("vpnState", (event) => {
  console.log("VPN:", event.payload);
});

sdk.main.startVpn();
```

## Arquivos relacionados

- `dtunnel-sdk-chamadas-sem-sdk.md`
- `examples/README.md`
- `examples/cdn/index.html`
- `examples/typescript`
- `examples/react-typescript`
- `sdk/dtunnel-sdk.js`
- `sdk/dtunnel-sdk.d.ts`
