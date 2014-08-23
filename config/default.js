'use strict';

var appEnv = process.env.NODE_ENV || 'development';

module.exports = {
    appEnv    : appEnv
  , facebook  : require('./facebook')[appEnv]
};
