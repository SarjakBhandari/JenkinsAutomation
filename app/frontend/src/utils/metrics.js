const METRICS_ENDPOINT = 'http://localhost:5050/metrics-client'; // backend route to receive metrics

export function recordFrontendMetric(name, value, labels = {}) {
  const payload = {
    metric: name,
    value,
    labels,
    timestamp: Date.now()
  };

  fetch(METRICS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(err => console.error('Metric push failed:', err));
}
