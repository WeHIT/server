'use strict';

module.exports = () => {
  return {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    schedule: {
      interval: '1m', // 1 分钟间隔
      type: 'all', // 指定所有的 worker 都需要执行,
      immediate: true,
    },
    // task 是真正定时任务执行时被运行的函数，第一个参数是一个匿名的 Context 实例
    * task(ctx) {
      const { emptySchool } = ctx.app.config;

      const data = yield ctx.service.emptySchool.curlEmptySchool();

      for (let i = 0; i < data.length; i++) {
        const findEmptySchool = yield ctx.model.emptySchool.find({
          xiaoqu: data[i].xiaoqu,
          house: data[i].house,
          live: data[i].live,
          data: data[i].data,
          time: data[i].time,
        });

        if (!findEmptySchool || findEmptySchool.length <= 0) {
          console.log('inset empty school');
          const newEmptySchool = new ctx.model.emptySchool({
            xiaoqu: data[i].xiaoqu,
            house: data[i].house,
            live: data[i].live,
            data: data[i].data,
            time: data[i].time,
          });
          yield newEmptySchool.save();
        }
      }
      console.log(data);

    },
  };
};
