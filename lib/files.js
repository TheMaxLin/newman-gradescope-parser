import { existsSync, writeFileSync } from 'fs';
import { CONFIG } from './config.js';

const SUBMISSION_BASE = '/autograder/submission/';

export function checkSubmittedFiles(paths, base = SUBMISSION_BASE) {
  const missingFiles = paths.filter((path) => !existsSync(base + path));
  return missingFiles;
}

export function writeMissingFiles(paths) {
  const tests = [{ score: 0, name: 'Check submitted files.', output: `Missing files in submission: ${paths}` }];
  const gradescopeOutput = { ...CONFIG.output_props, tests };
  writeFileSync('/autograder/results/results.json', JSON.stringify(gradescopeOutput, null, 4));
}
