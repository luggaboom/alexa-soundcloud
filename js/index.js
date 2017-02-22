// var alexa = require("alexa-app");
var Alexa = require('alexa-sdk');
var constants = require('./constants');
var startStateHandler = require('./startStateHandler');
var playStateHandler = require('./playStateHandler');
var resumeDecisionStateHandler = require('./resumeDecisionStateHandler');
var audioEventHandler = require('./audioEventHandler');

// var app = new alexa.app("soundcloudConnector");
var state;

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.appId = constants.appId;
    alexa.saveBeforeResponse = true;
    alexa.dynamoDBTableName = constants.dynamoDBTableName;
    alexa.registerHandlers(
      startStateHandler,
      playStateHandler,
      resumeDecisionStateHandler,
      audioEventHandler
    );
    alexa.execute();
};