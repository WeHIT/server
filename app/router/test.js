'use strict';

module.exports = app => {
  // app.resources('home', '/', 'home');
  app.post('/', 'home.index');
  app.resources('login', '/login', 'login');
  app.resources('reg', '/reg', 'reg');
  app.resources('todayRecent', '/today-recent', 'todayRecent');
  app.resources('todaySpecial', '/today-special', 'todaySpecial');
  app.resources('weather', '/weather', 'weather');
  app.resources('foodCard', '/food-card', 'foodCard');
  app.resources('express', '/express', 'express');
  app.resources('ptSale', '/pt-sale', 'ptSale');
};
