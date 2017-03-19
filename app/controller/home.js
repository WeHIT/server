'use strict';

module.exports = app => {
  class HomeController extends app.Controller {
    * index() {
      this.ctx.session.username = this.ctx.query.username;
      const findTodayNews = yield this.ctx.model.todayNews.find({});
      console.log(findTodayNews);
      this.success(findTodayNews);
    }
  }
  return HomeController;
};
