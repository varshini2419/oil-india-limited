export type SystemStatusType = 'ready' | 'simulating' | 'error' | 'not_initialized' | 'warning';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  description: string;
}

export interface SystemState {
  backendConnected: boolean;
  simulationEngineStatus: 'Not Initialized' | 'Ready' | 'Running';
  dataSource: string;
}
