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

describe("Retrieve activities using match", function () {
    it("should get activities related to the user interests", function () {
    frisby.create("Request activities based on user interest")
        .get('http://localhost:3001/api/Matches/activities?num_activities=100&by_interest=true')
        .expectStatus(200)
        .expectJSON('?',
        {
            "activity_id": "1",
            "Name": "A1",
            "description": "activity 1",
            "max_attendees": 5,
            "allow_joiner_input": true,
            "num_attendees": 3,
            "creator": "1",
            "tagged_interests": [
                "Soccer",
                "Newinterest"
            ],
            "suggested_times": [
                {
                    "suggestion_votes": 0,
                    "start": 4102513200000,
                    "end": 4102516800000
                },
                {
                    "suggestion_votes": 0,
                    "start": 2524676400000,
                    "end": 2524680000000
                },
                {
                    "suggestion_votes": 0,
                    "start": 222222222222222200,
                    "end": 333333333333333300
                },
                {
                    "suggestion_votes": 0,
                    "start": 32883177600000,
                    "end": 32883181200000
                }
            ],
            "suggested_locations": [
                {
                    "suggestion_votes": 0,
                    "longitude": 23,
                    "latitude": 100
                },
                {
                    "suggestion_votes": 0,
                    "longitude": 89,
                    "latitude": 89
                },
                {
                    "suggestion_votes": 0,
                    "longitude": 50,
                    "latitude": 100
                }
            ]
        })
        .expectJSON('?',
        {
            "activity_id": "3",
            "Name": "A3",
            "description": "activity 3",
            "max_attendees": 3,
            "allow_joiner_input": false,
            "num_attendees": 3,
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
                },
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
    it("should get activities for main page", function () {
        frisby.create("Request activities for main page (interests + padding)")
            .get('http://localhost:3001/api/Matches/activities?num_activities=100&by_interest=false')
            .expectStatus(200)
            .expectJSON('?',
            {
                "activity_id": "1",
                "Name": "A1",
                "description": "activity 1",
                "max_attendees": 5,
                "allow_joiner_input": true,
                "num_attendees": 3,
                "creator": "1",
                "tagged_interests": [
                    "Soccer",
                    "Newinterest"
                ],
                "suggested_times": [
                    {
                        "suggestion_votes": 0,
                        "start": 4102513200000,
                        "end": 4102516800000
                    },
                    {
                        "suggestion_votes": 0,
                        "start": 2524676400000,
                        "end": 2524680000000
                    },
                    {
                        "suggestion_votes": 0,
                        "start": 222222222222222200,
                        "end": 333333333333333300
                    },
                    {
                        "suggestion_votes": 0,
                        "start": 32883177600000,
                        "end": 32883181200000
                    }
                ],
                "suggested_locations": [
                    {
                        "suggestion_votes": 0,
                        "longitude": 23,
                        "latitude": 100
                    },
                    {
                        "suggestion_votes": 0,
                        "longitude": 89,
                        "latitude": 89
                    },
                    {
                        "suggestion_votes": 0,
                        "longitude": 50,
                        "latitude": 100
                    }
                ]
            })
            .expectJSON('?',
            {
                "activity_id": "5",
                "Name": "A5",
                "description": "activity 5",
                "max_attendees": 5,
                "allow_joiner_input": false,
                "num_attendees": 1,
                "creator": "101",
                "tagged_interests": [
                    "Curling"
                ],
                "suggested_times": [
                    {
                        "suggestion_id": "1",
                        "suggestion_votes": 1,
                        "start": 4102513200000,
                        "end": 4102516800000
                    }
                ],
                "suggested_locations": []
            })
            .toss();
    });
});
