import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { DTunnelSDK } = require('../sdk/dtunnel-sdk.js') as {
  DTunnelSDK: new (options?: {
    window?: Record<string, unknown>;
    strict?: boolean;
    autoRegisterNativeEvents?: boolean;
  }) => {
    on: (
      eventName: string,
      listener: (event: {
        name: string | null;
        callbackName: string;
        payload: unknown;
      }) => void,
    ) => () => void;
    destroy: () => void;
  };
};

function createSdk(options: Record<string, unknown> = {}) {
  const windowRef: Record<string, unknown> = {};
  const sdk = new DTunnelSDK({
    window: windowRef,
    strict: false,
    autoRegisterNativeEvents: true,
    ...options,
  });

  return { sdk, windowRef };
}

test('maps DtNewDefaultConfigEvent callback to newDefaultConfig semantic event', () => {
  const { sdk, windowRef } = createSdk();
  const envelopes: Array<{
    name: string | null;
    callbackName: string;
    payload: unknown;
  }> = [];

  const unsubscribe = sdk.on('newDefaultConfig', (event) => {
    envelopes.push(event);
  });

  assert.equal(typeof windowRef.DtNewDefaultConfigEvent, 'function');

  (windowRef.DtNewDefaultConfigEvent as () => void)();

  assert.equal(envelopes.length, 1);
  assert.equal(envelopes[0].name, 'newDefaultConfig');
  assert.equal(envelopes[0].callbackName, 'DtNewDefaultConfigEvent');
  assert.equal(envelopes[0].payload, undefined);

  unsubscribe();
  sdk.destroy();
});

test('parses checkUserResult payload as JSON on native event dispatch', () => {
  const { sdk, windowRef } = createSdk();
  const payloads: Array<Record<string, string> | undefined> = [];

  sdk.on('checkUserResult', (event) => {
    payloads.push(event.payload as Record<string, string> | undefined);
  });

  const raw = JSON.stringify({
    username: 'tester',
    count_connections: '1',
    limit_connections: '2',
    expiration_date: '2099-12-31',
    expiration_days: '9999',
  });

  assert.equal(typeof windowRef.DtCheckUserResultEvent, 'function');
  (windowRef.DtCheckUserResultEvent as (value: string) => void)(raw);

  assert.equal(payloads.length, 1);
  assert.equal(payloads[0]?.username, 'tester');
  assert.equal(payloads[0]?.limit_connections, '2');

  sdk.destroy();
});

test('maps legacy camelCase listener functions to semantic events', () => {
  const { sdk, windowRef } = createSdk();
  let vpnStateValue: string | null = null;
  let newConfigCalled = false;

  sdk.on('vpnState', (event) => {
    vpnStateValue = event.payload as string;
  });

  sdk.on('newDefaultConfig', () => {
    newConfigCalled = true;
  });

  assert.equal(typeof windowRef.dtVpnStateListener, 'function');
  assert.equal(typeof windowRef.dtConfigClickListener, 'function');

  (windowRef.dtVpnStateListener as (state: string) => void)('CONNECTED');
  (windowRef.dtConfigClickListener as () => void)();

  assert.equal(vpnStateValue, 'CONNECTED');
  assert.equal(newConfigCalled, true);

  sdk.destroy();
});

test('dispatches newly supported network, device and ping events', () => {
  const { sdk, windowRef } = createSdk();
  let localIpValue: string | null = null;
  let pingValue: string | null = null;
  let airplaneValue: string | null = null;

  sdk.on('localIp', (event) => {
    localIpValue = event.payload as string;
  });

  sdk.on('pingResult', (event) => {
    pingValue = event.payload as string;
  });

  sdk.on('airplaneState', (event) => {
    airplaneValue = event.payload as string;
  });

  (windowRef.DtLocalIpEvent as (ip: string) => void)('192.168.1.50');
  (windowRef.DtPingResultEvent as (ping: string) => void)('25ms');
  (windowRef.DtAirplaneStateEvent as (state: string) => void)('ACTIVE');

  assert.equal(localIpValue, '192.168.1.50');
  assert.equal(pingValue, '25ms');
  assert.equal(airplaneValue, 'ACTIVE');

  sdk.destroy();
});

