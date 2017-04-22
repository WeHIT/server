/**
 * 今日哈工大消息和二手交易消息
 */
'use strict';

const bbcode = require('node-bbcode');
const util = require('../util');

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
          const commentArr = yield this.service.comment.getCommentFromDbByPostId(id);
          console.log(commentArr);

          // 自平台用户评论
          const newCommentArr = commentArr.concat(data.comment);

          // merge 后按照时间顺序排序

          newCommentArr.sort((pre, next) => {
            return util.toTimeStamp(pre.added) - util.toTimeStamp(next.added);
          });

          this.success({
            data: {
              _id: data._id,
              topicid: data.topicid,
              subject: data.subject,
              comment: newCommentArr.map(item => {
                return {
                  body: item.body ? bbcode.render(item.body, {}) : item.content,
                  username: item.username || item.userId,
                  posterid: item.posterid || item.userId,
                  avatar: item.avatar || 'http://okujk9avg.bkt.clouddn.com/20170422149286668491987.png',
                  added: util.getDataFromTimeStamp(item.added),
                  fromPt: item.fromPt || 'yes',
                };
              }),
            },
          });
        }
      } else if (command === 'postComment') {
        try {
          const {
            type,
            postId,
            content,
          } = options;
          const userId = this.ctx.state.user.id;
          if (userId) {
            const added = new Date().getTime();
            yield this.service.comment.saveToDb(postId, userId, type, content, added);
            this.success({
              data: {
                msg: '评论成功',
                info: {
                  content,
                  username: userId,
                  posterid: '',
                  added: util.getDataFromTimeStamp(added),
                },
              },
            });
          } else {
            this.success({
              data: {
                msg: '评论发生错误，请检查是否已经登录',
              },
            });
          }
        } catch (e) {
          this.success({
            data: {
              msg: '评论发生错误，请检查是否已经登录',
            },
          });
        }
      }
    }
  }
  return PostController;
};
