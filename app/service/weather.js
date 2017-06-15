/**
 * Created by rccoder on 03/03/2017.
 */

module.exports = app => {
  class WeatherService extends app.Service {
    * todayWeather(command) {
      return yield this.getTodayWeather(command);
    }

    /**
     * 从高德地图获取地理位置编码
     * @param {string} lat 纬度
     * @param {string} lon 经度
     */
    * getCityByLatAndLon(lat, lon) {
      const { aMap } = this.app.config;

      const _lat = lat.toFixed(5);
      const _lon = lon.toFixed(5);
      const data = yield this.ctx.curl(`${aMap.geoCodeUrl}`, {
        data: {
          key: aMap.key,
          location: `${_lon},${_lat}`,
        },
        dataType: 'json',
      });

      if (data.data.status == 1) {
        return {
          formatted_address: data.data.regeocode.formatted_address,
          cityCode: data.data.regeocode.addressComponent.citycode,
          city: data.data.regeocode.addressComponent.city,
          adcode: data.data.regeocode.addressComponent.adcode,
        }
      } else {
        return 0
      }
    }

    /**
     * @desc 天气预报预测
     * @param {number} adcode
     */
    * getTodayWeatherForecasts(adcode = 230103) {
      console.log(adcode)
      const { aMap } = this.app.config;
      const data = yield this.ctx.curl(`${aMap.weatherUrl}`, {
        data: {
          key: aMap.key,
          city: adcode,
          extensions: 'all',
        },
        dataType: 'json',
      });
      if(data.data.infocode == 10000) {
        return data.data.forecasts[0]
      }
    }

    /**
     * @desc 获取今日天气今日详情
     * @param {number} adcode
     */
    * getTodayWeather(adcode = 230103) {
      console.log(adcode)
      const { aMap } = this.app.config;
      const data = yield this.ctx.curl(`${aMap.weatherUrl}`, {
        data: {
          key: aMap.key,
          city: adcode,
          extensions: 'base',
        },
        dataType: 'json',
      });
      if(data.data.infocode == 10000) {
        return data.data.lives[0];
      }
    }
  }

  return WeatherService;
};
