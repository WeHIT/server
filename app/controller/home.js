'use strict';

module.exports = app => {
  class HomeController extends app.Controller {
    * index() {
      this.success('Hi, new Egg.js');
    }
  }
  return HomeController;
};
