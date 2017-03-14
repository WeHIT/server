'use strict';

module.exports = app => {
  class HomeController extends app.Controller {
    * index() {
      this.ctx.body = 'Hi, new Egg.js';
    }
  }
  return HomeController;
};
