# Referencia da API

Fonte de verdade: `sdk/dtunnel-sdk.d.ts`.

## Construtor

```ts
new DTunnelSDK(options?)
```

`options`:

- `window?: DTunnelBridgeHost`
- `strict?: boolean`
- `logger?: Pick<Console, 'error'>`
- `autoRegisterNativeEvents?: boolean`

## Modulos do SDK

### `sdk.config`

```ts
setConfig(id: number): void;
getConfigs(): DTunnelCategory[] | null;
getDefaultConfig(): DTunnelDefaultConfig | null;
openConfigDialog(): void;
getUsername(): string | null;
setUsername(value: string): void;
getPassword(): string | null;
setPassword(value: string): void;
getLocalConfigVersion(): number | null;
getCdnCount(): number | null;
getUuid(): string | null;
setUuid(value: string): void;
```

### `sdk.main`

```ts
getLogs(): DTunnelLogEntry[] | null;
clearLogs(): void;
startVpn(): void;
stopVpn(): void;
getVpnState(): DTunnelVPNState | null;
startAppUpdate(): void;
startCheckUser(): void;
showLoggerDialog(): void;
getLocalIp(): string | null;
activateAirplaneMode(): void;
deactivateAirplaneMode(): void;
getAirplaneState(): DTunnelAirplaneState | null;
getAssistantState(): DTunnelAssistantState | null;
isCurrentAssistantEnabled(): boolean;
showMenuDialog(): void;
getNetworkName(): string | null;
getPingResult(): string | null;
```

### `sdk.text`

```ts
translate(label: string | null): string | null;
```

### `sdk.app`

```ts
cleanApp(): void;
goToVoiceInputSettings(): void;
getAppConfig<T = unknown>(name: string): DTunnelAppConfigValue<T> | null;
ignoreBatteryOptimizations(): void;
startApnActivity(): void;
startNetworkActivity(): void;
startWebViewActivity(url?: string | null): void;
startRadioInfoActivity(): void;
```

### `sdk.android`

```ts
getDeviceId(): string | null;
sendNotification(title: string, message: string, imageUrl?: string | null): void;
getNetworkData(): DTunnelNetworkData | null;
getStatusBarHeight(): number | null;
getNavigationBarHeight(): number | null;
openExternalUrl(url: string): void;
startHotSpotService(port?: number): void;
stopHotSpotService(): void;
getHotSpotStatus(): DTunnelHotSpotStatus | null;
isHotSpotRunning(): boolean;
getNetworkDownloadBytes(): number | null;
getNetworkUploadBytes(): number | null;
getAppVersion(): string | null;
handleAction(action: DTunnelAction | (string & {})): void;
closeApp(): void;
```

## Metodos utilitarios do SDK

```ts
on(...): () => void;
once(...): () => void;
off(...): void;
removeAllListeners(eventName?: string): void;

onNativeEvent(listener): () => void;
onError(listener): () => void;

getBridgeObject<T = unknown>(objectName: string): T | undefined;
hasBridgeObject(objectName: string): boolean;
getBridgeAvailability(): Record<DTunnelBridgeObjectName, boolean>;
isReady(requiredObjects?: readonly DTunnelBridgeObjectName[]): boolean;

call<T = unknown>(objectName: string, methodName: string, args?: unknown[]): T | null;
callJson<T = unknown>(objectName: string, methodName: string, args?: unknown[]): T | null;
callVoid(objectName: string, methodName: string, args?: unknown[]): void;

registerNativeEventHandlers(): this;
unregisterNativeEventHandlers(): this;
createDebugSnapshot(): DTunnelDebugSnapshot;
destroy(): void;
```

## Tipos principais

- `DTunnelVPNState`: `CONNECTED | DISCONNECTED | CONNECTING | STOPPING | NO_NETWORK | AUTH | AUTH_FAILED`
- `DTunnelAirplaneState`: `ACTIVE | INACTIVE`
- `DTunnelAssistantState`: `ENABLED | DISABLED`
- `DTunnelHotSpotStatus`: `RUNNING | STOPPED`
- `DTunnelAction`: `CDN_UPDATE | CONFIG_UPDATE | CATEGORY_UPDATE | APP_CONFIG_UPDATE | APP_TEXT_UPDATE | APP_START_VPN | APP_RECONNECT_VPN | APP_RESTART_VPN | APP_STOP_VPN | FCM_TOKEN`

## Objetos de bridge nativos (window.Dt...)

### Config

- `DtSetConfig.execute(id)`
- `DtGetConfigs.execute()`
- `DtGetDefaultConfig.execute()`
- `DtExecuteDialogConfig.execute()`
- `DtUsername.get()`, `DtUsername.set(value)`
- `DtPassword.get()`, `DtPassword.set(value)`
- `DtGetLocalConfigVersion.execute()`
- `DtCDNCount.execute()`
- `DtUuid.get()`, `DtUuid.set(value)`

### Main

- `DtGetLogs.execute()`
- `DtClearLogs.execute()`
- `DtExecuteVpnStart.execute()`
- `DtExecuteVpnStop.execute()`
- `DtGetVpnState.execute()`
- `DtStartAppUpdate.execute()`
- `DtStartCheckUser.execute()`
- `DtShowLoggerDialog.execute()`
- `DtGetLocalIP.execute()`
- `DtAirplaneActivate.execute()`
- `DtAirplaneDeactivate.execute()`
- `DtAirplaneState.execute()`
- `DtAppIsCurrentAssistant.execute()`
- `DtShowMenuDialog.execute()`
- `DtGetNetworkName.execute()`
- `DtGetPingResult.execute()`

### Text

- `DtTranslateText.execute(label)`

### App

- `DtCleanApp.execute()`
- `DtGoToVoiceInputSettings.execute()`
- `DtGetAppConfig.execute(name)`
- `DtIgnoreBatteryOptimizations.execute()`
- `DtStartApnActivity.execute()`
- `DtStartNetworkActivity.execute()`
- `DtStartWebViewActivity.execute(url)` ou `execute()`
- `DtStartRadioInfoActivity.execute()`

### Android

- `DtGetDeviceID.execute()`
- `DtSendNotification.execute(title, message, imageUrl)`
- `DtGetNetworkData.execute()`
- `DtGetStatusBarHeight.execute()`
- `DtGetNavigationBarHeight.execute()`
- `DtOpenExternalUrl.execute(url)`
- `DtStartHotSpotService.execute(port)` ou `execute()`
- `DtStopHotSpotService.execute()`
- `DtGetStatusHotSpotService.execute()`
- `DtGetNetworkDownloadBytes.execute()`
- `DtGetNetworkUploadBytes.execute()`
- `DtAppVersion.execute()`
- `DtActionHandler.execute(action)`
- `DtCloseApp.execute()`

## API React (`dtunnel-sdk/react`)

```ts
DTunnelSDKProvider(props: { children?: ReactNode; sdk?: DTunnelSDK; options?: DTunnelSDKOptions }): ReactElement;
useDTunnelSDK(): DTunnelSDK;
useDTunnelEvent(eventName, listener): void;
useDTunnelNativeEvent(listener): void;
useDTunnelError(listener): void;
```

