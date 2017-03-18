'use strict';

module.exports = app => {
  class HomeController extends app.Controller {
    * index() {
      this.ctx.session.username = this.ctx.query.username;
      this.success('Hi, new Egg.js');
    }
  }
  return HomeController;
};
