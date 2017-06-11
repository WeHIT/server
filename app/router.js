'use strict';

module.exports = app => {
  require('./router/api')(app);
  require('./router/test')(app);
  require('./router/spm')(app);
};
