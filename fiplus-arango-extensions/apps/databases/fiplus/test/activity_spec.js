var frisby = require('frisby');

describe("Create activity", function () {
    it("should create a simple activity with a suggested time and location", function () {
        frisby.create(this.description)
            .post('http://localhost:8529/_db/fiplus/dev/extensions/activity',
            {
                "name" : "The Event",
                "description" : "My first event",
                "max_attendees" : "1000",
                "creator" : "1",
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

describe("Tag activity", function () {
    it("should tag with existing interest", function () {
        frisby.create(this.description)
            .put("http://localhost:8529/_db/fiplus/dev/extensions/activity/1/interest/soccer")
            .expectStatus(200)
            .toss();
    });
    it("should tag with non-existing interest", function () {

        frisby.create(this.description)
            .put("http://localhost:8529/_db/fiplus/dev/extensions/activity/1/interest/newinterest")
            .expectStatus(200)
            .toss();
    });
    it("should tag a non-existing activity", function () {
        frisby.create(this.description)
            .put("http://localhost:8529/_db/fiplus/dev/extensions/activity/0/interest/soccer")
            .expectStatus(404)
            .toss();
    });
    it("should insert existing and non-existing interests into dB", function () {
        frisby.create(this.description)
            .post("http://localhost:8529/_db/fiplus/_api/traversal",
            {
                startVertex: 'activity/1',
                graphName: 'fiplus',
                direction: 'outbound',
                edgeCollection: 'tagged'
            }, {json: true})
            .expectJSON('result.visited.vertices.?',
            {
                name: 'soccer'
            })
            .expectJSON('result.visited.vertices.?',
            {
                name: 'newinterest'
            })
            .toss();
    });
});


