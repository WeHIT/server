'use strict';

module.exports = app => {
  //app.resources('home', '/', 'home');
  app.get('/', app.jwt, 'home.index');
  app.resources('todayRecent', '/today-recent', 'todayRecent');
  app.resources('todaySpecial', '/today-special', 'todaySpecial');
  app.resources('weather', '/weather', 'weather');
};
