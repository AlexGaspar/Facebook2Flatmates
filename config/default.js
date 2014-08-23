'use strict';

var appEnv = process.env.NODE_ENV || 'development';

module.exports = {
    appEnv    : appEnv
  , es        : require('./es')[appEnv]
};
