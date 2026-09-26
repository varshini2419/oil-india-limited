import type { SystemVerificationSummary, SuiteVerificationItem } from './types';
import { DEFAULT_VERIFIED_SUITES } from './defaults';

export function evaluateSystemVerification(customSuites?: SuiteVerificationItem[]): SystemVerificationSummary {
  const suites = customSuites ?? DEFAULT_VERIFIED_SUITES;

  let totalTestCount = 0;
  let totalPassedCount = 0;
  let totalFailedCount = 0;
  let overallBuildStatus: 'PASS' | 'FAIL' = 'PASS';
  let hasFailures = false;
  let hasNotRun = false;

  suites.forEach((s) => {
    totalTestCount += s.testCount;
    totalPassedCount += s.passed;
    totalFailedCount += s.failed;
    if (s.failed > 0 || s.buildStatus === 'FAIL') {
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
    totalTestCount,
    totalPassedCount,
    totalFailedCount,
    overallBuildStatus,
    overallVerificationStatus,
  };
}
