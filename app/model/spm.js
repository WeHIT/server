/**
 * Created by rccoder on 11/06/2017.
 */
'use strict';

module.exports = mongoose => {

  const spmSchema = new mongoose.Schema({
    a: { type: String },
    b: { type: String },
    c: { type: String },
    d: { type: String },
    uniqueId: { type: String },
    manufacturer: { type: String },
    brand: { type: String },
    model: { type: String },
    deviceId: { type: String },
    systemName: { type: String },
    systemVersion: { type: String },
    version: { type: String },
    deviceName: { type: String },
    userAgent: { type: String },
    local: { type: String },
    isEmulator: { type: String },
  });
  return mongoose.model('spm', spmSchema);
};
