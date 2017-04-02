'use strict';

module.exports = app => {
  class ExpressController extends app.Controller {
    * index() {
      const data = yield this.service.express.getInfo('3937190503347');
      this.ctx.body = data;
    }
  }
  return ExpressController;
};
