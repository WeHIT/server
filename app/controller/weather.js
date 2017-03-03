/**
 * Created by rccoder on 03/03/2017.
 */

module.exports = app => {
  class WeatherController extends app.Controller {
    * todayWeather() {
      const weather = yield this.ctx.service.weather.todayWeather();
      this.ctx.body = weather;
    }
  }
  return WeatherController;
};
