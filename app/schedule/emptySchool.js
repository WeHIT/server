'use strict';

module.exports = () => {
  return {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    schedule: {
      interval: '100m', // 1 分钟间隔
      type: 'all', // 指定所有的 worker 都需要执行,
      immediate: false,
    },
    // task 是真正定时任务执行时被运行的函数，第一个参数是一个匿名的 Context 实例
    * task(ctx) {
      const { emptySchool } = ctx.app.config;

      // 调用 service 获取并且持久化

      // 一校区持久化
      for (let house in emptySchool.houseMap) {
        if(emptySchool.houseMap.hasOwnProperty(house)) {
          yield ctx.service.emptySchool.curlEmptySchoolByHouse('一校区', house);
        }
      }

      // 二校区持久化
      for (let house in emptySchool.houseTwoMap) {
        if(emptySchool.houseTwoMap.hasOwnProperty(house)) {
          yield ctx.service.emptySchool.curlEmptySchoolByHouse('二校区', house);
        }
      }

    },
  };
};
