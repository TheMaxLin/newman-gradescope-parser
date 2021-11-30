# Newman Gradescope Parser

A Gradescope autograder template for API testing. Runs a Postman collection in Newman with student submitted environment file and outputs the results to Gradescope format. Point values are automatically parsed from the name of each Postman test.


## Table of contents

1. [Quick Start](#quick-start)
2. [Usage](#usage)
    1. [Collection](#collection)
    2. [Assigning Point Values](#assigning-point-values)
    3. [Student Submission](#student-submission)
    4. [Configuration](#configuration)
    5. [Build](#build)
3. [Autograder Files](#autograder-files)
4. [To Do](#to-do)


## Quick Start

1. Clone the repository.
2. Add a Postman collection file to root as `collection.json`. See [usage](#usage) for collection requirements.
3. `npm run build` to create `autograder.zip` in the build directory. (Requires `zip`)
4. Upload `autograder.zip` to Gradescope.
5. Have students submit environment file with required variables.


## Usage

### Collection

By default, there should be a Postman/Newman collection file in the root directory named `collection.json`. This can be changed in `lib/config.js`. It should be possible to also use a URL.


### Assigning Point Values

Each Postman test that you want to assign a point value should have the point value within the name of the test. Any tests that have no regex matches will be skipped when parsing grades.

The default format is `(1.1 pts)` or `(1 pt)`. The value must be a positive integer or float. The 's' at the end of 'pts' is optional. This format can be changed by modifying `WEIGHT_REGEX`. See [configuration](#configuration).

```javascript
// Examples

// [0/1 pts] if failing. [1/1 pts] if passing.
pm.test("Status code is 200. (1 pt)", function () {
    pm.response.to.have.status(200);
});

// [0/2.5 pts] if failing. [2.5/2.5 pts] if passing.
pm.test("Status code is 404. (2.5 pts)", function () {
    pm.response.to.have.status(404);
});
```


### Student Submission

Student should submit an environment file named `environment.json`. Easiest way is to export from Postman after filling in the `initial value` fields for the necessary variables.


### Configuration

Edit options in `lib/config.js`. Here are the default starting values.

Newman [run options](https://github.com/postmanlabs/newman#api-reference).

```javascript
{
    reporters: 'cli', // Command line output is on
    timeoutRequest: 10000, // Request timeout (ms)
    timeoutScript: 10000, // Script timeout (ms)
    ignoreRedirects: true, // Don't automatically follow redirects
    delayRequest: 1000, // Delay between requests (ms)
}
```

Gradescope options. See [Gradescope](https://gradescope-autograders.readthedocs.io/en/latest/specs/) under 'Output Format'.

```javascript
output_props: {
    test_visibility: 'visible', // ['visible', 'hidden', 'after_due_date', 'after_published']
    stdout_visibility: 'hidden', // ['visible', 'hidden', 'after_due_date', 'after_published']
  }
```

The regex to read point values from Postman tests can also be set.
```javascript
{
    weight_regex: /\(\s*([\d.]*)\s*pts?\)/
}
```


### Build

```
npm run build
```

This script will zip all the required autograder files into `build/autograder.zip`. (Requires `zip` command.)


## Autograder Files

See Gradescope autograder [specifications](https://gradescope-autograders.readthedocs.io/en/latest/specs/).


### `setup.sh`

*Required by Gradescope.* Setup script to install dependencies.


### `run_autograder`

*Required by Gradescope.* Copy over submission files and run grading script.


### `run_newman.js`

Main grading script. Runs the Postman collection using Newman and exports the results in Gradescope format to `/autograder/results/results.json`.


### `lib/parser.js`

Contains all the parsing and output functions.


### `lib/config.js`

Edit configuration options here.


### `package.json`

Used to install dependencies.


### `collection.json`

The collection to run for grading. Must contain properly formatted Postman tests. See [usage](#usage).


## To Do

- Implement partial credit.
- Decide on Gradescope output for students and instructors.
