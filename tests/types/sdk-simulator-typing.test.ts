import {
  BRIDGE_OBJECT_NAMES,
  createDTunnelSDKSimulator,
  installDTunnelSDKSimulator,
  type DTunnelSDKSimulatorCallRecord,
} from '../../sdk/dtunnel-sdk.simulator.js';

const simulator = createDTunnelSDKSimulator({
  autoEvents: true,
});

simulator.install();
simulator.emit('vpnState', 'CONNECTED');
simulator.emit('DtNewLogEvent');
simulator.setImplementation('DtGetVpnState', 'execute', () => 'AUTH');

const calls: DTunnelSDKSimulatorCallRecord[] = simulator.getCalls();
const bridgeNames: readonly string[] = BRIDGE_OBJECT_NAMES;
const installed: boolean = simulator.isInstalled();
const blockedByWebView: boolean = simulator.isBlockedByWebView();

void calls;
void bridgeNames;
void installed;
void blockedByWebView;

simulator.setState({ vpnState: 'CONNECTED' });

// @ts-expect-error estado de VPN invalido.
simulator.setState({ vpnState: 'INVALID_STATE' });

// @ts-expect-error nome de evento semantico invalido.
simulator.emit('vpnStateInvalid', 'CONNECTED');

simulator.uninstall();

const installedSimulator = installDTunnelSDKSimulator();
installedSimulator.uninstall();
