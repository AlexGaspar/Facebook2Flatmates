'use strict';

var appEnv = process.env.NODE_ENV || 'development';
var app    = {
    defaultTime2wait: 1000 * 5
    // defaultTime2wait: 1000 * 60 * 2
  , deep: 5
};

module.exports = {
    appEnv    : appEnv
  , app       : app
  , es        : require('./es')[appEnv]
  , facebook  : require('./facebook')[appEnv]
};
