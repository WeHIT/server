'use strict';

module.exports = appInfo => {

  return {
    // should change to your own
    keys: appInfo.name + '123456',
    secret: '123456',

    // 今日哈工大地址
    todayUrl: 'http://today.hit.edu.cn',
    // 今日哈工大返回 pageSize
    todaySize: 3,
    // 今日哈工大爬虫地址 MAP
    todayMap: {
      // 管理学院
      MANAGEMENT: 3,
    },
    // 今日哈工大特定新闻打底缩略图
    todayNewsFirstImageDefaultArr: [
      'https://okujk9avg.bkt.clouddn.com/20170302148846166491367.png',
      'https://okujk9avg.bkt.clouddn.com/20170302148846173968927.png',
      'https://okujk9avg.bkt.clouddn.com/20170302148846178813468.png'
    ],

    // 心知天气 API 需要
    // https://api.thinkpage.cn/v3/weather/now.json?key :vzjfy7yvepyzv0ay&location :haerbin&language :zh-Hans&unit :c
    weatherUrl: 'https://api.thinkpage.cn/v3/weather/now.json',
    weatherKey: 'vzjfy7yvepyzv0ay',
    weatherErrorTips: '亲！天气查询接口好像疯了~',

    foodCard: {
      site: 'http://172.31.7.16', // base
      homeLogin: '/homeLogin.action', // 首页
      checkpicCode: '/getCheckpic.action?rand=4015.2017842046916', // 验证码地址
      loginStudent: '/loginstudent.action', // 登录地址
      accountcardUser: '/accountcardUser.action', // 获取用户信息
      accounttodatTrjnObject: '/accounttodatTrjnObject.action', // 查询当日
      accounthisTrjn: '/accounthisTrjn.action', // 历史查询
    },

    // middleware
    middleware: [
      'robot',
      //'gzip',
    ],

    // detail for middleware
    robot: {
      ua: [
        /Baiduspider/i,
      ],
    },
    gzip: {
      threshold: 10240,
    },
    bodyParser: {
      jsonLimit: '8mb',
      formLimit: '8mb',
    },
    multipart: {
      fileExtensions: [

      ],
    },
    mongoose: {
      url: 'mongodb://127.0.0.1/WeHIT',
      options: {},
    },
    security: {
      csrf: {
        ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
      },
    },
  };
};
