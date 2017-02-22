var soundCloudConnector = require('./soundCloudConnector');

test = function () {
  soundCloudConnector.findTracksByGenre("pop", function () {
  })
};

test();