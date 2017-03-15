/**
 * Created by rccoder on 02/03/2017.
 */
'use strict';
module.exports = (options, app) => {
  return function* robotMiddleware(next) {
    const userAgent = this.get('user-agent') || '';
    const match = options.ua.some(ua => ua.test(userAgent));
    if (match) {
      this.status = 403;
      this.message = 'go away, robot';
    } else {
      yield next;
    }
  };
};
