'use strict';

module.exports = mongoose => {

  const commentSchema = new mongoose.Schema({
    added: { type: String }, // 增加日期
    userId: { type: String }, // 评论者 id
    postId: { type: String }, // 评论文章 id
    postType: { type: String }, // 评论文章类型 新闻？二手？
    content: { type: String },
  });
  return mongoose.model('comment', commentSchema);
};
