var frisby = require('frisby');

describe('Get Interests', function() {
    it('gives input', function() {
        frisby.create("Get interests based on input")
            .get("http://localhost:8529/_db/fiplus/dev/extensions/interest?input=So")
            .expectJSONTypes(
            {
                interests: Array
            })
            // For simplicity and to guard against new test data being added in the future, just test if 'soccer' appears
            .expectBodyContains('soccer')
            .toss();
    });

    it('no input; all interests', function() {
        frisby.create("Get all interests")
            .get('http://localhost:8529/_db/fiplus/dev/extensions/interest')
            .expectJSONTypes(
            {
                interests: Array
            })
            .expectBodyContains('soccer')
            .expectBodyContains('hockey')
            .expectBodyContains('basketball')
            .toss();
    });
});
