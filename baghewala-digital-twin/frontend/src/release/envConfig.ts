import type { EnvironmentConfig, ProductionAppMode } from './types';

export const MANDATORY_RELEASE_DISCLAIMER =
  'Decision support only — no automatic field actuation. This production deployment and release freeze package operates strictly in advisory mode. No automatic control commands are issued to pumps, SRP drives, steam injection boilers, or wellhead valves.';

export const PROJECT_RELEASE_VERSION = 'v1.0.0-release-freeze';

export function getEnvironmentConfig(mode: ProductionAppMode = 'DEMONSTRATION'): EnvironmentConfig {
  const isProd = mode === 'PRODUCTION';
  const isPilot = mode === 'PILOT';

  // Read environment variables safely without leaking secrets
  const apiBaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api';
  const scadaEndpointUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SCADA_ENDPOINT_URL) || 'http://localhost:5000/scada';

  return {
    appMode: mode,
    apiBaseUrl,
    scadaEndpointUrl,
    isRealFieldConnected: false, // Never fake a live connection
    featureFlags: {
      enableRealFieldSCADA: isPilot || isProd,
      enableMonteCarloUncertainty: true,
      enableAIRiskAdvisory: true,
      enableTelemetryReplay: true,
      strictAdvisoryOnlyEnforcement: true,
      telemetryStaleThresholdSeconds: 300,
    },
    disclaimer: MANDATORY_RELEASE_DISCLAIMER,
  };
}
