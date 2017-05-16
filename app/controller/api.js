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


      console.log('=====本地请求数据如下=====');
      console.log(command);
      console.log(options);
      console.log('=====数据请求展示结束=====');

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
      } else if (command === 'emptySchoolStep1') {
        const { data } = options;
        const result = yield this.handleEmptySchoolStepOne(data);
        this.success(result);
      } else if (command.split('|')[0] === 'emptySchoolStep2') {
        const { data } = options;
        const result = yield this.handleEmptySchoolStepTwo(command, data);
        this.success(result);
      } else if (command.split('|')[0] === 'emptySchoolStep3') {
        const { data } = options;
        const result = yield this.handleEmptySchoolStepThree(command, data);
        this.success(result);
      } else if (command.split('|')[0] === 'emptySchoolStep4') {
        const { data } = options;
        const result = yield this.handleEmptySchoolStepFour(command, data);
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
        let news;
        if (id) {
          const findUser = yield this.ctx.model.user.find({
            id,
          });
          news = yield this.service.today.getRecentNewFromDb(findUser[0].college);
          return {
            nextCommand: 'common',
            data: [{
              type: 'news',
              data: {
                position: 'left',
                content: news.map(item => {
                  return {
                    title: item.title,
                    firstImg: item.firstImg,
                    targetUrl: `news:${item._id}`,
                  };
                }),
              },
            }],
          };
        } else {
          news = yield this.service.today.getRecentNewFromDb('all');
          return {
            nextCommand: 'common',
            data: [{
              type: 'normalDialog',
              data: {
                position: 'left',
                content: '系统检测到你没有登录，随机为你推荐最新新闻',
              },
            }, {
              type: 'news',
              data: {
                position: 'left',
                content: news.map(item => {
                  return {
                    title: item.title,
                    firstImg: item.firstImg,
                    targetUrl: `news:${item._id}`,
                  };
                }),
              },
            }],
          };
        }

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

      // const liveTipBar = [];
      // for (const item in emptySchool.liveMap) {
      //   console.log(item);
      //   liveTipBar.push({
      //     actionText: item,
      //     descText: item,
      //   });
      // }
      // return {
      //   nextCommand: 'common',
      //   data: [{
      //     type: 'normalDialog',
      //     data: {
      //       position: 'left',
      //       content: '请选择楼宇',
      //     },
      //   }],
      //   tipBar: liveTipBar,
      // };
      return {
        nextCommand: 'emptySchoolStep1',
        data: [{
          type: 'normalDialog',
          data: {
            position: 'left',
            content: '请选择查询类型',
          }
        }],
        tipBar: [{
          actionText: '按时间查',
          descText: '我要按照时间区间查',
        }, {
          actionText: '按教室查',
          descText: '我要按教室查询',
        }],
      }
    }

    /**
     * @desc 步骤1，点了选择查询种类，选择了按时间查或者按校区查  提示选择校区
     * @param data
     */
    * handleEmptySchoolStepOne(data) {
      console.log(data);
      return {
        nextCommand: data === '按时间查' ? 'emptySchoolStep2|time' : 'emptySchoolStep2|live',
        data: [{
          type: 'normalDialog',
          data: {
            position: 'left',
            content: data === '按时间查' ? '你刚才选择了按照时间维度查询，现在请选择校区' : '你刚才选择了按照教室维度查询，现在请选择校区',
          }
        }],
        tipBar: [{
          actionText: '一校区',
          descText: data === '按时间查' ? '我要从时间的维度查询一校区的空教室' : '我要从教室的维度查询一校区的空教室',
        }, {
          actionText: '二校区',
          descText: data === '按时间查' ? '我要从时间的维度查询二校区的空教室' : '我要从教室的维度查询二校区的空教室'
        }],
      }
    }

    /**
     * @desc 第二部，选择一校区还是二校区
     * @param command  emptySchoolStep2|time  emptySchoolStep2|live
     * @param data
     */
    * handleEmptySchoolStepTwo(command, data) {
      // 按教室查之后选了了某个校区
      if (command.split('|')[1] === 'live') {
        const { emptySchool } = this.app.config;

        const tipBar = [];

        if(data === '一校区') {
          for (const item in emptySchool.houseMap) {
            if (emptySchool.houseMap.hasOwnProperty(item)) {
              tipBar.push({
                actionText: item,
                descText: `我要以教室的维度查询${data}${item}的空教室情况`
              });
            }
          }
        } else {
          for (const item in emptySchool.houseTwoMap) {
            if (emptySchool.houseTwoMap.hasOwnProperty(item)) {
              tipBar.push({
                actionText: item,
                descText: `我要以教室的维度查询${data}${item}的空教室情况`
              });
            }
          }
        }

        return {
          nextCommand: `emptySchoolStep3|live|${data}`,
          data: [{
            type: 'normalDialog',
            data: {
              position: 'left',
              content: `你现在正在以教室的维度查询${data}的空教室，请选择教室`,
            }
          }],
          tipBar: tipBar
        }
      } else {
        return {
          nextCommand: `emptySchoolStep3|time|${data}`,
          data: [{
            type: 'normalDialog',
            data: {
              position: 'left',
              content: `你现在正在以时间的维度查询${data}的空教室，为保证空教室不是那么的多，目前只展示一区正心诚意，二区主楼、东西配楼的空教室`,
            }
          }],
          tipBar: [{
            actionText: '1-2节',
            descText: `我要查${data} 1-2 节的空教室`,
          }, {
            actionText: '3-4节',
            descText: `我要查${data} 3-4 节的空教室`,
          }, {
            actionText: '5-6节',
            descText: `我要查${data} 5-6 节的空教室`,
          }, {
            actionText: '7-8节',
            descText: `我要查${data} 7-8 节的空教室`,
          }, {
            actionText: '9-10节',
            descText: `我要查${data} 9-10 节的空教室`,
          }]
        }
      }
    }

    /**
     * @desc 步骤三，点击具体楼宇之后的响应,返回具体的教室
     * @param command  step3|live(time)|一校区
     * @param data
     * @returns {{nextCommand: string, data: [*], tipBar: Array}}
     */
    * handleEmptySchoolStepThree(command, data) {
      // 按屋子查，这里会选择教室
      if (command.split('|')[1] === 'live') {
        const xiaoqu = command.split('|')[2];

        const tipBar = [];

        const { emptySchool } = this.app.config;

        for (const item in emptySchool.liveMap[data]) {
          if(emptySchool.liveMap[data].hasOwnProperty(item)) {
            tipBar.push({
              actionText: item,
              descText: `查${xiaoqu}${data}${item}的空教室情况`,
            })
          }
        }

        return {
          nextCommand: `emptySchoolStep4|live|${xiaoqu}|${data}`,
          data: [{
            type: 'normalDialog',
            data: {
              position: 'left',
              content: `请选择${xiaoqu}${data}的教室`,
            }
          }],
          tipBar: tipBar,
        }
      // 按时间查,data 的数据里面包含了要查的时间
      } else {
        console.log(command);
        console.log(data);

        const xiaoqu = command.split('|')[2];

        const timeMap = {
          '1-2节': '1',
          '3-4节': '2',
          '5-6节': '3',
          '7-8节': '4',
          '9-10节': '5',
          '11-12节': '6',
        };

        const result = yield this.service.emptySchool.getEmptySchoolInfoByXiaoquTimeToday(xiaoqu, timeMap[data]);

        console.log(result);

        let str = `${data}${xiaoqu}的空闲教室有:\n`;

        // 标志楼宇
        let house = '';

        result.map(item => {
          if (house !== item.house) {
            house = item.house;
            str += `\n \n${item.house}:\n \n`;
          }

          str += `${item.live}  `;
        });

        return {
          nextCommand: `emptySchoolStep3|time|${xiaoqu}|${data}`,
          data: [{
            type: 'normalDialog',
            data: {
              position: 'left',
              content: str,
            }
          }],
          // tipBar: tipBar, 禁止掉
        }
      }
    }

    /**
     * @desc Step4 最后一步，已经输入了具体的教室
     * @param command
     * @param data
     */
    * handleEmptySchoolStepFour(command, data) {
      const xiaoqu = command.split('|')[2];
      const house = command.split('|')[3];
      const live = data;

      // 会得到一个数组
      const result = yield this.service.emptySchool.getEmptySchollInfoByHouseLive(xiaoqu, house, live);

      let str = `${xiaoqu}${house}${live} 本周的空教室情况如下:\n`;

      // 周几
      let weekDay = '1';

      str += '\n周一:'

      result.map((item, index) => {
        const weekDayMap = {
          '1': '一',
          '2': '二',
          '3': '三',
          '4': '四',
          '5': '五',
          '6': '六',
          '7': '日',
        };

        const timeMap = {
          '1': '1-2',
          '2': '3-4',
          '3': '5-6',
          '4': '7-8',
          '5': '9-10',
          '6': '11-12',
        };

        // 新的一天开始了
        if (item.weekDay !== weekDay) {
          weekDay = item.weekDay;
          str += `\n周${weekDayMap[item.weekDay]}: `;
        }
        // 每天的课程节数
        str += timeMap[item.time] + '节  ';
      });

      return {
        nextCommand: `emptySchoolStep4|live|${xiaoqu}|${house}`,
        data: [{
          type: 'normalDialog',
          data: {
            position: 'left',
            content: str,
          }
        }],
        // tipBar: [], 不输出 tipBar，前端的 TipBar 不会发生变化
      }

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
            content: '请选择教室',
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
