'use strict';

module.exports = app => {
  class LoginController extends app.Controller {
    * index() {
      this.success('登录成功');
    }

    * create() {
      const {
        id,
        password,
      } = this.ctx.request.body;

      const findUser = yield this.ctx.model.user.find({
        id,
        password,
      });

      if (findUser.length <= 0) {
        this.success({
          text: '账号或密码错误',
        });
      } else {
        this.success({
          text: '登录成功',
          token: app.jwt.sign({ id }, app.config.jwt.secret),
        });
      }
    }
  }
  return LoginController;
};
