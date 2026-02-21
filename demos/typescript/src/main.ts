import DTunnelSDK, {
  type DTunnelAction,
  type DTunnelAnySemanticEventEnvelope,
  type DTunnelBridgeObjectName,
  type DTunnelVPNState,
} from 'dtunnel-sdk';
import './style.css';

type MetricName = 'calls' | 'events' | 'errors';

const sdkStatusEl = mustGetById('sdkStatus');
const bridgeStatusEl = mustGetById('bridgeStatus');
const vpnStatusEl = mustGetById('vpnStatus');
const lastEventStatusEl = mustGetById('lastEventStatus');
const outputEl = mustGetById('output');

const metricCallsEl = mustGetById('metricCalls');
const metricEventsEl = mustGetById('metricEvents');
const metricErrorsEl = mustGetById('metricErrors');

const inputAppConfigKey = mustGetInputById('inputAppConfigKey');
const inputExternalUrl = mustGetInputById('inputExternalUrl');
const inputTranslate = mustGetInputById('inputTranslate');
const inputActionValue = mustGetInputById('inputActionValue');
const inputNotifyTitle = mustGetInputById('inputNotifyTitle');
const inputNotifyMessage = mustGetInputById('inputNotifyMessage');

const REQUIRED_BRIDGE: DTunnelBridgeObjectName[] = [
  'DtGetVpnState',
  'DtExecuteVpnStart',
  'DtExecuteVpnStop',
];

const metrics: Record<MetricName, number> = {
  calls: 0,
  events: 0,
  errors: 0,
};

const sdk = new DTunnelSDK({
  strict: false,
  autoRegisterNativeEvents: true,
});

applyIndexViewportInsets();
setChip(sdkStatusEl, `SDK: pronto (v${sdk.version})`, 'ok');
setVpnStatus(sdk.main.getVpnState());
refreshBridgeStatus();
log('INFO', `SDK inicializado (v${sdk.version})`);

sdk.on('error', (event) => {
  bumpMetric('errors');
  setChip(lastEventStatusEl, `Ultimo erro: ${event.error.code}`, 'error');
  log('SDK_ERROR', event.error.message, event.error.details);
});

sdk.on('nativeEvent', (event: DTunnelAnySemanticEventEnvelope) => {
  bumpMetric('events');
  setChip(lastEventStatusEl, `Ultimo evento: ${event.callbackName}`, 'accent');
  log('EVENT', event.callbackName, event.payload);
});

sdk.on('vpnState', (event) => {
  setVpnStatus(event.payload);
});

sdk.on('newDefaultConfig', () => {
  setChip(lastEventStatusEl, 'Ultimo evento: newDefaultConfig', 'accent');
});

bindActionButtons();

function bindActionButtons() {
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('button[data-action]'),
  );

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (!action) return;

      switch (action) {
        case 'state': {
          const state = runCall('sdk.main.getVpnState()', () =>
            sdk.main.getVpnState(),
          );
          setVpnStatus(state);
          break;
        }
        case 'start': {
          runCallVoid('sdk.main.startVpn()', () => sdk.main.startVpn());
          break;
        }
        case 'stop': {
          runCallVoid('sdk.main.stopVpn()', () => sdk.main.stopVpn());
          break;
        }
        case 'configDialog': {
          runCallVoid('sdk.config.openConfigDialog()', () =>
            sdk.config.openConfigDialog(),
          );
          break;
        }
        case 'menuDialog': {
          runCallVoid('sdk.main.showMenuDialog()', () =>
            sdk.main.showMenuDialog(),
          );
          break;
        }
        case 'loggerDialog': {
          runCallVoid('sdk.main.showLoggerDialog()', () =>
            sdk.main.showLoggerDialog(),
          );
          break;
        }
        case 'configs': {
          runCall('sdk.config.getConfigs()', () => sdk.config.getConfigs());
          break;
        }
        case 'default': {
          runCall('sdk.config.getDefaultConfig()', () =>
            sdk.config.getDefaultConfig(),
          );
          break;
        }
        case 'logs': {
          runCall('sdk.main.getLogs()', () => sdk.main.getLogs());
          break;
        }
        case 'checkUser': {
          runCallVoid('sdk.main.startCheckUser()', () =>
            sdk.main.startCheckUser(),
          );
          break;
        }
        case 'appUpdate': {
          runCallVoid('sdk.main.startAppUpdate()', () =>
            sdk.main.startAppUpdate(),
          );
          break;
        }
        case 'appVersion': {
          runCall('sdk.android.getAppVersion()', () =>
            sdk.android.getAppVersion(),
          );
          break;
        }
        case 'network': {
          runCall('sdk.android.getNetworkData()', () =>
            sdk.android.getNetworkData(),
          );
          break;
        }
        case 'snapshot': {
          runCall('sdk.createDebugSnapshot()', () => sdk.createDebugSnapshot());
          break;
        }
        case 'refreshBridge': {
          refreshBridgeStatus();
          log('INFO', 'Bridge status atualizado', sdk.getBridgeAvailability());
          break;
        }
        case 'appConfig': {
          const key = inputAppConfigKey.value.trim() || 'support_url';
          runCall(`sdk.app.getAppConfig("${key}")`, () =>
            sdk.app.getAppConfig(key),
          );
          break;
        }
        case 'openUrl': {
          const url = inputExternalUrl.value.trim() || 'https://dtunnel.com';
          runCallVoid(`sdk.android.openExternalUrl("${url}")`, () =>
            sdk.android.openExternalUrl(url),
          );
          break;
        }
        case 'translate': {
          const label = inputTranslate.value.trim() || 'vpn_connected';
          runCall(`sdk.text.translate("${label}")`, () =>
            sdk.text.translate(label),
          );
          break;
        }
        case 'notify': {
          const title = inputNotifyTitle.value.trim() || 'DTunnel SDK';
          const message = inputNotifyMessage.value.trim() || 'Mensagem de teste';
          runCallVoid('sdk.android.sendNotification(...)', () =>
            sdk.android.sendNotification(title, message, null),
          );
          break;
        }
        case 'action': {
          const actionValue = inputActionValue.value.trim() || 'CDN_UPDATE';
          runCallVoid(`sdk.android.handleAction("${actionValue}")`, () =>
            sdk.android.handleAction(actionValue as DTunnelAction | (string & {})),
          );
          break;
        }
        case 'clearOutput': {
          clearOutput();
          break;
        }
        case 'copySnapshot': {
          void copySnapshot();
          break;
        }
        default:
          log('WARN', `Acao desconhecida: ${action}`);
      }
    });
  });
}

function runCall<T>(label: string, fn: () => T): T {
  bumpMetric('calls');
  const result = fn();
  log('CALL', label, result);
  return result;
}

function runCallVoid(label: string, fn: () => void) {
  bumpMetric('calls');
  fn();
  log('CALL', label);
}

function applyIndexViewportInsets() {
  const statusBarHeight = normalizeInsetPx(sdk.android.getStatusBarHeight());
  const navigationBarHeight = normalizeInsetPx(
    sdk.android.getNavigationBarHeight(),
  );

  document.documentElement.style.setProperty(
    '--dt-status-bar-height',
    `${statusBarHeight}px`,
  );
  document.documentElement.style.setProperty(
    '--dt-navigation-bar-height',
    `${navigationBarHeight}px`,
  );

  const applyOffsets = () => {
    const isLandscape = window.innerWidth > window.innerHeight;
    const widthOffset = isLandscape ? navigationBarHeight : 0;
    const heightOffset =
      statusBarHeight + (isLandscape ? 0 : navigationBarHeight);

    document.documentElement.style.setProperty(
      '--dt-index-width-offset',
      `${widthOffset}px`,
    );
    document.documentElement.style.setProperty(
      '--dt-index-height-offset',
      `${heightOffset}px`,
    );
  };

  applyOffsets();
  window.addEventListener('resize', applyOffsets);
}

function refreshBridgeStatus() {
  const availability = sdk.getBridgeAvailability();
  const missing = REQUIRED_BRIDGE.filter((name) => !availability[name]);

  if (missing.length === 0) {
    setChip(bridgeStatusEl, 'Bridge: pronta', 'ok');
    return;
  }

  setChip(bridgeStatusEl, `Bridge: parcial (${missing.join(', ')})`, 'warn');
}

function clearOutput() {
  outputEl.textContent = '';
  log('INFO', 'Output limpo');
}

async function copySnapshot() {
  const snapshot = JSON.stringify(sdk.createDebugSnapshot(), null, 2);
  if (!navigator.clipboard?.writeText) {
    log('WARN', 'Clipboard API indisponivel neste ambiente');
    return;
  }

  try {
    await navigator.clipboard.writeText(snapshot);
    log('INFO', 'Debug snapshot copiado para a area de transferencia');
  } catch (error) {
    log('ERROR', 'Falha ao copiar snapshot', String(error));
  }
}

function setVpnStatus(state: DTunnelVPNState | null) {
  setChip(vpnStatusEl, `VPN: ${state ?? 'desconhecido'}`);
}

function bumpMetric(metric: MetricName) {
  metrics[metric] += 1;
  metricCallsEl.textContent = String(metrics.calls);
  metricEventsEl.textContent = String(metrics.events);
  metricErrorsEl.textContent = String(metrics.errors);
}

function setChip(
  element: HTMLElement,
  text: string,
  mode?: 'ok' | 'warn' | 'error' | 'accent',
) {
  element.textContent = text;
  element.classList.remove('ok', 'warn', 'error', 'accent');
  if (mode) {
    element.classList.add(mode);
  }
}

function log(type: string, message: string, data?: unknown) {
  const suffix = data === undefined ? '' : ` ${safeStringify(data)}`;
  outputEl.textContent += `[${new Date().toISOString()}] [${type}] ${message}${suffix}\n`;
  outputEl.scrollTop = outputEl.scrollHeight;
}

function safeStringify(value: unknown): string {
  try {
    if (typeof value === 'string') return value;
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function normalizeInsetPx(value: number | null): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.round(value);
}

function mustGetById(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Elemento nao encontrado: #${id}`);
  }
  return element;
}

function mustGetInputById(id: string): HTMLInputElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`Input nao encontrado: #${id}`);
  }
  return element;
}
