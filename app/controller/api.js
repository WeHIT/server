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
          if (data === '查快递' || data === '快递') {
            const data = yield this.service.express.getHistoryInfo(this.ctx.state.user.username);
            this.ctx.body = data;
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
