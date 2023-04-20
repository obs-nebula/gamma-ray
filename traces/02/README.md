# How to deploy an Express application on OpenShift Local with OTEL-JS Auto-instrumentation + OTELCOL operator + Jaeger operator

## Create a project

```shell
mkdir example
npm init -y
```
## Install the required dependencies

```shell
npm install @opentelemetry/api \
@opentelemetry/instrumentation-express \
@opentelemetry/instrumentation-http \
@opentelemetry/exporter-trace-otlp-http \
@opentelemetry/resources \
@opentelemetry/sdk-trace-node \
@opentelemetry/semantic-conventions \
express
```
## Use this code for traces

Create a file `otel.ts`

```typescript
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
  ConsoleSpanExporter,
  NodeTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.npm_package_name,
});

const provider = new NodeTracerProvider({ resource: resource });
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();

registerInstrumentations({
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
  tracerProvider: provider,
});
```

## Update the package.json to require the trace code

```json
"scripts": {
  "start": "NODE_OPTIONS='--require ./dist/otel.js' node dist/server.js",
}
```

## Configure OTELCOL operator + Jaeger operator

Make sure to install OpenShift Local and the Operators. For this you can follow the instructions [here](https://github.com/obs-nebula/gamma-ray/blob/main/traces/01/README.md).

Create a project called `example` and apply the custom resources.

```shell
oc new-project example
oc create -f jaeger.yml
oc create -f collector.yml
```

### Deploy

```shell
oc new-app registry.access.redhat.com/ubi8/nodejs-18~https://github.com/obs-nebula/gamma-ray --context-dir=/traces/02 -e OTEL_EXPORTER_OTLP_ENDPOINT='http://otel-collector.example.svc:4318'
```

## See the result

Foo Bar XPTO

