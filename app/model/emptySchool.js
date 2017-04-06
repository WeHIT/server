'use strict';

module.exports = mongoose => {
  /**
   * @desc 只存占用了的
   */
  const emptySchooldSchema = new mongoose.Schema({
    xiaoqu: { type: String }, // 校区
    house: { type: String }, // 哪栋楼
    live: { type: String }, // 具体哪个教室
    data: { type: String }, // 星期几
    time: { type: String }, // 时间 12 34 56 78 910 1112
  });
  return mongoose.model('emptySchool', emptySchooldSchema);
};
