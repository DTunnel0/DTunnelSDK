'use strict';

const React = require('react');
const sdkModule = require('../sdk/dtunnel-sdk.js');

const DTunnelSDK =
  (sdkModule && (sdkModule.DTunnelSDK || sdkModule.default)) ||
  (typeof globalThis !== 'undefined' ? globalThis.DTunnelSDK : undefined);

if (typeof DTunnelSDK !== 'function') {
  throw new Error(
    'DTunnelSDK nao foi encontrado. Importe "dtunnel-sdk" antes de usar "dtunnel-sdk/react".',
  );
}

const DTunnelSDKContext = React.createContext(null);

function DTunnelSDKProvider(props) {
  const sdk = props.sdk || null;
  const options = props.options || {};
  const children = props.children;

  const createdSdkRef = React.useRef(null);

  if (!sdk && !createdSdkRef.current) {
    createdSdkRef.current = new DTunnelSDK(options);
  }

  const value = sdk || createdSdkRef.current;

  React.useEffect(() => {
    if (sdk) return undefined;

    return () => {
      if (
        createdSdkRef.current &&
        typeof createdSdkRef.current.destroy === 'function'
      ) {
        createdSdkRef.current.destroy();
      }
    };
  }, [sdk]);

  return React.createElement(DTunnelSDKContext.Provider, { value }, children);
}

function useDTunnelSDK() {
  const sdk = React.useContext(DTunnelSDKContext);
  if (!sdk) {
    throw new Error('useDTunnelSDK precisa estar dentro de <DTunnelSDKProvider>.');
  }
  return sdk;
}

function useDTunnelEvent(eventName, listener) {
  const sdk = useDTunnelSDK();
  const listenerRef = React.useRef(listener);

  React.useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  React.useEffect(() => {
    const unsubscribe = sdk.on(eventName, (event) => {
      listenerRef.current(event);
    });
    return unsubscribe;
  }, [sdk, eventName]);
}

function useDTunnelNativeEvent(listener) {
  useDTunnelEvent('nativeEvent', listener);
}

function useDTunnelError(listener) {
  useDTunnelEvent('error', listener);
}

module.exports = {
  DTunnelSDKContext,
  DTunnelSDKProvider,
  useDTunnelSDK,
  useDTunnelEvent,
  useDTunnelNativeEvent,
  useDTunnelError,
};
