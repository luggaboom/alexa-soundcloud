//convert a string into something speak-able by Alexa
module.exports = {

  // removes symbols for alexa speech
  convertString: function(string) {

    var result = string;
    result = result.replace('&', 'and');
    result = result.replace('$', 'dollar sign');
    result = result.replace('#', 'pound');
    result = result.replace('@', 'at');
    result = result.replace(/[^0-9a-zA-Z ]/g, '');

    return result;
  },

  // assumes soundcloud default of large image
  convertToSmallImageUrl: function(url) {

    var baseUrl = url.slice(0, url.indexOf('large.jpg'));
    return baseUrl + 'crop.jpg';
  },
  // assumes soundcloud default of large image
  convertToLargeImageUrl: function(url) {
    var baseUrl = url.slice(0, url.indexOf('large.jpg'));
    return baseUrl + 't500x500.jpg';
  }

};
