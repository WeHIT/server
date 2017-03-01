'use strict';

module.exports = appInfo => {
  const config = {};

  // should change to your own
  config.keys = appInfo.name + '123456';
  // 今日哈工大地址
  config.todayUrl = 'http://today.hit.edu.cn';
  // 今日哈工大返回 pageSize
  config.todaySize = 3;

  return config;
};
