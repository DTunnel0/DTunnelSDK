import DTunnelSDK, {
  type DTunnelCallbackToEventMap,
  type DTunnelEventCallbackMap,
  type DTunnelSemanticEventName,
  type DTunnelVPNState,
} from '../../sdk/dtunnel-sdk.js';

type Assert<T extends true> = T;
type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <
  T,
>() => T extends B ? 1 : 2
  ? true
  : false;

type _semanticIncludesNewDefaultConfig = Assert<
  IsEqual<
    Extract<DTunnelSemanticEventName, 'newDefaultConfig'>,
    'newDefaultConfig'
  >
>;

type _eventCallbackMapNewDefaultConfig = Assert<
  IsEqual<
    DTunnelEventCallbackMap['newDefaultConfig'],
    'DtNewDefaultConfigEvent'
  >
>;

type _callbackToEventMapNewDefaultConfig = Assert<
  IsEqual<
    DTunnelCallbackToEventMap['DtNewDefaultConfigEvent'],
    'newDefaultConfig'
  >
>;

const sdk = new DTunnelSDK({
  strict: false,
  autoRegisterNativeEvents: true,
});

sdk.on('newDefaultConfig', (event) => {
  const payload: undefined = event.payload;
  const callbackName: 'DtNewDefaultConfigEvent' = event.callbackName;
  void payload;
  void callbackName;
});

sdk.on('vpnState', (event) => {
  const state: DTunnelVPNState | null = event.payload;
  void state;
});

sdk.on('native:DtNotificationEvent', (event) => {
  const name: 'notification' = event.name;
  const callbackName: 'DtNotificationEvent' = event.callbackName;
  void name;
  void callbackName;
});

const availability = sdk.getBridgeAvailability();
const canReadVpnState: boolean = availability.DtGetVpnState;
void canReadVpnState;

sdk.on('newDefaultConfig', (event) => {
  // @ts-expect-error payload de `newDefaultConfig` e `undefined`.
  const invalidPayload: string = event.payload;
  void invalidPayload;
});

// @ts-expect-error url precisa ser string.
sdk.android.openExternalUrl(123);

// @ts-expect-error message precisa ser string.
sdk.android.sendNotification('title', 999);

// @ts-expect-error chave de bridge inexistente no retorno tipado.
availability.DtUnknownBridgeObject;
