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
      const { todayMap } = ctx.app.config;

      for (const prop in todayMap) {
        console.log('===========')
        const newsList = yield ctx.service.today.rencentNews({
          type: 'searchTag',
          text: todayMap[prop],
        });
        for (let i = 0; i < newsList.length; i++) {
          const findTodayNews = yield ctx.model.todayNews.find({
            title: newsList[i].title,
            href: newsList[i].href,
            tag: prop,
          });

          if (!findTodayNews || findTodayNews.length <= 0) {
            const todayNews = new ctx.model.todayNews({
              title: newsList[i].title,
              href: newsList[i].href,
              firstImg: newsList[i].firstSrc,
              content: newsList[i].content,
              time: newsList[i].time,
              data: '',
              tag: prop,
            });
            yield todayNews.save();
          }
        }
      }

    },
  };
};
