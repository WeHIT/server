'use strict';
const moment = require('moment');
const util = require('../util');
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

      const { emptySchool } = this.app.config;

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
        } else if (data === '明天天气' || data === '后天天气' || data === '大后天天气' || data === '最近4天天气') {
          const result = yield this.handleWeatherSpecial(location, data);
          this.success(result);
        } else if (data === '查饭卡') {
          const result = yield this.handleFoodCardCommon(id);
          this.success(result);
        } else if (data === '今天具体消费情况' || data === '最近三天消费情况' || data === '最近一周消费情况' || data === '最近一月消费情况') {
          const result = yield this.handleFoodCardSpecial(id, data);
          this.success(result);
        } else if (data === '查空教室') {
          const result = yield this.handleEmptySchoolCommon();
          this.success(result);
        } else if (emptySchool.liveMap[data]) {
          const result = yield this.handleEmptySchoolCommonStepOne(data);
          this.success(result);
        } else if (data === '淘二手') {
          const result = yield this.handlePtSaleCommon();
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
    * handleEmptySchoolCommonStep1() {
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

      const indexMap = {
        明天天气: 1,
        后天天气: 2,
        大后天天气: 3,
        最近4天天气: 4,
      };

      const cityInfo = yield this.service.weather.getCityByLatAndLon(location.lat, location.lon);
      // 预报天气
      const data = yield this.service.weather.getTodayWeatherForecasts(cityInfo.adcode);

      let str = '';
      str += `${data.reporttime} 起为你预测 ${day}<br/>`;

      data.casts.map((item, index) => {
        if (indexMap[day] === index || indexMap[day] === 4) {
          str += `日期: ${item.date}  `;
          str += `星期${item.week}<br/>`;
          str += `白天天气情况: ${item.dayweather}  温度: ${item.daytemp}  风力: ${item.daypower}<br/>`;
          str += `夜间天气情况: ${item.nightweather} 温度: ${item.nighttemp}  风力: ${item.nightpower}<br/><br/>`;
        }
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
      try {
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
      } catch (e) {
        return {
          nextCommand: 'express',
          data: [{
            type: 'normalDialog',
            data: {
              position: 'left',
              data: '无法查询的到此快递，请重新输入',
            },
          }],
        };
      }
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

    /**
     * @desc 获取饭卡介绍信息
     * @param {string} id 用户 id
     * @return {object} 返回对象
     */
    * handleFoodCardCommon(id) {
      try {
        let str = '';
        const userInfo = yield this.service.user.getUserInfo(id);

        console.log(userInfo);
        // 饭卡密码（身份证后 5 位）
        const idCard = userInfo.idCard;
        const userInfoInFood = yield this.service.foodCard.getUserInfo(id, idCard);
        const costToday = yield this.service.foodCard.getCostToday(userInfoInFood.cookies, userInfoInFood.accountId);
        str = `你的饭卡尾号为: ${userInfoInFood.accountId}。 今天共消费￥ ${costToday.costToday}`;

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
            actionText: '今天具体消费情况',
            descText: '我要查询今天具体消费情况',
          }, {
            actionText: '最近三天消费情况',
            descText: '我要查询最近三天消费情况',
          }, {
            actionText: '最近一周消费情况',
            descText: '我要查询最近一周消费情况',
          }, {
            actionText: '最近一月消费情况',
            descText: '我要查询最近一月消费情况         ',
          }],
        };
      } catch (e) {
        return {
          nextCommand: 'common',
          data: [{
            type: 'normalDialog',
            data: {
              position: 'left',
              content: '没有这个饭卡信息，请检查下你的密码是否设置正确或已经登录',
            },
          }],
        };
      }
    }

    /**
     * @desc 获取特定消费情况
     * @param {string} id 学号
     * @param {string} data 数据（今天具体消费情况）
     * @return {object} 返回的数据
     */
    * handleFoodCardSpecial(id, data) {
      try {
        let str = '';
        const userInfo = yield this.service.user.getUserInfo(id);

        console.log(userInfo);
        // 饭卡密码（身份证后 5 位）
        const idCard = userInfo.idCard;
        // 获取银行卡号，cookies 等信息
        const userInfoInFood = yield this.service.foodCard.getUserInfo(id, idCard);

        if (data === '今天具体消费情况') {
          const costToday = yield this.service.foodCard.getCostToday(userInfoInFood.cookies, userInfoInFood.accountId);
          str += `你今天共消费: ${costToday.costToday}<br/>`;
          console.log(costToday);
          costToday.history && costToday.history.length && costToday.history.map(item => {
            str += `时间: ${item.time}  地点: ${item.location} 消费金额: ${item.cost}<br/>`;
            return 1;
          });
        } else {

          const foodDuringMap = {
            最近三天消费情况: 3,
            最近一周消费情况: 7,
            最近一月消费情况: 30,
          };
          const returnMap = {
            最近三天消费情况: '最近三天你共消费',
            最近一周消费情况: '最近一周你共消费',
            最近一月消费情况: '最近一月你共消费',
          };
          const start = util.getDateBefore(-foodDuringMap[data]);
          const end = util.getDateBefore(0);

          const costDuring = yield this.service.foodCard.getCostDuring(start, end, userInfoInFood.cookies, userInfoInFood.accountId);
          str += `${returnMap[data]}: ￥ ${costDuring.costDuring}<br/>`;
          costDuring.history && costDuring.history.length && costDuring.history.map(item => {
            str += `时间: ${item.time}  地点: ${item.location} 消费金额: ${item.cost}<br/>`;
            return 1;
          });
        }

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
      } catch (e) {
        return {
          nextCommand: 'common',
          data: [{
            type: 'normalDialog',
            data: {
              position: 'left',
              content: '没有这个饭卡信息，请检查下你的密码是否设置正确或已经登录',
            },
          }],
        };
      }
    }

    /**
     * @desc 查空教室第一步
     * @return {object} 返回对象
     */
    * handleEmptySchoolCommon() {
      const { emptySchool } = this.app.config;

      const liveTipBar = [];
      for (const item in emptySchool.liveMap) {
        console.log(item);
        liveTipBar.push({
          actionText: item,
          descText: item,
        });
      }
      return {
        nextCommand: 'common',
        data: [{
          type: 'normalDialog',
          data: {
            position: 'left',
            content: '请选择楼宇',
          },
        }],
        tipBar: liveTipBar,
      };
    }

    * handleEmptySchoolCommonStepOne(data) {
      const { emptySchool } = this.app.config;

      const liveTipBar = [];
      for (const item in emptySchool.liveMap[data]) {
        console.log(item);
        liveTipBar.push({
          actionText: item,
          descText: item,
        });
      }

      return {
        nextCommand: 'common',
        data: [{
          type: 'normalDialog',
          data: {
            position: 'left',
            content: '请选择楼宇',
          },
        }],
        tipBar: liveTipBar,
      };
    }

    * handlePtSaleCommon() {
      const data = yield this.ctx.service.ptSale.getPostFromDB();
      // return data;

      console.log(data);
      return {
        nextCommand: 'common',
        data: [{
          type: 'news',
          data: {
            position: 'left',
            content: data.map(item => {
              return {
                firstImg: 'http:' + item.firstImg,
                title: item.subject,
                targetUrl: `ptsale:${item._id}`,
              };
            }),
          },
        }],
      };
    }
  }
  return ApiController;
};
