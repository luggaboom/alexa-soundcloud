'use strict';

var Alexa = require('alexa-sdk');

var constants = require('./constants');
var controller = require('./controller');
var s = require('./StringConverter');

var resumeDecisionStateHandler = Alexa.CreateStateHandler(constants.states.RESUME_DECISION_MODE, {
    /*
     *  All Intent Handlers for state : RESUME_DECISION_MODE
     */
    'LaunchRequest': function () {
      var message;
      var reprompt;

      var currentTrack = controller.getCurrentTrack.call(this);

      if (currentTrack && this.attributes['currentList']) {
        message = 'You were listening to ' + s.convertString(currentTrack.title) + ' by '
          + s.convertString(currentTrack.username) + '. Would you like to resume?';
        reprompt = 'You can say yes to resume or no to play something else.';
      } else {
        this.handler.state = constants.states.PLAY_MODE;
        message = 'Soundcloud. The music of your dreams.';
        reprompt = 'You can say, play songs by an artist, to begin.';
      }

      this.response.speak(message).listen(reprompt);
      this.emit(':responseReady');
    },
    'WhatIsCurrentSong': function () {
      var currentTrack = controller.getCurrentTrack.call(this);

      var message = 'You were listening to ' + s.convertString(currentTrack.title) + ' by '
        + s.convertString(currentTrack.username) + '.';
      this.response.speak(message);

      controller.createCard.call(this);

      this.emit(':responseReady');
    },
    'PlayAudioByArtist': function () {
      controller.playAudioByArtist.call(this);
    },
    'DiscoverAudioByGenre': function () {
      controller.playAudioByGenre.call(this);
    },
    'AMAZON.YesIntent': function () {
      this.handler.state = constants.states.PLAY_MODE;
      var currentTrack = controller.getCurrentTrack.call(this);

      var playBehavior = 'REPLACE_ALL';
      var url = currentTrack.stream_url;
      var enqueueToken = currentTrack.id;
      var offsetInMilliseconds = this.attributes['offsetInMilliseconds'];

      // Setting clearing any potentially queued songs
      this.attributes['enqueuedToken'] = null;
      this.attributes['offsetInMilliseconds'] = 0;

      this.response.audioPlayerPlay(playBehavior, url, enqueueToken, null, offsetInMilliseconds);

      this.emit(':responseReady');
    },

    'AMAZON.NoIntent': function () {
      this.handler.state = constants.states.PLAY_MODE;
      var message = 'Soundcloud. The music of your dreams.';
      var reprompt = 'You can say, play songs by an artist, to begin.';

      this.response.speak(message).listen(reprompt);
      this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
      var message;
      var reprompt;

      var currentTrack = controller.getCurrentTrack.call(this);

      if (currentTrack && this.attributes['currentList']) {
        message = 'You were listening to ' + s.convertString(currentTrack.title) + ' by '
          + s.convertString(currentTrack.username) + '. Would you like to resume?';
        reprompt = 'You can say yes to resume or no to play something else.';
      } else {
        this.handler.state = constants.states.PLAY_MODE;
        message = 'Soundcloud. The music of your dreams.';
        reprompt = 'You can say, play songs by an artist, or play a genre, to begin.';
      }

      this.response.speak(message).listen(reprompt);
      this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
      controller.stop.call(this);
    },
    'AMAZON.CancelIntent': function () {
      controller.stop.call(this);
    },
    'SessionEndedRequest': function () {
      // No session ended logic
    },
    'Unhandled': function () {
      var message;
      var reprompt;
      var currentTrack = controller.getCurrentTrack.call(this);

      if (currentTrack && this.attributes['currentList']) {
        message = 'Sorry, I did not understand. You were listening to ' + s.convertString(currentTrack.title) + by
          + s.convertString(currentTrack.username) + '. Would you like to resume?';
        reprompt = 'You can say yes to resume or no to play something else.';
      } else {
        this.handler.state = constants.states.PLAY_MODE;
        message = 'Sorry, I did not understand. You can say, play songs by an artist, to begin.';
        reprompt = 'You can say, play songs by an artist, to begin.';
      }

      this.response.speak(message).listen(reprompt);
      this.emit(':responseReady');
    }
  }
);

module.exports = resumeDecisionStateHandler;