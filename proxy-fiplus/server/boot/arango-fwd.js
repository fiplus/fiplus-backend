
exports.FIPLUS_BASE_URL = 'http://localhost:8529/_db/fiplus/dev/extensions/';

var receivedHeaders = null;
exports.receivedHeaders = receivedHeaders;

exports.forwardResponse = function(response) {
  // Save the headers so that the after method which has access to the loopback response object
  receivedHeaders = response.headers;
};
