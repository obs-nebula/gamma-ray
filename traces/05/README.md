# How to enable/disable OTEL-JS traces from an Express application

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
@opentelemetry/sdk-node \
@opentelemetry/semantic-conventions \
express
```
## Use this code for traces

Create a file `otel.ts`

```ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { error } from 'console';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const exporter = new OTLPTraceExporter();

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.npm_package_name,
});

const sdk = new NodeSDK({
  traceExporter: exporter,
  resource: resource,
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});

try {
  sdk.start();
} catch (err) {
  error(err);
}
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
cd gamma-ray/traces/05
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

Enable / Disable traces

Stop the example and run

```shell
# fish - disable
set -x OTEL_SDK_DISABLED true
# fish - enable
set -x OTEL_SDK_DISABLED false
# bash - disable
OTEL_SDK_DISABLED=true
# bash - enable
OTEL_SDK_DISABLED=false
```
Then run the example again