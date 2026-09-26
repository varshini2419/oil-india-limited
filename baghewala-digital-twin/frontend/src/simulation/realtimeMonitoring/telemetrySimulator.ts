import type { DigitalTwinState, TelemetrySimulatorState, TelemetryConfig } from './types';
import type { ModelMode } from '../historicalCalibration/types';
import { DEFAULT_TELEMETRY_CONFIG, MONITORING_BOUNDS } from './defaults';
import { estimateDigitalTwinState } from './stateEstimator';

import type { ScenarioInputValues } from '../scenario/types';

export class TelemetrySimulator {
  private currentState: DigitalTwinState;
  private simulatorState: TelemetrySimulatorState = 'STOPPED';
  private stepCount = 0;
  private config: TelemetryConfig;
  private listeners: Set<(state: DigitalTwinState) => void> = new Set();
  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<TelemetryConfig> = {}) {
    this.config = { ...DEFAULT_TELEMETRY_CONFIG, ...config };
    this.currentState = estimateDigitalTwinState(this.config.baseInputs || {}, this.config.modelMode);
  }

  public getSimulatorState(): TelemetrySimulatorState {
    return this.simulatorState;
  }

  public getCurrentState(): DigitalTwinState {
    return this.currentState;
  }

  public setModelMode(mode: ModelMode): void {
    this.config.modelMode = mode;
    this.recalculateCurrentState();
  }

  public setBaseInputs(baseInputs?: ScenarioInputValues): void {
    this.config.baseInputs = baseInputs;
    this.recalculateCurrentState();
  }

  public subscribe(listener: (state: DigitalTwinState) => void): () => void {
    this.listeners.add(listener);
    // Notify subscriber immediately with current state
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.currentState);
    }
  }

  public start(intervalMs?: number): void {
    if (this.simulatorState === 'RUNNING') return;
    this.simulatorState = 'RUNNING';
    const actualInterval = intervalMs || this.config.updateIntervalMs;

    this.stopTimer();
    this.timerId = setInterval(() => {
      this.stepForward();
    }, actualInterval);
  }

  public pause(): void {
    this.simulatorState = 'PAUSED';
    this.stopTimer();
    this.notifyListeners();
  }

  public reset(): void {
    this.stopTimer();
    this.simulatorState = 'STOPPED';
    this.stepCount = 0;
    this.currentState = estimateDigitalTwinState(this.config.baseInputs || {}, this.config.modelMode);
    this.notifyListeners();
  }

  public stepForward(): DigitalTwinState {
    this.stepCount += 1;

    // Generate smooth deterministic physical trend sequence using sine/cosine curves
    const t = this.stepCount * 0.1;
    const seed = this.config.seed;

    // Smooth subtle physical variations around baseline
    const tempDelta = Math.sin(t * 0.5 + seed) * 3.5; // ±3.5°C thermal variation
    const steamDelta = Math.cos(t * 0.3 + seed) * 15.0; // ±15 TPD steam fluctuation
    const vfdDelta = Math.sin(t * 0.2 + seed) * 2.0; // ±2 Hz VFD variation

    const baseTemp = this.config.baseInputs?.reservoirTemperatureC ?? 48.0;
    const baseSteam = this.config.baseInputs?.steamInjectionRateTpd ?? 80.0;
    const baseVfd = this.config.baseInputs?.vfdFrequencyHz ?? 50.0;
    const baseSpm = this.config.baseInputs?.spm ?? 8.0;
    const baseStroke = this.config.baseInputs?.strokeLengthMeters ?? 2.5;

    const targetTemp = Math.min(
      MONITORING_BOUNDS.maxTemperatureC,
      Math.max(MONITORING_BOUNDS.minTemperatureC, baseTemp + tempDelta)
    );

    const targetSteam = Math.min(
      MONITORING_BOUNDS.maxSteamRateTpd,
      Math.max(MONITORING_BOUNDS.minSteamRateTpd, baseSteam + steamDelta)
    );

    const targetVfd = Math.min(
      MONITORING_BOUNDS.maxVfdHz,
      Math.max(MONITORING_BOUNDS.minVfdHz, baseVfd + vfdDelta)
    );

    const timeOffsetMs = this.stepCount * (this.config.updateIntervalMs || 2000);
    const timestampStr = new Date(Date.now() + timeOffsetMs).toISOString();

    this.currentState = estimateDigitalTwinState(
      {
        ...this.config.baseInputs,
        reservoirTemperatureC: targetTemp,
        steamInjectionRateTpd: targetSteam,
        vfdFrequencyHz: targetVfd,
        spm: baseSpm,
        strokeLengthMeters: baseStroke,
      },
      this.config.modelMode,
      timestampStr
    );

    this.notifyListeners();
    return this.currentState;
  }

  private recalculateCurrentState(): void {
    this.currentState = estimateDigitalTwinState(
      {
        ...this.config.baseInputs,
        reservoirTemperatureC: this.currentState.reservoir.reservoirTemperatureC,
        steamInjectionRateTpd: this.currentState.css.steamInjectionRateTpd,
        vfdFrequencyHz: this.currentState.srp.vfdFrequencyHz,
        spm: this.currentState.srp.spm,
        strokeLengthMeters: this.currentState.srp.strokeLengthMeters,
      },
      this.config.modelMode,
      this.currentState.timestamp
    );
    this.notifyListeners();
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public destroy(): void {
    this.stopTimer();
    this.listeners.clear();
  }
}
