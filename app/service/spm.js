/**
 * Created by rccoder on 11/06/2017.
 */
'use strict';

module.exports = app => {
  class spmService extends app.Service {
    /**
     * @desc 保存spm和设备信息到数据库
     * @param spm spm
     * @param device 设备信息
     * @returns {boolean}
     */
    * saveToDb(spm, device) {
      const spmArr = spm.split('.');
      const {
        uniqueId,
        manufacturer,
        brand,
        model,
        deviceId,
        systemName,
        systemVersion,
        version,
        deviceName,
        userAgent,
        local,
        isEmulator,
      } = device;
      if(spmArr.length === 4) {
        const spmAndDevice = new this.ctx.model.spm({
          a: spmArr[0],
          b: spmArr[1],
          c: spmArr[2],
          d: spmArr[3],
          uniqueId,
          manufacturer,
          brand,
          model,
          deviceId,
          systemName,
          systemVersion,
          version,
          deviceName,
          userAgent,
          local,
          isEmulator,
        });

        yield spmAndDevice.save();
      }
      return false;
    }
  }
  return spmService;
};
