export async function recordMetric({ event, value, context = {} }) {
  try {
    await fetch('http://localhost:5050/metrics-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        value,
        context,
      }),
    });
  } catch (err) {
    console.warn(`[metrics] Failed to push: ${err.message}`);
  }
}
