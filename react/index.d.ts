import type { Context, ReactElement, ReactNode } from 'react';
import type {
  DTunnelAnyNativeEventEnvelope,
  DTunnelAnySemanticEventEnvelope,
  DTunnelCallbackName,
  DTunnelErrorEvent,
  DTunnelNativeEventByCallback,
  DTunnelSDK,
  DTunnelSDKOptions,
  DTunnelSemanticEventEnvelope,
  DTunnelSemanticEventName,
} from '../sdk/dtunnel-sdk';

export interface DTunnelSDKProviderProps {
  children?: ReactNode;
  sdk?: DTunnelSDK;
  options?: DTunnelSDKOptions;
}

export declare const DTunnelSDKContext: Context<DTunnelSDK | null>;

export declare function DTunnelSDKProvider(
  props: DTunnelSDKProviderProps,
): ReactElement;

export declare function useDTunnelSDK(): DTunnelSDK;

export declare function useDTunnelEvent<E extends DTunnelSemanticEventName>(
  eventName: E,
  listener: (event: DTunnelSemanticEventEnvelope<E>) => void,
): void;

export declare function useDTunnelEvent(
  eventName: 'nativeEvent',
  listener: (event: DTunnelAnySemanticEventEnvelope) => void,
): void;

export declare function useDTunnelEvent<E extends DTunnelCallbackName>(
  eventName: `native:${E}`,
  listener: (event: DTunnelNativeEventByCallback<E>) => void,
): void;

export declare function useDTunnelEvent(
  eventName: `native:${string}`,
  listener: (event: DTunnelAnyNativeEventEnvelope) => void,
): void;

export declare function useDTunnelEvent(
  eventName: 'error',
  listener: (event: DTunnelErrorEvent) => void,
): void;

export declare function useDTunnelEvent(
  eventName: string,
  listener: (event: unknown) => void,
): void;

export declare function useDTunnelNativeEvent(
  listener: (event: DTunnelAnySemanticEventEnvelope) => void,
): void;

export declare function useDTunnelError(
  listener: (event: DTunnelErrorEvent) => void,
): void;
