import { run } from 'newman';
import { RUN_OPTIONS, REQUIRED_FILES } from './lib/config.js';
import { checkSubmittedFiles, writeMissingFiles } from './lib/files.js';
import newmanToGradescope from './lib/parser.js';

const missingFiles = checkSubmittedFiles(REQUIRED_FILES);

// Make sure all required files are submitted
if (missingFiles.length) {
  writeMissingFiles(missingFiles);
} else {
  // Run the collection in Newman
  // Change run options in lib/config.js
  run(RUN_OPTIONS, (err, summary) => {
    if (err) { throw err; }

    // Parse results to Gradescope output
    newmanToGradescope(summary);
  });
}
