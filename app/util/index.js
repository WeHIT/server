/**
 * Created by rccoder on 02/03/2017.
 */

function getRelativeUrl(absoluteUrl) {
  const arr = absoluteUrl.split('//');
  return arr.length < 2 ?
    arr[0].substring(arr[0].indexOf('/')) :
    arr[1].substring(arr[1].indexOf('/'));
}

function randomFirstImgSrc(originImgSrcArr) {
  return originImgSrcArr[Math.floor(Math.random() * originImgSrcArr.length)]
}

// 几天之前 20170202
function getDateBefore(AddDayCount) {
  const dd = new Date();
  dd.setDate(dd.getDate() + AddDayCount);
  const y = dd.getFullYear();
  const m = (dd.getMonth() + 1) < 10 ? '0' + (dd.getMonth() + 1) :
    (dd.getMonth() + 1); // 获取当前月份的日期，不足10补0
  const d = dd.getDate() < 10 ? '0' + dd.getDate() :
    dd.getDate(); // 获取当前几号，不足10补0
  return y + '' + m + '' + d;
}

function getDataFromTimeStamp(timeStamp) {
  const tsReg = /^[0-9]*$/;
  // 是时间戳
  if (typeof timeStamp === 'string' && timeStamp.match(tsReg) !== null) {
    timeStamp = parseInt(timeStamp);
  }
  const date = new Date(timeStamp);
  const Y = date.getFullYear();
  const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
  const D = date.getDate();
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

// 统统变成时间戳
function toTimeStamp(timeStamp) {
  const tsReg = /^[0-9]*$/;
  // 是时间戳
  if (typeof timeStamp === 'string' && timeStamp.match(tsReg) !== null) {
    return parseInt(timeStamp);
  }
  return new Date(timeStamp).getTime();
}

exports.getRelativeUrl = getRelativeUrl;
exports.randomFirstImgSrc = randomFirstImgSrc;
exports.getDateBefore = getDateBefore;
exports.getDataFromTimeStamp = getDataFromTimeStamp;
exports.toTimeStamp = toTimeStamp;
