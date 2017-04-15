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

module.exports = app => {
  class ApiController extends app.Controller {
    * index() {
      const {
        command,
        options,
      } = this.ctx.request.body;

      switch (command) {
        case 'common': {
          const { data, location } = options;
          if (data === '查快递' || data === '快递' || data === '查询快递') {
            const id = this.ctx.state.user.id;
            console.log(`查询id${id}`);
            // 获取历史快递信息
            const result = yield this.service.express.getHistoryInfo(id);
            // // 获取用户信息
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

            console.log(userInfo)

            // 没有登录
            if (userInfo == null || userInfo.length <= 0) {
              this.success({
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
              });
            } else {
              this.success({
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
              });
            }
          } else if (data === '获取新闻') {

            console.log(this.ctx.state.user);
            const findUser = yield this.ctx.model.user.find({
              id: this.ctx.state.user.id,
            });
            console.log(findUser[0]);

            const news = yield this.service.today.getRecentNewFromDb(findUser[0].college);
            this.success({
              nextCommand: 'common',
              data: [{
                type: 'news',
                data: {
                  position: 'left',
                  content: news,
                },
              }],
            });
          } else if (data === '查空教室') {
            const data = yield this.service.emptySchool.curlEmptySchool();
            this.success({
              data,
            });
          } else if (data === '获取天气') {
            const cityInfo = yield this.service.weather.getCityByLatAndLon(location.lat, location.lon);
            // 预报天气
            //const data = yield this.service.weather.getTodayWeatherForecasts(cityInfo.adcode);
            const data = yield this.service.weather.getTodayWeather(cityInfo.adcode);
            console.log(data);
            
            let str = '';
            str += `你好, 你的位置是  ${cityInfo.formatted_address}<br/>`;
            // str += `${data.reporttime} 起为你预测最近四天天气<br/>`;

            // data.casts.map(item => {
            //   str += `日期: ${item.date}  `;
            //   str += `星期${item.week}<br/>`;
            //   str += `白天天气情况: ${item.dayweather}  温度: ${item.daytemp}  风力: ${item.daypower}<br/>`;
            //   str += `夜间天气情况: ${item.nightweather} 温度: ${item.nighttemp}  风力: ${item.nightpower}<br/><br/>`;
            //   return 1;
            // });

            str += `天气数据发布时间: ${data.reporttime}<br/>`;

            str += `天气情况: ${data.weather}<br/>`;
            str += `温度: ${data.temperature}<br/>`;
            str += `风向: ${data.winddirection}<br/>`;
            str += `风力: ${data.windpower + 3}<br/>`;
            str += `湿度: ${data.humidity}<br/>`;

            this.success({
              nextCommand: 'common',
              data: [{
                type: 'normalDialog',
                data: {
                  position: 'left',
                  content: str,
                },
              }],
            });
          } else {
            this.success({
              nextCommand: 'common',
              data: [{
                type: 'normalDialog',
                data: {
                  position: 'left',
                  content: '抱歉，我不是太懂你在说什么',
                },
              }],
            });
          }
          return;
        }
        case 'express': {
          const { data } = options;
          const expressInfo = yield this.service.express.getInfo('' + data, this.ctx.state.user.id);
          this.success({
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
          });
          return;
        }
        case 'news': {
          const news = yield this.service.today.getRecentNewFromDb('cs');
          this.success({
            nextCommand: 'common',
            data: [{
              type: 'news',
              data: {
                position: 'left',
                content: news,
              },
            }],
          });
          return;
        }
        default: {
          break;
        }
      }

    }
  }
  return ApiController;
};
