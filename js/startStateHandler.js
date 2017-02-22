'use strict';

var Alexa = require('alexa-sdk');

var soundcloudConnector = require('./soundcloudConnector');
var constants = require('./constants');
var controller = require('./controller');

var startStateHandler = Alexa.CreateStateHandler(constants.states.START_MODE, {
  /*
   *  All Intent Handlers for state : START_MODE
   */
  'LaunchRequest': function () {
    // Initialize Attributes

    this.attributes['loop'] = true;
    this.attributes['currentList'] = [];
    this.attributes['currentIndex'] = null;
    this.attributes['enqueuedToken'] = false;
    this.attributes['offsetInMilliseconds'] = 0;
    this.attributes['playOrder'] = [];

    var message = 'Soundcloud. The music of your dreams.';
    var reprompt = 'You can say, play songs by an artist, to begin.';

    this.handler.state = constants.states.PLAY_MODE;

    this.response.speak(message).listen(reprompt);
    this.emit(':responseReady');
  },
  'PlayAudioByArtist': function () {
    controller.playAudioByArtist.call(this);
  },
  'DiscoverAudioByGenre': function () {
    controller.playAudioByGenre.call(this);
  },
  'AMAZON.HelpIntent': function () {
    var message = 'You can say, play songs by an artist, or play a genre, to begin.';
    this.response.speak(message).listen(message);
    this.emit(':responseReady');
  },
  'AMAZON.StopIntent': function () {
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':responseReady');
  },
  'SessionEndedRequest': function () {
    // No session ended logic
  },
  'Unhandled': function () {
    var message = 'Sorry, I could not understand. You can say, play songs by an artist, or play a genre, to begin.';
    var reprompt = 'You can say, play songs by an artist, or play a genre, to begin.';

    this.response.speak(message).listen(reprompt);
    this.emit(':responseReady');
  }
});

module.exports = startStateHandler;