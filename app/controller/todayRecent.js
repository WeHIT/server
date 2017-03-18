/**
 * Created by rccoder on 01/03/2017.
 */
'use strict';

module.exports = app => {
  class TodayRecentController extends app.Controller {
    * index() {
      const { ctx, service } = this;
      const newsList = yield service.today.rencentNews({
        type: 'searchTag',
        text: 'MANAGEMENT',
      });
      console.log(ctx.session.username);
      this.success(newsList);
    }
  }
  return TodayRecentController;
};
