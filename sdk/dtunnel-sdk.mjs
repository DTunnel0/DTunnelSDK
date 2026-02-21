import './dtunnel-sdk.js';

const DTunnelSDK =
  typeof globalThis !== 'undefined' ? globalThis.DTunnelSDK : undefined;

const DTunnelBridgeError =
  typeof globalThis !== 'undefined'
    ? globalThis.DTunnelBridgeError
    : undefined;

export { DTunnelSDK, DTunnelBridgeError };
export default DTunnelSDK;
