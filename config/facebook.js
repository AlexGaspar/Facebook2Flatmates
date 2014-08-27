var defaults = {
  params : {
      fields: "id,from,message,to,picture,link,type,object_id,created_time"
    , since: '2014-08-01'
    , until: '2014-08-30'
    //, access_token: defaults.userToken
  }
};

exports.production  = defaults;
exports.development = defaults;
exports.preview     = exports.production;
exports.test        = defaults;
