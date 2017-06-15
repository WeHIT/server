'use strict';

const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const escaper = require('true-html-escape');
const convert = require('bbfy').converter();

module.exports = app => {
  class PtSaleService extends app.Service {

    /**
     * @desc 获取纯二手交易 list
     */
    * getPtSalePostList() {
      const saleInfoListHTML = yield this.getPtSalePost();
      const saleInfoList = yield this.getPostObj(saleInfoListHTML);
      const pureSaleInfoList = yield this.getPuerSaleList(saleInfoList);
      // const comment = yield this.getComment(pureSaleInfoList[0].topicid);
      // console.log(comment);
      return pureSaleInfoList;
    }

    /**
     * @desc 保存到数据库做持久化
     * @param {list} pureSaleInfoList 纯的二手交易信息
     */
    * saveToDb() {

      const { pt } = this.app.config;

      const pureSaleInfoList = yield this.getPtSalePostList();
      const imgReg = /\[img].*?\[\/img]/;

      for (let i = 0; i < pureSaleInfoList.length; i++) {
        const comment = yield this.getComment(pureSaleInfoList[i].topicid);
        yield this.ctx.model.ptSale.findOneAndUpdate({
          topicid: pureSaleInfoList[i].topicid,
        }, {
          added: new Date(pureSaleInfoList[i].added).getTime(),
          subject: pureSaleInfoList[i].subject,
          firstImg: comment[0].body.match(imgReg) ? comment[0].body.match(imgReg)[0].slice(5, -6) : pt.defaultImg,
          comment,
          topicid: pureSaleInfoList[i].topicid,
          locked: pureSaleInfoList[i].img === 'locked' || pureSaleInfoList[i].img === 'locked' ? 'locked' : 'notLocked', // "locked" 已购 "lockednew" 已售
        }, {
          upsert: true,
          new: true,
        });
      }
    }

    /**
     * @desc 从数据库获取最新二手
     * @param {string} 数量
     * @param {string} 类型 {所有的还是没有成交的}
     * @return {Array} 查询到的对象
     */
    * getPostFromDB(limit = 4, type = 'undone') {
      let post;
      if (type === 'undone') {
        post = yield this.ctx.model.ptSale.find({
          locked: 'notLocked',
        }, null, {
          sort: {
            added: -1,
          },
        }).limit(limit);
      } else {
        post = yield this.ctx.model.ptSale.find({}, null, {
          sort: {
            added: -1,
          },
        }).limit(limit);
      }
      return post;
    }

    /**
     * @desc 获取特定二手信息的内容
     * @param id
     * @returns {*}
     */
    * getPostFromDbByID(id) {
      const post = yield this.ctx.model.ptSale.findOne({
        _id: id,
      });
      return post;
    }

    /**
     * @desc 获取清影 PT 交易 HTML
     * @return {string} 页面HTML
     */
    * getPtSalePost() {
      const { pt } = this.app.config;

      const saleInfoList = yield this.ctx.curl(`${pt.saleSite}`, {
        method: 'GET',
        headers: {
          UserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
          Cookie: pt.cookies,
        },
      });

      const decodeCtx = iconv.decode(saleInfoList.data, 'utf8');

      return decodeCtx;
    }

    /**
     * @desc 从 HTML 获取 POST 数组
     * @param {string} saleInfoListHTML 页面HTML
     * @return {list} 所有 list
     */
    * getPostObj(saleInfoListHTML) {
      const scriptReg = /id='passToClient'>var passToClient = .*;<\/script>/;
      const data = saleInfoListHTML.match(scriptReg);
      if (data) {
        const regContent = data[0].slice(37, -10);
        try {
          return JSON.parse(regContent).posts;
        } catch (e) {}
      }
    }

    /**
     * @desc 过滤掉公告
     * @param {list} saleInfoList 所有 list
     * @return {list} 列表
     */
    * getPuerSaleList(saleInfoList) {
      return saleInfoList.filter(item => item.sticky !== true);
    }

    /**
     * @desc 获取交易的相关评论
     * @param {string} topicid topic id
     */
    * getComment(topicid) {
      console.log(topicid);
      const { pt } = this.app.config;
      const commentHTML = yield this.ctx.curl(`${pt.topicSite}&topicid=${topicid}`, {
        method: 'GET',
        headers: {
          UserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
          Cookie: pt.cookies,
        },
      });
      const decodeCtx = iconv.decode(commentHTML.data, 'utf8');

      const scriptReg = /id='passToClient'>var passToClient = .*;<\/script>/;
      const data = decodeCtx.match(scriptReg);
      if (data) {
        const commentContent = data[0].slice(37, -10);
        try {
          const commentObj = JSON.parse(commentContent);
          const commentList = [];

          const timeReg = /\d{4}(\-)\d{1,2}(\-)\d{1,2}(\s+)\d{1,2}:\d{1,2}:\d{1,2}/;

          for (let i = 0; i < commentObj.forumsInfo.length; i++) {
            commentList.push({
              added: (commentObj.forumsInfo[i].added).match(timeReg)[0],
              body: commentObj.forumsInfo[i].body.replace(/]\/large\//g, ']//pt.hit.edu.cn/large/'), // pt 曾经使用重定向
              posterid: commentObj.forumsInfo[i].posterid,
              username: '[PT]: ' + commentObj.posters[commentObj.forumsInfo[i].posterid].username,
              avatar: pt.site + '/' + commentObj.posters[commentObj.forumsInfo[i].posterid].avatar,
            });
          }
          return commentList;
        } catch (e) {
          throw new Error('PT Sales Get Comment err: ' + e);
        }
      }
    }
  }
  return PtSaleService;
};
