'use strict';

module.exports = app => {
  app.get('/', 'home.index');
  app.get('/today', 'today.news');
};
