var frisby = require('frisby');

describe("Create activity", function () {
    it("should create a simple activity with a suggested time and location", function () {
        frisby.create("Create event basic test")
            .post('http://localhost:8529/_db/fiplus/dev/extensions/activity',
            {
                "name" : "The Event",
                "description" : "My first event",
                "max_attendees" : "1000",
                "creator" : "user/1",
                "tagged_interests": ["Basketball"],
                "suggested_times" : [
                    { "start" : "253416421800000",
                        "end" : "253416429000000" } // 12/6/10000, 10:30 - 12:30
                ],
                "suggested_locations": [
                    {"latitude" : 56,
                        "longitude" : -96} // Canada
                ]
            }, {json: true})
            .expectBodyContains('Success')
            .toss();
    });
});

frisby.create('Tag an activity with existing interest')
    .put("http://localhost:8529/_db/fiplus/dev/extensions/activity/1/interest/soccer")
    .expectStatus(200)
    .toss();

frisby.create('Tag an activity with a non-existing interest')
    .put("http://localhost:8529/_db/fiplus/dev/extensions/activity/1/interest/newinterest")
    .expectStatus(200)
    .toss();

frisby.create('Tag an non-existing activity')
    .put("http://localhost:8529/_db/fiplus/dev/extensions/activity/0/interest/soccer")
    .expectStatus(404)
    .toss();

frisby.create('Check for if activity got properly tagged')
    .post("http://localhost:8529/_db/fiplus/_api/traversal",
    {
        startVertex:'activity/1',
        graphName:'fiplus',
        direction:'outbound',
        edgeCollection:'tagged'
    }, {json:true})
    .expectJSON('result.visited.vertices.?',
    {
        name:'soccer'
    })
    .expectJSON('result.visited.vertices.?',
    {
        name:'newinterest'
    })
    .toss();
