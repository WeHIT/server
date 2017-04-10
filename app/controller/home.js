'use strict';

module.exports = app => {
  class HomeController extends app.Controller {
    * index() {
      //this.ctx.session.username = this.ctx.query.username;
      //const findTodayNews = yield this.ctx.model.todayNews.find({});
      //console.log(findTodayNews);
      console.log(this.ctx.state);
      //this.success(findTodayNews);
      // console.log(44444444444)
      const token = app.jwt.sign({ username: 'shabi' }, app.config.jwt.secret);
      console.log(token)
      // console.log(app.jwt)
      this.ctx.body = '123';
    }
  }
  return HomeController;
};
