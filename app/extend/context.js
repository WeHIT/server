/**
 * Created by rccoder on 28/02/2017.
 */
'use strict';

module.exports = {
  get isIOS() {
    const iosReg = /iphone|ipad|ipod/i;
    return iosReg.test(this.get('user-agent'));
  },
};
