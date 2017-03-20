'use strict';

// had enabled by egg
// exports.static = true;

exports.proxyagent = {
  enable: true,
  package: 'egg-development-proxyagent',
};

exports.mongoose = {
  enable: true,
  package: 'egg-mongoose',
};

exports.jwt = {
  enable: true,
  package: 'egg-jwt',
};
