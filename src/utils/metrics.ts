import { Counter, Histogram, Registry } from 'prom-client';

const register = new Registry();

// Example Counter metric
const requestCount = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// Example Histogram metric
const requestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5], // Customize as needed
});

// Register metrics
register.registerMetric(requestCount);
register.registerMetric(requestDuration);

// Export metrics and registry
export { register, requestCount, requestDuration };
