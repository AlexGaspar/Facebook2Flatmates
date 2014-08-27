var graph   = require('fbgraph')
  , config  = require('./config/default.js')
  , Promise = require("bluebird")
  , feedParser    = require('./helpers/facebook.js')
  , elasticsearch = require('elasticsearch')
  ;

var Facebook2Flatmate = function(groupId, accessKey, timeToWait) {
  if(typeof groupId === 'undefined' || groupId === null) {
    throw new Error('You must provide a facebook group id');
  }

  // if(typeof accessKey !== 'object') {
  //   throw new Error('You must provide a valid api key \n { token: "AAAEEEERRR..." }');
  // }

  this.es = null;
  this.deepCount = this.defaultDeepCount = config.app.deep || 10;

  this.timeToWait = timeToWait || config.app.defaultTime2wait;
  this.facebookToken = accessKey;
  this.groupId = parseInt(groupId);

  // Authenticate FB request
  graph.setAccessToken( this.facebookToken );

  // Start
  this.loop();
};

/**
 * [getFacebookFeed description]
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
Facebook2Flatmate.prototype.getFacebookFeed = function(param) {
  var deferred = Promise.pending();
  var req = param || this.groupId;
  var fbParams = config.facebook.params;
  var query;

  if(typeof req === 'number') {
    query = req + "/feed";
  } else if (req.paging && req.paging.next) {
    query = req.paging.next;
    delete fbParams['since'];
    delete fbParams['until'];
  } else {
    deferred.reject('No more stuff to fetch...')
  }

  graph.get(query, fbParams, function(err, res) {
    if(err || typeof res === 'undefined') {
      deferred.reject(err || 'No Results');
    } else {
      deferred.resolve(res);
    }
  });

  return deferred.promise;
};


Facebook2Flatmate.prototype.getElasticSearch = function() {
  if(this.es === null) {
    this.es = new elasticsearch.Client({
      host: config.es.host
      // , log: 'trace'
    });
  }

  return this.es;
};


Facebook2Flatmate.prototype.storeDataToES = function(data) {
  var self = this;

  data.forEach(function(post) {
    feedParser.getFormatedInfos(post, self.facebookToken, function(formatedData) {
      // We will only store post with a price or images
      // this should avoid false results
      if(formatedData.images || formatedData.price) {
        var esId   = formatedData.fbId
        var esDate = formatedData.date;

        delete formatedData.fbId; delete formatedData.date;

        self.getElasticSearch().create({
            index: config.es.index
          , type: config.es.type
          , id: esId
          , timestamp: esDate
          , body: formatedData
        }, function (error, response) {
          console.log(error || response);
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
  var self = this;

  this.getFacebookFeed(param)
    .then(function(res) {
      self.storeDataToES(res.data);

      return res;
    })
    .then(function(res) {
      var timeToWait = self.timeToWait;

      // Once we went deeper enough we'll wait longer
      // before going back to the first post
      if(--self.deepCount === 0) {
        self.deepCount = self.defaultDeepCount;

        res = self.groupId;
        timeToWait = timeToWait * 1000 * 60 * 60 * 2;
      }

      setTimeout(
        function () { self.loop(res); },
        timeToWait
      );

    })
    .catch(function(err) {
      console.log(err);
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
