import { writeFileSync } from 'fs';
import { CONFIG } from './config.js';

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

function constructURL({ protocol, host, path }) {
  const url = new URL(`${protocol}://${host.join('.')}`);
  url.pathname = path.join('/');
  return decodeURI(url.href);
}

function toGradescopeOutput(assertions) {
  const tests = assertions.map((assert) => toGradescopeTest(assert));

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
  // Get all executions that contain assertions
  const executions = summary.run.executions.filter((exec) => 'assertions' in exec);

  // Filter and parse list of assertions needed for grading
  const asserts = parseAssertsFromExecutions(executions);

  // Generate Gradescope results
  const gradescopeOutput = toGradescopeOutput(asserts);
  writeFileSync('/autograder/results/results.json', JSON.stringify(gradescopeOutput, null, 4));
}
