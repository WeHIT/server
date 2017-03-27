'use strict';

module.exports = app => {
  class FoodCardController extends app.Controller {
    * index() {
      const userInfo = yield this.service.foodCard.getUserInfo('1130310128', '012531');
      yield this.service.foodCard.getCostToday(userInfo.cookies, userInfo.accountId);
      this.ctx.body = '123';
    }
  }
  return FoodCardController;
};
