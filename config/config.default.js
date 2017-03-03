'use strict';

module.exports = appInfo => {
  const config = {};

  // should change to your own
  config.keys = appInfo.name + '123456';


  // 今日哈工大地址
  config.todayUrl = 'http://today.hit.edu.cn';
  // 今日哈工大返回 pageSize
  config.todaySize = 3;
  // 今日哈工大爬虫地址 MAP
  config.todayMap = {
    // 管理学院
    'MANAGEMENT': 3
  };
  // 今日哈工大特定新闻打底缩略图
  config.todayNewsFirstImageDefaultArr = [
    'https://okujk9avg.bkt.clouddn.com/20170302148846166491367.png',
    'https://okujk9avg.bkt.clouddn.com/20170302148846173968927.png',
    'https://okujk9avg.bkt.clouddn.com/20170302148846178813468.png'
  ];

  // 心知天气 API 需要
  // https://api.thinkpage.cn/v3/weather/now.json?key=vzjfy7yvepyzv0ay&location=haerbin&language=zh-Hans&unit=c
  config.weatherUrl = 'https://api.thinkpage.cn/v3/weather/now.json';
  config.weatherKey = 'vzjfy7yvepyzv0ay';
  config.weatherErrorTips = '亲！天气查询接口好像疯了~';

  // middleware
  config.middleware = [
    'robot'
  ];

  // detail for middleware
  config.robot = {
    ua: [
      /Baiduspider/i,
    ]
  };

  return config;
};
