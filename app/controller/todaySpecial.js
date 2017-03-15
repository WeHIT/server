/**
 * Created by rccoder on 03/14/2017.
 */
'use strict';

module.exports = app => {
  class TodaySpecialController extends app.Controller {
    * index() {
      const { ctx, service } = this;
      const news = yield service.today.specialNews('http://today.hit.edu.cn/news/2017/03-02/1641020130RL0.htm');

      this.success(news);
    }
  }
  return TodaySpecialController;
};
