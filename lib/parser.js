import { writeFileSync } from 'fs';
import { CONFIG } from './config';

function toGradescopeTest(assert) {
  return {
    score: assert.passed ? assert.weight : 0,
    max_score: assert.weight,
    name: assert.test_name,
    output: JSON.stringify(assert, null, 4),
  };
}

function parseHeaders(arr) {
  const headers = {};
  arr.forEach((header) => {
    headers[header.key] = header.value;
  });
  return headers;
}

function constructURL(parts) {
  const url = new URL(`${parts.protocol}://${parts.host.join('.')}`);
  url.pathname = parts.path.join('/');
  return decodeURI(url.href);
}

function toGradescopeOutput(assertions) {
  const tests = [];
  assertions.forEach((assert) => tests.push(toGradescopeTest(assert)));

  return { ...CONFIG.output_props, tests };
}

function parseAssertsFromExecutions(executions) {
  const asserts = [];

  executions.forEach((exec) => {
    exec.assertions.forEach((assert) => {
      const weight = assert.assertion.match(CONFIG.weight_regex);
      if (weight) {
        asserts.push({
          test_name: assert.assertion,
          weight: Number(weight[1]),
          request_name: exec.item.name,
          request_url: constructURL(exec.request.url),
          request_method: exec.request.method,
          request_body: exec.request.body ? exec.request.body.raw : null,
          request_headers: parseHeaders(exec.request.headers.members),
          response_code: exec.response.code,
          response_body: exec.response.stream.toString(),
          response_headers: parseHeaders(exec.response.headers.members),
          passed: assert.error === undefined,
          error: assert.error,
        });
      }
    });
    return exec.assertions;
  });

  return asserts;
}

export default function newmanToGradescope(summary) {
  const gradescopeOutput = toGradescopeOutput(parseAssertsFromExecutions(summary.run.executions));
  writeFileSync('/autograder/results/results.json', JSON.stringify(gradescopeOutput, null, 4));
}
