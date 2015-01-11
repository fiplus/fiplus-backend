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


describe("Join activity", function () {
    it("should join existing activity", function () {
        frisby.create(this.description)
        .put("http://localhost:8529/_db/fiplus/dev/extensions/activity/1/user/2")
        .expectStatus(200)
        .after(function() {
            frisby.create(this.description + ' db check')
            .post("http://localhost:8529/_db/fiplus/_api/traversal", {
                startVertex: 'activity/1',
                graphName: 'fiplus',
                direction: 'inbound',
                edgeCollection: 'joined'
            }, {json: true})
            .expectJSON('result.visited.vertices.?', {
                email: 'test2@data.com'
            })
            .toss();
        })
        .toss();
    });

    it("should fail to join a non-existing activity", function () {
        frisby.create(this.description)
        .put("http://localhost:8529/_db/fiplus/dev/extensions/activity/0/user/2")
        .expectStatus(404)
        .toss();
    });
    it("should fail to join a non-existing user", function () {
        frisby.create(this.description)
        .put("http://localhost:8529/_db/fiplus/dev/extensions/activity/1/user/0")
        .expectStatus(404)
        .toss();
    });
    it("should fail to join if activity is full", function () {
        frisby.create(this.description)
        .put("http://localhost:8529/_db/fiplus/dev/extensions/activity/2/user/2")
        .expectStatus(400)
        .toss();
    });
});

describe('Suggest Time', function() {
    it('should suggest time', function(){
        frisby.create('Suggest Valid Time for activity')
            .put('http://localhost:8529/_db/fiplus/dev/extensions/activity/1/time',
            {
                // jan. 1, 2050 12 - 1pm
                start:2524676400000,
                end:2524680000000
            },{json:true})
            .expectStatus(200)
            .toss();

        frisby.create('Check if suggestion got properly added')
            .post("http://localhost:8529/_db/fiplus/_api/traversal",
            {
                startVertex:'activity/1',
                graphName:'fiplus',
                direction:'outbound'
            }, {json:true})
            .expectJSON('result.visited.vertices.?',
            {
                value:2524676400000
            })
            .expectJSON('result.visited.vertices.?',
            {
                value:2524680000000
            })
            .toss();
    });

    it('suggests duplicate time', function() {
        frisby.create('Suggest Duplicate Time')
            .put('http://localhost:8529/_db/fiplus/dev/extensions/activity/1/time',
            {
                // jan. 1, 2050 12 - 1pm
                start:2524676400000,
                end:2524680000000
            },{json:true})
            .expectStatus(400)
            .toss();
    });

    it('suggests past time', function() {
        frisby.create('Suggest Past Time for activity')
            .put('http://localhost:8529/_db/fiplus/dev/extensions/activity/1/time',
            {
                // jan. 1, 2000 12 - 1pm
                start:946753200000,
                end:946756800000
            },{json:true})
            .expectStatus(400)
            .toss();
    });

    it('suggest invalid time', function() {
        frisby.create('Suggest invalid time period for activity')
            .put('http://localhost:8529/_db/fiplus/dev/extensions/activity/1/time',
            {
                // jan. 1, 2000 12 - 1pm
                start:946756800000,
                end:946753200000
            },{json:true})
            .expectStatus(400)
            .toss();
    });

    it('suggests for non-existing activity', function() {
        frisby.create('Suggest Non-existing for activity')
            .put('http://localhost:8529/_db/fiplus/dev/extensions/activity/0/time',
            {
                // jan. 1, 2000 12 - 1pm
                start:946753200000,
                end:946756800000
            },{json:true})
            .expectStatus(404)
            .toss();
    });
});

describe('Suggest Location', function(){
    it('suggests a location', function() {
        frisby.create('Suggest Valid Location for activity')
            .put('http://localhost:8529/_db/fiplus/dev/extensions/activity/1/location',
            {
                // jan. 1, 2050 12 - 1pm
                latitude:100,
                longitude:23
            },{json:true})
            .expectStatus(200)
            .toss();

        frisby.create('Check if suggestion got properly added')
            .post("http://localhost:8529/_db/fiplus/_api/traversal",
            {
                startVertex:'activity/1',
                graphName:'fiplus',
                direction:'outbound'
            }, {json:true})
            .expectJSON('result.visited.vertices.?',
            {
                latitude:100,
                longitude:23
            })
            .toss();
    });

    it('suggests duplicate location', function() {
        frisby.create('Suggest duplicate Valid Location for activity')
            .put('http://localhost:8529/_db/fiplus/dev/extensions/activity/1/location',
            {
                // jan. 1, 2050 12 - 1pm
                latitude:100,
                longitude:23
            },{json:true})
            .expectStatus(400)
            .toss();
    });
});

describe('Suggestion Vote', function() {
    it('saves suggestion votes', function() {
        frisby.create('time vote')
            .post('http://localhost:8529/_db/fiplus/dev/extensions/activity/suggestion/1/user/1')
            .expectStatus(200)
            .toss();

        frisby.create('location vote')
            .post('http://localhost:8529/_db/fiplus/dev/extensions/activity/suggestion/2/user/1')
            .expectStatus(200)
            .toss();

        frisby.create('Check if vote got properly added')
            .post("http://localhost:8529/_db/fiplus/_api/traversal",
            {
                startVertex: 'user/1',
                graphName: 'fiplus',
                direction: 'outbound',
                edgeCollection: 'voted',
                maxDepth: 3
            }, {json: true})
            .expectJSON('result.visited.vertices.?',
            {
                value: 4102513200000
            })
            .expectJSON('result.visited.vertices.?',
            {
                value: 4102516800000
            })
            .expectJSON('result.visited.vertices.?',
            {
                latitude: 150,
                longitude: 150
            });

    });
});
describe('Get Activity', function() {
   it('should return activity information.', function() {
        frisby.create(this.description)
            .get('http://localhost:8529/_db/fiplus/dev/extensions/activity/2',
            {})
            .expectStatus(200)
            .expectJSON(
            {
                "attributes": {},
                "isValid": true,
                "errors": {},
                "name": "A2",
                "description": "activity 2",
                "max_attendees": 0,
                "creator": "user/2",
                "tagged_interests": [
                    "hockey",
                    "basketball"
                ],
                "suggested_times": [
                    {
                        "attributes": {},
                        "isValid": true,
                        "errors": {},
                        "start": 32883069600000,
                        "end": 32883073200000
                    }
                ],
                "suggested_locations": [
                    {
                        "attributes": {},
                        "isValid": true,
                        "errors": {},
                        "longitude": 150,
                        "latitude": 150
                    },
                    {
                        "attributes": {},
                        "isValid": true,
                        "errors": {},
                        "longitude": 100,
                        "latitude": 50
                    }
                ]
            })
            .toss();
    });
    it('should fail to get non-existent activity.', function() {
        frisby.create(this.description)
            .get('http://localhost:8529/_db/fiplus/dev/extensions/activity/0',
            {})
            .expectStatus(404)
            .toss();
    });
});

describe('Get Attendees', function() {
    it('should return a list of attendees information.', function() {
        frisby.create(this.description)
            .get('http://localhost:8529/_db/fiplus/dev/extensions/activity/2/user?Limit=100',
            {})
            .expectStatus(200)
            .expectJSON(
            {
                "attributes": {},
                "isValid": true,
                "errors": {},
                "num_attendees": 3,
                "joiners": [
                    "user/2",
                    "user/3",
                    "user/1"
                ]
            })
            .toss();
    });
    it('should fail to get non-existent activity.', function() {
        frisby.create(this.description)
            .get('http://localhost:8529/_db/fiplus/dev/extensions/activity/0?Limit=100',
            {})
            .expectStatus(404)
            .toss();
    });
    it('should only return as many users as the prescribed limit.', function() {
        frisby.create(this.description)
            .get('http://localhost:8529/_db/fiplus/dev/extensions/activity/2/user?Limit=2',
            {})
            .expectStatus(200)
            .expectJSON(
            {
                "attributes": {},
                "isValid": true,
                "errors": {},
                "num_attendees": 3,
                "joiners": [
                    "user/2",
                    "user/3"
                ]
            })
            .toss();
    });
    it('should default to 50 as a limit.', function() {
        frisby.create(this.description)
            .get('http://localhost:8529/_db/fiplus/dev/extensions/activity/2/user',
            {})
            .expectStatus(200)
            .expectJSON(
            {
                "attributes": {},
                "isValid": true,
                "errors": {},
                "num_attendees": 3,
                "joiners": [
                    "user/2",
                    "user/3",
                    "user/1"
                ]
            })
            .toss();
    });
});
