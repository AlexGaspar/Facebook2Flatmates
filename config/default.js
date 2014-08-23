'use strict';

var appEnv = process.env.NODE_ENV || 'development';

module.exports = {
    appEnv    : appEnv
  , mongo     : require('./mongo')[appEnv]
  , facebook  : require('./facebook')[appEnv]
};
