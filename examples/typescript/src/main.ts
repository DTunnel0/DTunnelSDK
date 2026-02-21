import DTunnelSDK, {
  type DTunnelAnySemanticEventEnvelope,
  type DTunnelBridgeObjectName,
} from 'dtunnel-sdk';
import './style.css';

const sdkStatusEl = mustGetById('sdkStatus');
const bridgeStatusEl = mustGetById('bridgeStatus');
const vpnStatusEl = mustGetById('vpnStatus');
const outputEl = mustGetById('output');

const sdk = new DTunnelSDK({
  strict: false,
  autoRegisterNativeEvents: true,
});

log('INFO', `SDK inicializado (v${sdk.version})`);
setPill(sdkStatusEl, `SDK: pronto (v${sdk.version})`, 'ok');
setVpnStatus(sdk.main.getVpnState());
refreshBridgeStatus();

sdk.on('error', (event) => {
  log('SDK_ERROR', event.error.message, event.error.details);
});

sdk.on('nativeEvent', (event: DTunnelAnySemanticEventEnvelope) => {
  log('EVENT', event.callbackName, event.payload);
});

sdk.on('vpnState', (event) => {
  setVpnStatus(event.payload);
});

bindActions();

function bindActions() {
  const actionButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('button[data-action]'),
  );

  actionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (!action) return;

      switch (action) {
        case 'state': {
          const state = sdk.main.getVpnState();
          setVpnStatus(state);
          log('CALL', 'sdk.main.getVpnState()', state);
          break;
        }
        case 'start': {
          sdk.main.startVpn();
          log('CALL', 'sdk.main.startVpn()');
          break;
        }
        case 'stop': {
          sdk.main.stopVpn();
          log('CALL', 'sdk.main.stopVpn()');
          break;
        }
        case 'configs': {
          const value = sdk.config.getConfigs();
          log('CALL', 'sdk.config.getConfigs()', value);
          break;
        }
        case 'default': {
          const value = sdk.config.getDefaultConfig();
          log('CALL', 'sdk.config.getDefaultConfig()', value);
          break;
        }
        case 'logs': {
          const value = sdk.main.getLogs();
          log('CALL', 'sdk.main.getLogs()', value);
          break;
        }
        case 'network': {
          const value = sdk.android.getNetworkData();
          log('CALL', 'sdk.android.getNetworkData()', value);
          break;
        }
        case 'snapshot': {
          log('DEBUG', 'sdk.createDebugSnapshot()', sdk.createDebugSnapshot());
          break;
        }
        default: {
          log('WARN', `Acao desconhecida: ${action}`);
        }
      }
    });
  });
}

function refreshBridgeStatus() {
  const availability = sdk.getBridgeAvailability();
  const required: DTunnelBridgeObjectName[] = [
    'DtGetVpnState',
    'DtExecuteVpnStart',
    'DtExecuteVpnStop',
  ];

  const missing = required.filter((name) => !availability[name]);

  if (missing.length === 0) {
    setPill(bridgeStatusEl, 'Bridge: pronta', 'ok');
    return;
  }

  setPill(bridgeStatusEl, `Bridge: parcial (${missing.join(', ')})`, 'warn');
}

function setVpnStatus(state: string | null) {
  setPill(vpnStatusEl, `VPN: ${state ?? 'desconhecido'}`);
}

function setPill(
  element: HTMLElement,
  text: string,
  mode?: 'ok' | 'warn' | 'error',
) {
  element.textContent = text;
  element.classList.remove('ok', 'warn', 'error');
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

function mustGetById(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Elemento nao encontrado: #${id}`);
  }
  return element;
}
