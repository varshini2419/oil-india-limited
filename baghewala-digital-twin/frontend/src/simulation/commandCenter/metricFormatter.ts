export function formatMetricNumber(
  val: number | undefined | null,
  decimals: number = 1,
  fallback: string = 'NOT_AVAILABLE'
): string {
  if (val === undefined || val === null || !Number.isFinite(val)) {
    return fallback;
  }
  return val.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatMetricWithUnit(
  val: number | undefined | null,
  unit: string,
  decimals: number = 1,
  fallback: string = 'NOT_AVAILABLE'
): string {
  const formatted = formatMetricNumber(val, decimals, fallback);
  if (formatted === fallback) return fallback;
  return `${formatted} ${unit}`;
}
