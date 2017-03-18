'use strict';

const egg = require('egg');

egg.startCluster({
  baseDir: __dirname,
});

// EGG_SERVER_ENV=prod nohup node dispatch.js > stdout.log 2> stderr.log &
