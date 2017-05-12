/**
 * Created by rccoder on 02/03/2017.
 */

/**
 * @desc 获取今日哈工大真实 URL，用于进入哈工大图片替换
 * @param absoluteUrl
 * @returns {string}
 */
function getRelativeUrl(absoluteUrl) {
  const arr = absoluteUrl.split('//');
  return arr.length < 2 ?
    arr[0].substring(arr[0].indexOf('/')) :
    arr[1].substring(arr[1].indexOf('/'));
}

/**
 * @desc 用于今日哈工大缩略图
 * @param originImgSrcArr
 * @returns {*}
 */
function randomFirstImgSrc(originImgSrcArr) {
  return originImgSrcArr[Math.floor(Math.random() * originImgSrcArr.length)]
}

/**
 * @desc 当前日期的几天之前
 * @param AddDayCount
 * @returns {string}
 */
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

/**
 * @desc 从时间戳获得当前时间 时间戳支持字符串和数字
 * @param timeStamp
 * @returns {string}
 */
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

/**
 * @desc 统统变成时间戳
 * @param timeStamp
 * @returns {*}
 */
function toTimeStamp(timeStamp) {
  const tsReg = /^[0-9]*$/;
  // 是时间戳
  if (typeof timeStamp === 'string' && timeStamp.match(tsReg) !== null) {
    return parseInt(timeStamp);
  }
  return new Date(timeStamp).getTime();
}

/**
 * @desc 获得当前的周数与起始周数之间相差几周  用的时候注意一般起始周数算作第一周
 * @param startDate 2017-5-1
 */
function getCurrentWeek(startDate) {
  const startDateTimeStamp = new Date(startDate).getTime();
  const currentDateTimeStamp = new Date().getTime();

  // 间隔天数
  const rangeDay = parseInt(Math.abs(currentDateTimeStamp - startDateTimeStamp) / 1000 / 60 / 60 / 24);

  // 获取起始时间周几 周日特别转化一下
  const startDateWeekDay = new Date(startDateTimeStamp).getDay() === 0 ? 7 : new Date(startDateTimeStamp).getDay();

  // 计算相差几周
  const rangeWeek = parseInt((rangeDay + startDateWeekDay - 1) / 7);

  return rangeWeek;
}

exports.getRelativeUrl = getRelativeUrl;
exports.randomFirstImgSrc = randomFirstImgSrc;
exports.getDateBefore = getDateBefore;
exports.getDataFromTimeStamp = getDataFromTimeStamp;
exports.toTimeStamp = toTimeStamp;
exports.getCurrentWeek = getCurrentWeek;
