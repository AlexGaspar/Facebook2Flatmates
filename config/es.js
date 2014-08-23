var defaults = {
    host: '10.10.0.88:9200'
  , index: 'roommate'
  , type:  'ads'
}

exports.production  = defaults;
exports.development = defaults;
exports.preview     = exports.production;
exports.test        = defaults;
