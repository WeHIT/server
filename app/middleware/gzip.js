/**
 * Created by rccoder on 03/14/2017.
 */
'use strict';
const isJSON = require('koa-is-json');
const zlib = require('zlib');

module.exports = (options, app) => {
  return function* gzipMiddleware(next) {
    yield next;
    let body = this.body;
    if (!body) {
      return;
    }
    if (options.threshold && this.length < options.threshold) {
      return;
    }
    if (isJSON(body)) {
      body = JSON.stringify(body);
    }
    this.body = zlib.createGzip().end(body);
    this.set('Content-Encoding', 'gzip');
  };
};
