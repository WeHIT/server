'use strict';

module.exports = app => {
  app.post('/api', app.jwt, 'api.index');
  app.post('/post', app.jwt, 'post.index');
};
