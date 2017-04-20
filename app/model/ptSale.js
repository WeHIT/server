'use strict';

module.exports = mongoose => {

  const ptSaleSchema = new mongoose.Schema({
    added: { type: String }, // 增加日期
    subject: { type: String }, // 主题
    firstImg: { type: String }, // 图片
    comment: { type: Array }, // 评论
    topicid: { type: String }, // 主题 id
    locked: { type: String }, // "locked" 已购 "lockednew" 已售
  });
  return mongoose.model('ptSale', ptSaleSchema);
};
