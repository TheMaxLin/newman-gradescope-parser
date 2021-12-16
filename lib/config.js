import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Newman files
const collection = require('../collection.json');
const environment = require('../environment.json');

// Newman run options
// https://github.com/postmanlabs/newman#api-reference
export const RUN_OPTIONS = {
  collection,
  environment,
  reporters: 'cli',
  timeoutRequest: 10000, // Request timeout (ms)
  timeoutScript: 10000, // Script timeout (ms)
  ignoreRedirects: true, // Don't automatically follow redirects
  delayRequest: 1000, // Delay between requests (ms)
};

// Parser configuration
export const CONFIG = {
  weight_regex: /\(\s*([\d.]*)\s*pts?\)/,
  // Gradescope output options
  // Under 'Output Format' at https://gradescope-autograders.readthedocs.io/en/latest/specs/
  output_props: {
    test_visibility: 'visible', // ['visible', 'hidden', 'after_due_date', 'after_published']
    stdout_visibility: 'hidden', // ['visible', 'hidden', 'after_due_date', 'after_published']
  },
  // Properties to display under each Gradescope test
  test_output_fields: [
    'request_name',
    'request_url',
    'request_method',
    'request_body',
    'request_headers',
    'response_code',
    'response_body',
    'response_headers',
    'error',
    'Authorization',
    'Content-Type',
    'Accept',
  ],
};

// Required files for submission
export const REQUIRED_FILES = ['environment.json'];
