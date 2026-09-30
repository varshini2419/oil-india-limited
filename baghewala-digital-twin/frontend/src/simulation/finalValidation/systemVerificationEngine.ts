import type { SystemVerificationSummary, SuiteVerificationItem } from './types';
import { DEFAULT_VERIFIED_SUITES } from './defaults';

export function evaluateSystemVerification(customSuites?: SuiteVerificationItem[]): SystemVerificationSummary {
  const suites = customSuites ?? DEFAULT_VERIFIED_SUITES;

  let overallBuildStatus: 'PASS' | 'FAIL' = 'PASS';
  let hasFailures = false;
  let hasNotRun = false;

  suites.forEach((s) => {
    if (s.buildStatus === 'FAIL') {
      hasFailures = true;
      overallBuildStatus = 'FAIL';
    }
    if (s.status === 'NOT_RUN' || s.status === 'NOT_AVAILABLE') {
      hasNotRun = true;
    }
  });

  let overallVerificationStatus: 'PASS' | 'PARTIAL' | 'FAIL' | 'NOT_RUN' | 'NOT_AVAILABLE' = 'PASS';

  if (hasFailures) {
    overallVerificationStatus = 'FAIL';
  } else if (hasNotRun) {
    overallVerificationStatus = 'PARTIAL';
  }

  return {
    suites,
    totalTestCount: 0,
    totalPassedCount: 0,
    totalFailedCount: 0,
    overallBuildStatus,
    overallVerificationStatus,
  };
}
