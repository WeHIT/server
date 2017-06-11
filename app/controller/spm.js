/**
 * Created by rccoder on 11/06/2017.
 */
/**
 * Created by rccoder on 03/03/2017.
 */
'use strict';
module.exports = app => {
  class WeatherController extends app.Controller {
    * index() {
      const { ctx, service } = this;
      console.log(ctx.query);
      console.log(ctx.request.body);

      yield this.service.spm.saveToDb(ctx.query.spm, ctx.request.body.device);

      this.success({msg: 'ok'})
    }
  }
  return WeatherController;
};
