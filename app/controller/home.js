'use strict';

module.exports = app => {
  class HomeController extends app.Controller {
    * index() {
      //this.ctx.session.username = this.ctx.query.username;
      //const findTodayNews = yield this.ctx.model.todayNews.find({});
      //console.log(findTodayNews);
      //this.success(findTodayNews);
      // console.log(44444444444)


      // console.log(this.ctx.state);
      // const token = app.jwt.sign({ username: 'shabi' }, app.config.jwt.secret);
      // console.log(token)

      yield this.service.emptySchool.curlEmptySchoolByHouse();

      // console.log(app.jwt)
      //this.ctx.body = '123';
      this.success({
        a: 1,
      })
    }
  }
  return HomeController;
};
