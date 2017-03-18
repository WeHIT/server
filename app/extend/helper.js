/**
 * Created by rccoder on 02/03/2017.
 */

'use strict';

const moment = require('moment');

exports.relativeTime = time => moment(new Date(time * 1000)).fromNow();
