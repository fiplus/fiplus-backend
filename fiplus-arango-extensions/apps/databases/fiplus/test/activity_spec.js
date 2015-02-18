var frisby = require('frisby');

// Test setup - Login as default user
frisby.create(this.description)
    .post('http://localhost:3001/api/Users/login',
    {
        "email": "1234@data.com",
        "password": "1234"
    }, {json: true})
    .addHeader('Cookie', 'sid=asdf;sid.sig=asdf')
    .after(function (err, res, body) {
        var sid = res.headers['set-cookie'][0];
        var sidSig = res.headers['set-cookie'][1];

        frisby.globalSetup({
            request: {
                headers: {
                    cookie: sid.split(';')[0] + ';' + sidSig.split(';')[0]
                }
            }
        });

    })
    .toss();

describe("Create activity", function () {
    it("should create a simple activity with a suggested time and location", function () {
        frisby.create(this.description)
            .post('http://localhost:3001/api/Acts',
            {
                "Name" : "The Event",
                "description" : "My first event",
                "max_attendees" : "1000",
                "creator" : "101",
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
            .expectStatus(200)
            .expectJSONTypes(
            {
                activity_id: String,
                Name: String
            })
            .toss();
    });
});

describe("Tag activity", function () {
    it("should tag with existing interest", function () {
        frisby.create(this.description)
            .put("http://localhost:3001/api/Acts/1/interest/soccer")
            .expectStatus(200)
            .toss();
    });
    it("should tag with non-existing interest", function () {

        frisby.create(this.description)
            .put("http://localhost:3001/api/Acts/1/interest/newinterest")
            .expectStatus(200)
            .toss();
    });
    it("should tag a non-existing activity", function () {
        frisby.create(this.description)
            .put("http://localhost:3001/api/Acts/0/interest/soccer")
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
                name: 'Soccer'
            })
            .expectJSON('result.visited.vertices.?',
            {
                name: 'Newinterest'
            })
            .toss();
    });
});


describe("Join activity", function () {
    it("should join existing activity", function () {
        frisby.create(this.description)
        .put("http://localhost:3001/api/Acts/1/user")
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
                user: '1234@data.com'
            })
            .toss();
        })
        .toss();
    });

    it("should fail to join a non-existing activity", function () {
        frisby.create(this.description)
        .put("http://localhost:3001/api/Acts/0/user")
        .expectStatus(404)
        .toss();
    });

    it("should fail to join if activity is full", function () {
        frisby.create(this.description)
        .put("http://localhost:3001/api/Acts/2/user")
        .expectStatus(400)
        .toss();
    });
});

describe('Suggest Time', function() {
    it('should suggest time', function(){
        frisby.create('Suggest Valid Time for activity')
            .put('http://localhost:3001/api/Acts/1/time',
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
            .put('http://localhost:3001/api/Acts/1/time',
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
            .put('http://localhost:3001/api/Acts/1/time',
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
            .put('http://localhost:3001/api/Acts/1/time',
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
            .put('http://localhost:3001/api/Acts/0/time',
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
            .put('http://localhost:3001/api/Acts/1/location',
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
            .put('http://localhost:3001/api/Acts/1/location',
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
            .post('http://localhost:3001/api/Acts/suggestion/1/user')
            .expectStatus(200)
            .toss();

        frisby.create('location vote')
            .post('http://localhost:3001/api/Acts/suggestion/2/user')
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
            .get('http://localhost:3001/api/Acts/2',
            {})
            .expectStatus(200)
            .expectJSON(
            {
                "activity_id": "2",
                "Name": "A2",
                "description": "activity 2",
                "max_attendees": 0,
                "num_attendees": 3,
                "creator": "2",
                "tagged_interests": [
                    "Hockey",
                    "Basketball"
                ],
                "suggested_times": [
                    {
                        "start": 4102513200000,
                        "end": 4102516800000
                    }
                ],
                "suggested_locations": [
                    {
                        "longitude": 150,
                        "latitude": 150
                    },
                    {
                        "longitude": 100,
                        "latitude": 50
                    }
                ]
            })
            .toss();
    });
    it('should return activity information with updated vote counts for suggested time and location and corresponding suggestion id.', function() {
        frisby.create(this.description)
            .get('http://localhost:3001/api/Acts/3',
            {})
            .expectStatus(200)
            .expectJSON(
            {
                "activity_id": "3",
                "Name": "A3",
                "description": "activity 3",
                "max_attendees": 3,
                "num_attendees": 2,
                "creator": "3",
                "tagged_interests": [
                    "Soccer"
                ],
                "suggested_times": [
                    {
                        "suggestion_id": "1",
                        "suggestion_votes": 1,
                        "start": 4102513200000,
                        "end": 4102516800000
                    }
                ],
                "suggested_locations": [
                    {
                        "suggestion_id": "2",
                        "suggestion_votes": 1,
                        "longitude": 150,
                        "latitude": 150
                    }
                ]
            })
            .toss();
    });
    it('should fail to get non-existent activity.', function() {
        frisby.create(this.description)
            .get('http://localhost:3001/api/Acts/activity/0',
            {})
            .expectStatus(404)
            .toss();
    });
});

describe('Get Attendees', function() {
    it('should return a list of attendees information.', function() {
        frisby.create(this.description)
            .get('http://localhost:3001/api/Acts/2/user?Limit=100',
            {})
            .expectStatus(200)
            .expectJSON(
            {
                "num_attendees": 3,
                "joiners": [
                    "2",
                    "3",
                    "1"
                ]
            })
            .toss();
    });
    it('should fail to get non-existent activity.', function() {
        frisby.create(this.description)
            .get('http://localhost:3001/api/Acts/0?Limit=100',
            {})
            .expectStatus(404)
            .toss();
    });
    it('should only return as many users as the prescribed limit.', function() {
        frisby.create(this.description)
            .get('http://localhost:3001/api/Acts/2/user?Limit=2',
            {})
            .expectStatus(200)
            .expectJSON(
            {
                "num_attendees": 3,
                "joiners": [
                    "2",
                    "3"
                ]
            })
            .toss();
    });
    it('should default to 50 as a limit.', function() {
        frisby.create(this.description)
            .get('http://localhost:3001/api/Acts/2/user',
            {})
            .expectStatus(200)
            .expectJSON(
            {
                "num_attendees": 3,
                "joiners": [
                    "2",
                    "3",
                    "1"
                ]
            })
            .toss();
    });
});
