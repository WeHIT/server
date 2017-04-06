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
          const { data } = options;
          if (data === '查快递' || data === '快递' || data === '查询快递') {
            const result = yield this.service.express.getHistoryInfo(this.ctx.state.user.username);

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
      
            this.success({
              nextCommand: 'common',
              data: [{
                type: 'express',
                data: {
                  position: 'left',
                  content: data,
                },
              }],
            });
          } else if (data === '获取新闻') {
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
          } else if (data === '查空教室') {
            const data = yield this.service.emptySchool.curlEmptySchool();
            this.success({
              data,
            });
          }
          return;
        }
        case 'express': {
          const { data } = options;
          const expressInfo = yield this.service.express.getInfo('' + data, this.ctx.state.user.username);
          this.ctx.body = expressInfo;
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
