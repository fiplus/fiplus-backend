var frisby = require('frisby');

describe("Get activities based on user interests", function () {
    it("should get activities related to the user interests", function () {
    frisby.create("Request activities based on user interest")
        .get('http://localhost:8529/_db/fiplus/dev/extensions/match/activities?email=test2@data.com&num_activities=5&by_interest=true')
        .inspectJSON()
        .expectJSONTypes(
        {
            activities: Array
        })
        .expectJSON('activities.?', {
            name: 'BasketballNW'
        })
        .expectJSON('activities.?', {
            name: 'BasketballSE'
        })
        .expectJSON('activities.?', {
            name: 'BasketballNE'
        })
        .expectJSON('activities.?', {
            name: 'BasketballSW'
        })
        .toss();
    });
});
