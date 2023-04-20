# How to use the OpenTelemetry auto-instrumentations-node (meta packages) with a Basic Express application exporting to OTELCOL

## Create a project

```shell
mkdir example
npm init -y
```
## Install the required dependencies

```shell
npm install @opentelemetry/api \
@opentelemetry/auto-instrumentations-node \
@opentelemetry/exporter-trace-otlp-http \
@opentelemetry/resources \
@opentelemetry/sdk-trace-node \
@opentelemetry/semantic-conventions \
express
```
## Use this code for traces

Create a file `otel.ts`

```ts
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
  NodeTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.npm_package_name,
});

const exporter = new OTLPTraceExporter();

const provider = new NodeTracerProvider({ resource: resource });
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

registerInstrumentations({
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {},
      '@opentelemetry/instrumentation-express': {},
    }),
  ],
  tracerProvider: provider,
});
```
## Update the package.json to require the trace code

```json
"scripts": {
  "start": "NODE_OPTIONS='--require ./dist/otel.js' node dist/server.js",
}
```
## Run this example

```shell
git clone https://github.com/obs-nebula/gamma-ray.git
cd gamma-ray/traces/03
npm install
npm run build
npm start
```
Open a new terminal and run

```shell
docker-compose up
```
Open a new terminal and run
```shell
curl localhost:8080
```
