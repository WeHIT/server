'use strict';

module.exports = app => {
  app.post('/api', app.jwt, 'api.index');
};
