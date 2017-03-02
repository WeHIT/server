/**
 * Created by rccoder on 02/03/2017.
 */

const moment = require('moment');

exports.relativeTime = time => moment(new Date(time * 1000)).fromNow();
