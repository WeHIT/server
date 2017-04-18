'use strict';

/**

// 指定单号的快递
{
  "command": "express",
  "options": {
    "data": "3937190503347"
  }
}

// 查快递

{
  "command": "common",
  "options": {
    "data": "查快递"
  }
}

// 获取新闻
{
  "command": "common",
  "options": {
    "data": "获取新闻"
  }
}
 */

const ERROR_TIP = {
  nextCommand: 'common',
  data: [{
    type: 'normalDialog',
    data: {
      position: 'left',
      content: '额，出了点问题，截图发邮件到 rccoder.net@gmail 协助解决问题',
    },
  }],
};

module.exports = app => {
  class ApiController extends app.Controller {
    * index() {
      const {
        command,
        options,
      } = this.ctx.request.body;

      console.log(this.ctx.request.body);

      const id = this.ctx.state.user.id;
      console.log(`用户id: ${id}`);

      if (command === 'common') {
        const { data, location } = options;
        if (data === '查快递' || data === '快递' || data === '查询快递') {
          const result = yield this.handleExpressCommon(id);
          this.success(result);
        } else if (data === '获取新闻') {
          const result = yield this.handleTodayNewsCommon(id);
          this.success(result);
        } else if (data === '查空教室') {
          const result = yield this.handleEmptySchoolCommon();
          this.success(result);
        } else if (data === '获取天气') {
          const result = yield this.handleWeatherCommon(location);
          this.success(result);
        } else {
          const result = yield this.handleOtherCommon();
          this.success(result);
        }
      } else if (command === 'express') {
        const { data } = options;
        const result = yield this.handleExpressSpecial(data);
        this.success(result);
      } else if (command === 'news') {
        const result = yield this.handleNewsSpecial();
        this.success(result);
      }

    }

    /**
     * @desc common type 的快递查询
     * @param {string} id 用户id
     * @return {object} 快递信息
     **/
    * handleExpressCommon(id) {
      // 获取历史快递信息
      const result = yield this.service.express.getHistoryInfo(id);
      // 获取用户信息
      const userInfo = yield this.service.user.getUserInfo(id);

      const data = {
        len: result.length,
        data: result.map(item => {
          return {
            logisticCode: item.logisticCode,
            shipperName: item.content[0].shipperName,
            status: '在途中',
            traces: item.content[0].Traces,
          };
        }),
      };

      console.log(userInfo);

      let expressData = {};

      // 没有登录
      if (userInfo == null || userInfo.length <= 0) {
        expressData = {
          nextCommand: 'express',
          data: [{
            type: 'normalDialog',
            data: {
              position: 'left',
              content: 'Hi，你还没有登录，无法保存你的历史查询记录。<br/>如果你要查询新快递，请直接输入快递号码后点击发送',
            },
          }],
          tipBar: [{
            actionText: '测试',
            descText: '测试描述',
          }],
        };
      } else {
        expressData = {
          nextCommand: 'express',
          data: [{
            type: 'express',
            data: {
              position: 'left',
              content: data,
            },
          }, {
            type: 'normalDialog',
            data: {
              position: 'left',
              content: 'Hi，如果你要查询新快递，请直接输入快递号码后点击发送',
            },
          }],
        };
      }

      return expressData;
    }

    /**
     * @desc common type 的新闻查询
     * @param {string} id 用户id
     * @return {object} 新闻信息
     */
    * handleTodayNewsCommon(id) {
      try {
        const findUser = yield this.ctx.model.user.find({
          id,
        });
        console.log(findUser[0]);

        const news = yield this.service.today.getRecentNewFromDb(findUser[0].college);
        return {
          nextCommand: 'common',
          data: [{
            type: 'news',
            data: {
              position: 'left',
              content: news,
            },
          }],
        };
      } catch (e) {
        return ERROR_TIP;
      }
    }

    /**
     * @desc common type 查询空教室
     * @return {object} 空教室信息
     */
    * handleEmptySchoolCommon() {
      const data = yield this.service.emptySchool.curlEmptySchool();
      return data;
    }

    /**
     * @desc common type 天气查询
     * @param {object} location 经纬度信息
     * @return {object} 天气信息
     */
    * handleWeatherCommon(location) {
      try {
        const cityInfo = yield this.service.weather.getCityByLatAndLon(location.lat, location.lon);
        const data = yield this.service.weather.getTodayWeather(cityInfo.adcode);

        let str = '';
        str += `你好, 你的位置是  ${cityInfo.formatted_address}<br/>`;

        str += `天气数据发布时间: ${data.reporttime}<br/>`;

        str += `天气情况: ${data.weather}<br/>`;
        str += `温度: ${data.temperature}<br/>`;
        str += `风向: ${data.winddirection}<br/>`;
        str += `风力: ${data.windpower + 3}<br/>`;
        str += `湿度: ${data.humidity}<br/>`;

        return {
          nextCommand: 'common',
          data: [{
            type: 'normalDialog',
            data: {
              position: 'left',
              content: str,
            },
          }],
          tipBar: [{
            actionText: '明天天气',
            descText: '预测一下明天的天气',
          }, {
            actionText: '后天天气',
            descText: '预测一下后天天气',
          }, {
            actionText: '大后天天气',
            descText: '预测一下后天天气',
          }, {
            actionText: '最近4天天气',
            descText: '预测一下最近 4 天的所有天气',
          }],
        };
      } catch (e) {
        return {
          nextCommand: 'common',
          data: [{
            type: 'normalDialog',
            data: {
              position: 'left',
              content: '你出境了？无法定位你的位置',
            },
          }],
        };
      }
    }

    /**
     * @desc common type 预测指定某天的天气
     * @param {object} location 经纬度信息
     * @param {string} day 具体哪天
     * @return {object} 预测天气信息
     */
    * handleWeatherSpecial(location, day) {
      const cityInfo = yield this.service.weather.getCityByLatAndLon(location.lat, location.lon);
      // 预报天气
      const data = yield this.service.weather.getTodayWeatherForecasts(cityInfo.adcode);

      let str = '';
      str += `你好, 你的位置是  ${cityInfo.formatted_address}<br/>`;
      str += `${data.reporttime} 起为你预测最近四天天气<br/>`;

      data.casts.map(item => {
        str += `日期: ${item.date}  `;
        str += `星期${item.week}<br/>`;
        str += `白天天气情况: ${item.dayweather}  温度: ${item.daytemp}  风力: ${item.daypower}<br/>`;
        str += `夜间天气情况: ${item.nightweather} 温度: ${item.nighttemp}  风力: ${item.nightpower}<br/><br/>`;
        return 1;
      });

      return {
        nextCommand: 'common',
        data: [{
          type: 'normalDialog',
          data: {
            position: 'left',
            content: str,
          },
        }],
      };
    }

    /**
     * @desc common type 下无法判断的情况
     * @return {object} 无法判断信息提示
     */
    * handleOtherCommon() {
      return {
        nextCommand: 'common',
        data: [{
          type: 'normalDialog',
          data: {
            position: 'left',
            content: '抱歉，我不是太懂你在说什么',
          },
        }],
      };
    }

    /**
     * @desc 获取指定快递信息
     * @param {string} data 快递信息
     * @param {string} id 用户 id
     * @return {object} 特定快递信息
     */
    * handleExpressSpecial(data, id) {
      const expressInfo = yield this.service.express.getInfo('' + data, id);
      return {
        nextCommand: 'common',
        data: [{
          type: 'express',
          data: {
            position: 'left',
            content: {
              data: [{
                status: '在途中',
                logisticCode: expressInfo.logisticCode,
                shipperName: expressInfo.content[0].shipperName,
                traces: expressInfo.content[0].Traces,
              }],
            },
          },
        }],
      };
    }

    /**
     * @desc 获取特定新闻
     * @return {object} 特定新闻情况
     */
    * handleNewsSpecial() {
      const news = yield this.service.today.getRecentNewFromDb('cs');
      return {
        nextCommand: 'common',
        data: [{
          type: 'news',
          data: {
            position: 'left',
            content: news,
          },
        }],
      };
    }
  }
  return ApiController;
};
