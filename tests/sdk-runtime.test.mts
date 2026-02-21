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
    config: {
      setConfig: (id: number) => void;
      getUsername: () => string | null;
      setUsername: (value: string) => void;
      openConfigDialog: () => void;
    };
    main: {
      showMenuDialog: () => void;
      showLoggerDialog: () => void;
      getLogs: () => unknown;
    };
    app: {
      getAppConfig: (name: string) => unknown;
    };
    android: {
      getNetworkData: () => unknown;
      sendNotification: (
        title: string,
        message: string,
        imageUrl?: string | null,
      ) => void;
      startHotSpotService: (port?: number) => void;
    };
    getBridgeAvailability: () => Record<string, boolean>;
    isReady: (requiredObjects?: readonly string[]) => boolean;
    on: (
      eventName: string,
      listener: (event: {
        payload: unknown;
        callbackName: string;
      }) => void,
    ) => () => void;
    registerNativeEventHandlers: () => void;
    unregisterNativeEventHandlers: () => void;
    destroy: () => void;
  };
};

type BridgeCall = {
  objectName: string;
  methodName: string;
  args: unknown[];
};

function pushCall(
  calls: BridgeCall[],
  objectName: string,
  methodName: string,
  args: unknown[],
) {
  calls.push({ objectName, methodName, args });
}

test('forwards config/main calls to expected bridge objects and methods', () => {
  const calls: BridgeCall[] = [];
  const windowRef = {
    DtSetConfig: {
      execute: (id: number) => pushCall(calls, 'DtSetConfig', 'execute', [id]),
    },
    DtUsername: {
      get: () => {
        pushCall(calls, 'DtUsername', 'get', []);
        return 'alice';
      },
      set: (value: string) =>
        pushCall(calls, 'DtUsername', 'set', [value]),
    },
    DtExecuteDialogConfig: {
      execute: () => pushCall(calls, 'DtExecuteDialogConfig', 'execute', []),
    },
    DtShowMenuDialog: {
      execute: () => pushCall(calls, 'DtShowMenuDialog', 'execute', []),
    },
    DtShowLoggerDialog: {
      execute: () => pushCall(calls, 'DtShowLoggerDialog', 'execute', []),
    },
  };

  const sdk = new DTunnelSDK({
    window: windowRef,
    strict: true,
    autoRegisterNativeEvents: false,
  });

  sdk.config.setConfig(42);
  const username = sdk.config.getUsername();
  sdk.config.setUsername('bob');
  sdk.config.openConfigDialog();
  sdk.main.showMenuDialog();
  sdk.main.showLoggerDialog();

  assert.equal(username, 'alice');
  assert.deepEqual(calls, [
    { objectName: 'DtSetConfig', methodName: 'execute', args: [42] },
    { objectName: 'DtUsername', methodName: 'get', args: [] },
    { objectName: 'DtUsername', methodName: 'set', args: ['bob'] },
    { objectName: 'DtExecuteDialogConfig', methodName: 'execute', args: [] },
    { objectName: 'DtShowMenuDialog', methodName: 'execute', args: [] },
    { objectName: 'DtShowLoggerDialog', methodName: 'execute', args: [] },
  ]);

  sdk.destroy();
});

test('parses JSON payloads for callJson-based module methods', () => {
  const calls: BridgeCall[] = [];
  const windowRef = {
    DtGetLogs: {
      execute: () => {
        pushCall(calls, 'DtGetLogs', 'execute', []);
        return JSON.stringify([{ level: 'INFO', message: 'ok' }]);
      },
    },
    DtGetAppConfig: {
      execute: (name: string) => {
        pushCall(calls, 'DtGetAppConfig', 'execute', [name]);
        return JSON.stringify({ value: `cfg:${name}` });
      },
    },
    DtGetNetworkData: {
      execute: () => {
        pushCall(calls, 'DtGetNetworkData', 'execute', []);
        return JSON.stringify({
          type_name: 'WIFI',
          extra_info: 'dtunnel',
          type: 'MOBILE',
          reason: null,
          detailed_state: 'CONNECTED',
        });
      },
    },
  };

  const sdk = new DTunnelSDK({
    window: windowRef,
    strict: true,
    autoRegisterNativeEvents: false,
  });

  const logs = sdk.main.getLogs() as Array<{ level: string; message: string }>;
  const appConfig = sdk.app.getAppConfig('support_url') as { value: string };
  const networkData = sdk.android.getNetworkData() as {
    type_name: string;
    detailed_state: string;
  };

  assert.equal(logs[0].message, 'ok');
  assert.equal(appConfig.value, 'cfg:support_url');
  assert.equal(networkData.type_name, 'WIFI');
  assert.equal(networkData.detailed_state, 'CONNECTED');
  assert.deepEqual(calls, [
    { objectName: 'DtGetLogs', methodName: 'execute', args: [] },
    {
      objectName: 'DtGetAppConfig',
      methodName: 'execute',
      args: ['support_url'],
    },
    { objectName: 'DtGetNetworkData', methodName: 'execute', args: [] },
  ]);

  sdk.destroy();
});

test('forwards optional args correctly for sendNotification/startHotSpotService', () => {
  const calls: BridgeCall[] = [];
  const windowRef = {
    DtSendNotification: {
      execute: (title: string, message: string, image: string | null) =>
        pushCall(calls, 'DtSendNotification', 'execute', [title, message, image]),
    },
    DtStartHotSpotService: {
      execute: (...args: unknown[]) =>
        pushCall(calls, 'DtStartHotSpotService', 'execute', args),
    },
  };

  const sdk = new DTunnelSDK({
    window: windowRef,
    strict: true,
    autoRegisterNativeEvents: false,
  });

  sdk.android.sendNotification('Title', 'Message');
  sdk.android.startHotSpotService();
  sdk.android.startHotSpotService(9090);

  assert.deepEqual(calls, [
    {
      objectName: 'DtSendNotification',
      methodName: 'execute',
      args: ['Title', 'Message', null],
    },
    {
      objectName: 'DtStartHotSpotService',
      methodName: 'execute',
      args: [],
    },
    {
      objectName: 'DtStartHotSpotService',
      methodName: 'execute',
      args: [9090],
    },
  ]);

  sdk.destroy();
});

test('registers/unregisters native handlers and computes bridge availability/readiness', () => {
  const windowRef: Record<string, unknown> = {
    DtGetVpnState: { execute: () => 'CONNECTED' },
    DtExecuteVpnStart: { execute: () => undefined },
  };

  const sdk = new DTunnelSDK({
    window: windowRef,
    strict: true,
    autoRegisterNativeEvents: false,
  });

  assert.equal(typeof windowRef.DtVpnStateEvent, 'undefined');

  let receivedState: unknown = null;
  sdk.on('vpnState', (event) => {
    receivedState = event.payload;
  });

  sdk.registerNativeEventHandlers();
  assert.equal(typeof windowRef.DtVpnStateEvent, 'function');
  (windowRef.DtVpnStateEvent as (state: string) => void)('CONNECTED');
  assert.equal(receivedState, 'CONNECTED');

  const availability = sdk.getBridgeAvailability();
  assert.equal(availability.DtGetVpnState, true);
  assert.equal(availability.DtExecuteVpnStart, true);
  assert.equal(availability.DtExecuteVpnStop, false);

  assert.equal(
    sdk.isReady(['DtGetVpnState', 'DtExecuteVpnStart'] as const),
    true,
  );
  assert.equal(
    sdk.isReady(['DtGetVpnState', 'DtExecuteVpnStop'] as const),
    false,
  );

  sdk.unregisterNativeEventHandlers();
  assert.notEqual(typeof windowRef.DtVpnStateEvent, 'function');

  sdk.destroy();
});
