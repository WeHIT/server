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

exports.getRelativeUrl = getRelativeUrl;
exports.randomFirstImgSrc = randomFirstImgSrc;
exports.getDateBefore = getDateBefore;
