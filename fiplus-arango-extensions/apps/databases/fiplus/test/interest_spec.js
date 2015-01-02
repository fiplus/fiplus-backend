var frisby = require('frisby');

frisby.create("Get interests based on input")
    .get("http://localhost:8529/_db/fiplus/dev/extensions/interest?input=So")
    .inspectJSON()
    .expectJSONTypes(
    {
        interests: Array
    })
    // For simplicity and to guard against new test data being added in the future, just test if 'soccer' appears
    .expectBodyContains('soccer')
    .toss();

frisby.create("Get all interests")
    .get('http://localhost:8529/_db/fiplus/dev/extensions/interest')
    .inspectJSON()
    .expectJSONTypes(
    {
        interests: Array
    })
    .expectBodyContains('soccer')
    .expectBodyContains('hockey')
    .expectBodyContains('basketball')
    .toss();
