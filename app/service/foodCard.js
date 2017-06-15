'use strict';

const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const escaper = require('true-html-escape');

module.exports = app => {
  class FoodCardService extends app.Service {

    /**
     * @desc 获得用户数据，暴露给 C
     * @param {string} username 学号
     * @param {string} password 密码
     * @return {object} 用户信息（包含 cookies）
     */
    * getUserInfo(username, password) {
      const cookies = yield this.getOriginCookie();
      yield this.putCheckpicCode(cookies);
      yield this.loginStudent(cookies, '4015', username, password);
      const userInfo = yield this.fetchUserInfo(cookies);
      return userInfo;
    }

    /**
     * @desc 获取用户当日消费情况，暴露给 C
     * @param {string} cookies cookies
     * @param {string} accountId 银行卡后 5 位
     * @return {object} {costToday, history{time, location, cost}}
     */
    * getCostToday(cookies, accountId) {
      const costToday = yield this.fetchCostToday(cookies, accountId);
      return costToday;
    }

    /**
     * @desc 获取起止时间的消费情况，暴露给 C
     * @param {string} start 起始时间
     * @param {string} end 结束时间
     * @param {string} cookies cookies
     * @param {string} accountId 银行卡后 5 位
     * @param {string} searchType 查询种类
     * @return {object} {costDuring, history{time, location, cost}}
     */
    * getCostDuring(start, end, cookies, accountId, searchType = 'all') {
      const relativeLink = yield this.fetchCostDuringSubmitActionLink(cookies);
      const relativeChooseLink = yield this.fetchCostDuringDataChoose(cookies, relativeLink, accountId, searchType);
      const relativeDataGetLink = yield this.fetchCostDuringDataGet(cookies, relativeChooseLink, start, end);
      const result = yield this.fetchCostDuringDataResult(cookies, relativeDataGetLink);
      return result;
    }

    /**
     * @desc 获取第一次登陆的 cookies，用于图片验证
     * @return {string} cookies
     */
    * getOriginCookie() {
      const { foodCard } = this.app.config;
      const homeLogin = yield this.ctx.curl(`${foodCard.site}${foodCard.homeLogin}`);
      const cookies = homeLogin.headers['set-cookie'][0].split(';')[0];
      console.log(cookies);
      return cookies;
    }

    /**
     * @desc 强行指定验证码
     * @param {string} cookies cookies
     * @return {boolean} 请求成功
     */
    * putCheckpicCode(cookies) {
      const { foodCard } = this.app.config;
      yield this.ctx.curl(`${foodCard.site}${foodCard.checkpicCode}`, {
        headers: {
          Cookie: cookies,
        },
      });
      return true;
    }

    /**
     * @desc 登录，验证验证码
     * @param {string} cookies cookies
     * @param {string} code 验证码
     * @param {string} username 用户名
     * @param {string} passowrd  密码
     */
    * loginStudent(cookies, code, username, passowrd) {
      const { foodCard } = this.app.config;
      yield this.ctx.curl(`${foodCard.site}${foodCard.loginStudent}`, {
        method: 'POST',
        headers: {
          Cookie: cookies,
        },
        data: {
          name: username,
          userType: 1,
          passwd: passowrd,
          loginType: 2,
          rand: code,
        },
      });
    }

    /**
     * @desc 爬虫获取用户信息
     * @param {string} cookies cookies
     * @return {object} 用户信息
     */
    * fetchUserInfo(cookies) {
      const { foodCard } = this.app.config;

      const data = yield this.ctx.curl(`${foodCard.site}${foodCard.accountcardUser}`, {
        headers: {
          Cookie: cookies,
        },
      });

      const decodeCtx = iconv.decode(data.data, 'utf8');
      // console.log(decodeCtx);

      const $ = cheerio.load(decodeCtx);
      const name = $('.neiwen div')[1].children[0].data;
      const accountId = $('.neiwen div')[3].children[0].data;
      const studentId = $('.neiwen div')[9].children[0].data;
      const balance = $('.neiwen')[46].children[0].data.split('（', 2)[0];

      const userInfo = {
        name,
        accountId,
        studentId,
        balance,
        cookies,
      };

      return userInfo;
    }

    /**
     * @desc 爬虫获取今日消费数据
     * @param {string} cookies cookies
     * @param {string} accountId 银行卡后 5 位
     * @return {array} 消费数据
     */
    * fetchCostToday(cookies, accountId) {
      const { foodCard } = this.app.config;

      const data = yield this.ctx.curl(`${foodCard.site}${foodCard.accounttodatTrjnObject}`, {
        method: 'POST',
        headers: {
          Cookie: cookies,
        },
        data: {
          account: accountId,
          inputObject: 'all',
        },
      });
      const decodeCtx = iconv.decode(data.data, 'gb2312');
      const $ = cheerio.load(decodeCtx);

      // 获得今日消费总数
      const infoToday = $('#tables .bl').last().text();
      const regCostToday = /:([0-9\.-]*)（/;
      const costToday = regCostToday.exec(infoToday)[1];

      const listodd = $('#tables .listbg');
      const listeven = $('#tables .listbg2');

      const history = [];

      for (let i = 0, l = listeven.length; i < l; i++) {
        history.push(this.getConRecord(listodd[i]));
        history.push(this.getConRecord(listeven[i]));
      }
      if (listodd.length > listeven.length) {
        history.push(this.getConRecord(listodd[listodd.length - 1]));
      }

      return {
        costToday,
        history,
      };
    }

    /**
     * @desc cherrio 取数据封装
     * @param {Node} item cherrio 得到的 Node
     * @return {object} 转为对象输出
     */
    getConRecord(item) {
      const time = item.children[1].children[0].data.trim();
      const location = item.children[9].children[0].data.trim();
      const cost = item.children[13].children[0].data.trim();
      return {
        time,
        location,
        cost,
      };
    }

    /**
     * @desc 获取点击 	历史流水查询 -> 确定 的链接
     * @param {string} cookies cookies
     * @return {string} 相对链接
     */
    * fetchCostDuringSubmitActionLink(cookies) {
      const { foodCard } = this.app.config;

      const submitActionPage = yield this.ctx.curl(`${foodCard.site}${foodCard.accounthisTrjn}`, {
        method: 'GET',
        headers: {
          Cookie: cookies,
        },
      });

      const decodeCtx = iconv.decode(submitActionPage.data, 'gb2312');

      const $ = cheerio.load(decodeCtx);
      const relativeLink = $('#accounthisTrjn')[0].attribs.action;

      return relativeLink;
    }

    /**
     * @desc 点击确定，进入历史查询选择
     * @param {string} cookies cookies
     * @param {string} relativeLink 相对链接
     * @param {string} accountId id
     * @param {string} searchType 查询种类 all（全部）、13（存款）
     * @return {string} 相对链接
     */
    * fetchCostDuringDataChoose(cookies, relativeLink, accountId, searchType = 'all') {
      const { foodCard } = this.app.config;

      const duringChoosePage = yield this.ctx.curl(`${foodCard.site}${relativeLink}`, {
        method: 'POST',
        headers: {
          Cookie: cookies,
        },
        data: {
          account: accountId,
          inputObject: searchType,
        },
      });

      const decodeCtx = iconv.decode(duringChoosePage.data, 'gb2312');

      const $ = cheerio.load(decodeCtx);
      const relativeChooseLink = $('#accounthisTrjn')[0].attribs.action;

      return relativeChooseLink;
    }

    /**
     * @desc 正在加载中进度条，获取最后一步的链接
     * @param {string} cookies cookies
     * @param {string} relativeChooseLink 相对选择链接
     * @param {string} start 开始时间 20170327
     * @param {string} end 结束时间 20170330
     * @return {string} 进度条过度相对链接
     */
    * fetchCostDuringDataGet(cookies, relativeChooseLink, start, end) {
      const { foodCard } = this.app.config;

      const data = yield this.ctx.curl(`${foodCard.site}${relativeChooseLink}`, {
        method: 'POST',
        headers: {
          Cookie: cookies,
        },
        data: {
          inputStartDate: start,
          inputEndDate: end,
        },
      });

      const decodeCtx = iconv.decode(data.data, 'gb2312');

      const $ = cheerio.load(decodeCtx);
      const relativeDataGetLink = $('form[name=form1]')[0].attribs.action;

      return relativeDataGetLink;
    }

    /**
     * @desc 查询结果起止时间内的结果
     * @param {string} cookies cookies
     * @param {string} relativeDataGetLink 相对链接
     * @return {object} {costDuring, history{time, location, cost}}
     */
    * fetchCostDuringDataResult(cookies, relativeDataGetLink) {
      const { foodCard } = this.app.config;

      const data = yield this.ctx.curl(`${foodCard.site}${foodCard.accounthisTrjn}${relativeDataGetLink}`, {
        method: 'GET',
        headers: {
          Cookie: cookies,
        },
      });

      const decodeCtx = iconv.decode(data.data, 'gb2312');

      const $ = cheerio.load(decodeCtx);

      const info = $('#tables .bl').last().text();
      const regCostDuring = /:([0-9\.-]*)（/;
      let costDuring = regCostDuring.exec(info)[1];

      if (costDuring[0] === '-') costDuring = costDuring.slice(1);

      const listodd = $('#tables .listbg');
      const listeven = $('#tables .listbg2');

      const history = [];

      for (let i = 0, l = listeven.length; i < l; i++) {
        history.push(this.getConRecord(listodd[i]));
        history.push(this.getConRecord(listeven[i]));
      }
      if (listodd.length > listeven.length) {
        history.push(this.getConRecord(listodd[listodd.length - 1]));
      }

      return {
        costDuring,
        history,
      };
    }
  }
  return FoodCardService;
};
