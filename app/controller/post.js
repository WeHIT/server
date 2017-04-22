/**
 * 今日哈工大消息和二手交易消息
 */
'use strict';

const bbcode = require('node-bbcode');

module.exports = app => {
  class PostController extends app.Controller {
    * index() {
      const {
        command,
        options,
      } = this.ctx.request.body;
      if (command === 'getPost') {
        const {
          type,
          id,
        } = options;

        if (type === 'ptsale') {
          const data = yield this.service.ptSale.getPostFromDbByID(id);
          this.success({
            data: {
              _id: data._id,
              topicid: data.topicid,
              subject: data.subject,
              comment: data.comment.map(item => {
                item.body = bbcode.render(item.body, {});
                return item;
              }),
            },
          });
        }
      }
    }
  }
  return PostController;
};
