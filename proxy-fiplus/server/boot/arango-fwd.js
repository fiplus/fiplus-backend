
exports.FIPLUS_BASE_URL = 'http://localhost:8529/_db/fiplus/dev/extensions';

var arangoResponse;

exports.saveArangoResponse = function(response)
{
  arangoResponse = response;
};

exports.forwardResponse = function(proxyResponse) {
  proxyResponse.set('Set-Cookie', arangoResponse.headers['set-cookie']);
  proxyResponse.set('Content-Type', 'application/json');
  proxyResponse.status(arangoResponse.statusCode);
  proxyResponse.body = arangoResponse.body;
};
