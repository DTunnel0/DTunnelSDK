import { useEffect, useMemo, useState } from 'react';
import {
  useDTunnelError,
  useDTunnelEvent,
  useDTunnelSDK,
} from 'dtunnel-sdk/react';
import type {
  DTunnelAction,
  DTunnelBridgeObjectName,
  DTunnelVPNState,
} from 'dtunnel-sdk';

type LogItem = {
  timestamp: string;
  type: string;
  message: string;
  data?: unknown;
};

type MetricState = {
  calls: number;
  events: number;
  errors: number;
};

const REQUIRED_BRIDGE: DTunnelBridgeObjectName[] = [
  'DtGetVpnState',
  'DtExecuteVpnStart',
  'DtExecuteVpnStop',
];

export function App() {
  const sdk = useDTunnelSDK();

  const [vpnState, setVpnState] = useState<DTunnelVPNState | null>(
    sdk.main.getVpnState(),
  );
  const [lastEvent, setLastEvent] = useState<string>('Ultimo evento: nenhum');
  const [metrics, setMetrics] = useState<MetricState>({
    calls: 0,
    events: 0,
    errors: 0,
  });
  const [logs, setLogs] = useState<LogItem[]>([
    {
      timestamp: new Date().toISOString(),
      type: 'INFO',
      message: `SDK inicializado (v${sdk.version})`,
    },
  ]);

  const [appConfigKey, setAppConfigKey] = useState('support_url');
  const [externalUrl, setExternalUrl] = useState('https://dtunnel.com');
  const [translateLabel, setTranslateLabel] = useState('vpn_connected');
  const [actionValue, setActionValue] = useState('CDN_UPDATE');
  const [notifyTitle, setNotifyTitle] = useState('DTunnel SDK');
  const [notifyMessage, setNotifyMessage] = useState(
    'Mensagem enviada pelo exemplo React',
  );

  useEffect(() => {
    const statusBarHeight = normalizeInsetPx(sdk.android.getStatusBarHeight());
    const navigationBarHeight = normalizeInsetPx(
      sdk.android.getNavigationBarHeight(),
    );
    const rootStyle = document.documentElement.style;

    rootStyle.setProperty('--dt-status-bar-height', `${statusBarHeight}px`);
    rootStyle.setProperty(
      '--dt-navigation-bar-height',
      `${navigationBarHeight}px`,
    );

    const applyOffsets = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      const widthOffset = isLandscape ? navigationBarHeight : 0;
      const heightOffset =
        statusBarHeight + (isLandscape ? 0 : navigationBarHeight);

      rootStyle.setProperty('--dt-index-width-offset', `${widthOffset}px`);
      rootStyle.setProperty('--dt-index-height-offset', `${heightOffset}px`);
    };

    applyOffsets();
    window.addEventListener('resize', applyOffsets);
    return () => {
      window.removeEventListener('resize', applyOffsets);
    };
  }, [sdk]);

  const bridgeStatus = useMemo(() => {
    const availability = sdk.getBridgeAvailability();
    const missing = REQUIRED_BRIDGE.filter((name) => !availability[name]);

    if (missing.length === 0) {
      return { text: 'Bridge: pronta', mode: 'ok' as const };
    }
    return {
      text: `Bridge: parcial (${missing.join(', ')})`,
      mode: 'warn' as const,
    };
  }, [sdk, logs.length]);

  useDTunnelEvent('vpnState', (event) => {
    setVpnState(event.payload);
  });

  useDTunnelEvent('nativeEvent', (event) => {
    bumpMetric('events');
    setLastEvent(`Ultimo evento: ${event.callbackName}`);
    appendLog('EVENT', event.callbackName, event.payload);
  });

  useDTunnelEvent('newDefaultConfig', () => {
    setLastEvent('Ultimo evento: newDefaultConfig');
  });

  useDTunnelError((event) => {
    bumpMetric('errors');
    setLastEvent(`Ultimo erro: ${event.error.code}`);
    appendLog('SDK_ERROR', event.error.message, event.error.details);
  });

  function bumpMetric(name: keyof MetricState) {
    setMetrics((prev) => ({
      ...prev,
      [name]: prev[name] + 1,
    }));
  }

  function appendLog(type: string, message: string, data?: unknown) {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        type,
        message,
        data,
      },
    ]);
  }

  function runCall<T>(label: string, fn: () => T): T {
    bumpMetric('calls');
    const result = fn();
    appendLog('CALL', label, result);
    return result;
  }

  function runCallVoid(label: string, fn: () => void) {
    bumpMetric('calls');
    fn();
    appendLog('CALL', label);
  }

  function clearOutput() {
    setLogs([
      {
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: 'Output limpo',
      },
    ]);
  }

  async function copySnapshot() {
    const snapshot = JSON.stringify(sdk.createDebugSnapshot(), null, 2);
    if (!navigator.clipboard?.writeText) {
      appendLog('WARN', 'Clipboard API indisponivel neste ambiente');
      return;
    }

    try {
      await navigator.clipboard.writeText(snapshot);
      appendLog('INFO', 'Debug snapshot copiado para a area de transferencia');
    } catch (error) {
      appendLog('ERROR', 'Falha ao copiar snapshot', String(error));
    }
  }

  return (
    <div className="shell">
      <section className="panel hero">
        <h1>DTunnel SDK Console - React + TypeScript</h1>
        <p>
          Exemplo completo com <code>DTunnelSDKProvider</code>,
          {' '}
          hooks React e painel de diagnostico para WebView.
        </p>

        <div className="status-row">
          <span className="chip ok">{`SDK: pronto (v${sdk.version})`}</span>
          <span className={`chip ${bridgeStatus.mode}`}>{bridgeStatus.text}</span>
          <span className="chip">{`VPN: ${vpnState ?? 'desconhecido'}`}</span>
          <span
            className={`chip ${lastEvent.startsWith('Ultimo erro') ? 'error' : 'accent'}`}
          >
            {lastEvent}
          </span>
        </div>

        <div className="metrics">
          <article className="metric">
            <label>Chamadas</label>
            <strong>{metrics.calls}</strong>
          </article>
          <article className="metric">
            <label>Eventos</label>
            <strong>{metrics.events}</strong>
          </article>
          <article className="metric">
            <label>Erros</label>
            <strong>{metrics.errors}</strong>
          </article>
        </div>
      </section>

      <section className="panel">
        <h2>Operacoes Rapidas</h2>
        <div className="button-grid">
          <button
            onClick={() => {
              const state = runCall('sdk.main.getVpnState()', () =>
                sdk.main.getVpnState(),
              );
              setVpnState(state);
            }}
          >
            sdk.main.getVpnState()
          </button>

          <button
            onClick={() => {
              runCallVoid('sdk.main.startVpn()', () => sdk.main.startVpn());
            }}
          >
            sdk.main.startVpn()
          </button>

          <button
            onClick={() => {
              runCallVoid('sdk.main.stopVpn()', () => sdk.main.stopVpn());
            }}
          >
            sdk.main.stopVpn()
          </button>

          <button
            onClick={() => {
              runCallVoid('sdk.config.openConfigDialog()', () =>
                sdk.config.openConfigDialog(),
              );
            }}
          >
            sdk.config.openConfigDialog()
          </button>

          <button
            onClick={() => {
              runCallVoid('sdk.main.showMenuDialog()', () =>
                sdk.main.showMenuDialog(),
              );
            }}
          >
            sdk.main.showMenuDialog()
          </button>

          <button
            onClick={() => {
              runCallVoid('sdk.main.showLoggerDialog()', () =>
                sdk.main.showLoggerDialog(),
              );
            }}
          >
            sdk.main.showLoggerDialog()
          </button>

          <button
            onClick={() => {
              runCall('sdk.config.getConfigs()', () => sdk.config.getConfigs());
            }}
          >
            sdk.config.getConfigs()
          </button>

          <button
            onClick={() => {
              runCall('sdk.config.getDefaultConfig()', () =>
                sdk.config.getDefaultConfig(),
              );
            }}
          >
            sdk.config.getDefaultConfig()
          </button>

          <button
            onClick={() => {
              runCall('sdk.main.getLogs()', () => sdk.main.getLogs());
            }}
          >
            sdk.main.getLogs()
          </button>

          <button
            onClick={() => {
              runCallVoid('sdk.main.startCheckUser()', () =>
                sdk.main.startCheckUser(),
              );
            }}
          >
            sdk.main.startCheckUser()
          </button>

          <button
            onClick={() => {
              runCallVoid('sdk.main.startAppUpdate()', () =>
                sdk.main.startAppUpdate(),
              );
            }}
          >
            sdk.main.startAppUpdate()
          </button>

          <button
            onClick={() => {
              runCall('sdk.android.getAppVersion()', () =>
                sdk.android.getAppVersion(),
              );
            }}
          >
            sdk.android.getAppVersion()
          </button>

          <button
            onClick={() => {
              runCall('sdk.android.getNetworkData()', () =>
                sdk.android.getNetworkData(),
              );
            }}
          >
            sdk.android.getNetworkData()
          </button>

          <button
            onClick={() => {
              runCall('sdk.createDebugSnapshot()', () =>
                sdk.createDebugSnapshot(),
              );
            }}
          >
            sdk.createDebugSnapshot()
          </button>

          <button
            onClick={() => {
              appendLog(
                'INFO',
                'Bridge status atualizado',
                sdk.getBridgeAvailability(),
              );
            }}
          >
            Atualizar status da bridge
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Operacoes Avancadas</h2>

        <div className="input-grid">
          <div className="field">
            <label htmlFor="inputAppConfigKey">App Config Key</label>
            <input
              id="inputAppConfigKey"
              value={appConfigKey}
              onChange={(event) => setAppConfigKey(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="inputExternalUrl">External URL</label>
            <input
              id="inputExternalUrl"
              value={externalUrl}
              onChange={(event) => setExternalUrl(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="inputTranslate">Texto para traduzir</label>
            <input
              id="inputTranslate"
              value={translateLabel}
              onChange={(event) => setTranslateLabel(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="inputActionValue">Action Handler</label>
            <input
              id="inputActionValue"
              value={actionValue}
              onChange={(event) => setActionValue(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="inputNotifyTitle">Notification Title</label>
            <input
              id="inputNotifyTitle"
              value={notifyTitle}
              onChange={(event) => setNotifyTitle(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="inputNotifyMessage">Notification Message</label>
            <input
              id="inputNotifyMessage"
              value={notifyMessage}
              onChange={(event) => setNotifyMessage(event.target.value)}
            />
          </div>
        </div>

        <div className="button-grid">
          <button
            onClick={() => {
              const key = appConfigKey.trim() || 'support_url';
              runCall(`sdk.app.getAppConfig("${key}")`, () =>
                sdk.app.getAppConfig(key),
              );
            }}
          >
            sdk.app.getAppConfig(key)
          </button>

          <button
            onClick={() => {
              const url = externalUrl.trim() || 'https://dtunnel.com';
              runCallVoid(`sdk.android.openExternalUrl("${url}")`, () =>
                sdk.android.openExternalUrl(url),
              );
            }}
          >
            sdk.android.openExternalUrl(url)
          </button>

          <button
            onClick={() => {
              const label = translateLabel.trim() || 'vpn_connected';
              runCall(`sdk.text.translate("${label}")`, () =>
                sdk.text.translate(label),
              );
            }}
          >
            sdk.text.translate(label)
          </button>

          <button
            onClick={() => {
              const title = notifyTitle.trim() || 'DTunnel SDK';
              const message = notifyMessage.trim() || 'Mensagem de teste';
              runCallVoid('sdk.android.sendNotification(...)', () =>
                sdk.android.sendNotification(title, message, null),
              );
            }}
          >
            sdk.android.sendNotification(...)
          </button>

          <button
            onClick={() => {
              const value = actionValue.trim() || 'CDN_UPDATE';
              runCallVoid(`sdk.android.handleAction("${value}")`, () =>
                sdk.android.handleAction(value as DTunnelAction | (string & {})),
              );
            }}
          >
            sdk.android.handleAction(value)
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Output</h2>
        <div className="toolbar">
          <button onClick={clearOutput}>Limpar output</button>
          <button onClick={() => void copySnapshot()}>
            Copiar debug snapshot
          </button>
        </div>
        <pre className="log">
          {logs
            .map((entry) => {
              const suffix =
                entry.data === undefined ? '' : ` ${safeStringify(entry.data)}`;
              return `[${entry.timestamp}] [${entry.type}] ${entry.message}${suffix}`;
            })
            .join('\n')}
        </pre>
      </section>
    </div>
  );
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
