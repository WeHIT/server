/**
 * Created by rccoder on 01/03/2017.
 */

const iconv = require('iconv-lite');
const cheerio = require('cheerio');

module.exports = app => {
  class TodayService extends app.Service {
    * news(command) {
      switch (command.type) {
        case 'searchTag':
          const { todayUrl, todaySize } = this.app.config;

          const spiderCtx = yield this.ctx.curl(`${todayUrl}/depart/3.htm`);

          const decodeCtx = iconv.decode(spiderCtx.data, 'gb2312');

          const ctxArray = [];
          let $ = cheerio.load(decodeCtx);
          $('#right #left #main #content ul li').each(function() {
            ctxArray.push({
              title: $(this).text(),
            })
          })

          console.log(ctxArray)
          return 1;
          break;
        default:
          break;
      }
    }
  }
  return TodayService;

};
