/**
 * Created by rccoder on 01/03/2017.
 */
'use strict';

module.exports = app => {
  class TodayController extends app.Controller {
    * news() {
      const newsList = yield this.ctx.service.today.news({type: 'searchTag'})
      this.ctx.body = newsList;
    }
  }
  return TodayController;
};
