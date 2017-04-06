'use strict';

const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const escaper = require('true-html-escape');

module.exports = app => {
  class emptySchoolService extends app.Service {

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
          pageCddm: emptySchool.liveMap[house][live],
        },
      });

      const decodeCtx = iconv.decode(data.data, 'utf8');
      const $ = cheerio.load(decodeCtx);

      const result = [];

      const tr = $('.list tr');
      //console.log(tr.eq(2).children().eq(0)[0].children[0].data);

      for (let i = 2; i < $('.list tr').length; i++) {
        // const live = tr.eq(i).children().eq(0).children().eq(0);
        // console.log(live)
        // //onst live = tr[i].children[1].children[0].data;

        // console.log(tr.eq(i).children().eq(0)[0].children[0].data);
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
              data: parseInt((j - 1) / 6) + 1, // 周几
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
