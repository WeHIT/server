'use strict';

const urlencode = require('urlencode');
const md5 = require('md5');
const iconv = require('iconv-lite');

module.exports = app => {
  class ExpressService extends app.Service {

    /**
     * @desc 根据运单号获取物流信息
     * @param {string} logisticCode 运单号
     * @param {string} username 学号 default null
     * @return {object} 物流信息
     */
    * getInfo(logisticCode, username = null) {
      const result = {
        logisticCode,
      };
      const shipperCodeInfo = yield this.getCompanyById(logisticCode);

      // 保存用户历史快递
      yield this.saveExpressCompany(logisticCode, shipperCodeInfo, username);

      // 没有查到对应的运单公司代码
      if (shipperCodeInfo.Success !== true) {
        result.success = false;
        result.reason = `暂不支持该运单号，请检查运单号${logisticCode}输入是否正确`;
      } else {
        // 查到
        const content = [];
        for (let i = 0, l = shipperCodeInfo.Shippers.length; i < l; i++) {
          // 通过运单号和运单公司代码获取信息
          const data = yield this.getExpressInfoByIdAndSp(
            shipperCodeInfo.Shippers[i].ShipperCode,
            logisticCode);
          // 获取信息成功
          if (data.Success) {
            // 有物流信息就 push
            if (data.Traces && data.Traces.length > 0) {
              // content 字段 push 信息
              content.push({
                shipperName: shipperCodeInfo.Shippers[i].ShipperName, // 运单公司名字
                Traces: data.Traces,
              });
            }
            // 更新数据库中的物流 step
            yield this.updateExpressCompany(logisticCode, data.State, username);
          }
        }
        result.content = content;
      }
      return result;
    }

    /**
     * @desc 获取用户历史快递
     * @param {string} username 学号
     * @param {string} step 状态
     * @return {array} 用户历史快递 数组
     */
    * getHistoryInfo(username, step = 3) {
      const isStepExpress = yield this.getExpressInfoFromDbByStep(username, step);
      const result = [];
      for (let i = 0, l = isStepExpress.length; i < l; i++) {
        const data = yield this.getInfo(isStepExpress[i].logisticCode, username);
        result.push(data);
      }
      return result;
    }

    /**
     * @desc 根据运单号获取物流信息
     * @param {string} logisticCode 运单号
     * @return {object} 相关物流公司等
     */
    * getCompanyById(logisticCode) {
      const { expressAPI } = this.app.config;

      const data = yield this.ctx.curl(`${expressAPI.identification}`, {
        method: 'POST',
        headers: {
          contentType: 'application/x-www-form-urlencoded',
        },
        data: {
          RequestData: this.buildRequestData({ logisticCode }),
          EBusinessID: expressAPI.EBusinessID,
          RequestType: '2002',
          DataSign: this.buildDataSign({ logisticCode }),
          DataType: '2',
        },
      });

      const decodeCtx = iconv.decode(data.data, 'utf8');

      return JSON.parse(decodeCtx);
    }

    /**
     * @desc 快递信息实时查询
     * @param {string} shipperCode 快递公司编码
     * @param {string} logisticCode 物流单号
     * @return {object} 物流实时
     */
    * getExpressInfoByIdAndSp(shipperCode, logisticCode) {
      const { expressAPI } = this.app.config;

      const data = yield this.ctx.curl(`${expressAPI.identification}`, {
        method: 'POST',
        headers: {
          contentType: 'application/x-www-form-urlencoded',
        },
        data: {
          RequestData: this.buildRequestData({ shipperCode, logisticCode }),
          EBusinessID: expressAPI.EBusinessID,
          RequestType: '1002',
          DataSign: this.buildDataSign({ shipperCode, logisticCode }),
          DataType: '2',
        },
      });

      const decodeCtx = iconv.decode(data.data, 'utf8');
      return JSON.parse(decodeCtx);
    }

    /**
     * @desc 保存快递状态
     * @param {string} logisticCode 运单号
     * @param {obj} expressCompanyObj 该运单号的快递公司信息
     * @param {string|null|undefined} username 学号
     */
    * saveExpressCompany(logisticCode, expressCompanyObj, username) {
      const findExpress = yield this.ctx.model.express.find({
        username,
        logisticCode,
      });
      if (findExpress.length <= 0 && username) {
        const express = new this.ctx.model.express({
          username,
          logisticCode,
          shipperCode: expressCompanyObj.Shippers,
        });
        yield express.save();
      }
    }

    /**
     * @desc 更新快递信息
     * @param {string} logisticCode 运单号
     * @param {string} step step
     * @param {string} username 用户名
     */
    * updateExpressCompany(logisticCode, step, username) {
      yield this.ctx.model.express.findOneAndUpdate({
        username,
        logisticCode,
      }, {
        $set: { step: '' + step },
      });
    }

    /**
     * @desc 根据 step 获取数据库中该用户的数据
     * @param {string} username 学号
     * @param {string} step step
     * @return {array} 返回
     */
    * getExpressInfoFromDbByStep(username, step) {
      const data = yield this.ctx.model.express.find({
        username,
        step,
      });
      return data;
    }

    /**
     * @desc 获取 url 编码后的 utf8 数据
     * @param {object} data 请求数据
     * @return {string} 编码后的数据
     */
    buildRequestData(data) {
      return urlencode(JSON.stringify(data));
    }

    /**
     * @desc 获取数据内容签名
     * @param {object} data 请求数据 把(请求内容(未编码)+AppKey)进行MD5加密，然后Base64编码，最后 进行URL(utf-8)编码
     * @return {string} 签名
     */
    buildDataSign(data) {
      const { expressAPI } = this.app.config;
      return new Buffer(md5(JSON.stringify(data) + expressAPI.key)).toString('base64');
    }
  }
  return ExpressService;
};
