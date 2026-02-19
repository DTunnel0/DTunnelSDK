type DTunnelSemanticEventName =
  | 'vpnState'
  | 'vpnStartedSuccess'
  | 'vpnStoppedSuccess'
  | 'newLog'
  | 'configClick'
  | 'checkUserStarted'
  | 'checkUserResult'
  | 'checkUserError'
  | 'messageError'
  | 'showSuccessToast'
  | 'showErrorToast'
  | 'notification';

type DTunnelCallbackName =
  | 'DtVpnStateEvent'
  | 'DtVpnStartedSuccessEvent'
  | 'DtVpnStoppedSuccessEvent'
  | 'DtNewLogEvent'
  | 'DtNewDefaultConfigEvent'
  | 'DtCheckUserStartedEvent'
  | 'DtCheckUserResultEvent'
  | 'DtCheckUserErrorEvent'
  | 'DtMessageErrorEvent'
  | 'DtSuccessToastEvent'
  | 'DtErrorToastEvent'
  | 'DtNotificationEvent';

interface DTunnelEventRawPayloadMap {
  vpnState: string | null;
  vpnStartedSuccess: undefined;
  vpnStoppedSuccess: undefined;
  newLog: undefined;
  configClick: undefined;
  checkUserStarted: undefined;
  checkUserResult: string | null;
  checkUserError: string | null;
  messageError: string | null;
  showSuccessToast: string | null;
  showErrorToast: string | null;
  notification: string | null;
}

interface DTunnelEventArgsMap {
  vpnState: [state: string | null];
  vpnStartedSuccess: [];
  vpnStoppedSuccess: [];
  newLog: [];
  configClick: [];
  checkUserStarted: [];
  checkUserResult: [dataJson: string | null];
  checkUserError: [message: string | null];
  messageError: [dataJson: string | null];
  showSuccessToast: [message: string | null];
  showErrorToast: [message: string | null];
  notification: [dataJson: string | null];
}

interface DTunnelEventPayloadMap {
  vpnState: string | null;
  vpnStartedSuccess: void;
  vpnStoppedSuccess: void;
  newLog: void;
  configClick: void;
  checkUserStarted: void;
  checkUserResult: unknown | null;
  checkUserError: string | null;
  messageError: unknown | null;
  showSuccessToast: string | null;
  showErrorToast: string | null;
  notification: unknown | null;
}

interface DTunnelEventCallbackMap {
  vpnState: 'DtVpnStateEvent';
  vpnStartedSuccess: 'DtVpnStartedSuccessEvent';
  vpnStoppedSuccess: 'DtVpnStoppedSuccessEvent';
  newLog: 'DtNewLogEvent';
  configClick: 'DtNewDefaultConfigEvent';
  checkUserStarted: 'DtCheckUserStartedEvent';
  checkUserResult: 'DtCheckUserResultEvent';
  checkUserError: 'DtCheckUserErrorEvent';
  messageError: 'DtMessageErrorEvent';
  showSuccessToast: 'DtSuccessToastEvent';
  showErrorToast: 'DtErrorToastEvent';
  notification: 'DtNotificationEvent';
}

interface DTunnelNativeEventEnvelope<
  TPayload = unknown,
  TRawPayload = unknown,
  TCallbackName extends string = string,
  TArgs extends unknown[] = unknown[],
> {
  name: DTunnelSemanticEventName | null;
  callbackName: TCallbackName;
  payload: TPayload;
  rawPayload: TRawPayload;
  args: TArgs;
  timestamp: number;
}

type DTunnelNativeCallbackArgsMap = {
  DtVpnStateEvent: DTunnelEventArgsMap['vpnState'];
  DtVpnStartedSuccessEvent: DTunnelEventArgsMap['vpnStartedSuccess'];
  DtVpnStoppedSuccessEvent: DTunnelEventArgsMap['vpnStoppedSuccess'];
  DtNewLogEvent: DTunnelEventArgsMap['newLog'];
  DtNewDefaultConfigEvent: DTunnelEventArgsMap['configClick'];
  DtCheckUserStartedEvent: DTunnelEventArgsMap['checkUserStarted'];
  DtCheckUserResultEvent: DTunnelEventArgsMap['checkUserResult'];
  DtCheckUserErrorEvent: DTunnelEventArgsMap['checkUserError'];
  DtMessageErrorEvent: DTunnelEventArgsMap['messageError'];
  DtSuccessToastEvent: DTunnelEventArgsMap['showSuccessToast'];
  DtErrorToastEvent: DTunnelEventArgsMap['showErrorToast'];
  DtNotificationEvent: DTunnelEventArgsMap['notification'];
};

type DTunnelNativeCallbackHandlerMap = {
  [K in DTunnelCallbackName]: (...args: DTunnelNativeCallbackArgsMap[K]) => void;
};

interface DTunnelBridgeErrorDetails {
  objectName?: string;
  methodName?: string;
  callbackName?: string;
  args?: unknown[];
  cause?: unknown;
  [key: string]: unknown;
}

declare class DTunnelBridgeError extends Error {
  name: 'DTunnelBridgeError';
  code: string;
  details: DTunnelBridgeErrorDetails;
  constructor(
    code: string,
    message: string,
    details?: DTunnelBridgeErrorDetails,
  );
}

interface DTunnelErrorEvent {
  name: 'error';
  error: DTunnelBridgeError;
  timestamp: number;
}

interface DTunnelSDKOptions {
  window?: Window;
  strict?: boolean;
  logger?: Pick<Console, 'error'>;
  autoRegisterNativeEvents?: boolean;
}

interface DTunnelDebugSnapshot {
  strict: boolean;
  autoRegisterNativeEvents: boolean;
  ready: boolean;
  bridgeAvailability: Record<string, boolean>;
  registeredNativeCallbacks: string[];
  timestamp: number;
}

declare class DTunnelConfigModule {
  setConfig(id: number): void;
  getConfigsRaw(): string | null;
  getConfigs<T = unknown>(): T | null;
  getDefaultConfigRaw(): string | null;
  getDefaultConfig<T = unknown>(): T | null;
  openConfigDialog(): void;
  getUsername(): string | null;
  setUsername(value: string): void;
  getPassword(): string | null;
  setPassword(value: string): void;
  getLocalConfigVersion(): number | null;
  getCdnCount(): number | null;
  getUuid(): string | null;
  setUuid(value: string): void;
}

declare class DTunnelMainModule {
  getLogsRaw(): string | null;
  getLogs<T = unknown>(): T | null;
  clearLogs(): void;
  startVpn(): void;
  stopVpn(): void;
  getVpnState(): string | null;
  startAppUpdate(): void;
  startCheckUser(): void;
  showLoggerDialog(): void;
  getLocalIp(): string | null;
  activateAirplaneMode(): void;
  deactivateAirplaneMode(): void;
  getAirplaneState(): 'ACTIVE' | 'INACTIVE' | null;
  getAssistantState(): 'ENABLED' | 'DISABLED' | null;
  isCurrentAssistantEnabled(): boolean;
  showMenuDialog(): void;
  getNetworkName(): string | null;
  getPingResult(): string | null;
}

declare class DTunnelTextModule {
  translate(label: string | null): string | null;
}

declare class DTunnelAppModule {
  cleanApp(): void;
  goToVoiceInputSettings(): void;
  getAppConfigRaw(name: string): string | null;
  getAppConfig<T = unknown>(name: string): T | null;
  ignoreBatteryOptimizations(): void;
  startApnActivity(): void;
  startNetworkActivity(): void;
  startWebViewActivity(url?: string | null): void;
  startRadioInfoActivity(): void;
}

declare class DTunnelAndroidModule {
  getDeviceId(): string | null;
  sendNotification(
    title: string,
    message: string,
    imageUrl?: string | null,
  ): void;
  getNetworkDataRaw(): string | null;
  getNetworkData<T = unknown>(): T | null;
  getStatusBarHeight(): number | null;
  getNavigationBarHeight(): number | null;
  openExternalUrl(url: string): void;
  startHotSpotService(port?: number): void;
  stopHotSpotService(): void;
  getHotSpotStatus(): 'RUNNING' | 'STOPPED' | null;
  isHotSpotRunning(): boolean;
  getNetworkDownloadBytes(): number | null;
  getNetworkUploadBytes(): number | null;
  getAppVersion(): string | null;
  handleAction(action: string): void;
  closeApp(): void;
}

type DTunnelEventListener<TPayload = unknown> = (
  event: DTunnelNativeEventEnvelope<TPayload>,
) => void;

type DTunnelSemanticEventEnvelope<E extends DTunnelSemanticEventName> =
  DTunnelNativeEventEnvelope<
    DTunnelEventPayloadMap[E],
    DTunnelEventRawPayloadMap[E],
    DTunnelEventCallbackMap[E],
    DTunnelEventArgsMap[E]
  > & {
    name: E;
  };

type DTunnelAnySemanticEventEnvelope = {
  [K in DTunnelSemanticEventName]: DTunnelSemanticEventEnvelope<K>;
}[DTunnelSemanticEventName];

declare class DTunnelSDK {
  static VERSION: string;
  static BRIDGE_OBJECTS: readonly string[];
  static EVENT_DEFINITIONS: Record<
    DTunnelSemanticEventName,
    { callbacks: string[]; parseAsJson: boolean }
  >;
  static DTunnelBridgeError: typeof DTunnelBridgeError;

  readonly version: string;
  readonly window: Window;
  readonly strict: boolean;
  readonly autoRegisterNativeEvents: boolean;

  readonly config: DTunnelConfigModule;
  readonly main: DTunnelMainModule;
  readonly text: DTunnelTextModule;
  readonly app: DTunnelAppModule;
  readonly android: DTunnelAndroidModule;

  constructor(options?: DTunnelSDKOptions);

  on<E extends DTunnelSemanticEventName>(
    eventName: E,
    listener: (event: DTunnelSemanticEventEnvelope<E>) => void,
  ): () => void;
  on(
    eventName: 'nativeEvent',
    listener: (event: DTunnelAnySemanticEventEnvelope) => void,
  ): () => void;
  on(
    eventName: `native:${string}`,
    listener: (event: DTunnelAnySemanticEventEnvelope) => void,
  ): () => void;
  on(eventName: 'error', listener: (event: DTunnelErrorEvent) => void): () => void;
  on(eventName: string, listener: (event: unknown) => void): () => void;

  once<E extends DTunnelSemanticEventName>(
    eventName: E,
    listener: (event: DTunnelSemanticEventEnvelope<E>) => void,
  ): () => void;
  once(
    eventName: 'nativeEvent',
    listener: (event: DTunnelAnySemanticEventEnvelope) => void,
  ): () => void;
  once(
    eventName: `native:${string}`,
    listener: (event: DTunnelAnySemanticEventEnvelope) => void,
  ): () => void;
  once(eventName: 'error', listener: (event: DTunnelErrorEvent) => void): () => void;
  once(eventName: string, listener: (event: unknown) => void): () => void;

  off<E extends DTunnelSemanticEventName>(
    eventName: E,
    listener: (event: DTunnelSemanticEventEnvelope<E>) => void,
  ): void;
  off(
    eventName: 'nativeEvent',
    listener: (event: DTunnelAnySemanticEventEnvelope) => void,
  ): void;
  off(
    eventName: `native:${string}`,
    listener: (event: DTunnelAnySemanticEventEnvelope) => void,
  ): void;
  off(eventName: 'error', listener: (event: DTunnelErrorEvent) => void): void;
  off(eventName: string, listener: (event: unknown) => void): void;
  removeAllListeners(eventName?: string): void;

  onNativeEvent(listener: (event: DTunnelAnySemanticEventEnvelope) => void): () => void;
  onError(listener: (event: DTunnelErrorEvent) => void): () => void;

  getBridgeObject<T = unknown>(objectName: string): T | undefined;
  hasBridgeObject(objectName: string): boolean;
  getBridgeAvailability(): Record<string, boolean>;
  isReady(requiredObjects?: string[]): boolean;

  call<T = unknown>(
    objectName: string,
    methodName: string,
    args?: unknown[],
  ): T | null;
  callJson<T = unknown>(
    objectName: string,
    methodName: string,
    args?: unknown[],
  ): T | null;
  callVoid(objectName: string, methodName: string, args?: unknown[]): void;

  registerNativeEventHandlers(): this;
  unregisterNativeEventHandlers(): this;

  createDebugSnapshot(): DTunnelDebugSnapshot;
  destroy(): void;
}

declare global {
  interface Window {
    DTunnelSDK: typeof DTunnelSDK;
    DTunnelBridgeError: typeof DTunnelBridgeError;
    DtVpnStateEvent?: DTunnelNativeCallbackHandlerMap['DtVpnStateEvent'];
    DtVpnStartedSuccessEvent?: DTunnelNativeCallbackHandlerMap['DtVpnStartedSuccessEvent'];
    DtVpnStoppedSuccessEvent?: DTunnelNativeCallbackHandlerMap['DtVpnStoppedSuccessEvent'];
    DtNewLogEvent?: DTunnelNativeCallbackHandlerMap['DtNewLogEvent'];
    DtNewDefaultConfigEvent?: DTunnelNativeCallbackHandlerMap['DtNewDefaultConfigEvent'];
    DtCheckUserStartedEvent?: DTunnelNativeCallbackHandlerMap['DtCheckUserStartedEvent'];
    DtCheckUserResultEvent?: DTunnelNativeCallbackHandlerMap['DtCheckUserResultEvent'];
    DtCheckUserErrorEvent?: DTunnelNativeCallbackHandlerMap['DtCheckUserErrorEvent'];
    DtMessageErrorEvent?: DTunnelNativeCallbackHandlerMap['DtMessageErrorEvent'];
    DtSuccessToastEvent?: DTunnelNativeCallbackHandlerMap['DtSuccessToastEvent'];
    DtErrorToastEvent?: DTunnelNativeCallbackHandlerMap['DtErrorToastEvent'];
    DtNotificationEvent?: DTunnelNativeCallbackHandlerMap['DtNotificationEvent'];
  }
}
