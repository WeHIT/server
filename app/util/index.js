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

exports.getRelativeUrl = getRelativeUrl;
exports.randomFirstImgSrc = randomFirstImgSrc;
