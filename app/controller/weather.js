/**
 * Created by rccoder on 03/03/2017.
 */
'use strict';
module.exports = app => {
  class WeatherController extends app.Controller {
    * index() {
      const { ctx, service } = this;
      const weather = yield service.weather.todayWeather({ location: this.ctx.query.location });
      ctx.body = weather;
    }
  }
  return WeatherController;
};
