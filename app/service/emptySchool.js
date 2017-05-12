'use strict';

const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const escaper = require('true-html-escape');
const util = require('../util/index');

module.exports = app => {
  class emptySchoolService extends app.Service {

    /**
     * @desc 获取特定楼宇的信息
     * @param xiaoqu
     * @param house
     * @param week
     */
    * curlEmptySchoolByHouse(xiaoqu = '一校区', house = '正心楼', week) {

      if (!week) {
        week = util.getCurrentWeek('2017-2-26') + 1;
      }
      // 总页数
      let pageCount = 1;
      // 当前页数
      let pageIndex = 1;
      let pageSize = 20;

      while(pageCount >= pageIndex) {

        const curlData = yield this.curlEmptySchoolByPage(xiaoqu, house, week, pageIndex, pageSize, pageCount);

        const result = yield this.handleCurlDataToArray(curlData, xiaoqu, house, week);

        pageCount = result.pageCount;

        console.log(`===第${pageIndex}页===`);
        console.log(JSON.stringify(result));

        // 保存到数据库
        yield this.saveToDb(result.result);

        pageIndex ++;
      }

    }

    /**
     * @desc 获取特定楼宇 特定页 的信息
     * @param xiaoqu
     * @param house
     * @param week
     * @param pageNo
     * @param pageSize
     * @param pageCount
     */
    * curlEmptySchoolByPage(xiaoqu = '一校区', house = '正心楼', week, pageNo, pageSize, pageCount) {
      const { emptySchool } = this.app.config;


      // 封装 POST 的数据
      let postData = {};
      // 第一页不发生 pageNo pageSize pageCount
      if (pageNo && pageNo === 1) {
        postData = {
          pageXnxq: '2016-20172',
          pageZc1: week,
          pageZc2: week,
          pageXiaoqu: emptySchool.xiaoquMap[xiaoqu],
          pageLhdm: xiaoqu === '一校区' ? emptySchool.houseMap[house] : emptySchool.houseTwoMap[house],
        }
      } else {
        postData = {
          pageNo: pageNo,
          pageSize: pageSize,
          pageCount: pageCount,
          pageXnxq: '2016-20172',
          pageZc1: '11',
          pageZc2: '11',
          pageXiaoqu: emptySchool.xiaoquMap[xiaoqu],
          pageLhdm: emptySchool.houseMap[house],
        }
      }

      const data = yield this.ctx.curl(`${emptySchool.site}`, {
        method: 'POST',
        headers: {
          contentType: 'application/x-www-form-urlencoded',
          Cookie: emptySchool.cookie,
          Host: emptySchool.host,
          Origin: emptySchool.origin,
          Referer: emptySchool.referer,
          UserAgent: emptySchool.userAgent,
        },
        data: postData,
      });

      return data;
    }

    /**
     * @desc 爬虫爬到的数组处理为数组
     * @param curlData
     * @param xiaoqu
     * @param house
     * @param week
     */
    * handleCurlDataToArray(curlData, xiaoqu, house, week) {
      const data = curlData.data;

      const decodeCtx = iconv.decode(data, 'utf8');

      const $ = cheerio.load(decodeCtx);

      // 获取PageSize PageCount

      const pageSize = $("#pageSize").val();
      const pageCount = $("#pageCount").val();

      // 塞页面数据-红色的-代表已经占用的
      const result = [];

      const trDom = $(".list tr");

      for (let row = 2; row < trDom.length; row++) {
        const live = trDom.eq(row).children().eq(0)[0].children[0].data;

        for (let col = 1; col < trDom.eq(row).children().length; col++) {
          if (trDom.eq(row).children().eq(col)
              .children()
              .eq(0)
              .hasClass('kjs_icon')) {
            result.push({
              xiaoqu,
              house,
              live,
              week,
              weekDay: parseInt((col - 1) / 6) + 1, // 周几
              time: (col - 1) % 6 + 1, // 时间 12 34 56 78 910 1112 0 1 2 3 4 5
            });
          }
        }
      }

      return {
        result,
        pageSize,
        pageCount
      };
    }


    /**
     * @desc 查询到的数组保存到数据库
     * @param resultArray
     */
    * saveToDb(resultArray) {
      for(let i = 0; i < resultArray.length; i++) {
        yield this.ctx.model.emptySchool.findOneAndUpdate({
          xiaoqu: resultArray[i].xiaoqu,
          house: resultArray[i].house,
          live: resultArray[i].live,
          week: resultArray[i].week,
          weekDay: resultArray[i].weekDay,
          time: resultArray[i].time,
        }, {
          xiaoqu: resultArray[i].xiaoqu,
          house: resultArray[i].house,
          live: resultArray[i].live,
          week: resultArray[i].week,
          weekDay: resultArray[i].weekDay,
          time: resultArray[i].time,
        }, {
          upsert: true,
          new: true
        });
      }
    }

    /**
     * @importent 该接口已经废弃
     * @desc 获取特定校区特定楼宇特定教室的信息
     * @param xiaoqu
     * @param house
     * @param live
     * @returns {Array}
     */
    * curlEmptySchool(xiaoqu = '一校区', house = '正心楼', live = '正心109') {

      const { emptySchool } = this.app.config;
      const data = yield this.ctx.curl(`${emptySchool.site}`, {
        method: 'POST',
        headers: {
          contentType: 'application/x-www-form-urlencoded',
        },
        data: {
          pageXnxq: '2016-20172',
          pageZc1: '11',
          pageZc2: '11',
          pageXiaoqu: emptySchool.xiaoquMap[xiaoqu],
          pageLhdm: emptySchool.houseMap[house],
          //pageCddm: emptySchool.liveMap[house][live],
          pageCddm: '',
        },
      });

      const decodeCtx = iconv.decode(data.data, 'utf8');
      const $ = cheerio.load(decodeCtx);

      const result = [];

      const tr = $(".list tr");

      for (let i = 2; i < $('.list tr').length; i++) {
        const live = tr.eq(i).children().eq(0)[0].children[0].data;

        for (let j = 1; j < tr.eq(i).children().length; j++) {
          if (tr.eq(i).children().eq(j)
          .children()
          .eq(0)
          .hasClass('kjs_icon')) {
            result.push({
              xiaoqu,
              house,
              live,
              weekDay: parseInt((j - 1) / 6) + 1, // 周几
              time: (j - 1) % 6 + 1, // 时间 12 34 56 78 910 1112 0 1 2 3 4 5
            });
          }
        }
      }
      return result;
    }
  }
  return emptySchoolService;
};
