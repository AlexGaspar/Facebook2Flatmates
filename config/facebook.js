var defaults = {
     userToken : 'CAACEdEose0cBAFmKC8FZA6gGGsvIlIcfGnrHt5o3N97uKd9JsaS3aPI1fhgr69ZCAq3aXMiYRKlOR0zHEOPAcXIgsHhE4fntWy5T58lObjRIoadYun2Cmp53SKCmqhg0eFglzYs4DKWKlzRKCk8CKqRjlbIpkjcaacBqi28t3lgtgP5rzkevTeXNIk3C08RTnt0mhu6gZDZD'
  , groupsId : ['107585562620030']
}

defaults.params =  {
      fields: "id,from,message,to,picture,link,type,object_id,created_time"
    , since: '2014-03-01'
    , until: '2014-03-30'
    , access_token: defaults.userToken
}

exports.production  = defaults;
exports.development = defaults;
exports.preview     = exports.production;
exports.test        = defaults;
