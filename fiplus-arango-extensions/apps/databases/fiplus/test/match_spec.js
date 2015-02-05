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

describe("Get activities based on user interests", function () {
    it("should get activities related to the user interests", function () {
    frisby.create("Request activities based on user interest")
        .get('http://localhost:3001/api/Matches/activities?num_activities=100&by_interest=true')
        .expectJSON('?',    {
            "activity_id": "2",
            "Name": "A2",
            "description": "activity 2",
            "max_attendees": 0,
            "creator": "2",
            "tagged_interests": [
                "Hockey",
                "Basketball"
            ],
            "suggested_times": [
                {
                    "suggestion_votes": 0,
                    "start": 4102513200000,
                    "end": 4102516800000
                }
            ],
            "suggested_locations": [
                {
                    "suggestion_votes": 0,
                    "longitude": 150,
                    "latitude": 150
                },
                {
                    "suggestion_votes": 0,
                    "longitude": 100,
                    "latitude": 50
                }
            ]
        })
        .expectJSON('?',   {
            "Name": "BasketballNW",
            "creator": "101",
            "tagged_interests": [
                "Basketball"
            ]
        })
        .expectJSON('?', {
            "Name": "BasketballSW",
            "creator": "101",
            "tagged_interests": [
                "Basketball"
            ]
        })
        .expectJSON('?', {
            "Name": "BasketballNE",
            "creator": "101",
            "tagged_interests": [
                "Basketball"
            ]
        })
        .expectJSON('?', {
            "Name": "BasketballSE",
            "creator": "101",
            "tagged_interests": [
                "Basketball"
            ]
        })
        .toss();
    });
});
