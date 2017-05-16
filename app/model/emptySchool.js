'use strict';

module.exports = mongoose => {
  /**
   * @desc
   */
  const emptySchooldSchema = new mongoose.Schema({
    xiaoqu: { type: String }, // 校区
    house: { type: String }, // 哪栋楼
    live: { type: String }, // 具体哪个教室
    week: { type: String }, // 第几周
    weekDay: { type: String }, // 星期几
    time: { type: String }, // 时间 12 34 56 78 910 1112
    isEmpty: { type: Number }, // 0 代表不空 1 代表空
  });
  return mongoose.model('emptySchool', emptySchooldSchema);
};
