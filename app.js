'use strict';

module.exports = app => {
  class CustomController extends app.Controller {
    get user() {
      return this.ctx.session.user;
    }
    success(data) {
      this.ctx.body = {
        success: true,
        data,
      };
    }
    notFound(msg) {
      const _msg = msg || 'not found';
      this.ctx.throw(404, _msg);
    }
  }
  app.Controller = CustomController;
};
