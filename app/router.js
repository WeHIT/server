'use strict';

module.exports = app => {
  app.get('/', 'home.index');
  app.get('/today', 'today.rencentNews');
  app.get('/today/special', 'today.specialNews');
  app.get('/weather/todayWeather', 'weather.todayWeather');
};
