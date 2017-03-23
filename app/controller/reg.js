'use strict';

module.exports = app => {
  class RegController extends app.Controller {
    * index() {
      this.success('注册成功');
    }

    * create() {
      const {
        id,
        password,
        college,
        idCard,
      } = this.ctx.request.body;

      const findUser = yield this.ctx.model.user.find({
        id,
      });

      if (findUser.length <= 0) {
        const newUser = new this.ctx.model.user({
          id,
          password,
          college,
          idCard,
        });
        yield newUser.save();

        this.success({
          text: '注册成功',
        });
      } else {
        this.success({
          text: '该学号已经被注册',
        });
      }
    }
  }
  return RegController;
};
