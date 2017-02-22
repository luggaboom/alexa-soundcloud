var SC = require('node-soundcloud');

var currentList = [];
var currentIndex = null;
var currentTrack = null;
var getTracksByGenre = function (query, offset, callback) {
  SC.get('/tracks',
    {genres: query, limit: 60, offset: offset}, // for some reason, this doesn't return the limit, but some consistent random number less than
    function (err, tracks) {
      if (err) {
        console.log(err);
      }
      else {
        currentList = mapTracksToValidArray(tracks);
        callback();
      }
    })
};

var initialize = function () {
  SC.init({
    id: 'CLIENT_ID',
    secret: 'CLIENT_SECRET'
  });
};

var setFirstOfListToTrack = function () {
  if (currentList && currentList.length > 0) {
    currentTrack = currentList[0];
    currentIndex = 0;
  }
};

var mapTracksToValidArray = function (tracks) {

  if (tracks && tracks.length > 0) {

    return tracks.map(function (track) {
      var formattedTrack = {};

      formattedTrack.id = track.id;
      formattedTrack.title = track.title ? track.title : 'untitled';
      formattedTrack.username = track.user.username ? track.user.username : 'unknown';
      formattedTrack.stream_url = track.stream_url + '?client_id=CLIENT_ID';
      formattedTrack.artwork_url = track.artwork_url ? track.artwork_url : 'https://developers.soundcloud.com/assets/logo_big_black-4fbe88aa0bf28767bbfc65a08c828c76.png';

      return formattedTrack;
    })
  }
  return [];
};

module.exports = {

  getCurrentList: function () {
    return currentList;
  },
  getCurrentTrack: function () {
    return currentTrack;
  },
  getCurrentIndex: function () {
    return currentIndex;
  },

  // takes in a callback function to run on completion
  findTracksByArtist: function (query, callback) {
    initialize();
    console.log('finding tracks by artist', query);

    SC.get('/users',
      {q: query},
      function (err, artists) {
        if (err) {
          console.log(err);
        }
        else if (artists && artists[0]) {
          console.log(artists[0])

          SC.get('/users/' + (artists[0].id + '/tracks'), {}, function (err, tracks) {
            if (err) {
              console.log(err);
            }
            currentList = mapTracksToValidArray(tracks);
            setFirstOfListToTrack();
            callback();
          });
        }
        else {
          callback();
        }
      });
  },

  // takes in a callback function to run on completion
  findTracksByGenre: function (query, callback) {
    console.log('finding tracks by genre', query);
    initialize();

    var offset = Math.floor(Math.random() * 100);
    currentList = [];

    getTracksByGenre.call(this, query, offset, function () {
        if (currentList.length === 0) {
          getTracksByGenre.call(this, query, 0, function () {
            if (currentList.length > 0) {
              setFirstOfListToTrack();
            }
            callback();
          });
        }
        else {
          setFirstOfListToTrack();
          callback();
        }
      }
    );
  },


}
;
