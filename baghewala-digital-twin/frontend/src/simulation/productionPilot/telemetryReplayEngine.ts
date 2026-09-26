import type { ReplayEngineState, PilotScenarioConfig } from './types';

export class PilotTelemetryReplayEngine {
  private isPlaying = false;
  private currentFrameIndex = 0;
  private totalFrames = 50;
  private replaySpeed = 1.0;
  private timestamps: string[] = [];

  constructor(totalFrames = 50) {
    this.totalFrames = totalFrames;
    this.initTimestamps();
  }

  private initTimestamps() {
    const base = new Date('2026-09-26T12:00:00Z').getTime();
    this.timestamps = Array.from({ length: this.totalFrames }, (_, i) => {
      return new Date(base + i * 3600 * 1000).toISOString();
    });
  }

  public start() {
    this.isPlaying = true;
  }

  public pause() {
    this.isPlaying = false;
  }

  public reset() {
    this.isPlaying = false;
    this.currentFrameIndex = 0;
  }

  public stepForward(): number {
    if (this.currentFrameIndex < this.totalFrames - 1) {
      this.currentFrameIndex++;
    } else {
      this.isPlaying = false;
    }
    return this.currentFrameIndex;
  }

  public setReplaySpeed(speed: number) {
    if (speed > 0) this.replaySpeed = speed;
  }

  public getCurrentTimestamp(): string {
    return this.timestamps[this.currentFrameIndex] || new Date().toISOString();
  }

  public getState(): ReplayEngineState {
    return {
      isPlaying: this.isPlaying,
      currentFrameIndex: this.currentFrameIndex,
      totalFrames: this.totalFrames,
      replaySpeed: this.replaySpeed,
      currentTimestamp: this.getCurrentTimestamp(),
    };
  }

  public loadScenarioFrame(_scenario: PilotScenarioConfig, frameIndex: number) {
    this.currentFrameIndex = Math.max(0, Math.min(frameIndex, this.totalFrames - 1));
  }
}
