'use strict';

module.exports = mongoose => {
  const userSchema = new mongoose.Schema({
    // 学号
    id: { type: String },
    // 密码
    password: { type: String },
    // 学院
    college: { type: String },
    // 身份证后 6 位
    idCard: { type: String },
  });

  return mongoose.model('user', userSchema);
};
