import type {
  DTunnelAction,
  DTunnelAirplaneState,
  DTunnelAssistantState,
  DTunnelBridgeHost,
  DTunnelBridgeObjectName,
  DTunnelCallbackName,
  DTunnelCategory,
  DTunnelCheckUserResult,
  DTunnelDefaultConfig,
  DTunnelHotSpotStatus,
  DTunnelMessage,
  DTunnelNetworkData,
  DTunnelNotification,
  DTunnelSemanticEventName,
  DTunnelVPNState,
} from './dtunnel-sdk.js';

export interface DTunnelSDKSimulatorState {
  username: string;
  password: string;
  uuid: string;
  localConfigVersion: number;
  cdnCount: number;
  configs: DTunnelCategory[];
  defaultConfig: DTunnelDefaultConfig;
  selectedConfigId: number;
  logs: Array<Record<string, string>>;
  vpnState: DTunnelVPNState;
  airplaneState: DTunnelAirplaneState;
  assistantState: DTunnelAssistantState;
  localIp: string | null;
  networkName: string | null;
  pingResult: string | null;
  checkUserResult: DTunnelCheckUserResult | null;
  checkUserError: string | null;
  messageError: DTunnelMessage | null;
  notification: DTunnelNotification | null;
  translations: Record<string, string>;
  translationPrefix: string;
  appConfig: Record<string, unknown>;
  deviceId: string;
  networkData: DTunnelNetworkData;
  statusBarHeight: number;
  navigationBarHeight: number;
  hotSpotStatus: DTunnelHotSpotStatus;
  hotSpotPort: number | null;
  networkDownloadBytes: number;
  networkUploadBytes: number;
  appVersion: string;
  lastExternalUrl: string | null;
  lastAction: DTunnelAction | (string & {}) | null;
  lastWebViewUrl: string | null;
  notifications: DTunnelNotification[];
  closed: boolean;
}

export type DTunnelSDKSimulatorStatePatch = {
  [K in keyof DTunnelSDKSimulatorState]?: DTunnelSDKSimulatorState[K] extends
    | Array<unknown>
    | string
    | number
    | boolean
    | null
    | undefined
    ? DTunnelSDKSimulatorState[K]
    : DTunnelSDKSimulatorState[K] extends Record<string, unknown>
      ? Partial<DTunnelSDKSimulatorState[K]>
      : DTunnelSDKSimulatorState[K];
};

export interface DTunnelSDKSimulatorCallRecord {
  objectName: string;
  methodName: string;
  args: unknown[];
  result: unknown;
  timestamp: number;
}

export type DTunnelSDKSimulatorImplementation = ((...args: unknown[]) => unknown) | unknown;

export interface DTunnelSDKSimulatorOptions {
  window?: DTunnelBridgeHost;
  state?: DTunnelSDKSimulatorStatePatch;
  autoEvents?: boolean;
  allowInWebView?: boolean;
}

export interface DTunnelSDKSimulatorController {
  readonly window: DTunnelBridgeHost;
  readonly bridgeObjectNames: readonly DTunnelBridgeObjectName[];
  readonly callbackNames: readonly DTunnelCallbackName[];
  readonly semanticEventToCallback: Readonly<
    Record<DTunnelSemanticEventName, DTunnelCallbackName>
  >;
  readonly autoEvents: boolean;
  readonly allowInWebView: boolean;

  install(): this;
  uninstall(): this;
  isInstalled(): boolean;
  isBlockedByWebView(): boolean;

  getState(): DTunnelSDKSimulatorState;
  setState(nextState: DTunnelSDKSimulatorStatePatch): this;
  resetState(nextState?: DTunnelSDKSimulatorStatePatch): this;

  getCalls(): DTunnelSDKSimulatorCallRecord[];
  clearCalls(): this;

  setImplementation(
    objectName: DTunnelBridgeObjectName | (string & {}),
    methodName: string,
    implementation: DTunnelSDKSimulatorImplementation,
  ): this;
  removeImplementation(
    objectName: DTunnelBridgeObjectName | (string & {}),
    methodName: string,
  ): this;
  clearImplementations(): this;

  emit(
    name: DTunnelSemanticEventName,
    payload?: unknown,
  ): boolean;
  emit(
    name: DTunnelCallbackName,
    payload?: unknown,
    ...extraArgs: unknown[]
  ): boolean;

  getBridgeObject(objectName: DTunnelBridgeObjectName | (string & {})): unknown;
}

export interface DTunnelSDKSimulatorAPI {
  readonly BRIDGE_OBJECT_NAMES: readonly DTunnelBridgeObjectName[];
  readonly NATIVE_CALLBACK_NAMES: readonly DTunnelCallbackName[];
  readonly SEMANTIC_EVENT_TO_CALLBACK: Readonly<
    Record<DTunnelSemanticEventName, DTunnelCallbackName>
  >;
  createDTunnelSDKSimulator(options?: DTunnelSDKSimulatorOptions): DTunnelSDKSimulatorController;
  installDTunnelSDKSimulator(options?: DTunnelSDKSimulatorOptions): DTunnelSDKSimulatorController;
}

export const BRIDGE_OBJECT_NAMES: readonly DTunnelBridgeObjectName[];
export const NATIVE_CALLBACK_NAMES: readonly DTunnelCallbackName[];
export const SEMANTIC_EVENT_TO_CALLBACK: Readonly<
  Record<DTunnelSemanticEventName, DTunnelCallbackName>
>;

export function createDTunnelSDKSimulator(
  options?: DTunnelSDKSimulatorOptions,
): DTunnelSDKSimulatorController;

export function installDTunnelSDKSimulator(
  options?: DTunnelSDKSimulatorOptions,
): DTunnelSDKSimulatorController;

declare const DTunnelSDKSimulator: DTunnelSDKSimulatorAPI;

declare global {
  interface Window {
    DTunnelSDKSimulator: DTunnelSDKSimulatorAPI;
    DTunnelSDKSimulatorController?: DTunnelSDKSimulatorController;
  }

  var DTunnelSDKSimulator: DTunnelSDKSimulatorAPI;
  var DTunnelSDKSimulatorController: DTunnelSDKSimulatorController | undefined;
}

export default DTunnelSDKSimulator;
