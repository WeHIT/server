'use strict';

module.exports = app => {
  class FoodCardController extends app.Controller {
    * index() {
      const userInfo = yield this.service.foodCard.getUserInfo('1130310128', '012531');
      const costToday = yield this.service.foodCard.getCostToday(userInfo.cookies, userInfo.accountId);
      const costDuring = yield this.service.foodCard.getCostDuring('20170327', '20170330', userInfo.cookies, userInfo.accountId);
      console.log(costToday);
      console.log(costDuring);
      this.ctx.body = '123';
    }
  }
  return FoodCardController;
};
