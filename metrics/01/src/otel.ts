import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

import { NodeSDK, metrics } from '@opentelemetry/sdk-node';
import { error } from 'console';
import { Resource } from '@opentelemetry/resources';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.npm_package_name,
});

const metricsExporter = new OTLPMetricExporter();

const sdk = new NodeSDK({
  metricReader: new metrics.PeriodicExportingMetricReader({
    exporter: metricsExporter,
    exportIntervalMillis: 3000,
  }),
  autoDetectResources: true,
  resource: resource,
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});

try {
  sdk.start();
} catch (err) {
  error(err);
}
