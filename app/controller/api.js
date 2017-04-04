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
            console.log(JSON.stringify(result));
            let data = `<p>你的历史快递查询中共有${result.length}个快递没有签收<p>`;
            for (let i = 0; i < result.length; i++) {
              data += `<p>单号${result[i].logisticCode}：</p>`;
              for (let j = 0; j < result[i].content.length; j++) {
                data += `<p>${result[i].content[j].shipperName}</p>`;
                for (let k = 0; k < result[i].content[j].Traces.length; k++) {
                  data += `<p>${result[i].content[j].Traces[i].AcceptTime}</p><p>${result[i].content[j].Traces[i].AcceptStation}</p>`;
                }
              }
            }
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
        default: {
          break;
        }
      }

    }
  }
  return ApiController;
};
