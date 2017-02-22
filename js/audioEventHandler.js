'use strict';

var Alexa = require('alexa-sdk');
var constants = require('./constants');
var controller = require('./controller');

var audioEventHandler = Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
  'PlaybackStarted': function () {
  },
  'PlaybackFinished': function () {

    // clearing queue.
    this.attributes['enqueuedToken'] = false;

    controller.setNext.call(this);

    this.emit(':saveState', true);
  },
  'PlaybackStopped': function () {
  },
  'PlaybackNearlyFinished': function () {
    /*
     * AudioPlayer.PlaybackNearlyFinished Directive received.
     * Enqueuing the next audio file.
     */
    if (this.attributes['enqueuedToken']) {
      /*
       * Since AudioPlayer.PlaybackNearlyFinished Directive are prone to be delivered multiple times during the
       * same audio being played.
       * If an audio file is already enqueued, exit without enqueuing again.
       */
      return this.context.succeed(true);
    }

    // Checking if  there are any items to be enqueued.
    if (controller.getNextTrack.call(this) == null) {
        // Nothing to enqueue since reached end of the list and looping is disabled.
        return this.context.succeed(true);
    }
    var nextTrack = controller.getNextTrack.call(this);
    var currentTrack = controller.getCurrentTrack.call(this);

    var playBehavior = 'ENQUEUE';
    var url = nextTrack.stream_url;
    var enqueueToken = nextTrack.id;
    var expectedPreviousToken = currentTrack.id;
    var offsetInMilliseconds = 0;

    // Setting attributes to indicate item is enqueued.
    this.attributes['enqueuedToken'] = enqueueToken;

    this.response.audioPlayerPlay(playBehavior, url, enqueueToken, expectedPreviousToken, offsetInMilliseconds);
    this.emit(':responseReady');
  },
  'PlaybackFailed': function () {
    //  AudioPlayer.PlaybackNearlyFinished Directive received. Logging the error.
    console.log("Playback Failed : %j", this.event.request.error);
    this.context.succeed(true);
  }
});

module.exports = audioEventHandler;