import collection from '../collection.json';
import environment from '../environment.json';

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
  output_props: {
    test_visibility: 'visible', // ['visible', 'hidden', 'after_due_date', 'after_published']
    stdout_visibility: 'hidden', // ['visible', 'hidden', 'after_due_date', 'after_published']
  },
};
