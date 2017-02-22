var s = require('./StringConverter');
var soundcloudConnector = require('./soundcloudConnector');
var constants = require('./constants');

var setFirstOfListToTrack = function () {
  var loop = this.attributes['loop'];
  var currentList = this.attributes['currentList'];
  var currentIndex = this.attributes['currentIndex'];
  var playOrder = this.attributes['playOrder'];

  if (currentList && currentList.length > 0) {
    this.attributes['currentIndex'] = 0;
    this.attributes['enqueuedToken'] = null;

    this.emit(':saveState', true);
  }
};

// must pass 'this' from alexa state handlers
var controller = {

    getCurrentTrack: function () {
      var currentList = this.attributes['currentList'];
      var currentIndex = this.attributes['currentIndex'];
      var playOrder = this.attributes['playOrder'];

      return currentList[playOrder[currentIndex]];
    },

    // returns null if no next track
    getNextTrack: function () {
      var loop = this.attributes['loop'];
      var currentList = this.attributes['currentList'];
      var currentIndex = this.attributes['currentIndex'];
      var playOrder = this.attributes['playOrder'];

      if (currentList && currentIndex < currentList.length - 2) {
        var nextIndex = playOrder[currentIndex + 1];
        return currentList[nextIndex];
      }
      else if (loop) {
        return currentList[0];
      }
      return null;
    },
    // returns null if no previous track
    getPreviousTrack: function () {
      var loop = this.attributes['loop'];
      var currentList = this.attributes['currentList'];
      var currentIndex = this.attributes['currentIndex'];
      var playOrder = this.attributes['playOrder'];

      if (currentList && currentIndex != 0) {
        var previousIndex = playOrder[currentIndex - 1];
        return currentList[previousIndex];
      }
      else if (loop) {
        var previousIndex = playOrder[currentList.length = 1];
        return currentList[previousIndex];
      }
      return null;
    },
    // return true if went to previous track, or false if unable
    setPrevious: function () {
      var loop = this.attributes['loop'];
      var currentList = this.attributes['currentList'];
      var currentIndex = this.attributes['currentIndex'];
      var playOrder = this.attributes['playOrder'];

      this.attributes['enqueuedToken'] = null;

      if (currentIndex != 0) {
        this.attributes['currentIndex'] = currentIndex - 1;
        this.emit(':saveState', true);
        return true;
      }
      else if (loop) {
        this.attributes['currentIndex'] = currentList.length - 1;
        this.emit(':saveState', true);
        return true;
      }
      else {
        return false;
      }
    },

    // return true if went to next track, or false if reached end
    setNext: function () {
      var loop = this.attributes['loop'];
      var currentList = this.attributes['currentList'];
      var currentIndex = this.attributes['currentIndex'];
      var playOrder = this.attributes['playOrder'];

      this.attributes['enqueuedToken'] = null;

      if (currentIndex < currentList.length - 2) {
        this.attributes['currentIndex'] = currentIndex + 1;
        this.emit(':saveState', true);
        return true;
      }
      else if (loop) {
        setFirstOfListToTrack.call(this);
        return true;
      }
      return false;
    },

    shufflePlayOrder: function () {
      // Algorithm : Fisher-Yates shuffle
      var array = this.attributes['playOrder'];
      var currentIndex = array.length;
      var temp, randomIndex;

      while (currentIndex >= 1) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
      }
      this.attributes['playOrder'] = array;
      this.emit(':saveState', true);
    },

    resetPlayOrder: function () {
      this.attributes['index'] = this.attributes['playOrder'][this.attributes['index']];
      this.attributes['playOrder'] = Array.apply(null, {length: this.attributes['currentList'].length})
        .map(Number.call, Number);

      this.emit(':saveState', true);
    },

    createCard: function () {
      var currentList = this.attributes['currentList'];
      var currentIndex = this.attributes['currentIndex'];
      var playOrder = this.attributes['playOrder'];

      var currentTrack = controller.getCurrentTrack.call(this);

      var cardTitle = 'Playing ' + currentTrack.title;
      var cardContent = 'Playing ' + currentTrack.title +
        ' by ' + currentTrack.username;
      var cardImage = null;
      if (currentTrack.artwork_url) {
        cardImage = {
          smallImageUrl: s.convertToSmallImageUrl(currentTrack.artwork_url),
          largeImageUrl: s.convertToLargeImageUrl(currentTrack.artwork_url)
        };
      }

      this.response.cardRenderer(cardTitle, cardContent, cardImage);

    },

    stop: function () {
      this.attributes['loop'] = true;
      this.attributes['currentList'] = [];
      this.attributes['currentIndex'] = null;
      this.attributes['enqueuedToken'] = false;
      this.attributes['offsetInMilliseconds'] = 0;
      this.handler.state = constants.states.PLAY_MODE;
      this.emit(':saveState', true);
      this.response.audioPlayerStop();
      this.emit(':responseReady');
    },

    pause: function () {
      this.attributes['offsetInMilliseconds'] = this.event.context.AudioPlayer.offsetInMilliseconds;
      this.response.audioPlayerStop();
      this.emit(':responseReady');
    },

    playAudioByArtist: function () {
      var query = this.event.request.intent.slots.Artist.value;

      soundcloudConnector.findTracksByArtist(query, function () {
          if (soundcloudConnector.getCurrentList().length < 1) {

            var message = 'Sorry, I could not find any music by an artist called ' + query + '. Try something else.';

            this.response.speak(message).listen(message);
            this.emit(':responseReady');
          }

          else {
            var currentList = soundcloudConnector.getCurrentList();
            var currentIndex = 0;
            var playOrder = Array.apply(null, {length: currentList.length}).map(Number.call, Number);

            this.attributes['currentList'] = currentList;
            this.attributes['currentIndex'] = currentIndex;
            this.attributes['playOrder'] = playOrder;
            this.attributes['enqueuedToken'] = false;
            this.attributes['offsetInMilliseconds'] = 0;

            var currentTrack = controller.getCurrentTrack.call(this);

            this.response.speak('Now playing ' + s.convertString(currentTrack.title) +
              ' by ' + s.convertString(currentTrack.username));

            this.response.audioPlayerPlay('REPLACE_ALL', currentTrack.stream_url, currentTrack.id, null, 0);

            this.emit(':responseReady');
          }

        }.bind(this)
      )
      ;

      return false;
    },

    playAudioByGenre: function () {
      var query = this.event.request.intent.slots.Genre.value;

      soundcloudConnector.findTracksByGenre(query, function () {

          if (soundcloudConnector.getCurrentList().length < 1) {

            var message = 'Sorry, I could not find any music in the genre ' + query + '. Try something else.';

            this.response.speak(message).listen(message);
            this.emit(':responseReady');
          }

          else {
            var currentList = soundcloudConnector.getCurrentList();
            var currentIndex = 0;
            var playOrder = Array.apply(null, {length: currentList.length}).map(Number.call, Number);

            this.attributes['currentList'] = currentList;
            this.attributes['currentIndex'] = currentIndex;
            this.attributes['playOrder'] = playOrder;
            this.attributes['enqueuedToken'] = false;
            this.attributes['offsetInMilliseconds'] = 0;

            controller.shufflePlayOrder.call(this); //shuffle by default

            var currentTrack = controller.getCurrentTrack.call(this);

            this.response.speak('Now playing ' + s.convertString(currentTrack.title) +
              ' by ' + s.convertString(currentTrack.username));

            this.response.audioPlayerPlay('REPLACE_ALL', currentTrack.stream_url, currentTrack.id, null, 0);

            this.handler.state = constants.states.PLAY_MODE;

            this.emit(':responseReady');
          }
        }.bind(this)
      );

      return false;
    }
    ,
  }
  ;

module.exports = controller;