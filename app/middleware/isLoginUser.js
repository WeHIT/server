/**
 * Created by rccoder on 03/14/2017.
 */
'use strict';
module.exports = (options, app) => {
  return function* isLoginUserMiddleware(next) {
    yield next;
  };
};
