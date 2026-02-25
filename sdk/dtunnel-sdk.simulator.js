/* eslint-disable no-console */
(function initDTunnelSDKSimulator(globalScope) {
  'use strict';

  const hasOwn = Object.prototype.hasOwnProperty;

  const BRIDGE_OBJECT_NAMES = Object.freeze([
    'DtSetConfig',
    'DtGetConfigs',
    'DtGetDefaultConfig',
    'DtExecuteDialogConfig',
    'DtUsername',
    'DtPassword',
    'DtGetLocalConfigVersion',
    'DtCDNCount',
    'DtUuid',
    'DtGetLogs',
    'DtClearLogs',
    'DtExecuteVpnStart',
    'DtExecuteVpnStop',
    'DtGetVpnState',
    'DtStartAppUpdate',
    'DtStartCheckUser',
    'DtShowLoggerDialog',
    'DtGetLocalIP',
    'DtAirplaneActivate',
    'DtAirplaneDeactivate',
    'DtAirplaneState',
    'DtAppIsCurrentAssistant',
    'DtShowMenuDialog',
    'DtGetNetworkName',
    'DtGetPingResult',
    'DtTranslateText',
    'DtCleanApp',
    'DtGoToVoiceInputSettings',
    'DtGetAppConfig',
    'DtIgnoreBatteryOptimizations',
    'DtStartApnActivity',
    'DtStartNetworkActivity',
    'DtStartWebViewActivity',
    'DtStartRadioInfoActivity',
    'DtGetDeviceID',
    'DtSendNotification',
    'DtGetNetworkData',
    'DtGetStatusBarHeight',
    'DtGetNavigationBarHeight',
    'DtOpenExternalUrl',
    'DtStartHotSpotService',
    'DtStopHotSpotService',
    'DtGetStatusHotSpotService',
    'DtGetNetworkDownloadBytes',
    'DtGetNetworkUploadBytes',
    'DtAppVersion',
    'DtActionHandler',
    'DtCloseApp',
  ]);

  const NATIVE_CALLBACK_NAMES = Object.freeze([
    'DtVpnStateEvent',
    'DtVpnStartedSuccessEvent',
    'DtVpnStoppedSuccessEvent',
    'DtNewLogEvent',
    'DtNewDefaultConfigEvent',
    'DtCheckUserStartedEvent',
    'DtCheckUserResultEvent',
    'DtCheckUserErrorEvent',
    'DtMessageErrorEvent',
    'DtSuccessToastEvent',
    'DtErrorToastEvent',
    'DtNotificationEvent',
  ]);

  const SEMANTIC_EVENT_TO_CALLBACK = Object.freeze({
    vpnState: 'DtVpnStateEvent',
    vpnStartedSuccess: 'DtVpnStartedSuccessEvent',
    vpnStoppedSuccess: 'DtVpnStoppedSuccessEvent',
    newLog: 'DtNewLogEvent',
    newDefaultConfig: 'DtNewDefaultConfigEvent',
    checkUserStarted: 'DtCheckUserStartedEvent',
    checkUserResult: 'DtCheckUserResultEvent',
    checkUserError: 'DtCheckUserErrorEvent',
    messageError: 'DtMessageErrorEvent',
    showSuccessToast: 'DtSuccessToastEvent',
    showErrorToast: 'DtErrorToastEvent',
    notification: 'DtNotificationEvent',
  });

  const JSON_EVENT_NAMES = Object.freeze([
    'checkUserResult',
    'messageError',
    'notification',
  ]);

  function isPlainObject(value) {
    return (
      value !== null &&
      typeof value === 'object' &&
      Object.prototype.toString.call(value) === '[object Object]'
    );
  }

  function cloneValue(value) {
    if (Array.isArray(value)) {
      return value.map((item) => cloneValue(item));
    }

    if (isPlainObject(value)) {
      const output = {};
      Object.keys(value).forEach((key) => {
        output[key] = cloneValue(value[key]);
      });
      return output;
    }

    return value;
  }

  function mergeDeep(baseValue, patchValue) {
    const base = cloneValue(baseValue);
    if (!isPlainObject(patchValue)) {
      return base;
    }

    Object.keys(patchValue).forEach((key) => {
      const patchEntry = patchValue[key];
      const baseEntry = base[key];

      if (isPlainObject(baseEntry) && isPlainObject(patchEntry)) {
        base[key] = mergeDeep(baseEntry, patchEntry);
        return;
      }

      base[key] = cloneValue(patchEntry);
    });

    return base;
  }

  function toJsonStringOrNull(value) {
    if (value === null || value === undefined) return null;

    try {
      const json = JSON.stringify(value);
      return json === undefined ? null : json;
    } catch (_error) {
      return JSON.stringify({ value: String(value) });
    }
  }

  function toInteger(value, fallback) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.round(value);
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return Math.round(parsed);
    }

    return fallback;
  }

  function findSelectedConfig(configs, selectedConfigId) {
    if (!Array.isArray(configs)) return null;

    for (let categoryIndex = 0; categoryIndex < configs.length; categoryIndex += 1) {
      const category = configs[categoryIndex];
      const items = Array.isArray(category && category.items) ? category.items : [];

      for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
        const item = items[itemIndex];
        if (item && item.id === selectedConfigId) {
          return {
            category,
            item,
          };
        }
      }
    }

    return null;
  }

  function createDefaultState() {
    const defaultItem = {
      id: 101,
      name: 'DTunnel BR',
      description: 'Servidor simulado local',
      mode: 'SSH_DIRECT',
      sorter: 1,
      icon: null,
    };

    return {
      username: 'dtunnel-user',
      password: 'dtunnel-pass',
      uuid: '550e8400-e29b-41d4-a716-446655440000',
      localConfigVersion: 1,
      cdnCount: 2,
      configs: [
        {
          id: 10,
          name: 'Brasil',
          sorter: 1,
          color: '#532e7d',
          items: [defaultItem],
        },
      ],
      defaultConfig: {
        id: defaultItem.id,
        category_id: 10,
        name: defaultItem.name,
        description: defaultItem.description || '',
        mode: defaultItem.mode,
        sorter: defaultItem.sorter,
        icon: defaultItem.icon || '',
      },
      selectedConfigId: defaultItem.id,
      logs: [],
      vpnState: 'DISCONNECTED',
      airplaneState: 'INACTIVE',
      assistantState: 'ENABLED',
      localIp: '192.168.0.2',
      networkName: 'dtunnel-Wifi',
      pingResult: '42ms',
      checkUserResult: {
        username: 'dtunnel-user',
        count_connections: '1',
        limit_connections: '2',
        expiration_date: '2099-12-31',
        expiration_days: '9999',
      },
      checkUserError: 'Falha simulada de usuario',
      messageError: {
        title: 'Erro simulado',
        content: 'Mensagem de erro simulada',
      },
      notification: {
        title: 'DTunnel Simulador',
        message: 'Notificacao simulada',
        image: '',
      },
      translations: {
        LBL_VPN_CONNECTED: 'VPN conectada (simulado)',
        LBL_VPN_DISCONNECTED: 'VPN desconectada (simulado)',
      },
      translationPrefix: '[sim] ',
      appConfig: {
        support_url: 'https://example.com/support',
      },
      deviceId: 'dtunnel-device-id',
      networkData: {
        type_name: 'WIFI',
        extra_info: 'dtunnel-network',
        type: 'MOBILE',
        reason: null,
        detailed_state: 'CONNECTED',
      },
      statusBarHeight: 24,
      navigationBarHeight: 0,
      hotSpotStatus: 'STOPPED',
      hotSpotPort: null,
      networkDownloadBytes: 0,
      networkUploadBytes: 0,
      appVersion: 'dtunnel-1.0.0',
      lastExternalUrl: null,
      lastAction: null,
      lastWebViewUrl: null,
      notifications: [],
      closed: false,
    };
  }

  function createDTunnelSDKSimulator(options) {
    const config = options || {};
    const windowRef = config.window || globalScope;
    const autoEvents = config.autoEvents !== false;
    const allowInWebView = config.allowInWebView === true;

    let state = mergeDeep(createDefaultState(), config.state || {});
    let installed = false;
    let blockedByWebView = false;

    const calls = [];
    const implementations = new Map();
    const previousByObject = new Map();
    const bridgeObjects = {};

    let controller = null;

    function ensureLogsArray() {
      if (!Array.isArray(state.logs)) {
        state.logs = [];
      }
      return state.logs;
    }

    function appendLog(level, message) {
      ensureLogsArray().push({
        level: String(level),
        message: String(message),
        timestamp: new Date().toISOString(),
      });
    }

    function trackCall(objectName, methodName, args, result) {
      calls.push({
        objectName,
        methodName,
        args: cloneValue(args),
        result: cloneValue(result),
        timestamp: Date.now(),
      });
    }

    function runCall(objectName, methodName, args, fallbackImplementation) {
      const overrideKey = `${objectName}.${methodName}`;
      let result;

      if (implementations.has(overrideKey)) {
        const descriptor = implementations.get(overrideKey);
        if (descriptor.kind === 'function') {
          result = descriptor.value.apply(controller, args);
        } else {
          result = cloneValue(descriptor.value);
        }
      } else {
        result = fallbackImplementation();
      }

      trackCall(objectName, methodName, args, result);
      return result;
    }

    function createExecuteBridgeObject(objectName, implementation) {
      return {
        execute: function execute() {
          const args = Array.from(arguments);
          return runCall(objectName, 'execute', args, () =>
            implementation.apply(controller, args),
          );
        },
      };
    }

    function createGetSetBridgeObject(objectName, getter, setter) {
      return {
        get: function get() {
          return runCall(objectName, 'get', [], () => getter.call(controller));
        },
        set: function set(value) {
          return runCall(objectName, 'set', [value], () =>
            setter.call(controller, value),
          );
        },
      };
    }

    function emitCallback(callbackName) {
      const args = Array.prototype.slice.call(arguments, 1);
      const callback = windowRef[callbackName];
      if (typeof callback !== 'function') return false;
      callback.apply(windowRef, args);
      return true;
    }

    function emitEvent(eventName, payload) {
      const callbackName = SEMANTIC_EVENT_TO_CALLBACK[eventName];
      if (!callbackName) return false;

      if (JSON_EVENT_NAMES.indexOf(eventName) >= 0) {
        return emitCallback(callbackName, toJsonStringOrNull(payload));
      }

      if (payload === undefined) {
        return emitCallback(callbackName);
      }

      return emitCallback(callbackName, payload);
    }

    function emit(name) {
      const args = Array.prototype.slice.call(arguments, 1);
      if (hasOwn.call(SEMANTIC_EVENT_TO_CALLBACK, name)) {
        return emitEvent(name, args[0]);
      }
      return emitCallback.apply(null, [name].concat(args));
    }

    function resolveSelectedConfig(selectedConfigId) {
      const selected = findSelectedConfig(state.configs, selectedConfigId);
      if (!selected) return;

      const selectedCategoryId = toInteger(
        selected.category && selected.category.id,
        state.defaultConfig.category_id,
      );

      state.defaultConfig = {
        id: selected.item.id,
        category_id: selectedCategoryId,
        name: selected.item.name,
        description: selected.item.description || '',
        mode: selected.item.mode,
        sorter: selected.item.sorter,
        icon: selected.item.icon || '',
      };
      state.selectedConfigId = selected.item.id;
    }

    bridgeObjects.DtSetConfig = createExecuteBridgeObject('DtSetConfig', (id) => {
      const nextId = toInteger(id, state.selectedConfigId);
      resolveSelectedConfig(nextId);
      appendLog('INFO', `Config selecionada: ${nextId}`);

      if (autoEvents) {
        emit('newDefaultConfig');
      }
    });

    bridgeObjects.DtGetConfigs = createExecuteBridgeObject(
      'DtGetConfigs',
      () => toJsonStringOrNull(state.configs),
    );

    bridgeObjects.DtGetDefaultConfig = createExecuteBridgeObject(
      'DtGetDefaultConfig',
      () => toJsonStringOrNull(state.defaultConfig),
    );

    bridgeObjects.DtExecuteDialogConfig = createExecuteBridgeObject(
      'DtExecuteDialogConfig',
      () => {
        appendLog('INFO', 'Dialogo de config aberto');
      },
    );

    bridgeObjects.DtUsername = createGetSetBridgeObject(
      'DtUsername',
      () => state.username,
      (value) => {
        state.username = value == null ? '' : String(value);
      },
    );

    bridgeObjects.DtPassword = createGetSetBridgeObject(
      'DtPassword',
      () => state.password,
      (value) => {
        state.password = value == null ? '' : String(value);
      },
    );

    bridgeObjects.DtGetLocalConfigVersion = createExecuteBridgeObject(
      'DtGetLocalConfigVersion',
      () => toInteger(state.localConfigVersion, 0),
    );

    bridgeObjects.DtCDNCount = createExecuteBridgeObject(
      'DtCDNCount',
      () => toInteger(state.cdnCount, 0),
    );

    bridgeObjects.DtUuid = createGetSetBridgeObject(
      'DtUuid',
      () => state.uuid,
      (value) => {
        state.uuid = value == null ? '' : String(value);
      },
    );

    bridgeObjects.DtGetLogs = createExecuteBridgeObject(
      'DtGetLogs',
      () => toJsonStringOrNull(ensureLogsArray()),
    );

    bridgeObjects.DtClearLogs = createExecuteBridgeObject('DtClearLogs', () => {
      state.logs = [];
    });

    bridgeObjects.DtExecuteVpnStart = createExecuteBridgeObject(
      'DtExecuteVpnStart',
      () => {
        state.vpnState = 'CONNECTED';
        appendLog('INFO', 'VPN iniciada (simulado)');

        if (autoEvents) {
          emit('vpnStartedSuccess');
          emit('vpnState', state.vpnState);
        }
      },
    );

    bridgeObjects.DtExecuteVpnStop = createExecuteBridgeObject(
      'DtExecuteVpnStop',
      () => {
        state.vpnState = 'DISCONNECTED';
        appendLog('INFO', 'VPN parada (simulado)');

        if (autoEvents) {
          emit('vpnStoppedSuccess');
          emit('vpnState', state.vpnState);
        }
      },
    );

    bridgeObjects.DtGetVpnState = createExecuteBridgeObject(
      'DtGetVpnState',
      () => state.vpnState,
    );

    bridgeObjects.DtStartAppUpdate = createExecuteBridgeObject(
      'DtStartAppUpdate',
      () => {
        appendLog('INFO', 'Atualizacao de app iniciada (simulado)');
      },
    );

    bridgeObjects.DtStartCheckUser = createExecuteBridgeObject(
      'DtStartCheckUser',
      () => {
        appendLog('INFO', 'Check user iniciado (simulado)');

        if (autoEvents) {
          emit('checkUserStarted');
          if (state.checkUserResult) {
            emit('checkUserResult', state.checkUserResult);
          }
        }
      },
    );

    bridgeObjects.DtShowLoggerDialog = createExecuteBridgeObject(
      'DtShowLoggerDialog',
      () => {
        appendLog('INFO', 'Logger dialog aberto (simulado)');
      },
    );

    bridgeObjects.DtGetLocalIP = createExecuteBridgeObject(
      'DtGetLocalIP',
      () => state.localIp,
    );

    bridgeObjects.DtAirplaneActivate = createExecuteBridgeObject(
      'DtAirplaneActivate',
      () => {
        state.airplaneState = 'ACTIVE';
      },
    );

    bridgeObjects.DtAirplaneDeactivate = createExecuteBridgeObject(
      'DtAirplaneDeactivate',
      () => {
        state.airplaneState = 'INACTIVE';
      },
    );

    bridgeObjects.DtAirplaneState = createExecuteBridgeObject(
      'DtAirplaneState',
      () => state.airplaneState,
    );

    bridgeObjects.DtAppIsCurrentAssistant = createExecuteBridgeObject(
      'DtAppIsCurrentAssistant',
      () => state.assistantState,
    );

    bridgeObjects.DtShowMenuDialog = createExecuteBridgeObject(
      'DtShowMenuDialog',
      () => {
        appendLog('INFO', 'Menu dialog aberto (simulado)');
      },
    );

    bridgeObjects.DtGetNetworkName = createExecuteBridgeObject(
      'DtGetNetworkName',
      () => state.networkName,
    );

    bridgeObjects.DtGetPingResult = createExecuteBridgeObject(
      'DtGetPingResult',
      () => state.pingResult,
    );

    bridgeObjects.DtTranslateText = createExecuteBridgeObject(
      'DtTranslateText',
      (label) => {
        if (label === null || label === undefined) return null;
        const key = String(label);
        if (state.translations && hasOwn.call(state.translations, key)) {
          return state.translations[key];
        }
        return `${state.translationPrefix || ''}${key}`;
      },
    );

    bridgeObjects.DtCleanApp = createExecuteBridgeObject('DtCleanApp', () => {
      state.logs = [];
      appendLog('INFO', 'App limpo (simulado)');
    });

    bridgeObjects.DtGoToVoiceInputSettings = createExecuteBridgeObject(
      'DtGoToVoiceInputSettings',
      () => {
        appendLog('INFO', 'Voice input settings aberto (simulado)');
      },
    );

    bridgeObjects.DtGetAppConfig = createExecuteBridgeObject(
      'DtGetAppConfig',
      (name) => {
        const key = String(name || '');
        const value =
          state.appConfig && hasOwn.call(state.appConfig, key)
            ? state.appConfig[key]
            : null;
        return toJsonStringOrNull({ value });
      },
    );

    bridgeObjects.DtIgnoreBatteryOptimizations = createExecuteBridgeObject(
      'DtIgnoreBatteryOptimizations',
      () => {
        appendLog('INFO', 'Ignore battery optimizations (simulado)');
      },
    );

    bridgeObjects.DtStartApnActivity = createExecuteBridgeObject(
      'DtStartApnActivity',
      () => {
        appendLog('INFO', 'APN activity iniciada (simulado)');
      },
    );

    bridgeObjects.DtStartNetworkActivity = createExecuteBridgeObject(
      'DtStartNetworkActivity',
      () => {
        appendLog('INFO', 'Network activity iniciada (simulado)');
      },
    );

    bridgeObjects.DtStartWebViewActivity = createExecuteBridgeObject(
      'DtStartWebViewActivity',
      (url) => {
        state.lastWebViewUrl =
          url === null || url === undefined ? null : String(url);
      },
    );

    bridgeObjects.DtStartRadioInfoActivity = createExecuteBridgeObject(
      'DtStartRadioInfoActivity',
      () => {
        appendLog('INFO', 'Radio info activity iniciada (simulado)');
      },
    );

    bridgeObjects.DtGetDeviceID = createExecuteBridgeObject(
      'DtGetDeviceID',
      () => state.deviceId,
    );

    bridgeObjects.DtSendNotification = createExecuteBridgeObject(
      'DtSendNotification',
      (title, message, imageUrl) => {
        const notification = {
          title: title == null ? '' : String(title),
          message: message == null ? '' : String(message),
          image: imageUrl == null ? '' : String(imageUrl),
        };

        state.notification = notification;
        if (!Array.isArray(state.notifications)) {
          state.notifications = [];
        }
        state.notifications.push(cloneValue(notification));

        if (autoEvents) {
          emit('notification', notification);
        }
      },
    );

    bridgeObjects.DtGetNetworkData = createExecuteBridgeObject(
      'DtGetNetworkData',
      () => toJsonStringOrNull(state.networkData),
    );

    bridgeObjects.DtGetStatusBarHeight = createExecuteBridgeObject(
      'DtGetStatusBarHeight',
      () => toInteger(state.statusBarHeight, 0),
    );

    bridgeObjects.DtGetNavigationBarHeight = createExecuteBridgeObject(
      'DtGetNavigationBarHeight',
      () => toInteger(state.navigationBarHeight, 0),
    );

    bridgeObjects.DtOpenExternalUrl = createExecuteBridgeObject(
      'DtOpenExternalUrl',
      (url) => {
        state.lastExternalUrl = url == null ? null : String(url);
      },
    );

    bridgeObjects.DtStartHotSpotService = createExecuteBridgeObject(
      'DtStartHotSpotService',
      (port) => {
        state.hotSpotStatus = 'RUNNING';
        state.hotSpotPort =
          port === undefined ? null : toInteger(port, state.hotSpotPort);
      },
    );

    bridgeObjects.DtStopHotSpotService = createExecuteBridgeObject(
      'DtStopHotSpotService',
      () => {
        state.hotSpotStatus = 'STOPPED';
      },
    );

    bridgeObjects.DtGetStatusHotSpotService = createExecuteBridgeObject(
      'DtGetStatusHotSpotService',
      () => state.hotSpotStatus,
    );

    bridgeObjects.DtGetNetworkDownloadBytes = createExecuteBridgeObject(
      'DtGetNetworkDownloadBytes',
      () => toInteger(state.networkDownloadBytes, 0),
    );

    bridgeObjects.DtGetNetworkUploadBytes = createExecuteBridgeObject(
      'DtGetNetworkUploadBytes',
      () => toInteger(state.networkUploadBytes, 0),
    );

    bridgeObjects.DtAppVersion = createExecuteBridgeObject(
      'DtAppVersion',
      () => state.appVersion,
    );

    bridgeObjects.DtActionHandler = createExecuteBridgeObject(
      'DtActionHandler',
      (action) => {
        state.lastAction = action == null ? null : String(action);
      },
    );

    bridgeObjects.DtCloseApp = createExecuteBridgeObject('DtCloseApp', () => {
      state.closed = true;
    });

    function install() {
      if (installed) return controller;
      blockedByWebView = false;

      if (!allowInWebView && hasExternalBridge()) {
        blockedByWebView = true;
        return controller;
      }

      BRIDGE_OBJECT_NAMES.forEach((objectName) => {
        previousByObject.set(objectName, {
          hadOwn: hasOwn.call(windowRef, objectName),
          value: windowRef[objectName],
        });
        windowRef[objectName] = bridgeObjects[objectName];
      });

      installed = true;
      return controller;
    }

    function uninstall() {
      if (!installed) return controller;

      BRIDGE_OBJECT_NAMES.forEach((objectName) => {
        const previous = previousByObject.get(objectName);
        if (!previous) return;

        if (windowRef[objectName] !== bridgeObjects[objectName]) {
          return;
        }

        if (previous.hadOwn) {
          windowRef[objectName] = previous.value;
        } else {
          try {
            delete windowRef[objectName];
          } catch (_error) {
            windowRef[objectName] = undefined;
          }
        }
      });

      previousByObject.clear();
      installed = false;
      blockedByWebView = false;
      return controller;
    }

    function setImplementation(objectName, methodName, implementation) {
      if (!objectName || !methodName) return controller;

      const key = `${objectName}.${methodName}`;
      if (typeof implementation === 'function') {
        implementations.set(key, {
          kind: 'function',
          value: implementation,
        });
        return controller;
      }

      implementations.set(key, {
        kind: 'value',
        value: cloneValue(implementation),
      });

      return controller;
    }

    function removeImplementation(objectName, methodName) {
      const key = `${objectName}.${methodName}`;
      implementations.delete(key);
      return controller;
    }

    function clearImplementations() {
      implementations.clear();
      return controller;
    }

    function getBridgeObject(objectName) {
      return bridgeObjects[objectName];
    }

    function hasExternalBridge() {
      return BRIDGE_OBJECT_NAMES.some((objectName) => {
        const candidate = windowRef[objectName];
        if (candidate === undefined || candidate === null) return false;
        return candidate !== bridgeObjects[objectName];
      });
    }

    controller = {
      window: windowRef,
      bridgeObjectNames: BRIDGE_OBJECT_NAMES,
      callbackNames: NATIVE_CALLBACK_NAMES,
      semanticEventToCallback: SEMANTIC_EVENT_TO_CALLBACK,
      autoEvents,
      allowInWebView,
      install,
      uninstall,
      isInstalled() {
        return installed;
      },
      isBlockedByWebView() {
        return blockedByWebView;
      },
      getState() {
        return cloneValue(state);
      },
      setState(patchState) {
        state = mergeDeep(state, patchState || {});
        return controller;
      },
      resetState(nextState) {
        state = mergeDeep(createDefaultState(), nextState || {});
        return controller;
      },
      getCalls() {
        return cloneValue(calls);
      },
      clearCalls() {
        calls.length = 0;
        return controller;
      },
      setImplementation,
      removeImplementation,
      clearImplementations,
      emit,
      getBridgeObject,
    };

    return controller;
  }

  function installDTunnelSDKSimulator(options) {
    const controller = createDTunnelSDKSimulator(options);
    controller.install();
    return controller;
  }

  const publicApi = {
    BRIDGE_OBJECT_NAMES,
    NATIVE_CALLBACK_NAMES,
    SEMANTIC_EVENT_TO_CALLBACK,
    createDTunnelSDKSimulator,
    installDTunnelSDKSimulator,
  };

  globalScope.DTunnelSDKSimulator = publicApi;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ...publicApi,
      default: publicApi,
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
