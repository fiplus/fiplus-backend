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
                "allow_joiner_input" : false,
                "creator" : "101",
                "tagged_interests": ["Basketball"],
                "times" : [
                    { "start" : "253416421800000",
                        "end" : "253416429000000" } // 12/6/10000, 10:30 - 12:30
                ],
                "locations": [
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

    it("Unjoin activity", function() {
        frisby.create(this.description)
            .delete("http://localhost:3001/api/Acts/6/user")
            .expectStatus(200)
            .after(function() {
                frisby.create(this.description + ' db check')
                    .post("http://localhost:8529/_db/fiplus/_api/traversal", {
                        startVertex: 'activity/6',
                        graphName: 'fiplus',
                        direction: 'inbound',
                        edgeCollection: 'joined'
                    }, {json: true})
                    .afterJSON(function(response) {
                        expect(JSON.stringify(response)).not.toContain('1234@data.com')
                    })
                    .toss();
            })
            .toss();
    });
});

describe('Joiner Suggest time/location tests', function() {
    it('should allow suggestions from joiner', function() {
        frisby.create(this.description)
            .post('http://localhost:3001/api/Users/login',
            {
                "email": "test@data.com",
                "password": "test"
            }, {json: true})
            .addHeader('Cookie', 'sid=test;sid.sig=test')
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

        frisby.create('Suggest Valid Time for activity from joiner')
            .put('http://localhost:3001/api/Acts/1/time',
            {
                start:222222222222222222,
                end:333333333333333333
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
                value:222222222222222222
            })
            .expectJSON('result.visited.vertices.?',
            {
                value:333333333333333333
            })
            .toss();

        frisby.create('Suggest Valid Location for activity from joiner')
            .put('http://localhost:3001/api/Acts/1/location',
            {
                latitude:89,
                longitude:89
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
                latitude:89,
                longitude:89
            })
            .toss();
    });

    it('should disallow suggestions from joiner', function() {
        frisby.create(this.description)
            .post('http://localhost:3001/api/Users/login',
            {
                "email": "test@data.com",
                "password": "test"
            }, {json: true})
            .addHeader('Cookie', 'sid=test;sid.sig=test')
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

        frisby.create('Suggest Valid Time for activity from joiner')
            .put('http://localhost:3001/api/Acts/3/time',
            {
                // jan. 1, 2050 12 - 1pm
                start:222222222222222222,
                end:333333333333333333
            },{json:true})
            .expectStatus(400)
            .toss();

        frisby.create('Suggest Valid Location for activity from joiner')
            .put('http://localhost:3001/api/Acts/3/location',
            {
                // jan. 1, 2050 12 - 1pm
                latitude:89,
                longitude:89
            },{json:true})
            .expectStatus(400)
            .toss();

        frisby.create('Suggest Valid Time for activity not joined')
            .put('http://localhost:3001/api/Acts/4/time',
            {
                // jan. 1, 2050 12 - 1pm
                start:222222222222222222,
                end:333333333333333333
            },{json:true})
            .expectStatus(400)
            .toss();

        frisby.create('Suggest Valid Time for activity not joined')
            .put('http://localhost:3001/api/Acts/4/location',
            {
                // jan. 1, 2050 12 - 1pm
                latitude:89,
                longitude:89
            },{json:true})
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
                allow_joiner_input: false,
                "num_attendees": 3,
                "creator": "3",
                "tagged_interests": [
                    "Soccer"
                ],
                "times": [
                    {
                        "suggestion_id": "1",
                        "suggestion_votes": 1,
                        "start": 4102513200000,
                        "end": 4102516800000
                    }
                ],
                "locations": [ ]
            })
            .toss();
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
                allow_joiner_input: false,
                "num_attendees": 3,
                "creator": "2",
                "tagged_interests": [
                    "Hockey",
                    "Basketball"
                ],
                "times": [
                    {
                        "start": 4102513200000,
                        "end": 4102516800000
                    }
                ],
                "locations": [
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

describe('Firm Up Activity', function() {
    it('should confirm existing time suggestion.', function() {
        frisby.create(this.description)
            .post('http://localhost:3001/api/Acts/7/confirm/10',
            {})
            .expectStatus(200)
            .toss();
        frisby.create(this.description + "dB")
            .post("http://localhost:8529/_db/fiplus/_api/traversal",
            {
                startVertex: 'activity/2',
                graphName: 'fiplus',
                direction: 'outbound',
                edgeCollection: 'confirmed',
                maxDepth: 3
            }, {json: true})
            .expectJSON('result.visited.vertices.?',
            {
                value: 4102513200000
            })
            .expectJSON('result.visited.vertices.?',
            {
                value: 4102516800000
            });
    });
    it('should confirm existing location suggestion.', function() {
        frisby.create(this.description)
            .post('http://localhost:3001/api/Acts/7/confirm/11',
            {})
            .expectStatus(200)
            .toss();
        frisby.create(this.description + "dB")
            .post("http://localhost:8529/_db/fiplus/_api/traversal",
            {
                startVertex: 'activity/2',
                graphName: 'fiplus',
                direction: 'outbound',
                edgeCollection: 'confirmed',
                maxDepth: 3
            }, {json: true})
            .expectJSON('result.visited.vertices.?',
            {
                latitude: 50,
                longitude: 100
            });
    });
    it('should allow over-writing confirmation.', function() {
        frisby.create(this.description)
            .post('http://localhost:3001/api/Acts/7/confirm/12',
            {})
            .expectStatus(200)
            .toss();
    });
    it('should not allow confirming an activity which you are not the creator of.', function() {
        frisby.create(this.description)
            .post('http://localhost:3001/api/Acts/2/confirm/6',
            {})
            .expectStatus(401)
            .toss();
    });
    it('should not allow confirmation of non-existing suggestion.', function() {
        frisby.create(this.description)
            .post('http://localhost:3001/api/Acts/7/confirm/24',
            {})
            .expectStatus(404)
            .toss();
    });
    it('Get Activity should return only confirmed activities.', function() {
        frisby.create(this.description)
            .get('http://localhost:3001/api/Acts/7',
            {})
            .expectStatus(200)
            .expectJSON(
            {
                "Name": "A7",
                "description": "activity 7",
                "max_attendees": 0,
                "creator": "101",
                "times": [
                    {
                        "suggestion_id": "-1",
                        "start": 4102513200000,
                        "end": 4102516800000
                    }
                ],
                "locations": [
                    {
                        "suggestion_id": "-1",
                        "longitude": 100,
                        "latitude": 50
                    }
                ]
            })
            .toss();
    });
});
