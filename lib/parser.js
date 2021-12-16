import { writeFileSync } from 'fs';
import { CONFIG } from './config.js';

/**
 * Convert assertion data into Gradescope result format.
 * @param {Object} assert - Data from a single assertion.
 * @returns {Object} - Gradescope test result.
 */
function toGradescopeTest(assert) {
  return {
    score: assert.passed ? assert.weight : 0,
    max_score: assert.weight,
    name: `${assert.request_name}: ${assert.test_name}`,
    output: JSON.stringify(assert, CONFIG.test_output_fields, 4),
  };
}

/**
 * Convert Newman header data to simple key:value pairs.
 * @param {Array} arr - An array of header data from Newman.
 * @returns {Object} - An object with header name/value as key:value pairs.
 */
function parseHeaders(arr) {
  const headers = {};
  arr.forEach((header) => {
    headers[header.key] = header.value;
  });
  return headers;
}

/**
 * Construct a full URI decoded URL string from separate parts of a URL.
 * @param {Object} URL - The parts of a URL.
 * @param {String} URL.protocol - The protocol of the URL.
 * @param {String} URL.host - The host of the URL.
 * @param {String} URL.path - The path of the URL.
 * @returns {String} - A URI decoded fully constructed URL.
 */
function constructURL({ protocol, host, path }) {
  const url = new URL(`${protocol}://${host.join('.')}`);
  url.pathname = path.join('/');
  return decodeURI(url.href);
}

/**
 * Convert assertion data into an object in Gradescope format that is ready to be output into JSON.
 * @param {Array<Object>} assertions - The parsed assertion data from Newman.
 * @returns {Object} - Output for Gradescope ready to be written to JSON.
 */
function toGradescopeOutput(assertions) {
  const tests = assertions.map((assert) => toGradescopeTest(assert));

  return { ...CONFIG.output_props, tests };
}

/**
 * Parse assertion data from each execution. Each execution should have at least one assertion.
 * @param {Array<Object>} executions - Data on executions from Newman summary.
 * @returns {Array<Object>} - Objects containing data on each individual assertion.
 */
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

/**
 * Output Gradescope results JSON file from Newman summary data. Point values are parsed from
 * assertion names.
 * @param {Object} summary - Newman results summary data.
 */
export default function newmanToGradescope(summary) {
  // Get all executions that contain assertions
  const executions = summary.run.executions.filter((exec) => 'assertions' in exec);

  // Filter and parse list of assertions needed for grading
  const asserts = parseAssertsFromExecutions(executions);

  // Generate Gradescope results
  const gradescopeOutput = toGradescopeOutput(asserts);
  writeFileSync('/autograder/results/results.json', JSON.stringify(gradescopeOutput, null, 4));
}
