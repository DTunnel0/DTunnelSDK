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
