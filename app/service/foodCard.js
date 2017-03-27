'use strict';

const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const escaper = require('true-html-escape');

module.exports = app => {
  class FoodCardService extends app.Service {

    /**
     * 获得用户数据，暴露给 C
     * @param {*} username 
     * @param {*} password 
     */
    * getUserInfo(username, password) {
      const cookies = yield this.getOriginCookie();
      yield this.putCheckpicCode(cookies);
      yield this.loginStudent(cookies, '4015', username, password);
      const userInfo = yield this.fetchUserInfo(cookies);
      return userInfo;
    }

    /**
     * 
     * @param {*} cookies 
     * @param {*} accountId 银行卡后 5 位
     */
    * getCostToday(cookies, accountId) {
      const costToday = yield this.fetchCostToday(cookies, accountId);
      console.log(costToday);
      return costToday;
    }
    /**
     * 获取第一次登陆的 cookies
     */
    * getOriginCookie() {
      const { foodCard } = this.app.config;
      const homeLogin = yield this.ctx.curl(`${foodCard.site}${foodCard.homeLogin}`);
      const cookies = homeLogin.headers['set-cookie'][0].split(';')[0];
      console.log(cookies);
      return cookies;
    }

    /**
     * 强行指定验证码
     * @param {*} cookies 
     */
    * putCheckpicCode(cookies) {
      const { foodCard } = this.app.config;
      const checkpicCode = yield this.ctx.curl(`${foodCard.site}${foodCard.checkpicCode}`, {
        headers: {
          Cookie: cookies,
        },
      });
      return checkpicCode;
    }

    /**
     * 登录，验证验证码
     * @param {*} cookies 
     * @param {*} code 
     * @param {*} username 
     * @param {*} passowrd 
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
     * 获取用户信息
     * @param {*} cookies 
     */
    * fetchUserInfo(cookies) {
      const { foodCard } = this.app.config;

      const data = yield this.ctx.curl(`${foodCard.site}${foodCard.accountcardUser}`, {
        headers: {
          Cookie: cookies,
        },
      });

      const decodeCtx = iconv.decode(data.data, 'utf8');
      //console.log(decodeCtx);

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
     * 获取今日消费数据
     * @param {*} cookies 
     * @param {*} accountId 
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
     * cherrio 取数据封装
     * @param {*} item 
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

  }
  return FoodCardService;
};
