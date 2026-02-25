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
    readonly main: {
      getVpnState: () => string | null;
      startVpn: () => void;
    };
    readonly app: {
      getAppConfig: (name: string) => { value: unknown } | null;
    };
    readonly on: (
      eventName: string,
      listener: (event: { payload: unknown }) => void,
    ) => () => void;
    readonly destroy: () => void;
  };
};

const simulatorModule = require('../sdk/dtunnel-sdk.simulator.js') as {
  BRIDGE_OBJECT_NAMES: readonly string[];
  installDTunnelSDKSimulator: (options?: {
    window?: Record<string, unknown>;
    autoEvents?: boolean;
    state?: Record<string, unknown>;
    allowInWebView?: boolean;
  }) => {
    install: () => void;
    uninstall: () => void;
    isInstalled: () => boolean;
    isBlockedByWebView: () => boolean;
    getCalls: () => Array<{
      objectName: string;
      methodName: string;
      args: unknown[];
      result: unknown;
    }>;
    setState: (state: Record<string, unknown>) => void;
    emit: (name: string, payload?: unknown, ...extraArgs: unknown[]) => boolean;
  };
};

test('installs all bridge objects and integrates with SDK calls/events', () => {
  const windowRef: Record<string, unknown> = {};
  const simulator = simulatorModule.installDTunnelSDKSimulator({
    window: windowRef,
    autoEvents: true,
  });

  simulatorModule.BRIDGE_OBJECT_NAMES.forEach((objectName) => {
    assert.equal(typeof windowRef[objectName], 'object');
  });

  const sdk = new DTunnelSDK({
    window: windowRef,
    strict: true,
    autoRegisterNativeEvents: true,
  });

  let lastVpnState: unknown = null;
  sdk.on('vpnState', (event) => {
    lastVpnState = event.payload;
  });

  sdk.main.startVpn();

  assert.equal(sdk.main.getVpnState(), 'CONNECTED');
  assert.equal(lastVpnState, 'CONNECTED');

  const calls = simulator.getCalls();
  assert.equal(
    calls.some(
      (call) =>
        call.objectName === 'DtExecuteVpnStart' && call.methodName === 'execute',
    ),
    true,
  );

  sdk.destroy();
  simulator.uninstall();
});

test('supports state patching and manual semantic event emission', () => {
  const windowRef: Record<string, unknown> = {};
  const simulator = simulatorModule.installDTunnelSDKSimulator({
    window: windowRef,
    autoEvents: false,
  });

  simulator.setState({
    appConfig: { support_url: 'https://sim.local/support' },
    checkUserResult: {
      username: 'qa-user',
      count_connections: '1',
      limit_connections: '3',
      expiration_date: '2099-12-31',
      expiration_days: '9999',
    },
  });

  const sdk = new DTunnelSDK({
    window: windowRef,
    strict: true,
    autoRegisterNativeEvents: true,
  });

  const appConfig = sdk.app.getAppConfig('support_url');
  assert.equal(appConfig?.value, 'https://sim.local/support');

  let userPayload: Record<string, string> | null = null;
  sdk.on('checkUserResult', (event) => {
    userPayload = event.payload as Record<string, string> | null;
  });

  const emitted = simulator.emit('checkUserResult', {
    username: 'qa-user',
    count_connections: '1',
    limit_connections: '3',
    expiration_date: '2099-12-31',
    expiration_days: '9999',
  });

  assert.equal(emitted, true);
  const parsedUserPayload = userPayload as Record<string, string> | null;
  assert.equal(parsedUserPayload?.username, 'qa-user');
  assert.equal(parsedUserPayload?.limit_connections, '3');

  sdk.destroy();
  simulator.uninstall();
});

test('does not install simulator when native WebView bridge is present', () => {
  const nativeBridge = { execute: () => 'CONNECTED' };
  const windowRef: Record<string, unknown> = {
    DtGetVpnState: nativeBridge,
  };

  const simulator = simulatorModule.installDTunnelSDKSimulator({
    window: windowRef,
  });

  assert.equal(simulator.isInstalled(), false);
  assert.equal(simulator.isBlockedByWebView(), true);
  assert.equal(windowRef.DtGetVpnState, nativeBridge);
});
