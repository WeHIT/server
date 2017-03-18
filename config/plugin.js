'use strict';

// had enabled by egg
// exports.static = true;

module.exports = () => {
  return {
    proxyagent: {
      enable: true,
      package: 'egg-development-proxyagent',
    },
  };
};
