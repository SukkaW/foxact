'use strict';

// Worker entry bootstrap: a worker thread cannot start directly on a TS file,
// so install the swc require hook first (absolute path resolved by the main
// thread), then load the real TS entry.
const { workerData } = require('node:worker_threads');

require(workerData.swcRegister);

require(workerData.entry);
