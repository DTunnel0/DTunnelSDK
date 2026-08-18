import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import type { DTunnelSDK as DTunnelSDKInstance, DTunnelSDKOptions } from '../sdk/dtunnel-sdk.js';

const require = createRequire(import.meta.url);
const { DTunnelSDK } = require('../sdk/dtunnel-sdk.js') as {
  DTunnelSDK: new (options?: DTunnelSDKOptions) => DTunnelSDKInstance;
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
  sdk.on('vpnState', (event: { payload: unknown }) => {
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

test('forwards extended category, config import, ads and android device calls', () => {
  const calls: BridgeCall[] = [];
  const windowRef = {
    DtGetCategories: {
      execute: () => {
        pushCall(calls, 'DtGetCategories', 'execute', []);
        return JSON.stringify([{ id: 1, name: 'BR', count: 5 }]);
      },
    },
    DtGetSelectedCategory: {
      execute: () => {
        pushCall(calls, 'DtGetSelectedCategory', 'execute', []);
        return JSON.stringify({ id: 1, name: 'BR' });
      },
    },
    DtGetSelectedCategoryId: {
      execute: () => {
        pushCall(calls, 'DtGetSelectedCategoryId', 'execute', []);
        return 1;
      },
    },
    DtGetConfigsByCategory: {
      execute: (catId: number) => {
        pushCall(calls, 'DtGetConfigsByCategory', 'execute', [catId]);
        return JSON.stringify([{ id: 10, name: 'Config 1' }]);
      },
    },
    DtGetSelectedConfig: {
      execute: () => {
        pushCall(calls, 'DtGetSelectedConfig', 'execute', []);
        return JSON.stringify({ id: 10, name: 'Config 1' });
      },
    },
    DtGetSelectedConfigId: {
      execute: () => {
        pushCall(calls, 'DtGetSelectedConfigId', 'execute', []);
        return 10;
      },
    },
    DtGetConfigCount: {
      execute: () => {
        pushCall(calls, 'DtGetConfigCount', 'execute', []);
        return 5;
      },
    },
    DtGetImportPublicKey: {
      execute: () => {
        pushCall(calls, 'DtGetImportPublicKey', 'execute', []);
        return 'pubkey-abc';
      },
    },
    DtCopyImportPublicKey: {
      execute: () => pushCall(calls, 'DtCopyImportPublicKey', 'execute', []),
    },
    DtImportConfig: {
      execute: (payload: string) => pushCall(calls, 'DtImportConfig', 'execute', [payload]),
    },
    DtHasPendingConfigImport: {
      execute: () => {
        pushCall(calls, 'DtHasPendingConfigImport', 'execute', []);
        return true;
      },
    },
    DtGetPendingConfigImportDetails: {
      execute: () => {
        pushCall(calls, 'DtGetPendingConfigImportDetails', 'execute', []);
        return JSON.stringify({ payload: 'encrypted-data' });
      },
    },
    DtGetUser: {
      execute: () => {
        pushCall(calls, 'DtGetUser', 'execute', []);
        return JSON.stringify({ username: 'user1', password: 'p1', uuid: 'u1' });
      },
    },
    DtIsVpnRunning: {
      execute: () => {
        pushCall(calls, 'DtIsVpnRunning', 'execute', []);
        return true;
      },
    },
    DtShowDialogAdsRewarded: {
      execute: () => pushCall(calls, 'DtShowDialogAdsRewarded', 'execute', []),
    },
    DtIsAdsEnabled: {
      execute: () => {
        pushCall(calls, 'DtIsAdsEnabled', 'execute', []);
        return true;
      },
    },
    DtGetRemainingConnectionTime: {
      execute: () => {
        pushCall(calls, 'DtGetRemainingConnectionTime', 'execute', []);
        return 7200;
      },
    },
    DtGetRemainingConnectionTimerText: {
      execute: () => {
        pushCall(calls, 'DtGetRemainingConnectionTimerText', 'execute', []);
        return '02:00:00';
      },
    },
    DtGetLastVpnError: {
      execute: () => {
        pushCall(calls, 'DtGetLastVpnError', 'execute', []);
        return 'Timeout connecting';
      },
    },
    DtCopyToClipboard: {
      execute: (text: string) => pushCall(calls, 'DtCopyToClipboard', 'execute', [text]),
    },
    DtGetClipboardText: {
      execute: () => {
        pushCall(calls, 'DtGetClipboardText', 'execute', []);
        return 'clip-text';
      },
    },
    DtShowToast: {
      execute: (msg: string) => pushCall(calls, 'DtShowToast', 'execute', [msg]),
    },
    DtVibrate: {
      execute: (d: number) => pushCall(calls, 'DtVibrate', 'execute', [d]),
    },
    DtIsDarkMode: {
      execute: () => {
        pushCall(calls, 'DtIsDarkMode', 'execute', []);
        return true;
      },
    },
    DtGetAppColors: {
      execute: () => {
        pushCall(calls, 'DtGetAppColors', 'execute', []);
        return JSON.stringify({ backgroundColor: '#000000' });
      },
    },
    DtGetDiagnosticReport: {
      execute: () => {
        pushCall(calls, 'DtGetDiagnosticReport', 'execute', []);
        return 'diag-report';
      },
    },
    DtCopyDiagnosticReport: {
      execute: () => pushCall(calls, 'DtCopyDiagnosticReport', 'execute', []),
    },
    DtIsSafeMode: {
      execute: () => {
        pushCall(calls, 'DtIsSafeMode', 'execute', []);
        return false;
      },
    },
  };

  const sdk = new DTunnelSDK({
    window: windowRef,
    strict: true,
    autoRegisterNativeEvents: false,
  });

  const categories = sdk.config.getCategories() as Array<{ id: number; name: string }>;
  const selCat = sdk.config.getSelectedCategory() as { id: number; name: string };
  const selCatId = sdk.config.getSelectedCategoryId();
  const catConfigs = sdk.config.getConfigsByCategory(1);
  const selConfig = sdk.config.getSelectedConfig();
  const selConfigId = sdk.config.getSelectedConfigId();
  const configCount = sdk.config.getConfigCount();
  const importKey = sdk.config.getImportPublicKey();
  sdk.config.copyImportPublicKey();
  sdk.config.importConfig('payload123');
  const hasPending = sdk.config.hasPendingConfigImport();
  const pendingDetails = sdk.config.getPendingConfigImportDetails() as { payload: string };
  const user = sdk.config.getUser() as { username: string };

  const isVpnRunning = sdk.main.isVpnRunning();
  sdk.main.showAdsRewardedDialog();
  const isAdsEnabled = sdk.main.isAdsEnabled();
  const remainingTime = sdk.main.getRemainingConnectionTime();
  const remainingTimerText = sdk.main.getRemainingConnectionTimerText();
  const lastError = sdk.main.getLastVpnError();

  sdk.android.copyToClipboard('hello');
  const clip = sdk.android.getClipboardText();
  sdk.android.showToast('saved');
  sdk.android.vibrate(100);
  const darkMode = sdk.android.isDarkMode();
  const colors = sdk.android.getAppColors() as { backgroundColor: string };
  const diag = sdk.android.getDiagnosticReport();
  sdk.android.copyDiagnosticReport();
  const safeMode = sdk.android.isSafeMode();

  assert.equal(categories[0].name, 'BR');
  assert.equal(selCat.name, 'BR');
  assert.equal(selCatId, 1);
  assert.equal(catConfigs?.length, 1);
  assert.equal(selConfig?.id, 10);
  assert.equal(selConfigId, 10);
  assert.equal(configCount, 5);
  assert.equal(importKey, 'pubkey-abc');
  assert.equal(hasPending, true);
  assert.equal(pendingDetails.payload, 'encrypted-data');
  assert.equal(user.username, 'user1');

  assert.equal(isVpnRunning, true);
  assert.equal(isAdsEnabled, true);
  assert.equal(remainingTime, 7200);
  assert.equal(remainingTimerText, '02:00:00');
  assert.equal(lastError, 'Timeout connecting');

  assert.equal(clip, 'clip-text');
  assert.equal(darkMode, true);
  assert.equal(colors.backgroundColor, '#000000');
  assert.equal(diag, 'diag-report');
  assert.equal(safeMode, false);

  sdk.destroy();
});

