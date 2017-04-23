/**
 * Created by rccoder on 01/03/2017.
 */
'use strict';
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const escaper = require('true-html-escape');
const util = require('../util/index');

module.exports = app => {
  class TodayService extends app.Service {

    // time 时间倒序
    * getRecentNewFromDb(tag, limit = 4) {
      let findNews;
      if (tag === 'all') {
        findNews = yield this.ctx.model.todayNews.find({}, null, { sort: { time: -1 } }).limit(limit);
      } else {
        findNews = yield this.ctx.model.todayNews.find({
          tag,
        }, null, { sort: { time: -1 } }).limit(limit);
      }
      return findNews;
    }

    /**
     * @desc 根据文章 id 获取内容
     * @param {string} id 文章id
     * @return {object} return findNews Object
     */
    * getPostFromDbByID(id) {
      const findNew = yield this.ctx.model.todayNews.findOne({
        _id: id,
      });
      return findNew;
    }

    /**
     * 根据 command 爬取相关分类文章，暴露给 schedule
     * @param command
     * @return {*}
     */
    * rencentNews(command) {
      return yield this.getRencentNews(command);
    }

    /**
     * 根据 url 爬取特定 url 的相关信息，暴露给 controller
     * @param url
     * @returns {*}
     */
    * specialNews(url) {
      return yield this.getSpecialNews(url);
    }


    /**
     * 根据 command 爬取相关分类文章
     * @param command
     */
    * getRencentNews(command) {
      switch (command.type) {
        case 'searchTag': {
          const { todayUrl } = this.app.config;

          const spiderCtx = yield this.ctx.curl(`${todayUrl}/depart/${command.text.id}.htm`);

          const decodeCtx = iconv.decode(spiderCtx.data, 'gb2312');

          const $ = cheerio.load(decodeCtx);

          const ctxArray = [];

          $('#right #left #main #content ul li').each(function() {
            const targetNode = $(this).children();
            ctxArray.push({
              title: targetNode.text(),
              href: todayUrl + targetNode.attr('href'),
            });
          });

          for (let i = 0, l = ctxArray.length; i < l; i++) {

            const specialNews = yield this.getSpecialNews(ctxArray[i].href);
            ctxArray[i].firstSrc = specialNews.firstImg;
            ctxArray[i].content = specialNews.content;
            ctxArray[i].time = specialNews.time;
          }

          return ctxArray;
        }
        default: {
          break;
        }
      }
    }

    /**
     * 获取 today 上特定 URL 的内容，第一张图片
     * @param url
     * @returns {{firstImg: string, content: jQuery}}
     */
    * getSpecialNews(url) {
      const { todayUrl, todayNewsFirstImageDefaultArr } = this.app.config;

      const spiderCtx = yield this.ctx.curl(url);
      const decodeCtx = iconv.decode(spiderCtx.data, 'gb2312');

      const $ = cheerio.load(decodeCtx);

      // 随机抽取图片
      let firstImg = util.randomFirstImgSrc(todayNewsFirstImageDefaultArr);

      $('#text img').each(function(index) {
        const originSrc = $(this).attr('src');
        $(this).attr('src', todayUrl + originSrc);

        if (index === 0) {
          firstImg = todayUrl + originSrc;
        }
      });

      // 正则匹配时间
      const dataReg = /\d{4}(\-)\d{1,2}(\-)\d{1,2}(\s+)\d{1,2}:\d{1,2}:\d{1,2}/;
      const time = escaper.unescape($('#date').html()).match(dataReg) ? new Date(escaper.unescape($('#date').html()).match(dataReg)[0]).getTime() : 'not time';

      return {
        firstImg,
        content: escaper.unescape($('#text').html()),
        time,
      };
    }

  }

  return TodayService;

};
