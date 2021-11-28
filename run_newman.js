import { writeFileSync } from 'fs';
import { run } from 'newman';
import collection from './collection.json';
import environment from './environment.json';

const WEIGHT_REGEX = /\(\s*([\d.]*)\s*pts?\)/;
const TEST_VISIBILITY = 'visible'; // ['hidden', 'after_due_date', 'after_published', 'visible']
const STDOUT_VISIBILITY = 'hidden'; // ['hidden', 'after_due_date', 'after_published', 'visible']

function toGradescopeTest(assert) {
  return {
    score: assert.passed ? assert.weight : 0,
    max_score: assert.weight,
    name: assert.test_name,
    output: JSON.stringify(assert, null, 4),
  };
}

function toGradescopeOutput(assertions) {
  const tests = [];
  assertions.forEach((assert) => tests.push(toGradescopeTest(assert)));

  return {
    visibility: TEST_VISIBILITY, // Optional visibility setting
    stdout_visibility: STDOUT_VISIBILITY, // Optional stdout visibility setting
    tests,
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

function parseAssertsFromExecutions(executions) {
  const asserts = [];

  executions.forEach((exec) => {
    exec.assertions.forEach((assert) => {
      const weight = assert.assertion.match(WEIGHT_REGEX);
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

function newmanCallback(err, summary) {
  if (err) { throw err; }

  const executions = summary.run.executions.filter((exec) => 'assertions' in exec);
  // fs.writeFileSync('executions.json', JSON.stringify(executions, null, 4));

  const asserts = parseAssertsFromExecutions(executions);
  // fs.writeFileSync('asserts.json', JSON.stringify(asserts, null, 4));

  const gradescopeOutput = toGradescopeOutput(asserts);
  writeFileSync('/autograder/results/results.json', JSON.stringify(gradescopeOutput, null, 4));
}

// https://github.com/postmanlabs/newman#api-reference
run({
  collection, // Collection file
  environment, // Environment file
  reporters: 'cli', // Optional
  timeoutRequest: 15000, // Request timeout (ms)
  timeoutScript: 15000, // Script timeout (ms)
  ignoreRedirects: true, // Don't automatically follow redirects
  delayRequest: 1000, // Delay between requests (ms)
}, newmanCallback);
