'use strict';

module.exports = mongoose => {
  /**
   * @desc 记录登录用户的快递查询记录
   */
  const expressSchema = new mongoose.Schema({
    username: { type: String }, // 用户名
    logisticCode: { type: String }, // 单号
    shipperCode: { type: Array }, // 快递公司编码 数组
    step: { type: String }, // 快递状态，用户是否展示
  });
  return mongoose.model('express', expressSchema);
};
