import { run } from 'newman';
import { RUN_OPTIONS } from './lib/config';
import newmanToGradescope from './lib/parser';

// Run the collection in Newman
// Change run options in lib/config.js
run(RUN_OPTIONS, (err, summary) => {
  if (err) { throw err; }

  // Parse results to Gradescope output
  newmanToGradescope(summary);
});
