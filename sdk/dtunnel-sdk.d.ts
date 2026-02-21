export type DTunnelSemanticEventName =
  | 'vpnState'
  | 'vpnStartedSuccess'
  | 'vpnStoppedSuccess'
  | 'newLog'
  | 'newDefaultConfig'
  | 'checkUserStarted'
  | 'checkUserResult'
  | 'checkUserError'
  | 'messageError'
  | 'showSuccessToast'
  | 'showErrorToast'
  | 'notification';

export type DTunnelCallbackName =
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

export type DTunnelBridgeObjectName =
  | 'DtSetConfig'
  | 'DtGetConfigs'
  | 'DtGetDefaultConfig'
  | 'DtExecuteDialogConfig'
  | 'DtUsername'
  | 'DtPassword'
  | 'DtGetLocalConfigVersion'
  | 'DtCDNCount'
  | 'DtUuid'
  | 'DtGetLogs'
  | 'DtClearLogs'
  | 'DtExecuteVpnStart'
  | 'DtExecuteVpnStop'
  | 'DtGetVpnState'
  | 'DtStartAppUpdate'
  | 'DtStartCheckUser'
  | 'DtShowLoggerDialog'
  | 'DtGetLocalIP'
  | 'DtAirplaneActivate'
  | 'DtAirplaneDeactivate'
  | 'DtAirplaneState'
  | 'DtAppIsCurrentAssistant'
  | 'DtShowMenuDialog'
  | 'DtGetNetworkName'
  | 'DtGetPingResult'
  | 'DtTranslateText'
  | 'DtCleanApp'
  | 'DtGoToVoiceInputSettings'
  | 'DtGetAppConfig'
  | 'DtIgnoreBatteryOptimizations'
  | 'DtStartApnActivity'
  | 'DtStartNetworkActivity'
  | 'DtStartWebViewActivity'
  | 'DtStartRadioInfoActivity'
  | 'DtGetDeviceID'
  | 'DtSendNotification'
  | 'DtGetNetworkData'
  | 'DtGetStatusBarHeight'
  | 'DtGetNavigationBarHeight'
  | 'DtOpenExternalUrl'
  | 'DtStartHotSpotService'
  | 'DtStopHotSpotService'
  | 'DtGetStatusHotSpotService'
  | 'DtGetNetworkDownloadBytes'
  | 'DtGetNetworkUploadBytes'
  | 'DtAppVersion'
  | 'DtActionHandler'
  | 'DtCloseApp';

export type DTunnelVPNState =
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'STOPPING'
  | 'NO_NETWORK'
  | 'AUTH'
  | 'AUTH_FAILED';

export type DTunnelAirplaneState = 'ACTIVE' | 'INACTIVE';
export type DTunnelAssistantState = 'ENABLED' | 'DISABLED';
export type DTunnelHotSpotStatus = 'RUNNING' | 'STOPPED';

export type DTunnelAction =
  | 'CDN_UPDATE'
  | 'CONFIG_UPDATE'
  | 'CATEGORY_UPDATE'
  | 'APP_CONFIG_UPDATE'
  | 'APP_TEXT_UPDATE'
  | 'APP_START_VPN'
  | 'APP_RECONNECT_VPN'
  | 'APP_RESTART_VPN'
  | 'APP_STOP_VPN'
  | 'FCM_TOKEN';

export interface DTunnelNotification {
  title: string;
  message: string;
  image: string;
}

export interface DTunnelMessage {
  title: string;
  content: string;
}

export interface DTunnelCheckUserResult {
  username: string;
  count_connections: string;
  limit_connections: string;
  expiration_date: string;
  expiration_days: string;
}

export type DTunnelLogEntry = Record<string, string>;

export interface DTunnelConfigListItem {
  id: number;
  name: string;
  description: string | null;
  mode: string;
  sorter: number;
  icon: string | null;
}

export interface DTunnelCategory {
  id: number;
  name: string;
  sorter: number;
  color: string;
  items: DTunnelConfigListItem[];
}

export interface DTunnelDefaultConfig {
  id: number;
  category_id: number;
  name: string;
  description: string;
  mode: string;
  sorter: number;
  icon: string;
}

export interface DTunnelNetworkData {
  type_name: string | null;
  extra_info: string | null;
  type: string | null;
  reason: string | null;
  detailed_state: string | null;
}

export interface DTunnelAppConfigValue<T = unknown> {
  value: T | null;
}

export type DTunnelParsedJson<T> = T | string | null;

export interface DTunnelEventArgsMap {
  vpnState: [state: string | null];
  vpnStartedSuccess: [];
  vpnStoppedSuccess: [];
  newLog: [];
  newDefaultConfig: [];
  checkUserStarted: [];
  checkUserResult: [json: string | null];
  checkUserError: [message: string | null];
  messageError: [json: string | null];
  showSuccessToast: [message: string | null];
  showErrorToast: [message: string | null];
  notification: [json: string | null];
}

export interface DTunnelEventRawPayloadMap {
  vpnState: string | null;
  vpnStartedSuccess: undefined;
  vpnStoppedSuccess: undefined;
  newLog: undefined;
  newDefaultConfig: undefined;
  checkUserStarted: undefined;
  checkUserResult: string | null;
  checkUserError: string | null;
  messageError: string | null;
  showSuccessToast: string | null;
  showErrorToast: string | null;
  notification: string | null;
}

export interface DTunnelEventPayloadMap {
  vpnState: DTunnelVPNState | null;
  vpnStartedSuccess: undefined;
  vpnStoppedSuccess: undefined;
  newLog: undefined;
  newDefaultConfig: undefined;
  checkUserStarted: undefined;
  checkUserResult: DTunnelParsedJson<DTunnelCheckUserResult>;
  checkUserError: string | null;
  messageError: DTunnelParsedJson<DTunnelMessage>;
  showSuccessToast: string | null;
  showErrorToast: string | null;
  notification: DTunnelParsedJson<DTunnelNotification>;
}

export interface DTunnelEventCallbackMap {
  vpnState: 'DtVpnStateEvent';
  vpnStartedSuccess: 'DtVpnStartedSuccessEvent';
  vpnStoppedSuccess: 'DtVpnStoppedSuccessEvent';
  newLog: 'DtNewLogEvent';
  newDefaultConfig: 'DtNewDefaultConfigEvent';
  checkUserStarted: 'DtCheckUserStartedEvent';
  checkUserResult: 'DtCheckUserResultEvent';
  checkUserError: 'DtCheckUserErrorEvent';
  messageError: 'DtMessageErrorEvent';
  showSuccessToast: 'DtSuccessToastEvent';
  showErrorToast: 'DtErrorToastEvent';
  notification: 'DtNotificationEvent';
}

export interface DTunnelCallbackToEventMap {
  DtVpnStateEvent: 'vpnState';
  DtVpnStartedSuccessEvent: 'vpnStartedSuccess';
  DtVpnStoppedSuccessEvent: 'vpnStoppedSuccess';
  DtNewLogEvent: 'newLog';
  DtNewDefaultConfigEvent: 'newDefaultConfig';
  DtCheckUserStartedEvent: 'checkUserStarted';
  DtCheckUserResultEvent: 'checkUserResult';
  DtCheckUserErrorEvent: 'checkUserError';
  DtMessageErrorEvent: 'messageError';
  DtSuccessToastEvent: 'showSuccessToast';
  DtErrorToastEvent: 'showErrorToast';
  DtNotificationEvent: 'notification';
}

export interface DTunnelNativeEventEnvelope<
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

export type DTunnelSemanticEventEnvelope<E extends DTunnelSemanticEventName> =
  DTunnelNativeEventEnvelope<
    DTunnelEventPayloadMap[E],
    DTunnelEventRawPayloadMap[E],
    DTunnelEventCallbackMap[E],
    DTunnelEventArgsMap[E]
  > & {
    name: E;
  };

export type DTunnelAnySemanticEventEnvelope = {
  [K in DTunnelSemanticEventName]: DTunnelSemanticEventEnvelope<K>;
}[DTunnelSemanticEventName];

export type DTunnelNativeEventByCallback<K extends DTunnelCallbackName> =
  DTunnelSemanticEventEnvelope<DTunnelCallbackToEventMap[K]>;

export type DTunnelAnyNativeEventEnvelope =
  | DTunnelAnySemanticEventEnvelope
  | (DTunnelNativeEventEnvelope<unknown, unknown, string, unknown[]> & {
      name: null;
    });

export type DTunnelNativeCallbackArgsMap = {
  [K in DTunnelCallbackName]: DTunnelEventArgsMap[DTunnelCallbackToEventMap[K]];
};

export type DTunnelNativeCallbackHandlerMap = {
  [K in DTunnelCallbackName]: (
    ...args: DTunnelNativeCallbackArgsMap[K]
  ) => void;
};

export interface DTunnelBridgeErrorDetails {
  objectName?: string;
  methodName?: string;
  callbackName?: string;
  args?: unknown[];
  cause?: unknown;
  [key: string]: unknown;
}

export type DTunnelBridgeErrorCode =
  | 'BRIDGE_OBJECT_NOT_FOUND'
  | 'BRIDGE_METHOD_NOT_FOUND'
  | 'BRIDGE_CALL_FAILED';

export declare class DTunnelBridgeError extends Error {
  name: 'DTunnelBridgeError';
  code: DTunnelBridgeErrorCode | string;
  details: DTunnelBridgeErrorDetails;
  constructor(
    code: DTunnelBridgeErrorCode | string,
    message: string,
    details?: DTunnelBridgeErrorDetails,
  );
}

export interface DTunnelErrorEvent {
  name: 'error';
  error: DTunnelBridgeError;
  timestamp: number;
}

export interface DTunnelBridgeHost {
  [key: string]: unknown;
}

export interface DTunnelSDKOptions {
  window?: DTunnelBridgeHost;
  strict?: boolean;
  logger?: Pick<Console, 'error'>;
  autoRegisterNativeEvents?: boolean;
}

export interface DTunnelDebugSnapshot {
  strict: boolean;
  autoRegisterNativeEvents: boolean;
  ready: boolean;
  bridgeAvailability: Record<DTunnelBridgeObjectName, boolean>;
  registeredNativeCallbacks: DTunnelCallbackName[];
  timestamp: number;
}

export declare class DTunnelConfigModule {
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
}

export declare class DTunnelMainModule {
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
}

export declare class DTunnelTextModule {
  translate(label: string | null): string | null;
}

export declare class DTunnelAppModule {
  cleanApp(): void;
  goToVoiceInputSettings(): void;
  getAppConfig<T = unknown>(name: string): DTunnelAppConfigValue<T> | null;
  ignoreBatteryOptimizations(): void;
  startApnActivity(): void;
  startNetworkActivity(): void;
  startWebViewActivity(url?: string | null): void;
  startRadioInfoActivity(): void;
}

export declare class DTunnelAndroidModule {
  getDeviceId(): string | null;
  sendNotification(
    title: string,
    message: string,
    imageUrl?: string | null,
  ): void;
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
}

export declare class DTunnelSDK {
  static VERSION: string;
  static BRIDGE_OBJECTS: readonly DTunnelBridgeObjectName[];
  static EVENT_DEFINITIONS: Record<
    DTunnelSemanticEventName,
    {
      callbacks: readonly DTunnelCallbackName[];
      parseAsJson: boolean;
    }
  >;
  static DTunnelBridgeError: typeof DTunnelBridgeError;

  readonly version: string;
  readonly window: DTunnelBridgeHost;
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
  on<E extends DTunnelCallbackName>(
    eventName: `native:${E}`,
    listener: (event: DTunnelNativeEventByCallback<E>) => void,
  ): () => void;
  on(
    eventName: `native:${string}`,
    listener: (event: DTunnelAnyNativeEventEnvelope) => void,
  ): () => void;
  on(
    eventName: 'error',
    listener: (event: DTunnelErrorEvent) => void,
  ): () => void;
  on(eventName: string, listener: (event: unknown) => void): () => void;

  once<E extends DTunnelSemanticEventName>(
    eventName: E,
    listener: (event: DTunnelSemanticEventEnvelope<E>) => void,
  ): () => void;
  once(
    eventName: 'nativeEvent',
    listener: (event: DTunnelAnySemanticEventEnvelope) => void,
  ): () => void;
  once<E extends DTunnelCallbackName>(
    eventName: `native:${E}`,
    listener: (event: DTunnelNativeEventByCallback<E>) => void,
  ): () => void;
  once(
    eventName: `native:${string}`,
    listener: (event: DTunnelAnyNativeEventEnvelope) => void,
  ): () => void;
  once(
    eventName: 'error',
    listener: (event: DTunnelErrorEvent) => void,
  ): () => void;
  once(eventName: string, listener: (event: unknown) => void): () => void;

  off<E extends DTunnelSemanticEventName>(
    eventName: E,
    listener: (event: DTunnelSemanticEventEnvelope<E>) => void,
  ): void;
  off(
    eventName: 'nativeEvent',
    listener: (event: DTunnelAnySemanticEventEnvelope) => void,
  ): void;
  off<E extends DTunnelCallbackName>(
    eventName: `native:${E}`,
    listener: (event: DTunnelNativeEventByCallback<E>) => void,
  ): void;
  off(
    eventName: `native:${string}`,
    listener: (event: DTunnelAnyNativeEventEnvelope) => void,
  ): void;
  off(eventName: 'error', listener: (event: DTunnelErrorEvent) => void): void;
  off(eventName: string, listener: (event: unknown) => void): void;
  removeAllListeners(eventName?: string): void;

  onNativeEvent(
    listener: (event: DTunnelAnySemanticEventEnvelope) => void,
  ): () => void;
  onError(listener: (event: DTunnelErrorEvent) => void): () => void;

  getBridgeObject<T = unknown>(objectName: string): T | undefined;
  hasBridgeObject(objectName: string): boolean;
  getBridgeAvailability(): Record<DTunnelBridgeObjectName, boolean>;
  isReady(requiredObjects?: readonly DTunnelBridgeObjectName[]): boolean;

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

export type DTunnelSDKConstructor = typeof DTunnelSDK;
export type DTunnelBridgeErrorConstructor = typeof DTunnelBridgeError;

declare global {
  interface Window {
    DTunnelSDK: DTunnelSDKConstructor;
    DTunnelBridgeError: DTunnelBridgeErrorConstructor;
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

  var DTunnelSDK: DTunnelSDKConstructor;
  var DTunnelBridgeError: DTunnelBridgeErrorConstructor;
}

export default DTunnelSDK;
