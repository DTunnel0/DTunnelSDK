import { useMemo, useState } from 'react';
import {
  useDTunnelError,
  useDTunnelEvent,
  useDTunnelSDK,
} from 'dtunnel-sdk/react';
import type {
  DTunnelBridgeObjectName,
  DTunnelVPNState,
} from 'dtunnel-sdk';

type LogItem = {
  timestamp: string;
  type: string;
  message: string;
  data?: unknown;
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
  const [logs, setLogs] = useState<LogItem[]>([
    {
      timestamp: new Date().toISOString(),
      type: 'INFO',
      message: `SDK inicializado (v${sdk.version})`,
    },
  ]);

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
  }, [sdk]);

  useDTunnelEvent('vpnState', (event) => {
    setVpnState(event.payload);
    appendLog('EVENT', 'vpnState', event.payload);
  });

  useDTunnelEvent('nativeEvent', (event) => {
    appendLog('EVENT', event.callbackName, event.payload);
  });

  useDTunnelError((event) => {
    appendLog('SDK_ERROR', event.error.message, event.error.details);
  });

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

  return (
    <div className="layout">
      <section className="card">
        <h1>DTunnel SDK - React + TypeScript</h1>
        <p>
          Exemplo completo com provider/hooks do pacote
          {' '}
          <code>dtunnel-sdk/react</code>.
        </p>
        <div className="pills">
          <span className="pill ok">{`SDK: pronto (v${sdk.version})`}</span>
          <span className={`pill ${bridgeStatus.mode}`}>{bridgeStatus.text}</span>
          <span className="pill">{`VPN: ${vpnState ?? 'desconhecido'}`}</span>
        </div>
      </section>

      <section className="card">
        <h2>Acoes</h2>
        <div className="grid">
          <button
            onClick={() => {
              const state = sdk.main.getVpnState();
              setVpnState(state);
              appendLog('CALL', 'sdk.main.getVpnState()', state);
            }}
          >
            sdk.main.getVpnState()
          </button>

          <button
            onClick={() => {
              sdk.main.startVpn();
              appendLog('CALL', 'sdk.main.startVpn()');
            }}
          >
            sdk.main.startVpn()
          </button>

          <button
            onClick={() => {
              sdk.main.stopVpn();
              appendLog('CALL', 'sdk.main.stopVpn()');
            }}
          >
            sdk.main.stopVpn()
          </button>

          <button
            onClick={() => {
              appendLog('CALL', 'sdk.config.getConfigs()', sdk.config.getConfigs());
            }}
          >
            sdk.config.getConfigs()
          </button>

          <button
            onClick={() => {
              appendLog(
                'CALL',
                'sdk.config.getDefaultConfig()',
                sdk.config.getDefaultConfig(),
              );
            }}
          >
            sdk.config.getDefaultConfig()
          </button>

          <button
            onClick={() => {
              appendLog('CALL', 'sdk.main.getLogs()', sdk.main.getLogs());
            }}
          >
            sdk.main.getLogs()
          </button>

          <button
            onClick={() => {
              appendLog(
                'CALL',
                'sdk.android.getNetworkData()',
                sdk.android.getNetworkData(),
              );
            }}
          >
            sdk.android.getNetworkData()
          </button>

          <button
            onClick={() => {
              appendLog(
                'DEBUG',
                'sdk.createDebugSnapshot()',
                sdk.createDebugSnapshot(),
              );
            }}
          >
            sdk.createDebugSnapshot()
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Output</h2>
        <pre className="log">
          {logs
            .map((entry) => {
              const suffix =
                entry.data === undefined
                  ? ''
                  : ` ${safeStringify(entry.data)}`;
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
