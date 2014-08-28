var Q    = require('q')
  , FB   = require('fb')
  , config  = require('../config/default.js')
  , neighborhood = require('../data/neighborhood.js')
  , moment = require('moment')




// Constantes
var MIN_PRICE = 200;


/**
 * Find and returns price if > 200€
 * @param  String     Facebook message
 * @return Number     Price
 */
var getPrice = function (message) {
  var regexPrice = /([\d+,.]+) ?(?:€|e)/gi;
  var currentYear = new Date().getFullYear();

  var matches = message.match(regexPrice);
  if(!matches) return;

  for (var i = matches.length - 1; i >= 0; i--) {
    var number = parseInt(matches[i], 10);
    if(number == currentYear || number == currentYear + 1) continue;
    if(number > MIN_PRICE) return number; // Shouldn't we take the highest?
  };
};


/**
 * Find possible location
 *
 * @param  String        Ads description
 * @return Array         Possible locations
 */
var getAddress = function (message) {
// Look if nearby neighborhood
  var resultat = [];

  neighborhood.forEach(function(loc) {
    if(message.search(new RegExp(loc, 'i')) != -1) {
      resultat.push(loc);
    }
  });

  return resultat;
}

/**
 * Use FQL this time to get attachments
 * @param  {[type]} post [description]
 * @return {[type]}      [description]
 */
var getAlbumFromFacebook = function(post) {
  var deferred = Q.defer();
  var q = 'SELECT attachment FROM stream WHERE post_id="' + post.id + '"';

  FB.api('fql', { q: q}, function (res) {
    if(!res || res.error) {
      deferred.reject(!res ? 'error occurred' : res.error);
    } else if(res.data && res.data[0].attachment && res.data[0].attachment.media) {
      var imagesList = [];
      res.data[0].attachment.media.forEach(function(image) {
        // Drop images with oh= parameter
        if(image.src.search('oh=') === -1) imagesList.push(image.src.replace('_s.','_n.').replace('/s130x130',''));
      });
      deferred.resolve(imagesList);
    } else {
      deferred.reject("Couldn't get images from this post : " + post.id);
    }
  });

  return deferred.promise;
}

// Remove temporary images check current results to see a patern
var getImage = function (post) {
  var type = post.type
    , imagesList = []
    ;

  if(type === 'photo') {
    return getAlbumFromFacebook(post);
  } else if (post.picture) {
    return post.picture.replace('_s.','_n.').replace('/s130x130','');
  }
}

/**
 * [explodeMessage description]
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
module.exports.getFormatedInfos = function (post, token, callback) {
  if(!post || !post.message) return null;

  // Init FQL
  FB.setAccessToken(token);

  var message = post.message
    , post_id = post.id
    , date    = post.created_time
    , from    = post.from
    , guessPromises = [
          getImage(post)
        , getPrice(message)
        , getAddress(message)
      ]
    ;

  Q.allSettled(guessPromises).then(function (res) {
      callback({
        fbId    : post_id
      , author  : from
      , price   : res[1].value
      , adresse : res[2].value
      , date    : moment(date).unix()
      , message : message
      , images  : res[0].value
     });
  });
};
