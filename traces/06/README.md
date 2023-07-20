# How to restrict the amount of traces that are generated from an Express application deployed to OpenShift using sampling

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
## Configure OTELCOL operator + Jaeger operator

Make sure to install OpenShift Local and the Operators. For this you can follow the instructions [here](https://github.com/obs-nebula/gamma-ray/blob/main/traces/01/README.md).

Create a project called `example` and apply the custom resources.

```shell
oc new-project example
oc create -f jaeger.yml
oc create -f collector.yml
```
## Deploy this example

```shell
# Create a new app using ubi8/nodejs-18, pointing to this specific example and setting the OTELCOL endpoint
oc new-app registry.access.redhat.com/ubi8/nodejs-18~https://github.com/obs-nebula/gamma-ray --context-dir=/traces/06 -e OTEL_EXPORTER_OTLP_ENDPOINT='http://otel-collector.example.svc:4318'

# Watch the build
oc logs -f buildconfig/gamma-ray

# Expose the example
oc expose service/gamma-ray
```
## Sampling

```shell
➜  ~ oc set env deployment/gamma-ray OTEL_TRACES_SAMPLER="traceidratio"
deployment.apps/check-traces updated
➜  ~ oc set env deployment/gamma-ray OTEL_TRACES_SAMPLER_ARG="0.1"
deployment.apps/check-traces updated
```

Then you can change the values where 0.1 means 10%, 0.2 means 20% and so on...

```shell
➜  ~ oc set env deployment/gamma-ray OTEL_TRACES_SAMPLER_ARG="0.2"
deployment.apps/check-traces updated
```