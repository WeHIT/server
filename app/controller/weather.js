/**
 * Created by rccoder on 03/03/2017.
 */
'use strict';
module.exports = app => {
  class WeatherController extends app.Controller {
    * index() {
      const weather = yield this.ctx.service.weather.todayWeather({ location: this.ctx.query.location });
      this.ctx.body = weather;
    }
  }
  return WeatherController;
};
