/* eslint-disable no-console */
(function initDTunnelSDK(globalScope) {
  'use strict';

  const BRIDGE_OBJECTS = Object.freeze([
    'DtSetConfig',
    'DtGetConfigs',
    'DtGetCategories',
    'DtGetSelectedCategory',
    'DtGetSelectedCategoryId',
    'DtGetConfigsByCategory',
    'DtGetSelectedConfig',
    'DtGetSelectedConfigId',
    'DtGetConfigCount',
    'DtGetDefaultConfig',
    'DtExecuteDialogConfig',
    'DtGetImportPublicKey',
    'DtCopyImportPublicKey',
    'DtImportConfig',
    'DtHasPendingConfigImport',
    'DtGetPendingConfigImportDetails',
    'DtUsername',
    'DtPassword',
    'DtGetLocalConfigVersion',
    'DtCDNCount',
    'DtEndpointCount',
    'DtUuid',
    'DtGetUser',
    'DtGetLogs',
    'DtClearLogs',
    'DtExecuteVpnStart',
    'DtExecuteVpnStop',
    'DtGetVpnState',
    'DtIsVpnRunning',
    'DtStartAppUpdate',
    'DtStartCheckUser',
    'DtShowLoggerDialog',
    'DtGetLocalIP',
    'DtAirplaneActivate',
    'DtAirplaneDeactivate',
    'DtAirplaneState',
    'DtAppIsCurrentAssistant',
    'DtShowMenuDialog',
    'DtShowDialogAdsRewarded',
    'DtIsAdsEnabled',
    'DtGetRemainingConnectionTime',
    'DtGetRemainingConnectionTimerText',
    'DtGetLastVpnError',
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
    'DtCopyToClipboard',
    'DtGetClipboardText',
    'DtShowToast',
    'DtVibrate',
    'DtIsDarkMode',
    'DtGetAppColors',
    'DtGetDiagnosticReport',
    'DtCopyDiagnosticReport',
    'DtIsSafeMode',
  ]);

  const EVENT_DEFINITIONS = freezeEventDefinitions({
    vpnState: {
      callbacks: ['DtVpnStateEvent', 'dtVpnStateListener'],
      parseAsJson: false,
    },
    vpnStartedSuccess: {
      callbacks: ['DtVpnStartedSuccessEvent', 'dtVpnStartedSuccessListener'],
      parseAsJson: false,
    },
    vpnStoppedSuccess: {
      callbacks: ['DtVpnStoppedSuccessEvent', 'dtVpnStoppedSuccessListener'],
      parseAsJson: false,
    },
    newLog: {
      callbacks: ['DtNewLogEvent', 'dtOnNewLogListener'],
      parseAsJson: false,
    },
    newDefaultConfig: {
      callbacks: ['DtNewDefaultConfigEvent', 'dtConfigClickListener'],
      parseAsJson: false,
    },
    checkUserStarted: {
      callbacks: ['DtCheckUserStartedEvent', 'dtCheckUserStartedListener'],
      parseAsJson: false,
    },
    checkUserResult: {
      callbacks: ['DtCheckUserResultEvent', 'dtCheckUserModelListener'],
      parseAsJson: true,
    },
    checkUserError: {
      callbacks: ['DtCheckUserErrorEvent', 'dtCheckUserErrorListener'],
      parseAsJson: false,
    },
    messageError: {
      callbacks: ['DtMessageErrorEvent', 'dtMessageErrorListener'],
      parseAsJson: true,
    },
    showSuccessToast: {
      callbacks: ['DtSuccessToastEvent', 'dtShowSuccessToastListener'],
      parseAsJson: false,
    },
    showErrorToast: {
      callbacks: ['DtErrorToastEvent', 'dtShowErrorToastListener'],
      parseAsJson: false,
    },
    notification: {
      callbacks: ['DtNotificationEvent'],
      parseAsJson: true,
    },
    localIp: {
      callbacks: ['DtLocalIpEvent', 'dtLocalIpListener'],
      parseAsJson: false,
    },
    networkName: {
      callbacks: ['DtNetworkNameEvent', 'dtNetworkNameListener'],
      parseAsJson: false,
    },
    pingResult: {
      callbacks: ['DtPingResultEvent', 'dtPingResultListener'],
      parseAsJson: false,
    },
    checkingAppUpdate: {
      callbacks: ['DtCheckingAppUpdateEvent', 'dtCheckingAppUpdateListener'],
      parseAsJson: false,
    },
    airplaneState: {
      callbacks: ['DtAirplaneStateEvent', 'dtAirplaneStateListener'],
      parseAsJson: false,
    },
    hotSpotState: {
      callbacks: ['DtHotSpotStateEvent', 'dtHotSpotStateListener'],
      parseAsJson: false,
    },
    reloadRequest: {
      callbacks: ['DtReloadRequestEvent', 'dtReloadRequestListener'],
      parseAsJson: false,
    },
  });

  const CALLBACK_TO_EVENT = Object.freeze(
    buildCallbackIndex(EVENT_DEFINITIONS),
  );

  function freezeEventDefinitions(definitions) {
    const clone = { ...definitions };
    Object.keys(clone).forEach((eventName) => {
      const eventConfig = clone[eventName];
      clone[eventName] = Object.freeze({
        callbacks: Object.freeze([...eventConfig.callbacks]),
        parseAsJson: Boolean(eventConfig.parseAsJson),
      });
    });
    return Object.freeze(clone);
  }

  function buildCallbackIndex(definitions) {
    const index = {};
    Object.keys(definitions).forEach((eventName) => {
      const callbacks = definitions[eventName].callbacks;
      callbacks.forEach((callbackName) => {
        index[callbackName] = eventName;
      });
    });
    return index;
  }

  function isFunction(value) {
    return typeof value === 'function';
  }

  function safeParseJson(value) {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch (_error) {
      return value;
    }
  }

  class DTunnelBridgeError extends Error {
    constructor(code, message, details) {
      super(message);
      this.name = 'DTunnelBridgeError';
      this.code = code;
      this.details = details || {};
    }
  }

  class EventBus {
    constructor() {
      this.listenersByEvent = new Map();
    }

    on(eventName, listener) {
      if (!isFunction(listener)) {
        throw new TypeError('Listener precisa ser uma funcao.');
      }

      let listeners = this.listenersByEvent.get(eventName);
      if (!listeners) {
        listeners = new Set();
        this.listenersByEvent.set(eventName, listeners);
      }

      listeners.add(listener);
      return () => this.off(eventName, listener);
    }

    once(eventName, listener) {
      const unsubscribe = this.on(eventName, (payload) => {
        unsubscribe();
        listener(payload);
      });
      return unsubscribe;
    }

    off(eventName, listener) {
      const listeners = this.listenersByEvent.get(eventName);
      if (!listeners) return;

      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listenersByEvent.delete(eventName);
      }
    }

    emit(eventName, payload) {
      const listeners = this.listenersByEvent.get(eventName);
      if (!listeners || listeners.size === 0) return;

      Array.from(listeners).forEach((listener) => {
        try {
          listener(payload);
        } catch (error) {
          console.error('[DTunnelSDK] listener error:', eventName, error);
        }
      });
    }

    clear(eventName) {
      if (eventName) {
        this.listenersByEvent.delete(eventName);
        return;
      }
      this.listenersByEvent.clear();
    }
  }

  class BridgeGateway {
    constructor(options) {
      this.windowRef = options.windowRef;
      this.strict = Boolean(options.strict);
      this.logger = options.logger || console;
      this.eventBus = options.eventBus;
    }

    getObject(objectName) {
      return this.windowRef ? this.windowRef[objectName] : undefined;
    }

    hasObject(objectName) {
      return Boolean(this.getObject(objectName));
    }

    call(options) {
      const objectName = options.objectName;
      const methodName = options.methodName;
      const args = Array.isArray(options.args) ? options.args : [];
      const parseJson = Boolean(options.parseJson);
      const expectVoid = Boolean(options.expectVoid);

      const target = this.getObject(objectName);
      if (!target) {
        return this.handleFailure(
          new DTunnelBridgeError(
            'BRIDGE_OBJECT_NOT_FOUND',
            `Objeto de bridge nao encontrado: ${objectName}`,
            { objectName, methodName },
          ),
        );
      }

      const method = target[methodName];
      if (!isFunction(method)) {
        return this.handleFailure(
          new DTunnelBridgeError(
            'BRIDGE_METHOD_NOT_FOUND',
            `Metodo de bridge nao encontrado: ${objectName}.${methodName}()`,
            { objectName, methodName },
          ),
        );
      }

      let result;
      try {
        result = method.apply(target, args);
      } catch (cause) {
        return this.handleFailure(
          new DTunnelBridgeError(
            'BRIDGE_CALL_FAILED',
            `Falha na chamada de bridge: ${objectName}.${methodName}()`,
            { objectName, methodName, args, cause },
          ),
        );
      }

      if (expectVoid) return undefined;
      return parseJson ? safeParseJson(result) : result;
    }

    handleFailure(error) {
      if (this.strict) {
        throw error;
      }

      if (this.logger && isFunction(this.logger.error)) {
        this.logger.error('[DTunnelSDK]', error.message, error.details || {});
      }

      this.eventBus.emit('error', {
        name: 'error',
        error,
        timestamp: Date.now(),
      });
      return null;
    }
  }

  class NativeEventsAdapter {
    constructor(options) {
      this.windowRef = options.windowRef;
      this.eventBus = options.eventBus;
      this.wrappersByCallback = new Map();
    }

    register() {
      Object.keys(CALLBACK_TO_EVENT).forEach((callbackName) => {
        if (this.wrappersByCallback.has(callbackName)) return;

        const wrapper = (...args) => {
          this.dispatch(callbackName, args);
        };

        this.windowRef[callbackName] = wrapper;
        this.wrappersByCallback.set(callbackName, wrapper);
      });
    }

    unregister() {
      this.wrappersByCallback.forEach((wrapper, callbackName) => {
        if (this.windowRef[callbackName] === wrapper) {
          try {
            delete this.windowRef[callbackName];
          } catch (_error) {
            this.windowRef[callbackName] = undefined;
          }
        }
      });

      this.wrappersByCallback.clear();
    }

    getRegisteredCallbacks() {
      return Array.from(this.wrappersByCallback.keys());
    }

    dispatch(callbackName, args) {
      const semanticName = CALLBACK_TO_EVENT[callbackName] || null;
      const rawPayload = args.length <= 1 ? args[0] : args;

      let payload = rawPayload;
      if (semanticName) {
        const definition = EVENT_DEFINITIONS[semanticName];
        payload =
          definition && definition.parseAsJson
            ? safeParseJson(rawPayload)
            : rawPayload;
      }

      const envelope = {
        name: semanticName,
        callbackName,
        payload,
        rawPayload,
        args,
        timestamp: Date.now(),
      };

      if (semanticName) {
        this.eventBus.emit(semanticName, envelope);
      }
      this.eventBus.emit(`native:${callbackName}`, envelope);
      this.eventBus.emit('nativeEvent', envelope);
    }
  }

  class ModuleBase {
    constructor(gateway) {
      this.gateway = gateway;
    }

    call(objectName, methodName, args) {
      return this.gateway.call({ objectName, methodName, args });
    }

    callJson(objectName, methodName, args) {
      return this.gateway.call({
        objectName,
        methodName,
        args,
        parseJson: true,
      });
    }

    callVoid(objectName, methodName, args) {
      this.gateway.call({ objectName, methodName, args, expectVoid: true });
    }
  }

  class ConfigModule extends ModuleBase {
    setConfig(id) {
      this.callVoid('DtSetConfig', 'execute', [id]);
    }
    getConfigs() {
      return this.callJson('DtGetConfigs', 'execute');
    }
    getCategories() {
      return this.callJson('DtGetCategories', 'execute');
    }
    getSelectedCategory() {
      return this.callJson('DtGetSelectedCategory', 'execute');
    }
    getSelectedCategoryId() {
      return this.call('DtGetSelectedCategoryId', 'execute');
    }
    getConfigsByCategory(categoryId) {
      return this.callJson('DtGetConfigsByCategory', 'execute', [categoryId]);
    }
    getSelectedConfig() {
      return this.callJson('DtGetSelectedConfig', 'execute');
    }
    getSelectedConfigId() {
      return this.call('DtGetSelectedConfigId', 'execute');
    }
    getConfigCount() {
      return this.call('DtGetConfigCount', 'execute');
    }
    getDefaultConfig() {
      return this.callJson('DtGetDefaultConfig', 'execute');
    }
    openConfigDialog() {
      this.callVoid('DtExecuteDialogConfig', 'execute');
    }
    getImportPublicKey() {
      return this.call('DtGetImportPublicKey', 'execute');
    }
    copyImportPublicKey() {
      this.callVoid('DtCopyImportPublicKey', 'execute');
    }
    importConfig(payload) {
      this.callVoid('DtImportConfig', 'execute', [payload]);
    }
    hasPendingConfigImport() {
      return Boolean(this.call('DtHasPendingConfigImport', 'execute'));
    }
    getPendingConfigImportDetails() {
      return this.callJson('DtGetPendingConfigImportDetails', 'execute');
    }
    getUsername() {
      return this.call('DtUsername', 'get');
    }
    setUsername(value) {
      this.callVoid('DtUsername', 'set', [value]);
    }
    getPassword() {
      return this.call('DtPassword', 'get');
    }
    setPassword(value) {
      this.callVoid('DtPassword', 'set', [value]);
    }
    getLocalConfigVersion() {
      return this.call('DtGetLocalConfigVersion', 'execute');
    }
    getCdnCount() {
      if (this.gateway.hasObject('DtEndpointCount')) {
        return this.call('DtEndpointCount', 'execute');
      }
      return this.call('DtCDNCount', 'execute');
    }
    getEndpointCount() {
      return this.getCdnCount();
    }
    getUuid() {
      return this.call('DtUuid', 'get');
    }
    setUuid(value) {
      this.callVoid('DtUuid', 'set', [value]);
    }
    getUser() {
      return this.callJson('DtGetUser', 'execute');
    }
  }

  class MainModule extends ModuleBase {
    getLogs() {
      return this.callJson('DtGetLogs', 'execute');
    }
    clearLogs() {
      this.callVoid('DtClearLogs', 'execute');
    }
    startVpn() {
      this.callVoid('DtExecuteVpnStart', 'execute');
    }
    stopVpn() {
      this.callVoid('DtExecuteVpnStop', 'execute');
    }
    getVpnState() {
      return this.call('DtGetVpnState', 'execute');
    }
    isVpnRunning() {
      return Boolean(this.call('DtIsVpnRunning', 'execute'));
    }
    startAppUpdate() {
      this.callVoid('DtStartAppUpdate', 'execute');
    }
    startCheckUser() {
      this.callVoid('DtStartCheckUser', 'execute');
    }
    showLoggerDialog() {
      this.callVoid('DtShowLoggerDialog', 'execute');
    }
    getLocalIp() {
      return this.call('DtGetLocalIP', 'execute');
    }
    activateAirplaneMode() {
      this.callVoid('DtAirplaneActivate', 'execute');
    }
    deactivateAirplaneMode() {
      this.callVoid('DtAirplaneDeactivate', 'execute');
    }
    getAirplaneState() {
      return this.call('DtAirplaneState', 'execute');
    }
    getAssistantState() {
      return this.call('DtAppIsCurrentAssistant', 'execute');
    }
    isCurrentAssistantEnabled() {
      return this.getAssistantState() === 'ENABLED';
    }
    showMenuDialog() {
      this.callVoid('DtShowMenuDialog', 'execute');
    }
    showAdsRewardedDialog() {
      this.callVoid('DtShowDialogAdsRewarded', 'execute');
    }
    isAdsEnabled() {
      return Boolean(this.call('DtIsAdsEnabled', 'execute'));
    }
    getRemainingConnectionTime() {
      return this.call('DtGetRemainingConnectionTime', 'execute');
    }
    getRemainingConnectionTimerText() {
      return this.call('DtGetRemainingConnectionTimerText', 'execute');
    }
    getLastVpnError() {
      return this.call('DtGetLastVpnError', 'execute');
    }
    getNetworkName() {
      return this.call('DtGetNetworkName', 'execute');
    }
    getPingResult() {
      return this.call('DtGetPingResult', 'execute');
    }
  }

  class TextModule extends ModuleBase {
    translate(label) {
      return this.call('DtTranslateText', 'execute', [label]);
    }
  }

  class AppModule extends ModuleBase {
    cleanApp() {
      this.callVoid('DtCleanApp', 'execute');
    }
    goToVoiceInputSettings() {
      this.callVoid('DtGoToVoiceInputSettings', 'execute');
    }
    getAppConfig(name) {
      return this.callJson('DtGetAppConfig', 'execute', [name]);
    }
    ignoreBatteryOptimizations() {
      this.callVoid('DtIgnoreBatteryOptimizations', 'execute');
    }
    startApnActivity() {
      this.callVoid('DtStartApnActivity', 'execute');
    }
    startNetworkActivity() {
      this.callVoid('DtStartNetworkActivity', 'execute');
    }
    startWebViewActivity(url) {
      if (arguments.length === 0) {
        this.callVoid('DtStartWebViewActivity', 'execute');
        return;
      }
      this.callVoid('DtStartWebViewActivity', 'execute', [url]);
    }
    startRadioInfoActivity() {
      this.callVoid('DtStartRadioInfoActivity', 'execute');
    }
  }

  class AndroidModule extends ModuleBase {
    getDeviceId() {
      return this.call('DtGetDeviceID', 'execute');
    }
    sendNotification(title, message, imageUrl) {
      this.callVoid('DtSendNotification', 'execute', [
        title,
        message,
        imageUrl || null,
      ]);
    }
    getNetworkData() {
      return this.callJson('DtGetNetworkData', 'execute');
    }
    getStatusBarHeight() {
      return this.call('DtGetStatusBarHeight', 'execute');
    }
    getNavigationBarHeight() {
      return this.call('DtGetNavigationBarHeight', 'execute');
    }
    openExternalUrl(url) {
      this.callVoid('DtOpenExternalUrl', 'execute', [url]);
    }
    startHotSpotService(port) {
      if (arguments.length === 0) {
        this.callVoid('DtStartHotSpotService', 'execute');
        return;
      }
      this.callVoid('DtStartHotSpotService', 'execute', [port]);
    }
    stopHotSpotService() {
      this.callVoid('DtStopHotSpotService', 'execute');
    }
    getHotSpotStatus() {
      return this.call('DtGetStatusHotSpotService', 'execute');
    }
    isHotSpotRunning() {
      return this.getHotSpotStatus() === 'RUNNING';
    }
    getNetworkDownloadBytes() {
      return this.call('DtGetNetworkDownloadBytes', 'execute');
    }
    getNetworkUploadBytes() {
      return this.call('DtGetNetworkUploadBytes', 'execute');
    }
    getAppVersion() {
      return this.call('DtAppVersion', 'execute');
    }
    handleAction(action) {
      this.callVoid('DtActionHandler', 'execute', [action]);
    }
    closeApp() {
      this.callVoid('DtCloseApp', 'execute');
    }
    copyToClipboard(text) {
      this.callVoid('DtCopyToClipboard', 'execute', [text]);
    }
    getClipboardText() {
      return this.call('DtGetClipboardText', 'execute');
    }
    showToast(message) {
      this.callVoid('DtShowToast', 'execute', [message]);
    }
    vibrate(durationMillis) {
      this.callVoid('DtVibrate', 'execute', [durationMillis || 50]);
    }
    isDarkMode() {
      return Boolean(this.call('DtIsDarkMode', 'execute'));
    }
    getAppColors() {
      return this.callJson('DtGetAppColors', 'execute');
    }
    getDiagnosticReport() {
      return this.call('DtGetDiagnosticReport', 'execute');
    }
    copyDiagnosticReport() {
      this.callVoid('DtCopyDiagnosticReport', 'execute');
    }
    isSafeMode() {
      return Boolean(this.call('DtIsSafeMode', 'execute'));
    }
  }

  class DTunnelSDK {
    constructor(options) {
      const config = options || {};

      this.window = config.window || globalScope;
      this.strict = Boolean(config.strict);
      this.logger = config.logger || console;
      this.autoRegisterNativeEvents = config.autoRegisterNativeEvents !== false;
      this.version = DTunnelSDK.VERSION;

      this.eventBus = new EventBus();
      this.gateway = new BridgeGateway({
        windowRef: this.window,
        strict: this.strict,
        logger: this.logger,
        eventBus: this.eventBus,
      });

      this.nativeEvents = new NativeEventsAdapter({
        windowRef: this.window,
        eventBus: this.eventBus,
      });

      this.config = new ConfigModule(this.gateway);
      this.main = new MainModule(this.gateway);
      this.text = new TextModule(this.gateway);
      this.app = new AppModule(this.gateway);
      this.android = new AndroidModule(this.gateway);

      if (this.autoRegisterNativeEvents) {
        this.registerNativeEventHandlers();
      }
    }

    on(eventName, listener) {
      return this.eventBus.on(eventName, listener);
    }

    once(eventName, listener) {
      return this.eventBus.once(eventName, listener);
    }

    off(eventName, listener) {
      this.eventBus.off(eventName, listener);
    }

    removeAllListeners(eventName) {
      this.eventBus.clear(eventName);
    }

    onNativeEvent(listener) {
      return this.on('nativeEvent', listener);
    }

    onError(listener) {
      return this.on('error', listener);
    }

    getBridgeObject(objectName) {
      return this.gateway.getObject(objectName);
    }

    hasBridgeObject(objectName) {
      return this.gateway.hasObject(objectName);
    }

    getBridgeAvailability() {
      const availability = {};
      BRIDGE_OBJECTS.forEach((objectName) => {
        availability[objectName] = this.hasBridgeObject(objectName);
      });
      return availability;
    }

    isReady(requiredObjects) {
      const targets =
        Array.isArray(requiredObjects) && requiredObjects.length > 0
          ? requiredObjects
          : BRIDGE_OBJECTS;

      return targets.every((objectName) => this.hasBridgeObject(objectName));
    }

    call(objectName, methodName, args) {
      return this.gateway.call({ objectName, methodName, args });
    }

    callJson(objectName, methodName, args) {
      return this.gateway.call({
        objectName,
        methodName,
        args,
        parseJson: true,
      });
    }

    callVoid(objectName, methodName, args) {
      this.gateway.call({ objectName, methodName, args, expectVoid: true });
    }

    registerNativeEventHandlers() {
      this.nativeEvents.register();
      return this;
    }

    unregisterNativeEventHandlers() {
      this.nativeEvents.unregister();
      return this;
    }

    createDebugSnapshot() {
      return {
        strict: this.strict,
        autoRegisterNativeEvents: this.autoRegisterNativeEvents,
        ready: this.isReady(),
        bridgeAvailability: this.getBridgeAvailability(),
        registeredNativeCallbacks: this.nativeEvents.getRegisteredCallbacks(),
        timestamp: Date.now(),
      };
    }

    destroy() {
      this.unregisterNativeEventHandlers();
      this.removeAllListeners();
    }
  }

  DTunnelSDK.VERSION = '1.2.1';
  DTunnelSDK.BRIDGE_OBJECTS = BRIDGE_OBJECTS;
  DTunnelSDK.EVENT_DEFINITIONS = EVENT_DEFINITIONS;
  DTunnelSDK.DTunnelBridgeError = DTunnelBridgeError;

  globalScope.DTunnelBridgeError = DTunnelBridgeError;
  globalScope.DTunnelSDK = DTunnelSDK;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      DTunnelSDK,
      DTunnelBridgeError,
      default: DTunnelSDK,
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
