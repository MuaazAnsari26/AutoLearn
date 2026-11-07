/**
 * Utility formatting helpers for AutoLearn UI.
 */

export function formatMetric(val, isPercentage = false) {
  if (val === null || val === undefined || isNaN(val)) {
    return 'N/A';
  }
  if (isPercentage) {
    return `${(val * 100).toFixed(1)}%`;
  }
  return typeof val === 'number' ? val.toFixed(3) : String(val);
}

export function displayString(s) {
  if (s === '' || s === null || s === undefined) {
    return 'ε (empty string)';
  }
  return s;
}

export function formatTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).format(date);
}

