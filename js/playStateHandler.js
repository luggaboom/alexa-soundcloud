'use strict';

var Alexa = require('alexa-sdk');

var soundcloudConnector = require('./soundcloudConnector');
var constants = require('./constants');
var controller = require('./controller');
var s = require('./StringConverter');

var playStateHandler = Alexa.CreateStateHandler(constants.states.PLAY_MODE, {

  'LaunchRequest': function () {
    /*
     *  Session resumed in PLAY_MODE STATE.
     *  If playback had finished during last session :
     *      Give welcome message.
     *      Change state to START_STATE to restrict user inputs.
     *  Else :
     *      Ask user if he/she wants to resume from last position.
     *      Change state to RESUME_DECISION_MODE
     */
    var message;
    var reprompt;

    var currentTrack = controller.getCurrentTrack.call(this);

    if (currentTrack && this.attributes['currentList']) {
      this.handler.state = constants.states.RESUME_DECISION_MODE;
      message = 'You were listening to ' + s.convertString(currentTrack.title) + ' by '
        + s.convertString(currentTrack.username) + '. Would you like to resume?';
      reprompt = 'You can say yes to resume or no to play something else.';
    } else {
      message = 'Soundcloud. The music of your dreams.';
      reprompt = 'You can say, play songs by an artist, or play a genre, to begin.';
    }

    this.response.speak(message).listen(reprompt);
    this.emit(':responseReady');
  },
  'WhatIsCurrentSong': function () {
    var currentTrack = controller.getCurrentTrack.call(this);

    var message = 'You are listening to ' + s.convertString(currentTrack.title) + ' by '
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
  'AMAZON.HelpIntent': function () {
    var message = 'You can say, play songs by an artist, or play a genre, to begin. ' +
      'You can also ask me what song this is.';
    this.response.speak(message);
    this.emit(':responseReady');
  },
  'AMAZON.NextIntent': function () {

    // Checking if  there are any items to play.
    if (!controller.setNext.call(this)) {
      // Nothing to play since reached end of the list and looping is disabled.
      this.handler.state = constants.states.START_MODE;
      var message = 'You have reached the end of the list.';
      this.response.speak(message).audioPlayerStop();
      return this.emit(':responseReady');
    }

    var currentTrack = controller.getCurrentTrack.call(this);

    var playBehavior = 'REPLACE_ALL';
    var url = currentTrack.stream_url;
    var enqueueToken = currentTrack.id;
    var offsetInMilliseconds = 0;

    this.response.audioPlayerPlay(playBehavior, url, enqueueToken, null, offsetInMilliseconds);

    this.emit(':responseReady');
  },
  'AMAZON.PreviousIntent': function () {

    if (!controller.setPrevious.call(this)) {
      // Nothing to play since at top of the list.
      this.handler.state = constants.states.START_MODE;

      var message = 'You have reached the start of the list.';
      this.response.speak(message).audioPlayerStop();
      return this.emit(':responseReady');
    }

    var currentTrack = controller.getCurrentTrack.call(this);

    var playBehavior = 'REPLACE_ALL';
    var url = currentTrack.stream_url;
    var enqueueToken = currentTrack.id;
    var offsetInMilliseconds = 0;

    this.response.audioPlayerPlay(playBehavior, url, enqueueToken, null, offsetInMilliseconds);

    this.emit(':responseReady');
  },
  'AMAZON.PauseIntent': function () { //STOP
    controller.pause.call(this);
  },
  'AMAZON.StopIntent': function () {
    controller.stop.call(this);
  },
  'AMAZON.CancelIntent': function () {
    controller.stop.call(this);
  },
  'AMAZON.ResumeIntent': function () {
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
  'AMAZON.LoopOnIntent': function () {
    this.attributes['loop'] = true;
    this.emit(':responseReady');
  },
  'AMAZON.LoopOffIntent': function () {
    this.attributes['loop'] = false;
    this.emit(':responseReady');
  },
  'AMAZON.ShuffleOnIntent': function () {
    controller.shufflePlayOrder.call(this);
    this.emit(':responseReady');
  },
  'AMAZON.ShuffleOffIntent': function () {
    controller.resetPlayOrder.call(this);
    this.emit(':responseReady');
  },
  'SessionEndedRequest': function () {
    // No session ended logic
  },
  'Unhandled': function () {
    var message = 'Sorry, I could not understand. You can say, play songs by an artist.';
    var reprompt = 'You can say, play songs by an artist.';
    this.response.speak(message).listen(reprompt);
    this.emit(':responseReady');
  }
});

module.exports = playStateHandler;