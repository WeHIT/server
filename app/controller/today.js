/**
 * Created by rccoder on 01/03/2017.
 */
'use strict';

module.exports = app => {
  class TodayController extends app.Controller {
    * rencentNews() {
      const newsList = yield this.ctx.service.today.rencentNews({
        type: 'searchTag',
        text: 'MANAGEMENT'
      });

      this.ctx.body = newsList;
    }

    * specialNews() {
      const news = yield this.ctx.service.today.specialNews('http://today.hit.edu.cn/news/2017/03-02/1641020130RL0.htm');

      this.ctx.body = news.content;
    }
  }
  return TodayController;
};
