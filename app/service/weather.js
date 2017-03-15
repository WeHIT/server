/**
 * Created by rccoder on 03/03/2017.
 */

module.exports = app => {
  class WeatherService extends app.Service {
    * todayWeather(command) {
      return yield this.getTodayWeather(command);
    }

    * getTodayWeather(command) {
      const { weatherUrl, weatherKey, weatherErrorTips } = this.app.config;

      let weatherCtx = yield this.ctx.curl(`${weatherUrl}`, {
        data: {
          key: weatherKey,
          location: command.location || 'haerbin',
          language: 'zh-Hans',
          unit: 'c',
        },
        dataType: 'json',
      });

      if (weatherCtx.status === 200) {
        weatherCtx = weatherCtx.data.results;
      } else {
        weatherCtx = weatherErrorTips;
      }
      return weatherCtx;
    }
  }

  return WeatherService;
};
