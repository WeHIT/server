'use strict';

module.exports = app => {
  require('./router/api')(app);
  require('./router/test')(app);
};
