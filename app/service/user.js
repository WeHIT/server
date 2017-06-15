'use strict';

module.exports = app => {
  class UserService extends app.Service {
    /**
     * @desc 获取用户信息
     * @param {string} id 用户 id
     * @return {object} 用户信息
     */
    * getUserInfo(id) {
      const data = yield this.ctx.model.user.find({
        id,
      });
      if (data && data.length > 0) {
        return data[0];
      }
      return null;
    }

    /**
     * @desc 增加用户
     * @param info {Object} 用户信息
     */
    * saveUser(info) {
      return;
    }

    /**
     * @desc 更新用户信息
     * @params id {string} 用户id
     * @param info {object} 用户新信息
     */
    * updateUser(id, info) {
      return;
    }
  }
  return UserService;
};
