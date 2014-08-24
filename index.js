var graph   = require('fbgraph')
  , config  = require('./config/default.js')
  , Promise = require("bluebird");
  , format      = require('util').format
  , facebook     = require('./helpers/facebook.js')
  , elasticsearch = require('elasticsearch')
  ;

var Facebook2Flatmate = function(groupId, accessKey, timeToWait) {
  if(typeof groupIds === 'undefined') {
    throw new Error('You must provide a valid facebook group id');
  }

  if(typeof accessKey !== 'object') {
    throw new Error('You must provide a valid api key \n { token: "AAAEEEERRR..." }');
  }

  this.es = null;
  this.deepCount = this.defaultDeepCount = config.app.deep || 10;

  this.timeToWait = timeToWait || config.app.defaultTime2wait;
  this.facebookToken = accessKey;
  this.groupId = groupId;

  // Start
  this.loop();
};

/**
 * [getFacebookFeed description]
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
Facebook2Flatmate.prototype.getFacebookFeed = function(req) {
  if(typeof req === 'undefined') { throw new Error('Params cannot be null'); }

  var deferred = Promise.pending();
  var query;

  if(typeof req === 'string') {
    query = req + "/feed";
  } else if (res.paging && res.paging.next) {
    query = req.paging.next;
  }

  graph.get(query, this.facebookToken, function(err, res) {
    if(err || typeof res === 'undefined') {
      deferred.reject(err || 'No Results');
    } else {
      deferred.resolve(res);
    }
  });

  return deferred.promise;
};


Facebook2Flatmate.prototype.getElasticSearch = function() {
  if(typeof this.es === null) {
    this.es = new elasticsearch.Client({
      host: config.es.host
    });
  }

  return this.es;
};


Facebook2Flatmate.prototype.storeDataToES = function(data) {
  if(typeof data !== 'array') {
    throw new Error('No more data to store');
  }

  data.forEach(function(post) {
    feedParser.getFormatedInfos(post, function(formatedData) {
      // We will only store post with a price or images
      // this should avoid false results
      if(formatedData.images || formatedData.price) {
        var esId   = formatedData.fbId
        var esDate = formatedData.date;

        delete formatedData.fbId; delete formatedData.date;

        this.es.create({
            index: config.es.index
          , type: config.es.type
          , id: esId
          , timestamp: esDate
          , body: formatedData
        }, function (error, response) {
          if(error && error.message.search('document already exists') === -1) {
            throw new Error(error);
          }
        });
      }
    });
  });
};

/**
 * Loop will
 * @return {[type]} [description]
 */
Facebook2Flatmate.prototype.loop = function(param) {

  this.getFacebookFeed(param)
    .then(function(res) {
      this.storeDataToES(res.data);

      return res;
    })
    .then(function(res) {
      var timeToWait = this.timeToWait;

      // Once we went deeper enough we'll wait longer
      // before going back to the first post
      if(--deepCount === 0) {
        this.deepCount = this.defaultDeepCount;

        res = this.groupId;
        timeToWait = timeToWait * 1000 * 60 * 60 * 2;
      }

      setTimeout(
        function () { this.loop(res); },
        timeToWait
      );

    })
    .catch(function(err) {
      var errorMessage = [
          "..."
        , err
      ].join('\n');

      console.log(errorMessage);

      //TODO:
      // Create no-critical exception in order to have two catch handlder
    });
};

module.exports = Facebook2Flatmate;
