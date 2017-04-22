'use strict';

const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const escaper = require('true-html-escape');
const convert = require('bbfy').converter();

module.exports = app => {
  class commentService extends app.Service {
    /**
     * @desc 向 comment 保存评论
     * @param {string} postId 文章 Id
     * @param {*} userId 用户 id
     * @param {*} postType 文章类型 {新闻？二手？}
     * @param {*} content 评论内容
     */
    * saveToDb(postId, userId, postType, content, added) {
      const newComment = this.ctx.model.comment({
        added,
        postId,
        userId,
        postType,
        content,
      });
      yield newComment.save();
    }

    /**
     * @desc 根据文章 ID 查找所有评论
     * @param {string} postId 文章 id
     * @return {Array} 查询到的数据
     */
    * getCommentFromDbByPostId(postId) {
      const findComment = yield this.ctx.model.comment.find({
        postId,
      });

      // 不是 PT 里的
      return findComment.map(item => {
        item.fromPt = 'no';
        return item;
      });
    }
  }
  return commentService;
};
