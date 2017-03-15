'use strict';

module.exports = app => {
  app.resources('home', '/', 'home');
  app.resources('todayRecent', '/today-recent', 'todayRecent');
  app.resources('todaySpecial', '/today-special', 'todaySpecial');
  app.resources('weather', '/weather', 'weather');
};
